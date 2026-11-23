// E11 · PIRATE TREASURE ISLAND REMAKE (Bead Buddies series, docs/COVE_SERIES_PLAN.md). SAME audio, phrase table, timings, teaching beats
// and abacus tables as the delivered E11 (src/reels/e11_big_friend_intro.tsx, kept for reference). Only the elephant and the circus worlds
// are replaced: Tenzo (the Big Friend, lead, in a pirate cape) and Pip (pirate hat, binoculars) in a calm Pirate Treasure Island, with a
// parrot and a crab at the edges. Carrying a bead to the tens rod is Tenzo's two-paw lift, like putting a coin in the treasure chest.

// E11 · The big friend trick — 16:9 and 4:5 from one reel.
//
// The first BIG FRIEND formula: +N = −(10−N) + 10. Where E07 taught the small friend (the ones
// rod runs a LITTLE short and a spare earth bead saves it), this is the bigger version: the ones
// rod is completely FULL, heaven and earth both, and the only way forward is to carry a bead to
// the tens rod. E06 already put the tens rod on screen and taught what it is worth; this episode
// is the first time that knowledge gets used mid-sum rather than just to read a number.
//
// CORRECTED 2026-09-21, second recording: the first pass had this backwards — carry to the tens
// rod FIRST, remove the friend second, formula written `+10 − friend`. That is wrong. The real
// rule, and the one this file now follows: remove the friend from the ONES rod first (lower
// beads before the upper bead, the EXACT SAME order Small Friend already uses — Big Friend does
// NOT reverse it, it only adds the carry as an extra step after), THEN carry to the tens rod.
// Formula: `+n = −friend + 10`. See [[reference_abacus_formulas]].
//
// Timing from src/data/e11.phrases.json, aligned from docs/E11_lines.txt (second recording).
// 75 lines -> 75 PHRASES — one shorter than the first script because the corrected section 6
// merges what used to be two separate "now go back to X" transition lines into one.
//
// WHAT THIS EPISODE DOES DIFFERENTLY
//
//   · TWO RODS, LIVE, FROM FRAME 0. Every formula episode before this worked one rod. This one
//     needs the tens rod on screen the whole time, so "there is another rod, and it is empty"
//     (section 3) is something the viewer can already see rather than something introduced cold.
//   · RIG_PIRATE — cherry-red frame, magenta beads. Eleventh distinct instrument.
//   · A BIG TOP CIRCUS for the world set, composed from the same curtains/spot/boards/backstage/
//     bulbs vocabulary E07's magic show built, in a new cherry-and-gold palette pushed brighter
//     and warmer throughout — a circus, unlike a magician's stage, is a daytime kids' party even
//     when it is lit for a show.
//   · AN ELEPHANT, whose signature pose — a trunk that curls around a bead and visibly LIFTS it —
//     plays on every carry beat, which now comes SECOND in each worked example, after the
//     removal. Elephants carry things with their trunk; that is a fact about the animal, nothing
//     to do with the script, which stays in plain math language throughout (ones rod, tens rod,
//     carry, beads) per docs/E11_lines.txt's own note.
//   · THE BIG FRIEND CARDS: five pairs that make ten (1|9 through 5|5), not E07's two that make
//     five — a new component, not the old one stretched, because five rows do not fit where two
//     did.
//   · BEAD ORDER MATCHES E07, IT DOES NOT REVERSE IT. Ones rod first — lower beads, then the
//     upper bead, identical to Small Friend — and the carry to the tens rod happens after that
//     is done, never before. The formula list reads friend-first to match: `+n = −friend + 10`.

import React from "react";
import phrasesJson from "../data/e11.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Twinkles, castFit } from "../components/cast";
import { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, OT_K } from "../components/cast";
import type { OtterMood } from "../components/cast";
type ElephantMood = "peek" | "stuck" | "idea" | "show" | "carry" | "cheer";
const LEAD: Record<ElephantMood, OtterMood> = { peek: "wave", stuck: "worry", idea: "present", show: "point", carry: "present", cheer: "cheer" };
const SIDE: Record<ElephantMood, OtterMood> = { peek: "float", stuck: "worry", idea: "gasp", show: "think", carry: "point", cheer: "cheer" };
import { BigFriendCards, BIG_FRIENDS_NAT } from "../components/e11/BigFriendCards";
import {
  BigFriendFormulaList,
  BIG_FORMULA_NAT,
  BIG_FORMULA_ONE,
  BIG_FRIEND_FORMULAS,
} from "../components/e11/BigFriendFormulaList";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { FormulaStrip, STRIP_NAT } from "../components/e07/FormulaStrip";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import { rodX } from "../stage/geometry";
import type { Scene as BaseScene } from "../stage/types";
import { WORLDS } from "../data/theme";
import { BB_RIGS } from "../data/bbworlds";
const RIG_PIRATE = BB_RIGS.pirate;
import { FPS } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";
import { HideTextStyle } from "../lib/hideText";


export const AUDIO_SEC = 270.14;
export const E11_PIRATE_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

interface Scene extends BaseScene {
  elephant?: ElephantMood;
  /** the big-friends table: how many pairs are up, which one is active */
  friends?: { shown: number; active?: number };
  friendsArriving?: boolean;
  friendsPrev?: { shown: number; active?: number };
  /** the formula card: a single highlighted strip, or the full five-row reveal */
  formulas?: { active?: number; stagger?: boolean; only?: boolean };
  formulasArriving?: boolean;
  /** the BIG FRIEND formula card while it is said and done: first −friend (take away), then +10 (carry); advances at `marks` */
  doing?: { n: number; step: 0 | 1 | 2; marks?: number[] };
  /** the big answer in the headline band */
  big?: string;
  /** the rod's live combined value above the abacus */
  valueChip?: boolean;
  /** the column sum card — shown continuously through each worked example, the row that is
   *  currently being talked about lit up: "first" while the top number is being built/named,
   *  "second" while the addend is being carried/removed, "answer" once the total is said. */
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep };
  /** a pulsing glow ring around `targetRod`'s own column — for lines that are ABOUT a specific
   *  rod but don't move a bead on it, so the rod being discussed is the one thing standing out
   *  rather than sitting at the same brightness as everything else on screen. */
  spotlightRod?: boolean;
  /** "Every bead on it is already pushed" — the beads themselves blink, not the rod's column,
   *  since the line is about the BEADS specifically, not about which rod to look at. */
  blinkRod?: boolean;
}

/** Fixed, not taken from the world — same reasoning as E07's FRIEND_GOLD: a reference card a
 *  child looks things up in should look the same every time, not shift colour with the lighting. */
const CARD_ACCENT = "#B00E64"; // darkened for the contrast audit

const BASE = 0.94;
const BIG_TOP = 20;
const BIG_SIZE = 80;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

/** Room for the elephant on the right. */
const PORTRAIT_ROOM = { left: 80, right: 210 };

/**
 * What the abacus reads on each phrase, as a combined value 0-19 (ones + 10*tens). Rod 0 is
 * ones, rod 1 is tens — decoded the same way E06 decodes a two-digit number.
 *
 * The shape of this table IS the episode: nine, held for twenty-six phrases while the ones rod
 * sits completely full and the trick is explained, then a carry and a removal, twice worked and
 * once handed to the child.
 */
const VALUE: Record<number, number> = (() => {
  const v: Record<number, number> = {};
  for (let p = 0; p < PHRASES.length; p++) v[p] = 0;
  // THE HOOK IS A COLD OPEN, NOT A PROMISE: "REALLY stuck" / "no beads left" / "the tens rod
  // instead" all describe a state that must actually be ON SCREEN when they're said, not an
  // empty abacus with a headline pill claiming it's full. p0-2 reveal the rod ALREADY stuck at
  // nine — curtain opens straight onto the jam — then p3 ("Let us try nine plus one") resets to
  // zero as the pivot into section 2's real, step-by-step rebuild. p0 and p3 are in SILENT_SET
  // below so neither the sudden reveal nor the reset gets a finger animation — nothing was
  // "moved" by a hand at either point, one is a reveal and the other is a rewind.
  for (let p = 0; p < 3; p++) v[p] = 9; // already stuck — the hook shows the real thing, not a tease
  for (let p = 5; p < 6; p++) v[p] = 4; // four lower beads
  for (let p = 6; p < 42; p++) v[p] = 9; // upper bead down: nine, held through the whole explanation
  // CORRECTED ORDER: remove the friend from the ones rod FIRST (it briefly reads zero, nothing
  // carried yet — a real intermediate state, not a bug), THEN carry to the tens rod second.
  for (let p = 42; p < 45; p++) v[p] = 0; // REMOVE nine from the ones rod
  for (let p = 45; p < 50; p++) v[p] = 10; // CARRY: one bead to the tens rod
  for (let p = 52; p < 55; p++) v[p] = 8; // second example: make eight
  for (let p = 55; p < 57; p++) v[p] = 0; // REMOVE eight first
  for (let p = 57; p < 60; p++) v[p] = 10; // CARRY second
  for (let p = 61; p < 64; p++) v[p] = 7; // your turn: seven, made silently
  for (let p = 64; p < 75; p++) v[p] = 10; // remove + carry, resolved in one snap; held to the close
  return v;
})();

const valueAt = (p: number) => VALUE[p] ?? 0;
const digits = (v: number): [number, number] => [v % 10, Math.floor(v / 10) % 10];

/**
 * Lines where the abacus changes with no taught move: the two resets between worked examples,
 * and the number the CHILD makes on their own abacus. Same discipline E08/E09/E10 use —
 * `silentCut` snaps with no travel and no arrow, because a finger reaching for a line nobody
 * spoke teaches the wrong thing.
 */
const SILENT_SET = new Set([0, 3, 50, 60, 61]);

// p0-1: "REALLY stuck" / "no beads left to push... anywhere on THIS rod" is about the ones rod
// ALONE — the tens rod dims out so the ones rod is the one thing standing at full focus, instead
// of both rods sitting at the same brightness while the words point at just one of them.
const ONES_ONLY = new Set([0, 1]);

const rig = (p: number) => {
  const d = digits(valueAt(p));
  return Array.from({ length: 5 }, (_, i) => ({
    value: i < 2 ? d[i] : 0,
    focus: i === 1 && ONES_ONLY.has(p) ? 0.55 : i < 2 ? 1 : 0.35,
    // both worth chips, on both live rods, from the first frame — the tens rod has to already
    // read "tens" before section 3 says "there is another rod", or the line is teaching a label
    // that is not there yet to be named.
    chipLower: i < 2 || undefined,
    placeName: i < 2 ? (i === 0 ? "ones" : "tens") : undefined,
  }));
};

/**
 * WHICH FINGER, and WHICH ROD — E06's derivation, extended with the descending heaven-crossing
 * case E06 never needed: BIG friend removes the upper bead by pushing it UP (thumb) while the
 * earth beads come DOWN (index), the exact reverse of building a number up through five. The
 * rule stays the same rule either way — direction decides the finger, never the bead.
 */
const movedRod = (p: number): number | null => {
  if (p === 0 || SILENT_SET.has(p)) return null;
  const to = digits(valueAt(p));
  const from = digits(valueAt(p - 1));
  const moved = [0, 1].filter((i) => to[i] !== from[i]);
  return moved.length === 1 ? moved[0] : null;
};

const handFor = (p: number): Scene["hand"] => {
  const rod = movedRod(p);
  if (rod === null) return undefined;
  const to = digits(valueAt(p))[rod];
  const from = digits(valueAt(p - 1))[rod];
  const lowerFrom = from % 5;
  const lowerTo = to % 5;
  if (lowerTo > lowerFrom) return { digit: "thumb", direction: "up", rod, heaven: false };
  if (from >= 5 !== to >= 5) {
    const down = to >= 5;
    // DESCENDING cross: this hand and hand2's earth move both converge on the beam from
    // opposite sides and their default anchors collide (unlike E09's tested ASCENDING case,
    // where they arrive from further apart). Nudge this one up, off the beam, and hand2's own
    // nudge below pushes the other one down — same fix DESIGN_SYSTEM already names for "the
    // rare line with two hands on one rod".
    return {
      digit: down ? "index" : "thumb",
      direction: down ? "down" : "up",
      rod,
      heaven: true,
      dy: down ? undefined : -70,
    };
  }
  if (lowerTo < lowerFrom) return { digit: "index", direction: "down", rod, heaven: false };
  return undefined;
};

/**
 * THE SECOND HAND, for the two lines where both kinds of bead move on the SAME rod at once:
 * p42 ("push the four lower beads down, then push the upper bead up") and p55 ("take away eight
 * from the ones rod", the same shape). `handFor`'s heaven-crossing branch matches first on a
 * descending cross, so the primary hand is the heaven move and the earth move needs its own —
 * the mirror image of E09's hand2For, which covers the ascending case where earth matches first.
 */
const hand2For = (p: number): Scene["hand2"] => {
  const rod = movedRod(p);
  if (rod === null) return undefined;
  const to = digits(valueAt(p))[rod];
  const from = digits(valueAt(p - 1))[rod];
  const lowerFrom = from % 5;
  const lowerTo = to % 5;
  const earthChanged = lowerTo !== lowerFrom;
  const heavenCrossed = from >= 5 !== to >= 5;
  if (!earthChanged || !heavenCrossed) return undefined;
  if (lowerTo > lowerFrom) {
    // ascending: the primary hand caught the earth move (thumb/up); this one is the heaven move
    const down = to >= 5;
    return { digit: down ? "index" : "thumb", direction: down ? "down" : "up", rod, heaven: true };
  }
  // descending: the primary hand caught the heaven move; this one is the earth move, always
  // downward — beads are only ever REMOVED in this direction on a big-friend line. Nudged down
  // to clear the heaven hand's matching upward nudge above.
  return { digit: "index", direction: "down", rod, heaven: false, dy: 70 };
};

/** Which rod a line is about, for lines with no move of their own. */
const rodFor = (p: number): number => {
  const rod = movedRod(p);
  if (rod !== null) return rod;
  if (p === 2) return 1; // hook: "so we carry a bead to the tens rod instead" — look there NOW
  if (p >= 13 && p <= 17) return 1; // "there is another rod — the tens rod"
  if (p === 44) return 1; // "now, we carry" — about to, on the tens rod
  if (p === 46) return 1; // "that bead is worth ten" — still the tens rod's own bead
  if (p === 47 || p === 58) return 1; // "the TENS rod shows one" — a declared readout, not a move
  // p9 ("look at the ONES rod"), p40 ("our ONES rod is showing nine"), p41 ("first, we take
  // away nine" — about to act on the ones rod), p43/p56 ("the ONES rod shows zero") are all
  // explicitly about the ones rod and fall through to the default below.
  return 0;
};

/** The frame each answer LANDS on, and the burst that follows it onto the next line. */
const ANSWER_LINES = [48, 59, 66];
const ANSWER_TEXT: Record<number, string> = {
  48: "9 + 1 = 10",
  59: "8 + 2 = 10",
  66: "7 + 3 = 10",
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
 * THE BIG FRIENDS TABLE per phrase — built up one pair per line as they are named (p21-25), then
 * walked through again as the highlight during the chant (p27-31).
 */
const FRIENDS: Record<number, NonNullable<Scene["friends"]>> = (() => {
  const out: Record<number, NonNullable<Scene["friends"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["friends"]>) => ps.forEach((p) => (out[p] = v));
  put([18, 19, 20], { shown: 0 });
  put([21], { shown: 1 });
  put([22], { shown: 2 });
  put([23], { shown: 3 });
  put([24], { shown: 4 });
  put([25, 26], { shown: 5 });
  put([27], { shown: 5, active: 0 });
  put([28], { shown: 5, active: 1 });
  put([29], { shown: 5, active: 2 });
  put([30], { shown: 5, active: 3 });
  put([31], { shown: 5, active: 4 });
  put([32], { shown: 5 });
  return out;
})();

/**
 * THE FORMULA CARD per phrase: a single highlighted strip while the rule is being spoken in
 * words (p36-38, "+1 = +10 − 9" — the exact case just about to be performed), and the full
 * five-row table on the closing line that says there is one for every number — NONE highlighted,
 * same reasoning E07 used: the worked examples were +1/+2/+3, so lighting any one of them on the
 * line that means all five points at the wrong one.
 */
// The formula strip now stays up for the WHOLE worked example, not just the three lines it
// introduces, and sits BESIDE the sum card, not instead of it — "show the formula, don't
// remove the question, show formula beside question." Each example gets its own `+n` lit.
const FORMULAS: Record<number, NonNullable<Scene["formulas"]>> = (() => {
  const out: Record<number, NonNullable<Scene["formulas"]>> = {};
  out[70] = { stagger: true }; // the closing "there is one for every number" — full five, none lit
  return out;
})();

/** where a word starts inside its line, as a 0..1 share of the line (drives the lit move on the formula card) */
const markAt = (p: number, w: string) => {
  const ph = PHRASES[p];
  const x = ph.words.find((k) => k.word.toLowerCase().replace(/[^a-z]/g, "") === w);
  return x ? Math.max(0, Math.min(0.95, (x.start - ph.start) / (ph.end - ph.start))) : 0.5;
};

/**
 * THE BIG FRIEND FORMULA CARD, said and DONE (same card and behaviour as E07-E10, titled BIG FRIEND). Friend first: +n = −friend +10. It comes up
 * plain when the friend is named, lights "−friend" while the friend is taken away and "+10" while the bead is carried, and goes plain on the
 * answer lines. It replaces the old pink strip beside the sum card and the top headline chip.
 */
const DOING: Record<number, NonNullable<Scene["doing"]>> = (() => {
  const out: Record<number, NonNullable<Scene["doing"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["doing"]>) => ps.forEach((p) => (out[p] = v));
  // 9 + 1: one's friend is nine
  put([35], { n: 1, step: 0 });
  put([36], { n: 1, step: 0, marks: [markAt(36, "take"), markAt(36, "carry")] });
  put([37], { n: 1, step: 0, marks: [markAt(37, "taking"), markAt(37, "adding")] });
  put([38, 39, 40], { n: 1, step: 0 });
  put([41, 42, 43], { n: 1, step: 1 });
  put([44, 45, 46, 47], { n: 1, step: 2 });
  put([48, 49], { n: 1, step: 0 });
  // 8 + 2: two's friend is eight
  put([54], { n: 2, step: 0 });
  put([55, 56], { n: 2, step: 1 });
  put([57, 58], { n: 2, step: 2 });
  put([59], { n: 2, step: 0 });
  // 7 + 3: three's friend is seven (your turn)
  put([63], { n: 3, step: 0 });
  put([64], { n: 3, step: 0, marks: [markAt(64, "take"), markAt(64, "carry")] });
  put([65, 66, 67], { n: 3, step: 0 });
  return out;
})();

/**
 * THE COLUMN SUM — up on screen for the whole stretch each worked example runs, not just the
 * answer beat, so a child can read "what are we even doing" at a glance instead of only ever
 * seeing loose narration over an abacus. The row lit is whichever NUMBER the line is actually
 * about: the top number while it's being built and named, the addend row for the whole carry +
 * remove sequence (that IS "doing +1"), the answer row once the total is said. The third
 * example's total stays unset through p66 ("what number is showing now?") — `ColumnSum` already
 * renders an unrevealed total as "?", which is exactly the pause the your-turn beat wants.
 */
const SUMS: Record<number, NonNullable<Scene["sum"]>> = (() => {
  const out: Record<number, NonNullable<Scene["sum"]>> = {};
  const put = (ps: number[], v: NonNullable<Scene["sum"]>) => ps.forEach((p) => (out[p] = v));
  const A = { a: 9, b: 1, op: "+" };
  // The equation is first SAID at p3 ("let us try nine plus one") — the card must be up from
  // there, not just once the abacus finally gets around to performing it 36 lines later. It
  // only steps aside for the two lines the BIG FRIENDS card and the FORMULA strip need that
  // same gutter slot (p18-32, p36-38) — same trade E07 makes for its own friends-of-five card.
  put([3], { ...A, step: "none" }); // just named, nothing built yet
  put([4, 5, 6, 7], { ...A, step: "first" }); // building nine
  put([8, 9, 10, 11, 12], { ...A, step: "second" }); // trying (and failing) to add one
  put([13, 14, 15, 16, 17], { ...A, step: "second" }); // the tens-rod solution, still about the +1
  put([33, 34, 35, 36, 37, 38], { ...A, step: "second" }); // "now watch what the friends do... add one" through the rule itself — the question stays up while the formula for it is introduced
  put([39, 40], { ...A, step: "first" });
  put([41, 42, 43, 44, 45, 46, 47], { ...A, step: "second" }); // the whole +1: remove, then carry
  put([48, 49], { ...A, total: 10, step: "answer" });
  const B = { a: 8, b: 2, op: "+" };
  put([50, 51, 52], { ...B, step: "first" });
  put([53, 54, 55, 56, 57, 58], { ...B, step: "second" });
  put([59], { ...B, total: 10, step: "answer" });
  const C = { a: 7, b: 3, op: "+" };
  put([60, 61], { ...C, step: "first" });
  put([62, 63, 64, 65], { ...C, step: "second" });
  put([66, 67], { ...C, total: 10, step: "answer" });
  return out;
})();

const SUM_FIRST = new Set(
  Object.keys(SUMS)
    .map(Number)
    .filter((p) => !SUMS[p - 1])
);

/** Headline pills — one per pivotal line, never sharing a frame with the big-answer card. */
const HEADLINE: Record<number, string> = {
  0: "no room left to push",
  2: "carry to the tens rod!",
  11: "stuck!",
  14: "there's another rod",
  18: "the big friends",
  60: "your turn",
  69: "your first big friend formula",
};

/** Lines where a calculation is actively in progress — excludes the big-friends teaching
 *  section, same discipline E07 uses for its own friends-of-five block. */
const isWorking = (p: number) =>
  (p >= 4 && p <= 6) || (p >= 39 && p <= 47) || (p >= 52 && p <= 58) || (p >= 61 && p <= 65);

/**
 * WHAT THE ELEPHANT IS DOING. `carry` is the signature pose and it is deliberately allowed to
 * share a frame with the finger hand at p42 and p56 — the trunk's own carry is a second, parallel
 * telling of the same move the hand is making, off to the side rather than on the rod, and the
 * overlap guard is what proves the two never actually collide. Every other mood defers to the
 * hand, same rule Rabbit and Monkey follow.
 */
const CARRY_COEXIST = new Set([45, 57]);
const ELEPHANT: Record<number, ElephantMood> = (() => {
  const e: Record<number, ElephantMood> = {};
  const put = (ps: number[], m: ElephantMood) => ps.forEach((p) => (e[p] = m));
  put([0, 1], "stuck"); // hook: the rod is ALREADY full — "REALLY stuck" / "no beads left" shown, not promised
  put([2], "idea"); // "so we carry a bead to the tens rod instead" — the pivot, right as the spotlight moves
  put([3, 4], "peek"); // the reset — about to rebuild it properly, step by step
  put([7, 8], "show");
  put([9, 10, 11, 12], "stuck"); // the ones rod is completely full
  put([13, 14], "idea"); // "but we are not stuck" — the tens rod is remembered
  put([15, 16, 17], "show");
  put([18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32], "show");
  put([33, 34, 35, 36, 37, 38, 39, 40, 41], "show"); // p41 "first, we take away nine" — the plan, not the move yet
  // p42 (the removal itself) is skipped here on purpose: `elephantFor` already suppresses the
  // mood whenever a finger hand is active and the line isn't a CARRY_COEXIST beat, and p42 is a
  // removal, not a carry — the elephant should NOT do its trunk-carry pose on a line where
  // nothing is being carried.
  put([43, 44], "show"); // "the ones rod now shows zero" / "now, we carry" — the pivot
  put([45], "carry"); // THE FIRST CARRY — now the SECOND half of the example, after the removal
  put([46, 47], "show");
  put([48, 49], "cheer");
  put([50, 51], "show");
  put([53, 54], "show");
  // p55 (removal for example 2) skipped for the same reason as p42.
  put([56], "show"); // "the ones rod shows zero"
  put([57], "carry"); // THE SECOND CARRY
  put([58], "show");
  put([59], "cheer");
  put([60], "show");
  put([61, 62, 63], "show");
  put([64], "carry"); // THE THIRD CARRY — no finger hand here at all (both digits change in one
  // snap), so this IS the move: remove AND carry together, same as the script says them together
  put([65], "idea"); // "what number is showing now?" — the pause before the reveal
  put([66, 67], "cheer");
  put([68, 69, 70], "cheer");
  return e;
})();

const elephantFor = (p: number, hand: Scene["hand"]): ElephantMood | undefined => {
  const want = ELEPHANT[p];
  if (!want) return undefined;
  if (hand && !CARRY_COEXIST.has(p)) return undefined;
  return want;
};

/**
 * LINES ABOUT A ROD THAT DON'T MOVE A BEAD ON IT — `targetRod` alone changes nothing visible
 * here (the shared engine only reads it to decide which side a text card sits on, and this
 * episode has no side card), so section 3 ("there is another rod... the tens rod is empty...
 * worth ten... we carry a bead to the tens rod") rendered as five back-to-back lines about the
 * tens rod over a shot that never actually pointed at it — the same static abacus the whole
 * time. A real glow ring, keyed to the same `targetRod`, fixes that: p2 is the hook's own pivot
 * to the tens rod, p13-17 is section 3 in full, p39-41 is "first, we carry" just before it
 * actually happens.
 */
const SPOTLIGHT_ROD = new Set([0, 1, 2, 9, 13, 14, 15, 16, 17, 40, 41, 43, 44, 46, 47, 56, 58]);

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const hand = handFor(p);
  const hand2 = hand2For(p);
  const base = {
    stage: "abacus" as const,
    rods: rig(p),
    scale: BASE,
    targetRod: rodFor(p),
    highlight: null,
    hand,
    hand2,
    moveOn: !SILENT_SET.has(p) && valueAt(p) !== valueAt(p - 1) ? "$last" : undefined,
    silentCut: SILENT_SET.has(p),
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
    friends: FRIENDS[p],
    formulas: FORMULAS[p],
    doing: DOING[p],
    friendsArriving: FRIENDS[p] !== undefined && FRIENDS[p - 1]?.shown !== FRIENDS[p]?.shown,
    friendsPrev: FRIENDS[p - 1],
    formulasArriving: FORMULAS[p] !== undefined && FORMULAS[p - 1] === undefined,
    big: ANSWER_TEXT[p],
    valueChip: isWorking(p) && !ANSWER_TEXT[p],
    headline: HEADLINE[p],
    spotlightRod: SPOTLIGHT_ROD.has(p),
    blinkRod: p === 10,
    sum: SUMS[p],
    // never share a line with a finger hand, except the carry beats — see CARRY_COEXIST
    elephant: elephantFor(p, hand),
  };

  // -------------------------------------------------------------- 1 · THE HOOK (ringclosed)
  if (p <= 3) return { ...base, world: "pirateA" };

  // --------------------------------------------------------- 2 · IT GOES WRONG (sawdustring)
  if (p <= 12) return { ...base, world: "pirateB" };

  // ---------------------------------------------------- 3 · CARRY TO THE TENS ROD (secondring)
  if (p <= 17) return { ...base, world: "pirateB" };

  // --------------------------------------------------- 4 · BIG FRIENDS, NAMED (bigtopnaming)
  if (p <= 25) return { ...base, world: "pirateC" };

  // -------------------------------------------------- 5 · BIG FRIENDS, TOGETHER (bigtopchant)
  if (p <= 32) return { ...base, world: "pirateC" };

  // ------------------------------------------------------------- 6 · THE TRICK (centerring)
  if (p <= 38) return { ...base, world: "pirateB" };

  // --------------------------------------------------- 7 · THE TRICK ON THE ABACUS (showtime)
  if (p <= 49) return { ...base, world: "pirateA" };

  // ------------------------------------------------------------- 8 · ONE MORE (secondact)
  if (p <= 59) return { ...base, world: "pirateC" };

  // ----------------------------------------------------------- 9 · YOUR TURN (yourturnring)
  if (p <= 67) {
    return {
      ...base,
      world: "pirateB",
      celebrate: p === 66 || p === 67 ? ("party" as const) : base.celebrate,
    };
  }

  // -------------------------------------------------------------------- 10 · CLOSE (finalebow)
  //
  //   p68     like & subscribe — BEFORE the formula recap, matching the script's own order
  //   p69-70  still CONTENT: the formula this episode taught, then its four siblings revealed
  //   p71-72  the store flow
  //   p73-74  the next-episode teaser
  if (p === 68) {
    return {
      ...base,
      world: "pirateD",
      closing: true,
      closeBeat: "subscribe",
      worldWash: 0.55,
      valueChip: false,
      friends: undefined,
      formulas: undefined,
      doing: undefined,
    };
  }
  if (p <= 70) return { ...base, world: "pirateD" };
  return {
    ...base,
    world: "pirateD",
    closing: true,
    closeBeat: p <= 72 ? "store" : "next",
    worldWash: 0.55,
    noCaption: p === 71 || p === 72,
    valueChip: false,
    friends: undefined,
    formulas: undefined,
    doing: undefined,
    elephant: undefined,
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

/** the phrase where the big friend is first introduced ("Some friends do not make five together"): Tenzo, his tag and crown are off stage until then; only Pip (ME) before */
const FRIEND_INTRO = 19;
const friendEnter = (p: number, bp: number) => (p < FRIEND_INTRO ? 0 : p === FRIEND_INTRO ? Math.min(1, bp * 4) : 1);
const friendCrown = (p: number, bp: number) => (p < FRIEND_INTRO ? 0 : p === FRIEND_INTRO ? Math.max(0, Math.min(1, (bp - 0.3) * 3)) : 1);

const SFX_CUES: SfxCue[] = (() => {
  const cues: SfxCue[] = [];
  const at = (i: number) => sec(PHRASES[i].start, FPS);
  const add = (frame: number, file: string, len: number, vol: number) =>
    cues.push({ frame: Math.max(0, Math.round(frame)), file, len, vol });
  const on = (i: number, w: string) => wordFrameIn(PHRASES[i], w, FPS) ?? at(i);

  for (let i = 1; i < PHRASES.length; i++) {
    if (valueAt(i) === valueAt(i - 1)) continue;
    if (i === 3) continue; // the reset below gets its own rewind sound, not a bead click
    const mv = sceneFor(i).moveOn;
    add(mv ? on(i, mv) : at(i), "abacus_move.mp3", 30, 0.32);
  }
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);

  // THE HOOK'S COLD OPEN — "REALLY stuck" reveals the jam immediately (a stinger, not a bead
  // click: nothing was pushed, the curtain just opened on it), "no beads left" gets the same
  // denied sound the real rebuild uses later at p11, and the reset at p3 gets a soft rewind
  // rather than a bead click, since nothing was pushed there either.
  add(at(0), "boing.mp3", 26, 0.22);
  add(on(1, "$last"), "nope.mp3", 40, 0.3);
  add(at(3), "boing.mp3", 26, 0.2);

  // THE STUCK MOMENT, rebuilt for real — "there is nothing left to push" is the line the
  // step-by-step walkthrough pivots on.
  add(on(11, "$last"), "nope.mp3", 40, 0.34);
  add(at(12) + 6, "boing.mp3", 26, 0.24);

  // each big friend pair arriving, one tick per pair
  for (let i = 21; i <= 25; i++) add(at(i) + 4, "tick.mp3", 20, 0.26);

  // the elephant's carry pose, each of the three times it plays
  for (const i of [45, 57, 64]) add(at(i) + 6, "boing.mp3", 24, 0.18);

  // a clap whenever the elephant starts cheering
  for (let i = 0; i < PHRASES.length; i++) {
    const sc = sceneFor(i);
    if (sc.elephant === "cheer" && sceneFor(i - 1)?.elephant !== "cheer") {
      add(at(i) + Math.round((sec(PHRASES[i].end, FPS) - at(i)) * 0.12), "clap.mp3", 50, 0.18);
    }
  }

  // ---- NEW SOUNDS (same set as E07-E10): Tenzo's arrival, the BIG FRIEND card and its lit moves
  const span = (i: number) => sec(PHRASES[i].end, FPS) - at(i);
  add(at(FRIEND_INTRO) + 4, "cta_pop.mp3", 10, 0.3);
  add(at(FRIEND_INTRO) + span(FRIEND_INTRO) * 0.34, "friend_sparkle.mp3", 18, 0.3);
  for (const i of [0, 2, 11, 14, 18, 60, 69]) add(at(i) + 2, "swipe.mp3", 11, 0.2);
  for (const i of Object.keys(DOING).map(Number).sort((a, b) => a - b)) {
    const d = DOING[i];
    const q = DOING[i - 1];
    const final = q && q.n === d.n ? Math.min(2, q.step + (q.marks?.length ?? 0)) : -1;
    if (final === -1) add(at(i) + 3, "cta_pop.mp3", 10, 0.26);
    else if (d.step !== final && d.step > 0) add(at(i) + 3, "tick.mp3", 6, 0.34);
    for (const m of d.marks ?? []) if (m > 0.05) add(at(i) + span(i) * m, "tick.mp3", 6, 0.34);
  }

  // standard close SFX, same block every episode uses
  add(on(13, "stuck"), "boing.mp3", 26, 0.2);
  add(at(67) + 6, "count_fanfare.mp3", 60, 0.24); // "Well done."

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

/** Ground-anchored: (x,y) is the point the elephant's FEET stand on. */
const ELEPHANT_BOX = { up: CAST_BOX.up * OT_K, down: CAST_BOX.down, half: pairHalf(2) };

const elephantAt = (
  box: { left: number; w: number; top: number; h: number; scale: number },
  L: { W: number; H: number; portrait: boolean },
  closing = false,
  aside = false
) => {
  if (closing) {
    const scale = L.portrait ? 0.9 : 1.15;
    return { x: L.W - pairHalf(2) * scale - 40, y: L.portrait ? L.H * 0.79 : 826, scale }; // landscape feet at 826 (name tags clear the caption by 24 px); 4:5 at 0.79 so a two-line caption never covers the name tags
  }
  if (L.portrait) {
    const scale = box.scale * (aside ? 0.45 : 0.5);
    return {
      x: aside ? L.W - ELEPHANT_BOX.half * scale - 34 : L.W / 2,
      // clear the place-value chip row AND its "ones"/"tens" label under the abacus before the
      // elephant's own (generously-boxed) top edge starts — measured against a real render,
      // not guessed: the chip band's bottom edge sits well below a naive "just under the
      // abacus" offset.
      y: box.top + box.h + 120 + 366 * scale,
      scale,
    };
  }
  const scale = castFit(box, L, box.scale * 0.95, pairHalf(2), 130);
  return {
    x: box.left + box.w + 130 + pairHalf(2) * scale,
    y: box.top + box.h,
    scale,
  };
};

const elephantRect = (m: { x: number; y: number; scale: number }) => castRect(m, 2);

/** The active teaching card's natural size and scale, whichever of `friends` / `formulas` /
 *  `sum` it is — `friends` and the full-table `formulas` never share a line with `sum`, so one
 *  gutter slot serves those. The single-strip `formulas` (`only`) is different: it sits BESIDE
 *  the sum card — to its right, vertically centred against it — not instead of it and not
 *  underneath it either: the sum card is "the question", the strip is "the trick for it", and a
 *  child should be able to see both at once, side by side, instead of the formula replacing (or
 *  sitting below) the question it answers. */
const SUM_S = (portrait: boolean) => (portrait ? 0.62 : 0.78);
const CARD_GAP = 18; // unscaled horizontal gap between the sum card and the formula strip beside it
const cardSize = (scene: Scene, portrait: boolean) => {
  if (scene.friends) return { nat: BIG_FRIENDS_NAT, scale: portrait ? 0.6 : 0.84 };
  if (scene.formulas) return { nat: BIG_FORMULA_NAT, scale: portrait ? 0.5 : 0.8 };
  if (scene.sum) return { nat: COL_NAT, scale: SUM_S(portrait) };
  return null;
};

const cardSlot = (
  L: { portrait: boolean; W: number; band: { stageTop: number; stageBottom: number }; cardBand: { top: number } | null },
  w: number,
  h: number
) =>
  L.portrait
    ? { x: (L.W - w) / 2, y: L.cardBand!.top + 8 }
    : { x: 44, y: L.band.stageTop + (L.band.stageBottom - L.band.stageTop - h) / 2 };

/** THE SUM CARD ALWAYS SITS IN ONE PLACE (top of the left column; 4:5: left of the card band) and the BIG FRIEND card goes directly under it
 *  (4:5: beside it), so neither jumps between lines. The teaching tables (friends / full formulas) keep the old centred slot. */
const sumFixedSlot = (L: { portrait: boolean; band: { stageTop: number }; cardBand: { top: number } | null }) =>
  L.portrait ? { x: 34, y: L.cardBand!.top + 8 } : { x: 44, y: L.band.stageTop + 34 };
const STRIP_S = (portrait: boolean) => (portrait ? 0.95 : 1.1);
const stripSlotE11 = (L: { portrait: boolean; band: { stageTop: number }; cardBand: { top: number } | null }) => {
  const s = STRIP_S(L.portrait);
  if (L.portrait) return { x: 34 + COL_NAT.w * SUM_S(true) + 16, y: L.cardBand!.top + 8, w: STRIP_NAT.w * s, h: STRIP_NAT.h * s };
  return { x: 44, y: L.band.stageTop + 34 + COL_NAT.h * SUM_S(false) + 18, w: STRIP_NAT.w * s, h: STRIP_NAT.h * s };
};

export const E11PirateIsland: React.FC = () => (
  <>
  <HideTextStyle />
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e011_big_friend_intro/E11.mp3"
    sfx={SFX_CUES}
    music={{ file: "lesson_bed.wav", loopFrames: 800, vol: 0.12 }}
    abacusFirstFrame={0}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_PIRATE}
    placeCard
    brandDark
    neatHands
    placeLabelHalo={() => true}
    chipInk="#06222C"
    countInk="#06222C"
    labelInk={["#06222C", "#06222C", "#06222C", "#06222C", "#06222C"]}
    captionComing={{ coming: "#5F7385", keyComing: "#A8441F" }}
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
      const card = cardSize(scene, L.portrait);
      if (card) {
        const w = card.nat.w * card.scale;
        const h = card.nat.h * card.scale;
        const sumOnly = Boolean(scene.sum && !scene.friends && !scene.formulas);
        out.push({ label: "teachCard", r: { ...(sumOnly ? sumFixedSlot(L) : cardSlot(L, w, h)), w, h } });
      }
      if (scene.doing) out.push({ label: "doing", r: stripSlotE11(L) });
      const elephantAside = Boolean(L.portrait && !scene.closing && card);
      if (scene.elephant) {
        const m = elephantAt(ctx.box, L, Boolean(scene.closing), elephantAside);
        out.push({
          label: "elephant",
          r: elephantRect(m),
          mayExitFrame: true,
        });
      }
      return out;
    }}
    renderOver={(scene, ctx) => (
      <>
        {/* THE ROD SPOTLIGHT — for lines that are ABOUT a rod without moving a bead on it. Two
            motions, not a static ring: a highlight badge that breathes (SCALES up and down,
            not just fades), and a chevron above it that BOUNCES toward the rod — two different
            kinds of motion instead of one opacity pulse, so it actually reads as "look, here"
            rather than a decorative outline sitting still. */}
        {scene.spotlightRod && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
          >
            {(() => {
              const rod = scene.targetRod ?? 0;
              const cx = rodX(ctx.box, rod);
              const cy = ctx.box.top + ctx.box.h / 2;
              const badgeW = 100 * ctx.box.scale;
              const badgeH = ctx.box.h - 6 * ctx.box.scale;
              const t = ctx.frame / FPS;
              // BREATHE: the badge itself scales 0.92 <-> 1.1, not just fades — a real size
              // change reads as motion even on a still frame grabbed mid-cycle.
              const breathe = 1 + Math.sin(t * 3.4) * 0.09;
              // BOUNCE: a chevron above the rod bobs up and down on its own rhythm (not locked
              // to the breathe cycle, so the two motions don't look like one thing).
              const bob = Math.abs(Math.sin(t * 2.6)) * 14 * ctx.box.scale;
              const chevronY = cy - badgeH / 2 - 78 * ctx.box.scale - bob;
              return (
                <>
                  <g transform={`translate(${cx} ${cy}) scale(${breathe}) translate(${-cx} ${-cy})`}>
                    <rect
                      x={cx - badgeW / 2}
                      y={cy - badgeH / 2}
                      width={badgeW}
                      height={badgeH}
                      rx={24 * ctx.box.scale}
                      fill="#FFD23F"
                      opacity={0.22}
                    />
                    <rect
                      x={cx - badgeW / 2}
                      y={cy - badgeH / 2}
                      width={badgeW}
                      height={badgeH}
                      rx={24 * ctx.box.scale}
                      fill="none"
                      stroke="#FFD23F"
                      strokeWidth={7}
                    />
                  </g>
                  <path
                    d={`M ${cx - 16 * ctx.box.scale} ${chevronY} L ${cx} ${chevronY + 16 * ctx.box.scale} L ${cx + 16 * ctx.box.scale} ${chevronY}`}
                    stroke="#FFD23F"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </>
              );
            })()}
          </svg>
        )}

        {/* "Every bead on it is already pushed." — the BEADS blink, not the rod's column,
            because the line is about the beads themselves, not about where to look. Five
            circles, one per bead on the ones rod at value nine (heaven down + all four earth
            up), positioned from the same bead geometry the Abacus component itself uses
            (HEAVEN_H/BEAM_H/BEAD_H), all flashing together — "every bead", not one at a time.
            A true on/off square-wave blink under 3Hz, not a smooth pulse, so it actually reads
            as a blink. */}
        {scene.blinkRod && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
          >
            {(() => {
              const cx = rodX(ctx.box, 0);
              const s = ctx.box.scale;
              const beadCenters = [91.5, 168.5, 229.5, 290.5, 351.5]; // heaven, then 4 earth beads
              const t = ctx.frame / FPS;
              const on = (t * 2.5) % 1 < 0.5;
              const opacity = on ? 0.65 : 0.08;
              return beadCenters.map((by, i) => (
                <circle key={i} cx={cx} cy={ctx.box.innerTop + by * s} r={30 * s} fill="#FFFFFF" opacity={opacity} />
              ));
            })()}
          </svg>
        )}

        {scene.closeBeat === "next" && <Twinkles frame={ctx.frame} W={ctx.layout.W} H={ctx.layout.H} />}
        {/* THE ISLAND'S EDGE FRIENDS: a parrot (bottom-left) and a crab (far right) */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const e = scene.elephant;
          const alive = p <= 3 || p >= 66 || e === "cheer";
          const unsure = e === "stuck" || e === "idea";
          const mood = pieceMood(alive, unsure);
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Pieces mood={mood} frame={ctx.frame} fps={FPS} pieces={[
                { kind: "parrot", x: 170, y: 890, scale: 0.9, show: !L.portrait && !scene.doing && !scene.sum },
                { kind: "crab", x: 1850, y: 925, scale: 0.66, facing: -1, show: !L.portrait && !scene.closing },
                { kind: "parrot", x: 120, y: 330, scale: 0.7, show: L.portrait, facing: 1 },
              ]} />
            </svg>
          );
        })()}

        {/* THE ELEPHANT */}
        {scene.elephant && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            {(() => {
              const card = cardSize(scene, ctx.layout.portrait);
              const m = elephantAt(
                ctx.box,
                ctx.layout,
                Boolean(scene.closing),
                Boolean(ctx.layout.portrait && !scene.closing && card)
              );
              return (
                <CastGroup x={m.x} y={m.y} scale={m.scale} actors={[{ role: "little", mood: SIDE[scene.elephant!], prop: "binoculars" }, { role: "big", mood: LEAD[scene.elephant!], enter: friendEnter(ctx.p, ctx.beatProgress), crown: friendCrown(ctx.p, ctx.beatProgress) }]} costume="pirate" progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
              );
            })()}
          </svg>
        )}

        {/* THE BIG FRIENDS TABLE */}
        {scene.friends && (() => {
          const L = ctx.layout;
          const card = cardSize(scene, L.portrait)!;
          const at = cardSlot(L, card.nat.w * card.scale, card.nat.h * card.scale);
          return (
            <div style={{ position: "absolute", left: at.x, top: at.y }}>
              <BigFriendCards ghost dimFloor={0.72}
                shown={scene.friends.shown}
                active={scene.friends.active}
                arriving={scene.friendsArriving}
                prevActive={scene.friendsPrev?.active}
                accent={CARD_ACCENT}
                progress={ctx.beatProgress}
                scale={card.scale}
              />
            </div>
          );
        })()}

        {/* THE FORMULA CARD — a single strip while the rule is spoken (now BESIDE the sum card,
            to its right, for the whole example, not instead of it and not below it), the full
            five on the closing "there is one for every number" line */}
        {scene.formulas && (() => {
          const L = ctx.layout;
          const card = cardSize(scene, L.portrait)!;
          const at = cardSlot(L, card.nat.w * card.scale, card.nat.h * card.scale);
          const left = at.x;
          const top = at.y;
          return (
            <div style={{ position: "absolute", left, top }}>
              <BigFriendFormulaList
                active={scene.formulas.active}
                stagger={scene.formulas.stagger}
                only={scene.formulas.only}
                arriving={scene.formulasArriving}
                accent={CARD_ACCENT}
                progress={ctx.beatProgress}
                scale={card.scale}
              />
            </div>
          );
        })()}

        {/* THE COLUMN SUM — up for the whole worked example, not just the answer, with the
            row currently being talked about lit: the top number while it's built, the addend
            row for the whole carry-and-remove sequence, the answer row once it's said. */}
        {scene.doing && (() => {
          const L = ctx.layout;
          const slot = stripSlotE11(L);
          const d = scene.doing;
          const step = Math.min(2, d.step + (d.marks ?? []).filter((m) => ctx.beatProgress >= m).length);
          return (
            <div style={{ position: "absolute", left: slot.x, top: slot.y }}>
              <FormulaStrip n={d.n} step={step as 0 | 1 | 2} base={10} accent="#7A1F5C" scale={STRIP_S(L.portrait)} />
            </div>
          );
        })()}

        {scene.sum && (() => {
          const L = ctx.layout;
          const card = cardSize(scene, L.portrait)!;
          const at = sumFixedSlot(L);
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
                bg={CARD_ACCENT} placeholderOpacity={0.9}
                progress={ctx.beatProgress}
                scale={card.scale}
              />
            </div>
          );
        })()}

        {/* the live value, above the abacus while a sum is being worked */}
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
                boxShadow: "0 8px 0 rgba(58,14,20,0.35)",
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
            <div
              style={{
                position: "absolute",
                left: ctx.layout.portrait ? (ctx.layout.W - 353) / 2 : 465,
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
              title={["all five", "big friends"]}
              example={
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {/* NONE highlighted, same reasoning as the closing reveal card: the teaser is
                      about all five, and the worked examples used only three of them. */}
                  {BIG_FRIEND_FORMULAS.map((f) => (
                    <span
                      key={f.n}
                      style={{
                        fontFamily: KID_FONT,
                        fontWeight: 700,
                        fontSize: 30,
                        color: CARD_ACCENT,
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
  </>
);

/** For tools/bb_audit.ts */
export const __audit = { sceneFor, PHRASES, SFX_CUES };
