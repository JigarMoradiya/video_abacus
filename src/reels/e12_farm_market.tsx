// E12 · SUNNY FARM MARKET REMAKE (Bead Buddies series, docs/COVE_SERIES_PLAN.md). SAME audio, phrase table, timings, teaching beats and
// abacus tables as the delivered E12 (src/reels/e12_all_five_big_friends.tsx, kept for reference). Only the two toucans and the jungle
// worlds are replaced: Fifi and Tenzo (a PAIR, like the friend pairs) in straw hats and a red cape in a calm Sunny Farm Market,
// with a pig and a chick at the edges. Their high-five is a paw bump.

// E12 · All five big friends — 16:9 (portrait pass to follow).
//
// The recall-and-cover-the-rest episode for the Big Friend trick: E11 taught the trick in full on
// one pair (9+1), fully worked two more (8+2, 7+3) without saying so out loud as "the trick again"
// every time, and this episode is where all five pairs get named, the two unworked pairs (6+4,
// 5+5) get the same full bead-by-bead treatment, and — the one genuinely new idea here — the trick
// is shown working BACKWARDS too (2+8 as the flip of 8+2, 4+6 as the flip of 6+4), because `+n`
// and `+(10-n)` are different formulas even though they share a friend pair. See docs/E12_lines.txt
// for the full script and its production notes, and [[reference_abacus_formulas]].
//
// A DIFFERENT WORLD FROM E11 ON PURPOSE: not the circus tent (indoor, artificial light), a bright
// rainbow jungle treehouse — canopy/vines/ferns vocabulary E06 built, new palette, morning to
// dusk. TWO TOUCAN FRIENDS, not one mascot: this episode's whole subject is PAIRS, so the
// character has to be two that visibly interact — see Toucan.tsx's `highfive` mood, beak to beak,
// played on every line that names or confirms a friend pair.
//
// SMALL CALLBACKS TO E11, on purpose (the user asked for this explicitly): p1-4 flashes the
// abacus back through E11's own stuck-9 / remove-friend / carry-to-ten sequence while the recap
// line is spoken; p45-49 briefly shows the ones rod stuck at nine again (with the SAME blink-the-
// beads device E11 used for "every bead is already pushed") right as the script itself says
// "do you remember nine plus one? We pushed, and pushed, and there was nothing left."
//
// Timing from src/data/e12.phrases.json, aligned from docs/E12_lines.txt. 128 phrases.

import React from "react";
import { interpolate } from "remotion";
import phrasesJson from "../data/e12.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Twinkles, castFit } from "../components/cast";
import { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, OT_K } from "../components/cast";
import type { OtterMood } from "../components/cast";
type ToucanMood = "perch" | "wave" | "think" | "worry" | "point" | "cheer" | "highfive";
const MOOD: Record<ToucanMood, OtterMood> = { perch: "float", wave: "wave", think: "think", worry: "worry", point: "point", cheer: "cheer", highfive: "present" };
import { BigFriendCards, BIG_FRIENDS_NAT } from "../components/e11/BigFriendCards";
import {
  BigFriendFormulaList,
  BIG_FORMULA_NAT,
  BIG_FORMULA_ONE,
  BIG_FORMULA_ALL_NAT,
  BIG_FORMULA_GRID_NAT,
  BIG_FRIEND_FORMULAS,
} from "../components/e11/BigFriendFormulaList";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { FormulaStrip, STRIP_NAT } from "../components/e07/FormulaStrip";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import { rodX } from "../stage/geometry";
import type { Scene as BaseScene } from "../stage/types";
import { WORLDS } from "../data/theme";
import { BB_RIGS } from "../data/bbworlds";
const RIG_FARM = BB_RIGS.farm;
import { FPS } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";
import { HideTextStyle } from "../lib/hideText";


export const AUDIO_SEC = 377.78;
export const E12_FARM_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

interface Scene extends BaseScene {
  toucan?: ToucanMood;
  friends?: { shown: number; active?: number };
  friendsArriving?: boolean;
  friendsPrev?: { shown: number; active?: number };
  formulas?: { active?: number; stagger?: boolean; only?: boolean; all?: boolean };
  formulasArriving?: boolean;
  /** the BIG FRIEND formula card while it is said and done: first −friend (take away), then +10 (carry); advances at `marks` */
  doing?: { n: number; step: 0 | 1 | 2; marks?: number[] };
  big?: string;
  valueChip?: boolean;
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep };
  spotlightRod?: boolean;
  blinkRod?: boolean;
  /** the "take away X, then carry" combined moves — no hand, no arrow: a pulsing gold glow
   *  behind each rod listed, fading the same way BeadArrow fades as the move settles. */
  combinedGlow?: number[];
  /** the mid-roll like/subscribe card — NOT the episode close, the trick continues right after */
  midSubscribe?: boolean;
}

const CARD_ACCENT = "#B83A0A"; // darkened for the contrast audit

const BASE = 0.94;
const BIG_TOP = 20;
const BIG_SIZE = 80;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

const PORTRAIT_ROOM = { left: 80, right: 220 };

/**
 * What the abacus reads on each phrase, as a combined value 0-19 (ones + 10*tens).
 *
 * p1-4 is a QUICK FLASH back through E11's own sequence (stuck at nine, friend removed, carried)
 * while the recap line is spoken — nothing is "moved" by a taught hand here, it is a memory, so
 * these are all in SILENT_SET below.
 */
const VALUE: Record<number, number> = (() => {
  const v: Record<number, number> = {};
  for (let p = 0; p < PHRASES.length; p++) v[p] = 0;
  v[1] = 9; // "we got completely stuck" — the callback flash
  v[2] = 9; // "do you remember what saved us?"
  v[3] = 9; // "the big friend trick!" — still just NAMING it, not yet shown — held, not cut
  // p4 says the whole fix in one breath ("take away the friend, AND carry to the tens rod"), so
  // it gets ONE resolve (9 -> 10 directly, skipping the mid-point no one hears named) landing on
  // the LAST word ("rod") via the normal (non-silent) moveOn path below — not a silentCut, which
  // used to snap this to 10 at the very first frame of the phrase, before any of it was spoken.
  v[4] = 10;
  for (let p = 5; p < 38; p++) v[p] = 0;
  v[38] = 6; // build six: one lower bead up, then the upper bead down
  v[39] = 6;
  v[40] = 8; // two more lower beads
  for (let p = 41; p < 45; p++) v[p] = 8;
  v[45] = 9; // "do you remember nine plus one?" — the SAME callback, shown again, not just told
  for (let p = 46; p < 50; p++) v[p] = 9;
  for (let p = 50; p < 59; p++) v[p] = 0;
  v[59] = 2; // make two — just two lower beads
  v[60] = 2;
  v[61] = 2;
  v[62] = 10; // take away two, then carry — one combined move, same device E11's own p64 used
  for (let p = 63; p < 65; p++) v[p] = 10;
  for (let p = 65; p < 68; p++) v[p] = 0;
  v[68] = 6; // build six again for the new pair
  for (let p = 69; p < 73; p++) v[p] = 6;
  v[73] = 0; // down comes one lower bead, then up goes the upper bead
  for (let p = 74; p < 80; p++) v[p] = 0;
  v[80] = 10; // carry one bead
  for (let p = 81; p < 95; p++) v[p] = 10;
  for (let p = 95; p < 99; p++) v[p] = 0;
  v[99] = 4; // make four — just four lower beads
  v[100] = 4;
  v[101] = 4;
  v[102] = 10; // take away four, then carry — combined
  for (let p = 103; p < 106; p++) v[p] = 10;
  for (let p = 106; p < 108; p++) v[p] = 0;
  v[108] = 5; // make five — just the upper bead
  for (let p = 109; p < 115; p++) v[p] = 5;
  v[115] = 10; // take it away, then carry — combined
  for (let p = 116; p < 121; p++) v[p] = 10;
  for (let p = 121; p < PHRASES.length; p++) v[p] = 0;
  return v;
})();

const valueAt = (p: number) => VALUE[p] ?? 0;
const digits = (v: number): [number, number] => [v % 10, Math.floor(v / 10) % 10];

/** Callback flashes and hard resets — no taught move happens on these, so no finger, no arrow. */
const SILENT_SET = new Set([1, 5, 45, 50, 65, 95, 106, 121]);

const rig = (p: number) => {
  const d = digits(valueAt(p));
  return Array.from({ length: 5 }, (_, i) => ({
    value: i < 2 ? d[i] : 0,
    focus: i < 2 ? 1 : 0.35,
    chipLower: i < 2 || undefined,
    placeName: i < 2 ? (i === 0 ? "ones" : "tens") : undefined,
  }));
};

/** Same derivation E06/E11 use: direction decides the finger, never the bead. */
const movedRod = (p: number): number | null => {
  if (p === 0 || SILENT_SET.has(p)) return null;
  const to = digits(valueAt(p));
  const from = digits(valueAt(p - 1));
  const moved = [0, 1].filter((i) => to[i] !== from[i]);
  return moved.length === 1 ? moved[0] : null;
};

/**
 * THE FOUR "TAKE AWAY X, THEN CARRY" LINES (p4, p62, p102, p115) each cover BOTH rods in one
 * breath, one phrase. `movedRod` sees two rods change and gives up (returns null), which used to
 * mean NO hand at all — just the beads snapping on their own with an arrow, which is exactly what
 * "bro move actual beads" flagged: a real hand has to be the one doing it, the same as every
 * taught move elsewhere in this episode.
 *
 * The engine only has two hand slots, and one of these four lines (p4, whose ones rod starts at
 * NINE) genuinely needs three sub-moves to fully explain — earth off, heaven off, THEN the tens
 * carry. Three doesn't fit two, so p4 gets the heaven move (the single most legible sign that
 * "nine" has collapsed) plus the tens carry, and its earth beads still slide (with an arrow, no
 * hand) the same instant. The other three (p62 from two, p102 from four, p115 from five) each
 * only ever needed ONE ones-rod sub-move to clear, so both hands go to real, complete moves: the
 * actual removal AND the actual carry, nothing simplified.
 */
// The four "take away X, then carry" lines (p4, p62, p102, p115) move BOTH rods in one phrase.
// A hand was tried here twice — first with a name-chip (read as clutter, two labels for one
// move), then without the chip (still read as two hands crowding the frame for a move that is
// really one continuous idea). Neither reads as clean, so the beads move on their own now, and a
// pulsing gold glow — not a hand, not an arrow — marks which rod is doing something, timed to the
// exact same beat the hand used to land on ("carry").
const COMBINED: Record<number, { rods: number[] }> = {
  4: { rods: [0, 1] },
  62: { rods: [0, 1] },
  102: { rods: [0, 1] },
  115: { rods: [0, 1] },
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
    return {
      digit: down ? "index" : "thumb",
      direction: down ? "down" : "up",
      rod,
      heaven: true,
      dy: down ? undefined : -70,
    };
  }
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod, heaven: false };
  return undefined;
};

/** The second hand, for the two lines where both bead kinds move on the SAME rod at once. */
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

/** Which rod a line is about, for lines with no move of their own. */
const rodFor = (p: number): number => {
  const rod = movedRod(p);
  if (rod !== null) return rod;
  if (p >= 45 && p <= 49) return 0; // the "nine plus one" callback — the ones rod, stuck again
  if (p === 61) return 0; // "eight's friend is two — that's exactly what's already there"
  if (p === 71) return 0; // "the ones rod goes first"
  if (p === 79) return 1; // "now the tens rod gets its turn" — about to
  if (p === 54 || p === 91) return 1; // "...then carry to the tens rod" — the recap lines, no move of their own
  if (p === 101) return 0; // "six's friend is four — and look, that's exactly what's already there"
  if (p === 112 || p === 116) return 0; // "what is five's friend?" / "what number is showing now?"
  return 0;
};

const ANSWER_LINES = [63, 83, 103, 117];
const ANSWER_TEXT: Record<number, string> = {
  63: "2 + 8 = 10",
  83: "6 + 4 = 10",
  103: "4 + 6 = 10",
  117: "5 + 5 = 10",
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

/** The big-friends table, built up one pair per line as they're named, then quizzed. Pair
 *  indices: 0 = one&nine, 1 = two&eight, 2 = three&seven, 3 = four&six, 4 = five&five. */
const FRIENDS: Record<number, NonNullable<Scene["friends"]>> = (() => {
  const out: Record<number, NonNullable<Scene["friends"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["friends"]>) => ps.forEach((p) => (out[p] = v));
  put([9, 10, 11, 12], { shown: 0 });
  put([13, 14, 15], { shown: 1 });
  put([16], { shown: 2 });
  put([17], { shown: 3 });
  put([18], { shown: 4 });
  put([19, 20, 21, 22], { shown: 5 });
  // A question must not light the answer. On "Who is two's friend?" only the "2" tile flashes
  // (NUMBER_FLASH); the whole 2&8 pair lights on "Eight!" — the answer — not before. Same for six.
  put([23], { shown: 5 }); // two's friend? — asked, not answered
  put([24, 25], { shown: 5, active: 1 }); // Eight! Well done.
  put([26], { shown: 5 }); // six's friend? — asked, not answered
  put([27, 28, 29, 30], { shown: 5, active: 3 }); // Four! You have got it...
  // the "you already know three" recap (p50-55) otherwise has NOTHING on screen but a static
  // abacus and a caption for six straight lines — the card comes back, lighting up each pair as
  // it's named, the same device the quiz above already uses.
  put([50], { shown: 5 });
  put([51], { shown: 5, active: 0 }); // nine and one
  put([52], { shown: 5, active: 1 }); // eight and two
  put([53], { shown: 5, active: 2 }); // seven and three
  put([54, 55], { shown: 5 });
  return out;
})();

/**
 * WORD-SYNCED NUMBER HIGHLIGHT — every number tile on the Big Friends card scales up and flashes
 * gold exactly when the narrator says that number, not just whenever its pair is generally being
 * discussed. `sequence` lists the tiles in the order they're actually SPOKEN (which reverses in
 * the recap: "Nine and one" says the second tile first), each tagged with which side of the pair
 * it is — side 0 is always the pair's own first (smaller, except 5&5) number, side 1 the second.
 */
const NUMBER_FLASH: Record<number, { pair: number; sequence: { word: string; side: 0 | 1; nth?: number }[] }> = {
  13: { pair: 0, sequence: [{ word: "one", side: 0 }, { word: "nine", side: 1 }] },
  14: { pair: 0, sequence: [{ word: "one", side: 0 }, { word: "nine", side: 1 }] },
  16: { pair: 1, sequence: [{ word: "two", side: 0 }, { word: "eight", side: 1 }] },
  17: { pair: 2, sequence: [{ word: "three", side: 0 }, { word: "seven", side: 1 }] },
  18: { pair: 3, sequence: [{ word: "four", side: 0 }, { word: "six", side: 1 }] },
  19: { pair: 4, sequence: [{ word: "five", side: 0 }] },
  20: { pair: 4, sequence: [{ word: "five", side: 1 }] },
  51: { pair: 0, sequence: [{ word: "nine", side: 1 }, { word: "one", side: 0 }] },
  52: { pair: 1, sequence: [{ word: "eight", side: 1 }, { word: "two", side: 0 }] },
  53: { pair: 2, sequence: [{ word: "seven", side: 1 }, { word: "three", side: 0 }] },
  // the quiz — the card is up with the pair lit; the SPOKEN number still flashes on its word
  23: { pair: 1, sequence: [{ word: "two's", side: 0 }] },
  24: { pair: 1, sequence: [{ word: "eight", side: 1 }] },
  26: { pair: 3, sequence: [{ word: "six's", side: 1 }] },
  27: { pair: 3, sequence: [{ word: "four", side: 0 }] },
  29: { pair: 3, sequence: [{ word: "four's", side: 0 }, { word: "six", side: 1 }] },
  30: { pair: 3, sequence: [{ word: "six's", side: 1 }, { word: "four", side: 0 }] },
};

/** Resolves NUMBER_FLASH into a live {pair, side, k} for the current frame. `k` snaps to 1 in 2
 *  frames — as close to instant as a transform can read without popping — because the Caption
 *  component's own karaoke word-highlight (Caption.tsx, `track.activeAt`) snaps with ZERO ramp on
 *  the exact same `word.start` frame. An 8-frame ease-in here (the first version) meant the
 *  caption had already fully highlighted the word while the number tile was still scaling up,
 *  which reads as "the number lags the caption" even though both keyed off the identical
 *  timestamp — the fix is matching the caption's own snappiness, not adjusting the timestamp. */
/** Shared resolver: of the spoken-order `sequence`, which entry's word has most recently started
 *  on this frame, and how far into its 2-frame snap it is. `nth` picks a repeated word's Nth
 *  occurrence ("Five plus five" — first five is the top row, second is the addend). */
const spokenNow = <T extends { word: string; nth?: number }>(
  p: number,
  frame: number,
  sequence: T[]
): { step: T; k: number } | undefined => {
  let current: { step: T; at: number } | undefined;
  for (const step of sequence) {
    const at = wordFrameIn(PHRASES[p], step.word, FPS, step.nth ?? 0);
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

/**
 * THE SAME RULE FOR THE SUM CARD. Every number spoken while the column sum is on screen flashes
 * its own row — the top number ("first"), the addend ("second"), or the total ("answer") — on
 * the exact word. `nth` disambiguates "Five plus five": the first "five" is the top row, the
 * second is the addend. "ten" only lands on the answer row on lines where the total is revealed.
 */
type SumRow = "first" | "second" | "answer";
const SUM_FLASH: Record<number, { word: string; row: SumRow; nth?: number }[]> = {
  37: [{ word: "six", row: "first" }, { word: "two", row: "second" }],
  39: [{ word: "six", row: "first" }],
  40: [{ word: "two", row: "second" }],
  58: [{ word: "two", row: "first" }, { word: "eight", row: "second" }],
  59: [{ word: "two", row: "first" }],
  60: [{ word: "two", row: "first" }],
  61: [{ word: "eight's", row: "second" }, { word: "two", row: "first" }],
  63: [{ word: "two", row: "first" }, { word: "eight", row: "second" }, { word: "ten", row: "answer" }],
  66: [{ word: "four's", row: "second" }, { word: "six", row: "first" }],
  67: [{ word: "six", row: "first" }],
  69: [{ word: "four", row: "second" }],
  72: [{ word: "six", row: "first" }],
  83: [{ word: "six", row: "first" }, { word: "four", row: "second" }, { word: "ten", row: "answer" }],
  84: [{ word: "four", row: "second" }],
  98: [{ word: "four", row: "first" }, { word: "six", row: "second" }],
  99: [{ word: "four", row: "first" }],
  100: [{ word: "four", row: "first" }],
  101: [{ word: "six's", row: "second" }, { word: "four", row: "first" }],
  103: [{ word: "four", row: "first" }, { word: "six", row: "second" }, { word: "ten", row: "answer" }],
  108: [{ word: "five", row: "first" }],
  110: [{ word: "five", row: "second" }],
  112: [{ word: "five's", row: "first" }],
  113: [{ word: "five", row: "second" }],
  117: [
    { word: "five", row: "first", nth: 0 },
    { word: "five", row: "second", nth: 1 },
    { word: "ten", row: "answer" },
  ],
};

const sumFlashFor = (p: number, frame: number): { row: SumRow; k: number } | undefined => {
  const seq = SUM_FLASH[p];
  if (!seq) return undefined;
  const hit = spokenNow(p, frame, seq);
  return hit ? { row: hit.step.row, k: hit.k } : undefined;
};

/** The formula strip — ONLY for the two pairs that use a formula actually on the 5-row card
 *  (+4 for 6+4, +5 for 5+5). The two FLIP examples (2+8 is really "+8", 4+6 is really "+6") use
 *  formulas that are not on this card on purpose — see docs/E12_lines.txt's own production note:
 *  growing the card to 9 rows would misrepresent what the card stands for (5 pairs, not 9
 *  directional formulas), so those two examples get the sum card alone, no formula strip. */
const FORMULAS: Record<number, NonNullable<Scene["formulas"]>> = (() => {
  const out: Record<number, NonNullable<Scene["formulas"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["formulas"]>) => ps.forEach((p) => (out[p] = v));
  // the pattern recap (p92-94: "That is all. The friend changes. But ten never does.") — the full
  // card IS that sentence: ALL NINE rows where the friend column changes and "+ 10" never does.
  put([92], { stagger: true, all: true });
  put([93, 94], { all: true });
  put([122], { stagger: true, all: true }); // the closing recap — all nine, none lit
  return out;
})();

/** where a word starts inside its line, as a 0..1 share of the line (drives the lit move on the formula card) */
const markAt = (p: number, w: string) => {
  const ph = PHRASES[p];
  const x = ph.words.find((k) => k.word.toLowerCase().replace(/[^a-z]/g, "") === w);
  return x ? Math.max(0, Math.min(0.95, (x.start - ph.start) / (ph.end - ph.start))) : 0.5;
};

/**
 * THE BIG FRIEND FORMULA CARD, said and DONE (same card and behaviour as E07-E11, titled BIG FRIEND). Friend first: +n = −friend +10. It comes up
 * plain when the friend is NAMED, lights "−friend" while the friend is taken away and "+10" while the bead is carried, and goes plain on the
 * answer lines. All four worked examples get it, including the two flipped ones (+8 = −2 +10, +6 = −4 +10): they are real big-friend formulas,
 * and the card is the one place a child sees which formula the line is using.
 */
const DOING: Record<number, NonNullable<Scene["doing"]>> = (() => {
  const out: Record<number, NonNullable<Scene["doing"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["doing"]>) => ps.forEach((p) => (out[p] = v));
  // the recap of last time's trick, lit as it is said ("Take away the friend, and carry to the tens rod.")
  put([4], { n: 0, step: 0, marks: [markAt(4, "take"), markAt(4, "carry")] });
  // 6 + 4: four's friend is six
  put([66, 67, 68, 69, 70, 71], { n: 4, step: 0 });
  put([72, 73, 74, 75, 76, 77, 78], { n: 4, step: 1 });
  put([79, 80, 81], { n: 4, step: 2 });
  put([82, 83, 84], { n: 4, step: 0 });
  // 2 + 8 (flipped): eight's friend is two
  put([61], { n: 8, step: 0 });
  put([62], { n: 8, step: 0, marks: [markAt(62, "take"), markAt(62, "carry")] });
  put([63, 64], { n: 8, step: 0 });
  // 4 + 6 (flipped): six's friend is four
  put([101], { n: 6, step: 0 });
  put([102], { n: 6, step: 0, marks: [markAt(102, "take"), markAt(102, "carry")] });
  put([103, 104, 105], { n: 6, step: 0 });
  // 5 + 5 (your turn): five is its own friend, named at "Five!"
  put([113, 114], { n: 5, step: 0 });
  put([115], { n: 5, step: 0, marks: [markAt(115, "take"), markAt(115, "carry")] });
  put([116, 117, 118, 119, 120], { n: 5, step: 0 });
  return out;
})();

// `step` picks which ROW the card lights: "first" = the sentence right now is about the number
// already on the rod, "second" = it is about the number being ADDED (asking to add it, building
// it, executing the friend trick to make room for it — all of that is the b-row's story),
// "answer" = the reveal. Ported from E13's audit: it tracks the SCRIPT line by line, not a fixed
// "setup then execute" phase, and is cross-checked against SUM_FLASH (the per-word flash, which
// already tags each spoken number by row) the same way E13's was — where a phrase has a flash
// entry, its step here matches the flash's own row.
const SUMS: Record<number, NonNullable<Scene["sum"]>> = (() => {
  const out: Record<number, NonNullable<Scene["sum"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["sum"]>) => ps.forEach((p) => (out[p] = v));
  const D = { a: 6, b: 2, op: "+" }; // the direct case — no trick needed
  put([37], { ...D, step: "none" }); // "Six plus two." — no number BUILT yet
  put([38], { ...D, step: "first" }); // builds six (VALUE[38] = 6)
  // p39 "That makes six." still names/confirms the STARTING number (SUM_FLASH[39] tags "six" as
  // row first) — it was grouped with p40 as "second" before, which fought its own flash tag.
  put([39], { ...D, step: "first" });
  put([40], { ...D, step: "second" }); // "Now push two more lower beads." — building on b=2 (SUM_FLASH[40]: two/second)
  put([41, 42, 43, 44], { ...D, total: 8, step: "answer" });

  const E = { a: 2, b: 8, op: "+" }; // the flip of 8+2
  // p58 "Two and eight." announces the problem and is immediately followed by a dedicated
  // "make two" build line (p59) — same template as "Let us try twelve take away three."/"Make
  // thirteen." in E13, which the user named as its own "first" example. Was "none" before.
  put([58], { ...E, step: "first" });
  put([59, 60], { ...E, step: "first" }); // builds a=2 (SUM_FLASH: two/first)
  // p61 "Eight's friend is two — and that is exactly what is already there." names both; SUM_FLASH
  // tags it "eight's"→second THEN "two"→first, in spoken order, so the row it settles on for the
  // whole line is "first" (matches p59-60, no travel needed). Was grouped with p62 as "second"
  // before — a real mismatch, since the line's own flash never lands on "second" here at all.
  put([61], { ...E, step: "first" });
  put([62], { ...E, step: "second" }); // "Take away two, then carry..." — executing b=8's addition
  put([63, 64], { ...E, total: 10, step: "answer" });

  const G = { a: 6, b: 4, op: "+" }; // the new pair, taught in full
  // p66 "Four's friend is six." ends on "six" (the STARTING number about to be built) and p67
  // "Let us make six." is literally the same "Make X" template as "Make thirteen." — both
  // "first". Was "none" before.
  put([66, 67], { ...G, step: "first" });
  put([68], { ...G, step: "first" }); // builds six
  put([69, 70, 71], { ...G, step: "second" }); // "we want to add four" / rule / "ones rod goes first"
  // p72 "So take away six." executes the trick — but SUM_FLASH[72] tags "six" as row FIRST, not
  // second: this flip example's friend-subtraction amount (6) happens to equal a's own value, so
  // the spoken "six" refers to the TOP row emptying, not the addend. p73-76 keep describing that
  // same emptying (down to "the ones rod shows zero", "Oh! Zero already?") — still the top row's
  // story. This whole stretch was folded into the single "second" block before, contradicting
  // p72's own flash tag.
  put([72, 73, 74, 75, 76], { ...G, step: "first" });
  // p77 "Do not worry." pivots toward the carry that actually finishes adding b=4.
  put([77, 78, 79, 80, 81, 82], { ...G, step: "second" });
  put([83, 84], { ...G, total: 10, step: "answer" });

  const H = { a: 4, b: 6, op: "+" }; // the flip of 6+4
  // p98 "Four plus six." — same announce-then-build template as p58/p66; was "none" before.
  put([98, 99, 100, 101], { ...H, step: "first" }); // builds four; p101 mirrors E's p61 and was
  // ALREADY grouped as "first" here — matches SUM_FLASH[101]'s own last-spoken tag ("four"), so
  // this one didn't have the bug E's p61 had.
  put([102], { ...H, step: "second" }); // "take away four, then carry" — single combined line, completes b=6
  put([103, 104, 105], { ...H, total: 10, step: "answer" });

  const J = { a: 5, b: 5, op: "+" }; // your turn — the self-friend
  put([106, 107], { ...J, step: "none" }); // no number named yet
  put([108, 109], { ...J, step: "first" }); // builds five (SUM_FLASH[108]: five/first)
  // p110 "Then add five." names the ADDEND outright (SUM_FLASH[110]: five/second) — was grouped
  // into the big "first" block before, the same class of bug as E13's "Take away nine."
  put([110, 111], { ...J, step: "second" });
  // p112 "What is five's friend?" — SUM_FLASH[112] tags "five's" as row FIRST: the question
  // points back at the row that's already built (asking "does it have a partner?"), then p113
  // "Five!" answers by lighting the SECOND row (SUM_FLASH[113]: five/second) — a question-then-
  // answer device, row first then row second, same shape as the friends-card Q&A elsewhere.
  put([112], { ...J, step: "first" });
  put([113, 114], { ...J, step: "second" }); // the answer, then commentary right after it
  put([115, 116], { ...J, step: "second" }); // total stays unset — "?" — through the reveal pause
  put([117, 118, 119, 120], { ...J, total: 10, step: "answer" });
  return out;
})();

const SUM_FIRST = new Set(
  Object.keys(SUMS)
    .map(Number)
    .filter((p) => !SUMS[p - 1])
);

/** Ported from E13's audit: a naive `SUMS[p - 1]` lookback breaks across any gap where another
 *  card borrows the slot, even when the SAME example is still on screen a few lines later —
 *  `prevStep` falls back to "none" and an already-lit row fades and re-lights from scratch. Walk
 *  back to the nearest PRECEDING entry for the *same* example (matching a/b/op) regardless of
 *  the gap; a different example (a genuine new sum replacing the old one) still falls back to
 *  "none". As it happens E12's five examples never leave an internal gap in `SUMS` (the friends
 *  card only ever appears in the front-loaded intro/quiz and the between-examples recap, never
 *  mid-example — see `coexist` below), so this never actually has a gap to walk back across
 *  today; it is here for the same correctness reason and so a future mid-example friends beat
 *  does not silently reintroduce the E13 bug. */
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

const HEADLINE: Record<number, string> = {
  0: "welcome back, friends!",
  9: "meet the five friends",
  33: "not always!",
  37: "do we need the trick?",
  45: "remember this?",
  56: "it flips, too!",
  87: "the pattern",
  95: "flip it: four and six",
  106: "your turn",
  121: "all five big friends",
};

const isWorking = (p: number) => p >= 1 && p <= 4;

/** Lines about a rod that don't move a bead on it — the same breathing-badge-plus-chevron device
 *  E11 built, reused verbatim via `spotlightRod`. */
// p1-2 ("we got completely stuck") is the SAME callback beat as p45-48 ("do you remember nine
// plus one... we pushed, and pushed") — that later one was already spotlighted; this, its first
// telling, had been missed.
// Every line that NAMES a rod without moving a bead on it. The four combined carries (4, 62, 102,
// 115) are deliberately absent — their gold glow already marks both rods on those lines.
const SPOTLIGHT_ROD = new Set([1, 2, 34, 35, 44, 45, 46, 47, 48, 54, 61, 71, 74, 79, 90, 91, 101, 112, 116]);

/** "Not one bead, anywhere on the rod." — the SAME blink-the-beads device E11 used, played again
 *  here because the line is deliberately echoing E11's own words. */
const BLINK_SET = new Set([48]);

/**
 * WHAT THE TOUCANS ARE DOING. Both birds share one mood per line — same simplification E11's
 * single elephant made — except `highfive` reads as an INTERACTION precisely because two bodies
 * play it at once, beaks reaching for each other. Played on every line a pair is named or
 * confirmed as friends, and on both "combined snap" carry moves (p62, p102, p115), where there is
 * no finger hand to carry the telling and the toucans' own gesture is the only thing that shows it.
 */
const TOUCAN: Record<number, ToucanMood> = (() => {
  const t: Record<number, ToucanMood> = {};
  const put = (ps: number[], m: ToucanMood) => ps.forEach((p) => (t[p] = m));
  put([0], "wave");
  put([1, 2], "worry"); // "we got completely stuck" — the callback
  put([3], "highfive"); // "the big friend trick!" — the happy recall
  put([4], "point");
  put([5, 6, 7, 8], "perch");
  put([9, 10, 11, 12], "point");
  put([13, 14], "point");
  put([15], "highfive"); // "so they are friends"
  put([16, 17, 18], "highfive"); // each pair confirmed, one after another
  put([19, 20], "highfive"); // "and five and... five!"
  put([21], "point");
  put([22], "point");
  put([23], "think");
  put([24, 25], "cheer");
  put([26], "think");
  put([27, 28, 29, 30], "cheer");
  put([31], "think"); // "Now, careful here." — leaning in, considering
  put([32, 33, 34, 35, 36], "point"); // the rule, spoken with emphasis — spotlightRod (34, 35) and the headline (33) carry the rest of the visual load this stretch needs
  put([37, 38, 39, 40], "perch");
  put([41, 42, 43, 44], "cheer");
  put([45, 46, 47, 48], "worry"); // the SAME stuck feeling, remembered
  put([49], "point");
  put([50, 51, 52, 53, 54, 55], "point");
  put([56, 57], "highfive"); // "here is something neat — it works flipped around too"
  put([58, 59, 60], "point");
  put([61], "highfive"); // "that is exactly what is already there"
  put([62], "highfive"); // the combined take-away-and-carry — no finger hand, this IS the move
  put([63, 64], "cheer");
  put([65], "perch");
  put([66, 67, 68], "point");
  put([69, 70, 71, 72], "point");
  put([73, 74], "point");
  put([75, 76], "worry"); // "oh! zero already?" — a small startled beat
  put([77, 78], "perch");
  put([79], "point");
  put([80], "highfive"); // the carry lands — beaks touch on the beat
  put([81, 82, 83, 84], "cheer");
  put([85, 86], "wave");
  put([87, 88, 89, 90, 91, 92, 93, 94], "point");
  put([95, 96, 97], "highfive"); // "it works the other way round too"
  put([98, 99, 100, 101], "point");
  put([102], "highfive"); // the second combined carry
  put([103, 104, 105], "cheer");
  put([106, 107, 108, 109, 110, 111], "point");
  put([112], "think");
  put([113, 114], "highfive"); // "a number really can be its own friend"
  put([115], "highfive");
  put([116], "think");
  put([117, 118, 119, 120], "cheer");
  put([121, 122], "wave");
  put([123, 124, 125], "point");
  put([126, 127], "wave");
  return t;
})();

const toucanFor = (p: number, hand: Scene["hand"], hand2: Scene["hand2"]): ToucanMood | undefined => {
  const want = TOUCAN[p];
  if (!want) return undefined;
  // defer to a finger hand — including the four COMBINED lines now that THEY have real hands
  // too (hand2 sits right where the toucans stand, on the tens rod), same rule as everywhere
  // else in the series: when a hand is actually performing the move, it is the one thing telling
  // it, and the mascot stands down rather than compete for the same beat.
  if (hand || hand2) return undefined;
  return want;
};

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
    // The four COMBINED lines each describe TWO actions in one four-second breath ("take away
    // the friend, AND carry to the tens rod") but the engine only gives one settle window per
    // phrase — anchored to "$last" ("rod"), that window sat in the FINAL third of a second,
    // leaving three-plus seconds where an arrow already pointed at a bead that had not actually
    // moved yet: an arrow with nothing happening under it. Anchoring to "carry" instead lands the
    // whole snap roughly where the carry is actually being said, not after the line is already over.
    moveOn:
      !SILENT_SET.has(p) && valueAt(p) !== valueAt(p - 1)
        ? COMBINED[p]
          ? "carry"
          : "$last"
        : undefined,
    silentCut: SILENT_SET.has(p),
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
    friends: FRIENDS[p],
    formulas: FORMULAS[p],
    doing: DOING[p],
    friendsArriving: FRIENDS[p] !== undefined && FRIENDS[p - 1]?.shown !== FRIENDS[p]?.shown,
    friendsPrev: FRIENDS[p - 1],
    formulasArriving: FORMULAS[p] !== undefined && FORMULAS[p - 1] === undefined,
    big: ANSWER_TEXT[p],
    valueChip: isWorking(p) && !ANSWER_TEXT[p],
    headline: HEADLINE[p],
    spotlightRod: SPOTLIGHT_ROD.has(p),
    blinkRod: BLINK_SET.has(p),
    combinedGlow: COMBINED[p]?.rods,
    sum: SUMS[p],
    toucan: toucanFor(p, hand, hand2),
    midSubscribe: p === 85 || p === 86,
  };

  if (p <= 8) return { ...base, world: "farmA" };
  if (p <= 30) return { ...base, world: "farmB" };
  if (p <= 49) return { ...base, world: "farmB" };
  if (p <= 65) return { ...base, world: "farmC" };
  // the mid-roll like/subscribe ask: the abacus, cards and toucans all step off — just the two
  // buttons over a washed world, same treatment E11's own subscribe beat gets
  if (p === 85 || p === 86) {
    return {
      ...base,
      world: "farmB",
      closing: true,
      worldWash: 0.55,
      sum: undefined,
      formulas: undefined,
      doing: undefined,
      friends: undefined,
      toucan: undefined,
      valueChip: false,
      spotlightRod: false,
      combinedGlow: undefined,
    };
  }
  if (p <= 86) {
    return {
      ...base,
      world: "farmB",
      celebrate: p === 83 || p === 84 ? ("burst" as const) : base.celebrate,
    };
  }
  if (p <= 94) return { ...base, world: "farmC" };
  if (p <= 105) return { ...base, world: "farmC" };
  if (p <= 120) {
    return {
      ...base,
      world: "farmB",
      celebrate: p === 117 || p === 118 ? ("party" as const) : base.celebrate,
    };
  }

  // -------------------------------------------------------------------- CLOSE (duskfarewell)
  //   p121-122  content: the formula recap
  //   p123-125  the store flow
  //   p126-127  the next-episode teaser
  if (p <= 122) return { ...base, world: "farmD" };
  if (p <= 125) {
    return {
      ...base,
      world: "farmD",
      closing: true,
      closeBeat: "store",
      worldWash: 0.55,
      valueChip: false,
      friends: undefined,
      formulas: undefined,
      doing: undefined,
      toucan: undefined, // the store phone + badges own the frame: the friends stood on top of the App Store / Google Play badges
      noCaption: p === 124 || p === 125,
    };
  }
  return {
    ...base,
    world: "farmD",
    closing: true,
    closeBeat: "next",
    worldWash: 0.55,
    valueChip: false,
    friends: undefined,
    formulas: undefined,
    doing: undefined,
    toucan: undefined,
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

/** the phrase where the big friend is first mentioned ("The big friend trick!"): Tenzo, his tag and crown are off stage until then; only Pip (ME) before */
const FRIEND_INTRO = 3;
const friendEnter = (p: number, bp: number) => (p < FRIEND_INTRO ? 0 : p === FRIEND_INTRO ? Math.min(1, bp * 4) : 1);
const friendCrown = (p: number, bp: number) => (p < FRIEND_INTRO ? 0 : p === FRIEND_INTRO ? Math.max(0, Math.min(1, (bp - 0.3) * 3)) : 1);

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

  // the recap flash, p1-4 — SFX chosen for what the WORD says, not a generic click: a rueful
  // "uh oh" right on "stuck", then the trick's own reveal sting right on "trick!"
  add(on(1, "stuck"), "stuck_uhoh.mp3", 40, 0.28);
  add(on(3, "trick"), "friend_sparkle.mp3", 50, 0.3);
  add(at(45), "nope.mp3", 40, 0.3); // "do you remember..." — the SAME denied sound, remembered

  // EVERY expressive line gets a sound that says what the WORD says — chosen off the script's
  // own language, not a generic click. Exclamations, questions, reveals, reassurances.
  // "Hello again!" — the greeting's pop lands on "again", NOT at(0). at(0) is frame 0 of the
  // episode, which after merge_intro.sh is 35 ms past the intro→episode seam: a bright 4-burst
  // transient right there read as "noise at the join" (user, 2026-09-23). Nothing percussive
  // may sit in the first ~150 ms of any episode for the same reason.
  add(on(0, "again"), "cta_pop.mp3", 30, 0.26);
  add(on(8, "go"), "count_hook.mp3", 40, 0.26); // "Let us go."
  for (const i of [12, 36, 111]) add(at(i), "tick.mp3", 20, 0.22); // "Look." / "Watch." / "Think."
  add(at(20), "reveal5.mp3", 50, 0.3); // "...five!" — the self-friend reveal
  for (const i of [24, 27, 113]) add(at(i), "quiz_chirp.mp3", 40, 0.3); // the quiz answers: "Eight!" "Four!" "Five!"
  for (const i of [25, 119]) add(at(i), "count_bell.mp3", 46, 0.28); // "Well done."
  add(at(41), "finger_chime.mp3", 40, 0.3); // "Done!"
  add(on(48, "one"), "stuck_final.mp3", 46, 0.26); // "Not one bead, anywhere on the rod."
  add(on(49, "friend"), "friend_sparkle.mp3", 50, 0.28); // "...that is when we call a big friend." — echoes p3
  for (const i of [56, 95]) add(at(i), "reveal.mp3", 50, 0.28); // "Here is something neat."
  add(at(75), "boing.mp3", 26, 0.24); // "Oh!"
  add(at(77), "reassure.mp3", 46, 0.28); // "Do not worry."
  for (const i of [4, 62, 80, 102, 115]) add(on(i, "carry"), "count_carry.mp3", 40, 0.24); // every carry, on the word
  add(on(94, "never"), "bead_recap_sting.mp3", 50, 0.26); // "But ten never does." — the pattern's closing sting
  // keyed to the expression tags in docs/E12_lines_expressive.txt
  add(on(46, "pushed"), "stuck_weary.mp3", 46, 0.24); // [dramatic] "We pushed, and pushed..."
  for (const i of [82, 117]) add(at(i), "count_fanfare.mp3", 60, 0.26); // [triumphant] "Ten!" / "Five plus five is ten!"
  add(at(121), "count_full.mp3", 60, 0.24); // [proud] "So now you know all five big friends"
  for (const i of [23, 26, 88, 116]) add(at(i), "quiz_chirp.mp3", 36, 0.2); // [curious] the questions themselves, softer than the answers

  // each big friend pair arriving
  for (const i of [13, 16, 17, 18, 19]) add(at(i) + 4, "tick.mp3", 20, 0.26);

  // the toucans' beaks touching, every highfive beat
  for (let i = 0; i < PHRASES.length; i++) {
    const sc = sceneFor(i);
    if (sc.toucan === "highfive" && sceneFor(i - 1)?.toucan !== "highfive") {
      add(at(i) + 4, "tick.mp3", 22, 0.2);
    }
  }
  // a clap whenever the toucans start cheering
  for (let i = 0; i < PHRASES.length; i++) {
    const sc = sceneFor(i);
    if (sc.toucan === "cheer" && sceneFor(i - 1)?.toucan !== "cheer") {
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

  // ---- NEW SOUNDS (same set as E07-E11): Tenzo's arrival, the BIG FRIEND card and its lit moves
  const span = (i: number) => sec(PHRASES[i].end, FPS) - at(i);
  add(at(FRIEND_INTRO) + 4, "cta_pop.mp3", 10, 0.3);
  add(at(FRIEND_INTRO) + span(FRIEND_INTRO) * 0.34, "friend_sparkle.mp3", 18, 0.3);
  for (const i of [0, 9, 33, 37, 45, 56, 87, 95, 106, 121]) add(at(i) + 2, "swipe.mp3", 11, 0.2);
  for (const i of Object.keys(DOING).map(Number).sort((a, b) => a - b)) {
    const d = DOING[i];
    const q = DOING[i - 1];
    const final = q && q.n === d.n ? Math.min(2, q.step + (q.marks?.length ?? 0)) : -1;
    if (final === -1) add(at(i) + 3, "cta_pop.mp3", 10, 0.26);
    else if (d.step !== final && d.step > 0) add(at(i) + 3, "tick.mp3", 6, 0.34);
    for (const m of d.marks ?? []) if (m > 0.05) add(at(i) + span(i) * m, "tick.mp3", 6, 0.34);
  }

  // standard close SFX
  add(at(2) + 6, "boing.mp3", 26, 0.2);

  const rate = STORE_FRAMES / 136;
  add(STORE_START + 50 * rate, "btn_click.mp3", 20, 0.28);
  add(STORE_START + 92 * rate, "btn_click.mp3", 20, 0.3);
  add(STORE_START + 136 * rate - 8, "play_win.mp3", 60, 0.26);
  const nextIdx = PHRASES.map((x) => x.index).find((i) => sceneFor(i).closeBeat === "next");
  if (nextIdx !== undefined) add(at(nextIdx), "swipe.mp3", 16, 0.24);
  return cues;
})();

/** Ground-anchored: (x,y) is the point BETWEEN the two toucans' feet — each bird's own anchor
 *  sits `gap/2` either side of it, facing inward so `highfive` always reaches toward its partner. */
const TOUCAN_BOX = { up: CAST_BOX.up * OT_K, down: CAST_BOX.down, half: pairHalf(2) };

const toucanPairAt = (
  box: { left: number; w: number; top: number; h: number; scale: number },
  L: { W: number; H: number; portrait: boolean },
  closing = false,
  aside = false,
  crowded = false,
  nextVideo = false
) => {
  // gap is tuned against the beak geometry in Toucan.tsx: each beak reaches ~70 local units from
  // its own anchor at rest and ~122 at full `highfive` reach, so a half-gap around 85 leaves a
  // small resting gap and a real touch only when both actually reach for it. `crowded` — ported
  // from E13's squirrel treatment — shrinks and drops the pair for any line where the friends
  // card sits beside the sum card instead of replacing it (see `coexist`); E12's script never
  // currently produces that combination (see `coexist`'s own comment), so this is unused today
  // but kept in step with E13 for whenever it does.
  if (closing) {
    const scale = L.portrait ? 0.9 : 1.15;
    return { x: L.W - pairHalf(2) * scale - 40, y: L.portrait ? L.H * (nextVideo ? 0.86 : 0.79) : 826, scale, gap: 0 }; // landscape feet at 826 (tags clear the caption by 24 px)
  }
  if (L.portrait) {
    const scale = box.scale * (aside ? 0.45 : 0.5);
    return {
      x: aside ? L.W - TOUCAN_BOX.half * scale - 40 : L.W / 2,
      y: box.top + box.h + 120 + 366 * scale,
      scale,
      gap: 0,
    };
  }
  const scale = castFit(box, L, box.scale * 0.95, TOUCAN_BOX.half, 130) * (crowded ? 0.5 : 1);
  return {
    x: box.left + box.w + 130 + TOUCAN_BOX.half * scale,
    y: box.top + box.h + 16 + (crowded ? 40 : 0),
    scale,
    gap: 0,
  };
};

/** In portrait the nine-formula GRID card spans the whole card band (819 px of 1080) — there is
 *  no room beside it, and on those lines the card is the content, so the pair steps off. */
const toucansOn = (scene: Scene, portrait: boolean) =>
  Boolean(scene.toucan) && !(scene.formulas?.all && portrait);

const toucanPairRect = (m: { x: number; y: number; scale: number; gap: number }) => castRect(m, 2);

// PORTRAIT SCALES ARE PINNED BY THE 240 px CARD BAND (layout.ts PORTRAIT_BANDS), not chosen:
// each card is scaled to sit ~12 px inside it. The nine-formula card is the one that cannot be
// made readable that way (516 tall → 13 px type), so in portrait it becomes a 3×3 grid instead.
const SUM_S = (portrait: boolean) => (portrait ? 0.7 : 0.78);
const CARD_GAP = 18;

/** Ported from E13: true whenever the friends card and the sum card should coexist rather than
 *  share one slot, so the sum card doesn't vanish mid-explanation. Landscape only. E12's own
 *  `FRIENDS` table only ever fires in the front-loaded five-pair intro/quiz (p9-30) and the
 *  between-examples recap (p50-55) — both sit in gaps BEFORE `SUMS` starts (p37) or BETWEEN two
 *  worked examples, never inside one — so `scene.sum && scene.friends` is never simultaneously
 *  true anywhere in this episode today (checked against every `FRIENDS` and `SUMS` phrase
 *  range). This is here, wired up and tested, for the day a mid-example friends-lookup is added
 *  to this episode the way E13 has one, rather than something that would need rebuilding from
 *  scratch then. */
const coexist = (scene: Scene, portrait: boolean) => !portrait && Boolean(scene.sum && scene.friends);

/** The friends card's own slot when it is sharing the frame with the sum card: upper-right,
 *  clear of the abacus and (after the toucans shrink and drop for this same beat) clear of
 *  them too. Full normal scale — E13 initially shrank this and the user asked for it back to
 *  size once the actual available space was checked; same scale here from the start. */
const FRIENDS_ASIDE_SCALE = 0.84;
const friendsAsideSlot = (L: { W: number; band: { stageTop: number } }) => {
  const scale = FRIENDS_ASIDE_SCALE;
  return { x: L.W - BIG_FRIENDS_NAT.w * scale - 40, y: L.band.stageTop + 4, scale };
};

/** The de-emphasis for whichever card is NOT the one the line is actually about, while both are
 *  up at once — dimmed and very slightly shrunk (anchored top-left), same treatment as E13. */
const DIM_CARD: React.CSSProperties = {
  opacity: 0.4,
  filter: "saturate(0.5)",
  transform: "scale(0.94)",
  transformOrigin: "top left",
};

const cardSize = (scene: Scene, portrait: boolean) => {
  // While the friends card sits ASIDE (see `coexist`), the sum card is still the one anchored
  // in the usual slot — the friends card gets its own independent slot below, not this one.
  if (scene.sum && coexist(scene, portrait)) return { nat: COL_NAT, scale: SUM_S(portrait) };
  if (scene.friends) return { nat: BIG_FRIENDS_NAT, scale: portrait ? 0.68 : 0.84 };
  if (scene.formulas?.all) {
    return portrait
      ? { nat: BIG_FORMULA_GRID_NAT, scale: 1.05 }
      : { nat: BIG_FORMULA_ALL_NAT, scale: 0.72 };
  }
  if (scene.formulas) return { nat: BIG_FORMULA_NAT, scale: portrait ? 0.5 : 0.8 };
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

/** THE SUM CARD ALWAYS SITS IN ONE PLACE (top of the left column; 4:5: left of the card band) and the BIG FRIEND card goes directly under it
 *  (4:5: beside it), so neither jumps between lines. The teaching tables (friends / full formulas) keep the old centred slot. */
const sumFixedSlot = (L: { portrait: boolean; band: { stageTop: number }; cardBand: { top: number } | null }) =>
  L.portrait ? { x: 34, y: L.cardBand!.top + 8 } : { x: 44, y: L.band.stageTop + 34 };
const STRIP_S = (portrait: boolean) => (portrait ? 0.95 : 1.1);
const stripSlotE12 = (
  L: { portrait: boolean; band: { stageTop: number; stageBottom: number }; cardBand: { top: number } | null },
  withSum: boolean
) => {
  const s = STRIP_S(L.portrait);
  const w = STRIP_NAT.w * s;
  const h = STRIP_NAT.h * s;
  // 4:5: beside the sum card when there is one; with no sum (the recap line) the card takes the left of the band
  if (L.portrait) return { x: withSum ? 34 + COL_NAT.w * SUM_S(true) + 16 : 34, y: L.cardBand!.top + 8, w, h };
  if (withSum) return { x: 44, y: L.band.stageTop + 34 + COL_NAT.h * SUM_S(false) + 18, w, h };
  return { x: 44, y: L.band.stageTop + (L.band.stageBottom - L.band.stageTop - h) / 2, w, h };
};

export const E12FarmMarket: React.FC = () => (
  <>
  <HideTextStyle />
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e012_all_five_big_friends/E12.mp3"
    sfx={SFX_CUES}
    music={{ file: "lesson_bed.wav", loopFrames: 800, vol: 0.12 }}
    abacusFirstFrame={0}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_FARM}
    placeCard
    brandDark
    neatHands
    placeLabelHalo={() => true}
    chipInk="#06222C"
    countInk="#06222C"
    labelInk={["#06222C", "#06222C", "#06222C", "#06222C", "#06222C"]}
    captionComing={{ coming: "#5F7385", keyComing: "#A8441F" }}
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
        out.push({ label: "valueChip", r: { x: (L.W - 260) / 2, y: 24, w: 260, h: 108 } });
      }
      const card = cardSize(scene, L.portrait);
      if (card) {
        const w = card.nat.w * card.scale;
        const h = card.nat.h * card.scale;
        const sumOnly = Boolean(scene.sum && !scene.friends && !scene.formulas);
        out.push({ label: "teachCard", r: { ...(sumOnly ? sumFixedSlot(L) : cardSlot(L, w, h)), w, h } });
      }
      if (scene.doing) out.push({ label: "doing", r: stripSlotE12(L, scene.doing.n > 0) });
      const crowded = coexist(scene, L.portrait);
      if (crowded) {
        const slot = friendsAsideSlot(L);
        out.push({
          label: "friendsAside",
          r: { x: slot.x, y: slot.y, w: BIG_FRIENDS_NAT.w * slot.scale, h: BIG_FRIENDS_NAT.h * slot.scale },
        });
      }
      const toucanAside = Boolean(L.portrait && !scene.closing && card);
      if (toucansOn(scene, L.portrait)) {
        const m = toucanPairAt(ctx.box, L, Boolean(scene.closing), toucanAside, crowded, scene.closeBeat === "next");
        out.push({
          label: "toucans",
          r: toucanPairRect(m),
          mayExitFrame: true,
        });
      }
      return out;
    }}
    renderOver={(scene, ctx) => (
      <>
        {/* THE ROD SPOTLIGHT — breathing badge + bouncing chevron, reused verbatim from E11 */}
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

        {/* "Not one bead, anywhere on the rod." — reused verbatim from E11, the same device,
            because this line is deliberately echoing E11's own words. */}
        {scene.blinkRod && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
          >
            {(() => {
              const cx = rodX(ctx.box, 0);
              const s = ctx.box.scale;
              const beadCenters = [91.5, 168.5, 229.5, 290.5, 351.5];
              const t = ctx.frame / FPS;
              const on = (t * 2.5) % 1 < 0.5;
              const opacity = on ? 0.65 : 0.08;
              return beadCenters.map((by, i) => (
                <circle key={i} cx={cx} cy={ctx.box.innerTop + by * s} r={30 * s} fill="#FFFFFF" opacity={opacity} />
              ));
            })()}
          </svg>
        )}

        {/* THE "TAKE AWAY X, THEN CARRY" GLOW — a hand was tried here twice (with a name-chip,
            then without) and both still read as clutter for a move that is really one
            continuous idea. This replaces it: a soft pulsing gold glow behind each rod that's
            moving, fading on the exact same curve BeadArrow's own arrows already fade on, so it
            reads as "this one, right now" without a hand or a fresh visual language to learn. */}
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

        {scene.closeBeat === "next" && <Twinkles frame={ctx.frame} W={ctx.layout.W} H={ctx.layout.H} />}
        {/* THE FARM'S EDGE FRIENDS: a pig (bottom-left) and a chick (far right) */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const t = scene.toucan;
          const alive = p <= 3 || p >= 122 || t === "cheer" || t === "highfive";
          const unsure = t === "worry" || t === "think";
          const mood = pieceMood(alive, unsure);
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Pieces mood={mood} frame={ctx.frame} fps={FPS} pieces={[
                { kind: "pig", x: 190, y: 905, scale: 0.9, show: !L.portrait && !scene.doing && !scene.sum },
                { kind: "chick", x: 1850, y: 915, scale: 0.7, facing: -1, show: !L.portrait && !scene.closing },
                { kind: "chick", x: 130, y: 300, scale: 0.8, show: L.portrait },
              ]} />
            </svg>
          );
        })()}

        {/* THE TWO TOUCANS */}
        {toucansOn(scene, ctx.layout.portrait) && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            {(() => {
              const card = cardSize(scene, ctx.layout.portrait);
              const m = toucanPairAt(
                ctx.box,
                ctx.layout,
                Boolean(scene.closing),
                Boolean(ctx.layout.portrait && !scene.closing && card),
                coexist(scene, ctx.layout.portrait),
                scene.closeBeat === "next"
              );
              return (
                <>
                  <CastGroup x={m.x} y={m.y} scale={m.scale} actors={[{ role: "little", mood: MOOD[scene.toucan!] }, { role: "big", mood: MOOD[scene.toucan!], enter: friendEnter(ctx.p, ctx.beatProgress), crown: friendCrown(ctx.p, ctx.beatProgress) }]} costume="farmer" look={ctx.layout.portrait ? 1 : -1} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
                </>
              );
            })()}
          </svg>
        )}

        {/* THE BIG FRIENDS TABLE — beside the sum card (see `coexist`) if a future line ever
            puts both up at once, in its own right-side slot instead of the shared teachCard
            one; otherwise the usual shared slot, unchanged. */}
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
              <BigFriendCards ghost dimFloor={0.72}
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

        {/* THE FORMULA CARD — only for the two pairs whose formula is actually on the 5-row card */}
        {scene.formulas && (() => {
          const L = ctx.layout;
          const card = cardSize(scene, L.portrait)!;
          const at = cardSlot(L, card.nat.w * card.scale, card.nat.h * card.scale);
          const left = at.x;
          const top = at.y;
          return (
            <div style={{ position: "absolute", left, top }}>
              <BigFriendFormulaList
                active={scene.formulas.active}
                stagger={scene.formulas.stagger}
                all={scene.formulas.all}
                grid={Boolean(scene.formulas.all && ctx.layout.portrait)}
                arriving={scene.formulasArriving}
                accent={CARD_ACCENT}
                progress={ctx.beatProgress}
                scale={card.scale}
              />
            </div>
          );
        })()}

        {/* THE COLUMN SUM — dimmed while the friends card is beside it and IS the thing the
            line is currently about (see `coexist`/`DIM_CARD`), same treatment as E13. */}
        {scene.doing && (() => {
          const L = ctx.layout;
          const slot = stripSlotE12(L, scene.doing.n > 0);
          const d = scene.doing;
          const step = Math.min(2, d.step + (d.marks ?? []).filter((m) => ctx.beatProgress >= m).length);
          return (
            <div style={{ position: "absolute", left: slot.x, top: slot.y }}>
              <FormulaStrip n={d.n} step={step as 0 | 1 | 2} base={10} accent="#7A1F5C" scale={STRIP_S(L.portrait)} />
            </div>
          );
        })()}

        {scene.sum && (() => {
          const L = ctx.layout;
          const card = cardSize(scene, L.portrait)!;
          const at = coexist(scene, L.portrait) ? cardSlot(L, card.nat.w * card.scale, card.nat.h * card.scale) : scene.friends || scene.formulas ? cardSlot(L, card.nat.w * card.scale, card.nat.h * card.scale) : sumFixedSlot(L);
          const dimmed = coexist(scene, L.portrait);
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
                bg={CARD_ACCENT} placeholderOpacity={0.9}
                progress={ctx.beatProgress}
                scale={card.scale}
              />
            </div>
          );
        })()}

        {/* the live value, above the abacus during the recap flash */}
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
              title={["big friends", "taking away"]}
              example={
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {BIG_FRIEND_FORMULAS.map((f) => (
                    <span
                      key={f.n}
                      style={{
                        fontFamily: KID_FONT,
                        fontWeight: 700,
                        fontSize: 30,
                        color: CARD_ACCENT,
                      }}
                    >
                      {/* friend first, then the ten — E13's own order (−1 = +9 − 10) */}
                      {`−${f.n} = +${10 - f.n} − 10`}
                    </span>
                  ))}
                </div>
              }
            />
          </div>
        )}
      </>
    )}
  />
  </>
);

/** For tools/bb_audit.ts */
export const __audit = { sceneFor, PHRASES, SFX_CUES };
