// TARGET NUMBER — tenth Math Game Zone reel, and a NINTH distinct cast: two owls (`Owl`) over
// a brand-new sunny `ArcheryRangeWorld` — bright daylight, grassy field, drifting bullseye
// targets. Owls were picked on purpose: keen aim is their whole cultural shorthand, and this
// game is about lining up numbers to hit an exact target.
//
// Confirmed from the user's own gameplay recording: header "🎯 Target: N", a shrinking pool
// of blue number-pill tiles, green circular operator buttons, and a growing "All Steps" trail
// like "(5+2)=7" — tap two tiles and an operator, they merge into one result tile, repeat
// until one tile equals the target. The in-app card itself reads "Target the Number" (it
// sits in the app's own "Equation Fun" section) — the recorded narration says "Target Number"
// throughout, so the on-screen title matches the audio, and only the nav-step label (which
// isn't voiced) uses the exact card text.
//
// Timing from public/audio/short_video_game_target_number/*.phrases.json, aligned from
// docs/reel_game_target_number_lines.txt. 13 phrases, ~53.9s. EIGHT anomalies patched.
//
// Persistent header + real-asset nav montage, same patterns established on the earlier reels.
// Nav gameplay clip: the real recording's last ~2s (the "(7+7)=14" combine + "Perfect!" win),
// at normal speed — the only window that fits before the store phrase begins (a 5.87s gap).

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_target_number.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Owl, type OwlMood } from "../components/heroes/Owl";
import { ArcheryRangeWorld } from "../components/heroes/ArcheryRangeWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { TargetNumberSim, type CombineStep, type PoolTile } from "../components/gamezone/sims/TargetNumberSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 53.890563;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_TARGET_NUMBER_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the sim's storyboard
// One real puzzle across two combine-steps: 4×6=24, then 24+2=26 — target reached.
const TARGET = 26;
const INITIAL_POOL: PoolTile[] = [
  { id: "a", value: 4 },
  { id: "b", value: 6 },
  { id: "c", value: 2 },
];
const STEPS: CombineStep[] = [
  {
    aId: "a",
    bId: "b",
    op: "×",
    result: 24,
    resultId: "r1",
    tapAAt: F(14.4), // "four"
    tapOpAt: F(14.84), // "times"
    tapBAt: F(15.14), // "six"
    mergeAt: F(15.98), // "twenty-four!"
  },
  {
    aId: "r1",
    bId: "c",
    op: "+",
    result: 26,
    resultId: "r2",
    tapAAt: F(18.1), // "Twenty-four"
    tapOpAt: F(18.92), // "plus"
    tapBAt: F(19.3), // "two..."
    mergeAt: F(20.78), // "twenty-six" (in "that's twenty-six — target reached!")
    isWin: true,
  },
];
const OPS_SHOWN = ["+", "−", "×"] as const;

const SIM_X = W / 2 - 340;
const SIM_Y = H * 0.16;

// the persistent "TARGET NUMBER! / Equation Fun" header — held back until the narrator
// names the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(6.036); // "This is Target Number!"
const SIM_HEADER_AT = F(0.15); // "A target number appears..." — the sim's own target line

const BENEFIT_AT = F(33.36); // "this" (builds flexible thinking...)
const BENEFIT_1_AT = F(33.94); // "flexible" (thinking)
const BENEFIT_2_AT = F(36.28); // "different" (paths)

// ---------------------------------------------------------------- nav montage beats (p11)
const NAV_START = P(11, "start");
const NAV_STEPS = [
  { atFrame: F(42.3), label: "1️⃣ Math Game Zone" },
  { atFrame: F(44.28), label: "2️⃣ Target the Number" },
  { atFrame: F(45.56), label: "3️⃣ Choose your level" },
  { atFrame: F(46.98), label: "4️⃣ Take your shot!" },
];
// 45 (home) + 38 (zone) + 28 (diff) + 59 (gameplay) = 170f — the real gap before the store
// phrase is only 176f, so this is a genuine budget fit, not an arbitrary trim.
const NAV_END = NAV_START + 170;

const STORE_START = P(12, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: STEPS[0].tapAAt, file: "gz_tap.mp3", vol: 0.45 },
  { frame: STEPS[0].tapBAt, file: "gz_tap.mp3", vol: 0.45 },
  { frame: STEPS[0].mergeAt, file: "gz_tile_place.mp3", vol: 0.5 },
  { frame: STEPS[1].tapAAt, file: "gz_tap.mp3", vol: 0.45 },
  { frame: STEPS[1].tapBAt, file: "gz_tap.mp3", vol: 0.45 },
  { frame: STEPS[1].mergeAt, file: "gz_win.mp3", vol: 0.55 },
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
const CAPTION_KEYWORDS = ["target", "twenty-six", "twenty-four!", "reached!", "flexible", "paths", "free"];

export const ShortGameTargetNumber: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 8;
  // The phrase pointer moves to 10 ("Think you can hit it?") well before the nav montage
  // starts at p===11 — `p===9`-only gating left that whole rhetorical beat with nothing on
  // screen but bare background. The parent-beat card was already fully settled by then, so
  // holding it through p===10 costs nothing and closes the gap instead of restarting it.
  const parentBeat = p === 9 || p === 10;
  const dimIn = parentBeat ? interpolate(frame, [P(9, "start"), P(9, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const owlMoodA: OwlMood = p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 5 ? "point" : p === 6 || p === 7 ? "cheer" : parentBeat ? "point" : "sit";
  const owlMoodB: OwlMood = p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 5 ? "aim" : p === 6 || p === 7 ? "cheer" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.79;

  return (
    <AbsoluteFill style={{ background: "#FFE0A8" }}>
      <ArcheryRangeWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <TargetNumberSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          target={TARGET}
          initialPool={INITIAL_POOL}
          steps={STEPS}
          ops={[...OPS_SHOWN]}
          headerAt={SIM_HEADER_AT}
          scale={1.5}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 370} frame={frame} fps={fps} startFrame={STEPS[1].mergeAt + 2} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Owl x={W * 0.16} y={mascotY} scale={1.08} mood={owlMoodA} name="amber" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Owl x={W * 0.84} y={mascotY} scale={1.0} mood={owlMoodB} name="slate" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(30,20,10,0.55)", opacity: dimIn }} />}
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
            const path1In = interpolate(frame, [popAt + 6, popAt + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const path2In = interpolate(frame, [popAt + 18, popAt + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            // number and operator chips styled exactly like the sim's own pool tiles and
            // operator buttons, so this reads as "the same game pieces, used differently" —
            // not a new, disconnected notation.
            const numTile = (v: number | string, key: string, win = false) => (
              <span
                key={key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 46,
                  height: 40,
                  borderRadius: 999,
                  background: win ? "#2E7D32" : "#1E63D6",
                  border: `3px solid ${win ? "#1B5E20" : "#0D3B93"}`,
                  color: "#FFFFFF",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 22,
                  padding: "0 10px",
                  margin: "0 4px",
                }}
              >
                {v}
              </span>
            );
            const opTile = (v: string, key: string) => (
              <span
                key={key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#43A047",
                  color: "#FFFFFF",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 18,
                  margin: "0 3px",
                }}
              >
                {v}
              </span>
            );
            const paren = (v: string) => (
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 26, color: "#3730A3", margin: "0 1px" }}>{v}</span>
            );

            // Two GENUINELY different paths to the SAME target using the SAME pool the sim
            // itself hands out (4, 6, 2) — verified by hand: (4+6)+2=12 and (4−2)×6=12 both
            // check out. This is a different target from the sim's own taught round (26,
            // which only factors one way from this pool) precisely so the "two ways" claim
            // is real math, not a made-up pairing.
            return (
              <div style={{ transform: `translateY(${bob}px) scale(${pop})`, display: "inline-block" }}>
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "#FFF8E8",
                    border: "6px solid #E53935",
                    borderRadius: 32,
                    padding: "22px 36px 28px",
                    boxShadow: "0 10px 0 rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 32, color: "#E53935" }}>
                    🎯 Same numbers, target: 12
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, opacity: 0.85 }}>
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 20, color: "#3730A3" }}>Your numbers:</span>
                    {numTile(4, "n1")}
                    {numTile(6, "n2")}
                    {numTile(2, "n3")}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", marginTop: 20, opacity: path1In, transform: `scale(${0.7 + path1In * 0.3})` }}>
                    {numTile(4, "a1")}
                    {opTile("+", "a-op1")}
                    {numTile(6, "a2")}
                    {opTile("+", "a-op2")}
                    {numTile(2, "a3")}
                    {paren("=")}
                    {numTile(12, "a-res", true)}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", marginTop: 14, opacity: path2In, transform: `scale(${0.7 + path2In * 0.3})` }}>
                    {paren("(")}
                    {numTile(4, "b1")}
                    {opTile("−", "b-op1")}
                    {numTile(2, "b2")}
                    {paren(")")}
                    {opTile("×", "b-op2")}
                    {numTile(6, "b3")}
                    {paren("=")}
                    {numTile(12, "b-res", true)}
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
            { icon: "🧠", text: "Flexible thinking, not one fixed path", atFrame: BENEFIT_1_AT },
            { icon: "🔄", text: "Tries different routes to the answer", atFrame: BENEFIT_2_AT },
          ]}
          accent="#7E57C2"
          x={W / 2 - 340}
          y={H * 0.38}
          width={680}
        />
      )}

      {frame < STORE_START && (
        <AppNavMontage
          frame={frame}
          fps={fps}
          startFrame={NAV_START}
          endFrame={NAV_END}
          videoSrc="videos/nav_target_number.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 40, x: 0.789, y: 0.616 },
            { atFrame: NAV_START + 80, x: 0.819, y: 0.402 },
            { atFrame: NAV_START + 108, x: 0.701, y: 0.888 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#3A2410" accent="#7E57C2" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(30,20,10,0.55)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="TARGET NUMBER!" section="equation" y={H * 0.04} width={W} />
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

      <Audio src={staticFile("audio/short_video_game_target_number/short_video_game_target_number.mp3")} />
    </AbsoluteFill>
  );
};
