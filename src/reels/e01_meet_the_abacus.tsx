// E01 · Meet the Abacus — 16:9
//
// Structure note: there are no per-beat <Sequence> wrappers around the abacus. The
// whole episode drives ONE abacus instance from the absolute frame, because a remount
// between beats would restart its idle motion and reset bead positions mid-transition.
// Beats exist to decide *state*, not to own components.
//
// Timing comes from public/audio/about_abacus/about_abacus.phrases.json, produced by
// tools/align_by_matching.py. Worst measured drift vs the audio is 0.50 s.

import React from "react";
import phrasesJson from "../data/e01.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { LINE_TOOLTIP, LINE_HIGHLIGHT, LINE_COUNT } from "../data/lineMap";
import { TOUR_SHORT } from "../data/tour";
import { tooltipColor } from "../components/Tooltip";
import { NextUpCard } from "../components/Outro";
import { LandscapeFreeMode, StoreFlow, DownloadCta } from "../components/AppShowcase";
import {
  CountingRun,
  CountingFingers,
  MissingStep,
  HistoryTimeline,
} from "../components/HookProps";
import { type RodState } from "../components/Abacus";
import { Card, Chip, StickerText } from "../components/Sticker";
import { bob, pulse } from "../lib/motion";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere } from "../stage/clock";
import type { CardSpec, Highlight, Scene as BaseScene } from "../stage/types";
import {
  BAND,
  FPS,
  PLACE_COLORS,
  ROD_DIM,
  THEME,
  W,
} from "../data/tokens";

export const AUDIO_SEC = 259.474;
export const E01_DURATION = sec(AUDIO_SEC, FPS); // 7784

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

// ---------------------------------------------------------------- line-by-line labels
//
// Labels for lines the app has no tooltip for.
//
// Lines 10-23 were REMOVED: that block is served by LINE_TOOLTIP, and the four entries
// that still rendered (16, 17, 20, 22) were shifted by one — line 20 "Look at the top"
// was labelled "Bottom section". Same hand-numbering mistake as the tooltip table, in a
// second place. Everything kept below is verified against its line by
// tools/check_line_sync.py.
//
// Keep these SHORT: the caption already carries the sentence. A label names the thing.
const LABELS: Record<number, string> = {
  // the outside
  // the two halves
  24: "heaven = upper\nearth = lower",
  25: "we say upper & lower",
  // where to start
  26: "the far-right rod",
  27: "Ones column",
  28: "start here\n(small abacus)",
  // what each bead is worth — the point of the section, said plainly
  29: "1 lower bead = 1",
  30: "1 upper bead = 5",
  31: "one bead\nworth five!",
  32: "that's the trick",
  33: "move one rod left",
  34: "10x bigger",
  35: "1 lower bead = 10",
  36: "1 upper bead = 50",
  37: "one more rod left",
  38: "1 lower bead = 100",
  39: "1 upper bead = 500",
  40: "each rod left\n= 10x",
  // how much it holds
  42: "1 rod = 0-9",
  43: "2 rods = 0-99",
  44: "3 rods = 0-999",
  45: "more rods = bigger numbers",
  // big vs small
  47: "our app: 13 rods",
  48: "big abacus\nones in the MIDDLE",
  49: "right rods = decimals",
  50: "small abacus\nstart far right",
  // fingers
  51: "the finger trick",
  52: "only two fingers",
  53: "thumb + index",
  // reading a number
  61: "upper bead is down",
  62: "5",
  63: "3 lower beads up",
  64: "5 + 3",
  65: "5 + 3",
  66: "5 + 3 = 8",
  // your turn
  69: "7",
  70: "1 upper = 5\n2 lower = 2\n5 + 2 = 7",
  71: "Great!",
};

// ---------------------------------------------------------------- scene state

/** Stand-ins for the abacus in the hook, where the script is not about the abacus yet. */
type StageProp = "abacus" | "counting" | "fingers" | "missingstep" | "calculator";

/** The shared scene vocabulary plus the three things only this episode has: the finger
 *  rules card, the your-turn prompt, and the decimals chip on the 13-rod view. */
interface Scene extends BaseScene {
  stage: StageProp;
  question?: boolean;
  rulesCard?: boolean;
  decimals?: boolean;
}

/**
 * The line at which each rod's value strips are first stated out loud. A strip must not
 * appear before its line: the video showed "5" above the ones rod while the narration was
 * still on "each lower bead is worth one".
 */
const LOWER_STATED_AT: Record<number, number> = { 0: 29, 1: 35, 2: 38, 3: 40, 4: 40 };
const UPPER_STATED_AT: Record<number, number> = { 0: 30, 1: 36, 2: 39, 3: 40, 4: 40 };
// 3 and 4 land on line 40 — "every time you move left, the value becomes ten times
// bigger" — which is the line that generalises the pattern, so all five rods must be
// labelled by then. They were set to 45 and the frame showed only 5/50/500 and 1/10/100.
// 3 and 4 land on line 45 — "and bigger abacuses can show even bigger numbers" — which is
// the moment the thousands and ten-thousands strips become the point of the sentence. They
// were absent entirely before, so the rods the line is about carried no values.

const mk = (
  values: number[],
  opts: { lit?: number[]; upTo?: number } = {}
): RodState[] =>
  values.map((v, i) => ({
    value: v,
    focus: opts.lit ? (opts.lit.includes(i) ? 1 : ROD_DIM) : 1,
    chipLower:
      opts.upTo !== undefined &&
      LOWER_STATED_AT[i] !== undefined &&
      opts.upTo >= LOWER_STATED_AT[i],
    chipUpper:
      opts.upTo !== undefined &&
      UPPER_STATED_AT[i] !== undefined &&
      opts.upTo >= UPPER_STATED_AT[i],
  }));

// Stage band is 620 px and the abacus is 477 px tall at scale 1, so it floated small
// in a 1080 frame. BASE fills the band without crossing it; PUSH is the close-up used
// for the finger work, where bead-level detail is the point. 477 * 1.30 = 620 exactly.
const BASE = 1.15;
const PUSH = 1.3;

/**
 * Slot for each tooltip RUN, cycled by run order rather than by line number.
 * Keying it to `start % 3` let two consecutive runs land on the same height — the rods
 * card and the beam card both came out at 330 — so the panel appeared not to move at all
 * between two different parts.
 */
const RUN_SLOT: Record<number, number> = (() => {
  const starts: number[] = [];
  let prev: number | undefined;
  for (let i = 0; i < 200; i++) {
    const step = LINE_TOOLTIP[i];
    if (step !== undefined && step !== prev) starts.push(i);
    if (step !== undefined) prev = step;
  }
  const slots = [120, 265, 195, 345];
  return Object.fromEntries(starts.map((s, k) => [s, slots[k % slots.length]]));
})();

/** The label for this line, or none if the line doesn't need one. */
const lab = (p: number, color: string): Scene["sideLabel"] =>
  LABELS[p] ? { text: LABELS[p], color } : undefined;

const FIVE = [0, 0, 0, 0, 0];
const wide13 = (): RodState[] =>
  Array.from({ length: 13 }, () => ({ value: 0, focus: 1 as number }));

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  // 1 · HOOK — the abacus is NOT here yet. Lines 1-3 are about counting, fingers and a
  // missing step, so that is what the stage shows. Line 4 says "This is an abacus" and
  // that is the first frame it appears on.
  if (p <= 2)
    return {
      world: "problem",
      stage: p === 0 ? "counting" : p === 1 ? "fingers" : "missingstep",
      rods: mk(FIVE),
      highlight: null,
      scale: BASE,
      headline:
        p === 0 ? "Counts to 100…" : p === 1 ? "…but 7 + 8?" : "One step is missing",
    };
  if (p <= 4)
    return {
      world: "problem",
      stage: "abacus",
      rods: mk([8, 0, 0, 0, 0]),
      highlight: null,
      scale: BASE,
      headline: "Meet the abacus",
    };

  // 2 · WHAT AN ABACUS IS — beads actually slide, so the claim is demonstrated.
  // Line 7 talks about calculators, so line 7 shows a calculator.
  if (p <= 7)
    return {
      world: "meadow",
      stage: p === 7 ? "calculator" : "abacus",
      rods: mk([p === 5 ? 3 : 7, 0, 0, 0, 0]),
      highlight: null,
      scale: BASE,
      liveBeads: p === 6,
      headline: p === 7 ? "Older than any calculator" : "A counting tool",
    };

  // 3 · THE OUTSIDE — one part lit at a time. Which part comes from LINE_HIGHLIGHT,
  // generated by matching the spoken text, so it cannot drift out of step again.
  if (p <= 15) {
    const hl: Highlight = LINE_HIGHLIGHT[p] ?? null;
    return {
      world: "blueprint",
      stage: "abacus",
      rods: mk(FIVE),
      highlight: hl,
      scale: BASE,
      sideLabel: lab(p, THEME.c800),
    };
  }

  // 4 · THE TWO HALVES
  if (p <= 25) {
    const hl: Highlight = LINE_HIGHLIGHT[p] ?? null;
    const count = LINE_COUNT[p] ?? null;
    const label = lab(p, THEME.c800);
    const band: Scene["band"] = /above the beam is the top/i.test(PHRASES[p].text)
      ? "top"
      : /below the beam is the bottom/i.test(PHRASES[p].text)
      ? "bottom"
      : undefined;
    return {
      world: "heavenearth",
      stage: "abacus",
      rods: mk(FIVE),
      highlight: hl,
      scale: BASE,
      sideLabel: label,
      count,
      band,
    };
  }

  // 5 · WHERE TO START. The take says "we always start" — a false rule on a 13-rod
  // abacus. The side label carries the qualifier the voice omits; 7a then corrects it.
  if (p <= 28)
    return {
      world: "spotlight",
      stage: "abacus",
      rods: mk(FIVE, { lit: [0] }),
      highlight: null,
      scale: BASE,
      sideLabel: lab(p, PLACE_COLORS[0]),
      targetRod: 0,
      panelPlace: "aboveRod",
      rodBand: 0,
    };

  // 6 · WHAT EACH BEAD IS WORTH — walks the app's own place-value colours.
  // Six of these lines state a bead's value outright ("each lower bead is worth ten"),
  // so those show the bead beside the number instead of describing it in words.
  if (p <= 40) {
    // One entry per line. `value` is what the rod must READ for the sentence to be true:
    // "each lower bead is worth ten" shows ONE lower bead up on the tens rod, not four —
    // the old version showed 4 beads for every line and 5 only where a card existed, so
    // the abacus contradicted the words on half of them.
    const VAL: Record<
      number,
      { place: number; value: number; which?: "upper" | "lower"; worth?: number }
    > = {
      29: { place: 0, value: 1, which: "lower", worth: 1 },
      30: { place: 0, value: 5, which: "upper", worth: 5 },
      31: { place: 0, value: 5, which: "upper", worth: 5 },
      32: { place: 0, value: 5 },
      33: { place: 1, value: 0 },
      34: { place: 1, value: 0 },
      35: { place: 1, value: 1, which: "lower", worth: 10 },
      36: { place: 1, value: 5, which: "upper", worth: 50 },
      37: { place: 2, value: 0 },
      38: { place: 2, value: 1, which: "lower", worth: 100 },
      39: { place: 2, value: 5, which: "upper", worth: 500 },
      40: { place: 3, value: 1 }, // handled by the sweep below
    };
    const v = VAL[p] ?? { place: 0, value: 0 };
    const values = [...FIVE];
    values[v.place] = v.value;
    const bw = v.worth !== undefined && v.which ? { which: v.which, worth: v.worth } : undefined;
    return {
      world: "placebands",
      stage: "abacus",
      rods: mk(values, { lit: [v.place], upTo: p }),
      // Do NOT dim the half that holds the moving bead — on "the upper bead is worth
      // five" the upper bead is the subject, so quieting the lower half is right; the
      // reverse case must not quiet the beads the viewer is being asked to look at.
      highlight: v.which === "upper" ? "top" : v.which === "lower" ? "bottom" : null,
      scale: BASE,
      sideLabel: bw ? undefined : lab(p, PLACE_COLORS[v.place]),
      beadWorth: bw,
      targetRod: v.place,
      // step left through the thousands and ten-thousands rods on the summary line
      sweepRods: p === 40 ? [3, 4] : undefined,
    };
  }

  // 7 · HOW MUCH IT HOLDS — rod count lit matches the words exactly.
  if (p <= 45) {
    const n = p <= 41 ? 1 : p === 42 ? 1 : p === 43 ? 2 : p === 44 ? 3 : 5;
    const values = [...FIVE].map((_, i) => (i < n ? 9 : 0));
    return {
      world: "counter",
      stage: "abacus",
      rods: mk(values, { lit: Array.from({ length: n }, (_, i) => i), upTo: p }),
      highlight: null,
      scale: BASE,
      counter: p <= 42 ? "0 – 9" : p === 43 ? "0 – 99" : p === 44 ? "0 – 999" : "and up",
      sideLabel: lab(p, PLACE_COLORS[0]),
      boxRods: n, // these lines are about a group of columns, so box the group
      targetRod: n - 1,
    };
  }

  // 7a · BIG ABACUS, SMALL ABACUS — the one place the rod count changes. It widens
  // the same instance rather than mounting a second abacus.
  if (p <= 50) {
    if (p >= 50)
      return {
        world: "compare",
        stage: "abacus",
        rods: mk(FIVE, { lit: [0] }),
        highlight: null,
        scale: BASE,
        sideLabel: lab(p, PLACE_COLORS[0]),
        // "we simply start on the far right" — so the subject is the ones rod, and the card
        // belongs on its side. Left unset, the target defaulted to the MIDDLE rod, which sits
        // one pixel off the screen centre.
        targetRod: 0,
        panelSide: "right",
      };
    const rods = wide13();
    const decimalLine = /used for decimals/i.test(PHRASES[p].text);
    if (decimalLine) {
      // rod 0 is the RIGHTMOST, so the decimal rods are 0-5. The highlight used to stay on
      // the centre rod — i.e. it marked the ones column on the line about decimals.
      rods.forEach((r, i) => (r.focus = i <= 5 ? 1 : ROD_DIM));
    } else if (p >= 48) {
      rods.forEach((r, i) => (r.focus = i === 6 ? 1 : ROD_DIM));
    }
    return {
      world: "compare",
      stage: "abacus",
      rods,
      highlight: null,
      // 0.62 left the 13 rods small and the beads hard to read; 0.78 is 1166 px wide,
      // still clear of the frame edges
      scale: 0.78,
      targetRod: decimalLine ? 2 : 6,
      panelPlace: "aboveRod",
      rodBand: decimalLine ? undefined : 6, // the centre rod IS the ones column

      boxRods: decimalLine ? 6 : undefined, // box the six rods right of the ones rod
      // Only on the line that NAMES the unit place. At p49 the subject is the decimal rods,
      // and both chips landed under the abacus on top of one another — the unit-place label
      // was still there from `p >= 48` while the Decimals chip arrived.
      centreNote: p === 48 ? "Unit place · ones rod" : undefined,
      sideLabel: lab(p, p >= 48 ? PLACE_COLORS[2] : THEME.c800),
      decimals: p >= 49,
    };
  }

  // 8 · THE TWO FINGERS — pushed in, because bead-level detail is the point.
  if (p <= 59) {
    // 0 -> 3 -> 8 -> 5 -> 0. Each step changes EXACTLY the thing its line names, and
    // nothing else. The old sequence went 3 -> 5 on "add the upper bead", which brings
    // the heaven bead down AND silently drops three lower beads — two moves, one of them
    // contradicting the narration. Checked against the app's own rules
    // (freeModeHighlightSteps 14-17): thumb adds lower, index adds upper, index takes
    // lower, thumb takes upper.
    const base = mk([0, 0, 0, 0, 0], { lit: [0] });
    let hand: Scene["hand"];
    let value = 0;
    if (p === 54) {
      value = 3; // + 3 lower, thumb up
      hand = { digit: "thumb", direction: "up", rod: 0, heaven: false };
    } else if (p === 55) {
      value = 8; // + upper bead (3 -> 8), index down; the 3 lower beads stay put
      hand = { digit: "index", direction: "down", rod: 0, heaven: true };
    } else if (p === 56) {
      value = 5; // - 3 lower (8 -> 5), index down; the upper bead stays down
      hand = { digit: "index", direction: "down", rod: 0, heaven: false };
    } else if (p === 57) {
      value = 0; // - upper bead (5 -> 0), thumb up
      hand = { digit: "thumb", direction: "up", rod: 0, heaven: true };
    } else if (p >= 58) {
      value = 0;
    }
    base[0].value = value;
    return {
      world: "bench",
      stage: "abacus",
      rods: base,
      targetRod: 0,
      panelSide: "left", // the hand occupies the right of the ones rod
      highlight: null,
      scale: PUSH,
      hand,
      sideLabel: lab(p, THEME.c800),
      rulesCard: p >= 58,
    };
  }

  // 9 · READ YOUR FIRST NUMBER
  if (p <= 66) {
    const value = p <= 60 ? 0 : p <= 62 ? 5 : 8;
    return {
      world: "chalk",
      stage: "abacus",
      rods: mk([value, 0, 0, 0, 0], { lit: [0] }),
      highlight: null,
      scale: PUSH,
      count: p >= 63 ? "active" : null,
      sideLabel: lab(p, PLACE_COLORS[0]),
      labelPos: "above",
    };
  }

  // 10 · YOUR TURN — the recall gap is real in the take (1.8 s of silence).
  if (p <= 71)
    return {
      world: "quiz",
      stage: "abacus",
      rods: mk([7, 0, 0, 0, 0], { lit: [0] }),
      highlight: null,
      scale: PUSH,
      question: p <= 68,
      // 71 is praise — the headline carries it, so no second card beside the abacus
      sideLabel: p === 70 || p === 71 ? undefined : lab(p, PLACE_COLORS[0]),
      sumBreakdown: p === 70 ? { upper: 1, lower: 2 } : undefined,
      headline: p === 71 ? "Great job!  ⭐" : undefined,
      // the answer sits beside the beads it explains, on their side of the frame
      labelPos: p <= 68 ? "above" : "side",
      targetRod: 0,
      // "one upper bead and two lower beads" -> mark the beads that are actually up,
      // each with what it contributes, so the 7 is visibly 5 + 1 + 1
      count: p === 70 ? "active" : null,
    };

  // 11 · CLOSE — four separate lines, so four separate visuals.
  //   72 the app          -> phone showing Free Mode
  //   73 "tap every bead" -> tap ripple on the phone
  //   74 "move them"      -> a bead actually moves
  //   75 "learn by playing" -> praise on the phone
  //   76-77 the stores    -> the real badges
  //   78 next episode     -> the ones rod takes a 1
  return {
    world: "celebrate",
    stage: "abacus",
    rods: mk([7, 0, 0, 0, 0]),
    highlight: null,
    scale: BASE * 0.85,
    closing: true,
    closeBeat:
      p <= 72 ? "show" : p === 73 ? "tap" : p === 74 ? "move" : p === 75 ? "play" : p <= 77 ? "store" : "next",
    // the store beat pulls the world back so the phone and the CTA carry the frame, and
    // carries no caption — they ARE the message, and the phonics outro leaves the caption
    // band empty for exactly that reason
    worldWash: p === 76 || p === 77 ? 0.55 : undefined,
    noCaption: p === 76 || p === 77,
  };
};

// ---------------------------------------------------------------- rendering

/**
 * Sound cues, derived from the script rather than hand-placed: the app's bead click
 * wherever a rod value actually changes, its correct-answer chime on a reveal, its clap on
 * praise. Kept quiet so nothing competes with the narration — at 0.42/0.5/0.45 the clap
 * pushed the mix to 0.0 dB peak, i.e. clipping.
 */
const SFX_CUES: SfxCue[] = (() => {
  const cues: SfxCue[] = [];
  const valuesOf = (i: number) => sceneFor(i).rods.map((r) => r.value).join(",");

  // THE reveal. Line 3 is "This is an abacus." and it is the first frame the abacus
  // exists, so it gets its own sting — synthesised in tools/make_reveal_sfx.py rather than
  // taken from the app, whose sounds are all UI feedback and none of them announce
  // anything. Starts 12 frames early so the rise leads in and the arpeggio lands on the
  // word rather than trailing after it.
  cues.push({
    frame: Math.max(0, sec(PHRASES[3].start, FPS) - 12),
    file: "reveal.mp3",
    len: 64,
    vol: 0.5,
  });

  // a short air-swish whenever a new teaching card arrives
  let prevStep: number | undefined;
  for (let i = 0; i < PHRASES.length; i++) {
    const step = LINE_TOOLTIP[i];
    if (step !== undefined && step !== prevStep) {
      cues.push({ frame: sec(PHRASES[i].start, FPS), file: "swipe.mp3", len: 14, vol: 0.22 });
    }
    if (step !== undefined) prevStep = step;
  }
  for (let i = 1; i < PHRASES.length; i++) {
    const at = sec(PHRASES[i].start, FPS);
    const txt = PHRASES[i].text.toLowerCase();
    // a bead really moved on this line
    if (sceneFor(i).stage === "abacus" && valuesOf(i) !== valuesOf(i - 1)) {
      cues.push({ frame: at, file: "abacus_move.mp3", len: 30, vol: 0.32 });
    }
    if (/eight\.|it's seven|great job/.test(txt)) {
      cues.push({ frame: at, file: "option_correct_ans.mp3", len: 60, vol: 0.34 });
    }
    if (/great job/.test(txt)) {
      cues.push({ frame: at + 10, file: "clap.mp3", len: 90, vol: 0.28 });
    }
  }
  return cues;
})();

/** The app's own Free Mode tour supplies the wording and the colour for every part this
 *  episode names, so the card cannot drift from what the app calls things. */
const cardFor = (p: number): CardSpec | undefined => {
  const step = LINE_TOOLTIP[p];
  if (step === undefined) return undefined;
  const segs = TOUR_SHORT[step];
  if (!segs) return undefined;
  return { key: step, segs, color: tooltipColor(step) };
};

/** first frame of the store beat, so its flow runs once across both its lines and then
 *  holds on the finished state instead of starting over */
const STORE_START = (() => {
  const i = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "store");
  return i < 0 ? 0 : sec(PHRASES[i].start, FPS);
})();

/** The abacus is not on stage until line 3 names it. */
const ABACUS_FIRST_FRAME = sec(PHRASES[3].start, FPS);

export const E01MeetTheAbacus: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e001_about_abacus/about_abacus.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={ABACUS_FIRST_FRAME}
    cardFor={cardFor}
    // A card belongs to a run of lines about the SAME PART, which is what LINE_HIGHLIGHT
    // records — generated from the spoken text, so it cannot drift out of step by hand.
    subjectFor={(i) => LINE_HIGHLIGHT[i]}
    renderProp={(stage, _scene, ctx) => (
      <>
        {stage === "counting" && (
          <CountingRun
            frame={ctx.frame - ctx.phraseStart}
            fps={FPS}
            progress={ctx.beatProgress}
          />
        )}
        {stage === "fingers" && (
          <CountingFingers frame={ctx.frame - ctx.phraseStart} fps={FPS} />
        )}
        {stage === "missingstep" && (
          <MissingStep frame={ctx.frame - ctx.phraseStart} fps={FPS} />
        )}
        {stage === "calculator" && (
          <HistoryTimeline
            frame={ctx.frame - ctx.phraseStart}
            fps={FPS}
            progress={ctx.beatProgress}
          />
        )}
      </>
    )}
    // The boxes E01 draws itself. Enabled so the overlap check covers this episode too —
    // the user found the decimals/unit-place collision by eye, which is exactly what this
    // is for. `arrowClearance` is deliberately NOT set: E01's arrows shipped as approved.
    guardOverlap
    // Portrait: the pushing hand reaches in from the right of the ones rod and needs room the
    // 1080 frame does not otherwise have. Reserved for the WHOLE episode — not just PUSH
    // sections — so the fitted scale never changes and the abacus never resizes between lines
    // (user call: the abacus is fixed; only the beads change).
    sideRoom={() => ({ left: 0, right: 350 })}
    boxesFor={(scene, ctx) => {
      const out = [];
      if (scene.decimals) {
        out.push({
          label: "decimals",
          r: {
            x: ctx.box.left + ctx.box.w * 0.54,
            y: ctx.layout.portrait ? ctx.box.top - 74 : ctx.box.top + ctx.box.h + 16,
            w: ctx.box.w * 0.46,
            h: 64,
          },
        });
      }
      if (scene.question) {
        out.push({
          label: "prompt",
          r: { x: ctx.layout.W / 2 - 330, y: 22, w: 660, h: 170 },
        });
      }
      if (scene.rulesCard) {
        out.push(
          ctx.layout.portrait && ctx.layout.cardBand
            ? {
                label: "rules",
                r: { x: (ctx.layout.W - 400) / 2, y: ctx.layout.cardBand.top + 8, w: 400, h: 224 },
              }
            : { label: "rules", r: { x: 40, y: ctx.layout.band.stageTop + 60, w: 510, h: 300 } }
        );
      }
      return out;
    }}
    renderUnder={(scene, ctx) =>
      scene.decimals && (
        <div
          style={{
            position: "absolute",
            left: ctx.box.left + ctx.box.w * 0.54,
            // above the abacus in portrait: the teaching card sits in the band below and its
            // arrow travels up through the space under the frame
            top: ctx.layout.portrait
              ? ctx.box.top - 74
              : ctx.box.top + ctx.box.h + 16,
            width: ctx.box.w * 0.46,
            textAlign: "center",
          }}
        >
          <Chip label="Decimals" color={PLACE_COLORS[4]} size={38} />
        </div>
      )
    }
    renderOver={(scene, ctx) => (
      <>
        {/* "Your turn" is part of the same prompt as the answer, so it sits ABOVE the
            abacus too, not off to the left */}
        {scene.question && (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: ctx.layout.W,
              // headline band: at PUSH scale stageTop-132 put its bottom edge 26 px inside
              // the abacus
              top: 22,
              textAlign: "center",
              transform: `scale(${pulse(ctx.frame, FPS, 0.05, 1.2)})`,
            }}
          >
            <Card bg={PLACE_COLORS[0]}>
              <StickerText size={104}>Your turn  ?</StickerText>
            </Card>
          </div>
        )}

        {scene.rulesCard && (
          <div
            style={
              ctx.layout.portrait && ctx.layout.cardBand
                ? {
                    // four lines do not fit beside a portrait abacus, and there is only 79 px
                    // above it — so the list goes in the card band, smaller
                    position: "absolute",
                    left: 0,
                    width: ctx.layout.W,
                    top: ctx.layout.cardBand.top + 8,
                    display: "flex",
                    justifyContent: "center",
                  }
                : { position: "absolute", left: 40, top: ctx.layout.band.stageTop + 60 }
            }
          >
            <Card bg={THEME.c800} radius={40}>
              <StickerText
                size={ctx.layout.portrait ? 30 : 40}
                style={{ display: "block", lineHeight: 1.5 }}
              >
                {"add lower  ·  thumb up\nadd upper  ·  index down\ntake lower ·  index down\ntake upper ·  thumb up"}
              </StickerText>
            </Card>
          </div>
        )}

        {scene.closing && scene.closeBeat && (() => {
          const pt = ctx.layout.portrait;
          return (
          // Fixed slots, not a centred flex row: the row re-centred every time the card
          // beside the phone changed width, so the phone slid left and right between
          // "Free Mode is free for everyone" and "Tap any bead".
          <div
            style={{
              position: "absolute",
              top: ctx.layout.band.stageTop - 90,
              left: 0,
              width: ctx.layout.W,
              height: ctx.layout.band.stageBottom - ctx.layout.band.stageTop + 140,
            }}
          >
            {scene.closeBeat === "next" ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NextUpCard progress={ctx.beatProgress} />
              </div>
            ) : (
              <>
                {/* the store flow is the subject here, not the app screen. Its frame is
                    measured from the FIRST store line: lines 76 and 77 are both store
                    beats, so keying it to the phrase restarted the whole
                    search-and-download animation half way through. */}
                {/* PORTRAIT stacks what 16:9 sets side by side. At 1080 wide the phone alone
                    is 940 and its caption card sat at x=1130 — completely off the frame, so
                    every close line lost its text. */}
                {scene.closeBeat === "store" ? (
                  // PORTRAIT: the 16:9 halves are STACKED, not redesigned — phone at its
                  // 16:9 size (760) over the CTA at its 16:9 size, one uniform 0.75 fit,
                  // and the whole column CENTRED between headline and brand strip.
                  <div
                    style={{
                      position: "absolute",
                      left: pt ? 0 : 300,
                      top: pt ? 195 : 20,
                      height: pt ? 1087 : undefined,
                      width: pt ? ctx.layout.W : undefined,
                      display: pt ? "flex" : undefined,
                      alignItems: pt ? "center" : undefined,
                      justifyContent: pt ? "center" : undefined,
                    }}
                  >
                    <div
                      style={
                        pt
                          ? {
                              flexShrink: 0,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 24,
                              // -140: StoreFlow's phone artwork sits ~180px below its own box
                              // top, which read as the whole column hugging the bottom
                              transform: "translateY(-140px) scale(0.75)",
                              transformOrigin: "center",
                            }
                          : undefined
                      }
                    >
                      <StoreFlow
                        frame={ctx.frame - STORE_START}
                        fps={FPS}
                        height={760}
                      />
                      {pt && <DownloadCta progress={ctx.beatProgress} />}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      left: pt ? 40 : 120,
                      top: (pt ? 96 : 150) + bob(ctx.frame, FPS, 8, 4),
                    }}
                  >
                    <LandscapeFreeMode
                      frame={ctx.frame - ctx.phraseStart}
                      fps={FPS}
                      beat={scene.closeBeat as "show" | "tap" | "move" | "play"}
                      value={
                        scene.closeBeat === "move" || scene.closeBeat === "play" ? 8 : 5
                      }
                      width={pt ? 1000 : 940}
                    />
                  </div>
                )}
                {scene.closeBeat === "store" ? (
                  !pt ? (
                    <div
                      style={{
                        position: "absolute",
                        left: 1090,
                        top: 90,
                      }}
                    >
                      <DownloadCta progress={ctx.beatProgress} />
                    </div>
                  ) : null
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      left: pt ? 0 : 1130,
                      top: pt ? 640 : 300,
                      width: pt ? ctx.layout.W : 680,
                      // the Card is inline-block, so width + textAlign left it against the
                      // left edge of its box instead of centred in the frame
                      display: pt ? "flex" : undefined,
                      justifyContent: pt ? "center" : undefined,
                    }}
                  >
                    <Card bg="rgba(255,255,255,0.96)" radius={44}>
                      <StickerText
                        size={pt ? 46 : 54}
                        color="#1F3B4D"
                        style={{
                          display: "block",
                          textAlign: pt ? "center" : "left",
                          textShadow: "none",
                        }}
                      >
                        {scene.closeBeat === "show"
                          ? "Free Mode\nis free for everyone"
                          : scene.closeBeat === "tap"
                          ? "Tap any bead"
                          : scene.closeBeat === "move"
                          ? "Move them yourself"
                          : "Learn by playing"}
                      </StickerText>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
          );
        })()}
      </>
    )}
  />
);
