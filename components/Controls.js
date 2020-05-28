import { useState, useEffect, useContext } from "react"
import numeral from "numeral"
import { ActionsContext } from "../context/firebase"

const createStyles = ({ inTurn, canBet, betType }) => {
  return {
    container: {
      width: "30vw",
      padding: 20,
      margin: 10,
    },
    userContainer: {
      cursor: !inTurn && "not-allowed",
    },
    button: (hovered, isAdmin) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      border: "2px solid " + (inTurn || isAdmin ? "white" : "grey"),
      borderRadius: "5px",
      padding: "0px 20px",
      cursor: inTurn || isAdmin ? "pointer" : "not-allowed",
      backgroundColor: !hovered && isAdmin ? "#2b2d2f" : hovered ? "black" : "",
      marginBottom: 2,
    }),
    buttonText: (hovered, isAdmin) => ({
      color: inTurn || isAdmin ? "white" : "grey",
      opacity: inTurn || isAdmin ? 1 : 0.4,
      fontSize: isAdmin && 14,
    }),
    bet: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    betInput: {
      textAlign: "center",
      border: "none",
      borderRadius: "5px",
      fontSize: 20,
      backgroundColor: "green",
      color: "white",
      width: "100%",
      marginRight: 10,
      padding: "5px 10px",
      marginLeft: 10,
    },
    betButton: {
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "5px",
      color: canBet ? "white" : "darkred",
      padding: "5px 10px",
      fontSize: 20,
      cursor: canBet ? "pointer" : "not-allowed",
    },
    betSign: {
      color: "white",
      fontSize: 16,
    },
    adminControls: {
      marginTop: 20,
    },
  }
}

const ControlButton = ({
  left,
  right,
  inTurn,
  onClick,
  isAdmin,
  confirm,
  turn,
}) => {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const styles = createStyles({ inTurn, hovered })

  const handleClick = () => {
    if (!inTurn && !isAdmin) return
    if (confirm) {
      if (!clicked) {
        setTimeout(() => {
          setClicked(false)
        }, 2000)
      }
      setClicked(!clicked)
      return clicked && onClick()
    }
    onClick()
  }

  return (
    <div
      style={styles.button(hovered, isAdmin)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <h3 style={styles.buttonText(hovered, isAdmin)}>{left}</h3>
      <h3 style={styles.buttonText(hovered, isAdmin)}>
        {confirm && clicked ? "Click Again to " + right : right}
      </h3>
    </div>
  )
}

const Controls = (props) => {
  const {
    inTurn,
    minBet,
    smallBlind,
    maxBet,
    isAdmin,
    gameId,
    user,
    turn,
    players,
    community,
  } = props
  const [isBetting, setIsBetting] = useState(false)
  const [betValue, setBetValue] = useState("")
  const [currentMinBet, setCurrentMinBet] = useState(0)
  const [canBet, setCanBet] = useState(false)
  const [betType, setBetType] = useState("call")
  const [nextDealType, setNextDealType] = useState("flop")

  const currentPlayer = players.filter((p) => p.email === turn)[0] || {}

  const actions = useContext(ActionsContext)

  const betIncrement = (smallBlind || 0) / 2 || 1

  useEffect(() => {
    inTurn && setIsBetting(false)
  }, [inTurn])

  useEffect(() => {
    const cardCount = (community || []).filter((c) => c !== "").length
    switch (cardCount) {
      case 3:
        setNextDealType("turn")
        break
      case 4:
        setNextDealType("river")
        break
    }
  }, [community])

  useEffect(() => {
    const requiredBet = minBet - currentPlayer.bet
    if (betType === "call") {
      setCurrentMinBet(requiredBet)
      setBetValue(requiredBet)
    } else {
      setCurrentMinBet(requiredBet + betIncrement)
      setBetValue(requiredBet + betIncrement)
    }
  }, [minBet, betType, currentPlayer])

  useEffect(() => {
    const betVal = numeral(betValue).value()
    const finalBetValue = betVal + currentPlayer.bet
    if (
      !betValue ||
      betValue === "" ||
      isNaN(betVal) ||
      finalBetValue < (currentMinBet || 0) ||
      finalBetValue > maxBet ||
      betVal > currentPlayer.money
    ) {
      setCanBet(false)
      return
    }
    setCanBet(true)
  }, [betValue, currentMinBet])

  const doCall = () => {
    setBetType("call")
    setIsBetting(true)
  }

  const doRaise = () => {
    setBetType("raise")
    setIsBetting(true)
  }

  const styles = createStyles({ inTurn, canBet, isAdmin })

  return (
    <div style={styles.container}>
      <div style={styles.userContainer}>
        {isBetting && inTurn ? (
          <div style={styles.bet}>
            <h1 style={styles.betSign}>{betType === "call" ? "$" : "$$"}</h1>
            <input
              disabled={betType === "call"}
              style={styles.betInput}
              type="number"
              value={betValue}
              step={betIncrement}
              min={currentMinBet}
              max={numeral(maxBet).value()}
              onChange={(e) => setBetValue(e.target.value)}
            />
            <button
              style={styles.betButton}
              onClick={() => {
                if (!canBet) return
                actions.playHand({
                  player: turn,
                  type: "bet",
                  bet: numeral(betValue).value(),
                  gameId,
                })
                setIsBetting(false)
              }}
            >
              Bet
            </button>
          </div>
        ) : null}
        {minBet === 0 ? (
          <ControlButton
            left="👊"
            right="Check"
            inTurn={inTurn}
            onClick={() =>
              actions.playHand({ player: turn, type: "check", bet: 0, gameId })
            }
          />
        ) : null}
        {minBet > 0 ? (
          <ControlButton
            left="$"
            right="Call"
            inTurn={inTurn}
            onClick={doCall}
          />
        ) : null}
        <ControlButton
          left="$$"
          right="Raise"
          inTurn={inTurn}
          onClick={doRaise}
        />
        <ControlButton
          left="❌"
          right="Fold"
          confirm={true}
          inTurn={inTurn}
          onClick={() => setIsBetting(false)}
          onClick={() =>
            actions.playHand({ player: turn, type: "fold", bet: 0, gameId })
          }
        />
      </div>
      {isAdmin ? (
        <div style={styles.adminControls}>
          <ControlButton
            left="🙌"
            right="Start Round"
            isAdmin={isAdmin}
            onClick={() => actions.startRound({ gameId })}
          />
          <ControlButton
            left={nextDealType === "flop" ? "🃏🃏🃏" : "🃏"}
            right={
              nextDealType.slice(0, 1).toUpperCase() + nextDealType.slice(1, 5)
            }
            isAdmin={isAdmin}
            onClick={() =>
              actions.dealCommunity({ type: nextDealType, gameId })
            }
          />
          <ControlButton
            left="✋"
            right="End Round"
            isAdmin={isAdmin}
            onClick={() => actions.endRound({ gameId })}
          />
          <ControlButton
            left="👀"
            right="Show 'Em Boys"
            isAdmin={isAdmin}
            onClick={() => actions.showEm({ gameId })}
          />
          <ControlButton
            left="💰"
            right="Award Winners"
            isAdmin={isAdmin}
            onClick={() => actions.awardWinners({ gameId })}
          />
          <ControlButton
            left="🧹"
            right="Clear Table"
            isAdmin={isAdmin}
            onClick={() => actions.clearTable({ gameId })}
          />
        </div>
      ) : null}
    </div>
  )
}

export default Controls
