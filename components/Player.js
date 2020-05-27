import { useState, useContext } from "react"
import Cards from "./Cards"
import numeral from "numeral"
import { ActionsContext } from "../context/firebase"

const createStyles = ({ inTurn, action, isSmallBlind, isBigBlind }) => {
  const actionColorMap = {
    check: "#228B22",
    bet: "green",
  }
  return {
    container: {
      display: "flex",
      alignItems: "flex-end",
      flexDirection: "column",
      marginBottom: 20,
      marginRight: 20,
    },
    playerContainer: {
      display: "flex",
      alignItems: "center",
      borderRadius: "5px",
      backgroundColor: inTurn && "orange",
      boxShadow: inTurn && "0px 3px 6px black",
      marginBottom: 4,
    },
    playerInfo: {
      marginRight: 10,
      maxWidth: 100,
      minWidth: 100,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
    },
    playerName: {
      display: "flex",
      alignItems: "center",
      // justifyContent: 'flex-end'
    },
    playerNameText: {
      textAlign: 'right'
    },
    money: {
      display: "flex",
      alignItems: "center",
    },
    actionText: {
      fontSize: 20,
      padding: "10px 20px",
      backgroundColor: actionColorMap[action],
      borderRadius: "10px",
      boxShadow: "0px 3px 6px black",
      color: "white",
    },
    buyInButton: {
      padding: "2px 4px",
      fontSize: 11,
      borderRadius: "5px",
      cursor: "pointer",
      marginRight: 5,
      fontWeight: "bold",
      border: "1px solid black",
    },
    approveButton: {
      fontSize: 18,
      cursor: "pointer",
    },
    indicator: {
      height: 20,
      width: 20,
      borderRadius: "50%",
      marginRight: 5,
      backgroundColor: isSmallBlind ? "#003366" : isBigBlind ? "#301934" : "",
    },
    actionContainer: {
      display: "flex",
      alignItems: "center",
    },
    checkbox: {
      marginRight: 10,
      cursor: "pointer",
    },
    removeText: {
      fontSize: 10,
      color: "darkred",
      cursor: "pointer",
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
  } = props

  const actions = useContext(ActionsContext)
  const [awarded, setAwarded] = useState(false)

  const playerActionMap = {
    check: "👊",
    fold: `❌${player.bet ? ' '+numeral(player.bet || 0).format('$#,##0.00') : '' }`,
    bet: numeral(player.bet || 0).format("$#,##0.00"),
  }
  const actionText = !player.action ? "😶" : playerActionMap[player.action]

  const styles = createStyles({
    inTurn,
    action: player.action,
    isSmallBlind,
    isBigBlind,
  })

  const revealed = isUser || (isEnd && player.action !== "fold")
  const winnerCheckbox = awarded ? "🤑" : "😑"

  return (
    <div style={styles.container}>
      <div style={styles.playerContainer}>
        <div style={styles.playerInfo}>
          <div style={styles.playerName}>
            <div style={styles.indicator} />
            <h3 style={styles.playerNameText}>{player.name}</h3>
          </div>
          <div style={styles.money}>
            {user.email === player.email ? (
              <p style={styles.buyInButton}>
                {!player.pendingBuyIn ? "Buy In" : "Cancel"}
              </p>
            ) : userIsAdmin && player.pendingBuyIn ? (
              <p style={styles.approveButton}>💰✅</p>
            ) : null}
            <p>{numeral(player.money).format("$0.00")}</p>
          </div>
          {userIsAdmin && isEnd ? (
            <p
              style={styles.removeText}
              onClick={() =>
                actions.removePlayer({ gameId, email: player.email })
              }
            >
              Kick Out
            </p>
          ) : null}
        </div>
        <Cards cards={player.hand} revealed={revealed} />
      </div>
      <div style={styles.actionContainer}>
        {isEnd && player.action !== "fold" ? (
          <h1 style={styles.checkbox} onClick={() => setAwarded(!awarded)}>
            {winnerCheckbox}
          </h1>
        ) : null}
        <div style={styles.actionCircle}>
          <h1 style={styles.actionText}>{actionText}</h1>
        </div>
      </div>
    </div>
  )
}

export default Player
