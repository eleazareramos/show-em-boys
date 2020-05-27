import { useState } from 'react'
import Cards from './Cards'
import Player from './Player'
import Community from './Community'
import Controls from './Controls'

const PLAYERS = [
  { email: 'e@elzr.me', name: 'E', hand: ['KC', 'KH'], money: 10 },
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
    action: 'check',
  },
  // {
  //   email: 'e@fureyfs.com',
  //   name: 'Eleazar',
  //   hand: ['KC', 'KH'],
  //   money: 10,
  //   action: 'check',
  // },
  // {
  //   email: 'dave@fureyfs.com',
  //   name: 'David',
  //   hand: ['KC', 'KH'],
  //   money: 10,
  //   action: 'bet',
  //   bet: 5,
  // },
  // {
  //   email: 'rest@fureyfs.com',
  //   name: 'David',
  //   hand: ['KC', 'KH'],
  //   money: 10,
  //   action: 'fold',
  // },
  // {
  //   email: 'anything',
  //   name: 'David',
  //   hand: ['KC', 'KH'],
  //   money: 10,
  // },
]

const GAME = {
  smallBlind: 1,
  bigBlind: 2,
  admin: 'e@elzr.me',
  dealer: 'davidroghanian@gmail.com',
  turn: 'e@elzr.me',
  pot: 52,
  cards: ['AS', 'AS', 'AS', '', ''],
  minBet: 5,
  maxBet: 10,
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
  const [user, setUser] = useState(USER)

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
            player={player}
            isFirst={player.email === game.dealer}
            inTurn={player.email === game.turn}
            isUser={player.email === user.email}
            nextTurn={nextTurn}
          />
        ))}
      </div>
      <div style={styles.gameContainer}>
        <Community game={game} />
        <Controls
          inTurn={game.turn === user.email}
          minBet={game.minBet}
          maxBet={Math.min(user.money, game.maxBet)}
          smallBlind={game.smallBlind}
        />
      </div>
    </div>
  )
}

export default Table
