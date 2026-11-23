// SUDOKU — twelfth Math Game Zone reel, and an ELEVENTH distinct cast: two raccoons
// (`Raccoon`) over a brand-new lavender `PuzzleStudyWorld`. Raccoons were picked on purpose:
// cleverness is their whole cultural shorthand, and Sudoku is the "Brain Puzzles" section's
// own logic game.
//
// Confirmed from the user's own gameplay recording: alternating 2×2-box shading, blank cells
// empty until tapped, a small number pad of only the grid's own digits, "You are a genius!"
// completion popup. The taught 4×4 grid (1,2,3,4 / 3,4,1,2 / 2,1,4,3 / 4,3,2,1) is verified by
// hand: every row, column, and 2×2 box contains 1-4 with no repeats.
//
// Every salient script phrase drives a matching animation from the start this time (lesson
// from Math Pyramid): the grid grows in on "numbers...", the blank pulses on "missing", the
// row/column/box RULES sweep-highlight exactly as those words are said, and each fill lands
// on the word naming its context. The nav montage's video segments are built at durations
// derived directly from the SAME word timestamps driving the step chips — not a separate
// duration budget — so the on-screen app screen changes exactly when each phrase names it.
//
// Timing from public/audio/short_video_game_sudoku/*.phrases.json, aligned from
// docs/reel_game_sudoku_lines.txt. 12 phrases, ~53.4s. EIGHT anomalies patched.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_sudoku.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Raccoon, type RaccoonMood } from "../components/heroes/Raccoon";
import { PuzzleStudyWorld } from "../components/heroes/PuzzleStudyWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { SudokuSim, type SudokuCell, type SudokuBlank, type RuleSweep } from "../components/gamezone/sims/SudokuSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 53.39425;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_SUDOKU_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the grid + blanks
// 1 2 3 4 / 3 4 1 2 / 2 1 4 3 / 4 3 2 1 — every row, column, and 2×2 box holds 1-4 once.
const A_LOCK = F(21.42); // "three!"
const B_LOCK = F(26.52); // "place!"
const C_LOCK = F(29.6); // "row,"
const D_LOCK = F(32.48); // "puzzle!" — full grid complete

const MISSING_PULSE_AT = F(2.84); // "missing" (phrase1) — the teaching blank previews early

const GRID: SudokuCell[][] = [
  [
    { value: 1, given: true, emphasizeAt: [F(15.3)] }, // "One,"
    { value: 2, given: true, emphasizeAt: [F(16.14)] }, // "two..."
    { value: 3, given: false, emphasizeAt: [MISSING_PULSE_AT] },
    { value: 4, given: true, emphasizeAt: [F(17.52)] }, // "four"
  ],
  [{ value: 3, given: true }, { value: 4, given: true }, { value: 1, given: false }, { value: 2, given: true }],
  [{ value: 2, given: false }, { value: 1, given: true }, { value: 4, given: true }, { value: 3, given: true }],
  [{ value: 4, given: true }, { value: 3, given: true }, { value: 2, given: true }, { value: 1, given: false }],
];

const BLANKS: SudokuBlank[] = [
  { row: 0, col: 2, cellTapAt: F(20.22), padTapAt: F(20.88), lockAt: A_LOCK }, // "missing" / "must"
  { row: 1, col: 2, cellTapAt: F(22.8), padTapAt: F(24.16), lockAt: B_LOCK }, // "Tap" / "tap"
  { row: 2, col: 0, cellTapAt: F(28.48), padTapAt: F(29.24), lockAt: C_LOCK }, // "repeats" / "any"
  { row: 3, col: 3, cellTapAt: F(30.34), padTapAt: F(30.9), lockAt: D_LOCK }, // "column," / "box"
];

// "row, column, and box" is said TWICE in this script — phrase3 (the rules intro) and again
// in phrase7 ("No repeats in any row, column, or box"). Both mentions get their own sweep,
// not just the first: every occurrence of a structural word gets a matching highlight, not
// only the first time it's said.
const RULE_SWEEPS: RuleSweep[] = [
  { kind: "row", index: 0, at: F(9.52) }, // phrase3: "row,"
  { kind: "col", index: 0, at: F(10.22) }, // phrase3: "column,"
  { kind: "box", index: 0, at: F(11.0) }, // phrase3: "box"
  { kind: "row", index: 2, at: F(29.6) }, // phrase7: "row," — the row blank C just locked into
  { kind: "col", index: 3, at: F(30.34) }, // phrase7: "column," — blank D's own column
  { kind: "box", index: 3, at: F(30.9) }, // phrase7: "box" — blank D's own 2×2 box
];

const SIM_X = W / 2 - 213;
const SIM_Y = H * 0.14;

// the persistent "SUDOKU! / Brain Puzzles" header — held back until the narrator names the
// game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(7.528); // "This is Sudoku!"
const SIM_HEADER_AT = F(0.0);
const GROW_FROM = F(0.24); // "grid"
const GROW_TO = F(1.24); // "numbers..."

const BENEFIT_AT = F(35.04); // "this" (builds logic...)
const BENEFIT_1_AT = F(35.58); // "logic"
const BENEFIT_2_AT = F(36.26); // "careful" (thinking)

// ---------------------------------------------------------------- nav montage beats (p10)
const NAV_START = P(10, "start");
const STEP2_AT = F(44.72); // "Sudoku,"
const STEP3_AT = F(45.9); // "pick"
const STEP4_AT = F(47.04); // "get"
const NAV_STEPS = [
  { atFrame: NAV_START, label: "1️⃣ Math Game Zone" },
  { atFrame: STEP2_AT, label: "2️⃣ Sudoku" },
  { atFrame: STEP3_AT, label: "3️⃣ Choose your level" },
  { atFrame: STEP4_AT, label: "4️⃣ Get solving!" },
];
// Segments in nav_sudoku.mp4 are built at exactly these durations — home 58f
// (NAV_START→STEP2_AT), zone 35f (STEP2_AT→STEP3_AT), diff 34f (STEP3_AT→STEP4_AT), gameplay
// 63f (STEP4_AT→STORE_START) — so the video's own screen change lands on the same word as
// each step chip, not on an independent timeline.
const NAV_END = NAV_START + 190;

const STORE_START = P(11, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: BLANKS[0].padTapAt, file: "gz_tap.mp3", vol: 0.45 },
  { frame: A_LOCK, file: "gz_correct.mp3", vol: 0.5 },
  { frame: BLANKS[1].padTapAt, file: "gz_tap.mp3", vol: 0.45 },
  { frame: B_LOCK, file: "gz_correct.mp3", vol: 0.5 },
  { frame: BLANKS[2].padTapAt, file: "gz_tap.mp3", vol: 0.45 },
  { frame: C_LOCK, file: "gz_correct.mp3", vol: 0.5 },
  { frame: BLANKS[3].padTapAt, file: "gz_tap.mp3", vol: 0.45 },
  { frame: D_LOCK, file: "gz_win.mp3", vol: 0.55 },
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
const CAPTION_KEYWORDS = ["Sudoku!", "three!", "repeats!", "logic", "careful", "free"];

export const ShortGameSudoku: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 7;
  // Held through BOTH the parent line (p===8) and the transition line "Ready to test your
  // logic?" (p===9) — the phrase pointer reaches p===9 well before the nav montage starts at
  // p===10, and gating only on p===8 would leave that whole beat with nothing on screen.
  const parentBeat = p === 8 || p === 9;
  const dimIn = parentBeat ? interpolate(frame, [P(8, "start"), P(8, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const raccoonMoodA: RaccoonMood = p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 5 ? "point" : p === 6 || p === 7 ? "spot" : parentBeat ? "point" : "sit";
  const raccoonMoodB: RaccoonMood = p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 5 ? "think" : p === 6 || p === 7 ? "spot" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.8;

  return (
    <AbsoluteFill style={{ background: "#392A5C" }}>
      <PuzzleStudyWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <SudokuSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          grid={GRID}
          blanks={BLANKS}
          ruleSweeps={RULE_SWEEPS}
          headerAt={SIM_HEADER_AT}
          growFrom={GROW_FROM}
          growTo={GROW_TO}
          scale={1.2}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 260} frame={frame} fps={fps} startFrame={A_LOCK + 2} />
        <Celebration x={W / 2} y={SIM_Y + 260} frame={frame} fps={fps} startFrame={D_LOCK + 2} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Raccoon x={W * 0.16} y={mascotY} scale={1.0} mood={raccoonMoodA} name="charcoal" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Raccoon x={W * 0.84} y={mascotY} scale={0.92} mood={raccoonMoodB} name="fawn" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(20,12,36,0.58)", opacity: dimIn }} />}
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
            const revealIn = interpolate(frame, [popAt + 14, popAt + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const cell = (v: number | string, win = false) => (
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 12,
                  background: win ? "#E8F5E9" : "#FFFFFF",
                  border: `4px solid ${win ? "#2E7D32" : "#C9B8E8"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 0 rgba(0,0,0,0.14)",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 28,
                  color: win ? "#2E7D32" : "#1B1440",
                }}
              >
                {v}
              </div>
            );
            // Spot the RULE, illustrated generically (a fresh 1-2-?-4 row, distinct from the
            // sim's own taught row) — "logic": what's missing, and "careful thinking": check
            // every number 1-4 is used once.
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
                    🧩 Spot what's missing:
                  </span>
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    {cell(2)}
                    {cell(4)}
                    {cell(1)}
                    <div style={{ opacity: revealIn, transform: `scale(${0.6 + revealIn * 0.4})` }}>{cell(3, true)}</div>
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
            { icon: "🧠", text: "Logical thinking, one clue at a time", atFrame: BENEFIT_1_AT },
            { icon: "🔍", text: "Careful checking — smart, not fast", atFrame: BENEFIT_2_AT },
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
          videoSrc="videos/nav_sudoku.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 51, x: 0.789, y: 0.616 },
            { atFrame: NAV_START + 86, x: 0.18, y: 0.776 },
            { atFrame: NAV_START + 120, x: 0.701, y: 0.888 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#2A1F45" accent="#8E4FD0" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(20,12,36,0.58)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="SUDOKU!" section="puzzles" y={H * 0.04} width={W} />
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

      <Audio src={staticFile("audio/short_video_game_sudoku/short_video_game_sudoku.mp3")} />
    </AbsoluteFill>
  );
};
