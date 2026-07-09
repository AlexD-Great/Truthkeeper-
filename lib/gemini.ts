import "server-only"
import { GoogleGenAI, Type } from "@google/genai"
import type { FactCheckResult, Source, Verdict } from "./types"

const MODEL = "gemini-2.5-flash"

let client: GoogleGenAI | null = null
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it to .env.local (see SETUP.md).")
  }
  if (!client) client = new GoogleGenAI({ apiKey })
  return client
}

// --- Step 1: grounded analysis -------------------------------------------------
// Google Search / URL-context grounding CANNOT be combined with JSON mode, so we
// first get a free-form grounded analysis, then structure it in a second call.

const ANALYSIS_INSTRUCTION = `You are TruthKeeper, a rigorous, non-partisan news fact-checker.
You are given the text of a news article or claim, or a URL to one. If given a
URL, first try to read the article at that URL. If you cannot access the page
(paywall, login wall, bot-blocked, etc.), DO NOT give up: use Google Search to
find the article and other reputable coverage of the same story — search by the
URL, its headline/slug, and the topic — then fact-check the underlying claims
from that coverage. Only answer UNSURE for access reasons if you genuinely cannot
find the story through search either.

Use Google Search to find authoritative, primary sources (reputable news outlets,
official statements, academic or government sources) and assess whether the
central claims are true.

Write a concise analysis that clearly states:
- VERDICT: one of REAL, FAKE, or UNSURE
  - REAL = core claims are accurate and supported by reliable sources
  - FAKE = core claims are false, fabricated, or materially misleading
  - UNSURE = evidence is insufficient, mixed, or the claim is unverifiable
- CONFIDENCE: an integer 0-100 for how confident you are in the verdict
- TITLE: a short, neutral title for the claim/article
- A 2-4 sentence justification citing what the evidence shows.
Be conservative: prefer UNSURE when sources conflict or are thin.`

// --- Step 2: structure into strict JSON ---------------------------------------

const VERDICT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    verdict: { type: Type.STRING, enum: ["REAL", "FAKE", "UNSURE"] },
    confidence_score: { type: Type.INTEGER },
    explanation: { type: Type.STRING },
    title: { type: Type.STRING },
  },
  required: ["verdict", "confidence_score", "explanation", "title"],
}

/** Collect all text from a response, falling back to concatenating parts. */
function responseText(response: any): string {
  if (typeof response?.text === "string" && response.text.trim()) return response.text
  const parts = response?.candidates?.[0]?.content?.parts ?? []
  return parts.map((p: any) => p?.text || "").join("").trim()
}

/** Pull grounding citations out of the Gemini response metadata. */
function extractSources(response: any): Source[] {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
  const seen = new Set<string>()
  const sources: Source[] = []
  for (const chunk of chunks) {
    const web = chunk?.web
    if (!web?.uri) continue
    if (seen.has(web.uri)) continue
    seen.add(web.uri)
    sources.push({ title: web.title || web.uri, url: web.uri })
  }
  return sources
}

interface StructuredVerdict {
  verdict: Verdict
  confidence_score: number
  explanation: string
  title: string | null
}

function normalize(raw: any, fallbackExplanation: string): StructuredVerdict {
  const v = String(raw?.verdict || "").toUpperCase()
  const verdict: Verdict = v === "REAL" || v === "FAKE" ? (v as Verdict) : "UNSURE"

  let score = Number(raw?.confidence_score)
  if (!Number.isFinite(score)) score = 50
  score = Math.max(0, Math.min(100, Math.round(score)))

  const explanation = String(raw?.explanation || fallbackExplanation || "No explanation was provided.").trim()
  const title = raw?.title ? String(raw.title).slice(0, 120) : null
  return { verdict, confidence_score: score, explanation, title }
}

/** Turn the free-form analysis into a strict JSON verdict (no tools, JSON mode). */
async function structureVerdict(ai: GoogleGenAI, analysis: string): Promise<StructuredVerdict> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Extract the fact-check result from this analysis into the required JSON fields.\n\nANALYSIS:\n"""\n${analysis}\n"""`,
    config: {
      responseMimeType: "application/json",
      responseSchema: VERDICT_SCHEMA,
      temperature: 0,
    },
  })

  const text = responseText(response)
  try {
    return normalize(JSON.parse(text), analysis)
  } catch {
    // Last-ditch: pull the first {...} block out of the text.
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return normalize(JSON.parse(match[0]), analysis)
      } catch {
        /* fall through */
      }
    }
    // Never hard-fail the whole check — return UNSURE with the raw analysis.
    return normalize({ verdict: "UNSURE" }, analysis)
  }
}

export interface FactCheckInput {
  /** Extracted/pasted article text. May be empty when only a URL is available. */
  text: string
  /** Source URL, if the user submitted a link. */
  url: string | null
  /** Scraped headline, used as a search hint when the URL can't be opened. */
  title?: string | null
}

/**
 * Run an AI fact-check, grounded in live web search. When a URL is provided the
 * URL-context tool lets Gemini fetch and read the article directly, so links
 * work even when our own scraper is blocked or the text is paywalled/JS-rendered.
 */
export async function factCheck({ text, url, title }: FactCheckInput): Promise<FactCheckResult> {
  const ai = getClient()

  // urlContext lets the model fetch the link itself; googleSearch grounds the
  // verdict and is the fallback when the page can't be opened directly.
  const tools: any[] = url
    ? [{ urlContext: {} }, { googleSearch: {} }]
    : [{ googleSearch: {} }]

  let prompt: string
  if (url) {
    prompt = `Fact-check the news article at this URL:\n${url}`
    if (title) prompt += `\nThe page's headline appears to be: "${title}".`
    if (text && text.length > 200) {
      prompt += `\n\nText extracted from the page (may be partial):\n"""\n${text.slice(0, 20000)}\n"""`
    } else {
      prompt += `\n\nIf you cannot open the URL directly, search for this article and its claims using the headline and topic, and fact-check based on reputable coverage.`
    }
  } else {
    prompt = `Fact-check this article / claim:\n"""\n${text.slice(0, 20000)}\n"""`
  }

  // Step 1 — grounded analysis (with tools).
  const analysisResponse = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: ANALYSIS_INSTRUCTION,
      tools,
      temperature: 0.2,
    },
  })

  const analysis = responseText(analysisResponse)
  const sources = extractSources(analysisResponse)

  if (!analysis) {
    throw new Error("The fact-checker could not analyze this input. Try again or paste the article text.")
  }

  // Step 2 — structure into strict JSON (no tools, JSON schema).
  const structured = await structureVerdict(ai, analysis)

  return {
    articleText: text,
    articleUrl: url,
    articleTitle: structured.title,
    verdict: structured.verdict,
    confidenceScore: structured.confidence_score,
    explanation: structured.explanation,
    sources,
    model: MODEL,
    checkedAt: new Date().toISOString(),
  }
}
