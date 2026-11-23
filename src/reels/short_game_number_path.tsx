// NUMBER PATH — thirteenth Math Game Zone reel, and a TWELFTH distinct cast: two frogs
// (`Frog`) over a brand-new lily-pond `PondWorld`. Frogs were picked on purpose: hopping is
// their whole cultural shorthand, and Number Path is literally a hop-from-tile-to-tile game —
// the real app's own on-screen buddy is a hopping critter riding the path.
//
// Confirmed from the user's own gameplay recording: a zigzag maze of tiles, a blue START
// tile, green "+N"/"-N" operation tiles, a yellow 🎯 GOAL tile, and a small buddy + running-
// total bubble hopping tile to tile. The taught path (start 5, hop -2/+1/+3 to reach target 7)
// is verified against the real Swift source's own generated Level 1 example.
//
// Every salient script phrase drives a matching animation from the start (established this
// session): the path tiles pop in one by one exactly as "the path... stretches ahead!" is
// said, the buddy's hop lands on each word naming its result, and the nav montage's screen
// changes are derived from the SAME word timestamps as the step chips.
//
// Timing from public/audio/short_video_game_number_path/*.phrases.json, aligned from
// docs/reel_game_number_path_lines.txt. 15 phrases, ~54.7s. TWELVE anomalies patched.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_number_path.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Frog, type FrogMood } from "../components/heroes/Frog";
import { PondWorld } from "../components/heroes/PondWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { NumberPathSim, type PathTile, type WrongBranch } from "../components/gamezone/sims/NumberPathSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 54.67425;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_NUMBER_PATH_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the path
// Start on 5, hop -2 (→3), +1 (→4), +3 (→7) — target 7, verified against the real generated
// Level 1 example (NumberPathLevels.easy[0][0]).
const TARGET = 7;
const TILES: PathTile[] = [
  { kind: "start", totalAfter: 5, revealAt: F(1.04), emphasizeAt: F(14.7) }, // "stands" ("A buddy stands on a number...") / "five..."
  { kind: "op", op: -2, totalAfter: 3, revealAt: F(4.0), emphasizeAt: F(17.4) }, // "tiles" / "two..."
  { kind: "op", op: 1, totalAfter: 4, revealAt: F(4.42), emphasizeAt: F(21.08) }, // "stretches" / "one..."
  { kind: "goal", op: 3, totalAfter: 7, revealAt: F(5.1), emphasizeAt: F(25.28) }, // "ahead!" / "three..."
];
const HOP_AT = [F(13.74), F(18.682), F(22.908), F(27.224)]; // "Start" / "that's three!" / "that's four!" / "that's seven"

// A real detour the buddy could take but doesn't — forking off the "-2" tile (total 3) with
// two tempting hops, "+5" (→8) then "+2" (→10), that DO reconnect into the same real goal
// tile — but arrive with the wrong total. Matches the actual Swift mechanic: landing on the
// goal tile with the wrong running total bounces the buddy back (shake), rather than winning.
// Flashes the wrong total on the goal tile exactly on "changes" in "each one changes your
// number!" — while the buddy is still sitting at the start, before its own real hop at
// HOP_AT[0] (13.74s) — so it reads as "here's a route that changes your number the wrong
// way," not as a glitch after the real, correct win.
const WRONG_BRANCH: WrongBranch = {
  fromIndex: 1,
  op1: 5,
  op2: 2,
  wrongTotal: 10,
  side: "right",
  revealAt: F(5.1), // alongside the rest of the path finishing its reveal
  rejectAt: F(12.0), // "changes"
};

const SIM_X = W / 2 - 233;
const SIM_Y = H * 0.14;

// the persistent "NUMBER PATH! / Number Adventures" header — held back until the narrator
// names the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(6.662); // "This is Number Path!"
const SIM_HEADER_AT = F(0.0);

const BENEFIT_AT = F(37.9); // "this" (builds planning...)
const BENEFIT_1_AT = F(38.36); // "planning"
const BENEFIT_2_AT = F(39.14); // "sequential" (reasoning)

// ---------------------------------------------------------------- nav montage beats (p13)
const NAV_START = P(13, "start");
const STEP2_AT = F(45.68); // "Number" (into Number Path)
const STEP3_AT = F(46.92); // "pick"
const STEP4_AT = F(48.14); // "start" (hopping!)
const NAV_STEPS = [
  { atFrame: NAV_START, label: "1️⃣ Math Game Zone" },
  { atFrame: STEP2_AT, label: "2️⃣ Number Path" },
  { atFrame: STEP3_AT, label: "3️⃣ Choose your level" },
  { atFrame: STEP4_AT, label: "4️⃣ Start hopping!" },
];
// Segments in nav_number_path.mp4 are built at exactly these durations — home 67f
// (NAV_START→STEP2_AT), zone 38f (STEP2_AT→STEP3_AT), diff 36f (STEP3_AT→STEP4_AT), gameplay
// 27f (STEP4_AT→STORE_START) — so the video's own screen change lands on the same word as
// each step chip, not on an independent timeline.
const NAV_END = NAV_START + 168;

const STORE_START = P(14, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: HOP_AT[1], file: "gz_tap.mp3", vol: 0.45 },
  { frame: HOP_AT[2], file: "gz_tap.mp3", vol: 0.45 },
  { frame: HOP_AT[3], file: "gz_win.mp3", vol: 0.55 },
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
const CAPTION_KEYWORDS = ["Path!", "three!", "four!", "reached!", "planning", "sequential", "free"];

export const ShortGameNumberPath: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 11;
  const parentBeat = p === 12;
  const dimIn = parentBeat ? interpolate(frame, [P(12, "start"), P(12, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const frogMoodA: FrogMood = p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 10 ? "hop" : p === 11 ? "cheer" : parentBeat ? "point" : "sit";
  const frogMoodB: FrogMood = p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 10 ? "hop" : p === 11 ? "cheer" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.8;

  return (
    <AbsoluteFill style={{ background: "#C6F2D9" }}>
      <PondWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <NumberPathSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          tiles={TILES}
          target={TARGET}
          hopAt={HOP_AT}
          headerAt={SIM_HEADER_AT}
          wrongBranch={WRONG_BRANCH}
          scale={1.15}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 420} frame={frame} fps={fps} startFrame={HOP_AT[3] + 2} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Frog x={W * 0.16} y={mascotY} scale={1.0} mood={frogMoodA} name="meadow" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Frog x={W * 0.84} y={mascotY} scale={0.92} mood={frogMoodB} name="lily" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(10,40,30,0.55)", opacity: dimIn }} />}
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
            const arrowIn = interpolate(frame, [popAt + 10, popAt + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const revealIn = interpolate(frame, [popAt + 20, popAt + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const tile = (v: number | string, bg: string, border: string, textColor: string) => (
              <div
                style={{
                  width: 70,
                  height: 70,
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
            // A DIFFERENT instance (4 → 7, not the sim's own 5 → 7) illustrating "plan the
            // hop" — planning ahead is the benefit, so the card shows working out the NEEDED
            // hop before it's taken, not repeating the taught example verbatim.
            return (
              <div style={{ transform: `translateY(${bob}px) scale(${pop})`, display: "inline-block" }}>
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "#FFF8E8",
                    border: "6px solid #2E9E62",
                    borderRadius: 32,
                    padding: "22px 36px 26px",
                    boxShadow: "0 10px 0 rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 30, color: "#2E9E62" }}>
                    🐸 Plan the hop that gets you there:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
                    {tile(4, "#1E63D6", "#0D3B93", "#FFFFFF")}
                    <span style={{ opacity: arrowIn, fontSize: 30 }}>➡️</span>
                    <div style={{ opacity: revealIn, transform: `scale(${0.6 + revealIn * 0.4})` }}>{tile("+3", "#DFF3E6", "#2E9E62", "#1B5E20")}</div>
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 30, color: "#3730A3" }}>=</span>
                    {tile(7, "#FFD54F", "#E8A317", "#1B1440")}
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
            { icon: "🧠", text: "Planning ahead, one hop at a time", atFrame: BENEFIT_1_AT },
            { icon: "🔗", text: "Sequential reasoning — this step, then the next", atFrame: BENEFIT_2_AT },
          ]}
          accent="#2E9E62"
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
          videoSrc="videos/nav_number_path.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 60, x: 0.789, y: 0.616 },
            { atFrame: NAV_START + 98, x: 0.18, y: 0.407 },
            { atFrame: NAV_START + 134, x: 0.133, y: 0.47 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#0A2820" accent="#2E9E62" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(10,40,30,0.55)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="NUMBER PATH!" section="adventures" y={H * 0.04} width={W} />
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

      <Audio src={staticFile("audio/short_video_game_number_path/short_video_game_number_path.mp3")} />
    </AbsoluteFill>
  );
};
