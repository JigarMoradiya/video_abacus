// MATH HEROES — BIG FRIEND 2 (adding): a standalone 9:16 short. CLOSING TIME at the game hall: five
// minutes to the bell, and the big SCOREBOARD freezes mid-count. Same two heroes, but everything else is
// new next to bf1's arcade ticket counter: a dusk world in orange / teal / navy, a funny scoreboard
// character with an LED face, a wall clock that ticks a minute per mission and a brass closing bell, an
// LED-plate header, a ten-frame bulb intro (five pairs, five-and-five included), an octagon NO ROOM sign,
// a referee-whistle call, a stopwatch countdown, flip-tile friend bond and a teal friend-trick plate.
// The lesson layout is MIRRORED (panel left, abacus right), Spark is the coach (visor + stopwatch) and
// Blaze the referee (stripes + whistle), and the stuck hero is the one who makes the call.
//
// THE SCRIPT (docs/reel_math_heroes_bf2_lines.txt, final revision, verified word for word against the take):
//   intro   p0-p7    "Do you know a big friend? It's a pair of numbers that make ten! Six and four. Seven and three.
//                     Eight and two. Nine and one. Five and five! When the ones rod is too full to add, a big
//                     friend lets us use the tens rod!"
//   mission p8-p15   26 + 9   friend 1   -> 35   (alert / stuck / no room / call / friend / take away / answer / back)
//   mission p16-p23  65 + 5   friend 5   -> 70
//   mission p24-p30  67 + 8   friend 2   -> 75
//   mission p31-p38  79 + 6   friend 4   -> 85   (p38 is also the finale: the bell rings)
//   close   p39-p40  "Every stuck number has a trick. Learn them all with Abacus Kids..."
//
// THE BEAD MOVE ("Take away <friend>, then add ten!"), ones rod first, lower beads before the upper bead,
// then ONE bead carried to the tens rod. Every start was checked:
//   26 + 9 : ones 6 -> take 1 lower bead off -> 5 (the upper bead stays), tens 2 -> 3
//   65 + 5 : ones 5 (the upper bead only) -> take the UPPER bead off -> 0, tens 6 -> 7
//   67 + 8 : ones 7 -> take 2 lower beads off -> 5, tens 6 -> 7
//   79 + 6 : ones 9 -> take 4 lower beads off -> 5, tens 7 -> 8
//
// Layout (1080 x 1920), margins only: left 48, right 1032, top 56, bottom 1860 (named SAFE).

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/math_heroes_bf2.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { Abacus, type RodState } from "../components/Abacus";
import { BeadArrow } from "../stage/BeadArrow";
import type { AbacusBox } from "../stage/geometry";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Celebration } from "../components/heroes/Celebration";
import { BFHero, type BFMood, type BFName } from "../components/bf1/BFHero";
import { Scoreboard, type SBMood } from "../components/bf2/Scoreboard";
import { DuskWorld } from "../components/bf2/DuskWorld";
import { clamp01, easeOut, flashK, Txt } from "../components/bf1/Props";
import {
  AMBER,
  BF2Caption,
  BonkTile,
  ClosingBanner,
  ClosingBell,
  DEEP,
  FlipWord,
  FormulaPlate,
  FriendTiles,
  HeaderText,
  INK2,
  LedTag,
  NoRoomStop,
  ORANGE,
  PairHeader,
  ProgressStrip,
  ScoreHeader,
  Stopwatch,
  TenFrames,
  WallClock,
  WhistleCall,
} from "../components/bf2/Props2";
import { ABACUS_INNER_H, FRAME_LW, ROD_PITCH } from "../data/tokens";
import type { RigPalette } from "../data/theme";
import { KID_FONT } from "../lib/fonts";
import { HideTextStyle } from "../lib/hideText";

const PH = phrasesJson as unknown as TPhrase[];
export const BF2_AUDIO_SEC = 99.13;
export const FPS = 30;
export const BF2_DURATION = sec(BF2_AUDIO_SEC, FPS);
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
  dMid: number; // ones value after the LOWER beads are off (the upper bead may still be on)
  hasA: boolean; // lower beads come off
  hasB: boolean; // the upper bead comes off
  lead: number | null;
  stuck: number;
  noRoom: number;
  call: number;
  reveal: number;
  move: number;
  result: number;
  tail: number;
  aW: number;
  bW: number;
  stuckHero: BFName; // says the stuck line, makes the call, says the move line
  helper: BFName; // says no-room and the friend
  next: number;
  leadText: string | null;
  tailLabel: string;
}
const mk = (a: number, b: number, ph: Omit<Mission, "a" | "b" | "f" | "ans" | "t" | "d" | "r" | "dMid" | "hasA" | "hasB">): Mission => {
  const f = 10 - b;
  const d = a % 10;
  const r = d - f;
  const dMid = r >= 5 ? r : 5 + r;
  return { a, b, f, ans: a + b, t: Math.floor(a / 10), d, r, dMid, hasA: d > dMid, hasB: dMid > r, ...ph };
};
const MISSIONS: Mission[] = [
  mk(26, 9, { lead: 8, stuck: 9, noRoom: 10, call: 11, reveal: 12, move: 13, result: 14, tail: 15, aW: 0, bW: 2, stuckHero: "spark", helper: "blaze", next: 16, leadText: "BELL IN 5 MIN!", tailLabel: "BACK ON!" }),
  mk(65, 5, { lead: 16, stuck: 17, noRoom: 18, call: 19, reveal: 20, move: 21, result: 22, tail: 23, aW: 0, bW: 2, stuckHero: "blaze", helper: "spark", next: 24, leadText: "ANOTHER ONE!", tailLabel: "GO, GO!" }),
  mk(67, 8, { lead: null, stuck: 24, noRoom: 25, call: 26, reveal: 27, move: 28, result: 29, tail: 30, aW: 0, bW: 2, stuckHero: "spark", helper: "blaze", next: 31, leadText: null, tailLabel: "ALMOST!" }),
  mk(79, 6, { lead: 31, stuck: 32, noRoom: 33, call: 34, reveal: 35, move: 36, result: 37, tail: 38, aW: 0, bW: 2, stuckHero: "blaze", helper: "spark", next: 38, leadText: "LAST ONE!", tailLabel: "" }),
];
const missionAt = (p: number): Mission | null => {
  for (const m of MISSIONS) if (p >= (m.lead ?? m.stuck) && p <= m.tail) return m;
  return null;
};

const FINALE = 38; // "Bell's ringing, we made it!" (also the last mission's tail)
const MOTTO = 39;
const CLOSE = 40;
const LAST_INTRO = 7;

// ---------------------------------------------------------------- layout: margins, two layouts, one split
// SAFE AREA = small margins only: nothing touches the extreme edges. The caption stays at the bottom like
// the other shorts, the logo top-right, "powered by" bottom-left (nudged in just enough).
export const SAFE = { left: 48, right: W - 48, top: 56, bottom: 1860 };
const SAFE_CX = (SAFE.left + SAFE.right) / 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SUM_STORY = { x: 100, y: 128, w: 880, h: 162 }; // the design size of the header plate (design centre x = 540)
const SUM_K = 1.05;
const SUM_Y = 130;
const BANNER_W = 699; // "CLOSING TIME!" plate width at design scale (text + padding), see ClosingBanner
const BANNER_K = 0.6;
const BANNER_H = 92;
const BADGE_TF = { dx: -28, dy: 38 };
const BADGE = { x: 874 + BADGE_TF.dx, y: 18 + BADGE_TF.dy, w: 186, h: 66 };
const CREDIT_TF = { dx: 22, dy: -50 };
const CREDIT = { x: 26 + CREDIT_TF.dx, y: 1864 + CREDIT_TF.dy, w: 300, h: 44 };
const PROG = { x: 480, y: 64, w: 335, h: 48 }; // clock + four bulbs + bell, top row between the banner and the logo
const CAP = { x: SAFE.left, y: 1684, w: SAFE.right - SAFE.left, h: 126 };
const ZONE_BOTTOM = CAP.y - 8;
const ABX_FIT = 0.85;
const ABX_TOTAL_H = ABACUS_INNER_H + FRAME_LW * 2 + 105;
const cardWFor = (S: number) => (2 * ROD_PITCH + FRAME_LW * 2) * S + 32;
const scaleForTop = (top: number) => (ZONE_BOTTOM - top - 28) / ABX_TOTAL_H;
const SB = { halfW: 270, up: 500 }; // the scoreboard's local box

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
// MIRRORED composition: Spark (coach) stands on the LEFT, Blaze (referee) on the RIGHT
const STORY_LAY = mkLay({ s: 0, counterY: 600, signA: 1, ms: 0.56, hs: 0.85, sparkX: 170, blazeX: 910, zoneTop: 622 });
const LESSON_LAY = mkLay({ s: 1, counterY: 556, signA: 0, ms: 0.49, hs: 0.72, sparkX: 150, blazeX: 930, zoneTop: 578 });
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
// derived geometry: the abacus card is on the RIGHT, the panel on the LEFT
const cardX = (L: Lay) => SAFE.right - cardWFor(L.abxScale);
const abxLeft = (L: Lay) => cardX(L) + 16;
const abxTop = (L: Lay) => L.cardTop + 14;
const panelOf = (L: Lay) => ({ x: SAFE.left, y: L.zoneTop, w: cardX(L) - 16 - SAFE.left, h: ZONE_BOTTOM - L.zoneTop });
const MACHINE_X = SAFE_CX;
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
  const P = panelOf(L);
  const boxes: Box[] = [
    { label: "badge", ...BADGE },
    { label: "header", x: SAFE_CX - (SUM_STORY.w * SUM_K) / 2, y: SUM_Y, w: SUM_STORY.w * SUM_K, h: SUM_STORY.h * SUM_K },
    { label: "scoreboard", x: MACHINE_X - SB.halfW * ms, y: L.machineBase - SB.up * ms, w: SB.halfW * 2 * ms, h: SB.up * ms + 4 },
    { ...hero(L.blazeX), label: "blaze" },
    { ...hero(L.sparkX), label: "spark" },
    { label: "abacus", ...cardOf(L) },
    { label: "panel", ...P },
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
      throw new Error(`bf2 layout (${tag}): ${b.label} leaves the safe area`);
    }
  }
  if (!overlaps) return;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
        throw new Error(`bf2 layout (${tag}): ${a.label} overlaps ${b.label}`);
      }
    }
  }
};
checkBoxes(boxesFor(layoutAt(0)), "story");
checkBoxes(boxesFor(layoutAt(1)), "lesson");
checkBoxes(boxesFor(layoutAt(0.5)), "mid", false);
console.log("bf2 lesson abacus scale", LESSON_LAY.abxScale.toFixed(3), "panel", JSON.stringify(panelOf(LESSON_LAY)));

// ---------------------------------------------------------------- the focus split, per phrase
// STORY for the hook's first words, the alert/stuck lines, the result and tail, and the finale (the fun comes
// forward); LESSON from the first pair through the intro and from "no room" through the call, the countdown,
// the friend bond and the formula + moves.
const FOCUS_KEYS: { f: number; to: number }[] = (() => {
  const k: { f: number; to: number }[] = [{ f: 0, to: 0 }, { f: fs(2), to: 1 }];
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

// a teal-and-sunshine palette for the abacus: teal frame, cream panel, sunny beads that are ON
const RIG_BF2: RigPalette = {
  woodLight: "#5BE8D8",
  wood: "#19C2B8",
  woodDark: "#0E8A86",
  panel: "#FFF8E7",
  panelEdge: "#9AEBE2",
  rod: "#8B6B3A",
  beam: "#FF8A1F",
  onTop: "#FFE27A",
  onBottom: "#FFB020",
  onEdge: "#B8650B",
  offTop: "#DCE6FF",
  offBottom: "#AEBDF0",
  offEdge: "#6E80C4",
};

// ---------------------------------------------------------------- the bead move (3 phases, some may be empty)
interface Phase { start: number; end: number }
const phasesFor = (m: Mission): { A: Phase; B: Phase; C: Phase } => {
  const mv = m.move;
  const A: Phase = m.hasA
    ? { start: wf(mv, 0) + 4, end: m.hasB ? wf(mv, 2) + 6 : wef(mv, 2) + 2 }
    : { start: wf(mv, 1), end: wf(mv, 1) };
  const B: Phase = m.hasB ? { start: A.end, end: Math.max(A.end + 9, wef(mv, 2) + 2) } : { start: A.end, end: A.end };
  const C: Phase = { start: wf(mv, 4), end: wf(mv, 5) + 8 };
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
  // intro demo: 9 on the ones rod is full; the big friend carries it to the tens rod on the last line
  if (p <= LAST_INTRO) {
    const A = { start: wf(7, 10) + 2, end: wf(7, 12) + 4 };
    const B = { start: A.end, end: A.end + 10 };
    const C = { start: wf(7, 16), end: wf(7, 16) + 12 };
    return stateFrom(frame, A, B, C, 9, 0, 5, 0, 0, 1);
  }
  const m = missionAt(p);
  if (!m) {
    const last = MISSIONS[3];
    return { ones: { value: last.r, from: last.r }, tens: { value: last.t + 1, from: last.t + 1 }, settle: 1, arrow: null };
  }
  const { A, B, C } = phasesFor(m);
  if (frame < fs(m.stuck)) {
    const prev = MISSIONS[MISSIONS.indexOf(m) - 1];
    if (prev) return { ones: { value: prev.r, from: prev.r }, tens: { value: prev.t + 1, from: prev.t + 1 }, settle: 1, arrow: null };
    return { ones: { value: 9, from: 9 }, tens: { value: 0, from: 0 }, settle: 1, arrow: null };
  }
  return stateFrom(frame, A, B, C, m.d, m.t, m.dMid, m.r, m.t, m.t + 1);
};

/** the shared three-phase machine: A lower beads off, B upper bead off, C one bead onto the tens rod */
function stateFrom(frame: number, A: Phase, B: Phase, C: Phase, d0: number, t0: number, dMid: number, r: number, t1: number, t2: number): AbxState {
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
  // before the carry the A-phase arrow for an empty first phase would sit on the wrong beads
  if (frame < A.start && d0 === dMid) arrow = null;
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
  // ---- intro: Spark asks, Blaze counts the five pairs, Spark explains the full ones rod
  push(fs(0), sp ? "point" : "think", sp);
  push(fs(1), sp ? "point" : "grin", sp);
  for (let pp = 2; pp <= 6; pp++) push(fs(pp), sp ? "grin" : "point", !sp);
  push(fs(6), sp ? "cheer" : "cheer", !sp);
  push(fs(7), sp ? "think" : "grin", sp);
  push(wf(7, 5), "shock", sp); // "too full"
  push(wf(7, 9), "cheer", sp); // "a big friend lets us"
  push(wf(7, 14), sp ? "point" : "grin", sp); // "use the tens rod"
  // ---- missions
  for (const m of MISSIONS) {
    const S = m.stuckHero === who;
    const H = m.helper === who;
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    if (m.lead !== null) push(fs(m.lead), m.lead === 8 ? (sp ? "shock" : "worry") : S ? "point" : "grin", S);
    push(fs(m.stuck), S ? "shock" : "think", S);
    push(stuckW, S ? "worry" : "shock", S);
    push(fs(m.noRoom), S ? "worry" : "point", H);
    push(fs(m.call), S ? "call" : "point", H); // the STUCK hero makes the call (whistle / stopwatch)
    push(fe(m.call) + 4, S ? "call" : "think", false);
    push(fs(m.reveal), S ? "think" : "cheer", H);
    push(wf(m.reveal, 3), S ? "cheer" : "cheer", H);
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

const boardSegs = (): Seg<SBMood>[] => {
  const s: Seg<SBMood>[] = [{ f: 0, mood: "cool" }];
  for (const m of MISSIONS) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    s.push({ f: fs(m.lead ?? m.stuck), mood: "alert" });
    s.push({ f: stuckW, mood: "freeze" });
    s.push({ f: wf(m.reveal, 3), mood: "gasp" });
    s.push({ f: fs(m.move), mood: "reboot" });
    s.push({ f: fs(m.result), mood: "cheer" });
    s.push({ f: fs(m.tail) + 18, mood: m === MISSIONS[3] ? "cheer" : "cool" });
  }
  return s;
};
const BOARD_SEGS = boardSegs();

// the clock ticks a minute per mission (5:55 at the hook), then jumps to 6:00 for the bell
const CLOCK_TICKS: { f: number; v: number }[] = [
  { f: fs(15), v: 56 },
  { f: fs(23), v: 57 },
  { f: fs(30), v: 58 },
  { f: wf(FINALE, 1), v: 60 },
];
const minuteAt = (frame: number): number => {
  let v = 55;
  for (const tk of CLOCK_TICKS) {
    const u = clamp01((frame - tk.f) / 10);
    const e = u < 1 ? 1 - Math.pow(1 - u, 3) + 0.12 * Math.sin(u * Math.PI) : 1;
    if (u <= 0) break;
    v = lerp(v, tk.v, e);
    if (u < 1) break;
  }
  return v;
};

// ---------------------------------------------------------------- SFX cues
type SfxCue = { frame: number; file: string; vol: number; len?: number };
const buildCues = (): SfxCue[] => {
  const c: SfxCue[] = [];
  const add = (frame: number, file: string, vol: number, len = 60) => c.push({ frame, file, vol, len });
  add(3, "bf2_whistle.mp3", 0.4, 30); // the kick-off whistle on the hook
  add(wf(1, 7), "friend_sparkle.mp3", 0.3, 40); // "ten"
  for (let pp = 2; pp <= 6; pp++) {
    add(fs(pp) + 2, "bf2_flip.mp3", 0.35, 30);
    add(wf(pp, 2), "bf2_pop.mp3", 0.4, 20);
  }
  add(wf(7, 5), "boing.mp3", 0.4, 30); // "too full"
  add(wf(7, 10) + 2, "bead_subtract.mp3", 0.4, 40);
  add(wf(7, 12) + 4, "bead_upper_swap.mp3", 0.4, 30);
  add(wf(7, 16), "count_carry.mp3", 0.45, 50);
  for (const m of MISSIONS) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    if (m.lead === 8) {
      add(fs(8), "bf2_buzzer.mp3", 0.35, 40);
      add(wf(8, 3), "bf2_bell.mp3", 0.5, 70); // "bell"
    }
    if (m.lead === 16) add(fs(16), "bf2_flip.mp3", 0.35, 30);
    if (m.lead === 31) {
      add(fs(31), "bf2_flip.mp3", 0.3, 30);
      add(wf(31, 4), "bf2_bell.mp3", 0.45, 70);
    }
    add(fs(m.stuck), "bf2_pop.mp3", 0.35, 20);
    add(stuckW, "bf2_glitch.mp3", 0.55, 50);
    add(stuckW + 5, "bf2_thunk.mp3", 0.5, 30);
    add(fs(m.noRoom) + 2, "boing.mp3", 0.38, 30);
    add(fs(m.call), "bf2_whistle.mp3", 0.5, 40);
    const c0 = fe(m.call) + 5;
    add(c0, "bf2_stopwatch.mp3", 0.45, 20);
    [0, 30, 60].forEach((k, i) => add(c0 + k, "bf2_tock.mp3", i % 2 === 0 ? 0.55 : 0.45, 15));
    add(wf(m.reveal, 3) - 3, "bf2_gasp.mp3", 0.5, 25);
    add(wf(m.reveal, 3), "friend_sparkle.mp3", 0.5, 40);
    add(fs(m.reveal), "hero_call.mp3", 0.2, 20);
    const ph = phasesFor(m);
    if (m.hasA) add(ph.A.start, "bead_subtract.mp3", 0.45, 40);
    if (m.hasB) add(ph.B.start + 1, "bead_upper_swap.mp3", 0.42, 30);
    add(ph.C.start + 2, "count_carry.mp3", 0.5, 50);
    add(fs(m.result), "bf2_on.mp3", 0.34, 50);
    add(wf(m.result, 4), "mission_solved.mp3", 0.42, 40);
    add(wf(m.result, 4) + 2, "bf2_flip.mp3", 0.28, 30);
    add(wf(m.result, 4) + 4, "bf2_cheer.mp3", 0.26, 60);
    if (m !== MISSIONS[3]) {
      add(fs(m.tail), "bf2_tock.mp3", 0.5, 15);
      add(fs(m.tail) + 8, "bf2_tock.mp3", 0.4, 15);
    }
  }
  add(fs(FINALE) - 6, "bf2_off.mp3", 0.5, 45);
  add(wf(FINALE, 1), "bf2_bell.mp3", 0.5, 90);
  add(wf(FINALE, 1) + 4, "bf2_cheer.mp3", 0.34, 70);
  add(fs(MOTTO), "bf2_pop.mp3", 0.35, 20);
  add(fs(CLOSE) + 4, "cta_pop.mp3", 0.45, 30);
  return c;
};
const CUES = buildCues();

// ---------------------------------------------------------------- the reel
const STORE_START = fs(CLOSE);
const STORE_FRAMES = 92;

const KIT: Record<BFName, { kit: "ref" | "coach"; palette: Record<string, string> }> = {
  blaze: { kit: "ref", palette: { body: "#F4F1EA", belly: "#FFE3A3", cape: "#FF7A1A", shoe: "#10183A" } },
  spark: { kit: "coach", palette: { body: "#19C2B8", belly: "#FFF4DC", cape: "#FF8A1F", hairA: "#FF8A1F", hairB: "#FFC93C", shoe: "#0E5A66" } },
};

export const ShortMathHeroesBF2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const track = useMemo(() => makeTrack(PH, BF2_AUDIO_SEC, FPS), []);
  const active = track.activeAt(frame);
  const p = active ? active.phrase.index : 0;
  const m = missionAt(p);
  const inIntro = p <= LAST_INTRO;
  const inFinale = p >= FINALE;

  // ---------------------------------------------------------------- the focus split and the layout
  const sp = splitAt(frame);
  const L0 = layoutAt(sp);
  // the finale: the ledge drops so the scoreboard and the heroes can be big and the bell can hang above
  const finK = inFinale ? easeOut(clamp01((frame - (fs(FINALE) - 6)) / 12)) : 0;
  const L: Lay = {
    ...L0,
    counterY: lerp(L0.counterY, 1060, finK),
    machineBase: lerp(L0.machineBase, 1056, finK),
    machineScale: lerp(L0.machineScale, 0.92, finK),
    heroScale: lerp(L0.heroScale, 1.0, finK),
    heroY: lerp(L0.heroY, 1060, finK),
    blazeX: lerp(L0.blazeX, 900, finK),
    sparkX: lerp(L0.sparkX, 180, finK),
  };
  if (finK < 0.001) checkBoxes(boxesFor(L), `f${frame}`, sp < 0.001 || sp > 0.999);
  const ABX_BOX = abxBoxOf(L);
  const card = cardOf(L);
  const panel = panelOf(L);
  const calmHero = 1 - 0.7 * sp * (1 - finK);

  const burst = Math.max(...MISSIONS.map((mm) => pulseAt(frame, wf(mm.result, 4), 40)), pulseAt(frame, wf(FINALE, 1), 70));

  // lights-out gag in the finale: the hall goes dark just before the bell, and the ring turns everything back on
  const lightsOutAt = fs(FINALE) - 4;
  const bellAt = wf(FINALE, 1);
  const lights = inFinale
    ? frame < lightsOutAt
      ? 1
      : frame < bellAt
        ? 1 - 0.88 * clamp01((frame - lightsOutAt) / 5)
        : 0.12 + 0.88 * clamp01((frame - bellAt) / 5)
    : 1;
  const bellRing = (() => {
    const b = [
      [wf(8, 3), 40],
      [wf(31, 4), 40],
    ] as [number, number][];
    let r = 0;
    for (const [f, len] of b) if (frame >= f && frame < f + len) r = Math.max(r, 1 - (frame - f) / len);
    if (inFinale && frame >= bellAt) r = 1;
    return r;
  })();

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
    if (p === 0) headerView = <HeaderText x={HX} y={HY} w={HW} h={HH} text="WHO'S A BIG FRIEND?" size={62} appear={ap} frame={frame} fps={fps} />;
    else if (p === 1) headerView = <HeaderText x={HX} y={HY} w={HW} h={HH} text="A PAIR THAT MAKES 10!" size={56} appear={ap} frame={frame} fps={fps} />;
    else if (p >= 2 && p <= 6) {
      const [l, r] = [[6, 4], [7, 3], [8, 2], [9, 1], [5, 5]][p - 2];
      headerView = <PairHeader x={HX} y={HY} w={HW} h={HH} l={l} r={r} flashL={flashK(frame, wf(p, 0))} flashR={flashK(frame, wf(p, 2))} appear={ap} frame={frame} fps={fps} />;
    } else headerView = <HeaderText x={HX} y={HY} w={HW} h={HH} text="ONES FULL? USE TENS!" size={56} appear={ap} frame={frame} fps={fps} />;
  } else if (m && !inFinale) {
    const leadOn = m.lead !== null && frame >= fs(m.lead) && frame < fs(m.stuck);
    const next = m.next;
    const leave = frame > fs(next) - 8 ? clamp01((frame - (fs(next) - 8)) / 8) : 0;
    if (leadOn && m.leadText) {
      const ap = clamp01((frame - fs(m.lead as number)) / 10);
      headerView = (
        <g transform={`translate(0 ${-leave * 230})`}>
          <HeaderText x={HX} y={HY} w={HW} h={HH} text={m.leadText} size={m.leadText.length > 12 ? 62 : 72} appear={ap} frame={frame} fps={fps} />
        </g>
      );
    } else if (frame >= fs(m.stuck) && leave < 1) {
      const sw = findWord(m.stuck, "stuck");
      const solvedF = wf(m.result, 4);
      headerView = (
        <g transform={`translate(0 ${-leave * 230})`}>
          <ScoreHeader
            x={HX}
            y={HY}
            w={HW}
            h={HH}
            a={m.a}
            b={m.b}
            answer={m.ans}
            showAnswer={clamp01((frame - solvedF) / 10)}
            flashA={Math.max(flashK(frame, wf(m.stuck, m.aW)), flashK(frame, wf(m.result, 0)))}
            flashB={Math.max(flashK(frame, wf(m.stuck, m.bW)), flashK(frame, wf(m.result, 2)))}
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

  // ---------------------------------------------------------------- the scoreboard character
  const bm = moodAt(BOARD_SEGS, frame);
  let score = "00";
  let scoreMode: "normal" | "freeze" | "answer" = "normal";
  let ice = 0;
  if (m) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    score = String(m.a);
    if (frame >= fs(m.result)) {
      score = String(m.ans);
      scoreMode = "answer";
    } else if (frame >= stuckW && frame < fs(m.move)) {
      scoreMode = "freeze";
      ice = clamp01((frame - stuckW) / 8) * (1 - clamp01((frame - wf(m.reveal, 3)) / 10));
    }
  }
  const boardBounce = m ? bounceAt(frame, wf(m.result, 4), 40) : { hop: 0, squash: 0 };
  const jamSquash = m ? bounceAt(frame, wf(m.stuck, findWord(m.stuck, "stuck")), 14) : { hop: 0, squash: 0 };

  // ---------------------------------------------------------------- the panel (positions as fractions of the panel rect)
  const px = panel.x;
  const py = panel.y;
  const pw = panel.w;
  const ph = panel.h;
  const cx = px + pw / 2;
  const midY = py + ph / 2;
  const minute = minuteAt(frame);
  let panelView: React.ReactNode = null;
  if (inIntro) {
    if (p <= 1) {
      panelView = <WallClock cx={cx} cy={midY - 27} minute={55} k={clamp01((frame - 4) / 14)} frame={frame} fps={fps} r={150} />;
    } else {
      const rows = [2, 3, 4, 5, 6].map((pp) => clamp01((frame - fs(pp)) / 10));
      const flashes: [number, number][] = [2, 3, 4, 5, 6].map((pp) => [flashK(frame, wf(pp, 0)), flashK(frame, wf(pp, 2))]);
      panelView = (
        <g>
          <LedTag cx={cx} cy={py + 0.045 * ph} text="PAIRS THAT MAKE 10!" size={38} maxW={pw - 8} k={clamp01((frame - fs(2)) / 12)} />
          <TenFrames x={px} y={py + 0.1 * ph} w={pw} rowH={(0.88 * ph) / 5} rows={rows} flashes={flashes} frame={frame} fps={fps} />
        </g>
      );
    }
  } else if (m && !inFinale) {
    const callEnd = fe(m.call);
    const c0 = callEnd + 5;
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
    const fFlash = Math.max(flashK(frame, wf(m.reveal, 3)), flashK(frame, wf(m.move, 2)));
    const BOND_H = 246;
    const FORM_H = 190;
    const groupTop = midY - (BOND_H + 24 + FORM_H) / 2;
    const bondCy = groupTop + 110;
    const formulaY = groupTop + BOND_H + 24;
    panelView = (
      <g>
        {showLead && <WallClock cx={cx} cy={midY - 27} minute={minute} k={clamp01((frame - fs(m.lead as number)) / 12)} frame={frame} fps={fps} r={150} glow={m.lead === 8 || m.lead === 31 ? 1 : 0} />}
        {showBonk && <BonkTile x0={px + 0.78 * pw} x1={px + 0.2 * pw} cy={midY} label={`+${m.b}`} start={fs(m.stuck) + 6} frame={frame} />}
        {showNoRoom && (
          <g transform={`translate(${cx} ${midY}) scale(1.25) translate(${-cx} ${-midY})`}>
            <NoRoomStop cx={cx} cy={midY} text={`NO ROOM FOR ${m.b}!`} k={noRoomK} frame={frame} fps={fps} />
          </g>
        )}
        {showCall && (
          <g transform={`translate(${cx} ${midY - 30}) scale(1.3) translate(${-cx} ${-(midY - 30)})`}>
            <WhistleCall cx={cx} cy={midY - 30} k={clamp01((frame - fs(m.call)) / 18)} frame={frame} fps={fps} />
          </g>
        )}
        {showCount && (
          <g transform={`translate(${cx} ${midY}) scale(1.2) translate(${-cx} ${-midY})`}>
            <Stopwatch cx={cx} cy={midY} n={countN} k={clamp01((frame - countStart) / 28)} frame={frame} fps={fps} />
          </g>
        )}
        {showBond && (
          <FriendTiles
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
          <FormulaPlate
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
            <WallClock cx={cx} cy={midY - 82} minute={minute} k={1} frame={frame} fps={fps} r={150} />
            <FlipWord cx={cx} cy={midY + 250} text={m.tailLabel} k={clamp01((frame - fs(m.tail) - 6) / 24)} maxW={pw - 20} />
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
  const abxGlow = solved ? "#8CF05A" : stuckNow ? "#FF5A4D" : "#19C2B8";
  const abxPop = inIntro ? easeOut(clamp01((frame - 6) / 14)) : 1;
  const abxOut = inFinale ? clamp01((frame - fs(FINALE)) / 6) : 0;
  const noRoomOnes = (m && frame >= fs(m.noRoom) && frame < fs(m.call)) || (p === 7 && frame >= wf(7, 5) && frame < wf(7, 9));
  const onesX = ABX_BOX.innerLeft + 1.5 * ROD_PITCH * L.abxScale;

  // ---------------------------------------------------------------- the heroes
  const heroView = (name: BFName) => {
    const segs = name === "blaze" ? BLAZE_SEGS : SPARK_SEGS;
    const moodInfo = moodAt(segs.segs, frame);
    const talkInfo = moodAt(segs.talk, frame);
    const x = name === "blaze" ? L.blazeX : L.sparkX;
    const facing: 1 | -1 = name === "blaze" ? -1 : 1; // both face the middle
    let hop = 0;
    let squash = 0;
    const events: [number, number][] = [];
    if (m) {
      const S = m.stuckHero === name;
      events.push([wf(m.stuck, findWord(m.stuck, "stuck")), S ? 46 : 22]);
      events.push([fs(m.call), S ? 40 : 0]);
      events.push([wf(m.reveal, 3), m.helper === name ? 70 : 24]);
      events.push([wf(m.result, 4), 80]);
      events.push([fs(m.tail), 40]);
    }
    events.push([wf(7, 5), 28], [wf(7, 9), 60], [bellAt, 90]);
    if (inIntro) [2, 3, 4, 5, 6].forEach((pp) => events.push([wf(pp, 2), 30]));
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
  const doneCount = MISSIONS.filter((mi2) => frame >= wf(mi2.result, 4)).length;
  const pulses = MISSIONS.map((mi2) => pulseAt(frame, wf(mi2.result, 4), 20));

  // ---------------------------------------------------------------- finale / motto
  const finaleIn = inFinale ? clamp01((frame - fs(FINALE)) / 8) : 0;
  const overlayCaption = p !== CLOSE;
  const capSize = active ? (active.phrase.text.length > 60 ? 44 : active.phrase.text.length > 36 ? 50 : 58) : 56;

  return (
    <AbsoluteFill style={{ background: "#14224D" }}>
      <HideTextStyle />
      {/* the world: desaturated and washed while the lesson is the focus, full colour for the fun beats */}
      <div style={{ position: "absolute", inset: 0, filter: `saturate(${1 - 0.5 * sp * (1 - finK)}) brightness(${1 + 0.04 * sp})` }}>
        <DuskWorld width={W} height={H} frame={frame} fps={fps} burst={burst} counterY={L.counterY} calm={sp * (1 - finK)} lights={lights} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(10,24,64,${0.34 * sp * (1 - finK) + 0.5 * (1 - lights)})` }} />

      {/* ---------------- the mid layer: banner, header, scoreboard, panel, heroes ---------------- */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${SAFE.left} ${SAFE.top}) scale(${BANNER_K})`} opacity={L.signA}>
          <ClosingBanner x={0} y={0} w={830} h={BANNER_H} frame={frame} fps={fps} />
        </g>

        <g transform={sumTf}>{headerView}</g>

        {panelView}

        {/* the progress strip: a clock, four bulbs and the bell */}
        <g opacity={inFinale ? 1 - finaleIn : 1}>
          <ProgressStrip x={PROG.x} y={PROG.y} h={PROG.h} minute={minute} done={doneCount} pulses={pulses} bellRing={bellRing} frame={frame} fps={fps} />
        </g>

        {/* the big closing bell hangs above the cheering scoreboard in the finale */}
        {inFinale && finaleIn > 0 && (
          <g opacity={finaleIn}>
            <ClosingBell cx={SAFE_CX} cy={330 - (1 - finK) * 60} scale={1.5} swing={frame >= bellAt ? 1 : 0.1} frame={frame} fps={fps} ring={frame >= bellAt ? clamp01(1 - (frame - bellAt) / 70) : 0} />
          </g>
        )}

        <Scoreboard
          x={MACHINE_X}
          y={L.machineBase}
          scale={L.machineScale}
          mood={inFinale ? (frame >= bellAt ? "cheer" : "gasp") : bm.mood}
          moodFrame={inFinale && frame >= bellAt ? bellAt : bm.since}
          frame={frame}
          fps={fps}
          score={inFinale ? "85" : score}
          scoreMode={inFinale ? "answer" : scoreMode}
          squash={(boardBounce.squash + jamSquash.squash * 0.6) * calmHero}
          hop={boardBounce.hop * L.machineScale * calmHero}
          ice={inFinale ? 0 : ice}
          lights={lights}
        />

        {p === MOTTO && (
          <g transform="translate(540 1420)">
            <rect x={-400} y={-80} width={800} height={160} rx={30} fill={ORANGE} stroke={INK2} strokeWidth={8} />
            <rect x={-384} y={-64} width={768} height={128} rx={20} fill={DEEP} />
            <Txt x={0} y={-6} size={44} fill="#FFFFFF" stroke={INK2} sw={0} spacing={1}>EVERY STUCK NUMBER</Txt>
            <Txt x={0} y={44} size={52} fill={AMBER} stroke={INK2} sw={0} spacing={1}>HAS A TRICK!</Txt>
          </g>
        )}

        {/* the heroes */}
        {heroView("spark")}
        {heroView("blaze")}
      </svg>

      {/* ---------------- the lesson card + the two-rod floating abacus ---------------- */}
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
              background: "linear-gradient(180deg, #FFFDF4, #FFEFC9)",
              border: "9px solid #FFFFFF",
              boxSizing: "border-box",
              opacity: abxPop * (1 - abxOut),
              boxShadow: `0 0 0 6px ${abxGlow}, 0 0 ${26 + 22 * sp}px ${6 + 8 * sp}px ${abxGlow}88, 0 ${14 + 10 * sp}px 0 rgba(8,16,48,0.4)`,
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
              filter: "drop-shadow(0 8px 10px rgba(8,16,48,0.4))",
            }}
          >
            <Abacus rods={rods} settle={abx.settle} scale={L.abxScale} colorOnArrival palette={RIG_BF2} placeLabelHalo chipInk="#10183A" labelInk={["#A64B00", "#5E6A0E"]} />
          </div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 1 - abxOut }}>
            {abx.arrow && <BeadArrow box={ABX_BOX} rod={abx.arrow.rod} from={abx.arrow.from} to={abx.arrow.to} settle={abx.arrow.settle} />}
            {noRoomOnes && (
              <g>
                <rect x={onesX - 56 * L.abxScale} y={abxTop(L) + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="none" stroke="#FF5A4D" strokeWidth={9} strokeDasharray="22 14" strokeDashoffset={-frame * 2.4} opacity={0.95} />
                <rect x={onesX - 56 * L.abxScale} y={abxTop(L) + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="#FF5A4D" opacity={0.13 + 0.08 * Math.sin(frame * 0.5)} />
              </g>
            )}
          </svg>
        </>
      ) : null}

      {/* ---------------- confetti on top of everything ---------------- */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {MISSIONS.map((mm2, i) => (
          <Celebration key={i} x={MACHINE_X} y={L.machineBase - 320 * L.machineScale} frame={frame} fps={fps} startFrame={wf(mm2.result, 4)} />
        ))}
        {[0, 1, 2].map((k) => (
          <Celebration key={`f${k}`} x={220 + k * 320} y={640 + (k % 2) * 160} frame={frame} fps={fps} startFrame={bellAt + k * 4} />
        ))}
      </svg>

      {/* ---------------- the caption ---------------- */}
      {overlayCaption && active && (
        <div style={{ position: "absolute", left: CAP.x, top: CAP.y, width: CAP.w, height: CAP.h, fontSize: capSize }}>
          <BF2Caption phrase={active.phrase} wordIdx={active.wordIdx} top={0} height={CAP.h} width={CAP.w} />
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
            background: "linear-gradient(180deg, rgba(16,28,71,0.94), rgba(10,18,50,0.97))",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={clamp01((frame - STORE_START) / Math.max(1, fe(CLOSE) - STORE_START))} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* brand furniture, nudged inside the margins */}
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
      <Audio src={staticFile("audio/short_math_heroes_bf2/short_math_heroes_bf2.mp3")} />
    </AbsoluteFill>
  );
};

// keep the font import referenced for tools that read this module's header
void KID_FONT;
