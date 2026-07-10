import {
  UserCheck,
  FileText,
  Sparkles,
  HardDrive,
  Fingerprint,
  Database,
  Globe,
  Lock,
  Clock,
  ShieldCheck,
  ChevronDown,
  CornerDownRight,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Stage {
  n: string
  zone: string
  zoneColor: string
  icon: LucideIcon
  title: string
  desc: string
  tag: string
}

const stages: Stage[] = [
  {
    n: "01",
    zone: "Auth",
    zoneColor: "text-amber-400",
    icon: UserCheck,
    title: "Sign in with Google",
    desc: "Firebase Authentication gates the app. Your identity becomes the key to a private, per-user verification history.",
    tag: "Firebase Auth",
  },
  {
    n: "02",
    zone: "Client",
    zoneColor: "text-sky-400",
    icon: FileText,
    title: "Submit an article",
    desc: "Paste raw text or a news URL. The Next.js client sends it to the API with your signed Firebase ID token attached.",
    tag: "Next.js 15 · React 19",
  },
  {
    n: "03",
    zone: "AI Agent",
    zoneColor: "text-violet-400",
    icon: Sparkles,
    title: "AI fact-check",
    desc: "/api/check verifies your token, then Google Gemini — grounded with live Google Search & URL context — returns REAL / FAKE / UNSURE with a confidence score and real sources.",
    tag: "Gemini 2.5 Flash",
  },
  {
    n: "04",
    zone: "Filecoin",
    zoneColor: "text-red-400",
    icon: HardDrive,
    title: "Store the proof",
    desc: "/api/store packages the article, verdict, sources & timestamp, and the Synapse SDK uploads it to Filecoin Warm Storage with Proof of Data Possession.",
    tag: "Synapse SDK",
  },
  {
    n: "05",
    zone: "Filecoin",
    zoneColor: "text-red-400",
    icon: Fingerprint,
    title: "Return a PieceCID",
    desc: "Filecoin returns a content-addressed PieceCID — a cryptographic fingerprint of the exact bytes. That CID is your permanent, shareable proof link.",
    tag: "PieceCID",
  },
]

const outcomes: Stage[] = [
  {
    n: "",
    zone: "Database",
    zoneColor: "text-emerald-400",
    icon: Database,
    title: "Saved to your history",
    desc: "A record is written to Firestore straight from your browser — visible only to you, enforced by security rules. No server round-trip.",
    tag: "Firestore (client SDK)",
  },
  {
    n: "",
    zone: "Public",
    zoneColor: "text-sky-400",
    icon: Globe,
    title: "Publicly verifiable",
    desc: "Anyone opens /proof/<cid>; the package is fetched straight back from Filecoin and shown with a “Verified on Filecoin” badge — no account needed.",
    tag: "/proof/[cid]",
  },
]

const guarantees = [
  { icon: Lock, label: "Immutable" },
  { icon: Clock, label: "Timestamped" },
  { icon: ShieldCheck, label: "Verifiable" },
]

const stack = [
  "Next.js 15",
  "React 19",
  "Gemini 2.5 Flash",
  "Synapse SDK",
  "Filecoin · Calibration",
  "Firebase",
]

function NodeCard({ s, index }: { s: Stage; index: number }) {
  const Icon = s.icon
  return (
    <div
      className="glow-border slide-up mx-auto flex w-full max-w-2xl gap-5 rounded-2xl bg-card p-5 sm:p-6"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="node-pulse flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10">
          <Icon className={cn("h-6 w-6", s.zoneColor)} />
        </div>
        {s.n && <span className="font-orbitron text-xs text-muted-foreground">{s.n}</span>}
      </div>
      <div className="min-w-0">
        <span className={cn("font-orbitron text-[11px] font-bold uppercase tracking-[0.2em]", s.zoneColor)}>
          {s.zone}
        </span>
        <h3 className="mt-0.5 font-orbitron text-lg font-bold text-foreground">{s.title}</h3>
        <p className="mt-1.5 font-geist text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
        <span className="mt-3 inline-block rounded-full border border-red-500/20 bg-background px-2.5 py-0.5 font-geist text-xs text-red-400">
          {s.tag}
        </span>
      </div>
    </div>
  )
}

function Connector() {
  return (
    <div className="flex flex-col items-center py-1.5" aria-hidden="true">
      <div className="relative h-12 w-[3px] overflow-hidden rounded-full bg-red-500/10">
        <div className="absolute inset-0 diagram-flow" />
      </div>
      <ChevronDown className="-mt-1.5 h-4 w-4 text-red-500/70" />
    </div>
  )
}

export function ArchitectureDiagram() {
  return (
    <div className="relative">
      {/* Main pipeline */}
      <div className="flex flex-col items-stretch">
        {stages.map((s, i) => (
          <div key={s.n} className="w-full">
            <NodeCard s={s} index={i} />
            {i < stages.length - 1 && <Connector />}
          </div>
        ))}
      </div>

      {/* Fan-out to the two outcomes */}
      <Connector />
      <p className="mb-4 text-center font-orbitron text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        The proof now lives two places
      </p>
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {outcomes.map((o, i) => {
          const Icon = o.icon
          return (
            <div
              key={i}
              className="slide-up rounded-2xl border border-border bg-card p-5"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-2">
                <CornerDownRight className={cn("h-4 w-4", o.zoneColor)} />
                <Icon className={cn("h-5 w-5", o.zoneColor)} />
                <span className={cn("font-orbitron text-[11px] font-bold uppercase tracking-[0.2em]", o.zoneColor)}>
                  {o.zone}
                </span>
              </div>
              <h3 className="mt-3 font-orbitron text-base font-bold text-foreground">{o.title}</h3>
              <p className="mt-1.5 font-geist text-sm leading-relaxed text-muted-foreground">{o.desc}</p>
              <span className="mt-3 inline-block rounded-full border border-red-500/20 bg-background px-2.5 py-0.5 font-geist text-xs text-red-400">
                {o.tag}
              </span>
            </div>
          )
        })}
      </div>

      {/* Guarantees */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {guarantees.map((g) => {
          const Icon = g.icon
          return (
            <div
              key={g.label}
              className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-1.5"
            >
              <Icon className="h-4 w-4 text-emerald-400" />
              <span className="font-orbitron text-xs font-bold tracking-wider text-emerald-300">{g.label}</span>
            </div>
          )
        })}
      </div>

      {/* Tech stack strip */}
      <div className="mt-10 rounded-2xl border border-border bg-card/50 p-5 text-center">
        <p className="font-orbitron text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Built with
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {stack.map((t) => (
            <span
              key={t}
              className="rounded-md border border-red-500/20 bg-background px-3 py-1 font-geist text-xs text-foreground/80"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
