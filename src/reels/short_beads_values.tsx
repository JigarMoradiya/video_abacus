// BEAD VALUES — the first of the foundational short reels (recorded and built after Math
// Heroes 1 & 2, but first in the actual teaching sequence: bead values, finger technique,
// counting 1-10, quick add/subtract on one rod, THEN the two Math Heroes tricks). Hosted by
// the app's own icon mascots, Bo (blue) and Pip (purple) — no superhero framing, this is
// direct teaching, so there's no "alert" prop and no trick to solve. The abacus itself is
// the star: a real 3-rod (ones/tens/hundreds) display using the SAME Abacus component and
// chip/count features the numbered episodes already use, not a reinvention.
//
// Timing from public/audio/short_video_beads/short_video_beads.phrases.json, aligned from
// docs/reel_beads_lines.txt. 8 phrases, ~46.4s, 98.8% word match. One word ("Ones,") had its
// end timestamp trimmed after the aligner absorbed a genuine recording pause into it — the
// same class of bug caught in both Math Heroes reels, fixed before building on it.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/beads.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Mascot, type MascotMood } from "../components/mascots/Mascot";
import { BeadsWorld } from "../components/mascots/BeadsWorld";
import { Abacus, type RodState } from "../components/Abacus";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { KID_FONT } from "../lib/fonts";
import { ROD_DIM, ROD_PITCH, FRAME_LW, ABACUS_INNER_H } from "../data/tokens";
import { BrandBadge, PoweredBy } from "../components/Brand";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 46.367313;
export const FPS = 30;
export const BEADS_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

// The abacus's own box — sized up from the first pass (0.85 -> 0.98) since there's real
// spare room in this reel (no alert card competing for space like the Math Heroes reels),
// and nudged up slightly to make room for it. Computed explicitly (not guessed) so the logo
// badge below can be placed against the frame's own actual corner.
const ABACUS_SCALE = 0.98;
const ABACUS_W = (3 * ROD_PITCH + FRAME_LW * 2) * ABACUS_SCALE;
const ABACUS_H = (ABACUS_INNER_H + FRAME_LW * 2) * ABACUS_SCALE;
const ABACUS_TOP = H * 0.27;
const ABACUS_LEFT = W / 2 - ABACUS_W / 2;

/**
 * The demo every rod uses: 0 (nothing shown) -> 3 (three lower beads, "worth one each") -> 5
 * (heaven bead, "worth five"). Two phases across a window [aStart, split, bEnd] — for the
 * ones rod that window spans TWO phrases (p2 talks through phase 1, p3 through phase 2); for
 * tens and hundreds it's a single longer phrase split down the middle, same idea as the bead
 * sequencing in the Math Heroes reels.
 */
const demoPhase = (frame: number, aStart: number, split: number, bEnd: number): { from: number; to: number; settle: number } => {
  if (frame < aStart) return { from: 0, to: 0, settle: 1 };
  if (frame < split) {
    return { from: 0, to: 3, settle: interpolate(frame, [aStart, split], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) };
  }
  if (frame < bEnd) {
    return { from: 3, to: 5, settle: interpolate(frame, [split, bEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) };
  }
  return { from: 5, to: 5, settle: 1 };
};

const ONES_A = sec(PHRASES[2].start, FPS);
const ONES_SPLIT = sec(PHRASES[3].start, FPS);
const ONES_B = sec(PHRASES[3].end, FPS);

const TENS_A = sec(PHRASES[4].start, FPS);
const TENS_SPLIT = TENS_A + Math.round((sec(PHRASES[4].end, FPS) - TENS_A) * 0.5);
const TENS_B = sec(PHRASES[4].end, FPS);

const HUNDREDS_A = sec(PHRASES[5].start, FPS);
const HUNDREDS_SPLIT = HUNDREDS_A + Math.round((sec(PHRASES[5].end, FPS) - HUNDREDS_A) * 0.5);
const HUNDREDS_B = sec(PHRASES[5].end, FPS);

const STORE_START = sec(PHRASES[7].start, FPS);
const STORE_FRAMES = 92;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: sec(PHRASES[0].start, FPS), file: "bead_chime_lo.mp3", vol: 0.5 },
  { frame: ONES_SPLIT, file: "bead_upper_swap.mp3", vol: 0.6 },
  { frame: TENS_SPLIT, file: "bead_upper_swap.mp3", vol: 0.6 },
  { frame: HUNDREDS_SPLIT, file: "bead_upper_swap.mp3", vol: 0.6 },
  { frame: sec(PHRASES[6].start, FPS), file: "bead_recap_sting.mp3", vol: 0.55 },
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
const CAPTION_KEYWORDS = ["bead", "beads", "ones", "tens", "hundreds", "upper", "lower", "rod", "worth"];

export const ShortBeadsValues: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  // ---------------------------------------------------------------- which rod is on stage
  const focusRod: 0 | 1 | 2 | null = p === 2 || p === 3 ? 0 : p === 4 ? 1 : p === 5 ? 2 : null;

  const onesDemo = demoPhase(frame, ONES_A, ONES_SPLIT, ONES_B);
  const tensDemo = demoPhase(frame, TENS_A, TENS_SPLIT, TENS_B);
  const hundredsDemo = demoPhase(frame, HUNDREDS_A, HUNDREDS_SPLIT, HUNDREDS_B);
  const RECAP_AT = sec(PHRASES[6].start, FPS);
  const recapSettle = interpolate(frame, [RECAP_AT, RECAP_AT + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tensPhase1 = frame < TENS_SPLIT;
  const hundredsPhase1 = frame < HUNDREDS_SPLIT;

  // Each rod RESETS to 0 once the lesson moves past it — a rod that stayed lit at 5 forever
  // was still showing its old value while the next rod was being taught. The reset borrows
  // the NEXT rod's own settle curve for its collapse (both are driven by the same shared
  // `settle` value below, so they animate in lockstep with no conflict), then holds flat at
  // 0 once that curve resets for the next rod's own upper-bead phase. The recap (p6) then
  // reveals every rod back to 5 together, using its own settle.
  // The recap maxes every rod out at 9 (heaven bead AND all four lower beads), not just the
  // heaven bead alone — "bigger and bigger" lands harder showing the single biggest number
  // one rod can hold, with the "999" callout reading off the three maxed rods together.
  const ones: RodState = {
    value: p <= 3 ? onesDemo.to : p === 6 ? 9 : 0,
    from: p <= 3 ? onesDemo.from : p === 4 && tensPhase1 ? 5 : p === 6 ? 0 : 0,
    focus: focusRod === null ? 1 : focusRod === 0 ? 1 : ROD_DIM,
    // p6's recap needs the name/worth chip on EVERY rod at once — "Ones, tens, hundreds" is
    // naming all three together, not just whichever one was last focused.
    chipLower: (focusRod === 0 && frame < ONES_SPLIT) || p === 6,
    chipUpper: (focusRod === 0 && frame >= ONES_SPLIT) || p === 6,
    placeName: "ones",
  };
  const tens: RodState = {
    value: p === 4 ? tensDemo.to : p <= 3 ? 0 : p === 6 ? 9 : 0,
    from: p === 4 ? tensDemo.from : p === 5 && hundredsPhase1 ? 5 : p === 6 ? 0 : 0,
    focus: focusRod === null ? 1 : focusRod === 1 ? 1 : ROD_DIM,
    chipLower: (focusRod === 1 && frame < TENS_SPLIT) || p === 6,
    chipUpper: (focusRod === 1 && frame >= TENS_SPLIT) || p === 6,
    placeName: "tens",
  };
  const hundreds: RodState = {
    value: p === 5 ? hundredsDemo.to : p <= 4 ? 0 : p === 6 ? 9 : 5,
    from: p === 5 ? hundredsDemo.from : p <= 4 ? 0 : p === 6 ? 5 : 5,
    focus: focusRod === null ? 1 : focusRod === 2 ? 1 : ROD_DIM,
    chipLower: (focusRod === 2 && frame < HUNDREDS_SPLIT) || p === 6,
    chipUpper: (focusRod === 2 && frame >= HUNDREDS_SPLIT) || p === 6,
    placeName: "hundreds",
  };
  // rod order is [ones, tens, hundreds] — index 0 is rightmost, matching every other episode
  const rods: RodState[] = [ones, tens, hundreds];
  const settle =
    p <= 3 ? onesDemo.settle :
    p === 4 ? tensDemo.settle :
    p === 5 ? hundredsDemo.settle :
    p === 6 ? recapSettle :
    1;

  // ---------------------------------------------------------------- Bo & Pip
  const boMood: MascotMood =
    p === 0 ? "wave" :
    p === 1 ? "point" :
    p === 2 || p === 3 ? "watch" :
    p === 4 || p === 5 ? "point" :
    p === 6 ? "cheer" :
    "sit";
  const pipMood: MascotMood =
    p === 0 ? "wave" :
    p === 1 ? "point" :
    p === 2 || p === 3 ? "watch" :
    p === 4 || p === 5 ? "think" :
    p === 6 ? "cheer" :
    "sit";

  const mascotY = H * 0.68;
  const boX = W * 0.28;
  const pipX = W * 0.72;

  const introZoom = p === 0
    ? interpolate(frame, [0, sec(PHRASES[0].end, FPS)], [1, 1.06], { extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill style={{ background: "#FFE7C2" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${introZoom})`, transformOrigin: "50% 45%" }}>
        <BeadsWorld width={W} height={H} frame={frame} fps={fps} />

        {p === 0 && (
          <div
            style={{
              position: "absolute",
              top: H * 0.08,
              left: 0,
              width: W,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 74,
                color: "#8A3B00",
                textShadow: "0 6px 0 rgba(0,0,0,0.12)",
              }}
            >
              BEAD VALUES
            </span>
          </div>
        )}

        {/* Every character below is an SVG <g>, not a standalone element — same reason every
            Fox/Hero/Wheel in this series sits inside its own <svg> wrapper. */}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <Mascot x={boX} y={mascotY} scale={1.05} mood={boMood} name="bo" progress={beatProgress} frame={frame} fps={fps} facing={1} />
          <Mascot x={pipX} y={mascotY} scale={0.92} mood={pipMood} name="pip" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
        </svg>

        {p === 6 && (
          <div
            style={{
              position: "absolute",
              top: H * 0.16,
              left: 0,
              width: W,
              textAlign: "center",
              opacity: recapSettle,
              transform: `scale(${0.85 + recapSettle * 0.15})`,
            }}
          >
            <span
              style={{
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 96,
                color: "#8A3B00",
                textShadow: "0 6px 0 rgba(0,0,0,0.12)",
              }}
            >
              999
            </span>
          </div>
        )}

        {p !== 7 && (
          <div style={{ position: "absolute", left: ABACUS_LEFT, top: ABACUS_TOP }}>
            <Abacus
              rods={rods}
              settle={settle}
              scale={ABACUS_SCALE}
              colorOnArrival
              count={focusRod !== null ? "active" : null}
              countRod={focusRod ?? undefined}
            />
          </div>
        )}
      </div>

      {/* the app icon — ONLY on the recap (p6), sitting directly against "999"'s own top edge
          (a small gap, not a screen-top placement with empty space between them), and bigger. */}
      {p === 6 && (
        <Img
          src={staticFile("brand/app_icon.png")}
          style={{
            position: "absolute",
            left: W / 2 - 48,
            top: H * 0.16 - 12 - 96,
            width: 96,
            height: 96,
            borderRadius: 22,
            boxShadow: "0 5px 0 rgba(0,0,0,0.18)",
            opacity: recapSettle,
            transform: `scale(${0.85 + recapSettle * 0.15})`,
          }}
        />
      )}

      {p !== 7 && (
        <Caption
          track={track}
          frame={frame}
          ink="#1A1A2E"
          accent="#E8432C"
          keywords={CAPTION_KEYWORDS}
          layout={REEL_LAYOUT}
        />
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

      <Audio src={staticFile("audio/short_video_beads/short_video_beads.mp3")} />
    </AbsoluteFill>
  );
};
