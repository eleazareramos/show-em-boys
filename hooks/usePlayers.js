import { useState, useContext, useEffect } from "react"
import FirebaseContext from "../context/firebase"

const usePlayers = (gameId, playerOrder) => {
  const firebase = useContext(FirebaseContext)
  const [players, setPlayers] = useState([])
  const [orderedPlayers, setOrderedPlayers] = useState([])

  useEffect(() => {
    const _players = reorderPlayers(players)
    setOrderedPlayers(_players)
  },[playerOrder, players])

  useEffect(() => {
    if (gameId) {
      listenToPlayers()
    }
  }, [gameId])

  const reorderPlayers = players => {
    if(!playerOrder || !playerOrder.length) return players
    const orderedPlayers = playerOrder.map((email) => {
      return players.filter((p) => p.email === email)[0] || { hand: []}
    })
    return orderedPlayers
  }

  const listenToPlayers = () => {
    firebase
      .firestore()
      .collection(`games/${gameId}/players`)
      .onSnapshot((playerSnapshots) => {
        let _players = []
        playerSnapshots.forEach((player) => _players.push(player.data()))
        setPlayers(_players)
      })
  }

  return {
    players: orderedPlayers,
  }
}

export default usePlayers
