"use client"

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/** True when the client Firebase config is present. */
export const isAuthConfigured = Boolean(config.apiKey && config.authDomain && config.projectId)

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null

function getFirebaseApp(): FirebaseApp {
  if (!isAuthConfigured) {
    throw new Error(
      "Firebase Web config is missing. Set NEXT_PUBLIC_FIREBASE_* in .env.local (see SETUP.md).",
    )
  }
  if (!app) app = getApps().length ? getApp() : initializeApp(config)
  return app
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp())
  return authInstance
}

/** Client-side Firestore. Reads/writes happen from the browser under the
 * signed-in user, enforced by Firestore security rules — no server round-trip. */
export function getFirebaseDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getFirebaseApp())
  return dbInstance
}

export const googleProvider = new GoogleAuthProvider()
