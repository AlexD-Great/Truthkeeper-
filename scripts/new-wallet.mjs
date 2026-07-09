// Generate a fresh throwaway wallet for the Filecoin Calibration testnet.
//   node scripts/new-wallet.mjs
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

const privateKey = generatePrivateKey()
const account = privateKeyToAccount(privateKey)

console.log("\n🔑  New Filecoin (Calibration testnet) wallet\n")
console.log("Address:      ", account.address)
console.log("Private key:  ", privateKey)
console.log("\nNext steps:")
console.log("  1. Put the private key in .env.local as FILECOIN_PRIVATE_KEY")
console.log("  2. Fund the ADDRESS above with test tokens:")
console.log("       tFIL  →  https://faucet.calibnet.chainsafe-fil.io/funds.html")
console.log("       USDFC →  faucet: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc")
console.log("                or mint against tFIL at https://stg.usdfc.net (Trove page)")
console.log("  3. Run:  node --env-file=.env.local scripts/setup-payments.mjs")
console.log("\n⚠️  Testnet only. Never reuse this key or fund it with real value.\n")
