// MATH BINGO — fifth Math Game Zone pilot, and a FOURTH distinct cast: the two foxes (amber &
// silver) from E10's game-show quiz, on a new warm Bingo Hall stage (curtain, bulb lights,
// rising numbered balls) — not Bo & Pip's islands, Zip & Dash's night dojo, or Blaze & Spark's
// sunrise rooftop. A game-show pair fits a call-and-stamp bingo game naturally. Real
// screenshots + real gameplay recording (user-provided) drive the "find it in the app" montage.
//
// Timing from public/audio/short_video_game_math_bingo/*.phrases.json, aligned from
// docs/reel_game_math_bingo_lines.txt. 13 phrases, ~54s. NINE anomalies patched.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_math_bingo.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Fox, type FoxMood } from "../components/e10/Fox";
import { BingoHallWorld } from "../components/heroes/BingoHallWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { MathBingoSim, type MathBingoStoryboard, type CallRound } from "../components/gamezone/sims/MathBingoSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 53.968938;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_MATH_BINGO_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);

// ---------------------------------------------------------------- the sim's storyboard
// Real card values, straight off the user's gameplay recording.
const GRID = [
  [8, 11, 16, 10],
  [4, 9, 14, 3],
  [7, 6, 5, 12],
  [1, 18, 2, 19],
];

// The call flag used to sit on ONE round from frame 0, which meant it showed nothing but a
// bare 🚩 for the whole ~15s hook (the same "static/empty" mistake the True/False reel made
// with its equation card). It now cycles through two quick hook calls — each building fast,
// sitting judged-green for a beat, and stamping its matching diagonal cell — before Round 1's
// real, word-synced "4+5=9" takes over.
const HOOK_CALL_1: CallRound = {
  tokens: ["3", "+", "5", "=", "8"].map((text, i) => ({ text, at: sec(0.55, FPS) + i * 6 })),
  judgeAt: sec(5.5, FPS), // "stamp" in "and stamp it!"
  activeUntil: sec(7.5, FPS),
};
const HOOK_CALL_2: CallRound = {
  tokens: ["2", "+", "3", "=", "5"].map((text, i) => ({ text, at: sec(7.5, FPS) + i * 6 })),
  judgeAt: sec(11.16, FPS), // "stamp," in "Solve, stamp, and race..."
  activeUntil: sec(15.02, FPS),
};
const ROUND1_CALL: CallRound = {
  tokens: [
    { text: "4", at: sec(15.02, FPS) },
    { text: "+", at: sec(15.36, FPS) },
    { text: "5", at: sec(15.62, FPS) },
    { text: "=", at: sec(16.52, FPS) },
    { text: "9", at: sec(16.9, FPS) },
  ],
  judgeAt: sec(16.9, FPS),
  activeUntil: sec(1000, FPS),
};

const STORY: MathBingoStoryboard = {
  grid: GRID,
  callRounds: [HOOK_CALL_1, HOOK_CALL_2, ROUND1_CALL],
  tapAt: sec(19.1, FPS),
  tapRow: 1,
  tapCol: 1,
  // two hook stamps matching the two hook calls above, a third completing the diagonal right
  // before "Get four in a row...", the live-taught one at (1,1)
  stamps: [
    { row: 0, col: 0, at: sec(5.5, FPS) },
    { row: 2, col: 2, at: sec(11.16, FPS) },
    { row: 1, col: 1, at: sec(19.1, FPS) },
    { row: 3, col: 3, at: sec(20.9, FPS) },
  ],
  bingoAt: sec(26.18, FPS),
};

const SIM_X = W / 2 - (4 * 78 + 3 * 8) / 2;
const SIM_Y = H * 0.18;

const TIMER_START_AT = sec(28.73, FPS);

const BENEFIT_AT = sec(33.64, FPS);
const BENEFIT_1_AT = sec(35.34, FPS); // "mental math under pressure"
const BENEFIT_2_AT = sec(37.74, FPS); // "scanning the whole board"

// ---------------------------------------------------------------- nav montage beats (p11)
const NAV_START = P(11, "start");
const NAV_STEPS = [
  { atFrame: sec(42.44, FPS), label: "1️⃣ Math Game Zone" },
  { atFrame: sec(44.3, FPS), label: "2️⃣ Math Bingo" },
  { atFrame: sec(45.94, FPS), label: "3️⃣ Choose your level" },
  { atFrame: sec(46.84, FPS), label: "4️⃣ Play!" },
];
const NAV_END = NAV_START + 189; // 69 (home) + 45 (zone) + 36 (diff) + 39 (gameplay)

const STORE_START = P(12, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: HOOK_CALL_1.judgeAt, file: "gz_tile_place.mp3", vol: 0.4 },
  { frame: HOOK_CALL_2.judgeAt, file: "gz_tile_place.mp3", vol: 0.4 },
  { frame: ROUND1_CALL.judgeAt, file: "gz_correct.mp3", vol: 0.5 },
  { frame: STORY.tapAt! - 8, file: "gz_tap.mp3", vol: 0.5 },
  { frame: sec(20.9, FPS), file: "gz_tile_place.mp3", vol: 0.45 },
  { frame: STORY.bingoAt, file: "gz_win.mp3", vol: 0.6 },
  { frame: STORY.bingoAt + 10, file: "gz_star.mp3", vol: 0.5 },
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
const CAPTION_KEYWORDS = ["stamp", "bingo!", "nine!", "row", "diagonal", "seconds", "pressure", "board", "free"];

export const ShortGameMathBingo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  const showSim = p <= 9;
  const dimIn = p === 10 ? interpolate(frame, [P(10, "start"), P(10, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const secondsLeft = Math.max(0, 90 - Math.floor((frame - TIMER_START_AT) / fps));

  const foxMoodA: FoxMood = p <= 1 ? "wave" : p <= 4 ? "sit" : p <= 6 ? "think" : p === 8 ? "buzz" : p === 9 ? "cheer" : p === 10 ? "point" : p === 11 ? "point" : "sit";
  const foxMoodB: FoxMood = p <= 1 ? "wave" : p <= 4 ? "sit" : p <= 6 ? "sit" : p === 8 ? "cheer" : p === 9 ? "cheer" : p === 10 ? "think" : p === 11 ? "sit" : "sit";
  const mascotY = H * 0.86;

  return (
    <AbsoluteFill style={{ background: "#3A0D12" }}>
      <BingoHallWorld width={W} height={H} frame={frame} fps={fps} />

      {p <= 1 && <GameTitleCard frame={frame} startFrame={sec(0.15, FPS)} title="MATH BINGO!" section="speedy" y={H * 0.04} width={W} />}

      {showSim && <MathBingoSim frame={frame} fps={fps} x={SIM_X} y={SIM_Y} story={STORY} scale={1.4} />}

      {showSim && frame >= TIMER_START_AT - 6 && (
        <div style={{ position: "absolute", top: SIM_Y - 150, right: 40 }}>
          <span
            style={{
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 38,
              color: "#111",
              background: "rgba(255,255,255,0.88)",
              borderRadius: 16,
              padding: "12px 28px",
              display: "inline-block",
            }}
          >
            ⏱ {secondsLeft}s
          </span>
        </div>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 330} frame={frame} fps={fps} startFrame={STORY.bingoAt} />
        <Celebration x={W / 2} y={SIM_Y + 330} frame={frame} fps={fps} startFrame={STORY.bingoAt + 14} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Fox x={W * 0.16} y={mascotY} scale={0.95} mood={foxMoodA} marking="amber" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Fox x={W * 0.84} y={mascotY} scale={0.85} mood={foxMoodB} marking="silver" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {p === 10 && <div style={{ position: "absolute", inset: 0, background: "rgba(20,4,8,0.62)", opacity: dimIn }} />}
      {p === 10 && frame >= BENEFIT_AT - 10 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: H * 0.1,
            width: W,
            textAlign: "center",
            opacity: interpolate(frame, [BENEFIT_AT - 10, BENEFIT_AT - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(frame, [BENEFIT_AT - 10, BENEFIT_AT - 2, BENEFIT_AT + 4], [0.3, 1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: KID_FONT,
                fontWeight: 800,
                fontSize: 46,
                color: "#FFFFFF",
                textShadow: "0 4px 0 rgba(0,0,0,0.3)",
                background: "rgba(0,0,0,0.22)",
                borderRadius: 999,
                padding: "6px 30px",
              }}
            >
              Math Bingo
            </span>
          </div>
          {/* the FULL 4x4 card — one row stamped (one complete line = BINGO), the other
              three plain — reads as an actual bingo card, not just a text badge */}
          <div style={{ display: "inline-block" }}>
            {GRID.map((rowVals, r) => (
              <div key={r} style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                {rowVals.map((val, c) => {
                  const bingoRow = r === 0;
                  const popAt = BENEFIT_AT - 10 + c * 4;
                  const pop = bingoRow
                    ? interpolate(frame, [popAt, popAt + 6, popAt + 10], [0.2, 1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
                    : 1;
                  return (
                    <div
                      key={c}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: bingoRow ? "#4CAF50" : "#FFFFFF",
                        border: `3px solid ${bingoRow ? "#2E7D32" : "#E0D8F0"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: bingoRow
                          ? `0 4px 0 rgba(0,0,0,0.2), 0 0 14px 3px rgba(255,213,79,${0.6 * pop})`
                          : "0 4px 0 rgba(0,0,0,0.16)",
                        transform: `scale(${pop})`,
                      }}
                    >
                      {bingoRow ? (
                        <span style={{ fontSize: 26 }}>⭐</span>
                      ) : (
                        <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 24, color: "#1B1440" }}>{val}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {(() => {
              const popAt = BENEFIT_AT + 8;
              const pop = interpolate(frame, [popAt, popAt + 6, popAt + 10], [0.2, 1.22, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const bob = Math.sin((frame / fps) * 2.1) * 5;
              return (
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: KID_FONT,
                    fontWeight: 800,
                    fontSize: 34,
                    color: "#FFF3D0",
                    background: "#FF8400",
                    border: "4px solid #FFF3D0",
                    borderRadius: 16,
                    padding: "8px 22px",
                    boxShadow: "0 5px 0 rgba(0,0,0,0.25)",
                    transform: `translateY(${bob}px) scale(${pop}) rotate(-4deg)`,
                  }}
                >
                  BINGO!
                </span>
              );
            })()}
          </div>
        </div>
      )}
      {p === 10 && frame >= BENEFIT_AT - 2 && (
        <BenefitCard
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT}
          benefits={[
            { icon: "🧠", text: "Mental math under pressure", atFrame: BENEFIT_1_AT },
            { icon: "👀", text: "Scans the whole board", atFrame: BENEFIT_2_AT },
          ]}
          accent="#FF8400"
          x={W / 2 - 340}
          y={H * 0.34}
          width={680}
        />
      )}

      <AppNavMontage
        frame={frame}
        fps={fps}
        startFrame={NAV_START}
        endFrame={NAV_END}
        videoSrc="videos/nav_math_bingo.mp4"
        videoStartFromSec={0}
        playbackRate={1}
        videoAspect={1600 / 736}
        steps={NAV_STEPS}
        rings={[
          { atFrame: NAV_START + 59, x: 0.787, y: 0.616 },
          { atFrame: NAV_START + 104, x: 0.817, y: 0.491 },
          { atFrame: NAV_START + 140, x: 0.705, y: 0.889 },
        ]}
        width={W - 120}
        x={60}
        y={H * 0.19}
      />

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#3A0D12" accent="#FF8400" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(20,4,8,0.6)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
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

      <Audio src={staticFile("audio/short_video_game_math_bingo/short_video_game_math_bingo.mp3")} />
    </AbsoluteFill>
  );
};
