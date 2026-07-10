"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Loader2, Inbox, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VerdictBadge } from "@/components/verdict-badge"
import { AuthGate } from "@/components/auth-gate"
import { useAuth } from "@/components/auth-provider"
import { fetchUserHistory } from "@/lib/history"
import type { ProofRecord } from "@/lib/types"

export default function HistoryPage() {
  return (
    <AuthGate>
      <HistoryList />
    </AuthGate>
  )
}

function HistoryList() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<ProofRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      try {
        const data = await fetchUserHistory(user.uid)
        if (active) setRecords(data)
      } catch (e: any) {
        if (active) setError(e.message || "Could not load history.")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [user])

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/check">
              <ArrowLeft className="h-4 w-4" /> Back to Fact-Check
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" /> Home
            </Link>
          </Button>
        </div>

        <h1 className="font-orbitron text-3xl font-bold text-foreground sm:text-4xl">
          Verification <span className="text-red-500">History</span>
        </h1>
        <p className="mt-1 font-geist text-sm text-muted-foreground">
          Your past checks, stored permanently on Filecoin.
        </p>

        <div className="mt-8">
          {loading && (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6 font-geist text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-red-500" /> Loading your history…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 font-geist text-sm text-muted-foreground">
              {error}
            </div>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground" />
              <p className="font-geist text-muted-foreground">No checks yet.</p>
              <Button asChild className="bg-red-500 text-white hover:bg-red-600">
                <Link href="/check">Check an article</Link>
              </Button>
            </div>
          )}

          {!loading && !error && records.length > 0 && (
            <ul className="space-y-3">
              {records.map((r) => (
                <li key={r.cid}>
                  <Link
                    href={`/proof/${r.cid}`}
                    className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-red-500/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <VerdictBadge verdict={r.verdict} size="sm" />
                      <span className="font-geist text-xs text-muted-foreground">
                        {new Date(r.storedAt).toLocaleDateString()} · {r.confidenceScore}%
                      </span>
                    </div>
                    <p className="mt-3 font-geist text-sm font-medium text-foreground">
                      {r.articleTitle || r.articleSnippet || "Untitled check"}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 font-geist text-xs text-red-400">
                      <ExternalLink className="h-3 w-3" /> View proof
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
