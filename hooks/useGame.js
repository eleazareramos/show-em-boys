import { useState, useContext, useEffect } from 'react'
import FirebaseContext from '../context/firebase'
import uid from 'uid'

const INITIAL_GAME = {
  smallBlind: 1,
  bigBlind: 2,
  smallBlindPlayer: '',
  bigBlindPlayer: '',
  turn: '',
  pot: 0,
  cards: ['', '', '', '', ''],
  minBet: 0,
  maxBet: 10,
  buyIn: 10,
  end: true,
  playerOrder: [],
  winners: [],
  deckId: '',
  round: 1,
}

const useGame = (gameId, user) => {
  const firebase = useContext(FirebaseContext)
  const [game, setGame] = useState({})
  const [needAuth, setNeedAuth] = useState(false)

  useEffect(() => {
    if (gameId) {
      getExistingGame(gameId)
    }
  }, [gameId])

  const getExistingGame = async (gameId) => {
    try {
      const gameRef = firebase.firestore().collection('games').doc(gameId)
      const gameDoc = await gameRef.get()
      if (!gameDoc.exists) return setGame({ doesNotExist: true })
      setGame(gameDoc.data())
      listenToGame(gameId)
    } catch (error) {
      console.log(error)
    }
  }

  const createGame = async (user) => {
    if (!user.email) return
    try {
      const gameId = uid(4).toLowerCase()
      const gameRef = firebase.firestore().collection('games').doc(gameId)
      const gameDoc = await gameRef.get()
      if (gameDoc.exists) return
      const newGame = { ...INITIAL_GAME, admin: user.email }
      await gameRef.set(newGame)
      return gameId
    } catch (err) {
      console.log(err)
    }
  }

  const listenToGame = (gameId) => {
    firebase
      .firestore()
      .collection('games')
      .doc(gameId)
      .onSnapshot((game) => {
        setGame(game.data())
      })
  }

  return {
    game,
    createGame
  }
}

export default useGame
