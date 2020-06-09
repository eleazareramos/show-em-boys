import CloseIcon from 'mdi-react/CloseIcon'
import GoogleIcon from 'mdi-react/GoogleIcon'
import { useState } from 'react'

const createStyles = ({ type }) => {
  return {
    container: {
      width: 300,
      backgroundColor: type === 'signin' ? 'lightgrey' : 'white',
      borderRadius: '10px',
      boxShadow: '0px 3px 5px black',
      padding: 20,
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
    row: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 10,
    },
    inputLabel: {
      minWidth: 100,
      fontSize: 14,
    },
    input: {
      width: '100%',
      border: 'none',
      borderRadius: '5px',
      padding: '2px 5px',
      backgroundColor: '#EFEFEF',
    },
    rowEnd: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: 10,
    },
    rowCenter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButton: {
      width: '100%',
      borderRadius: '5px',
      backgroundColor: 'grey',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      cursor: 'pointer',
      marginBottom: 10,
    },
    signUpText: {
      fontSize: 11,
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    googleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#DB4437',
      borderRadius: '5px',
      padding: '5px 10px',
      marginBottom: 20,
      cursor: 'pointer',
    },
    googleText: {
      color: 'white',
      marginLeft: 10,
    },
    orText: {
      minWidth: '100%',
      textAlign: 'center',
      fontSize: 12,
      marginBottom: 10,
    },
    errorText: {
      color: 'red',
      fontSize: 11,
    },
    helpText: {
      fontSize: 11,
    },
  }
}

const LoginModal = ({
  signInWithGoogle,
  signIn,
  signUp,
  forgotPassword,
  onClose,
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [type, setType] = useState('signin')
  const [error, setError] = useState('')
  const [passwordReset, setPasswordReset] = useState(false)

  const switchType = () => {
    if (type === 'signin') {
      setType('signup')
      setError('')
    } else {
      setType('signin')
      setError('')
    }
  }

  const resetPassword = () => {
    forgotPassword(email, (result) => {
      if (result.code) {
        setError(result.message)
      } else {
        setPasswordReset(true)
        setError('')
      }
    })
  }

  const submit = () => {
    if (type === 'signup') {
      if (confirm !== password) {
        setError(`Passwords don't match!`)
        return
      }
      signUp(email, password, (result) => {
        if (result.code) {
          setPasswordReset(false)
          setError(result.message)
        } else {
          onClose()
        }
      })
    }

    if (type === 'signin') {
      signIn(email, password, (result) => {
        if (result.code) {
          setPasswordReset(false)
          setError(result.message)
        } else {
          onClose()
        }
      })
    }
  }

  const styles = createStyles({ type })
  const label = type === 'signin' ? 'Sign In' : 'Sign Up'
  const switchLabel =
    type === 'signin' ? 'Create a New Account' : 'Use an Existing Account'
  return (
    <div className="modal-container">
      <div style={styles.container}>
        <div style={styles.header}>
          <h3>{label}</h3>
          <CloseIcon style={styles.closeIcon} onClick={onClose} />
        </div>
        <div
          style={styles.googleContainer}
          onClick={() => signInWithGoogle(onClose)}
        >
          <GoogleIcon color="white" />
          <p style={styles.googleText}>{label} with Google</p>
        </div>
        <p style={styles.orText}>- or -</p>
        <div style={styles.row}>
          <p style={styles.inputLabel}>Email</p>
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={styles.row}>
          <p style={styles.inputLabel}>Password</p>
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {type === 'signup' ? (
          <div style={styles.row}>
            <p style={styles.inputLabel}>Confirm ^</p>
            <input
              type="password"
              style={styles.input}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        ) : null}
        {type === 'signin' ? (
          <div style={styles.rowEnd}>
            {passwordReset ? (
              <p style={styles.helpText}>
                A link to reset your password was sent to your email!
              </p>
            ) : (
              <p style={styles.signUpText} onClick={resetPassword}>
                Forgot Password?
              </p>
            )}
          </div>
        ) : null}
        {error !== '' ? (
          <div style={styles.rowEnd}>
            <p style={styles.errorText}>{error}</p>
          </div>
        ) : null}
        <button style={styles.submitButton} onClick={submit}>
          {label}
        </button>
        <div style={styles.rowCenter}>
          <p style={styles.signUpText} onClick={switchType}>
            or {switchLabel}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
