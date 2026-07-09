import { Card, CardContent } from "@/components/ui/card"
import { HardDrive, Globe, Zap, Lock } from "lucide-react"

const filecoinBenefits = [
  {
    icon: HardDrive,
    title: "Permanent Storage",
    description: "Data stored on Filecoin persists indefinitely. No server can go offline, no admin can delete your proof.",
  },
  {
    icon: Lock,
    title: "Immutable Records",
    description: "Once a proof is written to Filecoin, it is mathematically impossible to alter the content without detection.",
  },
  {
    icon: Globe,
    title: "Decentralized Network",
    description: "No single point of failure. Your proof is replicated across the Filecoin storage network worldwide.",
  },
  {
    icon: Zap,
    title: "Instantly Verifiable",
    description: "Anyone with a CID link can independently verify the stored proof — no TruthKeeper account required.",
  },
]

const tools = [
  { name: "Lighthouse", purpose: "Simple Filecoin uploads via SDK" },
  { name: "Estuary", purpose: "Filecoin storage gateway" },
  { name: "web3.storage", purpose: "Filecoin-compatible storage" },
  { name: "FVM", purpose: "Optional smart contract layer" },
]

export function TechnologySection() {
  return (
    <section id="filecoin" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-orbitron">Why Filecoin?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Centralized servers delete. Filecoin does not. TruthKeeper builds on decentralized storage so your verification proof outlasts any website, company, or political pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {filecoinBenefits.map((benefit, index) => (
            <Card key={index} className="glow-border slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6 flex gap-5">
                <benefit.icon className="w-10 h-10 text-red-500 shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-card-foreground font-orbitron mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border border-red-500/20 rounded-xl p-8 bg-card">
          <h3 className="text-2xl font-bold text-foreground font-orbitron mb-6 text-center">Filecoin Tools We Use</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 border border-red-500/20 rounded-lg p-4 bg-background hover:border-red-500/50 transition-colors duration-200"
              >
                <span className="text-red-400 font-orbitron font-bold text-sm">{tool.name}</span>
                <span className="text-muted-foreground text-sm leading-relaxed">{tool.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
