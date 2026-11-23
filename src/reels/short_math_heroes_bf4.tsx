// MATH HEROES — BIG FRIEND 4 (TAKING AWAY): a standalone 9:16 short. THE STORM AND THE RESCUE CHOPPER: a
// storm rolls in and a stuck number blocks the rescue chopper, the highest urgency of the set. A world of
// safety yellow, sky blue and slate (a stormy sky that CLEARS as missions are solved, a hazard-striped
// helipad), a funny round rescue CHOPPER whose cockpit glass is its face (it shakes in the storm, LOCKS on
// "stuck" with a padlock on the rotor, gasps at the friend, spins up and lifts off, then lands and cheers),
// crate TOWERS for the pairs, a barrier sign, a signal flare for the call, a rotor countdown, winch crates
// for the friend bond, a clipboard for the friend trick, a storm gauge and a cloud-clearing progress strip.
// Blaze is the rescue pilot (flight helmet, goggles, hi-vis vest, radio) and Spark the winch medic (yellow
// rescue helmet, harness, cross badge, megaphone). The lesson layout keeps the abacus on the LEFT.
//
// THE SCRIPT (docs/reel_math_heroes_bf4_lines.txt, final revision, verified word for word against the take):
//   intro   p0-p6    "Big friends make ten together! Six and four. Seven and three. Eight and two. Nine and one.
//                     Five and five! If the ones rod can't take away enough, we ask a big friend to help through
//                     the tens rod!"
//   mission p7-p14   37 - 9   friend 1   -> 28
//   mission p15-p21  23 - 4   friend 6   -> 19
//   mission p22-p28  36 - 7   friend 3   -> 29
//   mission p29-p36  41 - 2   friend 8   -> 39   (p36 is also the finale: the chopper lands)
//   close   p37-p38  "Every stuck number has a trick. Learn them all with Abacus Kids..."
//
// THE BEAD MOVE ("Add <friend>, then take away ten!"): the friend is ADDED to the ones rod first (lower
// beads before the upper bead), then ONE lower bead comes off the tens rod. Every start was checked:
//   37 - 9 : ones 7 +1 lower bead -> 8; tens 3 -> 2          = 28
//   23 - 4 : ones 3 +1 lower bead, then the upper bead -> 9; tens 2 -> 1   = 19
//   36 - 7 : ones 6 +3 lower beads -> 9; tens 3 -> 2         = 29
//   41 - 2 : ones 1 +3 lower beads, then the upper bead -> 9; tens 4 -> 3  = 39
//
// Layout (1080 x 1920), margins only: left 48, right 1032, top 56, bottom 1860 (named SAFE).

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/math_heroes_bf4.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { Abacus, type RodState } from "../components/Abacus";
import { BeadArrow } from "../stage/BeadArrow";
import type { AbacusBox } from "../stage/geometry";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Celebration } from "../components/heroes/Celebration";
import { BFHero, type BFMood, type BFName } from "../components/bf1/BFHero";
import { Chopper, type CHMood } from "../components/bf4/Chopper";
import { StormWorld } from "../components/bf4/StormWorld";
import { clamp01, easeOut, flashK, Txt } from "../components/bf1/Props";
import {
  BF4Caption,
  BarrierSign,
  Clipboard,
  CloudStrip,
  CautionHeader,
  CrateTowers,
  DRED,
  FlareCall,
  HazardBanner,
  INK4,
  LIME,
  PLATE,
  PairHeader,
  Patch,
  RingBonk,
  RotorCount,
  SKY,
  SafeBurst,
  StormGauge,
  TextHeader,
  WinchCrates,
  YEL,
  bannerW,
} from "../components/bf4/Props4";
import { ABACUS_INNER_H, FRAME_LW, ROD_PITCH } from "../data/tokens";
import type { RigPalette } from "../data/theme";
import { HideTextStyle } from "../lib/hideText";

const PH = phrasesJson as unknown as TPhrase[];
export const BF4_AUDIO_SEC = 91.5;
export const FPS = 30;
export const BF4_DURATION = sec(BF4_AUDIO_SEC, FPS);
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
  v: number; // ones value after the friend is ADDED
  dMid: number; // ones value after the LOWER beads are added (the upper bead may still be off)
  hasB: boolean; // the upper bead comes on
  lead: number | null;
  stuck: number;
  noRoom: number;
  call: number;
  reveal: number;
  move: number;
  result: number;
  tail: number;
  stuckHero: BFName; // says the stuck line and the move line
  helper: BFName; // says not-enough and the friend
  next: number;
  leadText: string | null;
  leadPatch: string | null;
  tailLabel: string;
  stormAfter: number; // the storm level once this mission is solved
  bolt: number;
}
const mk = (a: number, b: number, ph: Omit<Mission, "a" | "b" | "f" | "ans" | "t" | "d" | "v" | "dMid" | "hasB">): Mission => {
  const f = 10 - b;
  const d = a % 10;
  const v = d + f;
  const hasB = d < 5 && v >= 5;
  return { a, b, f, ans: a - b, t: Math.floor(a / 10), d, v, dMid: hasB ? 4 : v, hasB, ...ph };
};
const MISSIONS: Mission[] = [
  mk(37, 9, { lead: 7, stuck: 8, noRoom: 9, call: 10, reveal: 11, move: 12, result: 13, tail: 14, stuckHero: "spark", helper: "blaze", next: 15, leadText: "STORM COMING!", leadPatch: "ALERT!", tailLabel: "CHOPPER FREE!", stormAfter: 0.72, bolt: 1 }),
  mk(23, 4, { lead: null, stuck: 15, noRoom: 16, call: 17, reveal: 18, move: 19, result: 20, tail: 21, stuckHero: "blaze", helper: "spark", next: 22, leadText: null, leadPatch: null, tailLabel: "KEEP CLIMBING!", stormAfter: 0.5, bolt: 2 }),
  mk(36, 7, { lead: null, stuck: 22, noRoom: 23, call: 24, reveal: 25, move: 26, result: 27, tail: 28, stuckHero: "spark", helper: "blaze", next: 29, leadText: null, leadPatch: null, tailLabel: "ALMOST THROUGH!", stormAfter: 0.3, bolt: 3 }),
  mk(41, 2, { lead: 29, stuck: 30, noRoom: 31, call: 32, reveal: 33, move: 34, result: 35, tail: 36, stuckHero: "blaze", helper: "spark", next: 36, leadText: "LAST ONE!", leadPatch: "LAST ONE!", tailLabel: "", stormAfter: 0.0, bolt: 4 }),
];
const missionAt = (p: number): Mission | null => {
  for (const m of MISSIONS) if (p >= (m.lead ?? m.stuck) && p <= m.tail) return m;
  return null;
};

const FINALE = 36; // "We landed, everyone's safe!" (also the last mission's tail)
const MOTTO = 37;
const CLOSE = 38;
const LAST_INTRO = 6;

// ---------------------------------------------------------------- layout: margins, two layouts, one split
export const SAFE = { left: 48, right: W - 48, top: 56, bottom: 1860 };
const SAFE_CX = (SAFE.left + SAFE.right) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SUM_STORY = { x: 100, y: 128, w: 880, h: 162 };
const SUM_K = 1.05;
const SUM_Y = 130;
const BANNER_K = 0.6;
const BANNER_H = 92;
const BANNER_W = bannerW();
const BADGE_TF = { dx: -28, dy: 38 };
const BADGE = { x: 874 + BADGE_TF.dx, y: 18 + BADGE_TF.dy, w: 186, h: 66 };
const CREDIT_TF = { dx: 22, dy: -50 };
const CREDIT = { x: 26 + CREDIT_TF.dx, y: 1864 + CREDIT_TF.dy, w: 300, h: 44 };
const PROG = { x: 410, y: 62, w: 336, h: 52 }; // four clouds + the helipad "H", top row between the banner and the logo
const CAP = { x: SAFE.left, y: 1684, w: SAFE.right - SAFE.left, h: 126 };
const ZONE_BOTTOM = CAP.y - 8;
const ABX_FIT = 0.85;
const ABX_TOTAL_H = ABACUS_INNER_H + FRAME_LW * 2 + 105;
const cardWFor = (S: number) => (2 * ROD_PITCH + FRAME_LW * 2) * S + 32;
const scaleForTop = (top: number) => (ZONE_BOTTOM - top - 28) / ABX_TOTAL_H;
const CHB = { halfW: 270, up: 362 }; // the chopper's local box

interface Lay {
  s: number;
  counterY: number;
  signA: number;
  machineScale: number;
  machineBase: number;
  heroScale: number;
  heroY: number;
  blazeX: number;
  sparkX: number;
  zoneTop: number;
  cardTop: number;
  cardH: number;
  abxScale: number;
}
const mkLay = (o: { s: number; counterY: number; signA: number; ms: number; hs: number; blazeX: number; sparkX: number; zoneTop: number }): Lay => {
  const S = ABX_FIT * scaleForTop(o.zoneTop);
  const avail = ZONE_BOTTOM - o.zoneTop;
  const cardH = ABX_TOTAL_H * S + 28;
  return {
    s: o.s,
    counterY: o.counterY,
    signA: o.signA,
    machineScale: o.ms,
    machineBase: o.counterY - 4,
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
const STORY_LAY = mkLay({ s: 0, counterY: 600, signA: 1, ms: 0.79, hs: 0.85, blazeX: 170, sparkX: 910, zoneTop: 622 });
const LESSON_LAY = mkLay({ s: 1, counterY: 556, signA: 0, ms: 0.66, hs: 0.72, blazeX: 150, sparkX: 930, zoneTop: 578 });
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
const MACHINE_X = SAFE_CX;
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
    { label: "chopper", x: MACHINE_X - CHB.halfW * ms, y: L.machineBase - CHB.up * ms, w: CHB.halfW * 2 * ms, h: CHB.up * ms + 4 },
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
      throw new Error(`bf4 layout (${tag}): ${b.label} leaves the safe area`);
    }
  }
  if (!overlaps) return;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
        throw new Error(`bf4 layout (${tag}): ${a.label} overlaps ${b.label}`);
      }
    }
  }
};
checkBoxes(boxesFor(layoutAt(0)), "story");
checkBoxes(boxesFor(layoutAt(1)), "lesson");
checkBoxes(boxesFor(layoutAt(0.5)), "mid", false);
console.log("bf4 lesson abacus scale", LESSON_LAY.abxScale.toFixed(3), "panel", JSON.stringify(panelOf(LESSON_LAY)));

// ---------------------------------------------------------------- the focus split, per phrase
const FOCUS_KEYS: { f: number; to: number }[] = (() => {
  const k: { f: number; to: number }[] = [{ f: 0, to: 0 }, { f: fs(1), to: 1 }];
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

// a safety-yellow frame, a pale panel and sky-blue beads that are ON
const RIG_BF4: RigPalette = {
  woodLight: "#FFE866",
  wood: "#FFD400",
  woodDark: "#B38F00",
  panel: "#F7FBFF",
  panelEdge: "#FFE98A",
  rod: "#6A7A90",
  beam: "#3C4A5C",
  onTop: "#7FD0FF",
  onBottom: "#2E94F0",
  onEdge: "#14589E",
  offTop: "#F1F5F9",
  offBottom: "#C9D3DF",
  offEdge: "#8C9BAE",
};

// ---------------------------------------------------------------- the bead move (ADD the friend, then take ten off the tens rod)
interface Phase { start: number; end: number }
const phasesFor = (m: Mission): { A: Phase; B: Phase; C: Phase } => {
  const mv = m.move; // Add0 <friend>1 then2 take3 away4 ten5
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
  // intro demo (37 - 9): the big friend adds one to the ones rod, then a ten comes off the tens rod
  if (p <= LAST_INTRO) {
    const A = { start: wf(6, 11), end: wef(6, 12) + 4 };
    const B = { start: A.end, end: A.end };
    const C = { start: wf(6, 16), end: wef(6, 18) + 8 };
    return stateFrom(frame, A, B, C, 7, 3, 8, 8, 3, 2);
  }
  const m = missionAt(p);
  if (!m) {
    const last = MISSIONS[3];
    return { ones: { value: last.v, from: last.v }, tens: { value: last.t - 1, from: last.t - 1 }, settle: 1, arrow: null };
  }
  const { A, B, C } = phasesFor(m);
  if (frame < fs(m.stuck)) {
    const prev = MISSIONS[MISSIONS.indexOf(m) - 1];
    if (prev) return { ones: { value: prev.v, from: prev.v }, tens: { value: prev.t - 1, from: prev.t - 1 }, settle: 1, arrow: null };
    return { ones: { value: 7, from: 7 }, tens: { value: 3, from: 3 }, settle: 1, arrow: null };
  }
  return stateFrom(frame, A, B, C, m.d, m.t, m.dMid, m.v, m.t, m.t - 1);
};

/** three phases: A lower beads on, B the upper bead on, C one bead OFF the tens rod */
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
  // ---- intro: Blaze counts the pairs (and keeps an eye on the sky), Spark explains the full ones rod
  push(fs(0), sp ? "worry" : "point", !sp);
  for (let pp = 1; pp <= 5; pp++) push(fs(pp), sp ? "think" : "point", !sp);
  push(fs(5), sp ? "cheer" : "cheer", !sp);
  push(fs(6), sp ? "point" : "think", sp);
  push(wf(6, 4), "worry", sp); // "can't take away enough"
  push(wf(6, 11), "cheer", sp); // "a big friend"
  push(wf(6, 16), sp ? "point" : "grin", sp); // "the tens rod"
  // ---- missions
  for (const m of MISSIONS) {
    const S = m.stuckHero === who;
    const H = m.helper === who;
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    if (m.lead !== null) push(fs(m.lead), S ? "shock" : "worry", S);
    push(fs(m.stuck), S ? "shock" : "think", S);
    push(stuckW, S ? "worry" : "shock", S);
    push(fs(m.noRoom), S ? "worry" : "point", H);
    push(fs(m.call), S ? "call" : "point", H); // the STUCK hero radios for help
    push(fe(m.call) + 4, S ? "call" : "think", false);
    push(fs(m.reveal), S ? "think" : "cheer", H);
    push(wf(m.reveal, 3), "cheer", H);
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

const chopperSegs = (): Seg<CHMood>[] => {
  const s: Seg<CHMood>[] = [{ f: 0, mood: "cool" }];
  s.push({ f: wf(6, 4), mood: "storm" });
  s.push({ f: wf(6, 11), mood: "cool" });
  for (const m of MISSIONS) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    s.push({ f: fs(m.lead ?? m.stuck), mood: "storm" });
    s.push({ f: stuckW, mood: "locked" });
    s.push({ f: wf(m.reveal, 3), mood: "gasp" });
    s.push({ f: fs(m.move), mood: "spin" });
    s.push({ f: wf(m.result, 5), mood: "cheer" });
    s.push({ f: fs(m.tail) + 20, mood: m === MISSIONS[3] ? "cheer" : "cool" });
  }
  return s;
};
const CHOPPER_SEGS = chopperSegs();

/** how stormy the sky is, 1 black .. 0 clear: eases down as each mission is solved, then clears in the finale */
const stormAt = (frame: number): number => {
  let v = 0.95;
  for (let i = 0; i < MISSIONS.length; i++) {
    const m = MISSIONS[i];
    const f0 = i === 3 ? fs(FINALE) : wf(m.result, 5);
    const dur = i === 3 ? 70 : 45;
    const u = clamp01((frame - f0) / dur);
    if (u <= 0) break;
    const e = u * u * (3 - 2 * u);
    v = lerp(v, m.stormAfter, e);
    if (u < 1) break;
  }
  return v;
};

// ---------------------------------------------------------------- SFX cues
type SfxCue = { frame: number; file: string; vol: number; len?: number };
const buildCues = (): SfxCue[] => {
  const c: SfxCue[] = [];
  const add = (frame: number, file: string, vol: number, len = 60) => c.push({ frame, file, vol, len });
  add(2, "bf4_wind.mp3", 0.3, 60);
  add(wf(0, 3), "friend_sparkle.mp3", 0.3, 40);
  for (let pp = 1; pp <= 5; pp++) [4, 12, 20].forEach((k) => add(fs(pp) + k, "bf4_crate.mp3", 0.3, 20));
  add(wf(6, 4), "boing.mp3", 0.4, 30);
  add(wf(6, 11), "bead_add.mp3", 0.4, 40);
  add(wf(6, 16) + 2, "bead_subtract.mp3", 0.45, 50);
  for (const m of MISSIONS) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    if (m.lead === 7) {
      add(fs(7), "bf4_klaxon.mp3", 0.2, 50);
      add(fs(7) + 4, "bf4_thunder.mp3", 0.34, 90);
    }
    if (m.lead === 29) {
      add(fs(29), "bf4_squelch.mp3", 0.4, 25);
      add(fs(29) + 6, "bf4_wind.mp3", 0.3, 50);
    }
    add(stuckW - 3, "bf4_thunder.mp3", 0.3, 80);
    add(stuckW, "bf4_lock.mp3", 0.4, 40);
    add(stuckW + 6, "bf4_crackle.mp3", 0.28, 30);
    add(fs(m.noRoom) + 2, "boing.mp3", 0.36, 30);
    add(fs(m.call), "bf4_flare.mp3", 0.32, 60);
    const c0 = fe(m.call) + 5;
    add(c0 - 3, "bf4_dial.mp3", 0.4, 20);
    [0, 30, 60].forEach((k) => add(c0 + k, "bf4_beep.mp3", 0.4, 15));
    add(wf(m.reveal, 3) - 3, "bf4_gasp.mp3", 0.5, 25);
    add(wf(m.reveal, 3), "friend_sparkle.mp3", 0.5, 40);
    const ph = phasesFor(m);
    add(fs(m.move), "bf4_spin.mp3", 0.18, 60);
    add(ph.A.start, "bead_add.mp3", 0.36, 40);
    if (m.hasB) add(ph.B.start + 1, "bead_upper_swap.mp3", 0.42, 30);
    add(ph.C.start + 2, "bead_subtract.mp3", 0.5, 50);
    add(wf(m.result, 5), "bf4_sun.mp3", 0.4, 60);
    add(wf(m.result, 5) + 2, "mission_solved.mp3", 0.3, 40);
    add(wf(m.result, 5) + 5, "bf4_cheer.mp3", 0.24, 60);
    if (m !== MISSIONS[3]) add(fs(m.tail) + 3, "bf4_rotor.mp3", 0.3, 60);
  }
  add(fs(FINALE) - 8, "bf4_rotor.mp3", 0.4, 60);
  add(wf(FINALE, 1) + 6, "bf4_land.mp3", 0.4, 40);
  add(wf(FINALE, 1) + 10, "bf4_cheer.mp3", 0.35, 70);
  add(wf(FINALE, 1) + 14, "bf4_sun.mp3", 0.4, 60);
  add(fs(MOTTO), "bf4_crate.mp3", 0.35, 20);
  add(fs(CLOSE) + 4, "cta_pop.mp3", 0.45, 30);
  return c;
};
const CUES = buildCues();

// ---------------------------------------------------------------- the reel
const STORE_START = fs(CLOSE);
const STORE_FRAMES = 92;

const KIT: Record<BFName, { kit: "pilot" | "medic"; palette: Record<string, string> }> = {
  blaze: { kit: "pilot", palette: { body: "#4A5A73", belly: "#FFE3A3", cape: "#FF8A00", shoe: "#1B2533" } },
  spark: { kit: "medic", palette: { body: "#F2F6FA", belly: "#CFE6FF", cape: "#E5484D", shoe: "#3C4A5C" } },
};

export const ShortMathHeroesBF4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const track = useMemo(() => makeTrack(PH, BF4_AUDIO_SEC, FPS), []);
  const active = track.activeAt(frame);
  const p = active ? active.phrase.index : 0;
  const m = missionAt(p);
  const inIntro = p <= LAST_INTRO;
  const inFinale = p >= FINALE;

  // ---------------------------------------------------------------- the focus split and the layout
  const sp = splitAt(frame);
  const L0 = layoutAt(sp);
  const finK = inFinale ? easeOut(clamp01((frame - (fs(FINALE) - 8)) / 12)) : 0;
  const landF = wf(FINALE, 1);
  const hover = inFinale ? 330 * (1 - easeOut(clamp01((frame - fs(FINALE)) / Math.max(1, landF - fs(FINALE) + 6)))) : 0;
  const L: Lay = {
    ...L0,
    counterY: lerp(L0.counterY, 1060, finK),
    machineBase: lerp(L0.machineBase, 1056, finK) - hover,
    machineScale: lerp(L0.machineScale, 0.95, finK),
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

  const burst = Math.max(...MISSIONS.map((mm) => pulseAt(frame, wf(mm.result, 5), 40)), pulseAt(frame, landF, 70));
  const storm = stormAt(frame);
  // lightning: a flash at each alert and at each "stuck"
  let flash = 0;
  let boltSeed = 0;
  for (const mm of MISSIONS) {
    const stuckW = wf(mm.stuck, findWord(mm.stuck, "stuck"));
    const starts: number[] = [stuckW - 3, ...(mm.lead !== null ? [fs(mm.lead) + 4] : [])];
    for (const f0 of starts) {
      const u = (frame - f0) / 16;
      if (u >= 0 && u < 1) {
        const v = (1 - u) * (0.6 + 0.4 * Math.abs(Math.sin(u * 18)));
        if (v > flash) {
          flash = v;
          boltSeed = mm.bolt + f0;
        }
      }
    }
  }
  const stormFinal = inFinale ? 0 : storm;
  const finaleK = inFinale ? clamp01((frame - fs(FINALE)) / 40) : 0;

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
    if (p === 0) headerView = <TextHeader x={HX} y={HY} w={HW} h={HH} text="FRIENDS MAKE TEN!" size={68} appear={ap} frame={frame} fps={fps} />;
    else if (p >= 1 && p <= 5) {
      const [l, r] = [[6, 4], [7, 3], [8, 2], [9, 1], [5, 5]][p - 1];
      headerView = <PairHeader x={HX} y={HY} w={HW} h={HH} l={l} r={r} flashL={flashK(frame, wf(p, 0))} flashR={flashK(frame, wf(p, 2))} appear={ap} frame={frame} fps={fps} />;
    } else headerView = <TextHeader x={HX} y={HY} w={HW} h={HH} text="NEED A BIG FRIEND?" size={66} appear={ap} frame={frame} fps={fps} tone="sky" />;
  } else if (m && !inFinale) {
    const leadOn = m.lead !== null && frame >= fs(m.lead) && frame < fs(m.stuck);
    const leave = frame > fs(m.next) - 8 ? clamp01((frame - (fs(m.next) - 8)) / 8) : 0;
    if (leadOn && m.leadText) {
      const ap = clamp01((frame - fs(m.lead as number)) / 10);
      headerView = (
        <g transform={`translate(0 ${-leave * 230})`}>
          <TextHeader x={HX} y={HY} w={HW} h={HH} text={m.leadText} size={m.leadText.length > 12 ? 70 : 80} appear={ap} frame={frame} fps={fps} tone="sky" />
        </g>
      );
    } else if (frame >= fs(m.stuck) && leave < 1) {
      const sw = findWord(m.stuck, "stuck");
      const solvedF = wf(m.result, 5);
      headerView = (
        <g transform={`translate(0 ${-leave * 230})`}>
          <CautionHeader
            x={HX}
            y={HY}
            w={HW}
            h={HH}
            a={m.a}
            b={m.b}
            answer={m.ans}
            showAnswer={clamp01((frame - solvedF) / 10)}
            flashA={Math.max(flashK(frame, wf(m.stuck, 0)), flashK(frame, wf(m.result, 0)))}
            flashB={Math.max(flashK(frame, wf(m.stuck, 3)), flashK(frame, wf(m.result, 3)))}
            stuck={frame >= fs(m.result) ? 0 : clamp01((frame - wf(m.stuck, sw)) / 8)}
            appear={clamp01((frame - fs(m.stuck)) / 10)}
            frame={frame}
            fps={fps}
            alarm={frame < fs(m.result) ? 1 : 0}
          />
        </g>
      );
    }
  }

  // ---------------------------------------------------------------- the chopper character
  const cm = moodAt(CHOPPER_SEGS, frame);
  let lock = 0;
  if (m) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    if (frame >= stuckW && frame < wf(m.reveal, 3)) lock = clamp01((frame - stuckW) / 8);
    else if (frame >= wf(m.reveal, 3) && frame < wf(m.reveal, 3) + 10) lock = 1 - clamp01((frame - wf(m.reveal, 3)) / 10);
  }
  const chBump = m ? bounceAt(frame, wf(m.result, 5), 36) : { hop: 0, squash: 0 };
  const stuckBump = m ? bounceAt(frame, wf(m.stuck, findWord(m.stuck, "stuck")), 14) : { hop: 0, squash: 0 };
  const landBump = inFinale ? bounceAt(frame, landF + 8, 34) : { hop: 0, squash: 0 };
  const chMood: CHMood = inFinale ? (frame < landF + 6 ? "spin" : "cheer") : cm.mood;

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
      panelView = <StormGauge cx={cx} cy={midY - 20} level={storm} k={clamp01((frame - 4) / 14)} frame={frame} fps={fps} alarm={0.5} />;
    } else {
      const grow = [1, 2, 3, 4, 5].map((pp) => clamp01((frame - fs(pp)) / Math.max(12, (fe(pp) - fs(pp)) * 0.9)));
      const flashes: [number, number][] = [1, 2, 3, 4, 5].map((pp) => [flashK(frame, wf(pp, 0)), flashK(frame, wf(pp, 2))]);
      panelView = <CrateTowers x={px} y={py + 0.03 * ph} w={pw} h={0.94 * ph} grow={grow} flashes={flashes} frame={frame} fps={fps} />;
    }
  } else if (m && !inFinale) {
    const c0 = fe(m.call) + 5;
    const revealF = fs(m.reveal);
    const noRoomK = clamp01((frame - fs(m.noRoom)) / 14);
    const showLead = m.lead !== null && frame >= fs(m.lead) && frame < fs(m.stuck);
    const showBonk = frame >= fs(m.stuck) && frame < fs(m.noRoom);
    const showNoRoom = frame >= fs(m.noRoom) && frame < fs(m.call);
    const showCall = frame >= fs(m.call) && frame < c0;
    const showCount = frame >= c0 && frame < revealF;
    const showBond = frame >= revealF && frame < fs(m.tail);
    const showFormula = frame >= revealF && frame < fs(m.tail) + 20;
    const showTail = frame >= fs(m.tail) && m.tailLabel !== "";
    const countN = frame < c0 + 30 ? 3 : frame < c0 + 60 ? 2 : 1;
    const countStart = countN === 3 ? c0 : countN === 2 ? c0 + 30 : c0 + 60;
    const bondK = clamp01((frame - revealF) / 40);
    const friendRev = clamp01((frame - wf(m.reveal, 3)) / 8);
    const fFlash = Math.max(flashK(frame, wf(m.reveal, 3)), flashK(frame, wf(m.move, 1)));
    const FORM_H = 200;
    const BOND_H = 354;
    const groupTop = midY - (BOND_H + 24 + FORM_H) / 2;
    const bondCy = groupTop + 180;
    const formulaY = groupTop + BOND_H + 24;
    panelView = (
      <g>
        {showLead && (
          <g>
            <StormGauge cx={cx} cy={midY - 40} level={storm} k={clamp01((frame - fs(m.lead as number)) / 12)} frame={frame} fps={fps} alarm={1} />
            {m.leadPatch && <Patch cx={cx} cy={midY + 190} text={m.leadPatch} size={56} maxW={pw - 8} k={clamp01((frame - fs(m.lead as number) - 4) / 12)} tone="yellow" />}
          </g>
        )}
        {showBonk && (
          <g transform={`translate(${cx} ${midY}) scale(1.25) translate(${-cx} ${-midY})`}>
            <RingBonk x0={px + 0.76 * pw} x1={px + 0.24 * pw} cy={midY} label={`−${m.b}`} start={fs(m.stuck) + 6} frame={frame} />
          </g>
        )}
        {showNoRoom && (
          <g transform={`translate(${cx} ${midY}) scale(1.1) translate(${-cx} ${-midY})`}>
            <BarrierSign cx={cx} cy={midY - 30} text={`TO TAKE ${m.b}!`} k={noRoomK} frame={frame} fps={fps} />
          </g>
        )}
        {showCall && <FlareCall cx={cx} cy={midY - 30} k={clamp01((frame - fs(m.call)) / 26)} frame={frame} fps={fps} />}
        {showCount && (
          <g transform={`translate(${cx} ${midY}) scale(1.15) translate(${-cx} ${-midY})`}>
            <RotorCount cx={cx} cy={midY} n={countN} k={clamp01((frame - countStart) / 28)} frame={frame} fps={fps} />
          </g>
        )}
        {showBond && <WinchCrates cx={cx} cy={bondCy} n={m.b} friend={m.f} k={bondK} flashN={flashK(frame, wf(m.reveal, 0))} flashF={fFlash} friendReveal={friendRev} frame={frame} fps={fps} />}
        {showFormula && (
          <Clipboard
            x={px + 6}
            y={formulaY}
            w={pw - 12}
            h={FORM_H}
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
        {showTail && (
          <g>
            <StormGauge cx={cx} cy={midY - 50} level={storm} k={1} frame={frame} fps={fps} alarm={0} />
            <Patch cx={cx} cy={midY + 190} text={m.tailLabel} size={44} maxW={pw - 8} k={clamp01((frame - fs(m.tail) - 6) / 12)} tone="green" />
          </g>
        )}
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
  const abxGlow = solved ? "#FFD400" : stuckNow ? "#FF5A4D" : "#4FB3FF";
  const abxPop = inIntro ? easeOut(clamp01((frame - 6) / 14)) : 1;
  const abxOut = inFinale ? clamp01((frame - fs(FINALE)) / 6) : 0;
  const notEnough = (m && frame >= fs(m.noRoom) && frame < fs(m.call)) || (p === 6 && frame >= wf(6, 3) && frame < wf(6, 8));
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
      events.push([fs(m.call), S ? 40 : 0]);
      events.push([wf(m.reveal, 3), m.helper === name ? 70 : 24]);
      events.push([wf(m.result, 5), 80]);
      events.push([fs(m.tail), 40]);
    }
    events.push([wf(6, 4), 28], [wf(6, 11), 60], [landF + 8, 90]);
    if (inIntro) [1, 2, 3, 4, 5].forEach((pp) => events.push([wf(pp, 2), 30]));
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

  // ---------------------------------------------------------------- the progress strip
  const doneCount = MISSIONS.filter((mi2) => frame >= wf(mi2.result, 5)).length;
  const pulses = MISSIONS.map((mi2) => pulseAt(frame, wf(mi2.result, 5), 20));
  const padOn = inFinale && frame >= landF ? 1 : 0;

  const finaleIn = inFinale ? clamp01((frame - fs(FINALE)) / 8) : 0;
  const overlayCaption = p !== CLOSE;
  const capSize = active ? (active.phrase.text.length > 60 ? 44 : active.phrase.text.length > 36 ? 50 : 58) : 56;

  return (
    <AbsoluteFill style={{ background: "#3E9BF2" }}>
      <HideTextStyle />
      <div style={{ position: "absolute", inset: 0, filter: `saturate(${1 - 0.4 * sp * (1 - finK)}) brightness(${1 + 0.02 * sp})` }}>
        <StormWorld width={W} height={H} frame={frame} fps={fps} storm={stormFinal} flash={flash} bolt={boltSeed} burst={burst} counterY={L.counterY} calm={sp * (1 - finK)} finale={finaleK} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(16,28,48,${0.2 * sp * (1 - finK)})` }} />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${SAFE.left} ${SAFE.top}) scale(${BANNER_K})`} opacity={L.signA * (1 - finaleIn)}>
          <HazardBanner x={0} y={0} h={BANNER_H} frame={frame} fps={fps} />
        </g>

        <g transform={sumTf}>{headerView}</g>

        {panelView}

        <g opacity={inFinale ? 1 - finaleIn * 0.0 : 1}>
          <CloudStrip x={PROG.x} y={PROG.y} h={PROG.h} done={inFinale ? 4 : doneCount} pulses={pulses} padOn={padOn} frame={frame} fps={fps} />
        </g>

        <Chopper
          x={MACHINE_X}
          y={L.machineBase}
          scale={L.machineScale}
          mood={chMood}
          moodFrame={inFinale ? (frame < landF + 6 ? fs(FINALE) : landF + 6) : cm.since}
          frame={frame}
          fps={fps}
          squash={(chBump.squash + stuckBump.squash * 0.6 + landBump.squash) * calmHero}
          hop={(chBump.hop * L.machineScale + landBump.hop) * calmHero}
          lock={inFinale ? 0 : lock}
          clear={1 - storm}
        />

        {p === MOTTO && (
          <g transform="translate(540 1420)">
            <rect x={-400} y={-80} width={800} height={160} rx={26} fill={YEL} stroke={INK4} strokeWidth={8} />
            <rect x={-384} y={-64} width={768} height={128} rx={14} fill="none" stroke={INK4} strokeWidth={4} strokeDasharray="3 12" strokeLinecap="round" />
            <Txt x={0} y={-6} size={44} fill={INK4} stroke={INK4} sw={0} spacing={1}>EVERY STUCK NUMBER</Txt>
            <Txt x={0} y={44} size={52} fill="#0B3D91" stroke={INK4} sw={0} spacing={1}>HAS A TRICK!</Txt>
          </g>
        )}

        {heroView("blaze")}
        {heroView("spark")}

        {inFinale && <SafeBurst start={landF + 8} frame={frame} fps={fps} />}
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
              background: "linear-gradient(180deg, #FAFDFF, #E2F0FF)",
              border: "9px solid #FFFFFF",
              boxSizing: "border-box",
              opacity: abxPop * (1 - abxOut),
              boxShadow: `0 0 0 6px ${abxGlow}, 0 0 ${26 + 22 * sp}px ${6 + 8 * sp}px ${abxGlow}88, 0 ${14 + 10 * sp}px 0 rgba(20,32,50,0.4)`,
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
              filter: "drop-shadow(0 8px 10px rgba(20,32,50,0.4))",
            }}
          >
            <Abacus rods={rods} settle={abx.settle} scale={L.abxScale} colorOnArrival palette={RIG_BF4} placeLabelHalo chipInk="#1B2533" labelInk={["#A64B00", "#5E6A0E"]} />
          </div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 1 - abxOut }}>
            {abx.arrow && <BeadArrow box={ABX_BOX} rod={abx.arrow.rod} from={abx.arrow.from} to={abx.arrow.to} settle={abx.arrow.settle} />}
            {notEnough && (
              <g>
                <rect x={onesX - 56 * L.abxScale} y={abxTop(L) + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="none" stroke="#E5484D" strokeWidth={9} strokeDasharray="22 14" strokeDashoffset={-frame * 2.4} opacity={0.95} />
                <rect x={onesX - 56 * L.abxScale} y={abxTop(L) + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="#E5484D" opacity={0.13 + 0.08 * Math.sin(frame * 0.5)} />
              </g>
            )}
          </svg>
        </>
      ) : null}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {MISSIONS.map((mm2, i) => (
          <Celebration key={i} x={MACHINE_X} y={L.machineBase - 340 * L.machineScale} frame={frame} fps={fps} startFrame={wf(mm2.result, 5)} />
        ))}
        {[0, 1, 2].map((k) => (
          <Celebration key={`f${k}`} x={220 + k * 320} y={640 + (k % 2) * 160} frame={frame} fps={fps} startFrame={landF + 10 + k * 4} />
        ))}
      </svg>

      {overlayCaption && active && (
        <div style={{ position: "absolute", left: CAP.x, top: CAP.y, width: CAP.w, height: CAP.h, fontSize: capSize }}>
          <BF4Caption phrase={active.phrase} wordIdx={active.wordIdx} top={0} height={CAP.h} width={CAP.w} />
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
            background: `linear-gradient(180deg, rgba(27,37,51,0.95), rgba(14,22,34,0.97))`,
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
      <Audio src={staticFile("audio/short_math_heroes_bf4/short_math_heroes_bf4.mp3")} />
    </AbsoluteFill>
  );
};

void DRED;
void LIME;
void PLATE;
void SKY;
