// NUMBER DETECTIVE — ninth Math Game Zone reel, and an EIGHTH distinct cast: two bear
// detectives (`Bear`) over a brand-new mystery-noir `DetectiveOfficeWorld` — deep charcoal
// walls, diagonal lamp-light bars, drifting "?" clue marks. The bear is not an arbitrary
// pick: the real game's own mascot AND the app's home-screen mascot are both bears (confirmed
// from the user's gameplay screenshots), so this recasts a mascot parents already know.
//
// Confirmed from the user's own gameplay contact-sheet (22 frames sampled across the real
// 11.17s recording): this is a classic "guess the secret number" game — NOT Mastermind.
// Numeric keypad + orange "Guess" button, a big result box that shows "?" then the typed
// guess, a "Too low⬆️/Too high⬇️" tag, a tries-remaining dot row. Feedback is ONLY
// higher/lower, never digit-position hints.
//
// Timing from public/audio/short_video_game_number_detective/*.phrases.json, aligned from
// docs/reel_game_number_detective_lines.txt. 14 phrases, ~58.75s. ELEVEN anomalies patched
// (nearly every phrase start crept into its leading silence — the aligner consistently
// anticipated speech onset on this take).
//
// Nav montage gameplay clip is the user's own explicit request: the LAST 6 seconds of the
// real 11.17s recording (the celebratory "cracked it!" payoff lives there), sped up ~2.5×
// ("fast mode") — built into public/videos/nav_number_detective.mp4 alongside the other three
// segments (see /tmp/realassets_nd build).
//
// Persistent header + real-asset nav montage, same patterns established on the earlier reels.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_number_detective.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Bear, type BearMood } from "../components/heroes/Bear";
import { DetectiveOfficeWorld } from "../components/heroes/DetectiveOfficeWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { NumberDetectiveSim, type DetectiveRound } from "../components/gamezone/sims/NumberDetectiveSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 58.749375;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_NUMBER_DETECTIVE_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the sim's storyboard
// Two quick hook flashes (no judge — just "look, a mystery number!"), then the three real
// word-synced rounds the script teaches: 10 (too low), 16 (too high), 14 (correct).
const HOOK_A: DetectiveRound = { guess: 7, judge: "low", revealAt: F(0.5), judgeAt: F(999), activeUntil: F(3.3) };
const HOOK_B: DetectiveRound = { guess: 15, judge: "high", revealAt: F(3.5), judgeAt: F(999), activeUntil: F(6.146) };
// Round 1: "Guess ten... too low, arrow up!"
const ROUND1: DetectiveRound = {
  guess: 10,
  judge: "low",
  revealAt: F(16.1), // "ten..."
  tapAt: F(15.8), // "Guess"
  judgeAt: F(17.34), // "too" (low)
  activeUntil: F(21.98),
  tryNumber: 1,
};
// Round 2: "Guess sixteen... too high, arrow down!"
const ROUND2: DetectiveRound = {
  guess: 16,
  judge: "high",
  revealAt: F(22.38), // "sixteen..."
  tapAt: F(21.98), // "Guess"
  judgeAt: F(23.76), // "too" (high)
  activeUntil: F(27.9),
  tryNumber: 2,
};
// Round 3: "Guess fourteen... that's it — case cracked!"
const ROUND3: DetectiveRound = {
  guess: 14,
  judge: "correct",
  revealAt: F(28.6), // "fourteen..."
  tapAt: F(27.9), // "Guess"
  judgeAt: F(31.82), // "case" (cracked!)
  activeUntil: F(9999),
  tryNumber: 3,
};
const ROUNDS = [HOOK_A, HOOK_B, ROUND1, ROUND2, ROUND3];

const SIM_X = W / 2 - 280;
const SIM_Y = H * 0.13;

const TIMER_START_AT = F(9.332); // "Guess a number — too high or too low..."

// the persistent "NUMBER DETECTIVE! / Number Builders" header — held back until the
// narrator names the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(6.146); // "This is Number Detective!"

const BENEFIT_AT = F(41.48); // "this" (builds number sense...)
const BENEFIT_1_AT = F(42.04); // "number" (sense)
const BENEFIT_2_AT = F(43.18); // "logical" (thinking)

// ---------------------------------------------------------------- nav montage beats (p12)
const NAV_START = P(12, "start");
const NAV_STEPS = [
  { atFrame: F(49.14), label: "1️⃣ Math Game Zone" },
  { atFrame: F(50.74), label: "2️⃣ Number Detective" },
  { atFrame: F(52.26), label: "3️⃣ Choose your level" },
  { atFrame: F(53.44), label: "4️⃣ Play!" },
];
// 55 (home) + 48 (zone) + 39 (diff) + 74 (gameplay, sped 2.5x) = 216f, 7.2s — trimmed from an
// initial 236f build because the real gap before the store phrase (P13) is only ~219f; the
// HOME intro lost the frames, never the gameplay tail, since the "cracked it!" celebration
// payoff lives in the LAST couple seconds of the sped-up gameplay clip.
const NAV_END = NAV_START + 216;

const STORE_START = P(13, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: ROUND1.tapAt!, file: "gz_tap.mp3", vol: 0.5 },
  { frame: ROUND1.judgeAt, file: "gz_wrong.mp3", vol: 0.45 },
  { frame: ROUND2.tapAt!, file: "gz_tap.mp3", vol: 0.5 },
  { frame: ROUND2.judgeAt, file: "gz_wrong.mp3", vol: 0.45 },
  { frame: ROUND3.tapAt!, file: "gz_tap.mp3", vol: 0.5 },
  { frame: ROUND3.judgeAt, file: "gz_win.mp3", vol: 0.55 },
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
const CAPTION_KEYWORDS = ["crack", "Detective!", "low", "up!", "high", "down!", "cracked!", "clue", "logical", "free"];

export const ShortGameNumberDetective: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 10;
  const dimIn = p === 11 ? interpolate(frame, [P(11, "start"), P(11, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const secondsLeft = Math.max(0, 90 - Math.floor((frame - TIMER_START_AT) / fps));

  const bearMoodA: BearMood = p <= 1 ? "cheer" : p <= 5 ? "sit" : p === 6 ? "worry" : p <= 8 ? "sit" : p === 9 ? "cheer" : p === 11 ? "point" : p === 12 ? "point" : "sit";
  const bearMoodB: BearMood = p <= 1 ? "cheer" : p <= 5 ? "magnify" : p === 6 ? "sit" : p <= 8 ? "magnify" : p === 9 ? "cheer" : p === 11 ? "think" : "sit";
  const mascotY = H * 0.86;

  return (
    <AbsoluteFill style={{ background: "#171B24" }}>
      <DetectiveOfficeWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <NumberDetectiveSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          rounds={ROUNDS}
          range={[1, 20]}
          triesTotal={7}
          headerAt={HEADER_AT}
          scale={1.05}
        />
      )}

      {showSim && frame >= TIMER_START_AT - 6 && (
        <div style={{ position: "absolute", top: SIM_Y - 8, right: 40 }}>
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
      {showSim && frame >= TIMER_START_AT - 6 && (
        <div style={{ position: "absolute", top: SIM_Y + 68, right: 40 }}>
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
            🏆 200
          </span>
        </div>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 420} frame={frame} fps={fps} startFrame={ROUND3.judgeAt + 2} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Bear x={W * 0.16} y={mascotY} scale={0.95} mood={bearMoodA} name="cocoa" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Bear x={W * 0.84} y={mascotY} scale={0.88} mood={bearMoodB} name="slate" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {p === 11 && <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,16,0.62)", opacity: dimIn }} />}
      {p === 11 && frame >= BENEFIT_AT - 10 && (
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
            return (
              <div style={{ transform: `translateY(${bob}px) scale(${pop})`, display: "inline-block" }}>
                <svg width={172} height={172} viewBox="0 0 172 172" style={{ overflow: "visible" }}>
                  <circle cx={86} cy={86} r={78} fill="#E8F5E9" stroke="#2E7D32" strokeWidth={8} />
                  <text x={86} y={102} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={64} fill="#2E7D32">
                    14
                  </text>
                </svg>
              </div>
            );
          })()}
        </div>
      )}
      {p === 11 && frame >= BENEFIT_AT - 2 && (
        <BenefitCard
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT}
          benefits={[
            { icon: "🧠", text: "Number sense from real clues", atFrame: BENEFIT_1_AT },
            { icon: "🧩", text: "Logical, step-by-step thinking", atFrame: BENEFIT_2_AT },
          ]}
          accent="#5C6BC0"
          x={W / 2 - 340}
          y={H * 0.38}
          width={680}
        />
      )}

      {/* explicitly gated to the store screen's own start, not just left to the montage's
          internal fade-out window — the device recording must never linger as a ghost behind
          the App Store popup once the download section begins. */}
      {frame < STORE_START && (
        <AppNavMontage
          frame={frame}
          fps={fps}
          startFrame={NAV_START}
          endFrame={NAV_END}
          videoSrc="videos/nav_number_detective.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 48, x: 0.789, y: 0.616 },
            { atFrame: NAV_START + 98, x: 0.819, y: 0.496 },
            { atFrame: NAV_START + 136, x: 0.706, y: 0.888 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#171B24" accent="#5C6BC0" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(8,10,16,0.62)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="NUMBER DETECTIVE!" section="builders" y={H * 0.04} width={W} />
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

      <Audio src={staticFile("audio/short_video_game_number_detective/short_video_game_number_detective.mp3")} />
    </AbsoluteFill>
  );
};
