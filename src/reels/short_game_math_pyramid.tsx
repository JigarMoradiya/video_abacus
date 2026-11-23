// MATH PYRAMID — eleventh Math Game Zone reel, and a TENTH distinct cast: two beavers
// (`Beaver`) over a brand-new `BlueprintWorkshopWorld` — cool blueprint-blue, a fine drafting
// grid, drifting white block + ruler motes. Beavers were picked on purpose: they are the
// cultural shorthand for building and stacking, and this game is literally "add numbers to
// build the pyramid."
//
// Confirmed from the user's own gameplay recording: white/cream rounded-rect blocks, blanks
// shown as "?" until typed, the active cell gets a gold border, a keypad fills them in. The
// 3-row recap round (42 / 15,27 / 3,12,15) is the EXACT puzzle from that recording — verified
// by hand: 3+12=15, 12+15=27, 15+27=42.
//
// Timing from public/audio/short_video_game_math_pyramid/*.phrases.json, aligned from
// docs/reel_game_math_pyramid_lines.txt. 14 phrases, ~52.5s. TEN anomalies patched.
//
// Persistent header + real-asset nav montage, same patterns established on the earlier reels.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_math_pyramid.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Beaver, type BeaverMood } from "../components/heroes/Beaver";
import { BlueprintWorkshopWorld } from "../components/heroes/BlueprintWorkshopWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { MathPyramidSim, type PyramidSpec } from "../components/gamezone/sims/MathPyramidSim";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 52.506063;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_MATH_PYRAMID_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const F = (s: number) => sec(s, FPS);

// ---------------------------------------------------------------- the sim's storyboard
// Round 1: the simple 2-block teach — 4 and 6 are given, 10 is the one blank, typed live.
const ROUND1_LOCK = F(19.54); // "locks" (in "the block locks in!")
// "stands tall" (0.54s "pyramid" → 1.72s "tall...") grows the whole thing up into place;
// "missing!" (4.26s) pulses the one open blank so the hook's OWN words point straight at it;
// "added together!" (11.8s) pulses the two given blocks that get "added" right as the rule
// names them.
const GROW_FROM = F(0.54); // "pyramid"
const GROW_TO = F(1.72); // "tall..."
const ROUND1: PyramidSpec = {
  start: F(0.144),
  rows: [
    [
      { value: 4, given: true, emphasizeAt: [F(13.86), F(11.8)] }, // "Four...", "together!"
      { value: 6, given: true, emphasizeAt: [F(14.94), F(11.8)] }, // "six...", "together!"
    ],
    // no pulse on "missing!" here — that fired at 4.26s, well before "4" (13.86s) and "6"
    // (14.94s) get their own turn, so the answer box was glowing before its two pieces had
    // even been called out. The blank staying a plain "?" already reads as "missing" fine.
    [{ value: 10, given: false, digitAt: [F(18.94), F(19.24)], lockAt: ROUND1_LOCK, emphasizeAt: [F(16.36)] }], // "ten!"
  ],
};
// Round 2: the real 3-row recording — 12, 15, 27, 42 given; 3 and 15 (bottom ends) are the
// blanks, filled right-to-left exactly as the recording shows. "missing block," (21.94s)
// previews BOTH open blanks before either is actually typed.
const R2_RIGHT_LOCK = F(23.88); // "top!"
const R2_LEFT_LOCK = F(29.36); // "built"
const ROUND2: PyramidSpec = {
  start: F(21.131),
  rows: [
    [
      { value: 3, given: false, digitAt: [F(29.06)], lockAt: R2_LEFT_LOCK, emphasizeAt: [F(21.94)] }, // "missing"
      { value: 12, given: true },
      { value: 15, given: false, digitAt: [F(23.28), F(23.58)], lockAt: R2_RIGHT_LOCK, emphasizeAt: [F(21.94)] }, // "missing"
    ],
    // Each middle-row card pulses right as the specific pair below it finishes locking:
    // "15" here is 3+12 (reacts to the LEFT blank), "27" is 12+15 (reacts to the RIGHT
    // blank) — not the far-off apex, and not each other's pair.
    [
      { value: 15, given: true, emphasizeAt: [R2_LEFT_LOCK] },
      { value: 27, given: true, emphasizeAt: [R2_RIGHT_LOCK] },
    ],
    [{ value: 42, given: true }],
  ],
};
const SPECS = [ROUND1, ROUND2];

const SIM_X = W / 2 - 320;
const SIM_Y = H * 0.14;

// the persistent "MATH PYRAMID! / Number Adventures" header — held back until the narrator
// names the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = F(6.424); // "This is Math Pyramid!"
const SIM_HEADER_AT = F(0.144); // the sim's own "🧱 Math Pyramid" pill

const BENEFIT_AT = F(33.4); // "this" (builds addition fluency...)
const BENEFIT_1_AT = F(33.98); // "addition" (fluency)
const BENEFIT_2_AT = F(35.5); // "pattern" (sense)

// ---------------------------------------------------------------- nav montage beats (p12)
const NAV_START = P(12, "start");
const STEP2_AT = F(43.24); // "Math" (climb into Math Pyramid)
const STEP3_AT = F(44.6); // "pick" (your level)
const STEP4_AT = F(45.82); // "start" (stacking!)
const NAV_STEPS = [
  { atFrame: NAV_START, label: "1️⃣ Math Game Zone" },
  { atFrame: STEP2_AT, label: "2️⃣ Math Pyramid" },
  { atFrame: STEP3_AT, label: "3️⃣ Choose your level" },
  { atFrame: STEP4_AT, label: "4️⃣ Start stacking!" },
];
// The underlying VIDEO SEGMENTS must change screen at these exact same frames — not just the
// text chips. v1 and v2 both built nav_math_pyramid.mp4 as four fixed-length clips concatenated
// back to back with NO relationship to when each phrase is actually spoken, so the chip for
// "Math Pyramid" could pop while the video was still showing the home screen. The segments are
// now built (see /tmp/realassets_mp) at exactly these durations: home 57f (NAV_START→STEP2_AT),
// zone 41f (STEP2_AT→STEP3_AT), diff 37f (STEP3_AT→STEP4_AT), gameplay 27f
// (STEP4_AT→STORE_START) — the real, fixed gap there, not a padding choice.
const NAV_END = NAV_START + 162;

const STORE_START = P(13, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: ROUND1_LOCK, file: "gz_win.mp3", vol: 0.5 },
  { frame: R2_RIGHT_LOCK, file: "gz_tile_place.mp3", vol: 0.5 },
  { frame: R2_LEFT_LOCK, file: "gz_win.mp3", vol: 0.55 },
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
const CAPTION_KEYWORDS = ["pyramid", "ten!", "locks", "top!", "block!", "fluency", "pattern", "free"];

export const ShortGameMathPyramid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, AUDIO_SEC, FPS), []);

  const showSim = p <= 9;
  // The phrase pointer reaches p===11 ("Ready to build one yourself?") well before the nav
  // montage begins at p===12 — holding the parent beat through BOTH p===10 and p===11 closes
  // that gap instead of leaving bare background, the same fix Target Number needed.
  const parentBeat = p === 10 || p === 11;
  const dimIn = parentBeat ? interpolate(frame, [P(10, "start"), P(10, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const beaverMoodA: BeaverMood = p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 6 ? "point" : p === 7 ? "stack" : p === 9 ? "cheer" : parentBeat ? "point" : "sit";
  const beaverMoodB: BeaverMood = p <= 1 ? "cheer" : p <= 3 ? "sit" : p <= 6 ? "think" : p === 7 ? "stack" : p === 9 ? "cheer" : parentBeat ? "think" : "sit";
  const mascotY = H * 0.82;

  return (
    <AbsoluteFill style={{ background: "#164A7A" }}>
      <BlueprintWorkshopWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <MathPyramidSim
          frame={frame}
          fps={fps}
          x={SIM_X}
          y={SIM_Y}
          specs={SPECS}
          headerAt={SIM_HEADER_AT}
          growFrom={GROW_FROM}
          growTo={GROW_TO}
          scale={1.2}
        />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 380} frame={frame} fps={fps} startFrame={ROUND1_LOCK + 2} />
        <Celebration x={W / 2} y={SIM_Y + 200} frame={frame} fps={fps} startFrame={R2_LEFT_LOCK + 2} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Beaver x={W * 0.16} y={mascotY} scale={1.02} mood={beaverMoodA} name="chestnut" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Beaver x={W * 0.84} y={mascotY} scale={0.95} mood={beaverMoodB} name="slate" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {parentBeat && <div style={{ position: "absolute", inset: 0, background: "rgba(6,16,32,0.58)", opacity: dimIn }} />}
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
            const resultIn = interpolate(frame, [popAt + 20, popAt + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const block = (v: number | string, win = false) => (
              <div
                style={{
                  width: 78,
                  height: 58,
                  borderRadius: 14,
                  background: win ? "#E8F5E9" : "#FFFDF7",
                  border: `4px solid ${win ? "#2E7D32" : "#E0D6C0"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 30,
                  color: win ? "#2E7D32" : "#1B1440",
                }}
              >
                {v}
              </div>
            );
            // The RULE itself, illustrated generically (5 and 3, not the sim's own 4/6/10
            // or 3/12/15) — this is "pattern sense," spotting that every block obeys the
            // same rule, not a repeat of either taught example.
            return (
              <div style={{ transform: `translateY(${bob}px) scale(${pop})`, display: "inline-block" }}>
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "#FFF8E8",
                    border: "6px solid #E8792C",
                    borderRadius: 32,
                    padding: "22px 36px 26px",
                    boxShadow: "0 10px 0 rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 30, color: "#E8792C" }}>
                    🧱 Every block follows the rule:
                  </span>
                  {/* result ON TOP, operands below, arrow pointing UP — matching how the real
                      pyramid actually stacks (the sum sits above the two it's made from), not
                      the textbook "operands above, answer below" order that would visually
                      contradict the sim right above this card. */}
                  <div style={{ opacity: resultIn, transform: `scale(${0.6 + resultIn * 0.4})`, marginTop: 16 }}>{block(8, true)}</div>
                  <div style={{ opacity: arrowIn, margin: "6px 0", fontSize: 26 }}>⬆️</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {block(5)}
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 28, color: "#3730A3" }}>+</span>
                    {block(3)}
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
            { icon: "🧠", text: "Addition fluency, one block at a time", atFrame: BENEFIT_1_AT },
            { icon: "🔎", text: "Pattern sense — spot the rule and reuse it", atFrame: BENEFIT_2_AT },
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
          videoSrc="videos/nav_math_pyramid.mp4"
          videoStartFromSec={0}
          playbackRate={1}
          videoAspect={1600 / 736}
          steps={NAV_STEPS}
          rings={[
            { atFrame: NAV_START + 50, x: 0.789, y: 0.616 },
            { atFrame: NAV_START + 91, x: 0.392, y: 0.402 },
            { atFrame: NAV_START + 128, x: 0.699, y: 0.858 },
          ]}
          width={W - 120}
          x={60}
          y={H * 0.19}
        />
      )}

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#0E2E4F" accent="#2E9E62" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(6,16,32,0.58)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="MATH PYRAMID!" section="adventures" y={H * 0.04} width={W} />
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

      <Audio src={staticFile("audio/short_video_game_math_pyramid/short_video_game_math_pyramid.mp3")} />
    </AbsoluteFill>
  );
};
