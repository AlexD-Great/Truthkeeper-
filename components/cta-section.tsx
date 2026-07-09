import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="slide-up">
          <div className="mb-6">
            <span className="border border-red-500/60 text-red-400 text-sm font-geist px-4 py-1.5 rounded-full tracking-widest">
              Built on Filecoin — Cycle 2 Challenge
            </span>
          </div>
          <h2 className="text-5xl font-bold text-foreground mb-6 font-orbitron text-balance">
            Stop Sharing Fake News. Start Sharing Proof.
          </h2>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            TruthKeeper gives every fact-check a permanent home on Filecoin. Verify, store, and share immutable proof that cannot be deleted, altered, or denied.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/check">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 pulse-button text-lg px-8 py-4"
              >
                Check an Article Now
              </Button>
            </a>
            <a href="/history">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4 bg-transparent"
              >
                View Your History
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
