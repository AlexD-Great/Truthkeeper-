import "server-only"

const MAX_CHARS = 20000

export function looksLikeUrl(input: string): boolean {
  const trimmed = input.trim()
  if (/\s/.test(trimmed)) return false
  return /^https?:\/\/[^\s]+\.[^\s]+/i.test(trimmed)
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

/** Strip HTML down to readable text and pull out a title. */
function htmlToText(html: string): { text: string; title: string | null } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const ogTitle = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
  )
  const title = decodeEntities(
    (ogTitle?.[1] || titleMatch?.[1] || "").trim(),
  ) || null

  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|br|li|h[1-6]|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")

  const text = decodeEntities(body)
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n\s*\n\s*/g, "\n\n")
    .trim()

  return { text, title }
}

export interface ExtractedArticle {
  text: string
  title: string | null
  url: string | null
  /** Whether we managed to scrape usable text ourselves. */
  scraped: boolean
}

/** Best-effort scrape of a URL. Never throws — returns empty text on failure. */
async function scrapeUrl(url: string): Promise<{ text: string; title: string | null }> {
  try {
    const res = await fetch(url, {
      headers: {
        // Present as a normal browser; many outlets block obvious bots.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return { text: "", title: null }
    const html = await res.text()
    return htmlToText(html)
  } catch {
    return { text: "", title: null }
  }
}

/**
 * Given raw user input (article text OR a URL), return what we can for the
 * fact-check. For URLs we try to scrape the readable content, but we never fail
 * here — Gemini's URL-context tool reads the link directly, so a thin or blocked
 * scrape still produces a verdict.
 */
export async function extractArticle(input: string): Promise<ExtractedArticle> {
  const trimmed = input.trim()

  if (!looksLikeUrl(trimmed)) {
    return { text: trimmed.slice(0, MAX_CHARS), title: null, url: null, scraped: true }
  }

  const { text, title } = await scrapeUrl(trimmed)
  const scraped = text.length >= 200
  return {
    text: scraped ? text.slice(0, MAX_CHARS) : "",
    title,
    url: trimmed,
    scraped,
  }
}
