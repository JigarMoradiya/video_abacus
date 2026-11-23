// E09 · SNOW MOUNTAIN REMAKE (Bead Buddies series, docs/COVE_SERIES_PLAN.md). SAME audio, phrase table, timings, teaching beats, cards
// and abacus tables as the delivered E09 (src/reels/e09_small_friend_subtract.tsx, kept for reference). Only the seagulls and the
// boardwalk worlds are replaced: Pip and Fifi in woolly scarves and beanies in a calm Snow Mountain, with a snowman and a penguin at the edges.
// Taking away is going DOWN: the friend arrives at the bend. The call-box gag keeps its beats (Pip calls out, Fifi answers).

// E09 · Small friends for taking away — 16:9 and 4:5 from one reel.
//
// E08's take ends "Next time, we will learn the small friends for taking away." This pays it, and
// it is the mirror of E08's whole argument: adding ran out of lower beads going up; subtracting
// runs out going down — there are not enough lower beads left to take away. The fix is the SAME
// friends, used backwards: add the friend to the lower beads first, then take away five by
// releasing the upper bead.
//
// Timing from public/audio/e009_small_friend_negative/E09.phrases.json, aligned from
// docs/E09_lines.txt. 91 lines -> 92 phrases, 300.04 s, 98.2% word match (the shortfall is
// entirely possessives like "One's" — canon() strips the apostrophe from the match count, not
// from the timing; every word has a correct timestamp).
//
// WHAT THIS EPISODE DOES DIFFERENTLY
//
//   · NO RE-TEACHING. E07/E08 already established "every small number has a friend" — this
//     episode does not re-teach that from scratch, so there is no hero board and no see-saw
//     device. The abacus stays on stage almost the entire episode; the only new device is the
//     call box (below).
//   · THE CALL BOX. "So we call a friend" is not a metaphor here — a seagull dials an old red
//     call box on the pier and the OTHER seagull's phone rings. Played in full exactly once, at
//     the first time a friend is actually named (not at the literal line, which comes later) —
//     every other time a friend is named, it is a quick ring, not a replay of the whole bit.
//   · BOTTOM BEADS FIRST, MIRRORED. `-n = +friend -5`: add the friend to the lower beads (always
//     feasible — the trigger condition guarantees digit%5 + friend <= 4), then release the upper
//     bead. Checked case by case in tools/ before writing a single line of this file.
//   · RIG_SNOW — soft mint frame, sunset-pink beads. Eighth distinct instrument. A boardwalk at
//     dusk, not E08's daytime park — same idea, used backwards, so the world moves into evening
//     instead of repeating the afternoon.

import React from "react";
import phrasesJson from "../data/e09.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Twinkles, castFit } from "../components/cast";
import { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, OT_K, PAIR_GAP as CAST_GAP } from "../components/cast";
import type { OtterMood } from "../components/cast";
type SeagullMood = "sit" | "wave" | "think" | "worry" | "point" | "cheer" | "call" | "ring";
const MOOD: Record<SeagullMood, OtterMood> = { sit: "float", wave: "wave", think: "think", worry: "worry", point: "point", cheer: "cheer", call: "wave", ring: "present" };
const GULL_BOX = { up: CAST_BOX.up * OT_K, down: CAST_BOX.down, half: CAST_BOX.half * OT_K };
import { FormulaList, FORMULA_ONE } from "../components/e07/FormulaList";
import { FormulaStrip, STRIP_NAT } from "../components/e07/FormulaStrip";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { Abacus, type RodState } from "../components/Abacus";
import { Card, StickerText } from "../components/Sticker";
import { bob, wiggle } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import type { Scene as BaseScene } from "../stage/types";
import { WORLDS } from "../data/theme";
import { BB_RIGS } from "../data/bbworlds";
const RIG_SNOW = BB_RIGS.snow;
import { FPS, ROD_DIM, HEAVEN_H, BEAM_H, ABACUS_INNER_H } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";
import { HideTextStyle } from "../lib/hideText";
import { rodX } from "../stage/geometry";


export const AUDIO_SEC = 300.04;
export const E09_SNOW_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

interface Scene extends BaseScene {
  negative?: boolean;
  gulls?: { left: SeagullMood; right: SeagullMood };
  /** the SMALL FRIEND formula card while the beads do it; mode "add" = last time's −friend +5, "sub" = this time's +friend −5; n = 0 is the general rule */
  doing?: { n: number; step: 0 | 1 | 2; mode: "add" | "sub"; marks?: number[] };
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep };
  big?: string;
  valueChip?: boolean;
  outOfBeads?: boolean;
}

const BASE = 1.15;
const BIG_TOP = 20;
const BIG_SIZE = 80;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

const PORTRAIT_ROOM = { left: 80, right: 190 };

/**
 * WHAT THE ONES ROD READS ON EACH PHRASE. Every transition checked in tools/ before this table
 * was written — see the header comment for the four cases and their verified intermediate values.
 */
const VALUE: Record<number, number> = (() => {
  const v: Record<number, number> = {};
  for (let p = 0; p < PHRASES.length; p++) v[p] = 0;
  for (let p = 1; p < 5; p++) v[p] = 4; // recap callback to E08's stuck-add value
  for (let p = 11; p < 12; p++) v[p] = 9; // make nine
  for (let p = 12; p < 16; p++) v[p] = 7; // direct: take two away, no friend
  for (let p = 17; p < 33; p++) v[p] = 5; // make five; stuck; the plan explained
  for (let p = 33; p < 36; p++) v[p] = 9; // add the friend's four lower beads
  for (let p = 36; p < 40; p++) v[p] = 4; // release the upper bead: 5 - 1 = 4
  for (let p = 41; p < 46; p++) v[p] = 6; // make six; call a friend; two's friend is three
  for (let p = 46; p < 49; p++) v[p] = 9; // add three lower beads
  for (let p = 49; p < 52; p++) v[p] = 4; // release: 6 - 2 = 4
  for (let p = 56; p < 60; p++) v[p] = 7; // make seven; four's friend is one
  for (let p = 60; p < 63; p++) v[p] = 8; // add one lower bead
  for (let p = 63; p < 66; p++) v[p] = 3; // release: 7 - 4 = 3
  for (let p = 66; p < 76; p++) v[p] = 3; // the pattern recap holds the last settled value
  for (let p = 76; p < 80; p++) v[p] = 6; // your turn: make six
  for (let p = 80; p < 81; p++) v[p] = 8; // add the friend
  for (let p = 81; p < 86; p++) v[p] = 3; // release: 6 - 3 = 3
  return v;
})();

const valueAt = (p: number) => VALUE[p] ?? 0;

/** Resets, clears, and the two the CHILD makes — no taught move, snap with no arrow. */
const SILENT_SET = new Set([1, 5, 10, 16, 40, 41, 55, 56, 75, 76]);

/** The abacus is on stage almost the whole episode — this is not a re-teaching episode, so there
 *  is no hero board to hand off to. Only the mid-roll like-ask and the close hide it. */
const abacusFrom = (p: number) => !(p >= 52 && p <= 54) && p <= 85;

const rig = (p: number): RodState[] =>
  Array.from({ length: 5 }, (_, i) => ({
    value: i === 0 ? valueAt(p) : 0,
    focus: i === 0 ? 1 : ROD_DIM,
  }));

/**
 * WHICH FINGER — the exact same derivation as E04-E08, unchanged: a property of the MOVE, never
 * of the bead or the operation. Towards the top of the frame is the thumb, downwards is the index
 * finger. This episode is the proof the rule is truly operation-agnostic: releasing the upper bead
 * to SUBTRACT five is still a thumb, moving up, same as pushing it down to ADD five was in E08.
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
    const goingUp = to < 5; // releasing the upper bead moves it UP and away from the beam
    return { digit: goingUp ? "thumb" : "index", direction: goingUp ? "up" : "down", rod: 0, heaven: true };
  }
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod: 0, heaven: false };
  return undefined;
};

/**
 * The SECOND hand, for the one line where both kinds of bead move together: the recap's "Make
 * nine on your abacus" (p11) builds 9 straight from 0, crossing the heaven threshold AND moving
 * the lower beads in the same beat. `handFor`'s first matching branch (`lowerTo > lowerFrom`)
 * returns only the thumb for the lower beads — the upper bead's own index-finger move never
 * gets evaluated, so the line taught only half of what it showed. Same fix as E05's hand2For.
 */
const hand2For = (p: number): Scene["hand2"] => {
  if (p === 0 || SILENT_SET.has(p) || !abacusFrom(p)) return undefined;
  const to = valueAt(p);
  const from = p > 0 ? valueAt(p - 1) : 0;
  const lowerMoved = to % 5 !== from % 5;
  const heavenCrossed = from >= 5 !== to >= 5;
  if (!lowerMoved || !heavenCrossed) return undefined;
  const goingUp = to < 5;
  return { digit: goingUp ? "thumb" : "index", direction: goingUp ? "up" : "down", rod: 0, heaven: true };
};

const ANSWER_LINES = [14, 38, 51, 65, 83];
const ANSWER_TEXT: Record<number, string> = {
  14: "9 − 2 = 7",
  38: "5 − 1 = 4",
  51: "6 − 2 = 4",
  65: "7 − 4 = 3",
  83: "6 − 3 = 3",
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

/** where a word starts inside its line, as a 0..1 share of the line (drives the lit move on the formula card) */
const markAt = (p: number, w: string) => {
  const ph = PHRASES[p];
  const x = ph.words.find((k) => k.word.toLowerCase().replace(/[^a-z]/g, "") === w);
  return x ? Math.max(0, Math.min(0.95, (x.start - ph.start) / (ph.end - ph.start))) : 0.5;
};

/**
 * THE SMALL FRIEND FORMULA CARD, said and DONE (same slot and behaviour as E07/E08's card). Friend first, always:
 * −n = +friend −5. It comes up when the friend is named, lights "+friend" while the friend is added and "−5"
 * while the five is taken away, and goes back to the plain formula on the answer lines. It replaces the old
 * top-centre formula chips and the small reference card at the right.
 */
const DOING: Record<number, NonNullable<Scene["doing"]>> = (() => {
  const out: Record<number, NonNullable<Scene["doing"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["doing"]>) => ps.forEach((p) => (out[p] = v));
  // the recap of last time's trick, lit as it is said ("We take away the friend, and then we add five.")
  put([4], { n: 0, step: 0, mode: "add", marks: [markAt(4, "take"), markAt(4, "add")] });
  // 5 − 1: one's friend is four
  put([26, 27, 28, 29], { n: 1, step: 0, mode: "sub" });
  put([30], { n: 1, step: 0, mode: "sub", marks: [markAt(30, "add")] });
  put([31], { n: 1, step: 1, mode: "sub", marks: [markAt(31, "take")] });
  put([32], { n: 1, step: 0, mode: "sub" });
  put([33, 34], { n: 1, step: 1, mode: "sub" });
  put([35, 36], { n: 1, step: 2, mode: "sub" });
  put([37, 38, 39], { n: 1, step: 0, mode: "sub" });
  // 6 − 2: two's friend is three
  put([45], { n: 2, step: 0, mode: "sub" });
  put([46, 47], { n: 2, step: 1, mode: "sub" });
  put([48, 49], { n: 2, step: 2, mode: "sub" });
  put([50, 51], { n: 2, step: 0, mode: "sub" });
  // 7 − 4: four's friend is one
  put([59], { n: 4, step: 0, mode: "sub" });
  put([60, 61], { n: 4, step: 1, mode: "sub" });
  put([62, 63], { n: 4, step: 2, mode: "sub" });
  put([64, 65], { n: 4, step: 0, mode: "sub" });
  // the pattern: last time (take away the friend, add five), this time (add the friend, take away five)
  put([68], { n: 0, step: 0, mode: "add", marks: [markAt(68, "took"), markAt(68, "added")] });
  put([69], { n: 0, step: 0, mode: "sub", marks: [markAt(69, "add"), markAt(69, "take")] });
  put([70], { n: 0, step: 0, mode: "sub" });
  put([71], { n: 0, step: 1, mode: "sub" });
  put([72], { n: 0, step: 2, mode: "sub" });
  put([73, 74], { n: 0, step: 0, mode: "sub" });
  // your turn: six take away three, three's friend is two
  put([79], { n: 3, step: 0, mode: "sub" });
  put([80], { n: 3, step: 1, mode: "sub" });
  put([81], { n: 3, step: 2, mode: "sub" });
  put([82, 83], { n: 3, step: 0, mode: "sub" });
  return out;
})();

/** The sum, in column form, on every worked case. */
const SUMS: Record<number, NonNullable<Scene["sum"]>> = (() => {
  const out: Record<number, NonNullable<Scene["sum"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["sum"]>) => ps.forEach((p) => (out[p] = v));
  // Each sum now starts on its ANNOUNCEMENT line ("Let us try..."), in `step:"none"` — no cell
  // highlighted — instead of only appearing once the working begins. The card should be there
  // the moment the sum is spoken, not several lines later.
  const A = { a: 9, b: 2, op: "−" };
  put([10], { ...A, step: "none" });
  put([11], { ...A, step: "first" });
  put([12, 13], { ...A, step: "second" });
  put([14, 15], { ...A, total: 7, step: "answer" });
  const B = { a: 5, b: 1, op: "−" };
  put([16], { ...B, step: "none" });
  put([17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32], { ...B, step: "first" });
  put([33, 34, 35], { ...B, step: "second" });
  put([36, 37], { ...B, total: 4, step: "answer" });
  const C = { a: 6, b: 2, op: "−" };
  put([40], { ...C, step: "none" });
  put([41, 42, 43, 44, 45], { ...C, step: "first" });
  put([46, 47, 48], { ...C, step: "second" });
  put([49, 50], { ...C, total: 4, step: "answer" });
  const D = { a: 7, b: 4, op: "−" };
  put([55], { ...D, step: "none" });
  put([56, 57, 58, 59], { ...D, step: "first" });
  put([60, 61, 62], { ...D, step: "second" });
  put([63, 64], { ...D, total: 3, step: "answer" });
  const E = { a: 6, b: 3, op: "−" };
  put([76, 77, 78, 79], { ...E, step: "first" });
  put([80, 81], { ...E, step: "second" });
  put([82], { ...E, total: 3, step: "answer" });
  return out;
})();
const SUM_FIRST = new Set(
  Object.keys(SUMS).map(Number).filter((p) => !SUMS[p - 1])
);

/**
 * WHICH SECTION IS NAMED. Every line that says "lower beads" dims the upper section so the lower
 * beads are the one bright thing on the rod; every line that says "the upper bead" does the
 * reverse. Sixteen lines across the episode named this by hand — audited against the script, not
 * guessed, after the first draft shipped with none of them.
 */
const HIGHLIGHT_FOR: Record<number, "top" | "bottom"> = {
  8: "bottom", 12: "bottom", 18: "bottom", 19: "bottom",
  21: "top",
  30: "bottom", 32: "bottom", 33: "bottom",
  36: "top",
  42: "bottom", 46: "bottom",
  49: "top",
  57: "bottom", 60: "bottom",
  63: "top",
  80: "bottom",
};
const isWorking = (p: number) => Boolean(SUMS[p]) && abacusFrom(p) && !DOING[p];

/**
 * THE GULLS, listed rather than derived — dramatic beats, not a function of the arithmetic.
 * `call`/`ring` fire exactly once as the FULL gag (p25-26, the first time a friend is actually
 * named), and every later friend-naming gets the light `ring` callback instead.
 */
const GULLS: Record<number, { left: SeagullMood; right: SeagullMood }> = (() => {
  const g: Record<number, { left: SeagullMood; right: SeagullMood }> = {};
  const put = (ps: number[], l: SeagullMood, r: SeagullMood) => ps.forEach((p) => (g[p] = { left: l, right: r }));
  put([0], "wave", "sit");
  put([1, 2], "think", "sit");
  put([3], "think", "think"); // ⏸ "do you remember the trick?"
  put([4], "point", "sit");
  put([5, 6], "point", "sit");
  put([7, 8, 9], "sit", "point");
  put([10], "point", "sit");
  put([13], "cheer", "sit");
  put([14, 15], "cheer", "cheer");
  put([16], "sit", "point");
  put([17], "sit", "think");
  put([18], "think", "sit");
  put([19], "think", "think"); // ⏸ "how many lower beads do you have?"
  put([20, 21, 22, 23, 24], "worry", "worry");
  put([25], "sit", "point");
  put([26], "point", "ring"); // a light callback — the FULL gag is p44, the literal line
  put([27], "point", "sit");
  put([28], "sit", "point");
  put([29], "point", "point");
  put([30, 31, 32], "sit", "point");
  put([34], "sit", "point");
  put([35], "point", "sit");
  put([37], "cheer", "sit");
  put([38, 39], "cheer", "cheer");
  put([40], "sit", "point");
  put([42, 43], "think", "sit");
  put([44], "call", "ring"); // THE FULL GAG — the literal line, "So we call a friend."
  put([45], "sit", "point");
  put([47], "sit", "point");
  put([48], "point", "sit");
  put([50], "cheer", "sit");
  put([51], "cheer", "cheer");
  put([52, 53, 54], "cheer", "wave");
  put([55], "sit", "point");
  put([57, 58], "think", "sit");
  put([59], "ring", "point"); // callback — "Four's friend is one."
  put([61], "sit", "point");
  put([62], "point", "sit");
  put([64], "cheer", "sit");
  put([65], "cheer", "cheer");
  put([67], "point", "sit");
  put([69], "sit", "point");
  put([71], "point", "sit");
  put([73], "sit", "point");
  put([75], "sit", "point");
  put([77], "think", "sit");
  put([78], "think", "think");
  put([79], "ring", "think"); // ⏸ callback — "What is three's friend?"
  put([82], "think", "think"); // ⏸ "what number is showing now?"
  put([83, 84], "cheer", "cheer");
  put([85], "cheer", "sit");
  return g;
})();

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const hand = handFor(p);
  const onAbacus = abacusFrom(p);
  const base = {
    stage: "abacus" as const,
    rods: rig(p),
    scale: BASE,
    targetRod: 0,
    highlight: HIGHLIGHT_FOR[p] ?? null,
    hand,
    hand2: hand2For(p),
    moveOn: onAbacus && !SILENT_SET.has(p) && valueAt(p) !== valueAt(p - 1) ? "$last" : undefined,
    silentCut: onAbacus && SILENT_SET.has(p),
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
    // Hide only on the exact phrase the big top ANSWER card takes over — SUMS marks a wider
    // "answer" step range than ANSWER_TEXT covers, which was blanking the card 1-2 phrases early.
    sum: ANSWER_TEXT[p] ? undefined : SUMS[p],
    doing: DOING[p],
    big: ANSWER_TEXT[p],
    valueChip: isWorking(p) && !ANSWER_TEXT[p],
    gulls: hand ? undefined : GULLS[p],
  };

  // ---------------------------------------------------------------- 1 · RECAP HOOK (boardwalkdusk)
  if (p <= 6) {
    return {
      ...base,
      world: "snowA",
      outOfBeads: p >= 1 && p <= 4,
      headline: p === 0 ? "small friends for taking away" : p === 5 ? "today: taking away" : undefined,
    };
  }

  // ---------------------------------------------------------------- 2 · LOOK FIRST (cartfront)
  if (p <= 15) {
    return { ...base, world: "snowB", headline: p === 7 ? "look first!" : undefined };
  }

  // ---------------------------------------------------------------- 3 · THE WALL (emptytray)
  if (p <= 32) {
    return {
      ...base,
      world: "snowB", // the call box (and its full gag) moved to p43-44
      outOfBeads: p >= 19 && p <= 24,
      headline:
        p === 20
          ? "stuck!"
          : p === 24
            ? "still stuck!"
            : p === 25
              ? "call a friend!"
              : p === 27
                ? "last time: add"
                : p === 28
                  ? "this time: subtract"
                  : p === 29
                    ? "here's the trick!"
                    : undefined,
      // "None at all." (p20) gets its own negative visual — a red X and a shake — rather than
      // the same plain grey rod as the three lines around it.
      negative: p === 20,
    };
  }

  // ---------------------------------------------------------------- 4 · SOLVING IT (scoopdelivery)
  if (p <= 39) {
    return { ...base, world: "snowC", band: p === 33 ? "bottom" : p === 36 ? "top" : undefined };
  }

  // ---------------------------------------------------------------- 5 · ONE MORE (cartfront)
  if (p <= 51) {
    return {
      ...base,
      // the red call box is scenery for exactly the beat it names.
      world: p >= 43 && p <= 44 ? "snowC" : "snowB",
      band: p === 46 ? "bottom" : p === 49 ? "top" : undefined,
      celebrate: p === 51 ? ("party" as const) : base.celebrate,
    };
  }

  // ------------------------------------------- LIKE ASK, MID-ROLL (benchlights)
  if (p <= 54) {
    return {
      ...base,
      world: "snowB",
      closing: true,
      closeBeat: "subscribe",
      worldWash: 0.5,
      valueChip: false,
      sum: undefined,
      doing: undefined,
    };
  }

  // ---------------------------------------------------------------- 6 · ANOTHER ONE (carouselglow)
  if (p <= 65) {
    return {
      ...base,
      world: "snowC",
      band: p === 60 ? "bottom" : p === 63 ? "top" : undefined,
      celebrate: p === 65 ? ("party" as const) : base.celebrate,
    };
  }

  // ---------------------------------------------------------------- 7 · THE PATTERN (duskdock)
  //
  // Nine lines recapping the rule, and the first draft gave them ONE headline between them (p70)
  // — the same "same visuals" gap as the wall section, just missed on this stretch entirely.
  // Every line gets its own flash now.
  if (p <= 74) {
    const PATTERN_HEADLINE: Record<number, string> = {
      66: "see the pattern?",
      67: "same trick, backwards!",
      70: "always the friend",
      73: "the friend changes",
      74: "the five never does",
    };
    return { ...base, world: "snowD", headline: PATTERN_HEADLINE[p] };
  }

  // ---------------------------------------------------------------- 8 · YOUR TURN (ferriswheel)
  if (p <= 85) {
    return {
      ...base,
      world: "snowD",
      headline: p === 75 ? "your turn" : undefined,
      celebrate: p === 83 || p === 84 || p === 85 ? ("party" as const) : base.celebrate,
    };
  }

  // ---------------------------------------------------------------- 9 · CLOSE (fireworks)
  //
  // THE PAIR STAYS FOR THE WHOLE CLOSE — an automated diff flagged p86-91 as one frozen run.
  // p88-89 (the store beat) already animate internally via StoreFlow; p86-87 and p91 did not.
  if (p <= 87) {
    return {
      ...base,
      world: "snowD",
      headline: p === 86 ? "you know both now" : undefined,
      gulls: { left: "point", right: "cheer" },
      // The abacus resets from the quiz's 3 to 0 right here (VALUE has no entry past p85, so
      // it falls to 0) — but p86 sits outside `abacusFrom`'s teaching window, so `base` computed
      // neither `moveOn` nor `silentCut` for it and the reset fell through to the DEFAULT
      // animated-with-arrow treatment. There is nothing being taught by this reset; it should
      // snap with no travel and no arrow, same as every other clear/reset in SILENT_SET.
      silentCut: p === 86,
    };
  }

  return {
    ...base,
    world: "snowD",
    closing: true,
    closeBeat: p <= 89 ? "store" : "next",
    worldWash: 0.55,
    noCaption: p === 88 || p === 89,
    valueChip: false,
    sum: undefined,
    doing: undefined,
    gulls: p >= 91 ? { left: "wave", right: "cheer" } : undefined,
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

/** the phrase where the small friend is first mentioned ("a friend can rescue us"): Fifi, her tag and crown are off stage until then; only Pip (ME) before */
const FRIEND_INTRO = 2;
const friendEnter = (p: number, bp: number) => (p < FRIEND_INTRO ? 0 : p === FRIEND_INTRO ? Math.min(1, bp * 4) : 1);
const friendCrown = (p: number, bp: number) => (p < FRIEND_INTRO ? 0 : p === FRIEND_INTRO ? Math.max(0, Math.min(1, (bp - 0.3) * 3)) : 1);

const SFX_CUES: SfxCue[] = (() => {
  const cues: SfxCue[] = [];
  const at = (i: number) => sec(PHRASES[i].start, FPS);
  const add = (frame: number, file: string, len: number, vol: number) =>
    cues.push({ frame: Math.max(0, Math.round(frame)), file, len, vol });
  const on = (i: number, w: string) => wordFrameIn(PHRASES[i], w, FPS) ?? at(i);

  for (let i = 1; i < PHRASES.length; i++) {
    if (!abacusFrom(i) || valueAt(i) === valueAt(i - 1)) continue;
    const mv = sceneFor(i).moveOn;
    add(mv ? on(i, mv) : at(i), "abacus_move.mp3", 30, 0.32);
  }
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);

  // THE WALL. "There is nothing down here to take" is this episode's small failure.
  add(on(20, "$last"), "nope.mp3", 40, 0.3);
  add(on(24, "$last"), "pup_yip.mp3", 22, 0.22); // "we are stuck" — reused from E08, a soft worried chirp

  // THE CALL BOX — a ring for the full gag, and a lighter one for every callback.
  add(at(44) + 6, "friend_sparkle.mp3", 42, 0.22);
  for (const i of [26, 59, 79]) add(at(i) + 4, "quiz_chirp.mp3", 20, 0.18);

  // ---- NEW SOUNDS (same set as E07/E08): Fifi's arrival, headline chips, the SMALL FRIEND card and its lit moves
  const span = (i: number) => sec(PHRASES[i].end, FPS) - at(i);
  add(at(FRIEND_INTRO) + 4, "cta_pop.mp3", 10, 0.3); // Fifi pops in
  add(at(FRIEND_INTRO) + span(FRIEND_INTRO) * 0.34, "friend_sparkle.mp3", 18, 0.3); // her crown lands
  for (const i of [0, 5, 7, 20, 24, 25, 27, 28, 29, 66, 67, 70, 73, 74, 75, 86]) add(at(i) + 2, "swipe.mp3", 11, 0.2); // headline chips
  const ds = Object.keys(DOING).map(Number).sort((a, b) => a - b);
  for (const i of ds) {
    const d = DOING[i];
    const q = DOING[i - 1];
    const final = q && q.n === d.n && q.mode === d.mode ? Math.min(2, q.step + (q.marks?.length ?? 0)) : -1;
    if (final === -1) add(at(i) + 3, "cta_pop.mp3", 10, 0.26);
    else if (d.step !== final && d.step > 0) add(at(i) + 3, "tick.mp3", 6, 0.34);
    for (const m of d.marks ?? []) if (m > 0.05) add(at(i) + span(i) * m, "tick.mp3", 6, 0.34);
  }

  // the gulls: a clap when the pair starts cheering
  for (let i = 1; i < PHRASES.length; i++) {
    const s = sceneFor(i);
    const q = sceneFor(i - 1);
    if (!s.gulls || s.hand) continue;
    const nowCheer = s.gulls.left === "cheer" && s.gulls.right === "cheer";
    const wasCheer = q.gulls?.left === "cheer" && q.gulls?.right === "cheer";
    if (nowCheer && !wasCheer) {
      add(at(i) + Math.round((sec(PHRASES[i].end, FPS) - at(i)) * 0.12), "clap.mp3", 90, 0.18);
    }
  }

  add(on(2, "stuck"), "boing.mp3", 26, 0.2);
  add(at(85) + 6, "count_fanfare.mp3", 60, 0.24); // "Well done"

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
  return cues;
})();

// ---------------------------------------------------------------- placement
const GULL_GAP = CAST_GAP;
const GULL_HALF = GULL_GAP + GULL_BOX.half;

const gullsAt = (
  box: { left: number; w: number; top: number; h: number; scale: number },
  L: { W: number; H: number; portrait: boolean; band: { stageBottom: number } },
  closing = false
) => {
  if (closing) {
    const scale = L.portrait ? 0.85 : 1.15;
    return { x: L.W - (GULL_GAP + GULL_BOX.half) * scale - 40, y: L.portrait ? L.H * 0.88 : 826, scale }; // landscape feet at 826: tags clear the caption by 24 px; 4:5 low so the next-video card sits above
  }
  if (L.portrait) {
    // ONE FIXED SPOT, on the deck, clear of the sum and formula-reference cards (which never
    // reach past x=516) — same fix E08 needed after its pair kept jumping around. 0.56 kept
    // them clear of everything but read as too small against the rest of the portrait frame;
    // 0.85 (the same scale the closing beat already uses) still clears every card with room
    // to spare.
    return { x: 790, y: 1160, scale: 0.64 };
  }
  const scale = castFit(box, L, box.scale * 0.95, GULL_HALF, 30);
  return {
    x: box.left + box.w + 30 + GULL_HALF * scale,
    y: box.top + box.h + 16,
    scale,
  };
};

const gullsRect = (m: { x: number; y: number; scale: number }) => ({
  x: m.x - GULL_HALF * m.scale,
  y: m.y - GULL_BOX.up * m.scale,
  w: GULL_HALF * 2 * m.scale,
  h: (GULL_BOX.up + GULL_BOX.down) * m.scale,
});

const SUM_S = (portrait: boolean) => (portrait ? 0.74 : 0.92);
const sumSlot = (L: { portrait: boolean; band: { stageTop: number }; cardBand: { top: number } | null }) =>
  L.portrait ? { x: 34, y: L.cardBand!.top + 8 } : { x: 44, y: L.band.stageTop + 34 };

const STRIP_S = (portrait: boolean) => (portrait ? 0.95 : 1.1);
const stripSlot = (
  L: { portrait: boolean; W: number; band: { stageTop: number; stageBottom: number }; cardBand: { top: number } | null },
  withSum: boolean
) => {
  const s = STRIP_S(L.portrait);
  const w = STRIP_NAT.w * s;
  const h = STRIP_NAT.h * s;
  // 4:5: beside the sum card in the card band
  if (L.portrait) return { x: 34 + COL_NAT.w * SUM_S(true) + 16, y: L.cardBand!.top + 8, w, h };
  // 16:9: the left column, directly under the sum card; with no sum up it is centred in the stage band
  if (withSum) return { x: 44, y: L.band.stageTop + 34 + COL_NAT.h * SUM_S(false) + 18, w, h };
  return { x: 44, y: L.band.stageTop + (L.band.stageBottom - L.band.stageTop - h) / 2, w, h };
};

export const E09SnowMountain: React.FC = () => (
  <>
  <HideTextStyle />
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e009_small_friend_negative/E09.mp3"
    sfx={SFX_CUES}
    music={{ file: "lesson_bed.wav", loopFrames: 800, vol: 0.12 }}
    abacusFirstFrame={0}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_SNOW}
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
      const sumShown = scene.sum && !(L.portrait && scene.doing);
      if (sumShown) {
        const s = SUM_S(L.portrait);
        const at = sumSlot(L);
        out.push({ label: "sumCard", r: { ...at, w: COL_NAT.w * s, h: COL_NAT.h * s } });
      }
      if (scene.doing) out.push({ label: "doing", r: stripSlot(L, Boolean(scene.doing.n > 0 && !L.portrait)) });
      if (scene.gulls) {
        const m = gullsAt(ctx.box, L, Boolean(scene.closing));
        out.push({ label: "gulls", r: gullsRect(m), mayExitFrame: true });
      }
      return out;
    }}
    renderOver={(scene, ctx) => (
      <>
        {scene.closeBeat === "next" && <Twinkles frame={ctx.frame} W={ctx.layout.W} H={ctx.layout.H} />}
        {/* THE SNOW MOUNTAIN'S EDGE FRIENDS: a snowman (bottom-left) and a penguin (far right), calm while teaching */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const g = scene.gulls;
          const alive = p <= 6 || p >= 86 || Boolean(g && g.left === "cheer" && g.right === "cheer");
          const unsure = Boolean(g && (g.left === "worry" || g.right === "worry" || g.left === "think" || g.right === "think"));
          const mood = pieceMood(alive, unsure);
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Pieces mood={mood} frame={ctx.frame} fps={FPS} pieces={[
                { kind: "snowman", x: 170, y: 890, scale: 0.95, show: !L.portrait && !scene.doing },
                { kind: "penguin", x: 1850, y: 905, scale: 0.72, facing: -1, show: !L.portrait && !scene.closing },
              ]} />
            </svg>
          );
        })()}

        {/* THE SEAGULLS */}
        {scene.gulls && (
          <svg width={ctx.layout.W} height={ctx.layout.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {(() => {
              const m = gullsAt(ctx.box, ctx.layout, Boolean(scene.closing));
              const off = GULL_GAP * m.scale;
              return (
                <>
                  <CastGroup x={m.x} y={m.y} scale={m.scale} actors={[{ role: "little", mood: MOOD[scene.gulls!.left], prop: "binoculars" }, { role: "middle", mood: MOOD[scene.gulls!.right], enter: friendEnter(ctx.p, ctx.beatProgress), crown: friendCrown(ctx.p, ctx.beatProgress) }]} costume="scarf" look={ctx.layout.portrait ? 1 : -1} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
                </>
              );
            })()}
          </svg>
        )}

        {/* THE SMALL FRIEND FORMULA CARD while it is said and done: the move being made is lit */}
        {scene.doing && (() => {
          const L = ctx.layout;
          const slot = stripSlot(L, Boolean(scene.doing.n > 0 && !L.portrait));
          const step = Math.min(2, scene.doing.step + (scene.doing.marks ?? []).filter((m) => ctx.beatProgress >= m).length);
          return (
            <div style={{ position: "absolute", left: slot.x, top: slot.y }}>
              <FormulaStrip n={scene.doing.n} step={step as 0 | 1 | 2} mode={scene.doing.mode} accent="#C4284C" scale={STRIP_S(L.portrait)} />
            </div>
          );
        })()}

        {/* THE COLUMN SUM */}
        {scene.sum && !(ctx.layout.portrait && scene.doing) && (() => {
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
                bg={WORLDS[scene.world].accent} placeholderOpacity={0.9}
                progress={ctx.beatProgress}
                scale={SUM_S(L.portrait)}
              />
            </div>
          );
        })()}

        {/* the live value */}
        {scene.valueChip && !scene.big && !scene.headline && (
          <div style={{ position: "absolute", left: 0, top: 24, width: ctx.layout.W, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 76,
                color: "#FFFFFF",
                background: WORLDS[scene.world].accent,
                borderRadius: 34,
                padding: "6px 40px",
                boxShadow: "0 8px 0 rgba(20,20,40,0.35)",
              }}
            >
              {ctx.settle > 0.85 ? valueAt(ctx.p) : valueAt(Math.max(0, ctx.p - 1))}
            </div>
          </div>
        )}

        {/* "NONE AT ALL." — a red X and a shake over the empty lower section, so this line has its
            own picture instead of the same plain grey rod as the three lines around it. */}
        {scene.negative && (() => {
          const box = ctx.box;
          const earthTop = box.innerTop + (HEAVEN_H + BEAM_H) * box.scale;
          const earthH = (ABACUS_INNER_H - HEAVEN_H - BEAM_H) * box.scale;
          const cx = ctx.tRodX + wiggle(ctx.frame, FPS, 5, 0.35);
          const cy = earthTop + earthH * 0.5;
          return (
            <svg width={ctx.layout.W} height={ctx.layout.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <g transform={`translate(${cx} ${cy})`} opacity={Math.min(1, ctx.beatProgress * 4)}>
                <circle r={46} fill="#C4284C" opacity={0.16} />
                <line x1={-24} y1={-24} x2={24} y2={24} stroke="#C4284C" strokeWidth={11} strokeLinecap="round" />
                <line x1={24} y1={-24} x2={-24} y2={24} stroke="#C4284C" strokeWidth={11} strokeLinecap="round" />
              </g>
            </svg>
          );
        })()}

        {/* the big answer */}
        {scene.big && (
          <div style={{ position: "absolute", left: 0, top: BIG_TOP + bob(ctx.frame, FPS, 5, 3.4), width: ctx.layout.W, textAlign: "center" }}>
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
            <div style={{ position: "absolute", left: ctx.layout.portrait ? (ctx.layout.W - 353) / 2 : 465, top: ctx.layout.portrait ? 133 : 140 }}>
              <StoreFlow frame={ctx.frame - STORE_START} fps={FPS} height={ctx.layout.portrait ? 720 : 760} span={STORE_FRAMES} />
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
          <div style={{ position: "absolute", left: 0, top: 0, width: ctx.layout.W, height: ctx.layout.H, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <NextUpCard
              progress={ctx.beatProgress}
              title={["one big", "recall game"]}
              example={
                // STAGGERED, word by word — the card holds for 4.3s, the longest still stretch in
                // the episode if left as one static line. Same fix E08's teaser needed.
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 260 }}>
                  {["everything,", "mixed", "up!"].map((w, i) => {
                    const on = Math.max(0, Math.min(1, (ctx.beatProgress - (0.1 + i * 0.16)) / 0.18));
                    return (
                      <span
                        key={w}
                        style={{
                          fontFamily: KID_FONT,
                          fontWeight: 700,
                          fontSize: 34,
                          color: "#C4284C",
                          opacity: on,
                          transform: `translateY(${(1 - on) * 14}px)`,
                        }}
                      >
                        {w}
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

/** For tools/bb_audit.ts */
export const __audit = { sceneFor, PHRASES, SFX_CUES };
