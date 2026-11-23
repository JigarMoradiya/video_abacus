// MATH HEROES — BIG FRIEND 6 (MIXED adding and taking away): a standalone 9:16 short. The LIGHTNING ROUND:
// four drills in one minute on the clock, the deliberate high-energy opposite of bf5's calm check-up. A bold
// game-show racetrack in deep indigo and black with electric lime, sunset orange and cyan: speed lines, sweeping
// spotlights, a flashing crowd, a checkered banner, a racing curb. TICK, a racing STOPWATCH with a face, whose
// dial is the real clock (its seconds hand sweeps and a lime wedge of time left drains from "Go!" to "Time!");
// a live timer plate in the top row with lap lights; skewed racing plates and speed signs; an oval track of ten
// lamps for the pairs; a car that bonks the barrier; a bolt call; a neon countdown; bolt-linked friend badges; a
// dashboard strip for the friend trick (adding: +n = -friend +10, taking away: -n = +friend -10) and a PERFECT
// SCORE board. Blaze is the racer (flag, helmet, bib) and Spark the sprinter (neon visor-band, bolt hoodie).
//
// THE SCRIPT (docs/reel_math_heroes_bf6_lines.txt, final revision, verified word for word against the take):
//   quiz    p0-p5    "Big friend quiz! Big friends are pairs that make ten, like four and six. Stuck on the ones rod? A
//                     big friend helps us, whether we add or take away! Lightning round, one minute on the clock! Go!"
//   round 1 p6-p11   76 - 7   friend 3  -> 69   (taking:  -7 = +3 -10)   "Next!"
//   round 2 p12-p17  77 + 3   friend 7  -> 80   (adding:  +3 = -7 +10)   "Next!"
//   round 3 p18-p23  34 + 6   friend 4  -> 40   (adding:  +6 = -4 +10)   "One left!"
//   round 4 p24-p30  83 - 5   friend 5  -> 78   (taking:  -5 = +5 -10)   "Time!" (p30 is also the finale buzzer)
//   finale  p31-p32  "Lightning round, perfect score! Four numbers, zero mistakes, one minute flat."
//   close   p33      "Practice your own lightning round with Abacus Kids ..."
//
// THE BEAD MOVES. ADDING: the friend comes OFF the ones rod first (lower beads before the upper bead), then ONE
// bead goes ON the tens rod. TAKING AWAY: the friend goes ON the ones rod first (lower beads before the upper
// bead), then ONE bead comes OFF the tens rod. Every start was checked:
//   76 - 7 : ones 6 +3 lower beads -> 9; tens 7 -> 6            = 69
//   77 + 3 : ones 7 -7: the 2 lower beads off, then the upper bead off -> 0; tens 7 -> 8   = 80
//   34 + 6 : ones 4 -4: the 4 lower beads off -> 0; tens 3 -> 4  = 40
//   83 - 5 : ones 3 +5: the upper bead on -> 8; tens 8 -> 7     = 78
//
// Layout (1080 x 1920), margins only: left 48, right 1032, top 56, bottom 1860 (named SAFE).

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/math_heroes_bf6.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { Abacus, type RodState } from "../components/Abacus";
import { BeadArrow } from "../stage/BeadArrow";
import type { AbacusBox } from "../stage/geometry";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Celebration } from "../components/heroes/Celebration";
import { BFHero, type BFMood, type BFName } from "../components/bf1/BFHero";
import { StopwatchBuddy, type SWMood } from "../components/bf6/StopwatchBuddy";
import { RaceWorld } from "../components/bf6/RaceWorld";
import { clamp01, easeOut, flashK, Txt } from "../components/bf1/Props";
import {
  BF6Caption,
  BigClock,
  BoltBond,
  BoltCall,
  Burst,
  CarBonk,
  DashStrip,
  INK6,
  LIME6,
  NeonCount,
  ORANGE6,
  PairHeader,
  PerfectBoard,
  QuizBuzzer,
  RaceBanner,
  RaceHeader,
  SpeedSign,
  TextHeader,
  TimerPlate,
  TrackTen,
  raceBannerW,
} from "../components/bf6/Props6";
import { ABACUS_INNER_H, FRAME_LW, ROD_PITCH } from "../data/tokens";
import type { RigPalette } from "../data/theme";
import { HideTextStyle } from "../lib/hideText";

const PH = phrasesJson as unknown as TPhrase[];
export const BF6_AUDIO_SEC = 90.04;
export const FPS = 30;
export const BF6_DURATION = sec(BF6_AUDIO_SEC, FPS);
const W = 1080;
const H = 1920;

// ---------------------------------------------------------------- timing helpers
const fs = (p: number) => sec(PH[p].start, FPS);
const fe = (p: number) => sec(PH[p].end, FPS);
const wf = (p: number, i: number) => sec(PH[p].words[i].start, FPS);
const wef = (p: number, i: number) => sec(PH[p].words[i].end, FPS);
const bare = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const findWord = (p: number, needle: string) => PH[p].words.findIndex((w) => bare(w.word) === needle);


// ---------------------------------------------------------------- the four rounds
type Op = "add" | "take";
interface Mission {
  op: Op;
  a: number;
  b: number;
  f: number;
  ans: number;
  t: number;
  d: number;
  e: number; // ones value at the end of the ones-rod move
  dMid: number; // ones value after the first (lower-bead) step
  hasA: boolean;
  hasB: boolean;
  t2: number;
  lead: number | null;
  stuck: number;
  call: number;
  reveal: number;
  move: number;
  result: number;
  tail: number;
  bW: number; // word of the second number in the stuck / result lines
  rAns: number;
  stuckHero: BFName; // says the stuck line and the move line
  helper: BFName; // says the call and the friend
  tailLabel: string;
  next: number;
}
const mk = (op: Op, a: number, b: number, ph: Omit<Mission, "op" | "a" | "b" | "f" | "ans" | "t" | "d" | "e" | "dMid" | "hasA" | "hasB" | "t2">): Mission => {
  const f = 10 - b;
  const d = a % 10;
  const t = Math.floor(a / 10);
  if (op === "add") {
    const e = d - f;
    const dMid = d >= 5 ? (e >= 5 ? e : 5 + e) : e;
    return { op, a, b, f, ans: a + b, t, d, e, dMid, hasA: d > dMid, hasB: dMid > e, t2: t + 1, ...ph };
  }
  const v = d + f;
  const hasB = d < 5 && v >= 5;
  const dMid = hasB ? v - 5 : v;
  return { op, a, b, f, ans: a - b, t, d, e: v, dMid, hasA: d !== dMid, hasB, t2: t - 1, ...ph };
};
const MISSIONS: Mission[] = [
  mk("take", 76, 7, { lead: null, stuck: 6, call: 7, reveal: 8, move: 9, result: 10, tail: 11, bW: 3, rAns: 5, stuckHero: "blaze", helper: "spark", tailLabel: "NEXT!", next: 12 }),
  mk("add", 77, 3, { lead: null, stuck: 12, call: 13, reveal: 14, move: 15, result: 16, tail: 17, bW: 2, rAns: 4, stuckHero: "spark", helper: "blaze", tailLabel: "NEXT!", next: 18 }),
  mk("add", 34, 6, { lead: null, stuck: 18, call: 19, reveal: 20, move: 21, result: 22, tail: 23, bW: 2, rAns: 4, stuckHero: "blaze", helper: "spark", tailLabel: "ONE LEFT!", next: 24 }),
  mk("take", 83, 5, { lead: 24, stuck: 25, call: 26, reveal: 27, move: 28, result: 29, tail: 30, bW: 3, rAns: 5, stuckHero: "spark", helper: "blaze", tailLabel: "", next: 30 }),
];
const missionAt = (p: number): Mission | null => {
  for (const m of MISSIONS) if (p >= (m.lead ?? m.stuck) && p <= m.tail) return m;
  return null;
};

const FINALE = 30; // "Time!" (the buzzer; also the last round's tail)
const PERFECT = 31; // "Lightning round, perfect score!"
const MOTTO = 32;
const CLOSE = 33;
const LAST_INTRO = 5;

// ---------------------------------------------------------------- layout: margins, two layouts, one split
export const SAFE = { left: 48, right: W - 48, top: 56, bottom: 1860 };
const SAFE_CX = (SAFE.left + SAFE.right) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SUM_STORY = { x: 100, y: 128, w: 880, h: 162 };
const SUM_K = 1.05;
const SUM_Y = 130;
const BANNER_K = 0.6;
const BANNER_H = 92;
const BANNER_W = raceBannerW();
const BADGE_TF = { dx: -28, dy: 38 };
const BADGE = { x: 874 + BADGE_TF.dx, y: 18 + BADGE_TF.dy, w: 186, h: 66 };
const CREDIT_TF = { dx: 22, dy: -50 };
const CREDIT = { x: 26 + CREDIT_TF.dx, y: 1864 + CREDIT_TF.dy, w: 300, h: 44 };
const PROG = { x: 410, y: 60, w: 350, h: 56 }; // the live timer plate with four lap lights, top row
const CAP = { x: SAFE.left, y: 1684, w: SAFE.right - SAFE.left, h: 126 };
const ZONE_BOTTOM = CAP.y - 8;
const ABX_FIT = 0.85;
const ABX_TOTAL_H = ABACUS_INNER_H + FRAME_LW * 2 + 105;
const cardWFor = (S: number) => (2 * ROD_PITCH + FRAME_LW * 2) * S + 32;
const scaleForTop = (top: number) => (ZONE_BOTTOM - top - 28) / ABX_TOTAL_H;
const SWB = { halfW: 200, up: 420 };

interface Lay {
  s: number;
  counterY: number;
  signA: number;
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
}
const mkLay = (o: { s: number; counterY: number; signA: number; ms: number; mx: number; hs: number; blazeX: number; sparkX: number; zoneTop: number }): Lay => {
  const S = ABX_FIT * scaleForTop(o.zoneTop);
  const avail = ZONE_BOTTOM - o.zoneTop;
  const cardH = ABX_TOTAL_H * S + 28;
  return {
    s: o.s,
    counterY: o.counterY,
    signA: o.signA,
    machineScale: o.ms,
    machineBase: o.counterY - 4,
    machineX: o.mx,
    heroScale: o.hs,
    heroY: o.counterY,
    blazeX: o.blazeX,
    sparkX: o.sparkX,
    zoneTop: o.zoneTop,
    cardTop: o.zoneTop + (avail - cardH) / 2,
    cardH,
    abxScale: S,
  };
};
// the racers on the left, TICK the stopwatch on the right
const STORY_LAY = mkLay({ s: 0, counterY: 600, signA: 1, ms: 0.68, mx: 860, hs: 0.85, blazeX: 170, sparkX: 480, zoneTop: 622 });
const LESSON_LAY = mkLay({ s: 1, counterY: 556, signA: 0, ms: 0.58, mx: 880, hs: 0.72, blazeX: 150, sparkX: 410, zoneTop: 578 });
const layoutAt = (s: number): Lay => {
  const A = STORY_LAY;
  const B = LESSON_LAY;
  const m = (a: number, b: number) => lerp(a, b, s);
  return {
    s,
    counterY: m(A.counterY, B.counterY),
    signA: clamp01(1 - 7 * s),
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
  };
};
// the abacus card is on the LEFT, the panel on the RIGHT
const cardX = () => SAFE.left;
const abxLeft = () => cardX() + 16;
const abxTop = (L: Lay) => L.cardTop + 14;
const panelOf = (L: Lay) => {
  const x = SAFE.left + cardWFor(L.abxScale) + 16;
  return { x, y: L.zoneTop, w: SAFE.right - x, h: ZONE_BOTTOM - L.zoneTop };
};
const abxBoxOf = (L: Lay): AbacusBox => {
  const S = L.abxScale;
  const left = abxLeft();
  const top = abxTop(L);
  return {
    left,
    top,
    w: (2 * ROD_PITCH + FRAME_LW * 2) * S,
    h: (ABACUS_INNER_H + FRAME_LW * 2) * S,
    innerLeft: left + FRAME_LW * S,
    innerTop: top + FRAME_LW * S,
    innerW: 2 * ROD_PITCH * S,
    scale: S,
    rodCount: 2,
  };
};
const cardOf = (L: Lay) => ({ x: cardX(), y: L.cardTop, w: cardWFor(L.abxScale), h: L.cardH });

interface Box { label: string; x: number; y: number; w: number; h: number }
const boxesFor = (L: Lay): Box[] => {
  const ms = L.machineScale;
  const hs = L.heroScale;
  const hero = (cx: number): Box => ({ label: "hero", x: cx - 140 * hs, y: L.heroY - 345 * hs, w: 280 * hs, h: 345 * hs + 16 });
  const boxes: Box[] = [
    { label: "badge", ...BADGE },
    { label: "header", x: SAFE_CX - (SUM_STORY.w * SUM_K) / 2, y: SUM_Y, w: SUM_STORY.w * SUM_K, h: SUM_STORY.h * SUM_K },
    { label: "stopwatch", x: L.machineX - SWB.halfW * ms, y: L.machineBase - SWB.up * ms, w: SWB.halfW * 2 * ms, h: SWB.up * ms + 4 },
    { ...hero(L.blazeX), label: "blaze" },
    { ...hero(L.sparkX), label: "spark" },
    { label: "abacus", ...cardOf(L) },
    { label: "panel", ...panelOf(L) },
    { label: "timer", ...PROG },
    { label: "caption", ...CAP },
    { label: "credit", ...CREDIT },
  ];
  if (L.signA > 0.02) boxes.push({ label: "banner", x: SAFE.left, y: SAFE.top, w: BANNER_W * BANNER_K, h: BANNER_H * BANNER_K });
  return boxes;
};
const checkBoxes = (boxes: Box[], tag: string, overlaps = true) => {
  for (const b of boxes) {
    if (b.x < SAFE.left - 0.5 || b.y < SAFE.top - 0.5 || b.x + b.w > SAFE.right + 0.5 || b.y + b.h > SAFE.bottom + 0.5) {
      throw new Error(`bf6 layout (${tag}): ${b.label} leaves the safe area`);
    }
  }
  if (!overlaps) return;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
        throw new Error(`bf6 layout (${tag}): ${a.label} overlaps ${b.label}`);
      }
    }
  }
};
checkBoxes(boxesFor(layoutAt(0)), "story");
checkBoxes(boxesFor(layoutAt(1)), "lesson");
checkBoxes(boxesFor(layoutAt(0.5)), "mid", false);
console.log("bf6 lesson abacus scale", LESSON_LAY.abxScale.toFixed(3), "panel", JSON.stringify(panelOf(LESSON_LAY)));

// ---------------------------------------------------------------- the focus split, per phrase
const FOCUS_KEYS: { f: number; to: number }[] = (() => {
  const k: { f: number; to: number }[] = [{ f: 0, to: 0 }, { f: fs(1), to: 1 }, { f: fs(4), to: 0 }];
  for (const m of MISSIONS) {
    k.push({ f: fs(m.lead ?? m.stuck), to: 0 });
    k.push({ f: fs(m.call), to: 1 });
    k.push({ f: fs(m.result), to: 0 });
  }
  return k;
})();
const RAMP = 12; // quicker slides: this is a fast round
const splitAt = (frame: number): number => {
  let i = 0;
  for (let k = 0; k < FOCUS_KEYS.length; k++) if (FOCUS_KEYS[k].f <= frame) i = k;
  const cur = FOCUS_KEYS[i];
  const prev = i > 0 ? FOCUS_KEYS[i - 1].to : cur.to;
  const t = clamp01((frame - cur.f) / RAMP);
  const e = t * t * (3 - 2 * t);
  return prev + (cur.to - prev) * e;
};

// the one-minute clock: 60 at "Go!", 0 at "Time!"
const T_START = fs(5);
const T_END = wf(FINALE, 0);
const secLeftAt = (frame: number): number => clamp01(1 - (frame - T_START) / Math.max(1, T_END - T_START)) * 60;

// a lime frame on a dark indigo panel, sunset-orange beads that are ON
const RIG_BF6: RigPalette = {
  woodLight: "#DFFF8A",
  wood: "#B6FF2E",
  woodDark: "#6FA800",
  panel: "#241A63",
  panelEdge: "#7C6CFF",
  rod: "#9A8CFF",
  beam: "#FF7A1A",
  onTop: "#FFC08A",
  onBottom: "#FF7A1A",
  onEdge: "#B84A00",
  offTop: "#F4F2FF",
  offBottom: "#CFCBF2",
  offEdge: "#8E86C9",
};

// ---------------------------------------------------------------- the bead moves (3 phases, some may be empty)
interface Phase { start: number; end: number }
const phasesFor = (m: Mission): { A: Phase; B: Phase; C: Phase } => {
  const mv = m.move;
  if (m.op === "add") {
    // "Take away <friend>, then add ten, go!": Take0 away1 <friend>2 then3 add4 ten5 go6
    const A: Phase = m.hasA ? { start: wf(mv, 0) + 3, end: m.hasB ? wf(mv, 2) + 4 : wef(mv, 2) + 2 } : { start: wf(mv, 0) + 3, end: wf(mv, 0) + 3 };
    const B: Phase = m.hasB ? { start: A.end, end: Math.max(A.end + 8, wef(mv, 2) + 2) } : { start: A.end, end: A.end };
    const C: Phase = { start: wf(mv, 4), end: wf(mv, 5) + 8 };
    return { A, B, C };
  }
  // "Add <friend>, then take away ten, go!": Add0 <friend>1 then2 take3 away4 ten5 go6
  const start = wf(mv, 0) + 2;
  const A: Phase = m.hasA ? { start, end: m.hasB ? Math.round((start + wef(mv, 1) + 2) / 2) : wef(mv, 1) + 2 } : { start, end: start };
  const B: Phase = m.hasB ? { start: A.end, end: Math.max(A.end + 8, wef(mv, 1) + 2) } : { start: A.end, end: A.end };
  const C: Phase = { start: wf(mv, 3), end: wf(mv, 5) + 8 };
  return { A, B, C };
};
const prog = (frame: number, ph: Phase) => clamp01((frame - ph.start) / Math.max(1, ph.end - ph.start));

interface AbxState {
  ones: { value: number; from: number };
  tens: { value: number; from: number };
  settle: number;
  arrow: { rod: number; from: number; to: number; settle: number } | null;
}

const abacusFor = (frame: number, p: number): AbxState => {
  if (p <= LAST_INTRO) return { ones: { value: 6, from: 6 }, tens: { value: 7, from: 7 }, settle: 1, arrow: null };
  const m = missionAt(p);
  if (!m) {
    const last = MISSIONS[3];
    return { ones: { value: last.e, from: last.e }, tens: { value: last.t2, from: last.t2 }, settle: 1, arrow: null };
  }
  const { A, B, C } = phasesFor(m);
  if (frame < fs(m.stuck)) {
    const prev = MISSIONS[MISSIONS.indexOf(m) - 1];
    if (prev) return { ones: { value: prev.e, from: prev.e }, tens: { value: prev.t2, from: prev.t2 }, settle: 1, arrow: null };
    return { ones: { value: 6, from: 6 }, tens: { value: 7, from: 7 }, settle: 1, arrow: null };
  }
  return stateFrom(frame, A, B, C, m.d, m.t, m.dMid, m.e, m.t, m.t2);
};

/** three phases: A lower beads, B the upper bead, C one bead on the tens rod (on OR off) */
function stateFrom(frame: number, A: Phase, B: Phase, C: Phase, d0: number, t0: number, dMid: number, v: number, t1: number, t2: number): AbxState {
  const PRE = 12;
  let ones = { value: d0, from: d0 };
  let tens = { value: t0, from: t0 };
  let settle = 1;
  let arrow: AbxState["arrow"] = null;
  if (frame < A.start) {
    if (frame >= A.start - PRE && d0 !== dMid) arrow = { rod: 0, from: d0, to: dMid, settle: 0 };
    else if (frame >= A.start - PRE && d0 === dMid && dMid !== v && B.end > B.start) arrow = { rod: 0, from: dMid, to: v, settle: 0 };
  } else if (frame < A.end) {
    settle = prog(frame, A);
    ones = { value: dMid, from: d0 };
    arrow = { rod: 0, from: d0, to: dMid, settle };
  } else if (frame < B.start) {
    ones = { value: dMid, from: dMid };
  } else if (frame < B.end) {
    settle = prog(frame, B);
    ones = { value: v, from: dMid };
    arrow = { rod: 0, from: dMid, to: v, settle };
  } else if (frame < C.start) {
    ones = { value: v, from: v };
    if (frame >= C.start - PRE) arrow = { rod: 1, from: t1, to: t2, settle: 0 };
  } else if (frame < C.end) {
    settle = prog(frame, C);
    ones = { value: v, from: v };
    tens = { value: t2, from: t1 };
    arrow = { rod: 1, from: t1, to: t2, settle };
  } else {
    ones = { value: v, from: v };
    tens = { value: t2, from: t2 };
  }
  return { ones, tens, settle, arrow };
}

// ---------------------------------------------------------------- bounce physics for a hop
const bounceAt = (frame: number, start: number, amp: number) => {
  const u = (frame - start) / FPS;
  if (u < 0 || u > 1.6) return { hop: 0, squash: 0 };
  const dec = Math.exp(-4.5 * u);
  const s = Math.abs(Math.sin(u * 11));
  return { hop: amp * s * dec, squash: Math.exp(-3.5 * u) * (0.9 * Math.pow(1 - s, 4) - 0.5 * s * s) };
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
  const sp = who === "spark";
  // ---- the quiz intro (a narrator): the racers warm up, then crouch for the start
  push(fs(0), sp ? "grin" : "cheer");
  push(fs(1), sp ? "point" : "grin");
  push(fs(2), sp ? "think" : "worry");
  push(fs(3), "point");
  push(fs(4), "think"); // on your marks
  push(fs(5), "cheer"); // GO!
  // ---- the rounds
  for (const m of MISSIONS) {
    const S = m.stuckHero === who;
    const H = m.helper === who;
    if (m.lead !== null) push(fs(m.lead), S ? "point" : "grin", S);
    push(fs(m.stuck), S ? "shock" : "think", S);
    push(wf(m.stuck, findWord(m.stuck, "stuck")), S ? "worry" : "shock", S);
    push(fs(m.call), S ? "think" : "call", H);
    push(fe(m.call) + 3, S ? "think" : "call", false);
    push(fs(m.reveal), S ? "think" : "cheer", H);
    push(wf(m.reveal, 3), "cheer", H);
    push(fs(m.move), S ? "point" : "think", S);
    push(fs(m.result), "cheer", true);
    push(fs(m.tail), "point", true);
  }
  push(fs(FINALE), "worry");
  push(fs(PERFECT), "cheer", true);
  push(fs(MOTTO), "grin", false);
  return { segs: s, talk };
};
const BLAZE_SEGS = heroSegs("blaze");
const SPARK_SEGS = heroSegs("spark");

const watchSegs = (): Seg<SWMood>[] => {
  const s: Seg<SWMood>[] = [{ f: 0, mood: "ready" }];
  s.push({ f: fs(5), mood: "race" });
  for (const m of MISSIONS) {
    s.push({ f: wf(m.stuck, findWord(m.stuck, "stuck")), mood: "jam" });
    s.push({ f: wf(m.reveal, 3), mood: "gasp" });
    s.push({ f: fs(m.move), mood: "boost" });
    s.push({ f: wf(m.result, m.rAns), mood: "win" });
    s.push({ f: fs(m.tail) + 14, mood: "race" });
  }
  s.push({ f: fs(FINALE), mood: "buzz" });
  s.push({ f: fs(PERFECT), mood: "win" });
  return s;
};
const WATCH_SEGS = watchSegs();

// ---------------------------------------------------------------- SFX cues
type SfxCue = { frame: number; file: string; vol: number; len?: number };
const buildCues = (): SfxCue[] => {
  const c: SfxCue[] = [];
  const add = (frame: number, file: string, vol: number, len = 60) => c.push({ frame, file, vol, len });
  add(3, "bf6_ding.mp3", 0.4, 40);
  add(fs(0) + 4, "bf6_zip.mp3", 0.3, 20);
  for (let i = 0; i < 10; i++) add(fs(1) + 8 + i * 5, "bf6_tick.mp3", 0.25, 12);
  add(wf(1, 10) + 3, "friend_sparkle.mp3", 0.3, 40);
  add(wf(2, 0), "bf6_jam.mp3", 0.4, 40);
  add(wf(3, 7), "bf6_zip.mp3", 0.35, 20);
  add(wf(3, 9), "bf6_zip.mp3", 0.35, 20);
  add(fs(4), "bf6_whoosh.mp3", 0.4, 40);
  [0, 14, 28].forEach((k) => add(fs(5) - 40 + k, "bf6_beep.mp3", 0.3, 15));
  add(fs(5), "bf6_gun.mp3", 0.45, 40);
  add(fs(5) + 3, "bf6_roar.mp3", 0.2, 60);
  // a quiet ticking clock under the whole round
  for (let f = T_START + 15; f < T_END; f += 30) add(f, "bf6_tick.mp3", 0.1, 10);
  for (const m of MISSIONS) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    if (m.lead !== null) add(fs(m.lead), "bf6_whoosh.mp3", 0.3, 40);
    add(fs(m.stuck), "bf6_zip.mp3", 0.3, 20);
    add(stuckW, "bf6_jam.mp3", 0.45, 40);
    add(fs(m.call), "bf6_zap.mp3", 0.42, 40);
    const c0 = fe(m.call) + 4;
    [0, 28].forEach((k) => add(c0 + k, "bf6_beep.mp3", 0.4, 15));
    add(c0 + 56, "bf6_go.mp3", 0.28, 20);
    add(wf(m.reveal, 3) - 3, "bf6_gasp.mp3", 0.4, 25);
    add(wf(m.reveal, 3), "friend_sparkle.mp3", 0.5, 40);
    const ph = phasesFor(m);
    add(fs(m.move), "bf6_zip.mp3", 0.25, 20);
    if (m.hasA) add(ph.A.start, m.op === "add" ? "bead_subtract.mp3" : "bead_add.mp3", 0.4, 40);
    if (m.hasB) add(ph.B.start + 1, "bead_upper_swap.mp3", 0.4, 30);
    add(ph.C.start + 2, m.op === "add" ? "count_carry.mp3" : "bead_subtract.mp3", 0.45, 50);
    add(wf(m.result, m.rAns), "bf6_ding.mp3", 0.4, 40);
    add(wf(m.result, m.rAns) + 2, "mission_solved.mp3", 0.28, 40);
    if (m !== MISSIONS[3]) {
      add(fs(m.tail), "bf6_whoosh.mp3", 0.3, 40);
      add(fs(m.tail) + 3, "bf6_roar.mp3", 0.16, 50);
    }
  }
  add(fs(FINALE), "bf6_buzzer.mp3", 0.4, 70);
  add(fs(PERFECT), "bf6_score.mp3", 0.3, 70);
  add(fs(PERFECT) + 6, "bf6_roar.mp3", 0.24, 70);
  add(fs(MOTTO), "bf6_click.mp3", 0.4, 20);
  add(fs(CLOSE) + 4, "cta_pop.mp3", 0.45, 30);
  return c;
};
const CUES = buildCues();

// ---------------------------------------------------------------- the reel
const STORE_START = fs(CLOSE);
const STORE_FRAMES = 92;

const KIT: Record<BFName, { kit: "racer" | "runner"; palette: Record<string, string> }> = {
  blaze: { kit: "racer", palette: { body: "#FF7A1A", belly: "#FFE3A3", cape: "#E5273D", shoe: "#0B0720" } },
  spark: { kit: "runner", palette: { body: "#2D2470", belly: "#C9C2FF", cape: "#B6FF2E", hairA: "#B6FF2E", hairB: "#FFFFFF", shoe: "#B6FF2E" } },
};

export const ShortMathHeroesBF6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const track = useMemo(() => makeTrack(PH, BF6_AUDIO_SEC, FPS), []);
  const active = track.activeAt(frame);
  const p = active ? active.phrase.index : 0;
  const m = missionAt(p);
  const inIntro = p <= LAST_INTRO;
  const inFinale = p >= FINALE;

  // ---------------------------------------------------------------- the focus split and the layout
  const sp = splitAt(frame);
  const L0 = layoutAt(sp);
  const finK = inFinale ? easeOut(clamp01((frame - (fs(FINALE) - 6)) / 10)) : 0;
  const L: Lay = {
    ...L0,
    counterY: lerp(L0.counterY, 1060, finK),
    machineBase: lerp(L0.machineBase, 1056, finK),
    machineScale: lerp(L0.machineScale, 0.9, finK),
    machineX: lerp(L0.machineX, 540, finK),
    heroScale: lerp(L0.heroScale, 1.0, finK),
    heroY: lerp(L0.heroY, 1060, finK),
    blazeX: lerp(L0.blazeX, 170, finK),
    sparkX: lerp(L0.sparkX, 910, finK),
  };
  if (finK < 0.001) checkBoxes(boxesFor(L), `f${frame}`, sp < 0.001 || sp > 0.999);
  const ABX_BOX = abxBoxOf(L);
  const card = cardOf(L);
  const panel = panelOf(L);
  const calmHero = 1 - 0.55 * sp * (1 - finK);

  const secLeft = secLeftAt(frame);
  const racing = frame >= T_START && frame < T_END;
  const speed = racing ? 0.85 : inFinale ? 0.2 : 0.35;
  const burst = Math.max(...MISSIONS.map((mm) => pulseAt(frame, wf(mm.result, mm.rAns), 36)), pulseAt(frame, fs(PERFECT), 70));
  const doneCount = MISSIONS.filter((mi2) => frame >= wf(mi2.result, mi2.rAns)).length;
  const endFlash = inFinale && frame < fs(FINALE) + 40 ? 1 - (frame - fs(FINALE)) / 40 : 0;

  // ---------------------------------------------------------------- the header (design coordinates = story size, scaled)
  const sumTf = `translate(${SAFE_CX} ${SUM_Y}) scale(${SUM_K}) translate(${-(SUM_STORY.x + SUM_STORY.w / 2)} ${-SUM_STORY.y})`;
  const HX = SUM_STORY.x;
  const HY = SUM_STORY.y;
  const HW = SUM_STORY.w;
  const HH = SUM_STORY.h;
  let headerView: React.ReactNode = null;
  if (inIntro) {
    const appearFrom = p === 0 ? 2 : fs(p);
    const ap = clamp01((frame - appearFrom) / 8);
    if (p === 1) headerView = <PairHeader x={HX} y={HY} w={HW} h={HH} l={4} r={6} flashL={flashK(frame, wf(1, 8))} flashR={flashK(frame, wf(1, 10))} appear={ap} />;
    else {
      const spec: [string, number, "lime" | "orange" | "cyan"][] = [
        ["BIG FRIEND QUIZ!", 74, "lime"],
        ["", 0, "lime"],
        ["STUCK ON THE ONES ROD?", 52, "orange"],
        ["ADD OR TAKE AWAY!", 66, "cyan"],
        ["LIGHTNING ROUND!", 70, "lime"],
        ["GO!", 120, "orange"],
      ];
      const [text, size, tone] = spec[p];
      headerView = <TextHeader x={HX} y={HY} w={HW} h={HH} text={text} size={size} appear={ap} tone={tone} />;
    }
  } else if (m && !inFinale) {
    const leadOn = m.lead !== null && frame >= fs(m.lead) && frame < fs(m.stuck);
    const leave = frame > fs(m.next) - 6 ? clamp01((frame - (fs(m.next) - 6)) / 6) : 0;
    if (leadOn) {
      const ap = clamp01((frame - fs(m.lead as number)) / 8);
      headerView = (
        <g transform={`translate(${leave * 900} 0)`}>
          <TextHeader x={HX} y={HY} w={HW} h={HH} text="LAST ONE!" size={92} appear={ap} tone="orange" />
        </g>
      );
    } else if (frame >= fs(m.stuck) && leave < 1) {
      const solvedF = wf(m.result, m.rAns);
      const sw = findWord(m.stuck, "stuck");
      headerView = (
        <g transform={`translate(${leave * 900} 0)`}>
          <RaceHeader
            x={HX}
            y={HY}
            w={HW}
            h={HH}
            a={m.a}
            b={m.b}
            op={m.op}
            answer={m.ans}
            showAnswer={clamp01((frame - solvedF) / 8)}
            flashA={Math.max(flashK(frame, wf(m.stuck, 0)), flashK(frame, wf(m.result, 0)))}
            flashB={Math.max(flashK(frame, wf(m.stuck, m.bW)), flashK(frame, wf(m.result, m.bW)))}
            stuck={frame >= fs(m.result) ? 0 : clamp01((frame - wf(m.stuck, sw)) / 6)}
            appear={clamp01((frame - fs(m.stuck)) / 8)}
            frame={frame}
            fps={fps}
          />
        </g>
      );
    }
  }
  if (inFinale && p >= PERFECT && p < CLOSE) {
    headerView = <TextHeader x={HX} y={HY} w={HW} h={HH} text={p === PERFECT ? "LIGHTNING ROUND!" : "ZERO MISTAKES!"} size={p === PERFECT ? 72 : 64} appear={clamp01((frame - fs(p)) / 8)} tone={p === PERFECT ? "lime" : "orange"} />;
  }

  // ---------------------------------------------------------------- TICK, the stopwatch
  const wm = moodAt(WATCH_SEGS, frame);
  const bump = m ? bounceAt(frame, wf(m.result, m.rAns), 36) : { hop: 0, squash: 0 };
  const stuckBump = m ? bounceAt(frame, wf(m.stuck, findWord(m.stuck, "stuck")), 14) : { hop: 0, squash: 0 };

  // ---------------------------------------------------------------- the panel
  const px = panel.x;
  const py = panel.y;
  const pw = panel.w;
  const ph = panel.h;
  const cx = px + pw / 2;
  const midY = py + ph / 2;
  let panelView: React.ReactNode = null;
  if (inIntro) {
    if (p === 0) panelView = <QuizBuzzer cx={cx} cy={midY - 30} k={clamp01((frame - 4) / 12)} frame={frame} fps={fps} />;
    else if (p === 1) {
      panelView = <TrackTen cx={cx} cy={midY} n={4} f={6} k={clamp01((frame - fs(1) - 6) / Math.max(20, (fe(1) - fs(1)) * 0.6))} flashN={flashK(frame, wf(1, 8))} flashF={flashK(frame, wf(1, 10))} frame={frame} fps={fps} />;
    } else if (p === 2) panelView = <SpeedSign cx={cx} cy={midY} text="STUCK?" size={96} tone="orange" k={clamp01((frame - wf(2, 0)) / 10)} frame={frame} fps={fps} />;
    else if (p === 3) {
      panelView = (
        <g>
          <SpeedSign cx={cx} cy={midY - 130} text="ADD" size={96} tone="lime" k={clamp01((frame - wf(3, 7)) / 10)} frame={frame} fps={fps} />
          <SpeedSign cx={cx} cy={midY + 130} text="TAKE AWAY" size={64} tone="orange" k={clamp01((frame - wf(3, 9)) / 10)} frame={frame} fps={fps} />
        </g>
      );
    } else if (p === 4) panelView = <g transform={`translate(${cx} ${midY - 20}) scale(1.35) translate(${-cx} ${-(midY - 20)})`}><BigClock cx={cx} cy={midY - 20} secLeft={60} k={clamp01((frame - fs(4)) / 10)} flash={0} frame={frame} fps={fps} /></g>;
    else panelView = <Burst cx={cx} cy={midY} text="GO!" size={190} k={clamp01((frame - fs(5)) / 6)} frame={frame} fps={fps} tone="lime" />;
  } else if (m && !inFinale) {
    const c0 = fe(m.call) + 4;
    const revealF = fs(m.reveal);
    const showLead = m.lead !== null && frame >= fs(m.lead) && frame < fs(m.stuck);
    const showBonk = frame >= fs(m.stuck) && frame < fs(m.call);
    const showCall = frame >= fs(m.call) && frame < c0;
    const showCount = frame >= c0 && frame < revealF;
    const showBond = frame >= revealF && frame < fs(m.tail) + 8;
    const showFormula = frame >= revealF && frame < fs(m.tail) + 22;
    const showTail = frame >= fs(m.tail) && m.tailLabel !== "" && frame < fs(m.next);
    const countN = frame < c0 + 28 ? 3 : frame < c0 + 56 ? 2 : 1;
    const countStart = countN === 3 ? c0 : countN === 2 ? c0 + 28 : c0 + 56;
    const bondK = clamp01((frame - revealF) / 38);
    const friendRev = clamp01((frame - wf(m.reveal, 3)) / 6);
    const friendWordMove = m.op === "add" ? 2 : 1;
    const fFlash = Math.max(flashK(frame, wf(m.reveal, 3)), flashK(frame, wf(m.move, friendWordMove)));
    const FORM_H = 200;
    const BOND_H = 330;
    const groupTop = midY - (BOND_H + 26 + FORM_H) / 2;
    const bondCy = groupTop + 120;
    const formulaY = groupTop + BOND_H + 26;
    panelView = (
      <g>
        {showLead && <Burst cx={cx} cy={midY} text="LAST ONE!" size={86} k={clamp01((frame - fs(m.lead as number)) / 8)} frame={frame} fps={fps} tone="orange" />}
        {showBonk && (
          <g transform={`translate(${cx} ${midY}) scale(1.2) translate(${-cx} ${-midY})`}>
            <CarBonk x0={px + 0.78 * pw} x1={px + 0.2 * pw} cy={midY} label={`${m.op === "add" ? "+" : "−"}${m.b}`} start={fs(m.stuck) + 4} frame={frame} />
          </g>
        )}
        {showCall && <BoltCall cx={cx} cy={midY - 40} k={clamp01((frame - fs(m.call)) / 12)} frame={frame} fps={fps} />}
        {showCount && <NeonCount cx={cx} cy={midY} n={countN} k={clamp01((frame - countStart) / 24)} frame={frame} fps={fps} />}
        {showBond && (
          <g opacity={1 - clamp01((frame - fs(m.tail)) / 8)}>
            <BoltBond cx={cx} cy={bondCy} n={m.b} friend={m.f} k={bondK} flashN={flashK(frame, wf(m.reveal, 0))} flashF={fFlash} friendReveal={friendRev} frame={frame} fps={fps} />
          </g>
        )}
        {showFormula && (
          <DashStrip
            x={px + 6}
            y={formulaY}
            w={pw - 12}
            h={FORM_H}
            op={m.op}
            n={m.b}
            friend={m.f}
            appear={clamp01((frame - revealF) / 8) * (1 - clamp01((frame - (fs(m.tail) + 8)) / 10))}
            friendReveal={friendRev}
            flashOperand={flashK(frame, wf(m.reveal, 0))}
            flashFriend={fFlash}
            flashTen={flashK(frame, wf(m.move, 5))}
            frame={frame}
            fps={fps}
          />
        )}
        {showTail && (
          <g>
            <Burst cx={cx} cy={midY - 150} text={m.tailLabel} size={m.tailLabel.length > 6 ? 84 : 120} k={clamp01((frame - fs(m.tail)) / 6)} frame={frame} fps={fps} tone={m.tailLabel === "NEXT!" ? "lime" : "orange"} />
            <BigClock cx={cx} cy={midY + 250} secLeft={secLeft} k={1} flash={0} frame={frame} fps={fps} />
          </g>
        )}
      </g>
    );
  } else if (inFinale && p === FINALE) {
    panelView = null;
  }

  // ---------------------------------------------------------------- the abacus
  const abx = abacusFor(frame, p);
  const rods: RodState[] = [
    { value: abx.ones.value, from: abx.ones.from, focus: 1, chipLower: true, placeName: "ones" },
    { value: abx.tens.value, from: abx.tens.from, focus: 1, chipLower: true, placeName: "tens" },
  ];
  const solved = m ? frame >= fs(m.result) : false;
  const working = m ? frame >= fs(m.call) && frame < fs(m.result) : false;
  const abxGlow = solved ? "#B6FF2E" : working ? "#FF7A1A" : "#2EE6FF";
  const abxPop = inIntro ? easeOut(clamp01((frame - 6) / 10)) : 1;
  const abxOut = inFinale ? clamp01((frame - fs(FINALE)) / 5) : 0;
  const stuckWordF = m ? wf(m.stuck, findWord(m.stuck, "stuck")) : 0;
  const notEnough = (m && frame >= stuckWordF && frame < fs(m.reveal)) || (p === 2 && frame >= wf(2, 3) && frame < wef(2, 4) + 10) || (p === 3 && ((frame >= wf(3, 7) && frame < wef(3, 7) + 14) || (frame >= wf(3, 9) && frame < wef(3, 10) + 4)));
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
      events.push([fs(m.stuck), m.stuckHero === name ? 40 : 18]);
      events.push([wf(m.reveal, 3), m.helper === name ? 70 : 28]);
      events.push([wf(m.result, m.rAns), 80]);
      events.push([fs(m.tail), 50]);
    }
    events.push([fs(0), 40], [fs(5), 70], [fs(PERFECT), 90]);
    for (const [f, amp] of events) {
      if (amp === 0 || frame < f || frame > f + 40) continue;
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
        kit={KIT[name].kit}
        palette={KIT[name].palette}
      />
    );
  };

  const pulses = MISSIONS.map((mi2) => pulseAt(frame, wf(mi2.result, mi2.rAns), 20));
  const finaleIn = inFinale ? clamp01((frame - fs(FINALE)) / 6) : 0;
  const overlayCaption = p !== CLOSE;
  const capSize = active ? (active.phrase.text.length > 60 ? 44 : active.phrase.text.length > 36 ? 50 : 58) : 56;
  // very short phrases ("Go!", "Next!", "Time!") keep their caption until the next phrase begins
  let capPhrase = active ? active.phrase : null;
  let capWord = active ? active.wordIdx : 0;
  if (active && active.phrase.end - active.phrase.start < 0.5) capWord = 0;
  else if (!active) {
    for (let i = PH.length - 1; i >= 0; i--) {
      if (fs(i) <= frame) {
        if (PH[i].end - PH[i].start < 0.5) {
          capPhrase = PH[i];
          capWord = 0;
        }
        break;
      }
    }
  }

  return (
    <AbsoluteFill style={{ background: "#120A3A" }}>
      <HideTextStyle />
      <div style={{ position: "absolute", inset: 0, filter: `saturate(${1 - 0.25 * sp * (1 - finK)})` }}>
        <RaceWorld width={W} height={H} frame={frame} fps={fps} speed={speed} burst={burst} counterY={L.counterY} calm={sp * (1 - finK)} flash={endFlash} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(6,3,28,${0.25 * sp * (1 - finK)})` }} />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${SAFE.left} ${SAFE.top}) scale(${BANNER_K})`} opacity={L.signA * (1 - finaleIn)}>
          <RaceBanner x={0} y={0} h={BANNER_H} frame={frame} fps={fps} />
        </g>

        <g transform={sumTf}>{headerView}</g>

        {panelView}

        <TimerPlate x={PROG.x} y={PROG.y} w={PROG.w} h={PROG.h} secLeft={secLeft} done={inFinale ? 4 : doneCount} pulses={pulses} flash={endFlash} frame={frame} fps={fps} />

        {inFinale && p === FINALE && <Burst cx={540} cy={540} text="TIME!" size={150} k={clamp01((frame - fs(FINALE)) / 5)} frame={frame} fps={fps} tone="orange" />}
        {inFinale && p >= PERFECT && p < CLOSE && <PerfectBoard cx={540} cy={470} k={clamp01((frame - fs(PERFECT)) / 22)} frame={frame} fps={fps} />}

        <StopwatchBuddy
          x={L.machineX}
          y={L.machineBase}
          scale={L.machineScale}
          mood={wm.mood}
          moodFrame={wm.since}
          frame={frame}
          fps={fps}
          secLeft={secLeft}
          squash={(bump.squash + stuckBump.squash * 0.6) * calmHero}
          hop={(bump.hop * L.machineScale + stuckBump.hop * 0) * calmHero}
        />

        {p === MOTTO && (
          <g transform="translate(540 1420)">
            <path d="M -380 -76 H 400 L 360 76 H -420 Z" fill={INK6} stroke={LIME6} strokeWidth={8} strokeLinejoin="round" />
            <Txt x={0} y={-8} size={46} fill={LIME6} stroke={INK6} sw={0} spacing={1}>4 NUMBERS · 0 MISTAKES</Txt>
            <Txt x={0} y={46} size={48} fill={ORANGE6} stroke={INK6} sw={0} spacing={1}>1 MINUTE FLAT!</Txt>
          </g>
        )}

        {heroView("blaze")}
        {heroView("spark")}
      </svg>

      {!inFinale || abxOut < 1 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: card.x,
              top: card.y,
              width: card.w,
              height: card.h,
              borderRadius: 36,
              background: "linear-gradient(180deg, #2C1F8C, #170F4F)",
              border: `9px solid ${LIME6}`,
              boxSizing: "border-box",
              opacity: abxPop * (1 - abxOut),
              boxShadow: `0 0 0 5px ${INK6}, 0 0 ${26 + 22 * sp}px ${6 + 8 * sp}px ${abxGlow}99, 0 ${14 + 10 * sp}px 0 rgba(0,0,0,0.5)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: abxLeft(),
              top: abxTop(L),
              opacity: abxPop * (1 - abxOut),
              transform: `scale(${0.8 + 0.2 * abxPop})`,
              transformOrigin: "50% 50%",
              filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.5))",
            }}
          >
            <Abacus rods={rods} settle={abx.settle} scale={L.abxScale} colorOnArrival palette={RIG_BF6} chipInk="#0B0720" labelInk={["#FFB27A", "#D9F27A"]} />
          </div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 1 - abxOut }}>
            {abx.arrow && <BeadArrow box={ABX_BOX} rod={abx.arrow.rod} from={abx.arrow.from} to={abx.arrow.to} settle={abx.arrow.settle} />}
            {notEnough && (
              <g>
                <rect x={onesX - 56 * L.abxScale} y={abxTop(L) + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="none" stroke="#FF7A1A" strokeWidth={9} strokeDasharray="22 14" strokeDashoffset={-frame * 3} opacity={0.95} />
                <rect x={onesX - 56 * L.abxScale} y={abxTop(L) + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="#FF7A1A" opacity={0.14 + 0.08 * Math.sin(frame * 0.6)} />
              </g>
            )}
          </svg>
        </>
      ) : null}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {MISSIONS.slice(0, 3).map((mm2, i) => (
          <Celebration key={i} x={L.machineX} y={L.machineBase - 360 * L.machineScale} frame={frame} fps={fps} startFrame={wf(mm2.result, mm2.rAns)} />
        ))}
        {[0, 1, 2].map((k) => (
          <Celebration key={`f${k}`} x={220 + k * 320} y={640 + (k % 2) * 160} frame={frame} fps={fps} startFrame={fs(PERFECT) + k * 4} />
        ))}
      </svg>

      {overlayCaption && capPhrase && (
        <div style={{ position: "absolute", left: CAP.x, top: CAP.y, width: CAP.w, height: CAP.h, fontSize: capSize }}>
          <BF6Caption phrase={capPhrase} wordIdx={capWord} top={0} height={CAP.h} width={CAP.w} />
        </div>
      )}

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
            background: `linear-gradient(180deg, rgba(18,10,58,0.96), rgba(7,4,26,0.98))`,
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={clamp01((frame - STORE_START) / Math.max(1, fe(CLOSE) - STORE_START))} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

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
      <Audio src={staticFile("audio/short_math_heroes_bf6/short_math_heroes_bf6.mp3")} />
    </AbsoluteFill>
  );
};
