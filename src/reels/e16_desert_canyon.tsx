// E16 · Family Minus — the family trick for TAKING AWAY — 16:9 (the 4:5 cut and thumbnails come after approval).
//
// The mirror of E15. E13 taught the big friend for taking away (−n = +friend −10). This episode teaches what to do
// when the big friend GETS STUCK while taking away: the upper bead is UP and there are not enough free lower beads to
// ADD the friend. The fix is the SMALL friend inside the big friend's own first step, which makes the FAMILY:
//   −6 = +4 −10   and   +4 = −1 +5   so   −6 = −1 +5 −10   — "minus the lower beads, plus five, minus ten".
// Four formulas: −6, −7, −8, −9, exactly when the ones digit is 1–4 and under the number being taken away.
// (Facts, tables, finger spots: docs/E16_lines.txt's header. As recorded: docs/E16_spoken.txt — the take's last teaser
// "we mix every trick in one big challenge" was cut, it promised the wrong next episode.)
//
// THE WORLD AND THE CAST. A DESERT CANYON, apricot light at the hook fading to violet dusk, then a moonlit night, and the
// same three otters as E15 — Pip ("ME"), Fifi (small friend) and Tenzo (big friend). Each friend and its crown appear
// only when the narration first introduces the idea (Tenzo p9, Fifi p20). The three parts of the Family formula are
// the three otters: little = "minus the lower beads", middle = "plus five", big = "minus ten"; each lights on its part.
//
// ROUTINE: LOOK (room on the ones rod?) · CALL (no room: call the family) · MOVE (ones rod first). Every example runs
// Look, Call, Move in that order, and the card is on screen while each is spoken.
//
// FINGERS (EPISODE_RULES): decided by DIRECTION. Making a number pushes lower beads UP (thumb) and the upper bead DOWN
// (index finger); every move of the family formula goes DOWN (index finger): minus lower beads, the upper bead pushed
// down, the borrow off the tens rod. `handFor` derives all of it from the rod's digits before/after.
//
// Timing from src/data/e16.phrases.json, aligned from docs/E16_spoken.txt (paced against every scripted hold, then
// aligned to the real file). 138 phrases.

import React from "react";
import { interpolate } from "remotion";
import phrasesJson from "../data/e16.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { OtterFamily, FAMILY_BOX, type OtterMood } from "../components/e15/Otter";
import {
  FamilyFormula,
  FAMILY_NAT,
  PatternTable,
  PATTERN_NAT,
  FingerRule,
  FINGER_NAT,
  SmallFriendPair,
  SMALL_NAT,
  TeamCard,
  TEAM_NAT,
  type FamilyMode,
} from "../components/e15/Cards";
import {
  RoutineCard,
  ROUTINE_NAT,
  MirrorCard,
  MIRROR_NAT,
  mirrorRowsFor,
  flipRows,
  WhyMinus,
  WHYM_NAT,
  PuzzleCard,
  PUZZLE_NAT,
  E16Title,
  E16TITLE_NAT,
} from "../components/e16/Cards";
import { BigFriendCards, BIG_FRIENDS_NAT } from "../components/e11/BigFriendCards";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import { rodX } from "../stage/geometry";
import type { Scene as BaseScene } from "../stage/types";
import { WORLDS } from "../data/theme";
import { BB_RIGS } from "../data/bbworlds";
import { FPS } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";
import { HideTextStyle } from "../lib/hideText";

const RIG_CANYON = BB_RIGS.canyon;

// THE REAL FILE DURATION (ffprobe 343.368571).
export const AUDIO_SEC = 343.368571;
export const E16_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

// ------------------------------------------------------------------------------------------------ guard
// Every table below is keyed by phrase INDEX. If the aligner ever splits a line differently, an index drifts
// silently — so the load fails loudly instead: each anchor phrase must begin with the words it was written for.
const ANCHORS: Record<number, string> = {
  0: "hello again", 1: "last time", 4: "eleven take away six", 5: "make eleven", 6: "one lower bead", 7: "thumb pushes", 8: "sixs friend", 9: "the big friend says",
  11: "is there room", 12: "nope", 13: "only three", 17: "the upper bead is up", 19: "who can help", 20: "the small friend", 21: "fours small friend", 22: "to add four",
  23: "the big friend and the small friend", 24: "that team", 26: "look", 27: "call", 28: "move", 29: "look room", 30: "call no room", 31: "move ones rod",
  32: "the big friend says minus six", 33: "the small friend swaps", 34: "so the family says", 35: "why", 36: "minus ten takes", 37: "so we add",
  38: "now remember", 39: "plus six was", 40: "what changed", 41: "every sign", 42: "it is a mirror", 43: "so which finger", 44: "index finger", 47: "up is the thumb",
  48: "down is the index", 49: "move", 50: "lower beads first", 51: "minus one", 53: "plus five", 55: "tens rod last", 56: "one bead goes down", 57: "boom", 58: "eleven take away six is five",
  59: "next twentytwo", 61: "two lower beads", 62: "thumb up", 63: "look", 65: "room for three", 66: "no", 68: "call", 69: "minus seven equals", 70: "move", 71: "minus two",
  73: "now plus five", 75: "tens rod", 76: "one bead", 77: "index finger every", 78: "boom", 79: "twentytwo take away seven is fifteen",
  80: "mirror fans", 81: "and subscribe", 82: "minus eight", 83: "make ninetythree", 84: "on the ones rod three", 85: "then on the tens", 86: "thumb for the lower", 87: "look",
  89: "how many more", 90: "only one", 91: "call", 92: "minus eight equals", 93: "move", 94: "minus three", 96: "then plus five", 98: "tens rod", 99: "one bead",
  100: "boom", 101: "ninetythree take away eight", 102: "flip it", 103: "plus family up", 104: "minus family down", 105: "plus family plus", 106: "minus family minus",
  107: "same numbers", 108: "mirror moves", 109: "minus six minus seven", 110: "four mirror", 111: "your go", 112: "make eightyfour", 113: "on the ones rod four",
  114: "then on the tens", 115: "choose your", 116: "look", 117: "what is nines", 118: "one", 119: "check the ones", 121: "no room at all", 122: "call", 124: "so how many",
  125: "four", 126: "minus nine equals", 127: "move", 128: "all down", 129: "ones rod first", 130: "what number", 131: "eightyfour take away nine", 132: "mirror master",
  133: "you did look", 134: "try look call move", 135: "get abacus kids", 136: "it is free", 137: "see you next time",
};
const bareText = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");
for (const [k, v] of Object.entries(ANCHORS)) {
  const ph = PHRASES[Number(k)];
  if (!ph || !bareText(ph.text).startsWith(bareText(v))) {
    throw new Error(`E16 phrase table out of step: p${k} should start "${v}" but is "${ph?.text}"`);
  }
}
if (PHRASES.length !== 138) throw new Error(`E16 expects 138 phrases, got ${PHRASES.length}`);

interface CardSpec {
  kind: "bigfriends" | "small" | "team" | "family" | "why" | "routine" | "mirror" | "pattern" | "finger";
  /** team: "team" | "when" */
  team?: "team" | "when";
  /** family: mode, n */
  mode?: FamilyMode;
  n?: number;
  /** family: which cell (1..3) is being WORKED */
  lit?: number;
  /** family: paws joined */
  link?: number;
  /** routine: the row being spoken (0 look, 1 call, 2 move) */
  row?: number;
  /** mirror: "real" = last time over today, "flip" = plus family over minus family */
  mirror?: "real" | "flip";
}

interface Scene extends BaseScene {
  otters?: { mood: OtterMood; lit?: number };
  card?: CardSpec;
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep };
  big?: string;
  valueChip?: boolean;
  spotlightRod?: boolean;
  midSubscribe?: boolean;
  /** the hook's composition (stage === "hook") */
  hook?: { last?: boolean; title?: boolean; puzzle?: boolean };
}

const BASE = 1.2; // the abacus is the hero: its box is ~57% of the frame height
const BIG_TOP = 8;
const BIG_SIZE = 62;
const BIG_H = 128;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);
const PORTRAIT_ROOM = { left: 80, right: 220 };

// ------------------------------------------------------------------------------------------------ helpers
const wf = (p: number, needle: string, nth = 0): number => {
  const f = wordFrameIn(PHRASES[p], needle, FPS, nth);
  if (f === null) throw new Error(`E16: no word "${needle}" (#${nth}) in p${p} "${PHRASES[p].text}"`);
  return f;
};
const startF = (p: number) => sec(PHRASES[p].start, FPS);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (frame: number, at: number, len = 9) => clamp01((frame - at) / len);

/** Which of a list of word frames was the latest to start, with how long ago — drives word-synced flashes. */
const spokenNow = <T,>(frame: number, seq: { at: number; v: T }[]): { v: T; k: number } | undefined => {
  let cur: { at: number; v: T } | undefined;
  for (const s of seq) if (frame >= s.at && (!cur || s.at >= cur.at)) cur = s;
  if (!cur) return undefined;
  return { v: cur.v, k: interpolate(frame, [cur.at, cur.at + 2, cur.at + 14], [0, 1, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) };
};

// ------------------------------------------------------------------------------------------------ the abacus values
/** What the abacus reads on each phrase, combined value (ones + 10*tens). Unlisted phrases hold the previous value. */
const VALUE: Record<number, number> = (() => {
  const v: Record<number, number> = {};
  const set = (a: number, b: number, x: number) => {
    for (let p = a; p <= b; p++) v[p] = x;
  };
  set(0, 5, 0);
  set(6, 50, 11); // make eleven (steps on p6), then the problem and the wall
  set(51, 52, 10); // minus one: one lower bead down
  set(53, 55, 15); // plus five: the upper bead down
  set(56, 58, 5); // the borrow: one bead down on the tens rod
  set(59, 60, 0); // p59 clears it for the second example
  set(61, 70, 22); // make twenty-two (steps on p61)
  set(71, 72, 20); // minus two
  set(73, 75, 25); // plus five
  set(76, 81, 15); // the borrow
  set(82, 83, 0); // p82 clears it for the third example
  v[84] = 3; // three lower beads on the ones rod
  set(85, 93, 93); // four lower beads and the upper bead on the tens rod (steps on p85)
  set(94, 95, 90); // minus three
  set(96, 98, 95); // plus five
  set(99, 111, 85); // the borrow
  set(112, 112, 0); // p112 clears it for the child's turn
  v[113] = 4;
  set(114, 128, 84); // three lower beads and the upper bead on the tens rod (steps on p114)
  set(129, 133, 75); // the child's three moves (steps on p129): 84 -> 80 -> 85 -> 75
  set(134, 137, 0); // p134 clears it: "try it on your own abacus"
  return v;
})();
const valueAt = (p: number) => VALUE[p] ?? 0;
const digits = (v: number): [number, number] => [v % 10, Math.floor(v / 10) % 10];

/** Hard resets — no taught move happens on these, so no finger and no arrow. */
const SILENT_SET = new Set([59, 82, 112, 134]);
/** Lines whose beads move on their own beat (see Scene.beadSteps). */
const STEP_LINES = new Set([6, 61, 85, 114, 129]);

const rig = (p: number) => {
  const d = digits(valueAt(p));
  return Array.from({ length: 5 }, (_, i) => ({
    value: i < 2 ? d[i] : 0,
    focus: i < 2 ? 1 : 0.35,
    chipLower: i < 2 || undefined,
    placeName: i < 2 ? (i === 0 ? "ones" : "tens") : undefined,
  }));
};

/** Direction decides the finger, never the bead (same derivation E06/E11-E15 use). */
const movedRod = (p: number): number | null => {
  if (p === 0 || SILENT_SET.has(p)) return null;
  const to = digits(valueAt(p));
  const from = digits(valueAt(p - 1));
  const moved = [0, 1].filter((i) => to[i] !== from[i]);
  return moved.length === 1 ? moved[0] : null;
};

/** "Index finger!" — the hand stays on the bead it just moved while the voice names the move. */
const HOLD_HAND: Record<number, number> = { 52: 51, 54: 53, 72: 71, 74: 73, 77: 76, 95: 94, 97: 96 };
const handFor = (p: number): Scene["hand"] => {
  if (STEP_LINES.has(p)) return undefined; // beadSteps carry their own hands
  if (HOLD_HAND[p] !== undefined) return handFor(HOLD_HAND[p]);
  const rod = movedRod(p);
  if (rod === null) return undefined;
  const to = digits(valueAt(p))[rod];
  const from = digits(valueAt(p - 1))[rod];
  const lowerFrom = from % 5;
  const lowerTo = to % 5;
  if (lowerTo > lowerFrom) return { digit: "thumb", direction: "up", rod, heaven: false, dy: rod === 1 ? -120 : undefined };
  if (from >= 5 !== to >= 5) {
    const down = to >= 5;
    const lone = lowerTo === lowerFrom;
    return { digit: down ? "index" : "thumb", direction: down ? "down" : "up", rod, heaven: true, dy: down || lone ? undefined : -70 };
  }
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod, heaven: false };
  return undefined;
};

type Steps = NonNullable<Scene["beadSteps"]>;
const hThumbLower = (rod: number): Scene["hand"] => ({ digit: "thumb", direction: "up", rod, heaven: false, dy: rod === 1 ? -120 : undefined });
const hIndexUpper = (rod: number): Scene["hand"] => ({ digit: "index", direction: "down", rod, heaven: true });
const hIndexLower = (rod: number): Scene["hand"] => ({ digit: "index", direction: "down", rod, heaven: false });

/** Timed bead steps per line. The line's own `rods` are the FINAL values, so the next line travels from there. */
const BEAD_STEPS: Record<number, () => Steps> = {
  6: () => [
    { at: wf(6, "one", 0), values: [1, 0], hand: hThumbLower(0) },
    { at: wf(6, "one", 1), values: [1, 1], hand: hThumbLower(1) },
  ],
  61: () => [
    { at: wf(61, "two", 0), values: [2, 0], hand: hThumbLower(0) },
    { at: wf(61, "two", 1), values: [2, 2], hand: hThumbLower(1) },
  ],
  85: () => [
    { at: wf(85, "four"), values: [3, 4], hand: hThumbLower(1) },
    { at: wf(85, "upper"), values: [3, 9], hand: hIndexUpper(1) },
  ],
  114: () => [
    { at: wf(114, "three"), values: [4, 3], hand: hThumbLower(1) },
    { at: wf(114, "upper"), values: [4, 8], hand: hIndexUpper(1) },
  ],
  129: () => {
    // THE CHILD'S THREE MOVES: the voice says "all down, so all index finger. Ones rod first." and the moves happen in
    // the silence after it. Each is one legal move with its own index finger: four lower beads down (4 -> 0), the upper
    // bead down (0 -> 5), one bead down on the tens rod (8 -> 7).
    const end = sec(PHRASES[129].end, FPS);
    const hold = startF(130) - end;
    const at = [end + Math.round(hold * 0.12), end + Math.round(hold * 0.42), end + Math.round(hold * 0.72)];
    return [
      { at: at[0], values: [0, 8], hand: hIndexLower(0) },
      { at: at[1], values: [5, 8], hand: hIndexUpper(0) },
      { at: at[2], values: [5, 7], hand: hIndexLower(1) },
    ];
  },
};
const stepsFor = (p: number): Steps | undefined => BEAD_STEPS[p]?.();
/** p7 and p62: "Thumb pushes them up." / "Thumb up!" — the hand stays on the last lower beads. p86: thumb, then index finger. */
const HOLD_STEPS: Record<number, () => Steps> = {
  7: () => [{ at: startF(7), values: [1, 1], hand: hThumbLower(1) }],
  62: () => [{ at: startF(62), values: [2, 2], hand: hThumbLower(1) }],
  86: () => [
    { at: wf(86, "thumb"), values: [3, 9], hand: { ...hThumbLower(1)!, dy: -190 } },
    { at: wf(86, "index"), values: [3, 9], hand: hIndexUpper(1) },
  ],
};
const allSteps = (p: number): Steps | undefined => stepsFor(p) ?? HOLD_STEPS[p]?.();
const P129_STEPS = stepsFor(129)!;

const ROD_FOR_OVERRIDE: Record<number, number> = { 52: 0, 54: 0, 72: 0, 74: 0, 77: 1, 95: 0, 97: 0, 55: 1, 75: 1, 98: 1, 11: 0, 31: 0, 50: 0, 65: 0, 89: 0, 119: 0, 129: 0 };
const rodFor = (p: number): number => {
  const rod = movedRod(p);
  if (rod !== null) return rod;
  return ROD_FOR_OVERRIDE[p] ?? 0;
};

/** Lines that NAME a rod without moving a bead on it: the breathing badge + chevron device E11-E15 built. */
const SPOTLIGHT_ROD = new Set([11, 31, 55, 65, 75, 89, 98, 119, 129]);

// ------------------------------------------------------------------------------------------------ the sums
const SUMS: Record<number, NonNullable<Scene["sum"]>> = (() => {
  const out: Record<number, NonNullable<Scene["sum"]>> = {};
  const put = (from: number, to: number, v: NonNullable<Scene["sum"]>) => {
    for (let p = from; p <= to; p++) out[p] = v;
  };
  const A = { a: 11, b: 6, op: "−" };
  put(5, 7, { ...A, step: "first" });
  put(8, 57, { ...A, step: "second" });
  put(58, 58, { ...A, total: 5, step: "answer" });
  const B = { a: 22, b: 7, op: "−" };
  put(59, 62, { ...B, step: "first" });
  put(63, 78, { ...B, step: "second" });
  put(79, 79, { ...B, total: 15, step: "answer" });
  const C = { a: 93, b: 8, op: "−" };
  put(82, 82, { ...C, step: "second" });
  put(83, 86, { ...C, step: "first" });
  put(87, 100, { ...C, step: "second" });
  put(101, 101, { ...C, total: 85, step: "answer" });
  const D = { a: 84, b: 9, op: "−" };
  put(112, 115, { ...D, step: "first" });
  put(116, 130, { ...D, step: "second" });
  put(131, 131, { ...D, total: 75, step: "answer" });
  return out;
})();
const SUM_FIRST = new Set(Object.keys(SUMS).map(Number).filter((p) => !SUMS[p - 1]));

const SUM_FLASH: Record<number, { word: string; nth?: number; row: "first" | "second" | "answer" }[]> = {
  5: [{ word: "eleven", row: "first" }],
  8: [{ word: "sixs", row: "second" }],
  58: [{ word: "eleven", row: "first" }, { word: "six", row: "second" }, { word: "five", row: "answer" }],
  59: [{ word: "twentytwo", row: "first" }, { word: "seven", row: "second" }],
  79: [{ word: "twentytwo", row: "first" }, { word: "seven", row: "second" }, { word: "fifteen", row: "answer" }],
  82: [{ word: "eight", row: "second" }],
  83: [{ word: "ninetythree", row: "first" }],
  101: [{ word: "ninetythree", row: "first" }, { word: "eight", row: "second" }, { word: "eightyfive", row: "answer" }],
  112: [{ word: "eightyfour", row: "first" }],
  117: [{ word: "nines", row: "second" }],
  131: [{ word: "eightyfour", row: "first" }, { word: "nine", row: "second" }, { word: "seventyfive", row: "answer" }],
};
const sumFlashFor = (p: number, frame: number): { row: "first" | "second" | "answer"; k: number } | undefined => {
  const seq = SUM_FLASH[p];
  if (!seq) return undefined;
  const hit = spokenNow(frame, seq.map((s) => ({ at: wf(p, s.word, s.nth ?? 0), v: s.row })));
  return hit ? { row: hit.v, k: hit.k } : undefined;
};
const prevSumStep = (p: number): SumStep => {
  const cur = SUMS[p];
  if (!cur) return "none";
  for (let i = p - 1; i >= 0; i--) {
    const s = SUMS[i];
    if (!s) continue;
    return s.a === cur.a && s.b === cur.b ? s.step : "none";
  }
  return "none";
};

const ANSWER_LINES = [58, 79, 101, 131];
const ANSWER_TEXT: Record<number, string> = { 58: "11 − 6 = 5", 79: "22 − 7 = 15", 101: "93 − 8 = 85", 131: "84 − 9 = 75" };
const ANSWER_FRAME = new Map<number, number>();
for (const i of ANSWER_LINES) ANSWER_FRAME.set(i, wordFrameIn(PHRASES[i], "$last", FPS) ?? startF(i));
const BURST_FROM = new Map<number, number>();
for (const [i, f] of ANSWER_FRAME) BURST_FROM.set(i, f);

// ------------------------------------------------------------------------------------------------ the left-hand card, per phrase
const CARD: Record<number, CardSpec> = (() => {
  const out: Record<number, CardSpec> = {};
  const put = (from: number, to: number, c: CardSpec) => {
    for (let p = from; p <= to; p++) out[p] = c;
  };
  put(8, 9, { kind: "bigfriends" });
  put(21, 22, { kind: "small" });
  put(23, 24, { kind: "team", team: "team" });
  put(26, 28, { kind: "routine", row: -1 });
  put(29, 29, { kind: "routine", row: 0 });
  put(30, 30, { kind: "routine", row: 1 });
  put(31, 31, { kind: "routine", row: 2 });
  put(32, 32, { kind: "family", mode: "big", n: 6 });
  put(33, 33, { kind: "family", mode: "small", n: 6 });
  put(34, 35, { kind: "family", mode: "family", n: 6 });
  put(36, 38, { kind: "why", n: 6 });
  put(39, 42, { kind: "mirror", mirror: "real" });
  put(43, 48, { kind: "finger" });
  put(49, 50, { kind: "family", mode: "family", n: 6, link: 1 });
  put(51, 52, { kind: "family", mode: "family", n: 6, link: 1, lit: 1 });
  put(53, 54, { kind: "family", mode: "family", n: 6, link: 1, lit: 2 });
  put(55, 56, { kind: "family", mode: "family", n: 6, link: 1, lit: 3 });
  put(57, 58, { kind: "family", mode: "family", n: 6, link: 1 });
  put(63, 67, { kind: "routine", row: 0 });
  put(68, 68, { kind: "routine", row: 1 });
  put(69, 70, { kind: "family", mode: "family", n: 7, link: 1 });
  put(71, 72, { kind: "family", mode: "family", n: 7, link: 1, lit: 1 });
  put(73, 74, { kind: "family", mode: "family", n: 7, link: 1, lit: 2 });
  put(75, 77, { kind: "family", mode: "family", n: 7, link: 1, lit: 3 });
  put(78, 79, { kind: "family", mode: "family", n: 7, link: 1 });
  put(87, 90, { kind: "routine", row: 0 });
  put(91, 91, { kind: "routine", row: 1 });
  put(92, 93, { kind: "family", mode: "family", n: 8, link: 1 });
  put(94, 95, { kind: "family", mode: "family", n: 8, link: 1, lit: 1 });
  put(96, 97, { kind: "family", mode: "family", n: 8, link: 1, lit: 2 });
  put(98, 100, { kind: "family", mode: "family", n: 8, link: 1, lit: 3 });
  put(101, 101, { kind: "family", mode: "family", n: 8, link: 1 });
  put(102, 104, { kind: "finger" });
  put(105, 108, { kind: "mirror", mirror: "flip" });
  put(109, 110, { kind: "pattern" });
  put(116, 117, { kind: "routine", row: 0 });
  put(118, 118, { kind: "bigfriends" });
  put(119, 121, { kind: "routine", row: 0 });
  put(122, 125, { kind: "routine", row: 1 });
  put(126, 131, { kind: "family", mode: "family", n: 9, link: 1 });
  put(134, 134, { kind: "routine", row: -2 });
  return out;
})();

/** which pair of the five big friends is lit, per line */
const BF_ACTIVE: Record<number, number | undefined> = { 8: 3, 9: 3, 118: 0 };
const NUMBER_FLASH: Record<number, { pair: number; sequence: { word: string; side: 0 | 1 }[] }> = {
  8: { pair: 3, sequence: [{ word: "sixs", side: 1 }, { word: "four", side: 0 }] },
  118: { pair: 0, sequence: [{ word: "one", side: 0 }] },
};

// ------------------------------------------------------------------------------------------------ the family card's word clock
/** frames at which each CELL of the family card (0 = left-hand side, then its parts) pops in, per example */
const REVEAL: Record<string, number[]> = {
  big: [startF(32) + 4, wf(32, "four"), wf(32, "ten")],
  small: [startF(33) + 4, wf(33, "one"), wf(33, "five")],
  fam6: [startF(34) + 6, wf(34, "one"), wf(34, "five"), wf(34, "ten")],
  fam7: [startF(69) + 6, wf(69, "two"), wf(69, "five"), wf(69, "ten")],
  fam8: [startF(92) + 6, wf(92, "three"), wf(92, "five"), wf(92, "ten")],
  fam9: [startF(126) + 6, wf(126, "four"), wf(126, "five"), wf(126, "ten")],
};
/** the word frames each cell is SPOKEN on, for the flash (the formula is spoken left to right) */
const SPOKEN: Record<string, { p: number; words: [string, number][] }[]> = {
  big: [{ p: 32, words: [["six", 0], ["four", 1], ["ten", 2]] }],
  small: [{ p: 33, words: [["four", 0], ["one", 1], ["five", 2]] }],
  fam6: [{ p: 34, words: [["six", 0], ["one", 1], ["five", 2], ["ten", 3]] }],
  fam7: [{ p: 69, words: [["seven", 0], ["two", 1], ["five", 2], ["ten", 3]] }],
  fam8: [{ p: 92, words: [["eight", 0], ["three", 1], ["five", 2], ["ten", 3]] }],
  fam9: [{ p: 126, words: [["nine", 0], ["four", 1], ["five", 2], ["ten", 3]] }],
};
const exampleKey = (c: CardSpec): string => (c.mode === "big" ? "big" : c.mode === "small" ? "small" : `fam${c.n}`);

const familyFlash = (key: string, frame: number): { cell: number; k: number } | undefined => {
  const seq: { at: number; v: number }[] = [];
  for (const s of SPOKEN[key] ?? []) for (const [w, cell] of s.words) seq.push({ at: wf(s.p, w, 0), v: cell });
  const hit = spokenNow(frame, seq);
  return hit ? { cell: hit.v, k: hit.k } : undefined;
};

// which OTTER lights, on which spoken part: [little, middle, big]
const OTTER_WORDS: Record<number, [string, string, string]> = {
  32: ["", "", "ten"],
  33: ["one", "five", ""],
  34: ["one", "five", "ten"],
  69: ["two", "five", "ten"],
  92: ["three", "five", "ten"],
  126: ["four", "five", "ten"],
};
const litFromWords = (p: number, frame: number): [number, number, number] | undefined => {
  const w = OTTER_WORDS[p];
  if (!w) return undefined;
  return w.map((needle) => {
    if (!needle) return 0;
    const at = wf(p, needle, 0);
    return interpolate(frame, [at, at + 4, at + 30, at + 42], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  }) as [number, number, number];
};

const BADGES: Record<number, [string, string, string]> = { 6: ["−1", "+5", "−10"], 7: ["−2", "+5", "−10"], 8: ["−3", "+5", "−10"], 9: ["−4", "+5", "−10"] };
const exampleOfLine = (p: number): number => (p >= 111 ? 9 : p >= 82 ? 8 : p >= 59 ? 7 : 6);

/** The frame at which a card first has CONTENT. A card is never shown empty: it fades in together with its first item. */
const contentAt = (p: number, c: CardSpec): number => {
  switch (c.kind) {
    case "small": return wf(21, "fours");
    case "team": return p === 23 ? wf(23, "big") : 0;
    case "family": return REVEAL[exampleKey(c)]?.[0] ?? 0;
    case "why": return p === 36 ? wf(36, "minus") : 0;
    case "mirror": return c.mirror === "real" ? (p === 39 ? wf(39, "six") - 4 : 0) : p === 105 ? wf(105, "family") - 4 : 0;
    case "pattern": return p === 109 ? wf(109, "six") - 4 : 0;
    case "routine": return p === 26 ? wf(26, "look") - 4 : 0;
    default: return 0;
  }
};

// ------------------------------------------------------------------------------------------------ otters, per phrase
const OTTERS: Record<number, OtterMood> = (() => {
  const t: Record<number, OtterMood> = {};
  const put = (a: number, b: number, m: OtterMood) => {
    for (let p = a; p <= b; p++) t[p] = m;
  };
  put(5, 5, "float");
  put(6, 6, "point");
  put(7, 7, "float");
  put(8, 8, "think");
  put(9, 9, "point");
  put(10, 11, "think");
  put(12, 12, "gasp");
  put(13, 13, "worry");
  put(14, 14, "gasp");
  put(15, 15, "worry");
  put(16, 18, "think");
  put(19, 19, "think");
  put(20, 20, "cheer");
  put(21, 22, "float");
  put(23, 23, "point");
  put(24, 24, "link");
  put(25, 28, "float");
  put(29, 31, "point");
  put(32, 34, "link");
  put(35, 38, "think");
  put(39, 40, "think");
  put(41, 41, "gasp");
  put(42, 42, "link");
  put(43, 43, "think");
  put(44, 44, "cheer");
  put(45, 48, "float");
  put(49, 56, "link");
  put(57, 58, "cheer");
  put(59, 59, "wave");
  put(60, 62, "float");
  put(63, 65, "think");
  put(66, 66, "gasp");
  put(67, 67, "worry");
  put(68, 68, "point");
  put(69, 77, "link");
  put(78, 79, "cheer");
  put(82, 86, "float");
  put(87, 89, "think");
  put(90, 90, "gasp");
  put(91, 91, "point");
  put(92, 100, "link");
  put(101, 101, "cheer");
  put(102, 104, "float");
  put(105, 108, "link");
  put(109, 110, "float");
  put(111, 111, "wave");
  put(112, 117, "float");
  put(118, 118, "cheer");
  put(119, 120, "think");
  put(121, 121, "worry");
  put(122, 124, "think");
  put(125, 125, "cheer");
  put(126, 129, "link");
  put(130, 130, "think");
  put(131, 133, "cheer");
  put(134, 134, "float");
  return t;
})();

// the hook (p0-4) draws its own big otter: Pip alone
const HOOK_MOOD: Record<number, OtterMood> = { 0: "wave", 1: "float", 2: "cheer", 3: "think", 4: "think" };

const HEADLINE: Record<number, string> = {
  0: "welcome back, friends!",
  3: "first, a puzzle",
  12: "nope!",
  15: "the big friend is stuck!",
  19: "who can help?",
  24: "meet the family",
  25: "look, call, move",
  35: "why does it work?",
  41: "every sign flipped!",
  42: "it is a mirror",
  59: "a bigger one",
  66: "no room!",
  82: "minus eight",
  90: "only one!",
  102: "flip it",
  111: "your go",
  122: "call the family",
  132: "mirror master!",
};

const WORKING = new Set([6, 7, 51, 52, 53, 54, 55, 56, 61, 62, 71, 72, 73, 74, 75, 76, 77, 84, 85, 86, 94, 95, 96, 97, 98, 99, 113, 114]);

// ------------------------------------------------------------------------------------------------ focus
const CALM_GAIN = 0.62; // the world steps back, it does not go dull
const calmRaw = (p: number): number => {
  if (p <= 4) return 0;
  if (p <= 9) return 0.4;
  if (p <= 15) return 0.55;
  if (p <= 22) return 0.3;
  if (p <= 25) return 0.6;
  if (p === 58) return 0.25;
  if (p <= 78) return 0.9;
  if (p === 79) return 0.25;
  if (p === 101) return 0.25;
  if (p <= 110) return 0.9;
  if (p === 131) return 0.2;
  if (p <= 130) return 0.9;
  return 0.25;
};
const calmFor = (p: number): number => CALM_GAIN * calmRaw(p);

const isLike = (p: number) => p === 80 || p === 81;
const STORE_FROM = 135;
const NEXT_FROM = 137;

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const hand = handFor(p);
  const steps = allSteps(p);
  const base = {
    stage: "abacus" as const,
    rods: rig(p),
    scale: BASE,
    targetRod: rodFor(p),
    highlight: null,
    hand,
    moveOn: !SILENT_SET.has(p) && !STEP_LINES.has(p) && valueAt(p) !== valueAt(p - 1) ? ("$last" as const) : undefined,
    silentCut: SILENT_SET.has(p),
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
    card: CARD[p],
    sum: SUMS[p],
    big: ANSWER_TEXT[p],
    valueChip: WORKING.has(p) && !ANSWER_TEXT[p],
    headline: HEADLINE[p],
    spotlightRod: SPOTLIGHT_ROD.has(p),
    otters: OTTERS[p] ? { mood: OTTERS[p] } : undefined,
    worldCalm: calmFor(p),
    beadSteps: steps,
    // the section bands: "only three fit", "the lower beads are almost full", the rule "lower beads before the upper bead"
    band: p === 13 || p === 67 || p === 90 || p === 120 ? ("bottom" as const) : undefined,
    bandSeq: p === 17 ? (["top", "bottom"] as ("top" | "bottom")[]) : p === 50 ? (["bottom", "top"] as ("top" | "bottom")[]) : undefined,
    rodBandSeq: p === 6 || p === 61 ? [0, 1] : undefined,
  };

  // ---- the hook: no abacus yet — Pip and the cards carry it
  if (p <= 4) {
    return {
      ...base,
      stage: "hook",
      world: "canyonA",
      sum: undefined,
      card: undefined,
      valueChip: false,
      otters: undefined,
      rodBandSeq: undefined,
      hook: { last: p === 1, title: p === 2 || p === 3, puzzle: p === 4 },
    };
  }

  const world =
    p <= 24 ? "canyonA"
    : p <= 79 ? "canyonB"
    : p <= 110 ? "canyonC"
    : "canyonD";

  // ---- the mid-roll like ask: only the buttons, the otters and the world
  if (isLike(p)) {
    return { ...base, world: "canyonB", closing: true, worldWash: 0.25, worldCalm: 0, sum: undefined, card: undefined, valueChip: false, spotlightRod: false, otters: { mood: p === 80 ? "wave" : "cheer" }, midSubscribe: p === 81, band: undefined, bandSeq: undefined, headline: undefined };
  }

  // ---- the close
  if (p >= STORE_FROM) {
    const closeBeat = p < NEXT_FROM ? "store" : "next";
    return { ...base, world: "canyonD", closing: true, closeBeat, worldWash: 0.35, worldCalm: 0, sum: undefined, card: undefined, valueChip: false, spotlightRod: false, otters: { mood: p === 137 ? "wave" : "float" }, noCaption: p === 136, headline: undefined, band: undefined, bandSeq: undefined };
  }

  return { ...base, world };
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

// ------------------------------------------------------------------------------------------------ SFX
/** WHO IS ON STAGE WHEN: Pip ("ME") from the start; Tenzo when the big friend is first named (p9 "The big friend says");
 *  Fifi when the small friend is first named (p20 "The small friend!"). Each pops in with its tag, then the crown drops on. */
const BIG_INTRO = 9;
const SMALL_INTRO = 20;
const enterFor = (intro: number, p: number, bp: number) => (p < intro ? 0 : p === intro ? Math.min(1, bp * 4) : 1);
const crownFor = (intro: number, p: number, bp: number) => (p < intro ? 0 : p === intro ? Math.max(0, Math.min(1, (bp - 0.3) * 3)) : 1);
const castEnter = (p: number, bp: number): [number, number, number] => [1, enterFor(SMALL_INTRO, p, bp), enterFor(BIG_INTRO, p, bp)];
const castCrowns = (p: number, bp: number): [number, number, number] => [1, crownFor(SMALL_INTRO, p, bp), crownFor(BIG_INTRO, p, bp)];

const SFX_CUES: SfxCue[] = (() => {
  const cues: SfxCue[] = [];
  const at = (i: number) => startF(i);
  const add = (frame: number, file: string, len: number, vol: number) => cues.push({ frame: Math.max(0, Math.round(frame)), file, len, vol });
  const on = (i: number, w: string, nth = 0) => wordFrameIn(PHRASES[i], w, FPS, nth) ?? at(i);

  // bead clicks where beads actually move
  for (let i = 1; i < PHRASES.length; i++) {
    if (valueAt(i) === valueAt(i - 1) || SILENT_SET.has(i) || STEP_LINES.has(i)) continue;
    add(on(i, "$last"), "abacus_move.mp3", 30, 0.32);
  }
  for (const i of STEP_LINES) for (const s of stepsFor(i)!) add(s.at, "abacus_move.mp3", 30, 0.3);
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);

  // the hook — soft, well clear of the intro seam (never percussive in the first ~150 ms)
  add(on(0, "again"), "e15_chirp.mp3", 40, 0.26);
  add(on(1, "family"), "e15_link.mp3", 44, 0.28);
  add(on(2, "taking"), "friend_sparkle.mp3", 50, 0.26);
  add(on(3, "puzzle"), "quiz_chirp.mp3", 36, 0.24);
  add(on(4, "eleven"), "count_hook.mp3", 40, 0.26);

  // the problem and the wall
  add(at(10), "tick.mp3", 20, 0.22);
  add(at(11), "quiz_chirp.mp3", 36, 0.2);
  add(at(12), "quiz_chirp.mp3", 40, 0.3); // "Nope!"
  add(on(14, "whoa"), "stuck_uhoh.mp3", 40, 0.28);
  add(on(15, "stuck"), "stuck_uhoh.mp3", 40, 0.26);
  add(at(16), "tick.mp3", 20, 0.22); // "Why?"
  add(at(19), "quiz_chirp.mp3", 36, 0.2); // "Who can help?"
  add(at(20), "e15_chirp.mp3", 40, 0.28); // "The small friend!"
  add(on(22, "five"), "friend_sparkle.mp3", 50, 0.28);
  add(on(24, "family"), "e15_link.mp3", 44, 0.34);

  // the routine
  for (const i of [26, 27, 28]) add(at(i), "tick.mp3", 20, 0.24);
  add(on(31, "first"), "reveal.mp3", 50, 0.22);

  // the worked example: the formula pieces and the family
  add(on(32, "ten"), "e15_bubble.mp3", 20, 0.28);
  add(on(33, "five"), "e15_bubble.mp3", 20, 0.26);
  add(on(34, "family"), "e15_link.mp3", 44, 0.34);
  add(on(34, "ten"), "friend_sparkle.mp3", 50, 0.3);
  add(at(35), "tick.mp3", 20, 0.22); // "Why?"
  add(on(36, "many"), "e15_bubble.mp3", 20, 0.26);
  add(on(37, "back"), "reveal.mp3", 50, 0.24);
  add(on(41, "flipped"), "reveal.mp3", 50, 0.26);
  add(on(42, "mirror"), "e15_link.mp3", 44, 0.3);
  add(at(43), "quiz_chirp.mp3", 36, 0.2);
  add(at(44), "quiz_chirp.mp3", 40, 0.3); // "Index finger!"
  for (const [i, w] of [[44, "index"], [47, "thumb"], [48, "index"]] as [number, string][]) add(on(i, w), "e15_chirp.mp3", 40, 0.2);
  for (const i of [57, 78, 100]) add(at(i), "bead_recap_sting.mp3", 50, 0.24); // "Boom!"

  // friends arrive: pop + crown sparkle
  for (const intro of [BIG_INTRO, SMALL_INTRO]) {
    add(at(intro) + 4, "cta_pop.mp3", 10, 0.3);
    add(at(intro) + (sec(PHRASES[intro].end, FPS) - at(intro)) * 0.34, "friend_sparkle.mp3", 18, 0.3);
  }

  // the like ask
  add(at(80) + 6, "e15_chirp.mp3", 40, 0.26);
  add(at(81) + 8, "btn_click.mp3", 20, 0.3);
  add(at(81) + 30, "bell.mp3", 46, 0.3);

  // 22 − 7 and 93 − 8: the questions and their answers
  add(at(59), "swipe.mp3", 16, 0.18);
  for (const i of [65, 89, 117, 124, 130]) add(at(i), "quiz_chirp.mp3", 36, 0.2);
  for (const i of [66, 90, 118, 125]) add(at(i), "quiz_chirp.mp3", 40, 0.3);
  add(on(66, "no"), "stuck_uhoh.mp3", 40, 0.22);
  add(on(69, "ten"), "friend_sparkle.mp3", 50, 0.3);
  add(on(92, "ten"), "friend_sparkle.mp3", 50, 0.3);
  add(on(69, "equals"), "e15_link.mp3", 44, 0.26);
  add(on(92, "equals"), "e15_link.mp3", 44, 0.26);
  for (const [i, w] of [[62, "thumb"], [86, "thumb"], [86, "index"], [77, "index"]] as [number, string][]) add(on(i, w), "e15_chirp.mp3", 40, 0.2);

  // the recap and your go
  add(at(102), "tick.mp3", 20, 0.22);
  for (const [i, w] of [[103, "thumb"], [104, "index"]] as [number, string][]) add(on(i, w), "e15_chirp.mp3", 40, 0.2);
  add(on(105, "ten"), "e15_bubble.mp3", 20, 0.24);
  add(on(106, "ten"), "e15_bubble.mp3", 20, 0.24);
  add(on(108, "mirror"), "e15_link.mp3", 44, 0.3);
  for (const w of ["six", "seven", "eight", "nine"]) add(on(109, w), "e15_bubble.mp3", 20, 0.22);
  add(on(110, "formulas"), "count_fanfare.mp3", 60, 0.24);
  add(at(111), "e15_chirp.mp3", 40, 0.28);
  add(on(121, "room"), "stuck_uhoh.mp3", 40, 0.24);
  add(on(126, "ten"), "friend_sparkle.mp3", 50, 0.3);
  add(on(126, "equals"), "e15_link.mp3", 44, 0.26);
  add(at(132), "count_fanfare.mp3", 60, 0.26); // "Mirror master!"

  // otter cheers, once each time a cheer starts
  for (let i = 0; i < PHRASES.length; i++) {
    const m = OTTERS[i];
    if (m === "cheer" && OTTERS[i - 1] !== "cheer" && ![58, 79, 101, 131, 20, 44].includes(i)) add(at(i) + Math.round((sec(PHRASES[i].end, FPS) - at(i)) * 0.1), "e15_chirp.mp3", 40, 0.22);
  }

  // standard close SFX
  const rate = STORE_FRAMES / 136;
  add(STORE_START + 50 * rate, "btn_click.mp3", 20, 0.28);
  add(STORE_START + 92 * rate, "btn_click.mp3", 20, 0.3);
  add(STORE_START + 136 * rate - 8, "play_win.mp3", 60, 0.26);
  const nextIdx = PHRASES.map((x) => x.index).find((i) => sceneFor(i).closeBeat === "next");
  if (nextIdx !== undefined) add(at(nextIdx), "swipe.mp3", 16, 0.24);
  return cues;
})();

// ------------------------------------------------------------------------------------------------ layout
const CARD_X = 44;
const CARD_TOP = 150;
const CARD_NAT: Record<CardSpec["kind"], { w: number; h: number }> = {
  bigfriends: BIG_FRIENDS_NAT,
  small: SMALL_NAT,
  team: TEAM_NAT,
  family: FAMILY_NAT,
  why: WHYM_NAT,
  routine: ROUTINE_NAT,
  mirror: MIRROR_NAT,
  pattern: PATTERN_NAT,
  finger: FINGER_NAT,
};
const cardScale = (c: CardSpec, portrait: boolean): number => {
  // 4:5: the card lives in the band under the abacus (y 905.., x 24..454), the sum card beside it, the otters at the right
  if (portrait) return Math.min(0.72, 200 / CARD_NAT[c.kind].h, 430 / CARD_NAT[c.kind].w);
  return c.kind === "bigfriends" ? 1.1 : 0.88;
};
const cardRect = (c: CardSpec, portrait: boolean) => {
  const s = cardScale(c, portrait);
  return { x: portrait ? 24 : CARD_X, y: portrait ? 905 : CARD_TOP, w: CARD_NAT[c.kind].w * s, h: CARD_NAT[c.kind].h * s };
};

const SUM_S = 0.78;
/** ONE FIXED PLACE, centre right: the abacus centre is y=445 (rigBand 140..750). It never moves between phrases. */
const sumRect = (W: number, _stageTop: number, portrait = false) => portrait ? { x: 470, y: 905, w: COL_NAT.w * 0.62, h: COL_NAT.h * 0.62 } : ({ x: W - 30 - COL_NAT.w * SUM_S, y: 445 - (COL_NAT.h * SUM_S) / 2, w: COL_NAT.w * SUM_S, h: COL_NAT.h * SUM_S });

/** the family of otters at the foot of the left-hand card (or, with no card, a little bigger) */
const OTTER_WATER_Y = 846;
const ottersAt = (scene: Scene, L: { W: number; H: number; portrait: boolean; band: { stageTop: number } }) => {
  if (L.portrait) return { x: 1056 - FAMILY_BOX.half * 0.6, y: 1125, s: 0.6 };
  const c = scene.card;
  const cardBottom = c ? cardRect(c, L.portrait).y + cardRect(c, L.portrait).h : 0;
  const cap = c ? (OTTER_WATER_Y - 22 - cardBottom) / FAMILY_BOX.up : 1.15;
  const s = Math.max(0.4, Math.min(c ? 0.9 : 1.0, cap));
  return { x: 24 + FAMILY_BOX.half * s, y: OTTER_WATER_Y, s };
};
const ottersRect = (m: { x: number; y: number; s: number }) => ({ x: m.x - FAMILY_BOX.half * m.s, y: m.y - FAMILY_BOX.up * m.s, w: FAMILY_BOX.half * m.s * 2, h: (FAMILY_BOX.up + FAMILY_BOX.down) * m.s });

const OTTER_LOOK = 1;

/** THE END SECTIONS (like, store, next video): ONE raised position for the friends so they never jump, with a clear gap above the caption card
 *  (caption box top is y 886 in 16:9; feet + water ring + 24 px gap must stay above it). */
const CLOSE_FEET_Y = 826;
const closingY = (portrait: boolean) => (portrait ? 1010 : CLOSE_FEET_Y);
const closingScale = (p: number, portrait: boolean) => (p === 80 ? 1.0 : 0.8) * (portrait ? 1.0 : 1);
const closingX = (p: number, W: number, portrait: boolean) => (portrait ? W / 2 : p >= NEXT_FROM || isLike(p) ? W / 2 : 300);
const NEXT_CARD_TOP = 150;
const NEXT_CARD = { w: 880, h: 280 };

export const E16FamilyMinus: React.FC = () => (
  <>
  <HideTextStyle />
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e016_family_minus/E16.mp3"
    sfx={SFX_CUES}
    music={{ file: "lesson_bed.wav", loopFrames: 800, vol: 0.12 }}
    abacusFirstFrame={startF(5)}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_CANYON}
    placeCard
    brandDark
    neatHands
    rigBand={(_s, L) => (L.portrait ? { stageTop: 200, stageBottom: 790 } : { stageTop: 140, stageBottom: 750 })}
    stageOffset={() => 0}
    beadArrows
    colorOnArrival
    sideRoom={() => PORTRAIT_ROOM}
    stageShift={() => ({ left: 0, right: 0 })}
    placeLabelHalo={() => true}
    chipInk="#06222C"
    countInk="#06222C"
    labelInk={["#06222C", "#06222C", "#06222C", "#06222C", "#06222C"]}
    captionComing={{ coming: "#5F7385", keyComing: "#A8441F" }}
    boxesFor={(scene, ctx) => {
      const L = ctx.layout;
      const p = ctx.p;
      const out = [];
      if (scene.big) {
        const w = bigW(scene.big);
        out.push({ label: "number", r: { x: (L.W - w) / 2, y: BIG_TOP, w, h: BIG_H } });
      }
      if (scene.valueChip && !scene.big && !scene.headline) {
        out.push({ label: "valueChip", r: { x: (L.W - 260) / 2, y: 24, w: 260, h: 108 } });
      }
      if (scene.card && !scene.closing) out.push({ label: "teachCard", r: cardRect(scene.card, L.portrait) });
      if (scene.sum && !scene.closing) out.push({ label: "sumCard", r: sumRect(L.W, L.band.stageTop, L.portrait) });
      if (scene.otters && !scene.closing && scene.stage === "abacus") {
        out.push({ label: "otters", r: ottersRect(ottersAt(scene, L)), mayTouchAbacus: true, mayExitFrame: true });
      }
      if (scene.closing && (isLike(p) || p >= STORE_FROM) && !L.portrait) {
        const s = closingScale(p, false);
        out.push({ label: "closingFriends", r: { x: closingX(p, L.W, false) - FAMILY_BOX.half * s, y: CLOSE_FEET_Y - FAMILY_BOX.up * s, w: FAMILY_BOX.half * 2 * s, h: (FAMILY_BOX.up + 30) * s + 26 }, mayExitFrame: true });
      }
      if (scene.closeBeat === "next" && !L.portrait) out.push({ label: "nextCard", r: { x: (L.W - NEXT_CARD.w) / 2, y: NEXT_CARD_TOP, w: NEXT_CARD.w, h: NEXT_CARD.h } });
      return out;
    }}
    renderOver={(scene, ctx) => {
      const L = ctx.layout;
      const p = ctx.p;
      const frame = ctx.frame;
      const worldAccent = WORLDS[scene.world].accent;
      const progress = ctx.beatProgress;

      // ---------------------------------------------------------------- the word clocks the cards need
      const card = scene.card;
      const fam = card && card.kind === "family" ? card : undefined;
      const famKey = fam ? exampleKey(fam) : undefined;
      const reveal = famKey ? REVEAL[famKey] : undefined;
      const cellK = reveal ? reveal.map((r) => ramp(frame, r)) : [];
      const lit4 = litFromWords(p, frame);
      const stepIdx = scene.beadSteps ? scene.beadSteps.reduce((k, s, i) => (frame >= s.at ? i : k), -1) : -1;
      const child = p === 129; // the child's three moves: the otters and the card light on each
      const litOtters: [number, number, number] = scene.otters
        ? lit4 ?? (fam?.lit ? ([fam.lit === 1 ? 1 : 0, fam.lit === 2 ? 1 : 0, fam.lit === 3 ? 1 : 0] as [number, number, number]) : child && stepIdx >= 0 ? ([stepIdx === 0 ? 1 : 0, stepIdx === 1 ? 1 : 0, stepIdx === 2 ? 1 : 0] as [number, number, number]) : [0, 0, 0])
        : [0, 0, 0];
      const famLit = fam?.lit ?? (child && stepIdx >= 0 ? stepIdx + 1 : undefined);
      const linkK = card?.kind === "family" ? clamp01(card.link === undefined ? (p === 34 ? ramp(frame, wf(34, "ten") + 10, 20) : 0) : card.link) : 0;

      return (
        <>
          {/* THE ROD SPOTLIGHT — breathing badge + bouncing chevron, reused verbatim from E11-E15 */}
          {scene.spotlightRod && !(p === 129 && frame >= P129_STEPS[0].at) && (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              {(() => {
                const rod = scene.targetRod ?? 0;
                const cx = rodX(ctx.box, rod);
                const cy = ctx.box.top + ctx.box.h / 2;
                const badgeW = 100 * ctx.box.scale;
                const badgeH = ctx.box.h - 6 * ctx.box.scale;
                const t = frame / FPS;
                const breathe = 1 + Math.sin(t * 3.4) * 0.09;
                const bobY = Math.abs(Math.sin(t * 2.6)) * 14 * ctx.box.scale;
                const chevronY = cy - badgeH / 2 - 78 * ctx.box.scale - bobY;
                return (
                  <>
                    <g transform={`translate(${cx} ${cy}) scale(${breathe}) translate(${-cx} ${-cy})`}>
                      <rect x={cx - badgeW / 2} y={cy - badgeH / 2} width={badgeW} height={badgeH} rx={24 * ctx.box.scale} fill="#FFE066" opacity={0.24} />
                      <rect x={cx - badgeW / 2} y={cy - badgeH / 2} width={badgeW} height={badgeH} rx={24 * ctx.box.scale} fill="none" stroke="#FFE066" strokeWidth={7} />
                    </g>
                    <path d={`M ${cx - 16 * ctx.box.scale} ${chevronY} L ${cx} ${chevronY + 16 * ctx.box.scale} L ${cx + 16 * ctx.box.scale} ${chevronY}`} stroke="#FFE066" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </>
                );
              })()}
            </svg>
          )}

          {/* ---------------------------------------------------------------- THE HOOK */}
          {scene.stage === "hook" && scene.hook && (
            <>
              {scene.hook.last && (
                <div style={{ position: "absolute", left: (L.W - FAMILY_NAT.w * 0.9) / 2, top: 230 }}>
                  <FamilyFormula mode="family" n={6} dir="plus" title="LAST TIME · ADDING" cellK={[0, 1, 2, 3].map((i) => ramp(frame, startF(1) + 14 + i * 7))} scale={0.9} frame={frame} />
                </div>
              )}
              {scene.hook.title && (
                <div style={{ position: "absolute", left: (L.W - E16TITLE_NAT.w * 0.8) / 2, top: 214 }}>
                  <E16Title k={ramp(frame, startF(2), 14)} chipK={ramp(frame, wf(2, "taking") - 4, 10)} frame={frame} scale={0.8} />
                </div>
              )}
              {scene.hook.puzzle && (
                <div style={{ position: "absolute", left: (L.W - PUZZLE_NAT.w) / 2, top: 214 }}>
                  <PuzzleCard k={ramp(frame, startF(4), 14)} frame={frame} />
                </div>
              )}
              <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <OtterFamily tags
                  x={L.W / 2}
                  y={L.portrait ? 1000 : 860}
                  scale={p >= 4 ? (L.portrait ? 0.95 : 1.12) : (L.portrait ? 1.1 : 1.4)}
                  mood={HOOK_MOOD[p]}
                  link={0}
                  enter={castEnter(p, progress)}
                  crowns={castCrowns(p, progress)}
                  progress={progress}
                  frame={frame}
                  fps={FPS}
                />
              </svg>
            </>
          )}

          {/* ---------------------------------------------------------------- THE OTTERS (lesson lines): small, at the foot of the left card */}
          {scene.otters && !scene.closing && scene.stage === "abacus" && (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {(() => {
                const m = ottersAt(scene, L);
                return (
                  <OtterFamily tags tagPx={L.portrait ? 15 : undefined}
                    x={m.x}
                    y={m.y}
                    scale={m.s}
                    mood={scene.otters!.mood}
                    link={card?.kind === "family" ? linkK : scene.otters!.mood === "link" ? 1 : 0}
                    lit={litOtters}
                    enter={castEnter(p, progress)}
                    crowns={castCrowns(p, progress)}
                    badges={p >= 32 ? BADGES[exampleOfLine(p)] : undefined}
                    progress={progress}
                    frame={frame}
                    fps={FPS}
                    look={OTTER_LOOK}
                  />
                );
              })()}
            </svg>
          )}

          {/* ---------------------------------------------------------------- THE LEFT-HAND TEACHING CARD */}
          {card && !scene.closing && (() => {
            const r = cardRect(card, L.portrait);
            const s = cardScale(card, L.portrait);
            const gateAt = contentAt(p, card);
            const gateK = ramp(frame, gateAt - 6, 8);
            if (gateK <= 0) return null;
            const pos: React.CSSProperties = { position: "absolute", left: r.x, top: r.y + (1 - gateK) * 16, opacity: gateK };
            if (card.kind === "bigfriends") {
              const flash = (() => {
                const cfg = NUMBER_FLASH[p];
                if (!cfg) return undefined;
                const hit = spokenNow(frame, cfg.sequence.map((q) => ({ at: wf(p, q.word, 0), v: q.side })));
                return hit ? { pair: cfg.pair, side: hit.v as 0 | 1, k: hit.k } : undefined;
              })();
              return (
                <div style={pos}>
                  <BigFriendCards shown={5} active={BF_ACTIVE[p]} arriving={!CARD[p - 1] || CARD[p - 1].kind !== "bigfriends"} prevActive={BF_ACTIVE[p - 1]} accent={worldAccent} progress={progress} flash={flash} scale={s} />
                </div>
              );
            }
            if (card.kind === "small") {
              const rv = [wf(21, "fours"), wf(21, "one", 0), wf(22, "five")];
              const k = rv.map((x) => ramp(frame, x));
              const seq = spokenNow(frame, p === 21
                ? [{ at: wf(21, "fours"), v: 0 }, { at: wf(21, "one", 0), v: 1 }]
                : [{ at: wf(22, "four"), v: 0 }, { at: wf(22, "one"), v: 1 }, { at: wf(22, "five"), v: 2 }]);
              return (
                <div style={pos}>
                  <SmallFriendPair a={4} b={1} cellK={k} flash={seq ? { cell: seq.v, k: seq.k } : undefined} scale={s} />
                </div>
              );
            }
            if (card.kind === "team") {
              const chip: [number, number] = p === 23 ? [ramp(frame, wf(23, "big")), ramp(frame, wf(23, "small"))] : [1, 1];
              const merge = p === 23 ? 0 : ramp(frame, wf(24, "team"), 14);
              const seq = p === 23
                ? spokenNow(frame, [{ at: wf(23, "big"), v: 0 }, { at: wf(23, "small"), v: 1 }])
                : spokenNow(frame, [{ at: wf(24, "family"), v: 1 }]);
              return (
                <div style={pos}>
                  <TeamCard mode="team" chipK={chip} merge={merge} flash={seq ? { cell: seq.v as 0 | 1, k: seq.k } : undefined} scale={s} frame={frame} />
                </div>
              );
            }
            if (card.kind === "routine") {
              const rowK = p < 29 && card.row === -1 ? [ramp(frame, wf(26, "look")), p >= 27 ? ramp(frame, wf(27, "call")) : 0, p >= 28 ? ramp(frame, wf(28, "move")) : 0] : [1, 1, 1];
              const flash = (() => {
                if (p === 26) return spokenNow(frame, [{ at: wf(26, "look"), v: 0 }]);
                if (p === 27) return spokenNow(frame, [{ at: wf(27, "call"), v: 1 }]);
                if (p === 28) return spokenNow(frame, [{ at: wf(28, "move"), v: 2 }]);
                if (p === 29) return spokenNow(frame, [{ at: wf(29, "look"), v: 0 }]);
                if (p === 30) return spokenNow(frame, [{ at: wf(30, "call"), v: 1 }]);
                if (p === 31) return spokenNow(frame, [{ at: wf(31, "move"), v: 2 }]);
                if (p === 134) return spokenNow(frame, [{ at: wf(134, "look"), v: 0 }, { at: wf(134, "call"), v: 1 }, { at: wf(134, "move"), v: 2 }]);
                return card.row !== undefined && card.row >= 0 ? { v: card.row, k: 0.7 } : undefined;
              })();
              return (
                <div style={pos}>
                  <RoutineCard rowK={rowK} flash={flash ? { row: flash.v, k: flash.k } : undefined} scale={s} frame={frame} />
                </div>
              );
            }
            if (card.kind === "family" && fam && famKey) {
              const f = familyFlash(famKey, frame);
              return (
                <div style={pos}>
                  <FamilyFormula mode={fam.mode!} n={fam.n!} dir="minus" cellK={cellK} flash={f} lit={famLit} link={linkK} scale={s} frame={frame} />
                </div>
              );
            }
            if (card.kind === "why") {
              const starts = [wf(36, "minus"), wf(36, "four"), wf(37, "add")];
              const step = frame >= starts[2] ? 3 : frame >= starts[1] ? 2 : frame >= starts[0] ? 1 : 0;
              return (
                <div style={pos}>
                  <WhyMinus n={card.n ?? 6} step={step} k={step === 0 ? 0 : ramp(frame, starts[step - 1], 10)} scale={s} frame={frame} />
                </div>
              );
            }
            if (card.kind === "mirror") {
              if (card.mirror === "real") {
                const rows = mirrorRowsFor(6);
                const kA = p === 39
                  ? [wf(39, "six"), wf(39, "one"), wf(39, "five"), wf(39, "ten")].map((x) => ramp(frame, x))
                  : [1, 1, 1, 1];
                const kB = p === 40 ? [2, 8, 14, 20].map((d) => ramp(frame, startF(40) + d)) : p > 40 ? [1, 1, 1, 1] : [0, 0, 0, 0];
                const flip = p === 41 ? ramp(frame, wf(41, "sign"), 12) : p === 42 ? 1 : 0;
                return (
                  <div style={pos}>
                    <MirrorCard title="THE MIRROR" rows={rows} kA={kA} kB={kB} flip={flip} scale={s} frame={frame} />
                  </div>
                );
              }
              const rows = flipRows();
              const kA = p === 105 ? [wf(105, "family"), wf(105, "lower"), wf(105, "five"), wf(105, "ten")].map((x) => ramp(frame, x)) : [1, 1, 1, 1];
              const kB = p === 105 ? [0, 0, 0, 0] : p === 106 ? [wf(106, "family"), wf(106, "lower"), wf(106, "five"), wf(106, "ten")].map((x) => ramp(frame, x)) : [1, 1, 1, 1];
              const flip = p === 108 ? ramp(frame, wf(108, "mirror"), 12) : p > 108 ? 1 : 0;
              return (
                <div style={pos}>
                  <MirrorCard title="FLIP IT" rows={rows} kA={kA} kB={kB} flip={flip} scale={s} frame={frame} />
                </div>
              );
            }
            if (card.kind === "pattern") {
              const rowsAt = [wf(109, "six"), wf(109, "seven"), wf(109, "eight"), wf(109, "nine")];
              let rows = 4;
              if (p === 109) rows = rowsAt.reduce((acc, f) => acc + (frame >= f - 4 ? clamp01((frame - (f - 4)) / 10) : 0), 0);
              const flash = p === 109
                ? (() => {
                    const hit = spokenNow(frame, ["six", "seven", "eight", "nine"].map((w, i) => ({ at: wf(109, w), v: i })));
                    return hit ? { row: hit.v, cell: 0, k: hit.k } : undefined;
                  })()
                : undefined;
              const constants = p === 110 ? ramp(frame, wf(110, "mirror"), 10) : 0;
              return (
                <div style={pos}>
                  <PatternTable rows={rows} dir="minus" active={flash?.row} flash={flash} constants={constants} scale={s} frame={frame} />
                </div>
              );
            }
            if (card.kind === "finger") {
              const seq = (() => {
                if (p === 44) return spokenNow(frame, [{ at: wf(44, "index"), v: "index" as const }]);
                if (p === 47) return spokenNow(frame, [{ at: wf(47, "thumb"), v: "thumb" as const }]);
                if (p === 48) return spokenNow(frame, [{ at: wf(48, "index"), v: "index" as const }]);
                if (p === 103) return spokenNow(frame, [{ at: wf(103, "thumb"), v: "thumb" as const }]);
                if (p === 104) return spokenNow(frame, [{ at: wf(104, "index"), v: "index" as const }]);
                return undefined;
              })();
              return (
                <div style={pos}>
                  <FingerRule flash={seq ? { which: seq.v, k: seq.k } : undefined} k1={1} k2={1} scale={s} frame={frame} />
                </div>
              );
            }
            return null;
          })()}

          {/* ---------------------------------------------------------------- THE SUM CARD, centre right */}
          {scene.sum && !scene.closing && (() => {
            const r = sumRect(L.W, L.band.stageTop, L.portrait);
            return (
              <div style={{ position: "absolute", left: r.x, top: r.y }}>
                <ColumnSum a={scene.sum.a} b={scene.sum.b} op={scene.sum.op} total={scene.sum.total} step={scene.sum.step} prevStep={prevSumStep(p)} popIn={SUM_FIRST.has(p)} flash={sumFlashFor(p, frame)} strongHighlight placeholderOpacity={0.9} bg={worldAccent} progress={progress} scale={SUM_S} />
              </div>
            );
          })()}

          {/* the live value, above the abacus during working stretches */}
          {scene.valueChip && !scene.big && !scene.headline && (
            <div style={{ position: "absolute", left: 0, top: 24, width: L.W, display: "flex", justifyContent: "center" }}>
              <div style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 76, color: "#FFFFFF", background: worldAccent, borderRadius: 34, padding: "6px 40px", boxShadow: "0 8px 0 rgba(8,50,64,0.4)" }}>
                {ctx.settle > 0.85 ? valueAt(p) : valueAt(Math.max(0, p - 1))}
              </div>
            </div>
          )}

          {/* the big answer */}
          {scene.big && (
            <div style={{ position: "absolute", left: 0, top: BIG_TOP + bob(frame, FPS, 5, 3.4), width: L.W, textAlign: "center" }}>
              <Card bg={worldAccent}>
                <StickerText size={BIG_SIZE}>{scene.big}</StickerText>
              </Card>
            </div>
          )}

          {/* ---------------------------------------------------------------- the like ask: the otters come forward, only the buttons */}
          {isLike(p) && (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <OtterFamily tags tagPx={L.portrait ? 17 : undefined} x={L.W / 2} y={closingY(L.portrait)} scale={closingScale(p, L.portrait)} mood={scene.otters!.mood} link={p === 81 ? 1 : 0} progress={progress} frame={frame} fps={FPS} water={false} />
            </svg>
          )}
          {scene.midSubscribe && (
            <div style={{ position: "absolute", left: 0, top: 70, width: L.W, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
              <div style={{ transform: `scale(${L.portrait ? 1.1 : 1.25})`, transformOrigin: "top center" }}>
                <SubscribeCard progress={progress} frame={frame} fps={FPS} />
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- the close */}
          {scene.closing && p >= STORE_FROM && (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <OtterFamily tags tagPx={L.portrait ? 17 : undefined} x={closingX(p, L.W, L.portrait)} y={closingY(L.portrait)} scale={closingScale(p, L.portrait)} mood={scene.otters!.mood} link={p === 137 ? 0 : 1} progress={progress} frame={frame} fps={FPS} water={false} />
            </svg>
          )}
          {scene.closeBeat === "store" && (
            <>
              <div style={{ position: "absolute", left: L.portrait ? (L.W - 353) / 2 : 705, top: L.portrait ? 133 : 110 }}>
                <StoreFlow frame={frame - STORE_START} fps={FPS} height={L.portrait ? 720 : 690} span={STORE_FRAMES} />
              </div>
              <div style={{ position: "absolute", left: L.portrait ? 0 : 1195, top: L.portrait ? 887 : 285, width: L.portrait ? L.W : undefined, display: L.portrait ? "flex" : undefined, justifyContent: L.portrait ? "center" : undefined, transform: L.portrait ? "scale(0.7)" : undefined, transformOrigin: "top center" }}>
                <DownloadCta progress={progress} />
              </div>
            </>
          )}
          {scene.closeBeat === "next" && (
            <div style={{ position: "absolute", left: 0, top: NEXT_CARD_TOP, width: L.W, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
              <NextUpCard
                progress={progress}
                title={["the family", "game"]}
                example={
                  <div style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 34, color: "#B5532F", textAlign: "center", maxWidth: 240, transform: `translateY(${bob(frame, FPS, 6, 2.6)}px)` }}>
                    find the missing step!
                  </div>
                }
              />
            </div>
          )}
        </>
      );
    }}
  />
  </>
);
