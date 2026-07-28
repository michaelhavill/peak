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
  type: "round" | "practice" | "bailout" | "cashout" | "bonus" | "boss" | "reward";
  label: string;
  net: number;
  bank: number;
};

export type BossState = {
  pending: boolean;
  lastRound: number;
  wins: number;
  losses: number;
  /** rounds count at which the next battle appears */
  nextAt?: number;
  /** id of the pending battle type, once chosen */
  typeId?: string | null;
  /** the two battles on offer, so the player picks the fight */
  choices?: string[];
};

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
  credits?: string[]; // ids of one-off make-goods and adjustments already applied
  /** rewards traded for with bankroll, held and lifetime */
  rewards?: { held: number; lifetime: number };
  /** the school list he is preparing for, so the game can show real readiness */
  weekList?: { words: string[]; setOn: string; nailed?: string[] };
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
  /** played one level up for a bigger win */
  stretch?: boolean;
  /** true while the player is still on the study card */
  studying?: boolean;
  /** the study card's words, so a reload does not re-deal the round */
  study?: Entry[];
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

/**
 * One-off make-goods, applied once per player and recorded in the save so a
 * reload can never pay them twice. Each entry tops the bankroll UP to `toBank`
 * and writes its own ledger line.
 */
export type OneOff = {
  id: string;
  forPlayer: string;
  /** tops the bankroll UP to this figure, never down */
  toBank?: number;
  /** puts the player back on this level, leaving money and history alone */
  setLevel?: number;
  label: string;
  note: string;
};

export const CREDITS: OneOff[] = [
  {
    id: "bugfix-2026-07-26",
    forPlayer: "hunter",
    toBank: 25,
    label: "Bug refund from Dad (spelling checker was wrong, not you)",
    note: "Two bugs cost you money you had actually earned: a correct word could be marked wrong, and the feedback line showed the letter you missed as if you had typed it. Both are fixed. Dad has topped your bankroll up to $25.",
  },
  {
    id: "millie-level-reset-2026-07-26",
    forPlayer: "millie",
    setLevel: 1,
    label: "Fresh start on the new 5-level ladder (money and prizes kept)",
    note: "The words were too hard, so you are starting again on level 1 of the new five-level ladder. Your money, your prizes, your rank and your records all stay exactly as they were. Two good rounds in a row moves you up, same as always.",
  },
];

/** Applies any credit this player is owed and has not been paid yet. */
export function applyCredits(save: Save, playerId: string): { next: Save; messages: string[] } {
  let next = save;
  const messages: string[] = [];
  const paid = new Set(save.credits || []);
  for (const c of CREDITS) {
    if (c.forPlayer !== playerId || paid.has(c.id)) continue;
    const bank = c.toBank === undefined ? next.bank : Math.max(next.bank, c.toBank);
    const gain = bank - next.bank;
    next = {
      ...next,
      bank,
      // a level reset leaves the bankroll, ledger, records and word stats alone,
      // and clears the streak so the next promotion is earned from here
      ...(c.setLevel === undefined ? {} : { playerLevel: c.setLevel, hotStreak: 0, recentAcc: 0.6 }),
      credits: [...(next.credits || []), c.id],
      history: withHistory(next.history, { d: todayStr(), type: "bonus", label: c.label, net: gain, bank }),
    };
    messages.push(c.note);
  }
  return { next, messages };
}

/**
 * How ready he is for the actual school test. A word counts as ready once he
 * has spelled it right twice running, shaky after one, and not yet otherwise.
 * This is the only place the game measures itself against something that
 * matters outside the game.
 */
export type Readiness = { ready: string[]; shaky: string[]; notYet: string[]; total: number };
export const READY_STREAK = 2;
export function weekReadiness(save: Save): Readiness {
  const words = save.weekList?.words || [];
  const r: Readiness = { ready: [], shaky: [], notYet: [], total: words.length };
  // Bank words keep their capitals (Wednesday, February, Scooby) while a pasted
  // list is lowercased, so the lookup has to ignore case or those words could
  // never be marked ready.
  const byLower = new Map(Object.entries(save.stats).map(([k, v]) => [k.toLowerCase(), v]));
  const everNailed = new Set((save.weekList?.nailed || []).map((w) => w.toLowerCase()));
  for (const w of words) {
    const key = w.toLowerCase();
    const cs = byLower.get(key)?.cs ?? 0;
    if (cs >= READY_STREAK) r.ready.push(w);
    // A word he has nailed before never falls all the way back to "not yet" the
    // night before a test. One later slip drops it to "nearly", no further.
    else if (cs === 1 || everNailed.has(key)) r.shaky.push(w);
    else r.notYet.push(w);
  }
  return r;
}

/** Records words that have reached the nailed threshold, so readiness cannot collapse. */
export function recordNailed(save: Save): Save {
  if (!save.weekList) return save;
  const rd = weekReadiness(save);
  const nailed = new Set([...(save.weekList.nailed || []), ...rd.ready]);
  if (nailed.size === (save.weekList.nailed || []).length) return save;
  return { ...save, weekList: { ...save.weekList, nailed: [...nailed] } };
}

/** A week's worth of the ledger, for the card he shows his dad. */
export type WeekSummary = {
  rounds: number; net: number; bossWins: number; bonuses: number;
  ready: number; readyTotal: number; owned: number; bankTotal: number;
};
export function weekSummary(save: Save, bank: Entry[], today = todayStr()): WeekSummary {
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 6);
  const from = cutoff.toISOString().slice(0, 10);
  const recent = (save.history || []).filter((h) => h.d >= from);
  const rd = weekReadiness(save);
  return {
    // effort, not just wagering: a week of free practice is still a week of work
    rounds: recent.filter((h) => h.type === "round" || h.type === "practice" || h.type === "boss").length,
    // money he played for. Gifts from Dad are not earnings and must never be
    // reported to Dad as if they were.
    net: recent.filter((h) => h.type === "round" || h.type === "boss").reduce((n, h) => n + h.net, 0),
    bossWins: recent.filter((h) => h.type === "boss" && h.net > 0).length,
    bonuses: recent.filter((h) => h.type === "bonus").length,
    ready: rd.ready.length,
    readyTotal: rd.total,
    owned: bank.filter((e) => (save.stats[e.w]?.cs ?? 0) >= READY_STREAK).length,
    bankTotal: save.bank,
  };
}

/**
 * Trading bankroll for a real-world reward. He can trade as often as he likes
 * and the rewards bank up: this is a choice between money now and something
 * else he wants, which is his to make.
 */
export function tradeForReward(save: Save, cost: number, label: string): { next: Save; ok: boolean } {
  if (cost <= 0 || save.bank < cost) return { next: save, ok: false };
  const bank = save.bank - cost;
  const held = (save.rewards?.held ?? 0) + 1;
  const lifetime = (save.rewards?.lifetime ?? 0) + 1;
  return {
    ok: true,
    next: {
      ...save,
      bank,
      rewards: { held, lifetime },
      history: withHistory(save.history, { d: todayStr(), type: "reward", label, net: -cost, bank }),
    },
  };
}

/** Opting into harder words for a bigger payout: the self-chosen challenge. */
export const STRETCH_MULTIPLIER = 1.5;

export type Rank = { wins: number; title: string };
export type Doodle = { id: string; icon: string; name: string; cap: string; rare: boolean };

export const ROUND_SIZE = 8;
export const STARTING_BANK = 20;
export const BROKE_BAILOUT = 5;
/** Default top level. Each theme may set its own via `maxLevel`, so a younger
 * player can have a longer, gentler ladder. */
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
// Daily streak rewards, paid only for a day with a COMPLETED round, and only
// once per calendar day. The rate decays as the streak grows, with a big
// payday every tenth day, so showing up daily always beats restarting:
//   days 1-3   $1 each day
//   days 4-6   $1 every second day
//   days 7-9   $1 every third day
//   day 10     $5, and every tenth day after that
//   past 10    $1 every fifth day between the big ones
// A full ten-day run pays $11. Change these numbers here and nowhere else.
export const STREAK_MILESTONE = 5;
export function streakBonusFor(dayStreak: number): number {
  const d = Math.floor(dayStreak);
  if (d <= 0) return 0;
  if (d % 10 === 0) return STREAK_MILESTONE;
  if (d <= 3) return 1;
  if (d <= 6) return d % 2 === 0 ? 1 : 0;
  if (d <= 9) return d === 9 ? 1 : 0;
  return d % 5 === 0 ? 1 : 0;
}
/** What the next day of the streak would pay, for the "come back tomorrow" nudge. */
export function nextStreakBonus(dayStreak: number): { day: number; amount: number } {
  const day = Math.max(0, Math.floor(dayStreak)) + 1;
  return { day, amount: streakBonusFor(day) };
}

/**
 * The next day of the streak that actually pays. Some days on the ladder pay
 * nothing, and telling a kid "tomorrow is worth $0" kills the reason to come
 * back, so the nudge points at the next real payday instead.
 */
export function nextPayingStreakDay(dayStreak: number): { day: number; amount: number; daysAway: number } {
  const from = Math.max(0, Math.floor(dayStreak));
  for (let d = from + 1; d <= from + 12; d++) {
    const amount = streakBonusFor(d);
    if (amount > 0) return { day: d, amount, daysAway: d - from };
  }
  return { day: from + 1, amount: 0, daysAway: 1 };
}
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
// A battle is guaranteed every 3 to 5 rounds, never on a random drip, so the
// next one is always close enough to look forward to.
export const BOSS_GAP_MIN = 3;
export const BOSS_GAP_MAX = 5;
/** Rounds count at which the next battle should appear. */
export function nextBossAt(rounds: number, roll: () => number = Math.random): number {
  const span = BOSS_GAP_MAX - BOSS_GAP_MIN + 1;
  return rounds + BOSS_GAP_MIN + Math.floor(roll() * span);
}

/**
 * Battle types. Every one is free to enter and pays between $2 and $7, so the
 * only thing at stake is pride. They differ in the RULES, not just the words:
 * how many words, how many misses you get, where the words come from, and
 * whether the prize is fixed or climbs while you survive.
 */
export type BossType = {
  id: string;
  name: string;
  nameAlt?: string;         // friendlier label for the younger player
  rule: string;             // shown on the challenge card
  banner: string;           // shown during the round
  words: number;
  missesAllowed: number;
  prize: number;            // fixed prize, or the max for a climbing one
  select: "hard" | "missed" | "pattern" | "mixed";
  suddenDeath?: boolean;    // ends at the first miss, and the prize climbs
  minRounds?: number;       // needs some history before it can be picked
};

export const BOSS_TYPES: BossType[] = [
  {
    id: "gauntlet",
    name: "THE GAUNTLET",
    nameAlt: "THE BIG FIVE",
    rule: "5 hard words. One miss allowed. No hints.",
    banner: "THE GAUNTLET - five hard ones, one miss allowed.",
    words: 5, missesAllowed: 1, prize: 3, select: "hard",
  },
  {
    id: "flawless",
    name: "THE FLAWLESS FOUR",
    nameAlt: "THE PERFECT FOUR",
    rule: "4 words. ZERO misses allowed.",
    banner: "FLAWLESS FOUR - one slip and it is over. $5 on the line.",
    words: 4, missesAllowed: 0, prize: 5, select: "hard",
  },
  {
    id: "sudden",
    name: "SUDDEN DEATH",
    nameAlt: "LAST ONE STANDING",
    rule: "Words keep coming until you miss one. 4 words pays $2, 6 pays $3, 8 pays $4, 10 pays $5. Under 4 words pays nothing.",
    banner: "SUDDEN DEATH - the prize climbs with every word. One miss ends it.",
    words: 12, missesAllowed: 0, prize: 5, select: "mixed", suddenDeath: true,
  },
  {
    id: "marathon",
    name: "THE MARATHON",
    nameAlt: "THE LONG WALK",
    rule: "8 words. Two misses allowed. Stamina, not luck.",
    banner: "THE MARATHON - eight words, two misses, no hints.",
    words: 8, missesAllowed: 2, prize: 4, select: "hard",
  },
  {
    id: "revenge",
    // The biggest prize in the game, and the one that earns it: every word here
    // has already beaten him, so winning means beating his own worst list.
    name: "THE REVENGE MATCH",
    nameAlt: "THE REMATCH",
    rule: "5 words that have beaten you before. One miss allowed.",
    banner: "REVENGE MATCH - every one of these has beaten you before. $7 says it happens again.",
    words: 5, missesAllowed: 1, prize: 7, select: "missed", minRounds: 4,
  },
  {
    id: "pattern",
    name: "THE PATTERN AMBUSH",
    nameAlt: "THE TRICKY PATTERN TRAP",
    rule: "5 words that all share your wobbliest spelling pattern. One miss allowed.",
    banner: "PATTERN AMBUSH - these all use the pattern you keep missing.",
    words: 5, missesAllowed: 1, prize: 3, select: "pattern", minRounds: 3,
  },
];

/** The prize for a battle: fixed, or climbing with words cleared in sudden death. */
export function bossPrizeFor(type: BossType, cleared: number): number {
  if (!type.suddenDeath) return type.prize;
  if (cleared >= 10) return 5;
  if (cleared >= 8) return 4;
  if (cleared >= 6) return 3;
  if (cleared >= 4) return 2;
  return 0; // survived fewer than four: nothing, but nothing lost either
}

/** What surviving one more word would be worth, for the live climb display. */
export function bossNextPrize(type: BossType, cleared: number): number {
  if (!type.suddenDeath) return type.prize;
  for (let n = cleared + 1; n <= 12; n++) {
    const p = bossPrizeFor(type, n);
    if (p > bossPrizeFor(type, cleared)) return p;
  }
  return bossPrizeFor(type, cleared);
}

/**
 * Extra words for the study card: a few near-neighbours that are NOT in the
 * round, so studying teaches more than the test asks and he cannot tell which
 * words are about to come up. Prefers words that have beaten him before.
 */
export function buildStudyExtras(round: Entry[], bank: Entry[], save: Save, count: number): Entry[] {
  const inRound = new Set(round.map((e) => e.w));
  const levels = new Set(round.map((e) => e.l));
  const near = bank.filter((e) => !inRound.has(e.w) && (levels.has(e.l) || levels.has(e.l - 1) || levels.has(e.l + 1)));
  const missed = shuffle(near.filter((e) => (save.stats[e.w]?.m ?? 0) > 0));
  const unseen = shuffle(near.filter((e) => !save.stats[e.w]));
  const rest = shuffle(near.filter((e) => !missed.includes(e) && !unseen.includes(e)));
  const picked: Entry[] = [];
  for (const e of [...missed, ...unseen, ...rest]) {
    if (picked.length >= count) break;
    picked.push(e);
  }
  return picked;
}

export const STUDY_EXTRA_MIN = 3;
export const STUDY_EXTRA_MAX = 5;
export function studyExtraCount(roll: () => number = Math.random): number {
  return STUDY_EXTRA_MIN + Math.floor(roll() * (STUDY_EXTRA_MAX - STUDY_EXTRA_MIN + 1));
}

export function bossTypeById(id: string | null | undefined): BossType {
  return BOSS_TYPES.find((t) => t.id === id) || BOSS_TYPES[0];
}

/** Picks a battle the player has the history to face. */
export function pickBossType(save: Save, bank: Entry[], roll: () => number = Math.random): BossType {
  const missedCount = bank.filter((e) => (save.stats[e.w]?.m ?? 0) > 0).length;
  const eligible = BOSS_TYPES.filter((t) => {
    if (t.minRounds && save.rounds < t.minRounds) return false;
    if (t.select === "missed" && missedCount < t.words) return false;
    if (t.select === "pattern" && weakestPatterns(save.stats, bank).length === 0) return false;
    return true;
  });
  const pool = eligible.length > 0 ? eligible : [BOSS_TYPES[0]];
  return pool[Math.floor(roll() * pool.length)];
}

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

// -------------------------------------------------------------
// MISHEARD, NOT MISSPELLED
// The game is audio-first, so a player can hear one word and spell
// a different real word perfectly. Marking that "wrong" is unfair
// and breaks trust in the money, so those answers get one free
// retry with the meaning hint forced open instead of a miss.
// -------------------------------------------------------------
const CONFUSABLE_GROUPS: string[][] = [
  ["through", "thorough", "threw"],
  ["their", "there", "they're"],
  ["to", "too", "two"],
  ["your", "you're"],
  ["its", "it's"],
  ["hear", "here"],
  ["weather", "whether"],
  ["where", "wear", "were", "we're"],
  ["knew", "new"],
  ["know", "no"],
  ["week", "weak"],
  ["board", "bored"],
  ["brake", "break"],
  ["piece", "peace"],
  ["plain", "plane"],
  ["principal", "principle"],
  ["aloud", "allowed"],
  ["passed", "past"],
  ["lead", "led"],
  ["licence", "license"],
  ["practice", "practise"],
  ["advice", "advise"],
  ["device", "devise"],
  ["stationary", "stationery"],
  ["affect", "effect"],
  ["quiet", "quite"],
  ["lose", "loose"],
  ["desert", "dessert"],
  ["whose", "who's"],
  ["accept", "except"],
  ["breath", "breathe"],
  ["complement", "compliment"],
  ["course", "coarse"],
  ["whole", "hole"],
  ["write", "right", "rite"],
  ["night", "knight"],
  ["thought", "taught"],
  ["tail", "tale"],
  ["paws", "pause"],
  ["claws", "clause"],
  ["male", "mail"],
  ["meat", "meet"],
  ["sight", "site", "cite"],
  ["bean", "been"],
  ["flour", "flower"],
  ["grate", "great"],
  ["hair", "hare"],
  ["heal", "heel"],
  ["mane", "main"],
  ["pair", "pear", "pare"],
  ["peel", "peal"],
  ["rain", "reign", "rein"],
  ["sale", "sail"],
  ["scene", "seen"],
  ["sea", "see"],
  ["sew", "so", "sow"],
  ["some", "sum"],
  ["son", "sun"],
  ["stair", "stare"],
  ["steal", "steel"],
  ["threw", "through"],
  ["waist", "waste"],
  ["wait", "weight"],
  ["weigh", "way"],
  ["wood", "would"],
  ["allowed", "aloud"],
  ["ate", "eight"],
  ["bare", "bear"],
  ["blew", "blue"],
  ["buy", "by", "bye"],
  ["cell", "sell"],
  ["cent", "scent", "sent"],
  ["cereal", "serial"],
  ["chews", "choose"],
  ["dear", "deer"],
  ["die", "dye"],
  ["fair", "fare"],
  ["find", "fined"],
  ["for", "four"],
  ["hi", "high"],
  ["hour", "our"],
  ["made", "maid"],
  ["missed", "mist"],
  ["one", "won"],
  ["peace", "piece"],
  ["plum", "plumb"],
  ["poor", "pour", "paw"],
  ["read", "red", "reed"],
  ["road", "rode", "rowed"],
  ["role", "roll"],
  ["root", "route"],
  ["sauce", "source"],
  ["shore", "sure"],
  ["tea", "tee"],
  ["there's", "theirs"],
  ["tide", "tied"],
  ["toe", "tow"],
  ["vain", "vein"],
  ["war", "wore"],
  ["which", "witch"],
  ["wine", "whine"],
];

/** A rough phonetic key, enough to spot words that sound alike out loud. */
export function soundKey(word: string): string {
  let s = word.toLowerCase();
  const subs: [RegExp, string][] = [
    [/ough/g, "U"], [/augh/g, "A"], [/aigh/g, "A"], [/eigh/g, "A"], [/igh/g, "I"],
    [/tion|sion|cian/g, "SN"], [/cial|tial/g, "SL"],
    [/ph/g, "F"], [/^wr/g, "R"], [/^kn/g, "N"], [/^gn/g, "N"], [/mb$/g, "M"],
    [/ck/g, "K"], [/qu/g, "KW"], [/x/g, "KS"],
    [/c(?=[eiy])/g, "S"], [/g(?=[eiy])/g, "J"], [/c/g, "K"],
    [/ee|ea|ie|ei/g, "E"], [/ai|ay/g, "A"], [/oa|oe|ow/g, "O"],
    [/oo|ou|ue/g, "U"], [/y/g, "I"], [/wh/g, "W"], [/h/g, ""], [/e$/g, ""],
  ];
  for (const [re, to] of subs) s = s.replace(re, to);
  s = s.replace(/(.)\1+/g, "$1");
  return s.toUpperCase();
}

/**
 * Words the player could plausibly have heard instead of `answer`:
 * curated homophone sets, plus any word in their own bank that
 * sounds the same. Used to grant one retry instead of a miss.
 */
export function soundAlikes(answer: string, bank: Entry[]): string[] {
  const a = answer.toLowerCase();
  const out = new Set<string>();
  for (const group of CONFUSABLE_GROUPS) {
    if (group.includes(a)) for (const w of group) if (w !== a) out.add(w);
  }
  const key = soundKey(a);
  for (const e of bank) {
    const w = e.w.toLowerCase();
    if (w !== a && soundKey(w) === key) out.add(w);
  }
  return [...out];
}

/**
 * True when `guess` is a real word that sounds like the answer, not a
 * misspelling. Apostrophes count too: a voice cannot tell "dogs", "dog's" and
 * "dogs'" apart, so getting the apostrophe wrong on a heard word is an ear
 * problem. The retry keeps the teaching without stealing his money.
 */
export function isMisheard(guess: string, answer: string, bank: Entry[]): boolean {
  const g = guess.trim().toLowerCase();
  const a = answer.toLowerCase();
  if (!g || g === a) return false;
  const bare = (w: string) => w.replace(/['’]/g, "");
  if (bare(g) === bare(a) && bare(a) !== a) return true;
  return soundAlikes(a, bank).includes(g);
}

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
  credits: [],
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

export function buildRound(save: Save, bank: Entry[], maxLevel: number = MAX_LEVEL, roundSize: number = ROUND_SIZE): Entry[] {
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
      .slice(0, Math.floor(roundSize / 2))
      .forEach(take);
  }

  // 1. Review words, capped at a third of the round, with a real cooldown.
  //    A word he keeps missing used to have NO rest at all (cs === 0 passed
  //    unconditionally), so three words he could not get would occupy the same
  //    slots every round forever and the game felt stuck. Now:
  //      missed last time      -> rests one round, then returns
  //      recovering (one right)-> rests two rounds before its confirmation test
  //    and among those eligible, the least recently seen goes first, so a pool
  //    of tricky words rotates instead of the same few repeating.
  const reviewCap = Math.max(1, Math.round(roundSize / 3));
  strugglingWords(stats, bank)
    .filter((e) => (stats[e.w].cs === 0 ? seenAgo(e.w) >= 1 : seenAgo(e.w) >= 2))
    .sort((a, b) => (stats[a.w].seen || 0) - (stats[b.w].seen || 0))
    .slice(0, reviewCap)
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
  const stretching = recentAcc >= HOT_ROUND_ACC && playerLevel < maxLevel;
  const levelOrder = stretching
    ? [playerLevel, Math.min(maxLevel, playerLevel + 1), Math.max(1, playerLevel - 1)]
    : [playerLevel, Math.max(1, playerLevel - 1), Math.min(maxLevel, playerLevel + 1)];
  for (const lvl of levelOrder) {
    const fresh = shuffle(bank.filter((e) => eligible(e) && e.l === lvl && seenAgo(e.w) === Infinity));
    const rested = shuffle(bank.filter((e) => eligible(e) && e.l === lvl && seenAgo(e.w) !== Infinity));
    for (const e of [...fresh, ...rested]) {
      if (chosen.length >= roundSize) break;
      take(e);
    }
    if (chosen.length >= roundSize) break;
  }

  // 5. Relax only if the bank is nearly exhausted: first allow 1-round rest, then anything
  if (chosen.length < roundSize) {
    for (const e of shuffle(bank.filter((x) => !used.has(x.w) && seenAgo(x.w) >= 1))) {
      if (chosen.length >= roundSize) break;
      take(e);
    }
  }
  if (chosen.length < roundSize) {
    for (const e of shuffle(bank)) {
      if (chosen.length >= roundSize) break;
      take(e);
    }
  }
  return shuffle(chosen.slice(0, roundSize));
}

// Boss battle round: Chip's nastiest words at his level or one above,
// unmastered words first so the fight is real.
export function buildBossRound(save: Save, bank: Entry[], type: BossType = BOSS_TYPES[0], maxLevel: number = MAX_LEVEL): Entry[] {
  const { stats, playerLevel } = save;
  const lvlMax = Math.min(maxLevel, playerLevel + 1);
  const want = type.words;
  let pool: Entry[] = [];

  if (type.select === "missed") {
    // words that have actually beaten him, worst first
    pool = bank
      .filter((e) => (stats[e.w]?.m ?? 0) > 0)
      .sort((a, b) => (stats[b.w].m / stats[b.w].a) - (stats[a.w].m / stats[a.w].a));
  } else if (type.select === "pattern") {
    const weak = weakestPatterns(stats, bank).slice(0, 2).map((x) => x.pattern);
    pool = shuffle(bank.filter((e) => weak.includes(e.p)));
  } else if (type.select === "mixed") {
    // sudden death starts gentle and gets harder, so the climb feels earned
    const byLevel = [...bank].sort((a, b) => a.l - b.l);
    const easy = shuffle(byLevel.filter((e) => e.l <= playerLevel));
    const hard = shuffle(byLevel.filter((e) => e.l > playerLevel));
    pool = [...easy.slice(0, Math.ceil(want / 2)), ...hard, ...easy.slice(Math.ceil(want / 2))];
    return pool.slice(0, want);
  } else {
    const hard = bank.filter((e) => e.l >= playerLevel && e.l <= lvlMax);
    const unmastered = shuffle(hard.filter((e) => (stats[e.w]?.cs ?? 0) < 3));
    const mastered = shuffle(hard.filter((e) => (stats[e.w]?.cs ?? 0) >= 3));
    pool = [...unmastered, ...mastered];
  }

  const chosen: Entry[] = [];
  const used = new Set<string>();
  for (const e of pool) {
    if (chosen.length >= want) break;
    if (!used.has(e.w)) { chosen.push(e); used.add(e.w); }
  }
  // top up from the whole bank if the strategy could not fill the round
  for (const e of shuffle(bank)) {
    if (chosen.length >= want) break;
    if (!used.has(e.w)) { chosen.push(e); used.add(e.w); }
  }
  return type.suddenDeath ? chosen.slice(0, want) : shuffle(chosen.slice(0, want));
}

// Everything that happens when a round ends, as a pure function so it can be
// applied both live (finishRound) and when settling an orphaned round found

type SettleInput = {
  isPractice: boolean;
  isCustom: boolean; // custom school-list rounds never move rank, records, or the Chip record
  isBoss: boolean; // free-entry challenge: no rank/level effects except a ladder win
  bossMissAllowed?: number; // misses this battle type permits
  bossPrize?: number; // prize if won, already resolved by the caller ($2-$5)
  bossLabel?: string; // battle name for the ledger
  stretch?: boolean; // played one level up, with no hints, for a bigger payout
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
  /** this player's top level, so a longer ladder promotes further */
  maxLevel?: number;
};

export type SettleResult = {
  next: Save;
  payout: Payout;
  bailedOut: boolean;
  leveledUp: boolean;
  leveledDown: boolean;
  rankUp: string | null;
  newRecords: string[];
  /** words he used to miss and has now got right twice running */
  newlyOwned: string[];
  streakBonus: number;
  streakBroken: number;
  respectBonus: number;
};

export function settleRound(save: Save, p: SettleInput): SettleResult {
  const misses = p.missedWords.length;
  const bossAllowed = p.bossMissAllowed ?? 1;
  const bossPrize = p.bossPrize ?? 0;
  const bossWon = p.isBoss && misses <= bossAllowed && bossPrize > 0;
  const pay: { label: string; amount: number; mult: number } = p.isBoss
    ? { label: bossWon ? "bosswin" : "bossloss", amount: bossWon ? bossPrize : 0, mult: 0 }
    : p.isPractice
      ? { label: "practice", amount: 0, mult: 0 }
      : payoutFor(misses, p.roundTotal, p.bet);
  // A stretch round is harder by choice, so a win pays more. Losses are
  // unchanged: choosing the hard road must never cost extra.
  // The bonus applies to the WINNINGS, never the returned stake, so "1.5x the
  // win" means exactly that. Multiplying the gross return paid up to 2.6x.
  if (p.stretch && !p.isPractice && !p.isBoss && !p.isCustom && pay.amount > p.bet) {
    pay.amount = p.bet + Math.round((pay.amount - p.bet) * STRETCH_MULTIPLIER);
  }
  const newBank = p.isBoss
    ? save.bank + pay.amount
    : p.isPractice ? save.bank : Math.max(0, save.bank - p.bet + pay.amount);

  // Update word stats (first-try outcomes only; revenge laps are practice)
  const stats = { ...save.stats };
  const roundNum = save.rounds + 1;
  const newlyOwned: string[] = [];
  for (const w of p.roundWords) {
    const st = stats[w] || { a: 0, m: 0, cs: 0, seen: 0 };
    const missed = p.missedWords.includes(w);
    // a word he used to get wrong, now right twice running, is his
    if (!missed && st.m > 0 && st.cs + 1 === READY_STREAK) newlyOwned.push(w);
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
    const top = p.maxLevel ?? MAX_LEVEL;
    if (hotStreak >= HOT_ROUNDS_TO_LEVEL_UP && playerLevel < top) {
      playerLevel += 1;
      hotStreak = 0;
      leveledUp = true;
    } else if (hotStreak >= HOT_ROUNDS_TO_LEVEL_UP && playerLevel >= top) {
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
    boss.typeId = null;
    boss.lastRound = roundNum;
    boss.nextAt = nextBossAt(roundNum);
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
    } else {
      if (save.day !== null && save.dayStreak >= 3) streakBroken = save.dayStreak;
      dayStreak = 1;
    }
    // Paid for finishing a round today, once per calendar day
    streakBonus = streakBonusFor(dayStreak);
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
      label: bossWon
        ? `${p.bossLabel || "BOSS BATTLE"}: won, ${misses} ${misses === 1 ? "miss" : "misses"}`
        : `${p.bossLabel || "BOSS BATTLE"}: lost (free entry, nothing staked)`,
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
    history = withHistory(history, { d: today, type: "bonus", label: `Day ${dayStreak} streak reward${streakBonus >= STREAK_MILESTONE ? " - 10 day milestone!" : ""}`, net: streakBonus, bank });
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
  return { next, payout, bailedOut, leveledUp, leveledDown, rankUp, newRecords, newlyOwned, streakBonus, streakBroken, respectBonus };
}

// Doodle-burst sparks for a correct answer: fixed fan-out so the animation
