"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth"
import { getFirebaseAuth, googleProvider, isAuthConfigured } from "@/lib/firebase-client"

interface AuthContextValue {
  user: User | null
  loading: boolean
  configured: boolean
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
  /** Fresh Firebase ID token for authenticating API calls, or null. */
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthConfigured) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function signInWithGoogle() {
    await signInWithPopup(getFirebaseAuth(), googleProvider)
  }

  async function signOutUser() {
    await signOut(getFirebaseAuth())
  }

  async function getToken(): Promise<string | null> {
    if (!isAuthConfigured) return null
    const current = getFirebaseAuth().currentUser
    return current ? current.getIdToken() : null
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, configured: isAuthConfigured, signInWithGoogle, signOutUser, getToken }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
