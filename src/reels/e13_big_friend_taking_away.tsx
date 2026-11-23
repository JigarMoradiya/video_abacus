// E13 · Big friend taking away — 16:9 (portrait pass to follow).
//
// The direct sequel to E12 "all five big friends" (adding): same five friend pairs, the SAME
// trick shape reversed. Adding used the friend to avoid running out of room; taking away uses the
// friend when there is nothing left to take away FROM. `−n = +friend − 10` — friend first, then
// the ten, the same friend-first order E11/E12's (corrected) adding formulas and Small Friend
// taking away already use. See docs/E13_lines.txt / docs/E13_lines_expressive.txt for the script
// and [[reference_abacus_formulas]].
//
// A DIFFERENT WORLD FROM E12 ON PURPOSE: not the rainbow jungle treehouse, an AUTUMN PARK —
// chestnut/rust/gold instead of green-and-sunshine-yellow, morning to golden-hour dusk. TWO
// SQUIRREL FRIENDS, not two toucans: same "the whole subject is a PAIR" logic, a different animal
// and a different gesture (an acorn handed paw to paw, `give`) so the two sibling episodes never
// read as one reskinned.
//
// RECAP CALLBACK TO E12, on purpose: p1-2 flashes the abacus to E12's own "6+4=10" example while
// the recap line names the ADDING trick, then p3-4 name and (silently) resolve it, before p5
// pivots into "same friends, same idea, just the other way round" — the whole episode's premise.
//
// Timing from src/data/e13.phrases.json, aligned from docs/E13_lines.txt. 114 phrases.

import React from "react";
import { interpolate } from "remotion";
import phrasesJson from "../data/e13.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Squirrel, type SquirrelMood, SQUIRREL_BOX } from "../components/e13/Squirrel";
import { WhyCard, WHY_NAT } from "../components/e13/WhyCard";
import { BigFriendCards, BIG_FRIENDS_NAT } from "../components/e11/BigFriendCards";
import {
  BigFriendFormulaList,
  BIG_FORMULA_ONE,
  BIG_FORMULA_ALL_NAT,
  BIG_FORMULA_GRID_NAT,
  BIG_FRIEND_TAKE_ALL,
} from "../components/e11/BigFriendFormulaList";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import { rodX } from "../stage/geometry";
import type { Scene as BaseScene } from "../stage/types";
import { RIG_AUTUMN, WORLDS } from "../data/theme";
import { FPS } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";

export const AUDIO_SEC = 350.8;
export const E13_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

interface Scene extends BaseScene {
  squirrel?: SquirrelMood;
  friends?: { shown: number; active?: number };
  friendsArriving?: boolean;
  friendsPrev?: { shown: number; active?: number };
  formulas?: { active?: number; stagger?: boolean; only?: boolean; all?: boolean };
  formulasArriving?: boolean;
  why?: number;
  whyPrev?: number;
  big?: string;
  bigParty?: boolean;
  valueChip?: boolean;
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep };
  spotlightRod?: boolean;
  /** the "add the friend, then carry away" combined moves — no hand, no arrow: a pulsing gold
   *  glow behind each rod listed, the exact same device E12 built for its own combined lines. */
  combinedGlow?: number[];
  /** the mid-roll like/subscribe card — NOT the episode close, the lesson continues right after */
  midSubscribe?: boolean;
}

const CARD_ACCENT = "#D9791E";

const BASE = 0.94;
const BIG_TOP = 20;
const BIG_SIZE = 80;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

const PORTRAIT_ROOM = { left: 80, right: 220 };

/**
 * What the abacus reads on each phrase, as a combined value 0-19 (ones + 10*tens). Any phrase not
 * listed holds the previous value — see the big block comment in E12 for why that convention
 * exists: every line either moves something or it does not, and "not" is the default.
 */
const VALUE: Record<number, number> = (() => {
  const v: Record<number, number> = {};
  for (let p = 0; p < PHRASES.length; p++) v[p] = 0;
  v[1] = 6; // the recap flash to E12's own "6+4" example — a memory, not a move
  v[2] = 6;
  v[3] = 10; // "take away the friend, then carry" — E12's ADD trick, named and resolved in one breath
  v[4] = 0; // silent reset, clearing the abacus for THIS episode's own first example
  for (let p = 5; p < 13; p++) v[p] = 0;
  v[13] = 18; // silent build — eighteen, before the direct take-away-five is even shown moving
  v[14] = 13; // push the upper bead up
  for (let p = 15; p < 19; p++) v[p] = 13;
  v[19] = 0; // silent reset — "now let us try ten take away one"
  v[20] = 10; // make ten: one bead on the tens rod
  for (let p = 21; p < 46; p++) v[p] = 10;
  v[46] = 19; // add nine on the ones rod: four lower beads up, then the upper bead down
  for (let p = 47; p < 49; p++) v[p] = 19;
  v[49] = 9; // take one bead away from the tens rod
  for (let p = 50; p < 55; p++) v[p] = 9;
  v[55] = 0; // silent reset — "let us try twelve take away three"
  v[56] = 0;
  v[57] = 12; // make twelve — one bead on tens, two lower on ones, in one breath
  for (let p = 58; p < 66; p++) v[p] = 12;
  v[66] = 19; // add seven: two lower beads up, then the upper bead down
  v[67] = 9; // take one bead away from the tens rod
  for (let p = 68; p < 71; p++) v[p] = 9;
  v[71] = 0; // silent reset — "what about taking away a big number, like seven?"
  for (let p = 72; p < 74; p++) v[p] = 0;
  v[74] = 11; // make eleven — one bead on tens, one lower on ones, in one breath
  for (let p = 75; p < 80; p++) v[p] = 11;
  v[80] = 14; // push three lower beads up
  v[81] = 4; // take one bead away from the tens rod
  for (let p = 82; p < 93; p++) v[p] = 4;
  v[93] = 0; // silent reset — "now it is your turn"
  for (let p = 94; p < 96; p++) v[p] = 0;
  v[96] = 13; // make thirteen — one bead on tens, three lower on ones, in one breath
  for (let p = 97; p < 102; p++) v[p] = 13;
  v[102] = 4; // add one lower bead, then take one bead away from the tens rod
  for (let p = 103; p < 107; p++) v[p] = 4;
  for (let p = 107; p < PHRASES.length; p++) v[p] = 0;
  return v;
})();

const valueAt = (p: number) => VALUE[p] ?? 0;
const digits = (v: number): [number, number] => [v % 10, Math.floor(v / 10) % 10];

/** Callback flashes and hard resets — no taught move happens on these, so no finger, no arrow. */
const SILENT_SET = new Set([1, 2, 4, 13, 19, 55, 71, 93, 107]);

const rig = (p: number) => {
  const d = digits(valueAt(p));
  return Array.from({ length: 5 }, (_, i) => ({
    value: i < 2 ? d[i] : 0,
    focus: i < 2 ? 1 : 0.35,
    chipLower: i < 2 || undefined,
    chipUpper: i < 2 || undefined,
    placeName: i < 2 ? (i === 0 ? "ones" : "tens") : undefined,
  }));
};

/** Same derivation E06/E11/E12 use: direction decides the finger, never the bead. */
const movedRod = (p: number): number | null => {
  if (p === 0 || SILENT_SET.has(p)) return null;
  const to = digits(valueAt(p));
  const from = digits(valueAt(p - 1));
  const moved = [0, 1].filter((i) => to[i] !== from[i]);
  return moved.length === 1 ? moved[0] : null;
};

/**
 * THE "ADD THE FRIEND, THEN CARRY AWAY" LINES. Each covers BOTH rods in one breath — either
 * building the starting number ("make twelve: one bead on the tens rod, and two lower beads on
 * the ones rod") or performing the trick's second half ("add one lower bead, then take one bead
 * away from the tens rod"). E12 tried a hand here twice and both read as clutter for a move that
 * is really one continuous idea; this reuses its fix verbatim: no hand, no arrow, a pulsing gold
 * glow behind each rod that is doing something, anchored to the word that actually says it.
 */
const COMBINED: Record<number, { rods: number[]; moveOn: string }> = {
  3: { rods: [0, 1], moveOn: "carry" },
  57: { rods: [0, 1], moveOn: "lower" },
  74: { rods: [0, 1], moveOn: "lower" },
  96: { rods: [0, 1], moveOn: "lower" },
  102: { rods: [0, 1], moveOn: "lower" },
};

const handFor = (p: number): Scene["hand"] => {
  const rod = movedRod(p);
  if (rod === null) return undefined;
  const to = digits(valueAt(p))[rod];
  const from = digits(valueAt(p - 1))[rod];
  const lowerFrom = from % 5;
  const lowerTo = to % 5;
  if (lowerTo > lowerFrom) return { digit: "thumb", direction: "up", rod, heaven: false };
  if (from >= 5 !== to >= 5) {
    const down = to >= 5;
    // A lone heaven-only "up" removal (the upper bead comes off with no lower-bead change in the
    // same breath — "push the upper bead up", 18 -> 13) has no second hand to coordinate with, so
    // it does NOT want E11/E12's -70 offset: that push moves the hand's name-chip UP, straight
    // into the rod's own "upper bead" reference badge above the frame (guardOverlap caught this
    // on p14). Only the two-hand case (earth AND heaven both changing, via hand2For below) still
    // wants that offset, to keep its chip clear of hand2's own chip underneath it.
    const lone = lowerTo === lowerFrom;
    return {
      digit: down ? "index" : "thumb",
      direction: down ? "down" : "up",
      rod,
      heaven: true,
      dy: down || lone ? undefined : -70,
    };
  }
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod, heaven: false };
  return undefined;
};

/** The second hand, for lines where both bead kinds move on the SAME rod at once (add nine /
 *  add seven — four or two lower beads up, THEN the upper bead down, both on the ones rod). */
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

/** Which rod a line is about, for lines with no move of their own — includes every line in
 *  SPOTLIGHT_ROD below plus a handful more that still want a sensible default target. */
const ROD_FOR_OVERRIDE: Record<number, number> = {
  10: 0, 18: 0, 21: 1, 22: 0, 23: 0, 25: 0, 44: 0, 45: 0, 47: 1, 48: 1,
  58: 0, 60: 0, 64: 0, 65: 0, 75: 0, 79: 0, 87: 0, 88: 1,
  27: 0, 34: 0, 35: 0, 36: 0, 54: 1, 61: 0, 62: 0, 63: 0, 77: 0, 78: 0,
  89: 0, 90: 1, 91: 0, 92: 0, 97: 0, 99: 0, 101: 0, 103: 0,
};
const rodFor = (p: number): number => {
  const rod = movedRod(p);
  if (rod !== null) return rod;
  if (ROD_FOR_OVERRIDE[p] !== undefined) return ROD_FOR_OVERRIDE[p];
  return 0;
};

const ANSWER_LINES = [52, 68, 82, 104];
const ANSWER_TEXT: Record<number, string> = {
  52: "10 − 1 = 9",
  68: "12 − 3 = 9",
  82: "11 − 7 = 4",
  104: "13 − 9 = 4",
};
const ANSWER_FRAME = new Map<number, number>();
for (const i of ANSWER_LINES) {
  ANSWER_FRAME.set(i, wordFrameIn(PHRASES[i], "$last", FPS) ?? sec(PHRASES[i].start, FPS));
}
const BURST_FROM = new Map<number, number>();
for (const [i, f] of ANSWER_FRAME) {
  BURST_FROM.set(i, f);
  if (i !== 104) BURST_FROM.set(i + 1, f);
}

/** The five-pair friends table, shown in full (nothing to build up — E12 already taught these
 *  pairs) and lit pair-by-pair as this episode calls on one. Pair indices: 0 = one&nine,
 *  1 = two&eight, 2 = three&seven, 3 = four&six, 4 = five&five. */
const FRIENDS: Record<number, NonNullable<Scene["friends"]>> = (() => {
  const out: Record<number, NonNullable<Scene["friends"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["friends"]>) => ps.forEach((p) => (out[p] = v));
  put([28, 29, 30], { shown: 5 }); // "do not worry, a big friend can help us" — before naming which
  put([31], { shown: 5 }); // "who is one's friend?" — asked, not answered
  put([32, 33], { shown: 5, active: 0 }); // "Nine! One and nine make ten."
  put([61], { shown: 5 }); // "so we call a big friend" — before naming
  put([62], { shown: 5, active: 2 }); // "Three's friend is seven."
  put([76], { shown: 5 }); // "no way!" — before naming
  put([77], { shown: 5, active: 2 }); // "Seven's friend is three." — mirrored side, same pair
  // the your-turn example (p93-104): unlike the two guided examples, the question and the
  // answer land on SEPARATE lines ("What is nine's friend?" / "One!") instead of one combined
  // sentence — the card was missing here entirely, leaving the reveal with no highlight at all.
  put([98, 99], { shown: 5 }); // "Think." / "What is nine's friend?" — asked, not answered
  put([100], { shown: 5, active: 0 }); // "One!" — same pair as p32-33, named from the other side
  return out;
})();

/** WORD-SYNCED NUMBER HIGHLIGHT for the friends card — same idiom E12 built. `sequence` lists the
 *  tiles in spoken order, each tagged with which side of the pair it is. */
const NUMBER_FLASH: Record<number, { pair: number; sequence: { word: string; side: 0 | 1 }[] }> = {
  31: { pair: 0, sequence: [{ word: "one's", side: 0 }] },
  32: { pair: 0, sequence: [{ word: "nine", side: 1 }] },
  33: { pair: 0, sequence: [{ word: "one", side: 0 }, { word: "nine", side: 1 }] },
  62: { pair: 2, sequence: [{ word: "three's", side: 0 }, { word: "seven", side: 1 }] },
  77: { pair: 2, sequence: [{ word: "seven's", side: 1 }, { word: "three", side: 0 }] },
  99: { pair: 0, sequence: [{ word: "nine's", side: 1 }] }, // "What is nine's friend?"
  100: { pair: 0, sequence: [{ word: "one", side: 0 }] }, // "One!" — the answer, on its own line
};

const spokenNow = <T extends { word: string }>(
  p: number,
  frame: number,
  sequence: T[]
): { step: T; k: number } | undefined => {
  let current: { step: T; at: number } | undefined;
  for (const step of sequence) {
    const at = wordFrameIn(PHRASES[p], step.word, FPS, 0);
    if (at !== null && frame >= at && (!current || at >= current.at)) current = { step, at };
  }
  if (!current) return undefined;
  const k = interpolate(frame, [current.at, current.at + 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { step: current.step, k };
};

const flashFor = (p: number, frame: number): { pair: number; side: 0 | 1; k: number } | undefined => {
  const cfg = NUMBER_FLASH[p];
  if (!cfg) return undefined;
  const hit = spokenNow(p, frame, cfg.sequence);
  return hit ? { pair: cfg.pair, side: hit.step.side, k: hit.k } : undefined;
};

/** The column-sum card, one instance at a time. Reused for every worked example, "−" instead of
 *  "+". A question must never show its answer: the 10−1 sum's total is withheld through the whole
 *  stuck/trick stretch until p52 actually says "nine". */
type SumRow = "first" | "second" | "answer";
const SUM_FLASH: Record<number, { word: string; row: SumRow }[]> = {
  13: [{ word: "eighteen", row: "first" }, { word: "five", row: "second" }],
  16: [{ word: "thirteen", row: "answer" }],
  19: [{ word: "ten", row: "first" }, { word: "one", row: "second" }],
  20: [{ word: "ten", row: "first" }],
  30: [{ word: "one", row: "second" }],
  52: [{ word: "ten", row: "first" }, { word: "one", row: "second" }, { word: "nine", row: "answer" }],
  55: [{ word: "twelve", row: "first" }, { word: "three", row: "second" }],
  56: [{ word: "twelve", row: "first" }],
  58: [{ word: "three", row: "second" }],
  68: [{ word: "twelve", row: "first" }, { word: "three", row: "second" }, { word: "nine", row: "answer" }],
  72: [{ word: "eleven", row: "first" }, { word: "seven", row: "second" }],
  73: [{ word: "eleven", row: "first" }],
  75: [{ word: "seven", row: "second" }],
  82: [{ word: "eleven", row: "first" }, { word: "seven", row: "second" }, { word: "four", row: "answer" }],
  95: [{ word: "thirteen", row: "first" }],
  97: [{ word: "nine", row: "second" }],
  104: [{ word: "thirteen", row: "first" }, { word: "nine", row: "second" }, { word: "four", row: "answer" }],
};

const sumFlashFor = (p: number, frame: number): { row: SumRow; k: number } | undefined => {
  const seq = SUM_FLASH[p];
  if (!seq) return undefined;
  const hit = spokenNow(p, frame, seq);
  return hit ? { row: hit.step.row, k: hit.k } : undefined;
};

// `step` picks which ROW the card lights: "first" = the sentence right now is about the
// STARTING number, "second" = it is about the number being SUBTRACTED (asking whether it can
// come off, discovering it can't, adding the friend, taking the ten away — all of that is the
// b-row's story), "answer" = the reveal. It tracks the SCRIPT line by line, not a fixed
// "setup then execute" phase — two lines that both sit in the "performing the trick" part of
// the story can still light different rows if one names the top number and the next names the
// bottom one. Cross-checked line by line against SUM_FLASH (the per-word flash already tags
// each number by row; where a phrase has a flash entry, its step here matches the flash's own
// row) and against the phrase text in src/data/e13.phrases.json.
const SUMS: Record<number, NonNullable<Scene["sum"]>> = (() => {
  const out: Record<number, NonNullable<Scene["sum"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["sum"]>) => ps.forEach((p) => (out[p] = v));
  const A = { a: 18, b: 5, op: "−" }; // the direct case — no trick needed
  put([12], { ...A, step: "none" }); // "Watch." — no number named yet
  // p13 "Eighteen take away five." names both; SUM_FLASH[13] ends on "five" (row second), and
  // p14-15 physically perform the take-away-five move, so "second" carries the whole beat.
  put([13, 14, 15], { ...A, step: "second" });
  put([16, 17, 18], { ...A, total: 13, step: "answer" });

  const B = { a: 10, b: 1, op: "−" }; // the stuck example — the trick's own reveal
  // p19 "Now let us try ten take away one." and p20 "Make ten." both build/name the STARTING
  // number — matches SUM_FLASH[19]'s own "ten" tag and SUM_FLASH[20]. p21 describes that same
  // built number's rod composition, still the a-row's story.
  put([19, 20, 21], { ...B, step: "first" });
  // p22 turns attention to the ones rod specifically to ask whether 1 can come off it, p23 asks
  // that outright, p24-27 discover and react to it being empty — all of this is the b-row's
  // story (the attempt to remove 1), not the a-row's.
  put([22, 23, 24, 25, 26, 27], { ...B, step: "second" });
  // p28-33 (the friends card) now sits BESIDE the sum card instead of replacing it (see
  // `coexist` below), so the sum card stays on screen — and still "second", since "who is
  // one's friend? Nine! One and nine make ten." is still all in service of removing b=1.
  // p34-41 (the WhyCard) is a genuinely different kind of explanation, not a friends-lookup,
  // and still takes the slot fully — the sum steps back in once the trick is actually
  // performed on the abacus, still withholding the answer (prevSumStep below walks back
  // through THAT gap to the real last B step, p33, so the row resumes already-lit instead of
  // fading through "none").
  put([28, 29, 30, 31, 32, 33], { ...B, step: "second" });
  put([43, 44, 45, 46, 47, 48, 49, 50, 51], { ...B, step: "second" });
  put([52, 53, 54], { ...B, total: 9, step: "answer" });

  const C = { a: 12, b: 3, op: "−" };
  // p55 "Let us try twelve take away three." and p56 "Make twelve." both name/build the
  // STARTING number — same template as B's p19/20, so "first". This was "none" before, which
  // is why "twelve" never lit while the video was literally saying "make twelve".
  // p57 "One bead on the tens rod, and two lower beads on the ones rod." is the combined move
  // that actually BUILDS twelve on the abacus (VALUE[57] = 12) — the a-row's story finishing,
  // same as p21 for B. This phrase previously had no SUMS entry at all, so the card vanished
  // for one line and popped back in at p58; folding it into this same "first" range closes
  // that gap as well as fixing the row.
  put([55, 56, 57], { ...C, step: "first" });
  // p58 "Can we take away three from the ones rod?", p59 "No!", p60 "There are only two beads
  // there." are all about the attempt to remove 3 — the b-row's story (SUM_FLASH[58] tags
  // "three" as row second). These were "first" before; that was the bug.
  // p61-62 (the friends card, "so we call a big friend... three's friend is seven") now sits
  // BESIDE the sum card instead of replacing it — still "second", same reasoning as B's 28-33.
  put([58, 59, 60, 61, 62], { ...C, step: "second" });
  put([64, 65, 66, 67], { ...C, step: "second" });
  put([68], { ...C, total: 9, step: "answer" });

  const E = { a: 11, b: 7, op: "−" };
  // p72 "Let us try eleven take away seven." and p73 "Make eleven." — same STARTING-number
  // template as C's p55/56; was "none" before, same bug.
  // p74 "One bead on the tens rod, and one lower bead on the ones rod." builds eleven
  // (VALUE[74] = 11) — same as C's p57, and previously missing from SUMS the same way.
  put([72, 73, 74], { ...E, step: "first" });
  // p75 "Can we take away seven from just one bead?" asks about removing 7 — the b-row's
  // story (SUM_FLASH[75] tags "seven" as row second). Was "first" before; that was the bug.
  // p76-77 (the friends card, "no way!... seven's friend is three") now sits BESIDE the sum
  // card too — still "second", same reasoning as B's 28-33 and C's 61-62.
  put([75, 76, 77], { ...E, step: "second" });
  put([79, 80, 81], { ...E, step: "second" });
  put([82, 83], { ...E, total: 4, step: "answer" });

  const G = { a: 13, b: 9, op: "−" }; // your turn
  // p95 "Make thirteen." and p96 "One bead on the tens rod, and three lower beads on the ones
  // rod." both build the STARTING number (VALUE[96] = 13) — "first", same template as B's
  // p19-21 and C/E's build lines. Was "none" before, which is why the "13" row never lit here.
  put([95, 96], { ...G, step: "first" });
  // p97 "Take away nine." names the number being subtracted — the b-row's story (SUM_FLASH[97]
  // tags "nine" as row second). THIS WAS THE REPORTED BUG: it was "first", lighting "13"
  // instead of "9" on the one line that is explicitly about taking nine away.
  // p98-100 (the friends card, "think... what is nine's friend?... One!") now sits BESIDE the
  // sum card instead of replacing it — still "second", same reasoning as the other three
  // examples' friends-card beats. p101 "Minus nine equals plus one, minus ten." restates that
  // same b=9 trick, so it stays "second" too (matching p97/98-100 exactly means prevSumStep's
  // walk-back finds an IDENTICAL step, so the row is already-lit with no wash-out — see
  // prevSumStep below). p102-103 keep executing that trick — still "second".
  put([97, 98, 99, 100, 101, 102, 103], { ...G, step: "second" });
  put([104, 105, 106], { ...G, total: 4, step: "answer" });
  return out;
})();

const SUM_FIRST = new Set(
  Object.keys(SUMS)
    .map(Number)
    .filter((p) => !SUMS[p - 1])
);

/** The row highlight (`k` in ColumnSum) travels from `prevStep` to `step` — it is what makes
 *  the highlight look like it walks from one row to another instead of snapping. A naive
 *  `SUMS[p - 1]` lookback breaks this across the gaps where another card (friends card,
 *  WhyCard) borrows the slot: at those `p`, `SUMS[p - 1]` is undefined even though the SAME
 *  example is still on screen a few lines later, so `prevStep` falls back to "none" and the
 *  row that was already lit fades to off and re-lights from scratch — visible as a washed-out
 *  flash on the resuming line (caught at p101, "13 − 9", resuming after the p98-100 friends-
 *  card handoff). Walk back to the nearest PRECEDING entry for the *same* example (matching
 *  a/b/op) regardless of how many phrases the gap spans; a different example (a genuine new
 *  sum replacing the old one) still falls back to "none", which is the correct start state. */
const prevSumStep = (p: number): SumStep => {
  const cur = SUMS[p];
  if (!cur) return "none";
  for (let i = p - 1; i >= 0; i--) {
    const s = SUMS[i];
    if (!s) continue;
    return s.a === cur.a && s.b === cur.b && s.op === cur.op ? s.step : "none";
  }
  return "none";
};

/** The formula strip — friend-first, `−n = +friend − 10`. Never lit before the answer is spoken
 *  (the "a question never shows its answer" rule): active=9 does not appear before p100 "One!". */
const FORMULAS: Record<number, NonNullable<Scene["formulas"]>> = (() => {
  const out: Record<number, NonNullable<Scene["formulas"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["formulas"]>) => ps.forEach((p) => (out[p] = v));
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  put(range(36, 54), { active: 1, only: true }); // beside the sum from p36; WHY_SET below hides it p37-41
  put(range(63, 68), { active: 3, only: true });
  put(range(78, 82), { active: 7, only: true });
  put(range(101, 104), { active: 9, only: true }); // NOT before p100 — the answer is spoken there
  // the pattern recap: "the friend changes, but ten never does" IS the whole nine-row card
  put([89], { stagger: true, all: true });
  put([90, 91, 92], { all: true });
  put([108], { stagger: true, all: true }); // the closing recap — all nine, none lit
  return out;
})();

/** Lines 37-41 hand the card slot to WhyCard instead — it takes over exactly where the formula
 *  strip would otherwise sit (`only` a moment ago, on p36). */
const WHY: Record<number, number> = { 37: 0, 38: 1, 39: 2, 40: 3, 41: 4 };

const HEADLINE: Record<number, string> = {
  0: "welcome back, friends!",
  10: "look at the ones rod",
  19: "uh oh — nothing there!",
  34: "the big friend trick, reversed",
  37: "why does it work?",
  42: "let us try it",
  55: "twelve take away three",
  71: "big numbers work too",
  84: "the pattern",
  93: "your turn",
  107: "big friend taking away",
};

const isWorking = (p: number) => (p >= 13 && p <= 18) || (p >= 20 && p <= 33);

/** Every line that NAMES a rod without moving a bead on it — the same breathing-badge-plus-
 *  chevron device E11/E12 built, reused verbatim via `spotlightRod`. The combined lines are
 *  deliberately absent — their own gold glow already marks both rods. */
const SPOTLIGHT_ROD = new Set([10, 18, 21, 22, 23, 25, 44, 45, 47, 48, 58, 60, 64, 75, 79, 87, 88]);

/**
 * WHAT THE SQUIRRELS ARE DOING. One mood per line, `give` reserved for the actual trade beats —
 * adding the friend, or passing the "one bead away from the tens rod" moment — mirroring E12's
 * `highfive` rule: played only when a finger hand is NOT already carrying the telling.
 */
const SQUIRREL: Record<number, SquirrelMood> = (() => {
  const t: Record<number, SquirrelMood> = {};
  const put = (ps: number[], m: SquirrelMood) => ps.forEach((p) => (t[p] = m));
  put([0], "wave");
  put([1, 2], "sit"); // the E12 recap flash — the abacus itself carries the telling
  put([3], "point");
  put([4], "sit");
  put([5, 6, 7], "sit");
  put([8, 9], "wave");
  put([10, 11], "point");
  put([12], "point");
  put([13, 14], "point");
  put([15, 16], "cheer");
  put([17, 18], "cheer");
  put([19], "point");
  put([20, 21], "point");
  put([22, 23], "think");
  put([24, 25], "worry");
  put([26, 27], "worry");
  put([28, 29], "sit");
  put([30], "think");
  put([31], "think");
  put([32], "cheer"); // "Nine!" — the reveal
  put([33], "give"); // "One and nine make ten." — the trade named
  put([34, 35, 36], "point");
  put([37], "think");
  put([38, 39, 40, 41], "sit"); // the WhyCard carries the telling
  put([42], "point");
  put([43, 44], "point");
  put([45, 46], "give"); // adding the friend on the ones rod — the acorn changes hands
  put([47, 48], "point");
  put([49], "give"); // taking one from the tens rod — the second half of the trade
  put([50, 51], "cheer");
  put([52, 53, 54], "cheer");
  put([55, 56], "point");
  put([57], "point");
  put([58, 59, 60], "think");
  put([61], "sit");
  put([62], "give");
  put([63, 64], "point");
  put([65, 66], "give");
  put([67], "give");
  put([68], "cheer");
  put([72, 73], "point");
  put([74], "point");
  put([75, 76], "worry");
  put([77], "give");
  put([78, 79], "point");
  put([80], "give");
  put([81], "give");
  put([82, 83], "cheer");
  put([84, 85], "think");
  put([86], "point");
  put([87, 88], "point");
  put([89], "give");
  put([90, 91], "point");
  put([92], "cheer");
  put([93, 94], "wave");
  put([95, 96], "point");
  put([97], "point");
  put([98, 99], "think");
  put([100], "cheer");
  put([101], "point");
  put([102], "give");
  put([103], "think");
  put([104], "cheer");
  put([105, 106], "cheer");
  put([107, 108], "point");
  put([109], "point");
  put([112, 113], "wave");
  return t;
})();

const squirrelFor = (p: number, hand: Scene["hand"], hand2: Scene["hand2"]): SquirrelMood | undefined => {
  const want = SQUIRREL[p];
  if (!want) return undefined;
  if (hand || hand2) return undefined;
  return want;
};

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const hand = handFor(p);
  const hand2 = hand2For(p);
  const combined = COMBINED[p];
  const whyStep = WHY[p];
  const base = {
    stage: "abacus" as const,
    rods: rig(p),
    scale: BASE,
    targetRod: rodFor(p),
    highlight: null,
    hand,
    hand2,
    moveOn:
      !SILENT_SET.has(p) && valueAt(p) !== valueAt(p - 1)
        ? combined
          ? combined.moveOn
          : "$last"
        : undefined,
    silentCut: SILENT_SET.has(p),
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
    friends: whyStep === undefined ? FRIENDS[p] : undefined,
    formulas: whyStep === undefined ? FORMULAS[p] : undefined,
    why: whyStep,
    whyPrev: WHY[p - 1],
    friendsArriving: FRIENDS[p] !== undefined && FRIENDS[p - 1]?.shown !== FRIENDS[p]?.shown,
    friendsPrev: FRIENDS[p - 1],
    formulasArriving: FORMULAS[p] !== undefined && FORMULAS[p - 1] === undefined,
    big: ANSWER_TEXT[p],
    bigParty: p === 104 || p === 105,
    valueChip: isWorking(p) && !ANSWER_TEXT[p],
    headline: HEADLINE[p],
    spotlightRod: SPOTLIGHT_ROD.has(p),
    combinedGlow: combined?.rods,
    sum: whyStep === undefined ? SUMS[p] : undefined,
    squirrel: squirrelFor(p, hand, hand2),
    midSubscribe: p === 70,
  };

  if (p <= 4) return { ...base, world: "parkfall" };
  if (p <= 9) return { ...base, world: "parkfall" };
  if (p <= 18) return { ...base, world: "hollowtrunk" };
  if (p <= 27) return { ...base, world: "emptybranch" };
  if (p <= 33) return { ...base, world: "acornstash" };
  if (p <= 41) return { ...base, world: "whyclearing" };
  if (p <= 54) return { ...base, world: "hollowtrunk", celebrate: p === 52 || p === 53 ? ("burst" as const) : base.celebrate };
  if (p <= 68) return { ...base, world: "russetpath", celebrate: p === 68 ? ("burst" as const) : base.celebrate };
  // the mid-roll like/subscribe ask — everything else steps off, same treatment E11/E12 use
  if (p === 70) {
    return {
      ...base,
      world: "goldenfall",
      closing: true,
      worldWash: 0.55,
      sum: undefined,
      formulas: undefined,
      friends: undefined,
      why: undefined,
      squirrel: undefined,
      valueChip: false,
      spotlightRod: false,
      combinedGlow: undefined,
    };
  }
  if (p <= 70) return { ...base, world: "goldenfall" };
  if (p <= 83) return { ...base, world: "duskgrove", celebrate: p === 82 ? ("burst" as const) : base.celebrate };
  if (p <= 92) return { ...base, world: "leafdrift" };
  if (p <= 106) {
    return {
      ...base,
      world: "acornchallenge",
      celebrate: p === 104 || p === 105 ? ("party" as const) : base.celebrate,
    };
  }

  // -------------------------------------------------------------------- CLOSE (harvestglow)
  //   p107-108  content: the formula recap
  //   p109-111  the store flow
  //   p112-113  the next-episode teaser
  if (p <= 108) return { ...base, world: "harvestglow" };
  if (p <= 111) {
    return {
      ...base,
      world: "harvestglow",
      closing: true,
      closeBeat: "store",
      worldWash: 0.55,
      valueChip: false,
      friends: undefined,
      formulas: undefined,
      noCaption: p === 110 || p === 111,
    };
  }
  return {
    ...base,
    world: "harvestglow",
    closing: true,
    closeBeat: "next",
    worldWash: 0.55,
    valueChip: false,
    friends: undefined,
    formulas: undefined,
    squirrel: undefined,
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
    if (SILENT_SET.has(i)) continue; // callback flashes and resets get no bead click
    const mv = sceneFor(i).moveOn;
    add(mv ? on(i, mv) : at(i), "abacus_move.mp3", 30, 0.32);
  }
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);

  // a light greeting sfx, well clear of the intro→episode seam (never percussive in the first
  // ~150ms of the episode — the same fix E12's own "Hello again!" needed)
  add(on(0, "again"), "cta_pop.mp3", 30, 0.26);
  add(on(9, "go"), "count_hook.mp3", 40, 0.26); // "Let us go!"

  // "we are stuck" — the SAME emotional beat E11/E12 both use for the friend-less moment
  add(on(27, "stuck"), "stuck_uhoh.mp3", 40, 0.28);
  add(on(28, "worry"), "reassure.mp3", 46, 0.28); // "Do not worry."

  // every question, and its answer, gets a chirp — softer on the ask, brighter on the answer
  for (const i of [23, 31, 58, 75, 99]) add(at(i), "quiz_chirp.mp3", 36, 0.2);
  for (const i of [24, 32, 59, 76, 100]) add(at(i), "quiz_chirp.mp3", 40, 0.3);

  // the four answer-card lines plus "Well done!" — a triumphant sting
  for (const i of [52, 68, 82, 104, 106]) add(at(i), "count_fanfare.mp3", 60, 0.26);

  add(on(34, "trick"), "friend_sparkle.mp3", 50, 0.3); // "the big friend trick for taking away"
  add(on(37, "work"), "tick.mp3", 20, 0.22); // "Why does it work?"
  add(on(42, "abacus"), "reveal.mp3", 50, 0.28); // "let us do it on the abacus"
  for (const i of [3, 49, 67, 81, 102]) add(on(i, "lower") !== at(i) ? on(i, "lower") : on(i, "carry"), "count_carry.mp3", 40, 0.24);

  add(on(86, "same"), "bead_recap_sting.mp3", 50, 0.26); // "we did the same two things"
  add(on(90, "never"), "bead_recap_sting.mp3", 50, 0.24); // "but ten never does"

  // each squirrel `give` beat gets a soft acorn-tap, the same "on arrival" idiom E12's toucans use
  for (let i = 0; i < PHRASES.length; i++) {
    const sc = sceneFor(i);
    if (sc.squirrel === "give" && sceneFor(i - 1)?.squirrel !== "give") {
      add(at(i) + 4, "tick.mp3", 22, 0.2);
    }
  }
  for (let i = 0; i < PHRASES.length; i++) {
    const sc = sceneFor(i);
    if (sc.squirrel === "cheer" && sceneFor(i - 1)?.squirrel !== "cheer") {
      add(at(i) + Math.round((sec(PHRASES[i].end, FPS) - at(i)) * 0.12), "clap.mp3", 50, 0.18);
    }
  }

  // the mid-roll like ask
  const midIdx = PHRASES.map((x) => x.index).find((i) => sceneFor(i).midSubscribe);
  if (midIdx !== undefined) {
    const st = at(midIdx);
    add(st + 8, "btn_click.mp3", 20, 0.3);
    add(st + 30, "bell.mp3", 46, 0.3);
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

/** Ground-anchored: (x,y) is the point BETWEEN the two squirrels' feet — each one's own anchor
 *  sits `gap/2` either side of it, facing inward so `give` always reaches toward its partner.
 *  `crowded` is the one new case: the friends-card beats now keep the sum card up (see
 *  `coexist`), and the friends card itself moves into the squirrels' usual spot on the right
 *  (see `friendsAsideSlot`) — so on those lines the squirrels shrink and drop lower, out of the
 *  card's way, rather than the card shrinking around them. guardOverlap (SceneStage.tsx) throws
 *  a hard render error the moment any two boxes actually intersect, so this was tuned against
 *  that check, not by eye alone. */
const squirrelPairAt = (
  box: { left: number; w: number; top: number; h: number; scale: number },
  L: { W: number; H: number; portrait: boolean },
  closing = false,
  aside = false,
  crowded = false,
  /** How much `box.top` has been lifted by `rigBand` (portrait only) — added back here so the
   *  squirrel pair's position/scale stays exactly what it was before the rig-lift round, even
   *  though the rig itself now sits higher. The user asked for the squirrels specifically to
   *  stay put while the abacus lift, the full-size coexist cards, and the label-halo fix all
   *  stayed; this is that: everything ELSE here (the `crowded` shrink itself, unchanged since
   *  the round that first built portrait coexistence) is untouched. */
  portraitLift = 0
) => {
  if (closing) {
    const scale = L.portrait ? 0.62 : 0.72;
    return { x: L.W - 220 * scale, y: L.H * (L.portrait ? 0.74 : 0.8), scale, gap: 130 * scale };
  }
  if (L.portrait) {
    // Portrait's card band has no vertical room to drop the pair into (the caption band starts
    // 15 px past its bottom edge — see `friendsAsideSlot`), so `crowded` shrinks them in place
    // instead of dropping them, same reasoning as the width-only fit that drives the card sizes.
    const scale = box.scale * (aside ? 0.56 : 0.66) * (crowded ? 0.66 : 1);
    return {
      x: aside ? L.W - SQUIRREL_BOX.half * scale - 70 : L.W / 2,
      y: box.top + box.h + 380 * scale + portraitLift,
      scale,
      gap: 140 * scale,
    };
  }
  const scale = box.scale * 0.64 * (crowded ? 0.5 : 1);
  return {
    x: Math.min(box.left + box.w + 300 * box.scale, L.W - SQUIRREL_BOX.half * scale * 2 - 16),
    y: box.top + box.h + (crowded ? 40 : 0),
    scale,
    // half-gap ≈ 95·scale (base scale), so the acorns meet on `give` without overlapping at rest
    gap: 190 * scale,
  };
};

const toucansOn = (scene: Scene, portrait: boolean) =>
  Boolean(scene.squirrel) && !(scene.formulas?.all && portrait);

const squirrelPairRect = (m: { x: number; y: number; scale: number; gap: number }) => ({
  x: m.x - (SQUIRREL_BOX.half * m.scale + m.gap / 2),
  y: m.y - SQUIRREL_BOX.up * m.scale,
  w: SQUIRREL_BOX.half * m.scale * 2 + m.gap,
  h: (SQUIRREL_BOX.up + SQUIRREL_BOX.down) * m.scale,
});

const SUM_S = (portrait: boolean) => (portrait ? 0.7 : 0.78);
const CARD_GAP = 18;

/** The friends-lookup beats ("who is one's friend? Nine!") used to hide the sum card entirely
 *  while the friend was found, then pop it back in — jarring, since the equation the child was
 *  just working shouldn't vanish mid-explanation. Now both stay up in both cuts: the friends
 *  card moves aside (see `friendsAsideSlot`) and the squirrels shrink/drop to stay clear (see
 *  `squirrelPairAt`'s `crowded`). */
const coexist = (scene: Scene, _portrait: boolean) => Boolean(scene.sum && scene.friends);

/** The friends card's own slot when it is sharing the frame with the sum card, AND — portrait
 *  only — the sum card's own slot for that same beat (landscape leaves the sum card at its
 *  usual `cardSlot` position, x=44, unchanged).
 *
 * LANDSCAPE: upper-right, clear of the abacus and (after the squirrels shrink and drop for
 * this same beat) clear of them too. There is enough real estate to the right of the abacus —
 * once the squirrels are out of the way (see `squirrelPairAt`'s `crowded`) — that the card does
 * not need to shrink at all: this is the SAME scale it uses in its usual shared slot.
 *
 * PORTRAIT: the card BAND is wide (960 px clear) but SHORT (240 px, one card's usual height) —
 * the opposite trade-off from landscape's tall-but-narrower stage band — and there is no room
 * below it to drop the squirrels further (the caption band starts 15 px past the card band's
 * bottom edge), so the fit has to work entirely on WIDTH, side by side same as landscape, just
 * both cards a little smaller and the squirrels a little smaller too (see `squirrelPairAt`).
 * The sum card's usual portrait slot CENTRES it (`cardSlot`'s portrait branch) — while
 * coexisting it instead sits at the LEFT of the centred pair, same relationship as landscape's
 * fixed-left sum + aside-right friends, just both now centred as a unit instead of the sum
 * alone. Checked against guardOverlap (a hard render error on any real intersection) across
 * every friends-card beat in all four worked examples, both cuts, before landing on these
 * numbers. */
const FRIENDS_ASIDE_SCALE = 0.84;
const PORTRAIT_COEXIST_SUM_SCALE = 0.7;
const PORTRAIT_COEXIST_FRIENDS_SCALE = 0.68;
const friendsAsideSlot = (L: {
  W: number;
  portrait: boolean;
  band: { stageTop: number };
  cardBand: { top: number } | null;
}) => {
  if (L.portrait) {
    const sumScale = PORTRAIT_COEXIST_SUM_SCALE;
    const scale = PORTRAIT_COEXIST_FRIENDS_SCALE;
    const sumW = COL_NAT.w * sumScale;
    const w = BIG_FRIENDS_NAT.w * scale;
    const gap = 14;
    const startX = (L.W - (sumW + gap + w)) / 2;
    const y = L.cardBand!.top + 8;
    return { x: startX + sumW + gap, y, scale, sumX: startX, sumY: y, sumScale };
  }
  const scale = FRIENDS_ASIDE_SCALE;
  return { x: L.W - BIG_FRIENDS_NAT.w * scale - 40, y: L.band.stageTop + 4, scale, sumX: undefined as number | undefined, sumY: undefined as number | undefined, sumScale: undefined as number | undefined };
};

/** The de-emphasis for whichever card is NOT the one the line is actually about, while both are
 *  up at once — dimmed and very slightly shrunk (anchored top-left, so it does not drift off
 *  its slot), so the eye still goes to the active card but the other stays legible as context
 *  rather than looking broken or half-rendered. */
const DIM_CARD: React.CSSProperties = {
  opacity: 0.4,
  filter: "saturate(0.5)",
  transform: "scale(0.94)",
  transformOrigin: "top left",
};

const cardSize = (scene: Scene, portrait: boolean) => {
  if (scene.why !== undefined) return { nat: WHY_NAT, scale: portrait ? 0.72 : 0.86 };
  // While the friends card sits ASIDE (see `coexist`), the sum card is still the one anchored
  // in the usual slot — the friends card gets its own independent slot below, not this one.
  if (scene.sum && coexist(scene, portrait)) {
    return { nat: COL_NAT, scale: portrait ? PORTRAIT_COEXIST_SUM_SCALE : SUM_S(portrait) };
  }
  if (scene.friends) return { nat: BIG_FRIENDS_NAT, scale: portrait ? 0.68 : 0.84 };
  if (scene.sum && scene.formulas?.only) {
    const s = SUM_S(portrait);
    return { nat: { w: COL_NAT.w + CARD_GAP + BIG_FORMULA_ONE.w, h: COL_NAT.h }, scale: s };
  }
  if (scene.formulas?.only) return { nat: BIG_FORMULA_ONE, scale: portrait ? 0.85 : 0.9 };
  if (scene.formulas?.all) {
    return portrait
      ? { nat: BIG_FORMULA_GRID_NAT, scale: 1.05 }
      : { nat: BIG_FORMULA_ALL_NAT, scale: 0.72 };
  }
  if (scene.sum) return { nat: COL_NAT, scale: SUM_S(portrait) };
  return null;
};

const cardSlot = (
  L: { portrait: boolean; W: number; band: { stageTop: number; stageBottom: number }; cardBand: { top: number } | null },
  w: number,
  h: number
) =>
  L.portrait
    ? { x: (L.W - w) / 2, y: L.cardBand!.top + 8 }
    : { x: 44, y: L.band.stageTop + (L.band.stageBottom - L.band.stageTop - h) / 2 };

// Portrait ONLY (see `rigBand` below — landscape always gets `null` back, i.e. the shared
// `layout.band` unchanged, so the 16:9 cut is byte-identical to before this constant existed).
// The rig used to sit vertically centred in the full stage band (930-210=720 tall), which left
// the coexistence card band (see `friendsAsideSlot`) only as much clearance below the rig as the
// band's own bottom margin gave it — the reason `PORTRAIT_COEXIST_SUM_SCALE`/
// `PORTRAIT_COEXIST_FRIENDS_SCALE` had to shrink defensively. Lifting the rig's own centring
// band (not the shared `PORTRAIT_BANDS` constant every portrait episode reads) grows that
// clearance without moving E11/E12's portrait rigs at all.
//
// Two lift amounts, not one: the place-value chip that floats ABOVE the rod (Abacus.tsx's
// `chipUpper`, at a FIXED offset above the abacus frame) was already tightly tuned against two
// fixed-position elements that sit even higher — the working `valueChip` (y=24) and the
// answer-reveal `big` banner (y=20, 166 tall, so its bottom sits at 186) — the reveal banner in
// particular left only ~12px of slack in the ORIGINAL (unlifted) layout. Lifting the rig lifts
// that chip by the same amount, so a lift sized for the common case reintroduces exactly the
// overlap this whole round is trying to fix, but only on the handful of reveal phrases. `scene`
// is already threaded through `rigBand`, so the lift itself is scene-aware: full lift everywhere
// (including all four coexistence beats, none of which carry `scene.big`), a small one held back
// on the reveal phrases specifically. Both numbers checked against guardOverlap across all 114
// phrases, not derived by eye.
const PORTRAIT_RIG_LIFT = 55;
const PORTRAIT_RIG_LIFT_ON_REVEAL = 0;
/** Same lift `rigBand` applies to the rig itself — shared so the squirrel pair's own position
 *  can add it back (see `squirrelPairAt`'s `portraitLift`) and land exactly where it did before
 *  the rig started lifting, per the user's explicit ask to leave the squirrels alone. */
const portraitLiftFor = (scene: Scene, portrait: boolean): number =>
  portrait ? (scene.big ? PORTRAIT_RIG_LIFT_ON_REVEAL : PORTRAIT_RIG_LIFT) : 0;

export const E13BigFriendTakingAway: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e013_big_friend_taking_away/E13.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={0}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_AUTUMN}
    beadArrows
    colorOnArrival
    sideRoom={() => PORTRAIT_ROOM}
    stageShift={() => ({ left: 0, right: 0 })}
    rigBand={(scene, L) => {
      if (!L.portrait) return null;
      const lift = portraitLiftFor(scene, L.portrait);
      return { stageTop: L.band.stageTop - lift, stageBottom: L.band.stageBottom - lift };
    }}
    // The "tens"/"ones" label under the place chips is a plain PLACE_COLORS fill with no
    // outline (Abacus.tsx) — low contrast specifically against E13's warm autumn-park grounds.
    // Portrait-only per the user's explicit scope: the 16:9 cut keeps its existing look exactly.
    placeLabelHalo={(_scene, L) => L.portrait}
    boxesFor={(scene, ctx) => {
      const L = ctx.layout;
      const out = [];
      if (scene.big) {
        const w = bigW(scene.big);
        out.push({ label: "number", r: { x: (L.W - w) / 2, y: BIG_TOP, w, h: BIG_H } });
      }
      if (scene.valueChip && !scene.big && !scene.headline) {
        out.push({ label: "valueChip", r: { x: (L.W - 260) / 2, y: 24, w: 260, h: 108 } });
      }
      const card = cardSize(scene, L.portrait);
      const crowded = coexist(scene, L.portrait);
      if (card) {
        const w = card.nat.w * card.scale;
        const h = card.nat.h * card.scale;
        // Portrait's coexist beats move the sum card off `cardSlot`'s centred position (see the
        // matching override in the sum card's own render block) — the guard box has to track
        // that or it checks the wrong rectangle and misses (or falsely flags) real overlaps.
        const at =
          crowded && L.portrait
            ? (() => {
                const slot = friendsAsideSlot(L);
                return { x: slot.sumX!, y: slot.sumY! };
              })()
            : cardSlot(L, w, h);
        out.push({ label: "teachCard", r: { ...at, w, h } });
      }
      if (crowded) {
        const slot = friendsAsideSlot(L);
        out.push({
          label: "friendsAside",
          r: { x: slot.x, y: slot.y, w: BIG_FRIENDS_NAT.w * slot.scale, h: BIG_FRIENDS_NAT.h * slot.scale },
        });
      }
      const squirrelAside = Boolean(L.portrait && !scene.closing && card);
      if (toucansOn(scene, L.portrait)) {
        const m = squirrelPairAt(ctx.box, L, Boolean(scene.closing), squirrelAside, crowded, portraitLiftFor(scene, L.portrait));
        out.push({
          label: "squirrels",
          r: squirrelPairRect(m),
          mayTouchAbacus: true,
          mayExitFrame: true,
        });
      }
      return out;
    }}
    renderOver={(scene, ctx) => (
      <>
        {/* THE ROD SPOTLIGHT — breathing badge + bouncing chevron, reused verbatim from E11/E12 */}
        {scene.spotlightRod && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
          >
            {(() => {
              const rod = scene.targetRod ?? 0;
              const cx = rodX(ctx.box, rod);
              const cy = ctx.box.top + ctx.box.h / 2;
              const badgeW = 100 * ctx.box.scale;
              const badgeH = ctx.box.h - 6 * ctx.box.scale;
              const t = ctx.frame / FPS;
              const breathe = 1 + Math.sin(t * 3.4) * 0.09;
              const bobY = Math.abs(Math.sin(t * 2.6)) * 14 * ctx.box.scale;
              const chevronY = cy - badgeH / 2 - 78 * ctx.box.scale - bobY;
              return (
                <>
                  <g transform={`translate(${cx} ${cy}) scale(${breathe}) translate(${-cx} ${-cy})`}>
                    <rect
                      x={cx - badgeW / 2}
                      y={cy - badgeH / 2}
                      width={badgeW}
                      height={badgeH}
                      rx={24 * ctx.box.scale}
                      fill="#FFE066"
                      opacity={0.24}
                    />
                    <rect
                      x={cx - badgeW / 2}
                      y={cy - badgeH / 2}
                      width={badgeW}
                      height={badgeH}
                      rx={24 * ctx.box.scale}
                      fill="none"
                      stroke="#FFE066"
                      strokeWidth={7}
                    />
                  </g>
                  <path
                    d={`M ${cx - 16 * ctx.box.scale} ${chevronY} L ${cx} ${chevronY + 16 * ctx.box.scale} L ${cx + 16 * ctx.box.scale} ${chevronY}`}
                    stroke="#FFE066"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </>
              );
            })()}
          </svg>
        )}

        {/* THE "ADD THE FRIEND, THEN CARRY AWAY" GLOW — same device E12 built for its own
            combined moves: a soft pulsing gold glow behind each rod that's moving, fading on
            the same curve BeadArrow's own arrows fade on. */}
        {scene.combinedGlow && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
          >
            <defs>
              <radialGradient id="combinedGlowGrad">
                <stop offset="0%" stopColor="#FFE066" stopOpacity={0.85} />
                <stop offset="70%" stopColor="#FFE066" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FFE066" stopOpacity={0} />
              </radialGradient>
            </defs>
            {(() => {
              const t = ctx.frame / FPS;
              const pulse = 1 + Math.sin(t * 4.2) * 0.12;
              const opacity = interpolate(ctx.settle, [0, 0.55, 0.9], [1, 0.9, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              if (opacity <= 0.01) return null;
              const cy = ctx.box.top + ctx.box.h / 2;
              const rOuter = ctx.box.h * 0.62 * pulse;
              return scene.combinedGlow!.map((rod) => {
                const cx = rodX(ctx.box, rod);
                return (
                  <ellipse
                    key={rod}
                    cx={cx}
                    cy={cy}
                    rx={rOuter * 0.42}
                    ry={rOuter}
                    fill="url(#combinedGlowGrad)"
                    opacity={opacity}
                  />
                );
              });
            })()}
          </svg>
        )}

        {/* THE TWO SQUIRRELS */}
        {toucansOn(scene, ctx.layout.portrait) && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            {(() => {
              const card = cardSize(scene, ctx.layout.portrait);
              const m = squirrelPairAt(
                ctx.box,
                ctx.layout,
                Boolean(scene.closing),
                Boolean(ctx.layout.portrait && !scene.closing && card),
                coexist(scene, ctx.layout.portrait),
                portraitLiftFor(scene, ctx.layout.portrait)
              );
              return (
                <>
                  <Squirrel
                    x={m.x - m.gap / 2}
                    y={m.y}
                    scale={m.scale}
                    mood={scene.squirrel!}
                    marking="rust"
                    facing={1}
                    progress={ctx.beatProgress}
                    frame={ctx.frame}
                    fps={FPS}
                  />
                  <Squirrel
                    x={m.x + m.gap / 2}
                    y={m.y}
                    scale={m.scale}
                    mood={scene.squirrel!}
                    marking="cocoa"
                    facing={-1}
                    phase={0.4}
                    progress={ctx.beatProgress}
                    frame={ctx.frame}
                    fps={FPS}
                  />
                </>
              );
            })()}
          </svg>
        )}

        {/* THE BIG FRIENDS TABLE — beside the sum card (see `coexist`) on the friends-lookup
            beats, in its own right-side slot instead of the shared teachCard one; otherwise
            the usual shared slot, unchanged. */}
        {scene.friends && (() => {
          const L = ctx.layout;
          const beside = coexist(scene, L.portrait);
          let at: { x: number; y: number };
          let scale: number;
          if (beside) {
            const slot = friendsAsideSlot(L);
            at = { x: slot.x, y: slot.y };
            scale = slot.scale;
          } else {
            const card = cardSize(scene, L.portrait)!;
            scale = card.scale;
            at = cardSlot(L, card.nat.w * scale, card.nat.h * scale);
          }
          return (
            <div style={{ position: "absolute", left: at.x, top: at.y }}>
              <BigFriendCards
                shown={scene.friends.shown}
                active={scene.friends.active}
                arriving={scene.friendsArriving}
                prevActive={scene.friendsPrev?.active}
                accent={CARD_ACCENT}
                progress={ctx.beatProgress}
                flash={flashFor(ctx.p, ctx.frame)}
                scale={scale}
              />
            </div>
          );
        })()}

        {/* THE "WHY DOES IT WORK?" CARD */}
        {scene.why !== undefined && (() => {
          const L = ctx.layout;
          const card = cardSize(scene, L.portrait)!;
          const at = cardSlot(L, card.nat.w * card.scale, card.nat.h * card.scale);
          return (
            <div style={{ position: "absolute", left: at.x, top: at.y }}>
              <WhyCard
                step={scene.why}
                prevStep={scene.whyPrev ?? 0}
                accent={CARD_ACCENT}
                progress={ctx.beatProgress}
                scale={card.scale}
              />
            </div>
          );
        })()}

        {/* THE FORMULA CARD */}
        {scene.formulas && (() => {
          const L = ctx.layout;
          const card = cardSize(scene, L.portrait)!;
          const at = cardSlot(L, card.nat.w * card.scale, card.nat.h * card.scale);
          const besideSum = Boolean(scene.sum && scene.formulas!.only);
          const left = besideSum ? at.x + (COL_NAT.w + CARD_GAP) * card.scale : at.x;
          const top = besideSum ? at.y + ((COL_NAT.h - BIG_FORMULA_ONE.h) / 2) * card.scale : at.y;
          return (
            <div style={{ position: "absolute", left, top }}>
              <BigFriendFormulaList
                active={scene.formulas.active}
                stagger={scene.formulas.stagger}
                only={scene.formulas.only}
                all={scene.formulas.all}
                grid={Boolean(scene.formulas.all && ctx.layout.portrait)}
                take
                arriving={scene.formulasArriving}
                accent={CARD_ACCENT}
                progress={ctx.beatProgress}
                scale={card.scale}
              />
            </div>
          );
        })()}

        {/* THE COLUMN SUM — dimmed while the friends card is beside it and IS the thing the
            line is currently about (see `coexist`/`DIM_CARD`): the equation stays legible as
            context instead of disappearing, but the eye goes to the friends lookup first. */}
        {scene.sum && (() => {
          const L = ctx.layout;
          const card = cardSize(scene, L.portrait)!;
          const dimmed = coexist(scene, L.portrait);
          // Portrait's own card band CENTRES a lone card — while coexisting, the sum card
          // instead sits at the left of the centred sum+friends pair (see `friendsAsideSlot`).
          // Landscape's sum position never moves (`cardSlot`'s fixed x=44), coexisting or not.
          const at =
            dimmed && L.portrait
              ? (() => {
                  const slot = friendsAsideSlot(L);
                  return { x: slot.sumX!, y: slot.sumY! };
                })()
              : cardSlot(L, card.nat.w * card.scale, card.nat.h * card.scale);
          return (
            <div style={{ position: "absolute", left: at.x, top: at.y, ...(dimmed ? DIM_CARD : {}) }}>
              <ColumnSum
                a={scene.sum.a}
                b={scene.sum.b}
                op={scene.sum.op}
                total={scene.sum.total}
                step={scene.sum.step}
                prevStep={prevSumStep(ctx.p)}
                popIn={SUM_FIRST.has(ctx.p)}
                flash={sumFlashFor(ctx.p, ctx.frame)}
                strongHighlight
                bg={CARD_ACCENT}
                progress={ctx.beatProgress}
                scale={card.scale}
              />
            </div>
          );
        })()}

        {/* the live value, above the abacus during working stretches */}
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
                boxShadow: "0 8px 0 rgba(20,40,20,0.35)",
              }}
            >
              {ctx.settle > 0.85 ? valueAt(ctx.p) : valueAt(Math.max(0, ctx.p - 1))}
            </div>
          </div>
        )}

        {/* the big answer */}
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

        {/* the mid-roll like/subscribe ask — NOT the episode close */}
        {scene.midSubscribe && (
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
            <div style={{ transform: `scale(${ctx.layout.portrait ? 1.1 : 1.2})` }}>
              <SubscribeCard progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- the close */}
        {scene.closeBeat === "store" && (
          <>
            <div
              style={{
                position: "absolute",
                left: ctx.layout.portrait ? (ctx.layout.W - 353) / 2 : 465,
                top: ctx.layout.portrait ? 133 : 140,
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
                left: ctx.layout.portrait ? 0 : 955,
                top: ctx.layout.portrait ? 887 : 285,
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

        {scene.closeBeat === "next" && (
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
              title={["beat the", "beads"]}
              example={
                <div
                  style={{
                    fontFamily: KID_FONT,
                    fontWeight: 700,
                    fontSize: 34,
                    color: CARD_ACCENT,
                    textAlign: "center",
                    maxWidth: 220,
                    // a small continuous idle float — a static teaser card is exactly the "long
                    // line, nothing moving" case motion_check exists to catch
                    transform: `translateY(${bob(ctx.frame, FPS, 6, 2.6)}px)`,
                  }}
                >
                  every trick, one big game!
                </div>
              }
            />
          </div>
        )}
      </>
    )}
  />
);
