import "server-only"
import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import type { ProofRecord } from "./types"

const COLLECTION = "proofs"

let adminApp: App | null = null

/** Returns the Admin app, or null if Firebase Admin isn't configured. */
function getAdminApp(): App | null {
  if (adminApp) return adminApp

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  // Support both literal newlines and \n-escaped keys from .env files.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    return null
  }

  adminApp =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    })
  return adminApp
}

function getDb(): Firestore | null {
  const app = getAdminApp()
  return app ? getFirestore(app) : null
}

export function isHistoryEnabled(): boolean {
  return getAdminApp() !== null
}

export interface AuthUser {
  uid: string
  email: string | null
  name: string | null
}

/**
 * Verify a Firebase ID token and return the user, or null if the token is
 * missing/invalid or Admin isn't configured.
 */
export async function verifyIdToken(token: string | null | undefined): Promise<AuthUser | null> {
  const app = getAdminApp()
  if (!app || !token) return null
  try {
    const decoded = await getAuth(app).verifyIdToken(token)
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: (decoded.name as string) ?? null,
    }
  } catch {
    return null
  }
}

/** Extract the bearer token from a request and verify it. */
export async function getUserFromRequest(req: Request): Promise<AuthUser | null> {
  const header = req.headers.get("authorization") || ""
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null
  return verifyIdToken(token)
}

/** Persist a proof record. No-op (returns false) if Firestore isn't configured. */
export async function saveProofRecord(record: ProofRecord): Promise<boolean> {
  const store = getDb()
  if (!store) return false
  await store.collection(COLLECTION).doc(record.cid).set(record)
  return true
}

/** Look up a single proof record by CID (used as a fast fallback for /proof). */
export async function getProofRecord(cid: string): Promise<ProofRecord | null> {
  const store = getDb()
  if (!store) return null
  const snap = await store.collection(COLLECTION).doc(cid).get()
  return snap.exists ? (snap.data() as ProofRecord) : null
}

/** List a user's most recent checks, newest first. */
export async function getUserHistory(
  userId: string,
  max = 50,
): Promise<ProofRecord[]> {
  const store = getDb()
  if (!store) return []
  // Query by userId only (no orderBy) so Firestore doesn't require a composite
  // index; a single user's history is small, so we sort in memory.
  const snap = await store
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .limit(500)
    .get()
  return snap.docs
    .map((d) => d.data() as ProofRecord)
    .sort((a, b) => (a.storedAt < b.storedAt ? 1 : a.storedAt > b.storedAt ? -1 : 0))
    .slice(0, max)
}
