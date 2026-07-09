// One-time Filecoin payment setup for TruthKeeper (Calibration testnet).
//
// Deposits USDFC into the Filecoin Payments contract and approves the Warm
// Storage service to draw from it, so the app can create storage deals.
//
// Run:  node --env-file=.env.local scripts/setup-payments.mjs
//
// Optional overrides (env):
//   DEPOSIT_USDFC   amount of USDFC to deposit           (default 5)
//   RATE_USDFC      per-epoch rate allowance for storage (default 5)
//   LOCKUP_USDFC    lockup allowance                     (default 50)

import { http, formatUnits, parseUnits } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { Synapse, calibration } from "@filoz/synapse-sdk"

const pk = process.env.FILECOIN_PRIVATE_KEY
if (!pk) {
  console.error("❌  FILECOIN_PRIVATE_KEY is not set. Run with: node --env-file=.env.local scripts/setup-payments.mjs")
  process.exit(1)
}

const DECIMALS = 18
const depositAmount = parseUnits(process.env.DEPOSIT_USDFC || "5", DECIMALS)
const rateAllowance = parseUnits(process.env.RATE_USDFC || "5", DECIMALS)
const lockupAllowance = parseUnits(process.env.LOCKUP_USDFC || "50", DECIMALS)
const maxLockupPeriod = 86_400n // ~30 days of epochs on Filecoin (30s/epoch)

const fmt = (v) => `${formatUnits(v, DECIMALS)} USDFC`

async function main() {
  const key = pk.startsWith("0x") ? pk : `0x${pk}`
  const account = privateKeyToAccount(key)
  const synapse = Synapse.create({
    account,
    chain: calibration,
    transport: http(),
    source: "truthkeeper-setup",
  })

  console.log("\n🔧  TruthKeeper — Filecoin payment setup")
  console.log("Wallet:", account.address)

  // 1. Balances
  const tfil = await synapse.payments.walletBalance()
  const usdfcWallet = await synapse.payments.walletBalance({ token: "USDFC" })
  console.log("\nBalances:")
  console.log("  tFIL (gas):    ", formatUnits(tfil, 18))
  console.log("  USDFC (wallet):", formatUnits(usdfcWallet, DECIMALS))

  if (tfil === 0n) {
    console.error("\n❌  No tFIL for gas. Fund the wallet: https://faucet.calibnet.chainsafe-fil.io/funds.html")
    process.exit(1)
  }
  if (usdfcWallet < depositAmount) {
    console.error(`\n❌  Not enough USDFC to deposit ${fmt(depositAmount)}.`)
    console.error("   Get USDFC either way:")
    console.error("     • faucet: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc")
    console.error("     • mint against tFIL collateral: https://stg.usdfc.net (Trove page)")
    console.error(`   Tip: you can also lower the deposit, e.g. DEPOSIT_USDFC=1 pnpm setup:payments`)
    process.exit(1)
  }

  // 2. Deposit USDFC into the Payments contract
  console.log(`\n➡️  Depositing ${fmt(depositAmount)} into the Payments contract…`)
  const depositTx = await synapse.payments.deposit({
    amount: depositAmount,
    token: "USDFC",
    onAllowanceCheck: (cur, req) =>
      console.log(`   ERC-20 allowance: have ${fmt(cur)}, need ${fmt(req)}`),
    onApprovalTransaction: (tx) => console.log("   ERC-20 approval tx:", tx),
    onDepositStarting: () => console.log("   Sending deposit…"),
  })
  console.log("   Deposit tx:", depositTx)

  const deposited = await synapse.payments.balance({ token: "USDFC" })
  console.log("   Payments balance now:", fmt(deposited))

  // 3. Approve the Warm Storage service as a spending operator
  console.log("\n➡️  Approving the Warm Storage service…")
  console.log(`   rate=${fmt(rateAllowance)}/epoch  lockup=${fmt(lockupAllowance)}  maxLockupPeriod=${maxLockupPeriod} epochs`)
  const approveTx = await synapse.payments.approveService({
    rateAllowance,
    lockupAllowance,
    maxLockupPeriod,
    token: "USDFC",
  })
  console.log("   Approval tx:", approveTx)

  console.log("\n✅  Payment setup complete. You can now store proofs from the app.\n")
}

main().catch((err) => {
  console.error("\n❌  Setup failed:", err?.message || err)
  process.exit(1)
})
