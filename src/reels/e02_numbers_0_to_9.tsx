// E02 · Numbers 0 to 9 — 16:9
//
// One rod, ten numbers. Zero, then the four lower beads one at a time, then the wall at
// four, then the upper bead that is worth five on its own, then six to nine, a reading
// rule, a quiz, and the close.
//
// Timing comes from src/data/e02.phrases.json, produced by tools/align_by_matching.py from
// docs/E02_spoken.txt — the AS RECORDED text. The take is a natural paraphrase of the
// approved script (docs/E02_lines.txt): about twenty lines differ, "Count them." was never
// spoken, and two lines were added. Word match is 313/313.
//
// 44 spoken lines -> 53 PHRASES. Every index below is a phrase index. Nothing here is
// numbered by line.

import React from "react";
import phrasesJson from "../data/e02.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { E02_CARDS, assertCards } from "../data/e02Cards";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Ladder, Ladybird, type BirdMood } from "../components/e02/Ladder";
import { RuleBoard } from "../components/e02/RuleBoard";
import { type RodState } from "../components/Abacus";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { KID_FONT } from "../lib/fonts";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, numberWordFrames, wordFrameIn } from "../stage/clock";
import type { CardSpec, Scene as BaseScene } from "../stage/types";
import { WORLDS } from "../data/theme";
import { BAND, FPS, H, PLACE_COLORS, ROD_DIM, W } from "../data/tokens";

export const AUDIO_SEC = 167.706;
export const E02_DURATION = sec(AUDIO_SEC, FPS); // 5031

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

// Fails the render if a card no longer matches the sentence it sits on.
assertCards((p) => PHRASES[p]?.text ?? "");

/** The ladder is a prop of the counting section, and the ladybird belongs to it. */
interface Scene extends BaseScene {
  /** rungs lit — the count so far, 0..4 */
  ladder?: number;
  /** rungs lit BEFORE this line's move. The ladder stands for the count, so it must climb
   *  with the bead rather than before it. */
  ladderFrom?: number;
  /** flash the empty air above rung four */
  ceiling?: boolean;
  bird?: BirdMood;
  /** which rung she is on, when she is on one */
  birdRung?: number;
  /** the reading rule: how many steps are filled, and the worked sum */
  rule?: { filled: number; sum?: string };
  /** big number over the abacus — the answer the line just gave */
  big?: string;
  /** the your-turn prompt, held over the deliberate silence in the take */
  question?: boolean;
}

// The stage band is 620 px and the abacus is 477 px tall at scale 1. BASE fills the band
// without crossing it. This episode stays at one scale throughout: it is about a single
// rod, and a rig that changes size between sections reads as a different abacus.
const BASE = 1.15;

// The number card lives in the headline band (0-200). 92 pt of Fredoka in a Card with
// 18 px padding and a 6 px depth layer is ~166 px tall, so at y=20 it ends at ~186 and
// crosses nothing. The overlap guard checks this rather than trusting the arithmetic.
const BIG_TOP = 20;
const BIG_SIZE = 92;
const BIG_H = 166;
const bigW = (text: string) => Math.max(150, text.length * BIG_SIZE * 0.66 + 80);

/**
 * Where the ladder stands, relative to the abacus's left edge, and how wide it really is.
 * A fixed -132 was tuned to the 16:9 abacus; in the narrower 4:5 rig it put the ladder's left
 * rail 32 px off the frame.
 */
const ladderCx = (boxLeft: number, portrait: boolean) => boxLeft - (portrait ? 85 : 132);
const LADDER_W = 140;

/**
 * Room reserved either side of the abacus in the 4:5 cut. The hand is the wider of the two:
 * it reaches in from the right of the ones rod and extends about 330 px per unit of scale, so
 * at 165/280 the fitted scale lands near 0.95 and neither prop touches the frame edge.
 */
const PORTRAIT_ROOM = { left: 165, right: 280 };

/** The your-turn prompt: above the abacus at 16:9, in the headline band at 4:5 where the stage
 *  band starts at 210 and the abacus is only 40 px below it. */
const promptTop = (L: { portrait: boolean; band: { stageTop: number } }) =>
  L.portrait ? 30 : L.band.stageTop - 132;

/** Five rods with the ones rod lit and the rest quiet. The episode is about ONE rod, and
 *  the four beside it are what make "we only need one" a visible choice rather than a
 *  claim — a single-rod rig would be a 199 px sliver in a 1920 frame. */
const rig = (value: number, opts: { spotlight?: boolean } = {}): RodState[] =>
  Array.from({ length: 5 }, (_, i) => ({
    value: i === 0 ? value : 0,
    focus: i === 0 ? 1 : opts.spotlight === false ? 1 : ROD_DIM,
  }));

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  // ---------------------------------------------------------------- 1 · HOOK (dawn)
  // Frame 0 must be a finished image — it is the thumbnail — so the abacus is already
  // here. E01 ended on it, and this line is "Last time we met the abacus."
  if (p <= 3) {
    return {
      world: "dawn",
      stage: "abacus",
      rods: rig(0, { spotlight: p >= 3 }),
      highlight: null,
      scale: BASE,
      // p2 said "0 to 9" three times over: headline pill, counter chip and the app's own
      // "One rod · 0 to 9" card, with the pill and chip stacked into one another. The card
      // is the app's wording, so it keeps it and the other two go.
      headline: p === 0 ? "Last time…" : p === 1 ? "Today: numbers!" : undefined,
      // "and we only need one rod" is about the whole column, so mark the whole column
      rodBand: p === 3 ? 0 : undefined,
      targetRod: 0,
      // NOT aboveRod: the card would sit ~60 px above the rod band and the arrow came out
      // as a short curl that read as a glitch. Beside it, on the same side as the rod, the
      // arrow has room to be an arrow.
      panelSide: p === 3 ? "right" : undefined,
    };
  }

  // ---------------------------------------------------------------- 2 · ZERO (dawn)
  if (p <= 7) {
    return {
      world: "dawn",
      stage: "abacus",
      rods: rig(0),
      // "no beads are touching the beam" is a statement about the beam
      highlight: p === 6 ? "beam" : null,
      scale: BASE,
      targetRod: 0,
      big: p === 5 ? "0" : undefined,
      headline: p === 4 ? "Start with nothing" : undefined,
    };
  }

  // ------------------------------------------------- 3 · ONE TO FOUR (ladder)
  // Each count gets its own phrase, so the bead and the rung and the ladybird all step
  // together: 8 push→1 · 9 "that is one" · 10 push→2 · 11 "one, two" · 12 "that is two" …
  if (p <= 18) {
    const VALUE: Record<number, number> = {
      8: 1, 9: 1,
      10: 2, 11: 2, 12: 2,
      13: 3, 14: 3, 15: 3,
      16: 4, 17: 4, 18: 4,
    };
    const value = VALUE[p] ?? 1;
    // the hand shows the push on the lines that ask for one
    const pushing = p === 8 || p === 10 || p === 13 || p === 16;
    // the counting runs — "one, two, three" — number the beads that are up
    const counting = p === 11 || p === 14 || p === 17;
    const saying = p === 9 || p === 12 || p === 15 || p === 18;
    return {
      world: "ladder",
      stage: "abacus",
      rods: rig(value),
      highlight: null,
      scale: BASE,
      targetRod: 0,
      panelSide: "right", // the ladder stands to the LEFT of the abacus
      ladder: value,
      ladderFrom: pushing ? value - 1 : undefined,
      bird: "climb",
      birdRung: value,
      count: counting ? "active" : null,
      // reveal the badges one per spoken number: both up from frame 0 says "two"
      countOnNumbers: counting,
      big: saying ? String(value) : undefined,
      // Thumb pushes a lower bead UP — the app's own rule (tour step 14). The pointer is on
      // screen from the start of the line and the bead travels on the word that asks for
      // it, so the child sees WHICH bead is about to move before it moves.
      hand: pushing
        ? { digit: "thumb", direction: "up", rod: 0, heaven: false }
        : undefined,
      // The LAST word, not a word inside the line: "push" is the first word of "Push one
      // more", so anchoring there still moved the bead as the line began. The bead now
      // arrives just before the next line names the number it made.
      moveOn: pushing ? "$last" : undefined,
    };
  }

  // ---------------------------------------------------------------- 4 · THE WALL (wall)
  if (p <= 23) {
    // The rod holds four for the whole section. Nothing moves, because nothing CAN —
    // that is the point being made.
    return {
      world: "wall",
      stage: "abacus",
      rods: rig(4),
      // "four is as high as the lower beads can go" is about the lower section
      highlight: p === 22 ? "bottom" : null,
      scale: BASE,
      targetRod: 0,
      panelSide: "right",
      ladder: 4,
      // she reaches for a fifth rung on "push another lower bead up", finds nothing, and
      // shrugs — THE gag, and it lands before the narration says there are none left
      ceiling: p >= 20,
      bird: p >= 20 ? "shrug" : "climb",
      birdRung: 4,
      headline: p === 19 ? "Now make five" : p === 23 ? "So how?" : undefined,
    };
  }

  // -------------------------------------------- 5 · THE UPPER BEAD IS FIVE (sky)
  if (p <= 30) {
    // 24-26 the bead is still up and the lower four are still raised; 27 sends them down;
    // 28 brings the upper bead down. Two separate phrases, so the 4 -> 5 move is legal by
    // construction: the lower beads clear FIRST, then the upper bead lands.
    const value = p <= 26 ? 4 : p === 27 ? 0 : 5;
    return {
      world: "sky",
      stage: "abacus",
      rods: rig(value),
      // A BAND on the top section, not a highlight, for 24-26. A highlight dims the other
      // half, and here the other half is holding the four — so the frame came out looking
      // like an empty abacus at the exact moment the child needs to remember there are four
      // beads up. The upper bead is also still parked and therefore grey, so dimming bought
      // no contrast either. A band marks the region without quieting anything
      // (DESIGN_SYSTEM §6: never dim the half that holds the value).
      band: p <= 26 ? "top" : undefined,
      highlight: p === 27 ? "bottom" : p >= 29 ? "top" : null,
      scale: BASE,
      targetRod: 0,
      panelSide: "right",
      // No ladybird in this section. She belongs to the ladder, and beside the bare frame
      // she rendered as a 60 px speck with nothing to stand on — at p28 the hand covered
      // her outright. Leaving her off stage is also the better arc: she climbs, she shrugs
      // at the wall, the upper bead solves it without her, and she comes back to cheer.
      hand:
        p === 28
          ? { digit: "index", direction: "down", rod: 0, heaven: true }
          : undefined,
      // 27 "send the lower beads back DOWN" · 28 "bring the upper bead DOWN"
      moveOn: p === 27 || p === 28 ? "down" : undefined,
      big: p === 29 ? "5" : undefined,
      beadWorth: p === 30 ? { which: "upper", worth: 5 } : undefined,
      headline: p === 24 ? "Look above the beam" : undefined,
    };
  }

  // ------------------------------------------------ 6 · SIX TO NINE (workshop)
  if (p <= 36) {
    const VALUE: Record<number, number> = { 31: 5, 32: 6, 33: 7, 34: 8, 35: 9, 36: 9 };
    const value = VALUE[p] ?? 5;
    const BIG: Record<number, string> = { 32: "6", 33: "7", 34: "8", 35: "9" };
    return {
      world: "workshop",
      stage: "abacus",
      rods: rig(value),
      // the upper bead never moves through this whole section — only lower beads do, so
      // the lower half is the subject on every counting line
      highlight: p >= 32 && p <= 35 ? "bottom" : null,
      scale: BASE,
      targetRod: 0,
      panelSide: "right",
      // The NUMBER the rod reads, never "5 + 3 = 8". This episode teaches reading a rod;
      // writing it as a sum makes it an addition lesson, which is E03. The take agrees —
      // it says "five AND three, eight".
      big: BIG[p],
      count: p >= 32 && p <= 35 ? "active" : null,
      // no headline here: the card at this phrase is the app's own "One rod · 0 to 9",
      // and the two sat on top of each other saying the same thing
      rodBand: p === 36 ? 0 : undefined,
    };
  }

  // ---------------------------------------------- 7 · THE READING RULE (board)
  // Worked on a rod reading 8, so the two steps have something to be true about.
  if (p <= 41) {
    return {
      world: "board",
      stage: "abacus",
      rods: rig(8),
      highlight: p === 38 || p === 39 ? "top" : p === 40 ? "bottom" : null,
      scale: BASE,
      targetRod: 0,
      panelSide: "right",
      rule: {
        filled: p <= 37 ? 0 : p <= 39 ? 1 : 2,
        // the number the rod reads — "add them together" is shown by the badges, not
        // written as an equation
        sum: p === 41 ? "8" : undefined,
      },
      count: p === 40 || p === 41 ? "active" : null,
      headline: p === 37 ? "Reading a rod" : undefined,
    };
  }

  // ------------------------------------------------- 8 · YOUR TURN (askrose)
  // 42-43 ask, then ~2.4 s of real silence in the take, then 44 answers.
  if (p <= 47) {
    return {
      world: "askrose",
      stage: "abacus",
      rods: rig(3),
      highlight: p === 45 ? "bottom" : null,
      // "the upper bead is still up" — up means grey, so highlighting it dims the three
      // beads that are the answer. Band it instead.
      band: p === 46 ? "top" : undefined,
      scale: BASE,
      targetRod: 0,
      panelSide: "right",
      question: p <= 43,
      big: p === 44 ? "3" : undefined,
      // No sumBreakdown: with no upper bead it rendered a "0 upper beads = 0" row, which
      // is a line about a bead that is not there. The numbered beads carry the three.
      count: p === 45 ? "active" : null,
      countOnNumbers: p === 45,
      headline: p === 47 ? "Nice work!  ⭐" : undefined,
      // she perches on the frame to cheer — the payoff for the shrug at the wall. Without
      // the ladder she needs something to sit on, or she floats in empty space.
      bird: p === 47 ? "cheer" : undefined,
    };
  }

  // ---------------------------------------------------------------- 9 · CLOSE (balloons)
  //   48 practise      -> the rod counts itself 0 to 9, beads moving
  //   49 like/subscribe
  //   50-51 the stores
  //   52 next episode
  return {
    world: "balloons",
    stage: "abacus",
    rods: rig(0),
    highlight: null,
    scale: BASE,
    targetRod: 0,
    // "make every number from zero to nine" IS every number from zero to nine
    rodRamp: p === 48 ? { rod: 0, from: 0, to: 9 } : undefined,
    closing: p >= 49,
    // p48 must have NO closeBeat. It had one ("store", via `p <= 51`) even though `closing`
    // is false there, so the store composition did not render — but STORE_START and
    // STORE_FRAMES both found p48 and stretched the flow across 453 frames starting ten
    // seconds early. By the time the phone actually appeared the search and the typing had
    // already happened off screen, which is why the store beat looked like it skipped
    // straight to the detail page.
    closeBeat:
      p === 48 ? undefined : p === 49 ? "subscribe" : p <= 51 ? "store" : "next",
    worldWash: p === 50 || p === 51 ? 0.55 : undefined,
    noCaption: p === 50 || p === 51,
    headline: p === 48 ? "Your turn — 0 to 9" : undefined,
  };
};

// ---------------------------------------------------------------- rendering

const cardFor = (p: number): CardSpec | undefined => E02_CARDS[p];

const STORE_START = (() => {
  const i = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "store");
  return i < 0 ? 0 : sec(PHRASES[i].start, FPS);
})();

/** How long the store beat actually lasts — every phrase whose closeBeat is "store". */
const STORE_FRAMES = (() => {
  const idx = PHRASES.map((x) => x.index).filter((i) => sceneFor(i).closeBeat === "store");
  if (!idx.length) return 181;
  return sec(PHRASES[idx[idx.length - 1]].end, FPS) - STORE_START;
})();

/**
 * Sound, derived from the script rather than hand-placed: a bead click wherever the rod's
 * value actually changes, the app's chime on each reveal, a clap on praise, and one click
 * per number on the closing count.
 *
 * The upper bead's reveal uses reveal5.mp3, a DIFFERENT sting from E01's — it descends onto
 * a held fifth, because the bead comes down and lands as one thing worth five.
 */
const SFX_CUES: SfxCue[] = (() => {
  const cues: SfxCue[] = [];
  const at = (i: number) => sec(PHRASES[i].start, FPS);
  const add = (frame: number, file: string, len: number, vol: number) =>
    cues.push({ frame: Math.max(0, Math.round(frame)), file, len, vol });
  /** The frame a word is spoken on, inside its own phrase. */
  const on = (i: number, word: string) => wordFrameIn(PHRASES[i], word, FPS) ?? at(i);

  // ---- beads: a click wherever the rod's value really changes, ON the word that moves it,
  // not at the line boundary. The bead and its click land together because both read the
  // same anchor.
  const valueOf = (i: number) => sceneFor(i).rods[0].value;
  for (let i = 1; i < PHRASES.length; i++) {
    if (valueOf(i) === valueOf(i - 1)) continue;
    const mv = sceneFor(i).moveOn;
    add(mv ? on(i, mv) : at(i), "abacus_move.mp3", 30, 0.32);
  }

  // ---- counting out loud: a tick per spoken number, so the badges are heard as well as
  // seen (phrases 11, 14, 17 and the answer at 45)
  for (const i of [11, 14, 17, 45]) {
    for (const f of numberWordFrames(PHRASES[i], FPS)) add(f, "tick.mp3", 12, 0.3);
  }

  // ---- zero: the app's own reset, which is exactly "nothing on the rod"
  add(on(5, "zero"), "abacus_reset.mp3", 40, 0.3);

  // ---- the wall. The hand reaches for a bead that is not there, and then the joke lands.
  add(on(20, "push"), "swipe.mp3", 16, 0.26);
  // NOT option_wrong_ans: the child has done nothing wrong, the abacus has run out of beads
  add(on(21, "oh"), "nope.mp3", 34, 0.42);
  add(at(23), "boing.mp3", 24, 0.34); // "So how do we make five?" — left unresolved

  // ---- the reveal this episode turns on. Early, so the descent leads into the word.
  add(at(24) - 12, "reveal5.mp3", 64, 0.46);

  // ---- five arrives
  add(on(29, "five"), "option_correct_ans.mp3", 60, 0.34);

  // ---- nine is the ceiling
  add(on(36, "biggest"), "play_win.mp3", 70, 0.3);

  // ---- the rule assembling: a tick as each step lands, then the answer
  add(at(38), "tick.mp3", 14, 0.34);
  add(at(40), "tick.mp3", 14, 0.34);
  add(on(41, "add"), "option_correct_ans.mp3", 60, 0.3);

  // ---- your turn. The prompt gets a sting; the 2.4 s recall gap gets NOTHING — that
  // silence is where the child answers out loud, and filling it talks over them.
  add(at(42), "boing.mp3", 24, 0.3);
  add(on(44, "three"), "option_correct_ans.mp3", 60, 0.34);
  add(at(47), "clap.mp3", 90, 0.28);

  // ---- a card arriving
  let prevKey: number | undefined;
  for (let i = 0; i < PHRASES.length; i++) {
    const key = E02_CARDS[i]?.key;
    if (key !== undefined && key !== prevKey) add(at(i), "swipe.mp3", 14, 0.22);
    if (key !== undefined) prevKey = key;
  }

  // ---- the closing count: one click per number as the rod runs 0 to 9
  const span48 = sec(PHRASES[48].end, FPS) - at(48);
  for (let k = 1; k <= 9; k++) add(at(48) + (span48 * k) / 10, "abacus_move.mp3", 22, 0.26);

  // ---- like and subscribe: both controls are tapped, and the bell actually rings
  const p49 = at(49);
  const len49 = sec(PHRASES[49].end, FPS) - p49;
  add(p49 + len49 * 0.14, "btn_click.mp3", 20, 0.3);
  add(p49 + len49 * 0.42, "btn_click.mp3", 20, 0.3);
  add(p49 + len49 * 0.58, "bell.mp3", 46, 0.34);

  // ---- the store flow taps, at the frames StoreFlow actually draws them. Its keyframes are
  // in reference time (tap row 50, tap GET 92), so scale them by the real beat length the
  // same way the component does.
  const rate = STORE_FRAMES / 136;
  add(STORE_START + 50 * rate, "btn_click.mp3", 20, 0.28);
  add(STORE_START + 92 * rate, "btn_click.mp3", 20, 0.3);
  add(STORE_START + 136 * rate - 8, "play_win.mp3", 60, 0.26);

  // ---- the send-off
  add(at(52), "swipe.mp3", 16, 0.24);
  return cues;
})();


export const E02Numbers0To9: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e002_one_to_nine_number/E02.mp3"
    sfx={SFX_CUES}
    // The abacus is on stage from frame 0: this episode follows straight on from E01's
    // close, and frame 0 is the thumbnail, so it must be a finished image.
    abacusFirstFrame={0}
    cardFor={cardFor}
    // Cards here belong to single lines rather than to runs about one part, so a line
    // without a card ends the run instead of extending it.
    subjectFor={() => undefined}
    // Four heights, so two consecutive cards never arrive at the same place.
    runSlots={[150, 300, 210, 360]}
    // Every piece of content this episode draws itself, so the overlap check can see it.
    // SceneStage measures only what it draws.
    boxesFor={(scene, ctx) => {
      const L = ctx.layout;
      const out = [];
      if (scene.ladder !== undefined || scene.bird) {
        out.push({
          label: "ladder",
          r: {
            // the rung numbers hang further left than the rails, so the box is off-centre
            x: ladderCx(ctx.box.left, L.portrait) - 80,
            y: ctx.box.top,
            w: LADDER_W,
            h: ctx.box.h,
          },
        });
      }
      if (scene.big) {
        const w = bigW(scene.big);
        out.push({ label: "number", r: { x: (L.W - w) / 2, y: BIG_TOP, w, h: BIG_H } });
      }
      if (scene.rule) {
        // a row in the card band for 4:5, a column beside the abacus for 16:9
        out.push(
          L.portrait && L.cardBand
            ? { label: "rule", r: { x: (L.W - 640) / 2, y: L.cardBand.top, w: 640, h: 232 } }
            : { label: "rule", r: { x: 96, y: L.band.stageTop + 30, w: 486, h: 330 } }
        );
      }
      if (scene.question) {
        out.push({
          label: "prompt",
          r: { x: L.W / 2 - 300, y: promptTop(L), w: 600, h: 150 },
        });
      }
      return out;
    }}
    guardOverlap
    // ARROWS ON EVERY BEAD THAT MOVES, and beads coloured by where they ARE.
    //
    // Both were opt-in from E03 and both were left off here, which meant this episode drew an arrow
    // only on the handful of lines that also have a finger hand — four of seventy-nine — while every
    // later episode arrows every move. A child watching the series in order got pointers that stopped
    // appearing when they went back to lesson one.
    beadArrows
    colorOnArrival
    arrowClearance
    // Portrait needs room on BOTH sides — the ladder on the left, the pushing hand on the
    // right — and it is the SAME room on every line, so the abacus never resizes between
    // sections. Asked for per-line, the scale would jump each time the ladder appeared, and a
    // rig that changes size reads as a different abacus.
    sideRoom={() => PORTRAIT_ROOM}
    // Reserved for the whole episode above; occupied only where a prop really is, so a line
    // with neither ladder nor hand centres the abacus instead of hanging to one side.
    stageShift={(scene) => ({
      left: scene.ladder !== undefined || scene.bird ? PORTRAIT_ROOM.left : 0,
      right: scene.hand ? PORTRAIT_ROOM.right : 0,
    })}
    renderUnder={(scene, ctx) => (
      <>
        {/* The ladder stands to the LEFT of the abacus, which is why every card in the
            counting sections is forced to the right. Rung pitch comes from the bead
            geometry, so the rungs line up with the rows they stand for. */}
        {(scene.ladder !== undefined || scene.bird) && (
          <svg
            width={W}
            height={H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            {scene.ladder !== undefined && (
              <Ladder
                box={ctx.box}
                // climbs with the bead, not ahead of it
                lit={
                  scene.ladderFrom !== undefined && ctx.settle < 0.5
                    ? scene.ladderFrom
                    : scene.ladder
                }
                progress={1}
                x={ladderCx(ctx.box.left, ctx.layout.portrait)}
                showCeiling={scene.ceiling}
                frame={ctx.frame}
                fps={FPS}
              />
            )}
            {scene.bird && (
              <Ladybird
                box={ctx.box}
                rung={
                  scene.ladderFrom !== undefined && ctx.settle < 0.5
                    ? scene.ladderFrom
                    : scene.birdRung ?? 0
                }
                mood={scene.bird}
                // riding the bead means riding it on the ROD, not out on the ladder
                // beside the frame, not on it: onesCx + 74 landed her on the woodwork
                // cheering, she perches on the abacus frame; climbing or shrugging, she is
                // on the ladder
                x={
                  scene.bird === "cheer"
                    ? ctx.box.left + 78
                    : ladderCx(ctx.box.left, ctx.layout.portrait)
                }
                perchY={
                  scene.bird === "cheer" ? ctx.box.top - 24 * ctx.box.scale : undefined
                }
                frame={ctx.frame}
                fps={FPS}
              />
            )}
          </svg>
        )}


      </>
    )}
    renderOver={(scene, ctx) => (
      <>
        {/* The number the rod now reads. In the HEADLINE band, not just above the abacus:
            between the stage band top (220) and the abacus (256) there are 36 px, so a
            100 pt number there overlapped the frame. Sized to sit inside 0-200 without
            crossing the boundary. */}
        {scene.big && (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: ctx.layout.W,
              top: BIG_TOP + bob(ctx.frame, FPS, 5, 3.6),
              textAlign: "center",
            }}
          >
            <Card bg={PLACE_COLORS[0]} radius={36}>
              <StickerText size={BIG_SIZE}>{scene.big}</StickerText>
            </Card>
          </div>
        )}

        {scene.question && (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: ctx.layout.W,
              top: promptTop(ctx.layout),
              textAlign: "center",
            }}
          >
            <Card bg={PLACE_COLORS[0]}>
              <StickerText size={96}>Your turn  ?</StickerText>
            </Card>
          </div>
        )}

        {/* the rule, assembled step by step on the board */}
        {scene.rule && (
          <div
            style={
              ctx.layout.portrait && ctx.layout.cardBand
                ? {
                    position: "absolute",
                    left: 0,
                    width: ctx.layout.W,
                    top: ctx.layout.cardBand.top,
                    display: "flex",
                    justifyContent: "center",
                  }
                : { position: "absolute", left: 96, top: ctx.layout.band.stageTop + 30 }
            }
          >
            <RuleBoard
              filled={scene.rule.filled}
              progress={ctx.beatProgress}
              accent={WORLDS[scene.world].accent}
              sum={scene.rule.sum}
              compact={ctx.layout.portrait}
            />
          </div>
        )}

        {scene.closing && (() => {
          const pt = ctx.layout.portrait;
          return (
          <div
            style={{
              position: "absolute",
              top: ctx.layout.band.stageTop - 90,
              left: 0,
              width: ctx.layout.W,
              height: ctx.layout.band.stageBottom - ctx.layout.band.stageTop + 140,
            }}
          >
            {scene.closeBeat === "subscribe" && (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: pt ? 0 : 200,
                    top: pt ? 40 : 150,
                    width: pt ? ctx.layout.W : undefined,
                    display: pt ? "flex" : undefined,
                    justifyContent: pt ? "center" : undefined,
                  }}
                >
                  <SubscribeCard
                    progress={ctx.beatProgress}
                    frame={ctx.frame - ctx.phraseStart}
                    fps={FPS}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: pt ? 0 : 900,
                    top: pt ? 430 : 190,
                    width: pt ? ctx.layout.W : 840,
                    display: pt ? "flex" : undefined,
                    justifyContent: pt ? "center" : undefined,
                  }}
                >
                  <Card bg="rgba(255,255,255,0.96)" radius={44}>
                    <StickerText
                      size={54}
                      color="#4A1F0E"
                      style={{ display: "block", textAlign: "left", textShadow: "none" }}
                    >
                      {"Liked this?\nTap like and subscribe\nfor more"}
                    </StickerText>
                  </Card>
                </div>
              </>
            )}

            {scene.closeBeat === "store" && (
              <>
                {/* PORTRAIT: the 16:9 halves are STACKED, not redesigned — phone at its
                    16:9 size (760) over the CTA at its 16:9 size, one uniform 0.75 fit
                    for the pair (950px of stage / 1266px natural column). */}
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
                      // the real length of the store beat, so search, detail and the GET tap
                      // each get a readable share and the flow lands on OPEN as it ends
                      span={STORE_FRAMES}
                    />
                    {pt && <DownloadCta progress={ctx.beatProgress} />}
                  </div>
                </div>
                {!pt && (
                  <div
                    style={{
                      position: "absolute",
                      left: 1090,
                      top: 90,
                    }}
                  >
                    <DownloadCta progress={ctx.beatProgress} />
                  </div>
                )}
              </>
            )}

            {scene.closeBeat === "next" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NextUpCard
                  progress={ctx.beatProgress}
                  title={["adding two", "numbers"]}
                  example={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        fontFamily: KID_FONT,
                        fontWeight: 700,
                        fontSize: 96,
                        color: "#E64A19",
                      }}
                    >
                      <span>5</span>
                      <span style={{ color: "#6A1B9A" }}>+</span>
                      <span>3</span>
                      <span style={{ color: "#6A1B9A" }}>=</span>
                      <span style={{ opacity: ctx.beatProgress > 0.55 ? 1 : 0.25 }}>
                        {ctx.beatProgress > 0.55 ? "8" : "?"}
                      </span>
                    </div>
                  }
                />
              </div>
            )}
          </div>
          );
        })()}
      </>
    )}
  />
);
