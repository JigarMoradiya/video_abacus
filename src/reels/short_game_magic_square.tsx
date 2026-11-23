// MAGIC SQUARE — fourteenth Math Game Zone reel, and a THIRTEENTH distinct cast: two turtles
// (`Turtle`, shells painted as a rainbow 3x3 grid) over a brand-new `MosaicPlazaWorld` — a
// candy-colored courtyard whose own floor is a giant checkerboard of rainbow tiles. Turtles
// were picked on purpose: a shell IS already a grid of scutes, the exact "every square has its
// place, every square adds to the whole" idea this game teaches.
//
// Confirmed from the user's own gameplay recording (post-transpose=2 correction — the .mov was
// captured rotated 90°, same anomaly as Number Path's clip, NOT the screenshots this time,
// which were already landscape-correct): a 3x3 grid of colorfully-tiled numbers, live row/
// column sum badges beside and below the grid that flip green the instant a line hits the
// target, and a bear mascot cheering "Awesome!" once the whole board is solved. The exact
// puzzle taught here (2,7,6 / 9,5,1 / 4,3,8 — target 15) is the SAME base square shown on the
// real level-select screen (verified in ss_magic_square.png), reused for full-fidelity nav
// footage: the "diff" screenshot segment of the nav montage is that very screen.
//
// Every salient script phrase drives a matching animation from the start (established
// discipline this series): the grid pops in blank on "a grid of boxes", numbers fill in
// reading order on "every single line must add up the same", row 1 and row 3 each get their
// own narrated running-sum walkthrough, and the nav montage's screen changes are derived from
// the SAME word timestamps as the step chips.
//
// Timing from public/audio/short_video_game_magic_square/*.phrases.json, aligned from
// docs/reel_game_magic_square_lines.txt. 17 phrases, ~55.0s. ELEVEN anomalies patched.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_magic_square.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Turtle, type TurtleMood } from "../components/heroes/Turtle";
import { MosaicPlazaWorld } from "../components/heroes/MosaicPlazaWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { MagicSquareSim, type SquareCell, type LineBeat } from "../components/gamezone/sims/MagicSquareSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 54.98775;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_MAGIC_SQUARE_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the square
// The real base square from the level-select screen (ss_magic_square.png / verified against
// NumberPathLevels-style generated data in a prior session): every row and column sums to 15.
const TARGET = 15;
const RAINBOW = ["#FF7A6B", "#2EC4C6", "#FFC93C", "#9B6BD9", "#3E7BFA", "#FF9F45", "#4CC26B", "#FF6FA5", "#38C6F4"];
const VALUES = [2, 7, 6, 9, 5, 1, 4, 3, 8];
// numbers fill in reading order while "every single line must add up the same!" plays —
// staggered across the words "every"(2.38s) .. "same!"(4.96-5.24s).
const FILL_AT = [2.38, 2.67, 2.96, 3.25, 3.54, 3.83, 4.12, 4.41, 4.7].map(F);
const CELLS: SquareCell[] = VALUES.map((value, i) => ({
  value,
  color: RAINBOW[i],
  revealAt: FILL_AT[i],
  emphasizeAt: i === 0 ? F(15.54) : i === 1 ? F(17.06) : i === 2 ? F(18.66) : i === 6 ? F(22.604) : i === 7 ? F(23.84) : i === 8 ? F(25.22) : undefined,
}));

const GRID_REVEAL_AT = F(0.18); // "grid" ("A grid of boxes...")
const BANNER_AT = F(12.5); // "equal" ("has to equal fifteen!")

// row 1 (2+7+6) and row 3 (4+3+8) each get their own narrated running-sum walkthrough — the
// two examples the locked narration actually calls out by name.
const ROW0_BEAT: LineBeat = { cells: [0, 1, 2], emphasizeAt: [F(15.54), F(17.06), F(18.66)], badgeAt: F(20.16) }; // "Two.../seven.../six..." -> "fifteen!"
const ROW2_BEAT: LineBeat = { cells: [6, 7, 8], emphasizeAt: [F(22.604), F(23.84), F(25.22)], badgeAt: F(26.452) }; // "Four.../three.../eight..." -> "fifteen again"
const ROW_BEATS = [ROW0_BEAT, ROW2_BEAT];

const SOLVED_AT = F(28.6); // "complete!" ("the square is complete!")
const SWEEP_ROWS_AT = F(30.816); // "Every" ("Every row, every column...")
const SWEEP_COLS_AT = F(31.96); // "every" (2nd — "...every column...")
const SWEEP_ALL_AT = F(33.1); // "all" ("...all fifteen.")
const MAGIC_AT = F(34.787); // "That's" ("That's the magic!")

const SIM_W = 400 + 260; // grid + row-badge gutter, matching the sim's own wrapper width
const SIM_X = (W - SIM_W) / 2;
const SIM_Y = H * 0.17;
const SIM_SCALE = 1.5; // bigger sim block: closes the dead vertical gap before the mascots
// AND gives the top cluster (title / chip / mini-badge / banner) more real breathing room
// between elements, since their margins scale up right along with everything else.

// the persistent "MAGIC SQUARE! / Number Adventures" header — held back until the narrator
// names the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(6.691); // "This is Magic Square!"
const SIM_HEADER_AT = F(0.0);

const BENEFIT_AT = F(38.2); // "this" ("this builds structured thinking...")
const BENEFIT_1_AT = F(38.8); // "structured" (thinking)
const BENEFIT_2_AT = F(40.62); // "foundation" (for algebra later)

// ---------------------------------------------------------------- nav montage beats (p15)
const NAV_START = P(15, "start");
const STEP2_AT = F(45.9); // "Magic" (unlock Magic Square)
const STEP3_AT = F(47.26); // "pick" (your level)
const STEP4_AT = F(48.72); // "complete" (the square!)
const NAV_STEPS = [
  { atFrame: NAV_START, label: "1️⃣ Math Game Zone" },
  { atFrame: STEP2_AT, label: "2️⃣ Magic Square" },
  { atFrame: STEP3_AT, label: "3️⃣ Choose your level" },
  { atFrame: STEP4_AT, label: "4️⃣ Solve it!" },
];
// Segments in nav_magic_square.mp4 are built at exactly these durations — home 60f
// (NAV_START→STEP2_AT), zone 41f (STEP2_AT→STEP3_AT), diff 44f (STEP3_AT→STEP4_AT), gameplay
// 33f (STEP4_AT→STORE_START) — so the video's own screen change lands on the same word as
// each step chip, not on an independent timeline.
const NAV_END = NAV_START + 178;

const STORE_START = P(16, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  ...ROW0_BEAT.emphasizeAt.map((f) => ({ frame: f, file: "gz_tap.mp3", vol: 0.4 })),
  { frame: ROW0_BEAT.badgeAt, file: "gz_win.mp3", vol: 0.5 },
  ...ROW2_BEAT.emphasizeAt.map((f) => ({ frame: f, file: "gz_tap.mp3", vol: 0.4 })),
  { frame: ROW2_BEAT.badgeAt, file: "gz_win.mp3", vol: 0.5 },
  { frame: SOLVED_AT, file: "gz_win.mp3", vol: 0.6 },
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
const CAPTION_KEYWORDS = ["Square!", "fifteen!", "complete!", "magic!", "structured", "algebra", "free"];

export const ShortGameMagicSquare: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 13;
  const parentBeat = p === 14;
  const dimIn = parentBeat ? interpolate(frame, [P(14, "start"), P(14, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const turtleMoodA: TurtleMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 10 ? "point" : p === 11 ? "nod" : p === 12 ? "cheer" : p === 13 ? "nod" : parentBeat ? "point" : "sit";
  const turtleMoodB: TurtleMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 10 ? "think" : p === 11 ? "cheer" : p === 12 ? "cheer" : p === 13 ? "cheer" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.83;

  return (
    <AbsoluteFill style={{ background: "#FBD9EC" }}>
      <MosaicPlazaWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <MagicSquareSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          cells={CELLS}
          target={TARGET}
          gridRevealAt={GRID_REVEAL_AT}
          bannerAt={BANNER_AT}
          rowBeats={ROW_BEATS}
          solvedAt={SOLVED_AT}
          sweepRowsAt={SWEEP_ROWS_AT}
          sweepColsAt={SWEEP_COLS_AT}
          sweepAllAt={SWEEP_ALL_AT}
          magicAt={MAGIC_AT}
          headerAt={SIM_HEADER_AT}
          scale={SIM_SCALE}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 420 * SIM_SCALE} frame={frame} fps={fps} startFrame={SOLVED_AT + 2} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Turtle x={W * 0.16} y={mascotY} scale={1.0} mood={turtleMoodA} name="coral" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Turtle x={W * 0.84} y={mascotY} scale={0.92} mood={turtleMoodB} name="cobalt" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(40,20,50,0.55)", opacity: dimIn }} />}
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
            // A DIFFERENT column (7+5+3=15, not the sim's own taught rows) illustrating that
            // ANY line works — structured thinking, not a memorized answer.
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
                    🐢 Any line adds up the same:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                    {tile(7, "#2EC4C6", "#1E9B94", "#FFFFFF")}
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 28, color: "#3730A3" }}>+</span>
                    {tile(5, "#3E7BFA", "#2455C4", "#FFFFFF")}
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 28, color: "#3730A3" }}>+</span>
                    {tile(3, "#FF6FA5", "#D9407F", "#FFFFFF")}
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 28, color: "#3730A3" }}>=</span>
                    {tile(15, "#DDF5E3", "#2E9E62", "#1B5E20")}
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
            { icon: "🧠", text: "Structured thinking, one line at a time", atFrame: BENEFIT_1_AT },
            { icon: "➗", text: "The foundation algebra later builds on", atFrame: BENEFIT_2_AT },
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
          videoSrc="videos/nav_magic_square.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 50, x: 0.606, y: 0.394 },
            { atFrame: NAV_START + 80, x: 0.275, y: 0.89 },
            { atFrame: NAV_START + 125, x: 0.706, y: 0.89 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#2B1B3D" accent="#8E4FD0" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(40,20,50,0.55)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="MAGIC SQUARE!" section="adventures" y={H * 0.04} width={W} />
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

      <Audio src={staticFile("audio/short_video_game_magic_square/short_video_game_magic_square.mp3")} />
    </AbsoluteFill>
  );
};
