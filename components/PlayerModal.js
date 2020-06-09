import CloseIcon from 'mdi-react/CloseIcon'
import { ActionsContext } from '../context/firebase'
import { useState, useEffect, useContext } from 'react'
import numeral from 'numeral'

const createStyles = ({ canSubmit }) => {
  return {
    container: {
      width: 300,
      backgroundColor: 'lightgrey',
      borderRadius: '10px',
      boxShadow: '0px 3px 5px black',
      padding: '20px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    closeIcon: {
      cursor: 'pointer',
    },
    infoContainer: {
      marginBottom: 20,
      backgroundColor: 'grey',
      padding: '5px 10px',
      borderRadius: '10px',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    infoInputLabel: {
      minWidth: 100,
      maxWidth: 100,
      fontWeight: 'bold',
      fontSize: 14,
      color: 'white',
    },
    infoInput: {
      width: 150,
      border: '1px solid lightgrey',
      borderRadius: '5px',
      padding: '2px 5px',
    },
    moneyContainer: {
      padding: '5px 10px',
      borderRadius: '10px',
      backgroundColor: 'green',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    moneyLabel: {
      color: 'white',
      fontSize: 16,
    },
    moneyInput: {
      backgroundColor: 'transparent',
      textAlign: 'right',
      borderRadius: '5px',
      color: 'white',
      border: 'none',
      fontSize: 16,
    },
    saveButton: {
      width: '100%',
      borderRadius: '10px',
      color: canSubmit ? 'white' : 'grey',
      padding: 5,
      textAlign: 'center',
      backgroundColor: 'black',
      border: 'none',
      cursor: canSubmit ? 'pointer' : 'not-allowed',
      fontSize: 14,
    },
    kickOutButton: {
      borderRadius: '10px',
      fontSize: 12,
      color: 'darkred',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
    },
  }
}

const PlayerModal = ({ selectedPlayer, setShowPlayerModal, gameId, buyIn }) => {
  const [player, setPlayer] = useState({})
  const [canSubmit, setCanSubmit] = useState(false)
  const actions = useContext(ActionsContext)

  useEffect(() => {
    if (selectedPlayer.id) {
      setPlayer(selectedPlayer)
    } else {
      setPlayer({ money: buyIn })
    }
  }, [selectedPlayer])

  useEffect(() => {
    const hasName = player.name && player.name !== ''
    const hasEmail = player.email && player.email !== ''
    const hasMoney = player.money && !isNaN(numeral(player.money).value())
    if (hasName && hasEmail && hasMoney) {
      setCanSubmit(true)
    } else {
      setCanSubmit(false)
    }
  }, [player])

  const handleChange = (e, field) => {
    setPlayer({ ...player, [field]: e.target.value })
  }

  const submitChanges = () => {
    const playerId = player.id
    if (playerId) {
      actions.updatePlayer({ gameId, playerId, params: player })
    } else {
      actions.addPlayer({ gameId, email: player.email, name: player.name })
    }
    setShowPlayerModal(false)
  }

  const styles = createStyles({ canSubmit })
  return (
    <div className="modal-container">
      <div style={styles.container}>
        <div style={styles.header}>
          <h3>{!player.id ? 'New' : 'Edit'} Player</h3>
          <CloseIcon
            style={styles.closeIcon}
            onClick={() => setShowPlayerModal(false)}
          />
        </div>
        <div style={styles.infoContainer}>
          <div style={styles.row}>
            <p style={styles.infoInputLabel}>Display Name</p>
            <input
              style={styles.infoInput}
              value={player.name}
              onChange={(e) => handleChange(e, 'name')}
            />
          </div>
          <div style={styles.row}>
            <p style={styles.infoInputLabel}>Email</p>
            <input
              style={styles.infoInput}
              value={player.email}
              onChange={(e) => handleChange(e, 'email')}
            />
          </div>
        </div>
        <div style={styles.moneyContainer}>
          <p style={styles.moneyLabel}>💰 Money</p>
          <input
            style={styles.moneyInput}
            value={player.money}
            onChange={(e) => handleChange(e, 'money')}
          />
        </div>
        <button
          disabled={!canSubmit}
          style={styles.saveButton}
          onClick={canSubmit ? submitChanges : () => {}}
        >
          SAVE
        </button>
        {player.id ? (
          <button
            style={styles.kickOutButton}
            onClick={() => {
              actions.removePlayer({ gameId, playerId: player.id })
              setShowPlayerModal(false)
            }}
          >
            KICK OUT
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default PlayerModal
