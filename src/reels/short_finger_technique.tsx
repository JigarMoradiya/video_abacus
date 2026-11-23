// WHICH FINGER? — second of the foundational short reels (after Bead Values, before
// Counting 1-10). Hosted by Bo & Pip, same as Bead Values — no superhero framing here either.
//
// The rule, verbatim from the app's own tour: the finger is decided by DIRECTION, never by
// which bead. Thumb for UP (lower beads rising, or the upper bead coming back up on a
// subtraction). Index finger for DOWN (the upper bead coming down, or lower beads dropping
// on a subtraction). src/components/FingerHand.tsx already draws this convention for the
// numbered episodes, but it's a flat cartoon hand — this reel gets its OWN, more realistic
// hand (src/components/mascots/RealHand.tsx): gradient-shaded, tapered fingers, visible
// knuckle creases, a sleeve cuff. Same locked rule underneath, different artwork entirely.
//
// Timing from public/audio/short_video_finger/short_video_finger.phrases.json, aligned from
// docs/reel_finger_lines.txt. 11 phrases, ~40.4s, 98.7% word match. One word ("is", phrase 7)
// had its start trimmed after the aligner absorbed a real recording pause into it — same bug
// class caught on every prior reel's audio, fixed before building on it.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/finger.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Mascot, type MascotMood } from "../components/mascots/Mascot";
import { FingerWorld } from "../components/mascots/FingerWorld";
import { Abacus, type RodState } from "../components/Abacus";
import { RealHand, HAND_DIGIT_TIP, type Digit } from "../components/mascots/RealHand";
import { BeadArrow } from "../stage/BeadArrow";
import { rodX, upperBeadY, lowerBeadY, type AbacusBox } from "../stage/geometry";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { KID_FONT } from "../lib/fonts";
import { ROD_PITCH, FRAME_LW, ABACUS_INNER_H } from "../data/tokens";
import { BrandBadge, PoweredBy } from "../components/Brand";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 40.359125;
export const FPS = 30;
export const FINGER_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const ABX_SCALE = 1.08;
const ABX_W = (1 * ROD_PITCH + FRAME_LW * 2) * ABX_SCALE;
const ABX_H = (ABACUS_INNER_H + FRAME_LW * 2) * ABX_SCALE;
const ABX_LEFT = W / 2 - ABX_W / 2;
const ABX_TOP = H * 0.26;
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

/** Same anchor arithmetic as stage/geometry's handAnchor, but reading OUR OWN measured tip
 *  offsets (HAND_DIGIT_TIP) instead of FingerHand's — the two hands are drawn differently, so
 *  a shared constant would put this hand's tip in the wrong place. */
const handAnchorReal = (
  box: AbacusBox,
  heaven: boolean,
  direction: "up" | "down",
  fromValue: number,
  toValue: number,
  digit: Digit,
  handScale = box.scale
): number => {
  const up = direction === "up";
  const beadY = heaven
    ? upperBeadY(box, up)
    : lowerBeadY(box, up ? (fromValue % 5) + 1.5 : (toValue % 5) + 0.5);
  return beadY - HAND_DIGIT_TIP[digit].dy * handScale;
};

/** One bead move: constant at `from` before `start`, interpolating settle across the
 *  window, constant at `to` after `end`. Generic version of Bead Values' demoPhase — this
 *  reel's moves aren't all 0->3->5, so the from/to are parameters instead of baked in. */
const moveDemo = (
  frame: number,
  start: number,
  end: number,
  from: number,
  to: number
): { from: number; to: number; settle: number } => {
  if (frame < start) return { from, to: from, settle: 1 };
  if (frame < end) {
    return { from, to, settle: interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) };
  }
  return { from: to, to, settle: 1 };
};

const P2A = sec(PHRASES[2].start, FPS);
const P2B = sec(PHRASES[2].end, FPS);
const P3A = sec(PHRASES[3].start, FPS);
const P3B = sec(PHRASES[3].end, FPS);
const P4A = sec(PHRASES[4].start, FPS);
const P4B = sec(PHRASES[4].end, FPS);
const P5A = sec(PHRASES[5].start, FPS);
const P5B = sec(PHRASES[5].end, FPS);
const P6A = sec(PHRASES[6].start, FPS);
const P6B = sec(PHRASES[6].end, FPS);
// between "down," (ends 26.28) and "thumb" (starts 26.78) — the natural cut where the line
// hands off from the lower-bead half of the rule to the upper-bead half.
const P6_SPLIT = sec(26.53, FPS);

const P7A = sec(PHRASES[7].start, FPS);
const P8A = sec(PHRASES[8].start, FPS);
const P9A = sec(PHRASES[9].start, FPS);
const STORE_START = sec(PHRASES[10].start, FPS);
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  // the hook has to make noise the instant it makes noise on screen — both land at frame 0.
  { frame: 0, file: "finger_hook_pop.mp3", vol: 0.65 },
  { frame: sec(PHRASES[0].start, FPS) + 6, file: "finger_chime.mp3", vol: 0.45 },
  { frame: P3A, file: "finger_push.mp3", vol: 0.6 },
  { frame: P5A, file: "finger_push.mp3", vol: 0.6 },
  { frame: P6A, file: "finger_push.mp3", vol: 0.6 },
  { frame: P6_SPLIT, file: "finger_push.mp3", vol: 0.6 },
  { frame: P7A, file: "finger_recap_ding.mp3", vol: 0.55 },
  { frame: P8A, file: "finger_recap_ding.mp3", vol: 0.55 },
  // "Every single time!" — both rules confirmed together, so it gets both dings, layered.
  { frame: P9A, file: "finger_recap_ding.mp3", vol: 0.5 },
  { frame: P9A + 5, file: "finger_recap_ding.mp3", vol: 0.5 },
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
const CAPTION_KEYWORDS = ["thumb", "index", "finger", "up", "down", "bead", "beads"];

/** A recap chip: big UP/DOWN word, a small RealHand icon underneath, the digit's name. Used
 *  only in the two rule-recap phrases and the "every single time" beat — not worth its own
 *  file for three call sites in one reel. */
const RuleCard: React.FC<{
  x: number;
  label: "UP" | "DOWN";
  digit: Digit;
  active: boolean;
  frame: number;
  fps: number;
}> = ({ x, label, digit, active, frame, fps }) => {
  const glow = interpolate(active ? 1 : 0, [0, 1], [0.5, 1]);
  // a slow continuous breathing pulse while active — a card that just sits there fully lit
  // for a second and a half reads as frozen; this keeps real motion on screen the whole time.
  const pulse = active ? 1 + Math.sin((frame / fps) * 3.2) * 0.025 : 1;
  return (
    <g transform={`translate(${x},0) scale(${pulse})`} opacity={glow}>
      <rect
        x={-190}
        y={-210}
        width={380}
        height={420}
        rx={40}
        fill={active ? "#FFC93C" : "#FFE3A0"}
        stroke="#8A5A00"
        strokeWidth={active ? 8 : 5}
      />
      <text x={0} y={-140} textAnchor="middle" fill="#8A3B00" fontSize={64} fontWeight={700} fontFamily={KID_FONT}>
        {label}
      </text>
      <g transform={`translate(-124,6) scale(0.62)`}>
        <RealHand digit={digit} direction={label === "UP" ? "up" : "down"} x={0} y={0} showArrow={false} showLabel={false} />
      </g>
      <text x={0} y={175} textAnchor="middle" fill="#8A3B00" fontSize={34} fontWeight={700} fontFamily={KID_FONT}>
        {digit === "thumb" ? "thumb" : "index finger"}
      </text>
    </g>
  );
};

export const ShortFingerTechnique: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  // ---------------------------------------------------------------- the single rod's state
  let rodFrom = 0;
  let rodValue = 0;
  let rodSettle = 1;
  let digit: Digit = "thumb";
  let direction: "up" | "down" = "up";
  let heaven = false;

  if (p === 2) {
    rodFrom = 0; rodValue = 0; rodSettle = 1;
    digit = "thumb"; direction = "up"; heaven = false;
  } else if (p === 3) {
    const d = moveDemo(frame, P3A, P3B, 0, 1);
    rodFrom = d.from; rodValue = d.to; rodSettle = d.settle;
    digit = "thumb"; direction = "up"; heaven = false;
  } else if (p === 4) {
    rodFrom = 1; rodValue = 1; rodSettle = 1;
    digit = "index"; direction = "down"; heaven = true;
  } else if (p === 5) {
    const d = moveDemo(frame, P5A, P5B, 1, 6);
    rodFrom = d.from; rodValue = d.to; rodSettle = d.settle;
    digit = "index"; direction = "down"; heaven = true;
  } else if (p === 6) {
    if (frame < P6_SPLIT) {
      const d = moveDemo(frame, P6A, P6_SPLIT, 6, 5);
      rodFrom = d.from; rodValue = d.to; rodSettle = d.settle;
      digit = "index"; direction = "down"; heaven = false;
    } else {
      const d = moveDemo(frame, P6_SPLIT, P6B, 5, 0);
      rodFrom = d.from; rodValue = d.to; rodSettle = d.settle;
      digit = "thumb"; direction = "up"; heaven = true;
    }
  }

  const rods: RodState[] = [{ value: rodValue, from: rodFrom, focus: 1 }];
  // The abacus is the concrete thing this whole reel is about — it sits on screen from
  // frame 0 (a bouncy entrance, not a static appearance) instead of leaving the hook with
  // nothing but two characters over empty background for six seconds. The HAND only joins
  // once the lesson actually starts pointing at it (p2).
  const showAbacusBox = p <= 6;
  const showHandLayer = p >= 2 && p <= 6;
  const handScale = ABX_SCALE * 0.72;
  const handY = handAnchorReal(ABX_BOX, heaven, direction, rodFrom, rodValue, digit, handScale);
  const handX = rodX(ABX_BOX, 0);
  const abacusPop = interpolate(frame, [0, 10, 16], [0.7, 1.08, 1], { extrapolateRight: "clamp" });
  const castPop = interpolate(frame, [0, 9, 15], [0.5, 1.12, 1], { extrapolateRight: "clamp" });

  // ---------------------------------------------------------------- Bo & Pip
  const boMood: MascotMood =
    p === 0 ? "wave" :
    p === 1 ? "point" :
    p >= 2 && p <= 6 ? "watch" :
    p === 7 ? "point" :
    p === 9 ? "cheer" :
    "sit";
  const pipMood: MascotMood =
    p === 0 ? "wave" :
    p === 1 ? "point" :
    p >= 2 && p <= 6 ? "watch" :
    p === 8 ? "point" :
    p === 9 ? "cheer" :
    "sit";

  const mascotY = H * 0.68;
  const boX = W * 0.28;
  const pipX = W * 0.72;

  const introZoom = p === 0
    ? interpolate(frame, [0, sec(PHRASES[0].end, FPS)], [1, 1.06], { extrapolateRight: "clamp" })
    : 1;

  const recapAt = p === 7 ? 1 : p === 8 ? 2 : p === 9 ? 3 : 0;
  const logoPop = interpolate(frame, [P7A, P7A + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#CFE8FF" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${introZoom})`, transformOrigin: "50% 45%" }}>
        <FingerWorld width={W} height={H} frame={frame} fps={fps} />

        {p === 0 && (
          <div style={{ position: "absolute", top: H * 0.06, left: 0, width: W, textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 68,
                color: "#1B3B6B",
                textShadow: "0 6px 0 rgba(0,0,0,0.12)",
                transform: `scale(${interpolate(frame, [0, 8, 14], [0.3, 1.16, 1], { extrapolateRight: "clamp" })})`,
              }}
            >
              WHICH FINGER?
            </span>
          </div>
        )}

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <g transform={`translate(${boX},${mascotY}) scale(${castPop}) translate(${-boX},${-mascotY})`}>
            <Mascot x={boX} y={mascotY} scale={1.05} mood={boMood} name="bo" progress={beatProgress} frame={frame} fps={fps} facing={1} />
          </g>
          <g transform={`translate(${pipX},${mascotY}) scale(${castPop}) translate(${-pipX},${-mascotY})`}>
            <Mascot x={pipX} y={mascotY} scale={0.92} mood={pipMood} name="pip" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
          </g>
        </svg>

        {showAbacusBox && (
          <>
            <div
              style={{
                position: "absolute",
                left: ABX_LEFT,
                top: ABX_TOP,
                transform: `scale(${abacusPop})`,
                transformOrigin: "50% 0%",
              }}
            >
              <Abacus rods={rods} settle={rodSettle} scale={ABX_SCALE} colorOnArrival />
            </div>
            {showHandLayer && (
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <BeadArrow box={ABX_BOX} rod={0} from={rodFrom} to={rodValue} settle={rodSettle} />
                <RealHand digit={digit} direction={direction} x={handX} y={handY} scale={handScale} showArrow={false} />
              </svg>
            )}
          </>
        )}

        {recapAt > 0 && (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <g transform={`translate(${W / 2},${H * 0.42})`}>
              <RuleCard x={-200} label="UP" digit="thumb" active={recapAt === 1 || recapAt === 3} frame={frame} fps={fps} />
              <RuleCard x={200} label="DOWN" digit="index" active={recapAt === 2 || recapAt === 3} frame={frame} fps={fps} />
            </g>
          </svg>
        )}

        {/* the app icon, sitting just above the UP/DOWN pair — same "bake the brand into the
            content" treatment the Bead Values reel's "999" recap uses. */}
        {recapAt > 0 && (
          <Img
            src={staticFile("brand/app_icon.png")}
            style={{
              position: "absolute",
              left: W / 2 - 58,
              top: H * 0.42 - 210 - 34 - 116,
              width: 116,
              height: 116,
              borderRadius: 26,
              boxShadow: "0 5px 0 rgba(0,0,0,0.18)",
              opacity: logoPop,
              transform: `scale(${0.85 + logoPop * 0.15})`,
            }}
          />
        )}
      </div>

      {p !== 10 && (
        <Caption track={track} frame={frame} ink="#1A1A2E" accent="#E8432C" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
      )}

      {p === 10 && (
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
            background: "rgba(40,24,10,0.86)",
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

      <Audio src={staticFile("audio/short_video_finger/short_video_finger.mp3")} />
    </AbsoluteFill>
  );
};
