import { useState } from "react"
import { useRouter } from "next/router"

const createStyles = () => {
  return {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      height: "50vh",
    },
    signInText: {
      color: "white",
      marginBottom: 10,
      cursor: "pointer",
      textDecoration: "underline",
    },
    inputContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "black",
      padding: "5px 10px",
      borderRadius: "5px",
      width: 300,
    },
    inputWarningContainer: {
      display: "flex",
      alignItems: "center",
    },
    inputLabel: {
      fontSize: 16,
      color: "white",
    },
    input: {
      textAlign: "right",
      border: "none",
      backgroundColor: "transparent",
      color: "white",
      fontSize: 16,
      marginRight: 5,
      width: 100,
    },
    helpText: {
      fontSize: 14,
      width: 300,
      textAlign: "right",
    },
  }
}

const LandingPage = (props) => {
  const router = useRouter()
  const { user, signIn, createGame } = props
  const [gameId, setGameId] = useState("")

  const styles = createStyles()

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      router.push("/?gameId=" + gameId.toLowerCase())
    }
  }

  const failedId = router.query.failed

  return (
    <div style={styles.container}>
      <h2
        style={styles.signInText}
        onClick={
          !user.email
            ? signIn
            : async () => {
                const newGameId = await createGame(user)
                router.push("/?gameId=" + newGameId)
              }
        }
      >
        {!user.email ? "Sign in to " : ""}Create a New Game
      </h2>
      <h3>or join an existing game as {user.email || "a spactator"}</h3>
      <div style={styles.inputContainer}>
        <p style={styles.inputLabel}>Enter Game Id</p>
        <div style={styles.inputWarningContainer}>
          <input
            style={styles.input}
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            onKeyDown={handleEnter}
          />
          {failedId === gameId ? "❌" : null}
        </div>
      </div>
      {gameId.length >= 4 && failedId !== gameId ? (
        <p style={styles.helpText}>Press Enter to Join</p>
      ) : null}
    </div>
  )
}

export default LandingPage
