import { createContext } from "react"
import axios from "axios"
import * as firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"
import numeral from "numeral"

let firebaseConfig = {}

const DECK_API_BASE_URL = "https://deckofcardsapi.com/api/deck/"

console.log(process.env)

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

console.log(process.env.NODE_ENV)
console.log(firebaseConfig)

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

const updateGame = async ({ gameId, params }) => {
  await firebase
    .firestore()
    .collection("games")
    .doc(gameId)
    .update({ ...params })
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
      money: numeral(gameData.buyIn).value(),
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

const clearTable = async ({ gameId }) => {
  try {
    const batch = firebase.firestore().batch()
    const [gameRef, gameData] = await getGame(gameId)
    const [playerRefs, playerData, playerDocs] = await getPlayers(gameId)

    const playerResetObject = {
      hand: ["", ""],
      action: false,
      bet: 0,
    }
    for (let playerDoc of playerDocs) {
      batch.update(playerDoc.ref, playerResetObject)
    }

    const deckResponse = await axios.get(DECK_API_BASE_URL + "new/shuffle")
    const deck = deckResponse.data
    const { deck_id } = deck
    batch.update(gameRef, {
      deckId: deck_id,
      cards: ["", "", "", "", ""],
      pot: 0,
      minBet: 0,
      end: true,
      winners: [],
      turn: false,
    })

    await batch.commit()
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
      pot: 0,
      minBet: 0,
      end: false,
      showEm: false,
      winners: [],
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
      const newAction = playerData.action === "fold" ? "fold" : false
      batch.update(playerDoc.ref, { bet: 0, action: newAction })
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
      minBet: 0,
    })

    await setNextPlayer(
      gameData.playerOrder[gameData.playerOrder.length - 1],
      gameId
    )

    await batch.commit()
  } catch (err) {
    console.log(err)
  }
}

const setNextPlayer = async (currentPlayer, gameId) => {
  try {
    const [gameRef, gameData, gameDoc] = await getGame(gameId)
    const [playerRefs, playerData, playerDocs] = await getPlayers(gameId)

    const orderedPlayers = gameData.playerOrder.map((email) => {
      return playerData.filter((p) => p.email === email)[0]
    })

    const startPos = gameData.playerOrder.indexOf(currentPlayer)

    const minBet = gameData.minBet

    let pos = startPos === orderedPlayers.length - 1 ? 0 : startPos + 1
    let found = false
    let counter = 0

    if (!gameData.showEm) {
      while (!found && pos !== startPos && counter < 5) {
        const player = orderedPlayers[pos]
        const isLastPlayer = pos === orderedPlayers.length - 1
        const nextPos = isLastPlayer ? 0 : pos + 1

        // SKIP PLAYER IF FOLDED
        if (player.action === "fold") {
          pos = nextPos
          continue
        }

        // END LOOP IF PLAYER HASN'T MADE AN ACTION YET && MIN BET IS 0
        if (!player.action && minBet === 0) {
          found = player.email
          break
        }

        // END LOOP IF PLAYER'S CURRENT BET IS LESS THAN THE MINIMUM
        if ((player.bet || 0) < minBet) {
          found = player.email
          break
        }

        pos = nextPos
      }
    }

    return await gameRef.update({ turn: found })
  } catch (err) {
    console.log(err)
  }
}

const playHand = async ({ player, type, bet, gameId }) => {
  try {
    const batch = firebase.firestore().batch()
    const FieldValue = firebase.firestore.FieldValue
    const playerRef = firebase
      .firestore()
      .collection(`games/${gameId}/players`)
      .doc(player)

    const playerDoc = await playerRef.get()
    const playerData = playerDoc.data()

    const [gameRef, gameData, gameDoc] = await getGame(gameId)
    if (gameData.minBet < bet + playerData.bet) {
      batch.update(gameRef, { minBet: bet + playerData.bet })
    }

    batch.update(playerRef, {
      action: type,
      bet: FieldValue.increment(bet || 0),
      money: FieldValue.increment(-bet || 0),
    })

    await batch.commit()
    setNextPlayer(player, gameId)
  } catch (err) {
    console.log(err)
  }
}

const endRound = async ({ gameId }) => {
  try {
    const batch = firebase.firestore().batch()
    const [gameRef, gameData, gameDoc] = await getGame(gameId)
    const [playerRefs, playerData, playerDocs] = await getPlayers(gameId)
    await collectBets(gameDoc, playerDocs)
    batch.update(gameRef, { end: true })
    await batch.commit()
  } catch (err) {
    console.log(err)
  }
}

const showEm = async ({ gameId }) => {
  await firebase
    .firestore()
    .collection("games")
    .doc(gameId)
    .update({ showEm: true })
}

const toggleWinner = async ({ gameId, selectedPlayer }) => {
  try {
    const [gameRef, gameData, gameDoc] = await getGame(gameId)
    const currentWinners = gameData.winners || []
    let newWinners = []

    if (currentWinners.includes(selectedPlayer)) {
      newWinners = currentWinners.filter((w) => w !== selectedPlayer)
    } else {
      newWinners = [...currentWinners, selectedPlayer]
    }

    await gameRef.update({ winners: newWinners })
  } catch (err) {
    console.log(err)
  }
}

const awardWinners = async ({ gameId }) => {
  try {
    const batch = firebase.firestore().batch()
    const FieldValue = firebase.firestore.FieldValue
    const [gameRef, gameData, gameDoc] = await getGame(gameId)
    const [playerRefs, playerData, playerDocs] = await getPlayers(gameId)

    const winners = gameData.winners || []
    const earnings = gameData.pot / winners.length || 0

    const playerRefMap = playerDocs.reduce(
      (map, doc) => ({ ...map, [doc.id]: doc.ref }),
      {}
    )

    winners.forEach((winner) => {
      batch.update(playerRefMap[winner], {
        money: FieldValue.increment(earnings),
      })
    })

    batch.update(gameRef, { pot: 0 })

    await batch.commit()
  } catch (err) {
    console.log(err)
  }
}

const requestPlayerBuyIn = async ({ gameId, player, pendingBuyIn }) => {
  await firebase
    .firestore()
    .collection(`games/${gameId}/players`)
    .doc(player)
    .update({ pendingBuyIn })
}

const buyInPlayer = async ({ gameId, player }) => {
  const [gameRef, gameData, gameDoc] = await getGame(gameId)
  const buyInAmount = gameData.buyIn

  const FieldValue = firebase.firestore.FieldValue
  await firebase
    .firestore()
    .collection(`games/${gameId}/players`)
    .doc(player)
    .update({ money: FieldValue.increment(buyInAmount), pendingBuyIn: false })
}

const actions = {
  addPlayer,
  removePlayer,
  updateGame,
  clearTable,
  startRound,
  dealCommunity,
  playHand,
  endRound,
  showEm,
  toggleWinner,
  awardWinners,
  requestPlayerBuyIn,
  buyInPlayer,
}

const FirebaseContext = createContext(firebase)
export const ActionsContext = createContext(actions)
export default FirebaseContext
