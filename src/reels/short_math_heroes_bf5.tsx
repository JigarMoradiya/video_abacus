// MATH HEROES — BIG FRIEND 5 (MIXED adding and taking away): a standalone 9:16 short. A calm CHECK-UP /
// SPEED DRILL, not a crisis: four drills in the bead gym, each cued out loud ("Drill one ... Drill two, a
// take-away this time ... Drill three, take-away again ... Last drill, back to adding"). A soft sky-blue,
// peach and leaf-green training room; CLIP, a friendly clipboard coach whose face reacts (puzzled at "no
// room", a bulb for the friend, scribbling while the beads move, a big happy tick per drill) and whose
// checklist fills as each drill is checked; notepad headers, a drill badge, a sticky note, a lab flask the
// friend is poured into, an index flash card, a green CHECK stamp, check-box progress and a gold medal for
// "no misses". Blaze is the gym trainer (headband, track jacket, pencil, pennant) and Spark the lab
// scientist (lab coat, round glasses, bubbling beaker). The lesson layout keeps the abacus on the RIGHT.
//
// THE SCRIPT (docs/reel_math_heroes_bf5_lines.txt, final revision, verified word for word against the take):
//   recall  p0-p3    "Remember our big friends? Two numbers that make ten together, like five and five. They help
//                     when the ones rod has no room to add, or not enough to take away! Time for a friendly speed drill!"
//   drill 1 p4-p10   18 + 7   friend 3  -> 25   (adding:  +7 = -3 +10)
//   drill 2 p11-p17  82 - 4   friend 6  -> 78   (taking:  -4 = +6 -10)
//   drill 3 p18-p24  75 - 8   friend 2  -> 67   (taking:  -8 = +2 -10)
//   drill 4 p25-p31  88 + 2   friend 8  -> 90   (adding:  +2 = -8 +10)   (p31 "Full check, no misses!" is the finale)
//   close   p32-p33  "Drill complete ... Keep sharp with Abacus Kids ..."
//
// THE BEAD MOVES. ADDING: the friend comes OFF the ones rod first (lower beads before the upper bead), then ONE
// bead goes ON the tens rod. TAKING AWAY: the friend goes ON the ones rod first (lower beads before the upper
// bead), then ONE bead comes OFF the tens rod. Every start was checked:
//   18 + 7 : ones 8 -3 lower beads -> 5; tens 1 -> 2            = 25
//   82 - 4 : ones 2 +1 lower bead, then the upper bead -> 8; tens 8 -> 7   = 78
//   75 - 8 : ones 5 +2 lower beads -> 7; tens 7 -> 6            = 67
//   88 + 2 : ones 8 -3 lower beads -> 5, then the upper bead -> 0; tens 8 -> 9   = 90
//
// Layout (1080 x 1920), margins only: left 48, right 1032, top 56, bottom 1860 (named SAFE).

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/math_heroes_bf5.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { Abacus, type RodState } from "../components/Abacus";
import { BeadArrow } from "../stage/BeadArrow";
import type { AbacusBox } from "../stage/geometry";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Celebration } from "../components/heroes/Celebration";
import { BFHero, type BFMood, type BFName } from "../components/bf1/BFHero";
import { ClipBuddy, type CBMood } from "../components/bf5/ClipBuddy";
import { BeadGym } from "../components/bf5/BeadGym";
import { clamp01, easeOut, flashK, Txt } from "../components/bf1/Props";
import {
  BF5Caption,
  BigMedal,
  BulbCall,
  CORAL5,
  CREAM,
  CheckStamp,
  CheckStrip,
  DrillBadge,
  DrillBanner,
  DrillHeader,
  FlashCard,
  FlaskBond,
  INK5,
  LEAFD,
  NoteHeader,
  NoteTag,
  ReadyLights,
  StickyNote,
  drillBannerW,
} from "../components/bf5/Props5";
import { ABACUS_INNER_H, FRAME_LW, ROD_PITCH } from "../data/tokens";
import type { RigPalette } from "../data/theme";
import { HideTextStyle } from "../lib/hideText";

const PH = phrasesJson as unknown as TPhrase[];
export const BF5_AUDIO_SEC = 94.62;
export const FPS = 30;
export const BF5_DURATION = sec(BF5_AUDIO_SEC, FPS);
const W = 1080;
const H = 1920;

// ---------------------------------------------------------------- timing helpers
const fs = (p: number) => sec(PH[p].start, FPS);
const fe = (p: number) => sec(PH[p].end, FPS);
const wf = (p: number, i: number) => sec(PH[p].words[i].start, FPS);
const wef = (p: number, i: number) => sec(PH[p].words[i].end, FPS);
const bare = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const findWord = (p: number, needle: string) => PH[p].words.findIndex((w) => bare(w.word) === needle);


// ---------------------------------------------------------------- the four drills
type Op = "add" | "take";
interface Mission {
  op: Op;
  a: number;
  b: number;
  f: number;
  ans: number;
  t: number; // tens digit of the start
  d: number; // ones digit of the start
  e: number; // ones value at the end of the ones-rod move
  dMid: number; // ones value after the first (lower-bead) step
  hasB: boolean; // the upper bead moves in a second step
  t2: number; // tens digit at the end
  cue: number; // "Drill one, eighteen plus seven!"
  noRoom: number;
  call: number;
  reveal: number;
  move: number;
  result: number;
  check: number;
  aW: number; // word of the first number in the cue / result lines
  bW: number;
  rB: number;
  rAns: number;
  stuckHero: BFName; // says the cue and the move line
  helper: BFName; // says no-room, the call and the friend
  cueTop: string;
  cueBig: string;
  cueSize: number;
  chip: string;
  next: number;
}
const mk = (op: Op, a: number, b: number, ph: Omit<Mission, "op" | "a" | "b" | "f" | "ans" | "t" | "d" | "e" | "dMid" | "hasB" | "t2">): Mission => {
  const f = 10 - b;
  const d = a % 10;
  const t = Math.floor(a / 10);
  if (op === "add") {
    const e = d - f;
    const dMid = e >= 5 ? e : 5 + e;
    return { op, a, b, f, ans: a + b, t, d, e, dMid, hasB: dMid > e, t2: t + 1, ...ph };
  }
  const v = d + f;
  const hasB = d < 5 && v >= 5;
  return { op, a, b, f, ans: a - b, t, d, e: v, dMid: hasB ? v - 5 : v, hasB, t2: t - 1, ...ph };
};
const MISSIONS: Mission[] = [
  mk("add", 18, 7, { cue: 4, noRoom: 5, call: 6, reveal: 7, move: 8, result: 9, check: 10, aW: 2, bW: 4, rB: 2, rAns: 4, stuckHero: "blaze", helper: "spark", cueTop: "DRILL", cueBig: "1", cueSize: 170, chip: "ADD", next: 11 }),
  mk("take", 82, 4, { cue: 11, noRoom: 12, call: 13, reveal: 14, move: 15, result: 16, check: 17, aW: 6, bW: 9, rB: 3, rAns: 5, stuckHero: "spark", helper: "blaze", cueTop: "DRILL", cueBig: "2", cueSize: 170, chip: "TAKE AWAY", next: 18 }),
  mk("take", 75, 8, { cue: 18, noRoom: 19, call: 20, reveal: 21, move: 22, result: 23, check: 24, aW: 4, bW: 7, rB: 3, rAns: 5, stuckHero: "blaze", helper: "spark", cueTop: "DRILL", cueBig: "3", cueSize: 170, chip: "TAKE AWAY", next: 25 }),
  mk("add", 88, 2, { cue: 25, noRoom: 26, call: 27, reveal: 28, move: 29, result: 30, check: 31, aW: 5, bW: 7, rB: 2, rAns: 4, stuckHero: "spark", helper: "blaze", cueTop: "LAST", cueBig: "DRILL", cueSize: 84, chip: "ADD", next: 31 }),
];
const missionAt = (p: number): Mission | null => {
  for (const m of MISSIONS) if (p >= m.cue && p <= m.check) return m;
  return null;
};

const FINALE = 31; // "Full check, no misses!"
const MOTTO = 32;
const CLOSE = 33;
const LAST_INTRO = 3;

// ---------------------------------------------------------------- layout: margins, two layouts, one split
export const SAFE = { left: 48, right: W - 48, top: 56, bottom: 1860 };
const SAFE_CX = (SAFE.left + SAFE.right) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SUM_STORY = { x: 100, y: 128, w: 880, h: 162 };
const SUM_K = 1.05;
const SUM_Y = 130;
const BANNER_K = 0.6;
const BANNER_H = 92;
const BANNER_W = drillBannerW();
const BADGE_TF = { dx: -28, dy: 38 };
const BADGE = { x: 874 + BADGE_TF.dx, y: 18 + BADGE_TF.dy, w: 186, h: 66 };
const CREDIT_TF = { dx: 22, dy: -50 };
const CREDIT = { x: 26 + CREDIT_TF.dx, y: 1864 + CREDIT_TF.dy, w: 300, h: 44 };
const PROG = { x: 400, y: 62, w: 312, h: 52 }; // four check-boxes and a medal, top row
const CAP = { x: SAFE.left, y: 1684, w: SAFE.right - SAFE.left, h: 126 };
const ZONE_BOTTOM = CAP.y - 8;
const ABX_FIT = 0.85;
const ABX_TOTAL_H = ABACUS_INNER_H + FRAME_LW * 2 + 105;
const cardWFor = (S: number) => (2 * ROD_PITCH + FRAME_LW * 2) * S + 32;
const scaleForTop = (top: number) => (ZONE_BOTTOM - top - 28) / ABX_TOTAL_H;
const CBB = { halfW: 200, up: 450 }; // the buddy's local box

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
// a NEW row: Clip on the left, the two heroes side by side to its right
const STORY_LAY = mkLay({ s: 0, counterY: 600, signA: 1, ms: 0.64, mx: 200, hs: 0.85, blazeX: 520, sparkX: 830, zoneTop: 622 });
const LESSON_LAY = mkLay({ s: 1, counterY: 556, signA: 0, ms: 0.55, mx: 200, hs: 0.72, blazeX: 540, sparkX: 820, zoneTop: 578 });
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
// the abacus card is on the RIGHT, the panel on the LEFT
const cardX = (L: Lay) => SAFE.right - cardWFor(L.abxScale);
const abxLeft = (L: Lay) => cardX(L) + 16;
const abxTop = (L: Lay) => L.cardTop + 14;
const panelOf = (L: Lay) => ({ x: SAFE.left, y: L.zoneTop, w: cardX(L) - 16 - SAFE.left, h: ZONE_BOTTOM - L.zoneTop });
const abxBoxOf = (L: Lay): AbacusBox => {
  const S = L.abxScale;
  const left = abxLeft(L);
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
const cardOf = (L: Lay) => ({ x: cardX(L), y: L.cardTop, w: cardWFor(L.abxScale), h: L.cardH });

interface Box { label: string; x: number; y: number; w: number; h: number }
const boxesFor = (L: Lay): Box[] => {
  const ms = L.machineScale;
  const hs = L.heroScale;
  const hero = (cx: number): Box => ({ label: "hero", x: cx - 140 * hs, y: L.heroY - 345 * hs, w: 280 * hs, h: 345 * hs + 16 });
  const boxes: Box[] = [
    { label: "badge", ...BADGE },
    { label: "header", x: SAFE_CX - (SUM_STORY.w * SUM_K) / 2, y: SUM_Y, w: SUM_STORY.w * SUM_K, h: SUM_STORY.h * SUM_K },
    { label: "clip", x: L.machineX - CBB.halfW * ms, y: L.machineBase - CBB.up * ms, w: CBB.halfW * 2 * ms, h: CBB.up * ms + 4 },
    { ...hero(L.blazeX), label: "blaze" },
    { ...hero(L.sparkX), label: "spark" },
    { label: "abacus", ...cardOf(L) },
    { label: "panel", ...panelOf(L) },
    { label: "progress", ...PROG },
    { label: "caption", ...CAP },
    { label: "credit", ...CREDIT },
  ];
  if (L.signA > 0.02) boxes.push({ label: "banner", x: SAFE.left, y: SAFE.top, w: BANNER_W * BANNER_K, h: BANNER_H * BANNER_K });
  return boxes;
};
const checkBoxes = (boxes: Box[], tag: string, overlaps = true) => {
  for (const b of boxes) {
    if (b.x < SAFE.left - 0.5 || b.y < SAFE.top - 0.5 || b.x + b.w > SAFE.right + 0.5 || b.y + b.h > SAFE.bottom + 0.5) {
      throw new Error(`bf5 layout (${tag}): ${b.label} leaves the safe area`);
    }
  }
  if (!overlaps) return;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
        throw new Error(`bf5 layout (${tag}): ${a.label} overlaps ${b.label}`);
      }
    }
  }
};
checkBoxes(boxesFor(layoutAt(0)), "story");
checkBoxes(boxesFor(layoutAt(1)), "lesson");
checkBoxes(boxesFor(layoutAt(0.5)), "mid", false);
console.log("bf5 lesson abacus scale", LESSON_LAY.abxScale.toFixed(3), "panel", JSON.stringify(panelOf(LESSON_LAY)));

// ---------------------------------------------------------------- the focus split, per phrase
const FOCUS_KEYS: { f: number; to: number }[] = (() => {
  const k: { f: number; to: number }[] = [{ f: 0, to: 0 }, { f: fs(1), to: 1 }, { f: fs(3), to: 0 }];
  for (const m of MISSIONS) {
    k.push({ f: fs(m.cue), to: 0 });
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

// a peach frame, a cream panel and leaf-green beads that are ON
const RIG_BF5: RigPalette = {
  woodLight: "#FFC9AC",
  wood: "#FF9A6B",
  woodDark: "#C9623A",
  panel: "#FFFBF0",
  panelEdge: "#FFD9C2",
  rod: "#8B6B3A",
  beam: "#2F8F46",
  onTop: "#9BE07A",
  onBottom: "#4DB544",
  onEdge: "#1F6B2A",
  offTop: "#F2F6FA",
  offBottom: "#CBD6E0",
  offEdge: "#8FA0B3",
};

// ---------------------------------------------------------------- the bead moves (3 phases, some may be empty)
interface Phase { start: number; end: number }
const phasesFor = (m: Mission): { A: Phase; B: Phase; C: Phase } => {
  const mv = m.move;
  if (m.op === "add") {
    // "Take away <friend>, then add ten!": Take0 away1 <friend>2 then3 add4 ten5
    const A: Phase = { start: wf(mv, 0) + 4, end: m.hasB ? wf(mv, 2) + 6 : wef(mv, 2) + 2 };
    const B: Phase = m.hasB ? { start: A.end, end: Math.max(A.end + 9, wef(mv, 2) + 2) } : { start: A.end, end: A.end };
    const C: Phase = { start: wf(mv, 4), end: wf(mv, 5) + 8 };
    return { A, B, C };
  }
  // "Add <friend>, then take away ten!": Add0 <friend>1 then2 take3 away4 ten5
  const A: Phase = { start: wf(mv, 0) + 2, end: m.hasB ? Math.round((wf(mv, 0) + 2 + wef(mv, 1) + 2) / 2) : wef(mv, 1) + 2 };
  const B: Phase = m.hasB ? { start: A.end, end: Math.max(A.end + 9, wef(mv, 1) + 2) } : { start: A.end, end: A.end };
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
  if (p <= LAST_INTRO) return { ones: { value: 8, from: 8 }, tens: { value: 1, from: 1 }, settle: 1, arrow: null };
  const m = missionAt(p);
  if (!m) {
    const last = MISSIONS[3];
    return { ones: { value: last.e, from: last.e }, tens: { value: last.t2, from: last.t2 }, settle: 1, arrow: null };
  }
  const { A, B, C } = phasesFor(m);
  if (frame < fs(m.cue)) {
    const prev = MISSIONS[MISSIONS.indexOf(m) - 1];
    if (prev) return { ones: { value: prev.e, from: prev.e }, tens: { value: prev.t2, from: prev.t2 }, settle: 1, arrow: null };
    return { ones: { value: 8, from: 8 }, tens: { value: 1, from: 1 }, settle: 1, arrow: null };
  }
  return stateFrom(frame, A, B, C, m.d, m.t, m.dMid, m.e, m.t, m.t2);
};

/** three phases: A lower beads, B the upper bead, C one bead on the tens rod (on OR off) */
function stateFrom(frame: number, A: Phase, B: Phase, C: Phase, d0: number, t0: number, dMid: number, v: number, t1: number, t2: number): AbxState {
  const PRE = 14;
  let ones = { value: d0, from: d0 };
  let tens = { value: t0, from: t0 };
  let settle = 1;
  let arrow: AbxState["arrow"] = null;
  if (frame < A.start) {
    if (frame >= A.start - PRE && d0 !== dMid) arrow = { rod: 0, from: d0, to: dMid, settle: 0 };
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
  const sp = who === "spark";
  // ---- the recall (a narrator speaks): the heroes listen, nod and point
  push(fs(0), sp ? "think" : "grin");
  push(fs(1), sp ? "grin" : "point");
  push(wf(1, 7), "cheer"); // "five and five"
  push(fs(2), sp ? "point" : "think");
  push(wf(2, 7), sp ? "think" : "point"); // "no room to add"
  push(fs(3), "cheer");
  // ---- the drills
  for (const m of MISSIONS) {
    const S = m.stuckHero === who;
    const H = m.helper === who;
    push(fs(m.cue), S ? "point" : "grin", S);
    push(fs(m.noRoom), S ? "think" : "point", H);
    push(fs(m.call), S ? "think" : "call", H); // the helper raises the pennant / beaker
    push(fe(m.call) + 4, S ? "think" : "call", false);
    push(fs(m.reveal), S ? "think" : "cheer", H);
    push(wf(m.reveal, 3), "cheer", H);
    push(fs(m.move), S ? "point" : "think", S);
    push(fs(m.result), "cheer", true);
    push(fs(m.check), "grin", false);
  }
  push(fs(FINALE), "cheer", true);
  push(fs(MOTTO), "grin", false);
  return { segs: s, talk };
};
const BLAZE_SEGS = heroSegs("blaze");
const SPARK_SEGS = heroSegs("spark");

const buddySegs = (): Seg<CBMood>[] => {
  const s: Seg<CBMood>[] = [{ f: 0, mood: "idle" }];
  s.push({ f: wf(1, 9), mood: "check" });
  s.push({ f: wf(2, 7), mood: "puzzled" });
  s.push({ f: fs(3), mood: "idle" });
  for (const m of MISSIONS) {
    s.push({ f: fs(m.cue), mood: "write" });
    s.push({ f: fs(m.noRoom), mood: "puzzled" });
    s.push({ f: fs(m.call), mood: "idea" });
    s.push({ f: wf(m.reveal, 3), mood: "idea" });
    s.push({ f: fs(m.move), mood: "write" });
    s.push({ f: fs(m.result), mood: "idle" });
    s.push({ f: fs(m.check), mood: m === MISSIONS[3] ? "cheer" : "check" });
    s.push({ f: fs(m.check) + 36, mood: m === MISSIONS[3] ? "cheer" : "idle" });
  }
  return s;
};
const BUDDY_SEGS = buddySegs();

// ---------------------------------------------------------------- SFX cues
type SfxCue = { frame: number; file: string; vol: number; len?: number };
const buildCues = (): SfxCue[] => {
  const c: SfxCue[] = [];
  const add = (frame: number, file: string, vol: number, len = 60) => c.push({ frame, file, vol, len });
  add(3, "bf5_chime.mp3", 0.35, 60);
  add(wf(1, 4), "friend_sparkle.mp3", 0.3, 40);
  add(wf(1, 7), "bf5_pour.mp3", 0.35, 50);
  add(wf(1, 9), "bf5_pour.mp3", 0.35, 50);
  add(wf(1, 9) + 18, "bf5_ding.mp3", 0.4, 40);
  add(wf(2, 7), "bf5_pop.mp3", 0.4, 20);
  add(wf(2, 12), "bf5_pop.mp3", 0.4, 20);
  add(wf(3, 4), "bf5_whistle.mp3", 0.35, 30);
  for (const m of MISSIONS) {
    add(fs(m.cue), "bf5_flip.mp3", 0.4, 30);
    add(wf(m.cue, 1), "bf5_whistle.mp3", 0.3, 30);
    add(wf(m.cue, m.aW), "bf5_scribble.mp3", 0.2, 30);
    add(fs(m.noRoom) + 2, "bf5_squeak.mp3", 0.3, 20);
    add(fs(m.call), "bf5_ding.mp3", 0.4, 40);
    const c0 = fe(m.call) + 5;
    [0, 30, 60].forEach((k) => add(c0 + k, "bf5_beep.mp3", 0.45, 15));
    add(wf(m.reveal, 3), "friend_sparkle.mp3", 0.5, 40);
    add(wf(m.reveal, 3) - 2, "bf5_pop.mp3", 0.3, 20);
    const ph = phasesFor(m);
    add(fs(m.move) + 4, "bf5_scribble.mp3", 0.2, 30);
    add(ph.A.start, m.op === "add" ? "bead_subtract.mp3" : "bead_add.mp3", 0.42, 40);
    if (m.hasB) add(ph.B.start + 1, "bead_upper_swap.mp3", 0.4, 30);
    add(ph.C.start + 2, m.op === "add" ? "count_carry.mp3" : "bead_subtract.mp3", 0.46, 50);
    add(wf(m.result, m.rAns), "bf5_chime.mp3", 0.4, 60);
    add(wf(m.result, m.rAns) + 2, "mission_solved.mp3", 0.3, 40);
    if (m !== MISSIONS[3]) {
      add(fs(m.check), "bf5_stamp.mp3", 0.55, 40);
      add(fs(m.check) + 8, "bf5_tick.mp3", 0.4, 30);
      add(fs(m.check) + 12, "bf5_cheer.mp3", 0.2, 50);
    }
  }
  add(fs(FINALE), "bf5_stamp.mp3", 0.55, 40);
  add(fs(FINALE) + 8, "bf5_tick.mp3", 0.4, 30);
  add(wf(FINALE, 3), "bf5_medal.mp3", 0.5, 70);
  add(wf(FINALE, 3) + 6, "bf5_cheer.mp3", 0.34, 70);
  add(fs(MOTTO), "bf5_clip.mp3", 0.4, 20);
  add(fs(MOTTO) + 10, "bf5_chime.mp3", 0.3, 60);
  add(fs(CLOSE) + 4, "cta_pop.mp3", 0.45, 30);
  return c;
};
const CUES = buildCues();

// ---------------------------------------------------------------- the reel
const STORE_START = fs(CLOSE);
const STORE_FRAMES = 92;

const KIT: Record<BFName, { kit: "trainer" | "lab"; palette: Record<string, string> }> = {
  blaze: { kit: "trainer", palette: { body: "#6CC24A", belly: "#FFF2D6", cape: "#FF8A5B", shoe: "#F4F6F8" } },
  spark: { kit: "lab", palette: { body: "#7FB8E8", belly: "#E3F1FF", cape: "#6CC24A", shoe: "#2D3E50" } },
};

export const ShortMathHeroesBF5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const track = useMemo(() => makeTrack(PH, BF5_AUDIO_SEC, FPS), []);
  const active = track.activeAt(frame);
  const p = active ? active.phrase.index : 0;
  const m = missionAt(p);
  const inIntro = p <= LAST_INTRO;
  const inFinale = p >= FINALE;

  // ---------------------------------------------------------------- the focus split and the layout
  const sp = splitAt(frame);
  const L0 = layoutAt(sp);
  const finK = inFinale ? easeOut(clamp01((frame - (fs(FINALE) - 8)) / 12)) : 0;
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
  const calmHero = 1 - 0.7 * sp * (1 - finK);

  const burst = Math.max(...MISSIONS.map((mm) => pulseAt(frame, fs(mm.check), 40)), pulseAt(frame, wf(FINALE, 3), 70));
  const doneCount = MISSIONS.filter((mi2) => frame >= fs(mi2.check)).length;

  // ---------------------------------------------------------------- the header (design coordinates = story size, scaled)
  const sumTf = `translate(${SAFE_CX} ${SUM_Y}) scale(${SUM_K}) translate(${-(SUM_STORY.x + SUM_STORY.w / 2)} ${-SUM_STORY.y})`;
  const HX = SUM_STORY.x;
  const HY = SUM_STORY.y;
  const HW = SUM_STORY.w;
  const HH = SUM_STORY.h;
  let headerView: React.ReactNode = null;
  if (inIntro) {
    const appearFrom = p === 0 ? 2 : fs(p);
    const ap = clamp01((frame - appearFrom) / 10);
    const text = ["REMEMBER BIG FRIENDS?", "TEN TOGETHER!", "NO ROOM? NOT ENOUGH?", "SPEED DRILL TIME!"][p];
    const size = [54, 70, 54, 66][p];
    headerView = <NoteHeader x={HX} y={HY} w={HW} h={HH} text={text} size={size} appear={ap} />;
  } else if (m && !inFinale) {
    const leave = frame > fs(m.next) - 8 ? clamp01((frame - (fs(m.next) - 8)) / 8) : 0;
    if (leave < 1) {
      const solvedF = wf(m.result, m.rAns);
      headerView = (
        <g transform={`translate(0 ${-leave * 230})`}>
          <DrillHeader
            x={HX}
            y={HY}
            w={HW}
            h={HH}
            a={m.a}
            b={m.b}
            op={m.op}
            answer={m.ans}
            showAnswer={clamp01((frame - solvedF) / 10)}
            flashA={Math.max(flashK(frame, wf(m.cue, m.aW)), flashK(frame, wf(m.result, 0)))}
            flashB={Math.max(flashK(frame, wf(m.cue, m.bW)), flashK(frame, wf(m.result, m.rB)))}
            appear={clamp01((frame - fs(m.cue)) / 10)}
          />
        </g>
      );
    }
  }

  // ---------------------------------------------------------------- Clip, the clipboard coach
  const bm = moodAt(BUDDY_SEGS, frame);
  const ticks = MISSIONS.map((mi2) => clamp01((frame - fs(mi2.check)) / 16));
  const bump = m ? bounceAt(frame, fs(m.check), 34) : { hop: 0, squash: 0 };
  const bulb = m ? (frame >= fs(m.call) && frame < wf(m.reveal, 3) + 24 ? 1 : 0) : 0;
  const cbMood: CBMood = inFinale ? "cheer" : bm.mood;

  // ---------------------------------------------------------------- the panel
  const px = panel.x;
  const py = panel.y;
  const pw = panel.w;
  const ph = panel.h;
  const cx = px + pw / 2;
  const midY = py + ph / 2;
  let panelView: React.ReactNode = null;
  if (inIntro) {
    if (p === 0) {
      panelView = <StickyNote cx={cx} cy={midY} lines={["REMEMBER", "BIG FRIENDS?"]} k={clamp01((frame - 4) / 14)} frame={frame} fps={fps} size={50} />;
    } else if (p === 1) {
      const k = clamp01((frame - (wf(1, 7) - 8)) / (wef(1, 9) - wf(1, 7) + 36));
      panelView = <FlaskBond cx={cx} cy={midY - 19} n={5} friend={5} k={k} flashN={flashK(frame, wf(1, 7))} flashF={flashK(frame, wf(1, 9))} friendReveal={clamp01((frame - wf(1, 9)) / 8)} frame={frame} fps={fps} />;
    } else if (p === 2) {
      panelView = (
        <g>
          <StickyNote cx={cx} cy={midY - 175} lines={["NO ROOM", "TO ADD"]} k={clamp01((frame - wf(2, 7)) / 14)} frame={frame} fps={fps} size={50} />
          <StickyNote cx={cx} cy={midY + 175} lines={["NOT ENOUGH", "TO TAKE"]} k={clamp01((frame - wf(2, 12)) / 14)} frame={frame} fps={fps} size={50} />
        </g>
      );
    } else {
      panelView = <DrillBadge cx={cx} cy={midY} top="SPEED" big="DRILL!" bigSize={78} k={clamp01((frame - fs(3)) / 14)} flash={flashK(frame, wf(3, 4))} frame={frame} fps={fps} />;
    }
  } else if (m && !inFinale) {
    const c0 = fe(m.call) + 5;
    const revealF = fs(m.reveal);
    const showCue = frame >= fs(m.cue) && frame < fs(m.noRoom);
    const showNoRoom = frame >= fs(m.noRoom) && frame < fs(m.call);
    const showCall = frame >= fs(m.call) && frame < c0;
    const showCount = frame >= c0 && frame < revealF;
    const showBond = frame >= revealF && frame < fs(m.check) + 12;
    const showFormula = frame >= revealF && frame < fs(m.check) + 26;
    const showStamp = frame >= fs(m.check) && frame < fs(m.next);
    const countN = frame < c0 + 30 ? 3 : frame < c0 + 60 ? 2 : 1;
    const countStart = countN === 3 ? c0 : countN === 2 ? c0 + 30 : c0 + 60;
    const bondK = clamp01((frame - revealF) / 46);
    const friendRev = clamp01((frame - wf(m.reveal, 3)) / 8);
    const friendWordMove = m.op === "add" ? 2 : 1;
    const fFlash = Math.max(flashK(frame, wf(m.reveal, 3)), flashK(frame, wf(m.move, friendWordMove)));
    const FORM_H = 200;
    const BOND_H = 458;
    const groupTop = midY - (BOND_H + 24 + FORM_H) / 2;
    const flaskCy = groupTop + 210;
    const cardY = groupTop + BOND_H + 24;
    const noteLines: [string, string] = m.op === "add" ? ["NO ROOM", `TO ADD ${m.b}`] : ["NOT ENOUGH", `TO TAKE ${m.b}`];
    panelView = (
      <g>
        {showCue && <DrillBadge cx={cx} cy={midY - 40} top={m.cueTop} big={m.cueBig} bigSize={m.cueSize} chip={m.chip} chipTone={m.op} k={clamp01((frame - fs(m.cue)) / 14)} flash={flashK(frame, wf(m.cue, m.cueBig === "DRILL" ? 1 : 1))} frame={frame} fps={fps} />}
        {showNoRoom && (
          <g transform={`translate(${cx} ${midY}) scale(1.12) translate(${-cx} ${-midY})`}>
            <StickyNote cx={cx} cy={midY} lines={noteLines} k={clamp01((frame - fs(m.noRoom)) / 14)} frame={frame} fps={fps} size={52} />
          </g>
        )}
        {showCall && <BulbCall cx={cx} cy={midY - 30} k={clamp01((frame - fs(m.call)) / 18)} frame={frame} fps={fps} />}
        {showCount && (
          <g transform={`translate(${cx} ${midY}) scale(1.0) translate(${-cx} ${-midY})`}>
            <ReadyLights cx={cx} cy={midY} n={countN} k={clamp01((frame - countStart) / 28)} frame={frame} fps={fps} />
          </g>
        )}
        {showBond && (
          <g opacity={1 - clamp01((frame - fs(m.check)) / 12)}>
            <FlaskBond cx={cx} cy={flaskCy} n={m.b} friend={m.f} k={bondK} flashN={flashK(frame, wf(m.reveal, 0))} flashF={fFlash} friendReveal={friendRev} frame={frame} fps={fps} />
          </g>
        )}
        {showFormula && (
          <FlashCard
            x={px + 6}
            y={cardY}
            w={pw - 12}
            h={FORM_H}
            op={m.op}
            n={m.b}
            friend={m.f}
            appear={clamp01((frame - revealF) / 12) * (1 - clamp01((frame - (fs(m.check) + 12)) / 12))}
            friendReveal={friendRev}
            flashOperand={flashK(frame, wf(m.reveal, 0))}
            flashFriend={fFlash}
            flashTen={flashK(frame, wf(m.move, 5))}
            frame={frame}
            fps={fps}
          />
        )}
        {showStamp && <CheckStamp cx={cx} cy={midY - 20} k={clamp01((frame - fs(m.check)) / 36)} frame={frame} fps={fps} />}
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
  const working = m ? frame >= fs(m.noRoom) && frame < fs(m.result) : false;
  const abxGlow = solved ? "#FFD84D" : working ? "#FF8A5B" : "#6CC24A";
  const abxPop = inIntro ? easeOut(clamp01((frame - 6) / 14)) : 1;
  const abxOut = inFinale ? clamp01((frame - fs(FINALE)) / 6) : 0;
  const notEnough = (m && frame >= fs(m.noRoom) && frame < fs(m.call)) || (p === 2 && ((frame >= wf(2, 7) && frame < wf(2, 11)) || (frame >= wf(2, 12) && frame < wef(2, 16))));
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
      events.push([fs(m.cue), m.stuckHero === name ? 36 : 14]);
      events.push([wf(m.reveal, 3), m.helper === name ? 66 : 24]);
      events.push([wf(m.result, m.rAns), 70]);
      events.push([fs(m.check), 40]);
    }
    events.push([wf(1, 9), 40], [wf(2, 7), 20], [fs(3), 40], [wf(FINALE, 3), 90]);
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
        kit={KIT[name].kit}
        palette={KIT[name].palette}
      />
    );
  };

  const pulses = MISSIONS.map((mi2) => pulseAt(frame, fs(mi2.check), 20));
  const finaleIn = inFinale ? clamp01((frame - fs(FINALE)) / 8) : 0;
  const overlayCaption = p !== CLOSE;
  const capSize = active ? (active.phrase.text.length > 60 ? 44 : active.phrase.text.length > 36 ? 50 : 58) : 56;
  // "Check!" is a very short word: keep its caption on screen until the next phrase begins
  let capPhrase = active ? active.phrase : null;
  let capWord = active ? active.wordIdx : 0;
  if (active && active.phrase.end - active.phrase.start < 0.5) {
    capWord = 0;
  } else if (!active) {
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
    <AbsoluteFill style={{ background: "#BFE6FF" }}>
      <HideTextStyle />
      <div style={{ position: "absolute", inset: 0, filter: `saturate(${1 - 0.35 * sp * (1 - finK)}) brightness(${1 + 0.02 * sp})` }}>
        <BeadGym width={W} height={H} frame={frame} fps={fps} burst={burst} counterY={L.counterY} calm={sp * (1 - finK)} done={doneCount} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(24,60,86,${0.2 * sp * (1 - finK)})` }} />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${SAFE.left} ${SAFE.top}) scale(${BANNER_K})`} opacity={L.signA * (1 - finaleIn)}>
          <DrillBanner x={0} y={0} h={BANNER_H} frame={frame} fps={fps} />
        </g>

        <g transform={sumTf}>{headerView}</g>

        {panelView}

        <g>
          <CheckStrip x={PROG.x} y={PROG.y} h={PROG.h} done={inFinale ? 4 : doneCount} pulses={pulses} medal={inFinale ? 1 : 0} frame={frame} fps={fps} />
        </g>

        {inFinale && <BigMedal cx={540} k={clamp01((frame - (fs(FINALE) + 6)) / 22)} frame={frame} fps={fps} />}
        {inFinale && finaleIn > 0.5 && <NoteTag cx={540} cy={606} text="NO MISSES!" size={46} maxW={640} k={clamp01((frame - (fs(FINALE) + 20)) / 14)} />}

        <ClipBuddy
          x={L.machineX}
          y={L.machineBase}
          scale={L.machineScale}
          mood={cbMood}
          moodFrame={inFinale ? fs(FINALE) : bm.since}
          frame={frame}
          fps={fps}
          ticks={inFinale ? [1, 1, 1, clamp01((frame - fs(FINALE)) / 16)] : ticks}
          squash={bump.squash * calmHero}
          hop={bump.hop * L.machineScale * calmHero}
          bulb={bulb}
        />

        {p === MOTTO && (
          <g transform="translate(540 1420)">
            <rect x={-400} y={-80} width={800} height={160} rx={44} fill={CREAM} stroke={INK5} strokeWidth={8} />
            <rect x={-384} y={-64} width={768} height={128} rx={32} fill="none" stroke={LEAFD} strokeWidth={4} strokeDasharray="3 12" strokeLinecap="round" />
            <Txt x={0} y={-6} size={46} fill={INK5} stroke={INK5} sw={0} spacing={1}>DRILL COMPLETE!</Txt>
            <Txt x={0} y={44} size={44} fill="#1B6B33" stroke={INK5} sw={0} spacing={1}>READY FOR ANYTHING!</Txt>
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
              borderRadius: 46,
              background: "linear-gradient(180deg, #FFFEF8, #FFF1DA)",
              border: "9px solid #FFFFFF",
              boxSizing: "border-box",
              opacity: abxPop * (1 - abxOut),
              boxShadow: `0 0 0 6px ${abxGlow}, 0 0 ${26 + 22 * sp}px ${6 + 8 * sp}px ${abxGlow}88, 0 ${14 + 10 * sp}px 0 rgba(24,60,86,0.4)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: abxLeft(L),
              top: abxTop(L),
              opacity: abxPop * (1 - abxOut),
              transform: `scale(${0.8 + 0.2 * abxPop})`,
              transformOrigin: "50% 50%",
              filter: "drop-shadow(0 8px 10px rgba(24,60,86,0.4))",
            }}
          >
            <Abacus rods={rods} settle={abx.settle} scale={L.abxScale} colorOnArrival palette={RIG_BF5} placeLabelHalo chipInk="#0F2233" labelInk={["#A64B00", "#5E6A0E"]} />
          </div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 1 - abxOut }}>
            {abx.arrow && <BeadArrow box={ABX_BOX} rod={abx.arrow.rod} from={abx.arrow.from} to={abx.arrow.to} settle={abx.arrow.settle} />}
            {notEnough && (
              <g>
                <rect x={onesX - 56 * L.abxScale} y={abxTop(L) + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="none" stroke="#FF8A5B" strokeWidth={9} strokeDasharray="22 14" strokeDashoffset={-frame * 2.4} opacity={0.95} />
                <rect x={onesX - 56 * L.abxScale} y={abxTop(L) + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="#FF8A5B" opacity={0.13 + 0.08 * Math.sin(frame * 0.5)} />
              </g>
            )}
          </svg>
        </>
      ) : null}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {MISSIONS.slice(0, 3).map((mm2, i) => (
          <Celebration key={i} x={L.machineX} y={L.machineBase - 380 * L.machineScale} frame={frame} fps={fps} startFrame={fs(mm2.check)} />
        ))}
        {[0, 1, 2].map((k) => (
          <Celebration key={`f${k}`} x={220 + k * 320} y={640 + (k % 2) * 160} frame={frame} fps={fps} startFrame={wf(FINALE, 3) + k * 4} />
        ))}
      </svg>

      {overlayCaption && capPhrase && (
        <div style={{ position: "absolute", left: CAP.x, top: CAP.y, width: CAP.w, height: CAP.h, fontSize: capSize }}>
          <BF5Caption phrase={capPhrase} wordIdx={capWord} top={0} height={CAP.h} width={CAP.w} />
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
            background: `linear-gradient(180deg, rgba(28,70,98,0.95), rgba(16,44,66,0.97))`,
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
      <Audio src={staticFile("audio/short_math_heroes_bf5/short_math_heroes_bf5.mp3")} />
    </AbsoluteFill>
  );
};

void CORAL5;
