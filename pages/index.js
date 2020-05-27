import { useRouter } from "next/router"
import Header from "../components/Header"
import Table from "../components/Table"
import useUser from "../hooks/useUser"
import useGame from "../hooks/useGame"
import usePlayers from "../hooks/usePlayers"

const Main = () => {
  const { user, signIn, signOut } = useUser()

  const router = useRouter()
  const { gameId } = router.query
  const { game } = useGame(gameId, user)
  const { players } = usePlayers(gameId, game.playerOrder)

  return (
    <>
      <Header
        user={user}
        signIn={signIn}
        signOut={signOut}
        game={{ ...game, id: gameId }}
      />
      {gameId ? (
        <Table game={{ ...game, id: gameId }} user={user} players={players} />
      ) : null}
    </>
  )
}

export default Main
