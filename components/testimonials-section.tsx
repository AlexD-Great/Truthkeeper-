import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Investigative Journalist",
    avatar: "/professional-woman-scientist.png",
    verdict: "FAKE",
    content:
      "TruthKeeper flagged a viral health article as FAKE with 94% confidence and gave me the Filecoin proof link in seconds. I shared it on Twitter and it stopped the spread.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Fact-Checking Researcher",
    avatar: "/cybersecurity-expert-man.jpg",
    verdict: "REAL",
    content:
      "The permanent Filecoin storage is the feature no other fact-checker has. I can cite a TruthKeeper proof link in my research and know it will still be accessible in 20 years.",
  },
  {
    name: "Dr. Yuki Tanaka",
    role: "Digital Media Analyst",
    avatar: "/asian-woman-tech-developer.jpg",
    verdict: "UNSURE",
    content:
      "Even the UNSURE verdicts are incredibly valuable — they surface contested claims with sourced context. That transparency is what sets TruthKeeper apart.",
  },
]

const verdictColors: Record<string, string> = {
  FAKE: "bg-red-500/20 text-red-400 border-red-500/40",
  REAL: "bg-green-500/20 text-green-400 border-green-500/40",
  UNSURE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
}

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-card-foreground mb-4 font-orbitron">Trusted by Truth-Seekers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Journalists, researchers, and analysts rely on TruthKeeper&apos;s permanent proofs to back their work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glow-border slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className={`text-xs font-orbitron font-bold px-3 py-1 rounded-full border ${verdictColors[testimonial.verdict]}`}>
                    Verdict: {testimonial.verdict}
                  </span>
                </div>
                <p className="text-card-foreground mb-6 leading-relaxed italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
