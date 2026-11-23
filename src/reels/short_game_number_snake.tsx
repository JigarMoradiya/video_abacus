// NUMBER SNAKE — twentieth Math Game Zone reel, and a NINETEENTH distinct cast: two snakes
// (`Snake`) over a brand-new `JungleTrailWorld`. Snakes were picked on purpose: the game is
// literally named after one, and the real app's own connector line between consecutive
// numbers winds across the grid exactly like a snake's trail.
//
// Confirmed from the user's own gameplay recording (post-transpose=2 correction — the .mp4 was
// captured rotated 90°, same anomaly as every prior gameplay clip; the screenshots this time
// were already landscape-correct) AND from reading the actual Swift/Kotlin source directly
// (NumberSnakeModels/Generator/ViewModel, both platforms — see
// [[project_math_game_zone_reels_status]] for the full verification): this is a Hidato-style
// number-placement puzzle, NOT a drag/swipe game — tap a blank cell, then tap a number from the
// tray to place it; a thin line automatically connects any two grid-adjacent cells whose
// values are consecutive. Easy = 4x4 grid, numbers 1-16, ~9 given clues (1 and 16 always
// among them). The exact 1-16 solution taught here (8,9,10,11 / 7,6,5,12 / 2,3,4,13 /
// 1,16,15,14) is lifted directly from the user's own recorded Easy session — every one of its
// 15 consecutive pairs was hand-checked for grid-adjacency before use.
//
// Every salient script phrase drives a matching animation (established discipline this
// series): all 16 cells pop in on "a trail of numbers, winding across the grid...", 6 glows as
// the already-given clue on "Six is already there...", 7 places itself beside it on "seven
// goes right beside it...", 8 places beside 7 on "Then eight goes next to seven...", the
// connector lines light up as each pair fills in, and every remaining blank completes together
// on "Every number from one to sixteen..."
//
// Timing from public/audio/short_video_game_number_snake/*.phrases.json, aligned from
// docs/reel_game_number_snake_lines.txt. 11 phrases, ~52.2s. FOURTEEN word-level anomalies
// patched (checked every word in every phrase, not just each phrase's first word).

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_number_snake.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Snake, type SnakeMood } from "../components/heroes/Snake";
import { JungleTrailWorld } from "../components/heroes/JungleTrailWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { NumberSnakeSim, type SnakeCell } from "../components/gamezone/sims/NumberSnakeSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 52.24;
export const FPS = 30;
export const GAME_NUMBER_SNAKE_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the board
// Solved 4x4 layout, verified real footage: 8,9,10,11 / 7,6,5,12 / 2,3,4,13 / 1,16,15,14 —
// every consecutive pair (1-2, 2-3, ... 15-16) hand-checked for grid adjacency.
const PLACE7_AT = F(16.0); // "seven"
const PLACE8_AT = F(18.88); // "eight"
const REMAINING_AT = F(25.78); // "number" ("Every number from one to sixteen...")
// 3 and 5 fill in during the quiet gap after "...before it!" (12.96s) and before "Six" (14.19s),
// so by the time the narrator gets to "Six is already there... seven goes beside it," the 1-6
// run is already whole on screen instead of showing 3 and 5 as unexplained gaps.
const FILL_3_5_AT = F(13.3);

const CELLS: SnakeCell[] = [
  { row: 0, col: 0, value: 8, given: false, fillAt: PLACE8_AT },
  { row: 0, col: 1, value: 9, given: true },
  { row: 0, col: 2, value: 10, given: false, fillAt: REMAINING_AT + 6 },
  { row: 0, col: 3, value: 11, given: true },
  { row: 1, col: 0, value: 7, given: false, fillAt: PLACE7_AT },
  { row: 1, col: 1, value: 6, given: true },
  { row: 1, col: 2, value: 5, given: false, fillAt: FILL_3_5_AT },
  { row: 1, col: 3, value: 12, given: false, fillAt: REMAINING_AT + 12 },
  { row: 2, col: 0, value: 2, given: true },
  { row: 2, col: 1, value: 3, given: false, fillAt: FILL_3_5_AT },
  { row: 2, col: 2, value: 4, given: true },
  { row: 2, col: 3, value: 13, given: true },
  { row: 3, col: 0, value: 1, given: true },
  { row: 3, col: 1, value: 16, given: true },
  { row: 3, col: 2, value: 15, given: true },
  { row: 3, col: 3, value: 14, given: false, fillAt: REMAINING_AT + 24 },
];

const GRID_REVEAL_AT = F(0.2); // "trail"
const MISSING_AT = F(4.54254); // "but most of them are missing!"
const BANNER_AT = F(9.206); // "Place each number..."

const SIM_W = 112 * 4 + 8 * 3 + 220;
const SIM_X = (W - SIM_W) / 2;
const SIM_Y = H * 0.16;
const SIM_SCALE = 1.3;

// the persistent "NUMBER SNAKE! / Brain Puzzles" header — held back until the narrator names
// the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(7.066); // "This is Number Snake!"
const SIM_HEADER_AT = F(0.0);

const BENEFIT_AT = F(33.94); // "this" ("this builds sequencing and spatial thinking...")
const BENEFIT_1_AT = F(34.44); // "sequencing"
const BENEFIT_2_AT = F(35.48); // "spatial"

// ---------------------------------------------------------------- nav montage beats (p9)
const NAV_START = P(9, "start");
const STEP2_AT = F(42.12); // "Number" (wind through Number Snake)
const STEP3_AT = F(43.497); // "pick"
const STEP4_AT = F(44.7); // "complete" (the trail!)
const NAV_STEPS = [
  { atFrame: NAV_START, label: "1️⃣ Math Game Zone" },
  { atFrame: STEP2_AT, label: "2️⃣ Number Snake" },
  { atFrame: STEP3_AT, label: "3️⃣ Choose your level" },
  { atFrame: STEP4_AT, label: "4️⃣ Complete the trail!" },
];
// Segments in nav_number_snake.mp4 are built at exactly these durations — home 77f
// (NAV_START→STEP2_AT), zone 41f (STEP2_AT→STEP3_AT), diff 36f (STEP3_AT→STEP4_AT), gameplay
// 31f (STEP4_AT→STORE_START) — so the video's own screen change lands on the same word as
// each step chip, not on an independent timeline.
const NAV_END = NAV_START + 185;

const STORE_START = P(10, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: FILL_3_5_AT, file: "gz_tap.mp3", vol: 0.3 },
  { frame: PLACE7_AT, file: "gz_tap.mp3", vol: 0.45 },
  { frame: PLACE8_AT, file: "gz_tap.mp3", vol: 0.45 },
  { frame: REMAINING_AT, file: "gz_win.mp3", vol: 0.6 },
  { frame: BENEFIT_AT, file: "gz_benefit.mp3", vol: 0.55 },
  ...NAV_STEPS.map((s) => ({ frame: s.atFrame, file: "gz_tap.mp3", vol: 0.5 })),
  { frame: STORE_START + 4, file: "cta_pop.mp3", vol: 0.45 },
];

// toggled by hand to produce the "without music" delivered version — ducked way down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

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
const CAPTION_KEYWORDS = ["Snake!", "missing!", "trail!", "sequencing", "time!", "play,"];

export const ShortGameNumberSnake: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 7;
  const parentBeat = p === 8;
  const dimIn = parentBeat ? interpolate(frame, [P(8, "start"), P(8, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const snakeMoodA: SnakeMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p === 4 || p === 6 ? "point" : p === 5 ? "trail" : p === 7 ? "cheer" : parentBeat ? "point" : "sit";
  const snakeMoodB: SnakeMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p === 4 || p === 6 ? "think" : p === 5 ? "cheer" : p === 7 ? "cheer" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.83;

  return (
    <AbsoluteFill style={{ background: "#1F4E33" }}>
      <JungleTrailWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <NumberSnakeSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          cells={CELLS}
          gridRevealAt={GRID_REVEAL_AT}
          missingAt={MISSING_AT}
          place7At={PLACE7_AT}
          place8At={PLACE8_AT}
          bannerAt={BANNER_AT}
          headerAt={SIM_HEADER_AT}
          scale={SIM_SCALE}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 420 * SIM_SCALE} frame={frame} fps={fps} startFrame={REMAINING_AT + 30} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Snake x={W * 0.16} y={mascotY} scale={1.0} mood={snakeMoodA} name="jade" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Snake x={W * 0.84} y={mascotY} scale={0.92} mood={snakeMoodB} name="amber" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(10,25,16,0.6)", opacity: dimIn }} />}
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
            const tile = (v: number, bg: string, border: string, textColor: string) => (
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
            // A DIFFERENT chain (10-11-12, not the sim's own taught 6-7-8) illustrating that
            // the rule — each number sits right beside the one before it — works ANYWHERE on
            // the trail, not just the part the sim walked through.
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
                    🐍 Any numbers, side by side:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 16 }}>
                    {tile(10, "#DDF5E3", "#2E9E62", "#1B5E20")}
                    <span style={{ width: 26, height: 5, background: "#F57C00", borderRadius: 3 }} />
                    {tile(11, "#DDF5E3", "#2E9E62", "#1B5E20")}
                    <span style={{ width: 26, height: 5, background: "#F57C00", borderRadius: 3 }} />
                    {tile(12, "#DDF5E3", "#2E9E62", "#1B5E20")}
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
            { icon: "🧩", text: "Sequencing — what comes next, in order", atFrame: BENEFIT_1_AT },
            { icon: "🗺️", text: "Spatial thinking, seeing the whole grid", atFrame: BENEFIT_2_AT },
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
          videoSrc="videos/nav_number_snake.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 50, x: 0.818, y: 0.804 },
            { atFrame: NAV_START + 90, x: 0.276, y: 0.889 },
            { atFrame: NAV_START + 128, x: 0.705, y: 0.889 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#0F2A1C" accent="#2E9E62" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(10,25,16,0.6)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="NUMBER SNAKE!" section="puzzles" y={H * 0.04} width={W} />
      )}

      <BrandBadge portrait />
      <PoweredBy portrait />

      {INCLUDE_MUSIC &&
        Array.from({ length: Math.ceil((AUDIO_SEC * FPS) / MUSIC_LOOP_FRAMES) }, (_, i) => (
          <Sequence key={`music${i}`} from={i * MUSIC_LOOP_FRAMES} durationInFrames={MUSIC_LOOP_FRAMES}>
            <Audio src={staticFile("music_bed.mp3")} volume={0.12} />
          </Sequence>
        ))}

      {SFX_CUES.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.frame)} durationInFrames={40}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol ?? 1} />
        </Sequence>
      ))}

      <Audio src={staticFile("audio/short_video_game_number_snake/short_video_game_number_snake.mp3")} />
    </AbsoluteFill>
  );
};
