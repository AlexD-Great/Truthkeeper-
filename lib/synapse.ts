import "server-only"
import { http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { Synapse, calibration } from "@filoz/synapse-sdk"
import type { ProofPackage } from "./types"

let synapsePromise: Promise<Synapse> | null = null

function normalizeKey(key: string): `0x${string}` {
  const k = key.trim()
  return (k.startsWith("0x") ? k : `0x${k}`) as `0x${string}`
}

/** Lazily create a single Synapse instance bound to the server wallet. */
export function getSynapse(): Promise<Synapse> {
  if (!synapsePromise) {
    const pk = process.env.FILECOIN_PRIVATE_KEY
    if (!pk) {
      throw new Error("FILECOIN_PRIVATE_KEY is not set. Add it to .env.local (see SETUP.md).")
    }
    const account = privateKeyToAccount(normalizeKey(pk))
    // create() is synchronous but we keep a promise for a single cached init.
    synapsePromise = Promise.resolve(
      Synapse.create({
        account,
        chain: calibration,
        transport: http(),
        source: "truthkeeper",
      }),
    )
  }
  return synapsePromise
}

export interface StoreProofResult {
  cid: string
  size: number
}

/**
 * Upload a proof package to Filecoin (Calibration testnet) via Synapse Warm
 * Storage and return its PieceCID.
 */
export async function storeProof(pkg: ProofPackage): Promise<StoreProofResult> {
  const synapse = await getSynapse()
  const bytes = new TextEncoder().encode(JSON.stringify(pkg, null, 2))

  const result = await synapse.storage.upload(bytes)

  return { cid: result.pieceCid.toString(), size: result.size }
}

/**
 * Retrieve a previously stored proof package from Filecoin by its PieceCID.
 * Returns null if the CID is not a valid/retrievable TruthKeeper proof.
 */
export async function retrieveProof(cid: string): Promise<ProofPackage | null> {
  const synapse = await getSynapse()
  const bytes = await synapse.storage.download({ pieceCid: cid })
  const text = new TextDecoder().decode(bytes)
  try {
    const parsed = JSON.parse(text)
    if (parsed && parsed.app === "TruthKeeper") return parsed as ProofPackage
    return null
  } catch {
    return null
  }
}
