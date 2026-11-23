// SPEED COMPARE — third Math Game Zone pilot, and the first with a DIFFERENT cast: Zip &
// Dash (the ninja duo from the quick-math rod reels) in their own Night Dojo, not Bo & Pip in
// GameZoneWorld. Deliberate: two reels with the same host in a row read as "one show", not a
// zone of 18 different games. Gameplay is a scripted, real tipping balance scale (matches
// BalanceScaleView.swift exactly), framed by the series' four signature moments — hook title,
// result popup, parent BenefitCard, real-app navigation montage — then CTA.
//
// Timing from public/audio/short_video_game_speed_compare/*.phrases.json, aligned from
// docs/reel_game_speed_compare_lines.txt. 14 phrases, ~62.4s. NINE anomalies patched (this
// narrator's pauses were long enough that ASR onset consistently anticipated speech by
// 0.1-0.5s) — every phrase's start snapped to the real silencedetect boundary.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_speed_compare.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Ninja, type NinjaMood } from "../components/mascots/Ninja";
import { NightDojoWorld } from "../components/mascots/NightDojoWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { ResultPopup } from "../components/gamezone/ResultPopup";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { SpeedCompareSim, type SpeedCompareStoryboard, type CompareRound } from "../components/gamezone/sims/SpeedCompareSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 62.432625;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_SPEED_COMPARE_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);

// ---------------------------------------------------------------- the sim's storyboard
const TARGET_PROMPT_AT = sec(10.4, FPS);
const ROUND1_LOCK = sec(20.6, FPS); // "The scale tips toward nine!"
const ROUND1_TAP = sec(26.8, FPS); // "...or equal!"
const ROUND2_AT = sec(31.0, FPS); // "the next round pops up fast!"
const ROUND2_LOCK = sec(32.4, FPS);
const ROUND3_AT = sec(37.2, FPS); // "how quick can you go?"
const ROUND3_LOCK = sec(38.2, FPS);

const ROUND1: CompareRound = { left: 9, right: 5, lockAt: ROUND1_LOCK, tapAt: ROUND1_TAP };
const ROUND2: CompareRound = { left: 6, right: 14, lockAt: ROUND2_LOCK };
const ROUND3: CompareRound = { left: 8, right: 8, lockAt: ROUND3_LOCK };

const STORY: SpeedCompareStoryboard = {
  targetPromptAt: TARGET_PROMPT_AT,
  buttonsInAt: sec(24.4, FPS),
  rounds: [ROUND1, ROUND2, ROUND3],
  // "Tap the sign — greater than, less than, or equal!" (phrase 8, word-level timing)
  signHighlights: [
    { at: sec(25.06, FPS), sym: ">" },
    { at: sec(26.68, FPS), sym: "<" },
    { at: sec(27.72, FPS), sym: "=" },
  ],
  // "...or two whole equations..." (phrase 3, 6.80-9.18s) — cards swap to real equations
  // that still equal 9 and 5, so the beam's existing tilt keeps making sense.
  equationDemo: { from: sec(6.7, FPS), to: sec(9.3, FPS), left: "6+3", right: "8-3" },
};

const RESULT_AT = sec(40.0, FPS);
// card container pops right as "Parents —" starts (41.52s); each bullet then reveals on
// its own word from phrase 11 ("this builds NUMBER SENSE... kids COMPARE FAST, not just count slow!")
const BENEFIT_AT = sec(41.9, FPS);
const BENEFIT_1_AT = sec(43.3, FPS); // "number sense"
const BENEFIT_2_AT = sec(44.95, FPS); // "compare fast"

const SIM_X = W / 2 - 300;
const SIM_Y = H * 0.14;

// ---------------------------------------------------------------- nav montage beats (p12)
// Real device screenshots + real gameplay recording (user-provided), cut to match this
// phrase's own words: home (2.5s) -> zone (1.57s) -> difficulty (1.27s) -> real gameplay
// hold (2.6s) = 7.93s. The gameplay hold runs well past this phrase's own end (56.36s) and
// into the ~2.2s natural pause after "Abacus" in phrase 13 — confirmed via silencedetect —
// so the device screen gets real breathing room instead of cutting away the instant the
// next phrase's audio starts. The store visuals are pushed back to match (see
// STORE_VISUAL_START below); only once the phone fades out does the store block appear.
const NAV_START = P(12, "start");
const NAV_STEPS = [
  { atFrame: sec(51.52, FPS), label: "1️⃣ Math Game Zone" },
  { atFrame: sec(53.28, FPS), label: "2️⃣ Speed Compare" },
  { atFrame: sec(54.88, FPS), label: "3️⃣ Choose your level" },
  { atFrame: sec(55.54, FPS), label: "4️⃣ Play!" },
];
const NAV_END = NAV_START + 238; // 75 (home) + 47 (zone) + 38 (diff) + 78 (gameplay)

const STORE_START = P(13, "start");
const STORE_VISUAL_START = NAV_END; // delayed to let the phone screen hold, not the audio
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: ROUND1_LOCK, file: "gz_correct.mp3", vol: 0.5 },
  { frame: ROUND1_TAP - 8, file: "gz_tap.mp3", vol: 0.5 },
  { frame: ROUND2_AT, file: "gz_tile_place.mp3", vol: 0.45 },
  { frame: ROUND2_LOCK, file: "gz_correct.mp3", vol: 0.5 },
  { frame: ROUND3_AT, file: "gz_tile_place.mp3", vol: 0.45 },
  { frame: ROUND3_LOCK, file: "gz_correct.mp3", vol: 0.5 },
  { frame: RESULT_AT, file: "gz_win.mp3", vol: 0.6 },
  { frame: RESULT_AT + 12, file: "gz_star.mp3", vol: 0.5 },
  { frame: RESULT_AT + 22, file: "gz_star.mp3", vol: 0.5 },
  { frame: RESULT_AT + 32, file: "gz_star.mp3", vol: 0.5 },
  { frame: BENEFIT_AT, file: "gz_benefit.mp3", vol: 0.55 },
  ...NAV_STEPS.map((s) => ({ frame: s.atFrame, file: "gz_tap.mp3", vol: 0.5 })),
  { frame: STORE_VISUAL_START + 4, file: "cta_pop.mp3", vol: 0.45 },
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
const CAPTION_KEYWORDS = ["bigger", "scale", "tips", "nine", "five", "sign", "equal", "rounds", "fast", "sense", "free"];

export const ShortGameSpeedCompare: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  const showSim = p <= 10;
  const showResult = frame >= RESULT_AT && frame < P(11, "start") + 2;
  const dimIn = p === 11 ? interpolate(frame, [P(11, "start"), P(11, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const activeRound: CompareRound = frame >= ROUND3_AT ? ROUND3 : frame >= ROUND2_AT ? ROUND2 : ROUND1;
  const roundIndex =
    frame >= ROUND3_AT
      ? Math.round(interpolate(frame, [P(10, "start"), P(10, "start") + 70], [3, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
      : frame >= ROUND2_AT
      ? 2
      : 1;

  const zipMood: NinjaMood = p <= 1 ? "wave" : p <= 9 ? "watch" : p === 10 ? "cheer" : p === 11 ? "point" : p === 12 ? "point" : "sit";
  const dashMood: NinjaMood = p <= 1 ? "wave" : p <= 9 ? "watch" : p === 10 ? "cheer" : p === 11 ? "sit" : p === 12 ? "watch" : "sit";
  const mascotY = H * 0.86;

  return (
    <AbsoluteFill style={{ background: "#1A1440" }}>
      <NightDojoWorld width={W} height={H} frame={frame} fps={fps} />

      {p <= 1 && <GameTitleCard frame={frame} startFrame={sec(0.15, FPS)} title="SPEED COMPARE!" section="speedy" y={H * 0.04} width={W} />}

      {showSim && <SpeedCompareSim frame={frame} fps={fps} x={SIM_X} y={SIM_Y} story={STORY} round={activeRound} scale={1.42} />}

      {/* round counter — rendered at full-canvas width, not inside the sim's own narrow
          scaled box, so it has real room clear of the wide "Which side is bigger?" prompt
          instead of overlapping it. */}
      {showSim && (
        <div style={{ position: "absolute", top: SIM_Y + 6, right: 50 }}>
          <span
            style={{
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 26,
              color: "#111",
              background: "rgba(255,255,255,0.78)",
              borderRadius: 12,
              padding: "8px 18px",
            }}
          >
            🎯 {Math.min(roundIndex, 15)}/15
          </span>
        </div>
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {[ROUND1_LOCK, ROUND2_LOCK, ROUND3_LOCK].map((f, i) => (
          <Celebration key={i} x={W / 2} y={SIM_Y + 260} frame={frame} fps={fps} startFrame={f} />
        ))}
        {showResult && <Celebration x={W / 2} y={H * 0.42} frame={frame} fps={fps} startFrame={RESULT_AT + 6} />}
        {showResult && <Celebration x={W / 2} y={H * 0.42} frame={frame} fps={fps} startFrame={RESULT_AT + 30} />}
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Ninja x={W * 0.16} y={mascotY} scale={0.95} mood={zipMood} name="zip" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Ninja x={W * 0.84} y={mascotY} scale={0.85} mood={dashMood} name="dash" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {showResult && (
        <ResultPopup frame={frame} startFrame={RESULT_AT} title="Level Complete!" subtitle="15/15 Rounds!" stars={3} accent="#FF8400" x={W / 2 - 300} y={H * 0.62} width={600} />
      )}

      {p === 11 && <div style={{ position: "absolute", inset: 0, background: "rgba(10,4,32,0.62)", opacity: dimIn }} />}
      {p === 11 && frame >= BENEFIT_AT - 10 && (
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
              Speed Compare
            </span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
            {[{ l: "9", c: "#0074D5" }, { l: ">", c: null }, { l: "5", c: "#E91E63" }].map((it, i) => {
              const popAt = BENEFIT_AT - 10 + i * 5;
              const pop = interpolate(frame, [popAt, popAt + 6, popAt + 10], [0.2, 1.22, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const bob = Math.sin((frame / fps) * 2.1 + i * 0.9) * 7;
              const wig = Math.sin((frame / fps) * 1.5 + i) * 5;
              return it.c ? (
                <div
                  key={i}
                  style={{
                    width: 84,
                    height: 84,
                    background: "#FFFFFF",
                    border: `5px solid ${it.c}`,
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 0 rgba(0,0,0,0.22)",
                    transform: `translateY(${bob}px) scale(${pop}) rotate(${wig}deg)`,
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
                    color: "#FF8400",
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
      {p === 11 && frame >= BENEFIT_AT - 2 && (
        <BenefitCard
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT}
          benefits={[
            { icon: "🧠", text: "Sharp number sense", atFrame: BENEFIT_1_AT },
            { icon: "⚡", text: "Fast decision-making", atFrame: BENEFIT_2_AT },
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
        videoSrc="videos/nav_speed_compare.mp4"
        videoStartFromSec={0}
        playbackRate={1}
        videoAspect={1600 / 736}
        steps={NAV_STEPS}
        rings={[
          // tap the Math Game Zone circle on the real home screen — lands, then fully fades
          // before the cut to zone at +75 (each ring's fade-out must finish before its screen
          // cuts, or its final "landed" state bleeds a floating ring onto the next screenshot)
          { atFrame: NAV_START + 65, x: 0.787, y: 0.616 },
          // tap the Speed Compare card on the real zone screen, clear before the cut to difficulty at +122
          { atFrame: NAV_START + 112, x: 0.183, y: 0.497 },
          // tap "Let's Start" on the real difficulty screen, clear before the cut to gameplay at +160
          { atFrame: NAV_START + 150, x: 0.706, y: 0.889 },
        ]}
        width={W - 120}
        x={60}
        y={H * 0.19}
      />

      {frame < STORE_VISUAL_START && (
        <Caption track={track} frame={frame} ink="#1A1440" accent="#FF8400" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
      )}

      {frame >= STORE_VISUAL_START && (
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
          <StoreFlow frame={frame - STORE_VISUAL_START} fps={fps} height={900} span={STORE_FRAMES} />
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

      <Audio src={staticFile("audio/short_video_game_speed_compare/short_video_game_speed_compare.mp3")} />
    </AbsoluteFill>
  );
};
