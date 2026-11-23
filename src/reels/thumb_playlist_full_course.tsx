// One-off still for the "Full Course" YouTube playlist cover. Reuses the real Abacus and
// FingerHand components exactly as the episodes do — nothing here is hand-drawn or a video
// crop, it is the same code that renders E01-E10, just posed for a thumbnail.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Abacus, type RodState } from "../components/Abacus";
import { FingerHand } from "../components/FingerHand";
import { RIG_WOOD } from "../data/theme";
import { ROD_PITCH, FRAME_LW, HEAVEN_H, BEAM_H, BEAD_H } from "../data/tokens";

export const PLAYLIST_THUMB_W = 1000;
export const PLAYLIST_THUMB_H = 700;

const SCALE = 1;
const LEFT = 20;
const TOP = 110;

// Ones rod (index 0, rightmost) shows 2 already settled at the beam — the thumb's job is
// to push the remaining 2 (still at the bottom) up next. An arrow next to beads that have
// already arrived makes no sense; it belongs on the beads still waiting to move.
const rods: RodState[] = [
  { value: 2, focus: 1 },
  { value: 0, focus: 0.35 },
  { value: 0, focus: 0.35 },
  { value: 0, focus: 0.35 },
  { value: 0, focus: 0.35 },
];

const ACTIVE_INDEX = 0;
const n = rods.length;
const col = n - 1 - ACTIVE_INDEX;
const cxLocal = col * ROD_PITCH + ROD_PITCH / 2;

// Addition, lower beads moving up -> thumb (see FingerHand.tsx's own rule table).
// Anchor on the BOTTOM-most still-down bead (slot 3 of 0..3) — the thumb pushes from
// underneath, and the arrow's length (2 bead-heights) covers both beads it's about to move.
const TARGET_SLOT = 3;
const beadTopLocal = HEAVEN_H + BEAM_H + (TARGET_SLOT + 1) * BEAD_H; // "down" resting position
const beadCenterYLocal = beadTopLocal + BEAD_H / 2;

const anchorX = LEFT + (FRAME_LW + cxLocal) * SCALE;
const anchorY = TOP + (FRAME_LW + beadCenterYLocal) * SCALE;
const ARROW_LEN = BEAD_H * 2 * SCALE;

export const ThumbPlaylistFullCourse: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "transparent" }}>
    <div style={{ position: "absolute", left: LEFT, top: TOP }}>
      <Abacus rods={rods} scale={SCALE} palette={RIG_WOOD} settle={1} />
    </div>
    <svg
      width={PLAYLIST_THUMB_W}
      height={PLAYLIST_THUMB_H}
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <FingerHand
        digit="thumb"
        direction="up"
        x={anchorX}
        y={anchorY}
        len={ARROW_LEN}
        scale={SCALE}
        showArrow
        // "auto" tucks the chip in at dx=120, which sits it over the frame's right edge for a
        // single upward hand. Forcing a side pushes it out to dx=214, clear of the frame.
        chipSide="above"
      />
    </svg>
  </AbsoluteFill>
);
