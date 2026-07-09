import { NextResponse } from "next/server"
import { storeProof } from "@/lib/synapse"
import { saveProofRecord, getUserFromRequest } from "@/lib/firebase-admin"
import type { FactCheckResult, ProofPackage, ProofRecord } from "@/lib/types"

export const runtime = "nodejs"
export const maxDuration = 300

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")
}

// POST /api/store  { result: FactCheckResult, userId?: string }
// Commits the fact-check package to Filecoin and records it for history.
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Please sign in to store proofs." }, { status: 401 })
    }
    const userId = user.uid

    const body = await req.json().catch(() => ({}))
    const result = body.result as FactCheckResult | undefined

    if (!result || !result.verdict || typeof result.articleText !== "string") {
      return NextResponse.json({ error: "Missing or invalid fact-check result." }, { status: 400 })
    }

    const pkg: ProofPackage = {
      app: "TruthKeeper",
      version: "1.0",
      article_text: result.articleText,
      article_url: result.articleUrl ?? null,
      article_title: result.articleTitle ?? null,
      verdict: result.verdict,
      confidence_score: result.confidenceScore,
      explanation: result.explanation,
      sources_used: result.sources ?? [],
      model: result.model,
      timestamp: result.checkedAt,
      user_id: userId,
    }

    const { cid } = await storeProof(pkg)
    const proofUrl = `${appUrl()}/proof/${cid}`
    const storedAt = new Date().toISOString()

    const record: ProofRecord = {
      cid,
      proofUrl,
      userId,
      verdict: pkg.verdict,
      confidenceScore: pkg.confidence_score,
      articleTitle: pkg.article_title,
      articleUrl: pkg.article_url,
      articleSnippet: pkg.article_text.slice(0, 240),
      model: pkg.model,
      checkedAt: pkg.timestamp,
      storedAt,
    }

    // History is best-effort — never fail the store because Firestore is down.
    const saved = await saveProofRecord(record).catch((e) => {
      console.error("[/api/store] firestore save failed", e)
      return false
    })

    return NextResponse.json({ cid, proofUrl, storedAt, historySaved: saved })
  } catch (err: any) {
    console.error("[/api/store]", err)
    return NextResponse.json(
      { error: err?.message || "Failed to store proof on Filecoin." },
      { status: 500 },
    )
  }
}
