// E05 · Taking away — 16:9 and 4:5 from one reel.
//
// Direct subtraction on the ONES rod. The app's Level 2 Chapter 3 (Earth Subtract) and Chapter 4
// (Heaven Subtract); the worked numbers 4-2, 8-3, 5-5, 7-5, 9-8 and the practice 9-4 are its own.
// Nothing here needs a complement — that is E07.
//
// Timing from src/data/e05.phrases.json, aligned from docs/E05_spoken.txt. Word match 505/505.
// 74 lines -> 74 PHRASES, so a phrase index is also a line number.
//
// WHAT THIS EPISODE DOES DIFFERENTLY
//
//   · RIG_SPACE — graphite frame, violet beads. Fourth distinct instrument in the series.
//   · A LAUNCH for a world set, ground to orbit. Subtraction is a countdown, so the episode climbs
//     as the numbers come down — the opposite motion to E04's city filling with light, which is what
//     keeps two consecutive episodes from feeling like one.
//   · THE FINGER IS THE SUBJECT. Adding was the thumb; taking away is the index finger, both for the
//     lower beads coming down and for the upper bead going up. `handFor` derives it from the move,
//     so every one of these lines gets the right finger without being listed.
//   · An astronaut who CATCHES what leaves the beam. Subtraction is the first thing in this series
//     where something goes away, and a character catching it makes "away from the beam" a place
//     rather than an absence.

import React from "react";
import phrasesJson from "../data/e05.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Astro, type AstroMood } from "../components/e05/Astro";
import { Abacus, type RodState } from "../components/Abacus";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import type { Scene as BaseScene } from "../stage/types";
import { RIG_SPACE, WORLDS } from "../data/theme";
import { FPS, ROD_DIM, ROD_PITCH } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";

export const AUDIO_SEC = 227.082;
export const E05_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

interface Scene extends BaseScene {
  /** the astronaut's state, and whether it is on screen at all */
  astro?: AstroMood;
  /** the big answer number in the headline band */
  big?: string;
  /** show the rod's CURRENT value under it, live, while a calculation is being worked */
  valueChip?: boolean;
}

/** Back to the series' 1.15: nothing hangs below this abacus now that the value reads above it. */
const BASE = 1.15;
const BIG_TOP = 20;
const BIG_SIZE = 76;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

/** Room for the astronaut on the right in 4:5; nothing sits on the left. */
const PORTRAIT_ROOM = { left: 90, right: 200 };

/** What the ones rod reads on each phrase. Two phrases at the top recap E04 on two rods. */
const VALUE: Record<number, number> = {
  0: 47, 1: 0, 2: 0,
  // what taking away means — one bead goes up, then the same bead comes back down
  3: 0, 4: 1, 5: 0, 6: 0, 7: 0,
  // the finger changes
  8: 0, 9: 1, 10: 0,
  // four take away two
  11: 0, 12: 0, 13: 4, 14: 4, 15: 4, 16: 2, 17: 2, 18: 2, 19: 2,
  // eight take away three
  20: 0, 21: 0, 22: 5, 23: 8, 24: 8, 25: 8, 26: 5, 27: 5, 28: 5, 29: 5, 30: 5,
  // the rule so far
  31: 5, 32: 5,
  // five take away five
  33: 5, 34: 5, 35: 5, 36: 0, 37: 0, 38: 5, 39: 5, 40: 5, 41: 0, 42: 0, 43: 0,
  // seven take away five
  44: 0, 45: 0, 46: 5, 47: 7, 48: 7, 49: 2, 50: 2, 51: 2, 52: 2,
  // nine take away eight
  53: 2, 54: 0, 55: 0, 56: 9, 57: 9, 58: 9, 59: 9, 60: 6, 61: 1, 62: 1, 63: 1,
  // your turn
  64: 0, 65: 9, 66: 9, 67: 5, 68: 5,
  // close
  69: 0, 70: 0, 71: 0, 72: 0, 73: 0,
};

/**
 * The closing practice drill: five sums in the time it takes to say "now try taking away some small
 * numbers on your own abacus", each with its ANSWER standing on the beads.
 *
 * That line used to hold the rod at nine and count it down, which made a bead-move sound on a line
 * about the child's own practice and taught nothing. Five worked examples flashing past is what the
 * sentence actually invites — and every one is direct, so a child can follow along on their own
 * abacus without needing anything this episode has not taught.
 */
const DRILL: { text: string; answer: number }[] = [
  { text: "6 - 1", answer: 5 },
  { text: "7 - 5", answer: 2 },
  { text: "4 - 2", answer: 2 },
  { text: "8 - 6", answer: 2 },
  { text: "9 - 4", answer: 5 },
];

const valueAt = (p: number) => VALUE[p] ?? 0;

/**
 * The lines that are WORKING a calculation, as opposed to introducing or concluding one.
 *
 * Across all of these the rod's current value sits in a chip beneath it, live. Without it a child
 * who looks away for two seconds has to re-read the beads from scratch to rejoin — the number is the
 * one thing they are learning to see, and leaving it implicit only helps the viewer who already can.
 */
const isWorking = (p: number) =>
  (p >= 11 && p <= 19) ||
  (p >= 20 && p <= 30) ||
  (p >= 36 && p <= 43) ||
  (p >= 44 && p <= 52) ||
  (p >= 54 && p <= 63) ||
  (p >= 64 && p <= 68);

/** Two rods for the E04 recap on the very first line, one rod for everything after it. */
const rig = (p: number): RodState[] => {
  const v = valueAt(p);
  const two = p === 0;
  return Array.from({ length: 5 }, (_, i) => ({
    value: two ? (i === 0 ? v % 10 : i === 1 ? Math.floor(v / 10) : 0) : i === 0 ? v : 0,
    focus: two ? (i < 2 ? 1 : ROD_DIM) : i === 0 ? 1 : ROD_DIM,
  }));
};

/**
 * WHICH FINGER. This episode is mostly one answer — the index finger — and that is the point:
 * earth beads DOWN and the heaven bead UP are both index-finger moves, and between them they are
 * every subtraction on one rod. The thumb appears only where a number is being BUILT.
 *
 * The silent resets are the announcement lines where the rod clears between worked examples; a hand
 * there would teach a move nobody was asked to make.
 */
const SILENT_RESET = new Set([1, 11, 20, 36, 44, 54, 64, 69]);

/**
 * The SECOND hand, on the one line where both kinds of bead move together: "push the upper bead down
 * and all four lower beads up". `handFor` returns the earth move (the thumb, because the lower-bead
 * branch matches first), so the heaven move needs its own — otherwise the line teaches half its own
 * instruction.
 */
const hand2For = (p: number): Scene["hand2"] => {
  const to = valueAt(p);
  const from = p > 0 ? valueAt(p - 1) : 0;
  const earthMoves = to % 5 !== from % 5;
  const heavenMoves = (from >= 5) !== (to >= 5);
  if (!earthMoves || !heavenMoves || SILENT_RESET.has(p)) return undefined;
  const down = to >= 5;
  return {
    digit: down ? "index" : "thumb",
    direction: down ? "down" : "up",
    rod: 0,
    heaven: true,
    // No dy. The pair is arranged by SceneStage's `twoHands` layout — each hand sits on its own
    // bead's anchor, which is what puts real space between them. The -186 nudge here was from the
    // attempt that tried to solve this with offsets, and it only moved the collision.
  };
};

const handFor = (p: number): Scene["hand"] => {
  if (p === 0 || SILENT_RESET.has(p)) return undefined;
  const to = valueAt(p);
  const from = p > 0 ? valueAt(p - 1) : 0;
  if (to === from) return undefined;
  const lowerFrom = from % 5;
  const lowerTo = to % 5;
  // THE FINGER IS DECIDED BY DIRECTION, NOT BY WHICH BEAD.
  //
  //    moving TOWARDS the top of the frame  -> THUMB
  //    moving DOWN                          -> INDEX FINGER
  //
  // So the thumb pushes earth beads up AND pushes the heaven bead back up; the index finger brings
  // earth beads down AND brings the heaven bead down to the beam. This was wrong in E05's first
  // build: the heaven bead had the index finger in both directions, so "push the upper bead back up"
  // showed the wrong hand — a technique error, not a cosmetic one, on the episode whose whole hook is
  // which finger to use.
  if (lowerTo > lowerFrom) return { digit: "thumb", direction: "up", rod: 0, heaven: false };
  if (from >= 5 !== to >= 5) {
    const down = to >= 5;
    return { digit: down ? "index" : "thumb", direction: down ? "down" : "up", rod: 0, heaven: true };
  }
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod: 0, heaven: false };
  return undefined;
};

/**
 * The frame each answer LANDS on — the first frame of its line's final word. The burst, the chime
 * and the big number all key off this, the lesson E03 paid for.
 */
const ANSWER_LINES = [19, 30, 43, 52, 63, 67];

/**
 * What the answer card says. It used to be the RESULT alone — a big "5" — which is the one part of
 * the sentence the child can already see on the rod. The whole sum is what makes the card worth
 * having: "8 - 3 = 5" restates the question and answers it in the same glance, so a viewer who joins
 * mid-episode still knows what is going on.
 */
const ANSWER_TEXT: Record<number, string> = {
  19: "4 - 2 = 2",
  30: "8 - 3 = 5",
  43: "5 - 5 = 0",
  52: "7 - 5 = 2",
  63: "9 - 8 = 1",
  67: "9 - 4 = 5",
};
const ANSWER_FRAME = new Map<number, number>();
for (const i of ANSWER_LINES) {
  ANSWER_FRAME.set(i, wordFrameIn(PHRASES[i], "$last", FPS) ?? sec(PHRASES[i].start, FPS));
}
const BURST_FROM = new Map<number, number>();
for (const [i, f] of ANSWER_FRAME) {
  BURST_FROM.set(i, f);
  if (i + 1 !== 68) BURST_FROM.set(i + 1, f);
}

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const base = {
    stage: "abacus" as const,
    rods: rig(p),
    scale: BASE,
    targetRod: 0,
    highlight: null,
    hand: handFor(p),
    // BOTH hands on the line that moves both kinds of bead. "Push the upper bead down and all four
    // lower beads up" is one instruction with two techniques in it, so one hand teaches half of it —
    // and this is the episode whose entire hook is which finger to use. SceneStage shrinks the pair
    // and puts each chip on the side its hand is on; see the `twoHands` block there.
    hand2: hand2For(p),
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
    valueChip: isWorking(p),
  };

  // ---------------------------------------------------------------- 1 · HOOK (launchpad)
  if (p <= 2) {
    return {
      ...base,
      world: "launchpad",
      boxRods: p === 0 ? 2 : undefined,
      rodBand: p === 1 ? 0 : undefined,
      headline: p === 2 ? "Taking away" : undefined,
      astro: p === 2 ? "float" : undefined,
    };
  }

  // ------------------------------------------- 2 · WHAT TAKING AWAY MEANS (ignition)
  if (p <= 7) {
    return {
      ...base,
      world: "ignition",
      moveOn: p === 4 || p === 5 ? "$last" : undefined,
      band: p === 3 ? "bottom" : undefined,
      // the two lines that define it: one bead towards the beam, then the same bead away from it
      count: p === 4 ? "active" : null,
      countRod: 0,
      astro: p === 5 ? "catch" : p === 6 || p === 7 ? "float" : undefined,
      headline: p === 7 ? "Just practice!" : undefined,
    };
  }

  // ---------------------------------------------------------------- 3 · THE FINGER (ignition)
  if (p <= 10) {
    return {
      ...base,
      world: "ignition",
      moveOn: p === 9 || p === 10 ? "$last" : undefined,
      headline: p === 8 ? "Your finger" : undefined,
    };
  }

  // ---------------------------------------------------------------- 4 · FOUR TAKE AWAY TWO
  if (p <= 19) {
    return {
      ...base,
      world: "ascent",
      moveOn: p === 13 || p === 16 ? "$last" : undefined,
      count: p === 18 ? "active" : null,
      countRod: 0,
      band: p === 17 ? "bottom" : undefined,
      astro: p === 17 ? "catch" : p === 19 ? "cheer" : p === 15 ? "point" : undefined,
      big: ANSWER_TEXT[p],
    };
  }

  // ---------------------------------------------------------------- 5 · EIGHT TAKE AWAY THREE
  if (p <= 30) {
    return {
      ...base,
      world: "highair",
      moveOn: p === 22 || p === 23 || p === 26 ? "$last" : undefined,
      // "the upper bead doesn't move at all" — say it by lighting only the upper bead
      band: p === 27 || p === 29 ? "top" : p === 28 ? "bottom" : undefined,
      count: p === 24 ? "active" : null,
      countRod: 0,
      astro: p === 25 ? "point" : p === 30 ? "cheer" : undefined,
      big: ANSWER_TEXT[p],
    };
  }

  // ---------------------------------------------------------------- 6 · THE RULE SO FAR
  if (p <= 32) {
    return {
      ...base,
      world: "highair",
      band: p === 32 ? "bottom" : undefined,
      headline: p === 31 ? "The rule so far" : undefined,
      astro: p === 32 ? "point" : undefined,
    };
  }

  // ---------------------------------------------------------------- 7 · FIVE TAKE AWAY FIVE
  if (p <= 43) {
    return {
      ...base,
      world: "edgespace",
      moveOn: p === 38 ? "down" : p === 41 ? "$last" : undefined,
      band: p === 34 || p === 35 ? "top" : p === 42 ? "bottom" : undefined,
      headline: p === 33 ? "Take away five?" : undefined,
      astro: p === 40 ? "point" : p === 41 ? "catch" : p === 43 ? "cheer" : undefined,
      big: ANSWER_TEXT[p],
    };
  }

  // ---------------------------------------------------------------- 8 · SEVEN TAKE AWAY FIVE
  if (p <= 52) {
    return {
      ...base,
      world: "orbit",
      moveOn: p === 46 ? "down" : p === 47 || p === 49 ? "$last" : undefined,
      band: p === 50 || p === 51 ? "bottom" : undefined,
      count: p === 51 ? "active" : null,
      countRod: 0,
      astro: p === 48 ? "point" : p === 49 ? "catch" : p === 52 ? "cheer" : undefined,
      big: ANSWER_TEXT[p],
    };
  }

  // ---------------------------------------------------------------- 9 · NINE TAKE AWAY EIGHT
  if (p <= 63) {
    return {
      ...base,
      world: "deepspace",
      moveOn: p === 56 || p === 60 || p === 61 ? "$last" : undefined,
      headline: p === 53 ? "Both kinds" : p === 58 ? "5 and 3" : undefined,
      count: p === 62 ? "active" : null,
      countRod: 0,
      astro: p === 59 ? "point" : p === 61 ? "catch" : p === 63 ? "cheer" : undefined,
      big: ANSWER_TEXT[p],
    };
  }

  // ---------------------------------------------------------------- 10 · YOUR TURN (homeview)
  if (p <= 68) {
    return {
      ...base,
      world: "homeview",
      moveOn: p === 65 ? "$last" : undefined,
      rodBand: p === 66 ? 0 : undefined,
      headline: p === 64 ? "Your turn!" : p === 66 ? "What is left?" : undefined,
      astro: p === 66 ? "float" : p === 68 ? "cheer" : undefined,
      big: ANSWER_TEXT[p],
    };
  }

  // ---------------------------------------------------------------- 11 · CLOSE (homeview)
  return {
    ...base,
    world: "homeview",
    // the rod counts itself DOWN from nine, which is what this whole episode was
    rodRamp:
      p === 69
        ? { rod: 0, from: 0, to: 0, values: DRILL.map((d) => d.answer) }
        : undefined,
    closing: p >= 70,
    closeBeat: p === 70 ? "subscribe" : p <= 72 ? "store" : "next",
    worldWash: p === 71 || p === 72 ? 0.55 : undefined,
    noCaption: p === 71 || p === 72,
    astro: p === 69 ? "cheer" : undefined,
    valueChip: false,
    celebrate: p === 69 ? "party" : base.celebrate,
  };
};

// ---------------------------------------------------------------- rendering

const STORE_START = (() => {
  const i = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "store");
  return i < 0 ? 0 : sec(PHRASES[i].start, FPS);
})();

const STORE_FRAMES = (() => {
  const idx = PHRASES.map((x) => x.index).filter((i) => sceneFor(i).closeBeat === "store");
  if (!idx.length) return 181;
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

  // THE ASTRONAUT GETS A VOICE. It was doing the most expressive thing on screen in total silence,
  // which is why it read as decoration on a first watch. Each mood gets its own cue, and each is
  // placed where the gesture actually happens rather than at the line's start:
  //   catch — a soft boing as the bead lands in its hands, on the word the bead moves on
  //   point — a light click as the arm arrives, a fifth of the way in, which is when it extends
  //   cheer — a clap under the answer chime, quiet enough to sit beneath it
  // All well under the narration: this is punctuation, not a second soundtrack.
  for (let i = 0; i < PHRASES.length; i++) {
    const sc = sceneFor(i);
    if (!sc.astro || sc.hand) continue;
    const start = at(i);
    const span = sec(PHRASES[i].end, FPS) - start;
    if (sc.astro === "catch") {
      const mv = sc.moveOn;
      add(mv ? on(i, mv) : start + span * 0.35, "boing.mp3", 26, 0.16);
    } else if (sc.astro === "point") {
      add(start + span * 0.2, "btn_click.mp3", 16, 0.13);
    } else if (sc.astro === "cheer") {
      add(start + span * 0.12, "clap.mp3", 50, 0.18);
    }
  }
  // the countdown at the close: nine ticks as the rod empties
  const span = sec(PHRASES[69].end, FPS) - at(69);
  for (let k = 1; k <= 9; k++) add(at(69) + (span * k) / 10, "abacus_move.mp3", 22, 0.24);
  const p70 = at(70);
  const len70 = sec(PHRASES[70].end, FPS) - p70;
  add(p70 + len70 * 0.14, "btn_click.mp3", 20, 0.3);
  add(p70 + len70 * 0.42, "btn_click.mp3", 20, 0.3);
  add(p70 + len70 * 0.58, "bell.mp3", 46, 0.34);
  const rate = STORE_FRAMES / 136;
  add(STORE_START + 50 * rate, "btn_click.mp3", 20, 0.28);
  add(STORE_START + 92 * rate, "btn_click.mp3", 20, 0.3);
  add(STORE_START + 136 * rate - 8, "play_win.mp3", 60, 0.26);
  add(at(73), "swipe.mp3", 16, 0.24);
  return cues;
})();

/**
 * WHICH BEAD the character is indicating, as a fraction of the abacus's height.
 *
 * It was pointing at a fixed spot just under the beam, so on "now take away five" — a HEAVEN bead
 * line — it indicated the lower beads, which is the opposite of what the words said. The gesture has
 * to follow the move, and on a "now take away…" line the move belongs to the NEXT phrase, because
 * the instruction is spoken before it is obeyed.
 */
const pointsAtHeaven = (p: number) => {
  const move = (a: number, b: number) => (valueAt(a) >= 5) !== (valueAt(b) >= 5);
  return move(p, p + 1) || move(p - 1, p);
};

/**
 * The live value, ABOVE the abacus, in the headline band — the same slot the answer card and the
 * section headlines use, so every title in this episode appears in one place.
 *
 * It started under the ones rod, which cost the abacus a tenth of its size (the chip pushed into the
 * caption band) and put the number in a strip the eye never visits. In the title slot it is the
 * first thing read on every working line, and the beads get their full 1.15 back.
 */
const CHIP_W = 150;
const CHIP_H = 108;
const valueChipAt = (L: { W: number }) => ({
  x: (L.W - CHIP_W) / 2,
  y: BIG_TOP,
  w: CHIP_W,
  h: CHIP_H,
});

/** Where the astronaut floats, and how big. One function for the drawing AND the guard box — the
 *  two disagreeing is what let E03's bucket be clipped with the guard reporting nothing. */
const astroAt = (
  box: {
    left: number;
    w: number;
    top: number;
    h: number;
    scale: number;
    innerLeft: number;
    innerW: number;
  },
  L: { W: number; portrait: boolean; cardBand: { top: number; height: number } | null }
) => {
  // 4:5 puts it UNDER the abacus, bottom-right. Portrait leaves ~175 px of gutter once the abacus
  // is fitted and the character needs 260, so "beside" is not available — the same conclusion E03
  // reached for its bucket and its plus guy, and for the same measured reason.
  if (L.portrait && L.cardBand) {
    const scale = 1.5;
    const r = 82 * scale;
    // CENTRED across the width (user call). Pinned to the right edge it sat in the corner under one
    // end of the abacus, reading as something that had drifted off rather than as the episode's
    // character; the band under the abacus is its own full-width strip and nothing else is in it.
    // It still reaches UP rather than across, because the ones rod is above it.
    return { x: L.W / 2, y: L.cardBand.top + L.cardBand.height / 2, scale, r, reach: 0 };
  }
  // The character is ~140 units tall in its own space, so 1.05 put an 80 px astronaut in a 1080 px
  // frame — present, but too small to read a pose on. At 1.9 the catch and the cheer are legible,
  // which is the only reason it has moods at all.
  const scale = box.scale * (L.portrait ? 1.35 : 1.9);
  const r = 82 * scale;
  const x = Math.min(box.left + box.w + 172 * box.scale, L.W - r - 20);
  // How far the near hand has to travel to land on the ones rod, in the character's own units.
  const onesX = box.innerLeft + box.innerW - (ROD_PITCH / 2) * box.scale;
  return { x, y: box.top + box.h * 0.5, scale, r, reach: Math.max(0, (x - onesX) / scale) };
};

export const E05TakingAway: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e005_subtraction_rod1/E05.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={0}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_SPACE}
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
      // Only when the band is free: the answer card and the section headlines own it when present.
      if (scene.valueChip && !scene.big && !scene.headline) {
        out.push({ label: "valueChip", r: valueChipAt(L) });
      }
      if (scene.astro && !scene.hand) {
        const a = astroAt(ctx.box, L);
        out.push({
          label: "astro",
          r: { x: a.x - a.r, y: a.y - a.r, w: a.r * 2, h: a.r * 2 },
          // It reaches ONTO the rod, exactly as the finger hand does, so it carries the same
          // permission. Without it a helper that touches the instrument is a guard failure.
          mayTouchAbacus: true,
        });
      }
      return out;
    }}
    renderOver={(scene, ctx) => (
      <>
        {/* The astronaut never shares a line with the hand — two things reaching for the same rod
            is a muddle as well as a collision, the rule E03's plus character established. */}
        {scene.astro && !scene.hand && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <Astro
              {...(({ x, scale, reach }) => ({ x, scale, reach }))(astroAt(ctx.box, ctx.layout))}
              // FLOAT AT THE HEIGHT OF THE BEAD IT IS INDICATING. Anchored to the abacus's middle it
              // pointed just under the beam on every line — so on "now take away five", a heaven-bead
              // line, it indicated the lower beads, the opposite of what the words said.
              y={
                ctx.layout.portrait
                  ? astroAt(ctx.box, ctx.layout).y
                  : ctx.box.top +
                    ctx.box.h * (scene.astro === "cheer" ? 0.5 : pointsAtHeaven(ctx.p) ? 0.3 : 0.62)
              }
              mood={scene.astro}
              progress={ctx.beatProgress}
              frame={ctx.frame}
              fps={FPS}
            />
          </svg>
        )}

        {/* The rod's value, live, as the episode's running title. It flips only once the beads have
            ARRIVED — the same 0.85 settle gate the bead colours and the count badges use — so the
            number never announces a move before the move has happened. */}
        {scene.valueChip && !scene.big && !scene.headline && (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: ctx.layout.W,
              top: BIG_TOP + bob(ctx.frame, FPS, 5, 3.4),
              textAlign: "center",
            }}
          >
            <Card bg={WORLDS[scene.world].accent}>
              <StickerText size={BIG_SIZE}>
                {String(ctx.settle >= 0.85 ? valueAt(ctx.p) : valueAt(Math.max(0, ctx.p - 1)))}
              </StickerText>
            </Card>
          </div>
        )}

        {/* The drill's current sum, in the title slot, stepping with the beads beneath it. */}
        {scene.rodRamp?.values && (() => {
          const k = Math.min(
            DRILL.length - 1,
            Math.floor(ctx.beatProgress * DRILL.length)
          );
          return (
            <div
              style={{
                position: "absolute",
                left: 0,
                width: ctx.layout.W,
                top: BIG_TOP + bob(ctx.frame, FPS, 5, 3.4),
                textAlign: "center",
              }}
            >
              <Card bg={WORLDS[scene.world].accent}>
                <StickerText size={BIG_SIZE}>{`${DRILL[k].text} = ${DRILL[k].answer}`}</StickerText>
              </Card>
            </div>
          );
        })()}

        {scene.big && (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: ctx.layout.W,
              top: BIG_TOP + bob(ctx.frame, FPS, 5, 3.4),
              textAlign: "center",
            }}
          >
            <Card bg={WORLDS[scene.world].accent}>
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

              {scene.closeBeat === "next" && (() => {
              // The same two numbers NextUpCard uses for its own default example, so the teaser's
              // beads land on the beat the card was built around rather than on a second timeline.
              const nextSet = ctx.beatProgress > 0.45;
              const nextSettle = Math.max(
                0,
                Math.min(1, (ctx.beatProgress - 0.45) / (0.72 - 0.45))
              );
              return (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    width: ctx.layout.W,
                    top: pt ? 120 : 90,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <NextUpCard
                    progress={ctx.beatProgress}
                    title={["two", "rods"]}
                    example={
                      // 21 + 3 and 39 - 15 both land on 24, and NEITHER fits on one rod — which is
                      // exactly what the next episode is for. The SUMS and the ABACUS together: the
                      // sums pose the question, the instrument answers it on two rods, and dropping
                      // the abacus to make room for the sums threw away the half that shows WHY a
                      // second rod is needed. Every other teaser in the series ends on beads.
                      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            alignItems: "flex-start",
                          }}
                        >
                          {["21 + 3", "39 - 15"].map((t) => (
                            <span
                              key={t}
                              style={{
                                fontFamily: KID_FONT,
                                fontWeight: 700,
                                fontSize: 46,
                                color: "#2A3552",
                                lineHeight: 1,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        {/* index 0 is the ONES rod, so 24 is [4, 2] — four on the right, two on the
                            tens rod beside it. Both rods travel from zero on the same settle as the
                            rest of the card. */}
                        <Abacus
                          rods={[
                            { value: nextSet ? 4 : 0, from: 0 },
                            { value: nextSet ? 2 : 0, from: 0 },
                          ]}
                          settle={nextSettle}
                          scale={pt ? 0.42 : 0.52}
                          palette={RIG_SPACE}
                        />
                        <span
                          style={{
                            fontFamily: KID_FONT,
                            fontWeight: 700,
                            fontSize: pt ? 62 : 78,
                            color: nextSet ? "#E8543F" : "#B9C6CE",
                          }}
                        >
                          {nextSet ? 24 : "?"}
                        </span>
                      </div>
                    }
                  />
                </div>
              );
              })()}
            </div>
          );
        })()}
      </>
    )}
  />
);
