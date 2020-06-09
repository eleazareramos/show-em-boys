import { useRouter } from 'next/router'
import Header from '../components/Header'
import Table from '../components/Table'
import LandingPage from '../components/LandingPage'
import LoginModal from '../components/LoginModal'
import useUser from '../hooks/useUser'
import useGame from '../hooks/useGame'
import usePlayers from '../hooks/usePlayers'
import { useEffect, useContext, useState } from 'react'
import { ActionsContext } from '../context/firebase'

const Main = () => {
  const {
    user,
    signInWithGoogle,
    signIn,
    signUp,
    signOut,
    forgotPassword,
  } = useUser()

  const actions = useContext(ActionsContext)
  const router = useRouter()
  const { gameId } = router.query
  const { game, createGame } = useGame(gameId, user)
  const { players } = usePlayers(gameId, game.playerOrder)
  const [showLoginModal, setShowLoginModal] = useState(false)

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
        signIn={() => setShowLoginModal(true)}
        signOut={signOut}
        game={{ ...game, id: gameId }}
      />
      {gameId && game.admin ? (
        <Table game={{ ...game, id: gameId }} user={user} players={players} />
      ) : (
        <LandingPage
          user={user}
          signIn={() => setShowLoginModal(true)}
          createGame={createGame}
        />
      )}
      {showLoginModal ? (
        <LoginModal
          signInWithGoogle={signInWithGoogle}
          signIn={signIn}
          signUp={signUp}
          onClose={() => setShowLoginModal(false)}
          forgotPassword={forgotPassword}
        />
      ) : null}
    </>
  )
}

export default Main
