// COUNT TO 10 — third of the foundational short reels (after Bead Values, after Which
// Finger?, before quick add/subtract on rod 1). Hosted by Bo & Pip. A two-rod abacus (ones +
// tens) is on screen the whole reel — the tens rod sits dimmed and idle until the carry beat,
// so the composition never has to jump-cut to a wider frame when ten finally shows up.
//
// Own theme (CountingWorld: mint/lemon playground, not Bead Values' orange or Which Finger?'s
// blue), own SFX (make_counting_sfx.py: a xylophone-ish count bell reused at a rising
// `playbackRate` per number instead of nine separate files, a carry whoosh, a closing
// fanfare), and its own big bouncy number badge — the abacus's built-in per-bead `count`
// labelling is built for "how many/what does this bead contribute", not for a running total
// that goes 1,2,3,4,5,6,7,8,9,10, so this reel drives its own number instead of repurposing it.
//
// Timing from public/audio/short_video_1_10/short_video_1_10.phrases.json, aligned from
// docs/reel_counting_lines.txt. 8 phrases, ~41.5s, 100% word match, no alignment anomalies.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/counting.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Mascot, type MascotMood } from "../components/mascots/Mascot";
import { CountingWorld } from "../components/mascots/CountingWorld";
import { Abacus, type RodState } from "../components/Abacus";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { KID_FONT } from "../lib/fonts";
import { ROD_DIM, ROD_PITCH, FRAME_LW, ABACUS_INNER_H, PLACE_COLORS } from "../data/tokens";
import { rodBand, type AbacusBox } from "../stage/geometry";
import { BrandBadge, PoweredBy } from "../components/Brand";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 41.482438;
export const FPS = 30;
export const COUNTING_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const ABX_SCALE = 1.0;
const ABX_W = (2 * ROD_PITCH + FRAME_LW * 2) * ABX_SCALE;
const ABX_H = (ABACUS_INNER_H + FRAME_LW * 2) * ABX_SCALE;
const ABX_LEFT = W / 2 - ABX_W / 2;
const ABX_TOP = H * 0.29;
const ABX_BOX: AbacusBox = {
  left: ABX_LEFT,
  top: ABX_TOP,
  w: ABX_W,
  h: ABX_H,
  innerLeft: ABX_LEFT + FRAME_LW * ABX_SCALE,
  innerTop: ABX_TOP + FRAME_LW * ABX_SCALE,
  innerW: 2 * ROD_PITCH * ABX_SCALE,
  scale: ABX_SCALE,
  rodCount: 2,
};

/** A staircase: holds at 0 until the first step, then snaps to each step's value with a
 *  short bounce as its own frame passes. Used for both the ones rod (1-4, 6-9) and the big
 *  number badge — every count is its own discrete pop, not a slide. */
const staircase = (frame: number, steps: { at: number; value: number }[], bounce = 8): { value: number; from: number; settle: number; at: number } => {
  let value = 0;
  let from = 0;
  let at = -Infinity;
  for (const s of steps) {
    if (frame >= s.at) {
      from = value;
      value = s.value;
      at = s.at;
    }
  }
  const settle = at === -Infinity ? 1 : interpolate(frame, [at, at + bounce], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { value, from, settle, at };
};

const ONES_STEPS = [
  { at: sec(3.88, FPS), value: 1 },
  { at: sec(4.94, FPS), value: 2 },
  { at: sec(6.58, FPS), value: 3 },
  { at: sec(7.56, FPS), value: 4 },
];
const ONES_STEPS_2 = [
  { at: sec(16.64, FPS), value: 6 },
  { at: sec(17.66, FPS), value: 7 },
  { at: sec(18.6, FPS), value: 8 },
  { at: sec(19.78, FPS), value: 9 },
];
const FIVE_AT = sec(14.74, FPS);
const FIVE_END = sec(15.18, FPS);
const CARRY_START = sec(28.36, FPS);
const CARRY_END = sec(30.42, FPS);

const P1A = sec(PHRASES[1].start, FPS);
const P1B = sec(PHRASES[1].end, FPS);
const P3A = sec(PHRASES[3].start, FPS);
const P3B = sec(PHRASES[3].end, FPS);
const P4A = sec(PHRASES[4].start, FPS);
const P6A = sec(PHRASES[6].start, FPS);
const STORE_START = sec(PHRASES[7].start, FPS);
const STORE_FRAMES = 100;

const BELL_RATE = (n: number) => 1 + (n - 1) * 0.07;
type SfxCue = { frame: number; file: string; vol?: number; rate?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "count_hook.mp3", vol: 0.6 },
  ...[1, 2, 3, 4].map((n, i) => ({ frame: ONES_STEPS[i].at, file: "count_bell.mp3", vol: 0.55, rate: BELL_RATE(n) })),
  { frame: FIVE_AT, file: "count_bell.mp3", vol: 0.55, rate: BELL_RATE(5) },
  ...[6, 7, 8, 9].map((n, i) => ({ frame: ONES_STEPS_2[i].at, file: "count_bell.mp3", vol: 0.55, rate: BELL_RATE(n) })),
  { frame: P4A, file: "count_full.mp3", vol: 0.55 },
  { frame: CARRY_START, file: "count_carry.mp3", vol: 0.6 },
  { frame: P6A, file: "count_fanfare.mp3", vol: 0.55 },
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
const CAPTION_KEYWORDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "bead", "beads", "rod"];

export const ShortCounting1To10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  // ---------------------------------------------------------------- the ones rod (0-9)
  let onesValue = 0;
  let onesFrom = 0;
  let onesSettle = 1;
  if (p === 1) {
    if (frame < P1B) {
      const s = staircase(frame, ONES_STEPS);
      onesValue = s.value; onesFrom = s.from; onesSettle = s.settle;
    } else {
      onesValue = 4; onesFrom = 4; onesSettle = 1;
    }
  } else if (p === 2) {
    onesValue = 5; onesFrom = 4;
    onesSettle = interpolate(frame, [P1B, FIVE_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  } else if (p === 3) {
    if (frame < P3B) {
      // staircase starts its internal count at 0, but this rod is actually arriving from 5
      // (p2's result) — only the FIRST step (0->6) needs that substituted in.
      const s = staircase(frame, ONES_STEPS_2, 8);
      onesValue = s.at === -Infinity ? 5 : s.value;
      onesFrom = s.at === -Infinity ? 5 : (s.from === 0 ? 5 : s.from);
      onesSettle = s.settle;
    } else {
      onesValue = 9; onesFrom = 9; onesSettle = 1;
    }
  } else if (p === 4) {
    onesValue = 9; onesFrom = 9; onesSettle = 1;
  } else if (p === 5) {
    onesValue = 0; onesFrom = 9;
    onesSettle = interpolate(frame, [CARRY_START, CARRY_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  } else if (p >= 6) {
    onesValue = 0; onesFrom = 0; onesSettle = 1;
  }

  // ---------------------------------------------------------------- the tens rod (idle until carry)
  let tensValue = 0;
  let tensFrom = 0;
  const tensFocused = p >= 5;
  if (p === 5) {
    tensValue = 1; tensFrom = 0;
  } else if (p >= 6) {
    tensValue = 1; tensFrom = 1;
  }
  // onesSettle already holds the right value for every phase (1 for the static holds,
  // the real interpolated fraction for 1/2/3/5) — on p5 the tens rod rides the SAME window,
  // which is safe because only one rod actually transitions per phase in this reel (the
  // collapse-through-next-rod's-settle trick from Bead Values only matters when two
  // DIFFERENT windows are involved).
  const settle = onesSettle;

  // from the moment the upper bead first moves (p2, "drop the upper bead — that's five"),
  // a worth chip appears above the rod saying what that bead is worth — and stays for the
  // rest of the reel, the same way the "1" chip below it stays once it's shown.
  const rods: RodState[] = [
    { value: onesValue, from: onesFrom, focus: 1, chipLower: true, chipUpper: p >= 2, placeName: "ones" },
    { value: tensValue, from: tensFrom, focus: tensFocused ? 1 : ROD_DIM, chipLower: true, placeName: "tens" },
  ];

  // ONLY on "Nine is the most this one rod can show!" — not the whole counting stretch.
  const onesHighlight = p === 4;
  const onesGlow = onesHighlight ? 0.5 + Math.sin((frame / fps) * 3) * 0.16 : 0;
  const onesBand = rodBand(ABX_BOX, 0);

  // ---------------------------------------------------------------- the big bouncy number
  let badgeValue = 0;
  let badgePop = 1;
  const popAt = (at: number) => 1 + Math.max(0, interpolate(frame, [at, at + 6, at + 16], [0, 0.34, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  if (p === 1) {
    const s = staircase(frame, ONES_STEPS);
    badgeValue = s.value;
    badgePop = s.at === -Infinity ? 1 : popAt(s.at);
  } else if (p === 2) {
    badgeValue = frame < FIVE_AT ? 4 : 5;
    badgePop = frame >= FIVE_AT ? popAt(FIVE_AT) : 1;
  } else if (p === 3) {
    const s = staircase(frame, ONES_STEPS_2);
    badgeValue = s.at === -Infinity ? 5 : s.value;
    badgePop = s.at === -Infinity ? 1 : popAt(s.at);
  } else if (p === 4) {
    badgeValue = 9;
  } else if (p === 5) {
    badgeValue = frame < CARRY_END ? 9 : 10;
    badgePop = frame >= CARRY_END ? popAt(CARRY_END) : 1;
  } else if (p >= 6) {
    badgeValue = 10;
  }

  // ---------------------------------------------------------------- Bo & Pip
  const boMood: MascotMood =
    p === 0 ? "wave" :
    p >= 1 && p <= 4 ? "watch" :
    p === 5 ? "point" :
    p === 6 ? "cheer" :
    "sit";
  const pipMood: MascotMood =
    p === 0 ? "wave" :
    p >= 1 && p <= 4 ? "watch" :
    p === 5 ? "point" :
    p === 6 ? "cheer" :
    "sit";

  const mascotY = H * 0.74;
  const boX = W * 0.28;
  const pipX = W * 0.72;

  const introZoom = p === 0
    ? interpolate(frame, [0, sec(PHRASES[0].end, FPS)], [1, 1.06], { extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill style={{ background: "#D3F7E4" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${introZoom})`, transformOrigin: "50% 45%" }}>
        <CountingWorld width={W} height={H} frame={frame} fps={fps} />

        {p === 0 && (
          <div style={{ position: "absolute", top: H * 0.06, left: 0, width: W, textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 68,
                color: "#1E6B45",
                textShadow: "0 6px 0 rgba(0,0,0,0.12)",
                transform: `scale(${interpolate(frame, [0, 8, 14], [0.3, 1.16, 1], { extrapolateRight: "clamp" })})`,
              }}
            >
              COUNT TO 10!
            </span>
          </div>
        )}

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <Mascot x={boX} y={mascotY} scale={1.05} mood={boMood} name="bo" progress={beatProgress} frame={frame} fps={fps} facing={1} />
          <Mascot x={pipX} y={mascotY} scale={0.92} mood={pipMood} name="pip" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
        </svg>

        <div style={{ position: "absolute", left: ABX_LEFT, top: ABX_TOP, transform: `scale(${interpolate(frame, [0, 10, 16], [0.7, 1.08, 1], { extrapolateRight: "clamp" })})`, transformOrigin: "50% 0%" }}>
          <Abacus rods={rods} settle={settle} scale={ABX_SCALE} colorOnArrival />
        </div>

        {/* the "this rod" spotlight — an outline, not a fill wash, so it frames the ones rod
            without tinting the beads it's meant to be drawing attention to. Rendered ON TOP
            of the abacus since the abacus draws its own opaque panel over anything behind it. */}
        {onesHighlight && (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <rect
              x={onesBand.x}
              y={onesBand.y}
              width={onesBand.w}
              height={onesBand.h}
              rx={22}
              fill="none"
              stroke={PLACE_COLORS[0]}
              strokeWidth={7}
              opacity={onesGlow}
            />
          </svg>
        )}

        {p >= 1 && (
          <div
            style={{
              position: "absolute",
              top: H * 0.11,
              left: 0,
              width: W,
              textAlign: "center",
              transform: `scale(${badgePop})`,
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 150,
                color: "#FF7A1A",
                textShadow: "0 8px 0 rgba(0,0,0,0.15)",
              }}
            >
              {badgeValue}
            </span>
          </div>
        )}
      </div>

      {p !== 7 && (
        <Caption track={track} frame={frame} ink="#173B29" accent="#FF7A1A" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
      )}

      {p === 7 && (
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
            background: "rgba(14,46,30,0.86)",
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
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol ?? 1} playbackRate={c.rate ?? 1} />
        </Sequence>
      ))}

      <Audio src={staticFile("audio/short_video_1_10/short_video_1_10.mp3")} />
    </AbsoluteFill>
  );
};
