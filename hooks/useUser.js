import { useState, useContext, useEffect } from 'react'
import FirebaseContext from '../context/firebase'

const useUser = () => {
  const firebase = useContext(FirebaseContext)
  const [user, setUser] = useState({})

  useEffect(
    () =>
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          setUser(user)
        } else {
          setUser({})
        }
      }),
    []
  )

  const signIn = async () => {
    console.log('hit')
    try {
      const provider = new firebase.auth.GoogleAuthProvider()
      const authResult = await firebase.auth().signInWithPopup(provider)
      const _user = authResult.user
      setUser(_user)
    } catch (err) {
      console.log(err)
    }
  }

  const signOut = async () => {
    try {
      await firebase.auth().signOut()
      setUser({})
    } catch (err) {
      console.log(err)
    }
  }

  return {
    user,
    signIn,
    signOut,
  }
}

export default useUser
