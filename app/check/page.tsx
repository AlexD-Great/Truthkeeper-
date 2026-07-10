"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Loader2,
  ShieldCheck,
  Link2,
  Copy,
  Check,
  ExternalLink,
  History,
  Home,
  Sparkles,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { VerdictBadge } from "@/components/verdict-badge"
import { AuthGate } from "@/components/auth-gate"
import { useAuth } from "@/components/auth-provider"
import { apiFetch } from "@/lib/api"
import { saveProofRecord } from "@/lib/history"
import type { FactCheckResult, ProofRecord } from "@/lib/types"

type Phase = "idle" | "checking" | "checked" | "storing" | "stored"

interface StoreInfo {
  cid: string
  proofUrl: string
  storedAt: string
}

export default function CheckPage() {
  return (
    <AuthGate>
      <CheckApp />
    </AuthGate>
  )
}

function CheckApp() {
  const { getToken } = useAuth()
  const [input, setInput] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")
  const [result, setResult] = useState<FactCheckResult | null>(null)
  const [store, setStore] = useState<StoreInfo | null>(null)
  const [copied, setCopied] = useState(false)

  const busy = phase === "checking" || phase === "storing"

  function reset() {
    setInput("")
    setPhase("idle")
    setResult(null)
    setStore(null)
    setCopied(false)
  }

  async function handleCheck() {
    if (input.trim().length < 15) {
      toast.error("Paste an article or a link with a bit more text.")
      return
    }
    setPhase("checking")
    setResult(null)
    setStore(null)
    try {
      const token = await getToken()
      const data = await apiFetch<FactCheckResult>("/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ input }),
      })
      setResult(data)
      setPhase("checked")
    } catch (e: any) {
      toast.error(e.message || "Something went wrong.")
      setPhase("idle")
    }
  }

  async function handleStore() {
    if (!result) return
    setPhase("storing")
    try {
      const token = await getToken()
      const data = await apiFetch<{
        cid: string
        proofUrl: string
        storedAt: string
        record: ProofRecord
      }>("/api/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ result }),
      })
      setStore({ cid: data.cid, proofUrl: data.proofUrl, storedAt: data.storedAt })
      setPhase("stored")
      toast.success("Proof stored permanently on Filecoin.")

      // Save to the user's history (client-side Firestore). Best-effort: the
      // proof is already on Filecoin, so don't fail the flow if this write does.
      try {
        await saveProofRecord(data.record)
      } catch (e) {
        console.error("history save failed", e)
      }
    } catch (e: any) {
      toast.error(e.message || "Could not store the proof.")
      setPhase("checked")
    }
  }

  async function copyLink() {
    if (!store) return
    await navigator.clipboard.writeText(store.proofUrl)
    setCopied(true)
    toast.success("Proof link copied.")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareText = result
    ? `TruthKeeper verdict: ${result.verdict} — verified & stored on Filecoin.`
    : ""

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-28">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-orbitron text-3xl font-bold text-foreground sm:text-4xl">
              Fact-<span className="text-red-500">Check</span>
            </h1>
            <p className="mt-1 font-geist text-sm text-muted-foreground">
              Verify a news article and store the proof forever on Filecoin.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" /> Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/history">
                <History className="h-4 w-4" /> History
              </Link>
            </Button>
          </div>
        </div>

        {/* Input */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            placeholder="Paste the full article text, or a link to a news article (https://...)"
            className="min-h-[160px] resize-y border-border bg-background font-geist text-foreground"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleCheck}
              disabled={busy}
              className="gap-2 bg-red-500 text-white hover:bg-red-600"
            >
              {phase === "checking" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Verify article
                </>
              )}
            </Button>
            {(result || store) && (
              <Button onClick={reset} variant="ghost" size="sm" className="gap-2" disabled={busy}>
                <RotateCcw className="h-4 w-4" /> New check
              </Button>
            )}
          </div>
        </div>

        {/* Analyzing skeleton */}
        {phase === "checking" && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-6 font-geist text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-red-500" />
            Searching sources and assessing the claim…
          </div>
        )}

        {/* Verdict */}
        {result && phase !== "checking" && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <VerdictBadge verdict={result.verdict} size="lg" />
              <span className="font-geist text-sm text-muted-foreground">
                Confidence: <span className="font-semibold text-foreground">{result.confidenceScore}%</span>
              </span>
            </div>

            {result.articleTitle && (
              <h2 className="mt-4 font-orbitron text-lg font-semibold text-foreground">
                {result.articleTitle}
              </h2>
            )}

            <p className="mt-3 font-geist leading-relaxed text-foreground/90">{result.explanation}</p>

            {result.sources.length > 0 && (
              <div className="mt-5">
                <h3 className="font-geist text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sources used
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {result.sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-1.5 font-geist text-sm text-red-400 hover:text-red-300 hover:underline"
                      >
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="break-all">{s.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 font-geist text-xs text-muted-foreground">
              Verified with {result.model} • {new Date(result.checkedAt).toLocaleString()}
            </p>

            {/* Store step */}
            {!store && (
              <div className="mt-6 border-t border-border pt-5">
                <p className="mb-3 font-geist text-sm text-foreground">
                  Save this verdict to Filecoin so it can never be altered or deleted?
                </p>
                <Button
                  onClick={handleStore}
                  disabled={busy}
                  className="gap-2 bg-red-500 text-white hover:bg-red-600"
                >
                  {phase === "storing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Storing on Filecoin…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" /> Store proof on Filecoin
                    </>
                  )}
                </Button>
                {phase === "storing" && (
                  <p className="mt-2 font-geist text-xs text-muted-foreground">
                    This can take up to a minute on the first upload while the storage deal is created.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Proof result */}
        {store && (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-orbitron font-bold tracking-wide">Stored on Filecoin</span>
            </div>
            <p className="mt-2 font-geist text-sm text-muted-foreground">
              Your permanent, timestamped proof is live. Share the link — anyone can verify it.
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background p-3">
              <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <code className="flex-1 truncate font-geist text-sm text-foreground">{store.proofUrl}</code>
              <Button onClick={copyLink} size="sm" variant="ghost" className="gap-1.5">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <p className="mt-2 break-all font-geist text-xs text-muted-foreground">
              PieceCID: <code>{store.cid}</code>
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href={`/proof/${store.cid}`}>
                  <ExternalLink className="h-4 w-4" /> View proof
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(store.proofUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on X
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
