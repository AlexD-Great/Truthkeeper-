import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "How does TruthKeeper fact-check articles?",
      answer:
        "TruthKeeper uses Google Gemini as its AI agent, grounded with live Google Search so it checks the article against reputable, up-to-date sources rather than stale training data. It returns a verdict (REAL, FAKE, or UNSURE) alongside a confidence score and the specific source links used for the analysis.",
    },
    {
      question: "What does the Filecoin proof contain?",
      answer:
        "Each proof package includes the original article text, the article URL, the verdict and confidence score, the sources used, a UTC timestamp of verification, and the user ID. This entire package is uploaded to Filecoin and assigned a unique Content Identifier (CID).",
    },
    {
      question: "Can the proof be deleted or altered?",
      answer:
        "No. Once data is stored on Filecoin, it is immutable — it cannot be changed or removed by anyone, including TruthKeeper. The CID cryptographically links to the exact stored content.",
    },
    {
      question: "Do I need an account?",
      answer:
        "To verify a proof, no — anyone with the Filecoin proof link (PieceCID) can open it directly and view the complete stored proof: article, verdict, timestamp, and sources. To run your own fact-checks, you sign in with Google (free); that's what keeps your verification history private to you.",
    },
    {
      question: "What does UNSURE mean?",
      answer:
        "UNSURE means the AI could not reach a confident verdict either way. This typically happens with contested claims, ambiguous reporting, or topics requiring expert domain knowledge. The UNSURE verdict still includes sourced context to help you judge for yourself.",
    },
    {
      question: "Is TruthKeeper free to use?",
      answer:
        "The MVP is free. Filecoin storage costs are minimal and absorbed during the current phase. Future pricing will be based on usage volume for high-frequency users such as newsrooms and researchers.",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-orbitron">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-geist">
            Everything you need to know about TruthKeeper, AI fact-checking, and Filecoin proof storage.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-red-500/20 mb-4">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-red-400 font-orbitron px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed px-6 pb-4 font-space-mono">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
