// EQUATION MATCH — nineteenth Math Game Zone reel, and an EIGHTEENTH distinct cast: two
// elephants (`Elephant`) over a brand-new `CircusTentWorld`. Elephants were picked on purpose:
// "an elephant never forgets" IS the cultural shorthand for a great memory, and this game is
// literally a memory-match game.
//
// Confirmed from the user's own gameplay recording (post-transpose=2 correction — the .mp4 was
// captured rotated 90°, same anomaly as every prior gameplay clip; the screenshots this time
// were already landscape-correct) AND from reading the actual Swift/Kotlin source directly
// (EquationMatchModels/ViewModel, both platforms — see [[project_math_game_zone_reels_status]]
// for the full verification): a face-down 4x3/6-pair grid on Easy, Addition/subtraction only,
// operands 1-10, no timer — win = every pair found, star rating from mismatch count (not
// speed). A pair is an equation and its numeric answer (never two equations, on Easy — that
// only starts at Medium). Four of the six pairs here (3+9/12, 2+4/6, 4+9/13, 5-3/2) are lifted
// straight from the user's own recorded Easy session; the narrated pair (3+4/7) and one filler
// pair (7+1/8) are added to complete the 6-pair board, both hand-checked.
//
// Every salient script phrase drives a matching animation (established discipline this
// series): all 12 face-down cards pop in on "a grid of cards, all face down...", the narrated
// pair flips card-by-card exactly on "Flip this one..." / "Flip this one...", matches and
// fades on "seven — ...they disappear!", and every remaining pair reveals already-solved
// together on "Every pair is somewhere on the board..."
//
// Timing from public/audio/short_video_game_equation_match/*.phrases.json, aligned from
// docs/reel_game_equation_match_lines.txt. 12 phrases, ~51.4s. SIXTEEN word-level anomalies
// patched (checked every word in every phrase, not just each phrase's first word).

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_equation_match.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Elephant, type ElephantMood } from "../components/heroes/Elephant";
import { CircusTentWorld } from "../components/heroes/CircusTentWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { EquationMatchSim, type MatchCard } from "../components/gamezone/sims/EquationMatchSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 51.44;
export const FPS = 30;
export const GAME_EQUATION_MATCH_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the board
// 6 pairs / 12 cards, 3 cols x 4 rows — Easy's real grid shape. Pair 1 (3+4/7) is the narrated
// walkthrough; pairs 2-5 are the user's own recorded Easy session; pair 6 is a hand-checked
// filler completing the board (no answer value repeats across pairs).
const NARRATED_PAIR = 1;
const FLIP1_AT = F(15.9); // "this" ("Flip this one...")
const FLIP2_AT = F(19.8); // "this" (second "Flip this one...")
const MATCH_AT = F(21.386); // "seven"
const DISAPPEAR_AT = F(24.2); // "disappear!"
const REMAINING_AT = F(26.76); // "pair" ("Every pair is somewhere on the board...")

// "Flip two cards — find the equation and its answer!" describes the mechanic itself, before
// the narrated walkthrough pair gets its own dedicated moment — so pair 6 (7+1/8) flips live
// right here, word-synced, as the actual demonstration instead of sitting face-down through the
// whole line. It reads as matched immediately once both are flipped (a non-narrated pair needs
// no separate matchAt — see EquationMatchSim's own `matched` rule).
const DEMO_FLIP1_AT = F(11.28); // "cards"
const DEMO_FLIP2_AT = F(12.7); // "equation"
const DEMO_DISAPPEAR_AT = DEMO_FLIP2_AT + 30; // brief hold after matching, then fades like any found pair

// Positions are scattered on purpose — NO pair sits side by side (or even diagonally
// touching). A real memory-match board never puts a pair next to each other; doing so here
// made the two flipped-live pairs (1 and 6) look trivially easy instead of like a real find.
const CARDS: MatchCard[] = [
  { row: 0, col: 0, value: "3+4", pairId: 1, color: "#E8637A", flipAt: FLIP1_AT },
  { row: 2, col: 1, value: "7", pairId: 1, color: "#E8637A", flipAt: FLIP2_AT },
  { row: 0, col: 1, value: "2+4", pairId: 2, color: "#4A90D9", flipAt: REMAINING_AT },
  { row: 3, col: 0, value: "6", pairId: 2, color: "#4A90D9", flipAt: REMAINING_AT + 6 },
  { row: 0, col: 2, value: "3+9", pairId: 3, color: "#E8A93C", flipAt: REMAINING_AT + 12 },
  { row: 2, col: 0, value: "12", pairId: 3, color: "#E8A93C", flipAt: REMAINING_AT + 12 },
  { row: 1, col: 0, value: "5-3", pairId: 4, color: "#9B72D9", flipAt: REMAINING_AT + 18 },
  { row: 2, col: 2, value: "2", pairId: 4, color: "#9B72D9", flipAt: REMAINING_AT + 18 },
  { row: 1, col: 1, value: "4+9", pairId: 5, color: "#4CC98A", flipAt: REMAINING_AT + 24 },
  { row: 3, col: 2, value: "13", pairId: 5, color: "#4CC98A", flipAt: REMAINING_AT + 24 },
  { row: 1, col: 2, value: "7+1", pairId: 6, color: "#D97BC9", flipAt: DEMO_FLIP1_AT },
  { row: 3, col: 1, value: "8", pairId: 6, color: "#D97BC9", flipAt: DEMO_FLIP2_AT },
];

const GRID_REVEAL_AT = F(0.24); // "grid"
const BANNER_AT = F(10.88); // "Flip two cards..."

const SIM_W = 124 * 3 + 12 * 2 + 220;
const SIM_X = (W - SIM_W) / 2;
const SIM_Y = H * 0.16;
const SIM_SCALE = 1.15;

// the persistent "EQUATION MATCH! / Equation Fun" header — held back until the narrator names
// the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(7.758); // "This is Equation Match!"
const SIM_HEADER_AT = F(0.0);

const BENEFIT_AT = F(32.92); // "this" ("this builds memory and quick mental math...")
const BENEFIT_1_AT = F(33.56); // "memory"
const BENEFIT_2_AT = F(34.86); // "mental"

// ---------------------------------------------------------------- nav montage beats (p10)
const NAV_START = P(10, "start");
const STEP2_AT = F(40.98); // "Equation" (flip into Equation Match)
const STEP3_AT = F(42.835); // "pick"
const STEP4_AT = F(44.12); // "find" (every pair!)
const NAV_STEPS = [
  { atFrame: NAV_START, label: "1️⃣ Math Game Zone" },
  { atFrame: STEP2_AT, label: "2️⃣ Equation Match" },
  { atFrame: STEP3_AT, label: "3️⃣ Choose your level" },
  { atFrame: STEP4_AT, label: "4️⃣ Find every pair!" },
];
// Segments in nav_equation_match.mp4 are built at exactly these durations — home 80f
// (NAV_START→STEP2_AT), zone 56f (STEP2_AT→STEP3_AT), diff 39f (STEP3_AT→STEP4_AT), gameplay
// 48f (STEP4_AT→STORE_START) — so the video's own screen change lands on the same word as
// each step chip, not on an independent timeline.
const NAV_END = NAV_START + 223;

const STORE_START = P(11, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: DEMO_FLIP1_AT, file: "gz_tap.mp3", vol: 0.35 },
  { frame: DEMO_FLIP2_AT, file: "gz_tap.mp3", vol: 0.35 },
  { frame: DEMO_FLIP2_AT + 10, file: "gz_win.mp3", vol: 0.4 },
  { frame: FLIP1_AT, file: "gz_tap.mp3", vol: 0.4 },
  { frame: FLIP2_AT, file: "gz_tap.mp3", vol: 0.4 },
  { frame: MATCH_AT, file: "gz_win.mp3", vol: 0.55 },
  { frame: REMAINING_AT, file: "gz_win.mp3", vol: 0.6 },
  { frame: BENEFIT_AT, file: "gz_benefit.mp3", vol: 0.55 },
  ...NAV_STEPS.map((s) => ({ frame: s.atFrame, file: "gz_tap.mp3", vol: 0.5 })),
  { frame: STORE_START + 4, file: "cta_pop.mp3", vol: 0.45 },
];

// toggled by hand to produce the "without music" delivered version — ducked way down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

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
const CAPTION_KEYWORDS = ["Match!", "disappear!", "looked!", "memory", "together!", "flip,"];

export const ShortGameEquationMatch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 8;
  const parentBeat = p === 9;
  const dimIn = parentBeat ? interpolate(frame, [P(9, "start"), P(9, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const elephantMoodA: ElephantMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p === 4 || p === 6 ? "point" : p === 5 || p === 7 ? "recall" : p === 8 ? "cheer" : parentBeat ? "point" : "sit";
  const elephantMoodB: ElephantMood =
    p <= 1 ? "cheer" : p <= 3 ? "sit" : p === 4 || p === 6 ? "think" : p === 5 || p === 7 ? "cheer" : p === 8 ? "cheer" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.83;

  return (
    <AbsoluteFill style={{ background: "#5E1B24" }}>
      <CircusTentWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <EquationMatchSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          cards={CARDS}
          gridRevealAt={GRID_REVEAL_AT}
          narratedPairId={NARRATED_PAIR}
          matchAt={MATCH_AT}
          disappearAt={DISAPPEAR_AT}
          demoPairId={6}
          demoDisappearAt={DEMO_DISAPPEAR_AT}
          bannerAt={BANNER_AT}
          headerAt={SIM_HEADER_AT}
          scale={SIM_SCALE}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 420 * SIM_SCALE} frame={frame} fps={fps} startFrame={REMAINING_AT + 30} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Elephant x={W * 0.16} y={mascotY} scale={1.0} mood={elephantMoodA} name="slate" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Elephant x={W * 0.84} y={mascotY} scale={0.92} mood={elephantMoodB} name="dusk" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(40,12,16,0.6)", opacity: dimIn }} />}
      {parentBeat && frame >= P(9, "start") && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: H * 0.16,
            width: W,
            textAlign: "center",
            opacity: interpolate(frame, [P(9, "start"), P(9, "start") + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(frame, [P(9, "start"), P(9, "start") + 8, P(9, "start") + 14], [0.3, 1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          }}
        >
          {(() => {
            // The whole flip-and-match plays out and settles BEFORE the "Parents — this
            // builds..." line really gets going (BENEFIT_AT, the "this"), not underneath it —
            // it starts the moment the parent beat opens (P(9,"start"), the "Parents" word) and
            // resolves a couple of frames ahead of BENEFIT_AT.
            const popAt = P(9, "start");
            const pop = interpolate(frame, [popAt, popAt + 5, popAt + 9], [0.2, 1.22, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const bob = Math.sin((frame / fps) * 2.1) * 6;
            // A DIFFERENT pair (4+5 / 9, not the sim's own taught 3+4 / 7) — flipped one at a
            // time, automatically, the same way the real game plays, illustrating that ANY
            // equation card can find its answer card, not a memorized match.
            const flip1At = popAt + 8;
            const flip2At = popAt + 18;
            const matchAt = Math.min(flip2At + 8, BENEFIT_AT - 2);
            const flip1 = frame >= flip1At;
            const flip2 = frame >= flip2At;
            const matched = frame >= matchAt;
            const cardPop = (at: number) => interpolate(frame, [at, at + 6, at + 10], [0.4, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const t = frame / fps;
            const matchGlow = matched ? `0 0 ${10 + 8 * (0.5 + Math.sin(t * 2.3) * 0.5)}px 4px rgba(46,158,98,0.4)` : "0 5px 0 rgba(0,0,0,0.14)";
            const card = (flipped: boolean, flipAt: number, faceValue: string) => (
              <div
                style={{
                  width: 84,
                  height: 66,
                  borderRadius: 16,
                  background: flipped ? (matched ? "#DDF5E3" : "#3E7BFA") : "#4A5AA8",
                  border: `4px solid ${flipped ? (matched ? "#2E9E62" : "#2455C4") : "#33408A"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: flipped ? matchGlow : "0 5px 0 rgba(0,0,0,0.14)",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: flipped ? 24 : 30,
                  color: flipped ? (matched ? "#1B5E20" : "#FFFFFF") : "#FFFFFF",
                  transform: `scale(${flipped ? cardPop(flipAt) : 1})`,
                }}
              >
                {flipped ? faceValue : "?"}
              </div>
            );
            return (
              <div style={{ transform: `translateY(${bob}px) scale(${pop})`, display: "inline-block" }}>
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "#FFF8E8",
                    border: "6px solid #7E57C2",
                    borderRadius: 32,
                    padding: "22px 36px 26px",
                    boxShadow: "0 10px 0 rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 30, color: "#7E57C2" }}>
                    🐘 Flip two, find the match:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
                    {card(flip1, flip1At, "4+5")}
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 28, color: "#3730A3" }}>↔</span>
                    {card(flip2, flip2At, "9")}
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
            { icon: "🧠", text: "Memory — remembering where each card is", atFrame: BENEFIT_1_AT },
            { icon: "⚡", text: "Quick mental math, matching on the fly", atFrame: BENEFIT_2_AT },
          ]}
          accent="#7E57C2"
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
          videoSrc="videos/nav_equation_match.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 60, x: 0.393, y: 0.403 },
            { atFrame: NAV_START + 100, x: 0.276, y: 0.889 },
            { atFrame: NAV_START + 145, x: 0.705, y: 0.889 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#3E1219" accent="#7E57C2" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(40,12,16,0.6)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="EQUATION MATCH!" section="equation" y={H * 0.04} width={W} />
      )}

      <BrandBadge portrait />
      <PoweredBy portrait />

      {INCLUDE_MUSIC &&
        Array.from({ length: Math.ceil((AUDIO_SEC * FPS) / MUSIC_LOOP_FRAMES) }, (_, i) => (
          <Sequence key={`music${i}`} from={i * MUSIC_LOOP_FRAMES} durationInFrames={MUSIC_LOOP_FRAMES}>
            <Audio src={staticFile("music_bed.mp3")} volume={0.12} />
          </Sequence>
        ))}

      {SFX_CUES.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.frame)} durationInFrames={40}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol ?? 1} />
        </Sequence>
      ))}

      <Audio src={staticFile("audio/short_video_game_equation_match/short_video_game_equation_match.mp3")} />
    </AbsoluteFill>
  );
};
