// MISSING SIGN — sixth Math Game Zone reel, and a FIFTH distinct cast: the two puppies (cream
// & cocoa) from E08, in a new cozy Puzzle Den — not Bo & Pip's islands, Zip & Dash's dojo,
// Blaze & Spark's rooftop, or the fox pair's bingo hall. Real screenshots + real gameplay
// recording (user-provided) drive the "find it in the app" montage.
//
// Timing from public/audio/short_video_game_missing_sign/*.phrases.json, aligned from
// docs/reel_game_missing_sign_lines.txt. 12 phrases, ~55.9s. EIGHT anomalies patched.
//
// The hook equation used to sit static for the whole ~12s lead-in in earlier reels of this
// series (True/False, Math Bingo) — fixed here from the start with two cycling hook examples
// before Round 1's real, word-synced "12÷3=4" teaching round takes over.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_missing_sign.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Puppy, type PuppyMood } from "../components/e08/Puppy";
import { PuzzleDenWorld } from "../components/heroes/PuzzleDenWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { MissingSignSim, type SignRound } from "../components/gamezone/sims/MissingSignSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 55.875875;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_MISSING_SIGN_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);

// ---------------------------------------------------------------- the sim's storyboard
const tok = (text: string, at: number) => ({ text, at });

const HOOK_A: SignRound = {
  tokens: [tok("3", sec(0.68, FPS)), tok("?", sec(0.88, FPS)), tok("4", sec(1.08, FPS)), tok("=", sec(1.28, FPS)), tok("7", sec(1.48, FPS))],
  slotIndex: 1,
  correctOp: "+",
  judgeAt: sec(3.3, FPS),
  activeUntil: sec(5.81, FPS),
};
const HOOK_B: SignRound = {
  tokens: [tok("10", sec(6.0, FPS)), tok("?", sec(6.2, FPS)), tok("2", sec(6.4, FPS)), tok("=", sec(6.6, FPS)), tok("5", sec(6.8, FPS))],
  slotIndex: 1,
  correctOp: "÷",
  judgeAt: sec(9.5, FPS),
  activeUntil: sec(12.18, FPS),
};
const ROUND1: SignRound = {
  tokens: [tok("12", sec(12.18, FPS)), tok("?", sec(12.78, FPS)), tok("3", sec(13.02, FPS)), tok("=", sec(13.46, FPS)), tok("4", sec(14.36, FPS))],
  slotIndex: 1,
  correctOp: "÷",
  judgeAt: sec(17.22, FPS), // "divide!"
  tapAt: sec(20.8, FPS),
  activeUntil: sec(22.82, FPS),
};
const ROUND2: SignRound = {
  tokens: [tok("9", sec(22.82, FPS)), tok("?", sec(23.24, FPS)), tok("2", sec(24.02, FPS)), tok("=", sec(24.4, FPS)), tok("11", sec(25.18, FPS))],
  slotIndex: 1,
  correctOp: "+",
  judgeAt: sec(26.9, FPS), // "plus!"
  tapAt: sec(30.5, FPS),
  activeUntil: sec(34.9, FPS),
};
// "...and a new equation pops up fast!" — literally pops a third equation in right on those
// words, instead of leaving Round 2 sitting resolved (and motion_check-flagged as frozen)
// through this whole line.
const ROUND3: SignRound = {
  tokens: [tok("15", sec(34.9, FPS)), tok("?", sec(35.06, FPS)), tok("3", sec(35.22, FPS)), tok("=", sec(35.38, FPS)), tok("5", sec(35.54, FPS))],
  slotIndex: 1,
  correctOp: "÷",
  judgeAt: sec(36.3, FPS), // "fast!"
  activeUntil: sec(1000, FPS),
};
const ROUNDS = [HOOK_A, HOOK_B, ROUND1, ROUND2, ROUND3];

const SIM_X = W / 2 - 310;
const SIM_Y = H * 0.2;

// the persistent "MISSING SIGN! / Equation Fun" header — held back until the narrator
// actually names the game, then stays on top of everything (teaching, parent beat, nav) all
// the way through to the store screen, instead of flashing once during the hook and vanishing.
const HEADER_AT = sec(5.81, FPS); // "This is Missing Sign!"

const BENEFIT_AT = sec(37.8, FPS);
const BENEFIT_1_AT = sec(39.76, FPS); // "operation sense"
const BENEFIT_2_AT = sec(42.1, FPS); // "how the four operations connect"

// ---------------------------------------------------------------- nav montage beats (p10)
const NAV_START = P(10, "start");
const NAV_STEPS = [
  { atFrame: sec(46.36, FPS), label: "1️⃣ Math Game Zone" },
  { atFrame: sec(48.08, FPS), label: "2️⃣ Missing Sign" },
  { atFrame: sec(49.64, FPS), label: "3️⃣ Choose your level" },
  { atFrame: sec(50.4, FPS), label: "4️⃣ Play!" },
];
const NAV_END = NAV_START + 174; // 60 (home) + 42 (zone) + 33 (diff) + 39 (gameplay), 6.2s budget

const STORE_START = P(11, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: HOOK_A.judgeAt!, file: "gz_tile_place.mp3", vol: 0.4 },
  { frame: HOOK_B.judgeAt!, file: "gz_tile_place.mp3", vol: 0.4 },
  { frame: ROUND1.judgeAt!, file: "gz_correct.mp3", vol: 0.5 },
  { frame: ROUND1.tapAt! - 8, file: "gz_tap.mp3", vol: 0.5 },
  { frame: ROUND2.judgeAt!, file: "gz_correct.mp3", vol: 0.5 },
  { frame: ROUND2.tapAt! - 8, file: "gz_tap.mp3", vol: 0.5 },
  { frame: ROUND3.tokens[0].at, file: "gz_tile_place.mp3", vol: 0.45 },
  { frame: ROUND3.judgeAt!, file: "gz_correct.mp3", vol: 0.5 },
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
const CAPTION_KEYWORDS = ["missing", "divide!", "plus!", "true", "operation", "connect", "free"];

export const ShortGameMissingSign: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  const showSim = p <= 8;
  const dimIn = p === 9 ? interpolate(frame, [P(9, "start"), P(9, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const roundIndex = frame >= ROUND3.tokens[0].at ? 3 : frame >= ROUND2.tokens[0].at ? 2 : frame >= ROUND1.tokens[0].at ? 1 : 0;

  const puppyMoodA: PuppyMood = p <= 1 ? "wave" : p <= 7 ? "sit" : p === 8 ? "cheer" : p === 9 ? "point" : p === 10 ? "point" : "sit";
  const puppyMoodB: PuppyMood = p <= 1 ? "wave" : p <= 7 ? "sit" : p === 8 ? "cheer" : p === 9 ? "think" : p === 10 ? "sit" : "sit";
  const mascotY = H * 0.86;

  return (
    <AbsoluteFill style={{ background: "#0F2C2C" }}>
      <PuzzleDenWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && <MissingSignSim frame={frame} fps={fps} x={SIM_X} y={SIM_Y} rounds={ROUNDS} headerAt={HEADER_AT} scale={1.45} />}

      {showSim && roundIndex > 0 && (
        <div style={{ position: "absolute", top: SIM_Y - 70, right: 30 }}>
          <span
            style={{
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 38,
              color: "#111",
              background: "rgba(255,255,255,0.85)",
              borderRadius: 16,
              padding: "12px 26px",
              display: "inline-block",
            }}
          >
            🎯 {roundIndex}/15
          </span>
        </div>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 280} frame={frame} fps={fps} startFrame={ROUND1.judgeAt!} />
        <Celebration x={W / 2} y={SIM_Y + 280} frame={frame} fps={fps} startFrame={ROUND2.judgeAt! + 4} />
        <Celebration x={W / 2} y={SIM_Y + 280} frame={frame} fps={fps} startFrame={ROUND3.judgeAt! + 4} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Puppy x={W * 0.16} y={mascotY} scale={0.95} mood={puppyMoodA} coat="cream" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Puppy x={W * 0.84} y={mascotY} scale={0.85} mood={puppyMoodB} coat="cocoa" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {p === 9 && <div style={{ position: "absolute", inset: 0, background: "rgba(6,20,20,0.62)", opacity: dimIn }} />}
      {p === 9 && frame >= BENEFIT_AT - 10 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: H * 0.17,
            width: W,
            textAlign: "center",
            opacity: interpolate(frame, [BENEFIT_AT - 10, BENEFIT_AT - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(frame, [BENEFIT_AT - 10, BENEFIT_AT - 2, BENEFIT_AT + 4], [0.3, 1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          }}
        >
          {/* no separate "Missing Sign" title here — the persistent header above already
              names the game, so this beat goes straight to the example equation */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 20 }}>
            {[
              { l: "12", c: "#1976D2" },
              { l: "÷", c: null },
              { l: "3", c: "#1976D2" },
              { l: "=", c: null },
              { l: "4", c: "#2E7D32" },
            ].map((it, i) => {
              const popAt = BENEFIT_AT - 10 + i * 4;
              const pop = interpolate(frame, [popAt, popAt + 6, popAt + 10], [0.2, 1.22, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const bob = Math.sin((frame / fps) * 2.1 + i * 0.9) * 6;
              return it.c ? (
                <div
                  key={i}
                  style={{
                    width: 86,
                    height: 86,
                    background: "#FFFFFF",
                    border: `5px solid ${it.c}`,
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 0 rgba(0,0,0,0.22)",
                    transform: `translateY(${bob}px) scale(${pop})`,
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 42, color: "#111" }}>{it.l}</span>
                </div>
              ) : (
                <span
                  key={i}
                  style={{
                    fontFamily: KID_FONT,
                    fontWeight: 700,
                    fontSize: 54,
                    color: "#FFC46B",
                    display: "inline-block",
                    transform: `scale(${pop}) translateY(${bob * 0.5}px)`,
                  }}
                >
                  {it.l}
                </span>
              );
            })}
          </div>
        </div>
      )}
      {p === 9 && frame >= BENEFIT_AT - 2 && (
        <BenefitCard
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT}
          benefits={[
            { icon: "🧠", text: "Real operation sense", atFrame: BENEFIT_1_AT },
            { icon: "🔗", text: "Sees how operations connect", atFrame: BENEFIT_2_AT },
          ]}
          accent="#7E57C2"
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
        videoSrc="videos/nav_missing_sign.mp4"
        videoStartFromSec={0}
        playbackRate={1}
        videoAspect={1600 / 736}
        steps={NAV_STEPS}
        rings={[
          { atFrame: NAV_START + 50, x: 0.787, y: 0.616 },
          { atFrame: NAV_START + 92, x: 0.181, y: 0.491 },
          { atFrame: NAV_START + 125, x: 0.705, y: 0.889 },
        ]}
        width={W - 120}
        x={60}
        y={H * 0.19}
      />

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#0F2C2C" accent="#7E57C2" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(6,20,20,0.6)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered LAST (not up near the world/sim) so it stacks on
          top of the dim overlay during the parent beat too, staying visible from the moment
          the game is named all the way through to the store screen. */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="MISSING SIGN!" section="equation" y={H * 0.04} width={W} />
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

      <Audio src={staticFile("audio/short_video_game_missing_sign/short_video_game_missing_sign.mp3")} />
    </AbsoluteFill>
  );
};
