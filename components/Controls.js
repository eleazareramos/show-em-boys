import { useState, useEffect } from 'react'
import numeral from 'numeral'

const createStyles = ({ inTurn, canBet, betType }) => {
  return {
    container: {
      width: '30vw',
      padding: 20,
      margin: 10,
    },
    userContainer: {
      cursor: !inTurn && 'not-allowed',
    },
    button: (hovered, isAdmin) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '2px solid ' + (inTurn || isAdmin ? 'white' : 'grey'),
      borderRadius: '5px',
      padding: '0px 20px',
      cursor: inTurn || isAdmin ? 'pointer' : 'not-allowed',
      backgroundColor: !hovered && isAdmin ? '#2b2d2f' : hovered ? 'black' : '',
      marginBottom: 2,
    }),
    buttonText: (hovered, isAdmin) => ({
      color: inTurn || isAdmin ? 'white' : 'grey',
      opacity: inTurn || isAdmin ? 1 : 0.4,
      fontSize: isAdmin && 11,
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
      color: canBet ? 'white' : 'darkred',
      padding: '5px 10px',
      fontSize: 20,
      cursor: canBet ? 'pointer' : 'not-allowed',
    },
    betSign: {
      color: 'white',
      fontSize: 16,
    },
    adminControls: {
      marginTop: 20,
    },
  }
}

const ControlButton = ({ left, right, inTurn, onClick, isAdmin, confirm }) => {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const styles = createStyles({ inTurn, hovered })

  const handleClick = () => {
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
        {confirm && clicked ? 'Click Again to ' + right : right}
      </h3>
    </div>
  )
}

const Controls = (props) => {
  const { inTurn, minBet, smallBlind, maxBet, isAdmin } = props
  const [isBetting, setIsBetting] = useState(false)
  const [betValue, setBetValue] = useState('')
  const [currentMinBet, setCurrentMinBet] = useState(0)
  const [canBet, setCanBet] = useState(false)
  const [betType, setBetType] = useState('call')
  const styles = createStyles({ inTurn, canBet, isAdmin })

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
      <div style={styles.userContainer}>
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
        {minBet === 0 ? (
          <ControlButton
            left="👊"
            right="Check"
            inTurn={inTurn}
            onClick={() => setIsBetting(false)}
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
        />
      </div>
      {isAdmin ? (
        <div style={styles.adminControls}>
          <ControlButton
            right="Start Round"
            isAdmin={isAdmin}
            onClick={() => setIsBetting(false)}
          />
          <ControlButton
            left="🃏🃏🃏"
            right="Flop"
            isAdmin={isAdmin}
            onClick={() => setIsBetting(false)}
          />
          <ControlButton
            left="🃏🃏🃏🃏"
            right="Turn"
            isAdmin={isAdmin}
            onClick={() => setIsBetting(false)}
          />
          <ControlButton
            left="🃏🃏🃏🃏🃏"
            right="River"
            isAdmin={isAdmin}
            onClick={() => setIsBetting(false)}
          />
          <ControlButton
            right="End Round"
            isAdmin={isAdmin}
            onClick={() => setIsBetting(false)}
          />
          <ControlButton
            right="Award Winners"
            isAdmin={isAdmin}
            onClick={() => setIsBetting(false)}
          />
        </div>
      ) : null}
    </div>
  )
}

export default Controls
