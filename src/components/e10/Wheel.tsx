// THE WHEEL OF FRIENDS — E10's own gag, the way E09's call box made "so we call a friend"
// literal. Here the game literally decides which friend by spinning. Second pass: the first
// build was a small corner prop sharing the frame with a static abacus, which is exactly the
// "nothing is really changing" problem the rest of the episode had already been caught on — the
// wheel is the HERO of its own beat now, centre stage, full-size, with the abacus off entirely
// while it spins (see `closing` in the reel for how that's enforced).
//
// The outcome is scripted (every round's number is fixed by the locked order), so this does not
// need real randomness — it needs to LOOK like it decided something. A few fast turns, then an
// ease into the segment the round actually needs, same physical read as a real prize wheel: a
// glossy rim, a chasing light ring, a pointer that never moves, and a landing glow.

import React from "react";
import { KID_FONT } from "../../lib/fonts";

export type WheelSegment = { label: string; color: string };

/**
 * Eight segments, in the SAME order as the locked round order — segment `i` is round `i`'s own
 * answer, so "landOn" is just the round index. Two colours alternate so neighbouring segments
 * never blend into one wedge.
 */
export const WHEEL_SEGMENTS: WheelSegment[] = [
  { label: "+1", color: "#FFE156" },
  { label: "−3", color: "#4AC4FF" },
  { label: "+4", color: "#FF6B4A" },
  { label: "−2", color: "#8FD8FF" },
  { label: "−1", color: "#FFE156" },
  { label: "+3", color: "#4AC4FF" },
  { label: "−4", color: "#FF6B4A" },
  { label: "+2", color: "#8FD8FF" },
];

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
  /** which segment (0-7, the round index) the wheel lands on */
  landOn: number;
  /** 0..1 across the spin line — 0 is at rest, 1 is fully landed under the pointer */
  progress: number;
  /** frame/fps, for the chasing rim lights — purely decorative, keeps the wheel alive even
   *  across the held "landed" frames instead of going static the instant it stops. */
  frame: number;
  fps: number;
  /** true once fully landed — brightens the rim and adds the landing glow */
  landed: boolean;
  /** the intro's slow continuous turn — ignores `landOn`/`progress` entirely, since nothing has
   *  been decided yet; it is just alive on screen rather than parked. */
  idle?: boolean;
  /** 0..1 across the "it lands on..." line itself, ONLY meaningful when `landed` — separate from
   *  `progress` (which the wheel's own rotation needs held at 1, not restarted) so the pointer can
   *  play a decaying bounce exactly when the segment is caught, not a moment later. */
  landProgress?: number;
}> = ({ x, y, radius, landOn, progress, frame, fps, landed, idle = false, landProgress = 0 }) => {
  const n = WHEEL_SEGMENTS.length;
  const segAngle = 360 / n;
  const t = frame / fps;
  // The pointer is fixed at the top. Segment i's own centre sits at i*segAngle measured
  // clockwise from the top, so the wheel must rotate BACKWARDS by that amount (plus whole
  // turns) to bring it under the pointer.
  const target = -(landOn * segAngle);
  const spins = 4;
  // A PLAIN `Easing.out(cubic)` decelerates from the very first frame — its velocity is
  // 3(1-t)^2, already down to under 50% by t=0.3 and under 5% by t=0.75 — so across the whole
  // spin window the wheel was visibly crawling to a stop well before "lands" was even said,
  // "landed" flag or not. Real spin: full speed for most of the window, hard deceleration only
  // in the last stretch. Linear up to HOLD, cubic ease-out only after it.
  const HOLD = 0.65;
  const eased =
    progress < HOLD
      ? progress
      : HOLD + (1 - Math.pow(1 - (progress - HOLD) / (1 - HOLD), 3)) * (1 - HOLD);
  const rotation = idle ? t * 24 : eased * spins * 360 + eased * target;
  const rimR = radius * 1.1;
  const lightCount = 16;
  // THE FLAPPER'S OWN PHYSICS — a real prize-wheel pointer is not a fixed shape floating above
  // the wheel: it is hinged above and its tip RESTS ON the rim, so every peg has to shove it up
  // and out of the way as it goes past, then it snaps back down onto the next gap. `phase` is how
  // far the nearest peg (behind, in the direction of spin) is from being directly under the tip;
  // the flick is loudest right as a peg arrives and decays until the next one shoves it again.
  const pegSpacing = 360 / lightCount;
  const pegPhase = (((-rotation % pegSpacing) + pegSpacing) % pegSpacing) / pegSpacing;
  const flick = landed ? 0 : Math.exp(-pegPhase * 4.2);
  // THE LANDING SNAP — the same paddle, given one bigger damped bounce the instant it catches
  // the winning peg, instead of a separate translate bolted on. A real flapper does not float up
  // and settle in a straight line; it swings on its hinge and rings down.
  const landBounce = landed ? Math.sin(landProgress * Math.PI * 3) * Math.exp(-landProgress * 5) * 26 : 0;
  const flapAngle = flick * 30 + landBounce;
  // The pointer's own fixed pixel offsets below were tuned against ONE radius (280, landscape) —
  // at portrait's smaller radius (230) those same fixed numbers no longer reached far enough to
  // overlap the rim, which is why the tip floated clear of the wheel there instead of resting on
  // it. `pk` rescales the whole assembly against that same 280 reference so its proportions to
  // the wheel stay constant at any radius.
  const pk = radius / 280;
  const REF_RIM = 280 * 1.1;

  return (
    <g transform={`translate(${x} ${y})`}>
      {/* the landing glow — a soft burst behind the wheel, only once it has actually landed */}
      {landed && (
        <circle r={radius * 1.55} fill={WHEEL_SEGMENTS[landOn].color} opacity={0.22 + 0.09 * Math.sin(t * 5)} />
      )}
      <ellipse cx={0} cy={rimR + 18} rx={rimR * 0.9} ry={rimR * 0.16} fill="#000" opacity={0.28} />

      {/* the outer rim: dark metal, then a gold ring of chasing lights */}
      <circle r={rimR} fill="#0E1240" />
      <circle r={rimR} fill="none" stroke="#FFE156" strokeWidth={rimR * 0.05} />
      {Array.from({ length: lightCount }, (_, i) => {
        const a = (i / lightCount) * 2 * Math.PI;
        // landed: a slow celebratory chase (two of every three lights on, the dark one travels), so the held landing is never still
        const lit = landed ? (Math.floor(t * 5 + i) % 3) !== 0 : (Math.floor(t * 10 + i) % lightCount) < lightCount * 0.4;
        return (
          <circle
            key={i}
            cx={Math.sin(a) * rimR}
            cy={-Math.cos(a) * rimR}
            r={rimR * 0.035}
            fill={lit ? "#FFF3B0" : "#8A7A2E"}
            opacity={lit ? 1 : 0.6}
          />
        );
      })}

      {/* the pointer — a hinged flapper, not a shape floating above the wheel. The mount is fixed
          (never rotates); the paddle hangs from it and its TIP OVERLAPS the rim at rest — some
          part of it is always actually on the wheel, the same as a real prize-wheel clicker —
          then flicks up and out as each peg shoves past it.
          Positioned against `REF_RIM` (the rim at radius=280, not the actual `rimR`) and scaled
          by `pk` — every offset here is a fixed pixel constant, so anchoring it to the ACTUAL
          rim and leaving it unscaled is exactly what put the tip inside the rim at radius=280
          but left it floating clear of a smaller rim at radius=230. */}
      <g transform={`scale(${pk})`}>
        {/* the fixed mount — bolted above the rim, does not move */}
        <rect x={-7} y={-REF_RIM - 46} width={14} height={22} rx={6} fill="#0E1240" />
        <circle cx={0} cy={-REF_RIM - 46} r={9} fill="#FFE156" stroke="#0E1240" strokeWidth={2.5} />
        {/* the paddle, hinged at the mount, tip resting on the rim until a peg pushes it */}
        <g transform={`translate(0 ${-REF_RIM - 24}) rotate(${flapAngle})`}>
          <path
            d="M -13 0 C -15 22 -12 40 0 52 C 12 40 15 22 13 0 C 8 -6 -8 -6 -13 0 Z"
            fill="#FF4D8D"
            stroke="#FFF6E2"
            strokeWidth={4.5}
          />
          <path d="M -5 6 C -8 22 -6 34 0 42" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.45} />
          <circle cx={0} cy={4} r={8} fill="#FFE156" stroke="#0E1240" strokeWidth={2.5} />
          <circle cx={0} cy={4} r={3} fill="#0E1240" />
        </g>
      </g>

      <g transform={`rotate(${rotation})`}>
        <defs>
          {WHEEL_SEGMENTS.map((seg, i) => (
            <radialGradient key={i} id={`wseg-${i}`} cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor={shade(seg.color, 40)} />
              <stop offset="100%" stopColor={shade(seg.color, -20)} />
            </radialGradient>
          ))}
        </defs>
        <circle r={radius} fill="#1C2359" stroke="#FFE156" strokeWidth={7} />
        {WHEEL_SEGMENTS.map((seg, i) => {
          const a0 = ((i * segAngle - segAngle / 2) * Math.PI) / 180;
          const a1 = ((i * segAngle + segAngle / 2) * Math.PI) / 180;
          const x0 = Math.sin(a0) * radius;
          const y0 = -Math.cos(a0) * radius;
          const x1 = Math.sin(a1) * radius;
          const y1 = -Math.cos(a1) * radius;
          const midDeg = i * segAngle;
          const midA = (midDeg * Math.PI) / 180;
          const lx = Math.sin(midA) * radius * 0.64;
          const ly = -Math.cos(midA) * radius * 0.64;
          return (
            <g key={i}>
              <path
                d={`M 0 0 L ${x0} ${y0} A ${radius} ${radius} 0 0 1 ${x1} ${y1} Z`}
                fill={`url(#wseg-${i})`}
                stroke="#1C2359"
                strokeWidth={2.5}
              />
              <text
                x={lx}
                y={ly}
                fontFamily={KID_FONT}
                fontSize={radius * 0.24}
                fontWeight={700}
                fill="#1C2359"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${midDeg} ${lx} ${ly})`}
              >
                {seg.label}
              </text>
            </g>
          );
        })}
        {/* the glossy highlight — a pale arc across the upper-left, the thing that makes a flat
            disc read as a dome rather than a sticker */}
        <path
          d={`M ${-radius * 0.75} ${-radius * 0.35} A ${radius * 0.95} ${radius * 0.95} 0 0 1 ${radius * 0.15} ${-radius * 0.92}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={radius * 0.12}
          strokeLinecap="round"
          opacity={0.16}
        />
        {/* the hub */}
        <circle r={radius * 0.16} fill="#FFE156" stroke="#1C2359" strokeWidth={3} />
        <circle r={radius * 0.05} fill="#B02F53" />
      </g>
    </g>
  );
};

/** The wheel's own footprint — the flapper pointer's mount now reaches rimR+74 (was rimR+46 for
 *  the old flat triangle), so `up` needs the same margin bump or the pointer's own top clips the
 *  title card sitting above it. This is NOT checked by `guardOverlap` (see the wheelTitleSlot
 *  comment in the reel — `closing:true` skips the pairwise box check entirely), so this box only
 *  matters for callers who measure against it by hand. */
export const wheelBox = (radius: number) => {
  const rimR = radius * 1.1;
  // The pin pointer's head sits at local y=-72 with radius 30, translated by -(rimR+8) — its own
  // top edge lands at rimR+110 above the wheel's centre; +120 keeps a margin above that.
  return { up: rimR + 120, down: rimR + 30, half: rimR + 10 };
};
