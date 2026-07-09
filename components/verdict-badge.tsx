import { CheckCircle2, XCircle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Verdict } from "@/lib/types"

const CONFIG: Record<
  Verdict,
  { label: string; icon: typeof CheckCircle2; classes: string; dot: string }
> = {
  REAL: {
    label: "REAL",
    icon: CheckCircle2,
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  FAKE: {
    label: "FAKE",
    icon: XCircle,
    classes: "bg-red-500/10 text-red-400 border-red-500/30",
    dot: "bg-red-400",
  },
  UNSURE: {
    label: "UNSURE",
    icon: HelpCircle,
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
}

export function VerdictBadge({
  verdict,
  size = "md",
  className,
}: {
  verdict: Verdict
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const cfg = CONFIG[verdict]
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-orbitron font-bold tracking-wider",
        cfg.classes,
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3.5 py-1 text-sm",
        size === "lg" && "px-5 py-2 text-lg",
        className,
      )}
    >
      <Icon className={cn(size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
      {cfg.label}
    </span>
  )
}
