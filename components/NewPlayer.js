import { useState, useContext } from "react"
import { ActionsContext } from "../context/firebase"

const createStyles = ({ canSubmit }) => {
  return {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      marginBottom: 20,
      marginRight: 20,
      width: 250,
    },
    title: {
      color: "lightgrey",
      marginBottom: 10,
      marginRight: 5,
    },
    input: {
      border: "1px solid grey",
      backgroundColor: "transparent",
      borderRadius: "5px",
      padding: "5px 10px",
      width: 150,
      marginBottom: 2,
      color: "white",
      textAlign: "right",
    },
    button: {
      marginTop: 10,
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      backgroundColor: "transparent",
      color: "white",
      textAlign: "center",
      fontSize: 20,
      verticalAlign: "middle",
      display: !canSubmit && "none",
    },
  }
}

const NewPlayer = (props) => {
  const { gameId } = props
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const actions = useContext(ActionsContext)

  const submit = () => {
    actions.addPlayer({ email, name, gameId })
    setEmail("")
    setName("")
  }

  const canSubmit = email !== "" && name !== ""
  const styles = createStyles({ canSubmit })

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Add New Player</h4>
      <input
        style={styles.input}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        style={styles.input}
        placeholder="Display Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button disabled={!canSubmit} style={styles.button} onClick={submit}>
        +
      </button>
    </div>
  )
}

export default NewPlayer
