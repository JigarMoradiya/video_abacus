// MATH HEROES — BIG FRIEND 1 (adding): a standalone 9:16 short. Same family as short_math_heroes
// and short_math_heroes_2 (Blaze and Spark, comic SFX, state as a pure function of the frame, no
// SceneStage) but rebuilt for kids: a very colourful arcade GRAND OPENING, a grumpy funny TICKET
// MACHINE that jams and spits tickets, big-head cartoon heroes with squash and stretch, a TWO-ROD
// floating abacus (tens and ones, because every sum here is two-digit), and a friend-first formula
// ticket (+n = −friend + 10) whose three numbers flash exactly when they are spoken.
//
// THE SCRIPT (docs/reel_math_heroes_bf1_lines.txt, recorded as docs/..._expressive.txt):
//   intro   p0-p5   "Big friends are two numbers that make ten together! Nine and one. Eight and two.
//                    Seven and three. Six and four. When the ones rod has no room to add, a big friend
//                    helps us carry to the tens rod!"
//   mission p6-p13  29 + 1      friend 9   -> 30
//   mission p14-p21 39 + 2      friend 8   -> 41
//   mission p22-p28 68 + 3      friend 7   -> 71
//   mission p29-p36 57 + 4      friend 6   -> 61
//   close   p37-p38 "Every stuck number has a trick. Learn them all with Abacus Kids..."
// The recording's four countdown holds were spliced longer (real silence, 0.04 s fades) — see
// public/audio/short_math_heroes_bf1/. Timing comes from src/data/math_heroes_bf1.phrases.json
// (aligned to the spliced file, then snapped to real silence).
//
// THE BEAD MOVE, in the order the narration says it ("Take away nine, then add ten!"):
//   1. ones rod, LOWER beads come off,  2. ones rod, the UPPER bead comes off,  3. one bead is carried
//   onto the TENS rod. Three separate phases, never blended. Every start (29, 39, 68, 57) was
//   checked: the friend comes off the ones rod directly (9 off 9, 8 off 9, 7 off 8, 6 off 7) and the
//   tens digit (2, 3, 6, 5) takes one more bead directly.
//
// Layout (1080 x 1920), every foreground box declared and asserted disjoint at load time:
//   top bar 18-110   grand sign (left) + brand badge (right)
//   128-290          the sum board
//   350-790          the ticket machine
//   806-1333         the two-rod abacus (left) and the panel (right: pairs, no-room, call, countdown,
//                    friend bond, formula ticket, next sign)
//   1335-1640        Blaze and Spark, with the four progress tickets between them
//   1665-1858        the caption.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/math_heroes_bf1.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { Abacus, type RodState } from "../components/Abacus";
import { BeadArrow } from "../stage/BeadArrow";
import type { AbacusBox } from "../stage/geometry";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Celebration } from "../components/heroes/Celebration";
import { BFHero, type BFMood, type BFName } from "../components/bf1/BFHero";
import { TicketMachine, type MachineMood } from "../components/bf1/TicketMachine";
import { ArcadeWorld } from "../components/bf1/ArcadeWorld";
import {
  BFCaption,
  AlertSiren,
  BonkToken,
  CallBubble,
  CountdownBadge,
  FormulaTicket,
  FriendBond,
  GrandDoors,
  GrandSign,
  NextSign,
  NoRoomSign,
  PairBars,
  Scissors,
  SumBoard,
  clamp01,
  easeOut,
  flashK,
} from "../components/bf1/Props";
import { ABACUS_INNER_H, FRAME_LW, ROD_PITCH } from "../data/tokens";
import type { RigPalette } from "../data/theme";
import { KID_FONT } from "../lib/fonts";
import { HideTextStyle } from "../lib/hideText";

const PH = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 91.95;
export const FPS = 30;
export const BF1_DURATION = sec(AUDIO_SEC, FPS);
const W = 1080;
const H = 1920;

// ---------------------------------------------------------------- timing helpers
const fs = (p: number) => sec(PH[p].start, FPS);
const fe = (p: number) => sec(PH[p].end, FPS);
const wf = (p: number, i: number) => sec(PH[p].words[i].start, FPS);
const wef = (p: number, i: number) => sec(PH[p].words[i].end, FPS);
const bare = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const findWord = (p: number, needle: string) => PH[p].words.findIndex((w) => bare(w.word) === needle);

// ---------------------------------------------------------------- the four missions
interface Mission {
  a: number;
  b: number;
  f: number;
  ans: number;
  t: number; // tens digit of the start
  d: number; // ones digit of the start
  r: number; // ones digit left after the friend comes off
  lead: number | null;
  stuck: number;
  noRoom: number;
  call: number;
  reveal: number;
  move: number;
  result: number;
  tail: number;
  aW: number; // word index of the first number in the stuck line
  bW: number;
  stuckHero: BFName;
  helper: BFName;
  next: number; // the phrase the next mission (or the finale) starts on
}
const mk = (a: number, b: number, ph: Omit<Mission, "a" | "b" | "f" | "ans" | "t" | "d" | "r">): Mission => {
  const f = 10 - b;
  return { a, b, f, ans: a + b, t: Math.floor(a / 10), d: a % 10, r: (a % 10) - f, ...ph };
};
const MISSIONS: Mission[] = [
  mk(29, 1, { lead: 6, stuck: 7, noRoom: 8, call: 9, reveal: 10, move: 11, result: 12, tail: 13, aW: 0, bW: 2, stuckHero: "blaze", helper: "spark", next: 14 }),
  mk(39, 2, { lead: 14, stuck: 15, noRoom: 16, call: 17, reveal: 18, move: 19, result: 20, tail: 21, aW: 0, bW: 2, stuckHero: "spark", helper: "blaze", next: 22 }),
  mk(68, 3, { lead: null, stuck: 22, noRoom: 23, call: 24, reveal: 25, move: 26, result: 27, tail: 28, aW: 2, bW: 4, stuckHero: "blaze", helper: "spark", next: 29 }),
  mk(57, 4, { lead: 29, stuck: 30, noRoom: 31, call: 32, reveal: 33, move: 34, result: 35, tail: 36, aW: 0, bW: 2, stuckHero: "spark", helper: "blaze", next: 36 }),
];
// every start was verified: the friend (9, 8, 7, 6) comes off the ones digit (9, 9, 8, 7) with lower beads
// then the upper bead, leaving r = 0, 1, 1, 1 ... except the first, where 9 - 9 = 0.
const missionStart = (m: Mission) => fs(m.lead ?? m.stuck);
const missionEnd = (m: Mission) => fe(m.tail);
const missionAt = (p: number): Mission | null => {
  for (const m of MISSIONS) if (p >= (m.lead ?? m.stuck) && p <= m.tail) return m;
  return null;
};

const FINALE = 36; // "Doors open, let's go!" (the last mission's tail is also the finale beat)
const MOTTO = 37;
const CLOSE = 38;

// ---------------------------------------------------------------- layout: TWO layouts, one split
// FOCUS PRINCIPLE (user brief): at every moment the eye lands first on the LESSON part, and the
// decoration is a layer that supports it. So the stage has two layouts and a split `s` (0..1) that
// is a pure function of the frame, eased in and out:
//   s = 0  STORY  — the machine and both heroes big, the equation board big, the counter low. Used for
//                   the hook, the alert / stuck lines, the result and the finale: the fun comes forward.
//   s = 1  LESSON — the counter slides up, the machine and heroes shrink and step to the top, the
//                   equation board and the grand sign shrink, the world is washed and desaturated, and
//                   the abacus grows to 1.55x on a clean light card with a rim and a shadow, with the
//                   panel (ten-bars, no-room, call, countdown, friend bond, formula ticket) beside it.
// Every foreground box is declared for EVERY frame (interpolated) and asserted not to overlap or run
// off the frame — EPISODE_RULES §4 — so a collision fails the render rather than shipping.
interface Box { label: string; x: number; y: number; w: number; h: number }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// SAFE AREA = small margins only, so nothing touches the extreme edges of the 1080x1920 frame. Like the
// other shorts the caption stays at the bottom, the logo top-right and "powered by" bottom-left (they are
// only nudged in as far as the margins need). Every foreground box is asserted inside this rectangle.
export const SAFE = { left: 48, right: W - 48, top: 56, bottom: 1860 };
const SAFE_CX = (SAFE.left + SAFE.right) / 2; // 540

const SUM_STORY = { x: 100, y: 128, w: 880, h: 162 }; // the design size of the sum board / intro banner (design centre x = 540)
const SIGN_STORY = { x: 24, y: 18, w: 830, h: 92 }; // the design size of the grand sign
const SIGN_K = 0.6;
// brand furniture keeps the series corners; a wrapper nudges it inside the margins
// (the logo is x874-1060 y18-84 in the frame: 28 px left, 38 px down; "powered by" is x26 y1864: 22 px right, 50 px up)
const BADGE_TF = { dx: -28, dy: 38, k: 1 };
const BADGE = { x: 874 + BADGE_TF.dx, y: 18 + BADGE_TF.dy, w: 186, h: 66 };
const CREDIT_TF = { dx: 22, dy: -50, k: 1 };
const CREDIT = { x: 26 + CREDIT_TF.dx, y: 1864 + CREDIT_TF.dy, w: 300, h: 44 };
const TICKETS = { x: 570, y: 66, w: 260, h: 48 }; // the four progress tickets: top row, between the sign and the logo
const CAP = { x: SAFE.left, y: 1684, w: SAFE.right - SAFE.left, h: 126 }; // caption stays at the bottom
const ZONE_BOTTOM = CAP.y - 8; // 1676: the card + panel run down to just above the caption
const SUM_K = 1.05; // the question header, the same big size in the story and the lesson
const SUM_Y = 130; // just under the logo / sign row
const ABX_TOTAL_H = ABACUS_INNER_H + FRAME_LW * 2 + 105; // frame + place chips at scale 1
const cardWFor = (S: number) => (2 * ROD_PITCH + FRAME_LW * 2) * S + 32;
const ABX_FIT = 0.85; // the abacus uses 85% of the band height (uniform scale), the rest is split evenly above and below
const scaleForTop = (top: number) => (ZONE_BOTTOM - top - 28) / ABX_TOTAL_H;
const MACHINE_X = SAFE_CX;

interface Lay {
  s: number;
  counterY: number;
  signA: number; // the grand sign's opacity/presence (it gives its row to the question header in the lesson layout)
  sumK: number;
  sumCx: number;
  sumY: number;
  machineScale: number;
  machineBase: number;
  machineX: number;
  heroScale: number;
  heroY: number;
  blazeX: number;
  sparkX: number;
  zoneTop: number;
  cardTop: number;
  cardH: number;
  abxScale: number;
  abxLeft: number;
  abxTop: number;
  panel: { x: number; y: number; w: number; h: number };
}
const mkLay = (o: { s: number; counterY: number; signA: number; ms: number; hs: number; blazeX: number; sparkX: number; zoneTop: number }): Lay => {
  const S = ABX_FIT * scaleForTop(o.zoneTop);
  const avail = ZONE_BOTTOM - o.zoneTop;
  const cardH = ABX_TOTAL_H * S + 28;
  const cardTop = o.zoneTop + (avail - cardH) / 2; // the card is centred in the band between the characters row and the caption
  const x0 = SAFE.left + cardWFor(S) + 16;
  return {
    s: o.s, counterY: o.counterY, signA: o.signA, sumK: SUM_K, sumCx: SAFE_CX, sumY: SUM_Y,
    machineScale: o.ms, machineBase: o.counterY - 4, machineX: MACHINE_X, heroScale: o.hs, heroY: o.counterY,
    blazeX: o.blazeX, sparkX: o.sparkX, zoneTop: o.zoneTop, cardTop, cardH, abxScale: S, abxLeft: SAFE.left + 16, abxTop: cardTop + 14,
    panel: { x: x0, y: o.zoneTop, w: SAFE.right - x0, h: ZONE_BOTTOM - o.zoneTop },
  };
};
// story: big characters; lesson: a calmer, slightly smaller row so the abacus + panel get the height
const storyLay = (): Lay => mkLay({ s: 0, counterY: 600, signA: 1, ms: 0.56, hs: 0.85, blazeX: 170, sparkX: 910, zoneTop: 622 });
const lessonLay = (): Lay => mkLay({ s: 1, counterY: 556, signA: 0, ms: 0.49, hs: 0.72, blazeX: 150, sparkX: 930, zoneTop: 578 });
const STORY_LAY = storyLay();
const LESSON_LAY = lessonLay();
const layoutAt = (s: number): Lay => {
  const A = STORY_LAY;
  const B = LESSON_LAY;
  const m = (a: number, b: number) => lerp(a, b, s);
  return {
    s,
    counterY: m(A.counterY, B.counterY),
    signA: clamp01(1 - 7 * s),
    sumK: SUM_K,
    sumCx: SAFE_CX,
    sumY: SUM_Y,
    machineScale: m(A.machineScale, B.machineScale),
    machineBase: m(A.machineBase, B.machineBase),
    machineX: m(A.machineX, B.machineX),
    heroScale: m(A.heroScale, B.heroScale),
    heroY: m(A.heroY, B.heroY),
    blazeX: m(A.blazeX, B.blazeX),
    sparkX: m(A.sparkX, B.sparkX),
    zoneTop: m(A.zoneTop, B.zoneTop),
    cardTop: m(A.cardTop, B.cardTop),
    cardH: m(A.cardH, B.cardH),
    abxScale: m(A.abxScale, B.abxScale),
    abxLeft: A.abxLeft,
    abxTop: m(A.abxTop, B.abxTop),
    panel: { x: m(A.panel.x, B.panel.x), y: m(A.panel.y, B.panel.y), w: m(A.panel.w, B.panel.w), h: m(A.panel.h, B.panel.h) },
  };
};
const abxBoxOf = (L: Lay): AbacusBox => {
  const S = L.abxScale;
  return {
    left: L.abxLeft,
    top: L.abxTop,
    w: (2 * ROD_PITCH + FRAME_LW * 2) * S,
    h: (ABACUS_INNER_H + FRAME_LW * 2) * S,
    innerLeft: L.abxLeft + FRAME_LW * S,
    innerTop: L.abxTop + FRAME_LW * S,
    innerW: 2 * ROD_PITCH * S,
    scale: S,
    rodCount: 2,
  };
};
/** the light card the abacus sits on: frame + place chips + a little margin */
const cardOf = (L: Lay) => ({
  x: SAFE.left,
  y: L.cardTop,
  w: (2 * ROD_PITCH + FRAME_LW * 2) * L.abxScale + 32,
  h: L.cardH,
});
const boxesFor = (L: Lay): Box[] => {
  const ms = L.machineScale;
  const hs = L.heroScale;
  const sk = L.sumK;
  const hero = (cx: number): Box => ({ label: "hero", x: cx - 140 * hs, y: L.heroY - 345 * hs, w: 280 * hs, h: 345 * hs + 16 });
  const boxes: Box[] = [
    { label: "badge", ...BADGE },
    { label: "sum", x: L.sumCx - (SUM_STORY.w * sk) / 2, y: L.sumY, w: SUM_STORY.w * sk, h: SUM_STORY.h * sk },
    { label: "machine", x: L.machineX - 272.5 * ms, y: L.machineBase - 510 * ms, w: 545 * ms, h: 510 * ms + 4 },
    { ...hero(L.blazeX), label: "blaze" },
    { ...hero(L.sparkX), label: "spark" },
    { label: "abacus", ...cardOf(L) },
    { label: "panel", ...L.panel },
    { label: "progress", ...TICKETS },
    { label: "caption", ...CAP },
    { label: "credit", ...CREDIT },
  ];
  // the grand sign only exists while it has its own row (the question header takes that row in the lesson layout)
  if (L.signA > 0.02) boxes.push({ label: "sign", x: SAFE.left, y: SAFE.top, w: SIGN_STORY.w * SIGN_K, h: SIGN_STORY.h * SIGN_K });
  return boxes;
};
const checkBoxes = (boxes: Box[], tag: string, overlaps = true) => {
  for (const b of boxes) {
    if (b.x < SAFE.left - 0.5 || b.y < SAFE.top - 0.5 || b.x + b.w > SAFE.right + 0.5 || b.y + b.h > SAFE.bottom + 0.5) {
      throw new Error(`bf1 layout (${tag}): ${b.label} leaves the safe area`);
    }
  }
  if (!overlaps) return;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
        throw new Error(`bf1 layout (${tag}): ${a.label} overlaps ${b.label}`);
      }
    }
  }
};
checkBoxes(boxesFor(layoutAt(0)), "story");
checkBoxes(boxesFor(layoutAt(1)), "lesson");
checkBoxes(boxesFor(layoutAt(0.5)), "mid", false); // the 16-frame slide between layouts may pass through; safe area is still enforced
console.log("bf1 lesson abacus scale", LESSON_LAY.abxScale.toFixed(3), "panel", JSON.stringify(LESSON_LAY.panel));

// ---------------------------------------------------------------- the focus split, per phrase
// Keyframes (frame, target s). Story for the hook's first words (the thumbnail frame is full of fun),
// lesson from "two numbers that make ten" through the intro, then per mission: STORY on the alert and
// stuck lines (machine + equation come forward), LESSON from "no room" through the countdown, the
// friend bond and the formula + moves, STORY again on the result and the tail (the ticket + answer).
const FOCUS_KEYS: { f: number; to: number }[] = (() => {
  const k: { f: number; to: number }[] = [{ f: 0, to: 0 }, { f: sec(PH[0].words[3].start, FPS), to: 1 }];
  for (const m of MISSIONS) {
    k.push({ f: fs(m.lead ?? m.stuck), to: 0 });
    k.push({ f: fs(m.noRoom), to: 1 });
    k.push({ f: fs(m.result), to: 0 });
  }
  return k;
})();
const RAMP = 16;
const splitAt = (frame: number): number => {
  let i = 0;
  for (let k = 0; k < FOCUS_KEYS.length; k++) if (FOCUS_KEYS[k].f <= frame) i = k;
  const cur = FOCUS_KEYS[i];
  const prev = i > 0 ? FOCUS_KEYS[i - 1].to : cur.to;
  const t = clamp01((frame - cur.f) / RAMP);
  const e = t * t * (3 - 2 * t);
  return prev + (cur.to - prev) * e;
};

// a candy palette for the floating abacus: orange frame, cream panel, hot-pink beads that are ON
const RIG_BF1: RigPalette = {
  woodLight: "#FFC247",
  wood: "#FF9F1C",
  woodDark: "#D9730D",
  panel: "#FFF8E7",
  panelEdge: "#FFD27A",
  rod: "#B9822E",
  beam: "#7A2CC9",
  onTop: "#FF7AC0",
  onBottom: "#F0289E",
  onEdge: "#A3105F",
  offTop: "#BDEBFF",
  offBottom: "#7FCBF2",
  offEdge: "#4F9ACB",
};

// ---------------------------------------------------------------- the bead move (3 phases)
interface Phase { start: number; end: number }
const phasesFor = (m: Mission): { A: Phase; B: Phase; C: Phase } => {
  const mv = m.move;
  const A = { start: wf(mv, 0) + 4, end: wf(mv, 2) + 6 };
  const B = { start: A.end, end: Math.max(A.end + 9, wef(mv, 2) + 2) };
  const C = { start: wf(mv, 4), end: wf(mv, 5) + 8 };
  return { A, B, C };
};
const prog = (frame: number, ph: Phase) => clamp01((frame - ph.start) / Math.max(1, ph.end - ph.start));

interface AbxState {
  ones: { value: number; from: number };
  tens: { value: number; from: number };
  settle: number;
  /** which rod is moving this frame (for the arrow), with the pre-roll showing the arrow first */
  arrow: { rod: number; from: number; to: number; settle: number } | null;
}

const abacusFor = (frame: number, p: number): AbxState => {
  // intro demo: 9 on the ones rod, the big friend carries it to the tens rod on the last line
  if (p <= 5) {
    const A = { start: wf(5, 12), end: wf(5, 14) + 2 };
    const B = { start: A.end, end: A.end + 10 };
    const C = { start: wf(5, 17), end: wf(5, 17) + 10 };
    const pre = 9;
    return stateFrom(frame, A, B, C, 9, 0, 9, 5, 0, 0, 1, pre);
  }
  const mm = missionAt(p);
  if (!mm) {
    // the finale: the abacus is hidden, keep the last values
    const last = MISSIONS[3];
    return { ones: { value: last.r, from: last.r }, tens: { value: last.t + 1, from: last.t + 1 }, settle: 1, arrow: null };
  }
  // before a mission's own first line the board shows the PREVIOUS mission's result; swap on the stuck line
  const m = mm;
  const { A, B, C } = phasesFor(m);
  const swapAt = fs(m.stuck);
  if (frame < swapAt) {
    const prev = MISSIONS[MISSIONS.indexOf(m) - 1];
    if (prev) return { ones: { value: prev.r, from: prev.r }, tens: { value: prev.t + 1, from: prev.t + 1 }, settle: 1, arrow: null };
    return { ones: { value: 9, from: 9 }, tens: { value: 0, from: 0 }, settle: 1, arrow: null };
  }
  return stateFrom(frame, A, B, C, m.d, m.t, m.d, 5 + m.r, m.r, m.t, m.t + 1, m.d);
};

/** the shared three-phase machine: A lowers off, B upper off, C tens carry */
function stateFrom(
  frame: number,
  A: Phase,
  B: Phase,
  C: Phase,
  d0: number,
  t0: number,
  _d: number,
  dMid: number,
  r: number,
  t1: number,
  t2: number,
  _pre: number
): AbxState {
  const PRE = 14;
  let ones = { value: d0, from: d0 };
  let tens = { value: t0, from: t0 };
  let settle = 1;
  let arrow: AbxState["arrow"] = null;
  if (frame < A.start) {
    if (frame >= A.start - PRE) arrow = { rod: 0, from: d0, to: dMid, settle: 0 };
  } else if (frame < A.end) {
    settle = prog(frame, A);
    ones = { value: dMid, from: d0 };
    arrow = { rod: 0, from: d0, to: dMid, settle };
  } else if (frame < B.start) {
    ones = { value: dMid, from: dMid };
  } else if (frame < B.end) {
    settle = prog(frame, B);
    ones = { value: r, from: dMid };
    arrow = { rod: 0, from: dMid, to: r, settle };
  } else if (frame < C.start) {
    ones = { value: r, from: r };
    if (frame >= C.start - PRE) arrow = { rod: 1, from: t1, to: t2, settle: 0 };
  } else if (frame < C.end) {
    settle = prog(frame, C);
    ones = { value: r, from: r };
    tens = { value: t2, from: t1 };
    arrow = { rod: 1, from: t1, to: t2, settle };
  } else {
    ones = { value: r, from: r };
    tens = { value: t2, from: t2 };
  }
  if (frame >= A.start && frame < C.start && frame >= A.end) tens = { value: t1, from: t1 };
  return { ones, tens, settle, arrow };
}

// ---------------------------------------------------------------- bounce physics for a hop
const bounceAt = (frame: number, start: number, amp: number) => {
  const u = (frame - start) / FPS;
  if (u < 0 || u > 1.6) return { hop: 0, squash: 0 };
  const dec = Math.exp(-4 * u);
  const s = Math.abs(Math.sin(u * 9));
  return { hop: amp * s * dec, squash: Math.exp(-3 * u) * (0.9 * Math.pow(1 - s, 4) - 0.5 * s * s) };
};
const pulseAt = (frame: number, start: number, len = 30) => {
  const u = (frame - start) / len;
  return u < 0 || u > 1 ? 0 : 1 - u;
};

// ---------------------------------------------------------------- mood timelines
interface Seg<T> { f: number; mood: T }
const moodAt = <T,>(segs: Seg<T>[], frame: number): { mood: T; prev: T; since: number } => {
  let i = 0;
  for (let k = 0; k < segs.length; k++) if (segs[k].f <= frame) i = k;
  return { mood: segs[i].mood, prev: segs[Math.max(0, i - 1)].mood, since: segs[i].f };
};

const heroSegs = (who: BFName): { segs: Seg<BFMood>[]; talk: Seg<boolean>[] } => {
  const s: Seg<BFMood>[] = [{ f: 0, mood: "idle" }];
  const talk: Seg<boolean>[] = [{ f: 0, mood: false }];
  const push = (f: number, mood: BFMood, talking = false) => {
    s.push({ f, mood });
    talk.push({ f, mood: talking });
  };
  // ---- intro: the two heroes present the four pairs in turn
  push(fs(0), who === "blaze" ? "point" : "grin", who === "blaze");
  push(fs(1), who === "blaze" ? "point" : "grin", who === "blaze");
  push(fs(2), who === "spark" ? "point" : "grin", who === "spark");
  push(fs(3), who === "blaze" ? "point" : "grin", who === "blaze");
  push(fs(4), who === "spark" ? "point" : "grin", who === "spark");
  push(fs(5), "think");
  push(wf(5, 5), "shock"); // "no room"
  push(wf(5, 9), "cheer", true); // "a big friend helps us"
  push(wf(5, 14), "point", who === "blaze"); // "carry to the tens rod"
  // ---- missions
  for (const m of MISSIONS) {
    const S = m.stuckHero === who;
    const H = m.helper === who;
    if (m.lead !== null) push(fs(m.lead), m.lead === 6 ? "shock" : m.lead === 29 ? "grin" : "point", S);
    push(fs(m.stuck), S ? "shock" : "think", S);
    push(wf(m.stuck, findWord(m.stuck, "stuck")), S ? "worry" : "shock", S);
    push(fs(m.noRoom), S ? "worry" : "point", H);
    push(fs(m.call), S ? "think" : "call", H);
    push(fe(m.call) + 4, S ? "think" : "call", false);
    push(fs(m.reveal), H ? "cheer" : "grin", H);
    push(fs(m.move), S ? "point" : "think", S);
    push(fs(m.result), "cheer", true);
    push(fs(m.tail), "grin", false);
  }
  push(fs(FINALE), "cheer", true);
  push(fs(MOTTO), "grin", false);
  return { segs: s, talk };
};
const BLAZE_SEGS = heroSegs("blaze");
const SPARK_SEGS = heroSegs("spark");

const machineSegs = (): Seg<MachineMood>[] => {
  const s: Seg<MachineMood>[] = [{ f: 0, mood: "grumpy" }];
  for (const m of MISSIONS) {
    if (m.lead !== null) s.push({ f: fs(m.lead), mood: m.lead === 6 ? "alarm" : m.lead === 29 ? "nervous" : "grumpy" });
    else s.push({ f: fs(m.stuck), mood: "alarm" });
    s.push({ f: m.lead === null ? wf(m.stuck, findWord(m.stuck, "stuck")) : fs(m.stuck), mood: "jam" });
    s.push({ f: fs(m.noRoom), mood: "jam" });
    s.push({ f: fs(m.call), mood: "nervous" });
    s.push({ f: fs(m.reveal), mood: "gasp" });
    s.push({ f: fs(m.move), mood: "nervous" });
    s.push({ f: fs(m.result), mood: "happy" });
    s.push({ f: wf(m.result, 4), mood: "cheer" });
    s.push({ f: fs(m.tail), mood: "cheer" });
  }
  return s;
};
const MACHINE_SEGS = machineSegs();

// ---------------------------------------------------------------- SFX cues
type SfxCue = { frame: number; file: string; vol: number; len?: number };
const buildCues = (): SfxCue[] => {
  const c: SfxCue[] = [];
  const add = (frame: number, file: string, vol: number, len = 60) => c.push({ frame, file, vol, len });
  add(2, "bf1_swoosh.mp3", 0.35);
  // the four pairs click together on their second number
  [1, 2, 3, 4].forEach((p) => add(wf(p, 2), "bf1_pair.mp3", 0.4, 30));
  add(wf(0, 7), "friend_sparkle.mp3", 0.3, 40); // "ten"
  add(wf(5, 5), "boing.mp3", 0.4, 30); // "no room"
  add(wf(5, 12), "bead_subtract.mp3", 0.4, 40);
  add(wf(5, 14) + 2, "bead_upper_swap.mp3", 0.4, 30);
  add(wf(5, 17), "count_carry.mp3", 0.45, 50);
  for (const m of MISSIONS) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    if (m.lead === 6) add(fs(6), "bf1_siren.mp3", 0.45, 60);
    if (m.lead === 14) add(fs(14), "bf1_swoosh.mp3", 0.3, 30);
    if (m.lead === 29) add(fs(29), "hero_call.mp3", 0.35, 30);
    add(fs(m.stuck), "bf1_swoosh.mp3", 0.3, 30);
    add(stuckW, "bf1_jam.mp3", 0.55, 60);
    add(stuckW + 4, "bf1_stamp.mp3", 0.5, 30);
    add(stuckW + 8, "bf1_squeak.mp3", 0.3, 20);
    add(fs(m.noRoom) + 2, "boing.mp3", 0.38, 30);
    add(fs(m.call), "hero_call.mp3", 0.5, 30);
    // the countdown: three ticks and a ding
    const c0 = fe(m.call) + 5;
    [0, 30, 60].forEach((k) => add(c0 + k, "bf1_tick.mp3", 0.55, 15));
    add(fs(m.reveal), "bf1_go.mp3", 0.45, 40);
    add(wf(m.reveal, 3), "friend_sparkle.mp3", 0.5, 40);
    add(wf(m.reveal, 3) + 6, "bf1_pair.mp3", 0.35, 30);
    const ph = phasesFor(m);
    add(ph.A.start, "bead_subtract.mp3", 0.45, 40);
    add(ph.B.start + 1, "bead_upper_swap.mp3", 0.42, 30);
    add(ph.C.start + 2, "count_carry.mp3", 0.5, 50);
    add(fs(m.move), "bf1_swoosh.mp3", 0.25, 30);
    add(fs(m.result), "bf1_print.mp3", 0.5, 70);
    add(wf(m.result, 4), "mission_solved.mp3", 0.55, 40);
    add(wf(m.result, 4) + 4, "bf1_cheer.mp3", 0.38, 60);
    add(fs(m.tail), "bf1_squeak.mp3", 0.25, 20);
  }
  add(wf(FINALE, 2), "bf1_snip.mp3", 0.6, 20);
  add(wf(FINALE, 3), "bf1_doors.mp3", 0.6, 60);
  add(wf(FINALE, 3) + 3, "bf1_cheer.mp3", 0.5, 60);
  add(fs(CLOSE) + 4, "cta_pop.mp3", 0.45, 30);
  return c;
};
const CUES = buildCues();

// ---------------------------------------------------------------- the reel
const STORE_START = fs(CLOSE);
const STORE_FRAMES = 92;

export const ShortMathHeroesBF1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const track = useMemo(() => makeTrack(PH, AUDIO_SEC, FPS), []);
  const active = track.activeAt(frame);
  const p = active ? active.phrase.index : 0;
  const m = missionAt(p);
  const inIntro = p <= 5;
  const inFinale = p >= FINALE;

  // ---------------------------------------------------------------- the focus split and the layout
  const sp = splitAt(frame);
  const L = layoutAt(sp);
  checkBoxes(boxesFor(L), `f${frame}`, sp < 0.001 || sp > 0.999); // overlaps are asserted in the two settled layouts; the safe area always
  const ABX_BOX = abxBoxOf(L);
  const card = cardOf(L);
  const calmHero = 1 - 0.7 * sp; // characters bounce less while the lesson is the focus

  // ---------------------------------------------------------------- world burst
  const burst = Math.max(
    ...MISSIONS.map((mm) => pulseAt(frame, wf(mm.result, 4), 40)),
    pulseAt(frame, wf(FINALE, 3), 70)
  );

  // ---------------------------------------------------------------- the sum board (design coordinates = story size, scaled by the split)
  const sumTf = `translate(${L.sumCx} ${L.sumY}) scale(${L.sumK}) translate(${-(SUM_STORY.x + SUM_STORY.w / 2)} ${-SUM_STORY.y})`;
  const board = (() => {
    if (!m || inFinale) return null;
    const start = fs(m.stuck);
    const next = m.next;
    const leave = frame > fs(next) - 8 && next !== FINALE ? clamp01((frame - (fs(next) - 8)) / 8) : 0;
    const finaleLeave = m === MISSIONS[3] ? clamp01((frame - (fs(FINALE) - 1)) / 6) : 0;
    if (frame < start || leave >= 1 || finaleLeave >= 1) return null;
    return { start, leave: Math.max(leave, finaleLeave) };
  })();
  let boardView: React.ReactNode = null;
  if (board && m) {
    const sw = findWord(m.stuck, "stuck");
    const aIdx = m.aW;
    const bIdx = m.bW;
    const solvedF = wf(m.result, 4);
    boardView = (
      <g transform={sumTf}>
        <g transform={`translate(0 ${-board.leave * 230})`}>
          <SumBoard
            x={SUM_STORY.x}
            y={SUM_STORY.y}
            w={SUM_STORY.w}
            h={SUM_STORY.h}
            a={m.a}
            b={m.b}
            answer={m.ans}
            showAnswer={clamp01((frame - solvedF) / 10)}
            flashA={Math.max(flashK(frame, wf(m.stuck, aIdx)), flashK(frame, wf(m.result, 0)))}
            flashB={Math.max(flashK(frame, wf(m.stuck, bIdx)), flashK(frame, wf(m.result, 2)))}
            stuck={frame >= fs(m.result) ? 0 : clamp01((frame - wf(m.stuck, sw)) / 8)}
            appear={clamp01((frame - board.start) / 10)}
            frame={frame}
            fps={fps}
            alarm={frame < fs(m.result) ? 1 : 0}
          />
        </g>
      </g>
    );
  }

  // ---------------------------------------------------------------- the machine
  const mm = moodAt(MACHINE_SEGS, frame);
  const hasJam = m ? frame >= wf(m.stuck, findWord(m.stuck, "stuck")) && frame < fs(m.result) : false;
  const jammedK = m && hasJam ? clamp01((frame - wf(m.stuck, findWord(m.stuck, "stuck"))) / 8) : 0;
  const alarmK = m ? (frame >= fs(m.lead ?? m.stuck) && frame < fs(m.call) ? 1 : 0) : 0;
  let ticketK = 0;
  let ticketText = "";
  if (m) {
    const out = clamp01((frame - fs(m.result)) / 22);
    const retract = m.next !== FINALE ? clamp01((frame - (fs(m.next) - 10)) / 8) : clamp01((frame - (fs(FINALE) - 1)) / 5);
    ticketK = out * (1 - retract);
    ticketText = String(m.ans);
  }
  const machineBounce = m ? bounceAt(frame, wf(m.result, 4), 40) : { hop: 0, squash: 0 };
  const jamSquash = m ? bounceAt(frame, wf(m.stuck, findWord(m.stuck, "stuck")), 14) : { hop: 0, squash: 0 };
  const machineVisible = !inFinale || frame < fs(FINALE) + 6;
  const midFade = inFinale ? 1 - clamp01((frame - fs(FINALE)) / 6) : 1;

  // ---------------------------------------------------------------- the panel (positions as fractions of the panel rect)
  const px = L.panel.x;
  const py = L.panel.y;
  const pw = L.panel.w;
  const ph = L.panel.h;
  const scaleAbout = (cx: number, cy: number, k: number, node: React.ReactNode, key?: string) => (
    <g key={key} transform={`translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`}>
      {node}
    </g>
  );
  let panelView: React.ReactNode = null;
  if (inIntro) {
    const hk = clamp01((frame - 4) / 12);
    const rows = [1, 2, 3, 4].map((pp) => clamp01((frame - fs(pp)) / 10));
    const flashes: [number, number][] = [1, 2, 3, 4].map((pp) => [flashK(frame, wf(pp, 0)), flashK(frame, wf(pp, 2))]);
    const pillW = Math.min(636, pw - 24);
    const pillFont = Math.round(42 * (pillW / 636));
    panelView = (
      <g>
        <g transform={`translate(${px + pw / 2} ${py + lerp(0.4, 0.06, easeOut(clamp01((frame - fs(1) + 4) / 14))) * ph}) scale(${0.6 + 0.4 * easeOut(hk)})`} opacity={hk}>
          <rect x={-pillW / 2} y={-40} width={pillW} height={78} rx={39} fill="#FFE156" stroke="#2A1430" strokeWidth={6} />
          <text x={0} y={16} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={pillFont} fill="#2A1430">
            {"BIG FRIENDS MAKE "}
            <tspan fill="#B3123F" fontSize={flashK(frame, wf(0, 7)) > 0.05 ? pillFont + 8 : pillFont}>
              10!
            </tspan>
          </text>
        </g>
        <PairBars x={px} y={py + 0.13 * ph} w={pw} rowH={(0.85 * ph) / 4} rows={rows} flashes={flashes} frame={frame} fps={fps} />
      </g>
    );
  } else if (m && !inFinale) {
    const callEnd = fe(m.call);
    const c0 = callEnd + 5;
    const revealF = fs(m.reveal);
    const cx = px + pw / 2;
    const noRoomK = clamp01((frame - fs(m.noRoom)) / 14);
    const showLead = m.lead !== null && frame >= fs(m.lead) && frame < fs(m.stuck);
    const showBonk = frame >= fs(m.stuck) && frame < fs(m.noRoom);
    const showNoRoom = frame >= fs(m.noRoom) && frame < fs(m.call);
    const showCall = frame >= fs(m.call) && frame < c0;
    const showCount = frame >= c0 && frame < revealF;
    const showBond = frame >= revealF && frame < fs(m.tail);
    const showFormula = frame >= revealF && frame < fs(m.tail) + 20;
    const showNext = frame >= fs(m.tail);
    const countN = frame < c0 + 30 ? 3 : frame < c0 + 60 ? 2 : 1;
    const countStart = countN === 3 ? c0 : countN === 2 ? c0 + 30 : c0 + 60;
    const bondK = clamp01((frame - revealF) / 40);
    const friendRev = clamp01((frame - wf(m.reveal, 3)) / 8);
    const fFlash = Math.max(flashK(frame, wf(m.reveal, 3)), flashK(frame, wf(m.move, 2)));
    // the focus object is larger while the lesson is the focus (each stays inside the panel width)
    const bigBond = lerp(0.9, 1.0, sp);
    const bigCount = lerp(0.9, 1.15, sp);
    const bigCall = lerp(0.9, 1.1, sp);
    const bigSiren = lerp(0.9, 1.1, sp);
    // the bond + formula card are ONE tight group (bond 210 + gap 28 + card 200), centred in the panel
    const fH = 200;
    const groupTop = py + ph / 2 - (210 + 28 + fH) / 2;
    const bondCy = groupTop + 105;
    const formulaY = groupTop + 210 + 28;
    panelView = (
      <g>
        {showLead && m.lead === 6 && scaleAbout(cx, py + 0.5 * ph, bigSiren, <AlertSiren cx={cx} cy={py + 0.5 * ph} k={clamp01((frame - fs(6)) / 14)} frame={frame} fps={fps} />)}
        {showLead && m.lead === 14 && scaleAbout(cx, py + 0.5 * ph, 0.76, <NextSign cx={cx} cy={py + 0.5 * ph} k={clamp01((frame - fs(14)) / 12)} frame={frame} fps={fps} label="NEXT!" />)}
        {showLead && m.lead === 29 && scaleAbout(cx, py + 0.5 * ph, 0.66, <NextSign cx={cx} cy={py + 0.5 * ph} k={clamp01((frame - fs(29)) / 12)} frame={frame} fps={fps} label="LAST ONE!" />)}
        {showBonk && <BonkToken x0={px + 0.71 * pw} x1={px + 0.14 * pw} cy={py + 0.5 * ph} label={`+${m.b}`} start={fs(m.stuck) + 6} frame={frame} />}
        {showNoRoom && scaleAbout(px + 10, py + 0.5 * ph, 1, <NoRoomSign x={px + 10} y={py + 0.5 * ph} text={`NO ROOM FOR ${m.b}!`} k={noRoomK} frame={frame} fps={fps} side="left" />)}
        {showCall && scaleAbout(cx, py + 0.5 * ph, bigCall, <CallBubble cx={cx} cy={py + 0.5 * ph} k={clamp01((frame - fs(m.call)) / 18)} frame={frame} fps={fps} />)}
        {showCount && scaleAbout(cx, py + 0.5 * ph, bigCount, <CountdownBadge cx={cx} cy={py + 0.5 * ph} n={countN} k={clamp01((frame - countStart) / 28)} frame={frame} fps={fps} />)}
        {showBond &&
          scaleAbout(
            cx,
            bondCy,
            bigBond,
            <FriendBond
              cx={cx}
              cy={bondCy}
              n={m.b}
              friend={m.f}
              k={bondK}
              flashN={flashK(frame, wf(m.reveal, 0))}
              flashF={fFlash}
              friendReveal={friendRev}
              frame={frame}
              fps={fps}
            />
          )}
        {showFormula && (
          <FormulaTicket
            x={px + 6}
            y={formulaY}
            w={pw - 12}
            h={fH}
            n={m.b}
            friend={m.f}
            appear={clamp01((frame - revealF) / 12) * (1 - clamp01((frame - (fs(m.tail) + 8)) / 12))}
            friendReveal={friendRev}
            flashOperand={flashK(frame, wf(m.reveal, 0))}
            flashFriend={fFlash}
            flashTen={flashK(frame, wf(m.move, 5))}
            frame={frame}
            fps={fps}
          />
        )}
        {showNext && scaleAbout(cx, py + 0.5 * ph, 0.76, <NextSign cx={cx} cy={py + 0.5 * ph} k={clamp01((frame - fs(m.tail)) / 12)} frame={frame} fps={fps} label={m === MISSIONS[3] ? "OPEN!" : "NEXT!"} />)}
      </g>
    );
  }

  // ---------------------------------------------------------------- the abacus
  const abx = abacusFor(frame, p);
  const rods: RodState[] = [
    { value: abx.ones.value, from: abx.ones.from, focus: 1, chipLower: true, placeName: "ones" },
    { value: abx.tens.value, from: abx.tens.from, focus: 1, chipLower: true, placeName: "tens" },
  ];
  const solved = m ? frame >= fs(m.result) : false;
  const stuckNow = m ? frame >= fs(m.stuck) && frame < fs(m.result) : false;
  const abxGlow = solved ? "#2FD27A" : stuckNow ? "#FF2D4F" : "#FFE156";
  const abxPop = inIntro ? easeOut(clamp01((frame - 6) / 14)) : 1;
  const abxOut = inFinale ? clamp01((frame - fs(FINALE)) / 6) : 0;
  const noRoomOnes =
    (m && frame >= fs(m.noRoom) && frame < fs(m.call)) || (p === 5 && frame >= wf(5, 5) && frame < wf(5, 9));
  const onesX = ABX_BOX.innerLeft + 1.5 * ROD_PITCH * L.abxScale;

  // ---------------------------------------------------------------- the heroes
  const heroView = (name: BFName) => {
    const segs = name === "blaze" ? BLAZE_SEGS : SPARK_SEGS;
    const moodInfo = moodAt(segs.segs, frame);
    const talkInfo = moodAt(segs.talk, frame);
    const x = name === "blaze" ? L.blazeX : L.sparkX;
    const facing: 1 | -1 = name === "blaze" ? 1 : -1;
    let hop = 0;
    let squash = 0;
    const events: [number, number][] = [];
    if (m) {
      const S = m.stuckHero === name;
      events.push([wf(m.stuck, findWord(m.stuck, "stuck")), S ? 46 : 22]);
      events.push([fs(m.reveal) + 8, m.helper === name ? 70 : 0]);
      events.push([wf(m.result, 4), 80]);
      events.push([fs(m.tail), 46]);
    }
    events.push([wf(5, 5), 28], [wf(5, 9), 60], [wf(FINALE, 3), 90]);
    if (inIntro) [1, 2, 3, 4].forEach((pp) => events.push([wf(pp, 2), 34]));
    for (const [f, amp] of events) {
      if (amp === 0 || frame < f || frame > f + 48) continue;
      const b = bounceAt(frame, f, amp);
      hop = Math.max(hop, b.hop);
      squash += b.squash;
    }
    return (
      <BFHero
        key={name}
        x={x}
        y={L.heroY}
        scale={L.heroScale}
        name={name}
        mood={moodInfo.mood}
        prevMood={moodInfo.prev}
        moodFrame={moodInfo.since}
        frame={frame}
        fps={fps}
        facing={facing}
        lookX={facing}
        hop={hop * L.heroScale * calmHero}
        squash={squash * calmHero}
        talking={talkInfo.mood}
        phase={name === "spark" ? 0.7 : 0}
      />
    );
  };

  // ---------------------------------------------------------------- the progress tickets
  const doneCount = MISSIONS.filter((mi2) => frame >= wf(mi2.result, 4)).length;
  
  // ---------------------------------------------------------------- finale / motto
  const doorsOpen = clamp01((frame - wf(FINALE, 3)) / 16);
  const ribbonCut = clamp01((frame - wf(FINALE, 2)) / 14);
  const doorsIn = inFinale ? clamp01((frame - fs(FINALE)) / 8) : 0;
  const scissorsK = clamp01((frame - (wf(FINALE, 2) - 18)) / 18);

  const overlayCaption = p !== CLOSE;
  const capSize = active ? (active.phrase.text.length > 60 ? 44 : active.phrase.text.length > 36 ? 50 : 58) : 56;

  return (
    <AbsoluteFill style={{ background: "#5B34E8" }}>
      <HideTextStyle />
      {/* the world: desaturated and washed while the lesson is the focus, full colour for the fun beats */}
      <div style={{ position: "absolute", inset: 0, filter: `saturate(${1 - 0.5 * sp}) brightness(${1 + 0.05 * sp})` }}>
        <ArcadeWorld width={W} height={H} frame={frame} fps={fps} burst={burst} counterY={L.counterY} calm={sp} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(70,40,150,${0.34 * sp})` }} />

      {/* ---------------- the mid layer: sign, sum board, machine, panel, heroes ---------------- */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${SAFE.left} ${SAFE.top}) scale(${SIGN_K}) translate(${-SIGN_STORY.x} ${-SIGN_STORY.y})`} opacity={L.signA}>
          <GrandSign x={SIGN_STORY.x} y={SIGN_STORY.y} w={SIGN_STORY.w} h={SIGN_STORY.h} frame={frame} fps={fps} />
        </g>

        <g opacity={midFade}>
          {machineVisible && (
            <TicketMachine
              x={L.machineX}
              y={L.machineBase}
              scale={L.machineScale}
              mood={mm.mood}
              frame={frame}
              fps={fps}
              moodFrame={mm.since}
              shake={0}
              ticket={ticketK}
              ticketText={ticketText}
              jammed={jammedK}
              alarm={alarmK}
              squash={(machineBounce.squash + jamSquash.squash * 0.6) * calmHero}
              hop={machineBounce.hop * L.machineScale * calmHero}
            />
          )}
          {boardView}
          {inIntro && (
            <g transform={sumTf} opacity={clamp01((frame - 2) / 10) * (1 - sp)}>
              <g transform={`translate(0 ${(1 - easeOut(clamp01((frame - 2) / 12))) * -200})`}>
                <rect x={SUM_STORY.x} y={SUM_STORY.y} width={SUM_STORY.w} height={SUM_STORY.h} rx={34} fill="#27C46B" stroke="#2A1430" strokeWidth={7} />
                <rect x={SUM_STORY.x + 12} y={SUM_STORY.y + 12} width={SUM_STORY.w - 24} height={SUM_STORY.h - 24} rx={26} fill="#1B1F4B" />
                <text x={SUM_STORY.x + SUM_STORY.w / 2} y={SUM_STORY.y + 104} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={58} fill="#FFE156" stroke="#2A1430" strokeWidth={7} paintOrder="stroke">
                  MEET THE BIG FRIENDS!
                </text>
              </g>
            </g>
          )}
          {panelView}
        </g>

        {/* the four progress tickets: small while the lesson is the focus */}
        <g opacity={inFinale ? midFade : 1}>
          {[0, 1, 2, 3].map((i) => {
            const lit = i < doneCount;
            const pop = lit ? 1 + 0.25 * pulseAt(frame, wf(MISSIONS[i].result, 4), 20) : 1;
            return (
              <g key={i} transform={`translate(${TICKETS.x + 32 + i * 65} ${TICKETS.y + TICKETS.h / 2}) scale(${0.72 * pop})`}>
                <path d="M -32 -34 h 64 v 68 q -12 0 -12 -10 q 0 -10 -12 -10 q -12 0 -12 10 q 0 10 -12 10 q -12 0 -12 -10 q 0 -10 -12 -10 Z" fill={lit ? "#FFE156" : "#FFFFFF"} stroke="#2A1430" strokeWidth={5} strokeLinejoin="round" opacity={lit ? 1 : 0.9} />
                <text x={0} y={14} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={40} fill={lit ? "#B3123F" : "#5B33C0"}>
                  {lit ? "★" : i + 1}
                </text>
              </g>
            );
          })}
        </g>

        {/* the doors and the ribbon: the finale */}
        {inFinale && doorsIn > 0 && (
          <g opacity={doorsIn}>
            <GrandDoors x={330} y={360} w={420} h={1000} open={doorsOpen} ribbon={ribbonCut} frame={frame} fps={fps} />
            {ribbonCut < 1 && <Scissors x={540 + (1 - scissorsK) * 420} y={860} k={scissorsK} scale={1.4} />}
            {p === MOTTO && (
              <g transform={`translate(540 1440)`}>
                <rect x={-380} y={-70} width={760} height={140} rx={34} fill="#FFFFFF" stroke="#2A1430" strokeWidth={7} />
                <text x={0} y={-10} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={44} fill="#2A1430">
                  EVERY STUCK NUMBER
                </text>
                <text x={0} y={42} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={52} fill="#B3123F">
                  HAS A TRICK!
                </text>
              </g>
            )}
          </g>
        )}

        {/* the heroes */}
        {heroView("blaze")}
        {heroView("spark")}
      </svg>

      {/* ---------------- the lesson card + the two-rod floating abacus ---------------- */}
      {!inFinale || abxOut < 1 ? (
        <>
          {/* a clean light card with a bright rim and a soft shadow: the abacus reads instantly against it */}
          <div
            style={{
              position: "absolute",
              left: card.x,
              top: card.y,
              width: card.w,
              height: card.h,
              borderRadius: 46,
              background: "linear-gradient(180deg, #FFFDF4, #FFF1CF)",
              border: "9px solid #FFFFFF",
              boxSizing: "border-box",
              opacity: abxPop * (1 - abxOut),
              boxShadow: `0 0 0 6px ${abxGlow}, 0 0 ${26 + 22 * sp}px ${6 + 8 * sp}px ${abxGlow}88, 0 ${14 + 10 * sp}px 0 rgba(42,20,48,0.35)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: L.abxLeft,
              top: L.abxTop,
              opacity: abxPop * (1 - abxOut),
              transform: `scale(${0.8 + 0.2 * abxPop})`,
              transformOrigin: "50% 50%",
              filter: "drop-shadow(0 8px 10px rgba(42,20,48,0.35))",
            }}
          >
            <Abacus rods={rods} settle={abx.settle} scale={L.abxScale} colorOnArrival palette={RIG_BF1} placeLabelHalo chipInk="#2A1430" labelInk={["#A64B00", "#5E6A0E"]} />
          </div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 1 - abxOut }}>
            {abx.arrow && <BeadArrow box={ABX_BOX} rod={abx.arrow.rod} from={abx.arrow.from} to={abx.arrow.to} settle={abx.arrow.settle} />}
            {noRoomOnes && (
              <g>
                <rect x={onesX - 56 * L.abxScale} y={L.abxTop + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="none" stroke="#FF2D4F" strokeWidth={9} strokeDasharray="22 14" strokeDashoffset={-frame * 2.4} opacity={0.95} />
                <rect x={onesX - 56 * L.abxScale} y={L.abxTop + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="#FF2D4F" opacity={0.13 + 0.08 * Math.sin(frame * 0.5)} />
              </g>
            )}
          </svg>
        </>
      ) : null}

      {/* ---------------- confetti on top of everything ---------------- */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {MISSIONS.map((mm2, i) => (
          <Celebration key={i} x={L.machineX} y={L.machineBase - 320 * L.machineScale} frame={frame} fps={fps} startFrame={wf(mm2.result, 4)} />
        ))}
        {[0, 1, 2].map((k) => (
          <Celebration key={`f${k}`} x={200 + k * 340} y={760 + (k % 2) * 160} frame={frame} fps={fps} startFrame={wf(FINALE, 3) + k * 4} />
        ))}
      </svg>

      {/* ---------------- the caption ---------------- */}
      {overlayCaption && active && (
        <div style={{ position: "absolute", left: CAP.x, top: CAP.y, width: CAP.w, height: CAP.h, fontSize: capSize }}>
          <BFCaption phrase={active.phrase} wordIdx={active.wordIdx} top={0} height={CAP.h} width={CAP.w} />
        </div>
      )}

      {/* ---------------- the close: the store flow ---------------- */}
      {p === CLOSE && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: H * 0.06,
            gap: 36,
            background: "linear-gradient(180deg, rgba(60,20,130,0.92), rgba(30,12,80,0.95))",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={clamp01((frame - STORE_START) / Math.max(1, fe(CLOSE) - STORE_START))} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* brand furniture, moved inside the safe area (bigger so it stays readable) */}
      <div style={{ position: "absolute", inset: 0, transform: `translate(${BADGE_TF.dx}px, ${BADGE_TF.dy}px)` }}>
        <BrandBadge portrait />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${CREDIT_TF.dx}px, ${CREDIT_TF.dy}px)` }}>
        <PoweredBy portrait />
      </div>

      {CUES.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.frame)} durationInFrames={c.len ?? 60}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol} />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/short_math_heroes_bf1/short_math_heroes_bf1.mp3")} />
    </AbsoluteFill>
  );
};
