// Shared domain types for TruthKeeper.

export type Verdict = "REAL" | "FAKE" | "UNSURE"

export interface Source {
  title: string
  url: string
}

/** Result of the AI fact-check, before it is committed to Filecoin. */
export interface FactCheckResult {
  articleText: string
  articleUrl: string | null
  articleTitle: string | null
  verdict: Verdict
  confidenceScore: number // 0-100
  explanation: string
  sources: Source[]
  model: string
  checkedAt: string // ISO 8601
}

/**
 * The immutable package stored on Filecoin. Uses snake_case keys to match the
 * proof schema documented in the TruthKeeper spec.
 */
export interface ProofPackage {
  app: "TruthKeeper"
  version: string
  article_text: string
  article_url: string | null
  article_title: string | null
  verdict: Verdict
  confidence_score: number
  explanation: string
  sources_used: Source[]
  model: string
  timestamp: string
  user_id: string | null
}

/** A record of a stored proof, kept in Firestore for history/lookup. */
export interface ProofRecord {
  cid: string
  proofUrl: string
  userId: string | null
  verdict: Verdict
  confidenceScore: number
  articleTitle: string | null
  articleUrl: string | null
  articleSnippet: string
  model: string
  checkedAt: string
  storedAt: string
}
