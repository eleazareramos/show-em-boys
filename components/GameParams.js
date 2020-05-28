import { useEffect, useContext, useState } from "react"
import { ActionsContext } from "../context/firebase"
import numeral from 'numeral'

const createStyles = () => {
  return {
    container: {
      width: 200,
    },
    row: (color) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      backgroundColor: color,
      padding: "2px 5px",
      marginBottom: 5,
      borderRadius: "5px",
    }),
    label: {
      color: "lightgrey",
      fontSize: 14,
    },
    input: {
      textAlign: "right",
      fontSize: 14,
      backgroundColor: "transparent",
      border: "none",
      color: "lightgrey",
      width: 100,
      fontWeight: "bold",
    },
  }
}

const GameParams = (props) => {
  const { isAdmin, smallBlind, bigBlind, buyIn, gameId } = props
  const [buyInVal, setBuyInVal] = useState(0)
  const [smallBlindVal, setSmallBlindVal] = useState(0)
  const [bigBlindVal, setBigBlindVal] = useState(0)

  const actions = useContext(ActionsContext)
  useEffect(() => {
    setBuyInVal(buyIn)
    setSmallBlindVal(smallBlind)
    setBigBlindVal(bigBlind)
  }, [smallBlind, bigBlind, buyIn])

  const handleBlur = () => {
    actions.updateGame({
      gameId,
      params: {
        buyIn: numeral(buyInVal).value(),
        smallBlind: numeral(smallBlindVal).value(),
        bigBlind: numeral(bigBlindVal).value(),
      },
    })
  }

  const styles = createStyles()
  return (
    <div style={styles.container}>
      <div style={styles.row("black")}>
        <h3 style={styles.label}>Buy In</h3>
        <input
          disabled={!isAdmin}
          style={styles.input}
          value={buyInVal}
          onChange={(e) => setBuyInVal(e.target.value)}
          onBlur={handleBlur}
        />
      </div>
      <div style={styles.row("#003366")}>
        <h3 style={styles.label}>Small Blind</h3>
        <input
          disabled={!isAdmin}
          style={styles.input}
          value={smallBlindVal}
          onChange={(e) => setSmallBlindVal(e.target.value)}
          onBlur={handleBlur}
        />
      </div>
      <div style={styles.row("#301934")}>
        <h3 style={styles.label}>Big Blind</h3>
        <input
          disabled={!isAdmin}
          style={styles.input}
          value={bigBlindVal}
          onChange={(e) => setBigBlindVal(e.target.value)}
          onBlur={handleBlur}
        />
      </div>
    </div>
  )
}

export default GameParams
