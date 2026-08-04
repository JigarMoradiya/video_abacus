// A hand-drawn-feeling pointer that connects a label to the part it names.
//
// Why it exists: the anatomy section named frame / rods / beam / top / bottom with a
// label card off to one side and dimming on the abacus. Dimming alone does not say
// WHICH thing, and the label had nothing tying it to the part — so those ~24 seconds
// read as a static grey box with a caption. The arrow does the pointing, and because it
// draws itself it also gives each of those lines its own visual change.

import React from "react";
import { interpolate } from "remotion";

export interface Pt {
  x: number;
  y: number;
}

/** Quadratic bezier, bowed perpendicular to the chord so it never reads as a plain line. */
export const curve = (a: Pt, b: Pt, bow: number) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  // perpendicular unit vector
  const px = -dy / len;
  const py = dx / len;
  return { cx: mx + px * bow, cy: my + py * bow };
};

export const pointOnCurve = (a: Pt, c: Pt, b: Pt, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
};

/** Sample the path the arrow will draw, for the render-time check that it does not pass
 *  through anything — including the card it comes out of. */
export const samplePath = (from: Pt, to: Pt, bow: number, n = 28): Pt[] => {
  const { cx, cy } = curve(from, to, bow);
  const c = { x: cx, y: cy };
  return Array.from({ length: n + 1 }, (_, i) => pointOnCurve(from, c, to, i / n));
};

export const PartArrow: React.FC<{
  from: Pt;
  to: Pt;
  /** 0-1 draw progress */
  progress: number;
  color: string;
  bow?: number;
  frame?: number;
  fps?: number;
}> = ({ from, to, progress, color, bow = 120, frame = 0, fps = 30 }) => {
  // No origin dot: it read as a bullet floating beside the card. The stroke starts flush
  // with the card's edge instead, so the arrow looks attached to it.
  const { cx, cy } = curve(from, to, bow);
  const d = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;

  // approximate arc length so the dash reveal is roughly linear in distance
  const approxLen =
    Math.hypot(cx - from.x, cy - from.y) + Math.hypot(to.x - cx, to.y - cy);

  const drawn = interpolate(progress, [0, 0.72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headIn = interpolate(progress, [0.66, 0.88], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // tangent at the tip, for the arrowhead's rotation
  const tip = pointOnCurve(from, { x: cx, y: cy }, to, 0.999);
  const near = pointOnCurve(from, { x: cx, y: cy }, to, 0.94);
  const angle = (Math.atan2(tip.y - near.y, tip.x - near.x) * 180) / Math.PI;

  // the tip breathes once it lands, so the pointer keeps moving
  const t = frame / fps;
  const throb = 1 + Math.sin(t * 4.2) * 0.06 * headIn;

  return (
    <g>
      {/* soft backing stroke so the arrow reads on any world */}
      <path
        d={d}
        fill="none"
        stroke="rgba(0,0,0,0.28)"
        strokeWidth={13}
        strokeLinecap="round"
        strokeDasharray={approxLen}
        strokeDashoffset={approxLen * (1 - drawn)}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={approxLen}
        strokeDashoffset={approxLen * (1 - drawn)}
      />
      {/* arrowhead */}
      <g
        transform={`translate(${to.x},${to.y}) rotate(${angle}) scale(${
          headIn * throb
        })`}
        opacity={headIn}
      >
        <polygon points="6,0 -30,20 -21,0 -30,-20" fill="rgba(0,0,0,0.28)" transform="translate(2,3)" />
        <polygon points="6,0 -30,20 -21,0 -30,-20" fill={color} />
      </g>
    </g>
  );
};
