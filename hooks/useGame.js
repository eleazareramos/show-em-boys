import { useState, useContext, useEffect } from "react"
import FirebaseContext from "../context/firebase"

const INITIAL_GAME = {
  admin: "e@elzr.me",
  smallBlind: 1,
  bigBlind: 2,
  smallBlindPlayer: "",
  bigBlindPlayer: "",
  turn: "",
  pot: 0,
  cards: ["", "", "", "", ""],
  minBet: 0,
  maxBet: 10,
  buyIn: 10,
  end: false,
  playerOrder: [],
  winners: [],
  deckId: "",
  round: 1,
}

const useGame = (gameId, user) => {
  const firebase = useContext(FirebaseContext)
  const [game, setGame] = useState({})

  useEffect(() => {
    if (gameId) {
      getOrSetGame()
    }
  }, [gameId && user])

  const getOrSetGame = async () => {
    try {
      const gameRef = firebase.firestore().collection("games").doc(gameId)
      const gameDoc = await gameRef.get()
      if (gameDoc.exists) {
        setGame(gameDoc.data())
      } else {
        const newGame = { ...INITIAL_GAME, admin: user.email }
        await gameRef.set(newGame)
        setGame(newGame)
      }
      listenToGame()
    } catch (err) {
      console.log(err)
    }
  }

  const listenToGame = () => {
    firebase
      .firestore()
      .collection("games")
      .doc(gameId)
      .onSnapshot((game) => {
        setGame(game.data())
      })
  }

  return {
    game,
  }
}

export default useGame
