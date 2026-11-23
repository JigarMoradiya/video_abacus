// NUMBER SEQUENCE PUZZLE — sixteenth Math Game Zone reel, and a FIFTEENTH distinct cast: two
// penguins (`Penguin`) over a brand-new `IceFloeWorld`. Penguins were picked on purpose:
// belly-sliding across ice IS their whole cultural shorthand, and this game is literally
// "slide the tiles" — a sliding game needs a sliding critter.
//
// Confirmed from the user's own gameplay recording (post-transpose=2 correction — the .mov was
// captured rotated 90°, same anomaly as every prior gameplay clip; the screenshots this time
// were already landscape-correct): a 3x3 grid of pink numbered tiles with one blank cell,
// tapping a tile adjacent to the blank slides it in, and completing 1-8 in reading order pops
// a "You Did It!" celebration. The exact solved layout taught here (1,2,3 / 4,5,6 / 7,8,_) is
// the SAME layout shown as the "3 x 3 Puzzle" preview on the real dashboard-select screen.
//
// Every salient script phrase drives a matching animation (established discipline this
// series): the 8 tiles pop in reading-order on "eight numbered tiles... one empty space", tile
// 6 and the blank both glow on "six is next to the empty space", the actual slide plays on
// "slide it in", and each tile pulses on the exact word naming its own number during the
// "one, two, three... eight" readout.
//
// Timing from public/audio/short_video_game_number_sequence/*.phrases.json, aligned from
// docs/reel_game_number_sequence_lines.txt. 10 phrases, ~58.4s. SEVEN anomalies patched.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_number_sequence.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Penguin, type PenguinMood } from "../components/heroes/Penguin";
import { IceFloeWorld } from "../components/heroes/IceFloeWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { NumberSequenceSim, type PuzzleTile } from "../components/gamezone/sims/NumberSequenceSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 58.43588;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_NUMBER_SEQUENCE_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the board
// Solved layout: 1,2,3 / 4,5,6 / 7,8,_ — the SAME layout the real dashboard-select screen
// shows as its "3 x 3 Puzzle" preview. THREE tiles start out of place (2, 5, and 6), not just
// one — 2 and 5 slide into place early, during the hook, so the board visibly solves itself
// step by step; tile 6 is the one the narration walks through by name, sliding in last,
// exactly matching the locked script ("Six is next to the empty space... slide it in").
//
// Starting shuffle: 1,_,3 / 4,2,5 / 7,8,6 (blank at row0,col1). Move 1: tile 2 slides up into
// the blank. Move 2: tile 5 slides left into the blank tile 2 just left. Move 3 (narrated):
// tile 6 slides up into the blank tile 5 just left — board solved.
const MOVE1_START = F(5.4); // tile 2 slides up
const MOVE1_END = F(6.2);
const MOVE2_START = F(6.6); // tile 5 slides left
const MOVE2_END = F(7.4);
const SLIDE_START = F(17.188); // tile 6 slides up — "Slide it in"
const SLIDE_END = F(17.9);

const TILES: PuzzleTile[] = [
  { value: 1, row: 0, col: 0, revealAt: F(0.3) },
  { value: 3, row: 0, col: 2, revealAt: F(0.96) },
  { value: 4, row: 1, col: 0, revealAt: F(1.62) },
  { value: 2, row: 0, col: 1, preRow: 1, preCol: 1, slideStart: MOVE1_START, slideEnd: MOVE1_END, revealAt: F(2.28) },
  { value: 5, row: 1, col: 1, preRow: 1, preCol: 2, slideStart: MOVE2_START, slideEnd: MOVE2_END, revealAt: F(2.94) },
  { value: 7, row: 2, col: 0, revealAt: F(3.6) },
  { value: 8, row: 2, col: 1, revealAt: F(4.26) },
  { value: 6, row: 1, col: 2, preRow: 2, preCol: 2, slideStart: SLIDE_START, slideEnd: SLIDE_END, revealAt: F(4.92) },
].map((tl) => ({
  ...tl,
  // the raw ASR word timestamps for this fast counting run ("one, two, three...") turned out
  // to be unreliable — silence-absorption checked at the WORD level (not just each phrase's own
  // first word, which is all the earlier anomaly pass covered) showed every one of these words
  // actually starts noticeably later than transcribed (each pulse was firing before its own
  // word was really spoken). These values come from directly re-detecting each word's true
  // speech onset in the raw audio (fine-grained silencedetect, d=0.05), not from ASR alignment.
  emphasizeAt: [F(18.711), F(20.434), F(22.276), F(24.251), F(26.332), F(27.925), F(30.043), F(32.121)][tl.value - 1],
}));

const ADJACENT_AT = F(14.203); // "Six is next to the empty space..."
const SOLVED_AT = F(33.052); // "solved!" (re-detected true onset, see emphasizeAt note below)
const BANNER_AT = F(9.68); // "Slide the tiles until they run one to eight..."

const SIM_W = 124 * 3 + 14 * 2 + 220;
const SIM_X = (W - SIM_W) / 2;
const SIM_Y = H * 0.16;
const SIM_SCALE = 1.3;

// the persistent "NUMBER SEQUENCE PUZZLE! / Number Builders" header — held back until the
// narrator names the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(6.447); // "This is Number Sequence Puzzle!"
const SIM_HEADER_AT = F(0.0);

const BENEFIT_AT = F(40.98); // "this" ("this builds spatial reasoning...")
const BENEFIT_1_AT = F(41.7); // "spatial"
const BENEFIT_2_AT = F(43.1); // "step-by-step"

// ---------------------------------------------------------------- nav montage beats (p8)
const NAV_START = P(8, "start");
const STEP2_AT = F(47.76); // "Number" (slide into Number Sequence Puzzle)
const STEP3_AT = F(49.56); // "pick"
const STEP4_AT = F(50.64); // "start" (sliding!)
const NAV_STEPS = [
  { atFrame: NAV_START, label: "1️⃣ Math Game Zone" },
  { atFrame: STEP2_AT, label: "2️⃣ Number Sequence" },
  { atFrame: STEP3_AT, label: "3️⃣ Choose your board" },
  { atFrame: STEP4_AT, label: "4️⃣ Start sliding!" },
];
// Segments in nav_number_sequence.mp4 are built at exactly these durations — home 67f
// (NAV_START→STEP2_AT), zone 54f (STEP2_AT→STEP3_AT), diff 32f (STEP3_AT→STEP4_AT), gameplay
// 30f (STEP4_AT→STORE_START) — so the video's own screen change lands on the same word as
// each step chip, not on an independent timeline.
const NAV_END = NAV_START + 183;

const STORE_START = P(9, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: MOVE1_START, file: "gz_tap.mp3", vol: 0.45 },
  { frame: MOVE2_START, file: "gz_tap.mp3", vol: 0.45 },
  { frame: SLIDE_START, file: "gz_tap.mp3", vol: 0.5 },
  ...TILES.map((tl) => ({ frame: tl.emphasizeAt!, file: "gz_tap.mp3", vol: 0.3 })),
  { frame: SOLVED_AT, file: "gz_win.mp3", vol: 0.6 },
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
const CAPTION_KEYWORDS = ["Puzzle!", "solved!", "perfectly!", "spatial", "planning!", "free"];

export const ShortGameNumberSequence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 6;
  const parentBeat = p === 7;
  const dimIn = parentBeat ? interpolate(frame, [P(7, "start"), P(7, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const penguinMoodA: PenguinMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p === 4 ? "point" : p === 5 ? "slide" : p === 6 ? "cheer" : parentBeat ? "point" : "sit";
  const penguinMoodB: PenguinMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p === 4 ? "think" : p === 5 ? "cheer" : p === 6 ? "cheer" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.83;

  return (
    <AbsoluteFill style={{ background: "#CDEBFA" }}>
      <IceFloeWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <NumberSequenceSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          tiles={TILES}
          adjacentTileValue={6}
          adjacentAt={ADJACENT_AT}
          solvedAt={SOLVED_AT}
          bannerAt={BANNER_AT}
          headerAt={SIM_HEADER_AT}
          scale={SIM_SCALE}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 420 * SIM_SCALE} frame={frame} fps={fps} startFrame={SOLVED_AT + 2} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Penguin x={W * 0.16} y={mascotY} scale={1.0} mood={penguinMoodA} name="classic" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Penguin x={W * 0.84} y={mascotY} scale={0.92} mood={penguinMoodB} name="frost" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(15,45,65,0.55)", opacity: dimIn }} />}
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
                    🐧 Every move, planned ahead:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                    {["1", "2", "3", "→", "4"].map((v, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-flex",
                          width: v === "→" ? 30 : 56,
                          height: 56,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 14,
                          background: v === "→" ? "transparent" : i === 4 ? "#DDF5E3" : "#F98CAE",
                          border: v === "→" ? "none" : `4px solid ${i === 4 ? "#2E9E62" : "#D9497A"}`,
                          fontFamily: KID_FONT,
                          fontWeight: 700,
                          fontSize: v === "→" ? 26 : 26,
                          color: v === "→" ? "#3730A3" : "#FFFFFF",
                        }}
                      >
                        {v}
                      </span>
                    ))}
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
            { icon: "🧠", text: "Spatial reasoning, seeing the board ahead", atFrame: BENEFIT_1_AT },
            { icon: "🪜", text: "Step-by-step planning, one slide at a time", atFrame: BENEFIT_2_AT },
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
          videoSrc="videos/nav_number_sequence.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 55, x: 0.181, y: 0.403 },
            { atFrame: NAV_START + 94, x: 0.369, y: 0.652 },
            { atFrame: NAV_START + 137, x: 0.369, y: 0.652 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#0D2B3E" accent="#0288D1" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(15,45,65,0.55)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="NUMBER SEQUENCE!" section="builders" y={H * 0.04} width={W} />
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

      <Audio src={staticFile("audio/short_video_game_number_sequence/short_video_game_number_sequence.mp3")} />
    </AbsoluteFill>
  );
};
