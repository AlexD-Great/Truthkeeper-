import "server-only"
import { createRemoteJWKSet, jwtVerify } from "jose"

// Verify Firebase ID tokens WITHOUT firebase-admin. Firebase signs ID tokens as
// RS256 JWTs, so we validate the signature against Google's published public
// keys and confirm the issuer/audience match this Firebase project. This keeps
// the compute endpoints authenticated (so anonymous callers can't burn Gemini /
// Filecoin credits) while avoiding firebase-admin's Node-22-only gRPC runtime,
// which fails to load in Vercel's serverless environment.

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || ""

// Google's JWKS for Firebase secure tokens. createRemoteJWKSet caches the keys
// and refetches automatically on rotation, so this is a safe module singleton.
const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
)

export interface AuthUser {
  uid: string
  email: string | null
  name: string | null
}

/**
 * Verify a Firebase ID token and return the user, or null if the token is
 * missing/invalid or the project isn't configured. Never throws.
 */
export async function verifyIdToken(token: string | null | undefined): Promise<AuthUser | null> {
  if (!token || !PROJECT_ID) return null
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
      algorithms: ["RS256"],
    })
    const uid = typeof payload.sub === "string" ? payload.sub : ""
    if (!uid) return null
    return {
      uid,
      email: (payload.email as string) ?? null,
      name: (payload.name as string) ?? null,
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
