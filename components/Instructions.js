const createStyles = () => {
  return {
    container: {
      paddingTop: 50,
      width: "30%",
    },
    title: {
      marginBottom: 20,
      textDecoration: "underline",
    },
    number: {
      marginRight: 10,
    },
    text: {
      marginBottom: 20,
      color: "lightgrey",
    },
  }
}

const Instructions = () => {
  const styles = createStyles({})
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Get Started</h3>
      <p style={styles.text}>
        <span style={styles.number}>1️⃣</span> Set the Buy In, Small Blind, and
        Big Blind amounts.
      </p>
      <p style={styles.text}>
        <span style={styles.number}>2️⃣</span> Add at least 3 players with Gmail
        accounts (incl. yourself).
      </p>
    </div>
  )
}

export default Instructions
