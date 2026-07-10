import "server-only"
import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// This module is used ONLY to verify Firebase ID tokens on the compute
// endpoints (Gemini / Filecoin). All Firestore reads/writes happen client-side
// via the Web SDK (see lib/history.ts) — no Admin Firestore, so no serverless
// gRPC to hang. Admin Auth token verification is HTTP-based and reliable.

let adminApp: App | null = null

/** Normalize a service-account private key pasted into an env var. */
function normalizePrivateKey(raw: string): string {
  return raw
    .trim()
    // Strip a single layer of accidental surrounding quotes (common on Vercel).
    .replace(/^["']|["']$/g, "")
    // Convert \n escape sequences to real newlines.
    .replace(/\\n/g, "\n")
}

/**
 * Returns the Admin app, or null if Firebase Admin isn't configured OR the
 * credentials are malformed. Never throws — a bad key must not 500 an API route.
 */
function getAdminApp(): App | null {
  if (adminApp) return adminApp

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const rawKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !rawKey) {
    return null
  }

  try {
    adminApp =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: normalizePrivateKey(rawKey),
        }),
      })
    return adminApp
  } catch (e) {
    // Malformed key / bad credentials — log and degrade gracefully to 401s.
    console.error("[firebase-admin] initialization failed:", e)
    return null
  }
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
