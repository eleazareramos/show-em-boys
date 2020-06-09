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

  const signInWithGoogle = async (callback) => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider()
      const authResult = await firebase.auth().signInWithPopup(provider)
      const _user = authResult.user
      setUser(_user)
      callback && callback()
    } catch (err) {
      console.log(err)
    }
  }

  const signIn = async (email, password, callback) => {
    try {
      const authResult = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
      const _user = authResult.user
      setUser(_user)
      callback && callback(authResult)
    } catch (err) {
      console.log(err)
      callback && callback(err)
    }
  }

  const signUp = async (email, password, callback) => {
    try {
      const authResult = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
      const _user = authResult.user
      setUser(_user)
      callback && callback(authResult)
    } catch (err) {
      console.log(err)
      callback && callback(err)
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

  const forgotPassword = async (email, callback) => {
    try {
      const result = await firebase.auth().sendPasswordResetEmail(email)
      callback && callback(result)
    } catch(err){
      callback && callback(err)
    }
  }

  return {
    user,
    signIn,
    signUp,
    signInWithGoogle,
    forgotPassword,
    signOut,
  }
}

export default useUser
