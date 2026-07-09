import { NextResponse } from "next/server"
import { retrieveProof } from "@/lib/synapse"
import { getProofRecord } from "@/lib/firebase-admin"

export const runtime = "nodejs"
export const maxDuration = 120

// GET /api/proof/:cid  → the immutable proof package fetched from Filecoin.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cid: string }> },
) {
  const { cid } = await params
  if (!cid) {
    return NextResponse.json({ error: "Missing CID." }, { status: 400 })
  }

  try {
    const pkg = await retrieveProof(cid)
    if (!pkg) {
      return NextResponse.json(
        { error: "No TruthKeeper proof found for that CID." },
        { status: 404 },
      )
    }
    // Attach lightweight record metadata (e.g. storedAt) if we have it.
    const record = await getProofRecord(cid).catch(() => null)
    return NextResponse.json({
      cid,
      verifiedOnFilecoin: true,
      package: pkg,
      storedAt: record?.storedAt ?? null,
    })
  } catch (err: any) {
    console.error("[/api/proof]", err)
    return NextResponse.json(
      { error: err?.message || "Could not retrieve this proof from Filecoin." },
      { status: 502 },
    )
  }
}
