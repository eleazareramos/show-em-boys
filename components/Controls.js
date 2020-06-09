import { useState, useEffect, useContext } from "react"
import numeral from "numeral"
import { ActionsContext } from "../context/firebase"
import { useRouter } from "next/router"

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
    button: (hovered, isAdmin, isDealersTurn, disabled) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      border:
        isDealersTurn && !disabled
          ? "2px solid orange"
          : (inTurn || isAdmin) && !disabled
          ? "2px solid white"
          : "2px solid grey",
      borderRadius: "5px",
      padding: "0px 20px",
      cursor: (inTurn || isAdmin) && !disabled ? "pointer" : "not-allowed",
      backgroundColor: !hovered && isAdmin ? "#2b2d2f" : hovered ? "black" : "",
      marginBottom: 2,
    }),
    buttonText: (hovered, isAdmin, disabled) => ({
      color: inTurn || isAdmin ? "white" : "grey",
      opacity: (inTurn || isAdmin) && !disabled ? 1 : 0.4,
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
    playForText: {
      fontWeight: "bold",
      marginBottom: 2,
      color: "orange",
    },
    playForHelpText: {
      fontSize: 11,
      color: "black",
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
  isDealersTurn,
  disabled,
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
      style={styles.button(hovered, isAdmin, isDealersTurn, disabled)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <h3 style={styles.buttonText(hovered, isAdmin, disabled)}>{left}</h3>
      <h3 style={styles.buttonText(hovered, isAdmin, disabled)}>
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
    userId,
    turn,
    players,
    community,
    pot,
    isEnd,
    lastSurvivor,
    noStart,
    showEm,
    openPlayerModal,
  } = props
  const [isBetting, setIsBetting] = useState(false)
  const [betValue, setBetValue] = useState("")
  const [currentMinBet, setCurrentMinBet] = useState(0)
  const [canBet, setCanBet] = useState(false)
  const [betType, setBetType] = useState("call")
  const [nextDealType, setNextDealType] = useState("flop")
  const router = useRouter()

  const currentPlayer = players.filter((p) => p.id === turn)[0] || {}

  const actions = useContext(ActionsContext)

  const betIncrement = (smallBlind || 0) / 2 || 1

  useEffect(() => {
    inTurn && setIsBetting(false)
  }, [inTurn])

  useEffect(() => {
    if (lastSurvivor && !isEnd) {
      setNextDealType("end")
      return
    }

    const cardCount = (community || []).filter((c) => c !== "").length

    if (isEnd) {
      if (pot > 0) {
        setNextDealType("award")
        return
      }
      if (pot === 0 && cardCount > 0) {
        setNextDealType("clear")
        return
      }
      setNextDealType("start")
      return
    }

    switch (cardCount) {
      case 0:
        setNextDealType("flop")
        break
      case 3:
        setNextDealType("turn")
        break
      case 4:
        setNextDealType("river")
        break
      case 5:
        setNextDealType("end")
        break
      default:
        setNextDealType("start")
    }
  }, [community, isEnd, lastSurvivor])

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

  useEffect(() => {
    setIsBetting(false)
  }, [turn])

  const newGame = async () => {
    actions.newGameSamePlayers({ gameId }, (newGameId) => {
      router.push("/?gameId=" + newGameId)
    })
  }

  const doCall = () => {
    setBetType("call")
    setIsBetting(true)
  }

  const doRaise = () => {
    setBetType("raise")
    setIsBetting(true)
  }

  const styles = createStyles({ inTurn, canBet, isAdmin })

  const dealerActionMap = {
    clear: { action: () => actions.clearTable({ gameId }), icon: "🧹" },
    start: { action: () => actions.startRound({ gameId }), icon: "🙌" },
    flop: {
      action: () => actions.dealCommunity({ type: "flop", gameId }),
      icon: "🃏🃏🃏",
    },
    turn: {
      action: () => actions.dealCommunity({ type: "turn", gameId }),
      icon: "🃏",
    },
    river: {
      action: () => actions.dealCommunity({ type: "river", gameId }),
      icon: "🃏",
    },
    end: { action: () => actions.endRound({ gameId }), icon: "✋" },
    award: { action: () => actions.awardWinners({ gameId }), icon: "💰" },
  }

  const turnName = (players.filter((p) => p.id === turn)[0] || {}).name

  const canShowEm =
    players.filter((p) => p.action !== "fold").some((p) => p.money === 0) &&
    players.filter((p) => p.action !== "fold").every((p) => p.bet >= minBet) &&
    !showEm

  return (
    <div style={styles.container}>
      {isEnd || !user.email ? null : (
        <div style={styles.userContainer}>
          {isAdmin && turn !== userId && (turn || "") !== "" ? (
            <p style={styles.playForText}>
              Play for {turnName}{" "}
              <span style={styles.playForHelpText}>
                (only Hosts can do this)
              </span>
            </p>
          ) : null}
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
                className="fade-on-hover"
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
                actions.playHand({
                  player: turn,
                  type: "check",
                  bet: 0,
                  gameId,
                })
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
      )}
      {isAdmin ? (
        <div style={styles.adminControls}>
          {isEnd && noStart && (community || [""])[0] === "" ? (
            <p>
              {players.length < 3
                ? "Not enough players to begin"
                : "Some players do not have enough money"}
            </p>
          ) : null}
          <ControlButton
            left={dealerActionMap[nextDealType].icon}
            confirm={(turn || "") !== ""}
            right={
              nextDealType.slice(0, 1).toUpperCase() + nextDealType.slice(1, 5)
            }
            isAdmin={isAdmin}
            isDealersTurn={(turn || "") === ""}
            onClick={dealerActionMap[nextDealType].action}
            disabled={nextDealType === "start" && noStart}
          />
          {nextDealType !== "clear" && !isEnd ? (
            <ControlButton
              left="🧹"
              right="Clear Table"
              confirm={true}
              isAdmin={isAdmin}
              onClick={() => actions.clearTable({ gameId })}
            />
          ) : null}
          {!isEnd && canShowEm ? (
            <ControlButton
              left="👀"
              right="Show 'Em Boys"
              isAdmin={isAdmin}
              onClick={() => actions.showEm({ gameId })}
            />
          ) : null}
          {isEnd && (community || [""])[0] === "" ? (
            <>
              <ControlButton
                left="🙋"
                right="Add Player"
                isAdmin={isAdmin}
                onClick={() => openPlayerModal({})}
              />
              {players.length >= 3 ? (
                <>
                  <ControlButton
                    left="🔀"
                    right="Shuffle Seats"
                    isAdmin={isAdmin}
                    onClick={() => actions.shufflePlayers({ gameId })}
                  />
                  <ControlButton
                    left="🆕"
                    right="New Game w/ Same Players"
                    isAdmin={isAdmin}
                    onClick={newGame}
                  />
                </>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default Controls
