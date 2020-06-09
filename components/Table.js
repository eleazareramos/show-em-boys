import { useState, useEffect } from 'react'
import Cards from './Cards'
import Player from './Player'
import Community from './Community'
import Controls from './Controls'
import GameParams from './GameParams'
import NewPlayer from './NewPlayer'
import PlayerModal from './PlayerModal'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100vh',
  },
  playerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 20,
  },
  gameContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  newPlayerContainer: {
    display: 'flex',
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    height: '30%',
  },
  newPlayerButton: {
    backgroundColor: 'lightgrey',
    borderRadius: '5px',
    border: 'none',
    padding: '3px 10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
}

const Table = (props) => {
  const [players, setPlayers] = useState([])
  const [game, setGame] = useState({})
  const [user, setUser] = useState({})
  const [playerBets, setPlayerBets] = useState(0)
  const [maxPlayerMoney, setMaxPlayerMoney] = useState()

  const [selectedPlayer, setSelectedPlayer] = useState({})
  const [showPlayerModal, setShowPlayerModal] = useState(false)

  const isAdmin = user.email === game.admin

  useEffect(() => {
    setUser(props.user)
  }, [props.user])

  useEffect(() => {
    setGame(props.game)
  }, [props.game])

  useEffect(() => {
    setPlayers(props.players)
  }, [props.players])

  useEffect(() => {
    const bets = players.map((p) => p.bet || 0)
    const total = bets.reduce((sum, bet) => (sum += bet), 0)
    setPlayerBets(total)

    const max = players
      .filter((p) => p.action !== 'fold')
      .reduce((max, player) => {
        // console.log(player.email, "max", max, "bet", player.bet + player.money)
        const moneyOnHand = player.money + player.bet
        return Math.min(max, moneyOnHand)
      }, 100000000) // arbitrary high number to start
    setMaxPlayerMoney(max)
  }, [players])

  const openPlayerModal = (player) => {
    setSelectedPlayer(player)
    setShowPlayerModal(true)
  }

  const cardCount = (game.cards || []).filter((c) => c !== '').length
  const onBreak = cardCount === 0 && game.end
  const lastSurvivor = players.filter((p) => p.action !== 'fold').length === 1

  const noStart =
    players.some((p) => p.money < game.bigBlind) || players.length < 3

  return (
    <div style={styles.container}>
      <div style={styles.playerContainer}>
        {players.map((player, i) => (
          <Player
            key={i}
            user={user}
            player={player}
            isFirst={player.id === game.firstPlayer}
            isSmallBlind={player.id === game.smallBlindPlayer}
            isBigBlind={player.id === game.bigBlindPlayer}
            inTurn={player.id === game.turn}
            isUser={player.email === user.email}
            userIsAdmin={user.email === game.admin}
            isEnd={game.end}
            gameId={game.id}
            showEm={game.showEm}
            awarded={game.winners.includes(player.id)}
            openPlayerModal={openPlayerModal}
          />
        ))}
      </div>
      <div style={styles.gameContainer}>
        <Community game={game} playerBets={playerBets} />
        <GameParams
          smallBlind={game.smallBlind}
          bigBlind={game.bigBlind}
          isAdmin={user.email === game.admin}
          buyIn={game.buyIn}
          gameId={game.id}
        />
        <Controls
          inTurn={game.turn === user.id || user.email === game.admin}
          minBet={game.minBet}
          maxBet={maxPlayerMoney}
          smallBlind={game.smallBlind}
          isAdmin={user.email === game.admin}
          gameId={game.id}
          user={user}
          turn={game.turn}
          players={players}
          gameId={game.id}
          community={game.cards}
          pot={game.pot}
          isEnd={game.end}
          lastSurvivor={lastSurvivor}
          noStart={noStart}
          showEm={game.showEm}
          openPlayerModal={openPlayerModal}
        />
      </div>
      {showPlayerModal ? (
        <PlayerModal
          selectedPlayer={selectedPlayer}
          setShowPlayerModal={setShowPlayerModal}
          gameId={game.id}
          buyIn={game.buyIn}
        />
      ) : null}
    </div>
  )
}

export default Table
