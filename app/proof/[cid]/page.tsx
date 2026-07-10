import Link from "next/link"
import { notFound } from "next/navigation"
import { ShieldCheck, ExternalLink, ArrowLeft, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VerdictBadge } from "@/components/verdict-badge"
import { retrieveProof } from "@/lib/synapse"
import type { Metadata } from "next"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cid: string }>
}): Promise<Metadata> {
  const { cid } = await params
  return {
    title: `TruthKeeper Proof · ${cid.slice(0, 12)}…`,
    description: "A permanent, timestamped news-verification proof stored on Filecoin.",
  }
}

export default async function ProofPage({
  params,
}: {
  params: Promise<{ cid: string }>
}) {
  const { cid } = await params

  let pkg = null
  let error: string | null = null
  try {
    pkg = await retrieveProof(cid)
  } catch (e: any) {
    error = e?.message || "Could not retrieve this proof from Filecoin."
  }

  if (!pkg && !error) notFound()

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-28">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
          <Link href="/check">
            <ArrowLeft className="h-4 w-4" /> Check another article
          </Link>
        </Button>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
            <h1 className="font-orbitron text-xl font-bold text-foreground">Proof unavailable</h1>
            <p className="mt-2 font-geist text-sm text-muted-foreground">{error}</p>
            <p className="mt-3 break-all font-geist text-xs text-muted-foreground">
              PieceCID: <code>{cid}</code>
            </p>
          </div>
        )}

        {pkg && (
          <article className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
            {/* Verified banner */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-orbitron text-xs font-bold tracking-wider">
                VERIFIED ON FILECOIN
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <VerdictBadge verdict={pkg.verdict} size="lg" />
              <span className="font-geist text-sm text-muted-foreground">
                Confidence:{" "}
                <span className="font-semibold text-foreground">{pkg.confidence_score}%</span>
              </span>
            </div>

            {pkg.article_title && (
              <h1 className="mt-5 font-orbitron text-2xl font-bold text-foreground">
                {pkg.article_title}
              </h1>
            )}

            {pkg.article_url && (
              <a
                href={pkg.article_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-geist text-sm text-red-400 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="break-all">{pkg.article_url}</span>
              </a>
            )}

            <p className="mt-4 font-geist leading-relaxed text-foreground/90">{pkg.explanation}</p>

            {pkg.sources_used?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-geist text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sources used
                </h2>
                <ul className="mt-2 space-y-1.5">
                  {pkg.sources_used.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-1.5 font-geist text-sm text-red-400 hover:underline"
                      >
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="break-all">{s.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Original article */}
            {pkg.article_text?.trim() && (
            <details className="mt-6 rounded-lg border border-border bg-background p-4">
              <summary className="flex cursor-pointer items-center gap-2 font-geist text-sm font-medium text-foreground">
                <FileText className="h-4 w-4" /> Original article text
              </summary>
              <p className="mt-3 whitespace-pre-wrap font-geist text-sm leading-relaxed text-muted-foreground">
                {pkg.article_text}
              </p>
            </details>
            )}

            {/* Metadata footer */}
            <div className="mt-6 space-y-1.5 border-t border-border pt-5 font-geist text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Verified {new Date(pkg.timestamp).toLocaleString()}
              </p>
              <p>Model: {pkg.model}</p>
              <p className="break-all">PieceCID: <code>{cid}</code></p>
            </div>
          </article>
        )}
      </div>
    </main>
  )
}
