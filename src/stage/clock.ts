// Turning the frame number into scene state. Pure; no React.
//
// Everything here is a function of the absolute frame, never of a <Sequence>-local frame.
// The whole episode drives ONE abacus instance: remounting it between beats restarts its
// idle motion and snaps beads mid-travel, so beats decide *state*, not ownership.

import { interpolate } from "remotion";
import type { RodState } from "../components/Abacus";
import { ROD_DIM } from "../data/tokens";
import { sec, type TPhrase } from "../lib/timing";

/** Index of the phrase being spoken on this frame. */
export const phraseAt = (phrases: TPhrase[], frame: number, fps: number): number => {
  let idx = 0;
  for (const p of phrases) {
    if (sec(p.start, fps) <= frame) idx = p.index;
    else break; // phrases are in time order
  }
  return idx;
};

/** First phrase index satisfying a predicate, or -1. Used for beats whose animation must
 *  run once across several lines rather than restarting on each one. */
export const firstPhraseWhere = (
  phrases: TPhrase[],
  pred: (i: number) => boolean
): number => {
  for (let i = 0; i < phrases.length; i++) if (pred(i)) return i;
  return -1;
};

export interface Clock {
  /** phrase index for this frame */
  p: number;
  /** absolute frame the phrase starts / ends on */
  startF: number;
  endF: number;
  /** 0..1 through the phrase, for props that animate across a whole line */
  beatProgress: number;
  /** 0..1 over the first 10 frames of the phrase — bead travel */
  settle: number;
  /** a small bounce on every new line, so no line is a caption change and nothing else */
  linePop: number;
}

export const clockAt = (phrases: TPhrase[], frame: number, fps: number): Clock => {
  const p = phraseAt(phrases, frame, fps);
  const startF = sec(phrases[p].start, fps);
  const endF = sec(phrases[p].end, fps);
  const ramp = (to: number[], out: number[]) =>
    interpolate(frame, to, out, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return {
    p,
    startF,
    endF,
    beatProgress: ramp([startF, endF], [0, 1]),
    settle: ramp([startF, startF + 10], [0, 1]),
    // Every spoken line must change something on screen, and several lines carry no new
    // bead content ("the beam is very important"). Those lines used to get a new caption
    // and nothing else, which is the one thing a caption is not allowed to be.
    linePop: interpolate(
      frame,
      [startF, startF + 5, startF + 13],
      [1, 1.022, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    ),
  };
};

/** Ramp a numeric scene field across the phrase boundary so nothing snaps. */
export const smoothField = <S,>(
  phrases: TPhrase[],
  frame: number,
  fps: number,
  sceneFor: (p: number) => S,
  pick: (s: S) => number
): number => {
  const i = phraseAt(phrases, frame, fps);
  const startF = sec(phrases[i].start, fps);
  const prev = i > 0 ? pick(sceneFor(i - 1)) : pick(sceneFor(0));
  const now = pick(sceneFor(i));
  return interpolate(frame, [startF, startF + 10], [prev, now], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/**
 * Tell each rod where it is coming FROM, so only the beads the next number needs actually
 * travel. Without this every bead interpolates from its opposite position and the whole
 * abacus re-seats itself on every value change — on screen it reads as a constant reset,
 * and it also shows moves that never happened.
 *
 * `sameRig` guards the one place the rod count changes (5 rods to 13): carrying `from`
 * across a different-length rig would pair rod 0 with a different place value.
 */
export const rodsWithFrom = (
  rods: RodState[],
  prevRods: RodState[],
  sameRig: boolean
): RodState[] =>
  rods.map((r, i) => ({
    ...r,
    from: sameRig ? prevRods[i]?.value ?? r.value : r.value,
  }));

/**
 * Light one rod at a time across the line, stepping through `seq`. The summary line —
 * "every time you move left, the value becomes ten times bigger" — is about the MOVE, so
 * the frame has to keep moving left; a single lit rod stated the rule without showing it.
 */
export const applySweep = (
  rods: RodState[],
  seq: number[],
  frame: number,
  startF: number,
  endF: number
): RodState[] => {
  const frac = Math.max(0, Math.min(0.999, (frame - startF) / Math.max(1, endF - startF)));
  const litRod = seq[Math.min(seq.length - 1, Math.floor(frac * seq.length))];
  return rods.map((r, i) => ({
    ...r,
    focus: i === litRod ? 1 : ROD_DIM,
    value: i === litRod ? 1 : 0,
    from: i === litRod ? 0 : 0,
  }));
};

/** How long each live-beads step lasts, in frames. */
const LIVE_STEP = 14;

/**
 * Beads that actually slide, for the line that says they slide — "it has colorful beads
 * that slide up and down on rods" was showing ONE static value, i.e. beads that do not
 * slide. Each rod steps to a new value every LIVE_STEP frames and travels there.
 */
export const applyLiveBeads = (
  rods: RodState[],
  frame: number,
  startF: number
): { rods: RodState[]; settle: number } => {
  const k = Math.floor(Math.max(0, frame - startF) / LIVE_STEP);
  // a different, non-repeating pattern per rod so it never looks like a counter
  const wave = (i: number, n: number) => {
    const seq = [0, 3, 5, 8, 4, 9, 2, 6, 1, 7];
    return seq[(n * (i + 2) + i * 3) % seq.length];
  };
  return {
    rods: rods.map((r, i) => ({
      ...r,
      from: wave(i, Math.max(0, k)),
      value: wave(i, Math.max(0, k) + 1),
    })),
    settle: ((frame - startF) % LIVE_STEP) / (LIVE_STEP - 1),
  };
};

// ---------------------------------------------------------------- word-anchored timing
//
// Everything used to happen at the PHRASE boundary, so a bead had finished moving about a
// third of a second in — before the words that command it. On "Push one more" the move was
// already over; on "One, two" all the badges appeared at once, which says "two", not
// "one, two". The phrases JSON carries a per-word start time, so the move can land on the
// word that asks for it.
//
// Scoped to the phrase, always. "one" and "two" recur all over this episode, so a global
// word search would find the wrong instance.

const bare = (w: string): string => w.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Number words, in the digit form the aligner canonicalises to. Mirrors canon() in
 *  tools/align_by_matching.py — the two must agree or a badge lands on the wrong word. */
const NUM_WORD: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4,
  five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
};

/**
 * Absolute frame of the nth occurrence of a word WITHIN this phrase, or null.
 *
 * `"$last"` resolves to the phrase's final word. An instruction has to be obeyed AFTER it
 * is spoken, and anchoring to a word inside the sentence is not enough: "push" is the first
 * word of "Push one more", so anchoring there still moved the bead as the line began.
 */
export const wordFrameIn = (
  phrase: TPhrase,
  needle: string,
  fps: number,
  nth = 0
): number | null => {
  if (needle === "$last") {
    const w = phrase.words[phrase.words.length - 1];
    return w ? sec(w.start, fps) : null;
  }
  const target = bare(needle);
  let seen = 0;
  for (const w of phrase.words) {
    if (bare(w.word) === target) {
      if (seen === nth) return sec(w.start, fps);
      seen++;
    }
  }
  return null;
};

/** Absolute frames of every number word in this phrase, in spoken order. */
export const numberWordFrames = (phrase: TPhrase, fps: number): number[] =>
  phrase.words
    .filter((w) => NUM_WORD[bare(w.word)] !== undefined)
    .map((w) => sec(w.start, fps));

/**
 * The highest number VALUE spoken so far in this phrase. Drives the badge reveal, so the
 * count on screen never runs ahead of the voice.
 *
 * The value, not the count of number words — that distinction matters. "One, two, three."
 * names each step, so counting occurrences happens to work; "Three lower beads are touching
 * the beam." names the TOTAL in one word, and counting occurrences gave exactly one badge on
 * a rod holding three beads.
 */
export const spokenCount = (phrase: TPhrase, frame: number, fps: number): number => {
  let n = 0;
  for (const w of phrase.words) {
    if (sec(w.start, fps) > frame) break;
    const v = NUM_WORD[bare(w.word)];
    if (v !== undefined) n = Math.max(n, v);
  }
  return n;
};

/**
 * Step one rod through `from`..`to` across the line, holding each value for an equal share
 * and travelling into it. Returns its own settle so the beads move rather than teleport.
 */
export const applyRodRamp = (
  rods: RodState[],
  spec: { rod: number; from: number; to: number },
  frame: number,
  startF: number,
  endF: number
): { rods: RodState[]; settle: number } => {
  const steps = Math.max(1, spec.to - spec.from + 1);
  const span = Math.max(1, endF - startF);
  const frac = Math.max(0, Math.min(0.9999, (frame - startF) / span));
  const k = Math.floor(frac * steps);
  const value = spec.from + k;
  // travel over the first 60% of each step, then hold — a held value is what makes it
  // readable as a number rather than a blur
  const within = frac * steps - k;
  return {
    rods: rods.map((r, i) =>
      i === spec.rod ? { ...r, from: spec.from + Math.max(0, k - 1), value } : r
    ),
    settle: Math.max(0, Math.min(1, within / 0.6)),
  };
};

/**
 * Vertical slot per card RUN, cycled by run order rather than by line number.
 *
 * Keying it to `start % slots.length` let two consecutive runs land on the same height —
 * E01's rods card and beam card both came out at 330 — so the card appeared not to move at
 * all between two different parts. Returns phrase index -> slot Y for each run's first line.
 */
export const runSlotMap = (
  n: number,
  cardAt: (i: number) => number | undefined,
  slots: number[]
): Record<number, number> => {
  const starts: number[] = [];
  let prev: number | undefined;
  for (let i = 0; i < n; i++) {
    const key = cardAt(i);
    if (key !== undefined && key !== prev) starts.push(i);
    if (key !== undefined) prev = key;
  }
  return Object.fromEntries(starts.map((s, k) => [s, slots[k % slots.length]]));
};

/**
 * A teaching card belongs to a RUN of lines, not to one line. Several consecutive lines
 * can all be about the beam, and the card must sit still across all of them — keying it to
 * the line made it vanish and re-pop at a different slot on every sentence.
 *
 * Walks back from `p` to the first line of the current run. A line with no card but the
 * same subject continues the run; a line about no subject at all ends it.
 *
 * Returns the run's first phrase index, or null when this line has no card.
 */
export const runStartFor = (
  p: number,
  cardAt: (i: number) => number | undefined,
  subjectAt: (i: number) => unknown
): { key: number; start: number } | null => {
  let i = p;
  while (i >= 0 && cardAt(i) === undefined) {
    if (subjectAt(i) === undefined) return null;
    i--;
  }
  if (i < 0) return null;
  const key = cardAt(i)!;
  const subject = subjectAt(i);
  // a line later in the run that changed subject means the run already ended
  for (let j = i + 1; j <= p; j++) if (subjectAt(j) !== subject) return null;
  // Then back to the FIRST line of this run. Without this the walk stops at `p` itself
  // whenever `p` has its own entry, so two lines sharing one card reported different
  // starts and the card jumped between slots.
  let s = i;
  while (s > 0 && cardAt(s - 1) === key) s--;
  return { key, start: s };
};
