// TRUE OR FALSE — fourth Math Game Zone pilot, and a THIRD distinct cast: Blaze & Spark (the
// Math Heroes duo) in their "sunrise" recostume, on a dawn HeroHQ rooftop — not Bo & Pip's
// pastel islands (Balloon Pop, Cross Math) and not Zip & Dash's night dojo (Speed Compare).
// A hero's whole job is spotting the truth, which makes them a natural fit for a game about
// catching sneaky lies. Real screenshots + real gameplay recording (user-provided) drive the
// "find it in the app" montage, same as Speed Compare.
//
// Timing from public/audio/short_video_game_true_or_false/*.phrases.json, aligned from
// docs/reel_game_true_or_false_lines.txt. 13 phrases, ~53.7s. TEN anomalies patched (this
// narrator's pauses were long enough that ASR onset consistently anticipated speech) — every
// affected phrase's start snapped to the real silencedetect boundary.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_true_or_false.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Hero, type HeroMood } from "../components/heroes/Hero";
import { HeroHQDay } from "../components/heroes/HeroHQDay";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { TrueOrFalseSim, type TrueOrFalseStoryboard, type TFRound } from "../components/gamezone/sims/TrueOrFalseSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 53.70775;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_TRUE_OR_FALSE_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);

// ---------------------------------------------------------------- the sim's storyboard
// Round 0 is the hook flash ("An equation flashes on screen...") — a neutral example with no
// judge/tap, just there so the opening frame is never empty. Rounds 1-2 are the taught beats,
// each equation building token-by-token on its own spoken word, then flashing green/red.
//
// The hook used to be ONE equation sitting on screen, unchanged, for the whole 14s lead-in
// (0.55s to Round 1 at 14.58s) — dead air across four spoken lines. It now cycles through
// three quick examples instead, roughly one per hook line, so something is always changing.
const HOOK_AT = sec(0.55, FPS);
const hookRound = (equation: string[], at: number): TFRound => ({
  tokens: equation.map((text, i) => ({ text, at: at + i * 2 })),
  isTrue: true,
  activeUntil: at + sec(4.2, FPS),
});
const ROUND0A = hookRound(["4", "+", "4", "=", "8"], HOOK_AT); // "An equation flashes... true or false?"
const ROUND0B = hookRound(["6", "+", "2", "=", "8"], sec(6.1, FPS)); // "This is True or False!"
const ROUND0C = hookRound(["10", "-", "4", "=", "6"], sec(9.8, FPS)); // "Sixty seconds — smash right or wrong..."

const ROUND1: TFRound = {
  tokens: [
    { text: "7", at: sec(14.58, FPS) },
    { text: "+", at: sec(15.0, FPS) },
    { text: "3", at: sec(15.42, FPS) },
    { text: "=", at: sec(15.94, FPS) },
    { text: "10", at: sec(16.66, FPS) },
  ],
  isTrue: true,
  judgeAt: sec(17.8, FPS),
  tapAt: sec(19.05, FPS),
  activeUntil: sec(21.0, FPS),
};

const ROUND2: TFRound = {
  tokens: [
    { text: "6", at: sec(21.12, FPS) },
    { text: "×", at: sec(21.42, FPS) },
    { text: "2", at: sec(21.86, FPS) },
    { text: "=", at: sec(22.24, FPS) },
    { text: "10", at: sec(22.74, FPS) },
  ],
  isTrue: false,
  judgeAt: sec(25.04, FPS),
  tapAt: sec(27.2, FPS),
  activeUntil: sec(1000, FPS),
};

const STORY: TrueOrFalseStoryboard = {
  rounds: [ROUND0A, ROUND0B, ROUND0C, ROUND1, ROUND2],
};
const TIMER_START_AT = sec(8.66, FPS);

const SIM_X = W / 2 - 300;
const SIM_Y = H * 0.2;

const BENEFIT_AT = sec(34.66, FPS);
const BENEFIT_1_AT = sec(36.66, FPS); // "fact fluency"
const BENEFIT_2_AT = sec(38.1, FPS); // "wrong answers jump out"

// ---------------------------------------------------------------- nav montage beats (p11)
const NAV_START = P(11, "start");
const NAV_STEPS = [
  { atFrame: sec(43.38, FPS), label: "1️⃣ Math Game Zone" },
  { atFrame: sec(45.2, FPS), label: "2️⃣ True or False" },
  { atFrame: sec(46.7, FPS), label: "3️⃣ Choose your level" },
  { atFrame: sec(47.42, FPS), label: "4️⃣ Play!" },
];
const NAV_END = NAV_START + 236; // 75 (home) + 48 (zone) + 39 (diff) + 74 (gameplay)

const STORE_START = P(12, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: HOOK_AT, file: "gz_tile_place.mp3", vol: 0.45 },
  { frame: ROUND1.judgeAt!, file: "gz_correct.mp3", vol: 0.5 },
  { frame: ROUND1.tapAt! - 8, file: "gz_tap.mp3", vol: 0.5 },
  { frame: ROUND2.judgeAt!, file: "gz_wrong.mp3", vol: 0.5 },
  { frame: ROUND2.tapAt! - 8, file: "gz_tap.mp3", vol: 0.5 },
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
const CAPTION_KEYWORDS = ["true", "false", "seconds", "true!", "lie!", "streak", "fluency", "instantly", "free"];

export const ShortGameTrueOrFalse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  const showSim = p <= 9;
  const dimIn = p === 10 ? interpolate(frame, [P(10, "start"), P(10, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const streakCount = frame >= ROUND2.judgeAt! ? 2 : frame >= ROUND1.judgeAt! ? 1 : 0;
  const secondsLeft = Math.max(0, 60 - Math.floor((frame - TIMER_START_AT) / fps));

  const blazeMood: HeroMood = p <= 1 ? "cheer" : p <= 8 ? "sit" : p === 9 ? "cheer" : p === 10 ? "point" : p === 11 ? "point" : "sit";
  const sparkMood: HeroMood = p <= 1 ? "cheer" : p <= 8 ? "sit" : p === 9 ? "cheer" : p === 10 ? "think" : p === 11 ? "sit" : "sit";
  const mascotY = H * 0.86;

  return (
    <AbsoluteFill style={{ background: "#2B2560" }}>
      <HeroHQDay width={W} height={H} frame={frame} fps={fps} />

      {p <= 1 && <GameTitleCard frame={frame} startFrame={sec(0.15, FPS)} title="TRUE OR FALSE!" section="speedy" y={H * 0.04} width={W} />}

      {showSim && <TrueOrFalseSim frame={frame} fps={fps} x={SIM_X} y={SIM_Y} story={STORY} scale={1.15} />}

      {/* timer + streak chips — full-canvas width, clear of the sim's own narrow box (the
          Speed Compare reel taught us that positioning a HUD chip inside the sim's own scaled
          coordinate space is what causes it to overlap or bleed off-edge). Bigger than a
          typical HUD chip on purpose — these two are meant to read at a glance. */}
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
      {showSim && frame >= ROUND1.judgeAt! && (
        <div style={{ position: "absolute", top: SIM_Y - 70, right: 40 }}>
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
              transform: `scale(${1 + Math.sin((frame / fps) * 3) * 0.05})`,
            }}
          >
            🔥 x{streakCount}
          </span>
        </div>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 280} frame={frame} fps={fps} startFrame={ROUND1.judgeAt!} />
        <Celebration x={W / 2} y={SIM_Y + 280} frame={frame} fps={fps} startFrame={ROUND2.judgeAt! + 4} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Hero x={W * 0.16} y={mascotY} scale={0.95} mood={blazeMood} name="blazeSunrise" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Hero x={W * 0.84} y={mascotY} scale={0.85} mood={sparkMood} name="sparkSunrise" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {p === 10 && <div style={{ position: "absolute", inset: 0, background: "rgba(20,10,20,0.6)", opacity: dimIn }} />}
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
              True or False
            </span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
            {[{ l: "6×2=10", c: "#C62828", s: "✕" }].map((it, i) => {
              const popAt = BENEFIT_AT - 10 + i * 5;
              const pop = interpolate(frame, [popAt, popAt + 6, popAt + 10], [0.2, 1.22, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const bob = Math.sin((frame / fps) * 2.1 + i * 0.9) * 7;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: "#FFFFFF",
                    border: `5px solid ${it.c}`,
                    borderRadius: 20,
                    padding: "14px 26px",
                    boxShadow: "0 6px 0 rgba(0,0,0,0.22)",
                    transform: `translateY(${bob}px) scale(${pop})`,
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 38, color: "#111" }}>{it.l}</span>
                  <span style={{ fontSize: 40 }}>{it.s}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {p === 10 && frame >= BENEFIT_AT - 2 && (
        <BenefitCard
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT}
          benefits={[
            { icon: "🧠", text: "Sharp fact fluency", atFrame: BENEFIT_1_AT },
            { icon: "👀", text: "Catches mistakes fast", atFrame: BENEFIT_2_AT },
          ]}
          accent="#FF5A3C"
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
        videoSrc="videos/nav_true_or_false.mp4"
        videoStartFromSec={0}
        playbackRate={1}
        videoAspect={1600 / 736}
        steps={NAV_STEPS}
        rings={[
          // tap the Math Game Zone circle on the real home screen
          { atFrame: NAV_START + 65, x: 0.787, y: 0.616 },
          // tap the "True or False?" card — 3rd in the Speedy Games row, not 1st like Speed Compare's
          { atFrame: NAV_START + 113, x: 0.605, y: 0.491 },
          // tap "Let's Start" on the real difficulty screen (same layout position as Speed Compare's)
          { atFrame: NAV_START + 152, x: 0.705, y: 0.889 },
        ]}
        width={W - 120}
        x={60}
        y={H * 0.19}
      />

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#1A1440" accent="#FF5A3C" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(10,4,32,0.6)",
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

      <Audio src={staticFile("audio/short_video_game_true_or_false/short_video_game_true_or_false.mp3")} />
    </AbsoluteFill>
  );
};
