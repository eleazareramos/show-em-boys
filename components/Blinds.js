const createStyles = () => {
  return {
    container: {
      width: 200,
    },
    row: (color) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      backgroundColor: color,
      padding: '2px 5px',
      marginBottom: 5,
      borderRadius: '5px',
    }),
    label: {
      color: 'lightgrey',
      fontSize: 14,
    },
    input: {
      textAlign: 'right',
      fontSize: 14,
      backgroundColor: 'transparent',
      border: 'none',
      color: 'lightgrey',
      width: 100,
      fontWeight: 'bold',
    },
  }
}

const Blinds = (props) => {
  const { isAdmin, smallBlind, bigBlind } = props
  const styles = createStyles()
  return (
    <div style={styles.container}>
      <div style={styles.row('#003366')}>
        <h3 style={styles.label}>Small Blind</h3>
        <input disabled={!isAdmin} style={styles.input} value={smallBlind} />
      </div>
      <div style={styles.row('#301934')}>
        <h3 style={styles.label}>Big Blind</h3>
        <input disabled={!isAdmin} style={styles.input} value={bigBlind} />
      </div>
    </div>
  )
}

export default Blinds
