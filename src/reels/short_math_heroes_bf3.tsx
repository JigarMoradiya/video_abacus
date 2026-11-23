// MATH HEROES — BIG FRIEND 3 (TAKING AWAY): a standalone 9:16 short. THE PRIZE SHOP: the prize wall is
// almost empty and a stuck number blocks the last prize. A candy-bright world in mint, lemon and coral
// (a striped awning, a rainbow, a chalkboard for the lesson), a funny talking PRIZE WALL with a face that
// worries, gets a padlock on the jackpot box, gasps at the friend and RESTOCKS three prizes per solved
// mission, a jigsaw-piece intro and friend bond, a swinging NOT ENOUGH sign, a rotary phone, a lollipop
// countdown, a paper-receipt friend trick, starburst stickers and a balloon progress strip.
// Blaze is the shop assistant (party hat, striped apron, ticket roll) and Spark the host (top hat, bow
// tie, magic star wand). The lesson layout keeps the abacus on the LEFT with the panel on the right.
//
// THE SCRIPT (docs/reel_math_heroes_bf3_lines.txt, final revision, verified word for word against the take):
//   intro   p0-p7    "Here's a number secret! Big friends are pairs that make ten together. One and nine. Two and
//                     eight. Three and seven. Four and six. Five and five. When the ones rod does not have enough
//                     beads to take away, a big friend comes to help!"
//   mission p8-p15   85 - 6   friend 4   -> 79
//   mission p16-p22  60 - 1   friend 9   -> 59
//   mission p23-p29  96 - 8   friend 2   -> 88
//   mission p30-p37  72 - 3   friend 7   -> 69   (p37 is also the finale: the prize wall opens)
//   close   p38-p39  "Every stuck number has a trick. Learn them all with Abacus Kids..."
//
// THE BEAD MOVE ("Add <friend>, then take away ten!"): the friend is ADDED to the ones rod first (lower
// beads before the upper bead), then ONE bead comes off the tens rod. Every start was checked:
//   85 - 6 : ones 5 (the upper bead) +4 lower beads -> 9; tens 8 -> 7        = 79
//   60 - 1 : ones 0 +4 lower beads, then the upper bead -> 9; tens 6 -> 5    = 59
//   96 - 8 : ones 6 +2 lower beads -> 8; tens 9 -> 8                         = 88
//   72 - 3 : ones 2 +2 lower beads, then the upper bead -> 9; tens 7 -> 6    = 69
// The tens rod always loses a LOWER bead directly (8, 6, 9, 7 all have one).
//
// Layout (1080 x 1920), margins only: left 48, right 1032, top 56, bottom 1860 (named SAFE).

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/math_heroes_bf3.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { Abacus, type RodState } from "../components/Abacus";
import { BeadArrow } from "../stage/BeadArrow";
import type { AbacusBox } from "../stage/geometry";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Celebration } from "../components/heroes/Celebration";
import { BFHero, type BFMood, type BFName } from "../components/bf1/BFHero";
import { PrizeWall, type PWMood, RESTOCK_ORDER, SLOT_COUNT } from "../components/bf3/PrizeWall";
import { PrizeShopWorld } from "../components/bf3/PrizeShopWorld";
import { clamp01, easeOut, flashK, Txt } from "../components/bf1/Props";
import {
  BF3Caption,
  BalloonStrip,
  CHALK,
  CORAL,
  CRIM,
  CoinRain,
  CreamTag,
  FriendJigsaw,
  GumballBonk,
  HangingSign,
  INK3,
  JackpotTrophy,
  JigsawRows,
  LEMON,
  LollipopCount,
  MINT,
  PAPER,
  PairSign,
  PhoneCall,
  PrizeTag,
  Receipt,
  Sticker,
  SumSign,
  TextSign,
  prizeTagW,
} from "../components/bf3/Props3";
import { ABACUS_INNER_H, FRAME_LW, ROD_PITCH } from "../data/tokens";
import type { RigPalette } from "../data/theme";
import { HideTextStyle } from "../lib/hideText";

const PH = phrasesJson as unknown as TPhrase[];
export const BF3_AUDIO_SEC = 95.65;
export const FPS = 30;
export const BF3_DURATION = sec(BF3_AUDIO_SEC, FPS);
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
  caller: BFName; // makes the call (phone, wand)
  next: number;
  leadText: string | null;
  leadSticker: string | null;
  tailLabel: string;
}
const mk = (a: number, b: number, ph: Omit<Mission, "a" | "b" | "f" | "ans" | "t" | "d" | "v" | "dMid" | "hasB">): Mission => {
  const f = 10 - b;
  const d = a % 10;
  const v = d + f;
  const hasB = d < 5 && v >= 5;
  return { a, b, f, ans: a - b, t: Math.floor(a / 10), d, v, dMid: hasB ? 4 : v, hasB, ...ph };
};
const MISSIONS: Mission[] = [
  mk(85, 6, { lead: 8, stuck: 9, noRoom: 10, call: 11, reveal: 12, move: 13, result: 14, tail: 15, stuckHero: "blaze", helper: "spark", caller: "spark", next: 16, leadText: "PRIZE WALL ALERT!", leadSticker: "ALERT!", tailLabel: "ALL GOOD!" }),
  mk(60, 1, { lead: null, stuck: 16, noRoom: 17, call: 18, reveal: 19, move: 20, result: 21, tail: 22, stuckHero: "spark", helper: "blaze", caller: "spark", next: 23, leadText: null, leadSticker: null, tailLabel: "STEADY!" }),
  mk(96, 8, { lead: null, stuck: 23, noRoom: 24, call: 25, reveal: 26, move: 27, result: 28, tail: 29, stuckHero: "blaze", helper: "spark", caller: "spark", next: 30, leadText: null, leadSticker: null, tailLabel: "HANG ON!" }),
  mk(72, 3, { lead: 30, stuck: 31, noRoom: 32, call: 33, reveal: 34, move: 35, result: 36, tail: 37, stuckHero: "spark", helper: "blaze", caller: "blaze", next: 37, leadText: "LAST ONE!", leadSticker: "LAST ONE!", tailLabel: "" }),
];
const missionAt = (p: number): Mission | null => {
  for (const m of MISSIONS) if (p >= (m.lead ?? m.stuck) && p <= m.tail) return m;
  return null;
};

const FINALE = 37; // "Prize wall's open, jackpot!" (also the last mission's tail)
const MOTTO = 38;
const CLOSE = 39;
const LAST_INTRO = 7;

// ---------------------------------------------------------------- layout: margins, two layouts, one split
export const SAFE = { left: 48, right: W - 48, top: 56, bottom: 1860 };
const SAFE_CX = (SAFE.left + SAFE.right) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SUM_STORY = { x: 100, y: 128, w: 880, h: 162 };
const SUM_K = 1.05;
const SUM_Y = 130;
const TAG_K = 0.6;
const TAG_H = 92;
const TAG_W = prizeTagW();
const BADGE_TF = { dx: -28, dy: 38 };
const BADGE = { x: 874 + BADGE_TF.dx, y: 18 + BADGE_TF.dy, w: 186, h: 66 };
const CREDIT_TF = { dx: 22, dy: -50 };
const CREDIT = { x: 26 + CREDIT_TF.dx, y: 1864 + CREDIT_TF.dy, w: 300, h: 44 };
const PROG = { x: 420, y: 62, w: 322, h: 52 }; // four balloons + a gift box, top row between the tag and the logo
const CAP = { x: SAFE.left, y: 1684, w: SAFE.right - SAFE.left, h: 126 };
const ZONE_BOTTOM = CAP.y - 8;
const ABX_FIT = 0.85;
const ABX_TOTAL_H = ABACUS_INNER_H + FRAME_LW * 2 + 105;
const cardWFor = (S: number) => (2 * ROD_PITCH + FRAME_LW * 2) * S + 32;
const scaleForTop = (top: number) => (ZONE_BOTTOM - top - 28) / ABX_TOTAL_H;
const PWB = { halfW: 270, up: 546 }; // the prize wall's local box

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
const STORY_LAY = mkLay({ s: 0, counterY: 600, signA: 1, ms: 0.54, hs: 0.85, blazeX: 170, sparkX: 910, zoneTop: 622 });
const LESSON_LAY = mkLay({ s: 1, counterY: 556, signA: 0, ms: 0.45, hs: 0.72, blazeX: 150, sparkX: 930, zoneTop: 578 });
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
const WALL_X = SAFE_CX;
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
    { label: "prizewall", x: WALL_X - PWB.halfW * ms, y: L.machineBase - PWB.up * ms, w: PWB.halfW * 2 * ms, h: PWB.up * ms + 4 },
    { ...hero(L.blazeX), label: "blaze" },
    { ...hero(L.sparkX), label: "spark" },
    { label: "abacus", ...cardOf(L) },
    { label: "panel", ...panelOf(L) },
    { label: "progress", ...PROG },
    { label: "caption", ...CAP },
    { label: "credit", ...CREDIT },
  ];
  if (L.signA > 0.02) boxes.push({ label: "tag", x: SAFE.left, y: SAFE.top, w: TAG_W * TAG_K, h: TAG_H * TAG_K });
  return boxes;
};
const checkBoxes = (boxes: Box[], tag: string, overlaps = true) => {
  for (const b of boxes) {
    if (b.x < SAFE.left - 0.5 || b.y < SAFE.top - 0.5 || b.x + b.w > SAFE.right + 0.5 || b.y + b.h > SAFE.bottom + 0.5) {
      throw new Error(`bf3 layout (${tag}): ${b.label} leaves the safe area`);
    }
  }
  if (!overlaps) return;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
        throw new Error(`bf3 layout (${tag}): ${a.label} overlaps ${b.label}`);
      }
    }
  }
};
checkBoxes(boxesFor(layoutAt(0)), "story");
checkBoxes(boxesFor(layoutAt(1)), "lesson");
checkBoxes(boxesFor(layoutAt(0.5)), "mid", false);
console.log("bf3 lesson abacus scale", LESSON_LAY.abxScale.toFixed(3), "panel", JSON.stringify(panelOf(LESSON_LAY)));

// ---------------------------------------------------------------- the focus split, per phrase
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

// a violet-and-mint candy palette for the abacus: violet frame, cream panel, coral beads that are ON
const RIG_BF3: RigPalette = {
  woodLight: "#B7A2FF",
  wood: "#8E6CFF",
  woodDark: "#5B3FD0",
  panel: "#FFF8E7",
  panelEdge: "#D9CCFF",
  rod: "#8B6B3A",
  beam: "#41D8B0",
  onTop: "#FF9AA5",
  onBottom: "#FF5A6E",
  onEdge: "#A8203A",
  offTop: "#FFF6BF",
  offBottom: "#F2DD6B",
  offEdge: "#C9AE2E",
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
  // intro demo (85 - 6): the ones rod has only the upper bead; the big friend adds four, then a ten comes off the tens rod
  if (p <= LAST_INTRO) {
    const A = { start: wf(7, 13), end: wef(7, 15) };
    const B = { start: A.end, end: A.end };
    const C = { start: wf(7, 16), end: wef(7, 17) + 8 };
    return stateFrom(frame, A, B, C, 5, 8, 9, 9, 8, 7);
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
    return { ones: { value: 5, from: 5 }, tens: { value: 8, from: 8 }, settle: 1, arrow: null };
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
  // ---- intro (the narrator speaks): the heroes react to the secret and wave the pairs in, then worry at "not enough"
  push(fs(0), sp ? "think" : "grin");
  push(fs(1), sp ? "grin" : "point");
  for (let pp = 2; pp <= 6; pp++) push(fs(pp), (pp % 2 === 0) === sp ? "point" : "grin");
  push(fs(6), "cheer");
  push(fs(7), sp ? "grin" : "think");
  push(wf(7, 5), "worry"); // "does not have enough"
  push(wf(7, 12), "cheer"); // "a big friend comes"
  push(wf(7, 16), sp ? "point" : "grin"); // "to help"
  // ---- missions
  for (const m of MISSIONS) {
    const S = m.stuckHero === who;
    const H = m.helper === who;
    const C = m.caller === who;
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    if (m.lead !== null) push(fs(m.lead), m.lead === 8 ? (S ? "shock" : "worry") : S ? "point" : "grin", S);
    push(fs(m.stuck), S ? "shock" : "think", S);
    push(stuckW, S ? "worry" : "shock", S);
    push(fs(m.noRoom), S ? "worry" : "point", H);
    push(fs(m.call), C ? "call" : "point", H);
    push(fe(m.call) + 4, C ? "call" : "think", false);
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

const wallSegs = (): Seg<PWMood>[] => {
  const s: Seg<PWMood>[] = [{ f: 0, mood: "happy" }];
  s.push({ f: wf(7, 5), mood: "worry" });
  s.push({ f: wf(7, 12), mood: "happy" });
  for (const m of MISSIONS) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    s.push({ f: fs(m.lead ?? m.stuck), mood: "worry" });
    s.push({ f: stuckW, mood: "stuck" });
    s.push({ f: wf(m.reveal, 3), mood: "gasp" });
    s.push({ f: fs(m.move), mood: "think" });
    s.push({ f: wf(m.result, 5), mood: "cheer" });
    s.push({ f: fs(m.tail) + 20, mood: m === MISSIONS[3] ? "cheer" : "happy" });
  }
  return s;
};
const WALL_SEGS = wallSegs();

// the restock schedule: each solved mission pops its prizes onto the shelves, a few frames apart
const MISSION_STOCK: number[][] = [RESTOCK_ORDER.slice(0, 3), RESTOCK_ORDER.slice(3, 6), RESTOCK_ORDER.slice(6, 9), RESTOCK_ORDER.slice(9, 11)];
const POP_AT: number[] = (() => {
  const a = Array.from({ length: SLOT_COUNT }, () => Infinity);
  MISSIONS.forEach((m, i) => MISSION_STOCK[i].forEach((slot, j) => (a[slot] = wf(m.result, 5) + 8 + j * 6)));
  return a;
})();

// ---------------------------------------------------------------- SFX cues
type SfxCue = { frame: number; file: string; vol: number; len?: number };
const buildCues = (): SfxCue[] => {
  const c: SfxCue[] = [];
  const add = (frame: number, file: string, vol: number, len = 60) => c.push({ frame, file, vol, len });
  add(3, "bf3_shimmer.mp3", 0.4, 50);
  add(wf(1, 6), "friend_sparkle.mp3", 0.3, 40);
  for (let pp = 2; pp <= 6; pp++) add(wf(pp, 2), "bf3_snap.mp3", 0.45, 30);
  add(wf(7, 5), "boing.mp3", 0.4, 30);
  add(A_DEMO_START, "bead_add.mp3", 0.4, 40);
  add(wf(7, 16) + 2, "bead_subtract.mp3", 0.45, 50);
  for (const m of MISSIONS) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    if (m.lead === 8) {
      add(fs(8), "bf3_horn.mp3", 0.3, 30);
      add(fs(8) + 6, "bf3_rattle.mp3", 0.4, 40);
    }
    if (m.lead === 30) add(fs(30), "bf3_squeak.mp3", 0.4, 20);
    add(fs(m.stuck), "bf3_squeak.mp3", 0.25, 20);
    add(stuckW, "bf3_lock.mp3", 0.55, 30);
    add(stuckW + 2, "bf3_rattle.mp3", 0.3, 40);
    add(stuckW + 10, "bf3_sad.mp3", 0.28, 60);
    add(fs(m.noRoom) + 2, "boing.mp3", 0.36, 30);
    add(fs(m.call), "bf3_ring.mp3", 0.45, 50);
    const c0 = fe(m.call) + 5;
    add(c0 - 2, "bf3_wind.mp3", 0.4, 20);
    [0, 30, 60].forEach((k) => add(c0 + k, "bf3_tick.mp3", 0.55, 15));
    add(wf(m.reveal, 3) - 3, "bf3_gasp.mp3", 0.5, 25);
    add(wf(m.reveal, 3), "friend_sparkle.mp3", 0.5, 40);
    const ph = phasesFor(m);
    add(ph.A.start, "bead_add.mp3", 0.45, 40);
    if (m.hasB) add(ph.B.start + 1, "bead_upper_swap.mp3", 0.42, 30);
    add(ph.C.start + 2, "bead_subtract.mp3", 0.5, 50);
    add(wf(m.result, 5), "bf3_register.mp3", 0.3, 60);
    add(wf(m.result, 5) + 2, "mission_solved.mp3", 0.3, 40);
    MISSION_STOCK[MISSIONS.indexOf(m)].forEach((slot) => add(POP_AT[slot], "bf3_restock.mp3", 0.3, 25));
    if (m !== MISSIONS[3]) add(fs(m.tail) + 4, "bf3_door.mp3", 0.4, 40);
  }
  add(fs(FINALE) - 10, "bf3_drum.mp3", 0.4, 40);
  add(wf(FINALE, 2), "bf3_fanfare.mp3", 0.4, 80);
  add(wf(FINALE, 3), "bf3_coins.mp3", 0.35, 90);
  add(fs(MOTTO), "bf3_door.mp3", 0.35, 40);
  add(fs(CLOSE) + 4, "cta_pop.mp3", 0.45, 30);
  return c;
};
const A_DEMO_START = wf(7, 13);
const CUES = buildCues();

// ---------------------------------------------------------------- the reel
const STORE_START = fs(CLOSE);
const STORE_FRAMES = 92;

const KIT: Record<BFName, { kit: "apron" | "host"; palette: Record<string, string> }> = {
  blaze: { kit: "apron", palette: { body: "#FF9F6B", belly: "#FFE3A3", cape: "#E8456B", shoe: "#7A1F2B" } },
  spark: { kit: "host", palette: { body: "#6B4DE6", belly: "#E5DBFF", cape: "#41D8B0", hairA: "#3B2680", hairB: "#FFE45C", shoe: "#2A1A5C" } },
};

export const ShortMathHeroesBF3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const track = useMemo(() => makeTrack(PH, BF3_AUDIO_SEC, FPS), []);
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

  const burst = Math.max(...MISSIONS.map((mm) => pulseAt(frame, wf(mm.result, 5), 40)), pulseAt(frame, wf(FINALE, 3), 70));
  const openK = inFinale ? clamp01((frame - wf(FINALE, 2)) / 14) : 0;

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
    if (p === 0) headerView = <TextSign x={HX} y={HY} w={HW} h={HH} text="A NUMBER SECRET!" size={66} appear={ap} frame={frame} fps={fps} />;
    else if (p === 1) headerView = <TextSign x={HX} y={HY} w={HW} h={HH} text="PAIRS THAT MAKE 10!" size={62} appear={ap} frame={frame} fps={fps} />;
    else if (p >= 2 && p <= 6) {
      const [l, r] = [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]][p - 2];
      headerView = <PairSign x={HX} y={HY} w={HW} h={HH} l={l} r={r} flashL={flashK(frame, wf(p, 0))} flashR={flashK(frame, wf(p, 2))} appear={ap} />;
    } else headerView = <TextSign x={HX} y={HY} w={HW} h={HH} text="NOT ENOUGH BEADS?" size={62} appear={ap} frame={frame} fps={fps} />;
  } else if (m && !inFinale) {
    const leadOn = m.lead !== null && frame >= fs(m.lead) && frame < fs(m.stuck);
    const leave = frame > fs(m.next) - 8 ? clamp01((frame - (fs(m.next) - 8)) / 8) : 0;
    if (leadOn && m.leadText) {
      const ap = clamp01((frame - fs(m.lead as number)) / 10);
      headerView = (
        <g transform={`translate(0 ${-leave * 230})`}>
          <TextSign x={HX} y={HY} w={HW} h={HH} text={m.leadText} size={m.leadText.length > 12 ? 62 : 74} appear={ap} frame={frame} fps={fps} />
        </g>
      );
    } else if (frame >= fs(m.stuck) && leave < 1) {
      const sw = findWord(m.stuck, "stuck");
      const solvedF = wf(m.result, 5);
      headerView = (
        <g transform={`translate(0 ${-leave * 230})`}>
          <SumSign
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

  // ---------------------------------------------------------------- the prize wall character
  const wm = moodAt(WALL_SEGS, frame);
  const popAge = POP_AT.map((f) => (frame >= f ? frame - f : -1));
  let lock = 0;
  if (m) {
    const stuckW = wf(m.stuck, findWord(m.stuck, "stuck"));
    if (frame >= stuckW && frame < wf(m.reveal, 3)) lock = clamp01((frame - stuckW) / 8);
    else if (frame >= wf(m.reveal, 3) && frame < wf(m.reveal, 3) + 10) lock = 1 - clamp01((frame - wf(m.reveal, 3)) / 10);
  }
  const cheerBounce = clamp01(1 - (frame - wf(MISSIONS[0].result, 5)) / 1000) * 0; // (prizes bounce only while cheering)
  const wallBounce = wm.mood === "cheer" ? 1 : cheerBounce;
  const wallBump = m ? bounceAt(frame, wf(m.result, 5), 36) : { hop: 0, squash: 0 };
  const stuckBump = m ? bounceAt(frame, wf(m.stuck, findWord(m.stuck, "stuck")), 14) : { hop: 0, squash: 0 };

  // ---------------------------------------------------------------- the panel
  const panelR = panel;
  const px = panelR.x;
  const py = panelR.y;
  const pw = panelR.w;
  const ph = panelR.h;
  const cx = px + pw / 2;
  const midY = py + ph / 2;
  let panelView: React.ReactNode = null;
  if (inIntro) {
    if (p <= 1) {
      panelView = <Sticker cx={cx} cy={midY} text="SECRET!" size={56} k={clamp01((frame - 4) / 14)} frame={frame} fps={fps} fill={LEMON} ink={INK3} />;
    } else {
      const rows = [2, 3, 4, 5, 6].map((pp) => clamp01((frame - fs(pp)) / 10));
      const joins = [2, 3, 4, 5, 6].map((pp) => clamp01((frame - (wf(pp, 2) - 4)) / 12));
      const flashes: [number, number][] = [2, 3, 4, 5, 6].map((pp) => [flashK(frame, wf(pp, 0)), flashK(frame, wf(pp, 2))]);
      panelView = (
        <g>
          <CreamTag cx={cx} cy={py + 0.045 * ph} text="BIG FRIENDS!" size={40} maxW={pw - 8} k={clamp01((frame - fs(2)) / 12)} />
          <JigsawRows x={px} y={py + 0.09 * ph} w={pw} rowH={(0.89 * ph) / 5} rows={rows} joins={joins} flashes={flashes} frame={frame} fps={fps} />
        </g>
      );
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
    const FORM_H = 190;
    const groupTop = midY - (210 + 24 + FORM_H) / 2;
    const bondCy = groupTop + 120;
    const formulaY = groupTop + 219 + 24 - 24;
    panelView = (
      <g>
        {showLead && m.leadSticker && <Sticker cx={cx} cy={midY} text={m.leadSticker} size={m.leadSticker.length > 6 ? 46 : 60} k={clamp01((frame - fs(m.lead as number)) / 12)} frame={frame} fps={fps} fill={m.lead === 8 ? CORAL : LEMON} ink={m.lead === 8 ? "#FFFFFF" : INK3} outline={m.lead === 8 ? INK3 : PAPER} />}
        {showBonk && (
          <g transform={`translate(${cx} ${midY}) scale(1.3) translate(${-cx} ${-midY})`}>
            <GumballBonk x0={px + 0.74 * pw} x1={px + 0.26 * pw} cy={midY} label={`−${m.b}`} start={fs(m.stuck) + 6} frame={frame} />
          </g>
        )}
        {showNoRoom && (
          <g transform={`translate(${cx} ${midY}) scale(1.15) translate(${-cx} ${-midY})`}>
            <HangingSign cx={cx} cy={midY} text={`TO TAKE ${m.b}!`} k={noRoomK} frame={frame} fps={fps} />
          </g>
        )}
        {showCall && (
          <g transform={`translate(${cx} ${midY - 30}) scale(1.1) translate(${-cx} ${-(midY - 30)})`}>
            <PhoneCall cx={cx} cy={midY - 30} k={clamp01((frame - fs(m.call)) / 18)} frame={frame} fps={fps} />
          </g>
        )}
        {showCount && (
          <g transform={`translate(${cx} ${midY - 40}) scale(1.15) translate(${-cx} ${-(midY - 40)})`}>
            <LollipopCount cx={cx} cy={midY - 40} n={countN} k={clamp01((frame - countStart) / 28)} frame={frame} fps={fps} />
          </g>
        )}
        {showBond && (
          <FriendJigsaw cx={cx} cy={bondCy} n={m.b} friend={m.f} k={bondK} flashN={flashK(frame, wf(m.reveal, 0))} flashF={fFlash} friendReveal={friendRev} frame={frame} fps={fps} />
        )}
        {showFormula && (
          <Receipt
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
        {showTail && <Sticker cx={cx} cy={midY} text={m.tailLabel} size={50} k={clamp01((frame - fs(m.tail)) / 12)} frame={frame} fps={fps} fill={MINT} ink={INK3} />}
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
  const abxGlow = solved ? "#FFC93C" : stuckNow ? "#FF5A6E" : "#41D8B0";
  const abxPop = inIntro ? easeOut(clamp01((frame - 6) / 14)) : 1;
  const abxOut = inFinale ? clamp01((frame - fs(FINALE)) / 6) : 0;
  const notEnough = (m && frame >= fs(m.noRoom) && frame < fs(m.call)) || (p === 7 && frame >= wf(7, 4) && frame < wf(7, 9));
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
      events.push([fs(m.call), m.caller === name ? 40 : 0]);
      events.push([wf(m.reveal, 3), m.helper === name ? 70 : 24]);
      events.push([wf(m.result, 5), 80]);
      events.push([fs(m.tail), 40]);
    }
    events.push([wf(7, 5), 28], [wf(7, 12), 60], [wf(FINALE, 2), 90]);
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
  const doneCount = MISSIONS.filter((mi2) => frame >= wf(mi2.result, 5)).length;
  const pulses = MISSIONS.map((mi2) => pulseAt(frame, wf(mi2.result, 5), 20));

  const finaleIn = inFinale ? clamp01((frame - fs(FINALE)) / 8) : 0;
  const overlayCaption = p !== CLOSE;
  const capSize = active ? (active.phrase.text.length > 60 ? 44 : active.phrase.text.length > 36 ? 50 : 58) : 56;
  const wallMood: PWMood = inFinale ? "cheer" : wm.mood;

  return (
    <AbsoluteFill style={{ background: "#7DE8CB" }}>
      <HideTextStyle />
      <div style={{ position: "absolute", inset: 0, filter: `saturate(${1 - 0.5 * sp * (1 - finK)}) brightness(${1 + 0.02 * sp})` }}>
        <PrizeShopWorld width={W} height={H} frame={frame} fps={fps} burst={burst} counterY={L.counterY} calm={sp * (1 - finK)} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(14,60,56,${0.34 * sp * (1 - finK)})` }} />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${SAFE.left} ${SAFE.top}) scale(${TAG_K})`} opacity={L.signA * (1 - finaleIn)}>
          <PrizeTag x={0} y={0} h={TAG_H} frame={frame} fps={fps} />
        </g>

        <g transform={sumTf}>{headerView}</g>

        {panelView}

        <g opacity={inFinale ? 1 - finaleIn : 1}>
          <BalloonStrip x={PROG.x} y={PROG.y} h={PROG.h} done={doneCount} pulses={pulses} giftShake={0} frame={frame} fps={fps} />
        </g>

        {inFinale && <JackpotTrophy cx={WALL_X} baseY={L.machineBase - 400} k={clamp01((frame - wf(FINALE, 2)) / 20)} frame={frame} fps={fps} />}
        <PrizeWall
          x={WALL_X}
          y={L.machineBase}
          scale={L.machineScale}
          mood={wallMood}
          moodFrame={inFinale ? fs(FINALE) : wm.since}
          frame={frame}
          fps={fps}
          popAge={popAge.map((a, i) => (inFinale && !isFinite(POP_AT[i]) ? 99 : a))}
          bounce={wallBounce}
          lock={inFinale ? 0 : lock}
          squash={(wallBump.squash + stuckBump.squash * 0.6) * calmHero}
          hop={wallBump.hop * L.machineScale * calmHero}
          open={openK}
        />

        {inFinale && <CoinRain start={wf(FINALE, 3)} frame={frame} fps={fps} />}
        {p === MOTTO && (
          <g transform="translate(540 1420)">
            <rect x={-400} y={-80} width={800} height={160} rx={44} fill={PAPER} stroke={INK3} strokeWidth={8} />
            <rect x={-384} y={-64} width={768} height={128} rx={32} fill="none" stroke={CORAL} strokeWidth={4} strokeDasharray="3 12" strokeLinecap="round" />
            <Txt x={0} y={-6} size={44} fill={INK3} stroke={PAPER} sw={0} spacing={1}>EVERY STUCK NUMBER</Txt>
            <Txt x={0} y={44} size={52} fill={CRIM} stroke={PAPER} sw={0} spacing={1}>HAS A TRICK!</Txt>
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
              background: "linear-gradient(180deg, #FFFDF4, #FFF0CF)",
              border: "9px solid #FFFFFF",
              boxSizing: "border-box",
              opacity: abxPop * (1 - abxOut),
              boxShadow: `0 0 0 6px ${abxGlow}, 0 0 ${26 + 22 * sp}px ${6 + 8 * sp}px ${abxGlow}88, 0 ${14 + 10 * sp}px 0 rgba(30,60,56,0.4)`,
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
              filter: "drop-shadow(0 8px 10px rgba(30,60,56,0.4))",
            }}
          >
            <Abacus rods={rods} settle={abx.settle} scale={L.abxScale} colorOnArrival palette={RIG_BF3} placeLabelHalo chipInk="#3B1F4E" labelInk={["#A64B00", "#5E6A0E"]} />
          </div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 1 - abxOut }}>
            {abx.arrow && <BeadArrow box={ABX_BOX} rod={abx.arrow.rod} from={abx.arrow.from} to={abx.arrow.to} settle={abx.arrow.settle} />}
            {notEnough && (
              <g>
                <rect x={onesX - 56 * L.abxScale} y={abxTop(L) + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="none" stroke="#FF5A6E" strokeWidth={9} strokeDasharray="22 14" strokeDashoffset={-frame * 2.4} opacity={0.95} />
                <rect x={onesX - 56 * L.abxScale} y={abxTop(L) + 8} width={112 * L.abxScale} height={ABX_BOX.h - 16} rx={26} fill="#FF5A6E" opacity={0.13 + 0.08 * Math.sin(frame * 0.5)} />
              </g>
            )}
          </svg>
        </>
      ) : null}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {MISSIONS.map((mm2, i) => (
          <Celebration key={i} x={WALL_X} y={L.machineBase - 340 * L.machineScale} frame={frame} fps={fps} startFrame={wf(mm2.result, 5)} />
        ))}
        {[0, 1, 2].map((k) => (
          <Celebration key={`f${k}`} x={220 + k * 320} y={640 + (k % 2) * 160} frame={frame} fps={fps} startFrame={wf(FINALE, 3) + k * 4} />
        ))}
      </svg>

      {overlayCaption && active && (
        <div style={{ position: "absolute", left: CAP.x, top: CAP.y, width: CAP.w, height: CAP.h, fontSize: capSize }}>
          <BF3Caption phrase={active.phrase} wordIdx={active.wordIdx} top={0} height={CAP.h} width={CAP.w} />
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
            background: `linear-gradient(180deg, rgba(23,63,60,0.95), rgba(14,40,38,0.97))`,
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
      <Audio src={staticFile("audio/short_math_heroes_bf3/short_math_heroes_bf3.mp3")} />
    </AbsoluteFill>
  );
};

void CHALK;
