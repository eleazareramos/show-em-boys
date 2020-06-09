const createStyles = () => {
  return {
    container: {
      width: '20%'
    }
  }
}

const Instructions = () => {
  const styles = createStyles({})
  return (
    <div style={styles.container}>
      <h3>Instructions</h3>
      <p><span>1.</span> Set the Buy In, Small Blind, and Big Blind Amount</p>

    </div>
  )
}

export default Instructions