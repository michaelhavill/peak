# Spelling Showdown on spelling.100xpath.com - Design

Date: 2026-07-21
Status: approved (hosting approach and persistence confirmed by MVH)

## Goal

Host the existing Spelling Showdown game (a self-contained React component built
as a Claude artifact) on Cloudflare at `spelling.100xpath.com`, reusing this
repo's existing build and deploy pipeline.

## Approach (approved)

**Same worker, hostname routing.** The game becomes a page in this Next.js
static-export app at `/spelling`. The existing `peak` worker serves the game
when a request arrives on the `spelling.100xpath.com` hostname. No new
Cloudflare projects; deploys ride the existing merge-to-main pipeline.

**Persistence: localStorage.** The artifact's `window.storage` API (Claude
artifact-only) is replaced with synchronous `localStorage` under the same
save-shape. Progress is per browser/device. If localStorage is unavailable
(private mode), the game still plays and shows its existing "saving isn't
working" warning.

## Components

1. `src/app/spelling/page.tsx` - server page: metadata (title, description,
   `robots: noindex` since this is a personal family game), renders the client
   component.
2. `src/app/spelling/SpellingShowdown.tsx` - `"use client"` TypeScript port of
   the artifact. Changes from the original:
   - `window.storage.get/set/list` replaced with a small localStorage
     load/save pair; the async mount effect becomes a simple sync load.
   - Em dashes in copy replaced with hyphens (CLAUDE.md rule).
   - Types added so the strict Next build passes.
   - Everything else (word bank, adaptive engine, payout ladder, speech
     synthesis, inline styles) ported unchanged.
3. `src/components/TopNav.tsx` and `src/components/ScrollProgress.tsx` - hide
   on `/spelling` (same pattern TopNav already uses for `/social-cards`), so
   the game renders full-page without site chrome.
4. `worker.ts` - hostname routing: when `url.hostname` starts with
   `spelling.`, requests to `/` are rewritten to the `/spelling/` asset.
   `/_next/*` and other asset paths pass through untouched so JS/CSS load.
5. `wrangler.json` - deliberately untouched. Declaring `routes` in config
   risks detaching the dashboard-managed 100xpath.com domains on the next
   deploy. Instead, one manual step: in the Cloudflare dashboard add
   `spelling.100xpath.com` as a custom domain on the `peak` worker
   (Workers & Pages -> peak -> Settings -> Domains & Routes). DNS is created
   automatically because the 100xpath.com zone lives on the same account.

## Data flow

Save shape is identical to the artifact (`spelling-showdown-v1` key): bankroll,
day streak, per-word stats, ledger history. Reads once on mount, writes after
each round/cashout. No server-side state, no API endpoints.

## Error handling

- localStorage read failure -> fresh save + `storageOk=false` warning banner
  (existing UI).
- Speech synthesis unavailable -> existing fallback shows the definition text
  instead of audio.

## Testing

- `npm run build` (static export must pass type checks and emit
  `out/spelling/index.html`).
- Local preview of the page: game loads, a round can be played, save survives
  reload, no console errors.
- Post-deploy: `spelling.100xpath.com` serves the game at `/`.
