// E10 · Beat the Beads — 16:9 and 4:5 from one reel.
//
// NOT a teaching episode. E08 taught all four Little Friends for addition; E09 taught all four
// for subtraction. This is the recall test: eight rounds, mixed (never blocked add-then-subtract),
// each one a real worked case the child has already met, framed as a TV game show so recall feels
// like play rather than review.
//
// Timing from public/audio/e010_small_friend_game/E10.phrases.json, aligned from
// docs/E10_lines.txt. 65 lines -> 77 phrases, 289.88 s, 99.8% word match.
//
// WHAT THIS EPISODE DOES DIFFERENTLY
//
//   · THE WHEEL OF FRIENDS. E09's gag was a call box that made "so we call a friend" literal;
//     this one is a spinning wheel that DECIDES the round — the game mechanic and the content are
//     the same object, not a lesson with a game bolted on.
//   · TWO FOXES, RIVAL CONTESTANTS. Not a pair who agree with each other (E08's puppies, E09's
//     gulls both nod along) — one buzzes in and wins each round, alternating, because a QUIZ needs
//     someone to answer, not just react.
//   · EVERY ROUND IS A COMPOSITE BEAD MOVE. There is no slow two-step "add the friend, THEN
//     release five" here — each answer line moves both bead groups in one beat (hand2For), which
//     is correct precisely because this is recall, not first teaching.
//   · RIG_SHOW — electric indigo frame, buzzer-gold beads. Tenth distinct instrument, and the
//     first that is a stage rather than a place: this episode teaches nothing new, so the abacus
//     itself becomes the game prop.

import React from "react";
import { interpolate } from "remotion";
import phrasesJson from "../data/e10.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Fox, FOX_BOX, type FoxMood } from "../components/e10/Fox";
import { Wheel, WHEEL_SEGMENTS, wheelBox } from "../components/e10/Wheel";
import { FormulaList, FORMULA_ONE } from "../components/e07/FormulaList";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { Abacus, type RodState } from "../components/Abacus";
import { Card, StickerText } from "../components/Sticker";
import { bob, wiggle } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import type { Scene as BaseScene } from "../stage/types";
import { RIG_SHOW, WORLDS } from "../data/theme";
import { FPS, ROD_DIM, HEAVEN_H, BEAM_H, ABACUS_INNER_H } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";

// The ACTUAL file duration (ffprobe), not the aligner's "speech ends" timestamp (289.88) — that
// timestamp is where the ASR stops detecting words, with zero tail after it, so the video was
// cutting the instant "time!" was deemed to end instead of after its natural decay. E09 used the
// real file length for exactly this reason (300.04 against a last-word end of 299.76).
export const AUDIO_SEC = 290.19;
export const E10_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

interface Scene extends BaseScene {
  negative?: boolean;
  foxes?: { left: FoxMood; right: FoxMood };
  wheel?: { roundIdx: number };
  /** the intro's own slow, continuous spin — not tied to any round's landing. Fixes the
   *  intro reading as static: nothing else on screen was moving for six lines. */
  wheelIdle?: boolean;
  /** which round (1-8) is on screen, for the top-left round card. Set across the round's WHOLE
   *  span (announce through answer), not just while the wheel itself is up. */
  roundNum?: number;
  /** which round's question beat is playing, for the "3, 2, 1" countdown — visual only, no
   *  audio, paying off the intro's own "before I count to three". */
  countdownRound?: number;
  formulas?: { label: string; n: number };
  formulasArriving?: boolean;
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep };
  big?: string;
  valueChip?: boolean;
}

const BASE = 1.15;
const BIG_TOP = 20;
const BIG_SIZE = 80;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

const PORTRAIT_ROOM = { left: 80, right: 190 };

/**
 * THE EIGHT ROUNDS — one source of truth. Every derived table (value, sum, formula, headline,
 * fox mood, wheel timing, SFX) is built from this, rather than eight hand-copied tables that can
 * silently drift from each other. `winner` alternates left/right — a QUIZ needs someone to answer,
 * not two characters nodding along together.
 */
type RoundPhrases = {
  announce: number;
  landsOn: number;
  make: number;
  stuck: number[];
  question: number[];
  reveal: number;
  answer: number;
  winner: "left" | "right";
};
type RoundContent = { start: number; a: number; b: number; op: "+" | "−"; ans: number; n: number; formula: string };

const ROUNDS: RoundPhrases[] = [
  { announce: 6, landsOn: 7, make: 8, stuck: [9], question: [10], reveal: 11, answer: 12, winner: "left" },
  { announce: 13, landsOn: 14, make: 15, stuck: [16], question: [17], reveal: 18, answer: 19, winner: "right" },
  { announce: 20, landsOn: 21, make: 22, stuck: [23, 24], question: [25], reveal: 26, answer: 27, winner: "left" },
  { announce: 28, landsOn: 29, make: 30, stuck: [31], question: [32, 33], reveal: 34, answer: 35, winner: "right" },
  { announce: 39, landsOn: 40, make: 41, stuck: [42], question: [43], reveal: 44, answer: 45, winner: "left" },
  { announce: 46, landsOn: 47, make: 48, stuck: [49, 50], question: [51, 52], reveal: 53, answer: 54, winner: "right" },
  { announce: 55, landsOn: 56, make: 57, stuck: [58], question: [59], reveal: 60, answer: 61, winner: "left" },
  { announce: 62, landsOn: 63, make: 64, stuck: [65], question: [66], reveal: 67, answer: 68, winner: "right" },
];

// Mixed order, locked with the user: +1, −3, +4, −2 | −1, +3, −4, +2. Every case a real E08/E09
// worked example, reused on purpose — recall works better against a sum already met than a new one.
const CONTENT: RoundContent[] = [
  { start: 4, a: 4, b: 1, op: "+", ans: 5, n: 1, formula: "−4 +5" },
  { start: 6, a: 6, b: 3, op: "−", ans: 3, n: 3, formula: "+2 −5" },
  { start: 1, a: 1, b: 4, op: "+", ans: 5, n: 4, formula: "−1 +5" },
  { start: 6, a: 6, b: 2, op: "−", ans: 4, n: 2, formula: "+3 −5" },
  { start: 5, a: 5, b: 1, op: "−", ans: 4, n: 1, formula: "+4 −5" },
  { start: 2, a: 2, b: 3, op: "+", ans: 5, n: 3, formula: "−2 +5" },
  { start: 7, a: 7, b: 4, op: "−", ans: 3, n: 4, formula: "+1 −5" },
  { start: 3, a: 3, b: 2, op: "+", ans: 5, n: 2, formula: "−3 +5" },
];

// STUCK_SFX[i] is round i's OWN reaction sound — eight different files, matched to that line's
// tone (matter-of-fact / uh-oh / determined / weary / confident / bright / playful / final),
// never the one sound repeated eight times.
const STUCK_SFX = [
  "stuck_matteroffact.mp3",
  "stuck_uhoh.mp3",
  "stuck_determined.mp3",
  "stuck_weary.mp3",
  "stuck_confident.mp3",
  "stuck_bright.mp3",
  "stuck_playful.mp3",
  "stuck_final.mp3",
];

const VALUE: Record<number, number> = (() => {
  const v: Record<number, number> = {};
  for (let p = 0; p < PHRASES.length; p++) v[p] = 0;
  ROUNDS.forEach((r, i) => {
    const c = CONTENT[i];
    for (let p = r.make; p <= r.reveal; p++) v[p] = c.start;
    v[r.answer] = c.ans;
  });
  return v;
})();

const valueAt = (p: number) => VALUE[p] ?? 0;

/** Every round's announce (the abacus resets to zero) and make (the puzzle is set silently) —
 *  no taught move at either, snap with no arrow. */
const SILENT_SET = new Set(ROUNDS.flatMap((r) => [r.announce, r.make]));

/** The abacus is on stage for every round; only the mid-roll like ask and the close hide it. */
const abacusFrom = (p: number) => p >= 6 && p <= 68 && !(p >= 36 && p <= 38);

const rig = (p: number): RodState[] =>
  Array.from({ length: 5 }, (_, i) => ({
    value: i === 0 ? valueAt(p) : 0,
    focus: i === 0 ? 1 : ROD_DIM,
  }));

/** WHICH FINGER — unchanged from E04-E09: a property of the MOVE's direction, never of the bead
 *  or the operation. Up is the thumb, down is the index finger. */
const handFor = (p: number): Scene["hand"] => {
  if (p === 0 || SILENT_SET.has(p) || !abacusFrom(p)) return undefined;
  const to = valueAt(p);
  const from = p > 0 ? valueAt(p - 1) : 0;
  if (to === from) return undefined;
  const lowerFrom = from % 5;
  const lowerTo = to % 5;
  if (lowerTo > lowerFrom) return { digit: "thumb", direction: "up", rod: 0, heaven: false };
  if (from >= 5 !== to >= 5) {
    const goingUp = to < 5;
    return { digit: goingUp ? "thumb" : "index", direction: goingUp ? "up" : "down", rod: 0, heaven: true };
  }
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod: 0, heaven: false };
  return undefined;
};

/**
 * THE SECOND HAND. Every round's answer line is a composite move (both bead groups at once —
 * this is recall, not first teaching, so there is no slow two-step reveal). `handFor`'s branch
 * order means its PRIMARY hand is whichever move it checks first (`lowerTo > lowerFrom`, the lower
 * beads increasing); when that is NOT the case but the heaven bead still crosses, the primary hand
 * ends up being the HEAVEN move instead, and the missing move is the lower beads DECREASING —
 * always index/down, by definition of the branch that was skipped. E09's own hand2For only ever
 * needed to supply the heaven move (its one composite case increased the lower beads); this one
 * has cases of BOTH shapes — the addition rounds decrease the lower beads while the subtraction
 * rounds increase them — so this generalises it rather than copying it unchanged.
 */
const hand2For = (p: number): Scene["hand2"] => {
  if (p === 0 || SILENT_SET.has(p) || !abacusFrom(p)) return undefined;
  const to = valueAt(p);
  const from = p > 0 ? valueAt(p - 1) : 0;
  const lowerFrom = from % 5;
  const lowerTo = to % 5;
  const lowerMoved = lowerTo !== lowerFrom;
  const heavenCrossed = from >= 5 !== to >= 5;
  if (!lowerMoved || !heavenCrossed) return undefined;
  if (lowerTo > lowerFrom) {
    // primary already caught the lower move; supply the heaven move.
    const goingUp = to < 5;
    return { digit: goingUp ? "thumb" : "index", direction: goingUp ? "up" : "down", rod: 0, heaven: true };
  }
  // primary caught the heaven move; supply the lower move — always decreasing, always index/down.
  return { digit: "index", direction: "down", rod: 0, heaven: false };
};

const ANSWER_LINES = ROUNDS.map((r) => r.answer);
const ANSWER_TEXT: Record<number, string> = (() => {
  const out: Record<number, string> = {};
  ROUNDS.forEach((r, i) => {
    const c = CONTENT[i];
    out[r.answer] = `${c.a} ${c.op} ${c.b} = ${c.ans}`;
  });
  return out;
})();
const ANSWER_FRAME = new Map<number, number>();
for (const i of ANSWER_LINES) {
  ANSWER_FRAME.set(i, wordFrameIn(PHRASES[i], "$last", FPS) ?? sec(PHRASES[i].start, FPS));
}
const BURST_FROM = new Map<number, number>();
for (const [i, f] of ANSWER_FRAME) {
  BURST_FROM.set(i, f);
  BURST_FROM.set(i + 1, f);
}

// The FULL equation, not just its right-hand side — "+4 = −1 +5", not "−1 +5" alone. The RHS-only
// card left the LEFT half of the trick (which number, which sign) unsaid on the one card whose
// whole job is naming the trick.
const FORMULAS: Record<number, string> = {};
const FORMULA_N: Record<number, number> = {};
ROUNDS.forEach((r, i) => {
  const c = CONTENT[i];
  FORMULAS[r.reveal] = `${c.op}${c.n} = ${c.formula}`;
  FORMULA_N[r.reveal] = c.n;
});

/** The sum, in column form, on every round — announced at `make`, gone the instant the big
 *  answer card takes over (never a phrase earlier — see the ANSWER_TEXT-gated hide below). */
const SUMS: Record<number, NonNullable<Scene["sum"]>> = (() => {
  const out: Record<number, NonNullable<Scene["sum"]>> = {};
  ROUNDS.forEach((r, i) => {
    const c = CONTENT[i];
    for (let p = r.make; p <= r.reveal; p++) out[p] = { a: c.a, b: c.b, op: c.op, step: "none" };
  });
  return out;
})();
const SUM_FIRST = new Set(Object.keys(SUMS).map(Number).filter((p) => !SUMS[p - 1]));

/** Which section is named — bottom, from the stuck reaction through the reveal, on every round:
 *  the lower beads are where every one of these eight rounds actually jams. */
const HIGHLIGHT_FOR: Record<number, "top" | "bottom"> = (() => {
  const out: Record<number, "top" | "bottom"> = {};
  ROUNDS.forEach((r) => {
    for (let p = r.stuck[0]; p <= r.reveal; p++) out[p] = "bottom";
  });
  return out;
})();

const NEGATIVE = new Set(ROUNDS.flatMap((r) => r.stuck));

const isWorking = (p: number) => Boolean(SUMS[p]) && abacusFrom(p) && !FORMULAS[p];

/**
 * THE WHEEL — which round's segment is under the pointer. `landOn` is just the round index:
 * `WHEEL_SEGMENTS` is written in the SAME locked order as `CONTENT`, so segment i is round i's
 * own answer by construction, not a lookup that can drift.
 *
 * Present on BOTH the announce and landsOn phrases — whether it has actually landed is decided
 * by absolute frame against `ROUND_SPIN`, not by which of those two phrases is playing. It used
 * to land the instant the announce phrase's own audio ended, which could be well before "It
 * lands on..." was even being said. Now it keeps spinning across the phrase boundary and only
 * catches on the word "lands" — the wheel and the narration agree on when it's decided.
 */
const WHEEL_AT: Record<number, number> = (() => {
  const out: Record<number, number> = {};
  ROUNDS.forEach((r, i) => {
    out[r.announce] = i;
    out[r.landsOn] = i;
  });
  return out;
})();

const ROUND_SPIN = ROUNDS.map((r) => ({
  start: wordFrameIn(PHRASES[r.announce], "spin", FPS) ?? sec(PHRASES[r.announce].start, FPS),
  land: wordFrameIn(PHRASES[r.landsOn], "lands", FPS) ?? sec(PHRASES[r.landsOn].start, FPS),
}));

/** The round card, top-left — which of the eight is on screen, across its whole span. */
const ROUND_OF: Record<number, number> = (() => {
  const out: Record<number, number> = {};
  ROUNDS.forEach((r, i) => {
    for (let p = r.announce; p <= r.answer; p++) out[p] = i + 1;
  });
  return out;
})();

/**
 * THE COUNTDOWN — "3, 2, 1", visual only, no audio, paying off the intro's own promise ("You
 * tell me that number's friend, before I count to three"). Spans the round's WHOLE question
 * beat (both phrases, on the rounds where the question line splits in two), divided into three
 * even thirds rather than tied to any specific word — there is no spoken "three, two, one" to
 * sync against, this is purely a tension beat the picture adds on its own.
 */
const COUNTDOWN_AT: Record<number, number> = (() => {
  const out: Record<number, number> = {};
  ROUNDS.forEach((r, i) => {
    for (const p of r.question) out[p] = i;
  });
  return out;
})();
// `end` reaches the REVEAL phrase's own start, not the question phrase's own end — the countdown
// was finishing (fading "1" out) the instant the question line stopped talking, which left a gap
// of silence before the answer actually arrived. Now "1" holds all the way to the boundary, so it
// completes right as the answer begins, not some time before it.
const COUNTDOWN_WINDOW = ROUNDS.map((r) => ({
  start: sec(PHRASES[r.question[0]].start, FPS),
  end: sec(PHRASES[r.reveal].start, FPS),
}));

/**
 * THE FOXES — one buzzes in and wins each round (alternating), the other is still working it out.
 * `point` while the wheel spins and the puzzle is set, `worry` on the stuck reaction, `think`
 * across the question's hold, then the winner `buzz`es in on the reveal while the other defers,
 * and both `cheer` on the answer — a game show is a shared celebration even though only one of
 * them rang in first.
 */
const FOXES: Record<number, { left: FoxMood; right: FoxMood }> = (() => {
  const out: Record<number, { left: FoxMood; right: FoxMood }> = {};
  const put = (ps: number[], l: FoxMood, r: FoxMood) => ps.forEach((p) => (out[p] = { left: l, right: r }));
  ROUNDS.forEach((r) => {
    // Not `announce`/`landsOn` — the wheel is centre stage and full-size for those two lines
    // (see `closing: Boolean(base.wheel)`), and the foxes shared that space would either clip
    // through it or be hidden behind it depending on layer order. `make` is their first beat.
    put([r.make], "point", "point");
    put(r.stuck, "worry", "worry");
    put(r.question, "think", "think");
    put([r.reveal], r.winner === "left" ? "buzz" : "point", r.winner === "right" ? "buzz" : "point");
    put([r.answer], "cheer", "cheer");
  });
  return out;
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
    sum: ANSWER_TEXT[p] ? undefined : SUMS[p],
    formulas: FORMULAS[p] ? { label: FORMULAS[p], n: FORMULA_N[p] } : undefined,
    formulasArriving: Boolean(FORMULAS[p]) && !FORMULAS[p - 1],
    big: ANSWER_TEXT[p],
    valueChip: isWorking(p) && !ANSWER_TEXT[p],
    negative: NEGATIVE.has(p),
    wheel: WHEEL_AT[p] !== undefined ? { roundIdx: WHEEL_AT[p] } : undefined,
    foxes: hand ? undefined : FOXES[p],
    roundNum: ROUND_OF[p],
    countdownRound: COUNTDOWN_AT[p],
  };

  // ---------------------------------------------------------------- 1 · GAME INTRO (showlights)
  //
  // The abacus sitting there at rest for six whole lines, changing only its own tiny corner fox
  // moods, is exactly the "nothing is really moving" complaint the rest of the episode already
  // got caught on — so the abacus is OFF here (closing:true) and the wheel itself, idly turning,
  // is the thing on screen the whole time instead.
  if (p <= 5) {
    const LEFT_MOOD: FoxMood[] = ["wave", "point", "point", "point", "worry", "cheer"];
    const RIGHT_MOOD: FoxMood[] = ["sit", "point", "point", "point", "worry", "cheer"];
    return {
      ...base,
      world: "showlights",
      closing: true,
      headline: p === 0 ? "beat the beads!" : undefined,
      foxes: { left: LEFT_MOOD[p], right: RIGHT_MOOD[p] },
      wheelIdle: true,
    };
  }

  // ---------------------------------------------------------------- 2 · ROUNDS ONE-FOUR (buzzerstage)
  //
  // The wheel takes the WHOLE stage for its own two lines (`announce`/`landsOn`) — the abacus is
  // off (`closing: true`) exactly then, back the instant the puzzle itself is set (`make`).
  if (p <= 35) {
    return { ...base, world: "buzzerstage", closing: Boolean(base.wheel) };
  }

  // ---------------------------------------------------------------- 3a · THE MILESTONE (greenroom)
  //
  // "Four down, four to go — you are on fire today!" names a SCORE, not a like button — showing
  // the Like/Subscribe card under it was the actual bug: the card is right for p37's own words,
  // not for this line's. Its own visual instead: the same "4 / 8" the words say.
  if (p === 36) {
    return {
      ...base,
      world: "greenroom",
      closing: true,
      closeBeat: "milestone",
      worldWash: 0.5,
      valueChip: false,
      sum: undefined,
      formulas: undefined,
      celebrate: "party" as const,
      headline: "halfway there!",
      foxes: { left: "cheer", right: "cheer" },
    };
  }

  // ---------------------------------------------------------------- 3b · THE LIKE ASK (greenroom)
  //
  // NEW SPOT, per EPISODE_RULES §3.9a: after round four, on the halfway win — not the close, not
  // the 94-96% mark E02-E07 used, not E08's 72%. `closeBeat: "subscribe"` is what actually puts
  // the Like button on screen — only under p37, the one line that actually says it. p38 was
  // still inside this same block (`p <= 38`) and showed the same buttons under a caption that
  // never mentions liking or subscribing either — the exact bug p36 already got caught on.
  if (p === 37) {
    return {
      ...base,
      world: "greenroom",
      closing: true,
      closeBeat: "subscribe",
      worldWash: 0.5,
      valueChip: false,
      sum: undefined,
      formulas: undefined,
      foxes: { left: "wave", right: "wave" },
    };
  }

  // ---------------------------------------------------------------- 3c · KEEP MIXING (greenroom)
  //
  // "The wheel keeps mixing it up" is a transition BACK into the game, not a second like ask —
  // removing the (mismatched) buttons here without putting anything in their place just left the
  // line with nothing at all. The line is literally ABOUT the wheel, so the wheel is the visual:
  // the same idle spin the intro uses, reused here for the same reason — alive, not parked.
  if (p === 38) {
    return {
      ...base,
      world: "greenroom",
      closing: true,
      worldWash: 0.5,
      valueChip: false,
      sum: undefined,
      formulas: undefined,
      foxes: { left: "point", right: "point" },
      wheelIdle: true,
    };
  }

  // ---------------------------------------------------------------- 4 · ROUNDS FIVE-EIGHT (buzzerstagehot)
  if (p <= 68) {
    return { ...base, world: "buzzerstagehot", closing: Boolean(base.wheel) };
  }

  // ---------------------------------------------------------------- 5 · RECAP (confettifinale)
  //
  // The abacus resets from round 8's answer (5) to 0 right here (VALUE has no entry past p68) —
  // but p69 sits outside `abacusFrom`'s window (p<=68), so `base` computed neither `moveOn` nor
  // `silentCut` for it and the reset fell through to the DEFAULT animated-with-arrow treatment.
  // Same bug, same fix as E09's "you know both now": nothing is being taught by this reset.
  if (p <= 71) {
    return {
      ...base,
      world: "confettifinale",
      celebrate: p === 69 ? ("party" as const) : base.celebrate,
      foxes: { left: "cheer", right: "cheer" },
      silentCut: p === 69,
    };
  }

  // ---------------------------------------------------------------- 6 · CLOSE (confettifinale)
  if (p <= 72) {
    return { ...base, world: "confettifinale", foxes: { left: "point", right: "cheer" } };
  }

  return {
    ...base,
    world: "confettifinale",
    closing: true,
    closeBeat: p <= 74 ? "store" : "next",
    worldWash: 0.55,
    noCaption: p === 73 || p === 74,
    valueChip: false,
    sum: undefined,
    formulas: undefined,
    foxes: p >= 76 ? { left: "wave", right: "cheer" } : undefined,
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
    if (!abacusFrom(i) || valueAt(i) === valueAt(i - 1)) continue;
    const mv = sceneFor(i).moveOn;
    add(mv ? on(i, mv) : at(i), "abacus_move.mp3", 30, 0.32);
  }
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);

  // THE WHEEL — a ratchet while it spins, a ding when it lands, both synced to the SAME frames
  // the wheel itself now uses (`ROUND_SPIN`, keyed to the words "spin" and "lands" rather than
  // phrase boundaries). The old cue played at the phrase's start, before the wheel had visibly
  // begun turning — by the time the visual spin started, the sound had already finished, which
  // is why it read as missing rather than just mistimed. THE STUCK REACTIONS — eight different
  // sounds, one per round, matched to that line's own tone.
  ROUNDS.forEach((r, i) => {
    add(ROUND_SPIN[i].start, "wheel_spin.mp3", 78, 0.42);
    add(ROUND_SPIN[i].land, "wheel_land.mp3", 40, 0.34);
    add(on(r.stuck[0], "$last"), STUCK_SFX[i], 30, 0.46);
    add(at(r.reveal) + 2, "buzzer.mp3", 24, 0.3);
    add(at(r.reveal) + 3, "friend_sparkle.mp3", 42, 0.22);
  });

  const subIdx = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "subscribe");
  if (subIdx !== undefined) {
    const st = at(subIdx);
    const span = sec(PHRASES[subIdx].end, FPS) - st;
    add(st + span * 0.16, "btn_click.mp3", 20, 0.3);
    add(st + span * 0.45, "btn_click.mp3", 20, 0.3);
    add(st + span * 0.58, "bell.mp3", 46, 0.34);
  }

  const rate = STORE_FRAMES / 136;
  add(STORE_START + 50 * rate, "btn_click.mp3", 20, 0.28);
  add(STORE_START + 92 * rate, "btn_click.mp3", 20, 0.3);
  add(STORE_START + 136 * rate - 8, "play_win.mp3", 60, 0.26);
  const nextIdx = PHRASES.map((x) => x.index).find((i) => sceneFor(i).closeBeat === "next");
  if (nextIdx !== undefined) add(at(nextIdx), "swipe.mp3", 16, 0.24);
  // a clap the instant BOTH foxes start cheering
  for (let i = 1; i < PHRASES.length; i++) {
    const s = sceneFor(i);
    const q = sceneFor(i - 1);
    if (!s.foxes || s.hand) continue;
    const nowCheer = s.foxes.left === "cheer" && s.foxes.right === "cheer";
    const wasCheer = q.foxes?.left === "cheer" && q.foxes?.right === "cheer";
    if (nowCheer && !wasCheer) {
      add(at(i) + Math.round((sec(PHRASES[i].end, FPS) - at(i)) * 0.12), "clap.mp3", 90, 0.18);
    }
  }
  return cues;
})();

// ---------------------------------------------------------------- placement
const FOX_GAP = 84;
const FOX_HALF = FOX_GAP + FOX_BOX.half;

const foxesAt = (
  box: { left: number; w: number; top: number; h: number; scale: number },
  L: { W: number; H: number; portrait: boolean; band: { stageBottom: number } },
  closing = false
) => {
  if (closing) {
    const scale = L.portrait ? 0.85 : 1.0;
    return { x: L.W - 190 * scale, y: L.H * (L.portrait ? 0.8 : 0.86), scale };
  }
  if (L.portrait) {
    return { x: 780, y: 1120, scale: 0.85 };
  }
  const scale = box.scale * 0.92;
  return {
    x: Math.min(box.left + box.w + FOX_HALF * scale + 26, L.W - FOX_HALF * scale - 14),
    y: box.top + box.h + 16,
    scale,
  };
};

const foxesRect = (m: { x: number; y: number; scale: number }) => ({
  x: m.x - FOX_HALF * m.scale,
  y: m.y - FOX_BOX.up * m.scale,
  w: FOX_HALF * 2 * m.scale,
  h: (FOX_BOX.up + FOX_BOX.down) * m.scale,
});

// THE WHEEL IS THE WHOLE STAGE while it's up — centred in the stage band, sized to fill it,
// with the abacus off (`closing`) so there is nothing else for it to share the frame with.
const wheelAt = (L: { portrait: boolean; W: number; band: { stageTop: number; stageBottom: number } }) => {
  const cy = (L.band.stageTop + L.band.stageBottom) / 2;
  const radius = L.portrait ? 230 : 280;
  return { x: L.W / 2, y: cy, radius };
};
const wheelRect = (L: { portrait: boolean; W: number; band: { stageTop: number; stageBottom: number } }) => {
  const m = wheelAt(L);
  const box = wheelBox(m.radius);
  return { x: m.x - box.half, y: m.y - box.up, w: box.half * 2, h: box.up + box.down };
};

/**
 * "Small Friend of +5 & −5" — the title card that stays up with the wheel, both in the intro's
 * idle spin and every round's real one, naming what the wheel is actually deciding between.
 *
 * NOT guarded by `guardOverlap`: the pairwise box check in SceneStage only runs when
 * `abacusOnStage` is true (`for (let i = 0; abacusOnStage && ...)`), and every frame this title
 * shows on has `closing: true` (that is what hides the abacus for the wheel) — so this position
 * was measured by hand against the actual rendered pixels, the same way world props are placed,
 * not verified by the render pipeline. Fixed, not derived from stageTop=220: the wheel's own
 * pointer assembly (radius 280 landscape → rimR 308, mount top at rimR+74) puts its highest point
 * at 530-382=148, and the garland wire (a world prop, also unguarded) sits at y158-170 right under
 * that — so this sits above BOTH, near the very top of the frame, with the bigger font this needed.
 */
const WHEEL_TITLE_H = 70;
const wheelTitleSlot = (L: { portrait: boolean; W: number; band: { stageTop: number } }) => ({
  x: L.W / 2 - (L.portrait ? 280 : 340),
  y: 26,
  w: (L.portrait ? 280 : 340) * 2,
  h: WHEEL_TITLE_H,
});

// THE ROUND CARD — top-left, clear of the badge (top-right), the headline pill and the wheel
// title (both centred), and the sum card (which sits lower, at stageTop+34).
const roundCardSlot = (L: { portrait: boolean; W: number }) => ({
  x: 20,
  y: 20,
  w: L.portrait ? 130 : 168,
  h: L.portrait ? 56 : 68,
});

// THE COUNTDOWN — centred, big enough to read, and allowed to sit over the abacus (it is a
// deliberate foreground beat, not a layout accident).
const countdownSlot = (L: { W: number; H: number }) => ({
  x: L.W / 2 - 110,
  y: L.H / 2 - 130,
  w: 220,
  h: 220,
});

const SUM_S = (portrait: boolean) => (portrait ? 0.74 : 0.92);
const sumSlot = (L: { portrait: boolean; band: { stageTop: number }; cardBand: { top: number } | null }) =>
  L.portrait ? { x: 34, y: L.cardBand!.top + 8 } : { x: 44, y: L.band.stageTop + 34 };

const FORMULA_TITLE_S = 1.05;
const formulaSlot = (L: { W: number }) => {
  const w = FORMULA_ONE.w * FORMULA_TITLE_S;
  const h = FORMULA_ONE.h * FORMULA_TITLE_S;
  return { x: (L.W - w) / 2, y: 30, w, h };
};

export const E10SmallFriendGame: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e010_small_friend_game/E10.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={0}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_SHOW}
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
      if (scene.sum) {
        const s = SUM_S(L.portrait);
        const at = sumSlot(L);
        out.push({ label: "sumCard", r: { ...at, w: COL_NAT.w * s, h: COL_NAT.h * s } });
      }
      if (scene.formulas) out.push({ label: "formulas", r: formulaSlot(L) });
      if (scene.wheel || scene.wheelIdle) {
        out.push({ label: "wheel", r: wheelRect(L) });
        if (!scene.headline) out.push({ label: "wheelTitle", r: wheelTitleSlot(L) });
      }
      if (scene.foxes) {
        const m = foxesAt(ctx.box, L, Boolean(scene.closing));
        out.push({ label: "foxes", r: foxesRect(m), mayTouchAbacus: true, mayExitFrame: true });
      }
      if (scene.roundNum) out.push({ label: "roundCard", r: roundCardSlot(L) });
      if (scene.countdownRound !== undefined)
        out.push({ label: "countdown", r: countdownSlot(L), mayTouchAbacus: true });
      return out;
    }}
    renderOver={(scene, ctx) => (
      <>
        {/* THE WHEEL OF FRIENDS — keeps spinning across the announce/landsOn phrase boundary and
            only actually catches on the word "lands"; `landed`/`progress` are both decided by
            absolute frame against `ROUND_SPIN`, not by which of the two phrases is on screen. It
            used to land the instant the announce line's own audio ended, which read as landing
            before the narration ever said "it lands on" — now the wheel and the words agree. */}
        {(scene.wheel || scene.wheelIdle) && (() => {
          const m = wheelAt(ctx.layout);
          const spin = scene.wheel ? ROUND_SPIN[scene.wheel.roundIdx] : undefined;
          const landed = spin ? ctx.frame >= spin.land : false;
          const progress = spin
            ? interpolate(ctx.frame, [spin.start, spin.land], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;
          const landProgress =
            spin && landed
              ? interpolate(ctx.frame, [spin.land, spin.land + 45], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 0;
          return (
            <svg width={ctx.layout.W} height={ctx.layout.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <Wheel
                x={m.x}
                y={m.y}
                radius={m.radius}
                landOn={scene.wheel?.roundIdx ?? 0}
                progress={progress}
                frame={ctx.frame}
                fps={FPS}
                landed={landed}
                idle={scene.wheelIdle}
                landProgress={landProgress}
              />
            </svg>
          );
        })()}

        {/* THE WHEEL'S TITLE — up with it whether it's the intro's idle turn or a real round.
            Not when `headline` is also up (p0 only): the episode title already sits in this
            exact band there, and the two together needed more room than the band has. */}
        {(scene.wheel || scene.wheelIdle) && !scene.headline && (() => {
          const slot = wheelTitleSlot(ctx.layout);
          return (
            <div
              style={{
                position: "absolute",
                left: slot.x,
                top: slot.y,
                width: slot.w,
                height: slot.h,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 46,
                color: "#FFE156",
                textAlign: "center",
                textShadow: "0 0 8px rgba(0,0,0,0.6), 0 3px 0 rgba(0,0,0,0.4)",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              Small Friend of +5 &amp; −5
            </div>
          );
        })()}

        {/* THE ROUND CARD */}
        {scene.roundNum && (() => {
          const slot = roundCardSlot(ctx.layout);
          return (
            <div
              style={{
                position: "absolute",
                left: slot.x,
                top: slot.y,
                width: slot.w,
                height: slot.h,
                borderRadius: slot.h / 2,
                background: "#FF4D8D",
                boxShadow: "0 6px 0 rgba(0,0,0,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: ctx.layout.portrait ? 22 : 26,
                color: "#FFFFFF",
                letterSpacing: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              ROUND {scene.roundNum} / 8
            </div>
          );
        })()}

        {/* THE COUNTDOWN — "3, 2, 1", visual only, paying off the intro's "before I count to
            three". Divides the round's whole question beat into three even thirds; no audio. */}
        {scene.countdownRound !== undefined && (() => {
          const win = COUNTDOWN_WINDOW[scene.countdownRound];
          const span = Math.max(1, win.end - win.start);
          const local = Math.max(0, Math.min(0.9999, (ctx.frame - win.start) / span));
          const third = Math.min(2, Math.floor(local * 3));
          const num = 3 - third;
          const inThird = local * 3 - third;
          const pop = Math.min(1, inThird * 7);
          const fade = inThird > 0.75 ? Math.max(0, 1 - (inThird - 0.75) / 0.25) : 1;
          const slot = countdownSlot(ctx.layout);
          return (
            <div
              style={{
                position: "absolute",
                left: slot.x,
                top: slot.y,
                width: slot.w,
                height: slot.h,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 170,
                  color: "#FFE156",
                  textShadow: "0 0 22px rgba(0,0,0,0.55), 0 6px 0 rgba(0,0,0,0.35)",
                  opacity: fade,
                  transform: `scale(${0.5 + pop * 0.5})`,
                }}
              >
                {num}
              </div>
            </div>
          );
        })()}

        {/* THE FOXES */}
        {scene.foxes && (
          <svg width={ctx.layout.W} height={ctx.layout.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {(() => {
              const m = foxesAt(ctx.box, ctx.layout, Boolean(scene.closing));
              const off = FOX_GAP * m.scale;
              return (
                <>
                  <Fox
                    x={m.x - off}
                    y={m.y}
                    scale={m.scale}
                    mood={scene.foxes!.left}
                    marking="amber"
                    facing={ctx.layout.portrait ? 1 : -1}
                    progress={ctx.beatProgress}
                    frame={ctx.frame}
                    fps={FPS}
                  />
                  <Fox
                    x={m.x + off}
                    y={m.y}
                    scale={m.scale}
                    mood={scene.foxes!.right}
                    marking="silver"
                    facing={-1}
                    phase={0.6}
                    progress={ctx.beatProgress}
                    frame={ctx.frame}
                    fps={FPS}
                  />
                </>
              );
            })()}
          </svg>
        )}

        {/* THE FORMULA TITLE */}
        {scene.formulas && (() => {
          const slot = formulaSlot(ctx.layout);
          return (
            <div style={{ position: "absolute", left: slot.x, top: slot.y }}>
              <FormulaList
                only
                active={scene.formulas!.n}
                label={scene.formulas!.label}
                arriving={scene.formulasArriving}
                accent="#B88600"
                progress={ctx.beatProgress}
                scale={FORMULA_TITLE_S}
              />
            </div>
          );
        })()}

        {/* THE COLUMN SUM */}
        {scene.sum && (() => {
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

        {/* "we are stuck" — a red X and a shake over the lower section */}
        {scene.negative && (() => {
          const box = ctx.box;
          const earthTop = box.innerTop + (HEAVEN_H + BEAM_H) * box.scale;
          const earthH = (ABACUS_INNER_H - HEAVEN_H - BEAM_H) * box.scale;
          const cx = ctx.tRodX + wiggle(ctx.frame, FPS, 5, 0.35);
          const cy = earthTop + earthH * 0.5;
          return (
            <svg width={ctx.layout.W} height={ctx.layout.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <g transform={`translate(${cx} ${cy})`} opacity={Math.min(1, ctx.beatProgress * 4)}>
                <circle r={46} fill="#B88600" opacity={0.18} />
                <line x1={-24} y1={-24} x2={24} y2={24} stroke="#B02F53" strokeWidth={11} strokeLinecap="round" />
                <line x1={24} y1={-24} x2={-24} y2={24} stroke="#B02F53" strokeWidth={11} strokeLinecap="round" />
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
        {/* THE MILESTONE — "four down, four to go, you are on fire today", drawn as the score
            and a flame it actually names, not the Like/Subscribe card that belongs to the NEXT
            line's own words. */}
        {scene.closeBeat === "milestone" && (() => {
          const pop = Math.min(1, ctx.beatProgress * 3.5);
          // A STILL flame reads as an icon, not fire — real flame never holds one shape for two
          // frames running. Several sine waves at unrelated frequencies, each layer flickering on
          // its own phase, rooted at the base rather than the centre (a candle flame sways and
          // stretches from where it's ANCHORED, not from its middle).
          const t = ctx.frame / FPS;
          const outerStretch = 1 + Math.sin(t * 9) * 0.05 + Math.sin(t * 17.3) * 0.025;
          const outerSway = Math.sin(t * 6.5) * 4 + Math.sin(t * 13) * 2;
          const innerStretch = 1 + Math.sin(t * 11 + 1.3) * 0.07 + Math.sin(t * 23) * 0.035;
          const innerSway = Math.sin(t * 8.2 + 0.7) * 3;
          const coreStretch = 1 + Math.sin(t * 14 + 2.1) * 0.09;
          const glow = 0.35 + Math.sin(t * 7) * 0.12 + Math.sin(t * 19) * 0.05;
          return (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: ctx.layout.W,
                height: ctx.layout.H,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
              }}
            >
              <svg width={160} height={180} viewBox="0 0 160 180" style={{ transform: `scale(${0.6 + pop * 0.4})`, overflow: "visible" }}>
                <defs>
                  <radialGradient id="fireGlow" cx="50%" cy="70%" r="50%">
                    <stop offset="0%" stopColor="#FFB347" stopOpacity={glow} />
                    <stop offset="100%" stopColor="#FFB347" stopOpacity={0} />
                  </radialGradient>
                </defs>
                <circle cx={80} cy={110} r={70} fill="url(#fireGlow)" />
                <g transform={`translate(20 20)`}>
                  <g style={{ transformOrigin: "60px 132px", transform: `skewX(${outerSway}deg) scale(1, ${outerStretch})` }}>
                    <path
                      d="M60 8 C30 40 20 62 20 86 C20 114 40 132 60 132 C80 132 100 114 100 86 C100 62 90 40 60 8 Z"
                      fill="#FF6B4A"
                    />
                  </g>
                  <g style={{ transformOrigin: "60px 118px", transform: `skewX(${innerSway}deg) scale(1, ${innerStretch})` }}>
                    <path
                      d="M60 46 C46 64 40 78 40 92 C40 108 48 118 60 118 C72 118 80 108 80 92 C80 78 74 64 60 46 Z"
                      fill="#FFE156"
                    />
                  </g>
                  <g style={{ transformOrigin: "60px 108px", transform: `scale(1, ${coreStretch})` }}>
                    <path d="M60 72 C53 84 50 92 50 100 C50 110 54 116 60 116 C66 116 70 110 70 100 C70 92 67 84 60 72 Z" fill="#FFF6D6" />
                  </g>
                </g>
              </svg>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  transform: `scale(${0.7 + pop * 0.3})`,
                }}
              >
                <span style={{ fontSize: 130, color: "#FFE156" }}>4</span>
                <span style={{ fontSize: 60, opacity: 0.8 }}>/</span>
                <span style={{ fontSize: 90 }}>8</span>
              </div>
            </div>
          );
        })()}

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
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: ctx.layout.W,
              height: ctx.layout.H,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 22,
            }}
          >
            {/* THE SUM — "9 + 4 = ?", the actual case the trick below solves, in the same column
                style every sum card in this episode already uses. */}
            <ColumnSum a={9} b={4} op="+" step="none" prevStep="none" popIn={false} bg="#B88600" progress={1} scale={0.85} />
            <NextUpCard
              progress={ctx.beatProgress}
              title={["the big", "friends"]}
              example={(() => {
                // SHOW the promise, not just name it (Outro.tsx's own rule for this slot) — the
                // real two-rod carry nine plus four actually needs: no room for 4 more on the
                // ones rod, so add a ten and take the REST (10 − 4 = 6) off the ones instead.
                const set = ctx.beatProgress > 0.45;
                const settle = interpolate(ctx.beatProgress, [0.45, 0.72], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                    <Abacus
                      rods={[
                        { value: set ? 3 : 9, from: 9 },
                        { value: set ? 1 : 0, from: 0 },
                      ]}
                      settle={settle}
                      scale={0.5}
                      palette={RIG_SHOW}
                    />
                    <span
                      style={{
                        fontFamily: KID_FONT,
                        fontWeight: 700,
                        fontSize: 40,
                        color: set ? "#B88600" : "#B9C6CE",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {set ? "+4 = +10 −6" : "big friend?"}
                    </span>
                  </div>
                );
              })()}
            />
          </div>
        )}
      </>
    )}
  />
);
