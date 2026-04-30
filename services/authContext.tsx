import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import React, { ReactNode, createContext, useEffect, useState } from 'react'
import { auth } from './firebase'

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        await AsyncStorage.setItem('userId', currentUser.uid)
      } else {
        await AsyncStorage.removeItem('userId')
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      console.log('Signing up with:', email)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      console.log('Signup successful:', result.user.uid)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign up'
      console.error('Signup error:', message)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      console.log('Logging in with:', email)
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log('Login successful:', result.user.uid)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log in'
      console.error('Login error:', message)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log out'
      setError(message)
      throw err
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
