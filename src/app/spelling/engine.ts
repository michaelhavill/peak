// Spelling Showdown engine: types, economy, adaptive round building, and
// round settlement. Pure functions only - no React, no DOM, no storage - so
// the whole game economy is deterministic and testable in isolation.
// Word banks and persona copy live per player in ./themes.

export type Entry = {
  w: string;
  l: number;
  p: string;
  s: string;
  h: string;
  d: string | null;
  t: string | null;
};

export type WordStat = { a: number; m: number; cs: number; seen: number };

export type HistoryEntry = {
  d: string;
  type: "round" | "practice" | "bailout" | "cashout" | "bonus" | "boss";
  label: string;
  net: number;
  bank: number;
};

export type BossState = { pending: boolean; lastRound: number; wins: number; losses: number };

export type Records = {
  bestStreak: number;
  biggestWin: number;
  bestCashout: number;
  perfectRounds: number;
  bestDayStreak: number;
};

export type ChipRecord = { w: number; l: number; d: number };

export type Cashout = { amount: number; date: string };

export type Save = {
  bank: number;
  day: string | null;
  dayStreak: number;
  rounds: number;
  playerLevel: number;
  recentAcc: number;
  hotStreak: number; // consecutive rounds at 80%+ first-try accuracy
  coldStreak: number; // consecutive losing betting rounds
  stats: Record<string, WordStat>;
  cashouts: Cashout[];
  history: HistoryEntry[];
  records: Records;
  chip: ChipRecord; // career record vs Chip (adaptive betting rounds only)
  doodles: string[]; // collected doodle-drop ids
  soundOn: boolean;
  boss: BossState;
};

// In-progress round, persisted so a reload or closed tab never loses the bet
// or re-deals the question set.
export type RoundSnapshot = {
  queue: Entry[];
  idx: number;
  bet: number;
  isPractice: boolean;
  isCustom: boolean;
  isBoss: boolean;
  missed: Entry[];
  redo: Entry[];
  firstTryCorrect: number;
  streak: number;
  bestStreak: number;
  roundTotal: number;
  roundWords: string[];
  answered: boolean; // current word already answered (phase was right/wrong)
  bonusWord: string | null;
  bonusWon: boolean;
};

export type Payout = {
  result: string;
  amount: number;
  misses: number;
  net: number;
  betAmt: number;
  prevBank: number;
  newBank: number;
};

export type Rank = { wins: number; title: string };
export type Doodle = { id: string; icon: string; name: string; cap: string; rare: boolean };

export const ROUND_SIZE = 8;
export const STARTING_BANK = 20;
export const BROKE_BAILOUT = 5;
export const MAX_LEVEL = 4;
// Promotion: two consecutive rounds at 80%+ first-try accuracy moves him up a
// level. Blended accuracy under 55% moves him down. The level (and all word
// stats) live in the save, so they survive cashouts - only the bankroll resets.
export const HOT_ROUND_ACC = 0.8;
export const HOT_ROUNDS_TO_LEVEL_UP = 2;
// Comfort mode: after two losing bets in a row, half the next round is words
// he reliably gets right - but only while the bank is at $10 or less. Above
// $10 he plays on merit. The broke bailout ($5) is a floor, never a boost,
// so no assistance ever lifts him past $10.
export const COLD_ROUNDS_FOR_COMFORT = 2;
export const COMFORT_BANK_CAP = 10;
// Payday goal shown as a progress bar on the betting desk - a finish line to
// run at instead of a shapeless grind.
export const PAYDAY_GOAL = 40;
// Custom school lists play as ONE round covering the whole list (no silent
// 8-word truncation), capped for sanity.
export const CUSTOM_ROUND_CAP = 20;
// Day-streak milestone bonuses (real money - calendar-capped, so cheap for Dad)
export const STREAK_BONUS: Record<number, number> = { 3: 1, 7: 3, 14: 5, 30: 10 };
// Secret bonus word: one word per adaptive betting round pays +$1 on a
// first-try correct. Reward-side variability on top of the skill bet.
export const BONUS_WORD_CASH = 1;
// At max level, every 2 consecutive hot rounds pay Chip's respect bonus
// instead of a level-up, so the hot-streak counter never goes dead.
export const RESPECT_BONUS = 1;
export const DOODLE_DROP_CHANCE = 0.3;
// Boss battles: semi-frequent free-entry challenges from Chip. Five of his
// nastiest words, no hints, one miss allowed. Win: +$5 of Chip's own money
// and a win on the rank ladder. Lose: nothing but Chip's gloating.
export const BOSS_WORD_COUNT = 5;
export const BOSS_MISS_ALLOWED = 1;
export const BOSS_PRIZE = 5;
export const BOSS_MIN_GAP = 4; // rounds since last battle before one can trigger
export const BOSS_CHANCE = 0.45; // per eligible round

export function rankFor(wins: number, ranks: Rank[]) {
  let current = ranks[0];
  let next: { title: string; winsNeeded: number } | null = null;
  for (const r of ranks) {
    if (wins >= r.wins) current = r;
    else { next = { title: r.title, winsNeeded: r.wins - wins }; break; }
  }
  return { title: current.title, next };
}

export function pickDoodleDrop(owned: string[], doodles: Doodle[], roll: () => number = Math.random): string | null {
  const unowned = doodles.filter((d) => !owned.includes(d.id));
  if (unowned.length === 0) return null;
  // rares weigh 1, commons weigh 3
  const weighted: Doodle[] = unowned.flatMap((d) => (d.rare ? [d] : [d, d, d]));
  return weighted[Math.floor(roll() * weighted.length)].id;
}

export const HOMOPHONE_HINTS: Record<string, string> = {
  their: "The one that means it belongs to them.",
  there: "The one that means in that place.",
  "they're": "The one that is short for they are.",
  to: "The one you go TO school with.",
  too: "The one that means also, or too much.",
  two: "The number after one.",
  your: "The one that means it belongs to you.",
  "you're": "The one that is short for you are.",
  its: "The one that means belonging to it. No apostrophe.",
  "it's": "The one that is short for it is.",
  weather: "The one with rain and sunshine.",
  whether: "The one that means if.",
  where: "The one that asks about a place.",
  wear: "The one you do with clothes.",
  hear: "The one you do with your ears.",
  here: "The one that means this place.",
  right: "The one that means correct, or the opposite of left.",
  write: "The one you do with a pencil.",
  knew: "The past of know. Starts with a silent K.",
  new: "The opposite of old.",
  know: "The one about knowing things. Silent K.",
  no: "The opposite of yes.",
  week: "Seven days.",
  weak: "The opposite of strong.",
  board: "The flat piece of wood.",
  bored: "What Nate is in social studies.",
  brake: "The one that stops a bike.",
  break: "The one that means to smash, or a rest.",
  piece: "A piece of pie. Pie starts it: P I E.",
  peace: "The calm one.",
  plain: "The ordinary one.",
  plane: "The flying one.",
  principal: "The head of the school. Your PAL, allegedly.",
  principle: "The rule you live by.",
  aloud: "The one that means out loud.",
  allowed: "The one that means permitted.",
  passed: "The one where you went past, or passed a test.",
  past: "The one about history, or beyond.",
};

export type DiffOp = { ch: string; kind: "ok" | "wrong" | "extra" | "missing" };
export function alignDiff(guess: string, answer: string): DiffOp[] {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  const m = g.length, n = a.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j - 1] + (g[i - 1] === a[j - 1] ? 0 : 1),
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1
      );
    }
  }
  const ops: DiffOp[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && g[i - 1] === a[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      ops.unshift({ ch: g[i - 1], kind: "ok" }); i--; j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.unshift({ ch: g[i - 1], kind: "wrong" }); i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.unshift({ ch: g[i - 1], kind: "extra" }); i--;
    } else {
      ops.unshift({ ch: a[j - 1], kind: "missing" }); j--;
    }
  }
  return ops;
}

// Graduated payout: soft landings for near misses, full bust only for a blowout.

export function payoutFor(misses: number, total: number, bet: number) {
  const r = total > 0 ? misses / total : 1;
  let mult: number, label: string;
  if (misses === 0)      { mult = 2;    label = "clean"; }
  else if (r <= 0.125 + 1e-9) { mult = 1.5;  label = "good"; }
  else if (r <= 0.25 + 1e-9)  { mult = 1;    label = "even"; }
  else if (r <= 0.375 + 1e-9) { mult = 0.75; label = "graze"; }
  else if (r <= 0.5 + 1e-9)   { mult = 0.5;  label = "half"; }
  else if (r <= 0.625 + 1e-9) { mult = 0.25; label = "rough"; }
  else                   { mult = 0;    label = "bust"; }
  return { label, amount: Math.round(bet * mult), mult };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// Never let a displayed hint contain the answer (or a near-form of it).
// Covers the built-in bank and anything from a pasted custom list.
export function safeHint(hint: string, word: string) {
  if (!hint || !word) return hint;
  const stem = word.length > 5 ? word.slice(0, word.length - 2) : word;
  const re = new RegExp(`[A-Za-z]*(?:${word}|${stem})[A-Za-z]*`, "gi");
  return hint.replace(re, "_____");
}
export function todayStr() { return new Date().toISOString().slice(0, 10); }
export function yesterdayStr() {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const FRESH_SAVE: Save = {
  bank: STARTING_BANK,
  day: null,          // last played date
  dayStreak: 0,
  rounds: 0,
  playerLevel: 1,
  recentAcc: 0.7,
  hotStreak: 0,
  coldStreak: 0,
  stats: {},          // word -> {a: attempts, m: misses, cs: correctStreak, seen: roundNumber}
  cashouts: [],
  history: [],        // ledger rows: {d, type, label, net, bank}
  records: { bestStreak: 0, biggestWin: 0, bestCashout: 0, perfectRounds: 0, bestDayStreak: 0 },
  chip: { w: 0, l: 0, d: 0 },
  doodles: [],
  soundOn: true,
  boss: { pending: false, lastRound: 0, wins: 0, losses: 0 },
};

export const HISTORY_CAP = 200;
export function withHistory(history: HistoryEntry[] | undefined, entry: HistoryEntry) {
  return [...(history || []), entry].slice(-HISTORY_CAP);
}

export function weakestPatterns(stats: Record<string, WordStat>, bank: Entry[]) {
  const agg: Record<string, { a: number; m: number }> = {};
  for (const entry of bank) {
    const st = stats[entry.w];
    if (!st || st.a < 1) continue;
    if (!agg[entry.p]) agg[entry.p] = { a: 0, m: 0 };
    agg[entry.p].a += st.a;
    agg[entry.p].m += st.m;
  }
  return Object.entries(agg)
    .filter(([, v]) => v.a >= 2 && v.m / v.a > 0.3)
    .sort((x, y) => y[1].m / y[1].a - x[1].m / x[1].a)
    .map(([p, v]) => ({ pattern: p, rate: v.m / v.a }));
}

export function strugglingWords(stats: Record<string, WordStat>, bank: Entry[]) {
  return bank
    .filter((e) => {
      const st = stats[e.w];
      return st && st.m > 0 && st.cs < 2;
    })
    .sort((a, b) => {
      const sa = stats[a.w], sb = stats[b.w];
      return (sb.m / sb.a) - (sa.m / sa.a) || (sa.seen || 0) - (sb.seen || 0);
    });
}

export function buildRound(save: Save, bank: Entry[]): Entry[] {
  const { stats, playerLevel, rounds, recentAcc } = save;
  const chosen: Entry[] = [];
  const used = new Set<string>();
  const take = (e: Entry | undefined) => { if (e && !used.has(e.w)) { chosen.push(e); used.add(e.w); } };
  const seenAgo = (w: string) => (stats[w] && stats[w].a > 0) ? rounds - (stats[w].seen || 0) : Infinity;

  // 0. Comfort mix: after two losing bets in a row with the bank at
  //    $COMFORT_BANK_CAP or less, half the round is words he reliably gets
  //    right (correct streak of 2+), to bank some wins and lift spirits.
  if ((save.coldStreak || 0) >= COLD_ROUNDS_FOR_COMFORT && save.bank <= COMFORT_BANK_CAP) {
    shuffle(bank.filter((e) => { const st = stats[e.w]; return !!st && st.cs >= 2; }))
      .slice(0, Math.floor(ROUND_SIZE / 2))
      .forEach(take);
  }

  // 1. Struggle words, max 3, with spaced-repetition timing:
  //    missed last attempt -> comes back next round;
  //    recovering (got it right once) -> rests at least 2 rounds before its confirmation test.
  strugglingWords(stats, bank)
    .filter((e) => stats[e.w].cs === 0 || seenAgo(e.w) >= 2)
    .slice(0, 3)
    .forEach(take);

  // 2. Up to 2 NEVER-SEEN words from his weakest patterns (teach the pattern via fresh words)
  const weak = weakestPatterns(stats, bank).slice(0, 2).map((x) => x.pattern);
  if (weak.length) {
    shuffle(bank.filter((e) => !used.has(e.w) && weak.includes(e.p) && seenAgo(e.w) === Infinity && e.l <= playerLevel + 1))
      .slice(0, 2).forEach(take);
  }

  // 3. One confidence refresh: mastered but not seen for 6+ rounds
  const stale = bank.filter((e) => stats[e.w] && stats[e.w].cs >= 3 && seenAgo(e.w) >= 6 && !used.has(e.w));
  if (stale.length) take(pick(stale));

  // 4. Fill with diversity guaranteed: never-seen words first, then words resting 3+ rounds.
  //    Nothing seen in the last 2 rounds can enter this bucket.
  const eligible = (e: Entry) => !used.has(e.w) && (!stats[e.w] || stats[e.w].cs < 3) && seenAgo(e.w) >= 3;
  // When he's winning at 80%+, reach UP a level for fill words before reaching
  // down, so the next level gets tested while he's hot instead of coasting.
  const stretching = recentAcc >= HOT_ROUND_ACC && playerLevel < MAX_LEVEL;
  const levelOrder = stretching
    ? [playerLevel, Math.min(MAX_LEVEL, playerLevel + 1), Math.max(1, playerLevel - 1)]
    : [playerLevel, Math.max(1, playerLevel - 1), Math.min(MAX_LEVEL, playerLevel + 1)];
  for (const lvl of levelOrder) {
    const fresh = shuffle(bank.filter((e) => eligible(e) && e.l === lvl && seenAgo(e.w) === Infinity));
    const rested = shuffle(bank.filter((e) => eligible(e) && e.l === lvl && seenAgo(e.w) !== Infinity));
    for (const e of [...fresh, ...rested]) {
      if (chosen.length >= ROUND_SIZE) break;
      take(e);
    }
    if (chosen.length >= ROUND_SIZE) break;
  }

  // 5. Relax only if the bank is nearly exhausted: first allow 1-round rest, then anything
  if (chosen.length < ROUND_SIZE) {
    for (const e of shuffle(bank.filter((x) => !used.has(x.w) && seenAgo(x.w) >= 1))) {
      if (chosen.length >= ROUND_SIZE) break;
      take(e);
    }
  }
  if (chosen.length < ROUND_SIZE) {
    for (const e of shuffle(bank)) {
      if (chosen.length >= ROUND_SIZE) break;
      take(e);
    }
  }
  return shuffle(chosen.slice(0, ROUND_SIZE));
}

// Boss battle round: Chip's nastiest words at his level or one above,
// unmastered words first so the fight is real.
export function buildBossRound(save: Save, bank: Entry[]): Entry[] {
  const { stats, playerLevel } = save;
  const lvlMax = Math.min(MAX_LEVEL, playerLevel + 1);
  const hard = bank.filter((e) => e.l >= playerLevel && e.l <= lvlMax);
  const unmastered = shuffle(hard.filter((e) => (stats[e.w]?.cs ?? 0) < 3));
  const mastered = shuffle(hard.filter((e) => (stats[e.w]?.cs ?? 0) >= 3));
  const chosen = [...unmastered, ...mastered].slice(0, BOSS_WORD_COUNT);
  for (const e of shuffle(bank)) {
    if (chosen.length >= BOSS_WORD_COUNT) break;
    if (!chosen.some((c) => c.w === e.w)) chosen.push(e);
  }
  return shuffle(chosen);
}

// Everything that happens when a round ends, as a pure function so it can be
// applied both live (finishRound) and when settling an orphaned round found

type SettleInput = {
  isPractice: boolean;
  isCustom: boolean; // custom school-list rounds never move rank, records, or the Chip record
  isBoss: boolean; // free-entry challenge: prize on <= BOSS_MISS_ALLOWED misses, no rank/level effects except a ladder win
  bet: number;
  roundTotal: number;
  firstTryCorrect: number;
  roundWords: string[];
  missedWords: string[];
  bestStreakRound: number;
  bonusWon: boolean;
  doodleDrop: string | null;
  /** The active player's rank ladder, so rank-up titles come from their theme */
  ranks: Rank[];
};

export type SettleResult = {
  next: Save;
  payout: Payout;
  bailedOut: boolean;
  leveledUp: boolean;
  leveledDown: boolean;
  rankUp: string | null;
  newRecords: string[];
  streakBonus: number;
  streakBroken: number;
  respectBonus: number;
};

export function settleRound(save: Save, p: SettleInput): SettleResult {
  const misses = p.missedWords.length;
  const bossWon = p.isBoss && misses <= BOSS_MISS_ALLOWED;
  const pay = p.isBoss
    ? { label: bossWon ? "bosswin" : "bossloss", amount: bossWon ? BOSS_PRIZE : 0, mult: 0 }
    : p.isPractice
      ? { label: "practice", amount: 0, mult: 0 }
      : payoutFor(misses, p.roundTotal, p.bet);
  const newBank = p.isBoss
    ? save.bank + pay.amount
    : p.isPractice ? save.bank : Math.max(0, save.bank - p.bet + pay.amount);

  // Update word stats (first-try outcomes only; revenge laps are practice)
  const stats = { ...save.stats };
  const roundNum = save.rounds + 1;
  for (const w of p.roundWords) {
    const st = stats[w] || { a: 0, m: 0, cs: 0, seen: 0 };
    const missed = p.missedWords.includes(w);
    stats[w] = {
      a: st.a + 1,
      m: st.m + (missed ? 1 : 0),
      cs: missed ? 0 : st.cs + 1,
      seen: roundNum,
    };
  }

  // Difficulty tuning: promote after HOT_ROUNDS_TO_LEVEL_UP consecutive
  // rounds at 80%+ first-try accuracy; demote only on a sustained slump.
  // Custom school-list rounds are excluded: a hard teacher list must never
  // demote him, and a trivial pasted list must never farm the ladder.
  const ranked = !p.isCustom && !p.isBoss;
  const roundAcc = p.roundTotal ? p.firstTryCorrect / p.roundTotal : 0.7;
  const recentAcc = ranked ? 0.6 * roundAcc + 0.4 * save.recentAcc : save.recentAcc;
  let hotStreak = ranked ? (roundAcc >= HOT_ROUND_ACC ? (save.hotStreak || 0) + 1 : 0) : (save.hotStreak || 0);
  let playerLevel = save.playerLevel;
  let leveledUp = false;
  let leveledDown = false;
  let respectBonus = 0;
  if (ranked) {
    if (hotStreak >= HOT_ROUNDS_TO_LEVEL_UP && playerLevel < MAX_LEVEL) {
      playerLevel += 1;
      hotStreak = 0;
      leveledUp = true;
    } else if (hotStreak >= HOT_ROUNDS_TO_LEVEL_UP && playerLevel === MAX_LEVEL) {
      // Max level: the hot streak converts to cash so the counter never dies
      hotStreak = 0;
      respectBonus = RESPECT_BONUS;
    } else if (recentAcc < 0.55 && playerLevel > 1) {
      playerLevel -= 1;
      leveledDown = true;
    }
  }

  // Losing streak drives comfort mode; only real betting rounds count either
  // way (boss battles are free entries and leave it untouched)
  const net = p.isPractice ? 0 : pay.amount - p.bet;
  const lost = !p.isPractice && !p.isBoss && net < 0;
  const coldStreak = (p.isPractice || p.isBoss) ? (save.coldStreak || 0) : lost ? (save.coldStreak || 0) + 1 : 0;

  // Career record vs Chip: adaptive betting rounds, plus boss battle WINS
  // (losing a free challenge costs nothing, not even the record).
  const chip: ChipRecord = { ...(save.chip || { w: 0, l: 0, d: 0 }) };
  let rankUp: string | null = null;
  if (p.isBoss) {
    if (bossWon) {
      const beforeTitle = rankFor(chip.w, p.ranks).title;
      chip.w += 1;
      const afterTitle = rankFor(chip.w, p.ranks).title;
      if (afterTitle !== beforeTitle) rankUp = afterTitle;
    }
  } else if (!p.isPractice && ranked) {
    const beforeTitle = rankFor(chip.w, p.ranks).title;
    if (net > 0) chip.w += 1;
    else if (net < 0) chip.l += 1;
    else chip.d += 1;
    const afterTitle = rankFor(chip.w, p.ranks).title;
    if (afterTitle !== beforeTitle) rankUp = afterTitle;
  }

  // Boss ledger: battle resolved, cooldown restarts from this round
  const boss: BossState = { ...(save.boss || FRESH_SAVE.boss) };
  if (p.isBoss) {
    boss.pending = false;
    boss.lastRound = roundNum;
    if (bossWon) boss.wins += 1;
    else boss.losses += 1;
  }

  // Daily streak, with milestone bonuses and honest break detection
  const today = todayStr();
  let dayStreak = save.dayStreak;
  let streakBonus = 0;
  let streakBroken = 0;
  if (save.day !== today) {
    if (save.day === yesterdayStr()) {
      dayStreak = dayStreak + 1;
      if (STREAK_BONUS[dayStreak]) streakBonus = STREAK_BONUS[dayStreak];
    } else {
      if (save.day !== null && save.dayStreak >= 3) streakBroken = save.dayStreak;
      dayStreak = 1;
    }
  }

  // Personal records (adaptive rounds only, so they can't be farmed).
  // First-ever values seed silently; announcements only for beaten records.
  const records: Records = { ...(save.records || FRESH_SAVE.records) };
  const newRecords: string[] = [];
  if (ranked) {
    if (p.bestStreakRound > records.bestStreak) {
      if (records.bestStreak >= 5) newRecords.push(`Best streak: ${p.bestStreakRound} (was ${records.bestStreak})`);
      records.bestStreak = Math.max(records.bestStreak, p.bestStreakRound);
    }
    if (!p.isPractice && net > 0 && net > records.biggestWin) {
      if (records.biggestWin > 0) newRecords.push(`Biggest win: +$${net} (was +$${records.biggestWin})`);
      records.biggestWin = net;
    }
    if (misses === 0 && p.roundTotal >= 6) records.perfectRounds += 1;
  }
  if (dayStreak > records.bestDayStreak) records.bestDayStreak = dayStreak;

  let bank = newBank;
  let history = save.history || [];
  if (p.isBoss) {
    history = withHistory(history, {
      d: today, type: "boss",
      label: bossWon ? `BOSS BATTLE: beat Chip, ${misses} ${misses === 1 ? "miss" : "misses"}` : "BOSS BATTLE: Chip survives (free entry)",
      net: pay.amount, bank,
    });
  } else if (p.isPractice) {
    history = withHistory(history, { d: today, type: "practice", label: `Practice: ${p.firstTryCorrect}/${p.roundTotal} first try`, net: 0, bank });
  } else {
    history = withHistory(history, { d: today, type: "round", label: `Bet $${p.bet}, ${misses} ${misses === 1 ? "miss" : "misses"} (${pay.label})`, net, bank });
  }
  // Earned extras land after the round entry so the ledger reads in order
  if (p.bonusWon) {
    bank += BONUS_WORD_CASH;
    history = withHistory(history, { d: today, type: "bonus", label: "Bonus word hit", net: BONUS_WORD_CASH, bank });
  }
  if (respectBonus > 0) {
    bank += respectBonus;
    history = withHistory(history, { d: today, type: "bonus", label: "Chip's respect bonus (2 hot rounds at max level)", net: respectBonus, bank });
  }
  if (streakBonus > 0) {
    bank += streakBonus;
    history = withHistory(history, { d: today, type: "bonus", label: `Day streak bonus (day ${dayStreak})`, net: streakBonus, bank });
  }
  // Never leave him on $0: the bailout floors a busted bank at $5. It is a
  // floor only - assistance never lifts the bank above $10.
  let bailedOut = false;
  if (!p.isPractice && bank < 1) {
    bank = BROKE_BAILOUT;
    bailedOut = true;
    history = withHistory(history, { d: today, type: "bailout", label: "Cheez Doodle fund bailout", net: BROKE_BAILOUT, bank });
  }

  const doodles = p.doodleDrop ? [...(save.doodles || []), p.doodleDrop] : (save.doodles || []);

  const payout: Payout = { result: pay.label, amount: pay.amount, misses, net, betAmt: p.bet, prevBank: save.bank, newBank: bank };
  const next: Save = { ...save, bank, stats, rounds: roundNum, recentAcc, playerLevel, hotStreak, coldStreak, day: today, dayStreak, history, records, chip, doodles, boss };
  return { next, payout, bailedOut, leveledUp, leveledDown, rankUp, newRecords, streakBonus, streakBroken, respectBonus };
}

// Doodle-burst sparks for a correct answer: fixed fan-out so the animation
