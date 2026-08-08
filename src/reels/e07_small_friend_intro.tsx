// E07 · The trick that fixes it — 16:9 and 4:5 from one reel.
//
// The first FORMULA in the series: the small friend, +3 = −2+5. The app's Level 2 Chapter 5, which is
// theory-only there; here it is theory plus one worked case, because E06's teaser promised "the
// clever trick that fixes it" and an episode that poses a problem without solving it is a broken
// promise.
//
// Timing from src/data/e07.phrases.json, aligned from docs/E07_spoken.txt. 67 lines -> 67 PHRASES.
//
// WHAT THIS EPISODE DOES DIFFERENTLY
//
//   · IT FAILS ON PURPOSE, and that is the whole hook. Every episode so far has said "here is how
//     the beads work". This one pushes a bead, pushes another, and stops — the rod runs out and sits
//     there stuck for five lines while the problem is named. Nothing before this has been allowed to
//     go wrong, so nothing before this has needed a character who can be baffled.
//   · RIG_MAGIC — plum frame, gold beads. Sixth distinct instrument.
//   · A MAGIC SHOW for the world set, because the episode is literally about a trick, and because a
//     stage is the one place where being stuck in front of everyone is part of the act. The LIGHT
//     carries the story: closed curtain, one hard spot as the sum jams, a second warm spot finding
//     the upper bead, then the stage opening out as the trick works.
//   · A RABBIT with a STUCK pose — ears flat, scratching its head — which plays across the beat the
//     beads run out. It is the only mood no earlier character had, because no earlier episode failed.
//   · THE FRIEND CARDS: 1|4 and 2|3, two cards that snap together sealed with a five. "Every small
//     number has a friend" needs objects, not a spoken list.

import React from "react";
import phrasesJson from "../data/e07.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Rabbit, type RabbitMood } from "../components/e07/Rabbit";
import { FriendCards, FRIENDS_NAT } from "../components/e07/FriendCards";
import { FormulaList, FORMULA_NAT, FORMULA_ONE, SMALL_FRIENDS } from "../components/e07/FormulaList";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { Abacus, type RodState } from "../components/Abacus";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import type { Scene as BaseScene } from "../stage/types";
import { RIG_MAGIC, WORLDS } from "../data/theme";
import { FPS, ROD_DIM } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";

export const AUDIO_SEC = 195.161;
export const E07_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

interface Scene extends BaseScene {
  rabbit?: RabbitMood;
  /** the friends-of-five table: how many pairs are up, which is being used, which is being asked */
  friends?: { shown: number; active?: number; asking?: number };
  /** the sum in column form */
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep };
  /** the big answer in the headline band */
  big?: string;
  /** the rod's live value above the abacus */
  valueChip?: boolean;
  /** the "no bead left" mark: a dashed empty slot where a fifth lower bead would be */
  outOfBeads?: boolean;
  /** the four small-friend formulas, with one lit */
  formulas?: { active?: number; stagger?: boolean; only?: boolean; label?: string };
  /** true only on the line each card's contents change, so it animates once and then holds */
  friendsArriving?: boolean;
  /** the friends card's state on the previous line, for the travelling highlight */
  friendsPrev?: { shown: number; active?: number; asking?: number };
  formulasArriving?: boolean;
}

/** One rod, and it is the only rod this episode has. The small friend lives entirely on the ones. */
const BASE = 1.15;
const BIG_TOP = 20;
const BIG_SIZE = 80;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

/** Room for the rabbit and its hat on the right. */
const PORTRAIT_ROOM = { left: 80, right: 210 };

/**
 * What the ones rod reads on each phrase.
 *
 * The shape of this table IS the episode: three, then a failed push to four, then four held for
 * twenty-seven phrases while the problem is named and the trick explained, then back to three to do
 * it properly. That long hold is not a mistake — the rod being stuck is the subject.
 */
const VALUE: Record<number, number> = (() => {
  const v: Record<number, number> = {};
  for (let p = 0; p < PHRASES.length; p++) v[p] = 0;
  for (let p = 3; p < 5; p++) v[p] = 3;
  for (let p = 5; p < 33; p++) v[p] = 4; // the failed push, and the whole diagnosis
  for (let p = 33; p < 36; p++) v[p] = 3; // undo it — the trick starts from three
  for (let p = 36; p < 38; p++) v[p] = 1; // take away two lower
  for (let p = 38; p < 42; p++) v[p] = 6; // upper bead down: 3 + 3 = 6
  for (let p = 44; p < 47; p++) v[p] = 4;
  for (let p = 47; p < 49; p++) v[p] = 2; // take away two lower
  for (let p = 49; p < 52; p++) v[p] = 7; // upper bead down: 4 + 3 = 7
  for (let p = 53; p < 58; p++) v[p] = 2; // the child's own two
  for (let p = 58; p < 62; p++) v[p] = 6; // 2 + 4 = 6
  return v;
})();

const valueAt = (p: number) => VALUE[p] ?? 0;

/**
 * Lines where the rod changes without a taught move: the section resets, the undo of the failed
 * push, the number the CHILD makes, and the your-turn answer.
 */
const SILENT_SET = new Set([33, 42, 52, 53, 58, 62]);

const rig = (p: number): RodState[] =>
  Array.from({ length: 5 }, (_, i) => ({
    value: i === 0 ? valueAt(p) : 0,
    focus: i === 0 ? 1 : ROD_DIM,
  }));

/**
 * WHICH FINGER. Same derivation as E04, E05 and E06 — a property of the MOVE, never of the bead:
 * towards the top of the frame is the thumb, downwards is the index finger.
 */
const handFor = (p: number): Scene["hand"] => {
  if (p === 0 || SILENT_SET.has(p)) return undefined;
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

/** The frame each answer LANDS on — the first frame of its line's final word. */
const ANSWER_LINES = [40, 51, 58];
const ANSWER_TEXT: Record<number, string> = {
  40: "3 + 3 = 6",
  51: "4 + 3 = 7",
  58: "2 + 4 = 6",
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
 * THE FRIENDS TABLE per phrase.
 *
 * Built up as it is spoken (p21 one pair, p22 both), then used as a LOOKUP: on "three's friend is
 * two" the 2-3 pair lights and the 3 is marked as the one being asked about, so the card answers the
 * question the narration just posed rather than sitting there as decoration.
 */
const FRIENDS: Record<number, NonNullable<Scene["friends"]>> = (() => {
  const out: Record<number, NonNullable<Scene["friends"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["friends"]>) => ps.forEach((p) => (out[p] = v));
  put([19, 20], { shown: 0 });
  put([21, 24], { shown: 1 });
  put([22, 23, 25, 26, 27], { shown: 2 });
  // the lookups
  put([28], { shown: 2 });
  // p29 is the LOOKUP ("three's friend is two"); p30-32 state the RULE, and get the formula
  // card instead — same left slot, so the card changes when the subject changes.
  put([29], { shown: 2, active: 1, asking: 3 });
  put([46, 47], { shown: 2, active: 1, asking: 3 });
  put([55, 56], { shown: 2, active: 0, asking: 4 });
  return out;
})();

/** The column sum, on the two worked examples and the your-turn. */
const SUMS: Record<number, NonNullable<Scene["sum"]>> = (() => {
  const out: Record<number, NonNullable<Scene["sum"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["sum"]>) => ps.forEach((p) => (out[p] = v));
  const A = { a: 3, b: 3, op: "+" };
  put([1, 2], { ...A, step: "none" });
  put([3, 4], { ...A, step: "first" });
  put([5, 6, 7, 8, 9, 10, 11], { ...A, step: "second" });
  put([33, 34, 35, 36, 37, 38, 39], { ...A, step: "second" });
  put([40, 41], { ...A, total: 6, step: "answer" });
  const B = { a: 4, b: 3, op: "+" };
  put([42, 43, 44], { ...B, step: "first" });
  put([45, 46, 47, 48, 49, 50], { ...B, step: "second" });
  put([51], { ...B, total: 7, step: "answer" });
  const C = { a: 2, b: 4, op: "+" };
  put([53], { ...C, step: "first" });
  put([54, 55, 56, 57], { ...C, step: "second" });
  put([58, 59], { ...C, total: 6, step: "answer" });
  return out;
})();

const SUM_FIRST = new Set(
  Object.keys(SUMS)
    .map(Number)
    .filter((p) => !SUMS[p - 1])
);

/** Lines where a calculation is being worked, so the live value belongs above the abacus. */
const isWorking = (p: number) =>
  (p >= 2 && p <= 11) || (p >= 33 && p <= 41) || (p >= 43 && p <= 51) || (p >= 53 && p <= 59);

/**
 * WHAT THE RABBIT IS DOING, listed rather than derived, because its moods are dramatic beats and not
 * a function of the arithmetic. `stuck` is the one that matters and it runs from the failed push
 * until the upper bead is remembered.
 */
const RABBIT: Record<number, RabbitMood> = (() => {
  const r: Record<number, RabbitMood> = {};
  const put = (ps: number[], m: RabbitMood) => ps.forEach((p) => (r[p] = m));
  put([0, 1, 2], "peek");
  put([6, 7, 8, 9, 10, 11], "stuck"); // the beads have run out
  // p14 belongs to the bead-worth card ("the upper bead is worth five"), which stands where the
  // rabbit does. The idea beat still lands across p12-13.
  put([12, 13], "idea"); // "but look up here"
  put([15, 16, 17, 18, 19, 20, 26, 27, 28, 29, 30, 31, 32], "show");
  put([40, 41, 51, 58, 59, 60], "cheer");
  put([61, 62], "cheer");
  return r;
})();

/**
 * WHERE THE TWO LEFT-HAND CARDS GO.
 *
 * The column sum and the friends table both want the left gutter, and on "three's friend is two
 * again" both are on screen. In 16:9 the gutter is 620px tall and they stack — sum above, friends
 * below, a fixed slot each so neither moves when the other appears.
 *
 * In 4:5 there is one card band and no second slot, so the FRIENDS card wins on those lines: it is
 * the thing the sentence is about, and the sum is still legible on the abacus itself.
 */
/**
 * THE FRIEND CARDS' OWN GOLD, fixed rather than taken from the world.
 *
 * The card was using `WORLDS[world].accent`, which on the stage beats is #FFD873 — a pale gold that
 * belongs on a dark plum backdrop and washes out completely on the card's white. It also meant the
 * device changed colour as the worlds moved through the episode, and a reference table a child looks
 * things up in should look the same every time they look at it.
 */
const FRIEND_GOLD = "#C07A05";

const SUM_S = (portrait: boolean) => (portrait ? 0.74 : 0.92);
const FRIENDS_S = (portrait: boolean) => (portrait ? 0.66 : 0.8);
/** the four-row table is taller than the friends card, and 4:5's card band is only ~240px */
const FORMULA_S = (portrait: boolean, only: boolean) =>
  only ? (portrait ? 0.72 : 0.9) : portrait ? 0.56 : 0.9;
const sumSlot = (L: { portrait: boolean; band: { stageTop: number }; cardBand: { top: number } | null }) =>
  L.portrait
    ? { x: 34, y: L.cardBand!.top + 8 }
    : { x: 44, y: L.band.stageTop + 34 };
const friendsSlot = (
  L: {
    portrait: boolean;
    W: number;
    band: { stageTop: number; stageBottom: number };
    cardBand: { top: number } | null;
  },
  withSum: boolean
) => {
  if (L.portrait) return { x: (L.W - FRIENDS_NAT.w * FRIENDS_S(true)) / 2, y: L.cardBand!.top + 6 };
  // stacked under the sum when both are up; otherwise CENTRED in the stage band, so on the lines
  // where the table is the only thing in the gutter it sits level with the abacus instead of hanging
  // off the bottom of it
  if (withSum) return { x: 44, y: L.band.stageTop + 34 + COL_NAT.h * SUM_S(false) + 18 };
  const h = FRIENDS_NAT.h * FRIENDS_S(false);
  return { x: 44, y: L.band.stageTop + (L.band.stageBottom - L.band.stageTop - h) / 2 };
};

/**
 * THE FORMULA CARD per phrase.
 *
 * p30-32 are where the rule is SPOKEN — "instead of adding three we add five and take away two" —
 * so that is where the notation belongs, next to the words that mean the same thing. The closing
 * lines then name it as a formula and reveal its three siblings.
 */
const FORMULAS: Record<number, NonNullable<Scene["formulas"]>> = {
  // The rule beats get ONE strip, reading the way the narration says it: "add five and take away
  // two". The headline above says the same thing in words, so the strip is the symbol version of the
  // sentence the child is hearing, not a different notation to decode.
  30: { active: 3, only: true, label: "+5 − 2" },
  31: { active: 3, only: true, label: "+5 − 2" },
  32: { active: 3, only: true, label: "+5 − 2" },
  // p60 has NO card. "That is your first abacus formula" is a line ABOUT what just happened, and the
  // answer is still standing on the beads — a formula strip beside it was restating a thing the
  // viewer had watched three times already.
  // "there is one for every small number" is the line that earns the full four — and NONE of them
  // is highlighted. The worked example used +3 but the child's own turn used +4, so singling out +3
  // on the line that says "there is one for every small number" points at the wrong one and makes
  // the table look like it has a favourite.
  61: { stagger: true },
};

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const hand = handFor(p);
  const base = {
    stage: "abacus" as const,
    rods: rig(p),
    scale: BASE,
    targetRod: 0,
    highlight: null,
    hand,
    moveOn: !SILENT_SET.has(p) && valueAt(p) !== valueAt(p - 1) ? "$last" : undefined,
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
    sum: SUMS[p]?.step === "answer" ? undefined : SUMS[p],
    // portrait has one card slot; `renderOver` drops the sum when the friends table is up
    friends: FRIENDS[p],
    formulas: FORMULAS[p],
    // ANIMATE ONLY WHEN THE CONTENTS CHANGE. `progress` restarts every phrase, so a card driven
    // straight off it re-fades on every line it is up — which is the blink.
    friendsArriving: FRIENDS[p] !== undefined && FRIENDS[p - 1]?.shown !== FRIENDS[p]?.shown,
    // where the highlight was on the previous line, so it TRAVELS rather than jumping
    friendsPrev: FRIENDS[p - 1],
    formulasArriving: FORMULAS[p] !== undefined && FORMULAS[p - 1] === undefined,
    big: ANSWER_TEXT[p],
    valueChip: isWorking(p) && !ANSWER_TEXT[p],
    // never a rabbit on a line that already has a finger hand: two things reaching for one rod
    rabbit: hand ? undefined : RABBIT[p],
  };

  // ---------------------------------------------------------------- 1 · THE HOOK (curtain)
  if (p <= 1) {
    return { ...base, world: "curtain", headline: p === 0 ? "A sum that gets stuck" : undefined };
  }

  // ------------------------------------------------- 2 · IT GOES WRONG (hardspot)
  if (p <= 11) {
    return {
      ...base,
      world: "hardspot",
      // the empty slot where a fifth lower bead would be, from the moment we run out
      outOfBeads: p >= 6,
      band: p >= 9 && p <= 10 ? "bottom" : undefined,
      countFrom: p === 9 ? 0 : undefined,
      countOnNumbers: p === 9,
      headline: p === 6 ? "stuck!" : undefined,
    };
  }

  // ---------------------------------------------- 3 · THE THING WE FORGOT (goldlight)
  if (p <= 17) {
    return {
      ...base,
      world: "goldlight",
      band: p >= 13 ? "top" : undefined,
      beadWorth: p === 14 ? { which: "upper", worth: 5 } : undefined,
      headline: p === 12 ? "look up here" : undefined,
    };
  }

  // ---------------------------------------------------------------- 4 · FRIENDS OF FIVE (backstage)
  if (p <= 26) {
    return {
      ...base,
      world: "backstage",
      headline: p === 19 ? "every number has a friend" : undefined,
    };
  }

  // ---------------------------------------------------------------- 5 · THE TRICK (hatreveal)
  if (p <= 32) {
    return {
      ...base,
      world: "hatreveal",
      // the headline holds across all three rule lines, so the words and the strip agree the
      // whole time the rule is being stated
      headline: p >= 30 && p <= 32 ? "add 5, take away 2" : undefined,
    };
  }

  // ------------------------------------------------- 6 · THE TRICK ON THE ABACUS (stagefull)
  if (p <= 41) {
    return {
      ...base,
      world: "stagefull",
      band: p === 35 || p === 36 ? "bottom" : p === 38 ? "top" : undefined,
      headline: p === 41 ? "and we never ran out" : undefined,
    };
  }

  // ---------------------------------------------------------------- 7 · ONE MORE (encore)
  if (p <= 51) {
    return { ...base, world: "encore", band: p === 49 ? "top" : undefined };
  }

  // ---------------------------------------------------------------- 8 · YOUR TURN (applause)
  if (p <= 59) {
    return {
      ...base,
      world: "applause",
      headline: p === 52 ? "your turn" : undefined,
      celebrate: p === 58 || p === 59 ? ("party" as const) : base.celebrate,
    };
  }

  // ---------------------------------------------------------------- 9 · CLOSE (finale)
  //
  // THE CLOSE BEGINS AT p62, NOT p60. p60 and p61 are still CONTENT — "that is your first abacus
  // formula" and "there is one for every small number" — and the first pass let them fall through to
  // `closeBeat: "store"`, so the app-store phone rendered over a live abacus twenty seconds early.
  // Exactly the bug E06 had, repeated here.
  //
  //   p60-61  the formulas, still on the abacus: the notation for the trick just performed
  //   p62     like & subscribe
  //   p63-64  the store flow
  //   p65-66  the next-episode teaser
  if (p <= 61) {
    return {
      ...base,
      world: "finale",
      headline: p === 60 ? "your first formula" : undefined,
      // p60 names the one they did; p61 reveals its three siblings, one at a time
      rabbit: "cheer",
    };
  }

  return {
    ...base,
    world: "finale",
    closing: true,
    closeBeat: p === 62 ? "subscribe" : p <= 64 ? "store" : "next",
    worldWash: 0.55,
    noCaption: p === 63 || p === 64,
    valueChip: false,
    sum: undefined,
    friends: undefined,
    rabbit: p === 62 ? "cheer" : undefined,
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
    const mv = sceneFor(i).moveOn;
    add(mv ? on(i, mv) : at(i), "abacus_move.mp3", 30, 0.32);
  }
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);

  // THE FAILURE GETS A SOUND. "And now we are stuck" is the turn the whole episode pivots on, and
  // `nope.mp3` exists for exactly this — a soft comedic deflate, not a wrong-answer buzzer, because
  // the child has done nothing wrong; the abacus has run out of beads.
  add(on(5, "$last"), "nope.mp3", 40, 0.34);
  add(at(6), "boing.mp3", 26, 0.24);

  // the counting run on "one, two, three, four" — the rising scale from E01's hook, four notes
  for (let k = 0; k < 4; k++) {
    const span = sec(PHRASES[9].end, FPS) - at(9);
    add(at(9) + (span * (k + 0.15)) / 4, `count_tick_${k + 1}.mp3`, 14, 0.2);
  }

  // the idea landing, and each friend pair arriving
  add(at(12) + 6, "reveal5.mp3", 60, 0.3);
  add(at(21) + 4, "tick.mp3", 20, 0.26);
  add(at(22) + 4, "tick.mp3", 20, 0.26);

  // the rabbit: a soft pop as it comes out, a clap when it cheers
  for (let i = 0; i < PHRASES.length; i++) {
    const sc = sceneFor(i);
    if (!sc.rabbit || sc.hand) continue;
    if (sc.rabbit === "cheer" && sceneFor(i - 1)?.rabbit !== "cheer") {
      add(at(i) + Math.round((sec(PHRASES[i].end, FPS) - at(i)) * 0.12), "clap.mp3", 50, 0.18);
    }
    if (sc.rabbit === "show" && sceneFor(i - 1)?.rabbit !== "show") {
      add(at(i) + 4, "boing.mp3", 24, 0.16);
    }
  }

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

/**
 * Where the rabbit's hat stands: on the boards, to the right of the abacus.
 *
 * The anchor is the HAT BRIM, and the character grows upward out of it — so the box is measured off
 * the artwork rather than guessed from a radius: ears reach 292 local units above the brim at full
 * rise, the brim's shadow 22 below it, and the widest point is the brim itself at 104 either side.
 * A guess put a 345px-tall box on a 266px-wide character and ran it into the caption.
 */
const RABBIT_BOX = { up: 292, down: 26, half: 112 };

const rabbitAt = (
  box: { left: number; w: number; top: number; h: number; scale: number },
  L: { W: number; H: number; portrait: boolean },
  closing = false,
  /** something else is in the band below the abacus, so step aside instead of standing in it */
  aside = false
) => {
  if (closing) {
    const scale = L.portrait ? 1.05 : 1.25;
    return { x: L.W - 150 * scale, y: L.H * (L.portrait ? 0.74 : 0.8), scale };
  }
  // 4:5 PUTS IT BELOW THE ABACUS, CENTRED. In portrait the instrument is nearly the full width, so
  // "beside the abacus" clamped the rabbit against the right edge with its hat half off the frame.
  // Under the instrument is the only place with room, and centred is the only placement that does
  // not look like it slid there.
  if (L.portrait) {
    // CENTRED under the abacus — unless a card is already there, in which case it steps to the right
    // of it rather than disappearing. Something in the way is a reason to move, not to leave.
    const scale = box.scale * (aside ? 0.5 : 0.62);
    return {
      x: aside ? L.W - RABBIT_BOX.half * scale - 34 : L.W / 2,
      y: box.top + box.h + (RABBIT_BOX.up + 26) * scale,
      scale,
    };
  }
  const scale = box.scale * 0.98;
  return {
    // stands on the abacus's own baseline, so the hat is on the boards next to the instrument
    x: Math.min(box.left + box.w + 172 * box.scale, L.W - RABBIT_BOX.half * scale - 16),
    y: box.top + box.h,
    scale,
  };
};

/** The rabbit's real extent, for the overlap guard. */
const rabbitRect = (m: { x: number; y: number; scale: number }) => ({
  x: m.x - RABBIT_BOX.half * m.scale,
  y: m.y - RABBIT_BOX.up * m.scale,
  w: RABBIT_BOX.half * 2 * m.scale,
  h: (RABBIT_BOX.up + RABBIT_BOX.down) * m.scale,
});

export const E07SmallFriendIntro: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e007_small_friend_intro/E07.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={0}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_MAGIC}
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
      const sumShown = scene.sum && !(L.portrait && scene.friends);
      if (sumShown) {
        const s = SUM_S(L.portrait);
        const at = sumSlot(L);
        out.push({ label: "sumCard", r: { ...at, w: COL_NAT.w * s, h: COL_NAT.h * s } });
      }
      if (scene.formulas) {
        const sc = FORMULA_S(L.portrait, Boolean(scene.formulas.only));
        const nat = scene.formulas.only ? FORMULA_ONE : FORMULA_NAT;
        const w = nat.w * sc;
        const h = nat.h * sc;
        out.push({
          label: "formulas",
          r: L.portrait
            ? { x: (L.W - w) / 2, y: L.cardBand!.top + 6, w, h }
            : { x: 44, y: L.band.stageTop + (L.band.stageBottom - L.band.stageTop - h) / 2, w, h },
        });
      }
      if (scene.friends) {
        const s = FRIENDS_S(L.portrait);
        const at = friendsSlot(L, Boolean(sumShown));
        out.push({ label: "friends", r: { ...at, w: FRIENDS_NAT.w * s, h: FRIENDS_NAT.h * s } });
      }
      const rabbitAside = Boolean(L.portrait && !scene.closing && (scene.friends || scene.formulas));
      if (scene.rabbit) {
        const m = rabbitAt(ctx.box, L, Boolean(scene.closing), rabbitAside);
        out.push({
          label: "rabbit",
          r: rabbitRect(m),
          mayTouchAbacus: true,
          mayExitFrame: true,
        });
      }
      return out;
    }}
    renderOver={(scene, ctx) => (
      <>
        {/* THE RABBIT */}
        {scene.rabbit && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            {(() => {
              const m = rabbitAt(
                ctx.box,
                ctx.layout,
                Boolean(scene.closing),
                Boolean(
                  ctx.layout.portrait && !scene.closing && (scene.friends || scene.formulas)
                )
              );
              return (
                <Rabbit
                  x={m.x}
                  y={m.y}
                  scale={m.scale}
                  mood={scene.rabbit!}
                  progress={ctx.beatProgress}
                  frame={ctx.frame}
                  fps={FPS}
                />
              );
            })()}
          </svg>
        )}

        {/* THE FOUR FORMULAS, on the two closing content lines */}
        {scene.formulas && (() => {
          const L = ctx.layout;
          const sc = FORMULA_S(L.portrait, Boolean(scene.formulas!.only));
          const nat = scene.formulas!.only ? FORMULA_ONE : FORMULA_NAT;
          const w = nat.w * sc;
          return (
            <div
              style={{
                position: "absolute",
                left: L.portrait ? (L.W - w) / 2 : 44,
                top: L.portrait
                  ? L.cardBand!.top + 6
                  : L.band.stageTop + (L.band.stageBottom - L.band.stageTop - nat.h * sc) / 2,
              }}
            >
              <FormulaList
                active={scene.formulas.active}
                stagger={scene.formulas.stagger}
                only={scene.formulas.only}
                label={scene.formulas.label}
                arriving={scene.formulasArriving}
                accent={FRIEND_GOLD}
                progress={ctx.beatProgress}
                scale={sc}
              />
            </div>
          );
        })()}

        {/* THE FRIENDS TABLE */}
        {scene.friends && (() => {
          const L = ctx.layout;
          const s = FRIENDS_S(L.portrait);
          const at = friendsSlot(L, Boolean(scene.sum && !L.portrait));
          return (
            <div style={{ position: "absolute", left: at.x, top: at.y }}>
              <FriendCards
                shown={scene.friends.shown}
                active={scene.friends.active}
                asking={scene.friends.asking}
                arriving={scene.friendsArriving}
                prevActive={scene.friendsPrev?.active}
                prevAsking={scene.friendsPrev?.asking}
                accent={FRIEND_GOLD}
                progress={ctx.beatProgress}
                scale={s}
              />
            </div>
          );
        })()}

        {/* THE COLUMN SUM */}
        {scene.sum && !(ctx.layout.portrait && scene.friends) && (() => {
          const L = ctx.layout;
          const s = SUM_S(L.portrait);
          const at = sumSlot(L);
          const prev = SUMS[ctx.p - 1];
          return (
            <div style={{ position: "absolute", left: at.x, top: at.y }}>
              <ColumnSum
                a={scene.sum.a}
                b={scene.sum.b}
                op={scene.sum.op}
                total={scene.sum.total}
                step={scene.sum.step}
                prevStep={prev?.step ?? "none"}
                popIn={SUM_FIRST.has(ctx.p)}
                bg={WORLDS[scene.world].accent}
                progress={ctx.beatProgress}
                scale={s}
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
                boxShadow: "0 8px 0 rgba(26,12,31,0.35)",
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
            {/* THE PAIR IS ONE COMPOSITION, and it is CENTRED IN THE FRAME.
                At 300 / 1090 the phone and the panel sat at opposite edges with 420px of dead frame
                between them, and neither was vertically centred — the phone started 20px from the
                top and the panel floated 65px above its middle.
                Now: phone 370 wide + 120 gap + panel 500 = 990, centred across 1920 puts the phone
                at 465 and the panel at 955. Vertically the phone's 760 sits at 140 (140 above, 160
                below) and the panel's ~510 at 285, so both are centred and level with each other. */}
            <div
              style={{
                position: "absolute",
                left: ctx.layout.portrait ? (ctx.layout.W - 353) / 2 : 465,
                // 4:5 is STACKED, and it was top-aligned: phone at 6, CTA under it, and ~250px of
                // empty frame left at the bottom. The pair measures ~1084 tall in a 1350 frame, so
                // centring it puts the phone at 133 and the CTA at 887.
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
              title={["all four", "small friends"]}
              example={
                // the four friends as a set — what the next episode covers, and the reason this one
                // ends with "there is one for every small number"
                // ONE formula design, not two. This list had its own hardcoded pair of colours — a
                // bright yellow for the lit one and a muted purple for the rest — which is a third
                // palette for a thing the episode has already shown twice. It now uses exactly what
                // `FormulaList` uses, so a child sees the same table in the same colours every time.
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* NONE highlighted. The teaser is about all four — the worked example used +3 and
                      the child's own turn used +4, so singling out either one points at the wrong
                      formula for a card that says "all four small friends". */}
                  {SMALL_FRIENDS.map((f) => (
                    <span
                      key={f.n}
                      style={{
                        fontFamily: KID_FONT,
                        fontWeight: 700,
                        fontSize: 34,
                        color: FRIEND_GOLD,
                      }}
                    >
                      {f.text}
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
);
