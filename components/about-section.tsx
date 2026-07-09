import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, XCircle, Clock } from "lucide-react"

const problems = [
  {
    icon: AlertTriangle,
    title: "Fake news spreads fast",
    description: "Misinformation costs lives and money, spreading faster than any correction can travel.",
  },
  {
    icon: Trash2,
    title: "Fact-checks get deleted",
    description: "Articles disappear. Verdicts get buried. There is no permanent record of what was verified.",
  },
  {
    icon: XCircle,
    title: "No proof of verification",
    description: "Anyone can claim they checked something. Without a tamper-proof record, it means nothing.",
  },
  {
    icon: Clock,
    title: "No timestamp accountability",
    description: "When exactly was something verified? Without a timestamp, context and credibility collapse.",
  },
]

export function AboutSection() {
  return (
    <section className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: problem list */}
          <div className="space-y-6">
            {problems.map((problem, index) => (
              <div key={index} className="flex gap-5 items-start slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="shrink-0 w-10 h-10 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center justify-center">
                  <problem.icon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-white mb-1">{problem.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{problem.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: solution text */}
          <div>
            <span className="text-xs font-orbitron text-red-400 tracking-widest uppercase border border-red-500/40 px-3 py-1 rounded-full">
              The Problem
            </span>
            <h2 className="text-4xl font-bold text-white mt-6 mb-6 font-orbitron text-balance">
              The Internet Has a Truth Problem
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Misinformation travels six times faster than truth. Fact-checkers work hard — but their verdicts live on deletable servers, get buried in search results, and carry no cryptographic proof of when or how they were produced.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              TruthKeeper fixes this by creating a permanent, immutable record of every verification on Filecoin — so the proof outlasts any article, any platform, and any attempt to rewrite history.
            </p>
            <Button className="bg-red-500 hover:bg-red-600 text-white font-geist border-0">
              See the Solution
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
