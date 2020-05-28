import { useRouter } from 'next/router'
import Header from '../components/Header'
import Table from '../components/Table'
import LandingPage from '../components/LandingPage'
import useUser from '../hooks/useUser'
import useGame from '../hooks/useGame'
import usePlayers from '../hooks/usePlayers'
import { useEffect, useContext } from 'react'
import { ActionsContext } from '../context/firebase'

const Main = () => {
  const { user, signIn, signOut } = useUser()

  const actions = useContext(ActionsContext)
  const router = useRouter()
  const { gameId } = router.query
  const { game, createGame } = useGame(gameId, user)
  const { players } = usePlayers(gameId, game.playerOrder)

  useEffect(() => {
    if (game.doesNotExist) {
      const failedId = gameId
      if (typeof failedId === 'string') {
        router.push('/?failed=' + failedId)
      }
    }
  }, [game])

  return (
    <>
      <Header
        user={user}
        signIn={signIn}
        signOut={signOut}
        game={{ ...game, id: gameId }}
      />
      {gameId && game.admin ? (
        <Table game={{ ...game, id: gameId }} user={user} players={players} />
      ) : (
        <LandingPage user={user} signIn={signIn} createGame={createGame} />
      )}
    </>
  )
}

export default Main
