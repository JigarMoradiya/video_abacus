// E06 · Two rods together — 16:9 and 4:5 from one reel.
//
// Direct addition AND subtraction across the ones and tens rods. Every digit stays inside its own
// rod: nothing here needs a complement, which is exactly what makes this the last episode before the
// formulas. The worked sums are the two E05's teaser promised — twenty-one plus three, and
// thirty-nine take away fifteen — plus fourteen plus twenty-five in the middle, which is the first
// time in the series that BOTH rods move on the same line.
//
// Timing from src/data/e06.phrases.json, aligned from docs/E06_spoken.txt. 71 lines -> 71 PHRASES,
// so a phrase index is also a line number.
//
// WHAT THIS EPISODE DOES DIFFERENTLY
//
//   · RIG_JUNGLE — bamboo frame, coral beads. Fifth distinct instrument in the series.
//   · A JUNGLE, and deliberately the brightest world set yet: E05 ended in black space, so this
//     opens on lime and coral. Every world carries something PAIRED — twin vines, two ropes on the
//     bridge, two butterflies — because the episode is about two of something working together, and
//     the scenery can say so before the script does.
//   · A MONKEY THAT HOLDS THE ABACUS. Every character so far has commented on the instrument from
//     outside it. This one hangs off the BEAM by one hand and works the beads with the other, and
//     when the sum moves from the tens rod to the ones rod it SWINGS across — so the character is
//     the lesson, not a mascot standing next to it.
//   · THE JOB CARD, this episode's teaching device. A sum splits into two rows — `tens +2`,
//     `ones +5` — and each row ticks as its rod finishes. "Two little sums, one after the other" is
//     the thesis, and a thesis deserves a device rather than a sentence.

import React from "react";
import phrasesJson from "../data/e06.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Monkey, MonkeyHoldArm, type MonkeyMood } from "../components/e06/Monkey";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { PracticeList, PRACTICE_NAT } from "../components/e06/PracticeList";
import { RodTicks, TICKS_NAT } from "../components/e06/RodTicks";
import { SplitCard, SPLIT_NAT } from "../components/e06/SplitCard";
import { Abacus, type RodState } from "../components/Abacus";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import { beamY, lowerBeadY, rodX, upperBeadY, type AbacusBox } from "../stage/geometry";
import type { Scene as BaseScene } from "../stage/types";
import { RIG_JUNGLE, WORLDS } from "../data/theme";
import { FPS, PLACE_COLORS, ROD_DIM, ROD_PITCH } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";

export const AUDIO_SEC = 255.321;
export const E06_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

interface Scene extends BaseScene {
  /** the monkey's state, and whether it is on screen at all */
  monkey?: MonkeyMood;
  /** the sum in column form, and which row/place the narration is on */
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep; activeRod?: number };
  /** the rod checklist: the order the rods are worked, how many are done, and whether this line
   *  finishes the next one */
  ticks?: { rods: number[]; done: number; doing?: boolean };
  /** a number pulled apart into the two pieces the narration just named */
  split?: {
    whole: string;
    parts: [string, string];
    shown: number;
    colours: [string, string];
    beads?: boolean;
  };
  /** the big answer number in the headline band */
  big?: string;
  /** show the abacus's CURRENT value above it while a calculation is being worked */
  valueChip?: boolean;
}

/**
 * 0.94 — the smallest abacus in the series, and it buys the most.
 *
 * This episode labels its rods on BOTH sides: 1 / 10 below and 5 / 50 above. E04 carried only the
 * lower chips and had to drop to 1.04 for them; a second row above costs another ~110 px of height,
 * and at 1.06 those upper chips ran into the answer card in the headline band. The beads give up
 * size so the labels can exist, which is the right way round — this is the episode where a child has
 * to know what the top bead is worth on the TENS rod, and a rod labelled only underneath leaves them
 * to guess.
 */
const BASE = 0.94;
const BIG_TOP = 20;
const BIG_SIZE = 80;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

/** Room for the monkey on the right; nothing sits on the left. */
const PORTRAIT_ROOM = { left: 80, right: 210 };

/**
 * What the abacus reads on each phrase, as a whole number 0-99. Rod 0 is ones, rod 1 is tens.
 *
 * Read this against docs/E06_spoken.txt: every value change here is a bead move the narration
 * actually asks for, and every line that does NOT move beads repeats the previous value.
 */
const VALUE: Record<number, number> = {
  // hook — one rod, then two
  0: 0, 1: 0,
  // what the second rod is for; ninety-nine is shown, not claimed
  2: 0, 3: 0, 4: 0, 5: 99,
  // the big idea, and both ordering rules
  6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0,
  // twenty-one plus three — ONES FIRST, including while the number is being set up
  12: 0, 13: 0, 14: 1, 15: 21, 16: 21, 17: 21, 18: 21,
  19: 24, 20: 24, 21: 24, 22: 24, 23: 24,
  // thirteen plus twenty-six — the ones rod needs a lower bead AND the upper bead, in that order
  24: 0, 25: 0, 26: 0, 27: 3, 28: 13, 29: 13, 30: 13, 31: 13, 32: 13, 33: 13, 34: 13, 35: 13,
  36: 14, 37: 19, 38: 19, 39: 19, 40: 19, 41: 39, 42: 39, 43: 39, 44: 39,
  // the rule so far — thirty-nine stays, the next section starts from it
  45: 39, 46: 39, 47: 39,
  // thirty-nine take away fifteen — ones first again
  48: 39, 49: 39, 50: 39, 51: 39, 52: 39, 53: 39, 54: 39, 55: 39,
  56: 34, 57: 34, 58: 34, 59: 34, 60: 24, 61: 24, 62: 24, 63: 24,
  // your turn
  64: 0, 65: 23, 66: 23, 67: 23, 68: 23, 69: 34, 70: 34,
  // close
  71: 0, 72: 0, 73: 0, 74: 0, 75: 0, 76: 0, 77: 0,
};

const valueAt = (p: number) => VALUE[p] ?? 0;
const digits = (v: number) => [v % 10, Math.floor(v / 10) % 10];

/**
 * Lines where the abacus changes without a taught bead move: a reset between sections, a number the
 * CHILD makes on their own abacus, and the your-turn answer. No hand, no move SFX — a finger on a
 * line the narration never asked for is a finger the child cannot follow.
 */
const SILENT_SET = new Set([5, 6, 24, 64, 65, 69, 71]);

/**
 * Five rods, with the two live ones lit and their WORTH CHIPS under them.
 *
 * The chips are `Abacus`'s own (the same 1 / 10 / 100 labels E04 introduced, in the app's place
 * colours), and they are the reason this episode can say "the tens rod" without the child having to
 * remember which one that is. Declared per phrase by `chipsLower` and applied HERE — a field on the
 * Scene that nothing reads is a field that does nothing, which is how the first pass rendered with
 * no chips at all.
 */
const rig = (p: number, chips?: number[]): RodState[] => {
  const d = digits(valueAt(p));
  return Array.from({ length: 5 }, (_, i) => ({
    value: i < 2 ? d[i] : 0,
    focus: i < 2 ? 1 : ROD_DIM,
    // BOTH chips. The lower ones (1 / 10) say what an earth bead is worth; the upper ones (5 / 50)
    // say what the heaven bead is worth, and this episode uses the heaven bead on BOTH rods — a rod
    // labelled only underneath leaves the child to guess what the top bead means on the tens.
    chipLower: chips?.includes(i) || undefined,
    chipUpper: chips?.includes(i) || undefined,
    placeName: chips?.includes(i) ? (i === 0 ? "ones" : "tens") : undefined,
  }));
};

/** Which rod a line is about, for the card side and the arrow target. */
const rodFor = (p: number): number => {
  const to = digits(valueAt(p));
  const from = digits(p > 0 ? valueAt(p - 1) : 0);
  const moved = [0, 1].filter((i) => to[i] !== from[i]);
  if (moved.length === 1) return moved[0];
  // lines that only TALK about a rod still point at it
  if ([4, 20, 21, 39, 40, 42, 58, 59, 61].includes(p)) return 1;
  return 0;
};

/**
 * WHICH FINGER, and WHICH ROD. Same derivation as E04 and E05 — the rule is a property of the move,
 * never of the bead:
 *
 *    moving TOWARDS the top of the frame  -> THUMB
 *    moving DOWN                          -> INDEX FINGER
 */
const handFor = (p: number): Scene["hand"] => {
  if (p === 0 || SILENT_SET.has(p)) return undefined;
  const to = digits(valueAt(p));
  const from = digits(p > 0 ? valueAt(p - 1) : 0);
  const moved = [0, 1].filter((i) => to[i] !== from[i]);
  if (moved.length !== 1) return undefined;
  const rod = moved[0];
  const lowerFrom = from[rod] % 5;
  const lowerTo = to[rod] % 5;
  if (lowerTo > lowerFrom) return { digit: "thumb", direction: "up", rod, heaven: false };
  if (from[rod] >= 5 !== to[rod] >= 5) {
    const down = to[rod] >= 5;
    return { digit: down ? "index" : "thumb", direction: down ? "down" : "up", rod, heaven: true };
  }
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod, heaven: false };
  return undefined;
};

/** The second hand, for a line where both kinds of bead move on one rod. None in E06's sums, but the
 *  derivation is the same one E04 and E05 use and costs nothing to keep correct. */
const hand2For = (p: number): Scene["hand2"] => {
  if (p === 0 || SILENT_SET.has(p)) return undefined;
  const to = digits(valueAt(p));
  const from = digits(p > 0 ? valueAt(p - 1) : 0);
  const moved = [0, 1].filter((i) => to[i] !== from[i]);
  if (moved.length !== 1) return undefined;
  const rod = moved[0];
  const earth = to[rod] % 5 !== from[rod] % 5;
  const heaven = from[rod] >= 5 !== to[rod] >= 5;
  if (!earth || !heaven) return undefined;
  const down = to[rod] >= 5;
  return { digit: down ? "index" : "thumb", direction: down ? "down" : "up", rod, heaven: true };
};

/**
 * THE JOB CARD's state per phrase. Each sum is split the way the narration splits it, and `done`
 * advances as each rod's move lands — so the tick and the beads happen on the same beat.
 */
/**
 * THE COLUMN SUM per phrase: which sum is on the card, which ROW the narration is on, and which
 * PLACE is being worked.
 *
 * `step` is E03's vocabulary — none / first / second / answer — and `activeRod` is this episode's
 * addition: 1 while the tens rod is being worked, 0 while the ones rod is. Together they say "we are
 * on the second number, in the tens column", which is exactly what the narrator is saying.
 */
type SumSpec = { a: number; b: number; op: string; total?: number; step: SumStep; activeRod?: number };

const SUMS: Record<number, SumSpec> = (() => {
  const out: Record<number, SumSpec> = {};
  const put = (ps: number[], v: SumSpec) => ps.forEach((p) => (out[p] = v));

  // ---- 21 + 3, a ones-only sum
  const A = { a: 21, b: 3, op: "+" };
  put([12, 13], { ...A, step: "none" });
  put([14, 15, 16], { ...A, step: "first" });
  put([17, 18], { ...A, step: "second" });
  put([19], { ...A, step: "second", activeRod: 0 });
  put([20, 21], { ...A, step: "second", activeRod: 1 });
  put([22], { ...A, step: "second", activeRod: 0 });
  put([23], { ...A, total: 24, step: "answer" });

  // ---- 13 + 26, both rods, and the ones rod needs both kinds of bead
  const B = { a: 13, b: 26, op: "+" };
  put([25, 26], { ...B, step: "none" });
  put([27, 28], { ...B, step: "first" });
  put([29, 30, 31], { ...B, step: "second" });
  put([32, 33, 34, 35, 36, 37, 38], { ...B, step: "second", activeRod: 0 });
  put([39, 40, 41, 42], { ...B, step: "second", activeRod: 1 });
  put([43], { ...B, step: "second" });
  put([44], { ...B, total: 39, step: "answer" });

  // ---- 39 − 15
  const C = { a: 39, b: 15, op: "−" };
  put([49, 50], { ...C, step: "first" });
  put([51, 52], { ...C, step: "second" });
  put([53, 54, 55, 56, 57], { ...C, step: "second", activeRod: 0 });
  put([58, 59, 60, 61], { ...C, step: "second", activeRod: 1 });
  put([62], { ...C, step: "second" });
  put([63], { ...C, total: 24, step: "answer" });

  // ---- your turn: 23 + 11, the child's sum
  const D = { a: 23, b: 11, op: "+" };
  put([65, 66, 67, 68], { ...D, step: "second" });
  put([69, 70], { ...D, total: 34, step: "answer" });
  return out;
})();

/**
 * THE ROD CHECKLIST, on the two worked TWO-ROD sums only.
 *
 * `done` is the count finished at the START of the line and `doing` marks the line whose bead move
 * finishes the next rod, so the tick draws with the beads rather than being pre-ticked. Deliberately
 * absent from 21 + 3 (one rod — a one-row checklist is a label) and from the your-turn sum (ticking
 * the child's own work off for them answers the question they were asked).
 */
const TICKS: Record<number, { rods: number[]; done: number; doing?: boolean }> = (() => {
  const out: Record<number, { rods: number[]; done: number; doing?: boolean }> = {};
  const run = (rods: number[], phases: [number[], number, boolean?][]) => {
    for (const [ps, done, doing] of phases) for (const p of ps) out[p] = { rods, done, doing };
  };
  // [0, 1] — ONES first, then tens. The order the rows are listed in is the order the episode
  // teaches, so the checklist is also a statement of the rule.
  //
  // 13 + 26: the ones rod is not finished until the UPPER bead lands on p37, one phrase after the
  // lower bead moves on p36 — the tick waits for the whole rod, not the first bead on it.
  run([0, 1], [
    [[29, 30, 31, 32, 33, 34, 35, 36], 0],
    [[37], 0, true],
    [[38, 39, 40], 1],
    [[41], 1, true],
    [[42, 43, 44], 2],
  ]);
  // 39 − 15
  run([0, 1], [
    [[51, 52, 53, 54, 55], 0],
    [[56], 0, true],
    [[57, 58, 59], 1],
    [[60], 1, true],
    [[61, 62, 63], 2],
  ]);
  return out;
})();

/** The phrase each sum FIRST appears on, so the card pops once and then holds still. */
const SUM_FIRST = new Set(
  Object.keys(SUMS)
    .map(Number)
    .filter((p) => !SUMS[p - 1])
);

/** The frame each answer LANDS on — the first frame of its line's final word. */
const ANSWER_LINES = [23, 44, 63, 69];

const ANSWER_TEXT: Record<number, string> = {
  23: "21 + 3 = 24",
  44: "13 + 26 = 39",
  63: "39 - 15 = 24",
  69: "23 + 11 = 34",
};
const ANSWER_FRAME = new Map<number, number>();
for (const i of ANSWER_LINES) {
  ANSWER_FRAME.set(i, wordFrameIn(PHRASES[i], "$last", FPS) ?? sec(PHRASES[i].start, FPS));
}
const BURST_FROM = new Map<number, number>();
for (const [i, f] of ANSWER_FRAME) {
  BURST_FROM.set(i, f);
  BURST_FROM.set(i + 1, f);
}

/** Lines where a calculation is in progress, so the live value belongs above the abacus. */
const isWorking = (p: number) =>
  (p >= 13 && p <= 23) || (p >= 26 && p <= 44) || (p >= 49 && p <= 63) || (p >= 65 && p <= 70);

/**
 * THE NUMBER SPLITS, one entry per phrase that names a piece.
 *
 * Three of them, and the middle one is the important one: "six is five and one" decomposes a DIGIT,
 * which is the move every formula from E08 is built on. All three used to be spoken over nothing but
 * the running value chip.
 *
 * The chip is suppressed on these lines (see `sceneFor`) because the split IS the information — a
 * live total beside it competes for the same glance.
 */
const SPLITS: Record<number, NonNullable<Scene["split"]>> = {
  // twenty-six is twenty … and six
  30: { whole: "26", parts: ["20", "6"], shown: 1, colours: [PLACE_COLORS[1], PLACE_COLORS[0]] },
  31: { whole: "26", parts: ["20", "6"], shown: 2, colours: [PLACE_COLORS[1], PLACE_COLORS[0]] },
  // six is five … and one — with the two BEADS those pieces actually are
  33: { whole: "6", parts: ["5", "1"], shown: 1, colours: ["#F2543D", "#F2543D"], beads: true },
  34: { whole: "6", parts: ["5", "1"], shown: 2, colours: ["#F2543D", "#F2543D"], beads: true },
  // fifteen is ten … and five
  51: { whole: "15", parts: ["10", "5"], shown: 1, colours: [PLACE_COLORS[1], PLACE_COLORS[0]] },
  52: { whole: "15", parts: ["10", "5"], shown: 2, colours: [PLACE_COLORS[1], PLACE_COLORS[0]] },
};

/**
 * WHAT THE MONKEY IS DOING, decided per phrase and listed explicitly.
 *
 * It used to `point` on every line that had no finger hand, which meant it pointed at a bead on lines
 * that named no bead — including "on each rod, the lower beads move first, then the upper bead",
 * where it reached for the UPPER bead while the band underneath marked the LOWER section. A character
 * whose gesture contradicts the frame is worse than no character.
 *
 * So a point now has to be earned by the words: only a line that names a specific rod gets one.
 * Everything else sits and holds the abacus, which is what watching looks like.
 */
const CHEERS = new Set([23, 44, 63, 69, 70]);
/** lines that hand the sum from one rod to the other — the hop IS the "one rod, then the other" */
const HOPS = new Set([9, 39, 58]);
/** lines that name a particular rod, and only those */
const POINTS = new Set([3, 4, 18, 20, 21, 22, 32, 38, 40, 42, 53, 57, 59, 61]);

const monkeyFor = (p: number): MonkeyMood | undefined => {
  // never share a line with the finger hand: two things reaching for one rod is a muddle
  if (handFor(p)) return undefined;
  if (CHEERS.has(p)) return "cheer";
  if (HOPS.has(p)) return "hop";
  if (POINTS.has(p)) return "point";
  return "sit";
};

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const chipsFor = (p: number): number[] | undefined => {
  if (p === 3) return [0];
  if (p === 4 || p === 5) return [0, 1];
  if (p >= 12 && p <= 70) return [0, 1];
  return undefined;
};

const sceneFor = (p: number): Scene => {
  const target = rodFor(p);
  const chips = chipsFor(p);
  const base = {
    stage: "abacus" as const,
    rods: rig(p, chips),
    scale: BASE,
    targetRod: target,
    highlight: null,
    hand: handFor(p),
    hand2: hand2For(p),
    // The instruction is obeyed AFTER it is spoken, on every line that moves a bead.
    moveOn: !SILENT_SET.has(p) && valueAt(p) !== valueAt(p - 1) ? "$last" : undefined,
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
    // THE LEFT COLUMN CLEARS THE MOMENT THE SUM IS ANSWERED. The answer beat puts the whole sum
    // across the top — "39 - 15 = 24" — and the column card underneath was then saying the same
    // thing a second time, in a second place, with the checklist under it saying it a third. Once a
    // question is answered its working is clutter.
    sum: SUMS[p]?.step === "answer" ? undefined : SUMS[p],
    ticks: SUMS[p]?.step === "answer" ? undefined : TICKS[p],
    split: SPLITS[p],
    // the split owns the headline band on its lines; a running total beside it competes
    valueChip: isWorking(p) && !SPLITS[p],
    big: ANSWER_TEXT[p],
  };

  // ---------------------------------------------------------------- 1 · HOOK (canopy)
  if (p <= 1) {
    return {
      ...base,
      world: "canopy",
      rodBand: p === 0 ? 0 : undefined,
      boxRods: p === 1 ? 2 : undefined,
      headline: p === 1 ? "Two rods together" : undefined,
      monkey: monkeyFor(p),
    };
  }

  // ------------------------------------------- 2 · WHAT THE SECOND ROD IS FOR (vinebridge)
  if (p <= 5) {
    return {
      ...base,
      world: "vinebridge",
      rodBand: p === 3 ? 0 : p === 4 ? 1 : undefined,
      headline: p === 5 ? "up to ninety-nine" : undefined,
      monkey: monkeyFor(p),
    };
  }

  // ---------------------------------------------- 3 · THE BIG IDEA, AND BOTH RULES (clearing)
  if (p <= 11) {
    return {
      ...base,
      world: "clearing",
      // p8  "we do one rod, then the other rod"     — band the tens
      // p9  "we always start on the right"          — the monkey HOPS to the ones rod, which is the
      //                                              rule acted out rather than stated
      // p10 "lower beads move first, then the upper" — band the bottom section
      // "we do one rod, then the other rod" is ONE phrase naming TWO rods, so the band moves across
      // it. Held on a single rod for the whole line, the words moved and the picture did not.
      rodBandSeq: p === 8 ? [1, 0] : undefined,
      rodBand: p === 9 ? 0 : undefined,
      // "the lower beads move first, THEN THE UPPER BEAD" names both sections, so the band travels
      // from the bottom to the top across the line instead of sitting on the bottom throughout.
      bandSeq: p === 10 ? (["bottom", "top"] as const).slice() : undefined,
      monkey: monkeyFor(p),
      headline: p === 7 ? "one rod at a time" : p === 10 ? "lower beads first" : undefined,
    };
  }

  // ------------------------------------------------------- 4 · TWENTY-ONE PLUS THREE (bananagrove)
  if (p <= 23) {
    return {
      ...base,
      world: "bananagrove",
      // "the tens rod doesn't move at all" / "it's still showing twenty" — band the rod that STAYS
      rodBand: p === 20 || p === 21 ? 1 : p === 18 || p === 22 ? 0 : undefined,
      monkey: monkeyFor(p),
    };
  }

  // ------------------------------------------- 5 · THIRTEEN PLUS TWENTY-SIX (waterfall)
  if (p <= 44) {
    return {
      ...base,
      world: "waterfall",
      rodBand: p === 39 || p === 40 || p === 42 ? 1 : p === 32 || p === 38 ? 0 : undefined,
      // p33-35 are the decomposition — "six is five and one", "lower beads always move first" — so
      // the bottom section is banded while it is being explained
      band: p === 34 || p === 35 ? "bottom" : p === 33 ? "top" : undefined,
      // the hop crosses to the tens rod on the line that hands the sum over
      monkey: monkeyFor(p),
      headline: p === 24 ? "both rods" : undefined,
    };
  }

  // ---------------------------------------------------------------- 6 · THE RULE SO FAR (riverbank)
  if (p <= 47) {
    return {
      ...base,
      world: "riverbank",
      headline: p === 46 ? "two little sums" : undefined,
      monkey: monkeyFor(p),
    };
  }

  // -------------------------------------------- 7 · THIRTY-NINE TAKE AWAY FIFTEEN (treehouse)
  if (p <= 63) {
    return {
      ...base,
      world: "treehouse",
      rodBand: p === 58 || p === 59 || p === 61 ? 1 : p === 53 || p === 57 ? 0 : undefined,
      band: p === 55 ? "top" : undefined,
      monkey: monkeyFor(p),
      headline: p === 48 ? "taking away too" : undefined,
    };
  }

  // ---------------------------------------------------------------- 8 · YOUR TURN (blossom)
  if (p <= 70) {
    return {
      ...base,
      world: "blossom",
      headline: p === 64 ? "your turn" : undefined,
      monkey: monkeyFor(p),
      celebrate: p === 69 || p === 70 ? ("party" as const) : base.celebrate,
    };
  }

  // ---------------------------------------------------------------- 9 · CLOSE (blossom)
  //
  // THE WHOLE CLOSE IS OFF THE ABACUS, from the first close line — not the second. The practice line
  // used to fall through to `closeBeat: "store"` while `closing` was still false, so the store phone
  // rendered on top of a live abacus with the monkey over both.
  //
  //   p71  practice — the list of sums to try, NO store UI
  //   p72  like & subscribe
  //   p73-74  the store flow
  //   p75-77  the next-episode teaser
  return {
    ...base,
    world: "blossom",
    closing: true,
    closeBeat: p === 71 ? "practice" : p === 72 ? "subscribe" : p <= 74 ? "store" : "next",
    worldWash: 0.55,
    noCaption: p === 73 || p === 74,
    monkey: p === 71 || p === 72 ? "cheer" : undefined,
    valueChip: false,
    sum: undefined,
    ticks: undefined,
  };
};

const STORE_START = (() => {
  const i = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "store");
  return i === undefined ? 0 : sec(PHRASES[i].start, FPS);
})();

const STORE_FRAMES = (() => {
  const idx = PHRASES.map((x) => x.index).filter((i) => sceneFor(i).closeBeat === "store");
  if (!idx.length) return 1;
  return sec(PHRASES[idx[idx.length - 1]].end, FPS) - STORE_START;
})();

const SFX_CUES: SfxCue[] = (() => {
  const cues: SfxCue[] = [];
  const at = (i: number) => sec(PHRASES[i].start, FPS);
  const add = (frame: number, file: string, len: number, vol: number) =>
    cues.push({ frame: Math.max(0, Math.round(frame)), file, len, vol });
  const on = (i: number, w: string) => wordFrameIn(PHRASES[i], w, FPS) ?? at(i);

  for (let i = 1; i < PHRASES.length; i++) {
    if (valueAt(i) === valueAt(i - 1)) continue;
    const mv = sceneFor(i).moveOn;
    add(mv ? on(i, mv) : at(i), "abacus_move.mp3", 30, 0.32);
  }
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);

  // THE MONKEY GETS A VOICE, on the same principle E05 established for the astronaut: the most
  // expressive thing on screen should not be silent. Placed where the gesture happens, not at the
  // line's start, and all well under the narration.
  //   swing — a whoosh as it crosses between rods
  //   point — a light click as the arm arrives
  //   cheer — a clap under the answer chime
  for (let i = 0; i < PHRASES.length; i++) {
    const sc = sceneFor(i);
    if (!sc.monkey || sc.hand) continue;
    const start = at(i);
    const span = sec(PHRASES[i].end, FPS) - start;
    if (sc.monkey === "hop") add(start + span * 0.25, "swipe.mp3", 22, 0.2);
    else if (sc.monkey === "point") add(start + span * 0.2, "btn_click.mp3", 16, 0.13);
    else if (sc.monkey === "cheer") add(start + span * 0.12, "clap.mp3", 50, 0.18);
  }

  // a tick as each rod is checked off
  for (let i = 1; i < PHRASES.length; i++) {
    if (TICKS[i]?.doing) {
      const mv = sceneFor(i).moveOn;
      add((mv ? on(i, mv) : at(i)) + 6, "option_correct_ans.mp3", 24, 0.16);
    }
  }
  // a soft click when the sum card's highlight moves to a new row or a new column, so the card is
  // heard to advance as well as seen to
  for (let i = 1; i < PHRASES.length; i++) {
    const a = SUMS[i - 1];
    const b = SUMS[i];
    if (b && a && (a.step !== b.step || a.activeRod !== b.activeRod)) {
      add(at(i) + 4, "btn_click.mp3", 18, 0.2);
    }
  }

  // THE LIKE & SUBSCRIBE BEAT GETS SOUND. It animates a thumb and a ringing bell in silence
  // otherwise, which is the one beat in the close asking the viewer to DO something.
  {
    const i = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "subscribe");
    if (i !== undefined) {
      const st = at(i);
      const span = sec(PHRASES[i].end, FPS) - st;
      add(st + span * 0.16, "btn_click.mp3", 20, 0.3); // the thumb is tapped
      add(st + span * 0.45, "btn_click.mp3", 20, 0.3); // the bell is tapped
      add(st + span * 0.58, "bell.mp3", 46, 0.34); // and it rings
    }
  }
  // the practice list, one soft tick per pair as they appear
  {
    const i = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "practice");
    if (i !== undefined) {
      const st = at(i);
      const span = sec(PHRASES[i].end, FPS) - st;
      for (let k = 0; k < 3; k++) add(st + span * (0.12 + k * 0.2), "btn_click.mp3", 16, 0.16);
    }
  }

  const rate = STORE_FRAMES / 136;
  add(STORE_START + 50 * rate, "btn_click.mp3", 20, 0.28);
  add(STORE_START + 92 * rate, "btn_click.mp3", 20, 0.3);
  add(STORE_START + 136 * rate - 8, "play_win.mp3", 60, 0.26);
  add(at(75), "swipe.mp3", 16, 0.24);
  return cues;
})();

/**
 * WHERE THE MONKEY HANGS, and what it is reaching for.
 *
 * The grip lands ON THE BEAM, just outside the frame's right edge, and the free hand reaches to the
 * rod the line is about. Both are read off the live abacus box, so the character follows the
 * instrument at any scale and in either aspect — the mistake E05's astronaut made was being placed
 * against the frame instead of against the rod.
 */
const monkeyAt = (
  box: AbacusBox,
  L: { W: number; H: number; portrait: boolean },
  rod: number,
  heaven: boolean,
  closing = false
) => {
  // ON A CLOSING BEAT there is no abacus to sit beside, and the card is centred in the frame — so
  // anchoring to the (invisible) instrument put the monkey directly behind the card, with only its
  // tail showing past the edge. It moves to the bottom corner and cheers from there.
  if (closing) {
    const scale = L.portrait ? 1.5 : 1.9;
    const r = 76 * scale;
    return {
      x: L.W - r - (L.portrait ? 40 : 90),
      y: L.H * (L.portrait ? 0.74 : 0.7),
      scale,
      r,
      reach: 0,
      reachY: 0,
      // nothing to hold on a closing beat — the instrument is off the stage
      hold: 0,
      holdY: 0,
    };
  }
  // Big enough to read a pose on. At 1.22 it was a 90 px animal in a 1080 px frame — present, but you
  // could not tell a point from a swing, which is the only reason it has moods.
  const scale = box.scale * (L.portrait ? 1.3 : 1.55);
  const r = 76 * scale;
  // THE GRIP IS ON THE BEAM. Not "roughly 0.42 of the box" — the actual beam, from the same helper
  // the beads are placed with, just outside the frame's right upright. A character that holds the
  // instrument has to hold the part of it that is really there, or it reads as floating beside it,
  // which is exactly what every earlier character did.
  const gripX = Math.min(box.left + box.w + 74 * box.scale, L.W - r * 0.55);
  const gripY = beamY(box);
  // the bead it is working: rod centre, above or below the beam depending on which kind
  const rodCx = rodX(box, rod);
  const beadY = heaven ? upperBeadY(box, false) : lowerBeadY(box, 1.5);
  return {
    x: gripX,
    y: gripY,
    scale,
    r,
    // local units, POSITIVE towards the beads — the group is mirrored by `facing`
    reach: Math.max(0, (gripX - rodCx) / scale),
    // the body hangs 64 local units below the grip, so the reaching hand's y is measured from there
    reachY: (beadY - gripY) / scale - 64,
    // the HOLDING hand takes the abacus's right upright, a little inside its edge so the hand is
    // properly occluded rather than balanced on the rim
    hold: Math.max(0, (gripX - (box.left + box.w - 16 * box.scale)) / scale),
    holdY: (beamY(box) + 26 * box.scale - gripY) / scale - 46,
  };
};

/** The live value, ABOVE the abacus, while a sum is being worked. */
const valueChipAt = (L: { W: number; band: { headlineTop: number } }) => ({
  x: (L.W - 260) / 2,
  y: 24,
  w: 260,
  h: 108,
});

export const E06TwoRods: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e006_add_sub_2rods/E06_new.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={0}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_JUNGLE}
    beadArrows
    colorOnArrival
    sideRoom={() => PORTRAIT_ROOM}
    stageShift={() => ({ left: 0, right: 0 })}
    boxesFor={(scene, ctx) => {
      const L = ctx.layout;
      const out = [];
      if (scene.big) {
        const w = bigW(scene.big);
        out.push({ label: "number", r: { x: (L.W - w) / 2, y: BIG_TOP, w, h: BIG_H } });
      }
      if (scene.valueChip && !scene.big && !scene.headline) {
        out.push({ label: "valueChip", r: valueChipAt(L) });
      }
      if (scene.sum) {
        const s = L.portrait ? 0.74 : 0.92;
        out.push({
          label: "sumCard",
          r: L.portrait
            ? { x: 34, y: L.cardBand!.top + 8, w: COL_NAT.w * s, h: COL_NAT.h * s }
            : { x: 44, y: L.band.stageTop + 34, w: COL_NAT.w * s, h: COL_NAT.h * s },
        });
      }
      if (scene.split) {
        const sc = L.portrait ? 0.62 : 0.82;
        const w = SPLIT_NAT.w * sc;
        out.push({ label: "split", r: { x: (L.W - w) / 2, y: 18, w, h: SPLIT_NAT.h * sc } });
      }
      if (scene.ticks) {
        const sc = L.portrait ? 0.78 : 0.9;
        const sumS = L.portrait ? 0.74 : 0.92;
        out.push({
          label: "rodTicks",
          r: {
            x: L.portrait ? 34 + COL_NAT.w * sumS + 26 : 44,
            y: L.portrait ? L.cardBand!.top + 8 : L.band.stageTop + 34 + COL_NAT.h * sumS + 20,
            w: TICKS_NAT.w * sc,
            h: TICKS_NAT.h * sc,
          },
        });
      }
      if (scene.closeBeat === "practice") {
        const sc = L.portrait ? 0.92 : 1.16;
        const w = PRACTICE_NAT.w * sc;
        const h = PRACTICE_NAT.h * sc;
        out.push({
          label: "practice",
          r: { x: (L.W - w) / 2, y: L.portrait ? L.H * 0.17 : (L.H - h) / 2, w, h },
        });
      }
      if (scene.monkey && !scene.hand) {
        const m = monkeyAt(ctx.box, L, scene.targetRod ?? 0, false, Boolean(scene.closing));
        out.push({
          label: "monkey",
          r: { x: m.x - m.r, y: m.y - m.r * 0.5, w: m.r * 2, h: m.r * 2.6 },
          // It holds the beam and reaches onto the rod, exactly as the finger hand does, so it
          // carries the same permission.
          mayTouchAbacus: true,
          mayExitFrame: true,
        });
      }
      return out;
    }}
    renderBehind={(scene, ctx) =>
      // The monkey HOLDS the abacus: its far arm reaches round the right upright and is drawn behind
      // the instrument, which is the only way the grip reads as a grip. Not on a closing beat (no
      // abacus to hold) and not when a finger hand owns the frame.
      // Only while the monkey is SITTING. The holding arm is drawn outside the body's transform (it
      // has to be, to sit behind the abacus), so it does not inherit the hop or the jump — during
      // those the body moved and the arm stayed pinned in mid-air, detached. A monkey that is
      // jumping has let go anyway, which makes the honest fix the simple one.
      scene.monkey &&
      (scene.monkey === "sit" || scene.monkey === "point") &&
      !scene.hand &&
      !scene.closing ? (
        <svg
          width={ctx.layout.W}
          height={ctx.layout.H}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {(() => {
            const m = monkeyAt(ctx.box, ctx.layout, scene.targetRod ?? 0, false, false);
            return (
              <MonkeyHoldArm
                x={m.x}
                y={m.y}
                scale={m.scale}
                frame={ctx.frame}
                fps={FPS}
                reach={m.hold}
                reachY={m.holdY}
              />
            );
          })()}
        </svg>
      ) : null
    }
    renderOver={(scene, ctx) => (
      <>
        {/* THE MONKEY. Never on a line that also has a finger hand — two things reaching for the
            same rod is a muddle as well as a collision, the rule E03's plus character established. */}
        {scene.monkey && !scene.hand && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            {(() => {
              const m = monkeyAt(ctx.box, ctx.layout, scene.targetRod ?? 0, false, Boolean(scene.closing));
              return (
                <Monkey
                  x={m.x}
                  y={m.y}
                  scale={m.scale}
                  reach={scene.monkey === "point" ? m.reach : 0}
                  reachY={m.reachY}
                  mood={scene.monkey}
                  branch
                  holding={scene.monkey === "sit" || scene.monkey === "point"}
                  progress={ctx.beatProgress}
                  frame={ctx.frame}
                  fps={FPS}
                />
              );
            })()}
          </svg>
        )}

        {/* THE COLUMN SUM, on the LEFT of the abacus. Column form is how a child meets arithmetic on
            paper, and it gives every number its own row to be highlighted on. */}
        {scene.sum && (() => {
          const L = ctx.layout;
          const s = L.portrait ? 0.74 : 0.92;
          const prev = SUMS[ctx.p - 1];
          return (
            <div
              style={{
                position: "absolute",
                left: L.portrait ? 34 : 44,
                top: L.portrait ? L.cardBand!.top + 8 : L.band.stageTop + 34,
              }}
            >
              <ColumnSum
                a={scene.sum.a}
                b={scene.sum.b}
                op={scene.sum.op}
                total={scene.sum.total}
                step={scene.sum.step}
                prevStep={prev?.step ?? "none"}
                activeRod={scene.sum.activeRod}
                popIn={SUM_FIRST.has(ctx.p)}
                bg={WORLDS[scene.world].accent}
                progress={ctx.beatProgress}
                scale={s}
              />
            </div>
          );
        })()}

        {/* THE ROD CHECKLIST. Under the sum card in 16:9; beside it in the 4:5 card band, where there
            is width to spare and no height. */}
        {scene.ticks && (() => {
          const L = ctx.layout;
          const sc = L.portrait ? 0.78 : 0.9;
          const sumS = L.portrait ? 0.74 : 0.92;
          return (
            <div
              style={{
                position: "absolute",
                left: L.portrait ? 34 + COL_NAT.w * sumS + 26 : 44,
                top: L.portrait
                  ? L.cardBand!.top + 8
                  : L.band.stageTop + 34 + COL_NAT.h * sumS + 20,
              }}
            >
              <RodTicks
                rods={scene.ticks.rods}
                done={scene.ticks.done}
                doing={scene.ticks.doing ? ctx.settle : 0}
                scale={sc}
              />
            </div>
          );
        })()}

        {/* THE NUMBER SPLIT, in the headline band — the slot the value chip would have used. */}
        {scene.split && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 18,
              width: ctx.layout.W,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <SplitCard
              whole={scene.split.whole}
              parts={scene.split.parts}
              shown={scene.split.shown}
              colours={scene.split.colours}
              beads={
                scene.split.beads
                  ? {
                      heaven: [RIG_JUNGLE.onTop, RIG_JUNGLE.onEdge],
                      earth: [RIG_JUNGLE.onBottom, RIG_JUNGLE.onEdge],
                      rod: RIG_JUNGLE.rod,
                      beam: RIG_JUNGLE.beam,
                    }
                  : undefined
              }
              accent={WORLDS[scene.world].accent}
              progress={ctx.beatProgress}
              scale={ctx.layout.portrait ? 0.62 : 0.82}
            />
          </div>
        )}

        {/* The live value, above the abacus, only once the beads have ARRIVED. */}
        {scene.valueChip && !scene.big && !scene.headline && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 24,
              width: ctx.layout.W,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 76,
                color: "#FFFFFF",
                background: WORLDS[scene.world].accent,
                borderRadius: 34,
                padding: "6px 40px",
                boxShadow: "0 8px 0 rgba(62,36,16,0.25)",
              }}
            >
              {ctx.settle > 0.85
                ? valueAt(ctx.p)
                : valueAt(ctx.p - 1 >= 0 ? ctx.p - 1 : 0)}
            </div>
          </div>
        )}

        {/* the big answer, in the headline band */}
        {scene.big && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: BIG_TOP + bob(ctx.frame, FPS, 5, 3.4),
              width: ctx.layout.W,
              textAlign: "center",
            }}
          >
            <Card bg={WORLDS[scene.world].accent}>
              <StickerText size={BIG_SIZE}>{scene.big}</StickerText>
            </Card>
          </div>
        )}

        {/* ---------------------------------------------------------------- the close */}
        {/* THE PRACTICE LIST. A practice prompt with an empty screen wastes the line — and a child
            told to "try a few more" cannot yet invent a two-rod sum that needs no formula, so the
            episode supplies six that do not. */}
        {scene.closeBeat === "practice" && (
          <div
            style={{
              // CENTRED in 16:9, but sitting HIGH in 4:5. A portrait frame is tall enough that a
              // centred card lands right where the monkey is, and the two crowd each other at the
              // right edge; lifting the card gives the character its own clear band underneath.
              position: "absolute",
              left: 0,
              top: 0,
              width: ctx.layout.W,
              height: ctx.layout.H,
              display: "flex",
              alignItems: ctx.layout.portrait ? "flex-start" : "center",
              paddingTop: ctx.layout.portrait ? ctx.layout.H * 0.17 : 0,
              boxSizing: "border-box",
              justifyContent: "center",
            }}
          >
            <PracticeList
              progress={ctx.beatProgress}
              scale={ctx.layout.portrait ? 0.92 : 1.16}
              accent={WORLDS[scene.world].accent}
            />
          </div>
        )}

        {scene.closeBeat === "subscribe" && (
          <div
            style={{
              // CENTRED in the frame, not parked near the top. On its own beat this card is the only
              // thing on screen, so anything other than the middle leaves the frame looking empty —
              // which is exactly how it read.
              position: "absolute",
              left: 0,
              top: 0,
              width: ctx.layout.W,
              height: ctx.layout.H,
              display: "flex",
              alignItems: ctx.layout.portrait ? "flex-start" : "center",
              paddingTop: ctx.layout.portrait ? ctx.layout.H * 0.24 : 0,
              boxSizing: "border-box",
              justifyContent: "center",
            }}
          >
            <div style={{ transform: `scale(${ctx.layout.portrait ? 1.1 : 1.35})` }}>
              <SubscribeCard progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
            </div>
          </div>
        )}

        {scene.closeBeat === "store" && (
          <>
            <div
              style={{
                position: "absolute",
                left: ctx.layout.portrait ? (ctx.layout.W - 353) / 2 : 300,
                top: ctx.layout.portrait ? 6 : 20,
              }}
            >
              <StoreFlow
                frame={ctx.frame - STORE_START}
                fps={FPS}
                height={ctx.layout.portrait ? 720 : 760}
                span={STORE_FRAMES}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: ctx.layout.portrait ? 0 : 1090,
                top: ctx.layout.portrait ? 760 : 90,
                width: ctx.layout.portrait ? ctx.layout.W : undefined,
                display: ctx.layout.portrait ? "flex" : undefined,
                justifyContent: ctx.layout.portrait ? "center" : undefined,
                transform: ctx.layout.portrait ? "scale(0.7)" : undefined,
                transformOrigin: "top center",
              }}
            >
              <DownloadCta progress={ctx.beatProgress} />
            </div>
          </>
        )}

        {scene.closeBeat === "next" && (() => {
          const nextSet = ctx.beatProgress > 0.45;
          return (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: ctx.layout.W,
                height: ctx.layout.H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NextUpCard
                progress={ctx.beatProgress}
                title={["a sum", "that's stuck"]}
                example={
                  // THREE PLUS THREE, and no answer. E07 is the blocked case — the sum the beads
                  // cannot do — so the teaser must NOT resolve: three beads up, three more to add,
                  // and one earth bead short. A teaser that answers itself is not a teaser.
                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <span
                      style={{
                        fontFamily: KID_FONT,
                        fontWeight: 700,
                        fontSize: 54,
                        color: "#2A3552",
                      }}
                    >
                      3 + 3
                    </span>
                    <Abacus
                      rods={[{ value: 3, from: 3 }]}
                      settle={1}
                      scale={ctx.layout.portrait ? 0.46 : 0.56}
                      palette={RIG_JUNGLE}
                    />
                    <span
                      style={{
                        fontFamily: KID_FONT,
                        fontWeight: 700,
                        fontSize: ctx.layout.portrait ? 66 : 84,
                        color: nextSet ? "#F2543D" : "#B9C6CE",
                      }}
                    >
                      ?
                    </span>
                  </div>
                }
              />
            </div>
          );
        })()}
      </>
    )}
  />
);
