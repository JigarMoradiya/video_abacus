// BALLOON POP — pilot #1 of the Math Game Zone reel series. Posted FOR PARENTS, styled FOR
// KIDS: the whole middle is live (rebuilt) gameplay with the app's real palette, framed by
// the series' four signature moments — hook title, result popup, the parent-facing
// BenefitCard, and the real-app navigation montage — then the store CTA.
//
// Timing from public/audio/short_video_game_balloon_pop/*.phrases.json, aligned from
// docs/reel_game_balloon_pop_lines.txt. 14 phrases, ~50.5s. One anomaly patched ("Abacus"
// had absorbed the pause before the CTA line; start moved 44.64 → 46.19 per silencedetect).
//
// Storyboard (word-accurate, frames @30fps):
//   p0-2  three "Pop!"s — three big hook balloons burst in sync (0.00 / 0.48 / 0.72)
//   p3    title card "BALLOON POP!" + ⚡ chip
//   p4-5  target capsule "Make 10 with 7" pops in
//   p6    balloons rising, numbers visible
//   p7    tap-ring closes on the 3-balloon, bursts exactly on the word "pop" (17.86)
//   p8-9  wrong tap on a 5-balloon — wiggles, keeps rising (the app's no-penalty rule)
//   p10   streak montage — three 3-balloons burst on "pop, pop, pop!" (28.38/29.44/29.74)
//         → result popup, 3 stars, win fanfare
//   p11   spotlight dim + BenefitCard (parents beat)
//   p12   AppNavMontage — real simulator recording: home → zone → game → difficulty → play
//   p13   store CTA

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_balloon_pop.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Mascot, type MascotMood } from "../components/mascots/Mascot";
import { GameZoneWorld } from "../components/gamezone/GameZoneWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { ResultPopup } from "../components/gamezone/ResultPopup";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { BalloonPopSim, type BalloonSpec } from "../components/gamezone/sims/BalloonPopSim";
import { GameNameFloatBadge } from "../components/gamezone/GameNameFloatBadge";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 50.520813;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_BALLOON_POP_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);

// ---------------------------------------------------------------- the sim's storyboard
// SIM_TOP fixes the target capsule's visual height (independent of the rise box below).
// RISE_TOP/RISE_H are the balloon's actual box: top is the true top of the frame (so
// balloons float off-screen instead of clipping early), bottom is the world's real ground
// line (GameZoneWorld draws its ground rect at height*0.74) — matching it exactly means
// balloons spawned just below it render fully off-canvas and only reveal themselves as they
// rise back above the line, reading as "emerging from the ground" instead of popping into
// view already floating in open sky.
const SIM_TOP = H * 0.12;
const RISE_TOP = 0;
const RISE_H = H * 0.74;

const DEMO_POP_AT = sec(17.86, FPS);
const WIGGLE_AT = sec(21.9, FPS);
const STREAK_POPS = [sec(28.38, FPS), sec(29.44, FPS), sec(29.74, FPS)];
const RESULT_AT = sec(30.2, FPS);
const BENEFIT_AT = sec(32.0, FPS);

const BALLOONS: BalloonSpec[] = [
  // the three hook balloons — pre-risen (negative spawn), bursting on each spoken "Pop!"
  { number: 1, colorIdx: 0, x: 0.26, spawnFrame: -74, riseSpeed: 220, popAt: sec(0.02, FPS) + 2, countsForStreak: false, scale: 1.25 },
  { number: 2, colorIdx: 2, x: 0.52, spawnFrame: -60, riseSpeed: 220, popAt: sec(0.48, FPS) + 2, countsForStreak: false, scale: 1.25 },
  { number: 3, colorIdx: 4, x: 0.76, spawnFrame: -48, riseSpeed: 220, popAt: sec(0.72, FPS) + 2, countsForStreak: false, scale: 1.25 },
  // ambient risers during the title beat
  { number: 6, colorIdx: 1, x: 0.2, spawnFrame: sec(2.0, FPS), riseSpeed: 150 },
  { number: 9, colorIdx: 5, x: 0.65, spawnFrame: sec(3.2, FPS), riseSpeed: 135 },
  // the teaching wave (p6): numbers clearly visible, rising slowly
  { number: 2, colorIdx: 3, x: 0.22, spawnFrame: sec(10.8, FPS), riseSpeed: 105 },
  { number: 5, colorIdx: 6, x: 0.5, spawnFrame: sec(11.6, FPS), riseSpeed: 100, wiggleAt: WIGGLE_AT },
  { number: 8, colorIdx: 7, x: 0.78, spawnFrame: sec(12.4, FPS), riseSpeed: 95 },
  // THE three — pops exactly on "pop" (17.86s)
  { number: 3, colorIdx: 2, x: 0.36, spawnFrame: sec(13.4, FPS), riseSpeed: 110, popAt: DEMO_POP_AT },
  // fillers so the sky never empties between beats
  { number: 4, colorIdx: 0, x: 0.66, spawnFrame: sec(19.5, FPS), riseSpeed: 100 },
  { number: 7, colorIdx: 4, x: 0.14, spawnFrame: sec(23.0, FPS), riseSpeed: 105 },
  // the streak montage — three 3-balloons bursting on "pop, pop, pop!"
  { number: 3, colorIdx: 5, x: 0.3, spawnFrame: sec(24.4, FPS), riseSpeed: 115, popAt: STREAK_POPS[0] },
  { number: 3, colorIdx: 1, x: 0.55, spawnFrame: sec(25.4, FPS), riseSpeed: 115, popAt: STREAK_POPS[1] },
  { number: 3, colorIdx: 6, x: 0.78, spawnFrame: sec(26.2, FPS), riseSpeed: 118, popAt: STREAK_POPS[2] },
];

// ---------------------------------------------------------------- nav montage beats (p12)
const NAV_START = P(12, "start");
const NAV_END = P(12, "end");
const NAV_STEPS = [
  { atFrame: sec(39.04, FPS), label: "1️⃣ Math Game Zone" },
  { atFrame: sec(41.04, FPS), label: "2️⃣ Balloon Pop" },
  { atFrame: sec(42.64, FPS), label: "3️⃣ Pick a level" },
  { atFrame: sec(44.06, FPS), label: "4️⃣ Play!" },
];

const STORE_START = P(13, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: sec(0.02, FPS) + 2, file: "gz_balloon_pop.mp3", vol: 0.65 },
  { frame: sec(0.48, FPS) + 2, file: "gz_balloon_pop.mp3", vol: 0.65 },
  { frame: sec(0.72, FPS) + 2, file: "gz_balloon_pop.mp3", vol: 0.65 },
  { frame: sec(5.66, FPS), file: "gz_tap.mp3", vol: 0.5 },
  { frame: DEMO_POP_AT - 8, file: "gz_tap.mp3", vol: 0.5 },
  { frame: DEMO_POP_AT, file: "gz_balloon_pop.mp3", vol: 0.65 },
  { frame: DEMO_POP_AT + 2, file: "gz_correct.mp3", vol: 0.5 },
  { frame: WIGGLE_AT - 6, file: "gz_tap.mp3", vol: 0.5 },
  { frame: WIGGLE_AT + 2, file: "gz_wrong.mp3", vol: 0.55 },
  ...STREAK_POPS.map((f) => ({ frame: f, file: "gz_balloon_pop.mp3", vol: 0.65 })),
  { frame: RESULT_AT, file: "gz_win.mp3", vol: 0.6 },
  { frame: RESULT_AT + 12, file: "gz_star.mp3", vol: 0.5 },
  { frame: RESULT_AT + 22, file: "gz_star.mp3", vol: 0.5 },
  { frame: RESULT_AT + 32, file: "gz_star.mp3", vol: 0.5 },
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
const CAPTION_KEYWORDS = ["pop", "ten", "seven", "three", "balloon", "balloons", "streak", "number", "bonds", "mental", "math", "free"];

export const ShortGameBalloonPop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  const showSim = p <= 10 || (p === 11 && frame < BENEFIT_AT);
  // clears BEFORE the "Parents" line begins, not into it — a clean pivot from celebration
  // to the parent beat instead of the two overlapping.
  const showResult = frame >= RESULT_AT && frame < P(11, "start") + 6;
  const dimIn = p === 11 ? interpolate(frame, [P(11, "start"), P(11, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const boMood: MascotMood = p <= 2 ? "cheer" : p === 3 ? "wave" : p <= 9 ? "watch" : p === 10 ? "cheer" : p === 11 ? "point" : p === 12 ? "point" : "sit";
  const pipMood: MascotMood = p <= 2 ? "cheer" : p === 3 ? "wave" : p <= 9 ? "watch" : p === 10 ? "cheer" : p === 11 ? "sit" : p === 12 ? "watch" : "sit";
  const mascotY = H * 0.815;

  return (
    <AbsoluteFill style={{ background: "#FFDDA8" }}>
      <GameZoneWorld section="speedy" width={W} height={H} frame={frame} fps={fps} />

      {p <= 3 && <GameTitleCard frame={frame} startFrame={sec(1.36, FPS)} title="BALLOON POP!" section="speedy" y={H * 0.05} width={W} />}

      {/* the game — full-width sim through the whole teaching body */}
      {showSim && (
        <div style={{ position: "absolute", left: 0, top: RISE_TOP, width: W, height: RISE_H }}>
          <BalloonPopSim
            frame={frame}
            fps={fps}
            width={W}
            height={RISE_H}
            balloons={BALLOONS}
            targetText="Make 10 with 7"
            targetInAt={sec(5.66, FPS)}
            showStreak={frame >= DEMO_POP_AT}
            targetTop={SIM_TOP}
          />
        </div>
      )}

      {/* confetti crackers riding each correct pop */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {[DEMO_POP_AT, ...STREAK_POPS].map((f, i) => (
          <Celebration key={i} x={W * (i === 0 ? 0.36 : [0.3, 0.55, 0.78][i - 1])} y={RISE_H * 0.62} frame={frame} fps={fps} startFrame={f} />
        ))}
        {showResult && <Celebration x={W / 2} y={H * 0.4} frame={frame} fps={fps} startFrame={RESULT_AT + 6} />}
        {showResult && <Celebration x={W / 2} y={H * 0.4} frame={frame} fps={fps} startFrame={RESULT_AT + 30} />}
      </svg>

      {/* Bo & Pip reacting from the ground */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Mascot x={W * 0.16} y={mascotY} scale={0.95} mood={boMood} name="bo" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Mascot x={W * 0.84} y={mascotY} scale={0.85} mood={pipMood} name="pip" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {/* the win moment */}
      {showResult && (
        <ResultPopup frame={frame} startFrame={RESULT_AT} title="You did it!" subtitle="Streak ×4!" stars={3} accent="#FF5A3C" x={W / 2 - 300} y={H * 0.3} width={600} />
      )}

      {/* parents beat — spotlight + benefits */}
      {p === 11 && <div style={{ position: "absolute", inset: 0, background: "rgba(30,8,2,0.6)", opacity: dimIn }} />}
      {p === 11 && frame >= BENEFIT_AT - 10 && (
        <GameNameFloatBadge
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT - 10}
          title="Balloon Pop"
          x={0}
          y={H * 0.09}
          width={W}
        />
      )}
      {p === 11 && frame >= BENEFIT_AT - 2 && (
        <BenefitCard
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT}
          benefits={[
            { icon: "🧠", text: "Builds number bonds" },
            { icon: "⚡", text: "Fast mental math" },
          ]}
          accent="#FF5A3C"
          x={W / 2 - 340}
          y={H * 0.3}
          width={680}
        />
      )}

      {/* find it in the app — a real simulator recording of the actual app, cut into
          home → zone → difficulty → gameplay. Ring positions measured off the clip. */}
      <AppNavMontage
        frame={frame}
        fps={fps}
        startFrame={NAV_START}
        // Clip rebuilt again: the tap into the game now comes from scrolling to the game's
        // real category row (Speedy Games) instead of the "Jump Back In" shortcut — home
        // still comes from the shared recent recording, difficulty + gameplay from Balloon
        // Pop's own. Real segment boundaries: home 0-2.0s, zone(+tap) 2.0-5.5s, difficulty
        // 5.5-6.3s, gameplay 6.3s-end (8.79s total).
        endFrame={STORE_START - 6}
        videoSrc="videos/nav_balloon_pop.mp4"
        videoStartFromSec={0}
        playbackRate={1}
        videoAspect={1600 / 736}
        steps={NAV_STEPS}
        rings={[
          { atFrame: NAV_START + 54, x: 0.878, y: 0.611 },
          { atFrame: NAV_START + 129, x: 0.356, y: 0.424 },
          { atFrame: NAV_START + 180, x: 0.704, y: 0.878 },
        ]}
        width={W - 120}
        x={60}
        y={H * 0.19}
      />

      {p !== 13 && (
        <Caption track={track} frame={frame} ink="#4A1A00" accent="#E8432C" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
      )}

      {p === 13 && (
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
            // same dim level as the parent beat — the colorful world stays visible behind
            // the store flow instead of being swapped for a flat, unrelated backdrop.
            background: "rgba(30,8,2,0.6)",
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

      <Audio src={staticFile("audio/short_video_game_balloon_pop/short_video_game_balloon_pop.mp3")} />
    </AbsoluteFill>
  );
};
