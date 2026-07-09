import { NextResponse } from "next/server"
import { getUserHistory, getUserFromRequest } from "@/lib/firebase-admin"

export const runtime = "nodejs"

// GET /api/history  → the signed-in user's past checks (newest first).
export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: "Please sign in to view your history." }, { status: 401 })
  }

  try {
    const records = await getUserHistory(user.uid)
    return NextResponse.json({ records })
  } catch (err: any) {
    console.error("[/api/history]", err)
    return NextResponse.json(
      { error: err?.message || "Could not load history." },
      { status: 500 },
    )
  }
}
