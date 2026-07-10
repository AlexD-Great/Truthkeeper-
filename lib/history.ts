"use client"

import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore"
import { getFirebaseDb } from "./firebase-client"
import type { ProofRecord } from "./types"

const COLLECTION = "proofs"

/**
 * Save a proof record to Firestore from the browser. The document's `userId`
 * is set server-side (from the verified token) and enforced by security rules.
 */
export async function saveProofRecord(record: ProofRecord): Promise<void> {
  const db = getFirebaseDb()
  await setDoc(doc(db, COLLECTION, record.cid), record)
}

/** Fetch the signed-in user's checks, newest first (sorted client-side). */
export async function fetchUserHistory(uid: string, max = 50): Promise<ProofRecord[]> {
  const db = getFirebaseDb()
  const snap = await getDocs(query(collection(db, COLLECTION), where("userId", "==", uid)))
  return snap.docs
    .map((d) => d.data() as ProofRecord)
    .sort((a, b) => (a.storedAt < b.storedAt ? 1 : a.storedAt > b.storedAt ? -1 : 0))
    .slice(0, max)
}
