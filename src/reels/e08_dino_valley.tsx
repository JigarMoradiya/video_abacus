// E08 · DINO VALLEY REMAKE (pilot of the Bead Buddies series, docs/COVE_SERIES_PLAN.md).
// SAME audio, SAME phrase table and timings (src/data/e08.phrases.json), SAME teaching beats, cards, see-saw, abacus tables as the
// delivered E08 below. Changed ONLY: the two puppies become Pip (little otter, left) and Fifi (the small friend, right) in explorer
// hats, the park worlds become the calm Dino Valley (src/components/e08/DinoLayer.tsx), and the abacus gets E15's ink/pill fixes.
// Original E08 header follows.
//
// E08 · All four small friends — 16:9 and 4:5 from one reel.
//
// E07 taught ONE formula and closed by promising all four. This pays that, and the real content is
// not "three more formulas" — E07 never taught WHEN to use the trick, so a child who took it
// literally would use a friend on two plus two. The spine here is the TRIGGER: look at the lower
// beads first, and only call a friend when they run out. The other three formulas hang off it.
//
// Timing from public/audio/e008/E08.phrases.json, aligned from docs/E08_lines.txt.
// 105 lines -> 128 PHRASES, 291.28 s, 100% word match. (Re-recorded once, to fix the formula
// order below — the phrase COUNT and TEXT are identical to the first take, only the timings moved.)
//
// WHAT THIS EPISODE DOES DIFFERENTLY
//
//   · A SEE-SAW, and it is the first teaching device in the series that can be WRONG. E07 answered
//     "every number has a friend" with two cards that snap together; a card cannot fail. Put two
//     and two on a see-saw and it tips, and the child sees that two's friend is not two without
//     being told. It also carries the eight ⏸ holds: on "who is one's friend?" the plank hangs
//     down with a "?" on the light end, so the picture states the question during the silence.
//   · TWO CHARACTERS, for the first time. The episode is about pairs, and one mascot beside a card
//     that says "friends" is a character next to the subject rather than the subject.
//   · THE FORMULA TABLE IS PROMOTED TO THE STAGE for the nine lines where the formulas are the
//     lesson and there is no abacus on screen — and `hilite` lights one COLUMN across all four
//     rows, which is how "the number we take away is always the friend" becomes visible instead of
//     merely stated.
//   · THE LIKE ASK IS MID-ROLL, at p99-100 (77% through) rather than in the close. E02-E07 all put
//     it at 94-96%, which is both the same place every time and the place fewest people are still
//     watching. EPISODE_RULES §3.9a now forbids the old placement.
//   · RIG_PARK — teal frame, sunny orange beads. Seventh distinct instrument.

import React from "react";
import phrasesJson from "../data/e08.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Otter, INK as OTTER_INK, castFit } from "../components/cast";
import { Dino, type DinoMood } from "../components/e08/Dino";
import type { OtterMood } from "../components/cast";
import { rodX } from "../stage/geometry";
import { HideTextStyle } from "../lib/hideText";
type PuppyMood = "sit" | "wave" | "think" | "worry" | "point" | "cheer";
const MOOD: Record<PuppyMood, OtterMood> = { sit: "float", wave: "wave", think: "think", worry: "worry", point: "point", cheer: "cheer" };
// the pair's box at scale 1 (Fifi is the taller of the two)
const PUPPY_BOX = { up: 300, down: 30, half: 96 };
const OT_K = 1.22; // otter scale relative to the pair scale
import { SeeSaw, SEESAW_NAT, type Seat } from "../components/e08/SeeSaw";
import { FormulaBoard, BOARD_NAT } from "../components/e08/FormulaBoard";
import { FormulaList, FORMULA_NAT, FORMULA_ONE, SMALL_FRIENDS } from "../components/e07/FormulaList";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { FormulaStrip, STRIP_NAT } from "../components/e07/FormulaStrip";
import { Abacus, type RodState } from "../components/Abacus";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import type { Scene as BaseScene } from "../stage/types";
import { RIG_DINO, WORLDS } from "../data/theme";
import { FPS, ROD_DIM } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";

export const AUDIO_SEC = 291.28;
export const E08_DINO_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);
const HATCH_AT = sec(PHRASES[47].start, FPS);

interface Scene extends BaseScene {
  /** the pair. One mood each — they are two characters, not one character drawn twice. */
  pups?: { left: PuppyMood; right: PuppyMood };
  /** the see-saw, when it is what is on stage */
  seesaw?: { left: Seat; right: Seat; asking?: "left" | "right"; seal?: boolean };
  seesawPrev?: { left: Seat; right: Seat };
  /** the formula table as the hero, when the formulas are the lesson */
  board?: { upto: number; active?: number; mystery?: boolean; hilite?: "friend" | "five" };
  boardArriving?: boolean;
  /** the small gutter formula strip, beside a live abacus */
  formulas?: { active?: number; only?: boolean; label?: string; stagger?: boolean };
  formulasArriving?: boolean;
  /** the sum in column form */
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep };
  /** the big answer in the headline band */
  big?: string;
  /** the rod's live value above the abacus */
  valueChip?: boolean;
  /** the dashed empty slot where a fifth lower bead would be */
  outOfBeads?: boolean;
  /**
   * THE PERSISTENT REFERENCE — all four formulas, in the right gutter, once the lesson has actually
   * taught them. It was only ever on screen for the six phrases that flash a single title; the rest
   * of the episode a child working the ADD ONE / ADD TWO / ADD FOUR / YOUR TURN sections has nothing
   * to check their formula against. This stays up from the first worked example ("one's friend is
   * four") through the your-turn, with the row IN USE lit — so it is a look-up table, not a flash.
   */
  /** the SMALL FRIEND formula card while the beads do it (n = 0: the general rule); the lit move advances at `marks` */
  doing?: { n: number; step: 0 | 1 | 2; marks?: number[] };
}

const BASE = 1.15;
const BIG_TOP = 20;
const BIG_SIZE = 80;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

/** Room for the puppies on the right in portrait. */
const PORTRAIT_ROOM = { left: 80, right: 190 };

/**
 * WHAT THE ONES ROD READS ON EACH PHRASE.
 *
 * The shape of this table is the episode. Note the long stretch of zero from p8 to p37: the abacus
 * is NOT ON STAGE there. Those thirty phrases are the see-saw and the formula board, because the
 * friends of five are a fact about NUMBERS, not about beads, and §3.5 of the standing brief says
 * not to leave the instrument parked on screen through lines that are not about it.
 */
const VALUE: Record<number, number> = (() => {
  const v: Record<number, number> = {};
  for (let p = 0; p < PHRASES.length; p++) v[p] = 0;
  for (let p = 1; p < 5; p++) v[p] = 4; // the callback: last time we got stuck, on four
  // p5..p43 zero — see-saw, board, and the empty rod for the contrast case
  for (let p = 45; p < 46; p++) v[p] = 2; // 2 + 2, the DIRECT case
  for (let p = 46; p < 50; p++) v[p] = 4;
  // p50 clears — "but now try four plus one" starts from an empty rod
  for (let p = 51; p < 63; p++) v[p] = 4;
  for (let p = 63; p < 70; p++) v[p] = 0; // take away four: the friend of one
  for (let p = 70; p < 77; p++) v[p] = 5; // upper bead down: 4 + 1 = 5
  for (let p = 77; p < 81; p++) v[p] = 4; // clear, make four again
  for (let p = 81; p < 83; p++) v[p] = 1; // take away three
  for (let p = 83; p < 88; p++) v[p] = 6; // upper bead down: 4 + 2 = 6
  // p88 clears
  for (let p = 89; p < 93; p++) v[p] = 3;
  for (let p = 93; p < 95; p++) v[p] = 2; // take away one
  for (let p = 95; p < 109; p++) v[p] = 7; // upper bead down: 3 + 4 = 7, and it holds through
  //                                          the like ask and the pattern recap
  // p109-110 clear for the child's own turn
  for (let p = 111; p < 117; p++) v[p] = 2;
  for (let p = 117; p < 124; p++) v[p] = 5; // 2 + 3 = 5
  return v;
})();

const valueAt = (p: number) => VALUE[p] ?? 0;

/** Lines where the rod changes with no taught move: resets, clears, and the two the CHILD makes. */
const SILENT_SET = new Set([1, 5, 50, 77, 88, 109, 111, 117]);

/** Which phrases have the abacus on stage at all. */
const abacusFrom = (p: number) => p <= 7 || (p >= 38 && p <= 106) || (p >= 109 && p <= 120);

const rig = (p: number): RodState[] =>
  Array.from({ length: 5 }, (_, i) => ({
    value: i === 0 ? valueAt(p) : 0,
    focus: i === 0 ? 1 : ROD_DIM,
  }));

/**
 * WHICH FINGER. Same derivation as E04-E07 — a property of the MOVE, never of the bead: towards the
 * top of the frame is the thumb, downwards is the index finger. Every single move in this episode
 * happens to be an index finger, because the small friend always takes lower beads DOWN and then
 * brings the upper bead DOWN — which is worth knowing but is NOT how it is decided.
 */
const handFor = (p: number): Scene["hand"] => {
  if (p === 0 || SILENT_SET.has(p) || !abacusFrom(p)) return undefined;
  const to = valueAt(p);
  const from = p > 0 ? valueAt(p - 1) : 0;
  if (to === from) return undefined;
  const lowerFrom = from % 5;
  const lowerTo = to % 5;
  if (lowerTo > lowerFrom) return { digit: "thumb", direction: "up", rod: 0, heaven: false };
  if (from >= 5 !== to >= 5) {
    const down = to >= 5;
    return { digit: down ? "index" : "thumb", direction: down ? "down" : "up", rod: 0, heaven: true };
  }
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod: 0, heaven: false };
  return undefined;
};

/** The answers, and the frame each one LANDS on — the first frame of its line's final word. */
const ANSWER_LINES = [47, 73, 85, 97, 117];
const ANSWER_TEXT: Record<number, string> = {
  22: "4",
  25: "3",
  47: "2 + 2 = 4",
  72: "5",
  73: "4 + 1 = 5",
  79: "3",
  84: "6",
  85: "4 + 2 = 6",
  92: "1",
  96: "7",
  97: "3 + 4 = 7",
  117: "2 + 3 = 5",
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

/**
 * THE SEE-SAW per phrase.
 *
 * A pair arrives one seat at a time — the first number lands and the plank drops on that side, then
 * the friend lands and it swings level. That order is the teaching: the child watches the thing be
 * unbalanced before it balances, which is what makes "friend" mean something.
 */
const SEESAW: Record<number, NonNullable<Scene["seesaw"]>> = (() => {
  const o: Record<number, NonNullable<Scene["seesaw"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["seesaw"]>) => ps.forEach((p) => (o[p] = v));
  put([8, 9, 10], { left: null, right: null });
  put([11], { left: 1, right: null }); // "Look." — one lands, the plank drops
  // p12 "One and four." — the friend lands and it swings LEVEL, but no five yet: that word is not
  // spoken until p13, and a seal on p12 answers a question the narration has not asked.
  put([12], { left: 1, right: 4 });
  put([13, 14], { left: 1, right: 4, seal: true });
  put([15], { left: 2, right: 3 });
  put([16, 17], { left: 2, right: 3, seal: true });
  // p18-19 leave the see-saw for the board: "all of them" is TWO pairs, and a see-saw holds one
  put([20], { left: null, right: null });
  put([21], { left: 1, right: "?", asking: "right" });
  put([22, 23], { left: 1, right: 4, seal: true });
  put([24], { left: 2, right: "?", asking: "right" });
  put([25, 26], { left: 2, right: 3, seal: true });
  put([27], { left: 3, right: 2, seal: true });
  put([28], { left: 4, right: 1, seal: true });
  return o;
})();

/**
 * THE FORMULA BOARD per phrase.
 *
 * p29-37 build it a row at a time as each is spoken, with p33 — "now you guess the last one" — held
 * as a "?" across a real three-second silence. p36-37 then light the FRIEND column across all four
 * rows, which is the moment the pattern stops being four sentences and becomes one.
 */
const BOARD: Record<number, NonNullable<Scene["board"]>> = {
  18: { upto: 0 },
  19: { upto: 0 },
  29: { upto: 0 },
  30: { upto: 1, active: 1 },
  31: { upto: 2, active: 2 },
  32: { upto: 3, active: 3 },
  33: { upto: 4, mystery: true },
  34: { upto: 4, active: 4 },
  35: { upto: 4 },
  36: { upto: 4, hilite: "friend" },
  37: { upto: 4, hilite: "friend" },
  // the pattern recap — the same two columns, now as a summary of what was just done four times
  107: { upto: 4, hilite: "friend" },
  108: { upto: 4, hilite: "five" },
  // the close: all four, complete and unhighlighted, because they are all equally the child's now
  121: { upto: 4 },
  122: { upto: 4 },
};

/** p18-19 show BOTH PAIRS rather than the formulas: "that is all of them" is about the pairs. */
const PAIRS_BOARD = new Set([18, 19]);

/**
 * The gutter formula strip, beside a live abacus — the symbol version of the sentence being said.
 * Only on the lines that STATE a rule, never on the lines that work it: on a working line the beads
 * are the thing to watch.
 */
const FORMULAS: Record<number, NonNullable<Scene["formulas"]>> = {};

/**
 * THE PERSISTENT REFERENCE, derived from the SAME table above rather than hand-numbered again —
 * two independent lists of "which phrase highlights which friend" would drift the moment one of
 * them was edited without the other.
 *
 * It starts at p57 ("One's friend is four" — the first time a formula is actually IN USE, not
 * just stated as a rule) and holds through the your-turn. `active` carries forward from the last
 * `FORMULAS` beat until the next one changes it — p4's beat is excluded on purpose: that is the
 * hook, before any specific friend has been named, and starting the reference there would light a
 * row the child has not been told about yet.
 */
/** where a word starts inside its line, as a 0..1 share of the line (drives the lit move on the formula card) */
const markAt = (p: number, w: string) => {
  const ph = PHRASES[p];
  const x = ph.words.find((k) => k.word.toLowerCase().replace(/[^a-z]/g, "") === w);
  return x ? Math.max(0, Math.min(0.95, (x.start - ph.start) / (ph.end - ph.start))) : 0.5;
};

/**
 * THE SMALL FRIEND FORMULA CARD while it is being said and DONE (same slot and behaviour as E07's card): it comes up when the friend is
 * named, and lights the move being made, first "−friend" (take away), then "+5" (upper bead down). It replaces both the old top-centre
 * formula chip and the small reference card that sat beside Fifi's crown.
 */
const DOING: Record<number, NonNullable<Scene["doing"]>> = (() => {
  const out: Record<number, NonNullable<Scene["doing"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["doing"]>) => ps.forEach((p) => (out[p] = v));
  // the hook: the general rule, lit as it is spoken ("Take away a friend, and add five.")
  put([4], { n: 0, step: 0, marks: [markAt(4, "take"), markAt(4, "add")] });
  // four plus one: one's friend is four
  put([59], { n: 1, step: 0 });
  put([60], { n: 1, step: 0, marks: [markAt(60, "take"), markAt(60, "add")] });
  put([61, 62], { n: 1, step: 0 });
  put([63, 64, 65, 66, 67, 68, 69], { n: 1, step: 1 });
  put([70, 71], { n: 1, step: 2 });
  // once the ANSWER is announced the card goes back to the plain formula, nothing lit
  put([72, 73, 74], { n: 1, step: 0 });
  // four plus two: two's friend is three
  put([79], { n: 2, step: 0 });
  put([80], { n: 2, step: 0, marks: [markAt(80, "take"), markAt(80, "add")] });
  put([81, 82], { n: 2, step: 1 });
  put([83], { n: 2, step: 2 });
  put([84, 85], { n: 2, step: 0 });
  // three plus four: four's friend is one
  put([92], { n: 4, step: 0 });
  put([93, 94], { n: 4, step: 1 });
  put([95], { n: 4, step: 2 });
  put([96, 97], { n: 4, step: 0 });
  // "the same two things every time"
  put([103], { n: 0, step: 0 });
  put([104], { n: 0, step: 1 });
  put([105, 106], { n: 0, step: 2 });
  // your turn: two plus three, three's friend is two
  put([115], { n: 3, step: 0, marks: [markAt(115, "take"), markAt(115, "bring")] });
  put([116, 117], { n: 3, step: 0 });
  return out;
})();

/** The column sum, on every worked case. */
const SUMS: Record<number, NonNullable<Scene["sum"]>> = (() => {
  const o: Record<number, NonNullable<Scene["sum"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["sum"]>) => ps.forEach((p) => (o[p] = v));
  const A = { a: 2, b: 2, op: "+" };
  put([44], { ...A, step: "none" });
  put([45], { ...A, step: "first" });
  put([46], { ...A, step: "second" });
  put([47, 48, 49], { ...A, total: 4, step: "answer" });
  const B = { a: 4, b: 1, op: "+" };
  put([50, 51], { ...B, step: "first" });
  put([52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72], {
    ...B,
    step: "second",
  });
  put([73, 74], { ...B, total: 5, step: "answer" });
  const C = { a: 4, b: 2, op: "+" };
  put([76, 77], { ...C, step: "first" });
  put([78, 79, 80, 81, 82, 83, 84], { ...C, step: "second" });
  put([85], { ...C, total: 6, step: "answer" });
  const D = { a: 3, b: 4, op: "+" };
  put([87, 88, 89], { ...D, step: "first" });
  put([90, 91, 92, 93, 94, 95, 96], { ...D, step: "second" });
  put([97, 98], { ...D, total: 7, step: "answer" });
  const E = { a: 2, b: 3, op: "+" };
  put([111], { ...E, step: "first" });
  put([112, 113, 114, 115, 116], { ...E, step: "second" });
  put([117, 118, 119], { ...E, total: 5, step: "answer" });
  return o;
})();

const SUM_FIRST = new Set(
  Object.keys(SUMS)
    .map(Number)
    .filter((p) => !SUMS[p - 1])
);

/** Lines where a calculation is being worked, so the live value belongs above the abacus. */
const isWorking = (p: number) => Boolean(SUMS[p]) && abacusFrom(p);

/**
 * THE PUPPIES, listed rather than derived — their moods are dramatic beats, not a function of the
 * arithmetic. Two rules the list obeys:
 *
 *   `think` plays across EVERY ⏸ hold. Eight times the narration asks a question and stops, and a
 *   character still grinning through the silence tells the child not to bother answering.
 *
 *   They are never given the same mood on the same line unless they are cheering. Two identical
 *   poses read as one character rendered twice, which is exactly what a pair must not look like.
 */
const PUPS: Record<number, { left: PuppyMood; right: PuppyMood }> = (() => {
  const o: Record<number, { left: PuppyMood; right: PuppyMood }> = {};
  const put = (ps: number[], l: PuppyMood, r: PuppyMood) =>
    ps.forEach((p) => (o[p] = { left: l, right: r }));
  put([0], "wave", "sit");
  put([1], "worry", "sit");
  put([2, 3], "think", "sit"); // ⏸ "do you remember what saved us?"
  put([4, 5], "point", "sit");
  put([6, 7], "cheer", "wave");
  put([8, 9, 10], "sit", "point");
  put([13, 14], "cheer", "sit");
  put([16, 17], "sit", "cheer");
  put([18, 19], "point", "sit");
  put([20, 21], "think", "sit"); // ⏸ "who is one's friend?"
  put([22, 23], "cheer", "cheer");
  put([24], "sit", "think"); // ⏸ "and two's friend?"
  put([25, 26], "cheer", "cheer");
  put([29], "point", "sit");
  put([33], "think", "think"); // ⏸ "now you guess the last one" — the biggest hold
  put([34, 35], "sit", "point");
  // p36-37 state the pattern over a board that only ripples — four small numbers is not enough
  // moving pixels to carry a line. The pair confirms it, which is what a class does.
  put([36], "point", "sit");
  put([37], "cheer", "cheer");
  put([38], "sit", "point");
  put([39], "point", "sit"); // the other one takes over, so the pair is never a held pose
  put([43], "point", "sit");
  put([47, 48, 49], "cheer", "sit");
  put([53], "point", "sit");
  put([54], "think", "worry"); // ⏸ "is there a bead left?" — the pair turns as the question lands
  put([55, 56], "worry", "worry");
  put([58], "point", "sit");
  put([66, 67], "worry", "worry"); // "Oh no. Zero?"
  put([68, 69], "sit", "point");
  put([71, 72, 73, 74], "cheer", "cheer");
  put([75], "think", "sit");
  put([78], "sit", "think"); // ⏸ "who is two's friend?"
  put([79], "cheer", "sit");
  put([84, 85], "cheer", "cheer");
  put([91], "think", "think"); // ⏸ "and four's friend is..."
  put([92], "sit", "cheer");
  put([96, 97, 98], "cheer", "cheer");
  put([99, 100], "wave", "cheer");
  put([101, 102], "point", "sit");
  put([106], "sit", "point");
  put([109, 110], "point", "sit");
  put([113, 114], "think", "think"); // ⏸ "what is three's friend?"
  put([116], "think", "sit"); // ⏸ the recall gap
  put([118, 119, 120], "cheer", "cheer");
  put([123], "wave", "cheer");
  return o;
})();

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const hand = handFor(p);
  const onAbacus = abacusFrom(p);
  const board = BOARD[p];
  const base = {
    stage: onAbacus ? ("abacus" as const) : SEESAW[p] ? "seesaw" : "board",
    rods: rig(p),
    scale: BASE,
    targetRod: 0,
    highlight: null,
    hand,
    moveOn:
      onAbacus && !SILENT_SET.has(p) && valueAt(p) !== valueAt(p - 1) ? "$last" : undefined,
    // SILENT resets — clears, and the two the CHILD makes — snap with no arrow and no travel.
    // Without this, `rodsWithFrom` animates from whatever the previous phrase showed, so a staging
    // clear got exactly the same arrow-and-travel treatment as a taught move.
    silentCut: onAbacus && SILENT_SET.has(p),
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
    sum: SUMS[p]?.step === "answer" ? undefined : SUMS[p],
    seesaw: SEESAW[p],
    seesawPrev: SEESAW[p - 1],
    board,
    // ANIMATE ONLY WHEN THE CONTENTS CHANGE — `progress` restarts every phrase, so a card driven
    // straight off it re-fades on every line it is up, which on screen is a blink.
    boardArriving: board !== undefined && BOARD[p - 1]?.upto !== board.upto,
    formulas: FORMULAS[p],
    formulasArriving: FORMULAS[p] !== undefined && FORMULAS[p - 1] === undefined,
    big: ANSWER_TEXT[p],
    // mutually exclusive with the formula title below — both want the top-centre slot
    valueChip: isWorking(p) && !ANSWER_TEXT[p] && !FORMULAS[p],
    // never a puppy pair on a line that already has a finger hand reaching for the rod
    pups: hand ? undefined : PUPS[p],
    doing: DOING[p],
  };

  // ---------------------------------------------------------------- 1 · RECAP (parkgate)
  if (p <= 7) {
    return {
      ...base,
      world: "dinomorning",
      outOfBeads: p >= 1 && p <= 3,
      headline: p === 0 ? "all four small friends" : p === 5 ? "today: all four" : undefined,
    };
  }

  // ------------------------------------------------- 2 · MEET THE FRIENDS (seesawlawn / hopscotch)
  if (p <= 28) {
    return {
      ...base,
      world: "dinomeadow",
      headline: p === 8 ? "friends of five" : p === 20 ? "your turn to answer" : undefined,
      counter: p === 19 ? "2 pairs" : undefined,
    };
  }

  // ---------------------------------------------------------------- 3 · THE FOUR TRICKS (hopscotch)
  if (p <= 37) {
    return {
      ...base,
      world: "dinomeadow",
      headline: undefined,
    };
  }

  // ------------------------------------------------- 4 · WHEN DO WE NEED IT? (sandtoys)
  if (p <= 57) {
    return {
      ...base,
      world: "dinoegg",
      headline:
        p === 38
          ? "careful here!"
          : p === 39
            ? "this part matters"
            : p === 41
              ? "look first!"
              : p === 44
                ? "no trick needed"
                : p === 50
                  ? "now the wall"
                  : undefined,
      band: p === 41 || p === 42 ? "bottom" : undefined,
      outOfBeads: p >= 52 && p <= 56,
    };
  }

  // ---------------------------------------------------------------- 5 · ADD ONE (swingset)
  if (p <= 74) {
    return {
      ...base,
      world: "dinovolcano",
      headline: undefined,
      bandSeq: p === 62 ? ["bottom", "top"] : undefined,
      band: p === 63 ? "bottom" : p === 70 ? "top" : undefined,
      celebrate: p === 73 || p === 74 ? ("party" as const) : base.celebrate,
    };
  }

  // ---------------------------------------------------------------- 6 · ADD TWO (slidehill)
  if (p <= 85) {
    return {
      ...base,
      world: "dinovolcano",
      band: p === 81 ? "bottom" : p === 83 ? "top" : undefined,
    };
  }

  // ---------------------------------------------------------------- 7 · ADD FOUR (picnic)
  if (p <= 98) {
    return {
      ...base,
      world: "dinomeadow",
      band: p === 93 ? "bottom" : p === 95 ? "top" : undefined,
      celebrate: p === 97 || p === 98 ? ("party" as const) : base.celebrate,
    };
  }

  // ------------------------------------------- THE LIKE ASK, MID-ROLL (picnic)
  //
  // Not in the close. It lands on the praise beat right after the child's third win, which is what
  // "while the viewer is feeling good" was always supposed to mean — and at 77% rather than 96%
  // there are far more people still watching to hear it.
  if (p <= 100) {
    return {
      ...base,
      world: "dinomeadow",
      closing: true,
      closeBeat: "subscribe",
      worldWash: 0.5,
      valueChip: false,
      sum: undefined,
      pups: { left: "cheer", right: "cheer" },
    };
  }

  // ---------------------------------------------------------------- 8 · THE PATTERN (flowerbed)
  if (p <= 108) {
    return {
      ...base,
      world: "dinoegg",
      headline: undefined,
      band: p === 104 ? "bottom" : p === 105 ? "top" : undefined,
    };
  }

  // ---------------------------------------------------------------- 9 · YOUR TURN (bandstand)
  if (p <= 120) {
    return {
      ...base,
      world: "dinovolcano",
      headline: p === 109 ? "your turn" : undefined,
      celebrate: p === 118 || p === 119 || p === 120 ? ("party" as const) : base.celebrate,
    };
  }

  // ---------------------------------------------------------------- 10 · CLOSE (lanternpark)
  //
  // p121-123 are still CONTENT — the completed table, and the practice prompt — and only p124 hands
  // over to the store. Letting content lines fall through to `closeBeat` is the bug that put an app
  // store panel over a live abacus in E06 and then again in E07; it is checked for here.
  if (p <= 123) {
    return {
      ...base,
      stage: p <= 122 ? "board" : ("abacus" as const),
      world: "dinosunset",
      headline: p === 121 ? "all four are yours" : undefined,
      pups: p === 123 ? PUPS[123] : { left: "cheer", right: "cheer" },
    };
  }

  return {
    ...base,
    world: "dinosunset",
    closing: true,
    closeBeat: p <= 125 ? "store" : "next",
    worldWash: 0.55,
    noCaption: p === 124 || p === 125,
    valueChip: false,
    sum: undefined,
    seesaw: undefined,
    board: undefined,
    // THE LAST LINE GETS THE PAIR BACK. p126 and p127 are both the teaser card, so p127 was the one
    // beat in the episode with no visual change at all — and "see you next time" is exactly the
    // line a character should be on screen for.
    pups: p >= 127 ? { left: "wave", right: "cheer" } : undefined,
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

/** the phrase where the small friend is first introduced ("First, meet the friends."): Fifi, her tag and crown are off stage until then; only Pip (ME) before */
const FRIEND_INTRO = 8;
const friendEnter = (p: number, bp: number) => (p < FRIEND_INTRO ? 0 : p === FRIEND_INTRO ? Math.min(1, bp * 4) : 1);
const friendCrown = (p: number, bp: number) => (p < FRIEND_INTRO ? 0 : p === FRIEND_INTRO ? Math.max(0, Math.min(1, (bp - 0.3) * 3)) : 1);

const SFX_CUES: SfxCue[] = (() => {
  const cues: SfxCue[] = [];
  const at = (i: number) => sec(PHRASES[i].start, FPS);
  const add = (frame: number, file: string, len: number, vol: number) =>
    cues.push({ frame: Math.max(0, Math.round(frame)), file, len, vol });
  const on = (i: number, w: string) => wordFrameIn(PHRASES[i], w, FPS) ?? at(i);

  // every bead move that actually happens
  for (let i = 1; i < PHRASES.length; i++) {
    if (!abacusFrom(i) || valueAt(i) === valueAt(i - 1)) continue;
    const mv = sceneFor(i).moveOn;
    add(mv ? on(i, mv) : at(i), "abacus_move.mp3", 30, 0.32);
  }
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);

  // THE SEE-SAW — ITS OWN SOUNDS, not the shared library's, and not built the same way as the
  // library's clicks either. `seesaw_creak` PORTAMENTOS down (a real plank doesn't click when it
  // tips, it creaks) for a tile landing — it had been sharing `tick.mp3` with the formula board's
  // row-reveal, so two unrelated events sounded identical. `seesaw_resolve` is a three-note rounded
  // run for the plank reaching LEVEL, because balancing is the moment the pair is confirmed — it
  // had been reusing E02's `reveal5.mp3`, the "reused furniture" EPISODE_RULES.md §2 warns about.
  for (let i = 1; i < PHRASES.length; i++) {
    const a = SEESAW[i];
    const b = SEESAW[i - 1];
    if (!a) continue;
    const levelNow = typeof a.left === "number" && typeof a.right === "number" && a.left + a.right === 5;
    const levelBefore =
      b && typeof b.left === "number" && typeof b.right === "number" && b.left + b.right === 5;
    if (a.left !== b?.left || a.right !== b?.right) add(at(i) + 4, "seesaw_creak.mp3", 30, 0.3);
    if (levelNow && !levelBefore) {
      const span = sec(PHRASES[i].end, FPS) - at(i);
      add(at(i) + span * 0.5, "seesaw_resolve.mp3", 66, 0.28);
    }
  }

  // THE QUIZ ANSWERS — "Four. Well done!" and "Three. You have got it." — had NO celebration sound
  // at all; only the worked sums (`option_correct_ans.mp3`, below) did. `quiz_chirp` is a warm
  // upward-gliding "boop-beep", smaller and rounder than that file, so a one-word answer doesn't
  // get the same metallic fanfare as a finished sum.
  add(at(22), "quiz_chirp.mp3", 26, 0.26);
  add(at(25), "quiz_chirp.mp3", 26, 0.26);

  // THE FORMULA CARD REVEAL — the top title strip and the persistent right-side card both arrived
  // silently. `friend_sparkle` (four quick shimmering notes, not a two-note ding) plays once per
  // beat the strip pops in, which doubles as the persistent card's own debut sound on p57 (its
  // first appearance coincides with the strip's).
  for (const i of Object.keys(FORMULAS).map(Number)) add(at(i) + 3, "friend_sparkle.mp3", 42, 0.24);

  // the formula board, one row at a time
  for (let i = 1; i < PHRASES.length; i++) {
    if (BOARD[i] && BOARD[i - 1] && BOARD[i].upto > BOARD[i - 1].upto) add(at(i) + 5, "tick.mp3", 20, 0.24);
  }

  // THE WALL. "Is there a bead left?" / "No. Not one." is this episode's small failure — the same
  // beat E07 built a whole act around, played here in three lines.
  add(on(54, "$last"), "nope.mp3", 40, 0.3);
  add(at(66) + 4, "pup_yip.mp3", 22, 0.24); // "Oh no." — the puppies' own sound, not a borrowed spring

  // the four beads coming down together, on "all four of them"
  for (let k = 0; k < 4; k++) {
    const span = sec(PHRASES[64].end, FPS) - at(64);
    add(at(64) + (span * (k + 0.15)) / 4, `count_tick_${4 - k}.mp3`, 14, 0.18);
  }

  // the puppies: a clap when the pair starts cheering
  //
  // `len: 50` (1.67s) was CUTTING THE SAMPLE SHORT. clap.mp3 runs to ~4.0s before its trailing
  // silence — `len` is a hard Sequence duration in SceneStage, not a fade, so 50 frames chopped it
  // off mid-clap. `len: 90` (3.0s) is what E01-E03 already use for the same file; matching them
  // rather than inventing a third number.
  for (let i = 1; i < PHRASES.length; i++) {
    const s = sceneFor(i);
    const q = sceneFor(i - 1);
    if (!s.pups || s.hand) continue;
    const nowCheer = s.pups.left === "cheer" && s.pups.right === "cheer";
    const wasCheer = q.pups?.left === "cheer" && q.pups?.right === "cheer";
    if (nowCheer && !wasCheer) {
      add(at(i) + Math.round((sec(PHRASES[i].end, FPS) - at(i)) * 0.12), "clap.mp3", 90, 0.18);
    }
  }

  // "READY? LET US GO." — the puppies cheer and wave here with nothing behind them.
  add(on(6, "$last"), "pup_yip.mp3", 20, 0.2); // anticipation
  add(on(7, "$last"), "swipe.mp3", 16, 0.22); // the whoosh of setting off

  // "DO NOT WORRY." — the pivot from worried to rescued had no sound of its own.
  add(on(68, "$last"), "reassure.mp3", 44, 0.24);

  const rate = STORE_FRAMES / 136;
  add(STORE_START + 50 * rate, "btn_click.mp3", 20, 0.28);
  add(STORE_START + 92 * rate, "btn_click.mp3", 20, 0.3);
  add(STORE_START + 136 * rate - 8, "play_win.mp3", 60, 0.26);
  const subIdx = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "subscribe");
  if (subIdx !== undefined) {
    const st = at(subIdx);
    const span = sec(PHRASES[subIdx].end, FPS) - st;
    add(st + span * 0.16, "btn_click.mp3", 20, 0.3);
    add(st + span * 0.45, "btn_click.mp3", 20, 0.3);
    add(st + span * 0.58, "bell.mp3", 46, 0.34);
  }
  const nextIdx = PHRASES.map((x) => x.index).find((i) => sceneFor(i).closeBeat === "next");
  if (nextIdx !== undefined) add(at(nextIdx), "swipe.mp3", 16, 0.24);

  // ---- NEW SOUNDS (same set as E07): Fifi's arrival, headline chips, the SMALL FRIEND card and its lit moves
  const span = (i: number) => sec(PHRASES[i].end, FPS) - at(i);
  add(at(FRIEND_INTRO) + 4, "cta_pop.mp3", 10, 0.3); // Fifi pops in
  add(at(FRIEND_INTRO) + span(FRIEND_INTRO) * 0.34, "friend_sparkle.mp3", 18, 0.3); // her crown lands
  for (const i of [5, 8, 20, 38, 39, 41, 44, 50, 109, 121]) add(at(i) + 2, "swipe.mp3", 11, 0.2); // headline chips
  // the formula card appears, and the move being made ticks on
  const ds = Object.keys(DOING).map(Number).sort((a, b) => a - b);
  for (const i of ds) {
    const d = DOING[i];
    const q = DOING[i - 1];
    const final = q && q.n === d.n ? Math.min(2, q.step + (q.marks?.length ?? 0)) : -1;
    if (final === -1) add(at(i) + 3, "cta_pop.mp3", 10, 0.26);
    else if (d.step !== final && d.step > 0) add(at(i) + 3, "tick.mp3", 6, 0.34);
    for (const m of d.marks ?? []) if (m > 0.05) add(at(i) + span(i) * m, "tick.mp3", 6, 0.34);
  }
  return cues;
})();

// ---------------------------------------------------------------- placement
//
// THE PAIR STAYS A PAIR — and in 4:5, stays PUT. They sit side by side to the right of the abacus
// in 16:9 — the same slot E07's rabbit used, which leaves the left gutter free for the sum and
// formula cards. In 4:5 they hold ONE fixed spot regardless of what card is up: centring under the
// abacus and shrinking aside when a card appeared made the pair change size and jump sideways
// every time a sum or formula card came and went, which read as restless rather than as two
// characters standing on the grass.
// half-width of the PAIR: the gap to each puppy plus that puppy's own half-width.
const PAIR_GAP = 96;
const PAIR_HALF = PAIR_GAP + PUPPY_BOX.half * OT_K;

const pupsAt = (
  box: { left: number; w: number; top: number; h: number; scale: number },
  L: { W: number; H: number; portrait: boolean; band: { stageBottom: number } },
  closing = false
) => {
  if (closing) {
    const scale = L.portrait ? 0.85 : 1.15;
    return { x: L.W - (PAIR_GAP + PUPPY_BOX.half * OT_K) * scale - 40, y: L.portrait ? L.H * 0.88 : 826, scale }; // 4:5: low enough that the next-video card sits fully above the friends' crowns
  }
  if (L.portrait) {
    // ON THE GRASS, not floating over the abacus. The previous fix anchored the pair just above
    // the card band, overlapping the instrument's lower half — technically clear of every guard
    // box, but not what "standing on the grass" means, and it still put them at the abacus's
    // mercy rather than on ground of their own.
    //
    // This spot is INSIDE the card band (930-1170) instead — the one place in the frame that is
    // always below the abacus and the see-saw/board props (which never reach past y=864) and,
    // on the right at x=780, always clear of the sum and formula-reference cards (which never
    // reach past x=516). One fixed spot that happens to be true for every phrase, rather than one
    // chosen and then patched per beat.
    return { x: 790, y: 1160, scale: 0.64 };
  }
  // BIG ENOUGH TO READ. At 0.72 the pair was a pair of thumbnails beside a 560px instrument;
  // they are characters, not decoration, and the right gutter has the room.
  const scale = castFit(box, L, box.scale * 0.95, PAIR_HALF, 30);
  return {
    x: box.left + box.w + 30 + PAIR_HALF * scale,
    y: box.top + box.h + 16,
    scale,
  };
};

const pupsRect = (m: { x: number; y: number; scale: number }) => ({
  x: m.x - PAIR_HALF * m.scale,
  y: m.y - PUPPY_BOX.up * OT_K * m.scale,
  w: PAIR_HALF * 2 * m.scale,
  h: (PUPPY_BOX.up + PUPPY_BOX.down) * OT_K * m.scale,
});

const SUM_S = (portrait: boolean) => (portrait ? 0.74 : 0.92);
const sumSlot = (L: { portrait: boolean; band: { stageTop: number }; cardBand: { top: number } | null }) =>
  L.portrait ? { x: 34, y: L.cardBand!.top + 8 } : { x: 44, y: L.band.stageTop + 34 };

/**
 * THE PERSISTENT REFERENCE. ONE formula, not all four — the row not in use is not what a child
 * checking their work needs, and four rows made the card the loudest thing on the right when only
 * one of them was relevant. `REF_NAT` is a small title ("SMALL FRIEND", singular — this is ONE
 * formula, not the set) sitting over the same single-strip pill `formulaSlot` uses.
 *
 * In 16:9 it sits upper-right, above the puppies — the pair stands at the abacus's baseline, so
 * stacking vertically keeps the two from fighting for the same width. In portrait it sits beside
 * the sum card in the existing card band.
 */
const STRIP_S = (portrait: boolean) => (portrait ? 0.95 : 1.1);
const stripSlot = (
  L: { portrait: boolean; W: number; band: { stageTop: number; stageBottom: number }; cardBand: { top: number } | null },
  withSum: boolean
) => {
  const s = STRIP_S(L.portrait);
  const w = STRIP_NAT.w * s;
  const h = STRIP_NAT.h * s;
  if (L.portrait) {
    // beside the sum card in the card band
    return { x: 34 + COL_NAT.w * SUM_S(true) + 16, y: L.cardBand!.top + 8, w, h };
  }
  // 16:9: the left column, directly under the sum card; with no sum up it is centred in the stage band
  if (withSum) return { x: 44, y: L.band.stageTop + 34 + COL_NAT.h * SUM_S(false) + 18, w, h };
  return { x: 44, y: L.band.stageTop + (L.band.stageBottom - L.band.stageTop - h) / 2, w, h };
};

/**
 * THE FORMULA STRIP IS A TITLE, not a gutter card — same slot `scene.headline` uses (centred,
 * `y: 30`), because every one of the six phrases that shows it is a single highlighted line and
 * none of them also carries a headline, a big-answer card, or a value chip: the last of those is
 * enforced in `sceneFor` by suppressing `valueChip` wherever `FORMULAS[p]` is set, so the slot is
 * never asked to hold two things at once.
 *
 * It moved here because the earlier gutter placement read as a caption for the abacus rather than
 * as the RULE the line is stating — "take away a friend, and add five" is the sentence's subject,
 * not a footnote beside the instrument.
 */
const FORMULA_TITLE_S = 1.05;
const formulaSlot = (L: { W: number }) => {
  const w = FORMULA_ONE.w * FORMULA_TITLE_S;
  const h = FORMULA_ONE.h * FORMULA_TITLE_S;
  return { x: (L.W - w) / 2, y: 30, w, h };
};

/** The hero board, scaled to whatever the stage band can actually hold. */
/**
 * The hero board, scaled to what the stage band can hold — AND to what the puppies leave it.
 *
 * The board is centred, so its half-width has to stop short of where the pair stands. At 1.2 it
 * measured 864 wide and its right edge ran 56px into the cream puppy, with every check green
 * because `boxesFor` did not declare the board at all. Both halves of that are fixed: the cap below,
 * and the box in `boxesFor`.
 */
const PAIR_GUTTER = 560;
const boardScale = (L: { portrait: boolean; W: number; band: { stageTop: number; stageBottom: number } }) => {
  const availW = (L.portrait ? L.W - 70 : L.W - PAIR_GUTTER * 2) / BOARD_NAT.w;
  const availH = (L.band.stageBottom - L.band.stageTop - 24) / BOARD_NAT.h;
  return Math.min(availW, availH, L.portrait ? 1.25 : 1.2);
};
const seesawScale = (L: { portrait: boolean; W: number; band: { stageTop: number; stageBottom: number } }) => {
  const availW = (L.portrait ? L.W - 60 : L.W - PAIR_GUTTER * 2) / (SEESAW_NAT.half * 2);
  const availH = (L.band.stageBottom - L.band.stageTop - 30) / (SEESAW_NAT.up + SEESAW_NAT.down);
  return Math.min(availW, availH, L.portrait ? 1.5 : 1.55);
};

export const E08DinoValley: React.FC = () => (
  <>
  <HideTextStyle />
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e008_small_friend_positive/E08.mp3"
    sfx={SFX_CUES}
    music={{ file: "lesson_bed.wav", loopFrames: 800, vol: 0.12 }}
    abacusFirstFrame={0}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_DINO}
    placeCard
    brandDark
    neatHands
    captionComing={{ coming: "#5F7385", keyComing: "#A8441F" }}
    placeLabelHalo={() => true}
    chipInk="#06222C"
    countInk="#06222C"
    labelInk={["#06222C", "#06222C", "#06222C", "#06222C", "#06222C"]}
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
      const sumShown = scene.sum && !(L.portrait && scene.formulas);
      if (sumShown) {
        const s = SUM_S(L.portrait);
        out.push({ label: "sumCard", r: { ...sumSlot(L), w: COL_NAT.w * s, h: COL_NAT.h * s } });
      }
      if (scene.formulas) {
        out.push({
          label: "formulas",
          r: formulaSlot(L),
        });
      }
      if (scene.seesaw) {
        const s = seesawScale(L);
        const w = SEESAW_NAT.half * 2 * s;
        const h = (SEESAW_NAT.up + SEESAW_NAT.down) * s;
        const cy = (L.band.stageTop + L.band.stageBottom) / 2;
        out.push({ label: "seesaw", r: { x: (L.W - w) / 2, y: cy - h / 2, w, h } });
      }
      if (scene.board) {
        const s = boardScale(L);
        const w = BOARD_NAT.w * s;
        const h = BOARD_NAT.h * s;
        const cy = (L.band.stageTop + L.band.stageBottom) / 2;
        out.push({ label: "board", r: { x: (L.W - w) / 2, y: cy - h / 2, w, h } });
      }
      if (scene.doing) {
        out.push({ label: "doing", r: stripSlot(L, Boolean(scene.doing.n > 0 && !L.portrait)) });
      }
      if (scene.pups) {
        const m = pupsAt(ctx.box, L, Boolean(scene.closing));
        out.push({ label: "pups", r: pupsRect(m), mayExitFrame: true });
      }
      return out;
    }}
    /* THE STAGE PROP: the see-saw, or the formula board. Only ever one of them, and only on the
       phrases where the abacus is off stage. */
    renderProp={(_stage, scene, ctx) => {
      const L = ctx.layout;
      if (scene.seesaw) {
        const s = seesawScale(L);
        const h = (SEESAW_NAT.up + SEESAW_NAT.down) * s;
        return (
          <svg width={SEESAW_NAT.half * 2 * s} height={h} style={{ overflow: "visible" }}>
            <SeeSaw
              x={SEESAW_NAT.half * s}
              y={SEESAW_NAT.up * s}
              scale={s}
              left={scene.seesaw.left}
              right={scene.seesaw.right}
              prevLeft={scene.seesawPrev?.left}
              prevRight={scene.seesawPrev?.right}
              asking={scene.seesaw.asking}
              seal={scene.seesaw.seal}
              strong
              progress={ctx.beatProgress}
              frame={ctx.frame}
              fps={FPS}
            />
          </svg>
        );
      }
      if (scene.board) {
        const s = boardScale(L);
        // p18-19 are about the PAIRS, not the formulas — the same slot, different content
        if (PAIRS_BOARD.has(ctx.p)) {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22 * s,
                alignItems: "center",
                fontFamily: KID_FONT,
              }}
            >
              {[
                [1, 4],
                [2, 3],
              ].map(([a, b], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
                  {[a, b].map((n, k) => (
                    <div
                      key={k}
                      style={{
                        width: 108 * s,
                        height: 108 * s,
                        borderRadius: 24 * s,
                        background: "#FFF6E4",
                        border: `${6 * s}px solid #C07A05`,
                        color: "#1C4A40",
                        fontSize: 62 * s,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 ${6 * s}px 0 rgba(20,40,34,0.25)`,
                      }}
                    >
                      {n}
                    </div>
                  ))}
                  <div style={{ fontSize: 52 * s, fontWeight: 700, color: "#F0741B", marginLeft: 10 * s }}>
                    = 5
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return (
          <FormulaBoard
            upto={scene.board.upto}
            active={scene.board.active}
            mystery={scene.board.mystery}
            hilite={scene.board.hilite}
            arriving={scene.boardArriving}
            ghost
            progress={ctx.beatProgress}
            frame={ctx.frame}
            fps={FPS}
            scale={s}
          />
        );
      }
      return null;
    }}
    renderOver={(scene, ctx) => (
      <>
        {/* THE BABY DINOSAURS: edges and floor only, calm while teaching, alive on the hook, the answers and the close */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const pp = scene.pups;
          const alive = p <= 7 || p >= 123 || (pp && pp.left === "cheer" && pp.right === "cheer");
          const unsure = pp && (pp.left === "worry" || pp.right === "worry" || pp.left === "think" || pp.right === "think");
          const mood: DinoMood = alive ? "cheer" : unsure ? "tilt" : "calm";
          const f = ctx.frame;
          const tt = f / FPS;
          const eggSection = p >= 38;
          const hatch = Math.max(0, Math.min(1, (f - HATCH_AT) / 22));
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Dino kind="ptero" x={L.portrait ? 170 + Math.sin(tt * 0.45) * 70 : 330 + Math.sin(tt * 0.45) * 210} y={L.portrait ? 200 : 176} scale={0.55} mood={alive ? "cheer" : "calm"} frame={f} fps={FPS} facing={Math.cos(tt * 0.45) >= 0 ? 1 : -1} seed={1} />
              {!L.portrait && !scene.doing && <Dino kind="trike" x={200} y={872} scale={1.0} mood={mood} frame={f} fps={FPS} seed={2} />}
              {!L.portrait && !scene.doing && eggSection && !scene.closing && <Dino kind="trex" x={420} y={874} scale={0.95} mood={mood} frame={f} fps={FPS} hatch={p >= 47 ? hatch : 0} seed={3} />}
              {!L.portrait && !scene.closing && <Dino kind="bronto" x={1858} y={935} scale={0.62} mood={mood} frame={f} fps={FPS} seed={4} />}
            </svg>
          );
        })()}

        {/* THE PUPPIES */}
        {scene.pups && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            {(() => {
              const m = pupsAt(ctx.box, ctx.layout, Boolean(scene.closing));
              const off = PAIR_GAP * m.scale;
              return (
                <>
                  {/* WHICH WAY THEY LOOK. In 16:9 the pair sits to the RIGHT of the abacus, so both
                      face LEFT — they are watching the lesson, which is what the episode's teaching
                      voice wants: two students, and the instrument is what they are looking at. It
                      also makes `point` point at the abacus instead of at the other puppy.
                      In 4:5 they sit UNDER the abacus with nothing either side, so there they turn
                      in towards each other and read as a pair. */}
                  {/* ground shadows so they stand on the meadow */}
                  <ellipse cx={m.x - off} cy={m.y + 4} rx={70 * m.scale} ry={11 * m.scale} fill="#1F5A3A" opacity={0.22} />
                  <Otter x={m.x - off} y={m.y} scale={m.scale * OT_K} role="little" tag prop="binoculars" mood={MOOD[scene.pups!.left]} costume="explorer" look={ctx.layout.portrait ? 1 : -1} phase={0} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
                  {(() => {
                    const en = friendEnter(ctx.p, ctx.beatProgress);
                    if (en <= 0.001) return null;
                    const ez = en >= 1 ? 1 : 1 - Math.pow(1 - en, 3);
                    const sp = en >= 1 ? 1 : 0.3 + 0.7 * ez + Math.sin(ez * Math.PI) * 0.12;
                    return (
                      <g opacity={Math.min(1, en * 3)} transform={`translate(${m.x + off} ${m.y}) scale(${sp}) translate(${-(m.x + off)} ${-m.y})`}>
                        <ellipse cx={m.x + off} cy={m.y + 4} rx={86 * m.scale} ry={13 * m.scale} fill="#1F5A3A" opacity={0.22} />
                        <Otter x={m.x + off} y={m.y} scale={m.scale * OT_K} role="middle" tag prop="magnifier" mood={MOOD[scene.pups!.right]} costume="explorer" look={-1} phase={0.7} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} crown={friendCrown(ctx.p, ctx.beatProgress)} />
                      </g>
                    );
                  })()}
                </>
              );
            })()}
          </svg>
        )}

        {/* THE SMALL FRIEND FORMULA CARD while it is said and done: the move being made is lit */}
        {scene.doing && (() => {
          const L = ctx.layout;
          // a worked example keeps the card in ONE place under the sum card even on the answer lines, where the sum card itself is gone
          const slot = stripSlot(L, Boolean(scene.doing.n > 0 && !L.portrait));
          const step = Math.min(2, scene.doing.step + (scene.doing.marks ?? []).filter((m) => ctx.beatProgress >= m).length);
          return (
            <div style={{ position: "absolute", left: slot.x, top: slot.y }}>
              <FormulaStrip n={scene.doing.n} step={step as 0 | 1 | 2} accent="#7A4300" scale={STRIP_S(L.portrait)} />
            </div>
          );
        })()}

        {/* THE GUTTER FORMULA STRIP */}
        {scene.formulas && (() => {
          const slot = formulaSlot(ctx.layout);
          return (
            <div style={{ position: "absolute", left: slot.x, top: slot.y }}>
              <FormulaList
                active={scene.formulas!.active}
                only
                label={scene.formulas!.label}
                arriving={scene.formulasArriving}
                accent="#C07A05"
                progress={ctx.beatProgress}
                scale={FORMULA_TITLE_S}
              />
            </div>
          );
        })()}

        {/* THE COLUMN SUM */}
        {scene.sum && !(ctx.layout.portrait && scene.formulas) && (() => {
          const L = ctx.layout;
          const at = sumSlot(L);
          const prev = SUMS[ctx.p - 1];
          return (
            <div style={{ position: "absolute", left: at.x, top: at.y }}>
              <ColumnSum
                a={scene.sum!.a}
                b={scene.sum!.b}
                op={scene.sum!.op}
                total={scene.sum!.total}
                step={scene.sum!.step}
                prevStep={prev?.step ?? "none"}
                popIn={SUM_FIRST.has(ctx.p)}
                bg={WORLDS[scene.world].accent}
                placeholderOpacity={0.9}
                progress={ctx.beatProgress}
                scale={SUM_S(L.portrait)}
              />
            </div>
          );
        })()}

        {/* the live value */}
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
                boxShadow: "0 8px 0 rgba(20,40,34,0.35)",
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

        {/* ---------------------------------------------------------------- the close */}
        {scene.closeBeat === "subscribe" && (
          <div
            style={{
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
              title={["small friends", "for taking away"]}
              example={
                // The mirror of what this episode just taught: the same four friends, subtracting.
                // Same gold, same shape, so the teaser reads as "the other half of the table".
                //
                // BOTTOM BEADS FIRST HERE TOO. The series rule (E06) is that within a rod, lower
                // beads move before the upper bead — for ANY move, not only addition. For
                // subtraction's small friend, that means ADD the friend to the lower beads first
                // (always room: digit%5 + friend never exceeds 4, since the rule only applies when
                // digit%5 < n), THEN release the upper bead to subtract five. So `−n = +friend −5`,
                // not `−n = −5+friend` — the first draft had the upper-bead term first, the same
                // bug the addition formulas shipped with.
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SMALL_FRIENDS.map((f, i) => {
                    // STAGGERED. The teaser holds for 4.2s, which as one static card is the longest
                    // motionless stretch in the episode; arriving a row at a time keeps it alive and
                    // reads as a list being written rather than a slide.
                    const on = Math.max(
                      0,
                      Math.min(1, (ctx.beatProgress - (0.08 + i * 0.13)) / 0.16)
                    );
                    return (
                      <span
                        key={f.n}
                        style={{
                          fontFamily: KID_FONT,
                          fontWeight: 700,
                          fontSize: 34,
                          color: "#C07A05",
                          opacity: on,
                          transform: `translateX(${(1 - on) * -18}px)`,
                        }}
                      >
                        {`−${f.n} = +${5 - f.n} −5`}
                      </span>
                    );
                  })}
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
