import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Share2, Archive } from "lucide-react"

const usps = [
  {
    icon: CheckCircle,
    title: "Immutable Proof",
    description: "Once stored on Filecoin, the verdict package cannot be deleted or modified by anyone — including us.",
  },
  {
    icon: Clock,
    title: "Timestamped Evidence",
    description: "Every proof is cryptographically timestamped, so you know exactly when something was verified.",
  },
  {
    icon: Share2,
    title: "Instantly Shareable",
    description: "Share your Filecoin proof link on social media, in court, or in a news comment — no login required to view.",
  },
  {
    icon: Archive,
    title: "Permanent Archive",
    description: "TruthKeeper preserves original news articles for future reference, even if the source takes them down.",
  },
]

export function SafetySection() {
  return (
    <section id="safety" className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text block */}
          <div>
            <h2 className="text-4xl font-bold text-card-foreground mb-6 font-orbitron text-balance">
              Why Your Proof Needs to Be Permanent
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Fact-checkers get silenced. Articles get deleted. Verdicts get buried. TruthKeeper solves this by making every verification record an immutable entry on the Filecoin network — decentralized, tamper-proof, and accessible forever.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Misinformation costs lives and erodes trust. When you can prove something was verified — with a timestamp and cited sources — accountability becomes possible.
            </p>
            <Button className="bg-red-500 hover:bg-red-600 text-white font-geist border-0">
              Check an Article Now
            </Button>
          </div>

          {/* Right: USP cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {usps.map((usp, index) => (
              <Card key={index} className="glow-border slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-5 flex flex-col gap-3">
                  <usp.icon className="w-8 h-8 text-red-500" />
                  <h3 className="font-orbitron font-bold text-card-foreground">{usp.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{usp.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
