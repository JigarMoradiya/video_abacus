// CROSS MATH — pilot #2 of the Math Game Zone reel series, the "how-to deep dive" tier.
// Posted FOR PARENTS, styled FOR KIDS: gameplay is the CrossMathSim (matches the real app's
// exact colors) for most of the runtime, framed by the series' four signature moments — hook
// title, result popup, the parent BenefitCard, and a real-app navigation montage — then CTA.
//
// Timing from public/audio/short_video_game_cross_math/*.phrases.json, aligned from
// docs/reel_game_cross_math_lines.txt. 18 phrases, ~64.2s. Two anomalies patched: p6 "See"/
// "an" absorbed a pause (start 12.36 → 13.59) and p17 "Abacus" absorbed the pause before the
// CTA (start 58.90 → 60.35), both per silencedetect.
//
// Storyboard (word-accurate, frames @30fps):
//   p0-2   title card "CROSS MATH!" + a mini demo grid already visible, faded/blurred behind
//   p3-5   "Equations go across... and down... and cross each other" — sim grid clarifies
//   p6-7   "See an empty box? Tap it!" — select r2c0 (word "Tap" = select1At)
//   p8     "tile jumps right in!" — place "2" (word "in!" = place1At)
//   p9     "glows green!" — down-run col0 glows (word "green!" = glow1At)
//   p10    "every tile can be used only once!" — place "4" into r0c2 (mid-sentence)
//          across-run glows shortly after
//   p11    "three stars!" — place "1" into r2c2, glow3, → result popup (3 stars)
//   p12-14 hints / "200 levels" — sim stays solved, Bo&Pip react
//   p15    spotlight dim + BenefitCard (parents beat)
//   p16    AppNavMontage — real simulator recording: home → zone → level roadmap → gameplay
//   p17    store CTA

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_cross_math.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Mascot, type MascotMood } from "../components/mascots/Mascot";
import { GameZoneWorld } from "../components/gamezone/GameZoneWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { ResultPopup } from "../components/gamezone/ResultPopup";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { CrossMathSim, type CrossMathStoryboard } from "../components/gamezone/sims/CrossMathSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 64.208938;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_CROSS_MATH_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);

// ---------------------------------------------------------------- the sim's storyboard
const STORY: CrossMathStoryboard = {
  select1At: sec(15.12, FPS), // "Tap it!"
  place1At: sec(19.76, FPS), // "in!"
  glow1At: sec(23.96, FPS), // "green!" (its own word "it's" isn't here; "glows green!" starts 23.22, land on "green" 24.06 read from words)
  place2At: sec(25.9, FPS), // mid "every tile can be used" — sneaks the 7 in while narration talks tiles
  deniedTapAt: sec(27.3, FPS), // demonstrates "used once": the already-placed tile gets a denied re-tap
  glow2At: sec(29.6, FPS),
  place3At: sec(32.2, FPS), // "three stars!"
  glow3At: sec(33.4, FPS),
  // "Equations go across..." (p3) then "...and down..." (p4) then "...and they cross each
  // other!" (p5) — the row/column highlight sweeps land exactly on those three lines.
  acrossHintFrom: sec(7.5, FPS),
  acrossHintTo: sec(12.36, FPS),
  downHintFrom: sec(9.72, FPS),
  downHintTo: sec(12.36, FPS),
  // "No problem — you get three hints on every level!" (p13)
  hintPulseAt: sec(38.0, FPS),
};
const RESULT_AT = sec(34.0, FPS);
const BENEFIT_AT = sec(46.4, FPS);

const SIM_SCALE = 1.15;
const SIM_X = W / 2 - (130 * SIM_SCALE * 5) / 2;
const SIM_Y = H * 0.14;

// ---------------------------------------------------------------- nav montage beats (p16)
const NAV_START = P(16, "start");
const NAV_STEPS = [
  { atFrame: sec(53.86, FPS), label: "1️⃣ Math Game Zone" },
  { atFrame: sec(55.82, FPS), label: "2️⃣ Cross Math" },
  { atFrame: sec(57.24, FPS), label: "3️⃣ Choose your level" },
  { atFrame: sec(58.48, FPS), label: "4️⃣ Play!" },
];

const STORE_START = P(17, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: STORY.select1At - 8, file: "gz_tap.mp3", vol: 0.5 },
  { frame: STORY.place1At, file: "gz_tile_place.mp3", vol: 0.55 },
  { frame: STORY.glow1At, file: "gz_correct.mp3", vol: 0.5 },
  { frame: STORY.place2At, file: "gz_tile_place.mp3", vol: 0.55 },
  { frame: STORY.glow2At, file: "gz_correct.mp3", vol: 0.5 },
  { frame: STORY.place3At, file: "gz_tile_place.mp3", vol: 0.55 },
  { frame: STORY.glow3At, file: "gz_correct.mp3", vol: 0.5 },
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
const CAPTION_KEYWORDS = ["cross", "math", "equation", "equations", "box", "tile", "green", "once", "stars", "hints", "levels", "logic", "fluency"];

export const ShortGameCrossMath: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  const showSim = p <= 14;
  // clears well before "Stuck? No problem — you get three hints..." (p12-13) so that line's
  // own visual (the hint-button pulse) isn't hidden under a stale win popup.
  const showResult = frame >= RESULT_AT && frame < P(12, "start") - 2;
  const dimIn = p === 15 ? interpolate(frame, [P(15, "start"), P(15, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const boMood: MascotMood = p <= 1 ? "wave" : p <= 10 ? "watch" : p <= 14 ? "cheer" : p === 15 ? "point" : p === 16 ? "point" : "sit";
  const pipMood: MascotMood = p <= 1 ? "wave" : p <= 10 ? "watch" : p <= 14 ? "cheer" : p === 15 ? "sit" : p === 16 ? "watch" : "sit";
  const mascotY = H * 0.86;

  return (
    <AbsoluteFill style={{ background: "#E4D8FF" }}>
      <GameZoneWorld section="equation" width={W} height={H} frame={frame} fps={fps} />

      {p <= 2 && <GameTitleCard frame={frame} startFrame={sec(2.42, FPS)} title="CROSS MATH!" section="equation" y={H * 0.04} width={W} />}

      {showSim && (
        <CrossMathSim frame={frame} fps={fps} x={SIM_X} y={SIM_Y} story={STORY} scale={SIM_SCALE} hudFrom={sec(6.0, FPS)} />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {[STORY.glow1At, STORY.glow2At, STORY.glow3At].map((f, i) => (
          <Celebration key={i} x={W / 2} y={SIM_Y + 260} frame={frame} fps={fps} startFrame={f} />
        ))}
        {showResult && <Celebration x={W / 2} y={H * 0.42} frame={frame} fps={fps} startFrame={RESULT_AT + 6} />}
        {showResult && <Celebration x={W / 2} y={H * 0.42} frame={frame} fps={fps} startFrame={RESULT_AT + 30} />}
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Mascot x={W * 0.16} y={mascotY} scale={0.9} mood={boMood} name="bo" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Mascot x={W * 0.84} y={mascotY} scale={0.8} mood={pipMood} name="pip" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {showResult && (
        <ResultPopup frame={frame} startFrame={RESULT_AT} title="Level Complete!" subtitle="Medium · Level 1" stars={3} accent="#7E57C2" x={W / 2 - 300} y={H * 0.62} width={600} />
      )}

      {p === 15 && <div style={{ position: "absolute", inset: 0, background: "rgba(20,4,40,0.6)", opacity: dimIn }} />}
      {p === 15 && frame >= BENEFIT_AT - 10 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: H * 0.115,
            width: W,
            textAlign: "center",
            opacity: interpolate(frame, [BENEFIT_AT - 10, BENEFIT_AT - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(frame, [BENEFIT_AT - 10, BENEFIT_AT - 2, BENEFIT_AT + 4], [0.3, 1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          }}
        >
          {/* title first, then space, then a real cross/plus shape — one row and one
              column crossing like the actual game — as a bigger, unmistakable mini replica
              of the real Cross Math card icon (not just a flat row of tiles). */}
          <div style={{ marginBottom: 22 }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: KID_FONT,
                fontWeight: 800,
                fontSize: 46,
                color: "#FFFFFF",
                textShadow: "0 4px 0 rgba(0,0,0,0.22)",
                background: "rgba(0,0,0,0.14)",
                borderRadius: 999,
                padding: "6px 30px",
              }}
            >
              Cross Math
            </span>
          </div>
          {[
            [null, null, "8", null, null],
            [null, null, "-", null, null],
            ["3", "+", "2", "=", "5"],
            [null, null, "=", null, null],
            [null, null, "6", null, null],
          ].map((row, r) => (
            <div key={r} style={{ display: "flex", justifyContent: "center" }}>
              {row.map((label, i) => {
                if (label === null) return <div key={i} style={{ width: 50, height: 50 }} />;
                const bob = Math.sin((frame / fps) * 1.6 + (r * 5 + i) * 0.4) * 3;
                const op = label === "+" || label === "=" || label === "-";
                return (
                  <div
                    key={i}
                    style={{
                      width: 50,
                      height: 50,
                      background: op ? "#F2CE5A" : "#C8E6C9",
                      border: "2px solid #6D6D6D",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: KID_FONT,
                      fontWeight: 700,
                      fontSize: 26,
                      color: op ? "#0074D5" : "#3E2723",
                      transform: `translateY(${bob}px)`,
                    }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      {p === 15 && frame >= BENEFIT_AT - 2 && (
        <BenefitCard
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT}
          benefits={[
            { icon: "🧠", text: "Arithmetic fluency" },
            { icon: "🧩", text: "Logic & pattern skills" },
          ]}
          accent="#7E57C2"
          x={W / 2 - 340}
          y={H * 0.3}
          width={680}
        />
      )}

      <AppNavMontage
        frame={frame}
        fps={fps}
        startFrame={NAV_START}
        // ends just before the CTA starts — it used to run 38 frames past STORE_START,
        // so the fading phone and the store screen were visible on top of each other.
        endFrame={STORE_START - 6}
        videoSrc="videos/nav_cross_math.mp4"
        videoStartFromSec={0}
        playbackRate={1}
        videoAspect={1600 / 736}
        steps={NAV_STEPS}
        // Clip rebuilt with a genuine scroll (a quick flick, not a slow drag, is what
        // actually moves this list) instead of a crop trick — the header stays fixed at
        // top and Equation Fun is now centered with full subtitles, exactly like scrolling
        // the real app. Segment boundaries: home 0-2.0s, zone 2.0-4.5s, roadmap 4.5-5.3s,
        // gameplay 5.3s-end.
        rings={[
          { atFrame: NAV_START + 54, x: 0.878, y: 0.611 },
          { atFrame: NAV_START + 129, x: 0.58, y: 0.564 },
          { atFrame: NAV_START + 155, x: 0.0869, y: 0.487 },
        ]}
        width={W - 120}
        x={60}
        y={H * 0.19}
      />

      {p !== 17 && (
        <Caption track={track} frame={frame} ink="#2A1140" accent="#7E57C2" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
      )}

      {p === 17 && (
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
            // same dim level as the parent beat — keep the colorful world visible behind
            // the store flow instead of swapping to a flat, unrelated backdrop.
            background: "rgba(20,4,40,0.6)",
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

      <Audio src={staticFile("audio/short_video_game_cross_math/short_video_game_cross_math.mp3")} />
    </AbsoluteFill>
  );
};
