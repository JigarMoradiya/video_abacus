// QUICK ADDING ON ROD 1 — hosted by Zip & Dash, a deliberately different cast from Bo & Pip
// (the bright daytime basics trio) and from Blaze & Spark (the Math Heroes superheroes). A
// dark "night dojo" theme, because the two Math Heroes reels' night sky read well and these
// two reels (adding + subtracting on rod 1) sit right next to them in the arithmetic part of
// the series — but NEW characters and a NEW backdrop (NightDojoWorld), not a reuse of HeroHQ.
//
// Four examples, all genuinely "it just fits" — no complement/friend trick, because that
// trick is exactly what the Math Heroes reels exist to pay off:
//   1 + 2 = 3   lower beads only
//   2 + 2 = 4   lower beads only
//   2 + 5 = 7   the upper bead alone, lower beads untouched
//   6 + 3 = 9   the upper bead is already down; the lower beads still have room
//
// The rod resets to empty between examples — each transition line ("Let's try another!" etc)
// is the beat where that reset plays out on screen, so no cut ever feels abrupt.
//
// Timing from public/audio/short_video_adding_rod1/short_video_adding_rod1.phrases.json,
// aligned from docs/reel_quicksum_lines.txt. 15 phrases, ~58.7s, 97.4% word match. One word
// ("Kids") had its end trimmed after the aligner absorbed a real pause into it — same bug
// class caught on every prior reel's audio, fixed before building on it.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/adding_rod1.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Ninja, type NinjaMood } from "../components/mascots/Ninja";
import { NightDojoWorld } from "../components/mascots/NightDojoWorld";
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
export const AUDIO_SEC = 58.671;
export const FPS = 30;
export const ADDING_ROD1_DURATION = sec(AUDIO_SEC, FPS);

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
 *  window, constant at `to` after `end`. Same generic helper as the Finger/Counting reels. */
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

// the worked-sum card, positioned beside the abacus, with plenty of clearance below the
// abacus (mascots) and above (the "QUICK ADDING!" title only shows at p0, long before this).
const CARD_X = ABX_LEFT + ABX_W + 34;
const CARD_Y = ABX_TOP + ABX_H * 0.1;
const CELEBRATE_X = CARD_X + 150;
const CELEBRATE_Y = CARD_Y + 190;

// each example's answer reveals at the EXACT frame the narration says the word — not just
// whenever the card appears. Timestamps read off the aligned word-level JSON.
const ANS1_AT = sec(9.54, FPS);
const ANS2_AT = sec(18.42, FPS);
const ANS3_AT = sec(27.48, FPS);
const ANS4_AT = sec(39.52, FPS);
// the tip's two tags land exactly on the words they name, not on an arbitrary offset from
// the phrase start — "lower" at 43.86s, "upper" at 46.74s, read off the word-level JSON.
const TIP_LOWER_AT = sec(43.86, FPS);
const TIP_UPPER_AT = sec(46.74, FPS);

type CardState = { a: number; b: number; answer: number; showA: number; showB: number; revealAnswer: number };

// a single Celebration burst is done in ~1.15s (34 frames), which left the screen looking
// "stopped" for the rest of a line while the sum just sat there. Spacing repeat bursts
// every 26 frames (with enough overlap that one is always mid-flight) keeps it sparkling
// continuously from the moment the answer lands until the script moves on.
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
  { frame: P(12, "start"), file: "ninja_reset.mp3", vol: 0.45 },
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

export const ShortAddingRod1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  // ---------------------------------------------------------------- the rod
  let value = 0;
  let from = 0;
  let settle = 1;

  if (p === 1) {
    value = 1; from = 1; settle = 1;
  } else if (p === 2) {
    const d = moveDemo(frame, P(2, "start"), P(2, "end"), 1, 3);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 3) {
    const d = moveDemo(frame, P(3, "start"), P(3, "start") + RESET_FRAMES, 3, 0);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 4) {
    value = 2; from = 2; settle = 1;
  } else if (p === 5) {
    const d = moveDemo(frame, P(5, "start"), P(5, "end"), 2, 4);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 6) {
    const d = moveDemo(frame, P(6, "start"), P(6, "start") + RESET_FRAMES, 4, 0);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 7) {
    value = 2; from = 2; settle = 1;
  } else if (p === 8) {
    const d = moveDemo(frame, P(8, "start"), P(8, "end"), 2, 7);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 9) {
    const d = moveDemo(frame, P(9, "start"), P(9, "start") + RESET_FRAMES, 7, 0);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 10) {
    value = 6; from = 6; settle = 1;
  } else if (p === 11) {
    const d = moveDemo(frame, P(11, "start"), P(11, "end"), 6, 9);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 12) {
    // the tip isn't about nine specifically — the rod resets to empty here so this beat
    // reads as its own thing, not a frozen continuation of example 4.
    const d = moveDemo(frame, P(12, "start"), P(12, "start") + RESET_FRAMES, 9, 0);
    value = d.to; from = d.from; settle = d.settle;
  } else if (p === 13) {
    value = 0; from = 0; settle = 1;
  }

  const rods: RodState[] = [{ value, from, focus: 1, chipLower: true, chipUpper: true, placeName: "ones" }];
  const showAbacus = p <= 13;

  // ---------------------------------------------------------------- the worked-sum card
  const card =
    cardFor(frame, p, 1, 2, 1, 2, 3, ANS1_AT) ??
    cardFor(frame, p, 4, 5, 2, 2, 4, ANS2_AT) ??
    cardFor(frame, p, 7, 8, 2, 5, 7, ANS3_AT) ??
    cardFor(frame, p, 10, 11, 6, 3, 9, ANS4_AT);

  // the tip beat gets its OWN visual — two tags arriving in the same order the words say
  // them, in the sum card's usual spot — so it doesn't just look like example 4 holding
  // still, and the closing line (all confetti, no tags) doesn't look like the tip either.
  const tag1In = interpolate(frame, [TIP_LOWER_AT, TIP_LOWER_AT + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tag2In = interpolate(frame, [TIP_UPPER_AT, TIP_UPPER_AT + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tipT = frame / fps;

  // crackers keep sparkling from the instant an answer lands until the script actually
  // moves on to the next line — a single ~1.15s burst left dead air for the rest of the
  // phrase, which read as "the animation just stopped".
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
    <AbsoluteFill style={{ background: "#251B54" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${introZoom})`, transformOrigin: "50% 45%" }}>
        <NightDojoWorld width={W} height={H} frame={frame} fps={fps} />

        {p === 0 && (
          <div style={{ position: "absolute", top: H * 0.06, left: 0, width: W, textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 64,
                color: "#FFF6D8",
                textShadow: "0 6px 0 rgba(0,0,0,0.35)",
                transform: `scale(${interpolate(frame, [0, 8, 14], [0.3, 1.16, 1], { extrapolateRight: "clamp" })})`,
              }}
            >
              QUICK ADDING!
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
                color: "#D6316B",
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

        {/* the spotlight — background and ninjas dim the moment a worked sum OR the tip's
            tags are on screen, so the card (and the abacus alongside it, both still lit) are
            the only thing the eye can land on. Also covers the tip beat (p12) — that card
            was missed the first time this was built and stayed at full brightness. */}
        {(card || p === 12) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(4,2,16,0.62)",
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
              {/* the tip's own arrows — the rod stays empty here (no bead actually moves),
                  these just point at WHERE each kind of bead would go, one per tag, timed
                  to match. `settle=0` pins the arrow at full opacity instead of animating
                  it toward completion. */}
              {p === 12 && tag1In > 0.05 && (
                <BeadArrow box={ABX_BOX} rod={0} from={0} to={1} settle={0} />
              )}
              {p === 12 && tag2In > 0.05 && (
                <BeadArrow box={ABX_BOX} rod={0} from={0} to={5} settle={0} />
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
            operator="+"
            answer={card.answer}
            showA={card.showA}
            showB={card.showB}
            revealAnswer={card.revealAnswer}
            accent="#D6316B"
            t={frame / fps}
          />
        )}

        {p === 12 && (() => {
          const glow = 0.55 + Math.sin(tipT * 3.2) * 0.35;
          return (
            <div style={{ position: "absolute", left: CARD_X, top: CARD_Y, width: 280, display: "flex", flexDirection: "column", gap: 26 }}>
              <div
                style={{
                  background: "#FFF8E8",
                  border: "6px solid #D6316B",
                  borderRadius: 30,
                  padding: "22px 26px",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 38,
                  color: "#1B1440",
                  opacity: tag1In,
                  transform: `scale(${0.7 + tag1In * 0.3}) translateX(${(1 - tag1In) * 30}px)`,
                  transformOrigin: "left center",
                  boxShadow: `0 10px 0 rgba(0,0,0,0.28), 0 0 0 10px rgba(214,49,107,${glow * 0.28 * tag1In})`,
                }}
              >
                1st lower bead
              </div>
              <div
                style={{
                  background: "#FFF8E8",
                  border: "6px solid #D6316B",
                  borderRadius: 30,
                  padding: "22px 26px",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 38,
                  color: "#1B1440",
                  opacity: tag2In,
                  transform: `scale(${0.7 + tag2In * 0.3}) translateX(${(1 - tag2In) * 30}px)`,
                  transformOrigin: "left center",
                  boxShadow: `0 10px 0 rgba(0,0,0,0.28), 0 0 0 10px rgba(214,49,107,${glow * 0.28 * tag2In})`,
                }}
              >
                2nd upper bead
              </div>
            </div>
          );
        })()}
      </div>

      {p !== 14 && (
        <Caption track={track} frame={frame} ink="#1B1440" accent="#D6316B" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
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
            background: "rgba(10,8,30,0.9)",
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

      <Audio src={staticFile("audio/short_video_adding_rod1/short_video_adding_rod1.mp3")} />
    </AbsoluteFill>
  );
};
