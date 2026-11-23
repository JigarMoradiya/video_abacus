// PLACE VALUE — fifteenth Math Game Zone reel, and a FOURTEENTH distinct cast: two squirrels
// (`Squirrel`) over a brand-new `AutumnTreetopWorld`. Squirrels were picked on purpose: they're
// the cultural shorthand for "this goes in ITS own spot" — an acorn goes in its own hole, not
// any hole — which is exactly what place value teaches: a digit goes in its own place, tens or
// ones, not anywhere.
//
// Confirmed from the user's own gameplay recording (post-transpose=2 correction — the .mov was
// captured rotated 90°, same anomaly as every prior gameplay clip; the screenshots this time
// were already landscape-correct): purple expanded-form chips at top ("70" / "+2"), two blank
// place-value slots below labeled T/O with an orange cursor ring on the active one, and a
// numeric keypad the player taps — correct fills turn a slot green, and once every slot is
// filled the mascot cheers "On fire!" The exact example taught here (70 + 2 = 72) is the SAME
// example shown on the real level-select screen (verified in ss_place_value.png).
//
// Every salient script phrase drives a matching animation (established discipline this
// series): the chips pop in on "seventy, and two more!", each digit types into its own slot
// exactly on the word naming it, and the nav montage's screen changes are derived from the
// SAME word timestamps as the step chips.
//
// Timing from public/audio/short_video_game_place_value/*.phrases.json, aligned from
// docs/reel_game_place_value_lines.txt. 11 phrases, ~46.0s. EIGHT anomalies patched.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_place_value.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Squirrel, type SquirrelMood } from "../components/heroes/Squirrel";
import { AutumnTreetopWorld } from "../components/heroes/AutumnTreetopWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { PlaceValueSim, type ExpandedChip, type PlaceSlot } from "../components/gamezone/sims/PlaceValueSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 46.02775;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_PLACE_VALUE_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the example: 70 + 2 = 72
// The same expanded-form example shown on the real level-select screen (ss_place_value.png).
const RESULT = 72;
const CHIPS: ExpandedChip[] = [
  { label: "70", revealAt: F(2.804), emphasizeAt: F(13.172) }, // "seventy," / "Seventy..."
  { label: "+2", revealAt: F(3.9), emphasizeAt: F(14.74) }, // "two" / "two..."
];
const SLOTS: PlaceSlot[] = [
  { label: "Tens", digit: 7, fillAt: F(16.54), keyPressAt: F(16.4), reEmphasizeAt: F(24.5) }, // "seven," / "tens,"
  { label: "Ones", digit: 2, fillAt: F(17.46), keyPressAt: F(17.3), reEmphasizeAt: F(25.46) }, // "two" / "ones,"
];
const RESULT_AT = F(19.36); // "correct!"
const TOGETHER_AT = F(26.28); // "together!"
const BANNER_AT = F(8.352); // "Build the whole number..."

const SIM_W = 620;
const SIM_X = (W - SIM_W) / 2;
const SIM_Y = H * 0.16; // clears the outer "Number Builders" chip before the sim's own header
const SIM_SCALE = 1.3;

// the persistent "PLACE VALUE! / Number Builders" header — held back until the narrator names
// the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(6.38); // "This is Place Value!"
const SIM_HEADER_AT = F(0.0);

const BENEFIT_AT = F(29.14); // "this" ("this builds real place-value sense...")
const BENEFIT_1_AT = F(29.76); // "real"
const BENEFIT_2_AT = F(32.5); // "memorized"

// ---------------------------------------------------------------- nav montage beats (p9)
const NAV_START = P(9, "start");
const STEP2_AT = F(37.16); // "Place" (build with Place Value)
const STEP3_AT = F(38.4); // "pick"
const STEP4_AT = F(39.78); // "build" (the number!)
const NAV_STEPS = [
  { atFrame: NAV_START, label: "1️⃣ Math Game Zone" },
  { atFrame: STEP2_AT, label: "2️⃣ Place Value" },
  { atFrame: STEP3_AT, label: "3️⃣ Choose your level" },
  { atFrame: STEP4_AT, label: "4️⃣ Build it!" },
];
// Segments in nav_place_value.mp4 are built at exactly these durations — home 68f
// (NAV_START→STEP2_AT), zone 37f (STEP2_AT→STEP3_AT), diff 41f (STEP3_AT→STEP4_AT), gameplay
// 58f (STEP4_AT→STORE_START) — so the video's own screen change lands on the same word as each
// step chip, not on an independent timeline.
const NAV_END = NAV_START + 204;

const STORE_START = P(10, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: SLOTS[0].fillAt, file: "gz_tap.mp3", vol: 0.45 },
  { frame: SLOTS[1].fillAt, file: "gz_tap.mp3", vol: 0.45 },
  { frame: RESULT_AT, file: "gz_win.mp3", vol: 0.6 },
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
const CAPTION_KEYWORDS = ["Value!", "correct!", "together!", "real", "memorized", "free"];

export const ShortGamePlaceValue: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 7;
  const parentBeat = p === 8;
  const dimIn = parentBeat ? interpolate(frame, [P(8, "start"), P(8, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const squirrelMoodA: SquirrelMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 5 ? "point" : p === 6 ? "stash" : p === 7 ? "cheer" : parentBeat ? "point" : "sit";
  const squirrelMoodB: SquirrelMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 5 ? "think" : p === 6 ? "cheer" : p === 7 ? "cheer" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.83;

  return (
    <AbsoluteFill style={{ background: "#FDD9A8" }}>
      <AutumnTreetopWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <PlaceValueSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          chips={CHIPS}
          slots={SLOTS}
          result={RESULT}
          bannerAt={BANNER_AT}
          resultAt={RESULT_AT}
          togetherAt={TOGETHER_AT}
          headerAt={SIM_HEADER_AT}
          scale={SIM_SCALE}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 420 * SIM_SCALE} frame={frame} fps={fps} startFrame={RESULT_AT + 2} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Squirrel x={W * 0.16} y={mascotY} scale={1.0} mood={squirrelMoodA} name="rust" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Squirrel x={W * 0.84} y={mascotY} scale={0.92} mood={squirrelMoodB} name="ash" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(60,36,14,0.55)", opacity: dimIn }} />}
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
            // A DIFFERENT number (30+5=35, not the sim's own 70+2) illustrating that the
            // SKILL transfers to any number, not a memorized answer.
            return (
              <div style={{ transform: `translateY(${bob}px) scale(${pop})`, display: "inline-block" }}>
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "#FFF8E8",
                    border: "6px solid #0288D1",
                    borderRadius: 32,
                    padding: "22px 36px 26px",
                    boxShadow: "0 10px 0 rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 30, color: "#0288D1" }}>
                    🐿️ Any number, same idea:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
                    {tile(30, "#8E4FD0", "#6A34A8", "#FFFFFF")}
                    <span style={{ fontWeight: 700, fontSize: 30, color: "#3730A3" }}>+</span>
                    {tile(5, "#8E4FD0", "#6A34A8", "#FFFFFF")}
                    <span style={{ fontWeight: 700, fontSize: 30, color: "#3730A3" }}>=</span>
                    {tile(35, "#DDF5E3", "#2E9E62", "#1B5E20")}
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
            { icon: "🧠", text: "Real place-value sense, not memorized digits", atFrame: BENEFIT_1_AT },
            { icon: "🏠", text: "Every digit finds its own proper place", atFrame: BENEFIT_2_AT },
          ]}
          accent="#0288D1"
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
          videoSrc="videos/nav_place_value.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 55, x: 0.393, y: 0.403 },
            { atFrame: NAV_START + 90, x: 0.276, y: 0.89 },
            { atFrame: NAV_START + 132, x: 0.705, y: 0.89 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#3A2415" accent="#0288D1" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(60,36,14,0.55)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="PLACE VALUE!" section="builders" y={H * 0.04} width={W} />
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

      <Audio src={staticFile("audio/short_video_game_place_value/short_video_game_place_value.mp3")} />
    </AbsoluteFill>
  );
};
