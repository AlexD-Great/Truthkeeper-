import { NextResponse } from "next/server"
import { extractArticle, looksLikeUrl } from "@/lib/article"
import { factCheck } from "@/lib/gemini"
import { getUserFromRequest } from "@/lib/auth"

export const runtime = "nodejs"
export const maxDuration = 120

// POST /api/check  { input: string }   (requires a Firebase ID token)
// Fact-checks an article or a URL and returns a verdict. Stores nothing yet.
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Please sign in to check articles." }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const input = typeof body.input === "string" ? body.input.trim() : ""

    const isUrl = looksLikeUrl(input)
    // A pasted article needs some substance; a URL just needs to be a valid link.
    if (!isUrl && input.length < 15) {
      return NextResponse.json(
        { error: "Please paste an article, or a link to one (https://...), to check." },
        { status: 400 },
      )
    }

    const article = await extractArticle(input)
    const result = await factCheck({
      text: article.text,
      url: article.url,
      title: article.title,
    })

    // Prefer a title scraped from the page if the model didn't supply one.
    if (!result.articleTitle && article.title) result.articleTitle = article.title

    return NextResponse.json(result)
  } catch (err: any) {
    console.error("[/api/check]", err)
    return NextResponse.json(
      { error: err?.message || "Fact-check failed. Please try again." },
      { status: 500 },
    )
  }
}
