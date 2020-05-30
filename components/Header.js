import { useRouter } from 'next/router'
import FileCodeIcon from 'mdi-react/FileCodeIcon'

const createStyles = () => {
  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#2b2d2f',
      padding: '10px 20px',
      boxShadow: '0px 3px 6px black',
    },
    left: {
      display: 'flex',
      alignItems: 'center',
    },
    right: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-end',
    },
    text: {
      color: 'white',
      marginRight: 30,
      cursor: 'pointer',
    },
    actionText: {
      color: 'white',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    githubIcon: {
      height: 20,
      width: 20,
      cursor: 'pointer',
    },
    githubContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    githubText: {
      fontSize: 10,
      marginLeft: 5
    }
  }
}

const Header = (props) => {
  const router = useRouter()
  const { game, user, signIn, signOut } = props

  const styles = createStyles()

  const isSignedIn = Boolean(user.email)
  const onClickAction = isSignedIn ? signOut : signIn
  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <h2 style={styles.text} onClick={() => router.push('/')}>
          Show 'Em Boys
        </h2>
        {game.id && game.admin ? (
          <p style={styles.text}>{`Game: ${game.id}`}</p>
        ) : null}
        {game.id && game.admin ? (
          <p style={styles.text}>{`Round: ${game.round || 0}`}</p>
        ) : null}
        {game.id && game.admin ? (
          <p style={styles.text}>{`Host: ${game.admin || 0}`}</p>
        ) : null}
        <div style={styles.githubContainer}>
          <FileCodeIcon
            style={styles.githubIcon}
            onClick={() => window.open('https://github.com/eleazareramos/show-em-boys')}
          />
          <p style={styles.githubText}>{`< source code.`}</p>
        </div>
      </div>
      <div style={styles.right}>
        <p style={styles.actionText} onClick={onClickAction}>
          {isSignedIn ? `Sign out as ${user.email}` : 'Sign In'}
        </p>
      </div>
    </div>
  )
}

export default Header
