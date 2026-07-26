// Per-player themes. The engine is shared; everything a player sees - their
// word bank, their rival, their rank ladder, their collection - comes from
// here. Each player also gets their own save key, so bankrolls, ledgers and
// records never mix.
import type { Entry, Rank, Doodle } from "./engine";
import {
  HUNTER_BANK, HUNTER_PRAISE, HUNTER_PRAISE_HOT, HUNTER_ROASTS,
  HUNTER_GENERIC_TRICK, HUNTER_BOSS_TAUNTS, HUNTER_RANKS, HUNTER_DOODLES,
} from "./words-hunter";
import {
  MILLIE_BANK, MILLIE_PRAISE, MILLIE_PRAISE_HOT, MILLIE_ROASTS,
  MILLIE_GENERIC_TRICK, MILLIE_BOSS_TAUNTS, MILLIE_RANKS, MILLIE_DOODLES,
} from "./words-millie";

export type ProfileId = "hunter" | "millie";

export type Theme = {
  id: ProfileId;
  playerName: string;
  playerIcon: string;
  /** Short host name used inline: "YOU 3 - 1 CHIP", "REMATCH CHIP" */
  hostName: string;
  /** Full host name for introductions */
  hostFull: string;
  mascot: "chip" | "cat";
  accent: string;
  tagline: string;
  intro: string;
  bank: Entry[];
  praise: string[];
  praiseHot: string[];
  roasts: string[];
  genericTrick: string;
  bossTaunts: string[];
  bossLabel: string;
  ranks: Rank[];
  doodles: Doodle[];
  bailoutFund: string;
  cheatSheetLabel: string;
  clipboardLabel: string;
  retypeLabel: string;
  escapeLine: string;
  collectionLabel: string;
  dropLabel: string;
  shelfLabel: string;
  emptyShelf: string;
};

export const HUNTER: Theme = {
  id: "hunter",
  playerName: "Hunter",
  playerIcon: "✏️",
  hostName: "CHIP",
  hostFull: "Chip",
  mascot: "chip",
  accent: "#E8A5A5",
  tagline: "Chip says the word. You spell it. Real(ish) money on the line.",
  intro: "Place your bet, or warm up in practice for free. The closer to perfect, the bigger the payout. Only a total blowout takes the lot.",
  bank: HUNTER_BANK,
  praise: HUNTER_PRAISE,
  praiseHot: HUNTER_PRAISE_HOT,
  roasts: HUNTER_ROASTS,
  genericTrick: HUNTER_GENERIC_TRICK,
  bossTaunts: HUNTER_BOSS_TAUNTS,
  bossLabel: "BOSS BATTLE",
  ranks: HUNTER_RANKS,
  doodles: HUNTER_DOODLES,
  bailoutFund: "Cheez Doodle fund",
  cheatSheetLabel: "CHIP'S CHEAT SHEET (Mrs. Godfrey hates this)",
  clipboardLabel: "CHIP'S CLIPBOARD",
  retypeLabel: "Now YOU write it. That's how you get out of detention:",
  escapeLine: "Detention escaped. It comes back later for revenge, though.",
  collectionLabel: "Doodle collection",
  dropLabel: "DOODLE DROP",
  shelfLabel: "THE TROPHY SHELF",
  emptyShelf: "Empty shelf. Chip says that's embarrassing.",
};

export const MILLIE: Theme = {
  id: "millie",
  playerName: "Millie",
  playerIcon: "🐱",
  hostName: "DONUT",
  hostFull: "Princess Donut",
  mascot: "cat",
  accent: "#D98BB9",
  tagline: "Princess Donut says the word. You spell it. Real(ish) money on the line.",
  intro: "Place your bet, or warm up in practice for free. The closer to perfect, the bigger the payout and the sadder my little royal face. Only a total disaster takes the lot.",
  bank: MILLIE_BANK,
  praise: MILLIE_PRAISE,
  praiseHot: MILLIE_PRAISE_HOT,
  roasts: MILLIE_ROASTS,
  genericTrick: MILLIE_GENERIC_TRICK,
  bossTaunts: MILLIE_BOSS_TAUNTS,
  bossLabel: "ROYAL FIVE",
  ranks: MILLIE_RANKS,
  doodles: MILLIE_DOODLES,
  bailoutFund: "Emergency Sardine Fund",
  cheatSheetLabel: "DONUT'S ROYAL CHEAT SHEET (do not tell the dogs)",
  clipboardLabel: "DONUT'S CLIPBOARD",
  retypeLabel: "Now YOU write it. That is how you earn a royal pardon:",
  escapeLine: "Pardoned by the Queen. That word still comes back later, though. It holds a grudge.",
  collectionLabel: "Sticker album",
  dropLabel: "STICKER DROP",
  shelfLabel: "THE PRIZE SHELF",
  emptyShelf: "Nothing on the shelf yet. Even Norman has more prizes than this.",
};

export const THEMES: Record<ProfileId, Theme> = { hunter: HUNTER, millie: MILLIE };
export const PROFILES: Theme[] = [HUNTER, MILLIE];

/** Per-player storage keys. Hunter's legacy unsuffixed save migrates to his. */
export const LEGACY_STORE_KEY = "spelling-showdown-v1";
export const LEGACY_ROUND_KEY = "spelling-showdown-round-v1";
export const PROFILE_KEY = "spelling-showdown-player";
export const storeKey = (id: ProfileId) => `${LEGACY_STORE_KEY}:${id}`;
export const roundKey = (id: ProfileId) => `${LEGACY_ROUND_KEY}:${id}`;
