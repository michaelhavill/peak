"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ROUND_SIZE, STARTING_BANK, BROKE_BAILOUT, MAX_LEVEL, PAYDAY_GOAL,
  CUSTOM_ROUND_CAP, BONUS_WORD_CASH, DOODLE_DROP_CHANCE,
  BOSS_WORD_COUNT, BOSS_MISS_ALLOWED, BOSS_PRIZE, BOSS_MIN_GAP, BOSS_CHANCE,
  FRESH_SAVE, HOMOPHONE_HINTS,
  payoutFor, shuffle, pick, safeHint, todayStr, withHistory,
  weakestPatterns, strugglingWords, buildRound, buildBossRound,
  settleRound, rankFor, pickDoodleDrop, alignDiff, isMisheard, soundAlikes, applyCredits, nextStreakBonus, streakBonusFor,
} from "./engine";
import type {
  Entry, Save, Payout, Records, ChipRecord, BossState, RoundSnapshot,
} from "./engine";
import { THEMES, PROFILES, PROFILE_KEY, storeKey, roundKey, LEGACY_STORE_KEY, LEGACY_ROUND_KEY } from "./themes";
import type { ProfileId, Theme } from "./themes";

let audioCtx: AudioContext | null = null;
function playSfx(kind: "correct" | "wrong" | "bonus" | "win" | "lose" | "rankup" | "record" | "boss", on: boolean) {
  if (!on || typeof window === "undefined") return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    const ctx = audioCtx;
    const t0 = ctx.currentTime;
    const note = (freq: number, start: number, dur: number, type: OscillatorType = "triangle", gain = 0.12) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain, t0 + start);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + start + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t0 + start);
      o.stop(t0 + start + dur + 0.02);
    };
    if (kind === "correct") { note(660, 0, 0.09); note(880, 0.09, 0.13); }
    else if (kind === "wrong") { note(170, 0, 0.16, "sawtooth", 0.07); }
    else if (kind === "bonus") { note(1046, 0, 0.08); note(1318, 0.08, 0.16); }
    else if (kind === "win") { [523, 659, 784, 1046].forEach((f, i) => note(f, i * 0.09, 0.13)); }
    else if (kind === "lose") { note(220, 0, 0.14, "sawtooth", 0.06); note(174, 0.14, 0.22, "sawtooth", 0.06); }
    else if (kind === "rankup") { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => note(f, i * 0.08, 0.15)); }
    else if (kind === "record") { note(1046, 0, 0.07); note(1568, 0.07, 0.2); }
    else if (kind === "boss") { note(196, 0, 0.18, "sawtooth", 0.09); note(147, 0.2, 0.3, "sawtooth", 0.09); }
  } catch { /* sound is a garnish, never an error */ }
}

const SPARKS = [
  { c: "⭐", x: -70, y: -45, r: -20 },
  { c: "✨", x: 60, y: -60, r: 15 },
  { c: "💥", x: 95, y: 0, r: 30 },
  { c: "⭐", x: -100, y: 5, r: -35 },
  { c: "✨", x: -50, y: 50, r: 10 },
  { c: "🎉", x: 80, y: 45, r: 25 },
  { c: "⚡", x: 15, y: -75, r: 45 },
  { c: "⭐", x: -10, y: 65, r: -15 },
];

// One-liner shown under a correct answer in a betting round: what the round
// pays if he holds this pace to the end.
function potLine(p: { label: string; amount: number }) {
  switch (p.label) {
    case "clean": return `Pot: $${p.amount}. Perfect pace, that's DOUBLE your bet!`;
    case "good": return `Pot: $${p.amount}. One slip, still winning!`;
    case "even": return `Pot: $${p.amount}. Money back so far, keep pushing!`;
    case "graze":
    case "half":
    case "rough": return `$${p.amount} still on the table. Rescue mission!`;
    default: return "The bet's gone, but glory is still available. Finish strong.";
  }
}

const PAGE_CSS = `
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Nunito:wght@400;700;900&display=swap');
        .wrap {
          min-height: 100vh;
          background-color: #FDFBF4;
          background-image: repeating-linear-gradient(#FDFBF4 0px, #FDFBF4 31px, #C9D8F0 32px);
          font-family: 'Nunito', system-ui, sans-serif;
          color: #1D2A44;
          display: flex; justify-content: center;
          padding: 24px 16px 48px; position: relative;
        }
        .wrap::before {
          content: ''; position: fixed; top: 0; bottom: 0; left: 44px;
          width: 2px; background: var(--spell-accent, #E8A5A5); z-index: 0;
        }
        .page { width: 100%; max-width: 620px; position: relative; z-index: 1; }
        .hand { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; }
        h1.hand { font-size: 44px; line-height: 1; margin: 0 0 4px; transform: rotate(-1.5deg); }
        .sub { font-size: 15px; margin: 0 0 18px; color: #4A4A45; }
        .card {
          background: #fff; border: 3px solid #1D2A44; border-radius: 10px;
          box-shadow: 4px 4px 0 #1D2A44; padding: 22px; margin-bottom: 18px;
        }
        .bubble {
          position: relative; background: #fff; border: 3px solid #1D2A44;
          border-radius: 16px; padding: 14px 18px; font-size: 19px; margin-left: 10px; flex: 1;
        }
        .bubble::before { content: ''; position: absolute; left: -16px; top: 34px; border: 8px solid transparent; border-right-color: #1D2A44; }
        .bubble::after { content: ''; position: absolute; left: -11px; top: 36px; border: 6px solid transparent; border-right-color: #fff; }
        .row { display: flex; align-items: flex-start; gap: 4px; }
        .btn {
          font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 20px;
          background: #FFE24A; border: 3px solid #1D2A44; border-radius: 8px;
          box-shadow: 3px 3px 0 #1D2A44; padding: 8px 20px; cursor: pointer; color: #1D2A44;
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .btn:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 #1D2A44; }
        .btn:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 #1D2A44; }
        .btn:focus-visible { outline: 3px dashed #2B5FD9; outline-offset: 3px; }
        .btn.ghost { background: #fff; font-size: 17px; }
        .btn.blue { background: #2B5FD9; color: #fff; }
        .btn.red { background: #D63B2F; color: #fff; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn.betpick { background: #fff; }
        .btn.betpick.on { background: #2E8B57; color: #fff; }
        .spellinput {
          font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 30px; letter-spacing: 3px;
          width: 100%; box-sizing: border-box; border: none; border-bottom: 3px dashed #1D2A44;
          background: transparent; padding: 6px 4px; color: #2B5FD9;
        }
        .spellinput:focus { outline: none; border-bottom-color: #2B5FD9; }
        .statbar {
          display: flex; justify-content: space-between; font-weight: 900; font-size: 13px;
          text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; flex-wrap: wrap; gap: 6px;
        }
        .stamp {
          font-family: 'Patrick Hand', 'Comic Sans MS', cursive; display: inline-block;
          border: 3px solid #D63B2F; color: #D63B2F; font-size: 26px; padding: 2px 14px;
          border-radius: 6px; transform: rotate(-6deg); animation: stampIn 0.25s ease-out;
        }
        .stamp.good { border-color: #2E8B57; color: #2E8B57; transform: rotate(4deg); }
        @keyframes stampIn { from { transform: scale(2.2) rotate(-6deg); opacity: 0; } to { transform: scale(1) rotate(-6deg); opacity: 1; } }
        .burst { position: relative; display: inline-block; }
        .spark {
          position: absolute; left: 45%; top: 25%; font-size: 20px;
          pointer-events: none; opacity: 0; animation: sparkfly 0.8s ease-out forwards;
        }
        @keyframes sparkfly {
          0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(1.2) rotate(var(--rot)); opacity: 0; }
        }
        .winline { font-size: 21px; color: #2E8B57; margin: 12px 0 0; transform: rotate(-1deg); animation: winpop 0.3s ease-out; }
        @keyframes winpop { from { transform: scale(0.6) rotate(-1deg); opacity: 0; } to { transform: scale(1) rotate(-1deg); opacity: 1; } }
        .sentline { font-size: 15px; color: #4A4A45; margin: 10px 0 0; font-style: italic; }
        .bonusline { font-size: 20px; color: #B8860B; margin: 10px 0 0; transform: rotate(-1deg); animation: winpop 0.3s ease-out; }
        .warnline { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; color: #D63B2F; font-size: 17px; margin: 8px 0 0; }
        .rankup {
          font-size: 26px; color: #B8860B; border: 3px solid #B8860B; display: inline-block;
          padding: 3px 14px; border-radius: 8px; transform: rotate(-2deg); margin: 12px 0 0;
          background: #FFFDF0; animation: stampIn 0.25s ease-out;
        }
        .recordline { font-size: 20px; color: #2E8B57; margin: 6px 0 0; animation: winpop 0.3s ease-out; }
        .leveldown { font-size: 19px; color: #D63B2F; margin: 8px 0 0; }
        .goalwrap { height: 12px; background: #EEF3FF; border: 2px solid #1D2A44; border-radius: 8px; overflow: hidden; margin-top: 12px; }
        .goalbar { height: 100%; background: #2E8B57; transition: width 0.4s ease; }
        .goalbar.blue { background: #2B5FD9; }
        .statchip { display: inline-block; background: #fff; border: 2px solid #1D2A44; border-radius: 8px; padding: 2px 10px; margin: 4px 6px 0 0; font-size: 13px; font-weight: 700; }
        .vsline { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 22px; }
        .doodleshelf { font-size: 22px; letter-spacing: 4px; margin: 4px 0 0; }
        .doodledrop { display: flex; gap: 12px; align-items: center; background: #FFFDF0; border: 3px dashed #B8860B; border-radius: 10px; padding: 12px 14px; margin-top: 12px; animation: winpop 0.3s ease-out; }
        .doodleicon { font-size: 42px; }
        @media (prefers-reduced-motion: reduce) { .stamp { animation: none; } .btn { transition: none; } .spark { display: none; } .winline, .bonusline, .recordline, .rankup, .doodledrop { animation: none; } .goalbar { transition: none; } }
        .flash { font-size: 17px; margin-top: 8px; font-weight: 700; }
        .missrow { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px dashed #C9D8F0; font-size: 16px; }
        .tag { font-size: 12px; font-weight: 900; text-transform: uppercase; background: #FFE24A; border: 2px solid #1D2A44; border-radius: 20px; padding: 1px 10px; }
        textarea.paste { width: 100%; box-sizing: border-box; min-height: 90px; font-family: 'Nunito', sans-serif; font-size: 15px; border: 3px solid #1D2A44; border-radius: 8px; padding: 10px; background: #fff; }
        .lap { font-family: 'Patrick Hand', cursive; color: #D63B2F; font-size: 18px; transform: rotate(-1deg); margin-bottom: 8px; }
        .btnrow { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 14px; }
        .cheat { background: #FFFDF0; border: 3px dashed #1D2A44; border-radius: 10px; padding: 14px 16px; margin-top: 14px; transform: rotate(-0.6deg); }
        .cheatlabel { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 15px; letter-spacing: 2px; color: #D63B2F; margin: 0 0 6px; }
        .bigword { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 34px; letter-spacing: 4px; margin: 2px 0 8px; word-break: break-all; }
        .mark { background: #FFE24A; border-radius: 4px; padding: 0 2px; box-shadow: 0 0 0 2px #FFE24A; }
        .diffline { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 22px; letter-spacing: 4px; margin: 0 0 8px; word-break: break-all; }
        .diffbad { color: #D63B2F; text-decoration: line-through; }
        .diffgap {
          display: inline-block; min-width: 0.6em; background: #FFE24A; border-radius: 4px;
          border-bottom: 3px solid #D63B2F; margin: 0 1px;
        }
        .creditcard { background: #EAF7EE; border: 3px solid #2E8B57; border-radius: 10px; padding: 12px 14px; margin-top: 12px; }
        .diffnote { font-size: 14px; font-weight: 700; margin: 2px 0 6px; color: #4A4A45; }
        .tricktext { font-size: 16px; margin: 8px 0 0; line-height: 1.45; }
        .retypelabel { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 19px; margin: 14px 0 2px; }
        .retypeinput { font-family: 'Patrick Hand', 'Comic Sans MS', cursive; font-size: 26px; letter-spacing: 3px; width: 100%; box-sizing: border-box; border: none; border-bottom: 3px dashed #D63B2F; background: transparent; padding: 4px; color: #1D2A44; }
        .retypeinput:focus { outline: none; }
        .retypeinput.ok { border-bottom: 3px solid #2E8B57; color: #2E8B57; }
        .escaped { font-family: 'Patrick Hand', cursive; color: #2E8B57; font-size: 18px; margin-top: 6px; }
        .wallet {
          font-family: 'Patrick Hand', cursive; font-size: 40px; color: #2E8B57;
          border: 3px solid #1D2A44; border-radius: 10px; box-shadow: 3px 3px 0 #1D2A44;
          background: #fff; display: inline-block; padding: 4px 22px; transform: rotate(-1deg);
        }
        .walletlabel { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #4A4A45; }
        .payline { font-size: 15px; margin: 3px 0; }
        .bailout { font-family: 'Patrick Hand', cursive; font-size: 18px; color: #D63B2F; margin: 8px 0; transform: rotate(-0.5deg); }
        .coach { background: #EEF3FF; border: 3px solid #1D2A44; border-radius: 10px; padding: 14px 16px; margin-top: 14px; }
        .savewarn { font-size: 13px; color: #D63B2F; font-weight: 700; }
        .toggle { background: none; border: none; font-family: 'Nunito'; font-weight: 900; font-size: 14px; color: #2B5FD9; cursor: pointer; text-decoration: underline; padding: 0; }
        .pickgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; }
        @media (max-width: 460px) { .pickgrid { grid-template-columns: 1fr; } }
        .pickcard {
          background: #fff; border: 3px solid #1D2A44; border-radius: 12px;
          box-shadow: 4px 4px 0 #1D2A44; padding: 22px 16px; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          font-family: 'Nunito', system-ui, sans-serif; color: #1D2A44;
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .pickcard:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1D2A44; }
        .pickcard:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 #1D2A44; }
        .pickcard:focus-visible { outline: 3px dashed #2B5FD9; outline-offset: 3px; }
        .pickicon { font-size: 46px; line-height: 1; }
        .pickname { font-size: 30px; }
        .picksub { font-size: 13px; font-weight: 700; color: #4A4A45; }
        .picklast { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; background: #FFE24A; border: 2px solid #1D2A44; border-radius: 20px; padding: 1px 10px; margin-top: 4px; }
        .whoami { font-size: 13px; font-weight: 900; color: #4A4A45; }
`;

type Mood = "happy" | "sad" | "neutral";

// -- Millie's host: Princess Donut, a doodle cat who believes she is royalty --
function DonutCat({ mood }: { mood: Mood }) {
  const mouth =
    mood === "happy" ? "M 42 66 Q 50 74 58 66" :
    mood === "sad" ? "M 42 70 Q 50 62 58 70" :
    "M 44 68 L 56 68";
  return (
    <svg viewBox="0 0 100 110" width="86" height="95" aria-hidden="true">
      {/* crown, because obviously */}
      <path d="M 33 20 L 36 6 L 44 15 L 50 4 L 56 15 L 64 6 L 67 20 Z"
        fill="#FFE24A" stroke="#1D2A44" strokeWidth="2.5" strokeLinejoin="round" />
      {/* ears */}
      <path d="M 26 44 L 24 22 L 42 32 Z" fill="#FDFBF4" stroke="#1D2A44" strokeWidth="3" strokeLinejoin="round" />
      <path d="M 74 44 L 76 22 L 58 32 Z" fill="#FDFBF4" stroke="#1D2A44" strokeWidth="3" strokeLinejoin="round" />
      <path d="M 29 40 L 28 29 L 38 34 Z" fill="#F3C6DC" />
      <path d="M 71 40 L 72 29 L 62 34 Z" fill="#F3C6DC" />
      <ellipse cx="50" cy="54" rx="29" ry="26" fill="#FDFBF4" stroke="#1D2A44" strokeWidth="3" />
      {/* eyes: pleased slits when happy, wide when not */}
      {mood === "happy" ? (
        <>
          <path d="M 34 50 Q 39 45 44 50" fill="none" stroke="#1D2A44" strokeWidth="3" strokeLinecap="round" />
          <path d="M 56 50 Q 61 45 66 50" fill="none" stroke="#1D2A44" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="39" cy="49" r="4" fill="#1D2A44" />
          <circle cx="61" cy="49" r="4" fill="#1D2A44" />
        </>
      )}
      {mood === "sad" && (
        <>
          <path d="M 32 41 L 44 45" stroke="#1D2A44" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 68 41 L 56 45" stroke="#1D2A44" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {/* nose and mouth */}
      <path d="M 47 60 L 53 60 L 50 64 Z" fill="#F3C6DC" stroke="#1D2A44" strokeWidth="1.5" />
      <path d={mouth} fill="none" stroke="#1D2A44" strokeWidth="2.5" strokeLinecap="round" />
      {/* whiskers */}
      <path d="M 20 56 L 36 58 M 20 63 L 36 62" stroke="#1D2A44" strokeWidth="2" strokeLinecap="round" />
      <path d="M 80 56 L 64 58 M 80 63 L 64 62" stroke="#1D2A44" strokeWidth="2" strokeLinecap="round" />
      {/* fluffy chest */}
      <path d="M 36 79 Q 50 76 64 79 Q 60 96 50 104 Q 40 96 36 79 Z"
        fill="#F3C6DC" stroke="#1D2A44" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

// -- Doodle mascot: original character "Chip" --
function Chip({ mood, variant = "chip" }: { mood: Mood; variant?: "chip" | "cat" }) {
  if (variant === "cat") return <DonutCat mood={mood} />;
  const mouth =
    mood === "happy" ? "M 38 62 Q 50 74 62 62" :
    mood === "sad" ? "M 38 68 Q 50 58 62 68" :
    "M 40 65 L 60 65";
  return (
    <svg viewBox="0 0 100 110" width="86" height="95" aria-hidden="true">
      <path d="M 25 30 L 30 12 L 38 26 L 46 8 L 52 25 L 62 10 L 66 27 L 76 18 L 74 32"
        fill="none" stroke="#1D2A44" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="50" cy="52" rx="28" ry="30" fill="#FDFBF4" stroke="#1D2A44" strokeWidth="3" />
      <circle cx="40" cy="46" r={mood === "happy" ? 3.5 : 3} fill="#1D2A44" />
      <circle cx="60" cy="46" r={mood === "happy" ? 3.5 : 3} fill="#1D2A44" />
      {mood === "sad" && (
        <>
          <path d="M 34 38 L 45 42" stroke="#1D2A44" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 66 38 L 55 42" stroke="#1D2A44" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      <path d="M 50 50 Q 54 56 49 58" fill="none" stroke="#1D2A44" strokeWidth="2.5" strokeLinecap="round" />
      <path d={mouth} fill="none" stroke="#1D2A44" strokeWidth="3" strokeLinecap="round" />
      <path d="M 36 82 Q 50 78 64 82 L 68 105 Q 50 100 32 105 Z"
        fill="#FFE24A" stroke="#1D2A44" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function MarkedWord({ word, danger }: { word: string; danger: string | null }) {
  if (!danger) return <div className="bigword">{word}</div>;
  const i = word.toLowerCase().indexOf(danger.toLowerCase());
  if (i === -1) return <div className="bigword">{word}</div>;
  return (
    <div className="bigword">
      {word.slice(0, i)}
      <span className="mark">{word.slice(i, i + danger.length)}</span>
      {word.slice(i + danger.length)}
    </div>
  );
}

function DiffGuess({ guess, answer }: { guess: string; answer: string }) {
  // Alignment-aware: a dropped letter shows as a gap at the right spot instead
  // of turning the whole tail of the word red.
  //
  // The gap is rendered as an empty slot, NEVER as the missing letter itself.
  // Printing the letter here made this line read as the correct spelling, so a
  // player who typed "fiend" saw "YOU WROTE: friend" and thought the game had
  // marked a correct answer wrong.
  const ops = alignDiff(guess, answer);
  const missing = ops.filter((o) => o.kind === "missing").map((o) => o.ch);
  return (
    <>
      <div className="diffline" aria-label={`You wrote ${guess}`}>
        {ops.map((op, i) =>
          op.kind === "missing" ? (
            <span key={i} className="diffgap" aria-hidden="true">&nbsp;</span>
          ) : (
            <span key={i} className={op.kind === "ok" ? "" : "diffbad"}>{op.ch}</span>
          )
        )}
      </div>
      {missing.length > 0 && (
        <p className="diffnote">
          You left {missing.length === 1 ? "a letter" : `${missing.length} letters`} out, where the yellow gap
          {missing.length === 1 ? " is" : "s are"}: <b>{missing.join(" ")}</b>
        </p>
      )}
    </>
  );
}

export default function SpellingShowdown() {
  // Who is playing. Null shows the player picker. Each player has their own
  // save key, so bankrolls, ledgers, ranks and word stats never mix.
  const [profileId, setProfileId] = useState<ProfileId | null>(null);
  const [lastPlayer, setLastPlayer] = useState<ProfileId | null>(null);
  const [save, setSave] = useState<Save | null>(null); // persistent state, null while loading
  const [storageOk, setStorageOk] = useState(true);
  const [screen, setScreen] = useState<"start" | "play" | "done">("start");
  const [bet, setBet] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const [customText, setCustomText] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [queue, setQueue] = useState<Entry[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"ask" | "right" | "wrong" | "misheard">("ask");
  const [mishearWord, setMishearWord] = useState<string | null>(null);
  const [mishearGuess, setMishearGuess] = useState("");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [missedWords, setMissedWords] = useState<Entry[]>([]);
  const [redo, setRedo] = useState<Entry[]>([]);
  const [flash, setFlash] = useState("");
  const [hintShown, setHintShown] = useState(false);
  const [retype, setRetype] = useState("");
  const [lastGuess, setLastGuess] = useState("");
  const [roundTotal, setRoundTotal] = useState(ROUND_SIZE);
  const [payout, setPayout] = useState<Payout | null>(null); // set when round finishes
  const [confirmCashout, setConfirmCashout] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [bailoutMsg, setBailoutMsg] = useState("");
  const [levelMsg, setLevelMsg] = useState("");
  const [resumed, setResumed] = useState(false);
  const [creditMsg, setCreditMsg] = useState("");
  const [isCustomRound, setIsCustomRound] = useState(false);
  const [isBossRound, setIsBossRound] = useState(false);
  const [bossTeaser, setBossTeaser] = useState(false);
  const [customError, setCustomError] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [bonusWord, setBonusWord] = useState<string | null>(null);
  const [bonusWon, setBonusWon] = useState(false);
  const [extras, setExtras] = useState<{
    rankUp: string | null;
    newRecords: string[];
    streakBonus: number;
    streakBroken: number;
    respectBonus: number;
    leveledDown: number;
    doodleDrop: string | null;
  } | null>(null);
  const [speechOk, setSpeechOk] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const retypeRef = useRef<HTMLInputElement>(null);
  const savedThisRound = useRef(false);
  const roundWordsRef = useRef<string[]>([]);

  // The active player's theme and storage keys. Falls back to Hunter's theme
  // while the picker is open so the shared render paths always have copy.
  const theme: Theme = THEMES[profileId ?? "hunter"];
  const keys = {
    store: storeKey(profileId ?? "hunter"),
    round: roundKey(profileId ?? "hunter"),
  };

  // -- One-time setup: remember the last player, and adopt the pre-profiles
  // save as Hunter's so his bankroll, ledger, rank and word stats carry over.
  useEffect(() => {
    try {
      const legacy = localStorage.getItem(LEGACY_STORE_KEY);
      if (legacy && !localStorage.getItem(storeKey("hunter"))) {
        localStorage.setItem(storeKey("hunter"), legacy);
        const legacyRound = localStorage.getItem(LEGACY_ROUND_KEY);
        if (legacyRound && !localStorage.getItem(roundKey("hunter"))) {
          localStorage.setItem(roundKey("hunter"), legacyRound);
        }
      }
      const last = localStorage.getItem(PROFILE_KEY);
      if (last === "hunter" || last === "millie") setLastPlayer(last);
    } catch { /* storage unavailable: the picker still works, nothing persists */ }
  }, []);

  function choosePlayer(id: ProfileId) {
    // Clear any in-flight round state from the previous player
    setScreen("start");
    setSave(null);
    setBet(0);
    setQueue([]);
    setIdx(0);
    setPayout(null);
    setExtras(null);
    setBailoutMsg("");
    setLevelMsg("");
    setResumed(false);
    setBonusWord(null);
    setBonusWon(false);
    setCustomText("");
    setShowCustom(false);
    setConfirmCashout(false);
    savedThisRound.current = false;
    try { localStorage.setItem(PROFILE_KEY, id); } catch {}
    setLastPlayer(id);
    setProfileId(id);
  }

  // -- Load the chosen player's save (localStorage; per browser/device) --
  useEffect(() => {
    if (!profileId) return;
    const keys = { store: storeKey(profileId), round: roundKey(profileId) };
    let loaded: Save = { ...FRESH_SAVE };
    let ok = true;
    try {
      const raw = localStorage.getItem(keys.store);
      if (raw) loaded = { ...FRESH_SAVE, ...JSON.parse(raw) };
      else localStorage.setItem(keys.store, JSON.stringify(loaded));
    } catch {
      ok = false;
    }
    setStorageOk(ok);
    // Pay any one-off make-good owed to this player, once
    const credited = applyCredits(loaded, profileId);
    if (credited.messages.length > 0) {
      loaded = credited.next;
      setCreditMsg(credited.messages.join(" "));
      try { localStorage.setItem(keys.store, JSON.stringify(loaded)); } catch {}
    }
    if (loaded.bank < 1) {
      loaded.bank = BROKE_BAILOUT;
      loaded.history = withHistory(loaded.history, { d: todayStr(), type: "bailout", label: `${theme.bailoutFund} bailout`, net: BROKE_BAILOUT, bank: BROKE_BAILOUT });
      setBailoutMsg(`You were broke, so ${theme.hostFull} fronted you $${BROKE_BAILOUT} from the ${theme.bailoutFund}.`);
    }

    // Restore an unfinished round. Previously a reload or closed tab mid-round
    // lost the round without scoring it and dealt a fresh question set.
    try {
      const rawRound = localStorage.getItem(keys.round);
      const sn: RoundSnapshot | null = rawRound ? JSON.parse(rawRound) : null;
      if (sn && Array.isArray(sn.queue) && sn.queue.length > 0) {
        let q: Entry[] = sn.queue;
        let i = Math.min(Math.max(sn.idx || 0, 0), q.length - 1);
        let rd: Entry[] = Array.isArray(sn.redo) ? sn.redo : [];
        let complete = false;
        if (sn.answered) {
          // The current word was already answered; advance the way next() would
          if (i + 1 < q.length) i += 1;
          else if (rd.length > 0) { q = shuffle(rd); rd = []; i = 0; }
          else complete = true;
        }
        setBet(sn.bet || 0);
        setIsPractice(!!sn.isPractice);
        setIsCustomRound(!!sn.isCustom);
        setIsBossRound(!!sn.isBoss);
        setMissedWords(sn.missed || []);
        setFirstTryCorrect(sn.firstTryCorrect || 0);
        setBestStreak(sn.bestStreak || 0);
        setRoundTotal(sn.roundTotal || q.length);
        setBonusWord(sn.bonusWord || null);
        setBonusWon(!!sn.bonusWon);
        roundWordsRef.current = sn.roundWords || [];
        if (complete) {
          // Every word was answered but the round never got scored: settle it
          // now so the bet and the word stats aren't lost.
          const res = settleRound(loaded, {
            isPractice: !!sn.isPractice,
            isCustom: !!sn.isCustom,
            isBoss: !!sn.isBoss,
            bet: sn.bet || 0,
            roundTotal: sn.roundTotal || q.length,
            firstTryCorrect: sn.firstTryCorrect || 0,
            roundWords: sn.roundWords || [],
            missedWords: (sn.missed || []).map((m) => m.w),
            ranks: theme.ranks,
            bestStreakRound: sn.bestStreak || 0,
            bonusWon: !!sn.bonusWon,
            doodleDrop: null,
          });
          loaded = res.next;
          if (res.leveledUp) setLevelMsg(`LEVEL UP. Two hot rounds in a row - ${theme.hostFull} is moving you to level ${res.next.playerLevel} words.`);
          if (res.bailedOut) setBailoutMsg(`Busted to zero. ${theme.hostFull} fronted you $${BROKE_BAILOUT} from the ${theme.bailoutFund}.`);
          setExtras({
            rankUp: res.rankUp,
            newRecords: res.newRecords,
            streakBonus: res.streakBonus,
            streakBroken: res.streakBroken,
            respectBonus: res.respectBonus,
            leveledDown: res.leveledDown ? res.next.playerLevel : 0,
            doodleDrop: null,
          });
          setPayout(res.payout);
          savedThisRound.current = true;
          try { localStorage.setItem(keys.store, JSON.stringify(loaded)); } catch {}
          localStorage.removeItem(keys.round);
          setScreen("done");
        } else {
          setQueue(q);
          setRedo(rd);
          setIdx(i);
          setStreak(sn.streak || 0);
          setPhase("ask");
          setHintShown(loaded.playerLevel === 1);
          setResumed(true);
          setScreen("play");
        }
      }
    } catch {
      try { localStorage.removeItem(keys.round); } catch {}
    }
    setSave(loaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  // Snapshot the in-progress round on every change so nothing is lost if the
  // tab closes or reloads mid-round.
  useEffect(() => {
    if (screen !== "play" || queue.length === 0) return;
    try {
      const sn: RoundSnapshot = {
        queue, idx, bet, isPractice, isCustom: isCustomRound, isBoss: isBossRound,
        missed: missedWords, redo, firstTryCorrect, streak, bestStreak,
        roundTotal, roundWords: roundWordsRef.current,
        answered: phase !== "ask",
        bonusWord, bonusWon,
      };
      localStorage.setItem(keys.round, JSON.stringify(sn));
    } catch {}
  }, [screen, queue, idx, phase, bet, isPractice, isCustomRound, isBossRound, missedWords, redo, firstTryCorrect, streak, bestStreak, roundTotal, bonusWord, bonusWon]);

  function persist(next: Save) {
    setSave(next);
    try { localStorage.setItem(keys.store, JSON.stringify(next)); }
    catch { setStorageOk(false); }
  }

  const speak = useCallback((entry: Entry, wordOnly = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setSpeechOk(false); return; }
    window.speechSynthesis.cancel();
    const text = wordOnly ? entry.w : `${entry.w}. ... ${entry.s} ... ${entry.w}.`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.lang = "en-GB";
    const voices = window.speechSynthesis.getVoices();
    const gb = voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => (v.lang || "").startsWith("en-NZ")) ||
      voices.find((v) => (v.lang || "").startsWith("en-AU"));
    if (gb) u.voice = gb;
    window.speechSynthesis.speak(u);
  }, []);

  const current = queue[idx];

  useEffect(() => {
    if (screen === "play" && (phase === "ask" || phase === "misheard") && current) {
      const t = setTimeout(() => speak(current), 350);
      inputRef.current?.focus();
      return () => clearTimeout(t);
    }
    if (screen === "play" && phase === "wrong") {
      const t = setTimeout(() => retypeRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [screen, phase, idx, current, speak]);

  function startRound(mode: "adaptive" | "custom" | "boss", practice = false) {
    if (!save) return;
    const boss = mode === "boss";
    if (!boss && !practice && (bet < 1 || bet > save.bank)) return;
    if (practice || boss) setBet(0);
    setIsPractice(practice && !boss);
    setCustomError("");
    setCustomNote("");
    let round: Entry[];
    if (mode === "custom") {
      // Tolerant of how school lists actually arrive: numbered lines,
      // bullets, tabs, spaces, commas - strip decoration, then split wide.
      const words = [...new Set(
        customText
          .split(/\n+/)
          .map((line) => line.replace(/^\s*(?:\d+[.):]?|[-*•·])\s*/, ""))
          .join(" ")
          .split(/[\s,;]+/)
          .map((w) => w.trim().toLowerCase())
          .filter((w) => /^[a-z''-]{2,}$/i.test(w))
      )];
      if (words.length === 0) {
        setCustomError("Couldn't find any words in that. Paste them one per line, or separated by commas or spaces.");
        return;
      }
      const mkCustom = (w: string): Entry => ({
        w, l: 2, p: "your list",
        s: HOMOPHONE_HINTS[w] || `Spell the word: ${w}.`,
        h: HOMOPHONE_HINTS[w] || "From your own list.",
        d: null, t: null,
      });
      // One round covers the whole list (no silent 8-word truncation)
      round = shuffle(words.map(mkCustom)).slice(0, CUSTOM_ROUND_CAP);
      if (words.length > CUSTOM_ROUND_CAP) {
        setCustomNote(`Big list! Playing ${CUSTOM_ROUND_CAP} of your ${words.length} words this round.`);
      }
    } else if (boss) {
      round = buildBossRound(save, theme.bank);
      playSfx("boss", !!save.soundOn);
    } else {
      round = buildRound(save, theme.bank);
    }
    setIsCustomRound(mode === "custom");
    setIsBossRound(boss);
    setBossTeaser(false);
    // Secret bonus word: adaptive betting rounds only, revealed on a first-try hit
    setBonusWord(mode === "adaptive" && !practice ? pick(round).w : null);
    setBonusWon(false);
    setExtras(null);
    savedThisRound.current = false;
    roundWordsRef.current = round.map((e) => e.w);
    setQueue(round);
    setRoundTotal(round.length);
    setIdx(0);
    setStreak(0); setBestStreak(0); setFirstTryCorrect(0);
    setMissedWords([]); setRedo([]);
    setInput(""); setRetype(""); setLastGuess("");
    setPayout(null);
    setPhase("ask");
    setHintShown(!boss && save.playerLevel === 1);
    setBailoutMsg("");
    setLevelMsg("");
    setResumed(false);
    setScreen("play");
  }

  function submit() {
    if (!current || (phase !== "ask" && phase !== "misheard") || !input.trim()) return;
    const guess = input.trim().toLowerCase();
    const answer = current.w.toLowerCase();
    // Misheard, not misspelled: he spelled a real sound-alike word correctly
    // (through for thorough, their for there). That is an ear problem, not a
    // spelling problem, so it costs nothing. One free retry per word, with the
    // meaning hint forced open so the second attempt is fair.
    if (guess !== answer && mishearWord !== current.w && isMisheard(guess, current.w, theme.bank)) {
      setMishearWord(current.w);
      setMishearGuess(guess);
      setHintShown(true);
      setInput("");
      setPhase("misheard");
      playSfx("wrong", !!save?.soundOn);
      setTimeout(() => speak(current, true), 250);
      return;
    }
    if (guess === answer) {
      const wasMissed = missedWords.some((m) => m.w === current.w);
      const hitBonus = !wasMissed && !bonusWon && bonusWord === current.w;
      if (!wasMissed) setFirstTryCorrect((n) => n + 1);
      if (hitBonus) setBonusWon(true);
      const ns = streak + 1;
      setStreak(ns);
      setBestStreak((b) => Math.max(b, ns));
      setFlash(pick(ns >= 3 ? theme.praiseHot : theme.praise));
      setPhase("right");
      playSfx(hitBonus ? "bonus" : "correct", !!save?.soundOn);
    } else {
      setStreak(0);
      setFlash(pick(theme.roasts));
      setLastGuess(guess);
      setRetype("");
      if (!missedWords.some((m) => m.w === current.w)) setMissedWords((m) => [...m, current]);
      setRedo((r) => [...r, current]);
      setPhase("wrong");
      playSfx("wrong", !!save?.soundOn);
    }
  }

  function finishRound() {
    if (savedThisRound.current || !save) return;
    savedThisRound.current = true;
    // Doodle drops are decided here (random, win-gated, adaptive bets only)
    // so settleRound stays a pure function.
    const payPreview = isPractice || isBossRound ? { amount: 0 } : payoutFor(missedWords.length, roundTotal, bet);
    const wonBet = !isPractice && !isCustomRound && !isBossRound && payPreview.amount - bet > 0;
    const doodleDrop = wonBet && Math.random() < DOODLE_DROP_CHANCE ? pickDoodleDrop(save.doodles || [], theme.doodles) : null;
    const res = settleRound(save, {
      isPractice,
      isCustom: isCustomRound,
      isBoss: isBossRound,
      bet,
      roundTotal,
      firstTryCorrect,
      roundWords: roundWordsRef.current,
      missedWords: missedWords.map((m) => m.w),
      ranks: theme.ranks,
      bestStreakRound: bestStreak,
      bonusWon,
      doodleDrop,
    });
    if (res.leveledUp) setLevelMsg(`LEVEL UP. Two hot rounds in a row - ${theme.hostFull} is moving you to level ${res.next.playerLevel} words.`);
    if (res.bailedOut) setBailoutMsg(`Busted to zero. ${theme.hostFull} fronted you $${BROKE_BAILOUT} from the ${theme.bailoutFund}.`);
    setExtras({
      rankUp: res.rankUp,
      newRecords: res.newRecords,
      streakBonus: res.streakBonus,
      streakBroken: res.streakBroken,
      respectBonus: res.respectBonus,
      leveledDown: res.leveledDown ? res.next.playerLevel : 0,
      doodleDrop,
    });
    setPayout(res.payout);
    const snd = !!save.soundOn;
    if (isBossRound) playSfx(res.payout.result === "bosswin" ? "rankup" : "lose", snd);
    else if (res.rankUp || res.leveledUp) playSfx("rankup", snd);
    else if (res.newRecords.length > 0 || doodleDrop) playSfx("record", snd);
    else if (!isPractice) playSfx(res.payout.net >= 0 ? "win" : "lose", snd);
    try { localStorage.removeItem(keys.round); } catch {}
    // Semi-frequent boss battles: after a normal adaptive round, once the
    // cooldown has passed, the host has a chance of slapping a challenge on the
    // desk. It stays pending until accepted - a reason to come back.
    let nextSave = res.next;
    if (!isBossRound && !isCustomRound) {
      const b: BossState = nextSave.boss || FRESH_SAVE.boss;
      if (!b.pending && nextSave.rounds - b.lastRound >= BOSS_MIN_GAP && Math.random() < BOSS_CHANCE) {
        nextSave = { ...nextSave, boss: { ...b, pending: true } };
        setBossTeaser(true);
        playSfx("boss", snd);
      }
    }
    persist(nextSave);
  }

  function next() {
    setInput("");
    setMishearWord(null);
    setMishearGuess("");
    setHintShown(!isBossRound && save?.playerLevel === 1);
    setRetype("");
    setLastGuess("");
    if (idx + 1 < queue.length) {
      setIdx(idx + 1);
      setPhase("ask");
    } else if (redo.length > 0) {
      setQueue(shuffle(redo));
      setRedo([]);
      setIdx(0);
      setPhase("ask");
    } else {
      window.speechSynthesis?.cancel();
      finishRound();
      setScreen("done");
    }
  }

  const retypeMatches = current ? retype.trim().toLowerCase() === current.w.toLowerCase() : false;

  function handleKey(e: { key: string }) {
    if (e.key === "Enter") {
      if (phase === "ask" || phase === "misheard") submit();
      else if (phase === "right") next();
      else if (phase === "wrong" && retypeMatches) next();
    }
  }

  function cashOut() {
    if (!save) return;
    const record = { amount: save.bank, date: todayStr() };
    const records: Records = { ...(save.records || FRESH_SAVE.records) };
    let recordNote = "";
    if (record.amount > records.bestCashout) {
      if (records.bestCashout > 0) recordNote = ` ⭐ NEW RECORD payday (old best: $${records.bestCashout}).`;
      records.bestCashout = record.amount;
    }
    persist({
      ...save,
      bank: STARTING_BANK,
      records,
      cashouts: [...save.cashouts, record],
      history: withHistory(save.history, { d: record.date, type: "cashout", label: `CASHED OUT $${record.amount} - reset to $${STARTING_BANK}`, net: -record.amount + STARTING_BANK, bank: STARTING_BANK }),
    });
    setConfirmCashout(false);
    setBailoutMsg(`CASHED OUT $${record.amount}. Go collect from Dad.${recordNote} Bankroll reset to $${STARTING_BANK}.`);
    playSfx(recordNote ? "record" : "win", !!save.soundOn);
    setBet(0);
  }

  const isRedoLap = current && queue.length < roundTotal;
  // What the round pays if he finishes at the current miss count
  const potential = !isPractice && bet > 0 ? payoutFor(missedWords.length, roundTotal, bet) : null;
  // Words with a sound-alike always show their meaning, in every mode: the
  // voice cannot distinguish through from thorough, so the meaning must.
  // Sound-alikes and any apostrophe word (dogs', couldn't) always show their
  // meaning: the voice cannot convey an apostrophe at all.
  const mustDisambiguate = current
    ? soundAlikes(current.w, theme.bank).length > 0 || /['’]/.test(current.w)
    : false;
  const showHint = hintShown || mustDisambiguate;
  const chipRec: ChipRecord = save?.chip || { w: 0, l: 0, d: 0 };
  const rank = rankFor(chipRec.w, theme.ranks);
  const recs: Records = save?.records || FRESH_SAVE.records;
  const ownedDoodles = save?.doodles || [];
  const masteredCount = save ? theme.bank.filter((e) => (save.stats[e.w]?.cs ?? 0) >= 3).length : 0;
  const weak = save ? weakestPatterns(save.stats, theme.bank).slice(0, 2) : [];
  const struggles = save ? strugglingWords(save.stats, theme.bank).slice(0, 3) : [];

  // -- Player picker: shown on load so nobody plays on the wrong ledger --
  if (!profileId) {
    return (
      <div className="wrap">
        <style>{PAGE_CSS}</style>
        <div className="page">
          <h1 className="hand">Spelling Showdown</h1>
          <p className="sub">Two players. Two bankrolls. Who is spelling today?</p>
          <div className="pickgrid">
            {PROFILES.map((p) => (
              <button key={p.id} className="pickcard" onClick={() => choosePlayer(p.id)}>
                <span className="pickicon" aria-hidden="true">{p.playerIcon}</span>
                <span className="pickname hand">{p.playerName}</span>
                <span className="picksub">vs {p.hostFull}</span>
                {lastPlayer === p.id && <span className="picklast">played last</span>}
              </button>
            ))}
          </div>
          <p className="payline" style={{ marginTop: 14, fontWeight: 900 }}>
            Everyone keeps their own bankroll, ledger, rank and words. Nothing is shared, so no arguing.
          </p>
        </div>
      </div>
    );
  }

  if (!save) {
    return <div style={{ fontFamily: "sans-serif", padding: 40, textAlign: "center" }}>Opening the ledger...</div>;
  }

  return (
    <div className="wrap" style={{ "--spell-accent": theme.accent } as React.CSSProperties}>
      <style>{PAGE_CSS}</style>

      <div className="page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <h1 className="hand">Spelling Showdown</h1>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, marginTop: 8 }}>
            <span className="whoami">{theme.playerIcon} {theme.playerName}</span>
            <button className="toggle" style={{ whiteSpace: "nowrap" }} onClick={() => persist({ ...save, soundOn: !save.soundOn })}>
              {save.soundOn ? "🔊 sound on" : "🔇 sound off"}
            </button>
            <button className="toggle" style={{ whiteSpace: "nowrap" }} onClick={() => setProfileId(null)}>
              switch player
            </button>
          </div>
        </div>
        <p className="sub">{theme.tagline}</p>

        {screen === "start" && (
          <>
            {save.boss?.pending && (
              <div className="card" style={{ borderColor: "#D63B2F", boxShadow: "4px 4px 0 #D63B2F" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <span className="cheatlabel hand" style={{ margin: 0, fontSize: 20 }}>⚔️ {theme.bossLabel}</span>
                  <span className="tag">FREE ENTRY · WIN ${BOSS_PRIZE}</span>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <Chip mood="neutral" variant={theme.mascot} />
                  <div className="bubble hand">{theme.bossTaunts[save.rounds % theme.bossTaunts.length]}</div>
                </div>
                <p className="payline" style={{ fontWeight: 900, marginTop: 10 }}>
                  {BOSS_WORD_COUNT} of {theme.hostFull}&apos;s nastiest words · no hints · miss more than {BOSS_MISS_ALLOWED} and the cash stays theirs.
                  You risk nothing, and a win counts on the rank ladder.
                </p>
                <div className="btnrow">
                  <button className="btn red" onClick={() => startRound("boss")}>ACCEPT THE CHALLENGE</button>
                </div>
              </div>
            )}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div className="walletlabel">Bankroll</div>
                  <div className="wallet">${save.bank}</div>
                </div>
                <div style={{ textAlign: "right", fontWeight: 900, fontSize: 14 }}>
                  Spelling level: {save.playerLevel} / {MAX_LEVEL}
                  {save.hotStreak > 0 && save.playerLevel < MAX_LEVEL ? " 🔥 one more hot round to level up" : ""}
                  {save.hotStreak > 0 && save.playerLevel === MAX_LEVEL ? " 🔥 one more hot round = respect bonus" : ""}<br />
                  Day streak: {save.dayStreak} {save.dayStreak >= 3 ? "🔥" : ""}<br />
                  Rounds played: {save.rounds}<br />
                  {save.cashouts.length > 0 && <>Cashed out so far: ${save.cashouts.reduce((s, c) => s + c.amount, 0)}</>}
                </div>
              </div>
              <div className="goalwrap" aria-hidden="true"><div className="goalbar" style={{ width: `${Math.min(100, (save.bank / PAYDAY_GOAL) * 100)}%` }} /></div>
              <p className="payline" style={{ fontWeight: 900 }}>
                {save.bank >= PAYDAY_GOAL
                  ? `PAYDAY READY: $${save.bank} in the bank. Cash out and make Dad pay up, or keep stacking.`
                  : `Payday goal: $${PAYDAY_GOAL} - you're $${PAYDAY_GOAL - save.bank} away.`}
              </p>
              {(() => {
                // Streak rewards are paid for finishing a round on a new day
                const playedToday = save.day === todayStr();
                const nxt = nextStreakBonus(playedToday ? save.dayStreak - 1 : save.dayStreak);
                const paidToday = playedToday ? streakBonusFor(save.dayStreak) : 0;
                return (
                  <p className="payline" style={{ fontWeight: 900 }}>
                    {playedToday
                      ? `Day ${save.dayStreak} of your streak is banked${paidToday > 0 ? ` (+$${paidToday} today)` : " (no reward on this day of the ladder)"}. Tomorrow's round is worth $${nextStreakBonus(save.dayStreak).amount}.`
                      : `Finish a round today to claim day ${nxt.day} of your streak${nxt.amount > 0 ? ` and $${nxt.amount}` : ""}.`}
                    {nextStreakBonus(playedToday ? save.dayStreak : save.dayStreak).day % 10 === 0 ? " That one is the 10 day $5 payday." : ""}
                  </p>
                );
              })()}
              {save.day && save.day !== todayStr() && save.dayStreak >= 2 && (
                <p className="warnline">⚠️ Play a round today or your {save.dayStreak}-day streak resets to day 1.</p>
              )}
              {creditMsg && (
                <div className="creditcard">
                  <p className="cheatlabel" style={{ color: "#2E8B57", margin: 0 }}>MAKE-GOOD FROM DAD</p>
                  <p style={{ margin: "4px 0 0", fontWeight: 700 }}>{creditMsg}</p>
                </div>
              )}
              {bailoutMsg && <p className="bailout">{bailoutMsg}</p>}
              {!storageOk && <p className="savewarn">Heads up: saving isn&apos;t working on this device, so the bankroll resets when you close this.</p>}

              <div className="row" style={{ marginTop: 14 }}>
                <Chip mood="neutral" variant={theme.mascot} />
                <div className="bubble hand">
                  {theme.intro}
                </div>
              </div>

              <div className="coach" style={{ marginTop: 12 }}>
                <p className="cheatlabel" style={{ color: "#2B5FD9" }}>THE PAYOUT LADDER (8-word round)</p>
                <p className="payline">Perfect: <b>double your bet</b> · 1 miss: <b>×1.5</b> · 2 misses: <b>money back</b></p>
                <p className="payline">3 misses: <b>lose a quarter</b> · 4: <b>lose half</b> · 5: <b>lose three-quarters</b> · 6+: <b>lose it all</b></p>
              </div>

              <p style={{ fontWeight: 900, margin: "14px 0 4px" }}>Your bet:</p>
              <div className="btnrow" style={{ marginTop: 4 }}>
                {[1, 2, 5].map((b) => (
                  <button key={b} className={`btn betpick ${bet === b ? "on" : ""}`} disabled={b > save.bank} onClick={() => setBet(b)}>${b}</button>
                ))}
                <button className={`btn betpick ${bet === Math.max(1, Math.floor(save.bank / 2)) && bet > 5 ? "on" : ""}`} onClick={() => setBet(Math.max(1, Math.floor(save.bank / 2)))}>Half (${Math.max(1, Math.floor(save.bank / 2))})</button>
                <button className={`btn betpick ${bet === save.bank ? "on" : ""}`} onClick={() => setBet(save.bank)}>All in (${save.bank})</button>
              </div>

              <div className="btnrow">
                <button className="btn" disabled={bet < 1} onClick={() => startRound("adaptive")}>
                  {bet < 1 ? "Pick a bet first" : `Start today's round ($${bet} at stake)`}
                </button>
                <button className="btn ghost" onClick={() => startRound("adaptive", true)}>
                  Practice (no bet)
                </button>
              </div>
              <p style={{ fontSize: 13, color: "#4A4A45", marginTop: 10 }}>
                Round mix: up to 3 review words he&apos;s missed before, and at least 5 that are brand new or haven&apos;t appeared for several rounds. Practice rounds still teach {theme.hostFull} what to drill next.
              </p>
            </div>

            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span className="cheatlabel hand" style={{ margin: 0, fontSize: 18, color: "#B8860B" }}>{theme.shelfLabel}</span>
                <span className="vsline">YOU {chipRec.w} - {chipRec.l} {theme.hostName}{chipRec.d > 0 ? ` (${chipRec.d} draws)` : ""}</span>
              </div>
              <p className="payline" style={{ fontWeight: 900, marginTop: 8 }}>
                Rank: <span className="hand" style={{ fontSize: 20 }}>{rank.title}</span>
                {rank.next && <> · {rank.next.winsNeeded} more {rank.next.winsNeeded === 1 ? "win" : "wins"} vs {theme.hostFull} to become <b>{rank.next.title}</b></>}
                {!rank.next && <> · top of the ladder. Nobody outdoodles you.</>}
              </p>
              <div style={{ marginTop: 6 }}>
                {recs.bestStreak > 0 && <span className="statchip">🔥 Best streak: {recs.bestStreak}</span>}
                {recs.biggestWin > 0 && <span className="statchip">💰 Biggest win: +${recs.biggestWin}</span>}
                {recs.bestCashout > 0 && <span className="statchip">🤑 Best payday: ${recs.bestCashout}</span>}
                {recs.perfectRounds > 0 && <span className="statchip">✨ Perfect rounds: {recs.perfectRounds}</span>}
                {recs.bestDayStreak > 1 && <span className="statchip">📅 Longest day streak: {recs.bestDayStreak}</span>}
                {((save.boss?.wins || 0) + (save.boss?.losses || 0)) > 0 && <span className="statchip">⚔️ Boss battles: {save.boss.wins}-{save.boss.losses}</span>}
                {recs.bestStreak === 0 && recs.biggestWin === 0 && recs.bestCashout === 0 && recs.perfectRounds === 0 && recs.bestDayStreak <= 1 && (
                  <span className="statchip">{theme.emptyShelf}</span>
                )}
              </div>
              <p className="payline" style={{ fontWeight: 900, marginTop: 10, marginBottom: 2 }}>Word collection: {masteredCount} / {theme.bank.length} captured</p>
              <div className="goalwrap" aria-hidden="true"><div className="goalbar blue" style={{ width: `${(masteredCount / theme.bank.length) * 100}%` }} /></div>
              <p className="payline" style={{ fontWeight: 900, marginTop: 10, marginBottom: 2 }}>{theme.collectionLabel}: {ownedDoodles.length} / {theme.doodles.length}</p>
              <p className="doodleshelf" title="Win betting rounds for a chance at doodle drops">
                {theme.doodles.map((d) => (ownedDoodles.includes(d.id) ? d.icon : "▢")).join(" ")}
              </p>
              <p style={{ fontSize: 12, color: "#4A4A45", margin: "4px 0 0" }}>Prizes drop from winning bet rounds. Two are rare. {theme.hostFull} won&apos;t say which.</p>
            </div>

            <div className="card">
              <button className="toggle" onClick={() => setShowCustom(!showCustom)}>
                {showCustom ? "Hide" : "Use this week's school list instead"}
              </button>
              {showCustom && (
                <>
                  <textarea
                    className="paste"
                    style={{ marginTop: 10 }}
                    placeholder="separate, definitely, mischievous&#10;one per line or comma-separated"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                  <div className="btnrow">
                    <button className="btn blue" onClick={() => startRound("custom")} disabled={!customText.trim() || bet < 1}>
                      {bet < 1 ? "Pick a bet first" : "Start: My List"}
                    </button>
                    <button className="btn ghost" onClick={() => startRound("custom", true)} disabled={!customText.trim()}>
                      Practice My List (no bet)
                    </button>
                  </div>
                  {customError && <p className="savewarn" style={{ marginTop: 8 }}>{customError}</p>}
                  <p style={{ fontSize: 12, color: "#4A4A45", marginTop: 8 }}>
                    One round covers your whole list (up to {CUSTOM_ROUND_CAP} words). List rounds pay real money but don&apos;t move your level or rank - {theme.hostFull} only ranks their own words.
                  </p>
                </>
              )}
            </div>

            <div className="card">
              {!confirmCashout ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <span style={{ fontWeight: 900 }}>Payday time?</span>
                  <button className="btn red" onClick={() => setConfirmCashout(true)}>Cash Out ${save.bank}</button>
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: 900, marginTop: 0 }}>
                    Cash out ${save.bank} real money from Dad, and the bankroll resets to ${STARTING_BANK}. {theme.hostFull} keeps notes on which words beat you. Sure?
                  </p>
                  <div className="btnrow">
                    <button className="btn red" onClick={cashOut}>Yes, pay me</button>
                    <button className="btn ghost" onClick={() => setConfirmCashout(false)}>Not yet</button>
                  </div>
                </>
              )}
            </div>

            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span className="cheatlabel hand" style={{ margin: 0, fontSize: 18 }}>THE LEDGER</span>
                <button className="toggle" onClick={() => setShowLedger(!showLedger)}>
                  {showLedger ? "Hide" : `Show ${(save.history || []).length} entries`}
                </button>
              </div>
              {(() => {
                const hist = save.history || [];
                const won = hist.filter((h) => h.type === "round" && h.net > 0).reduce((s, h) => s + h.net, 0);
                const lost = hist.filter((h) => h.type === "round" && h.net < 0).reduce((s, h) => s - h.net, 0);
                const paid = save.cashouts.reduce((s, c) => s + c.amount, 0);
                return (
                  <p className="payline" style={{ marginTop: 8 }}>
                    Lifetime: <b style={{ color: "#2E8B57" }}>+${won} won</b> · <b style={{ color: "#D63B2F" }}>-${lost} lost</b> · <b>${paid} cashed out</b>
                  </p>
                );
              })()}
              {showLedger && (
                <div style={{ marginTop: 8, maxHeight: 260, overflowY: "auto" }}>
                  {(save.history || []).length === 0 && <p className="payline">Nothing yet. The first bet writes the first line.</p>}
                  {[...(save.history || [])].reverse().map((h, i) => (
                    <div className="missrow" key={i} style={{ fontSize: 14, gap: 8 }}>
                      <span style={{ color: "#4A4A45", whiteSpace: "nowrap" }}>{h.d ? h.d.slice(5) : ""}</span>
                      <span style={{ flex: 1, padding: "0 8px" }}>{h.label}</span>
                      <span style={{ fontWeight: 900, whiteSpace: "nowrap", color: h.net > 0 ? "#2E8B57" : h.net < 0 ? "#D63B2F" : "#4A4A45" }}>
                        {h.type === "practice" ? "-" : `${h.net >= 0 ? "+" : "-"}$${Math.abs(h.net)}`}
                      </span>
                      <span style={{ fontWeight: 900, whiteSpace: "nowrap", marginLeft: 10 }}>${h.bank}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {screen === "play" && current && (
          <div className="card">
            <div className="statbar">
              <span>Word {Math.min(idx + 1, queue.length)} / {queue.length}</span>
              <span>{isBossRound ? `⚔️ BOSS · Prize $${BOSS_PRIZE}` : isPractice || !potential ? "Practice" : `Bet $${bet} · Pot $${potential.amount}`}</span>
              <span>Streak: {streak} {streak >= 3 ? "🔥" : ""}</span>
              <span>{isBossRound ? `Misses: ${missedWords.length} / ${BOSS_MISS_ALLOWED} allowed` : `Misses: ${missedWords.length}`}</span>
            </div>

            {isBossRound && (
              <div className="lap">
                {missedWords.length > BOSS_MISS_ALLOWED
                  ? `${theme.bossLabel} - the prize is gone, but finish the fight for pride.`
                  : `${theme.bossLabel} - the nastiest words in the book. No hints. You are being watched.`}
              </div>
            )}
            {isRedoLap && !isBossRound && <div className="lap">REVENGE ROUND - clear these to keep 1.5x alive.</div>}
            {isRedoLap && isBossRound && <div className="lap">REVENGE ROUND - the boss makes you spell your misses again. House rules.</div>}
            {resumed && <div className="lap" style={{ color: "#2B5FD9" }}>Found your unfinished round. Picking up right where you left off.</div>}
            {customNote && <div className="lap" style={{ color: "#2B5FD9" }}>{customNote}</div>}

            <div className="row">
              <Chip mood={phase === "right" ? "happy" : phase === "wrong" ? "sad" : "neutral"} variant={theme.mascot} />
              <div className="bubble hand">
                {phase === "ask" && (speechOk ? "Here it comes... listen close." : `No sound? Fine. Definition: ${safeHint(current.h, current.w)}`)}
                {phase === "right" && flash}
                {phase === "misheard" && (
                  <>
                    Hold on. <b>{mishearGuess}</b> is spelled perfectly, but that is not the word I said.
                    They sound almost the same, so that one is on me, not you. No miss, no money lost.
                    <br />Listen again and read the meaning.
                  </>
                )}
                {phase === "wrong" && (<>{flash}<br />Cheat sheet&apos;s out. Read the trick, then write it yourself.</>)}
              </div>
            </div>

            {(phase === "ask" || phase === "misheard") && (
              <>
                <input
                  ref={inputRef}
                  className="spellinput"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  aria-label="Type the spelling here"
                  placeholder="type it here..."
                />
                {phase === "misheard" && (
                  <p className="warnline" style={{ color: "#2B5FD9" }}>
                    Not the sound-alike one. {soundAlikes(current.w, theme.bank).length > 0 ? "Use the meaning to work out which word it is." : ""}
                  </p>
                )}
                {showHint && <p className="flash">Hint: {safeHint(current.h, current.w)}</p>}
                <div className="btnrow">
                  <button className="btn" onClick={submit}>Check It</button>
                  <button className="btn ghost" onClick={() => speak(current)}>Hear Again</button>
                  <button className="btn ghost" onClick={() => speak(current, true)}>Just the Word</button>
                  {!showHint && !isBossRound && (
                    <button className="btn ghost" onClick={() => setHintShown(true)}>Hint</button>
                  )}
                </div>
              </>
            )}

            {phase === "right" && (
              <>
                <div style={{ marginTop: 10 }} className="burst" key={`burst-${idx}-${queue.length}`}>
                  <span className="stamp good hand">CORRECT ✓{streak >= 3 ? ` ×${streak}` : ""}</span>
                  {(streak >= 3
                    ? [...SPARKS, ...SPARKS.map((s) => ({ c: "🔥", x: s.x * 1.6, y: s.y * 1.6, r: -s.r }))]
                    : SPARKS
                  ).map((s, i) => (
                    <span
                      key={i}
                      className="spark"
                      aria-hidden="true"
                      style={{ "--dx": `${s.x}px`, "--dy": `${s.y}px`, "--rot": `${s.r}deg`, animationDelay: `${i * 0.03}s` } as React.CSSProperties}
                    >{s.c}</span>
                  ))}
                </div>
                {bonusWon && bonusWord === current.w && (
                  <p className="bonusline hand">🎯 BONUS WORD! +$1 stashed for the payout.</p>
                )}
                {potential && <p className="winline hand">{potLine(potential)}</p>}
                <p className="sentline">&quot;{current.s}&quot;</p>
                <div className="btnrow">
                  <button className="btn" onClick={next} onKeyDown={handleKey} autoFocus>Next Word →</button>
                </div>
              </>
            )}

            {phase === "wrong" && (
              <>
                <div style={{ marginTop: 10 }}><span className="stamp hand">SEE ME.</span></div>
                <div className="cheat">
                  <p className="cheatlabel">{theme.cheatSheetLabel}</p>
                  <MarkedWord word={current.w} danger={current.d} />
                  {lastGuess && lastGuess.toLowerCase() !== current.w.toLowerCase() && (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 900, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 1 }}>You wrote:</p>
                      <DiffGuess guess={lastGuess} answer={current.w} />
                    </>
                  )}
                  <p className="tricktext">{current.t || theme.genericTrick}</p>
                  <p className="retypelabel">{theme.retypeLabel}</p>
                  <input
                    ref={retypeRef}
                    className={`retypeinput ${retypeMatches ? "ok" : ""}`}
                    value={retype}
                    onChange={(e) => setRetype(e.target.value)}
                    onKeyDown={handleKey}
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                    aria-label="Retype the correct spelling to continue"
                    placeholder="spell it right to escape..."
                  />
                  {retypeMatches && <p className="escaped">{theme.escapeLine}</p>}
                </div>
                <div className="btnrow">
                  <button className="btn ghost" onClick={() => speak(current, true)}>Hear It</button>
                  <button className="btn" onClick={next} disabled={!retypeMatches}>Keep Going →</button>
                </div>
              </>
            )}
          </div>
        )}

        {screen === "done" && payout && (
          <div className="card">
            <div className="row">
              <Chip mood={payout.result === "bosswin" ? "sad" : payout.result === "bossloss" ? "happy" : payout.result === "bust" || payout.result === "rough" ? "sad" : "happy"} variant={theme.mascot} />
              <div className="bubble hand">
                {payout.result === "bosswin" && `FINE. Take the $${BOSS_PRIZE}. Out of my own fund. I'm picking WORSE words next time.`}
                {payout.result === "bossloss" && `HA! The boss remains undefeated. My money stays mine, and I'm drawing this moment for the fridge.`}
                {payout.result === "practice" && `Practice round done. ${payout.misses === 0 ? "Perfect, and it cost you nothing. Imagine if money had been on that." : "No money moved, but I took notes. Those words are marked."}`}
                {payout.result === "clean" && `PERFECT ROUND. Your $${bet} just became $${payout.amount}. I want a rematch.`}
                {payout.result === "good" && `One slip, cleaned up in the Revenge Round. $${bet} pays $${payout.amount}. Solid.`}
                {payout.result === "even" && `Two misses. Money back, no more, no less. The house calls that a warning.`}
                {payout.result === "graze" && `Three misses. You lose $${bet - payout.amount} of your $${bet}. Stings a little. Meant to.`}
                {payout.result === "half" && `Four misses. Half your $${bet} is gone. The other half survived out of pity.`}
                {payout.result === "rough" && `Five misses. You keep $${payout.amount} of $${bet}. Barely walked out of there.`}
                {payout.result === "bust" && `${payout.misses} misses. Total blowout. The $${bet} is mine. The ${theme.bailoutFund} thanks you.`}
              </div>
            </div>

            {isBossRound ? (
              <div style={{ marginTop: 14 }}>
                {payout.result === "bosswin" ? (
                  <span className="stamp good hand" style={{ transform: "rotate(-3deg)" }}>BOSS BEATEN · +${BOSS_PRIZE} FREE</span>
                ) : (
                  <span className="stamp hand">THE BOSS STANDS</span>
                )}
                <p className="payline" style={{ fontWeight: 900, marginTop: 8 }}>
                  {payout.misses} {payout.misses === 1 ? "miss" : "misses"} of {BOSS_MISS_ALLOWED} allowed · free entry
                  {payout.result === "bosswin" ? ` · ${theme.hostFull} pays $${BOSS_PRIZE} · counts as a rank-ladder win` : " · nothing lost - he'll be back with a new challenge"}
                </p>
              </div>
            ) : isPractice ? (
              <div style={{ marginTop: 14 }}>
                <span className="stamp good hand" style={{ transform: "rotate(-3deg)" }}>PRACTICE - NO MONEY MOVED</span>
              </div>
            ) : (
              <div className="coach" style={{ marginTop: 14 }}>
                <p className="cheatlabel" style={{ color: "#2B5FD9" }}>THE RECEIPT</p>
                <p className="payline">
                  Bet <b>${payout.betAmt}</b> · {payout.misses} {payout.misses === 1 ? "miss" : "misses"} · paid back <b>${payout.amount}</b> · net <b>{payout.net >= 0 ? `+$${payout.net}` : `-$${Math.abs(payout.net)}`}</b>
                </p>
                <p className="payline">
                  Bankroll: ${payout.prevBank} → <b>${payout.newBank}</b>
                </p>
              </div>
            )}
            {!isPractice && (
              <div style={{ marginTop: 14 }}>
                <div className="walletlabel">Bankroll</div>
                <div className="wallet">${save.bank}</div>
              </div>
            )}
            {bailoutMsg && <p className="bailout">{bailoutMsg}</p>}
            {extras?.rankUp && <p className="rankup hand">🏆 RANK UP: {extras.rankUp}</p>}
            {levelMsg && <p className="escaped" style={{ fontSize: 20 }}>{levelMsg}</p>}
            {extras && extras.leveledDown > 0 && (
              <p className="leveldown hand">LEVEL DOWN. {theme.hostFull} dropped you to level {extras.leveledDown} words. Two hot rounds wins it back.</p>
            )}
            {extras?.newRecords.map((r) => (
              <p key={r} className="recordline hand">⭐ NEW RECORD - {r}</p>
            ))}
            {bonusWon && <p className="bonusline hand">🎯 Bonus word banked: +${BONUS_WORD_CASH}</p>}
            {extras && extras.respectBonus > 0 && (
              <p className="escaped">{theme.hostFull}&apos;s respect bonus: +${extras.respectBonus}. Two hot rounds at max level. Paying it hurts.</p>
            )}
            {extras && extras.streakBonus > 0 && (
              <p className="escaped">Streak reward: +${extras.streakBonus} for day {save.dayStreak} in a row{extras.streakBonus >= 5 ? " - the 10 day payday!" : ""}. Showing up pays.</p>
            )}
            {extras && extras.streakBroken > 0 && (
              <p className="warnline">Your {extras.streakBroken}-day streak ended. {theme.hostFull} noticed. New one starts today.</p>
            )}
            {bossTeaser && (
              <p className="warnline" style={{ color: "#1D2A44" }}>⚔️ {theme.hostFull} just slapped a {theme.bossLabel} on the betting desk. Free entry, ${BOSS_PRIZE} if you win.</p>
            )}
            {extras?.doodleDrop && (() => {
              const d = theme.doodles.find((x) => x.id === extras.doodleDrop);
              return d ? (
                <div className="doodledrop">
                  <span className="doodleicon" aria-hidden="true">{d.icon}</span>
                  <div>
                    <p className="cheatlabel" style={{ color: "#B8860B", margin: 0 }}>{theme.dropLabel}{d.rare ? " - RARE!" : ""}</p>
                    <p style={{ margin: "2px 0", fontWeight: 900 }}>{d.name}</p>
                    <p style={{ margin: 0, fontSize: 14 }}>{d.cap} · Collection: {ownedDoodles.length}/{theme.doodles.length}</p>
                  </div>
                </div>
              ) : null;
            })()}
            <p className="payline" style={{ fontWeight: 900, marginTop: 10 }}>
              First-try: {firstTryCorrect}/{roundTotal} · Best streak: {bestStreak} · Day streak: {save.dayStreak} {save.dayStreak >= 3 ? "🔥" : ""} · Level: {save.playerLevel}/{MAX_LEVEL}
            </p>
            {!isPractice && !isCustomRound && (
              <p className="payline" style={{ fontWeight: 900 }}>
                YOU {chipRec.w} - {chipRec.l} {theme.hostName} · Rank: {rank.title}
                {rank.next && <> · {rank.next.winsNeeded} {rank.next.winsNeeded === 1 ? "win" : "wins"} to {rank.next.title}</>}
              </p>
            )}

            {missedWords.length > 0 && (
              <>
                <p style={{ fontWeight: 900, marginBottom: 4 }}>Words that fought back:</p>
                {missedWords.map((m) => (
                  <div className="missrow" key={m.w}>
                    <span className="hand" style={{ fontSize: 20 }}>{m.w}</span>
                    <span className="tag">{m.p}</span>
                  </div>
                ))}
              </>
            )}

            <div className="coach">
              <p className="cheatlabel" style={{ color: "#2B5FD9" }}>{theme.clipboardLabel}</p>
              {weak.length > 0 ? (
                <p className="payline">
                  Wobbliest patterns: {weak.map((x) => `${x.pattern} (${Math.round(x.rate * 100)}% missed)`).join(", ")}. Tomorrow&apos;s round will lean on these.
                </p>
              ) : (
                <p className="payline">Not enough data yet. A few more rounds and {theme.hostFull} will know exactly where to attack.</p>
              )}
              {struggles.length > 0 && (
                <p className="payline">
                  Coming back for revenge soon: {struggles.map((e) => e.w).join(", ")}.
                </p>
              )}
            </div>

            <div className="btnrow">
              {!isPractice && !isCustomRound && bet >= 1 && bet <= save.bank && (
                <button className="btn blue" onClick={() => startRound("adaptive")}>REMATCH {theme.hostName} (bet ${bet})</button>
              )}
              {isPractice && (
                <button className="btn" onClick={() => startRound("adaptive", true)}>Run it back (practice)</button>
              )}
              <button className="btn ghost" onClick={() => { setScreen("start"); setBet(0); }}>Back to the Betting Desk</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
