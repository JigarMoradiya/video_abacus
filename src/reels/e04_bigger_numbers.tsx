// E04 · Bigger numbers — 16:9 and 4:5 from one reel.
//
// The app's Level 1 Lesson 4 (Place Value) and Lesson 5 (Numbers to 99), plus one section on the
// hundreds rod. The worked numbers — ten, twenty-three, fifty-six, ninety-nine, thirty-eight — are
// the app's own, in the app's order.
//
// Timing comes from src/data/e04.phrases.json, aligned from docs/E04_spoken.txt. Word match
// 486/486. For the first time in the series every line is exactly one phrase: 56 lines -> 56
// PHRASES, so a phrase index here is also a line number.
//
// WHAT THIS EPISODE DOES DIFFERENTLY
//
//   · Its own instrument: RIG_CITY, slate frame and amber beads — the colour of a lit window in the
//     city it is set in, so a raised bead reads as "this floor is on".
//   · A NEW WORLD SET, and one drawing serves all eight: a skyline whose windows light up as the
//     numbers grow (`windows` 0.22 -> 0.95), under a sky that runs dawn to night. The episode's idea
//     is magnitude, so the world gets bigger with the lesson.
//   · The teaching device is the app's OWN place-value chip, which `Abacus` already draws:
//     `chipLower` puts 1 / 10 / 100 under a rod, `chipUpper` puts 5 / 50 / 500 above it, in the
//     app's PLACE_COLORS. Nothing had to be invented — it had to be driven per phrase.
//   · MORE THAN ONE ROD IS LIVE. Every episode so far used the ones rod alone. `handFor` therefore
//     has to find which rod changed, and it can no longer assume rod 0.
//   · Two phrases widen to THIRTEEN rods, because the line says the ones rod moves to the middle on
//     a bigger abacus — the one thing in the series that is false if stated unqualified
//     (VIDEO_SERIES_PLAN §6b), so it is shown rather than asserted.

import React from "react";
import phrasesJson from "../data/e04.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { E04_CARDS, assertCards } from "../data/e04Cards";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { PlaceSum, placeSumBox, type Place } from "../components/e04/PlaceSum";
import { Abacus, type RodState } from "../components/Abacus";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, numberWordFrames, wordFrameIn } from "../stage/clock";
import type { CardSpec, Scene as BaseScene } from "../stage/types";
import { RIG_CITY, WORLDS } from "../data/theme";
import { FPS, PLACE_COLORS, ROD_DIM } from "../data/tokens";

export const AUDIO_SEC = 237.401;
export const E04_DURATION = sec(AUDIO_SEC, FPS); // 7123

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

assertCards((p) => PHRASES[p]?.text ?? "");

interface Scene extends BaseScene {
  /** the place-value read-out: which cells exist, how many are revealed, and the total */
  read?: { places: Place[]; shown: number; total?: number };
  /** cells revealed one at a time across the line, for the one line that names three rods */
  readRamp?: boolean;
  /** the big answer number in the headline band */
  big?: string;
  /** which rods show their worth chip below (1 / 10 / 100) */
  chipsLower?: number[];
  /** which rods show their worth chip above (5 / 50 / 500) */
  chipsUpper?: number[];
}

/**
 * 1.04, not the series' usual 1.15.
 *
 * This is the only episode whose abacus carries LABELS below it — the place-value chips reach 58 px
 * past the frame — and at 1.15 they ran 9 px into the caption band and were clipped by the pill.
 * Solved arithmetically rather than by eye: the chips' bottom sits at
 * `stageMid + 296.5 * scale`, the caption starts at 860, so the scale has to stay under 1.086.
 * The beads give up 10% so the labels can exist, which is the right way round — the labels are the
 * lesson.
 */
const BASE = 1.04;
/** Thirteen rods will not fit at BASE; this is the scale E01's Free Mode beat uses. */
const WIDE = 0.78;

const BIG_TOP = 20;
const BIG_SIZE = 92;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

/** Nothing sits beside the abacus in this episode — the read-out is above it — so 4:5 can give the
 *  whole width to the beads, less what the finger hand reaches in from. */
const PORTRAIT_ROOM = { left: 90, right: 190 };

/** What the rod reads on each phrase, as a whole number 0-999. Rod 0 is ones, 1 tens, 2 hundreds. */
const VALUE: Record<number, number> = {
  // hook — the ones rod counts itself to nine and stops there, which is the problem
  0: 0, 1: 9, 2: 9,
  // which rod is which
  3: 9, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0,
  // making ten
  9: 0, 10: 10, 11: 10, 12: 10,
  // twenty-three
  13: 0, 14: 20, 15: 20, 16: 23, 17: 23, 18: 23,
  // the reading rule — 23 stays up, it is the thing being read
  19: 23, 20: 23, 21: 23,
  // fifty-six
  22: 0, 23: 50, 24: 50, 25: 55, 26: 56, 27: 56, 28: 56,
  // ninety-nine
  29: 0, 30: 90, 31: 90, 32: 99, 33: 99, 34: 99, 35: 99, 36: 99, 37: 99,
  // your turn
  38: 0, 39: 38, 40: 38, 41: 38, 42: 38, 43: 38, 44: 38,
  // one more rod
  45: 38, 46: 0, 47: 0, 48: 247, 49: 247, 50: 247,
  // close
  51: 0, 52: 0, 53: 0, 54: 0, 55: 0,
};

const valueAt = (p: number) => VALUE[p] ?? 0;
const digits = (v: number) => [v % 10, Math.floor(v / 10) % 10, Math.floor(v / 100) % 10];

/** How many rods are on stage. Two phrases widen to thirteen — see the header. */
const rodCountAt = (p: number) => (p === 4 || p === 5 ? 13 : 5);

/**
 * The rig. `focus` marks which rods the line is about: on a 13-rod frame only the centre rod is
 * lit, because that is the whole point of those two phrases.
 */
const rig = (p: number): RodState[] => {
  const n = rodCountAt(p);
  const d = digits(valueAt(p));
  const live = valueAt(p) >= 100 ? 3 : 2;
  return Array.from({ length: n }, (_, i) => ({
    value: i < 3 ? d[i] : 0,
    // 13 rods: only the ones rod (rod 6 of 13, counting from the right) is the subject
    focus: n === 13 ? (i === 6 ? 1 : ROD_DIM) : i < live ? 1 : ROD_DIM,
  }));
};

/**
 * WHICH FINGER, and — new in this episode — WHICH ROD.
 *
 * Every episode before this used the ones rod alone, so `handFor` could assume rod 0. Here the tens
 * and hundreds rods move too, so it finds the rod whose digit changed and points there. If more than
 * one changed on a line (only p48, which sets all three at once) there is no single rod to touch, so
 * no hand: that line gets the read-out ramp instead.
 *
 * Soroban technique, unchanged: earth beads UP take the thumb, earth beads DOWN and the heaven bead
 * take the index finger.
 */
const SILENT_RESET = new Set([4, 13, 22, 29, 38, 46, 51]);

const handFor = (p: number): Scene["hand"] => {
  if (p === 0 || SILENT_RESET.has(p) || rodCountAt(p) === 13) return undefined;
  const to = digits(valueAt(p));
  const from = digits(p > 0 ? valueAt(p - 1) : 0);
  const moved = [0, 1, 2].filter((i) => to[i] !== from[i]);
  if (moved.length !== 1) return undefined;
  const rod = moved[0];
  const lowerFrom = from[rod] % 5;
  const lowerTo = to[rod] % 5;
  if (lowerTo > lowerFrom) return { digit: "thumb", direction: "up", rod, heaven: false };
  if (from[rod] >= 5 !== to[rod] >= 5)
    return { digit: "index", direction: to[rod] >= 5 ? "down" : "up", rod, heaven: true };
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod, heaven: false };
  return undefined;
};

/** A read-out cell for a rod, in the app's own place colour. */
const place = (rod: number, worth: number): Place => ({
  worth,
  label: rod === 0 ? "ones" : rod === 1 ? "tens" : "hundreds",
  color: PLACE_COLORS[rod],
});

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneCore = (p: number): Scene => {
  const value = valueAt(p);
  const base = {
    stage: "abacus" as const,
    rods: rig(p),
    scale: rodCountAt(p) === 13 ? WIDE : BASE,
    targetRod: 0,
    highlight: null,
    hand: handFor(p),
  };

  // ---------------------------------------------------------------- 1 · HOOK (rooftop)
  if (p <= 2) {
    return {
      ...base,
      world: "rooftop",
      // the ones rod counts itself to nine and then has nowhere to go — E02 and E03 in one gesture
      rodRamp: p === 0 ? { rod: 0, from: 0, to: 9 } : undefined,
      chipsLower: p === 0 ? undefined : [0],
      rodBand: p === 1 ? 0 : undefined,
      headline: p === 1 ? "Bigger than nine?" : undefined,
      // "that is what the other rods are for" — light them, one after another, leftwards
      sweepRods: p === 2 ? [1, 2, 3, 4] : undefined,
    };
  }

  // ------------------------------------------------- 2 · WHICH ROD IS WHICH (crane)
  if (p <= 8) {
    return {
      ...base,
      world: "crane",
      // p4/p5 are the thirteen-rod frame: the ones rod is the CENTRE one, not the far right
      rodBand: p === 3 ? 0 : p === 4 || p === 5 ? 6 : p === 6 || p === 7 ? 1 : undefined,
      chipsLower: p === 3 ? [0] : p >= 7 ? [0, 1] : undefined,
      // "worth ten, NOT one" is a COMPARISON, so both rods have to be labelled — all four chips
      // (50 · 10 above and beside 5 · 1) are the sentence. With only the tens rod chipped there was
      // nothing for "not one" to point at.
      chipsUpper: p === 8 ? [0, 1] : undefined,
      headline: p === 5 ? "as in video one" : undefined,
      counter: p === 4 ? "13 rods" : undefined,
      moveOn: undefined,
      // "worth ten, NOT one" — the two chips side by side are the whole sentence
      boxRods: p === 8 ? 2 : undefined,
    };
  }

  // ---------------------------------------------------------------- 3 · MAKING TEN (tenblock)
  if (p <= 12) {
    return {
      ...base,
      world: "tenblock",
      chipsLower: p >= 11 ? [0, 1] : [1],
      moveOn: p === 10 ? "$last" : undefined,
      rodBand: p === 11 ? 0 : undefined,
      count: p === 12 ? "active" : null,
      countRod: 1,
      read: p === 12 ? { places: [place(1, 10)], shown: 1, total: 10 } : undefined,
      big: p === 9 ? "10" : undefined,
      celebrate: p === 12 ? "burst" : undefined,
      celebrateFrom: p === 12 ? BURST_FROM.get(12) : undefined,
    };
  }

  // ---------------------------------------------------------------- 4 · TWENTY-THREE (market)
  if (p <= 18) {
    return {
      ...base,
      world: "market",
      chipsLower: [0, 1],
      moveOn: p === 14 || p === 16 ? "$last" : undefined,
      count: p === 15 ? "active" : p === 17 ? "active" : null,
      countRod: p === 15 ? 1 : p === 17 ? 0 : undefined,
      read:
        p >= 15
          ? {
              places: [place(1, 20), place(0, 3)],
              shown: p >= 17 ? 2 : 1,
              total: p >= 18 ? 23 : undefined,
            }
          : undefined,
      celebrate: p === 18 ? "burst" : undefined,
      celebrateFrom: BURST_FROM.get(p),
    };
  }

  // ------------------------------------------------- 5 · THE READING RULE (noon)
  if (p <= 21) {
    return {
      ...base,
      world: "noon",
      chipsLower: [0, 1],
      boxRods: p === 19 ? 2 : undefined,
      rodBand: p === 20 ? 1 : p === 21 ? 0 : undefined,
      read: { places: [place(1, 20), place(0, 3)], shown: p === 20 ? 1 : p === 21 ? 2 : 0, total: 23 },
    };
  }

  // ---------------------------------------------------------------- 6 · FIFTY-SIX (neonstreet)
  if (p <= 28) {
    return {
      ...base,
      world: "duskstreet",
      chipsLower: [0, 1],
      moveOn: p === 23 || p === 25 ? "down" : p === 26 ? "$last" : undefined,
      count: p === 27 ? "active" : null,
      countRod: 0,
      read:
        p >= 24
          ? {
              places: [place(1, 50), place(0, 6)],
              shown: p >= 27 ? 2 : 1,
              total: p >= 28 ? 56 : undefined,
            }
          : undefined,
      celebrate: p === 28 ? "burst" : undefined,
      celebrateFrom: BURST_FROM.get(p),
    };
  }

  // ------------------------------------------- 7 · NINETY-NINE, THE MAXIMUM (summit)
  if (p <= 37) {
    return {
      ...base,
      world: p === 37 ? "starcity" : "summit",
      chipsLower: [0, 1],
      moveOn: p === 30 || p === 32 ? "$last" : undefined,
      headline: p === 29 ? "The biggest?" : p === 35 ? "That is the most" : undefined,
      boxRods: p === 35 || p === 36 ? 2 : undefined,
      counter: p === 36 ? "0 … 99" : undefined,
      read:
        p >= 31 && p <= 34
          ? {
              places: [place(1, 90), place(0, 9)],
              shown: p >= 33 ? 2 : 1,
              total: p >= 34 ? 99 : undefined,
            }
          : undefined,
      big: p === 37 ? "100" : undefined,
      celebrate: p === 34 ? "burst" : undefined,
      celebrateFrom: BURST_FROM.get(p),
    };
  }

  // ---------------------------------------------------------------- 8 · YOUR TURN (starcity)
  if (p <= 44) {
    return {
      ...base,
      world: "starcity",
      chipsLower: [0, 1],
      // No hand on the question: the child is READING this one, not being shown how to build it.
      hand: undefined,
      moveOn: p === 39 ? "$last" : undefined,
      boxRods: p === 39 ? 2 : undefined,
      rodBand: p === 41 ? 1 : p === 42 ? 0 : undefined,
      headline: p === 38 ? "Your turn!" : p === 40 ? "What number?" : undefined,
      read:
        p >= 41
          ? {
              places: [place(1, 30), place(0, 8)],
              shown: p >= 42 ? 2 : 1,
              total: p >= 43 ? 38 : undefined,
            }
          : undefined,
      celebrate: p === 43 ? "burst" : p === 44 ? "party" : undefined,
      celebrateFrom: BURST_FROM.get(p),
    };
  }

  // ---------------------------------------------------------------- 9 · ONE MORE ROD (starcity)
  if (p <= 50) {
    return {
      ...base,
      world: "starcity",
      // NO sweep on p50. `applySweep` drives the rods' values itself, so on a line where the rod
      // is showing 247 the sweep overwrote it and the ones rod read 5 — the picture contradicting
      // the number it had just built. The five chips (1 · 10 · 100 · 1000 · 10000) reading left to
      // right are the sentence anyway; the box holds them together.
      sweepRods: p === 45 ? [2, 3, 4] : undefined,
      boxRods: p === 50 ? 5 : undefined,
      rodBand: p === 46 || p === 47 ? 2 : undefined,
      // p46 NAMES the hundreds rod; p47 gives its WORTH. Showing the "100" chip on 46 pre-empted the
      // next line — and in 4:5 it sat directly across the naming card's arrow, which is how the
      // guard found it.
      chipsLower:
        p === 45 || p === 46 ? [0, 1] : p === 50 ? [0, 1, 2, 3, 4] : [0, 1, 2],
      chipsUpper: p === 47 ? [2] : undefined,
      moveOn: p === 48 ? "$last" : undefined,
      readRamp: p === 48,
      // The read-out belongs to 247 and stops with it. p50 is about the RULE, not that number, and
      // its five sweeping chips (1 · 10 · 100 · 1000 · 10000) are the sentence — the headline band
      // is theirs.
      read:
        p >= 48 && p <= 49
          ? {
              places: [place(2, 200), place(1, 40), place(0, 7)],
              shown: p === 48 ? 0 : 3,
              total: p >= 49 ? 247 : undefined,
            }
          : undefined,
      headline: p === 50 ? "ten times more" : undefined,
      celebrate: p === 49 ? "burst" : undefined,
      celebrateFrom: BURST_FROM.get(p),
    };
  }

  // ---------------------------------------------------------------- 10 · CLOSE (starcity)
  return {
    ...base,
    world: "starcity",
    rodRamp: p === 51 ? { rod: 1, from: 0, to: 9 } : undefined,
    chipsLower: p === 51 ? [0, 1] : undefined,
    closing: p >= 52,
    closeBeat: p === 52 ? "subscribe" : p <= 54 ? "store" : "next",
    worldWash: p === 53 || p === 54 ? 0.55 : undefined,
    noCaption: p === 53 || p === 54,
    headline: p === 51 ? "Your turn!" : undefined,
    celebrate: p === 51 ? "party" : undefined,
  };
};

/**
 * The place-value chips are per-ROD state that `Abacus` already draws, so the scene declares them as
 * rod indices and they are folded onto the rods here — one place, after every section has had its
 * say. Driving them through a SceneStage prop would have been a new mechanism for something the
 * instrument already knows how to do.
 */
const sceneFor = (p: number): Scene => {
  const s = sceneCore(p);
  const lower = s.chipsLower ?? [];
  const upper = s.chipsUpper ?? [];
  if (!lower.length && !upper.length) return s;
  return {
    ...s,
    rods: s.rods.map((r, i) => ({
      ...r,
      chipLower: lower.includes(i) || undefined,
      chipUpper: upper.includes(i) || undefined,
    })),
  };
};

// ---------------------------------------------------------------- rendering

const cardFor = (p: number): CardSpec | undefined => E04_CARDS[p];

/**
 * The frame each answer LANDS on — the first frame of its line's final word, which is the word that
 * names the total. The burst, the chime and the read-out's total all key off this one number, the
 * lesson E03 paid for: a reward that fires on the line's first frame celebrates before the child has
 * heard the answer.
 */
const ANSWER_LINES = [12, 18, 28, 34, 43, 49];
const ANSWER_FRAME = new Map<number, number>();
for (const i of ANSWER_LINES) {
  ANSWER_FRAME.set(i, wordFrameIn(PHRASES[i], "$last", FPS) ?? sec(PHRASES[i].start, FPS));
}
const BURST_FROM = new Map<number, number>();
for (const [i, f] of ANSWER_FRAME) {
  BURST_FROM.set(i, f);
  if (i + 1 !== 44 && i + 1 !== 51) BURST_FROM.set(i + 1, f);
}

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
 * Sound from the script: a bead click wherever a rod's value really changes, ON the word that moves
 * it; a tick per spoken number in a counted run; the app's chime on each answer.
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
  for (const i of [15, 17, 27]) {
    for (const f of numberWordFrames(PHRASES[i], FPS)) add(f, "tick.mp3", 12, 0.28);
  }
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);
  // the rod counting itself, at the top and at the close
  for (const i of [0, 51]) {
    const span = sec(PHRASES[i].end, FPS) - at(i);
    for (let k = 1; k <= 9; k++) add(at(i) + (span * k) / 10, "abacus_move.mp3", 22, 0.24);
  }
  const p52 = at(52);
  const len52 = sec(PHRASES[52].end, FPS) - p52;
  add(p52 + len52 * 0.14, "btn_click.mp3", 20, 0.3);
  add(p52 + len52 * 0.42, "btn_click.mp3", 20, 0.3);
  add(p52 + len52 * 0.58, "bell.mp3", 46, 0.34);
  const rate = STORE_FRAMES / 136;
  add(STORE_START + 50 * rate, "btn_click.mp3", 20, 0.28);
  add(STORE_START + 92 * rate, "btn_click.mp3", 20, 0.3);
  add(STORE_START + 136 * rate - 8, "play_win.mp3", 60, 0.26);
  add(at(55), "swipe.mp3", 16, 0.24);
  return cues;
})();

/** The read-out sits in the HEADLINE BAND, centred — a wide short element in a wide short space. */
const readBox = (
  scene: Scene,
  L: { W: number; portrait: boolean; band: { stageTop: number } }
) => {
  if (!scene.read) return null;
  const nat = placeSumBox(scene.read.places.length, true);
  const room = L.band.stageTop - BIG_TOP - 12;
  // The 4:5 cap was 0.62 and it was the binding constraint, so the read-out came out at under
  // two-thirds size in the cut where it needed to be relatively LARGER — a 1080-wide frame is watched
  // on a phone, and an element has to occupy more of the width there, not less. At 1.0 it matches the
  // 16:9 cut in absolute pixels, which in portrait is nearly twice the presence. The height of the
  // headline band still governs (room / nat.h works out at 1.2), so it cannot reach the abacus.
  const scale = Math.min(1, room / nat.h, (L.W - 80) / nat.w);
  const w = nat.w * scale;
  return { scale, x: (L.W - w) / 2, layoutX: (L.W - nat.w) / 2, y: BIG_TOP, w, h: nat.h * scale };
};

export const E04BiggerNumbers: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e004_bigger_number/E04.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={0}
    cardFor={cardFor}
    subjectFor={() => undefined}
    runSlots={[150, 300, 210, 360]}
    guardOverlap
    arrowClearance
    palette={RIG_CITY}
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
      const rb = readBox(scene, L);
      if (rb) out.push({ label: "readout", r: { x: rb.x, y: rb.y, w: rb.w, h: rb.h } });
      return out;
    }}
    renderOver={(scene, ctx) => (
      <>
        {scene.read && (() => {
          const b = readBox(scene, ctx.layout)!;
          // p48 names three rods in one sentence, so its cells arrive across the line rather than
          // all at once — the same law as the count badges: never ahead of the voice.
          const shown = scene.readRamp
            ? Math.min(3, Math.floor(ctx.beatProgress * 3.6))
            : scene.read.shown;
          const total =
            ANSWER_FRAME.has(ctx.p) && ctx.frame < ANSWER_FRAME.get(ctx.p)!
              ? undefined
              : scene.read.total;
          return (
            <div
              style={{
                position: "absolute",
                left: b.layoutX,
                top: b.y + bob(ctx.frame, FPS, 4, 3.6),
              }}
            >
              <PlaceSum
                places={scene.read.places}
                shown={shown}
                total={total}
                ink={WORLDS[scene.world].ink}
                progress={ctx.beatProgress}
                scale={b.scale}
              />
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

              {scene.closeBeat === "next" && (
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
                    title={["taking", "away"]}
                    example={
                      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <Abacus
                          rods={[
                            { value: ctx.beatProgress > 0.45 ? 2 : 7, from: 7 },
                          ]}
                          settle={Math.max(0, Math.min(1, (ctx.beatProgress - 0.45) / 0.25))}
                          scale={0.52}
                          palette={RIG_CITY}
                        />
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
