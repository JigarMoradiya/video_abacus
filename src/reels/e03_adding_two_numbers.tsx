// E03 · Adding two numbers — 16:9 and 4:5 from one reel.
//
// Level 2 Chapters 1 "Earth Add" and 2 "Heaven Add" in one, using the app's own worked pairs:
// 1+2, 2+2, 0+5, 5+1, 5+4, then 6+3 and 7+1 to show the first number need not be five, then
// 5+2 as the quiz. Every pair is DIRECT — nothing here needs a complement, which is E05.
//
// Timing comes from src/data/e03.phrases.json, aligned from docs/E03_spoken.txt (the AS
// RECORDED text). Word match 544/544. 70 spoken lines -> 71 PHRASES; every index below is a
// phrase index.
//
// TWO THINGS THIS EPISODE DOES DIFFERENTLY, both asked for:
//   · its own abacus palette (RIG_SEA — teal beads on driftwood), because a third episode in
//     E01/E02's orange-on-brown livery is "one episode reskinned" applied to the one object
//     that is on screen the whole time;
//   · a visual change on EVERY phrase. The explanatory lines are the hard ones — "the upper
//     bead is worth five and the lower bead is worth one" moves no beads at all — so those
//     get value chips ON the beads, or the bucket, or the plus character.

import React from "react";
import phrasesJson from "../data/e03.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { E03_CARDS, assertCards } from "../data/e03Cards";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { PlusGuy, type PlusMood } from "../components/e03/PlusGuy";
import { Bucket } from "../components/e03/Bucket";
import { SUM_NAT, SumCard, type SumStep } from "../components/e03/SumCard";
import { Abacus, type RodState } from "../components/Abacus";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { KID_FONT } from "../lib/fonts";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, numberWordFrames, wordFrameIn } from "../stage/clock";
import type { CardSpec, Scene as BaseScene } from "../stage/types";
import { RIG_SEA, WORLDS } from "../data/theme";
import { FPS, PLACE_COLORS, ROD_DIM } from "../data/tokens";

export const AUDIO_SEC = 246.126;
export const E03_DURATION = sec(AUDIO_SEC, FPS); // 7384

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

assertCards((p) => PHRASES[p]?.text ?? "");

interface Scene extends BaseScene {
  /** the plus character's state, and whether it is on screen at all */
  plus?: PlusMood;
  /** pebbles in the bucket — always equal to the rod's value */
  bucket?: number;
  /** what the bucket held before this line, so pebbles drop in rather than appear */
  bucketFrom?: number;
  /** the big answer number in the headline band */
  big?: string;
  /** the sum in COLUMN form, with the row the narration is on */
  sum?: { a: number; b: number; total?: number; step: SumStep };
  /** The your-turn lines. It used to draw its own horizontal "5 + 2 = ?" card; now it only
   *  TINTS the column sum, so the quiz reads as a quiz while the episode keeps one notation. */
  question?: boolean;
}

const BASE = 1.15;

const BIG_TOP = 20;
const BIG_SIZE = 92;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

/**
 * Where the column sum sits — and this is the one element whose PLACE differs between the two
 * cuts, which is exactly what a 4:5 rearrangement is for.
 *
 * 16:9 — the RIGHT GUTTER, level with the top of the abacus. There is ~600 px of it, so the card
 * renders full size right beside the beads. (It began in the headline band, which at 232 px cost it
 * a third of its size and put the sum a long way from the rod it describes.) Top-aligned, because
 * the plus character stands at the bottom of the same gutter.
 *
 * 4:5 — the HEADLINE BAND, centred. Portrait has no usable side gutter: the abacus fills most of
 * 1080 and the finger hand takes the whole of what is left on the right. The headline band is the
 * only region free on every phrase that shows a sum — no sum line in this episode also has a
 * headline or a big number — and at 0.63 of natural the digits come out at ~43 px in a 1080-wide
 * frame, which is proportionally LARGER than the 68 px they get in 1920.
 */
const SUM_EDGE = 40;
const sumBox = (
  box: { left: number; w: number; top: number },
  L: { W: number; portrait: boolean; band: { headlineBottom: number } }
) => {
  if (L.portrait) {
    const room = L.band.headlineBottom - 12;
    const scale = Math.min(1, room / SUM_NAT.h);
    const w = SUM_NAT.w * scale;
    // `left` positions the element at its NATURAL width, and SumCard then scales about its own
    // top-centre — so centring the SCALED width put the card 39 px right of the frame centre. The
    // laid-out box must be centred; the guard box is the scaled one.
    return { scale, x: (L.W - w) / 2, layoutX: (L.W - SUM_NAT.w) / 2, y: 6, w, h: SUM_NAT.h * scale };
  }
  const room = L.W - (box.left + box.w) - SUM_EDGE * 2;
  const scale = Math.max(0.5, Math.min(1, room / SUM_NAT.w));
  const w = SUM_NAT.w * scale;
  const x = L.W - w - SUM_EDGE;
  // scale is 1 in this cut, so the laid-out box and the scaled box are the same
  return { scale, x, layoutX: x - (SUM_NAT.w - w) / 2, y: box.top + 10, w, h: SUM_NAT.h * scale };
};

/**
 * Room reserved beside the abacus in 4:5: the bucket on the left, the plus character on the right.
 *
 * The right figure came down from 250 once the column sum moved to the headline band in this cut —
 * it no longer has to share the gutter. That is 45 px straight back into the abacus, which in
 * portrait is width-limited, so the beads get bigger. The finger hand still reaches into this
 * gutter and past the frame edge, which is allowed and reads naturally.
 */
const PORTRAIT_ROOM = { left: 90, right: 190 };

const rig = (value: number): RodState[] =>
  Array.from({ length: 5 }, (_, i) => ({
    value: i === 0 ? value : 0,
    focus: i === 0 ? 1 : ROD_DIM,
  }));

/** What the rod reads on each phrase, and what it read on the one before. */
const VALUE: Record<number, number> = {
  // hook — the rod recaps E02 by counting itself, then clears
  0: 0, 1: 0, 2: 0, 3: 0,
  // what adding means: make 2, add 1, read 3
  4: 0, 5: 2, 6: 3, 7: 3,
  // one plus two
  8: 0, 9: 1, 10: 1, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3,
  // two plus two
  16: 0, 17: 2, 18: 4, 19: 4, 20: 4,
  // the lower-bead rule — the rod HOLDS four right through it
  21: 4, 22: 4, 23: 4,
  // the upper bead adds five
  24: 4, 25: 0, 26: 0, 27: 5, 28: 5, 29: 5,
  // five plus one
  30: 0, 31: 5, 32: 6, 33: 6, 34: 6,
  // five plus four
  35: 0, 36: 5, 37: 9, 38: 9,
  // any number — six plus three
  39: 9, 40: 0, 41: 5, 42: 6, 43: 6, 44: 9, 45: 9,
  // seven plus one
  46: 9, 47: 0, 48: 5, 49: 7, 50: 8, 51: 8,
  // your turn — five plus two
  52: 0, 53: 0, 54: 5, 55: 7, 56: 7, 57: 7, 58: 7,
  // when the beads run out
  59: 0, 60: 1, 61: 1, 62: 1, 63: 1, 64: 1, 65: 1,
  // close
  66: 0, 67: 0, 68: 0, 69: 0, 70: 0,
};

const valueAt = (p: number) => VALUE[p] ?? 0;

/**
 * The column sum for a section. `firstOn` is the line that makes the starting number, `secondOn`
 * the line that adds, `answerOn` the line that names the total — so the highlighted row always
 * matches the sentence being spoken.
 *
 * Anything else in the span is `"none"`: the announcement ("Now, let's try five plus one") shows
 * the sum but highlights NO row. It used to fall through to `"first"`, which lit the 5 while the
 * rod still read zero — telling the child the first number was already made.
 */
const sumFor = (
  p: number,
  a: number,
  b: number,
  span: [number, number],
  firstOn: number[],
  secondOn: number[],
  answerOn: number
): Scene["sum"] => {
  if (p < span[0] || p > span[1]) return undefined;
  const step: SumStep =
    p >= answerOn
      ? "answer"
      : secondOn.includes(p)
      ? "second"
      : firstOn.includes(p)
      ? "first"
      : "none";
  return { a, b, total: p >= answerOn ? a + b : undefined, step };
};

/**
 * The frame each answer actually LANDS on — the first frame of the line's final word, which is the
 * word that names the total ("...is four"). The burst, the chime and the answer digit all key off
 * this one number, so they cannot drift apart.
 *
 * The last word starts 0.3-0.5 s before its line ends, and the burst runs ~1.1 s, so it necessarily
 * spills into the next phrase — hence the `+ 1` entries. A celebration cut off at a line boundary
 * looks like a dropped frame.
 */
const ANSWER_LINES = [15, 20, 28, 34, 38, 45, 51, 57];
const ANSWER_FRAME = new Map<number, number>();
for (const i of ANSWER_LINES) {
  const f = wordFrameIn(PHRASES[i], "$last", FPS) ?? sec(PHRASES[i].start, FPS);
  ANSWER_FRAME.set(i, f);
}
/** phrase -> the burst's absolute start frame, including the one-phrase tail */
const BURST_FROM = new Map<number, number>();
for (const [i, f] of ANSWER_FRAME) {
  BURST_FROM.set(i, f);
  // 58 and 66 run the sustained "party" instead; don't let a tail overwrite them
  if (i + 1 !== 58 && i + 1 !== 66) BURST_FROM.set(i + 1, f);
}


/**
 * Where the bucket sits, and how big.
 *
 * 16:9 — the left gutter, beside the beads, which is where a second reading of the rod's value
 * belongs: your eye goes rod, bucket, rod.
 *
 * 4:5 — BELOW the abacus, bottom-left. Portrait has 136 px of gutter once the abacus is fitted, and
 * the bucket is 175 wide, so beside is not an option: it was being clipped by the frame edge. It
 * also fixes the 4:5 cut's real compositional problem — 370 px of empty sand under the abacus while
 * the props crowded the sides.
 */
const bucketAt = (
  box: { left: number; top: number; scale: number },
  L: { portrait: boolean; cardBand: { top: number; height: number } | null }
) =>
  L.portrait && L.cardBand
    ? { x: 132, y: L.cardBand.top + 65, scale: 0.85 }
    : { x: box.left - 132 * box.scale, y: box.top + 96, scale: box.scale * 1.05 };

/**
 * The bucket's true extents, from `Bucket`'s own drawing: the pail spans ±75 in x, the handle
 * reaches 64 above the origin and the number plate 190 below it.
 *
 * The guard box used to be derived independently (`175 * scale * 0.72`) while the art was drawn at
 * `scale * 1.05` — two copies of the same arithmetic that disagreed, so the pail could be clipped by
 * the frame edge with the guard reporting nothing wrong. Same bug class as the plus character's box.
 */
const bucketRect = (b: { x: number; y: number; scale: number }) => ({
  x: b.x - 75 * b.scale - 6,
  y: b.y - 64 * b.scale,
  w: 150 * b.scale + 12,
  h: 254 * b.scale,
});

/**
 * Where the plus character stands, and how big.
 *
 * One function, used by BOTH the drawing and the overlap guard's box — they were two copies of the
 * same arithmetic, which is how a character can run off the frame while its guard box says it is
 * fine. In 4:5 it is smaller and tucked closer in: the reserved gutter is 205 px and at the 16:9
 * multiplier the character alone is 230 px wide, so it walked off the right edge.
 */
const plusAt = (
  box: { left: number; w: number; top: number; h: number; scale: number },
  L: { W: number; portrait: boolean; cardBand: { top: number; height: number } | null }
) => {
  // 4:5: bottom-RIGHT, mirroring the bucket. Beside the abacus it needed 230 px of a 136 px gutter
  // and walked off the frame; the finger hand keeps that gutter, which it can because it reaches in
  // from off-screen and is meant to be partly outside the frame.
  if (L.portrait && L.cardBand) {
    const scale = 1.42;
    const r = 56 * scale;
    return { x: L.W - r - 66, y: L.cardBand.top + L.cardBand.height / 2, scale, r };
  }
  const scale = box.scale * 1.7;
  const r = 56 * scale;
  return { x: box.left + box.w + 176 * box.scale, y: box.top + box.h * 0.86, scale, r };
};


/**
 * WHICH FINGER, derived from the move rather than listed per phrase.
 *
 * The hands used to be written out line by line, and the result was the same class of gap as the
 * missing bead arrows: the heaven bead got an index finger on all six of its lines, while thirteen
 * lower-bead pushes got no hand at all. A child watching asked the obvious question — why is there a
 * finger for five and nothing for the beads underneath?
 *
 * Soroban technique, which is what the app teaches:
 *   · earth (lower) beads UP      → THUMB
 *   · earth beads DOWN            → index
 *   · heaven bead, either way     → index
 *
 * Excluded: the six announcement lines where the rod silently clears back to zero ("Now, let's try
 * five plus one"). Those are stagecraft between worked examples, not an instruction to obey, and a
 * hand there would teach a move nobody was asked to make. p25 is NOT excluded even though it ends at
 * zero — "start with all the beads away from the beam" is exactly such an instruction.
 */
const SILENT_RESET = new Set([30, 35, 40, 47, 52, 59]);

const handFor = (p: number): Scene["hand"] => {
  if (p === 0 || p === 66 || SILENT_RESET.has(p)) return undefined;
  const to = valueAt(p);
  const from = p > 0 ? valueAt(p - 1) : 0;
  if (to === from) return undefined;
  const lowerFrom = from % 5;
  const lowerTo = to % 5;
  if (lowerTo > lowerFrom) return { digit: "thumb", direction: "up", rod: 0, heaven: false };
  if (from >= 5 !== to >= 5)
    return { digit: "index", direction: to >= 5 ? "down" : "up", rod: 0, heaven: true };
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod: 0, heaven: false };
  return undefined;
};

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const value = valueAt(p);
  const from = p > 0 ? valueAt(p - 1) : 0;
  const base = {
    stage: "abacus" as const,
    rods: rig(value),
    scale: BASE,
    targetRod: 0,
    highlight: null,
    bucket: value,
    bucketFrom: from,
    hand: handFor(p),
    // A burst belongs to the ANSWER, wherever that answer falls, so it is set once here rather
    // than eight times in eight sections — which is how it came to be missing from p15 first time.
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
  };

  // ---------------------------------------------------------------- 1 · HOOK (harbour)
  if (p <= 3) {
    return {
      ...base,
      world: "harbour",
      // the rod counts itself 0-9, a wordless recap of how E02 ended
      rodRamp: p === 0 ? { rod: 0, from: 0, to: 9 } : undefined,
      bucket: p === 0 ? undefined : 0,
      headline:
        p === 1 ? "Two numbers…" : p === 2 ? "…is called adding" : p === 3 ? "Easy!" : undefined,
      plus: p >= 2 ? "idle" : undefined,
    };
  }

  // ------------------------------------------------- 2 · WHAT ADDING MEANS (sandpit)
  if (p <= 7) {
    return {
      ...base,
      world: "sandpit",
      // "moving more beads to the beam" is a statement about the beam
      band: p === 4 ? "top" : undefined,
      highlight: null,
      plus: p === 6 ? "push" : "idle",
      moveOn: p === 5 ? "number" : p === 6 ? "$last" : undefined,
      big: p === 7 ? "3" : undefined,
    };
  }

  // ---------------------------------------------------------------- 3 · ONE PLUS TWO (pebbles)
  if (p <= 15) {
    const counting = p === 13 || p === 14;
    return {
      ...base,
      world: "pebbles",
      sum: sumFor(p, 1, 2, [8, 15], [9, 10], [11, 12, 13, 14], 15),
      moveOn: p === 9 || p === 11 ? "$last" : undefined,
      plus: p === 11 ? "push" : "idle",
      count: counting || p === 10 ? "active" : null,
      countOnNumbers: p === 13,
      // "One, two." counts the two beads ADDED, which are the 2nd and 3rd on the rod — not
      // the first two. The rod was on 1, so the numbering starts after that bead.
      countFrom: p === 13 ? 1 : undefined,
      countRod: 0,
      // "three lower beads are touching the beam" — the section, not a single bead
      band: p === 14 ? "bottom" : undefined,
    };
  }

  // ---------------------------------------------------------------- 4 · TWO PLUS TWO (shells)
  if (p <= 20) {
    return {
      ...base,
      world: "shells",
      sum: sumFor(p, 2, 2, [16, 20], [17], [18, 19], 20),
      moveOn: p === 17 || p === 18 ? "$last" : undefined,
      plus: p === 18 ? "push" : "idle",
      count: p === 19 ? "active" : null,
      countRod: 0,
      band: p === 19 ? "bottom" : undefined,

    };
  }

  // ------------------------------------------------- 5 · THE LOWER-BEAD RULE (slatecliff)
  if (p <= 23) {
    return {
      ...base,
      world: "slatecliff",
      highlight: p === 22 ? "bottom" : null,
      // "Every lower bead you push up adds one more" — so number all four of them, which says
      // it better than a card. It used to reset the rod from four to one here, which meant three
      // beads dropped DOWN on a line about pushing up, and turning bead arrows on made that
      // contradiction explicit: three down-arrows under the word "up".
      band: p === 21 ? "bottom" : undefined,
      count: p === 21 ? "active" : p === 23 ? "lower" : null,
      // one badge per number as it is SPOKEN ("one, two, three or four"), and only on the rod
      // the sentence is about — all five rods labelled at once said nothing
      countOnNumbers: p === 23,
      countRod: 0,
      counter: p === 23 ? "1 · 2 · 3 · 4" : undefined,
      plus: "idle",
    };
  }

  // --------------------------------------------- 6 · THE UPPER BEAD ADDS FIVE (goldenhour)
  if (p <= 29) {
    return {
      ...base,
      world: "goldenhour",
      band: p === 24 ? "top" : undefined,
      highlight: p === 25 ? "bottom" : p >= 28 ? "top" : null,
      moveOn: p === 25 ? "$last" : p === 27 ? "down" : undefined,
      big: p === 26 ? "0" : p === 28 ? "5" : undefined,
      plus: p === 29 ? "cheer" : "idle",
      headline: p === 29 ? "One bead, one move" : undefined,
    };
  }

  // ---------------------------------------------------------------- 7 · FIVE PLUS ONE (rockpool)
  if (p <= 34) {
    return {
      ...base,
      world: "rockpool",
      sum: sumFor(p, 5, 1, [30, 34], [31], [32, 33], 34),
      moveOn: p === 31 ? "down" : p === 32 ? "$last" : undefined,
      plus: p === 32 ? "push" : "idle",
      // the line that moves no beads at all: each raised bead is labelled with what it is
      // worth, which is precisely what the sentence says
      count: p === 33 ? "active" : null,
      countRod: 0,
    };
  }

  // --------------------------------------------------------------- 8 · FIVE PLUS FOUR (rockpool)
  if (p <= 38) {
    return {
      ...base,
      world: "rockpool",
      sum: sumFor(p, 5, 4, [35, 38], [36], [37], 38),
      moveOn: p === 36 ? "down" : p === 37 ? "$last" : undefined,
      plus: p === 37 ? "push" : "idle",
      count: p === 37 ? "active" : null,
      countRod: 0,
    };
  }

  // ------------------------------------------------- 9 · FROM ANY NUMBER (rockpool)
  if (p <= 51) {
    const six = p >= 40 && p <= 45;
    return {
      ...base,
      world: "rockpool",
      sum: six
        ? sumFor(p, 6, 3, [40, 45], [41, 42, 43], [44], 45)
        : sumFor(p, 7, 1, [47, 51], [48, 49], [50], 51),
      moveOn:
        p === 41 || p === 48 ? "down" : p === 42 || p === 44 || p === 49 || p === 50 ? "$last" : undefined,
      plus: p === 44 || p === 50 ? "push" : "idle",
      // The beads ADDED get the badges. Six is one lower bead plus the upper one, so the three
      // going up for "add three" are the 2nd, 3rd and 4th — countFrom 1, not 0.
      count: p === 44 || p === 49 || p === 50 ? "active" : null,
      countFrom: p === 44 ? 1 : p === 50 ? 2 : undefined,
      countRod: 0,
      // "The rod is showing six/seven" is about the whole column, and numbering the lower beads
      // 1, 2 while the voice says "seven" is simply a wrong caption. Light the rod instead.
      rodBand: p === 43 ? 0 : undefined,
      headline: p === 39 ? "Any number!" : undefined,
    };
  }

  // ---------------------------------------------------------------- 10 · YOUR TURN (sunsetsea)
  if (p <= 58) {
    return {
      ...base,
      world: "sunsetsea",
      question: p <= 53,
      // The prompt is the same column as every other sum, with the answer row showing "?" — a
      // horizontal "5 + 2 = ?" here meant the one line that ASKS the child to work it out used a
      // notation the rest of the episode had stopped using.
      sum: p <= 53 ? { a: 5, b: 2, step: "answer" as SumStep } : sumFor(p, 5, 2, [54, 57], [54], [55, 56], 57),
      moveOn: p === 54 ? "down" : p === 55 ? "$last" : undefined,
      plus: p === 55 ? "push" : p === 58 ? "cheer" : "idle",
      // "The rod is showing seven" — the column, not two numbered beads
      rodBand: p === 56 ? 0 : undefined,
      // the quiz answer earns the biggest reward in the episode
      celebrate: p === 58 ? "party" : BURST_FROM.has(p) ? "burst" : undefined,
      celebrateFrom: BURST_FROM.get(p),
      headline: p === 58 ? "Great job!  ⭐" : undefined,
    };
  }

  // ------------------------------------------- 11 · WHEN THE BEADS RUN OUT (sunsetsea)
  if (p <= 65) {
    return {
      ...base,
      world: "sunsetsea",
      bucket: undefined,
      // no total: this one never resolves, which is the point
      sum: p >= 61 && p <= 63 ? { a: 1, b: 4, step: "second" as SumStep } : undefined,
      moveOn: p === 60 ? "$last" : undefined,
      // one bead rising is a very small change in a 1920 frame; the line says "make one", so
      // the one is worth showing
      big: p === 60 ? "1" : undefined,
      // THE GAG: it shoves, meets no room, and rebounds
      plus: p === 61 ? "push" : p === 62 || p === 63 ? "bounce" : "idle",
      // the card goes LEFT here: the plus guy is mid-bounce on the right
      panelSide: p === 62 ? "left" : undefined,
      highlight: p === 62 ? "bottom" : null,
      // "There are only three lower beads left" — number the three that are LEFT. The rod is on
      // one, so they are beads 2, 3 and 4, and they count 1, 2, 3 as the word is said.
      count: p === 62 ? "lower" : null,
      countFrom: p === 62 ? 1 : undefined,
      countOnNumbers: p === 62,
      countRod: 0,
      headline: p === 65 ? "Very soon…" : undefined,
    };
  }

  // ---------------------------------------------------------------- 12 · CLOSE (sunsetsea)
  return {
    ...base,
    world: "sunsetsea",
    bucket: undefined,
    rodRamp: p === 66 ? { rod: 0, from: 0, to: 9 } : undefined,
    closing: p >= 67,
    closeBeat: p === 67 ? "subscribe" : p <= 69 ? "store" : "next",
    worldWash: p === 68 || p === 69 ? 0.55 : undefined,
    noCaption: p === 68 || p === 69,
    headline: p === 66 ? "Your turn!" : undefined,
    plus: p === 66 ? "cheer" : undefined,
    celebrate: p === 66 ? "party" : undefined,
  };
};

// ---------------------------------------------------------------- rendering

const cardFor = (p: number): CardSpec | undefined => E03_CARDS[p];

const STORE_START = (() => {
  const i = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "store");
  return i < 0 ? 0 : sec(PHRASES[i].start, FPS);
})();

const STORE_FRAMES = (() => {
  const idx = PHRASES.map((x) => x.index).filter((i) => sceneFor(i).closeBeat === "store");
  if (!idx.length) return 181;
  return sec(PHRASES[idx[idx.length - 1]].end, FPS) - STORE_START;
})();

/**
 * Sound derived from the script: a bead click wherever the rod's value really changes, ON the
 * word that moves it; a tick per spoken number in a counted run; the app's chime on each
 * answer; and a comic thud when the plus guy bounces off.
 */
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
  for (const i of [13, 19, 23, 37, 62]) {
    for (const f of numberWordFrames(PHRASES[i], FPS)) add(f, "tick.mp3", 12, 0.28);
  }
  // Each answer lands. Anchored to the word that NAMES the total, the same frame the burst uses —
  // it was on "is", which is mid-sentence, so the chime and the confetti both went off before the
  // child had heard the answer.
  for (const i of ANSWER_LINES) {
    add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);
  }
  add(at(58), "clap.mp3", 90, 0.28);
  // the reveal of the upper bead, and the gag
  add(at(24) - 12, "reveal5.mp3", 64, 0.44);
  add(on(62, "only"), "nope.mp3", 34, 0.4);
  add(at(63), "boing.mp3", 24, 0.34);

  let prevKey: number | undefined;
  for (let i = 0; i < PHRASES.length; i++) {
    const key = E03_CARDS[i]?.key;
    if (key !== undefined && key !== prevKey) add(at(i), "swipe.mp3", 14, 0.22);
    if (key !== undefined) prevKey = key;
  }
  // the two self-counting runs, one click per number
  for (const i of [0, 66]) {
    const span = sec(PHRASES[i].end, FPS) - at(i);
    for (let k = 1; k <= 9; k++) add(at(i) + (span * k) / 10, "abacus_move.mp3", 22, 0.24);
  }
  // like / subscribe / store
  const p67 = at(67);
  const len67 = sec(PHRASES[67].end, FPS) - p67;
  add(p67 + len67 * 0.14, "btn_click.mp3", 20, 0.3);
  add(p67 + len67 * 0.42, "btn_click.mp3", 20, 0.3);
  add(p67 + len67 * 0.58, "bell.mp3", 46, 0.34);
  const rate = STORE_FRAMES / 136;
  add(STORE_START + 50 * rate, "btn_click.mp3", 20, 0.28);
  add(STORE_START + 92 * rate, "btn_click.mp3", 20, 0.3);
  add(STORE_START + 136 * rate - 8, "play_win.mp3", 60, 0.26);
  add(at(70), "swipe.mp3", 16, 0.24);
  return cues;
})();

export const E03AddingTwoNumbers: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e003_one_to_nine_addition/E03.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={0}
    cardFor={cardFor}
    subjectFor={() => undefined}
    runSlots={[150, 300, 210, 360]}
    guardOverlap
    arrowClearance
    // its own abacus: teal beads on driftwood, not E01/E02's orange on brown
    palette={RIG_SEA}
    // an arrow on the bead that is about to move, on EVERY line that moves one
    beadArrows
    // a bead stays sand-coloured until it actually reaches the beam
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
      if (scene.sum) {
        const b = sumBox(ctx.box, L);
        out.push({ label: "sum", r: { x: b.x, y: b.y, w: b.w, h: b.h } });
      }
      if (scene.plus && scene.plus !== "idle" && !scene.hand) {
        const g = plusAt(ctx.box, L);
        out.push({
          label: "plusGuy",
          r: { x: g.x - g.r, y: g.y - g.r, w: g.r * 2, h: g.r * 2 },
        });
      }
      if (scene.bucket !== undefined) {
        out.push({ label: "bucket", r: bucketRect(bucketAt(ctx.box, L)) });
      }
      return out;
    }}
    renderUnder={(scene, ctx) => (
      <>
        {scene.bucket !== undefined && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <Bucket
              count={scene.bucket}
              from={scene.bucketFrom ?? scene.bucket}
              settle={ctx.settle}
              {...bucketAt(ctx.box, ctx.layout)}
              frame={ctx.frame}
              fps={FPS}
            />
          </svg>
        )}

        {/* The sum in column form, in the right gutter beside the beads. */}
        {scene.sum && (() => {
          const b = sumBox(ctx.box, ctx.layout);
          // The card holds still across a worked example and only pops in when the sum is NEW,
          // so a five-line example does not blink at every line boundary.
          const prev = ctx.p > 0 ? sceneFor(ctx.p - 1) : undefined;
          const sameRun =
            prev?.sum !== undefined &&
            prev.sum.a === scene.sum!.a &&
            prev.sum.b === scene.sum!.b;
          return (
            <div style={{ position: "absolute", left: b.layoutX, top: b.y }}>
              <SumCard
                a={scene.sum.a}
                b={scene.sum.b}
                // The answer digit appears on the SAME frame as the burst and the chime — the word
                // that names it. It used to be there from the answer line's first frame, so the
                // card gave the answer away while the voice was still building to it.
                total={
                  ANSWER_FRAME.has(ctx.p) && ctx.frame < ANSWER_FRAME.get(ctx.p)!
                    ? undefined
                    : scene.sum.total
                }
                step={scene.sum.step}
                prevStep={sameRun ? prev!.sum!.step : "none"}
                popIn={!sameRun}
                // the quiz keeps the ones-place colour, so "your turn" still looks different
                bg={scene.question ? PLACE_COLORS[0] : WORLDS[scene.world].accent}
                progress={ctx.beatProgress}
                scale={b.scale}
              />
            </div>
          );
        })()}
      </>
    )}
    renderOver={(scene, ctx) => (
      <>
        {scene.plus && scene.plus !== "idle" && !scene.hand && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <PlusGuy
              {...(({ x, y, scale }) => ({ x, y, scale }))(plusAt(ctx.box, ctx.layout))}
              mood={scene.plus}
              progress={ctx.beatProgress}
              frame={ctx.frame}
              fps={FPS}
            />
          </svg>
        )}

        {scene.big && (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: ctx.layout.W,
              top: BIG_TOP + bob(ctx.frame, FPS, 5, 3.6),
              textAlign: "center",
            }}
          >
            <Card bg={PLACE_COLORS[0]} radius={36}>
              <StickerText size={BIG_SIZE}>{scene.big}</StickerText>
            </Card>
          </div>
        )}

        {scene.closing && (() => {
          const pt = ctx.layout.portrait;
          return (
            <div
              style={{
                position: "absolute",
                top: ctx.layout.band.stageTop - 90,
                left: 0,
                width: ctx.layout.W,
                height: ctx.layout.band.stageBottom - ctx.layout.band.stageTop + 140,
              }}
            >
              {scene.closeBeat === "subscribe" && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: pt ? 0 : 200,
                      top: pt ? 80 : 150,
                      width: pt ? ctx.layout.W : undefined,
                      display: pt ? "flex" : undefined,
                      justifyContent: pt ? "center" : undefined,
                    }}
                  >
                    <SubscribeCard
                      progress={ctx.beatProgress}
                      frame={ctx.frame - ctx.phraseStart}
                      fps={FPS}
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      left: pt ? 0 : 900,
                      // SubscribeCard is TWO pills — Like and a red Subscribe — 246 px tall in
                      // total. At 250 this card covered the Subscribe button completely; the
                      // closing beats are not registered with the overlap guard, so nothing caught
                      // it. 80 + 246 + 40 of clearance.
                      top: pt ? 366 : 190,
                      width: pt ? ctx.layout.W : 840,
                      display: pt ? "flex" : undefined,
                      justifyContent: pt ? "center" : undefined,
                    }}
                  >
                    <Card bg="rgba(255,255,255,0.96)" radius={44}>
                      <StickerText
                        size={pt ? 46 : 54}
                        color="#1F3B4D"
                        style={{ display: "block", textAlign: "left", textShadow: "none" }}
                      >
                        {"Enjoyed this?\nLike and subscribe\nfor more"}
                      </StickerText>
                    </Card>
                  </div>
                </>
              )}

              {scene.closeBeat === "store" && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      // The 4:5 phone was 245 px in a 1080 frame — under a quarter of the width,
                      // and too narrow for the store listing's own text to sit on one line.
                      left: pt ? (ctx.layout.W - 353) / 2 : 300,
                      top: pt ? 6 : 20,
                    }}
                  >
                    <StoreFlow
                      frame={ctx.frame - STORE_START}
                      fps={FPS}
                      height={pt ? 720 : 760}
                      span={STORE_FRAMES}
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      left: pt ? 0 : 1090,
                      // follows the taller phone down; 0.7 keeps the whole CTA above the caption
                      top: pt ? 760 : 90,
                      width: pt ? ctx.layout.W : undefined,
                      display: pt ? "flex" : undefined,
                      justifyContent: pt ? "center" : undefined,
                      transform: pt ? "scale(0.7)" : undefined,
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
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <NextUpCard
                    progress={ctx.beatProgress}
                    title={["bigger", "numbers"]}
                    example={
                      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <Abacus
                          rods={[
                            { value: ctx.beatProgress > 0.45 ? 4 : 0, from: 0 },
                            { value: ctx.beatProgress > 0.45 ? 2 : 0, from: 0 },
                          ]}
                          settle={Math.max(
                            0,
                            Math.min(1, (ctx.beatProgress - 0.45) / 0.25)
                          )}
                          scale={0.52}
                          palette={RIG_SEA}
                        />
                        <span
                          style={{
                            fontFamily: KID_FONT,
                            fontWeight: 700,
                            fontSize: 96,
                            color: ctx.beatProgress > 0.45 ? "#0E7C86" : "#AFC2C9",
                          }}
                        >
                          {ctx.beatProgress > 0.45 ? "24" : "??"}
                        </span>
                      </div>
                    }
                  />
                </div>
              )}
            </div>
          );
        })()}
      </>
    )}
  />
);
