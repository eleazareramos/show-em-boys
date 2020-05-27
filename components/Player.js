import Cards from './Cards'
import numeral from 'numeral'

const createStyles = ({ inTurn, action, isSmallBlind, isBigBlind }) => {
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
    playerName: {
      display: 'flex',
      alignItems: 'center',
    },
    money: {
      display: 'flex',
      alignItems: 'center',
    },
    actionText: {
      fontSize: 20,
      padding: '10px 20px',
      backgroundColor: actionColorMap[action],
      borderRadius: '10px',
      boxShadow: '0px 3px 6px black',
      color: 'white',
    },
    buyInButton: {
      padding: '2px 4px',
      fontSize: 11,
      borderRadius: '5px',
      cursor: 'pointer',
      marginRight: 5,
      fontWeight: 'bold',
      border: '1px solid black',
    },
    approveButton: {
      fontSize: 18,
      cursor: 'pointer',
    },
    indicator: {
      height: 20,
      width: 20,
      borderRadius: '50%',
      marginRight: 5,
      backgroundColor: isSmallBlind ? '#003366' : isBigBlind ? '#301934' : '',
    },
    actionContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    checkbox: {
      marginRight: 10,
    },
  }
}

const Player = (props) => {
  const {
    user,
    userIsAdmin,
    player,
    inTurn,
    nextTurn,
    isUser,
    isSmallBlind,
    isBigBlind,
    revealCards,
    isEnd,
  } = props

  const playerActionMap = {
    check: '👊',
    fold: '❌',
    bet: numeral(player.bet || 0).format('$#,#0.00'),
  }
  const actionText = !player.action ? '😶' : playerActionMap[player.action]

  const styles = createStyles({
    inTurn,
    action: player.action,
    isSmallBlind,
    isBigBlind,
  })

  const revealed = isUser || (isEnd && player.action !== 'fold')

  return (
    <div style={styles.container}>
      <div style={styles.playerContainer} onClick={nextTurn}>
        <div style={styles.playerInfo}>
          <div style={styles.playerName}>
            <div style={styles.indicator} />
            <h3>{player.name}</h3>
          </div>
          <div style={styles.money}>
            {user.email === player.email ? (
              <p style={styles.buyInButton}>
                {!player.pendingBuyIn ? 'Buy In' : 'Cancel'}
              </p>
            ) : userIsAdmin && player.pendingBuyIn ? (
              <p style={styles.approveButton}>✅</p>
            ) : null}
            <p>{numeral(player.money).format('$0.00')}</p>
          </div>
        </div>
        <Cards cards={player.hand} revealed={revealed} />
      </div>
      <div style={styles.actionContainer}>
        {isEnd && player.action !== 'fold' && userIsAdmin ? (
          <input type="checkbox" style={styles.checkbox} />
        ) : null}
        <div style={styles.actionCircle}>
          <h1 style={styles.actionText}>{actionText}</h1>
        </div>
      </div>
    </div>
  )
}

export default Player
