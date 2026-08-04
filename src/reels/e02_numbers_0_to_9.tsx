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
import { firstPhraseWhere } from "../stage/clock";
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
  /** flash the empty air above rung four */
  ceiling?: boolean;
  bird?: BirdMood;
  /** which rung she is on, when she is on one */
  birdRung?: number;
  /** the reading rule: how many steps are filled, and the worked sum */
  rule?: { filled: number; sum?: string };
  /** big number over the abacus — the answer the line just gave */
  big?: string;
  /** the "5 + n" strip for the six-to-nine section */
  sum?: string;
  /** the your-turn prompt, held over the deliberate silence in the take */
  question?: boolean;
}

// The stage band is 620 px and the abacus is 477 px tall at scale 1. BASE fills the band
// without crossing it. This episode stays at one scale throughout: it is about a single
// rod, and a rig that changes size between sections reads as a different abacus.
const BASE = 1.15;

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
      headline:
        p === 0 ? "Last time…" : p === 1 ? "Today: numbers!" : p === 2 ? "0 to 9" : undefined,
      counter: p === 2 ? "0 – 9" : undefined,
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
      highlight: p === 8 ? "bottom" : null,
      scale: BASE,
      targetRod: 0,
      panelSide: "right", // the ladder stands to the LEFT of the abacus
      ladder: value,
      bird: "climb",
      birdRung: value,
      count: counting ? "active" : null,
      big: saying ? String(value) : undefined,
      // thumb pushes a lower bead UP — the app's own rule (tour step 14)
      hand: pushing
        ? { digit: "thumb", direction: "up", rod: 0, heaven: false }
        : undefined,
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
      big: p === 29 ? "5" : undefined,
      beadWorth: p === 30 ? { which: "upper", worth: 5 } : undefined,
      headline: p === 24 ? "Look above the beam" : undefined,
    };
  }

  // ------------------------------------------------ 6 · SIX TO NINE (workshop)
  if (p <= 36) {
    const VALUE: Record<number, number> = { 31: 5, 32: 6, 33: 7, 34: 8, 35: 9, 36: 9 };
    const value = VALUE[p] ?? 5;
    const SUM: Record<number, string> = {
      32: "5 + 1 = 6",
      33: "5 + 2 = 7",
      34: "5 + 3 = 8",
      35: "5 + 4 = 9",
    };
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
      sum: SUM[p],
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
        sum: p === 41 ? "5 + 3 = 8" : undefined,
      },
      count: p === 40 ? "active" : null,
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
    closeBeat: p === 49 ? "subscribe" : p <= 51 ? "store" : "next",
    worldWash: p === 50 || p === 51 ? 0.55 : undefined,
    noCaption: p === 50 || p === 51,
    headline: p === 48 ? "Your turn — 0 to 9" : undefined,
  };
};

// ---------------------------------------------------------------- rendering

const cardFor = (p: number): CardSpec | undefined => E02_CARDS[p];

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
  const valueOf = (i: number) => sceneFor(i).rods[0].value;

  for (let i = 1; i < PHRASES.length; i++) {
    const at = sec(PHRASES[i].start, FPS);
    if (valueOf(i) !== valueOf(i - 1)) {
      cues.push({ frame: at, file: "abacus_move.mp3", len: 30, vol: 0.32 });
    }
  }

  // 24 "Look above the beam" — the reveal this episode turns on. Early, so the descent
  // leads into the word rather than trailing after it.
  cues.push({
    frame: Math.max(0, sec(PHRASES[24].start, FPS) - 12),
    file: "reveal5.mp3",
    len: 64,
    vol: 0.46,
  });

  // a swish whenever a new teaching card arrives
  let prevKey: number | undefined;
  for (let i = 0; i < PHRASES.length; i++) {
    const key = E02_CARDS[i]?.key;
    if (key !== undefined && key !== prevKey) {
      cues.push({ frame: sec(PHRASES[i].start, FPS), file: "swipe.mp3", len: 14, vol: 0.22 });
    }
    if (key !== undefined) prevKey = key;
  }

  // 29 the rod reads five · 44 the answer · 47 praise
  for (const i of [29, 44]) {
    cues.push({
      frame: sec(PHRASES[i].start, FPS),
      file: "option_correct_ans.mp3",
      len: 60,
      vol: 0.34,
    });
  }
  cues.push({ frame: sec(PHRASES[47].start, FPS), file: "option_correct_ans.mp3", len: 60, vol: 0.34 });
  cues.push({ frame: sec(PHRASES[47].start, FPS) + 10, file: "clap.mp3", len: 90, vol: 0.28 });

  // one click per number across the closing 0 -> 9 count
  const p48 = PHRASES[48];
  const from = sec(p48.start, FPS);
  const span = sec(p48.end, FPS) - from;
  for (let k = 1; k <= 9; k++) {
    cues.push({
      frame: from + Math.round((span * k) / 10),
      file: "abacus_move.mp3",
      len: 22,
      vol: 0.26,
    });
  }
  return cues;
})();

const STORE_START = (() => {
  const i = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "store");
  return i < 0 ? 0 : sec(PHRASES[i].start, FPS);
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
                lit={scene.ladder}
                progress={1}
                x={ctx.box.left - 132}
                showCeiling={scene.ceiling}
                frame={ctx.frame}
                fps={FPS}
              />
            )}
            {scene.bird && (
              <Ladybird
                box={ctx.box}
                rung={scene.birdRung ?? 0}
                mood={scene.bird}
                // riding the bead means riding it on the ROD, not out on the ladder
                // beside the frame, not on it: onesCx + 74 landed her on the woodwork
                // cheering, she perches on the abacus frame; climbing or shrugging, she is
                // on the ladder
                x={scene.bird === "cheer" ? ctx.box.left + 78 : ctx.box.left - 132}
                perchY={
                  scene.bird === "cheer" ? ctx.box.top - 24 * ctx.box.scale : undefined
                }
                frame={ctx.frame}
                fps={FPS}
              />
            )}
          </svg>
        )}

        {/* The "5 + n" strip, ABOVE the abacus. Below it, the card started at 827 px and
            ran into the caption band at 860 — nothing may cross a band boundary
            (EPISODE_RULES.md §4). It shares the big number's slot; the two never appear on
            the same line. */}
        {scene.sum && (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: W,
              top: BAND.stageTop - 126 + bob(ctx.frame, FPS, 7, 3.6),
              textAlign: "center",
            }}
          >
            <Card bg={WORLDS[scene.world].accent} radius={30}>
              <StickerText size={72}>{scene.sum}</StickerText>
            </Card>
          </div>
        )}
      </>
    )}
    renderOver={(scene, ctx) => (
      <>
        {/* the answer the line just gave, over the abacus rather than off to one side */}
        {scene.big && (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: W,
              top: BAND.stageTop - 126 + bob(ctx.frame, FPS, 7, 3.6),
              textAlign: "center",
            }}
          >
            <Card bg={PLACE_COLORS[0]} radius={40}>
              <StickerText size={112}>{scene.big}</StickerText>
            </Card>
          </div>
        )}

        {scene.question && (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: W,
              top: BAND.stageTop - 132,
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
          <div style={{ position: "absolute", left: 96, top: BAND.stageTop + 30 }}>
            <RuleBoard
              filled={scene.rule.filled}
              progress={ctx.beatProgress}
              accent={WORLDS[scene.world].accent}
              sum={scene.rule.sum}
            />
          </div>
        )}

        {scene.closing && (
          <div
            style={{
              position: "absolute",
              top: BAND.stageTop - 90,
              left: 0,
              width: W,
              height: BAND.stageBottom - BAND.stageTop + 140,
            }}
          >
            {scene.closeBeat === "subscribe" && (
              <>
                <div style={{ position: "absolute", left: 200, top: 150 }}>
                  <SubscribeCard
                    progress={ctx.beatProgress}
                    frame={ctx.frame - ctx.phraseStart}
                    fps={FPS}
                  />
                </div>
                <div style={{ position: "absolute", left: 900, top: 190, width: 840 }}>
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
                <div style={{ position: "absolute", left: 300, top: 20 }}>
                  <StoreFlow frame={ctx.frame - STORE_START} fps={FPS} height={760} />
                </div>
                <div style={{ position: "absolute", left: 1090, top: 90 }}>
                  <DownloadCta progress={ctx.beatProgress} />
                </div>
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
        )}
      </>
    )}
  />
);
