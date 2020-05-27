import Cards from './Cards'
import numeral from 'numeral'

const createStyles = ({ inTurn, action, isFirst }) => {
  const actionColorMap = {
    check: '#228B22',
    bet: 'green',
  }
  return {
    container: {
      display: 'flex',
      alignItems: 'flex-end',
      flexDirection: 'column',
      marginBottom: 20,
      marginRight: 20,
    },
    playerContainer: {
      display: 'flex',
      alignItems: 'center',
      borderRadius: '5px',
      backgroundColor: inTurn && 'orange',
      boxShadow: inTurn && '0px 3px 6px black',
      marginBottom: 4,
    },
    playerInfo: {
      marginRight: 10,
      maxWidth: 100,
      minWidth: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    actionText: {
      fontSize: 20,
      padding: '10px 20px',
      backgroundColor: actionColorMap[action],
      borderRadius: '10px',
      boxShadow: '0px 3px 6px black',
      color: 'white',
    },
  }
}

const Player = (props) => {
  const { player, inTurn, nextTurn, isFirst, isUser } = props

  const playerActionMap = {
    check: '👊',
    fold: '❌',
    bet: numeral(player.bet || 0).format('$#,#0.00'),
  }
  const actionText = !player.action ? '😶' : playerActionMap[player.action]

  const styles = createStyles({ inTurn, action: player.action, isFirst })

  return (
    <div style={styles.container}>
      <div style={styles.playerContainer} onClick={nextTurn}>
        <div style={styles.playerInfo}>
          <h3>{player.name}</h3>
          <p>{numeral(player.money).format('$0.00')}</p>
        </div>
        <Cards cards={player.hand} revealed={isUser} />
      </div>
      <div style={styles.actionCircle}>
        <h1 style={styles.actionText}>{actionText}</h1>
      </div>
    </div>
  )
}

export default Player
