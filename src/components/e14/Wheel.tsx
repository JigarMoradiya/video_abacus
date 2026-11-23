// THE ARCADE WHEEL — E14's own copy of E10's "Wheel of Friends" prize wheel, same physics and
// hinged-flapper pointer verbatim, with an arcade neon palette (near-black cabinet, lime and hot
// pink) instead of E10's indigo-and-gold TV studio, so the two game-show episodes read as two
// different machines rather than one recoloured. A separate file rather than a prop on E10's
// `Wheel` — `WHEEL_SEGMENTS` there is a module-level constant baked into that component's own
// JSX, and changing it to a prop risked regressing E10, which this session was explicitly told
// not to touch.
//
// EIGHTEEN segments, not eight (user: "we have 18 formulas, why does the wheel only have 8?").
// Big Friend has 18 total formulas — 9 adding, 9 taking-away — and the wheel now shows all of
// them, +1..+9 and −1..−9 interleaved, so a viewer sees the FULL range of what is possible. The
// recorded audio only narrates 8 played rounds (see `SEGMENT_FOR_ROUND` in the reel file) — this
// is a visual-honesty fix, not a claim that all 18 are played: "you know all 18, we'll test a
// sample" is a normal recall-game framing, and every one of the 8 played rounds still lands on
// its own correct slice within this fuller wheel.

import React from "react";
import { KID_FONT } from "../../lib/fonts";

export type WheelSegment = { label: string; color: string };

/** All eighteen Big Friend formulas, interleaved +1,−1,+2,−2,...,+9,−9 so add/take alternate all
 *  the way round. Three colours cycle (lime / hot pink / sky) so no two neighbours blend into one
 *  wedge — with 18 slices at 20° each, two colours alone repeated every other slice reads as a
 *  single flat ring; three breaks that up the same way E10's own 8-segment wheel already does. */
export const WHEEL_SEGMENTS: WheelSegment[] = Array.from({ length: 9 }, (_, i) => i + 1).flatMap(
  (n, i) => [
    { label: `+${n}`, color: ["#C6FF3D", "#FF3DA6", "#8FE8FF"][(i * 2) % 3] },
    { label: `−${n}`, color: ["#C6FF3D", "#FF3DA6", "#8FE8FF"][(i * 2 + 1) % 3] },
  ]
);

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

export const Wheel: React.FC<{
  x: number;
  y: number;
  radius: number;
  landOn: number;
  progress: number;
  frame: number;
  fps: number;
  landed: boolean;
  idle?: boolean;
  landProgress?: number;
}> = ({ x, y, radius, landOn, progress, frame, fps, landed, idle = false, landProgress = 0 }) => {
  const n = WHEEL_SEGMENTS.length;
  const segAngle = 360 / n;
  const t = frame / fps;
  const target = -(landOn * segAngle);
  // 3, not E10's 4 — this wheel's own spin window is real recorded audio (~3-4s once `start`
  // begins at the announce line's own start, not the word "spin"), and 18 segments already read
  // as "spinning fast" at a lower rotation count than E10's 8-segment wheel needed to sell the
  // same effect; one fewer full turn over the same window means slower angular velocity, which
  // reads clearer rather than as a blur (user: pacing "still feels rushed").
  const spins = 3;
  // PROPER DECELERATING PHYSICS (user: it "stops dead instead of slowing down"). The old curve
  // was linear (constant angular velocity) for the first 65% of the window, THEN switched to an
  // ease-out for only the last 35% — a real spinning wheel does not hold one constant speed and
  // then suddenly start braking, it slows continuously from friction the whole time, fastest at
  // the start and gentlest right before it stops. A single quartic ease-out across the WHOLE
  // window (no breakpoint, so no velocity kink anywhere) reads as a genuine spin-down: still
  // fast through the first couple of turns, then visibly, continuously slowing through its last
  // ~1-2 rotations into an exact stop on the target segment — same shape regardless of which
  // segment it lands on, a general physics fix, not tuned per round.
  const eased = 1 - Math.pow(1 - progress, 4);
  const rotation = idle ? t * 24 : eased * spins * 360 + eased * target;
  const rimR = radius * 1.1;
  const lightCount = 16;
  const pegSpacing = 360 / lightCount;
  const pegPhase = (((-rotation % pegSpacing) + pegSpacing) % pegSpacing) / pegSpacing;
  const flick = landed ? 0 : Math.exp(-pegPhase * 4.2);
  const landBounce = landed ? Math.sin(landProgress * Math.PI * 3) * Math.exp(-landProgress * 5) * 26 : 0;
  const flapAngle = flick * 30 + landBounce;
  const pk = radius / 280;
  const REF_RIM = 280 * 1.1;

  return (
    <g transform={`translate(${x} ${y})`}>
      {landed && (
        <circle r={radius * 1.55} fill={WHEEL_SEGMENTS[landOn].color} opacity={0.22 + 0.06 * Math.sin(t * 6)} />
      )}
      <ellipse cx={0} cy={rimR + 18} rx={rimR * 0.9} ry={rimR * 0.16} fill="#000" opacity={0.28} />

      <circle r={rimR} fill="#160C2E" />
      <circle r={rimR} fill="none" stroke="#C6FF3D" strokeWidth={rimR * 0.05} />
      {Array.from({ length: lightCount }, (_, i) => {
        const a = (i / lightCount) * 2 * Math.PI;
        const lit = landed ? true : (Math.floor(t * 10 + i) % lightCount) < lightCount * 0.4;
        return (
          <circle
            key={i}
            cx={Math.sin(a) * rimR}
            cy={-Math.cos(a) * rimR}
            r={rimR * 0.035}
            fill={lit ? "#E9FFA8" : "#4A5A1A"}
            opacity={lit ? 1 : 0.6}
          />
        );
      })}

      <g transform={`scale(${pk})`}>
        <rect x={-7} y={-REF_RIM - 46} width={14} height={22} rx={6} fill="#160C2E" />
        <circle cx={0} cy={-REF_RIM - 46} r={9} fill="#C6FF3D" stroke="#160C2E" strokeWidth={2.5} />
        <g transform={`translate(0 ${-REF_RIM - 24}) rotate(${flapAngle})`}>
          <path
            d="M -13 0 C -15 22 -12 40 0 52 C 12 40 15 22 13 0 C 8 -6 -8 -6 -13 0 Z"
            fill="#FF3DA6"
            stroke="#FFF6E2"
            strokeWidth={4.5}
          />
          <path d="M -5 6 C -8 22 -6 34 0 42" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.45} />
          <circle cx={0} cy={4} r={8} fill="#C6FF3D" stroke="#160C2E" strokeWidth={2.5} />
          <circle cx={0} cy={4} r={3} fill="#160C2E" />
        </g>
      </g>

      <g transform={`rotate(${rotation})`}>
        <defs>
          {WHEEL_SEGMENTS.map((seg, i) => (
            <radialGradient key={i} id={`e14wseg-${i}`} cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor={shade(seg.color, 40)} />
              <stop offset="100%" stopColor={shade(seg.color, -20)} />
            </radialGradient>
          ))}
        </defs>
        <circle r={radius} fill="#200F3C" stroke="#C6FF3D" strokeWidth={7} />
        {WHEEL_SEGMENTS.map((seg, i) => {
          const a0 = ((i * segAngle - segAngle / 2) * Math.PI) / 180;
          const a1 = ((i * segAngle + segAngle / 2) * Math.PI) / 180;
          const x0 = Math.sin(a0) * radius;
          const y0 = -Math.cos(a0) * radius;
          const x1 = Math.sin(a1) * radius;
          const y1 = -Math.cos(a1) * radius;
          const midDeg = i * segAngle;
          const midA = (midDeg * Math.PI) / 180;
          // pushed further out (0.72 vs the 8-segment wheel's 0.64) and set in smaller type —
          // 18 slices at 20° each are much narrower, so the label needs the widest part of the
          // wedge and a font small enough not to collide with its own neighbours.
          const lx = Math.sin(midA) * radius * 0.72;
          const ly = -Math.cos(midA) * radius * 0.72;
          return (
            <g key={i}>
              <path
                d={`M 0 0 L ${x0} ${y0} A ${radius} ${radius} 0 0 1 ${x1} ${y1} Z`}
                fill={`url(#e14wseg-${i})`}
                stroke="#200F3C"
                strokeWidth={2.5}
              />
              <text
                x={lx}
                y={ly}
                fontFamily={KID_FONT}
                fontSize={radius * 0.135}
                fontWeight={700}
                fill="#200F3C"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${midDeg} ${lx} ${ly})`}
              >
                {seg.label}
              </text>
            </g>
          );
        })}
        <path
          d={`M ${-radius * 0.75} ${-radius * 0.35} A ${radius * 0.95} ${radius * 0.95} 0 0 1 ${radius * 0.15} ${-radius * 0.92}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={radius * 0.12}
          strokeLinecap="round"
          opacity={0.16}
        />
        <circle r={radius * 0.16} fill="#C6FF3D" stroke="#200F3C" strokeWidth={3} />
        <circle r={radius * 0.05} fill="#FF3DA6" />
      </g>
    </g>
  );
};

export const wheelBox = (radius: number) => {
  const rimR = radius * 1.1;
  return { up: rimR + 120, down: rimR + 30, half: rimR + 10 };
};
