import { useState, useContext } from 'react'
import Cards from './Cards'
import numeral from 'numeral'
import { ActionsContext } from '../context/firebase'
import PencilIcon from 'mdi-react/PencilIcon'

const createStyles = ({ inTurn, action, isSmallBlind, isBigBlind, isUser }) => {
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
      maxWidth: 150,
      minWidth: 150,
      paddingLeft: 5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    playerName: {
      display: 'flex',
      alignItems: 'center',
      // justifyContent: 'flex-end'
    },
    playerNameText: {
      textAlign: 'right',
      cursor: 'pointer',
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
      textAlign: 'center',
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
      cursor: 'pointer',
    },
    removeText: {
      fontSize: 10,
      color: 'darkred',
      cursor: 'pointer',
    },
    handText: {
      marginRight: 10,
      fontSize: 14,
      fontStyle: 'italic',
    },
    emailText: {
      fontSize: 11,
      textAlign: 'right',
      maxWidth: 120,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: !inTurn && isUser ? 'lightgrey' : 'black',
      textDecoration: !inTurn && isUser ? 'underline' : '',
    },
  }
}

const Player = (props) => {
  const {
    user,
    userIsAdmin,
    player,
    inTurn,
    isUser,
    isSmallBlind,
    isBigBlind,
    isEnd,
    gameId,
    showEm,
    awarded,
    openPlayerModal,
  } = props

  const actions = useContext(ActionsContext)

  const playerActionMap = {
    check: '👊',
    fold: `❌${
      player.bet ? ' ' + numeral(player.bet || 0).format('$#,##0.00') : ''
    }`,
    bet: numeral(player.bet || 0).format('$#,##0.00'),
  }
  const actionText = !player.action ? '😶' : playerActionMap[player.action]
  const [hovered, setHovered] = useState(false)

  const styles = createStyles({
    inTurn,
    action: player.action,
    isSmallBlind,
    isBigBlind,
    isUser,
  })

  const revealed = isUser || (showEm && player.action !== 'fold')
  const winnerCheckbox = awarded ? '🤑' : '😑'

  return (
    <div
      style={styles.container}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.playerContainer}>
        <div style={styles.playerInfo}>
          <div style={styles.playerName}>
            <div style={styles.indicator} />
            <h3
              style={styles.playerNameText}
              onClick={userIsAdmin ? () => openPlayerModal(player) : () => {}}
            >
              {player.name}
            </h3>
            {hovered && userIsAdmin ? (
              <PencilIcon
                size={16}
                onClick={userIsAdmin ? () => openPlayerModal(player) : () => {}}
              />
            ) : null}
          </div>
          <div style={styles.money}>
            <p style={styles.moneyText}>
              {numeral(player.money).format('$#,#00.00')}
            </p>
          </div>
          <p style={styles.emailText} className="overflow-on-hover">
            {player.email}
          </p>
        </div>
        <Cards cards={player.hand} revealed={revealed} />
      </div>
      <div style={styles.actionContainer}>
        {isEnd && player.action !== 'fold' && player.hand[0] !== '' ? (
          <>
            {(player.handText || '') !== '' ? (
              <p style={styles.handText}>{player.handText}</p>
            ) : null}
            <h1
              style={styles.checkbox}
              onClick={
                userIsAdmin
                  ? () => {
                      actions.toggleWinner({
                        gameId,
                        selectedPlayer: player.email,
                      })
                    }
                  : null
              }
            >
              {winnerCheckbox}
            </h1>
          </>
        ) : (
          <div style={styles.actionCircle}>
            <h1 style={styles.actionText}>{actionText}</h1>
          </div>
        )}
      </div>
    </div>
  )
}

export default Player
