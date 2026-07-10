# TruthKeeper — Verifiable News Fact-Checker

> **Check the news. Store the proof. Forever on Filecoin.**

TruthKeeper is an AI-powered fact-checker that verifies news articles and
permanently stores the article, verdict, and timestamp on **Filecoin**. Every
check produces a shareable proof link that **cannot be altered or deleted** —
anyone can open it and re-verify the record straight from Filecoin.

Built for **Filecoin**.

- **AI agent** — Google Gemini fact-checks the article, grounded in live web search.
- **Filecoin integration** — proofs are stored via the Synapse SDK (Calibration testnet).
- **Filecoin as experience** — users get and share a public, verifiable proof link.

---

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [The proof package](#the-proof-package)
- [Data model](#data-model)
- [Deployment notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## Features

| Feature | Description |
| --- | --- |
| **Google sign-in** | The fact-checker is gated behind Firebase Auth (Google). Each user gets a private history. |
| **Article submission** | Paste raw article text **or** a URL. Links are read by Gemini's URL-context tool (with a scraper fallback). |
| **AI fact-checking** | Gemini 2.5 Flash grounded with Google Search returns a verdict + confidence + explanation + real sources. |
| **Verdict generation** | `REAL` / `FAKE` / `UNSURE` with a 0–100 confidence score. |
| **Filecoin storage** | The article + verdict + timestamp is uploaded to Filecoin (Synapse Warm Storage). |
| **Proof link** | A public `/proof/<cid>` page fetches the package **back from Filecoin** and shows a "Verified on Filecoin" badge. |
| **Verification history** | Per-user history in Firestore, keyed to the Firebase `uid`. |
| **Shareable** | Copy link + one-click share to X. Public proof links work for anyone, signed in or not. |

---

## How it works

```
[1. User]  signs in with Google, pastes an article or a link
    ↓
[2. /api/check]  verifies the ID token → extracts text (or reads the URL)
    ↓
[3. Gemini]  grounded analysis (Google Search + URL context)  →  verdict + sources
    ↓
[4. /api/check]  second Gemini call structures it into strict JSON  →  returned to the UI
    ↓
[5. User]  reviews the verdict, clicks "Store proof on Filecoin"
    ↓
[6. /api/store]  packages { article, verdict, confidence, sources, timestamp, user_id }
    ↓
[7. Synapse SDK]  uploads to Filecoin (Calibration)  →  returns a PieceCID
    ↓
[8. Firestore]  saves a history record keyed to the user's uid
    ↓
[9. User]  gets a shareable link:  /proof/<cid>
    ↓
[10. Anyone]  opens the link → /api/proof/<cid> fetches it back from Filecoin → verified
```

> **Why two Gemini calls?** Google Search / URL-context grounding cannot be
> combined with JSON output mode in a single request. So step 3 gets a grounded
> analysis (with tools), and step 4 restructures it into strict JSON (no tools).
> This makes link-checking and parsing reliable.

---

## Tech stack

- **Framework:** Next.js 15 (App Router) + React 19, TypeScript
- **UI:** Tailwind CSS v4, shadcn/ui, Framer Motion, react-three-fiber (landing hero)
- **AI:** Google Gemini (`@google/genai`, model `gemini-2.5-flash`) with Google Search + URL context
- **Storage:** Filecoin via the Synapse SDK (`@filoz/synapse-sdk`) + viem, on the Calibration testnet
- **Auth + DB:** Firebase Authentication (Google) + Cloud Firestore (via `firebase` and `firebase-admin`)

---

## Architecture

- **Server-only libs** (`lib/gemini.ts`, `lib/synapse.ts`, `lib/firebase-admin.ts`,
  `lib/article.ts`) run in the Node runtime inside API routes — secrets never reach
  the browser.
- **API routes** are thin: authenticate, call a lib, return JSON.
  - `POST /api/check` — auth required. Fact-check only (no storage).
  - `POST /api/store` — auth required. Uploads the proof to Filecoin + saves history.
  - `GET  /api/history` — auth required. The signed-in user's records.
  - `GET  /api/proof/[cid]` — **public**. Fetches a proof back from Filecoin.
- **Auth flow:** the client signs in with Google (Firebase), attaches
  `Authorization: Bearer <idToken>` to each request, and the server verifies it
  with the Admin SDK. History is keyed to the verified `uid` (not client input).
- **Client** (`components/auth-provider.tsx`, `components/auth-gate.tsx`) gates
  `/check` and `/history`; the marketing landing page and proof pages stay public.

---

## Project structure

```
app/
  page.tsx                 Landing page (marketing)
  check/page.tsx           Fact-check app (gated)
  history/page.tsx         Per-user history (gated)
  proof/[cid]/page.tsx     Public proof viewer (SSR, reads Filecoin)
  api/
    check/route.ts         Fact-check (Gemini)         — auth required
    store/route.ts         Store proof (Synapse) + save — auth required
    history/route.ts       List user's records         — auth required
    proof/[cid]/route.ts   Fetch proof from Filecoin   — public
lib/
  gemini.ts                Two-step grounded fact-check → strict JSON
  synapse.ts               Filecoin upload/download (Synapse SDK + viem)
  article.ts               URL detection + best-effort scraping
  firebase-admin.ts        Firestore + ID-token verification (server)
  firebase-client.ts       Firebase Web SDK init (client)
  types.ts                 Shared domain types
components/
  auth-provider.tsx        Auth context (user, sign in/out, token)
  auth-gate.tsx            Sign-in wall for gated pages
  verdict-badge.tsx        REAL/FAKE/UNSURE badge
  navbar.tsx               Nav + sign-in/out
scripts/
  new-wallet.mjs           Generate a Calibration testnet wallet
  setup-payments.mjs       One-time USDFC deposit + Warm Storage approval
SETUP.md                   Step-by-step setup guide
```

---

## Getting started

> The condensed version is below; **[SETUP.md](SETUP.md) has the full walkthrough**
> (wallet creation, faucets, Firebase console steps).

### Prerequisites

- Node.js **20.6+** (needs `--env-file`) and `pnpm`
- A Google **Gemini** API key
- A **Firebase** project (Firestore + Google sign-in)

### 1. Install

```bash
pnpm install
cp .env.example .env.local
```

### 2. Gemini

Get a key at <https://aistudio.google.com/apikey> and set `GEMINI_API_KEY`.

### 3. Filecoin wallet (Calibration testnet)

```bash
pnpm wallet            # prints an address + private key → put the key in .env.local
# fund the address:
#   tFIL  → https://faucet.calibnet.chainsafe-fil.io/funds.html
#   USDFC → https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc
#           (or mint against tFIL at https://stg.usdfc.net — see SETUP.md)
pnpm setup:payments    # one-time: deposit USDFC + approve Warm Storage
```

### 4. Firebase (auth + history)

- Create a Firestore database.
- **Authentication → Sign-in method → Google → enable.**
- Add **Admin** creds (`FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY`) from a
  service-account key.
- Add **Web** config (`NEXT_PUBLIC_FIREBASE_*`) from your Firebase web app.

### 5. Run

```bash
pnpm dev
```

- Landing: <http://localhost:3000>
- Fact-check: <http://localhost:3000/check>
- History: <http://localhost:3000/history>

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | ✅ | AI fact-checking |
| `FILECOIN_PRIVATE_KEY` | ✅ | Signs Filecoin storage/payment transactions |
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL used to build proof links |
| `FIREBASE_PROJECT_ID` | ✅ | Admin SDK (token verification + Firestore) |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Admin SDK service account |
| `FIREBASE_PRIVATE_KEY` | ✅ | Admin SDK service account (keep `\n` escapes) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase Web (Google sign-in) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Web |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase Web |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase Web |

`.env.local` is git-ignored. Never commit private keys — use a throwaway testnet
wallet only.

---

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Lint |
| `pnpm wallet` | Generate a fresh Calibration testnet wallet |
| `pnpm setup:payments` | One-time Filecoin payment setup (USDFC deposit + Warm Storage approval) |

---

## The proof package

This is the immutable JSON stored on Filecoin for each check. It is content-
addressed by its **PieceCID**, so any change would produce a different CID.

```json
{
  "app": "TruthKeeper",
  "version": "1.0",
  "article_text": "…",
  "article_url": "https://…",
  "article_title": "…",
  "verdict": "FAKE",
  "confidence_score": 92,
  "explanation": "…",
  "sources_used": [{ "title": "…", "url": "https://…" }],
  "model": "gemini-2.5-flash",
  "timestamp": "2026-07-09T12:34:56.000Z",
  "user_id": "<firebase-uid>"
}
```

---

## Data model

**Firestore `proofs/{cid}`** — one document per stored proof (for history + fast
metadata lookups). The authoritative record always lives on Filecoin.

```ts
{
  cid, proofUrl, userId,           // userId = Firebase uid
  verdict, confidenceScore,
  articleTitle, articleUrl, articleSnippet,
  model, checkedAt, storedAt
}
```

History is queried by `userId` and sorted in memory, so **no composite Firestore
index is required**.

---

## Deployment notes

- Set every variable from the table above in your host (e.g. Vercel), and set
  `NEXT_PUBLIC_APP_URL` to your production URL so proof links resolve correctly.
- Add your production domain under **Firebase → Authentication → Settings →
  Authorized domains** so Google sign-in works outside `localhost`.
- API routes that touch Filecoin/Gemini run on the **Node runtime** and can be
  slow (the first Filecoin upload creates an on-chain data set); `maxDuration` is
  raised on those routes.
- This uses the Filecoin **Calibration testnet**. Moving to mainnet means a
  mainnet wallet, real USDFC, and switching the Synapse chain config.

---

## Troubleshooting

- **`GEMINI_API_KEY is not set` / `FILECOIN_PRIVATE_KEY is not set`** — fill
  `.env.local` and restart `pnpm dev`.
- **`Sign-in not configured`** — the `NEXT_PUBLIC_FIREBASE_*` values are missing.
- **`auth/unauthorized-domain`** — enable Google sign-in and add your domain to
  Firebase Authorized domains.
- **401 on check/history/store** — you're signed out or the token expired; sign in again.
- **Store fails / insufficient funds** — re-run `pnpm setup:payments`; ensure the
  wallet has tFIL (gas) and USDFC.
- **First store is slow** — the initial upload creates a Filecoin data set on-chain;
  later uploads are faster.
- **Verdict is `UNSURE` for a link** — the page was unreadable (paywall/bot-block)
  and search couldn't confirm the story; try pasting the article text.

---

## Roadmap

- **Phase 1 (done):** article submission, AI fact-checking, Filecoin storage, proof links.
- **Phase 2 (in progress):** Google accounts + per-user history, social sharing.
- **Phase 3:** community voting on verdicts, FVM smart-contract integration,
  automated checking of trending news.
- **Phase 4:** enterprise API, publisher integration, journalist dashboard.

---

Testnet project — not financial or editorial advice. Verdicts are AI-generated;
always consult the cited primary sources.
