// QUICK SUBTRACTING ON ROD 1 — pairs with short_adding_rod1.tsx. Same cast, Zip & Dash, per
// the user's own direction ("use same character... but with different dark background") —
// but a DIFFERENT dark backdrop (NightCliffWorld: teal aurora sky, jagged cliffs, drifting
// fog) so the two reels don't look like the same video with the sign flipped.
//
// Four examples, all genuinely "it just fits" — no complement/friend trick:
//   3 - 2 = 1   lower beads only
//   7 - 5 = 2   upper bead only, lower beads untouched
//   9 - 6 = 3   upper bead AND one lower bead together (5+1=6)
//   8 - 7 = 1   upper bead AND two lower beads together (5+2=7)
// The last two are the ones the addition reel never needed and this one does — a genuine
// compound move, both bead types releasing in the SAME action, lower first then upper.
//
// Timing from public/audio/short_video_subtracting_rod1/short_video_subtracting_rod1.phrases.json,
// aligned from docs/reel_quicksubtract_lines.txt. 15 phrases, ~66.0s, 98.6% word match, no
// silence-absorption anomalies found.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/subtracting_rod1.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Ninja, type NinjaMood } from "../components/mascots/Ninja";
import { NightCliffWorld } from "../components/mascots/NightCliffWorld";
import { Abacus, type RodState } from "../components/Abacus";
import { BeadArrow } from "../stage/BeadArrow";
import type { AbacusBox } from "../stage/geometry";
import { SumCard } from "../components/quickmath/SumCard";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { KID_FONT } from "../lib/fonts";
import { ROD_PITCH, FRAME_LW, ABACUS_INNER_H } from "../data/tokens";
import { BrandBadge, PoweredBy } from "../components/Brand";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 65.959125;
export const FPS = 30;
export const SUBTRACTING_ROD1_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const ABX_SCALE = 1.05;
const ABX_W = (1 * ROD_PITCH + FRAME_LW * 2) * ABX_SCALE;
const ABX_H = (ABACUS_INNER_H + FRAME_LW * 2) * ABX_SCALE;
const ABX_LEFT = W / 2 - ABX_W / 2;
const ABX_TOP = H * 0.28;
const ABX_BOX: AbacusBox = {
  left: ABX_LEFT,
  top: ABX_TOP,
  w: ABX_W,
  h: ABX_H,
  innerLeft: ABX_LEFT + FRAME_LW * ABX_SCALE,
  innerTop: ABX_TOP + FRAME_LW * ABX_SCALE,
  innerW: 1 * ROD_PITCH * ABX_SCALE,
  scale: ABX_SCALE,
  rodCount: 1,
};

/** One bead move: constant at `from` before `start`, interpolating settle across the
 *  window, constant at `to` after `end`. Same generic helper as the adding reel. */
const moveDemo = (frame: number, start: number, end: number, from: number, to: number): { from: number; to: number; settle: number } => {
  if (frame < start) return { from, to: from, settle: 1 };
  if (frame < end) {
    return { from, to, settle: interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) };
  }
  return { from: to, to, settle: 1 };
};

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);
const RESET_FRAMES = 14;

const STORE_START = P(14, "start");
const STORE_FRAMES = 100;

const CARD_X = ABX_LEFT + ABX_W + 34;
const CARD_Y = ABX_TOP + ABX_H * 0.1;
const CELEBRATE_X = CARD_X + 150;
const CELEBRATE_Y = CARD_Y + 190;

// each example's answer reveals at the EXACT frame the narration says the word. Timestamps
// read off the aligned word-level JSON.
const ANS1_AT = sec(10.12, FPS);
const ANS2_AT = sec(21.0, FPS);
const ANS3_AT = sec(34.22, FPS);
const ANS4_AT = sec(47.38, FPS);
// the tip's two tags land exactly on the words they name.
const TIP_LOWER_AT = sec(51.54, FPS);
const TIP_UPPER_AT = sec(54.22, FPS);

type CardState = { a: number; b: number; answer: number; showA: number; showB: number; revealAnswer: number };

// a single Celebration burst is done in ~1.15s (34 frames) — repeat bursts every 26 frames
// keep it sparkling continuously from the moment the answer lands until the script moves on.
const CRACKER_GAP = 26;
const crackerStarts = (from: number, until: number): number[] => {
  const out: number[] = [];
  for (let f = from; f < until; f += CRACKER_GAP) out.push(f);
  return out;
};

const cardFor = (frame: number, p: number, setupP: number, actionP: number, a: number, b: number, answer: number, ansAt: number): CardState | null => {
  if (p !== setupP && p !== actionP) return null;
  const setupStart = P(setupP, "start");
  const actionStart = P(actionP, "start");
  const showA = interpolate(frame, [setupStart, setupStart + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showB = interpolate(frame, [actionStart, actionStart + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const revealAnswer = interpolate(frame, [ansAt, ansAt + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { a, b, answer, showA, showB, revealAnswer };
};

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "ninja_hook.mp3", vol: 0.6 },
  { frame: P(2, "start"), file: "ninja_push.mp3", vol: 0.6 },
  { frame: ANS1_AT, file: "ninja_tip.mp3", vol: 0.4 },
  { frame: P(3, "start"), file: "ninja_reset.mp3", vol: 0.45 },
  { frame: P(5, "start"), file: "ninja_push.mp3", vol: 0.6 },
  { frame: ANS2_AT, file: "ninja_tip.mp3", vol: 0.4 },
  { frame: P(6, "start"), file: "ninja_reset.mp3", vol: 0.45 },
  { frame: P(8, "start"), file: "ninja_push.mp3", vol: 0.6 },
  { frame: ANS3_AT, file: "ninja_tip.mp3", vol: 0.4 },
  { frame: P(9, "start"), file: "ninja_reset.mp3", vol: 0.45 },
  { frame: P(11, "start"), file: "ninja_push.mp3", vol: 0.6 },
  { frame: ANS4_AT, file: "ninja_tip.mp3", vol: 0.4 },
  { frame: P(12, "start") + 6, file: "ninja_tip.mp3", vol: 0.5 },
  { frame: P(13, "start"), file: "cta_pop.mp3", vol: 0.5 },
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
const CAPTION_KEYWORDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "lower", "upper", "bead", "beads", "quick", "tip"];

export const ShortSubtractingRod1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  // ---------------------------------------------------------------- the rod
  let value = 0;
  let from = 0;
  let settle = 1;

  if (p === 1) {
    value = 3; from = 3; settle = 1;
  } else if (p === 2) {
    const d = moveDemo(frame, P(2, "start"), P(2, "end"), 3, 1);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 3) {
    const d = moveDemo(frame, P(3, "start"), P(3, "start") + RESET_FRAMES, 1, 0);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 4) {
    value = 7; from = 7; settle = 1;
  } else if (p === 5) {
    const d = moveDemo(frame, P(5, "start"), P(5, "end"), 7, 2);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 6) {
    const d = moveDemo(frame, P(6, "start"), P(6, "start") + RESET_FRAMES, 2, 0);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 7) {
    value = 9; from = 9; settle = 1;
  } else if (p === 8) {
    // the compound move — one lower bead down AND the upper bead up, together.
    const d = moveDemo(frame, P(8, "start"), P(8, "end"), 9, 3);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 9) {
    const d = moveDemo(frame, P(9, "start"), P(9, "start") + RESET_FRAMES, 3, 0);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 10) {
    value = 8; from = 8; settle = 1;
  } else if (p === 11) {
    const d = moveDemo(frame, P(11, "start"), P(11, "end"), 8, 1);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 12) {
    // static six — one lower bead up, the upper bead down — so the tip's arrows point at
    // beads that are actually engaged (about to release) instead of an empty rod. No
    // animation here on purpose: the arrows alone carry the "1st, then 2nd" order.
    value = 6; from = 6; settle = 1;
  } else if (p === 13) {
    value = 0; from = 0; settle = 1;
  }

  const rods: RodState[] = [{ value, from, focus: 1, chipLower: true, chipUpper: true, placeName: "ones" }];
  const showAbacus = p <= 13;

  // ---------------------------------------------------------------- the worked-sum card
  const card =
    cardFor(frame, p, 1, 2, 3, 2, 1, ANS1_AT) ??
    cardFor(frame, p, 4, 5, 7, 5, 2, ANS2_AT) ??
    cardFor(frame, p, 7, 8, 9, 6, 3, ANS3_AT) ??
    cardFor(frame, p, 10, 11, 8, 7, 1, ANS4_AT);

  const tag1In = interpolate(frame, [TIP_LOWER_AT, TIP_LOWER_AT + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tag2In = interpolate(frame, [TIP_UPPER_AT, TIP_UPPER_AT + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tipT = frame / fps;

  const crackerBursts =
    p === 2 ? crackerStarts(ANS1_AT, P(2, "end")) :
    p === 5 ? crackerStarts(ANS2_AT, P(5, "end")) :
    p === 8 ? crackerStarts(ANS3_AT, P(8, "end")) :
    p === 11 ? crackerStarts(ANS4_AT, P(11, "end")) :
    [];
  const closeBursts = p === 13 ? crackerStarts(P(13, "start"), P(13, "end")) : [];

  // ---------------------------------------------------------------- Zip & Dash
  const zipMood: NinjaMood =
    p === 0 ? "wave" :
    p >= 1 && p <= 11 ? "watch" :
    p === 12 ? "think" :
    p === 13 ? "cheer" :
    "sit";
  const dashMood: NinjaMood =
    p === 0 ? "wave" :
    p >= 1 && p <= 11 ? "watch" :
    p === 12 ? "think" :
    p === 13 ? "cheer" :
    "sit";

  const mascotY = H * 0.72;
  const zipX = W * 0.28;
  const dashX = W * 0.72;

  const introZoom = p === 0
    ? interpolate(frame, [0, P(0, "end")], [1, 1.06], { extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill style={{ background: "#163C3E" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${introZoom})`, transformOrigin: "50% 45%" }}>
        <NightCliffWorld width={W} height={H} frame={frame} fps={fps} />

        {p === 0 && (
          <div style={{ position: "absolute", top: H * 0.06, left: 0, width: W, textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 60,
                color: "#EAFFF3",
                textShadow: "0 6px 0 rgba(0,0,0,0.35)",
                transform: `scale(${interpolate(frame, [0, 8, 14], [0.3, 1.16, 1], { extrapolateRight: "clamp" })})`,
              }}
            >
              QUICK SUBTRACTING!
            </span>
          </div>
        )}

        {p === 12 && (
          <div style={{ position: "absolute", top: 0, left: 0, width: W, height: ABX_TOP, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 66,
                color: "#3FE0B0",
                textShadow: "0 6px 0 rgba(0,0,0,0.35)",
                transform: `scale(${interpolate(frame, [P(12, "start"), P(12, "start") + 8, P(12, "start") + 14], [0.3, 1.16, 1], { extrapolateRight: "clamp" })})`,
              }}
            >
              QUICK TIP!
            </span>
          </div>
        )}

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <Ninja x={zipX} y={mascotY} scale={1.0} mood={zipMood} name="zip" progress={beatProgress} frame={frame} fps={fps} facing={1} />
          <Ninja x={dashX} y={mascotY} scale={0.92} mood={dashMood} name="dash" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
        </svg>

        {(card || p === 12) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(2,10,10,0.62)",
              opacity: card ? Math.max(card.showA, card.showB) : Math.max(tag1In, tag2In),
            }}
          />
        )}

        {showAbacus && (
          <>
            <div
              style={{
                position: "absolute",
                left: ABX_LEFT,
                top: ABX_TOP,
                transform: `scale(${interpolate(frame, [0, 10, 16], [0.7, 1.08, 1], { extrapolateRight: "clamp" })})`,
                transformOrigin: "50% 0%",
              }}
            >
              <Abacus rods={rods} settle={settle} scale={ABX_SCALE} colorOnArrival />
            </div>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <BeadArrow box={ABX_BOX} rod={0} from={from} to={value} settle={settle} />
              {/* the tip's own arrows — beads stay put, the arrows just point at where they'd
                  go for THIS reel's direction: lower beads move DOWN to release, the upper
                  bead moves UP to release — the reverse of the adding reel's arrows. */}
              {p === 12 && tag1In > 0.05 && (
                <BeadArrow box={ABX_BOX} rod={0} from={1} to={0} settle={0} />
              )}
              {p === 12 && tag2In > 0.05 && (
                <BeadArrow box={ABX_BOX} rod={0} from={5} to={0} settle={0} />
              )}
              {crackerBursts.map((sf, i) => (
                <Celebration key={i} x={CELEBRATE_X} y={CELEBRATE_Y} frame={frame} fps={fps} startFrame={sf} />
              ))}
              {p === 13 && closeBursts.map((sf, i) => (
                <Celebration key={i} x={W / 2} y={H * 0.5} frame={frame} fps={fps} startFrame={sf} />
              ))}
            </svg>
          </>
        )}

        {card && (
          <SumCard
            x={CARD_X}
            y={CARD_Y}
            a={card.a}
            b={card.b}
            operator="-"
            answer={card.answer}
            showA={card.showA}
            showB={card.showB}
            revealAnswer={card.revealAnswer}
            accent="#3FE0B0"
            t={frame / fps}
          />
        )}

        {p === 12 && (() => {
          const glow = 0.55 + Math.sin(tipT * 3.2) * 0.35;
          return (
            <div style={{ position: "absolute", left: CARD_X, top: CARD_Y, width: 280, display: "flex", flexDirection: "column", gap: 26 }}>
              <div
                style={{
                  background: "#F0FFF8",
                  border: "6px solid #3FE0B0",
                  borderRadius: 30,
                  padding: "22px 26px",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 38,
                  color: "#0E2A2E",
                  opacity: tag1In,
                  transform: `scale(${0.7 + tag1In * 0.3}) translateX(${(1 - tag1In) * 30}px)`,
                  transformOrigin: "left center",
                  boxShadow: `0 10px 0 rgba(0,0,0,0.28), 0 0 0 10px rgba(63,224,176,${glow * 0.28 * tag1In})`,
                }}
              >
                1st lower bead
              </div>
              <div
                style={{
                  background: "#F0FFF8",
                  border: "6px solid #3FE0B0",
                  borderRadius: 30,
                  padding: "22px 26px",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 38,
                  color: "#0E2A2E",
                  opacity: tag2In,
                  transform: `scale(${0.7 + tag2In * 0.3}) translateX(${(1 - tag2In) * 30}px)`,
                  transformOrigin: "left center",
                  boxShadow: `0 10px 0 rgba(0,0,0,0.28), 0 0 0 10px rgba(63,224,176,${glow * 0.28 * tag2In})`,
                }}
              >
                2nd upper bead
              </div>
            </div>
          );
        })()}
      </div>

      {p !== 14 && (
        <Caption track={track} frame={frame} ink="#0E2A2E" accent="#1E8A6E" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
      )}

      {p === 14 && (
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
            background: "rgba(6,20,20,0.9)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      <BrandBadge portrait />
      <PoweredBy portrait />

      {SFX_CUES.map((c, i) => (
        <Sequence key={i} from={c.frame} durationInFrames={40}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol ?? 1} />
        </Sequence>
      ))}

      <Audio src={staticFile("audio/short_video_subtracting_rod1/short_video_subtracting_rod1.mp3")} />
    </AbsoluteFill>
  );
};
