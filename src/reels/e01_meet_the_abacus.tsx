// E01 · Meet the Abacus — 16:9
//
// Structure note: there are no per-beat <Sequence> wrappers around the abacus. The
// whole episode drives ONE abacus instance from the absolute frame, because a remount
// between beats would restart its idle motion and reset bead positions mid-transition.
// Beats exist to decide *state*, not to own components.
//
// Timing comes from public/audio/about_abacus/about_abacus.phrases.json, produced by
// tools/align_by_matching.py. Worst measured drift vs the audio is 0.50 s.

import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import phrasesJson from "../data/e01.phrases.json";
import { makeTrack, planBeats, sec, type TPhrase } from "../lib/timing";
import { World } from "../components/World";
import { PartArrow, type Pt } from "../components/PartArrow";
import { BeadWorth, SumBreakdown } from "../components/BeadWorth";
import { Tooltip, tooltipWidth, tooltipLines, cardHeight } from "../components/Tooltip";
import { LINE_TOOLTIP, LINE_HIGHLIGHT, LINE_COUNT } from "../data/lineMap";
import { NextUpCard } from "../components/Outro";
import { LandscapeFreeMode, StoreFlow, DownloadCta } from "../components/AppShowcase";
import { HeadlinePill, BrandBadge, PoweredBy } from "../components/Brand";
import {
  CountingRun,
  CountingFingers,
  MissingStep,
  HistoryTimeline,
} from "../components/HookProps";
import { WORLDS, type WorldKind } from "../data/theme";
import { Abacus, type RodState } from "../components/Abacus";
import { Caption } from "../components/Caption";
import { FingerHand } from "../components/FingerHand";
import { Card, Chip, StickerText } from "../components/Sticker";
import { bob, pulse } from "../lib/motion";
import { TYPE } from "../lib/fonts";
import {
  ABACUS_INNER_H,
  BAND,
  BEAD_H,
  BEAM_H,
  FPS,
  FRAME_LW,
  H,
  HEAVEN_H,
  PLACE_COLORS,
  PLACE_NAMES,
  ROD_DIM,
  ROD_PITCH,
  THEME,
  W,
} from "../data/tokens";

export const AUDIO_SEC = 259.474;
export const E01_DURATION = sec(AUDIO_SEC, FPS); // 7784

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

export const E01_BEATS = planBeats(track, [
  { id: "hook", from: 0, to: 4 },
  { id: "what", from: 5, to: 7 },
  { id: "outside", from: 8, to: 15 },
  { id: "halves", from: 16, to: 25 },
  { id: "start", from: 26, to: 28 },
  { id: "values", from: 29, to: 40 },
  { id: "capacity", from: 41, to: 45 },
  { id: "bigsmall", from: 46, to: 50 },
  { id: "fingers", from: 51, to: 59 },
  { id: "read", from: 60, to: 66 },
  { id: "yourturn", from: 67, to: 71 },
  { id: "close", from: 72, to: 78 },
]);


// ---------------------------------------------------------------- line-by-line labels
//
// Labels for lines the app has no tooltip for.
//
// Lines 10-23 were REMOVED: that block is served by LINE_TOOLTIP, and the four entries
// that still rendered (16, 17, 20, 22) were shifted by one — line 20 "Look at the top"
// was labelled "Bottom section". Same hand-numbering mistake as the tooltip table, in a
// second place. Everything kept below is verified against its line by
// tools/check_line_sync.py.
//
// Keep these SHORT: the caption already carries the sentence. A label names the thing.
const LABELS: Record<number, string> = {
  // the outside
  // the two halves
  24: "heaven = upper\nearth = lower",
  25: "we say upper & lower",
  // where to start
  26: "the far-right rod",
  27: "Ones column",
  28: "start here\n(small abacus)",
  // what each bead is worth — the point of the section, said plainly
  29: "1 lower bead = 1",
  30: "1 upper bead = 5",
  31: "one bead\nworth five!",
  32: "that's the trick",
  33: "move one rod left",
  34: "10x bigger",
  35: "1 lower bead = 10",
  36: "1 upper bead = 50",
  37: "one more rod left",
  38: "1 lower bead = 100",
  39: "1 upper bead = 500",
  40: "each rod left\n= 10x",
  // how much it holds
  42: "1 rod = 0-9",
  43: "2 rods = 0-99",
  44: "3 rods = 0-999",
  45: "more rods = bigger numbers",
  // big vs small
  47: "our app: 13 rods",
  48: "big abacus\nones in the MIDDLE",
  49: "right rods = decimals",
  50: "small abacus\nstart far right",
  // fingers
  51: "the finger trick",
  52: "only two fingers",
  53: "thumb + index",
  // reading a number
  61: "upper bead is down",
  62: "5",
  63: "3 lower beads up",
  64: "5 + 3",
  65: "5 + 3",
  66: "5 + 3 = 8",
  // your turn
  69: "7",
  70: "1 upper = 5\n2 lower = 2\n5 + 2 = 7",
  71: "Great!",
};

// ---------------------------------------------------------------- scene state

type Highlight = "frame" | "rods" | "beam" | "top" | "bottom" | null;

type StageProp = "abacus" | "counting" | "fingers" | "missingstep" | "calculator";

interface Scene {
  world: WorldKind;
  /** What is actually on stage. The abacus is a prop, not furniture: it must not be on
   *  screen before line 4 names it. */
  stage: StageProp;
  rods: RodState[];
  highlight: Highlight;
  scale: number;
  /** headline shown in the headline band */
  headline?: string;
  /** label chips beside the stage */
  sideLabel?: { text: string; color: string };
  hand?: { digit: "thumb" | "index"; direction: "up" | "down"; rod: number; heaven: boolean };
  counter?: string;
  count?: "upper" | "lower" | "active" | null;
  /** Show the bead being valued next to what it is worth. */
  beadWorth?: { which: "upper" | "lower"; worth: number };
  /** Answers and prompts sit ABOVE the abacus; part labels sit beside it. */
  labelPos?: "side" | "above";
  closeBeat?: "show" | "tap" | "move" | "play" | "store" | "next";
  /** Rod this line is about; 0 = ones = RIGHTMOST. Drives the arrow target and which
   *  side the tooltip sits on, so the pointer is always short and unambiguous. */
  targetRod?: number;
  /** Force the panel to one side. The finger beats need it: the hand reaches in from the
   *  right of the ones rod, so a panel auto-placed on the right sits on top of it. */
  panelSide?: "left" | "right";
  /** "aboveRod" centres the card over its target rod and points the arrow straight down.
   *  Used where the line names a COLUMN rather than a part — "this is the ones column" —
   *  which has no anatomical highlight, so a side card had nothing to attach to. */
  panelPlace?: "side" | "aboveRod";
  /** Text under the target rod, naming it. The 13-rod view needs it: the whole point is
   *  WHICH rod is the ones column, and that cannot be shown by a card alone. */
  centreNote?: string;
  /** Beads keep moving for the whole line. "It has colorful beads that slide up and down
   *  on rods" was showing ONE static value, i.e. beads that do not slide. */
  liveBeads?: boolean;
  /** Rich reveal for the your-turn answer: how many of each bead, and the sum. */
  sumBreakdown?: { upper: number; lower: number };
  /** Light these rods one after another across the line. "Every time you move left, the
   *  value becomes ten times bigger" is about the MOVE, so the frame has to keep moving
   *  left — a single lit rod stated the rule without demonstrating it. */
  sweepRods?: number[];
  /** Mark a whole SECTION as a band — frame-top to beam, or beam to frame-bottom. The two
   *  lines that name a section are about the region, so the region is what gets marked. */
  band?: "top" | "bottom";
  /** Mark a whole ROD as a vertical band, top of the frame to the bottom. "This is the ones
   *  column / unit's place" is about the column, so the column is what gets marked — a
   *  single lit bead did not say "this whole rod". */
  rodBand?: number;
  /** Draw a box around this many rods, counted from the ones rod. Used by the capacity
   *  lines, which talk about a GROUP of columns rather than a single bead. */
  boxRods?: number;
  question?: boolean;
  rulesCard?: boolean;
  closing?: boolean;
  decimals?: boolean;
}

/**
 * The line at which each rod's value strips are first stated out loud. A strip must not
 * appear before its line: the video showed "5" above the ones rod while the narration was
 * still on "each lower bead is worth one".
 */
const LOWER_STATED_AT: Record<number, number> = { 0: 29, 1: 35, 2: 38, 3: 40, 4: 40 };
const UPPER_STATED_AT: Record<number, number> = { 0: 30, 1: 36, 2: 39, 3: 40, 4: 40 };
// 3 and 4 land on line 40 — "every time you move left, the value becomes ten times
// bigger" — which is the line that generalises the pattern, so all five rods must be
// labelled by then. They were set to 45 and the frame showed only 5/50/500 and 1/10/100.
// 3 and 4 land on line 45 — "and bigger abacuses can show even bigger numbers" — which is
// the moment the thousands and ten-thousands strips become the point of the sentence. They
// were absent entirely before, so the rods the line is about carried no values.

const mk = (
  values: number[],
  opts: { lit?: number[]; upTo?: number } = {}
): RodState[] =>
  values.map((v, i) => ({
    value: v,
    focus: opts.lit ? (opts.lit.includes(i) ? 1 : ROD_DIM) : 1,
    chipLower:
      opts.upTo !== undefined &&
      LOWER_STATED_AT[i] !== undefined &&
      opts.upTo >= LOWER_STATED_AT[i],
    chipUpper:
      opts.upTo !== undefined &&
      UPPER_STATED_AT[i] !== undefined &&
      opts.upTo >= UPPER_STATED_AT[i],
  }));

// Stage band is 620 px and the abacus is 477 px tall at scale 1, so it floated small
// in a 1080 frame. BASE fills the band without crossing it; PUSH is the close-up used
// for the finger work, where bead-level detail is the point. 477 * 1.30 = 620 exactly.
const BASE = 1.15;
const PUSH = 1.3;

/**
 * Slot for each tooltip RUN, cycled by run order rather than by line number.
 * Keying it to `start % 3` let two consecutive runs land on the same height — the rods
 * card and the beam card both came out at 330 — so the panel appeared not to move at all
 * between two different parts.
 */
const RUN_SLOT: Record<number, number> = (() => {
  const starts: number[] = [];
  let prev: number | undefined;
  for (let i = 0; i < 200; i++) {
    const step = LINE_TOOLTIP[i];
    if (step !== undefined && step !== prev) starts.push(i);
    if (step !== undefined) prev = step;
  }
  const slots = [120, 265, 195, 345];
  return Object.fromEntries(starts.map((s, k) => [s, slots[k % slots.length]]));
})();

/** The label for this line, or none if the line doesn't need one. */
const lab = (p: number, color: string): Scene["sideLabel"] =>
  LABELS[p] ? { text: LABELS[p], color } : undefined;

const FIVE = [0, 0, 0, 0, 0];
const wide13 = (): RodState[] =>
  Array.from({ length: 13 }, () => ({ value: 0, focus: 1 as number }));

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  // 1 · HOOK — the abacus is NOT here yet. Lines 1-3 are about counting, fingers and a
  // missing step, so that is what the stage shows. Line 4 says "This is an abacus" and
  // that is the first frame it appears on.
  if (p <= 2)
    return {
      world: "problem",
      stage: p === 0 ? "counting" : p === 1 ? "fingers" : "missingstep",
      rods: mk(FIVE),
      highlight: null,
      scale: BASE,
      headline:
        p === 0 ? "Counts to 100…" : p === 1 ? "…but 7 + 8?" : "One step is missing",
    };
  if (p <= 4)
    return {
      world: "problem",
      stage: "abacus",
      rods: mk([8, 0, 0, 0, 0]),
      highlight: null,
      scale: BASE,
      headline: "Meet the abacus",
    };

  // 2 · WHAT AN ABACUS IS — beads actually slide, so the claim is demonstrated.
  // Line 7 talks about calculators, so line 7 shows a calculator.
  if (p <= 7)
    return {
      world: "meadow",
      stage: p === 7 ? "calculator" : "abacus",
      rods: mk([p === 5 ? 3 : 7, 0, 0, 0, 0]),
      highlight: null,
      scale: BASE,
      liveBeads: p === 6,
      headline: p === 7 ? "Older than any calculator" : "A counting tool",
    };

  // 3 · THE OUTSIDE — one part lit at a time. Which part comes from LINE_HIGHLIGHT,
  // generated by matching the spoken text, so it cannot drift out of step again.
  if (p <= 15) {
    const hl: Highlight = LINE_HIGHLIGHT[p] ?? null;
    return {
      world: "blueprint",
      stage: "abacus",
      rods: mk(FIVE),
      highlight: hl,
      scale: BASE,
      sideLabel: lab(p, THEME.c800),
    };
  }

  // 4 · THE TWO HALVES
  if (p <= 25) {
    const hl: Highlight = LINE_HIGHLIGHT[p] ?? null;
    const count = LINE_COUNT[p] ?? null;
    const label = lab(p, THEME.c800);
    const band: Scene["band"] = /above the beam is the top/i.test(PHRASES[p].text)
      ? "top"
      : /below the beam is the bottom/i.test(PHRASES[p].text)
      ? "bottom"
      : undefined;
    return {
      world: "heavenearth",
      stage: "abacus",
      rods: mk(FIVE),
      highlight: hl,
      scale: BASE,
      sideLabel: label,
      count,
      band,
    };
  }

  // 5 · WHERE TO START. The take says "we always start" — a false rule on a 13-rod
  // abacus. The side label carries the qualifier the voice omits; 7a then corrects it.
  if (p <= 28)
    return {
      world: "spotlight",
      stage: "abacus",
      rods: mk(FIVE, { lit: [0] }),
      highlight: null,
      scale: BASE,
      sideLabel: lab(p, PLACE_COLORS[0]),
      targetRod: 0,
      panelPlace: "aboveRod",
      rodBand: 0,
    };

  // 6 · WHAT EACH BEAD IS WORTH — walks the app's own place-value colours.
  // Six of these lines state a bead's value outright ("each lower bead is worth ten"),
  // so those show the bead beside the number instead of describing it in words.
  if (p <= 40) {
    // One entry per line. `value` is what the rod must READ for the sentence to be true:
    // "each lower bead is worth ten" shows ONE lower bead up on the tens rod, not four —
    // the old version showed 4 beads for every line and 5 only where a card existed, so
    // the abacus contradicted the words on half of them.
    const VAL: Record<
      number,
      { place: number; value: number; which?: "upper" | "lower"; worth?: number }
    > = {
      29: { place: 0, value: 1, which: "lower", worth: 1 },
      30: { place: 0, value: 5, which: "upper", worth: 5 },
      31: { place: 0, value: 5, which: "upper", worth: 5 },
      32: { place: 0, value: 5 },
      33: { place: 1, value: 0 },
      34: { place: 1, value: 0 },
      35: { place: 1, value: 1, which: "lower", worth: 10 },
      36: { place: 1, value: 5, which: "upper", worth: 50 },
      37: { place: 2, value: 0 },
      38: { place: 2, value: 1, which: "lower", worth: 100 },
      39: { place: 2, value: 5, which: "upper", worth: 500 },
      40: { place: 3, value: 1 }, // handled by the sweep below
    };
    const v = VAL[p] ?? { place: 0, value: 0 };
    const values = [...FIVE];
    values[v.place] = v.value;
    const bw = v.worth !== undefined && v.which ? { which: v.which, worth: v.worth } : undefined;
    return {
      world: "placebands",
      stage: "abacus",
      rods: mk(values, { lit: [v.place], upTo: p }),
      // Do NOT dim the half that holds the moving bead — on "the upper bead is worth
      // five" the upper bead is the subject, so quieting the lower half is right; the
      // reverse case must not quiet the beads the viewer is being asked to look at.
      highlight: v.which === "upper" ? "top" : v.which === "lower" ? "bottom" : null,
      scale: BASE,
      sideLabel: bw ? undefined : lab(p, PLACE_COLORS[v.place]),
      beadWorth: bw,
      targetRod: v.place,
      // step left through the thousands and ten-thousands rods on the summary line
      sweepRods: p === 40 ? [3, 4] : undefined,
    };
  }

  // 7 · HOW MUCH IT HOLDS — rod count lit matches the words exactly.
  if (p <= 45) {
    const n = p <= 41 ? 1 : p === 42 ? 1 : p === 43 ? 2 : p === 44 ? 3 : 5;
    const values = [...FIVE].map((_, i) => (i < n ? 9 : 0));
    return {
      world: "counter",
      stage: "abacus",
      rods: mk(values, { lit: Array.from({ length: n }, (_, i) => i), upTo: p }),
      highlight: null,
      scale: BASE,
      counter: p <= 42 ? "0 – 9" : p === 43 ? "0 – 99" : p === 44 ? "0 – 999" : "and up",
      sideLabel: lab(p, PLACE_COLORS[0]),
      boxRods: n, // these lines are about a group of columns, so box the group
      targetRod: n - 1,
    };
  }

  // 7a · BIG ABACUS, SMALL ABACUS — the one place the rod count changes. It widens
  // the same instance rather than mounting a second abacus.
  if (p <= 50) {
    if (p >= 50)
      return {
        world: "compare",
        stage: "abacus",
        rods: mk(FIVE, { lit: [0] }),
        highlight: null,
        scale: BASE,
        sideLabel: lab(p, PLACE_COLORS[0]),
      };
    const rods = wide13();
    const decimalLine = /used for decimals/i.test(PHRASES[p].text);
    if (decimalLine) {
      // rod 0 is the RIGHTMOST, so the decimal rods are 0-5. The highlight used to stay on
      // the centre rod — i.e. it marked the ones column on the line about decimals.
      rods.forEach((r, i) => (r.focus = i <= 5 ? 1 : ROD_DIM));
    } else if (p >= 48) {
      rods.forEach((r, i) => (r.focus = i === 6 ? 1 : ROD_DIM));
    }
    return {
      world: "compare",
      stage: "abacus",
      rods,
      highlight: null,
      // 0.62 left the 13 rods small and the beads hard to read; 0.78 is 1166 px wide,
      // still clear of the frame edges
      scale: 0.78,
      targetRod: decimalLine ? 2 : 6,
      panelPlace: "aboveRod",
      rodBand: decimalLine ? undefined : 6, // the centre rod IS the ones column

      boxRods: decimalLine ? 6 : undefined, // box the six rods right of the ones rod
      centreNote: p >= 48 ? "Unit place · ones rod" : undefined,
      sideLabel: lab(p, p >= 48 ? PLACE_COLORS[2] : THEME.c800),
      decimals: p >= 49,
    };
  }

  // 8 · THE TWO FINGERS — pushed in, because bead-level detail is the point.
  if (p <= 59) {
    // 0 -> 3 -> 8 -> 5 -> 0. Each step changes EXACTLY the thing its line names, and
    // nothing else. The old sequence went 3 -> 5 on "add the upper bead", which brings
    // the heaven bead down AND silently drops three lower beads — two moves, one of them
    // contradicting the narration. Checked against the app's own rules
    // (freeModeHighlightSteps 14-17): thumb adds lower, index adds upper, index takes
    // lower, thumb takes upper.
    const base = mk([0, 0, 0, 0, 0], { lit: [0] });
    let hand: Scene["hand"];
    let value = 0;
    if (p === 54) {
      value = 3; // + 3 lower, thumb up
      hand = { digit: "thumb", direction: "up", rod: 0, heaven: false };
    } else if (p === 55) {
      value = 8; // + upper bead (3 -> 8), index down; the 3 lower beads stay put
      hand = { digit: "index", direction: "down", rod: 0, heaven: true };
    } else if (p === 56) {
      value = 5; // - 3 lower (8 -> 5), index down; the upper bead stays down
      hand = { digit: "index", direction: "down", rod: 0, heaven: false };
    } else if (p === 57) {
      value = 0; // - upper bead (5 -> 0), thumb up
      hand = { digit: "thumb", direction: "up", rod: 0, heaven: true };
    } else if (p >= 58) {
      value = 0;
    }
    base[0].value = value;
    return {
      world: "bench",
      stage: "abacus",
      rods: base,
      targetRod: 0,
      panelSide: "left", // the hand occupies the right of the ones rod
      highlight: null,
      scale: PUSH,
      hand,
      sideLabel: lab(p, THEME.c800),
      rulesCard: p >= 58,
    };
  }

  // 9 · READ YOUR FIRST NUMBER
  if (p <= 66) {
    const value = p <= 60 ? 0 : p <= 62 ? 5 : 8;
    return {
      world: "chalk",
      stage: "abacus",
      rods: mk([value, 0, 0, 0, 0], { lit: [0] }),
      highlight: null,
      scale: PUSH,
      count: p >= 63 ? "active" : null,
      sideLabel: lab(p, PLACE_COLORS[0]),
      labelPos: "above",
    };
  }

  // 10 · YOUR TURN — the recall gap is real in the take (1.8 s of silence).
  if (p <= 71)
    return {
      world: "quiz",
      stage: "abacus",
      rods: mk([7, 0, 0, 0, 0], { lit: [0] }),
      highlight: null,
      scale: PUSH,
      question: p <= 68,
      // 71 is praise — the headline carries it, so no second card beside the abacus
      sideLabel: p === 70 || p === 71 ? undefined : lab(p, PLACE_COLORS[0]),
      sumBreakdown: p === 70 ? { upper: 1, lower: 2 } : undefined,
      headline: p === 71 ? "Great job!  ⭐" : undefined,
      // the answer sits beside the beads it explains, on their side of the frame
      labelPos: p <= 68 ? "above" : "side",
      targetRod: 0,
      // "one upper bead and two lower beads" -> mark the beads that are actually up,
      // each with what it contributes, so the 7 is visibly 5 + 1 + 1
      count: p === 70 ? "active" : null,
    };

  // 11 · CLOSE — four separate lines, so four separate visuals.
  //   72 the app          -> phone showing Free Mode
  //   73 "tap every bead" -> tap ripple on the phone
  //   74 "move them"      -> a bead actually moves
  //   75 "learn by playing" -> praise on the phone
  //   76-77 the stores    -> the real badges
  //   78 next episode     -> the ones rod takes a 1
  return {
    world: "celebrate",
    stage: "abacus",
    rods: mk([7, 0, 0, 0, 0]),
    highlight: null,
    scale: BASE * 0.85,
    closing: true,
    closeBeat:
      p <= 72 ? "show" : p === 73 ? "tap" : p === 74 ? "move" : p === 75 ? "play" : p <= 77 ? "store" : "next",
  };
};

// ---------------------------------------------------------------- rendering

/**
 * Sound cues, derived from the script rather than hand-placed: the app's bead click
 * wherever a rod value actually changes, its correct-answer chime on a reveal, its clap on
 * praise. Kept quiet so nothing competes with the narration — at 0.42/0.5/0.45 the clap
 * pushed the mix to 0.0 dB peak, i.e. clipping.
 */
const SFX_CUES: { frame: number; file: string; len: number; vol: number }[] = (() => {
  const cues: { frame: number; file: string; len: number; vol: number }[] = [];
  const valuesOf = (i: number) => sceneFor(i).rods.map((r) => r.value).join(",");

  // THE reveal. Line 3 is "This is an abacus." and it is the first frame the abacus
  // exists, so it gets its own sting — synthesised in tools/make_reveal_sfx.py rather than
  // taken from the app, whose sounds are all UI feedback and none of them announce
  // anything. Starts 12 frames early so the rise leads in and the arpeggio lands on the
  // word rather than trailing after it.
  cues.push({
    frame: Math.max(0, sec(PHRASES[3].start, FPS) - 12),
    file: "reveal.mp3",
    len: 64,
    vol: 0.5,
  });

  // a short air-swish whenever a new teaching card arrives
  let prevStep: number | undefined;
  for (let i = 0; i < PHRASES.length; i++) {
    const step = LINE_TOOLTIP[i];
    if (step !== undefined && step !== prevStep) {
      cues.push({ frame: sec(PHRASES[i].start, FPS), file: "swipe.mp3", len: 14, vol: 0.22 });
    }
    if (step !== undefined) prevStep = step;
  }
  for (let i = 1; i < PHRASES.length; i++) {
    const at = sec(PHRASES[i].start, FPS);
    const txt = PHRASES[i].text.toLowerCase();
    // a bead really moved on this line
    if (sceneFor(i).stage === "abacus" && valuesOf(i) !== valuesOf(i - 1)) {
      cues.push({ frame: at, file: "abacus_move.mp3", len: 30, vol: 0.32 });
    }
    if (/eight\.|it's seven|great job/.test(txt)) {
      cues.push({ frame: at, file: "option_correct_ans.mp3", len: 60, vol: 0.34 });
    }
    if (/great job/.test(txt)) {
      cues.push({ frame: at + 10, file: "clap.mp3", len: 90, vol: 0.28 });
    }
  }
  return cues;
})();

const currentPhrase = (frame: number): number => {
  let idx = 0;
  for (const p of PHRASES) {
    if (sec(p.start, FPS) <= frame) idx = p.index;
    else break;
  }
  return idx;
};

/** Smoothly ramp a numeric scene field across the phrase boundary so nothing snaps. */
const smooth = (frame: number, pick: (s: Scene) => number): number => {
  const i = currentPhrase(frame);
  const startF = sec(PHRASES[i].start, FPS);
  const prev = i > 0 ? pick(sceneFor(i - 1)) : pick(sceneFor(0));
  const now = pick(sceneFor(i));
  return interpolate(frame, [startF, startF + 10], [prev, now], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/** The one panel look: white card, dark text, the term itself in the app's colour. */
const InfoCard: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div
    style={{
      display: "block",
      background: "#FFFFFF",
      borderRadius: 34,
      padding: "22px 30px",
      boxShadow: "0 10px 0 rgba(0,0,0,0.22)",
      fontFamily: TYPE.family,
      fontSize: TYPE.tooltip.size,
      fontWeight: TYPE.tooltip.strong,
      lineHeight: 1.32,
      color,
      whiteSpace: "pre-wrap",
      textAlign: "center",
      boxSizing: "border-box",
    }}
  >
    {text}
  </div>
);

const StageLabel: React.FC<{
  text: string;
  color: string;
  frame: number;
  /** left edge of the abacus, so the label can never sit on top of it */
  limit: number;
  pos: "side" | "above" | "aboveRod";
  /** the SAME coordinates the arrow starts from. The label used to compute its own top
   *  while the arrow used the panel slot, so the arrow's origin dot floated off the card. */
  x: number;
  y: number;
  w: number;
}> = ({ text, color, frame, limit, pos, x, y, w }) => {
  const gap = limit - 56 - 36;
  // "aboveRod" always uses the supplied panel coordinates — that is the whole point of it
  const beside = pos === "aboveRod" || (pos === "side" && gap >= 330);
  if (pos === "above") {
    // answers and prompts read better over the abacus than off to one side
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: BAND.stageTop - 120 + bob(frame, FPS, 7, 3.6),
          textAlign: "center",
        }}
      >
        <Card bg={color} radius={40}>
          <StickerText
            size={/\d/.test(text) && text.replace(/\s/g, "").length <= 7 ? 104 : 46}
            style={{ display: "block", textAlign: "center" }}
          >
            {text}
          </StickerText>
        </Card>
      </div>
    );
  }
  // Same white info card as the tooltip. Labels used to be a solid coloured Card with
  // white sticker text, so the two panels doing the same job looked like two different
  // systems on adjacent lines.
  return (
    <div
      style={{
        position: "absolute",
        // the panel coordinates the arrow also uses — never a second set of its own
        left: beside ? x : 0,
        width: beside ? w : W,
        textAlign: "center",
        top: beside ? y : BAND.stageTop - 96 + bob(frame, FPS, 6, 3.4),
      }}
    >
      <InfoCard text={text} color={color} />
    </div>
  );
};

export const E01MeetTheAbacus: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const p = currentPhrase(frame);
  const scene = sceneFor(p);
  const world = WORLDS[scene.world];
  const scale = smooth(frame, (s) => s.scale);

  // Each rod is told where it is coming FROM, so only the beads the next number needs
  // actually travel. Previously every bead interpolated from its opposite position, so
  // the whole abacus re-seated itself on every change — visible as a constant reset.
  const phraseStart = sec(PHRASES[p].start, FPS);
  const prevScene = p > 0 ? sceneFor(p - 1) : scene;
  const sameRig = prevScene.rods.length === scene.rods.length && prevScene.stage === scene.stage;
  let rods: RodState[] = scene.rods.map((r, i) => ({
    ...r,
    from: sameRig ? prevScene.rods[i]?.value ?? r.value : r.value,
  }));

  // The summary line steps left one rod at a time, so the rule is shown, not just said.
  if (scene.sweepRods) {
    const seq = scene.sweepRods;
    // local progress: beatProgress is declared further down, and reordering the hooks
    // around it is how a render broke before
    const pEnd = sec(PHRASES[p].end, FPS);
    const frac = Math.max(
      0,
      Math.min(0.999, (frame - phraseStart) / Math.max(1, pEnd - phraseStart))
    );
    const which = Math.min(seq.length - 1, Math.floor(frac * seq.length));
    const litRod = seq[which];
    rods = rods.map((r, i) => ({
      ...r,
      focus: i === litRod ? 1 : ROD_DIM,
      value: i === litRod ? 1 : 0,
      from: i === litRod ? 0 : 0,
    }));
  }

  // Beads that actually slide, for the line that says they slide. Each rod steps to a new
  // value every STEP frames and travels there, so the whole abacus is in motion.
  const STEP = 14;
  const liveSettle = scene.liveBeads
    ? ((frame - phraseStart) % STEP) / (STEP - 1)
    : 1;
  if (scene.liveBeads) {
    const k = Math.floor(Math.max(0, frame - phraseStart) / STEP);
    const wave = (i: number, n: number) => {
      // a different, non-repeating pattern per rod so it never looks like a counter
      const seq = [0, 3, 5, 8, 4, 9, 2, 6, 1, 7];
      return seq[(n * (i + 2) + i * 3) % seq.length];
    };
    rods = rods.map((r, i) => ({
      ...r,
      from: wave(i, Math.max(0, k)),
      value: wave(i, Math.max(0, k) + 1),
    }));
  }
  const settle = interpolate(frame, [phraseStart, phraseStart + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Every spoken line must change something on screen, and several lines carry no new
  // bead content ("the beam is very important", "so how many numbers can we make?").
  // Those lines got a new caption and nothing else, which is the one thing the caption
  // is explicitly not allowed to be. The rig now acknowledges each new line with a
  // short settle-bounce, so the change is real without inventing wrong content.
  const linePop = interpolate(
    frame,
    [phraseStart, phraseStart + 5, phraseStart + 13],
    [1, 1.022, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // first frame of the store beat, so its flow runs once across both its lines and then
  // holds on the finished state instead of starting over
  const storeStart = (() => {
    for (let i = 0; i < PHRASES.length; i++) {
      if (sceneFor(i).closeBeat === "store") return sec(PHRASES[i].start, FPS);
    }
    return 0;
  })();

  // fraction through the current phrase, for props that animate across a whole line
  const phraseEnd = sec(PHRASES[p].end, FPS);
  const beatProgress = interpolate(frame, [phraseStart, phraseEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The abacus springs in on the frame it is first named, and stays put after.
  const abacusFirstFrame = sec(PHRASES[3].start, FPS);
  const reveal =
    frame < abacusFirstFrame
      ? 1
      : interpolate(frame, [abacusFirstFrame, abacusFirstFrame + 12], [0.7, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const abacusW = (scene.rods.length * ROD_PITCH + FRAME_LW * 2) * scale;
  const abacusH = (ABACUS_INNER_H + FRAME_LW * 2) * scale;
  const stageMidY = (BAND.stageTop + BAND.stageBottom) / 2;
  const left = (width - abacusW) / 2;
  const top = stageMidY - abacusH / 2 + bob(frame, FPS, 6, 5);

  // ---- where the explanation panel goes, and what the arrow points at ----
  // Rule: the panel sits on the SAME SIDE as the bead being discussed, so the arrow is
  // short and unambiguous. A panel pinned to the left while the subject was the rightmost
  // rod meant the pointer crossed the whole abacus.
  const targetRod = scene.targetRod ?? Math.floor(scene.rods.length / 2);
  const tCol = scene.rods.length - 1 - targetRod;
  const tRodX = left + FRAME_LW * scale + (tCol + 0.5) * ROD_PITCH * scale;
  const panelRight =
    scene.panelSide ? scene.panelSide === "right" : tRodX > W / 2;
  // A tip belongs to a RUN of lines, not to one line. Lines 14-17 are all about the beam,
  // so the beam tip must sit still across all four; keying it to the line made it vanish
  // and re-pop at a different slot on every sentence. `tip.start` is the line that
  // introduced it, and everything about the panel is keyed to that instead of to `p`.
  const tip = (() => {
    const none = { step: undefined as number | undefined, start: p };
    // back up to the nearest line that HAS a tooltip, carrying across lines still about
    // the same part; a line about no part at all ends the run
    let i = p;
    while (i >= 0 && LINE_TOOLTIP[i] === undefined) {
      if (LINE_HIGHLIGHT[i] === undefined) return none;
      i--;
    }
    if (i < 0) return none;
    const step = LINE_TOOLTIP[i];
    const part = LINE_HIGHLIGHT[i];
    for (let j = i + 1; j <= p; j++) {
      if (LINE_HIGHLIGHT[j] !== part) return none;
    }
    // Then keep going back to the FIRST line of this tooltip's run. Without this the walk
    // stopped at `p` itself whenever `p` had its own entry, so lines 9 and 10 — both
    // tooltip 0 — reported different starts and the same card jumped between slots.
    let s = i;
    while (s > 0 && LINE_TOOLTIP[s - 1] === step) s--;
    return { step, start: s };
  })();

  // width fits whichever card is actually showing — it used to be sized for a tooltip
  // even on lines that only have a label, so those cards were the wrong width
  const panelW =
    scene.sumBreakdown
      ? 520 // the SumBreakdown card's own fixed width — it was sized from an empty label
      : tip.step !== undefined
      ? tooltipWidth(tip.step)
      : (() => {
          const s = scene.sideLabel?.text ?? "";
          const longest = Math.max(...s.split("\n").map((l) => l.length), 6);
          return Math.round(
            Math.min(500, Math.max(240, longest * TYPE.tooltip.size * 0.58 + 84))
          );
        })();
  const aboveRod = scene.panelPlace === "aboveRod";
  const panelX = aboveRod
    ? Math.max(40, Math.min(W - 40 - panelW, tRodX - panelW / 2))
    : panelRight
    ? W - 60 - panelW
    : 60;
  // Three vertical slots, cycled by RUN so consecutive sections differ but a single tip
  // never moves while it is on screen.
  // the card's real height, so the arrow can start ON its edge instead of near it
  const cardH = cardHeight(
    tip.step !== undefined
      ? tooltipLines(tip.step)
      : (scene.sideLabel?.text ?? "").split("\n").length
  );
  const panelY = aboveRod
    // high enough that the card clears the abacus and the arrow has room to be seen —
    // at -150 the card overlapped the frame and the arrow was a stub
    ? BAND.stageTop - 168 + bob(frame, FPS, 6, 3.8)
    : BAND.stageTop + (RUN_SLOT[tip.start] ?? 190) + bob(frame, FPS, 6, 3.8);
  // pop and arrow-draw progress measured from the run's first frame, so neither restarts
  const runStart = sec(PHRASES[tip.start].start, FPS);
  const runProgress = interpolate(frame, [runStart, runStart + 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The section band: full inner width, frame-top to beam, or beam to frame-bottom.
  const bandRect = (() => {
    if (!scene.band) return null;
    const innerLeft = left + FRAME_LW * scale;
    const innerTop = top + FRAME_LW * scale;
    const bw = scene.rods.length * ROD_PITCH * scale;
    if (scene.band === "top") {
      return { x: innerLeft, y: innerTop, w: bw, h: HEAVEN_H * scale };
    }
    return {
      x: innerLeft,
      y: innerTop + (HEAVEN_H + BEAM_H) * scale,
      w: bw,
      h: (ABACUS_INNER_H - HEAVEN_H - BEAM_H) * scale,
    };
  })();

  // A whole-rod band: one column, full inner height.
  const rodBandRect = (() => {
    if (scene.rodBand === undefined) return null;
    const n = scene.rods.length;
    const col = n - 1 - scene.rodBand;
    const innerLeft = left + FRAME_LW * scale;
    const innerTop = top + FRAME_LW * scale;
    return {
      x: innerLeft + col * ROD_PITCH * scale + 3,
      y: innerTop - 4,
      w: ROD_PITCH * scale - 6,
      h: ABACUS_INNER_H * scale + 8,
    };
  })();

  // Box round the group of rods a capacity line is talking about.
  const box = (() => {
    if (!scene.boxRods) return null;
    const n = scene.rods.length;
    const innerLeft = left + FRAME_LW * scale;
    const x0 = innerLeft + (n - scene.boxRods) * ROD_PITCH * scale - 6;
    const x1 = innerLeft + n * ROD_PITCH * scale + 6;
    const y0 = top + FRAME_LW * scale - 6;
    const y1 = top + (FRAME_LW + ABACUS_INNER_H) * scale + 6;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  })();

  const arrowTarget: Pt | null = (() => {
    // a whole-rod band is the target when there is one — aim at its top edge
    if (rodBandRect) {
      return { x: rodBandRect.x + rodBandRect.w / 2, y: rodBandRect.y + 14 };
    }
    // a whole-section band is the target when there is one — aim at its near edge
    if (bandRect) {
      return panelRight
        ? { x: bandRect.x + bandRect.w - 10, y: bandRect.y + bandRect.h / 2 }
        : { x: bandRect.x + 10, y: bandRect.y + bandRect.h / 2 };
    }
    // a card sitting over its rod points straight down at that rod's top bead
    if (aboveRod) {
      return { x: tRodX, y: top + (FRAME_LW + BEAD_H * 0.4) * scale };
    }
    // a boxed group is the target when there is one — aim at the near edge
    if (box) {
      return panelRight
        ? { x: box.x + box.w + 4, y: box.y + box.h * 0.5 }
        : { x: box.x - 4, y: box.y + box.h * 0.5 };
    }
    const innerTop = top + FRAME_LW * scale;
    const val = scene.rods[targetRod]?.value ?? 0;
    const yOf = (v: number) => innerTop + v * scale;
    switch (scene.highlight) {
      case "frame":
        return { x: panelRight ? left + abacusW - 12 : left + 12, y: top + abacusH * 0.8 };
      case "beam":
        return { x: tRodX, y: yOf(HEAVEN_H + BEAM_H / 2) };
      case "rods":
        return { x: tRodX, y: yOf(HEAVEN_H - BEAD_H * 0.3) };
      case "top":
        // the heaven bead's actual position: down at the beam when the rod reads 5+
        return { x: tRodX, y: yOf(val >= 5 ? HEAVEN_H - BEAD_H / 2 : BEAD_H / 2) };
      case "bottom": {
        // the topmost earth bead, up against the beam when any are raised
        const up = val % 5;
        const slot = up > 0 ? 0.5 : 1.5;
        return { x: tRodX, y: yOf(HEAVEN_H + BEAM_H + BEAD_H * slot) };
      }
      default:
        return null;
    }
  })();

  // stage-space position of the ones rod, for the hand
  const onesCx =
    left + FRAME_LW * scale + (scene.rods.length - 0.5) * ROD_PITCH * scale;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <World kind={scene.world} />
      {/* the store beat pulls the world back so the phone and the CTA carry the frame */}
      {scene.closeBeat === "store" && (
        <AbsoluteFill style={{ background: "rgba(255,255,255,0.55)" }} />
      )}
      <BrandBadge />
      <PoweredBy />

      {/* HEADLINE band — a pill, so it reads on both bright and dark worlds */}
      {scene.headline && (
        <div
          style={{
            position: "absolute",
            top: 30,
            width: W,
            textAlign: "center",
            transform: `scale(${pulse(frame, FPS, 0.012, 3)})`,
          }}
        >
          <HeadlinePill
            text={scene.headline}
            fill={world.pill}
            ink={world.pill === "#FFFFFF" ? world.ink : "#FFFFFF"}
            size={scene.headline.includes("\n") ? 54 : 62}
          />
        </div>
      )}

      {/* Centred, not top-right: at top-right it sat underneath the brand badge, which is
          pinned there in every episode. */}
      {scene.counter && (
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 0,
            width: W,
            textAlign: "center",
          }}
        >
          <Chip label={scene.counter} color={world.accent} size={54} />
        </div>
      )}

      {/* STAGE. The abacus is one prop among several and only mounts once the script
          names it, so its arrival on line 4 is an actual reveal. */}
      {scene.stage === "abacus" && !scene.closing && (
        <div
          style={{
            position: "absolute",
            left,
            top,
            // spring in on the reveal frame, then a small bounce on every new line
            transform: `scale(${reveal * linePop})`,
            transformOrigin: "center",
          }}
        >
          <Abacus
            rods={rods}
            settle={scene.liveBeads ? liveSettle : settle}
            highlight={scene.highlight}
            scale={scale}
            count={scene.count ?? null}
          />
        </div>
      )}

      {scene.stage !== "abacus" && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: BAND.stageTop,
            width: W,
            height: BAND.stageBottom - BAND.stageTop,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {scene.stage === "counting" && (
            <CountingRun frame={frame - phraseStart} fps={FPS} progress={beatProgress} />
          )}
          {scene.stage === "fingers" && (
            <CountingFingers frame={frame - phraseStart} fps={FPS} />
          )}
          {scene.stage === "missingstep" && (
            <MissingStep frame={frame - phraseStart} fps={FPS} />
          )}
          {scene.stage === "calculator" && (
            <HistoryTimeline
              frame={frame - phraseStart}
              fps={FPS}
              progress={beatProgress}
            />
          )}
        </div>
      )}

      {/* names the target rod, directly under it */}
      {scene.centreNote && (
        <div
          style={{
            position: "absolute",
            left: tRodX - 230,
            top: top + abacusH + 18,
            width: 460,
            textAlign: "center",
          }}
        >
          <Chip label={scene.centreNote} color={PLACE_COLORS[0]} size={34} />
        </div>
      )}

      {scene.decimals && (
        <div
          style={{
            position: "absolute",
            left: left + abacusW * 0.54,
            top: top + abacusH + 16,
            width: abacusW * 0.46,
            textAlign: "center",
          }}
        >
          <Chip label="Decimals" color={PLACE_COLORS[4]} size={38} />
        </div>
      )}

      {/* the hand, over the ones rod */}
      {scene.hand && (
        <svg
          width={W}
          height={H}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {(() => {
            // The arrow spans the bead's REAL travel and stays inside its own section:
            //   upper bead  — parked high, down to the beam   (HEAVEN_H - BEAD_H)
            //   lower beads — one slot, toward or away from it (BEAD_H)
            // Anchored at the START of the move, not its middle.
            const innerTop = top + FRAME_LW * scale;
            const goingUp = scene.hand.direction === "up";
            const travel = (scene.hand.heaven ? HEAVEN_H - BEAD_H : BEAD_H) * scale;
            const anchorY = scene.hand.heaven
              ? goingUp
                ? innerTop + (HEAVEN_H - BEAD_H / 2) * scale
                : innerTop + (BEAD_H / 2) * scale
              : goingUp
              ? innerTop + (HEAVEN_H + BEAM_H + BEAD_H * 1.5) * scale
              : innerTop + (HEAVEN_H + BEAM_H + BEAD_H * 0.5) * scale;
            return (
              <FingerHand
                digit={scene.hand.digit}
                direction={scene.hand.direction}
                scale={scale * 0.82}
                x={onesCx}
                y={anchorY}
                len={travel}
              />
            );
          })()}
        </svg>
      )}

      {/* Arrow from the panel to the exact bead/part the line is about. The target used
          to be hardcoded to column 1, so on "the upper bead is worth five" it pointed at
          a rod in the middle of the abacus instead of the ones rod on the right. */}
      {/* the whole-rod band */}
      {rodBandRect && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <rect
            x={rodBandRect.x}
            y={rodBandRect.y}
            width={rodBandRect.w}
            height={rodBandRect.h}
            rx={18}
            fill={PLACE_COLORS[0]}
            opacity={
              0.15 *
              interpolate(runProgress, [0, 0.25], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
          <rect
            x={rodBandRect.x}
            y={rodBandRect.y}
            width={rodBandRect.w}
            height={rodBandRect.h}
            rx={18}
            fill="none"
            stroke={PLACE_COLORS[0]}
            strokeWidth={7}
            strokeDasharray="22 14"
            strokeDashoffset={-(frame % 36)}
            opacity={interpolate(runProgress, [0, 0.25], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
        </svg>
      )}

      {/* the whole-section band */}
      {bandRect && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <rect x={bandRect.x} y={bandRect.y} width={bandRect.w} height={bandRect.h} rx={16}
            fill={world.accent}
            opacity={0.18 * interpolate(runProgress, [0, 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          />
          <rect x={bandRect.x} y={bandRect.y} width={bandRect.w} height={bandRect.h} rx={16}
            fill="none" stroke={world.accent} strokeWidth={7} strokeDasharray="24 15"
            strokeDashoffset={-(frame % 39)}
            opacity={interpolate(runProgress, [0, 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          />
        </svg>
      )}

      {/* the group box for the capacity lines */}
      {box && (
        <svg
          width={W}
          height={H}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <rect
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            rx={22}
            fill="none"
            stroke={world.accent}
            strokeWidth={8}
            strokeDasharray="26 16"
            strokeDashoffset={-(frame % 42)}
            opacity={interpolate(beatProgress, [0, 0.2], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
        </svg>
      )}

      {(scene.highlight || box || aboveRod || bandRect || rodBandRect) &&
        (scene.sideLabel || scene.beadWorth || tip.step !== undefined) && (() => {
        const to = arrowTarget;
        if (!to) return null;
        // ALWAYS the centre of the card's top or bottom edge — top when the target is
        // above the card, bottom when it is below.
        // The origin sits exactly ON that edge so the stroke is flush with the card —
        // offsetting it outward left a visible gap, and there is no dot to bridge it.
        const cardCx = panelX + panelW / 2;
        const cardCy = panelY + cardH / 2;
        const exitTop = to.y < cardCy;
        const from: Pt = { x: cardCx, y: exitTop ? panelY : panelY + cardH };
        // Guard rather than eyeball: the arrow's origin must lie inside the card it comes
        // out of. Every positioning bug this episode shipped was an origin computed from
        // one coordinate system while the card used another, and each one was found by a
        // human watching the video. This fails the render instead.
        const SLACK = 12; // the origin may sit on, or just outside, the card's edge
        if (
          from.x < panelX - SLACK ||
          from.x > panelX + panelW + SLACK ||
          from.y < panelY - SLACK ||
          from.y > panelY + cardH + SLACK
        ) {
          throw new Error(
            `arrow origin (${from.x.toFixed(0)},${from.y.toFixed(0)}) is outside its card ` +
              `[${panelX.toFixed(0)},${panelY.toFixed(0)} ${panelW}x${cardH}] on line ${p}`
          );
        }
        return (
          <svg
            width={W}
            height={H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <PartArrow
              from={from}
              to={to}
              progress={runProgress}
              color={world.accent}
              // Bow AWAY from the card. PartArrow offsets the control point along
              // (-dy, dx)/len, so its y-component is dx/len; matching the bow's sign to dx
              // pushes the arc downward out of a bottom exit, and flipping it does the same
              // upward for a top exit. Signing it any other way curved the arc back across
              // the card, which is what made it read as starting from the side.
              bow={
                (exitTop ? -1 : 1) *
                Math.sign(to.x - from.x || 1) *
                (aboveRod ? 70 : 120)
              }
              frame={frame - phraseStart}
              fps={FPS}
            />
          </svg>
        );
      })()}

      {/* the app's own tour tooltip for this line, when there is one */}
      {tip.step !== undefined && (
        <div
          style={{
            position: "absolute",
            left: panelX,
            top: panelY,
            width: panelW,
          }}
        >
          <Tooltip
            step={tip.step}
            progress={runProgress}
            width={panelW}

          />
        </div>
      )}

      {scene.sumBreakdown && (
        <div
          style={{
            position: "absolute",
            left: panelX,
            top: BAND.stageTop + 20 + bob(frame, FPS, 6, 3.8),
            width: panelW,
            textAlign: "center",
          }}
        >
          <SumBreakdown
            upper={scene.sumBreakdown.upper}
            lower={scene.sumBreakdown.lower}
            progress={beatProgress}
          />
        </div>
      )}

      {scene.beadWorth && tip.step === undefined && (
        <div
          style={{
            position: "absolute",
            left: panelX,
            top: BAND.stageTop + 150 + bob(frame, FPS, 7, 3.6),
            width: panelW,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <BeadWorth
            which={scene.beadWorth.which}
            worth={scene.beadWorth.worth}
            progress={beatProgress}
          />
        </div>
      )}

      {scene.sideLabel && tip.step === undefined && (
        <StageLabel
          text={scene.sideLabel.text}
          color={scene.sideLabel.color}
          frame={frame}
          limit={left}
          pos={
            scene.panelPlace === "aboveRod" ? "aboveRod" : scene.labelPos ?? "side"
          }
          x={panelX}
          y={panelY}
          w={panelW}
        />
      )}

      {/* "Your turn" is part of the same prompt as the answer, so it sits ABOVE the
          abacus too, not off to the left */}
      {scene.question && (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: W,
            top: BAND.stageTop - 132,
            textAlign: "center",
            transform: `scale(${pulse(frame, FPS, 0.05, 1.2)})`,
          }}
        >
          <Card bg={PLACE_COLORS[0]}>
            <StickerText size={104}>Your turn  ?</StickerText>
          </Card>
        </div>
      )}

      {scene.rulesCard && (
        <div style={{ position: "absolute", left: 96, top: BAND.stageTop + 60 }}>
          <Card bg={THEME.c800} radius={40}>
            <StickerText size={40} style={{ display: "block", lineHeight: 1.5 }}>
              {"add lower  ·  thumb up\nadd upper  ·  index down\ntake lower ·  index down\ntake upper ·  thumb up"}
            </StickerText>
          </Card>
        </div>
      )}

      {scene.closing && scene.closeBeat && (
        // Fixed slots, not a centred flex row: the row re-centred every time the card
        // beside the phone changed width, so the phone slid left and right between
        // "Free Mode is free for everyone" and "Tap any bead".
        <div
          style={{
            position: "absolute",
            top: BAND.stageTop - 90,
            left: 0,
            width: W,
            height: BAND.stageBottom - BAND.stageTop + 140,
          }}
        >
          {scene.closeBeat === "next" ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NextUpCard progress={beatProgress} />
            </div>
          ) : (
            <>
              {/* the store flow is the subject here, not the app screen. Its frame is
                  measured from the FIRST store line, not the current phrase: lines 76 and 77
                  are both store beats, so keying it to phraseStart restarted the whole
                  search-and-download animation half way through. */}
              {scene.closeBeat === "store" ? (
                <div style={{ position: "absolute", left: 300, top: 20 }}>
                  <StoreFlow frame={frame - storeStart} fps={FPS} height={760} />
                </div>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    left: 120,
                    top: 150 + bob(frame, FPS, 8, 4),
                  }}
                >
                  <LandscapeFreeMode
                    frame={frame - phraseStart}
                    fps={FPS}
                    beat={scene.closeBeat as "show" | "tap" | "move" | "play"}
                    value={scene.closeBeat === "move" || scene.closeBeat === "play" ? 8 : 5}
                    width={940}
                  />
                </div>
              )}
              {scene.closeBeat === "store" ? (
                <div style={{ position: "absolute", left: 1090, top: 90 }}>
                  <DownloadCta progress={beatProgress} />
                </div>
              ) : (
                <div style={{ position: "absolute", left: 1130, top: 300, width: 680 }}>
                <Card bg="rgba(255,255,255,0.96)" radius={44}>
                  <StickerText
                    size={54}
                    color="#1F3B4D"
                    style={{ display: "block", textAlign: "left", textShadow: "none" }}
                  >
                    {scene.closeBeat === "show"
                      ? "Free Mode\nis free for everyone"
                      : scene.closeBeat === "tap"
                      ? "Tap any bead"
                      : scene.closeBeat === "move"
                      ? "Move them yourself"
                      : "Learn by playing"}
                  </StickerText>
                </Card>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* The download beat carries no caption: the phone and the CTA are the message, and
          the phonics outro leaves the caption band empty for exactly that reason. */}
      {scene.closeBeat !== "store" && (
        <Caption track={track} frame={frame} ink={world.ink} accent={world.accent} />
      )}

      {/* SFX. The app's own sound files were copied into public/audio/sfx early on and
          then never actually played — the whole video shipped silent apart from narration.
          A bead click on every line where a bead really moves, the app's correct-answer
          chime on each reveal, and its clap over the close. */}
      {SFX_CUES.map((c, i) => (
        <Sequence key={i} from={c.frame} durationInFrames={c.len}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol} />
        </Sequence>
      ))}

      {/* Folder is e001_about_abacus — the episode-numbered scheme. A wrong path here
          renders SILENT with no error, so the approved mp4 (rendered before the rename)
          still has audio while a fresh render would not. */}
      <Audio src={staticFile("audio/e001_about_abacus/about_abacus.mp3")} />
    </AbsoluteFill>
  );
};
