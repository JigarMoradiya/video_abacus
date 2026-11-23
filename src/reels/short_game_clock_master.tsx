// CLOCK MASTER — eighth Math Game Zone reel, and a SEVENTH distinct cast: Blaze & Spark in
// their ORIGINAL red/blue costumes (not the sunrise recostume used for True or False), over
// the original night HeroHQ skyline with its searchlight beams — a different palette and a
// different world from every reel so far, even the ones that reuse this same character rig.
// Confirmed from the user's own screenshots + gameplay recording: this is a MULTIPLE-CHOICE
// game (read the analog clock, tap one of 4 times), not a drag-the-hands game.
//
// Timing from public/audio/short_video_game_clock_master/*.phrases.json, aligned from
// docs/reel_game_clock_master_lines.txt. 10 phrases, ~54.5s. FIVE anomalies patched.
//
// Persistent header + real-asset nav montage, same patterns established on the earlier reels.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_clock_master.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Hero, type HeroMood } from "../components/heroes/Hero";
import { HeroHQ } from "../components/heroes/HeroHQ";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { ClockMasterSim, type ClockRound } from "../components/gamezone/sims/ClockMasterSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 54.5175;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_CLOCK_MASTER_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the sim's storyboard
// Two quick hook flashes (no judge — just "look, a clock!"), then two real word-synced
// rounds, then one fast payoff round for "a new time pops up fast!"
const HOOK_A: ClockRound = {
  hour: 12,
  minute: 0,
  hourAt: F(0.5),
  minuteAt: F(0.5),
  options: ["12:00", "6:00", "3:00", "9:00"],
  correctIndex: 0,
  judgeAt: F(999),
  activeUntil: F(5.66),
};
const HOOK_B: ClockRound = {
  hour: 9,
  minute: 15,
  hourAt: F(6.1),
  minuteAt: F(6.5),
  options: ["9:15", "3:45", "12:15", "6:15"],
  correctIndex: 0,
  judgeAt: F(999),
  activeUntil: F(10.46),
};
// Round 1 (real, word-synced): "Short hand on three, long hand on twelve — that's three o'clock!"
const ROUND1: ClockRound = {
  hour: 3,
  minute: 0,
  hourAt: F(11.12), // "three,"
  minuteAt: F(12.98), // "twelve"
  options: ["9:00", "3:00", "12:15", "6:45"],
  correctIndex: 1,
  judgeAt: F(14.8), // "o'clock!"
  tapAt: F(16.0),
  activeUntil: F(18.66),
};
// Round 2 (real, word-synced): "Short hand on six, long hand on six — that's half past six!"
const ROUND2: ClockRound = {
  hour: 6,
  minute: 30,
  hourAt: F(19.28), // "six,"
  minuteAt: F(21.16), // "six"
  options: ["12:30", "3:15", "6:30", "9:45"],
  correctIndex: 2,
  judgeAt: F(23.42), // "six!"
  tapAt: F(25.0),
  activeUntil: F(27.75),
};
// Round 3 — "a new time pops up fast!" gets a real fast payoff round, not just a held frame.
const ROUND3: ClockRound = {
  hour: 9,
  minute: 0,
  hourAt: F(28.2),
  minuteAt: F(28.6),
  options: ["9:00", "3:00", "6:15", "12:45"],
  correctIndex: 0,
  judgeAt: F(30.0),
  tapAt: F(31.0),
  activeUntil: F(1000),
};
const ROUNDS = [HOOK_A, HOOK_B, ROUND1, ROUND2, ROUND3];

const SIM_X = W / 2 - 150;
const SIM_Y = H * 0.15;

const TIMER_START_AT = F(7.74); // "Read the hands and set the time!"

// the persistent "CLOCK MASTER! / Number Builders" header — held back until the narrator
// names the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(5.66); // "This is Clock Master!"

const BENEFIT_AT = F(33.42);
const BENEFIT_1_AT = F(35.52); // "real-life"
const BENEFIT_2_AT = F(38.1); // "skill kids use..."

// ---------------------------------------------------------------- nav montage beats (p8)
const NAV_START = P(8, "start");
const NAV_STEPS = [
  { atFrame: F(43.64), label: "1️⃣ Math Game Zone" },
  { atFrame: F(45.58), label: "2️⃣ Clock Master" },
  { atFrame: F(47.06), label: "3️⃣ Choose your level" },
  { atFrame: F(48.0), label: "4️⃣ Play!" },
];
const NAV_END = NAV_START + 234; // 75 (home) + 48 (zone) + 39 (diff) + 72 (gameplay), 7.8s

const STORE_START = P(9, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: ROUND1.judgeAt, file: "gz_correct.mp3", vol: 0.5 },
  { frame: ROUND1.tapAt!, file: "gz_tap.mp3", vol: 0.5 },
  { frame: ROUND2.judgeAt, file: "gz_correct.mp3", vol: 0.5 },
  { frame: ROUND2.tapAt!, file: "gz_tap.mp3", vol: 0.5 },
  { frame: ROUND3.judgeAt, file: "gz_win.mp3", vol: 0.5 },
  { frame: ROUND3.tapAt!, file: "gz_tap.mp3", vol: 0.5 },
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
const CAPTION_KEYWORDS = ["clock!", "o'clock!", "six!", "chimes", "fast!", "real-life", "day!", "free"];

export const ShortGameClockMaster: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  const showSim = p <= 6;
  const dimIn = p === 7 ? interpolate(frame, [P(7, "start"), P(7, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const secondsLeft = Math.max(0, 60 - Math.floor((frame - TIMER_START_AT) / fps));
  const streakCount = frame >= ROUND3.judgeAt ? 3 : frame >= ROUND2.judgeAt ? 2 : frame >= ROUND1.judgeAt ? 1 : 0;

  const heroMoodA: HeroMood = p <= 1 ? "cheer" : p <= 5 ? "sit" : p === 6 ? "cheer" : p === 7 ? "point" : p === 8 ? "point" : "sit";
  const heroMoodB: HeroMood = p <= 1 ? "cheer" : p <= 5 ? "sit" : p === 6 ? "cheer" : p === 7 ? "think" : p === 8 ? "sit" : "sit";
  const mascotY = H * 0.86;

  return (
    <AbsoluteFill style={{ background: "#0E1240" }}>
      <HeroHQ width={W} height={H} frame={frame} fps={fps} />

      {showSim && <ClockMasterSim frame={frame} fps={fps} x={SIM_X} y={SIM_Y} rounds={ROUNDS} scale={1.25} />}

      {showSim && frame >= TIMER_START_AT - 6 && (
        <div style={{ position: "absolute", top: SIM_Y - 150, right: 40 }}>
          <span
            style={{
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 34,
              color: "#111",
              background: "rgba(255,255,255,0.88)",
              borderRadius: 16,
              padding: "10px 24px",
              display: "inline-block",
            }}
          >
            ⏱ {secondsLeft}s
          </span>
        </div>
      )}
      {showSim && streakCount > 0 && (
        <div style={{ position: "absolute", top: SIM_Y - 74, right: 40 }}>
          <span
            style={{
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 34,
              color: "#111",
              background: "rgba(255,255,255,0.88)",
              borderRadius: 16,
              padding: "10px 24px",
              display: "inline-block",
              transform: `scale(${1 + Math.sin((frame / fps) * 3) * 0.05})`,
            }}
          >
            🔥 x{streakCount}
          </span>
        </div>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 340} frame={frame} fps={fps} startFrame={ROUND1.judgeAt} />
        <Celebration x={W / 2} y={SIM_Y + 340} frame={frame} fps={fps} startFrame={ROUND2.judgeAt + 4} />
        <Celebration x={W / 2} y={SIM_Y + 340} frame={frame} fps={fps} startFrame={ROUND3.judgeAt + 4} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Hero x={W * 0.16} y={mascotY} scale={0.95} mood={heroMoodA} name="blaze" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Hero x={W * 0.84} y={mascotY} scale={0.85} mood={heroMoodB} name="spark" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {p === 7 && <div style={{ position: "absolute", inset: 0, background: "rgba(6,8,32,0.6)", opacity: dimIn }} />}
      {p === 7 && frame >= BENEFIT_AT - 10 && (
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
            {(() => {
              const popAt = BENEFIT_AT - 10;
              const pop = interpolate(frame, [popAt, popAt + 6, popAt + 10], [0.2, 1.22, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const bob = Math.sin((frame / fps) * 2.1) * 6;
              const R = 76;
              // a real clock face, matching the sim exactly, showing the same 6:30 the
              // taught round used — not just a text badge.
              return (
                <div style={{ transform: `translateY(${bob}px) scale(${pop})` }}>
                  <svg width={R * 2 + 16} height={R * 2 + 16} viewBox={`0 0 ${R * 2 + 16} ${R * 2 + 16}`} style={{ overflow: "visible" }}>
                    <g transform={`translate(${R + 8},${R + 8})`}>
                      <circle cx={0} cy={0} r={R} fill="#FFFFFF" stroke="#FF8400" strokeWidth={8} />
                      {Array.from({ length: 12 }, (_, i) => {
                        const a = ((i * 30 - 90) * Math.PI) / 180;
                        const isMajor = i % 3 === 0;
                        const r1 = R - (isMajor ? 14 : 10);
                        return (
                          <line
                            key={i}
                            x1={Math.cos(a) * r1}
                            y1={Math.sin(a) * r1}
                            x2={Math.cos(a) * (R - 5)}
                            y2={Math.sin(a) * (R - 5)}
                            stroke="#2A1F1A"
                            strokeWidth={isMajor ? 3.5 : 2}
                            strokeLinecap="round"
                          />
                        );
                      })}
                      <line x1={0} y1={0} x2={0} y2={-R * 0.52} stroke="#2A1F1A" strokeWidth={7} strokeLinecap="round" transform="rotate(195)" />
                      <line x1={0} y1={0} x2={0} y2={-R * 0.78} stroke="#1976D2" strokeWidth={5} strokeLinecap="round" transform="rotate(180)" />
                      <circle cx={0} cy={0} r={7} fill="#FF8400" />
                    </g>
                  </svg>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {p === 7 && frame >= BENEFIT_AT - 2 && (
        <BenefitCard
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT}
          benefits={[
            { icon: "🧠", text: "Real-life time-reading", atFrame: BENEFIT_1_AT },
            { icon: "📅", text: "A skill used every day", atFrame: BENEFIT_2_AT },
          ]}
          accent="#0288D1"
          x={W / 2 - 340}
          y={H * 0.38}
          width={680}
        />
      )}

      <AppNavMontage
        frame={frame}
        fps={fps}
        startFrame={NAV_START}
        endFrame={NAV_END}
        videoSrc="videos/nav_clock_master.mp4"
        videoStartFromSec={0}
        playbackRate={1}
        videoAspect={1600 / 736}
        steps={NAV_STEPS}
        rings={[
          { atFrame: NAV_START + 65, x: 0.787, y: 0.616 },
          { atFrame: NAV_START + 113, x: 0.6065, y: 0.505 },
          { atFrame: NAV_START + 152, x: 0.705, y: 0.889 },
        ]}
        width={W - 120}
        x={60}
        y={H * 0.19}
      />

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#0E1240" accent="#0288D1" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(6,8,32,0.6)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="CLOCK MASTER!" section="builders" y={H * 0.04} width={W} />
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

      <Audio src={staticFile("audio/short_video_game_clock_master/short_video_game_clock_master.mp3")} />
    </AbsoluteFill>
  );
};
