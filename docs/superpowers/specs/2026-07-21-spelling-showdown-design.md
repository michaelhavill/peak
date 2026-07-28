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

## Two players (added 2026-07-26, sixth pass)

Hunter and Millie both play, each with their own everything. Requirement from
MVH: make the player selectable, keep Hunter's ledger consistent with him, and
mirror the whole game for Millie with a cat-and-dog word list for a 9-year-old.

**Structure.** The single component was split into modules, since one file was
doing content, engine and UI:
- `engine.ts` - types, economy, adaptive round building, settlement. Pure
  functions, parameterised by word bank and rank ladder, no React or storage.
- `words-hunter.ts` / `words-millie.ts` - each player's word bank and persona
  copy (praise, roasts, boss taunts, ranks, collectibles).
- `themes.ts` - the `Theme` type, both themes, and the per-player storage keys.
- `SpellingShowdown.tsx` - React only.

**Player picker.** Shown on load every time, deliberately: one tap is cheaper
than two kids sharing a bankroll by accident. "Played last" is badged. A
"switch player" link in the header returns to the picker mid-session.

**Save isolation.** Keys are `spelling-showdown-v1:<id>` and
`spelling-showdown-round-v1:<id>`. Hunter's pre-profiles save at the old
unsuffixed key is adopted as his on first load (only when his key is absent,
so it is idempotent), carrying bankroll, ledger, rank, records, doodles, boss
state and word stats. Verified in the browser with a realistic legacy save.

**Millie's version.** Mirrors every mechanic (bets, payout ladder, comfort
mode, bailout floor, levels 1-4, rank ladder, records, streak bonuses, bonus
word, collectibles, boss battles). Her host is Princess Donut, a doodle cat
who is certain she is royalty, with her own SVG mascot, pink accent, ranks
(Wobbly Puppy -> Legend of the Treat Jar), sticker album, and the "ROYAL FIVE"
boss battle. Her 110-word bank is cat, dog and pet themed at a 9-year-old
level, including the family's own animals (Hatchi, Barley, Rosie, Mable,
Fluffington, Kumo, Norman, Donut) and famous cartoon pets.

**Content checks.** A validator asserts, for both banks: no duplicates, every
sentence contains its word, no hint leaks the answer (even after safeHint
masking), every danger zone is a real substring, no em dashes, all four levels
populated, the family pets and at least ten cartoon pets present, and Millie's
average level at or below Hunter's. A few words (favourite, separate, tongue)
appear in both banks; the tests assert each player always gets their own
themed sentence and trick for those.

## NZ curriculum alignment, two real bug fixes, streak rewards (2026-07-26, seventh pass)

### Bugs found and fixed
1. **The feedback line showed letters he never typed.** Reported with a photo:
   the word was "friend", he typed "fiend", and the alignment diff rendered the
   omitted r inline, so the line read "YOU WROTE: friend" - identical to the
   answer above it. The game looked like it had marked a correct spelling wrong.
   Missing letters now render as an empty highlighted slot and a note names the
   letters left out. The line can only ever contain letters he actually typed.
2. **Misheard words counted as misspellings.** Hunter's bank holds both
   "through" and "thorough", which a browser voice cannot reliably distinguish.
   A correctly spelled sound-alike now triggers a MISHEARD state: no miss, no
   money, the word replays, the meaning hint opens, one grace per word. Real
   misspellings are unaffected. Apostrophe words (dogs', couldn't) get the same
   grace, since a voice cannot convey an apostrophe at all, and every word with
   a sound-alike always shows its meaning in all modes.
3. **A make-good credit** paid Hunter back to $25, once, recorded by id so a
   reload cannot pay twice, capped so it never lowers a healthy bankroll.

### Curriculum alignment
Both banks were rebuilt from researched sources rather than invention.
- **Millie (Year 5, age 9-10):** NZCER Essential Spelling Lists (mastery by end
  of Year 4 is Lists 1-4; Lists 5-6 are the working range), the refreshed NZC
  Phase 2 Year 5 spelling rows, real NZ school lists, NZCER Commonly Misspelt
  Words. 120 words. Dropped 46 (infant vocabulary, 10 breed names, 7 surplus
  cartoon characters), added 56 curriculum words, releveled 8. Proper nouns and
  breeds fell from 31% to 11%.
- **Hunter (Year 7-8, age 12):** Spell-Write Essential Lists 6-7, HNS Lists
  8-10, UK Year 5/6 statutory, South Australian Spelling Test and Schonell
  items with published spelling ages, NEMP error data, NZC Phase 3 Year 7-8
  sequences, PAT/e-asTTle/STAR vocabulary. 142 words. Dropped 21 too-easy or
  untestable words, added 36 (homophones and confusables, -able/-ible,
  -ance/-ence, Greek and Latin roots, and NZ-versus-US spellings: centre,
  defence, programme, jewellery, travelled, analyse, marvellous, catalogue,
  skilful), releveled 15 against measured difficulty.

### Daily streak rewards
Paid for finishing a round on a new day, once per calendar day, on a decaying
ladder with a milestone: $1 each on days 1-3, $1 every second day for 4-6, $1
on day 9, **$5 on day 10 and every tenth day**, then $1 every fifth day. A full
ten-day run pays $11, so daily play always beats restarting. The betting desk
previews what today or tomorrow is worth; the numbers live in one place
(streakBonusFor) if the rate needs tuning.

### Tooling
The rebuild pipeline now validates every reviewer fix by trial application and
skips any that would break an entry (a checker returning prose advice once
destroyed a sentence). A bug audit script checks both banks for misspellings,
hidden characters, exact-answer acceptance and in-bank confusable pairs. Test
coverage: 75 logic assertions, 40 misheard, 15 diff, plus the bank validator.

## Battle types and study cards (2026-07-26, eighth pass)

### Boss battles: guaranteed cadence, six dynamics, $2-$5
A battle now appears on a **guaranteed 3 to 5 round cadence** (a target round is
picked when the last one resolves), not a random drip. Six types differ in their
RULES, not just their words, and every one is free to enter and pays $2-$7:

| Battle | Words | Misses | Prize | Dynamic |
|---|---|---|---|---|
| The Gauntlet | 5 hard | 1 | $3 | the baseline |
| The Flawless Four | 4 hard | 0 | $5 | biggest prize, zero margin |
| Sudden Death | up to 12 | 0 | $2-$5 | ends at the first miss, prize climbs with each word survived (4 words $2, 6 $3, 8 $4, 10 $5) |
| The Marathon | 8 hard | 2 | $4 | stamina |
| The Revenge Match | 5 he has missed before | 1 | **$7** (top prize) | the biggest prize in the game, and the hardest list: every word has already beaten him |
| The Pattern Ambush | 5 sharing his weakest pattern | 1 | $3 | targets the wobbliest rule |

Sudden death shows the banked prize and what the next word is worth, live, and
ends the round the moment he misses. Types requiring history (revenge, pattern)
are only offered once the save has the data. Millie gets friendlier labels
where a type defines one (Sudden Death reads LAST ONE STANDING).

No timed battle: this is an audio-first game, and a clock would punish slow
audio or a replay, which is the same unfairness class as the misheard bug.

### Both players, verified not assumed
Everything above runs off the theme, so both players get the whole feature set:
all six battle types, study cards, streak rewards, the misheard grace and the
rank ladder. A parity block in the test suite loops over BOTH themes and
asserts each one can play every battle type, draw a study sheet, win the $7
rematch, reach the day 10 payday and have its own confusables covered. Millie
sees gentler battle names through a `friendlyBossNames` theme flag (Sudden
Death reads LAST ONE STANDING, the Revenge Match reads THE REMATCH).

One content bug this caught: both players' boss taunts hardcoded "five words"
and "$5", which contradicted an 8-word Marathon or the $7 rematch. Taunts are
now type-agnostic and the battle card's rule line states the real terms, with a
test asserting no taunt ever claims a word count or a prize.

### Study cards before every round
Every round now opens with a self-paced flash-card sheet: the round's words
plus **3 to 5 extras that are not in the round**, shuffled, so studying teaches
more than the test asks and he cannot tell which words are coming. Each card
shows the word with its danger zone highlighted, the meaning, and the trick,
and tapping it speaks the word. No timer, nothing at stake until he taps "I'm
ready". The sheet is included in the round snapshot, so a reload returns to the
study screen rather than re-dealing the round.

## Motivation pass: AMP evaluation and response (2026-07-26, ninth pass)

Evaluated against Pink's Autonomy / Mastery / Purpose model (the drive-motivation
skill, 0-10 per pillar). Scored **Autonomy 8, Mastery 8, Purpose 3**.

Autonomy and mastery were already strong: five ways into a round, an informed
bet, self-paced study cards, spaced repetition, danger-zone teaching, two
ladders. Purpose was the weak pillar by a distance: player-visible copy
mentioned the real reason to spell almost never (2 mentions of "test", 1 of
"learn") against 43 money figures, and nothing connected the effort to another
person. The framework's central anti-pattern, if-then rewards crowding out
intrinsic interest, is structurally present because the game is built on money.
The response is to raise learning to the same volume as the money, NOT to
remove the money, which is the family ritual that got them playing.

Five features, in priority order:

1. **Ready for the test** (purpose). He saves this week's school list; a meter
   shows nailed / shaky / not yet, where a word is nailed at a correct streak
   of 2. One button practises only the un-nailed words. This is the only place
   the game measures itself against something outside itself.
2. **Words you now own** (mastery). Round-end feedback was three deficit
   signals to one growth signal. settleRound now returns `newlyOwned`: words he
   used to miss and has now got right twice running, announced as his.
3. **Show Dad my week** (purpose, relatedness). A card built from the real
   ledger: rank, words owned, record vs the host, best streak, rounds and net
   this week, school-list readiness. Copyable.
4. **Pick your battle** (autonomy). Two battle types are offered and he chooses,
   at the most exciting moment in the game.
5. **Play up a level** (autonomy x mastery). Opt in to a round built one level
   higher with no hints, for 1.5x on a win. A loss costs nothing extra, and the
   multiplier never applies to practice, custom lists or boss battles.

## Millie's difficulty, retuned (2026-07-26, tenth pass)

MVH: her words were a little too hard for her current level, but she should
keep progressing as she gets it.

The NZ curriculum pass had optimised her level 1 for Year 3-4 content, which
made her ENTRY tier brutal: it opened with through, thought, their, should,
caught, children and remember. Correct as curriculum, wrong as a starting
point for a 9-year-old.

The fix gives her a longer, gentler ladder rather than throwing content away:

- **Five levels instead of four** (`theme.maxLevel`), so nothing is lost and
  there is more to climb. Her old level 1 is now level 2, old 2 -> 3, old 3 ->
  4, old 4 -> 5. Hunter is unchanged at four.
- **A new gentle level 1**: 26 short words (average 4.7 letters) that she can
  win at, each still teaching one reusable pattern - double letters, ck and
  tch after a short vowel, sh/ch/th/ng, aw/ai/ea/oa, simple plurals. Cat and
  dog vocabulary, in Princess Donut's voice.
- **Six-word rounds** for her instead of eight (`theme.roundSize`), so a round
  is quicker and a win arrives sooner.
- **Meanings stay on screen automatically through level 2**
  (`theme.autoHintUpToLevel`), fading out as she climbs.

Progression is untouched: two hot rounds at 80%+ still promotes, so she moves
up as she gets it and meets exactly the same curriculum words at levels 2-5.
Difficulty now rises monotonically by word length across every tier
(4.7 / 5.9 / 6.5 / 8.1 / 9.9 letters), asserted in the bank check.

## Drop vault, Millie's reset, and the stuck-words fix (2026-07-26, eleventh pass)

**Millie back to level 1, keeping everything else.** One-off adjustments (the
same idempotent mechanism as Hunter's bug refund) now support `setLevel` as
well as `toBank`. Hers sets level 1 and clears the hot streak, and leaves the
bankroll, ledger, cashouts, rank, records, prizes and word stats untouched, so
spaced repetition keeps everything it has learned about her.

**Fortnite drops for Hunter.** `theme.tradeReward` gives a player an optional
real-world reward they can trade bankroll for: $10 buys one drop, they bank up
with no cap, and every trade writes its own ledger row so Dad can see what was
swapped and when. Held and lifetime counts show in a vault on the betting desk.
Millie has no reward configured, so the card does not render for her.

**Spending the last $10 is allowed.** MVH: he can spend down to zero if he
wants. Losing a bet still floors the bankroll at $5, but a deliberate purchase
does not, and the old load-time bailout had to go: with trading available it
would have been a farm (spend to $0, reload, pocket $5). Instead, nobody is
ever stuck: while the bankroll is too low to bet, a free challenge is always on
the desk and free practice keeps the challenge cadence turning.

**Stuck words (bug).** Reported: "Millie keeps getting the same words, like
naughty and decision." Partly by design, since missed words return, but the
review filter passed any word with a correct streak of 0 with NO cooldown, so
words she could not get occupied the same slots every round forever, and at six
words a round that was half of it. Now a missed word rests one round before
returning, a recovering word rests two, the review bucket is capped at a third
of the round rather than a flat three, and among eligible words the least
recently seen goes first so a pool of tricky words rotates. Asserted by
simulating ten rounds of a player who keeps missing her three worst words.

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
