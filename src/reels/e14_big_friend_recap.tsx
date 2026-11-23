// E14 · Beat the Beads: Big Friend Recap — 16:9 (portrait pass to follow).
//
// The season-finale recall test: E12 taught all nine BIG FRIEND adding formulas, E13 taught all
// nine taking-away formulas — this is E10's own "Beat the Beads" game-show format, played again,
// mixed (adding and taking away, never blocked), each round a real two-digit worked case built
// straight from the locked round table (see docs/E14_lines.txt's header comment for the full
// verification table and why each round's numbers were chosen).
//
// WHAT CARRIES OVER FROM E10, UNCHANGED IN SHAPE: the wheel-decides-the-round mechanic, the
// 3-2-1 countdown, the milestone-then-like-ask pair at the halfway point (EPISODE_RULES §3.9a —
// see the placement note below), the buzz-in rival-contestant gag.
//
// WHAT IS NEW: TWO RODS, not one — every round is a real two-digit number (see `rig`, copied from
// E13's two-rod convention, not E10's single-rod one). THE FORMULA CARD is `BigFriendFormulaList`
// (E11/E13), not E07/E10's small-friend `FormulaList`, switching between its `take`/add tables per
// round. A NEW "remember everything first" beat (p2-9) shows BOTH full 18-formula tables before
// the game starts — the structural change the user asked for before recording. TWO HEDGEHOGS
// (`src/components/e14/Hedgehog.tsx`), not E10's foxes — same buzz-in/cheer/think grammar, `curl`
// standing in for `worry` as the stuck reaction. A NEW arcade world set (`src/components/e14/
// Wheel.tsx` + `ticketglow`/`arcadefloor`/`prizewall`/`arcadeneon`/`jackpotfinale` in theme.ts),
// deliberately not E10's indigo-and-gold TV studio.
//
// LIKE-ASK PLACEMENT (EPISODE_RULES §3.9a): p51, right after round four's milestone (p50) — the
// same relative spot E10 used for its own game-show format (post-round-4, ~52% through), which is
// NOT the 94-96% mark E02-E07 used or E08's 72% spot; logged in EPISODE_RULES.md's placement table.
//
// Timing from src/data/e14.phrases.json, aligned from docs/E14_lines.txt. 95 phrases, 284.78 s.

import React from "react";
import { interpolate } from "remotion";
import phrasesJson from "../data/e14.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Hedgehog, HEDGEHOG_BOX, type HedgehogMood } from "../components/e14/Hedgehog";
import { Wheel, WHEEL_SEGMENTS, wheelBox } from "../components/e14/Wheel";
import {
  BigFriendFormulaList,
  BIG_FORMULA_ONE,
  BIG_FORMULA_ALL_NAT,
  BIG_FORMULA_GRID_NAT,
} from "../components/e11/BigFriendFormulaList";
import { ColumnSum, COL_NAT, type SumStep } from "../components/e06/ColumnSum";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, wordFrameIn } from "../stage/clock";
import { rodX } from "../stage/geometry";
import type { Scene as BaseScene } from "../stage/types";
import { RIG_ARCADE, WORLDS } from "../data/theme";
import { FPS } from "../data/tokens";
import { KID_FONT } from "../lib/fonts";

// THE ACTUAL FILE DURATION (ffprobe: 285.110703), not the aligner's "speech ends" timestamp
// (284.78) — same fix E10/E09 both needed for the same reason: that timestamp is where the ASR
// stops detecting words, with zero tail after it, so the video was cutting the instant "next
// time!" was deemed to end instead of after its natural decay. Found while re-investigating the
// user's "pacing still feels rushed" report — this alone was truncating ~0.33s of real audio.
//
// SECOND RECORDING (fresh take against the corrected, re-sequenced script): 271.568938s raw.
// Pacing was checked FIRST, before any alignment work, per the standing rule this episode
// established the hard way — even with a reading-note reminder, 19 of 29 `[pause N]` markers
// (including all 8 "3 second" reveal pauses, landing at only ~1.6-2.0s) were still short.
// Fixed with the same insert-real-silence-with-fades method as before, at each of the 19 deficit
// points, verified afterward with the same monotonic pause cross-check (all 8 reveal pauses now
// land at exactly 3.00s) and spot-checked with spectrograms at three of the new splice points for
// the click-artifact class found earlier in this same episode — all clean. Duration after that
// pass: 284.83898.
//
// BEYOND-SCRIPT HOLD TIME (this pass): two more gaps flagged by the user as too tight, neither
// tied to a scripted `[pause N]` marker: (1) the "You know them all." side-by-side showcase beat
// had dropped back to its original short ~0.48s gap in this fresh take (the earlier fix was
// specific to the PREVIOUS take's own audio and did not carry over to a brand new recording) —
// re-extended to ~2.0s, matching what was established before. (2) every round-to-round transition
// (answer reveal into the next "Round N — spin the wheel!") measured a tight ~0.8-1.0s across all
// 6 non-milestone transitions — added +0.5s to each. First attempt on 2 of the 6 (rounds 7 and 8)
// landed the inserted silence INSIDE the phrase (between "Round" and the round number) rather than
// before it, caught by re-running the alignment and reading the actual word timings rather than
// assuming the insertion landed where intended — fixed by swapping the "Round" word and the pause
// back into the correct order.
//
// ROUND 7 PICKUP: the user caught the original take actually saying "take away three" in round
// 7's setup line, not "two" — a real mismatch against the locked 91−2=89 example (friend 8, pair
// {2,8}). NOT fixed by changing the number to match "three" (that would need friend 7, putting
// pair {3,7} in a THIRD round on top of rounds 2 and 6, reopening the exact pair-adjacency problem
// already fixed twice this episode). Fixed with a one-round pickup instead: user re-recorded just
// round 7's own block (`~/Downloads/e14_round_7.mp3`), spliced in replacing the old landsOn-
// through-answer segment, its own reveal pause extended from its natural ~1.9s to the standard
// 3.0s the same way as every other reveal pause this episode, re-aligned fresh, confirmed the
// spoken word is now genuinely "two".
//
// TAIL-CLIP FIX: user reported round 7's ending ("...eighty-nine!") sounding cut off. Verified
// directly (silencedetect + spectrogram on the ORIGINAL pickup recording, not just the spliced
// result): the pickup was trimmed at Whisper's own "speech ends" estimate (23.96s), but the real
// acoustic decay of "eighty-nine!" continued to ~24.25s — the same class of ASR-endpoint
// underestimate this episode has hit before, just not re-checked carefully enough on this specific
// edit. Re-trimmed the pickup to 24.35s (verified past the real silence boundary) with a proper
// fade-out at its own end (the original had a fade-IN only, no fade-out, which was the second half
// of the same defect), re-spliced, re-aligned. Round 6's tail was checked the same way and found
// NOT clipped (real silence begins within 30ms of its marked boundary) — the report was accurate
// about round 7, not round 6. Final duration is the real ffprobe value after all of this.
export const AUDIO_SEC = 291.218980;
export const E14_DURATION = sec(AUDIO_SEC, FPS);

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

interface Scene extends BaseScene {
  hedgehogs?: { left: HedgehogMood; right: HedgehogMood };
  wheel?: { roundIdx: number };
  wheelIdle?: boolean;
  roundNum?: number;
  countdownRound?: number;
  /** the per-round formula card — one row lit, add or take depending on the round's own sign */
  formulas?: { active: number; take: boolean };
  formulasArriving?: boolean;
  sum?: { a: number; b: number; op: string; total?: number; step: SumStep };
  big?: string;
  valueChip?: boolean;
  /** the "remember everything first" showcase — both 18-formula tables, shown once, singly then
   *  side by side, before the game begins. */
  showcase?: { side: "add" | "take" | "both"; stagger?: boolean };
  /** no bead hand, no arrow: both rods pulse gold together on a round's answer line, the same
   *  device E12/E13 use for any move that touches two rods in one breath. */
  combinedGlow?: number[];
  midSubscribe?: boolean;
}

const BASE = 1.02;
const BIG_TOP = 20;
const BIG_SIZE = 74;
const BIG_H = 156;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.62 + 80);

const PORTRAIT_ROOM = { left: 80, right: 210 };

type RoundPhrases = {
  announce: number;
  landsOn: number;
  make: number;
  stuck: number[];
  question: number[];
  reveal: number;
  formula: number;
  answer: number;
  winner: "left" | "right";
};
type RoundContent = {
  start: number;
  a: number;
  b: number;
  op: "+" | "−";
  ans: number;
  n: number; // the friend
};

// Mixed order, locked with the user (see docs/E14_lines.txt's header for the full derivation and
// verification table): +4, −7, +8, −2, +5, −3, +6, −9.
// SECOND RECORDING (fresh take, docs/E14_lines.txt regenerated): rounds 1-3 unchanged; round 4 is
// now {1,9}/−9 (was {2,8}/−2, moved to round 7 to fix pair-adjacency — {2,8} was tested in rounds
// 3 AND 4 back to back, breaking "mixed, never blocked"); round 5 is now {4,6}/+6 (was round 7's
// content); round 6 unchanged; round 7 is now {2,8}/−2 with a GENUINELY NEW number (91−2=89, not
// the old 50−2=48 — the user's actual complaint was the number itself, not its round position);
// round 8 is now {5,5}/+5 (was round 5's content). All indices below re-derived fresh from the
// new recording's own alignment, not shifted by hand from the old ones.
const ROUNDS: RoundPhrases[] = [
  { announce: 16, landsOn: 17, make: 18, stuck: [19], question: [20], reveal: 21, formula: 22, answer: 23, winner: "left" },
  { announce: 24, landsOn: 25, make: 26, stuck: [27], question: [28], reveal: 29, formula: 30, answer: 31, winner: "right" },
  { announce: 32, landsOn: 33, make: 34, stuck: [35, 36], question: [37], reveal: 38, formula: 39, answer: 40, winner: "left" },
  { announce: 41, landsOn: 42, make: 43, stuck: [44], question: [45], reveal: 46, formula: 47, answer: 48, winner: "right" },
  { announce: 52, landsOn: 53, make: 54, stuck: [55], question: [56], reveal: 57, formula: 58, answer: 59, winner: "left" },
  { announce: 60, landsOn: 61, make: 62, stuck: [63, 64], question: [65, 66], reveal: 67, formula: 68, answer: 69, winner: "right" },
  { announce: 70, landsOn: 71, make: 72, stuck: [73], question: [74, 75], reveal: 76, formula: 77, answer: 78, winner: "left" },
  { announce: 79, landsOn: 80, make: 81, stuck: [82], question: [83], reveal: 84, formula: 85, answer: 86, winner: "right" },
];

const CONTENT: RoundContent[] = [
  { start: 37, a: 37, b: 4, op: "+", ans: 41, n: 6 },
  { start: 81, a: 81, b: 7, op: "−", ans: 74, n: 3 },
  { start: 63, a: 63, b: 8, op: "+", ans: 71, n: 2 },
  { start: 96, a: 96, b: 9, op: "−", ans: 87, n: 1 },
  { start: 29, a: 29, b: 6, op: "+", ans: 35, n: 4 },
  { start: 62, a: 62, b: 3, op: "−", ans: 59, n: 7 },
  { start: 91, a: 91, b: 2, op: "−", ans: 89, n: 8 },
  { start: 68, a: 68, b: 5, op: "+", ans: 73, n: 5 },
];

/** Which of the wheel's 18 segments each PLAYED round actually lands on. The wheel now shows all
 *  18 Big Friend formulas (user: "we have 18 formulas, why does the wheel only have 8?"); the
 *  recorded audio still only narrates these 8 rounds, so this maps each round to its own correct
 *  slice within the fuller wheel rather than changing which rounds are actually played. */
const SEGMENT_FOR_ROUND: number[] = CONTENT.map((c) => {
  const label = `${c.op}${c.b}`;
  const idx = WHEEL_SEGMENTS.findIndex((s) => s.label === label);
  if (idx === -1) throw new Error(`no wheel segment for round label ${label}`);
  return idx;
});

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

const digits = (v: number): [number, number] => [v % 10, Math.floor(v / 10) % 10];

const VALUE: Record<number, number> = (() => {
  const v: Record<number, number> = {};
  for (let p = 0; p < PHRASES.length; p++) v[p] = 0;
  ROUNDS.forEach((r, i) => {
    const c = CONTENT[i];
    for (let p = r.make; p <= r.formula; p++) v[p] = c.start;
    v[r.answer] = c.ans;
  });
  return v;
})();

const valueAt = (p: number) => VALUE[p] ?? 0;

/** Every round's announce (reset to zero for the spin) and make (the puzzle built silently) —
 *  no taught move at either, snap with no arrow. */
const SILENT_SET = new Set(ROUNDS.flatMap((r) => [r.announce, r.make]));

/** The abacus is on stage for every round; the showcase, milestone, like ask and close hide it. */
const abacusFrom = (p: number) => ROUNDS.some((r) => p >= r.announce && p <= r.answer);

const rig = (p: number) => {
  const d = digits(valueAt(p));
  return Array.from({ length: 5 }, (_, i) => ({
    value: i < 2 ? d[i] : 0,
    focus: i < 2 ? 1 : 0.35,
    chipLower: i < 2 || undefined,
    chipUpper: i < 2 || undefined,
    placeName: i < 2 ? (i === 0 ? "ones" : "tens") : undefined,
  }));
};

/** Every round's answer line moves BOTH rods in one breath — no hand, no arrow, the pulsing gold
 *  glow E12/E13 built for exactly this (`combinedGlow`), never the slow two-step first-teaching
 *  reveal — this is recall, not first teaching. */
const COMBINED_ANSWER = new Set(ROUNDS.map((r) => r.answer));

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

/** The formula card — one row lit, from the round's own trick, up from `reveal` (the friend is
 *  named) through `formula` (the equation is stated), gone the instant the big answer takes over. */
// ROOT CAUSE (user-caught, systemic across all 8 rounds): `BigFriendFormulaList`'s `active` prop
// picks which formula ROW lights up, and a formula row is keyed by the number IN the operation
// itself (round 1's own "+4"), never by its friend — `CONTENT[i].n` is documented as THE FRIEND
// (round 1: 4's friend is 6, `n: 6`), so passing `c.n` here lit "+6 = −4 + 10" instead of the
// correct "+4 = −6 + 10" on every single round, a straight n/friend swap. `c.b` is the actual
// operation amount (round 1: `b: 4`) and is what belongs here — verified against the locked round
// table for all 8 rounds before landing on this fix, not just round 1.
const FORMULAS: Record<number, NonNullable<Scene["formulas"]>> = (() => {
  const out: Record<number, NonNullable<Scene["formulas"]>> = {};
  ROUNDS.forEach((r, i) => {
    const c = CONTENT[i];
    out[r.reveal] = { active: c.b, take: c.op === "−" };
    out[r.formula] = { active: c.b, take: c.op === "−" };
  });
  return out;
})();

/** THE FORMULA LINE ITSELF — "Plus four equals minus six, plus ten." — the one moment the card
 *  is not just up but is literally what is being read aloud. Gets its own emphasis: a scale-pop
 *  on arrival and the sum card dimmed beside it, same `DIM_CARD` coexistence-emphasis idiom E13
 *  already built for "two cards up, one is what the line is about" (there: the sum card dimmed
 *  while the friends-lookup card had the floor; here: the sum card dims while the formula card
 *  does). Reused rather than invented, per the house rule of matching an established pattern. */
const FORMULA_FOCUS = new Set(ROUNDS.map((r) => r.formula));

/** The number word, spelled EXACTLY as docs/E14_lines.txt says it — cross-checked against every
 *  round's actual `make`/`answer` phrase text in src/data/e14.phrases.json (e.g. round 1's make
 *  phrase is literally "Make thirty-seven, then try to add four more.") before this table was
 *  written, not assumed from CONTENT's numeric values. */
const WORD: Record<number, string> = {
  37: "thirty-seven", 4: "four", 41: "forty-one",
  81: "eighty-one", 7: "seven", 74: "seventy-four",
  63: "sixty-three", 8: "eight", 71: "seventy-one",
  96: "ninety-six", 9: "nine", 87: "eighty-seven", 1: "one",
  29: "twenty-nine", 6: "six", 35: "thirty-five",
  62: "sixty-two", 3: "three", 59: "fifty-nine",
  91: "ninety-one", 2: "two", 89: "eighty-nine",
  68: "sixty-eight", 5: "five", 73: "seventy-three",
};

/** WORD-SYNCED PER-NUMBER FLASH on the formula card itself (user: the whole card focuses, but the
 *  individual numbers inside it — the operand, the friend, the ten — should each flash exactly
 *  when their own word is spoken, same as the sum card's own `SUM_FLASH` mechanism, just applied
 *  to `BigFriendFormulaList`'s new `flashPart`/`flashK` props instead of a whole row). Built from
 *  each round's own `r.formula` phrase text (e.g. round 1: "Plus four equals minus six, plus
 *  ten.") — cross-checked word-for-word against every round below, not assumed from CONTENT's
 *  numbers alone. Round 8 is the one edge case: "Plus five equals minus five, plus ten." says
 *  "five" TWICE (operand AND friend, since {5,5} is its own pair) — `nth` picks the first
 *  occurrence for the operand and the second for the friend, or the two would collide on the same
 *  word. */
type FormulaPart = "operand" | "friend" | "ten";
const FORMULA_FLASH: Record<number, { word: string; part: FormulaPart; nth?: number }[]> = (() => {
  const out: Record<number, { word: string; part: FormulaPart; nth?: number }[]> = {};
  ROUNDS.forEach((r, i) => {
    const c = CONTENT[i];
    const sameWord = c.b === c.n; // round 8 only: {5,5}
    out[r.formula] = [
      { word: WORD[c.b], part: "operand", nth: 0 },
      { word: WORD[c.n], part: "friend", nth: sameWord ? 1 : 0 },
      { word: "ten", part: "ten", nth: 0 },
    ];
  });
  return out;
})();

/** The sum, in column form, up from `make` through `formula`, gone the instant the big answer
 *  card takes over — same convention E10 uses. `step` picks which row is highlighted: "first"
 *  while the line is about the STARTING number (`make`), "second" while it is about the number
 *  being combined / the friend search (`stuck`/`question`/`reveal`/`formula`) — matching E13's
 *  own step convention, cross-checked against each round's actual phrase text below. */
const SUMS: Record<number, NonNullable<Scene["sum"]>> = (() => {
  const out: Record<number, NonNullable<Scene["sum"]>> = {};
  ROUNDS.forEach((r, i) => {
    const c = CONTENT[i];
    const base = { a: c.a, b: c.b, op: c.op };
    out[r.make] = { ...base, step: "first" };
    for (const p of r.stuck) out[p] = { ...base, step: "second" };
    for (const p of r.question) out[p] = { ...base, step: "second" };
    out[r.reveal] = { ...base, step: "second" };
    out[r.formula] = { ...base, step: "second" };
  });
  return out;
})();
const SUM_FIRST = new Set(Object.keys(SUMS).map(Number).filter((p) => !SUMS[p - 1]));

const isWorking = (p: number) => Boolean(SUMS[p]) && !ANSWER_TEXT[p];

/** WORD-LEVEL NUMBER FLASH on the sum card — the exact defect class E12/E13 shipped and then had
 *  to fix (row-highlight and word-flash drifting out of sync with the actual spoken word): every
 *  entry below is the REAL word from that phrase's own text, matched against the snapped word
 *  timestamps in e14.phrases.json, never a fixed offset or a guessed frame. */
type SumRow = "first" | "second" | "answer";
const SUM_FLASH: Record<number, { word: string; row: SumRow }[]> = (() => {
  const out: Record<number, { word: string; row: SumRow }[]> = {};
  ROUNDS.forEach((r, i) => {
    const c = CONTENT[i];
    // NOT r.answer: `scene.sum` is hidden the instant the big answer card takes over (see
    // `ANSWER_TEXT` gating below) — the answer's own reveal is the sticker card, not a sum-row
    // flash, same convention E10/E13 both use, so a flash entry there would never be reachable.
    out[r.make] = [{ word: WORD[c.a], row: "first" }, { word: WORD[c.b], row: "second" }];
  });
  return out;
})();

const spokenNow = <T extends { word: string; nth?: number }>(
  p: number,
  frame: number,
  sequence: T[]
): { step: T; k: number } | undefined => {
  let current: { step: T; at: number } | undefined;
  for (const step of sequence) {
    const at = wordFrameIn(PHRASES[p], step.word, FPS, step.nth ?? 0);
    if (at !== null && frame >= at && (!current || at >= current.at)) current = { step, at };
  }
  if (!current) return undefined;
  const k = interpolate(frame, [current.at, current.at + 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { step: current.step, k };
};

const sumFlashFor = (p: number, frame: number): { row: SumRow; k: number } | undefined => {
  const seq = SUM_FLASH[p];
  if (!seq) return undefined;
  const hit = spokenNow(p, frame, seq);
  return hit ? { row: hit.step.row, k: hit.k } : undefined;
};

const formulaFlashFor = (p: number, frame: number): { part: FormulaPart; k: number } | undefined => {
  const seq = FORMULA_FLASH[p];
  if (!seq) return undefined;
  const hit = spokenNow(p, frame, seq);
  return hit ? { part: hit.step.part, k: hit.k } : undefined;
};

const WHEEL_AT: Record<number, number> = (() => {
  const out: Record<number, number> = {};
  ROUNDS.forEach((r, i) => {
    out[r.announce] = i;
    out[r.landsOn] = i;
  });
  return out;
})();

// Starts at the ANNOUNCE PHRASE'S OWN START, not the word "spin" — the recorded gap between
// "spin" itself and "lands" is only ~1.9s (real audio, measured), which crammed the wheel's own
// multi-turn spin into a blur the user read as "rushed". This recovers the announce line's own
// ~2s runway for free (no re-recording — the audio already has that much room; "Round one — spin
// the wheel!" is being SAID while the wheel is already turning, which reads as anticipation, not
// a mismatch) while `land` still catches exactly on the word "lands", unchanged.
const ROUND_SPIN = ROUNDS.map((r) => ({
  start: sec(PHRASES[r.announce].start, FPS),
  land: wordFrameIn(PHRASES[r.landsOn], "lands", FPS) ?? sec(PHRASES[r.landsOn].start, FPS),
}));

const ROUND_OF: Record<number, number> = (() => {
  const out: Record<number, number> = {};
  ROUNDS.forEach((r, i) => {
    for (let p = r.announce; p <= r.answer; p++) out[p] = i + 1;
  });
  return out;
})();

const COUNTDOWN_AT: Record<number, number> = (() => {
  const out: Record<number, number> = {};
  ROUNDS.forEach((r, i) => {
    for (const p of r.question) out[p] = i;
  });
  return out;
})();
const COUNTDOWN_WINDOW = ROUNDS.map((r) => ({
  start: sec(PHRASES[r.question[0]].start, FPS),
  end: sec(PHRASES[r.reveal].start, FPS),
}));

/** THE HEDGEHOGS — same grammar as E10's foxes: `point` while the wheel spins and the puzzle is
 *  set, `curl` on the stuck reaction (this episode's own signature move, replacing `worry`),
 *  `think` across the question's hold, the round's winner `buzz`es in on the reveal while the
 *  other defers, both `cheer` on the answer. */
const HEDGEHOGS: Record<number, { left: HedgehogMood; right: HedgehogMood }> = (() => {
  const out: Record<number, { left: HedgehogMood; right: HedgehogMood }> = {};
  const put = (ps: number[], l: HedgehogMood, r: HedgehogMood) => ps.forEach((p) => (out[p] = { left: l, right: r }));
  ROUNDS.forEach((r) => {
    put([r.make], "point", "point");
    put(r.stuck, "curl", "curl");
    put(r.question, "think", "think");
    put([r.reveal], r.winner === "left" ? "buzz" : "point", r.winner === "right" ? "buzz" : "point");
    put([r.formula], "point", "point");
    put([r.answer], "cheer", "cheer");
  });
  return out;
})();

/** THE FORMULA SHOWCASE — p2-9, the structural addition the user asked for before recording:
 *  both full 18-formula tables on screen before the quiz starts. */
// `stagger` fires ONLY on the phrase the card actually arrives on (2 for add, 5 for take) — the
// same convention E12/E13 use for this component (`put([92], { stagger: true, all: true })`,
// nothing on the phrases after). Leaving `stagger` (and therefore the entrance replay) on for
// every phrase that shares a card was a real bug this session found: phrase_sheet flagged p4-6
// and p8 as visually STALE against the line before them, because the reveal was silently
// RESTARTING from row one on every single phrase instead of holding fully lit — two consecutive
// early-reveal states look near-identical regardless of which card is underneath. Held phrases
// pass `progress: 1` in the render block below instead.
const SHOWCASE: Record<number, NonNullable<Scene["showcase"]>> = {
  2: { side: "add", stagger: true },
  3: { side: "add" },
  4: { side: "add" },
  5: { side: "take", stagger: true },
  6: { side: "take" },
  7: { side: "both" },
  8: { side: "both" },
};

/** Which showcase row is lit, word-synced to the ONLY numbers each line actually names — p4 says
 *  "one, two, three... nine" (not four through eight, so those rows are never singled out as
 *  active, only shown as part of the full table), p6 says "one... nine" the same way. Real word
 *  timestamps from e14.phrases.json, not a guessed continuous sweep across unnamed rows. */
const ROW_SWEEP: Record<number, { word: string; n: number }[]> = {
  4: [{ word: "one", n: 1 }, { word: "two", n: 2 }, { word: "three", n: 3 }, { word: "nine", n: 9 }],
  6: [{ word: "one", n: 1 }, { word: "nine", n: 9 }],
};
const activeRowFor = (p: number, frame: number): number | undefined => {
  const seq = ROW_SWEEP[p];
  if (!seq) return undefined;
  let n: number | undefined;
  for (const step of seq) {
    const at = wordFrameIn(PHRASES[p], step.word, FPS, 0);
    if (at !== null && frame >= at) n = step.n;
  }
  return n;
};

const HEADLINE: Record<number, string> = {
  0: "beat the beads!",
  2: "remember everything first",
  // NAMING which table is on screen — the showcase card's own inner "BIG FRIENDS" label does not
  // say ADD or TAKE, and the user asked for a higher-level title above the card that does, reusing
  // the same `headline`/HeadlinePill mechanism the rest of the series already uses for exactly
  // this "name what's on screen" job, rather than inventing new UI.
  3: "big friend adding",
  4: "big friend adding",
  5: "big friend taking away",
  6: "big friend taking away",
  7: "all eighteen formulas!",
  8: "all eighteen formulas!",
  9: "let's go!",
  16: "round one",
  87: "you beat every big friend!",
};

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const onAbacus = abacusFrom(p);
  const combined = onAbacus && COMBINED_ANSWER.has(p);
  const base = {
    stage: "abacus" as const,
    rods: rig(p),
    scale: BASE,
    targetRod: 0,
    highlight: null,
    hand: undefined,
    hand2: undefined,
    moveOn: onAbacus && !SILENT_SET.has(p) && valueAt(p) !== valueAt(p - 1) ? "$last" : undefined,
    silentCut: onAbacus && SILENT_SET.has(p),
    celebrate: BURST_FROM.has(p) ? ("burst" as const) : undefined,
    celebrateFrom: BURST_FROM.get(p),
    sum: onAbacus && !ANSWER_TEXT[p] ? SUMS[p] : undefined,
    formulas: onAbacus ? FORMULAS[p] : undefined,
    formulasArriving: Boolean(FORMULAS[p]) && !FORMULAS[p - 1],
    big: ANSWER_TEXT[p],
    valueChip: onAbacus && isWorking(p) && !ANSWER_TEXT[p],
    wheel: WHEEL_AT[p] !== undefined ? { roundIdx: WHEEL_AT[p] } : undefined,
    hedgehogs: HEDGEHOGS[p],
    roundNum: ROUND_OF[p],
    countdownRound: COUNTDOWN_AT[p],
    combinedGlow: combined ? [0, 1] : undefined,
    headline: HEADLINE[p],
    showcase: SHOWCASE[p],
  };

  // -------------------------------------------------------------- 1 · HOOK (ticketglow)
  //
  // motion_check flagged p1 ("Today, we mix...") as frozen — 5.5s of nothing but two waving
  // mascots against a still backdrop. E10's own cold open (p<=5) keeps its wheel idly turning
  // from frame 0 for exactly this reason; this reuses that same fix rather than inventing a new
  // one, and it previews the episode's own game mechanic before the rules are even explained.
  if (p <= 1) {
    return {
      ...base,
      world: "ticketglow",
      closing: true,
      wheelIdle: true,
      hedgehogs: { left: "wave", right: "wave" },
    };
  }

  // -------------------------------------------------------------- 2 · REMEMBER EVERYTHING FIRST
  //
  // p8 ("You know them all.") also flagged stale against p7 — both show the SAME two static
  // cards, so with no per-row highlight active in "both" mode the only change was the shine
  // sweep's own phase, not enough on its own. A confirming burst on the exact line that says the
  // child already knows every formula is both the honest visual (this IS the "you got it!"
  // beat, same idiom `celebrate` already uses for every answer reveal) and a real, sizeable
  // pixel change, not a cosmetic patch for the checker alone.
  if (p <= 8) {
    return {
      ...base,
      world: "ticketglow",
      closing: true,
      hedgehogs: p <= 4 ? { left: "point", right: "sit" } : p <= 6 ? { left: "sit", right: "point" } : { left: "cheer", right: "cheer" },
      celebrate: p === 8 ? ("burst" as const) : base.celebrate,
      celebrateFrom: p === 8 ? sec(PHRASES[8].start, FPS) : base.celebrateFrom,
    };
  }

  // -------------------------------------------------------------- 3 · GAME RULES (ticketglow -> arcadefloor)
  if (p <= 15) {
    return {
      ...base,
      world: "ticketglow",
      closing: true,
      wheelIdle: true,
      hedgehogs: { left: "wave", right: "point" },
    };
  }

  // -------------------------------------------------------------- 4 · ROUNDS ONE-FOUR (arcadefloor)
  if (p <= 48) {
    return { ...base, world: "arcadefloor", closing: Boolean(base.wheel) };
  }

  // -------------------------------------------------------------- 5a · THE MILESTONE (prizewall)
  if (p === 49) {
    return {
      ...base,
      world: "prizewall",
      closing: true,
      closeBeat: "milestone",
      worldWash: 0.5,
      celebrate: "party" as const,
      headline: "halfway there!",
      hedgehogs: { left: "cheer", right: "cheer" },
    };
  }

  // -------------------------------------------------------------- 5b · THE LIKE ASK (prizewall)
  if (p === 50) {
    return {
      ...base,
      world: "prizewall",
      closing: true,
      closeBeat: "subscribe",
      worldWash: 0.5,
      hedgehogs: { left: "wave", right: "wave" },
    };
  }

  // -------------------------------------------------------------- 5c · KEEP MIXING (prizewall)
  if (p === 51) {
    return {
      ...base,
      world: "prizewall",
      closing: true,
      worldWash: 0.5,
      wheelIdle: true,
      hedgehogs: { left: "point", right: "point" },
    };
  }

  // -------------------------------------------------------------- 6 · ROUNDS FIVE-EIGHT (arcadeneon)
  if (p <= 86) {
    return { ...base, world: "arcadeneon", closing: Boolean(base.wheel) };
  }

  // -------------------------------------------------------------- 7 · RECAP (jackpotfinale)
  //
  // p88 also flagged frozen (4.1s of two static "cheer" hedgehogs after the p87 burst decays) —
  // same wheelIdle fix, applied to the whole recap stretch rather than just the one flagged line
  // so the fix reads as a deliberate choice (the wheel stays visible through the whole recap),
  // not a patch aimed at a single frame.
  if (p <= 89) {
    return {
      ...base,
      world: "jackpotfinale",
      closing: true,
      wheelIdle: true,
      celebrate: p === 87 ? ("party" as const) : base.celebrate,
      hedgehogs: { left: "cheer", right: "cheer" },
    };
  }
  // p90 ("Try Beat the Beads on your own abacus at home.") — the send-off invitation to keep
  // practicing. User ask: the wheel idly turning on the LEFT (paying off the earlier "frozen"
  // fix the same way, a callback to the game), NEW practice sums — beyond the 8 played — on the
  // RIGHT, unworked ("= ?"), inviting the child to try them on their own abacus. Handled as its
  // own `closeBeat` (not the shared centred `wheelIdle`) since this beat needs the wheel off to
  // one side, not centred.
  if (p <= 90) {
    return {
      ...base,
      world: "jackpotfinale",
      closing: true,
      closeBeat: "practice",
      hedgehogs: undefined,
    };
  }

  // -------------------------------------------------------------- 8 · CLOSE (jackpotfinale)
  return {
    ...base,
    world: "jackpotfinale",
    closing: true,
    closeBeat: p <= 92 ? "store" : "next",
    worldWash: 0.55,
    noCaption: p === 91 || p === 92,
    hedgehogs: p >= 93 ? { left: "wave", right: "cheer" } : undefined,
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
    add(on(i, "$last"), "abacus_move.mp3", 30, 0.32);
  }
  for (const i of ANSWER_LINES) add(ANSWER_FRAME.get(i)!, "option_correct_ans.mp3", 60, 0.3);

  ROUNDS.forEach((r, i) => {
    add(ROUND_SPIN[i].start, "wheel_spin.mp3", 78, 0.42);
    add(ROUND_SPIN[i].land, "wheel_land.mp3", 40, 0.34);
    add(on(r.stuck[0], "$last"), STUCK_SFX[i], 30, 0.46);
    add(at(r.reveal) + 2, "buzzer.mp3", 24, 0.3);
    add(at(r.reveal) + 3, "friend_sparkle.mp3", 42, 0.22);
  });

  add(on(0, "again"), "cta_pop.mp3", 30, 0.26);
  add(on(9, "fast"), "count_hook.mp3", 40, 0.26);
  add(on(7, "formulas"), "friend_sparkle.mp3", 46, 0.26);

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

  for (let i = 1; i < PHRASES.length; i++) {
    const s = sceneFor(i);
    const q = sceneFor(i - 1);
    if (!s.hedgehogs || s.hand) continue;
    const nowCheer = s.hedgehogs.left === "cheer" && s.hedgehogs.right === "cheer";
    const wasCheer = q.hedgehogs?.left === "cheer" && q.hedgehogs?.right === "cheer";
    if (nowCheer && !wasCheer) {
      add(at(i) + Math.round((sec(PHRASES[i].end, FPS) - at(i)) * 0.12), "clap.mp3", 90, 0.18);
    }
  }
  return cues;
})();

// ---------------------------------------------------------------- placement
const HEDGE_GAP = 80;
const HEDGE_HALF = HEDGE_GAP + HEDGEHOG_BOX.half;

const hedgehogsAt = (
  box: { left: number; w: number; top: number; h: number; scale: number },
  L: { W: number; H: number; portrait: boolean },
  closing = false
) => {
  if (closing) {
    const scale = L.portrait ? 0.82 : 0.95;
    return { x: L.W - 190 * scale, y: L.H * (L.portrait ? 0.8 : 0.86), scale };
  }
  if (L.portrait) {
    return { x: 780, y: 1120, scale: 0.8 };
  }
  const scale = box.scale * 0.88;
  return {
    x: Math.min(box.left + box.w + HEDGE_HALF * scale + 24, L.W - HEDGE_HALF * scale - 14),
    y: box.top + box.h + 16,
    scale,
  };
};

const hedgehogsRect = (m: { x: number; y: number; scale: number }) => ({
  x: m.x - HEDGE_HALF * m.scale,
  y: m.y - HEDGEHOG_BOX.up * m.scale,
  w: HEDGE_HALF * 2 * m.scale,
  h: (HEDGEHOG_BOX.up + HEDGEHOG_BOX.down) * m.scale,
});

const wheelAt = (L: { portrait: boolean; W: number; band: { stageTop: number; stageBottom: number } }) => {
  const cy = (L.band.stageTop + L.band.stageBottom) / 2;
  const radius = L.portrait ? 220 : 260;
  return { x: L.W / 2, y: cy, radius };
};
const wheelRect = (L: { portrait: boolean; W: number; band: { stageTop: number; stageBottom: number } }) => {
  const m = wheelAt(L);
  const box = wheelBox(m.radius);
  return { x: m.x - box.half, y: m.y - box.up, w: box.half * 2, h: box.up + box.down };
};

// -------------------------------------------------------------- THE "PRACTICE MORE" CLOSE BEAT
//
// "Try Beat the Beads on your own abacus at home." — user ask: the wheel idly turning on the
// LEFT (the same "keep the wheel alive" fix already used elsewhere in this episode, just moved
// off-centre), four NEW unworked practice sums on the RIGHT beyond the 8 already played. Checked
// the real stage band (`BAND`: stageTop 220, stageBottom 840, 620px usable) before picking sizes,
// same "use the space, don't shrink defensively" principle used for every other sizing fix this
// session — a smaller wheel (radius 190 vs the round-game's own 260) leaves genuine room for the
// wheel AND the four cards side by side rather than cramming both into the full-size slots.
const PRACTICE_WHEEL_RADIUS = 190;
const practiceWheelAt = (L: { band: { stageTop: number; stageBottom: number } }) => ({
  x: 470,
  y: (L.band.stageTop + L.band.stageBottom) / 2,
  radius: PRACTICE_WHEEL_RADIUS,
});
const practiceWheelRect = (L: { band: { stageTop: number; stageBottom: number } }) => {
  const m = practiceWheelAt(L);
  const box = wheelBox(m.radius);
  return { x: m.x - box.half, y: m.y - box.up, w: box.half * 2, h: box.up + box.down };
};

/** Four NEW two-digit examples, beyond the 8 played rounds — verified against the same
 *  direct-move rule as every worked example this episode, no reuse of any played round's own
 *  numbers (37,81,63,96,29,62,91,68 / 41,74,71,87,35,59,89,73), and no 50 or "50-shaped" (tens
 *  digit 5, ones digit 0) number, per the user's explicit ask to steer clear of that number
 *  entirely after the earlier back-and-forth over it.
 *    80 − 8 = 72   (friend 2, d=0 — direct, empty rod)
 *    42 − 3 = 39   (friend 7, d=2 — direct)
 *    27 + 3 = 30   (friend 7, d=7 — direct, f>5)
 *    19 + 5 = 24   (friend 5, d=9 — direct, f==5 and d≥5)
 *  Shown UNWORKED (no total, step "none") — an invitation to try, not a fifth worked example. */
const PRACTICE_SUMS: { a: number; b: number; op: "+" | "−" }[] = [
  { a: 80, b: 8, op: "−" },
  { a: 42, b: 3, op: "−" },
  { a: 27, b: 3, op: "+" },
  { a: 19, b: 5, op: "+" },
];
const PRACTICE_SUM_S = 0.42;
const practiceSlot = (L: { W: number; band: { stageTop: number; stageBottom: number } }) => {
  const w = COL_NAT.w * PRACTICE_SUM_S;
  const h = COL_NAT.h * PRACTICE_SUM_S;
  const gap = 18;
  const totalH = PRACTICE_SUMS.length * h + (PRACTICE_SUMS.length - 1) * gap;
  const centerY = (L.band.stageTop + L.band.stageBottom) / 2;
  return { x: L.W - w - 130, y: centerY - totalH / 2, w, h, gap };
};

const WHEEL_TITLE_H = 70;
const wheelTitleSlot = (L: { portrait: boolean; W: number }) => ({
  x: L.W / 2 - (L.portrait ? 270 : 320),
  y: 26,
  w: (L.portrait ? 270 : 320) * 2,
  h: WHEEL_TITLE_H,
});

const roundCardSlot = (L: { portrait: boolean; W: number }) => ({
  x: 20,
  y: 20,
  w: L.portrait ? 130 : 168,
  h: L.portrait ? 56 : 68,
});

const countdownSlot = (L: { W: number; H: number }) => ({
  x: L.W / 2 - 110,
  y: L.H / 2 - 130,
  w: 220,
  h: 220,
});

const SUM_S = (portrait: boolean) => (portrait ? 0.66 : 0.8);
const sumSlot = (L: { portrait: boolean; band: { stageTop: number }; cardBand: { top: number } | null }) =>
  L.portrait ? { x: 30, y: L.cardBand!.top + 8 } : { x: 40, y: L.band.stageTop + 24 };

/** The de-emphasis for whichever card is NOT the one the line is actually about, while both are
 *  up at once — same E13 idiom verbatim (dimmed and very slightly shrunk, anchored top-left so
 *  it does not drift off its slot). Used here for the sum card while FORMULA_FOCUS has the floor. */
const DIM_CARD: React.CSSProperties = {
  opacity: 0.4,
  filter: "saturate(0.5)",
  transform: "scale(0.94)",
  transformOrigin: "top left",
};

const FORMULA_S = 0.82;
const formulaSlot = (L: { portrait: boolean; W: number; band: { stageTop: number } }) => {
  const w = BIG_FORMULA_ONE.w * FORMULA_S;
  const h = BIG_FORMULA_ONE.h * FORMULA_S;
  return L.portrait
    ? { x: (L.W - w) / 2, y: L.band.stageTop - h - 12, w, h }
    : { x: L.W - w - 40, y: L.band.stageTop + 24, w, h };
};

// CORRECTED (user: "parrot color not look good"): a neon lime (#C6FF3D) highlight bar/glow read
// as garish against this beat's dark starfield/curtain backdrop. Neither E11 (#D6127E), E12
// (#FF7A3D) nor E13 (#D9791E) — the same recap-card component's own already-approved uses — pick
// a saturated green for this exact reason; none of them use green at all. The TAKE card keeps
// pink (matches `ticketglow`'s own world accent already, so it was never the complaint); the ADD
// card switches to a warm gold, the same "gold reads on any dark stage" family E10's ink (#FFE156)
// and E11's ring accent (#FFD23F) already use throughout the series.
const SHOWCASE_ADD_ACCENT = "#FFD23F";

/** The showcase card, single-side mode ("add"/"take") — centred, full size, same slot a teach
 *  card would use in any other episode. */
const SHOWCASE_SINGLE_S = 0.92;
const showcaseSingleSlot = (L: { W: number; H: number }) => {
  const w = BIG_FORMULA_ALL_NAT.w * SHOWCASE_SINGLE_S;
  const h = BIG_FORMULA_ALL_NAT.h * SHOWCASE_SINGLE_S;
  return { x: (L.W - w) / 2, y: (L.H - h) / 2, w, h };
};
/** The showcase card, "both" mode — two full nine-row tables side by side. CORRECTED (user: "the
 *  cards look small/cramped") from an over-defensive 0.56 to 1.0 — checked against the REAL stage
 *  band (`BAND` in data/tokens.ts: stageTop 220, stageBottom 840, 620 px usable) before picking the
 *  number, same "use the space, don't shrink defensively" principle the E13 portrait card-sizing
 *  fix used: at scale 1.0 the pair is 430×516 each, total width 900 (huge margin either side of a
 *  1920-wide frame) and the block centres to 272-788 vertically, 52 px clear of stageBottom and far
 *  clear of the fixed headline pill (y 30-126) that carries this beat's title above it. */
const SHOWCASE_BOTH_S = 1.0;
const showcaseBothSlot = (L: { W: number; band: { stageTop: number; stageBottom: number } }) => {
  const w = BIG_FORMULA_ALL_NAT.w * SHOWCASE_BOTH_S;
  const h = BIG_FORMULA_ALL_NAT.h * SHOWCASE_BOTH_S;
  const gap = 40;
  const startX = (L.W - (w * 2 + gap)) / 2;
  const centerY = (L.band.stageTop + L.band.stageBottom) / 2;
  const y = centerY - h / 2;
  return { addX: startX, takeX: startX + w + gap, y, w, h, scale: SHOWCASE_BOTH_S };
};

export const E14BigFriendRecap: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e014_big_friend_recap/E14.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={0}
    subjectFor={() => undefined}
    guardOverlap
    arrowClearance
    palette={RIG_ARCADE}
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
      if (scene.formulas) out.push({ label: "formulaCard", r: formulaSlot(L) });
      if (scene.showcase) {
        if (scene.showcase.side === "both") {
          const slot = showcaseBothSlot(L);
          out.push({ label: "showcaseAdd", r: { x: slot.addX, y: slot.y, w: slot.w, h: slot.h } });
          out.push({ label: "showcaseTake", r: { x: slot.takeX, y: slot.y, w: slot.w, h: slot.h } });
        } else {
          out.push({ label: "showcaseCard", r: showcaseSingleSlot(L) });
        }
      }
      if (scene.wheel || scene.wheelIdle) {
        out.push({ label: "wheel", r: wheelRect(L) });
        if (!scene.headline) out.push({ label: "wheelTitle", r: wheelTitleSlot(L) });
      }
      if (scene.closeBeat === "practice") {
        out.push({ label: "practiceWheel", r: practiceWheelRect(L) });
        const slot = practiceSlot(L);
        PRACTICE_SUMS.forEach((_, i) =>
          out.push({ label: `practiceSum${i}`, r: { x: slot.x, y: slot.y + i * (slot.h + slot.gap), w: slot.w, h: slot.h } })
        );
      }
      if (scene.hedgehogs && !scene.showcase) {
        const m = hedgehogsAt(ctx.box, L, Boolean(scene.closing));
        out.push({ label: "hedgehogs", r: hedgehogsRect(m), mayTouchAbacus: true, mayExitFrame: true });
      }
      if (scene.roundNum) out.push({ label: "roundCard", r: roundCardSlot(L) });
      if (scene.countdownRound !== undefined)
        out.push({ label: "countdown", r: countdownSlot(L), mayTouchAbacus: true });
      return out;
    }}
    renderOver={(scene, ctx) => (
      <>
        {/* THE WHEEL */}
        {(scene.wheel || scene.wheelIdle) && (() => {
          const m = wheelAt(ctx.layout);
          const spin = scene.wheel ? ROUND_SPIN[scene.wheel.roundIdx] : undefined;
          const landed = spin ? ctx.frame >= spin.land : false;
          const progress = spin
            ? Math.max(0, Math.min(1, (ctx.frame - spin.start) / Math.max(1, spin.land - spin.start)))
            : 0;
          const landProgress =
            spin && landed ? Math.max(0, Math.min(1, (ctx.frame - spin.land) / 45)) : 0;
          return (
            <svg width={ctx.layout.W} height={ctx.layout.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <Wheel
                x={m.x}
                y={m.y}
                radius={m.radius}
                landOn={scene.wheel ? SEGMENT_FOR_ROUND[scene.wheel.roundIdx] : 0}
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

        {/* THE WHEEL'S TITLE */}
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
                fontSize: 42,
                color: "#C6FF3D",
                textAlign: "center",
                textShadow: "0 0 8px rgba(0,0,0,0.6), 0 3px 0 rgba(0,0,0,0.4)",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              Big Friend Recap
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
                background: "#FF3DA6",
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

        {/* THE COUNTDOWN */}
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
            <div style={{ position: "absolute", left: slot.x, top: slot.y, width: slot.w, height: slot.h, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 170,
                  color: "#C6FF3D",
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

        {/* THE HEDGEHOGS */}
        {scene.hedgehogs && !scene.showcase && (
          <svg width={ctx.layout.W} height={ctx.layout.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {(() => {
              const m = hedgehogsAt(ctx.box, ctx.layout, Boolean(scene.closing));
              const off = HEDGE_GAP * m.scale;
              return (
                <>
                  <Hedgehog
                    x={m.x - off}
                    y={m.y}
                    scale={m.scale}
                    mood={scene.hedgehogs!.left}
                    marking="amber"
                    facing={ctx.layout.portrait ? 1 : -1}
                    progress={ctx.beatProgress}
                    frame={ctx.frame}
                    fps={FPS}
                  />
                  <Hedgehog
                    x={m.x + off}
                    y={m.y}
                    scale={m.scale}
                    mood={scene.hedgehogs!.right}
                    marking="slate"
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

        {/* THE FORMULA CARD — one row lit, switching between the add/take tables per round.
            FORMULA_FOCUS (the exact phrase that SPEAKS the formula, "Plus four equals minus
            six, plus ten.") gets its own scale-pop emphasis — not a new glow effect (a diffuse
            wash was tried elsewhere in this episode and the user explicitly rejected it for
            washing out what it was meant to focus), just a brief pop-in on arrival, the same
            idiom the milestone card's own reveal already uses (`pop = min(1, beatProgress*k)`). */}
        {scene.formulas && (() => {
          const slot = formulaSlot(ctx.layout);
          const focus = FORMULA_FOCUS.has(ctx.p);
          const pop = focus ? Math.min(1, ctx.beatProgress * 6) : 1;
          const scaleUp = 0.86 + pop * 0.14;
          return (
            <div
              style={{
                position: "absolute",
                left: slot.x,
                top: slot.y,
                transform: focus ? `scale(${scaleUp})` : undefined,
                transformOrigin: "center",
              }}
            >
              <BigFriendFormulaList
                only
                all
                active={scene.formulas!.active}
                take={scene.formulas!.take}
                arriving={scene.formulasArriving}
                flashPart={formulaFlashFor(ctx.p, ctx.frame)?.part}
                flashK={formulaFlashFor(ctx.p, ctx.frame)?.k}
                accent="#FF3DA6"
                progress={ctx.beatProgress}
                scale={FORMULA_S}
              />
            </div>
          );
        })()}

        {/* THE COLUMN SUM — dimmed while FORMULA_FOCUS has the floor (the exact line that reads
            the formula aloud), same `DIM_CARD` coexistence-emphasis idiom E13 built for "two
            cards up, one is what the line is about right now" (there: the sum card dimmed while
            the friends-lookup card had it; here: while the formula card does). */}
        {scene.sum && (() => {
          const L = ctx.layout;
          const at = sumSlot(L);
          const prev = SUMS[ctx.p - 1];
          const dimmed = FORMULA_FOCUS.has(ctx.p);
          return (
            <div style={{ position: "absolute", left: at.x, top: at.y, ...(dimmed ? DIM_CARD : {}) }}>
              <ColumnSum
                a={scene.sum!.a}
                b={scene.sum!.b}
                op={scene.sum!.op}
                total={scene.sum!.total}
                step={scene.sum!.step}
                prevStep={prev?.step ?? "none"}
                flash={sumFlashFor(ctx.p, ctx.frame)}
                strongHighlight
                popIn={SUM_FIRST.has(ctx.p)}
                bg={WORLDS[scene.world].accent}
                progress={ctx.beatProgress}
                scale={SUM_S(L.portrait)}
              />
            </div>
          );
        })()}

        {/* THE FORMULA SHOWCASE — "remember everything first" */}
        {scene.showcase && (() => {
          const L = ctx.layout;
          // A card whose 9-row stagger reveal finishes well before the line ends then reads as
          // frozen for the rest of the hold — motion_check flagged exactly this on p2/p3 ("remember
          // everything first" / "Adding: one formula..."), the same static-stretch class every
          // earlier episode's guard-sweep has caught. A translateY bob was tried first and did NOT
          // fix it — shifting a big flat card by a few px barely changes the sampled pixels, since
          // almost the whole region is still the same solid fill either way. A continuous diagonal
          // shine sweep, keyed to `ctx.frame` (not `progress` — that still has to stay reserved for
          // the arrival reveal, or restarting it would replay the whole stagger every phrase) is a
          // real moving bright band against the card, guaranteeing pixel change for as long as the
          // card is on screen, independent of whether its own entrance has settled.
          // A ring burst at the newly-lit row's own position — p4 ("Plus one, plus two...")
          // still read as barely-changed from p3 under phrase_sheet's whole-frame diff metric,
          // because a single highlighted row among nine is a small fraction of the total frame
          // even though the content genuinely changed (verified by eye against the stills). This
          // adds real, sizeable pixel weight exactly where the word-synced highlight already is,
          // rather than papering over the metric with something unrelated to the actual content.
          const rowGlow = (w: number, scale: number, n: number | undefined, isTake: boolean) => {
            if (n === undefined) return null;
            const rowH = 49 * scale;
            const y = (14 + 28.8 + 5) * scale + (n - 1) * rowH + (44 * scale) / 2;
            const cx = w / 2;
            return (
              <svg width={w} height={w} style={{ position: "absolute", left: 0, top: y - w / 2, pointerEvents: "none", overflow: "visible" }}>
                <circle cx={cx} cy={w / 2} r={70 * scale} fill={isTake ? "#FF3DA6" : SHOWCASE_ADD_ACCENT} opacity={0.4} />
              </svg>
            );
          };
          const shine = (w: number, h: number) => {
            const period = 2.6;
            const t = ((ctx.frame / FPS) % period) / period; // 0..1, loops
            const bandX = -h * 0.6 + t * (w + h * 1.2);
            return (
              <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
                <defs>
                  <linearGradient id="e14Shine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
                    <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                  </linearGradient>
                  <clipPath id="e14ShineClip">
                    <rect x={0} y={0} width={w} height={h} rx={34} />
                  </clipPath>
                </defs>
                <g clipPath="url(#e14ShineClip)">
                  <rect x={bandX} y={-h * 0.3} width={h * 0.5} height={h * 1.6} fill="url(#e14Shine)" transform={`rotate(18 ${bandX} ${h / 2})`} />
                </g>
              </svg>
            );
          };
          if (scene.showcase!.side === "both") {
            const slot = showcaseBothSlot(L);
            return (
              <>
                <div style={{ position: "absolute", left: slot.addX, top: slot.y }}>
                  <BigFriendFormulaList all accent={SHOWCASE_ADD_ACCENT} progress={1} scale={slot.scale} />
                  {shine(slot.w, slot.h)}
                </div>
                <div style={{ position: "absolute", left: slot.takeX, top: slot.y }}>
                  <BigFriendFormulaList all take accent="#FF3DA6" progress={1} scale={slot.scale} />
                  {shine(slot.w, slot.h)}
                </div>
              </>
            );
          }
          const slot = showcaseSingleSlot(L);
          const take = scene.showcase!.side === "take";
          const arriving = Boolean(scene.showcase!.stagger);
          return (
            <div style={{ position: "absolute", left: slot.x, top: slot.y }}>
              <BigFriendFormulaList
                all
                take={take}
                stagger={arriving}
                arriving={arriving}
                active={activeRowFor(ctx.p, ctx.frame)}
                accent={take ? "#FF3DA6" : SHOWCASE_ADD_ACCENT}
                progress={arriving ? ctx.beatProgress : 1}
                scale={SHOWCASE_SINGLE_S}
              />
              {shine(slot.w, slot.h)}
              {rowGlow(slot.w, SHOWCASE_SINGLE_S, activeRowFor(ctx.p, ctx.frame), take)}
            </div>
          );
        })()}

        {/* THE "BOTH RODS AT ONCE" SPOTLIGHT — every round's answer moves ones AND tens
            together. FIXED (user-caught): this used to be a big diffuse radial wash, positioned
            with an ad-hoc `box.left + box.w*(rod+0.5)/5` formula that treated rod index as a
            plain left-to-right fraction — rod 0 (ones) is actually the RIGHTMOST column
            (`rodX`'s own `col = rodCount-1-rod`), so it was lighting up the inactive LEFT rods
            instead of the real ones/tens rods on the right, and washing them out rather than
            focusing them. Replaced with the SAME tight breathing-badge-plus-chevron spotlight
            E11/E12/E13 already use (`spotlightRod`/`SPOTLIGHT_ROD`), positioned with the real
            `rodX(box, rod)` geometry, drawn once per rod in `combinedGlow` — a focus ring around
            each active rod, not a wash over the whole panel. */}
        {scene.combinedGlow && (() => {
          const opacity = Math.max(0, 1 - ctx.settle * 1.2);
          if (opacity <= 0.01) return null;
          const t = ctx.frame / FPS;
          const breathe = 1 + Math.sin(t * 4.2) * 0.09;
          const bobY = Math.abs(Math.sin(t * 3.4)) * 12 * ctx.box.scale;
          return (
            <svg width={ctx.layout.W} height={ctx.layout.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              {scene.combinedGlow!.map((rod) => {
                const cx = rodX(ctx.box, rod);
                const cy = ctx.box.top + ctx.box.h / 2;
                const badgeW = 90 * ctx.box.scale;
                const badgeH = ctx.box.h - 6 * ctx.box.scale;
                const chevronY = cy - badgeH / 2 - 70 * ctx.box.scale - bobY;
                return (
                  <g key={rod} opacity={opacity}>
                    <g transform={`translate(${cx} ${cy}) scale(${breathe}) translate(${-cx} ${-cy})`}>
                      <rect x={cx - badgeW / 2} y={cy - badgeH / 2} width={badgeW} height={badgeH} rx={22 * ctx.box.scale} fill="#C6FF3D" opacity={0.22} />
                      <rect x={cx - badgeW / 2} y={cy - badgeH / 2} width={badgeW} height={badgeH} rx={22 * ctx.box.scale} fill="none" stroke="#C6FF3D" strokeWidth={6} />
                    </g>
                    <path
                      d={`M ${cx - 14 * ctx.box.scale} ${chevronY} L ${cx} ${chevronY + 14 * ctx.box.scale} L ${cx + 14 * ctx.box.scale} ${chevronY}`}
                      stroke="#C6FF3D"
                      strokeWidth={7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </g>
                );
              })}
            </svg>
          );
        })()}

        {/* the live value */}
        {scene.valueChip && !scene.big && !scene.headline && (
          <div style={{ position: "absolute", left: 0, top: 24, width: ctx.layout.W, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 68,
                color: "#160C2E",
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

        {/* the big answer */}
        {scene.big && (
          <div style={{ position: "absolute", left: 0, top: BIG_TOP + bob(ctx.frame, FPS, 5, 3.4), width: ctx.layout.W, textAlign: "center" }}>
            <Card bg={WORLDS[scene.world].accent}>
              <StickerText size={BIG_SIZE}>{scene.big}</StickerText>
            </Card>
          </div>
        )}

        {/* the mid-roll like/subscribe ask — NOT the episode close */}
        {scene.midSubscribe && (
          <div style={{ position: "absolute", left: 0, top: 0, width: ctx.layout.W, height: ctx.layout.H, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: `scale(${ctx.layout.portrait ? 1.1 : 1.2})` }}>
              <SubscribeCard progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- the close */}
        {/* "TRY BEAT THE BEADS AT HOME" — wheel idling on the left, four new unworked practice
            sums on the right, inviting the child to keep going beyond the 8 played rounds. */}
        {scene.closeBeat === "practice" && (() => {
          const L = ctx.layout;
          const m = practiceWheelAt(L);
          const t = ctx.frame / FPS;
          return (
            <>
              <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <Wheel
                  x={m.x}
                  y={m.y}
                  radius={m.radius}
                  landOn={0}
                  progress={0}
                  frame={ctx.frame}
                  fps={FPS}
                  landed={false}
                  idle
                  landProgress={0}
                />
              </svg>
              {(() => {
                const slot = practiceSlot(L);
                return PRACTICE_SUMS.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: slot.x,
                      top: slot.y + i * (slot.h + slot.gap) + Math.sin(t * 1.6 + i) * 3,
                    }}
                  >
                    <ColumnSum
                      a={s.a}
                      b={s.b}
                      op={s.op}
                      step="none"
                      prevStep="none"
                      popIn={false}
                      bg="#C6FF3D"
                      progress={1}
                      scale={PRACTICE_SUM_S}
                    />
                  </div>
                ));
              })()}
            </>
          );
        })()}

        {scene.closeBeat === "milestone" && (() => {
          const pop = Math.min(1, ctx.beatProgress * 3.5);
          return (
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
                gap: 14,
                fontFamily: KID_FONT,
                fontWeight: 700,
                transform: `scale(${0.7 + pop * 0.3})`,
              }}
            >
              <span style={{ fontSize: 130, color: "#C6FF3D" }}>4</span>
              <span style={{ fontSize: 60, color: "#FFFFFF", opacity: 0.8 }}>/</span>
              <span style={{ fontSize: 90, color: "#FFFFFF" }}>8</span>
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
          <div style={{ position: "absolute", left: 0, top: 0, width: ctx.layout.W, height: ctx.layout.H, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <NextUpCard
              progress={ctx.beatProgress}
              title={["one trick,", "both ways"]}
              example={
                <div
                  style={{
                    fontFamily: KID_FONT,
                    fontWeight: 700,
                    fontSize: 34,
                    color: "#FF3DA6",
                    textAlign: "center",
                    maxWidth: 240,
                    transform: `translateY(${bob(ctx.frame, FPS, 6, 2.6)}px)`,
                  }}
                >
                  adds AND takes away, at once!
                </div>
              }
            />
          </div>
        )}
      </>
    )}
  />
);
