// E15 · Family Plus — the family trick for adding — 16:9 (the 4:5 cut and thumbnails come later).
//
// The sequel to E14 "Beat the Beads". E12/E13 taught the big friend (+n = −friend +10 and −n = +friend −10).
// This episode teaches what to do when the big friend GETS STUCK while adding: the upper bead is down and
// there are not enough lower beads to take the friend away. The fix is the SMALL friend inside the big
// friend's own first step, which makes the FAMILY:  +6 = −4 +10  and  −4 = +1 −5  so  +6 = +1 −5 +10  —
// "plus the lower beads, minus five, plus ten", three parts that always travel together. Four formulas for
// adding: +6, +7, +8, +9. (Facts, tables and the finger-hint spots: docs/E15_lines.txt's header.)
//
// THE WORLD AND THE CAST. A sea-otter KELP COVE, morning to dusk — the first world that lives UNDER the
// waterline — and a FAMILY OF THREE SEA OTTERS (little, middle, big) who float in a row holding paws, the way
// real sea otters do so the current cannot pull them apart. The Family formula is exactly three parts, so the
// otters ARE the formula: little otter = "plus the lower beads", middle = "minus five", big = "plus ten".
// They link paws when the formula is named, and each lights up (a glow in its own colour and a bounce) on its
// own part while that part's beads move. The three part colours are the same on the otters' bandanas and on
// the chips of the formula card, so the eye never has to translate.
//
// FOCUS (docs/SCRIPT_CHECKLIST.md build stage): "what do I see first?" on every line is the lesson part —
// the abacus, the left-hand card (friends, formula, why, pattern, finger rule), the sum card top right. The
// world is desaturated and washed while a lesson carries the frame (`worldCalm`), the otters sit small and calm
// at the foot of the left-hand card and come forward — big, full colour, energetic — for the hook, the
// "meet the family" line, the like ask and the close.
//
// FINGERS (EPISODE_RULES): decided by DIRECTION. Making a number pushes lower beads UP (thumb) and the upper
// bead DOWN (index finger); every move of the family formula goes UP (thumb): plus lower beads, the upper bead
// pushed back up, the carry onto the tens rod. `handFor` derives all of it from the rod's digits before/after.
//
// Timing from src/data/e15.phrases.json, aligned from docs/E15_lines.txt (paced, then aligned to the real
// 315.34 s file). 112 phrases.

import React from "react";
import { interpolate } from "remotion";
import phrasesJson from "../data/e15.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { OtterFamily, FAMILY_BOX, type OtterMood } from "../components/e15/Otter";
import {
  FamilyFormula,
  FAMILY_NAT,
  WhyTen,
  WHY_NAT,
  PatternTable,
  PATTERN_NAT,
  FingerRule,
  FINGER_NAT,
  SmallFriendPair,
  SMALL_NAT,
  TeamCard,
  TEAM_NAT,
  TitleCard,
  TITLE_NAT,
  EighteenBadge,
  PlusMinusPair,
  type FamilyMode,
} from "../components/e15/Cards";
import { BigFriendCards, BIG_FRIENDS_NAT } from "../components/e11/BigFriendCards";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import { rodX } from "../stage/geometry";
import type { Scene as BaseScene } from "../stage/types";
import { RIG_COVE, WORLDS } from "../data/theme";
import { FPS } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";
import { HideTextStyle } from "../lib/hideText";

// THE REAL FILE DURATION (ffprobe 315.344195), not the aligner's "speech ends" (314.62): the recording ends
// with a 0.13 s fade-out and 0.6 s of padding (the take's last word was clipped at the source).
export const AUDIO_SEC = 315.344195;
export const E15_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

// ------------------------------------------------------------------------------------------------ guard
// Every table below is keyed by phrase INDEX. If the aligner ever splits a line differently, an index drifts
// silently — so the load fails loudly instead: each anchor phrase must begin with the words it was written for.
const ANCHORS: Record<number, string> = {
  0: "hello again", 9: "four", 22: "let us see it", 23: "seven plus six", 25: "push two lower beads up", 26: "then push the upper bead down",
  27: "remember up is the thumb", 33: "plus six equals minus four", 36: "minus four equals plus one", 39: "plus six equals plus one",
  40: "why", 41: "plus ten adds four", 45: "push one lower bead up", 48: "push the upper bead up", 53: "now carry one bead",
  55: "seven plus six is thirteen", 58: "give this video a like", 60: "make twenty six", 61: "on the ones rod one lower", 62: "then two lower",
  63: "thumb up index finger down", 70: "plus seven equals plus two", 71: "push two lower beads up", 73: "carry one bead", 75: "twenty six plus seven",
  80: "plus six add one", 83: "plus nine add four", 86: "your turn", 89: "that is down", 92: "one", 97: "four", 98: "plus nine equals plus four",
  100: "ones rod first and remember", 101: "what number is showing", 102: "five plus nine is fourteen", 107: "to meet the whole family", 111: "see you next time",
};
const normText = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
for (const [k, v] of Object.entries(ANCHORS)) {
  const ph = PHRASES[Number(k)];
  if (!ph || !normText(ph.text).startsWith(v)) throw new Error(`E15 phrase table out of step: p${k} should start "${v}" but is "${ph?.text}"`);
}
if (PHRASES.length !== 112) throw new Error(`E15 expects 112 phrases, got ${PHRASES.length}`);

interface CardSpec {
  kind: "bigfriends" | "small" | "team" | "family" | "why" | "pattern" | "finger";
  /** bigfriends: active pair */
  active?: number;
  /** team: "team" | "when" */
  team?: "team" | "when";
  /** family: mode, n */
  mode?: FamilyMode;
  n?: number;
  /** family: which cell (1..3) is being WORKED */
  lit?: number;
  /** family: paws joined */
  link?: number;
}

interface Scene extends BaseScene {
  /** what the otters do; undefined = not on stage this line */
  otters?: { mood: OtterMood; lit?: number };
  card?: CardSpec;
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep };
  big?: string;
  valueChip?: boolean;
  spotlightRod?: boolean;
  midSubscribe?: boolean;
  /** the hook's composition (stage === "hook") */
  hook?: { title?: boolean; badge18?: boolean; pair?: boolean };
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
  if (f === null) throw new Error(`E15: no word "${needle}" (#${nth}) in p${p} "${PHRASES[p].text}"`);
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
  for (let p = 0; p < PHRASES.length; p++) v[p] = 0;
  for (let p = 12; p <= 21; p++) v[p] = 7; // the problem: upper bead down, two lower beads — not enough to give four away
  // p22 "Let us see it." clears it for the worked example
  v[25] = 2; // push two lower beads up (thumb)
  for (let p = 26; p <= 44; p++) v[p] = 7; // then the upper bead down (index finger)
  for (let p = 45; p <= 47; p++) v[p] = 8; // plus one: one lower bead up (thumb)
  for (let p = 48; p <= 52; p++) v[p] = 3; // minus five: the upper bead back up (thumb)
  for (let p = 53; p <= 58; p++) v[p] = 13; // carry one bead to the tens rod (thumb)
  // p59 clears it again
  v[61] = 6; // one lower bead up (thumb) and the upper bead down (index finger)
  for (let p = 62; p <= 70; p++) v[p] = 26; // two lower beads on the tens rod (thumb)
  v[71] = 28; // plus two lower beads
  v[72] = 23; // minus five: the upper bead up
  for (let p = 73; p <= 85; p++) v[p] = 33; // carry
  // p86 clears it for the child's turn
  for (let p = 89; p <= 99; p++) v[p] = 5; // make five: just the upper bead, down (index finger)
  for (let p = 100; p <= 104; p++) v[p] = 14; // the child's three moves (beadSteps): 5 -> 9 -> 4 -> 14
  return v;
})();
const valueAt = (p: number) => VALUE[p] ?? 0;
const digits = (v: number): [number, number] => [v % 10, Math.floor(v / 10) % 10];

/** Hard resets and the staging build — no taught move happens on these, so no finger and no arrow. */
const SILENT_SET = new Set([12, 22, 59, 86, 105]);

const rig = (p: number) => {
  const d = digits(valueAt(p));
  return Array.from({ length: 5 }, (_, i) => ({
    value: i < 2 ? d[i] : 0,
    focus: i < 2 ? 1 : 0.35,
    chipLower: i < 2 || undefined,
    placeName: i < 2 ? (i === 0 ? "ones" : "tens") : undefined,
  }));
};

/** Direction decides the finger, never the bead (same derivation E06/E11-E13 use). */
const movedRod = (p: number): number | null => {
  if (p === 0 || SILENT_SET.has(p)) return null;
  const to = digits(valueAt(p));
  const from = digits(valueAt(p - 1));
  const moved = [0, 1].filter((i) => to[i] !== from[i]);
  return moved.length === 1 ? moved[0] : null;
};

/** "Thumb!" / "Thumb again!" / "Thumb all the way!" — the hand stays on the bead it just moved while the voice names the finger. */
const HOLD_HAND: Record<number, number> = { 46: 45, 49: 48, 74: 73 };
const handFor = (p: number): Scene["hand"] => {
  if (p === 100) return undefined; // beadSteps carry their own hands
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

/** The second hand, for lines where both bead kinds move on the SAME rod at once (p61: one lower bead up AND the upper bead down). */
const hand2For = (p: number): Scene["hand2"] => {
  const rod = movedRod(p);
  if (rod === null) return undefined;
  const to = digits(valueAt(p))[rod];
  const from = digits(valueAt(p - 1))[rod];
  const lowerFrom = from % 5;
  const lowerTo = to % 5;
  const earthChanged = lowerTo !== lowerFrom;
  const heavenCrossed = from >= 5 !== to >= 5;
  if (!earthChanged || !heavenCrossed) return undefined;
  if (lowerTo > lowerFrom) {
    const down = to >= 5;
    return { digit: down ? "index" : "thumb", direction: down ? "down" : "up", rod, heaven: true };
  }
  return { digit: "index", direction: "down", rod, heaven: false, dy: 70 };
};

/**
 * THE CHILD'S THREE MOVES (p100): the voice says "now do all three moves, ones rod first, and remember, up is
 * the thumb" and the moves happen in the silence after it. Each is one legal move with its own thumb:
 * four lower beads up (5 -> 9), the upper bead back up (9 -> 4), one bead onto the tens rod (4 -> 14).
 */
const P100_STEPS: NonNullable<Scene["beadSteps"]> = (() => {
  const end = sec(PHRASES[100].end, FPS);
  const hold = startF(101) - end;
  const at = [end + Math.round(hold * 0.12), end + Math.round(hold * 0.42), end + Math.round(hold * 0.72)];
  return [
    { at: at[0], values: [9, 0], hand: { digit: "thumb", direction: "up", rod: 0, heaven: false } },
    { at: at[1], values: [4, 0], hand: { digit: "thumb", direction: "up", rod: 0, heaven: true } },
    { at: at[2], values: [4, 1], hand: { digit: "thumb", direction: "up", rod: 1, heaven: false } },
  ];
})();

const ROD_FOR_OVERRIDE: Record<number, number> = { 46: 0, 49: 0, 74: 1, 11: 0, 20: 0, 24: 0, 43: 0, 44: 0, 47: 0, 51: 0, 87: 0, 93: 0, 94: 0 };
const rodFor = (p: number): number => {
  const rod = movedRod(p);
  if (rod !== null) return rod;
  return ROD_FOR_OVERRIDE[p] ?? 0;
};

/** Lines that NAME the ones rod without moving a bead on it: the breathing badge + chevron device E11-E13 built. */
const SPOTLIGHT_ROD = new Set([100, 11, 20, 24, 43, 51, 87, 93]);

// ------------------------------------------------------------------------------------------------ the sums
const SUMS: Record<number, NonNullable<Scene["sum"]>> = (() => {
  const out: Record<number, NonNullable<Scene["sum"]>> = {};
  const put = (from: number, to: number, v: NonNullable<Scene["sum"]>) => {
    for (let p = from; p <= to; p++) out[p] = v;
  };
  const A = { a: 7, b: 6, op: "+" };
  put(23, 23, { ...A, step: "second" });
  put(24, 27, { ...A, step: "first" });
  put(28, 54, { ...A, step: "second" });
  put(55, 56, { ...A, total: 13, step: "answer" });
  const B = { a: 26, b: 7, op: "+" };
  put(60, 63, { ...B, step: "first" });
  put(64, 74, { ...B, step: "second" });
  put(75, 75, { ...B, total: 33, step: "answer" });
  const C = { a: 5, b: 9, op: "+" };
  put(90, 101, { ...C, step: "second" });
  put(102, 104, { ...C, total: 14, step: "answer" });
  return out;
})();
const SUM_FIRST = new Set(Object.keys(SUMS).map(Number).filter((p) => !SUMS[p - 1]));

const SUM_FLASH: Record<number, { word: string; nth?: number; row: "first" | "second" | "answer" }[]> = {
  23: [{ word: "seven", row: "first" }, { word: "six", row: "second" }],
  55: [{ word: "seven", row: "first" }, { word: "six", row: "second" }, { word: "thirteen", row: "answer" }],
  60: [{ word: "twentysix", row: "first" }],
  64: [{ word: "sevens", row: "second" }],
  75: [{ word: "twentysix", row: "first" }, { word: "seven", row: "second" }, { word: "thirtythree", row: "answer" }],
  90: [{ word: "nine", row: "second" }],
  102: [{ word: "five", row: "first" }, { word: "nine", row: "second" }, { word: "fourteen", row: "answer" }],
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

const ANSWER_LINES = [55, 75, 102];
const ANSWER_TEXT: Record<number, string> = { 55: "7 + 6 = 13", 75: "26 + 7 = 33", 102: "5 + 9 = 14" };
const ANSWER_FRAME = new Map<number, number>();
for (const i of ANSWER_LINES) ANSWER_FRAME.set(i, wordFrameIn(PHRASES[i], "$last", FPS) ?? startF(i));
const BURST_FROM = new Map<number, number>();
for (const [i, f] of ANSWER_FRAME) {
  BURST_FROM.set(i, f);
  if (i !== 102) BURST_FROM.set(i + 1, f);
}

// ------------------------------------------------------------------------------------------------ the left-hand card, per phrase
const CARD: Record<number, CardSpec> = (() => {
  const out: Record<number, CardSpec> = {};
  const put = (from: number, to: number, c: CardSpec) => {
    for (let p = from; p <= to; p++) out[p] = c;
  };
  put(7, 9, { kind: "bigfriends" });
  put(16, 17, { kind: "small" });
  put(18, 19, { kind: "team", team: "team" });
  put(21, 21, { kind: "team", team: "when" });
  put(33, 33, { kind: "family", mode: "big", n: 6 });
  put(34, 36, { kind: "family", mode: "small", n: 6 });
  put(37, 37, { kind: "family", mode: "small", n: 6, link: 0 });
  put(38, 39, { kind: "family", mode: "family", n: 6 });
  put(40, 41, { kind: "why", n: 6 });
  put(42, 52, { kind: "family", mode: "family", n: 6, link: 1 });
  put(44, 46, { kind: "family", mode: "family", n: 6, link: 1, lit: 1 });
  put(47, 49, { kind: "family", mode: "family", n: 6, link: 1, lit: 2 });
  put(53, 56, { kind: "family", mode: "family", n: 6, link: 1, lit: 3 });
  put(55, 56, { kind: "family", mode: "family", n: 6, link: 1 });
  put(70, 70, { kind: "family", mode: "family", n: 7, link: 1 });
  put(71, 71, { kind: "family", mode: "family", n: 7, link: 1, lit: 1 });
  put(72, 72, { kind: "family", mode: "family", n: 7, link: 1, lit: 2 });
  put(73, 74, { kind: "family", mode: "family", n: 7, link: 1, lit: 3 });
  put(75, 75, { kind: "family", mode: "family", n: 7, link: 1 });
  put(77, 77, { kind: "pattern" });
  put(78, 79, { kind: "finger" });
  put(80, 85, { kind: "pattern" });
  put(27, 27, { kind: "finger" });
  put(63, 63, { kind: "finger" });
  put(91, 92, { kind: "bigfriends" });
  put(98, 101, { kind: "family", mode: "family", n: 9, link: 1 });
  put(105, 106, { kind: "pattern" });
  return out;
})();

/** which pair of the five big friends is lit, per line */
const BF_ACTIVE: Record<number, number | undefined> = { 9: 3, 92: 0 };

const NUMBER_FLASH: Record<number, { pair: number; sequence: { word: string; side: 0 | 1 }[] }> = {
  8: { pair: 3, sequence: [{ word: "sixs", side: 1 }] },
  9: { pair: 3, sequence: [{ word: "four", side: 0 }] },
  91: { pair: 0, sequence: [{ word: "nines", side: 1 }] },
  92: { pair: 0, sequence: [{ word: "one", side: 0 }] },
};

// ------------------------------------------------------------------------------------------------ the family card's word clock
/** frames at which each CELL of the family card (0 = left-hand side, then its parts) pops in, per example */
const REVEAL: Record<string, number[]> = {
  big: [startF(33) + 4, wf(33, "four"), wf(33, "ten")],
  small: [startF(34) + 4, wf(35, "one"), wf(35, "five")],
  fam6: [startF(38) + 6, wf(39, "one"), wf(39, "five"), wf(39, "ten")],
  fam7: [startF(70) + 6, wf(70, "two"), wf(70, "five"), wf(70, "ten")],
  fam9: [startF(98) + 6, wf(98, "four"), wf(98, "five"), wf(98, "ten")],
};
/** the word frames each cell is SPOKEN on, for the flash (the formula is spoken left to right) */
const SPOKEN: Record<string, { p: number; words: [string, number][] }[]> = {
  big: [{ p: 33, words: [["six", 0], ["four", 1], ["ten", 2]] }],
  small: [{ p: 34, words: [["four", 0]] }, { p: 35, words: [["one", 1], ["five", 2]] }, { p: 36, words: [["four", 0], ["one", 1], ["five", 2]] }],
  fam6: [{ p: 39, words: [["six", 0], ["one", 1], ["five", 2], ["ten", 3]] }],
  fam7: [{ p: 70, words: [["seven", 0], ["two", 1], ["five", 2], ["ten", 3]] }],
  fam9: [{ p: 98, words: [["nine", 0], ["four", 1], ["five", 2], ["ten", 3]] }],
};
const exampleKey = (c: CardSpec): string => (c.mode === "big" ? "big" : c.mode === "small" ? "small" : `fam${c.n}`);

const familyFlash = (key: string, frame: number): { cell: number; k: number } | undefined => {
  const seq: { at: number; v: number }[] = [];
  for (const s of SPOKEN[key] ?? []) for (const [w, cell] of s.words) seq.push({ at: wf(s.p, w, 0), v: cell });
  const hit = spokenNow(frame, seq);
  return hit ? { cell: hit.v, k: hit.k } : undefined;
};

// which OTTER lights, on which spoken part: [little, middle, big]
const OTTER_WORDS: Record<number, [string, string, string]> = { 33: ["", "", "ten"], 35: ["one", "five", ""], 36: ["one", "five", ""], 39: ["one", "five", "ten"], 70: ["two", "five", "ten"], 98: ["four", "five", "ten"] };
const litFromWords = (p: number, frame: number): [number, number, number] | undefined => {
  const w = OTTER_WORDS[p];
  if (!w) return undefined;
  return w.map((needle) => {
    if (!needle) return 0;
    const at = wf(p, needle, 0);
    return interpolate(frame, [at, at + 4, at + 30, at + 42], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  }) as [number, number, number];
};

const BADGES: Record<number, [string, string, string]> = { 6: ["+1", "−5", "+10"], 7: ["+2", "−5", "+10"], 9: ["+4", "−5", "+10"] };
/** The frame at which a card first has CONTENT. A card is never shown empty: it fades in together with its first item. */
const contentAt = (p: number, c: CardSpec): number => {
  switch (c.kind) {
    case "small": return p === 16 ? Infinity : wf(17, "fours");
    case "team": return p === 18 ? wf(18, "big") : p === 21 ? wf(21, "stuck") : 0;
    case "family": return REVEAL[exampleKey(c)]?.[0] ?? 0;
    case "why": return p === 40 ? Infinity : 0;
    case "pattern": return p === 80 ? wf(80, "six") - 4 : 0;
    case "finger": return 0;
    default: return 0;
  }
};
const exampleOfLine = (p: number): number => (p >= 98 ? 9 : p >= 59 && p < 86 ? 7 : 6);

// ------------------------------------------------------------------------------------------------ otters, per phrase
const OTTERS: Record<number, OtterMood> = (() => {
  const t: Record<number, OtterMood> = {};
  const put = (a: number, b: number, m: OtterMood) => {
    for (let p = a; p <= b; p++) t[p] = m;
  };
  put(6, 6, "point");
  put(7, 8, "think");
  put(9, 9, "cheer");
  put(10, 13, "worry");
  put(14, 14, "think");
  put(15, 15, "cheer");
  put(16, 17, "float");
  put(18, 18, "float");
  put(19, 19, "link");
  put(20, 20, "point");
  put(21, 21, "link");
  put(22, 22, "wave");
  put(23, 24, "point");
  put(25, 27, "float");
  put(28, 29, "think");
  put(30, 32, "worry");
  put(33, 34, "point");
  put(35, 36, "float");
  put(37, 39, "link");
  put(40, 41, "think");
  put(42, 43, "point");
  put(44, 49, "link");
  put(50, 50, "gasp");
  put(51, 51, "gasp");
  put(52, 54, "link");
  put(55, 56, "cheer");
  put(59, 59, "wave");
  put(60, 64, "float");
  put(65, 65, "think");
  put(66, 68, "worry");
  put(69, 69, "link");
  put(70, 74, "link");
  put(75, 75, "cheer");
  put(76, 85, "float");
  put(86, 86, "wave");
  put(87, 90, "float");
  put(91, 91, "think");
  put(92, 92, "cheer");
  put(93, 94, "think");
  put(95, 95, "link");
  put(96, 96, "think");
  put(97, 97, "cheer");
  put(98, 101, "link");
  put(102, 104, "cheer");
  put(105, 106, "float");
  return t;
})();

// the hook (p0-5) draws its own big otters
const HOOK_MOOD: Record<number, OtterMood> = { 0: "wave", 1: "cheer", 2: "float", 3: "link", 4: "cheer", 5: "worry" };

const HEADLINE: Record<number, string> = {
  0: "welcome back, friends!",
  3: "adds and takes away, at once!",
  5: "when the big friend gets stuck",
  10: "uh oh, a problem",
  13: "the big friend gets stuck!",
  15: "good news!",
  19: "meet the family",
  21: "stuck? call the family",
  22: "seven plus six",
  32: "stuck!",
  33: "the big friend way",
  34: "the small friend way",
  37: "put them together",
  38: "the family trick for adding",
  40: "why does it work?",
  42: "ones rod first",
  56: "our first family formula",
  59: "bigger numbers",
  63: "thumb up, index finger down",
  68: "stuck again!",
  76: "the pattern",
  84: "two things never change",
  86: "your turn",
  95: "call the family",
  103: "well done!",
  105: "the family trick for adding",
};

const WORKING = new Set([25, 26, 27, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 61, 62, 63, 71, 72, 73, 74, 89, 99, 100]);

// ------------------------------------------------------------------------------------------------ focus
/** 0..1: how far the world steps back (desaturate + wash) — high while a lesson part carries the frame. */
const calmFor = (p: number): number => CALM_GAIN * calmRaw(p);
const CALM_GAIN = 0.62; // the world steps back, it does not go dull
const calmRaw = (p: number): number => {
  if (p <= 5) return 0;
  if (p <= 9) return 0.4;
  if (p <= 14) return 0.55;
  if (p <= 19) return 0.3;
  if (p <= 21) return 0.6;
  if (p === 55 || p === 56) return 0.25;
  if (p <= 56) return 0.9;
  if (p <= 58) return 0;
  if (p === 75) return 0.25;
  if (p <= 85) return 0.85;
  if (p >= 102 && p <= 104) return 0.2;
  if (p <= 101) return 0.9;
  return 0.25;
};

const isLike = (p: number) => p === 57 || p === 58;
const STORE_FROM = 107;
const NEXT_FROM = 109;

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const hand = handFor(p);
  const hand2 = hand2For(p);
  const base = {
    stage: "abacus" as const,
    rods: rig(p),
    scale: BASE,
    targetRod: rodFor(p),
    highlight: null,
    hand,
    hand2,
    moveOn: !SILENT_SET.has(p) && valueAt(p) !== valueAt(p - 1) ? (p === 61 ? "upper" : "$last") : undefined,
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
    beadSteps: p === 100 ? P100_STEPS : undefined,
    // the section bands: "not enough LOWER beads", "how many lower beads", the rule "lower beads before the upper bead"
    band: p === 12 || p === 29 || p === 65 || p === 94 ? ("bottom" as const) : undefined,
    bandSeq: p === 43 ? (["bottom", "top"] as ("top" | "bottom")[]) : undefined,
    rodBandSeq: p === 6 ? [0, 1] : undefined,
    count: p === 30 || p === 67 ? ("lower" as const) : undefined,
    countRod: p === 30 || p === 67 ? 0 : undefined,
  };

  // ---- the hook: no abacus yet — the otters and the title carry it
  if (p <= 5) {
    return {
      ...base,
      stage: "hook",
      world: "covedawn",
      sum: undefined,
      card: undefined,
      valueChip: false,
      otters: undefined,
      rodBandSeq: undefined,
      hook: { badge18: p === 1, pair: p === 3, title: p >= 4 },
    };
  }

  const world =
    p <= 9 ? "coveshallows"
    : p <= 14 ? "covetidepool"
    : p <= 21 ? "coveshallows"
    : p <= 32 ? "covetidepool"
    : p <= 56 ? "covereef"
    : p <= 58 ? "covekelp"
    : p <= 75 ? "covedeep"
    : p <= 85 ? "covedrift"
    : p <= 104 ? "covegold"
    : "covemoon";

  // ---- the mid-roll like ask: only the buttons, the otters and the world
  if (isLike(p)) {
    return { ...base, world, closing: true, worldWash: 0.25, worldCalm: 0, sum: undefined, card: undefined, valueChip: false, spotlightRod: false, otters: { mood: p === 57 ? "wave" : "cheer" }, midSubscribe: p === 58, band: undefined, bandSeq: undefined, headline: undefined };
  }

  // ---- the close
  if (p >= STORE_FROM) {
    const closeBeat = p < NEXT_FROM ? "store" : "next";
    return { ...base, world: "covemoon", closing: true, closeBeat, worldWash: 0.35, worldCalm: 0, sum: undefined, card: undefined, valueChip: false, spotlightRod: false, otters: { mood: p === 111 ? "wave" : "float" }, noCaption: p === 108, headline: undefined, band: undefined, bandSeq: undefined };
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
const SFX_CUES: SfxCue[] = (() => {
  const cues: SfxCue[] = [];
  const at = (i: number) => startF(i);
  const add = (frame: number, file: string, len: number, vol: number) => cues.push({ frame: Math.max(0, Math.round(frame)), file, len, vol });
  const on = (i: number, w: string, nth = 0) => wordFrameIn(PHRASES[i], w, FPS, nth) ?? at(i);

  // bead clicks where beads actually move
  for (let i = 1; i < PHRASES.length; i++) {
    if (valueAt(i) === valueAt(i - 1) || SILENT_SET.has(i) || i === 100) continue;
    const mv = sceneFor(i).moveOn;
    add(mv ? on(i, mv) : at(i), "abacus_move.mp3", 30, 0.32);
  }
  for (const s of P100_STEPS) add(s.at, "abacus_move.mp3", 30, 0.3);
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);

  // the hook — soft, well clear of the intro seam (never percussive in the first ~150 ms)
  add(on(0, "again"), "e15_chirp.mp3", 40, 0.26);
  add(on(1, "eighteen"), "friend_sparkle.mp3", 50, 0.26);
  add(on(3, "adds"), "e15_bubble.mp3", 20, 0.3);
  add(on(3, "takes"), "e15_bubble.mp3", 20, 0.3);
  add(on(3, "once"), "e15_link.mp3", 44, 0.28);
  add(on(4, "here"), "count_hook.mp3", 40, 0.26);
  add(on(5, "stuck"), "e15_glub.mp3", 40, 0.26);

  // the problem
  add(on(13, "stuck"), "stuck_uhoh.mp3", 40, 0.28);
  add(on(14, "something"), "reassure.mp3", 46, 0.26);
  add(at(15), "e15_chirp.mp3", 40, 0.28); // "Good news!"
  add(on(19, "family"), "e15_link.mp3", 44, 0.34);
  add(on(21, "family"), "e15_link.mp3", 44, 0.3);

  // every question and its answer gets a chirp — softer on the ask, brighter on the answer
  for (const i of [8, 29, 65, 91, 96, 101]) add(at(i), "quiz_chirp.mp3", 36, 0.2);
  for (const i of [9, 30, 66, 92, 97]) add(at(i), "quiz_chirp.mp3", 40, 0.3);

  // the worked example: stuck, the formula, the family
  add(on(32, "stuck"), "stuck_uhoh.mp3", 40, 0.28);
  add(on(33, "ten"), "e15_bubble.mp3", 20, 0.28);
  add(on(38, "family"), "e15_link.mp3", 44, 0.34);
  add(on(39, "ten"), "friend_sparkle.mp3", 50, 0.3);
  add(at(40), "tick.mp3", 20, 0.22); // "Why?"
  add(on(41, "take"), "e15_bubble.mp3", 20, 0.26);
  add(at(50), "e15_chirp.mp3", 40, 0.28); // "Oh!"
  add(on(52, "next"), "reveal.mp3", 50, 0.26);
  for (const i of [53, 73]) add(on(i, "carry") !== at(i) ? on(i, "carry") : at(i), "count_carry.mp3", 40, 0.24);
  add(on(56, "formula"), "bead_recap_sting.mp3", 50, 0.26);

  // the like ask
  add(at(57) + 6, "e15_chirp.mp3", 40, 0.26);
  add(at(58) + 8, "btn_click.mp3", 20, 0.3);
  add(at(58) + 30, "bell.mp3", 46, 0.3);

  // 26 + 7
  add(at(59), "e15_tide.mp3", 60, 0.18);
  add(on(68, "stuck"), "stuck_uhoh.mp3", 40, 0.28);
  add(on(69, "family"), "e15_link.mp3", 44, 0.3);
  add(on(70, "ten"), "friend_sparkle.mp3", 50, 0.3);

  // the pattern and your turn
  add(at(76), "tick.mp3", 20, 0.22);
  for (const i of [80, 81, 82, 83]) add(at(i), "e15_bubble.mp3", 20, 0.22);
  add(on(84, "never"), "bead_recap_sting.mp3", 50, 0.24);
  add(on(85, "formulas"), "count_fanfare.mp3", 60, 0.24);
  add(at(86), "e15_chirp.mp3", 40, 0.28);
  add(on(95, "family"), "e15_link.mp3", 44, 0.3);
  add(on(98, "ten"), "friend_sparkle.mp3", 50, 0.3);

  // praise
  add(at(103), "count_fanfare.mp3", 60, 0.26);

  // the audit's batch: expressive words that had no sound
  add(on(10, "problem"), "e15_glub.mp3", 40, 0.26);
  for (const [i, w] of [[27, "thumb"], [46, "thumb"], [49, "thumb"], [63, "thumb"], [74, "thumb"], [79, "thumb"]] as [number, string][]) add(on(i, w), "e15_chirp.mp3", 40, 0.2);
  add(at(51), "reassure.mp3", 46, 0.22); // "Only three on the ones rod?"
  add(at(67), "reassure.mp3", 46, 0.22); // "Only one."
  add(on(100, "ones"), "tick.mp3", 20, 0.22);

  // otter cheers, once each time a cheer starts
  for (let i = 0; i < PHRASES.length; i++) {
    const m = OTTERS[i];
    if (m === "cheer" && OTTERS[i - 1] !== "cheer" && ![55, 75, 102].includes(i)) add(at(i) + Math.round((sec(PHRASES[i].end, FPS) - at(i)) * 0.1), "e15_chirp.mp3", 40, 0.22);
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
  why: WHY_NAT,
  pattern: PATTERN_NAT,
  finger: FINGER_NAT,
};
const cardScale = (c: CardSpec, portrait: boolean): number => {
  // 4:5: the card lives in the band under the abacus (y 948..1176, x 24..454), the sum card beside it, the otters at the right
  if (portrait) return Math.min(0.72, 200 / CARD_NAT[c.kind].h, 430 / CARD_NAT[c.kind].w);
  return c.kind === "bigfriends" ? 1.1 : 0.88;
};
const cardRect = (c: CardSpec, portrait: boolean) => {
  const s = cardScale(c, portrait);
  return { x: portrait ? 24 : CARD_X, y: portrait ? 905 : CARD_TOP, w: CARD_NAT[c.kind].w * s, h: CARD_NAT[c.kind].h * s };
};

const SUM_S = 0.78;
/** ONE FIXED PLACE, centre right: the abacus centre is y=445 (rigBand 140..750). It never moves between phrases; hands are kept clear of it
 *  by the abacus staying centred (the farthest hand reaches about x 1647, the card starts at x 1655). */
const sumRect = (W: number, _stageTop: number, portrait = false) => portrait ? { x: 470, y: 905, w: COL_NAT.w * 0.62, h: COL_NAT.h * 0.62 } : ({ x: W - 30 - COL_NAT.w * SUM_S, y: 445 - (COL_NAT.h * SUM_S) / 2, w: COL_NAT.w * SUM_S, h: COL_NAT.h * SUM_S });

/** the family of otters at the foot of the left-hand card (or, with no card, a little bigger) */
const OTTER_WATER_Y = 846;
const ottersAt = (scene: Scene, L: { W: number; H: number; portrait: boolean; band: { stageTop: number } }) => {
  if (L.portrait) return { x: 1056 - FAMILY_BOX.half * 0.6, y: 1125, s: 0.6 };
  const c = scene.card;
  const cardBottom = c ? cardRect(c, L.portrait).y + cardRect(c, L.portrait).h : 0;
  const cap = c ? (OTTER_WATER_Y - 22 - cardBottom) / FAMILY_BOX.up : 1.15;
  const s = Math.max(0.4, Math.min(c ? 0.9 : 1.0, cap));
  // centred under the left-hand card column
  return { x: 24 + FAMILY_BOX.half * s, y: OTTER_WATER_Y, s };
};
const ottersRect = (m: { x: number; y: number; s: number }) => ({ x: m.x - FAMILY_BOX.half * m.s, y: m.y - FAMILY_BOX.up * m.s, w: FAMILY_BOX.half * m.s * 2, h: (FAMILY_BOX.up + FAMILY_BOX.down) * m.s });

const OTTER_LOOK = 1;

/** THE END SECTIONS (like, store, next video): ONE raised position for the friends so they never jump, with a clear gap above the caption card
 *  (caption box top is y 886 in 16:9; feet + water ring + 24 px gap must stay above it). */
const CLOSE_FEET_Y = 826;
const closingY = (portrait: boolean) => (portrait ? 1010 : CLOSE_FEET_Y);
const closingScale = (p: number, portrait: boolean) => (p === 57 ? 1.0 : 0.8) * (portrait ? 0.75 : 1);
const closingX = (p: number, W: number, portrait: boolean) => (portrait ? W / 2 : p >= NEXT_FROM || isLike(p) ? W / 2 : 300);
const NEXT_CARD_TOP = 150;
const NEXT_CARD = { w: 880, h: 280 };

const HEAD_STYLE: React.CSSProperties = {};

const DONE = true;
void DONE;
void HEAD_STYLE;

export const E15FamilyPlus: React.FC = () => (
  <>
  <HideTextStyle />
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e015_family_plus/E15.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={startF(6)}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_COVE}
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
      const litOtters: [number, number, number] = scene.otters
        ? lit4 ?? (fam?.lit ? ([fam.lit === 1 ? 1 : 0, fam.lit === 2 ? 1 : 0, fam.lit === 3 ? 1 : 0] as [number, number, number]) : stepIdx >= 0 ? ([stepIdx === 0 ? 1 : 0, stepIdx === 1 ? 1 : 0, stepIdx === 2 ? 1 : 0] as [number, number, number]) : [0, 0, 0])
        : [0, 0, 0];
      const linkK = card?.kind === "family" ? clamp01(card.link === undefined ? (p >= 38 ? ramp(frame, startF(38), 20) : 0) : card.link) : 0;

      return (
        <>
          {/* THE ROD SPOTLIGHT — breathing badge + bouncing chevron, reused verbatim from E11-E13 */}
          {scene.spotlightRod && !(p === 100 && frame >= P100_STEPS[0].at) && (
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
              {scene.hook.badge18 && (
                <div style={{ position: "absolute", left: (L.W - 420) / 2, top: 220 }}>
                  <EighteenBadge k={ramp(frame, wf(1, "eighteen"), 12)} frame={frame} />
                </div>
              )}
              {scene.hook.pair && (
                <div style={{ position: "absolute", left: 0, top: 290, width: L.W, display: "flex", justifyContent: "center" }}>
                  <PlusMinusPair k1={ramp(frame, wf(3, "adds"), 10)} k2={ramp(frame, wf(3, "takes"), 10)} join={ramp(frame, wf(3, "once"), 10)} frame={frame} />
                </div>
              )}
              {scene.hook.title && (
                <div style={{ position: "absolute", left: (L.W - TITLE_NAT.w * 0.8) / 2, top: 214 }}>
                  <TitleCard k={ramp(frame, wf(4, "here") - 6, 14)} plusMinus={1} frame={frame} scale={0.8} />
                </div>
              )}
              <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <OtterFamily tags
                  x={L.W / 2}
                  y={L.portrait ? 1000 : 860}
                  scale={p >= 4 ? (L.portrait ? 0.95 : 1.12) : (L.portrait ? 1.1 : 1.4)}
                  mood={HOOK_MOOD[p]}
                  link={p === 3 ? ramp(frame, wf(3, "once"), 12) : p === 4 ? 1 : 0}
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
                  <OtterFamily tags tagPx={L.portrait ? 21 : undefined}
                    x={m.x + FAMILY_BOX.half * m.s * 0 + (FAMILY_BOX.half * m.s) * 0}
                    y={m.y}
                    scale={m.s}
                    mood={scene.otters!.mood}
                    link={card?.kind === "family" ? linkK : scene.otters!.mood === "link" ? 1 : 0}
                    lit={litOtters}
                    badges={BADGES[exampleOfLine(p)]}
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
            const gateK = gateAt === Infinity ? 0 : ramp(frame, gateAt - 6, 8);
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
              const rv = [wf(17, "fours"), wf(17, "one", 0), wf(17, "five")];
              const k = rv.map((x) => ramp(frame, x));
              const seq = spokenNow(frame, p === 17 ? [
                { at: wf(17, "fours"), v: 0 }, { at: wf(17, "one", 0), v: 1 }, { at: wf(17, "four", 0), v: 0 }, { at: wf(17, "one", 1), v: 1 }, { at: wf(17, "five"), v: 2 },
              ] : []);
              return (
                <div style={pos}>
                  <SmallFriendPair a={4} b={1} cellK={p === 16 ? [0, 0, 0] : k} flash={seq ? { cell: seq.v, k: seq.k } : undefined} scale={s} />
                </div>
              );
            }
            if (card.kind === "team") {
              const when = card.team === "when";
              const chip: [number, number] = when
                ? [ramp(frame, wf(21, "stuck")), ramp(frame, wf(21, "call"))]
                : p === 18
                  ? [ramp(frame, wf(18, "big")), ramp(frame, wf(18, "small"))]
                  : [1, 1];
              const merge = when ? ramp(frame, wf(21, "call"), 10) : p === 18 ? ramp(frame, wf(18, "together"), 14) : 1;
              const seq = when
                ? spokenNow(frame, [{ at: wf(21, "stuck"), v: 0 }, { at: wf(21, "family"), v: 1 }])
                : p === 18
                  ? spokenNow(frame, [{ at: wf(18, "big"), v: 0 }, { at: wf(18, "small"), v: 1 }])
                  : undefined;
              return (
                <div style={pos}>
                  <TeamCard mode={when ? "when" : "team"} chipK={chip} merge={merge} flash={seq ? { cell: seq.v as 0 | 1, k: seq.k } : undefined} scale={s} frame={frame} />
                </div>
              );
            }
            if (card.kind === "family" && fam && famKey) {
              const f = familyFlash(famKey, frame);
              return (
                <div style={pos}>
                  <FamilyFormula mode={fam.mode!} n={fam.n!} cellK={cellK} flash={f} lit={fam.lit} link={linkK} scale={s} frame={frame} />
                </div>
              );
            }
            if (card.kind === "why") {
              const s1 = wf(41, "ten");
              const s2 = wf(41, "four");
              const s3 = wf(41, "take");
              const step = p === 40 ? 0 : frame >= s3 ? 3 : frame >= s2 ? 2 : frame >= s1 ? 1 : 0;
              const at = step === 3 ? s3 : step === 2 ? s2 : s1;
              return (
                <div style={pos}>
                  <WhyTen n={card.n ?? 6} step={step} k={ramp(frame, at, 10)} scale={s} frame={frame} />
                </div>
              );
            }
            if (card.kind === "pattern") {
              if (p >= 105) return (
                <div style={pos}>
                  <PatternTable rows={4} scale={s} frame={frame} />
                </div>
              );
              const rowsAt = [wf(80, "six"), wf(81, "seven"), wf(82, "eight"), wf(83, "nine")];
              let rows = 0;
              if (p >= 80) rows = rowsAt.reduce((acc, f, i) => acc + (frame >= f - 4 ? clamp01((frame - (f - 4)) / 10) : 0), 0);
              if (p >= 84) rows = 4;
              const phr = p >= 80 && p <= 83 ? p : undefined;
              const rowIdx = phr !== undefined ? phr - 80 : p === 85 ? undefined : undefined;
              const flash = (() => {
                if (phr !== undefined) {
                  const hit = spokenNow(frame, [{ at: wf(phr, ["six", "seven", "eight", "nine"][phr - 80]), v: 0 }, { at: wf(phr, "one two three four".split(" ")[phr - 80]), v: 1 }]);
                  return hit ? { row: phr - 80, cell: hit.v, k: hit.k } : undefined;
                }
                if (p === 85) {
                  const hit = spokenNow(frame, [
                    { at: wf(85, "six"), v: 0 }, { at: wf(85, "seven"), v: 1 }, { at: wf(85, "eight"), v: 2 }, { at: wf(85, "nine"), v: 3 },
                  ]);
                  return hit ? { row: hit.v, cell: 0, k: hit.k } : undefined;
                }
                return undefined;
              })();
              const constants = p === 84 ? ramp(frame, wf(84, "minus"), 10) : p === 85 ? 0.6 : p === 77 ? ramp(frame, wf(77, "minus"), 10) : 0;
              const active = p === 85 ? flash?.row : rowIdx;
              return (
                <div style={pos}>
                  <PatternTable rows={rows} active={active} flash={flash} constants={constants} generic={p === 77} scale={s} frame={frame} />
                </div>
              );
            }
            if (card.kind === "finger") {
              const seq = (() => {
                if (p === 27) return spokenNow(frame, [{ at: wf(27, "thumb"), v: "thumb" as const }, { at: wf(27, "index"), v: "index" as const }]);
                if (p === 63) return spokenNow(frame, [{ at: wf(63, "thumb"), v: "thumb" as const }, { at: wf(63, "index"), v: "index" as const }]);
                if (p === 79) return spokenNow(frame, [{ at: wf(79, "thumb"), v: "thumb" as const }]);
                return undefined;
              })();
              const startOf = p === 27 ? wf(27, "thumb") : p === 63 ? wf(63, "thumb") : startF(p);
              const k1 = p === 78 || p === 79 ? 1 : ramp(frame, startOf - 14, 10);
              const k2 = p === 78 || p === 79 ? 0.45 : ramp(frame, (p === 27 ? wf(27, "index") : wf(63, "index")) - 10, 10);
              return (
                <div style={pos}>
                  <FingerRule flash={seq ? { which: seq.v, k: seq.k } : undefined} k1={k1} k2={k2} scale={s} frame={frame} />
                </div>
              );
            }
            return null;
          })()}

          {/* ---------------------------------------------------------------- THE SUM CARD, top right */}
          {scene.sum && !scene.closing && (() => {
            const r = sumRect(L.W, L.band.stageTop, L.portrait);
            return (
              <div style={{ position: "absolute", left: r.x, top: r.y, }}>
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
              <OtterFamily tags x={L.W / 2} y={closingY(L.portrait)} scale={closingScale(p, L.portrait)} mood={scene.otters!.mood} link={p === 58 ? 1 : 0} progress={progress} frame={frame} fps={FPS} water={false} />
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
              <OtterFamily tags x={closingX(p, L.W, L.portrait)} y={closingY(L.portrait)} scale={closingScale(p, L.portrait)} mood={scene.otters!.mood} link={p === 111 ? 0 : 1} progress={progress} frame={frame} fps={FPS} water={false} />
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
                title={["the family", "takes away"]}
                example={
                  <div style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 34, color: "#B5532F", textAlign: "center", maxWidth: 240, transform: `translateY(${bob(frame, FPS, 6, 2.6)}px)` }}>
                    the family works the other way round!
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

/** For tools/e15_audit.ts: the scripted phrase audit reads the same tables the reel renders from. */
export const __e15Audit = { sceneFor, PHRASES, SFX_CUES, ANSWER_FRAME, contentAt, FPS_: FPS };
