// KAKURO — eighteenth Math Game Zone reel, and a SEVENTEENTH distinct cast: two ants (`Ant`)
// over a brand-new `ChalkboardWorld`. Ants were picked on purpose: a single ant is one small,
// organized PART of a bigger whole (the colony) — exactly what Kakuro teaches, seeing a number
// as parts that add up to one sum.
//
// Confirmed from the user's own gameplay recording (post-transpose=2 correction — the .mov was
// captured rotated 90°, same anomaly as every prior gameplay clip; the screenshots this time
// were already landscape-correct): a crossword-style grid of dark "wall" cells — some carrying
// a diagonal-split clue number — and blank cells that fill in as a run is solved, the active
// run highlighting green and flashing brighter once its sum is confirmed. The minimal cross
// taught here (a DOWN run 3+6=9 and an ACROSS run 3+9=12, sharing the "3" cell) is exactly the
// locked script's own numbers.
//
// Every salient script phrase drives a matching animation (established discipline this
// series): the grid pops in on "a crossword of numbers...", the DOWN run glows the moment it's
// NAMED (before any fill) on "Down says nine...", then 3 and 6 type in on their own words,
// flashing green on "nine!" — the ACROSS run repeats the pattern, re-pulsing the SHARED "3"
// cell on its second mention — and a brief re-glow sweep across both solved runs lands on "No
// repeats in a run..."
//
// Timing from public/audio/short_video_game_kakuro/*.phrases.json, aligned from
// docs/reel_game_kakuro_lines.txt. 12 phrases, ~54.7s. TWELVE word-level anomalies patched
// (checked every word in every phrase, not just each phrase's first word — see
// [[feedback_script_driven_animation]]).

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_kakuro.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Ant, type AntMood } from "../components/heroes/Ant";
import { ChalkboardWorld } from "../components/heroes/ChalkboardWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { KakuroSim, type KakuroCell, type EntryFill, type KakuroRun } from "../components/gamezone/sims/KakuroSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 54.7;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390;

export const GAME_KAKURO_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the board
// A minimal cross: DOWN run (3+6=9) and ACROSS run (3+9=12) sharing the "3" cell — the exact
// numbers the locked script narrates.
const CELLS: KakuroCell[] = [
  { row: 0, col: 0, kind: "wall" },
  { row: 0, col: 1, kind: "clue", downClue: 9 },
  { row: 0, col: 2, kind: "wall" },
  { row: 1, col: 0, kind: "clue", acrossClue: 12 },
  { row: 1, col: 1, kind: "entry" },
  { row: 1, col: 2, kind: "entry" },
  { row: 2, col: 0, kind: "wall" },
  { row: 2, col: 1, kind: "entry" },
  { row: 2, col: 2, kind: "wall" },
];

const FILLS: EntryFill[] = [
  { row: 1, col: 1, value: 3, fillAt: F(16.18), reEmphasizeAt: F(22.036) }, // "three" / "three" (again, across)
  { row: 2, col: 1, value: 6, fillAt: F(16.64) }, // "six"
  { row: 1, col: 2, value: 9, fillAt: F(22.5) }, // "nine"
];

const RUNS: KakuroRun[] = [
  { id: 1, cells: [{ row: 1, col: 1 }, { row: 2, col: 1 }], introAt: F(14.2), solvedAt: F(17.5) }, // "Down" / "nine!"
  { id: 2, cells: [{ row: 1, col: 1 }, { row: 1, col: 2 }], introAt: F(18.2), solvedAt: F(23.4) }, // "Across" / "twelve"
];
const BOTH_SOLVED_AT = F(24.66); // "both" (runs solved!)
const SWEEP_AT = F(28.56); // "run" ("No repeats in a run...")
const GRID_REVEAL_AT = F(0.18); // "crossword"
const BANNER_AT = F(9.06); // "Fill the blanks..."
const BLANKS_AT = F(9.44); // "blanks"

const SIM_W = 124 * 3 + 6 * 2 + 220;
const SIM_X = (W - SIM_W) / 2;
const SIM_Y = H * 0.16;
const SIM_SCALE = 1.3;

// the persistent "KAKURO! / Brain Puzzles" header — held back until the narrator names the
// game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(7.22); // "This is Kakuro!"
const SIM_HEADER_AT = F(0.0);

const BENEFIT_AT = F(35.784); // "this" ("this builds sum decomposition...")
const BENEFIT_1_AT = F(36.5); // "sum"
const BENEFIT_2_AT = F(39.86); // "parts"

// ---------------------------------------------------------------- nav montage beats (p10)
const NAV_START = P(10, "start");
const STEP2_AT = F(45.06); // "Kakuro," (take on Kakuro)
const STEP3_AT = F(46.234); // "pick"
const STEP4_AT = F(47.28); // "start" (summing!)
const NAV_STEPS = [
  { atFrame: NAV_START, label: "1️⃣ Math Game Zone" },
  { atFrame: STEP2_AT, label: "2️⃣ Kakuro" },
  { atFrame: STEP3_AT, label: "3️⃣ Choose your level" },
  { atFrame: STEP4_AT, label: "4️⃣ Start summing!" },
];
// Segments in nav_kakuro.mp4 are built at exactly these durations — home 70f
// (NAV_START→STEP2_AT), zone 35f (STEP2_AT→STEP3_AT), diff 31f (STEP3_AT→STEP4_AT), gameplay
// 69f (STEP4_AT→STORE_START) — so the video's own screen change lands on the same word as
// each step chip, not on an independent timeline.
const NAV_END = NAV_START + 205;

const STORE_START = P(11, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  ...FILLS.map((f) => ({ frame: f.fillAt, file: "gz_tap.mp3", vol: 0.4 })),
  { frame: RUNS[0].solvedAt, file: "gz_win.mp3", vol: 0.45 },
  { frame: RUNS[1].solvedAt, file: "gz_win.mp3", vol: 0.45 },
  { frame: BOTH_SOLVED_AT, file: "gz_win.mp3", vol: 0.6 },
  { frame: BENEFIT_AT, file: "gz_benefit.mp3", vol: 0.55 },
  ...NAV_STEPS.map((s) => ({ frame: s.atFrame, file: "gz_tap.mp3", vol: 0.5 })),
  { frame: STORE_START + 4, file: "cta_pop.mp3", vol: 0.45 },
];

const REEL_LAYOUT: Layout = {
  W,
  H,
  portrait: true,
  band: { headlineTop: 0, headlineBottom: 0, stageTop: 0, stageBottom: 0, captionTop: H - 230, captionBottom: H - 90 },
  cardBand: null,
  cardMaxW: W - 80,
  edge: 20,
  captionMaxW: W - 120,
  captionSize: 34,
  propScale: 1,
};
const CAPTION_KEYWORDS = ["Kakuro!", "nine!", "solved!", "once!", "whole!", "try,"];

export const ShortGameKakuro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 8;
  const parentBeat = p === 9;
  const dimIn = parentBeat ? interpolate(frame, [P(9, "start"), P(9, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const antMoodA: AntMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p === 4 || p === 6 ? "point" : p === 5 || p === 7 ? "carry" : p === 8 ? "cheer" : parentBeat ? "point" : "sit";
  const antMoodB: AntMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p === 4 || p === 6 ? "think" : p === 5 || p === 7 ? "cheer" : p === 8 ? "cheer" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.83;

  // a live-ticking timer badge, top-right below the brand logo — same corner the real app's
  // own clock sits in, and continuous motion for the quieter stretches between beats.
  const timerRunningAt = GRID_REVEAL_AT;
  const elapsedSec = Math.max(0, Math.floor(frame >= timerRunningAt ? (frame - timerRunningAt) / fps : 0));
  const timerLabel = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`;

  return (
    <AbsoluteFill style={{ background: "#1E3B30" }}>
      <ChalkboardWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <KakuroSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          cells={CELLS}
          fills={FILLS}
          runs={RUNS}
          gridRevealAt={GRID_REVEAL_AT}
          sweepAt={SWEEP_AT}
          blanksAt={BLANKS_AT}
          bannerAt={BANNER_AT}
          headerAt={SIM_HEADER_AT}
          scale={SIM_SCALE}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 420 * SIM_SCALE} frame={frame} fps={fps} startFrame={BOTH_SOLVED_AT + 2} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Ant x={W * 0.16} y={mascotY} scale={1.0} mood={antMoodA} name="rust" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Ant x={W * 0.84} y={mascotY} scale={0.92} mood={antMoodB} name="ink" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(10,20,15,0.6)", opacity: dimIn }} />}
      {parentBeat && frame >= BENEFIT_AT - 10 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: H * 0.16,
            width: W,
            textAlign: "center",
            opacity: interpolate(frame, [BENEFIT_AT - 10, BENEFIT_AT - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(frame, [BENEFIT_AT - 10, BENEFIT_AT - 2, BENEFIT_AT + 4], [0.3, 1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          }}
        >
          {(() => {
            const popAt = BENEFIT_AT - 10;
            const pop = interpolate(frame, [popAt, popAt + 6, popAt + 10], [0.2, 1.22, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const bob = Math.sin((frame / fps) * 2.1) * 6;
            const tile = (v: number | string, bg: string, border: string, textColor: string) => (
              <div
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: 16,
                  background: bg,
                  border: `4px solid ${border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 5px 0 rgba(0,0,0,0.14)",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 26,
                  color: textColor,
                }}
              >
                {v}
              </div>
            );
            // A DIFFERENT sum (11=4+7, not the sim's own taught 9=3+6 / 12=3+9) illustrating
            // that the decomposition skill works on ANY sum, not a memorized answer.
            return (
              <div style={{ transform: `translateY(${bob}px) scale(${pop})`, display: "inline-block" }}>
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "#FFF8E8",
                    border: "6px solid #8E4FD0",
                    borderRadius: 32,
                    padding: "22px 36px 26px",
                    boxShadow: "0 10px 0 rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 30, color: "#8E4FD0" }}>
                    🐜 Any sum breaks apart:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                    {tile(11, "#DDF5E3", "#2E9E62", "#1B5E20")}
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 28, color: "#3730A3" }}>=</span>
                    {tile(4, "#2EC4C6", "#1E9B94", "#FFFFFF")}
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 28, color: "#3730A3" }}>+</span>
                    {tile(7, "#3E7BFA", "#2455C4", "#FFFFFF")}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      {parentBeat && frame >= BENEFIT_AT - 2 && (
        <BenefitCard
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT}
          benefits={[
            { icon: "➗", text: "Sum decomposition — breaking a number apart", atFrame: BENEFIT_1_AT },
            { icon: "🧩", text: "Seeing numbers as parts of a whole", atFrame: BENEFIT_2_AT },
          ]}
          accent="#8E4FD0"
          x={W / 2 - 340}
          y={H * 0.42}
          width={680}
        />
      )}

      {frame < STORE_START && (
        <AppNavMontage
          frame={frame}
          fps={fps}
          startFrame={NAV_START}
          endFrame={NAV_END}
          videoSrc="videos/nav_kakuro.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 55, x: 0.604, y: 0.773 },
            { atFrame: NAV_START + 90, x: 0.211, y: 0.543 },
            { atFrame: NAV_START + 122, x: 0.211, y: 0.543 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#1E3B30" accent="#2E9E62" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
      )}

      {frame >= STORE_START && (
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
            background: "rgba(10,20,15,0.6)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="KAKURO!" section="puzzles" y={H * 0.04} width={W} />
      )}

      <BrandBadge portrait />
      <PoweredBy portrait />

      {frame >= GRID_REVEAL_AT - 4 && frame < P(9, "start") && (
        <div
          style={{
            position: "absolute",
            right: 26,
            top: 92,
            // fades in with the grid, then out again once the puzzle itself is done — the
            // timer belongs to the game visual, not the parent/store screens after it.
            opacity: interpolate(
              frame,
              [GRID_REVEAL_AT - 4, GRID_REVEAL_AT + 4, P(9, "start") - 10, P(9, "start")],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 20,
              color: "#3A2E1E",
              background: "#FFFFFF",
              borderRadius: 999,
              padding: "7px 16px",
              boxShadow: "0 4px 0 rgba(0,0,0,0.14)",
            }}
          >
            ⏱️ {timerLabel}
          </span>
        </div>
      )}

      {SFX_CUES.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.frame)} durationInFrames={40}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol ?? 1} />
        </Sequence>
      ))}

      {INCLUDE_MUSIC &&
        Array.from({ length: Math.ceil((AUDIO_SEC * FPS) / MUSIC_LOOP_FRAMES) }, (_, i) => (
          <Sequence key={`music${i}`} from={i * MUSIC_LOOP_FRAMES} durationInFrames={MUSIC_LOOP_FRAMES}>
            <Audio src={staticFile("music_bed.mp3")} volume={0.12} />
          </Sequence>
        ))}

      <Audio src={staticFile("audio/short_video_game_kakuro/short_video_game_kakuro.mp3")} />
    </AbsoluteFill>
  );
};
