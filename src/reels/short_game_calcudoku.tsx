// CALCUDOKU — seventeenth Math Game Zone reel, and a SIXTEENTH distinct cast: two octopuses
// (`Octopus`) over a brand-new `DeepSeaLagoonWorld`. Octopuses were picked on purpose: eight
// arms is the cultural shorthand for "juggling many things at once" — and Calcudoku is exactly
// that, several cages each combining their own arithmetic simultaneously.
//
// Confirmed from the user's own gameplay recording (post-transpose=2 correction — the .mov was
// captured rotated 90°, same anomaly as every prior gameplay clip; the screenshots this time
// were already landscape-correct): an irregular grid of "cages" outlined together, each with a
// small clue in its first cell ("3+", "6×"...), filled one cage at a time, a completed cage
// flashing green. The exact 3x3 solved grid taught here (row0: 1,2,3 / row1: 2,3,1 / row2:
// 3,1,2 — cages "3+"={1,2}, "3"={3}, "6×"={2,3}, "2-"={3,1}, "2×"={1,2}) is the SAME grid the
// real level-select screen shows as its own preview (verified in ss_calcudoku.png).
//
// Every salient script phrase drives a matching animation (established discipline this
// series): the cage outlines + clue labels pop in on "just cages... a target inside each
// one!", the "3+" cage glows the moment it's NAMED (before any fill) on "This cage says three
// plus...", then 1 and 2 type in on their own words, cage flashing green on "three!" — same
// pattern for the "6×" cage — and a row/column outline sweep plus every remaining cage
// completing together lands on "No repeats in any row or column... every cage has to work out
// too!"
//
// Timing from public/audio/short_video_game_calcudoku/*.phrases.json, aligned from
// docs/reel_game_calcudoku_lines.txt. 12 phrases, ~56.5s. THIRTEEN word-level anomalies
// patched (checked every word in every phrase, not just each phrase's first word — see
// [[feedback_script_driven_animation]]).

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_calcudoku.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Octopus, type OctopusMood } from "../components/heroes/Octopus";
import { DeepSeaLagoonWorld } from "../components/heroes/DeepSeaLagoonWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { CalcudokuSim, type CalcCage, type CellFill, type CageBeat } from "../components/gamezone/sims/CalcudokuSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 56.28;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_CALCUDOKU_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the board
// Solved layout: 1,2,3 / 2,3,1 / 3,1,2 — the SAME layout the real level-select screen shows
// as its own preview (ss_calcudoku.png).
const CAGES: CalcCage[] = [
  { id: 1, cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }], label: "3+", color: "#E8637A" },
  { id: 2, cells: [{ row: 0, col: 2 }], label: "3", color: "#E8A93C" },
  { id: 3, cells: [{ row: 1, col: 0 }, { row: 2, col: 0 }], label: "6×", color: "#4A90D9" },
  { id: 4, cells: [{ row: 1, col: 1 }, { row: 1, col: 2 }], label: "2−", color: "#9B72D9" },
  { id: 5, cells: [{ row: 2, col: 1 }, { row: 2, col: 2 }], label: "2×", color: "#4CC98A" },
];

const FILLS: CellFill[] = [
  { row: 0, col: 0, value: 1, cageId: 1, fillAt: F(18.08) }, // "one"
  { row: 0, col: 1, value: 2, cageId: 1, fillAt: F(20.0) }, // "two"
  { row: 1, col: 0, value: 2, cageId: 3, fillAt: F(25.28) }, // "two"
  { row: 2, col: 0, value: 3, cageId: 3, fillAt: F(26.78) }, // "three"
  { row: 0, col: 2, value: 3, cageId: 2, fillAt: F(34.441) }, // "every"
  { row: 1, col: 1, value: 3, cageId: 4, fillAt: F(34.7) }, // "cage"
  { row: 1, col: 2, value: 1, cageId: 4, fillAt: F(34.98) }, // "has"
  { row: 2, col: 1, value: 1, cageId: 5, fillAt: F(35.26) }, // "to"
  { row: 2, col: 2, value: 2, cageId: 5, fillAt: F(35.46) }, // "work"
];

const CAGE_BEATS: CageBeat[] = [
  { cageId: 1, introAt: F(16.74), solvedAt: F(20.48) }, // "three" / "three!"
  { cageId: 3, introAt: F(24.06), solvedAt: F(27.44) }, // "six" / "six"
];
const ALL_SOLVED_AT = F(35.84); // "too!" — every remaining cage completes together
const SWEEP_ROW_AT = F(32.88); // "row"
const SWEEP_COL_AT = F(33.38); // "column"
const CAGE_REVEAL_AT = F(0.22); // "grid"
const BANNER_AT = F(10.212); // "Fill every cage..."

const SIM_W = 124 * 3 + 6 * 2 + 220;
const SIM_X = (W - SIM_W) / 2;
const SIM_Y = H * 0.16;
const SIM_SCALE = 1.3;

// the persistent "CALCUDOKU! / Brain Puzzles" header — held back until the narrator names the
// game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(7.503); // "This is Calcudoku!"
const SIM_HEADER_AT = F(0.0);

const BENEFIT_AT = F(38.734); // "this" ("this builds arithmetic and logic...")
const BENEFIT_1_AT = F(39.28); // "arithmetic"
const BENEFIT_2_AT = F(40.32); // "logic,"

// ---------------------------------------------------------------- nav montage beats (p10)
const NAV_START = P(10, "start");
const STEP2_AT = F(46.12); // "Calcudoku," (crack open Calcudoku)
const STEP3_AT = F(47.602); // "pick"
const STEP4_AT = F(48.66); // "crack" (the cages!)
const NAV_STEPS = [
  { atFrame: NAV_START, label: "1️⃣ Math Game Zone" },
  { atFrame: STEP2_AT, label: "2️⃣ Calcudoku" },
  { atFrame: STEP3_AT, label: "3️⃣ Choose your level" },
  { atFrame: STEP4_AT, label: "4️⃣ Crack the cages!" },
];
// Segments in nav_calcudoku.mp4 are built at exactly these durations — home 68f
// (NAV_START→STEP2_AT), zone 44f (STEP2_AT→STEP3_AT), diff 32f (STEP3_AT→STEP4_AT), gameplay
// 105f (STEP4_AT→STORE_START) — so the video's own screen change lands on the same word as
// each step chip, not on an independent timeline.
const NAV_END = NAV_START + 249;

const STORE_START = P(11, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  ...FILLS.map((f) => ({ frame: f.fillAt, file: "gz_tap.mp3", vol: 0.35 })),
  { frame: CAGE_BEATS[0].solvedAt, file: "gz_win.mp3", vol: 0.45 },
  { frame: CAGE_BEATS[1].solvedAt, file: "gz_win.mp3", vol: 0.45 },
  { frame: ALL_SOLVED_AT, file: "gz_win.mp3", vol: 0.6 },
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
const CAPTION_KEYWORDS = ["Calcudoku!", "solved!", "too!", "arithmetic", "together!", "now"];

export const ShortGameCalcudoku: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 8;
  const parentBeat = p === 9;
  const dimIn = parentBeat ? interpolate(frame, [P(9, "start"), P(9, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const octoMoodA: OctopusMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p === 4 || p === 6 ? "point" : p === 5 || p === 7 ? "juggle" : p === 8 ? "cheer" : parentBeat ? "point" : "sit";
  const octoMoodB: OctopusMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p === 4 || p === 6 ? "think" : p === 5 || p === 7 ? "cheer" : p === 8 ? "cheer" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.83;

  return (
    <AbsoluteFill style={{ background: "#1D5C74" }}>
      <DeepSeaLagoonWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <CalcudokuSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          cages={CAGES}
          fills={FILLS}
          cageRevealAt={CAGE_REVEAL_AT}
          cageBeats={CAGE_BEATS}
          allSolvedAt={ALL_SOLVED_AT}
          sweepRowAt={SWEEP_ROW_AT}
          sweepColAt={SWEEP_COL_AT}
          bannerAt={BANNER_AT}
          headerAt={SIM_HEADER_AT}
          scale={SIM_SCALE}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 420 * SIM_SCALE} frame={frame} fps={fps} startFrame={ALL_SOLVED_AT + 2} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Octopus x={W * 0.16} y={mascotY} scale={1.0} mood={octoMoodA} name="coral" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Octopus x={W * 0.84} y={mascotY} scale={0.92} mood={octoMoodB} name="teal" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(8,32,47,0.6)", opacity: dimIn }} />}
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
            // A DIFFERENT cage (5+ = 2+3, not the sim's own taught 3+, 6×, 2−, 2×) illustrating
            // that a cage's math works out the same way for ANY cage, not a memorized answer.
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
                    🐙 Any cage, same idea:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                    {tile(2, "#E8637A", "#C43C58", "#FFFFFF")}
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 28, color: "#3730A3" }}>+</span>
                    {tile(3, "#E8637A", "#C43C58", "#FFFFFF")}
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 28, color: "#3730A3" }}>=</span>
                    {tile("5+", "#DDF5E3", "#2E9E62", "#1B5E20")}
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
            { icon: "🧮", text: "Arithmetic fluency, cage by cage", atFrame: BENEFIT_1_AT },
            { icon: "🧩", text: "Logic — no repeats in any row or column", atFrame: BENEFIT_2_AT },
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
          videoSrc="videos/nav_calcudoku.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 55, x: 0.393, y: 0.773 },
            { atFrame: NAV_START + 90, x: 0.705, y: 0.889 },
            { atFrame: NAV_START + 128, x: 0.705, y: 0.889 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#0D2B3E" accent="#8E4FD0" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(8,32,47,0.6)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="CALCUDOKU!" section="puzzles" y={H * 0.04} width={W} />
      )}

      <BrandBadge portrait />
      <PoweredBy portrait />

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

      <Audio src={staticFile("audio/short_video_game_calcudoku/short_video_game_calcudoku.mp3")} />
    </AbsoluteFill>
  );
};
