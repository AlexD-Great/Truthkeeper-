import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Bot, ShieldCheck, HardDrive, Link2, History } from "lucide-react"

const features = [
  {
    title: "Article Submission",
    description: "Paste any news article text or URL directly into TruthKeeper and let the AI do the heavy lifting.",
    icon: FileText,
    badge: "Input",
  },
  {
    title: "AI Fact-Checking",
    description: "Our AI agent analyzes the article for factual accuracy, cross-referencing multiple trusted sources.",
    icon: Bot,
    badge: "AI-Powered",
  },
  {
    title: "Verdict Generation",
    description: "Receive a clear REAL, FAKE, or UNSURE verdict with a confidence score and sourced explanation.",
    icon: ShieldCheck,
    badge: "Transparent",
  },
  {
    title: "Filecoin Storage",
    description: "Every verdict is packaged with the article, timestamp, and sources — then uploaded permanently to Filecoin.",
    icon: HardDrive,
    badge: "Immutable",
  },
  {
    title: "Proof Link",
    description: "Get a unique, shareable Filecoin CID link that anyone can open to verify the stored proof forever.",
    icon: Link2,
    badge: "Shareable",
  },
  {
    title: "Verification History",
    description: "Browse all your past fact-checks and revisit proofs. Every check is timestamped and tamper-proof.",
    icon: History,
    badge: "Permanent",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-orbitron">Core Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to verify news, store the proof, and share unalterable evidence — powered by AI and Filecoin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glow-border hover:shadow-lg transition-all duration-300 slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <feature.icon className="w-8 h-8 text-red-500" />
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground font-orbitron">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
