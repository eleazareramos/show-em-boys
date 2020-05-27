import { useState, useEffect } from 'react'
import Cards from './Cards'
import Player from './Player'
import Community from './Community'
import Controls from './Controls'
import Blinds from './Blinds'

const PLAYERS = [
  {
    email: 'e@elzr.me',
    name: 'E',
    hand: ['KC', 'KH'],
    money: 10,
    pendingBuyIn: true,
  },
  {
    email: 'davidroghanian@gmail.com',
    name: 'Dave',
    hand: ['KC', 'KH'],
    money: 10,
    action: 'check',
  },
  {
    email: 'asigari0711@gmail.com',
    name: 'Amir',
    hand: ['KC', 'KH'],
    money: 10,
    action: 'fold',
  },
  {
    email: 'giancarlocordasco@gmail.com',
    name: 'GC',
    hand: ['KC', 'KH'],
    money: 5,
    action: 'bet',
    bet: 2,
    pendingBuyIn: true,
  },
  {
    email: 'johncanlas@gmail.com',
    name: 'John',
    hand: ['KC', 'KH'],
    money: 5,
  },
  {
    email: 'mattsakdalan@gmail.com',
    name: 'Matt',
    hand: ['KC', 'KH'],
    money: 5,
  },
]

const GAME = {
  smallBlind: 1,
  bigBlind: 2,
  admin: 'e@elzr.me',
  smallBlindPlayer: 'e@elzr.me',
  bigBlindPlayer: 'davidroghanian@gmail.com',
  turn: 'e@elzr.me',
  pot: 52,
  cards: ['AS', 'AS', 'AS', '', ''],
  minBet: 0,
  maxBet: 10,
  buyIn: 10,
  end: true
}

const USER = { email: 'e@elzr.me', name: 'E', hand: ['KC', 'KH'], money: 10 }

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
  },
  gameContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
}

const Table = () => {
  const [players, setPlayers] = useState(PLAYERS)
  const [game, setGame] = useState(GAME)
  const [user, setUser] = useState (USER)
  const [playerBets, setPlayerBets] = useState(0)

  useEffect(() => {
    const total = players.map(p => p.bet || 0).reduce((sum,bet) => sum += bet, 0)
    setPlayerBets(total)
  },[players])


  const nextTurn = () => {
    const playerEmails = players.map((p) => p.email)
    const currentTurn = playerEmails.indexOf(game.turn)
    const nextIndex =
      currentTurn + 1 === playerEmails.length ? 0 : currentTurn + 1
    setGame({ ...game, turn: playerEmails[nextIndex] })
  }

  return (
    <div style={styles.container}>
      <div style={styles.playerContainer}>
        {players.map((player) => (
          <Player
            user={user}
            player={player}
            isFirst={player.email === game.firstPlayer}
            isSmallBlind={player.email === game.smallBlindPlayer}
            isBigBlind={player.email === game.bigBlindPlayer}
            inTurn={player.email === game.turn}
            isUser={player.email === user.email}
            nextTurn={nextTurn}
            userIsAdmin={user.email === game.admin}
            isEnd={game.end}
          />
        ))}
      </div>
      <div style={styles.gameContainer}>
        <Community game={game} playerBets={playerBets} />
        <Blinds
          smallBlind={game.smallBlind}
          bigBlind={game.bigBlind}
          isAdmin={user.email === game.admin}
        />
        <Controls
          inTurn={game.turn === user.email}
          minBet={game.minBet}
          maxBet={Math.min(user.money, game.maxBet)}
          smallBlind={game.smallBlind}
          isAdmin={user.email === game.admin}
        />
      </div>
    </div>
  )
}

export default Table
