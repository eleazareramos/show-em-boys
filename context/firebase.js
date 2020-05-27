import { createContext } from "react"
import axios from "axios"
import * as firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"

let firebaseConfig = {}

const DECK_API_BASE_URL = "https://deckofcardsapi.com/api/deck/"

if (process.env.NODE_ENV === "development") {
  firebaseConfig = require("../devFirebaseConfig").default
} else {
  firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    appId: process.env.FIREBASE_APP_ID,
    projectId: "show-em-boys",
  }
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

const getGame = async (gameId) => {
  const gameRef = firebase.firestore().collection("games").doc(gameId)
  const gameDoc = await gameRef.get()
  const gameData = gameDoc.data()
  return [gameRef, gameData, gameDoc]
}

const getPlayers = async (gameId) => {
  const playerRefs = await firebase
    .firestore()
    .collection(`games/${gameId}/players`)
    .get()
  const playerDocs = playerRefs.docs
  const playerData = playerDocs.map((doc) => doc.data())
  return [playerRefs, playerData, playerDocs]
}

const addPlayer = async ({ gameId, email, name }) => {
  try {
    const [gameRef, gameData] = await getGame(gameId)
    const playerRef = firebase
      .firestore()
      .collection(`games/${gameId}/players`)
      .doc(email)
    const playerDoc = await playerRef.get()

    if (playerDoc.exists) return

    const newPlayer = {
      hand: ["", ""],
      email,
      name,
      money: gameData.buyIn,
    }
    await gameRef.update({
      playerOrder: [...(gameData.playerOrder || []), email],
    })
    await playerRef.set(newPlayer)
  } catch (err) {
    console.log(err)
  }
}

const removePlayer = async ({ gameId, email }) => {
  try {
    const [gameRef, gameData] = await getGame(gameId)
    const playerRef = firebase
      .firestore()
      .collection(`games/${gameId}/players`)
      .doc(email)
    await gameRef.update({
      playerOrder: gameData.playerOrder.filter((em) => em !== email),
    })
    await playerRef.delete()
  } catch (err) {
    console.log(err)
  }
}

const startRound = async ({ gameId }) => {
  try {
    const batch = firebase.firestore().batch()
    const [gameRef, gameData] = await getGame(gameId)
    const [playerRefs, playerData, playerDocs] = await getPlayers(gameId)

    // RESET PLAYERS
    const playerResetObject = {
      hand: ["", ""],
      action: false,
      bet: 0,
      money: 10, // ! REMOVE AFTER DEV
    }
    for (let playerDoc of playerDocs) {
      batch.update(playerDoc.ref, playerResetObject)
    }

    // RESET DECK && ROUND NUMBER
    const deckResponse = await axios.get(DECK_API_BASE_URL + "new/shuffle")
    const deck = deckResponse.data
    const { deck_id } = deck
    batch.update(gameRef, {
      deckId: deck_id,
      cards: ["", "", "", "", ""],
      round: gameData.round + 1,
      pot: 0
    })

    // SHIFT PLAYER ORDER , SET BLIND PLAYERS , SET FIRST TURN , && SET MIN BET
    const priorPlayerOrder = [...gameData.playerOrder]
    const priorFirstPlayer = priorPlayerOrder.shift()
    const newPlayerOrder = [...priorPlayerOrder, priorFirstPlayer]
    const smallBlindPlayer = newPlayerOrder[0]
    const bigBlindPlayer = newPlayerOrder[1]
    const turn = newPlayerOrder[2]
    batch.update(gameRef, {
      playerOrder: newPlayerOrder,
      smallBlindPlayer,
      bigBlindPlayer,
      turn,
      minBet: gameData.bigBlind,
    })

    // DEAL PLAYER CARDS, FORCE BLINDS TO BET
    for (let playerDoc of playerDocs) {
      const playerData = playerDoc.data()
      const handResponse = await axios.get(
        DECK_API_BASE_URL + deck_id + "/draw/?count=2"
      )
      const hand = handResponse.data.cards
      const handCodes = hand.map((c) => c.code)
      batch.update(playerDoc.ref, { hand: handCodes })
      if (playerData.email === smallBlindPlayer) {
        batch.update(playerDoc.ref, {
          action: "bet",
          bet: gameData.smallBlind,
          money: playerData.money - gameData.smallBlind,
        })
      }
      if (playerData.email === bigBlindPlayer) {
        batch.update(playerDoc.ref, {
          action: "bet",
          bet: gameData.bigBlind,
          money: playerData.money - gameData.bigBlind,
        })
      }
    }
    await batch.commit()
  } catch (err) {
    console.log(err)
  }
}

const collectBets = async (gameDoc, playerDocs) => {
  try {
    const batch = firebase.firestore().batch()

    const gameData = gameDoc.data()

    let pot = gameData.pot

    for (let playerDoc of playerDocs) {
      const playerData = playerDoc.data()
      if (playerData.bet) {
        pot += playerData.bet
      }
      batch.update(playerDoc.ref, { bet: 0, action: false })
    }

    batch.update(gameDoc.ref, { pot })

    return batch.commit()
  } catch (err) {
    console.log(err)
  }
}

const dealCommunity = async ({ type, gameId }) => {
  try {
    const batch = firebase.firestore().batch()
    const [gameRef, gameData, gameDoc] = await getGame(gameId)
    const [playerRefs, playerData, playerDocs] = await getPlayers(gameId)
    await collectBets(gameDoc, playerDocs)

    const cardCount = type === "flop" ? 3 : 1
    const cardsResponse = await axios.get(
      DECK_API_BASE_URL + gameData.deckId + "/draw/?count=" + cardCount
    )
    const cards = cardsResponse.data.cards
    const cardCodes = cards.map((c) => c.code)

    let communityCards = gameData.cards

    switch (type) {
      case "flop":
        communityCards = [...cardCodes, "", ""]
        break
      case "turn":
        communityCards = [...gameData.cards.slice(0, 3), ...cardCodes, ""]
        break
      case "river":
        communityCards = [...gameData.cards.slice(0, 4), ...cardCodes]
        break
      default:
        communityCards = communityCards
    }

    batch.update(gameRef, {
      cards: communityCards,
      turn: gameData.smallBlindPlayer,
    })

    await batch.commit()
  } catch (err) {
    console.log(err)
  }
}

const actions = {
  addPlayer,
  removePlayer,
  startRound,
  dealCommunity,
}

const FirebaseContext = createContext(firebase)
export const ActionsContext = createContext(actions)
export default FirebaseContext
