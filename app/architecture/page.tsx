import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, Home, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArchitectureDiagram } from "@/components/architecture-diagram"

export const metadata: Metadata = {
  title: "How TruthKeeper Works · System Architecture",
  description:
    "A technical walkthrough of TruthKeeper — from Google sign-in and Gemini fact-checking to permanent, verifiable proofs on Filecoin.",
}

export default function ArchitecturePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 pb-28 pt-28">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[820px] max-w-full -translate-x-1/2 rounded-full bg-red-600/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl">
        {/* Nav */}
        <div className="mb-8 flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" /> Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full border border-red-500/40 px-4 py-1 font-orbitron text-xs uppercase tracking-[0.3em] text-red-400">
            The Solution
          </span>
          <h1 className="mt-6 font-orbitron text-4xl font-bold text-foreground sm:text-5xl text-balance">
            How Truth Becomes <span className="text-red-500">Permanent</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-geist text-lg leading-relaxed text-muted-foreground">
            Follow a single claim as it travels from your browser, through an AI agent grounded in
            live sources, onto Filecoin — where it becomes an immutable, timestamped, publicly
            verifiable proof that no one can quietly delete or rewrite.
          </p>
        </div>

        {/* The diagram */}
        <ArchitectureDiagram />

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="font-orbitron text-lg font-bold text-foreground">See it for yourself.</p>
          <Button
            asChild
            size="lg"
            className="gap-2 bg-red-500 px-8 text-lg text-white hover:bg-red-600"
          >
            <Link href="/check">
              <Sparkles className="h-5 w-5" /> Check an Article
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
