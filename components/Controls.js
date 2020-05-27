import { useState, useEffect } from 'react'
import numeral from 'numeral'

const createStyles = ({ inTurn, canBet, betType }) => {
  return {
    container: {
      width: '30vw',
      padding: 20,
      margin: 10,
      cursor: !inTurn && 'not-allowed',
    },
    button: (hovered) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '2px solid ' + (inTurn ? 'white' : 'grey'),
      borderRadius: '5px',
      padding: '0px 20px',
      cursor: inTurn ? 'pointer' : 'not-allowed',
      backgroundColor: hovered && 'black',
      marginBottom: 2,
    }),
    buttonText: (hovered) => ({
      color: inTurn ? 'white' : 'grey',
      opacity: inTurn ? 1 : 0.4,
    }),
    bet: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    betInput: {
      textAlign: 'center',
      border: 'none',
      borderRadius: '5px',
      fontSize: 20,
      backgroundColor: 'green',
      color: 'white',
      width: '100%',
      marginRight: 10,
      padding: '5px 10px',
      marginLeft: 10,
    },
    betButton: {
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '5px',
      color: canBet ? 'white' : 'lightgrey',
      padding: '5px 10px',
      fontSize: 20,
      cursor: canBet ? 'pointer' : 'not-allowed',
    },
    betSign: {
      color: 'white',
      fontSize: 16,
    },
  }
}

const ControlButton = ({ left, right, inTurn, onClick }) => {
  const [hovered, setHovered] = useState(false)
  const styles = createStyles({ inTurn, hovered })
  return (
    <div
      style={styles.button(hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <h3 style={styles.buttonText(hovered)}>{left}</h3>
      <h3 style={styles.buttonText(hovered)}>{right}</h3>
    </div>
  )
}

const Controls = (props) => {
  const { inTurn, minBet, smallBlind, maxBet } = props
  const [isBetting, setIsBetting] = useState(false)
  const [betValue, setBetValue] = useState('')
  const [currentMinBet, setCurrentMinBet] = useState(0)
  const [canBet, setCanBet] = useState(false)
  const [betType, setBetType] = useState('call')
  const styles = createStyles({ inTurn, canBet })

  useEffect(() => {
    inTurn && setIsBetting(false)
  }, [inTurn])

  useEffect(() => {
    if (betType === 'call') {
      setCurrentMinBet(minBet)
      setBetValue(minBet)
    } else {
      setCurrentMinBet(minBet + (smallBlind || 0) / 2)
      setBetValue(minBet + (smallBlind || 0) / 2)
    }
  }, [minBet, betType])

  useEffect(() => {
    const betVal = numeral(betValue).value()
    if (
      !betValue ||
      betValue === '' ||
      isNaN(betVal) ||
      betVal < (currentMinBet || 0) ||
      betVal > maxBet
    ) {
      setCanBet(false)
      return
    }
    setCanBet(true)
  }, [betValue, currentMinBet])

  const doCall = () => {
    setBetType('call')
    setIsBetting(true)
  }

  const doRaise = () => {
    setBetType('raise')
    setIsBetting(true)
  }

  return (
    <div style={styles.container}>
      {isBetting && inTurn ? (
        <div style={styles.bet}>
          <h1 style={styles.betSign}>{betType === 'call' ? '$' : '$$'}</h1>
          <input
            disabled={betType === 'call'}
            style={styles.betInput}
            type="number"
            value={betValue}
            min={currentMinBet}
            max={maxBet}
            onChange={(e) => setBetValue(e.target.value)}
          />
          <button style={styles.betButton}>Bet</button>
        </div>
      ) : null}
      <ControlButton
        left="👊"
        right="Check"
        inTurn={inTurn}
        onClick={() => setIsBetting(false)}
      />
      <ControlButton left="$" right="Call" inTurn={inTurn} onClick={doCall} />
      <ControlButton
        left="$$"
        right="Raise"
        inTurn={inTurn}
        onClick={doRaise}
      />
      <ControlButton
        left="❌"
        right="Fold"
        inTurn={inTurn}
        onClick={() => setIsBetting(false)}
      />
    </div>
  )
}

export default Controls
