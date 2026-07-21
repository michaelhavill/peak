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

## Difficulty progression (added 2026-07-21, second pass)

Requirement from MVH: if he wins at over 80% across multiple runs, raise the
difficulty a reasonable amount; remember his level between cashouts; make sure
he progresses instead of farming one level.

- **Promotion:** two consecutive rounds at 80%+ first-try accuracy move him up
  one level (`hotStreak` counter in the save). Practice rounds count.
- **Demotion:** unchanged - blended accuracy below 55% drops a level.
- **Stretch words:** once blended accuracy is at 80%+, the round filler
  reaches UP one level before reaching down, so next-level words get tested
  while he's hot rather than after promotion.
- **Headroom:** new Level 4 word bank (26 words: accommodate, conscience,
  manoeuvre, pronunciation, etc.) so level 3 can't be farmed. MAX_LEVEL = 4.
- **Persistence:** playerLevel, hotStreak, and word stats live in the save and
  are untouched by cashOut (which only resets the bankroll). Level is now
  displayed on the start screen ("Spelling level: N / 4", plus a "one more hot
  round" hint) and a LEVEL UP callout shows on the results screen.

## Round resilience and comfort mode (added 2026-07-21, third pass)

- **Round resume (bug fix):** the in-progress round (words, position, misses,
  bet) is snapshotted to localStorage on every change. A reload or closed tab
  used to lose the round unscored and re-deal a fresh question set; now the
  game resumes exactly where he left off, and a round whose last word was
  answered but never scored is settled automatically at load (settleRound is
  a pure function shared by the live path and the load path).
- **Comfort mode:** after 2 losing betting rounds in a row AND with the bank
  at $10 or less, half the next round is words he reliably gets right
  (correct streak 2+). Silent - the game never says the words got easier.
  A winning or break-even betting round resets the losing streak; practice
  rounds leave it unchanged. Above $10 there is no comfort mix: he plays on
  merit.
- **Bankroll guardrails:** the bank can never rest at $0 (busting triggers
  the existing $5 bailout), and no assistance ever lifts the bank above $10 -
  the bailout is a floor, not a boost. Covered by a logic test suite run with
  tsx against the exported pure functions.

## Gamification pass (added 2026-07-21, fourth pass - from the adversarial audit)

Scope agreed with MVH: cash-out and the bailout economy stay as designed (Dad
audits the ledger and resets periodically); no iPad-specific work (Hunter
plays on a Chromebook); Big Nate character references stay (family use).

- **Rank ladder:** career wins vs Chip (adaptive betting rounds ending net
  positive) climb 10 Big Nate ranks, Rookie of Room 216 -> Immortal Doodler.
  Permanent progression beyond the level-4 word ceiling.
- **You vs Chip:** persistent W-L-D record, shown on the start and results
  screens, plus a one-tap REMATCH at the same bet.
- **Records:** best streak, biggest win, best payday, perfect rounds, longest
  day streak persist in the save with NEW RECORD announcements (first values
  seed silently).
- **Variable rewards:** a secret bonus word per adaptive betting round (+$1
  on a first-try hit) and doodle drops - a 12-item collection, 2 rares, ~30%
  chance on a won bet, shown on a trophy shelf.
- **Streak teeth:** cash bonuses at 3/7/14/30 days, an at-risk warning on the
  start screen, an honest "streak ended" note, and longest-streak record.
- **Max-level hot streaks** convert to Chip's respect bonus (+$1 per 2 hot
  rounds) so the counter never goes dead.
- **Rank integrity:** custom list rounds move money but never move
  level/recentAcc/hotStreak/chip record/records - a trivial pasted list can't
  farm the ladder and a hard school list can't demote him. Demotions on
  adaptive rounds are now announced (LEVEL DOWN line).
- **Honest feedback:** the letter diff is alignment-based (dropped letters
  render as yellow gaps, not cascading red), and the joke sentence renders as
  text on every correct answer.
- **School lists:** tolerant parsing (numbered/bulleted/tab/space input),
  visible error instead of a dead button, one round covers the whole list (up
  to 20 words), homophone disambiguation lines for ~19 school staples.
- **Juice:** WebAudio synth SFX (correct/wrong/bonus/win/lose/rankup/record)
  with a persistent sound toggle, escalating spark bursts + streak-tiered
  praise lines at streak 3+, payday-goal progress bar ($40).

## Boss battles (added 2026-07-21, fifth pass)

Semi-frequent free-entry challenges from Chip. After a normal adaptive round,
once at least 4 rounds have passed since the last battle, there's a 45%
chance Chip slaps a challenge on the betting desk. It stays pending until
accepted (a return hook), announced with a teaser on the results screen and
a red challenge card with a rotating taunt on the betting desk.

The battle: 5 of Chip's nastiest words (player level or one above,
unmastered first), no hints, one miss allowed. Free entry - losing costs
nothing, not even the Chip record. Winning pays $5 of "Chip's own money",
counts as a win on the rank ladder, and tracks in a separate boss W-L record
on the trophy shelf. Boss rounds never move level/recentAcc/hotStreak/
coldStreak; missed words still feed the learning stats and revenge system.
Chip gloats on a win and sulks when he pays out.

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
