// E03 · Adding two numbers — 16:9 and 4:5 from one reel.
//
// Level 2 Chapters 1 "Earth Add" and 2 "Heaven Add" in one, using the app's own worked pairs:
// 1+2, 2+2, 0+5, 5+1, 5+4, then 6+3 and 7+1 to show the first number need not be five, then
// 5+2 as the quiz. Every pair is DIRECT — nothing here needs a complement, which is E05.
//
// Timing comes from src/data/e03.phrases.json, aligned from docs/E03_spoken.txt (the AS
// RECORDED text). Word match 544/544. 70 spoken lines -> 71 PHRASES; every index below is a
// phrase index.
//
// TWO THINGS THIS EPISODE DOES DIFFERENTLY, both asked for:
//   · its own abacus palette (RIG_SEA — teal beads on driftwood), because a third episode in
//     E01/E02's orange-on-brown livery is "one episode reskinned" applied to the one object
//     that is on screen the whole time;
//   · a visual change on EVERY phrase. The explanatory lines are the hard ones — "the upper
//     bead is worth five and the lower bead is worth one" moves no beads at all — so those
//     get value chips ON the beads, or the bucket, or the plus character.

import React from "react";
import phrasesJson from "../data/e03.phrases.json";
import { makeTrack, sec, type TPhrase } from "../lib/timing";
import { E03_CARDS, assertCards } from "../data/e03Cards";
import { NextUpCard, SubscribeCard } from "../components/Outro";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { PlusGuy, type PlusMood } from "../components/e03/PlusGuy";
import { Bucket } from "../components/e03/Bucket";
import { Abacus, type RodState } from "../components/Abacus";
import { Card, StickerText } from "../components/Sticker";
import { bob } from "../lib/motion";
import { KID_FONT } from "../lib/fonts";
import { SceneStage, type SfxCue } from "../stage/SceneStage";
import { firstPhraseWhere, numberWordFrames, wordFrameIn } from "../stage/clock";
import type { CardSpec, Scene as BaseScene } from "../stage/types";
import { RIG_SEA, WORLDS } from "../data/theme";
import { FPS, PLACE_COLORS, ROD_DIM } from "../data/tokens";

export const AUDIO_SEC = 246.126;
export const E03_DURATION = sec(AUDIO_SEC, FPS); // 7384

const PHRASES = phrasesJson as unknown as TPhrase[];
const track = makeTrack(PHRASES, AUDIO_SEC, FPS);

assertCards((p) => PHRASES[p]?.text ?? "");

interface Scene extends BaseScene {
  /** the plus character's state, and whether it is on screen at all */
  plus?: PlusMood;
  /** pebbles in the bucket — always equal to the rod's value */
  bucket?: number;
  /** what the bucket held before this line, so pebbles drop in rather than appear */
  bucketFrom?: number;
  /** the big answer number in the headline band */
  big?: string;
  /** the sum being worked, e.g. "1 + 2" — completes to "1 + 2 = 3" on the answer line */
  sum?: string;
  /** the your-turn prompt */
  question?: boolean;
}

const BASE = 1.15;

const BIG_TOP = 20;
const BIG_SIZE = 92;
const BIG_H = 166;
const bigW = (t: string) => Math.max(150, t.length * BIG_SIZE * 0.66 + 80);

/** Room reserved beside the abacus in 4:5: the bucket on the left, the plus guy on the right. */
const PORTRAIT_ROOM = { left: 190, right: 250 };

const rig = (value: number): RodState[] =>
  Array.from({ length: 5 }, (_, i) => ({
    value: i === 0 ? value : 0,
    focus: i === 0 ? 1 : ROD_DIM,
  }));

/** What the rod reads on each phrase, and what it read on the one before. */
const VALUE: Record<number, number> = {
  // hook — the rod recaps E02 by counting itself, then clears
  0: 0, 1: 0, 2: 0, 3: 0,
  // what adding means: make 2, add 1, read 3
  4: 0, 5: 2, 6: 3, 7: 3,
  // one plus two
  8: 0, 9: 1, 10: 1, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3,
  // two plus two
  16: 0, 17: 2, 18: 4, 19: 4, 20: 4,
  // the lower-bead rule
  21: 1, 22: 4, 23: 4,
  // the upper bead adds five
  24: 4, 25: 0, 26: 0, 27: 5, 28: 5, 29: 5,
  // five plus one
  30: 0, 31: 5, 32: 6, 33: 6, 34: 6,
  // five plus four
  35: 0, 36: 5, 37: 9, 38: 9,
  // any number — six plus three
  39: 9, 40: 0, 41: 5, 42: 6, 43: 6, 44: 9, 45: 9,
  // seven plus one
  46: 9, 47: 0, 48: 5, 49: 7, 50: 8, 51: 8,
  // your turn — five plus two
  52: 0, 53: 0, 54: 5, 55: 7, 56: 7, 57: 7, 58: 7,
  // when the beads run out
  59: 0, 60: 1, 61: 1, 62: 1, 63: 1, 64: 1, 65: 1,
  // close
  66: 0, 67: 0, 68: 0, 69: 0, 70: 0,
};

const valueAt = (p: number) => VALUE[p] ?? 0;

/** Everything the frame needs, decided purely by which phrase is being spoken. */
const sceneFor = (p: number): Scene => {
  const value = valueAt(p);
  const from = p > 0 ? valueAt(p - 1) : 0;
  const base = {
    stage: "abacus" as const,
    rods: rig(value),
    scale: BASE,
    targetRod: 0,
    highlight: null,
    bucket: value,
    bucketFrom: from,
  };

  // ---------------------------------------------------------------- 1 · HOOK (harbour)
  if (p <= 3) {
    return {
      ...base,
      world: "harbour",
      // the rod counts itself 0-9, a wordless recap of how E02 ended
      rodRamp: p === 0 ? { rod: 0, from: 0, to: 9 } : undefined,
      bucket: p === 0 ? undefined : 0,
      headline:
        p === 1 ? "Two numbers…" : p === 2 ? "…is called adding" : p === 3 ? "Easy!" : undefined,
      plus: p >= 2 ? "idle" : undefined,
    };
  }

  // ------------------------------------------------- 2 · WHAT ADDING MEANS (sandpit)
  if (p <= 7) {
    return {
      ...base,
      world: "sandpit",
      // "moving more beads to the beam" is a statement about the beam
      band: p === 4 ? "top" : undefined,
      highlight: null,
      plus: p === 6 ? "push" : "idle",
      moveOn: p === 5 ? "number" : p === 6 ? "$last" : undefined,
      big: p === 7 ? "3" : undefined,
    };
  }

  // ---------------------------------------------------------------- 3 · ONE PLUS TWO (pebbles)
  if (p <= 15) {
    const counting = p === 13 || p === 14;
    return {
      ...base,
      world: "pebbles",
      sum: p >= 8 ? (p >= 15 ? "1 + 2 = 3" : "1 + 2") : undefined,
      hand: p === 9 ? { digit: "thumb", direction: "up", rod: 0, heaven: false } : undefined,
      moveOn: p === 9 || p === 11 ? "$last" : undefined,
      plus: p === 11 ? "push" : "idle",
      count: counting || p === 10 ? "active" : null,
      countOnNumbers: p === 13,
      // "three lower beads are touching the beam" — the section, not a single bead
      band: p === 14 ? "bottom" : undefined,
    };
  }

  // ---------------------------------------------------------------- 4 · TWO PLUS TWO (shells)
  if (p <= 20) {
    return {
      ...base,
      world: "shells",
      sum: p >= 20 ? "2 + 2 = 4" : "2 + 2",
      moveOn: p === 17 || p === 18 ? "$last" : undefined,
      plus: p === 18 ? "push" : "idle",
      count: p === 19 ? "active" : null,
      band: p === 19 ? "bottom" : undefined,

    };
  }

  // ------------------------------------------------- 5 · THE LOWER-BEAD RULE (slatecliff)
  if (p <= 23) {
    return {
      ...base,
      world: "slatecliff",
      highlight: p === 22 ? "bottom" : null,
      count: p === 23 ? "lower" : null,
      counter: p === 23 ? "1 · 2 · 3 · 4" : undefined,
      plus: "idle",
    };
  }

  // --------------------------------------------- 6 · THE UPPER BEAD ADDS FIVE (goldenhour)
  if (p <= 29) {
    return {
      ...base,
      world: "goldenhour",
      band: p === 24 ? "top" : undefined,
      highlight: p === 25 ? "bottom" : p >= 28 ? "top" : null,
      hand: p === 27 ? { digit: "index", direction: "down", rod: 0, heaven: true } : undefined,
      moveOn: p === 25 ? "$last" : p === 27 ? "down" : undefined,
      big: p === 26 ? "0" : p === 28 ? "5" : undefined,
      plus: p === 29 ? "cheer" : "idle",
      headline: p === 29 ? "One bead, one move" : undefined,
    };
  }

  // ---------------------------------------------------------------- 7 · FIVE PLUS ONE (rockpool)
  if (p <= 34) {
    return {
      ...base,
      world: "rockpool",
      sum: p >= 34 ? "5 + 1 = 6" : "5 + 1",
      moveOn: p === 31 ? "down" : p === 32 ? "$last" : undefined,
      hand: p === 31 ? { digit: "index", direction: "down", rod: 0, heaven: true } : undefined,
      plus: p === 32 ? "push" : "idle",
      // the line that moves no beads at all: each raised bead is labelled with what it is
      // worth, which is precisely what the sentence says
      count: p === 33 ? "active" : null,

    };
  }

  // --------------------------------------------------------------- 8 · FIVE PLUS FOUR (rockpool)
  if (p <= 38) {
    return {
      ...base,
      world: "rockpool",
      sum: p >= 38 ? "5 + 4 = 9" : "5 + 4",
      moveOn: p === 36 ? "down" : p === 37 ? "$last" : undefined,
      hand: p === 36 ? { digit: "index", direction: "down", rod: 0, heaven: true } : undefined,
      plus: p === 37 ? "push" : "idle",
      count: p === 37 ? "active" : null,

    };
  }

  // ------------------------------------------------- 9 · FROM ANY NUMBER (rockpool)
  if (p <= 51) {
    const six = p >= 40 && p <= 45;
    return {
      ...base,
      world: "rockpool",
      sum: six
        ? p >= 45
          ? "6 + 3 = 9"
          : "6 + 3"
        : p >= 47
        ? p >= 51
          ? "7 + 1 = 8"
          : "7 + 1"
        : undefined,
      moveOn:
        p === 41 || p === 48 ? "down" : p === 42 || p === 44 || p === 49 || p === 50 ? "$last" : undefined,
      hand:
        p === 41 || p === 48
          ? { digit: "index", direction: "down", rod: 0, heaven: true }
          : undefined,
      plus: p === 44 || p === 50 ? "push" : "idle",
      // "the rod is showing six/seven" — no bead moves, so the beads number themselves
      count: p === 43 || p === 49 || p === 44 || p === 50 ? "active" : null,
      headline: p === 39 ? "Any number!" : undefined,
    };
  }

  // ---------------------------------------------------------------- 10 · YOUR TURN (sunsetsea)
  if (p <= 58) {
    return {
      ...base,
      world: "sunsetsea",
      question: p <= 53,
      sum: p >= 54 && p <= 57 ? (p === 57 ? "5 + 2 = 7" : "5 + 2") : undefined,
      moveOn: p === 54 ? "down" : p === 55 ? "$last" : undefined,
      hand: p === 54 ? { digit: "index", direction: "down", rod: 0, heaven: true } : undefined,
      plus: p === 55 ? "push" : p === 58 ? "cheer" : "idle",
      count: p === 56 ? "active" : null,

      headline: p === 58 ? "Great job!  ⭐" : undefined,
    };
  }

  // ------------------------------------------- 11 · WHEN THE BEADS RUN OUT (sunsetsea)
  if (p <= 65) {
    return {
      ...base,
      world: "sunsetsea",
      bucket: undefined,
      sum: p >= 61 && p <= 63 ? "1 + 4 = ?" : undefined,
      moveOn: p === 60 ? "$last" : undefined,
      // one bead rising is a very small change in a 1920 frame; the line says "make one", so
      // the one is worth showing
      big: p === 60 ? "1" : undefined,
      // THE GAG: it shoves, meets no room, and rebounds
      plus: p === 61 ? "push" : p === 62 || p === 63 ? "bounce" : "idle",
      // the card goes LEFT here: the plus guy is mid-bounce on the right
      panelSide: p === 62 ? "left" : undefined,
      highlight: p === 62 ? "bottom" : null,
      headline: p === 65 ? "Very soon…" : undefined,
    };
  }

  // ---------------------------------------------------------------- 12 · CLOSE (sunsetsea)
  return {
    ...base,
    world: "sunsetsea",
    bucket: undefined,
    rodRamp: p === 66 ? { rod: 0, from: 0, to: 9 } : undefined,
    closing: p >= 67,
    closeBeat: p === 67 ? "subscribe" : p <= 69 ? "store" : "next",
    worldWash: p === 68 || p === 69 ? 0.55 : undefined,
    noCaption: p === 68 || p === 69,
    headline: p === 66 ? "Your turn!" : undefined,
    plus: p === 66 ? "cheer" : undefined,
  };
};

// ---------------------------------------------------------------- rendering

const cardFor = (p: number): CardSpec | undefined => E03_CARDS[p];

const STORE_START = (() => {
  const i = firstPhraseWhere(PHRASES, (j) => sceneFor(j).closeBeat === "store");
  return i < 0 ? 0 : sec(PHRASES[i].start, FPS);
})();

const STORE_FRAMES = (() => {
  const idx = PHRASES.map((x) => x.index).filter((i) => sceneFor(i).closeBeat === "store");
  if (!idx.length) return 181;
  return sec(PHRASES[idx[idx.length - 1]].end, FPS) - STORE_START;
})();

/**
 * Sound derived from the script: a bead click wherever the rod's value really changes, ON the
 * word that moves it; a tick per spoken number in a counted run; the app's chime on each
 * answer; and a comic thud when the plus guy bounces off.
 */
const SFX_CUES: SfxCue[] = (() => {
  const cues: SfxCue[] = [];
  const at = (i: number) => sec(PHRASES[i].start, FPS);
  const add = (frame: number, file: string, len: number, vol: number) =>
    cues.push({ frame: Math.max(0, Math.round(frame)), file, len, vol });
  const on = (i: number, w: string) => wordFrameIn(PHRASES[i], w, FPS) ?? at(i);

  for (let i = 1; i < PHRASES.length; i++) {
    if (valueAt(i) === valueAt(i - 1)) continue;
    const mv = sceneFor(i).moveOn;
    add(mv ? on(i, mv) : at(i), "abacus_move.mp3", 30, 0.32);
  }
  for (const i of [13, 19, 23, 37, 62]) {
    for (const f of numberWordFrames(PHRASES[i], FPS)) add(f, "tick.mp3", 12, 0.28);
  }
  // each answer lands
  for (const i of [15, 20, 28, 34, 38, 45, 51, 57]) {
    add(on(i, "is") ?? at(i), "option_correct_ans.mp3", 60, 0.3);
  }
  add(at(58), "clap.mp3", 90, 0.28);
  // the reveal of the upper bead, and the gag
  add(at(24) - 12, "reveal5.mp3", 64, 0.44);
  add(on(62, "only"), "nope.mp3", 34, 0.4);
  add(at(63), "boing.mp3", 24, 0.34);

  let prevKey: number | undefined;
  for (let i = 0; i < PHRASES.length; i++) {
    const key = E03_CARDS[i]?.key;
    if (key !== undefined && key !== prevKey) add(at(i), "swipe.mp3", 14, 0.22);
    if (key !== undefined) prevKey = key;
  }
  // the two self-counting runs, one click per number
  for (const i of [0, 66]) {
    const span = sec(PHRASES[i].end, FPS) - at(i);
    for (let k = 1; k <= 9; k++) add(at(i) + (span * k) / 10, "abacus_move.mp3", 22, 0.24);
  }
  // like / subscribe / store
  const p67 = at(67);
  const len67 = sec(PHRASES[67].end, FPS) - p67;
  add(p67 + len67 * 0.14, "btn_click.mp3", 20, 0.3);
  add(p67 + len67 * 0.42, "btn_click.mp3", 20, 0.3);
  add(p67 + len67 * 0.58, "bell.mp3", 46, 0.34);
  const rate = STORE_FRAMES / 136;
  add(STORE_START + 50 * rate, "btn_click.mp3", 20, 0.28);
  add(STORE_START + 92 * rate, "btn_click.mp3", 20, 0.3);
  add(STORE_START + 136 * rate - 8, "play_win.mp3", 60, 0.26);
  add(at(70), "swipe.mp3", 16, 0.24);
  return cues;
})();

export const E03AddingTwoNumbers: React.FC = () => (
  <SceneStage<Scene>
    phrases={PHRASES}
    track={track}
    sceneFor={sceneFor}
    narration="audio/e003_one_to_nine_addition/E03.mp3"
    sfx={SFX_CUES}
    abacusFirstFrame={0}
    cardFor={cardFor}
    subjectFor={() => undefined}
    runSlots={[150, 300, 210, 360]}
    guardOverlap
    arrowClearance
    // its own abacus: teal beads on driftwood, not E01/E02's orange on brown
    palette={RIG_SEA}
    sideRoom={() => PORTRAIT_ROOM}
    stageShift={() => ({ left: 0, right: 0 })}
    boxesFor={(scene, ctx) => {
      const L = ctx.layout;
      const out = [];
      if (scene.big) {
        const w = bigW(scene.big);
        out.push({ label: "number", r: { x: (L.W - w) / 2, y: BIG_TOP, w, h: BIG_H } });
      }
      if (scene.sum) {
        const w = Math.max(240, scene.sum.length * 44 + 100);
        out.push({
          label: "sum",
          r: { x: (L.W - w) / 2, y: BIG_TOP + 14, w, h: 132 },
        });
      }
      if (scene.question) {
        out.push({
          label: "prompt",
          r: { x: L.W / 2 - 300, y: L.portrait ? 30 : L.band.stageTop - 132, w: 600, h: 150 },
        });
      }
      if (scene.plus && scene.plus !== "idle" && !scene.hand) {
        const s = ctx.box.scale * 1.7;
        out.push({
          label: "plusGuy",
          r: {
            x: ctx.box.left + ctx.box.w + 176 * ctx.box.scale - 56 * s,
            y: ctx.box.top + ctx.box.h * 0.86 - 56 * s,
            w: 112 * s,
            h: 112 * s,
          },
        });
      }
      if (scene.bucket !== undefined) {
        const s = ctx.box.scale * 0.72;
        out.push({
          label: "bucket",
          r: { x: ctx.box.left - 175 * s - 60, y: ctx.box.top + 110, w: 175 * s + 40, h: 230 * s },
        });
      }
      return out;
    }}
    renderUnder={(scene, ctx) => (
      <>
        {scene.bucket !== undefined && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <Bucket
              count={scene.bucket}
              from={scene.bucketFrom ?? scene.bucket}
              settle={ctx.settle}
              x={ctx.box.left - 132 * ctx.box.scale}
              y={ctx.box.top + 96}
              scale={ctx.box.scale * 1.05}
              frame={ctx.frame}
              fps={FPS}
            />
          </svg>
        )}

        {/* The sum being worked. In the HEADLINE band: under the abacus it began at y 825
            against a caption band starting at 860, so it crossed the boundary. It also
            replaces the separate big number on answer lines — "1 + 2 = 3" already says the
            answer, and showing both said it twice. */}
        {scene.sum && (
          <div
            style={{
              position: "absolute",
              left: 0,
              width: ctx.layout.W,
              top: BIG_TOP + 14 + bob(ctx.frame, FPS, 5, 3.4),
              display: "flex",
              justifyContent: "center",
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
        {scene.plus && scene.plus !== "idle" && !scene.hand && (
          <svg
            width={ctx.layout.W}
            height={ctx.layout.H}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <PlusGuy
              x={ctx.box.left + ctx.box.w + 176 * ctx.box.scale}
              y={ctx.box.top + ctx.box.h * 0.86}
              scale={ctx.box.scale * 1.7}
              mood={scene.plus}
              progress={ctx.beatProgress}
              frame={ctx.frame}
              fps={FPS}
            />
          </svg>
        )}

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
              top: ctx.layout.portrait ? 30 : ctx.layout.band.stageTop - 132,
              textAlign: "center",
            }}
          >
            <Card bg={PLACE_COLORS[0]}>
              <StickerText size={92}>5 + 2 = ?</StickerText>
            </Card>
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
                        size={pt ? 46 : 54}
                        color="#1F3B4D"
                        style={{ display: "block", textAlign: "left", textShadow: "none" }}
                      >
                        {"Enjoyed this?\nLike and subscribe\nfor more"}
                      </StickerText>
                    </Card>
                  </div>
                </>
              )}

              {scene.closeBeat === "store" && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: pt ? (ctx.layout.W - 245) / 2 : 300,
                      top: pt ? 6 : 20,
                    }}
                  >
                    <StoreFlow
                      frame={ctx.frame - STORE_START}
                      fps={FPS}
                      height={pt ? 500 : 760}
                      span={STORE_FRAMES}
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      left: pt ? 0 : 1090,
                      top: pt ? 530 : 90,
                      width: pt ? ctx.layout.W : undefined,
                      display: pt ? "flex" : undefined,
                      justifyContent: pt ? "center" : undefined,
                      transform: pt ? "scale(0.82)" : undefined,
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
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <NextUpCard
                    progress={ctx.beatProgress}
                    title={["bigger", "numbers"]}
                    example={
                      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <Abacus
                          rods={[
                            { value: ctx.beatProgress > 0.45 ? 4 : 0, from: 0 },
                            { value: ctx.beatProgress > 0.45 ? 2 : 0, from: 0 },
                          ]}
                          settle={Math.max(
                            0,
                            Math.min(1, (ctx.beatProgress - 0.45) / 0.25)
                          )}
                          scale={0.52}
                          palette={RIG_SEA}
                        />
                        <span
                          style={{
                            fontFamily: KID_FONT,
                            fontWeight: 700,
                            fontSize: 96,
                            color: ctx.beatProgress > 0.45 ? "#0E7C86" : "#AFC2C9",
                          }}
                        >
                          {ctx.beatProgress > 0.45 ? "24" : "??"}
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
