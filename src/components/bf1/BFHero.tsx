// BLAZE and SPARK, re-drawn for the Big Friend shorts: the same two heroes (same cape colours,
// same domino masks) but built for a phone-sized, kid-pleasing cartoon — a huge head, big
// googly eyes with moving pupils, thick expressive brows, a flame-tuft for Blaze and a
// lightning-bolt tuft for Spark, squash-and-stretch, sweat drops and cheek blush.
//
// Same rule as every character in this series: the pose is KEYED TO THE MOOD, never to an
// oscillation (an oscillation-keyed pose flickers). Moods are blended over a few frames by the
// caller (`prevMood`/`moodFrame`) so a change is a move, not a pop. Everything is a pure
// function of the frame.
//
// Bare <g> — render inside an <svg>.

import React from "react";

export type BFMood =
  | "idle" // resting, small smile
  | "worry" // brows up in the middle, wobbling frown, sweat drop
  | "shock" // huge eyes, "O" mouth, hands up
  | "point" // one arm out toward the middle
  | "call" // communicator to the ear, talking mouth
  | "think" // hand on chin, eyes up, smirk
  | "cheer" // arms up, big open grin
  | "grin"; // arms down, big grin (the proud nod)

const PALETTE = {
  blaze: { body: "#FF5A36", belly: "#FFE3A3", cape: "#C21F3A", mask: "#2A1030", hairA: "#FF9F1C", hairB: "#FFE156", shoe: "#7A1F2B" },
  spark: { body: "#2F7BFF", belly: "#CFE6FF", cape: "#6A2CD8", mask: "#10183A", hairA: "#FFE156", hairB: "#FFFFFF", shoe: "#1B2F7A" },
} as const;
export type BFName = keyof typeof PALETTE;

const SKIN = "#FFD9B0";
const INK = "#2A1430";

/** Local box (feet at the origin, before `scale`) — measured off the shapes below. */
export const BF_HERO_BOX = { halfW: 118, up: 300, upCheer: 340 };

interface Pose {
  lx: number; ly: number; // left hand
  rx: number; ry: number; // right hand
  browL: number; browR: number; // brow raise in px (positive = up)
  browTilt: number; // inner ends up (worry) positive
  eyeScale: number;
  pupil: number;
  smile: number; // -1 frown .. 1 grin
  open: number; // 0..1 mouth opening
  tilt: number; // head tilt, degrees
  lookY: number; // pupils up/down
  sweat: number; // 0..1
  comm: number; // communicator visible 0..1
}

const POSES: Record<BFMood, Pose> = {
  idle: { lx: -64, ly: -44, rx: 64, ry: -44, browL: 0, browR: 0, browTilt: 0, eyeScale: 1, pupil: 1, smile: 0.5, open: 0, tilt: 0, lookY: 0, sweat: 0, comm: 0 },
  worry: { lx: -78, ly: -170, rx: 78, ry: -170, browL: 8, browR: 8, browTilt: 1, eyeScale: 1.12, pupil: 0.85, smile: -0.9, open: 0.15, tilt: 5, lookY: 0.2, sweat: 1, comm: 0 },
  shock: { lx: -108, ly: -190, rx: 108, ry: -190, browL: 16, browR: 16, browTilt: 0, eyeScale: 1.3, pupil: 0.6, smile: 0, open: 0.95, tilt: 0, lookY: 0, sweat: 0.4, comm: 0 },
  point: { lx: -62, ly: -44, rx: 120, ry: -128, browL: 4, browR: 4, browTilt: 0, eyeScale: 1.04, pupil: 1, smile: 0.7, open: 0.25, tilt: -3, lookY: 0, sweat: 0, comm: 0 },
  call: { lx: -62, ly: -44, rx: 76, ry: -214, browL: 5, browR: 5, browTilt: 0, eyeScale: 1.05, pupil: 1, smile: 0.6, open: 0.55, tilt: 7, lookY: -0.1, sweat: 0, comm: 1 },
  think: { lx: -74, ly: -96, rx: 46, ry: -146, browL: 12, browR: -4, browTilt: 0, eyeScale: 1, pupil: 0.95, smile: 0.1, open: 0, tilt: -10, lookY: -0.7, sweat: 0, comm: 0 },
  cheer: { lx: -106, ly: -292, rx: 106, ry: -292, browL: 12, browR: 12, browTilt: 0, eyeScale: 1.08, pupil: 1.05, smile: 1, open: 0.9, tilt: 0, lookY: 0, sweat: 0, comm: 0 },
  grin: { lx: -66, ly: -50, rx: 66, ry: -50, browL: 7, browR: 7, browTilt: 0, eyeScale: 1.05, pupil: 1, smile: 1, open: 0.45, tilt: -2, lookY: 0, sweat: 0, comm: 0 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const out = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    out[k] = lerp(a[k], b[k], t);
  });
  return out;
};

export const BFHero: React.FC<{
  x: number;
  y: number;
  scale: number;
  name: BFName;
  mood: BFMood;
  /** the mood this one is easing in from, and the frame the change began */
  prevMood?: BFMood;
  moodFrame?: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right (mirrors the whole figure) */
  facing?: 1 | -1;
  /** pupils look toward -1 (left) .. 1 (right), in SCREEN direction */
  lookX?: number;
  /** vertical hop, px (positive lifts the figure), from a caller-side spring */
  hop?: number;
  /** -1 stretched tall .. +1 squashed flat, from a caller-side spring */
  squash?: number;
  /** extra talk: the mouth flaps while true */
  talking?: boolean;
  phase?: number;
  /** bf2: a sports-hall kit. "ref" = striped referee shirt + whistle, "coach" = visor cap + stopwatch. Omitted = the bf1 look, unchanged. */
  kit?: "ref" | "coach" | "apron" | "host" | "pilot" | "medic" | "trainer" | "lab" | "racer" | "runner";
  /** colour overrides for the kit look */
  palette?: Partial<(typeof PALETTE)[BFName]>;
}> = ({
  x,
  y,
  scale,
  name,
  mood,
  prevMood,
  moodFrame = 0,
  frame,
  fps,
  facing = 1,
  lookX = 0,
  hop = 0,
  squash = 0,
  talking = false,
  phase = 0,
  kit,
  palette,
}) => {
  const C = { ...PALETTE[name], ...(palette ?? {}) };
  const t = frame / fps + phase;
  const blend = prevMood ? Math.min(1, Math.max(0, (frame - moodFrame) / 8)) : 1;
  const e = blend * blend * (3 - 2 * blend);
  const P = prevMood ? mixPose(POSES[prevMood], POSES[mood], e) : POSES[mood];

  // idle life: breathing, a slow sway, a blink every ~2.6 s
  const breathe = Math.sin(t * 2.4) * 0.012;
  const sway = Math.sin(t * 1.3) * 2.2;
  const blinkT = (t * 0.38 + (name === "spark" ? 0.5 : 0)) % 1;
  const blink = blinkT > 0.955 ? 0.12 : 1;
  const cheerBounce = mood === "cheer" ? Math.abs(Math.sin(t * 5.2)) * 14 : 0;
  const cheerSplay = mood === "cheer" ? Math.sin(t * 5.2) * 8 : 0;

  const sx = (1 + 0.17 * squash) * (1 + breathe);
  const sy = (1 - 0.17 * squash) * (1 - breathe);

  // the talk flap: a fast open/close riding on the mood's own opening
  const talkK = talking ? 0.5 + 0.5 * Math.sin(t * 17) : 0;
  const open = Math.min(1, P.open + (talking ? 0.35 * talkK : 0));

  // pupils: mood look + caller look
  const px = lookX * 7;
  const py = P.lookY * 6;

  const handR = { x: P.rx + cheerSplay, y: P.ry };
  const handL = { x: P.lx - cheerSplay, y: P.ly };

  const mouthW = 30 + 8 * Math.max(0, P.smile);
  const mouthY = 36;
  const smileY = P.smile * 22;
  const upper = `M ${-mouthW} ${mouthY} Q 0 ${mouthY + smileY * 0.6} ${mouthW} ${mouthY}`;
  const lowerDrop = open * 46 + Math.max(0, P.smile) * 10;
  const mouthPath =
    `M ${-mouthW} ${mouthY} Q 0 ${mouthY + smileY * 0.9 - 4} ${mouthW} ${mouthY} ` +
    `Q 0 ${mouthY + smileY + lowerDrop} ${-mouthW} ${mouthY} Z`;

  const arm = (sx0: number, sy0: number, h: { x: number; y: number }) => {
    const mx = (sx0 + h.x) / 2 + (h.y < sy0 - 80 ? (sx0 < 0 ? -10 : 10) : 0);
    const my = (sy0 + h.y) / 2 + 10;
    return (
      <path
        d={`M ${sx0} ${sy0} Q ${mx} ${my} ${h.x} ${h.y}`}
        stroke={C.body}
        strokeWidth={26}
        strokeLinecap="round"
        fill="none"
      />
    );
  };
  const glove = (h: { x: number; y: number }) => (
    <g transform={`translate(${h.x} ${h.y})`}>
      <circle r={19} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
      <path d="M -7 -6 q 7 -6 14 0" stroke="#D8D8E8" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );

  return (
    <g transform={`translate(${x} ${y - hop}) scale(${scale * facing * sx} ${scale * sy})`}>
      {/* ground shadow shrinks as the hero lifts */}
      <ellipse cx={0} cy={6} rx={84 - hop * 0.08} ry={15} fill="#000" opacity={0.22} />

      <g transform={`translate(${sway} ${-cheerBounce})`}>
        {/* cape behind everything */}
        <path
          d={`M -42 -118 q ${-52 + Math.sin(t * 3.1) * 8} 74 ${-26 + Math.sin(t * 2.7) * 6} 130 q 50 22 100 0 q ${34} -60 ${-26 + 0} -134 Z`}
          fill={C.cape}
        />
        <path d="M -30 -112 q -30 60 -14 110" stroke="#FFFFFF" strokeOpacity={0.18} strokeWidth={8} fill="none" strokeLinecap="round" />

        {/* shoes + legs */}
        <path d="M -28 -26 v 24" stroke={SKIN} strokeWidth={20} strokeLinecap="round" />
        <path d="M 28 -26 v 24" stroke={SKIN} strokeWidth={20} strokeLinecap="round" />
        <ellipse cx={-34} cy={-4} rx={30} ry={15} fill={C.shoe} stroke={INK} strokeWidth={4} />
        <ellipse cx={34} cy={-4} rx={30} ry={15} fill={C.shoe} stroke={INK} strokeWidth={4} />
        <ellipse cx={-42} cy={-9} rx={10} ry={4} fill="#FFFFFF" opacity={0.35} />
        <ellipse cx={26} cy={-9} rx={10} ry={4} fill="#FFFFFF" opacity={0.35} />

        {/* body */}
        <path d="M -52 -26 q -10 -64 14 -94 q 38 -16 76 0 q 24 30 14 94 q -52 12 -104 0 Z" fill={C.body} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 0 -108 q 26 6 30 46 q -14 28 -30 28 q -16 0 -30 -28 q 4 -40 30 -46 Z" fill={C.belly} />
        {/* emblem */}
        {name === "blaze" ? (
          <path d="M 0 -96 q 14 18 8 30 q -4 8 -8 8 q -12 -6 -8 -22 q 4 6 8 0 q -2 -10 0 -16 Z" fill="#FF7A1A" stroke={INK} strokeWidth={2.5} />
        ) : (
          <path d="M 6 -98 l -16 28 l 11 0 l -7 24 l 20 -32 l -12 0 Z" fill="#FFE156" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        )}
        {/* belt */}
        <path d="M -54 -34 q 54 12 108 0" stroke={name === "blaze" ? "#FFE156" : "#FFFFFF"} strokeWidth={9} fill="none" strokeLinecap="round" />

        {/* kit: referee stripes and a swinging whistle / coach stopwatch on a cord */}
        {kit === "ref" && (
          <g>
            <clipPath id={`bf-body-${name}`}>
              <path d="M -52 -26 q -10 -64 14 -94 q 38 -16 76 0 q 24 30 14 94 q -52 12 -104 0 Z" />
            </clipPath>
            <g clipPath={`url(#bf-body-${name})`}>
              {[-44, -22, 0, 22, 44].map((sx0) => (
                <rect key={sx0} x={sx0 - 5} y={-124} width={10} height={100} fill="#2A1430" opacity={0.9} />
              ))}
            </g>
            <path d="M -18 -112 L 0 -64 L 18 -112" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" />
            <g transform={`translate(0 ${-64 + Math.sin(t * 3) * 2})`}>
              <rect x={-9} y={0} width={18} height={14} rx={6} fill="#FFD23F" stroke={INK} strokeWidth={3} />
              <circle cx={0} cy={4} r={3} fill={INK} />
            </g>
          </g>
        )}
        {kit === "apron" && (
          <g>
            <path d="M -34 -112 Q 0 -100 34 -112 L 42 -34 Q 0 -22 -42 -34 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            {[-24, -8, 8, 24].map((ax) => (
              <path key={ax} d={`M ${ax} -106 L ${ax * 1.15} -30`} stroke="#41D8B0" strokeWidth={6} strokeLinecap="round" />
            ))}
            <path d="M -16 -112 L 0 -126 L 16 -112" stroke="#41D8B0" strokeWidth={5} fill="none" strokeLinecap="round" />
            <rect x={-18} y={-72} width={36} height={22} rx={6} fill="#FFE45C" stroke={INK} strokeWidth={3} />
            <circle cx={0} cy={-61} r={4} fill="#FF6F6F" />
          </g>
        )}
        {kit === "racer" && (
          <g>
            <path d="M -42 -112 Q 0 -100 42 -112 L 48 -30 Q 0 -20 -48 -30 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <path d="M -42 -112 Q 0 -100 42 -112 L 46 -86 Q 0 -74 -46 -86 Z" fill="#FF7A1A" />
            <path d="M -48 -60 H 48" stroke="#0B0720" strokeWidth={6} />
            <rect x={-20} y={-96} width={40} height={36} rx={6} fill="#B6FF2E" stroke={INK} strokeWidth={3.5} />
            <path d="M 4 -92 l -12 18 h 8 l -4 14 l 14 -20 h -8 Z" fill="#0B0720" />
          </g>
        )}
        {kit === "runner" && (
          <g>
            <path d="M -42 -112 Q 0 -100 42 -112 L 48 -30 Q 0 -20 -48 -30 Z" fill="#0B0720" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <path d="M -30 -108 L -20 -40 M 30 -108 L 20 -40" stroke="#B6FF2E" strokeWidth={6} strokeLinecap="round" />
            <path d="M 6 -98 l -16 28 h 12 l -6 20 l 20 -30 h -12 Z" fill="#FF7A1A" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <rect x={-70} y={-62} width={20} height={14} rx={5} fill="#B6FF2E" stroke={INK} strokeWidth={3} />
          </g>
        )}
        {kit === "trainer" && (
          <g>
            <path d="M 0 -110 V -30" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
            <path d="M -48 -100 L -52 -40 M 48 -100 L 52 -40" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
            <path d="M -22 -112 L 0 -94 L 22 -112" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={24} cy={-70} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
            
          </g>
        )}
        {kit === "lab" && (
          <g>
            <path d="M -50 -112 Q 0 -96 50 -112 L 56 -26 Q 0 -14 -56 -26 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <path d="M -18 -110 L 0 -66 L 18 -110" fill={C.belly} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <path d="M 0 -66 V -28" stroke={INK} strokeWidth={2.5} opacity={0.5} />
            <rect x={14} y={-70} width={30} height={26} rx={4} fill="#EAF2F8" stroke={INK} strokeWidth={3} />
            <path d="M 22 -70 V -82 M 31 -70 V -86" stroke="#FF5A5A" strokeWidth={4} strokeLinecap="round" />
            <path d="M 31 -70 V -84" stroke="#2F7BFF" strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
        {kit === "pilot" && (
          <g>
            <path d="M -40 -112 Q 0 -100 40 -112 L 46 -30 Q 0 -20 -46 -30 Z" fill="#FFD400" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <path d="M -44 -70 Q 0 -60 44 -70 M -45 -50 Q 0 -40 45 -50" stroke="#E5EAF0" strokeWidth={8} fill="none" />
            <path d="M 0 -108 V -26" stroke={INK} strokeWidth={3} />
            <rect x={-62} y={-104} width={20} height={26} rx={4} fill="#2A2F3A" stroke={INK} strokeWidth={3} />
            <path d="M -52 -104 V -126" stroke="#2A2F3A" strokeWidth={4} strokeLinecap="round" />
            <circle cx={-52} cy={-90} r={3.5} fill="#5BE37A" />
          </g>
        )}
        {kit === "medic" && (
          <g>
            <path d="M -44 -112 L 30 -34 M 44 -112 L -30 -34" stroke="#2A2F3A" strokeWidth={10} strokeLinecap="round" />
            <circle cx={0} cy={-76} r={9} fill="#FFD400" stroke={INK} strokeWidth={3} />
            <circle cx={22} cy={-58} r={15} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
            <path d="M 22 -66 V -50 M 14 -58 H 30" stroke="#E5484D" strokeWidth={6} strokeLinecap="round" />
          </g>
        )}
        {kit === "host" && (
          <g>
            <path d="M -16 -110 L 0 -98 L 16 -110 L 16 -92 L 0 -86 L -16 -92 Z" fill="#FF6F6F" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
            <circle cx={0} cy={-98} r={6} fill="#FFE45C" stroke={INK} strokeWidth={3} />
            <path d="M -30 -80 l 6 -10 l 6 10 l -6 10 Z M 24 -62 l 5 -8 l 5 8 l -5 8 Z" fill="#FFE45C" opacity={0.9} />
          </g>
        )}
        {kit === "coach" && (
          <g>
            <path d="M -16 -112 L 0 -66 L 16 -112" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" />
            {P.comm < 0.5 && (
              <g transform={`translate(0 ${-60 + Math.sin(t * 3) * 2})`}>
                <circle r={17} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
                <rect x={-4} y={-25} width={8} height={7} rx={2} fill="#FFD23F" stroke={INK} strokeWidth={2} />
                <path d="M 0 0 V -10 M 0 0 L 8 4" stroke={INK} strokeWidth={3} strokeLinecap="round" />
              </g>
            )}
          </g>
        )}

        {/* arms and gloves */}
        {arm(-46, -96, handL)}
        {arm(46, -96, handR)}
        {glove(handL)}
        {glove(handR)}
        {P.comm > 0.02 && kit === "ref" && (
          <g transform={`translate(${handR.x + 6} ${handR.y - 20})`} opacity={P.comm}>
            <path d="M -16 6 q -8 -14 4 -18 h 22 q 10 0 10 12 q 0 10 -12 10 h -10 q -8 0 -14 -4 Z" fill="#FFD23F" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
            <circle cx={8} cy={0} r={4} fill={INK} />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${26 + i * 12} ${-10 - i * 3} q 8 10 0 20`} stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.9 - i * 0.25} />
            ))}
          </g>
        )}
        {P.comm > 0.02 && kit === "coach" && (
          <g transform={`translate(${handR.x + 4} ${handR.y - 26})`} opacity={P.comm}>
            <circle r={24} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
            <rect x={-6} y={-36} width={12} height={10} rx={3} fill="#FFD23F" stroke={INK} strokeWidth={3} />
            <path d="M 0 0 V -15 M 0 0 L 11 6" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
        {P.comm > 0.02 && kit === "apron" && (
          <g transform={`translate(${handR.x + 6} ${handR.y - 24})`} opacity={P.comm}>
            <circle r={22} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
            <circle r={12} fill="#FFE45C" stroke={INK} strokeWidth={3} />
            <circle r={4} fill={INK} />
            <path d="M 14 14 q 26 30 -6 44 q -30 12 -44 -4" stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinecap="round" />
            <path d="M 14 14 q 26 30 -6 44 q -30 12 -44 -4" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="6 8" />
          </g>
        )}
        {P.comm > 0.02 && kit === "racer" && (
          <g transform={`translate(${handR.x + 2} ${handR.y - 24}) rotate(${Math.sin(t * 14) * 10})`} opacity={P.comm}>
            <rect x={-3} y={-70} width={6} height={96} rx={3} fill="#2A2F3A" stroke={INK} strokeWidth={3} />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={3 + (i % 4) * 12} y={-70 + Math.floor(i / 4) * 12} width={12} height={12} fill={(i + Math.floor(i / 4)) % 2 === 0 ? "#0B0720" : "#FFFFFF"} stroke={INK} strokeWidth={1.5} />
            ))}
          </g>
        )}
        {P.comm > 0.02 && kit === "runner" && (
          <g transform={`translate(${handR.x + 4} ${handR.y - 28}) rotate(${Math.sin(t * 16) * 8})`} opacity={P.comm}>
            <path d="M 8 -40 l -34 46 h 22 l -12 38 l 46 -54 h -24 Z" fill="#B6FF2E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          </g>
        )}
        {P.comm > 0.02 && kit === "trainer" && (
          <g transform={`translate(${handR.x + 2} ${handR.y - 22}) rotate(${Math.sin(t * 10) * 6})`} opacity={P.comm}>
            <rect x={-3} y={-60} width={6} height={86} rx={3} fill="#8B6B3A" stroke={INK} strokeWidth={3} />
            <path d="M 3 -58 L 52 -42 L 3 -26 Z" fill="#6CC24A" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
            <path d="M 14 -44 l 7 8 l 14 -14" stroke="#FFFFFF" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {P.comm > 0.02 && kit === "lab" && (
          <g transform={`translate(${handR.x + 4} ${handR.y - 28})`} opacity={P.comm}>
            <path d="M -14 -22 H 14 L 24 22 Q 26 32 14 32 H -14 Q -26 32 -24 22 Z" fill="#E8F6FF" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
            <path d="M -20 6 H 20 L 24 22 Q 26 32 14 32 H -14 Q -26 32 -24 22 Z" fill="#6CE08A" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={-8 + i * 9} cy={-6 - ((t * 40 + i * 14) % 22)} r={3.5 - i * 0.6} fill="#BFF5CC" stroke={INK} strokeWidth={1.5} opacity={0.9} />
            ))}
            <path d="M -17 -24 H 17" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
        {P.comm > 0.02 && kit === "pilot" && (
          <g transform={`translate(${handR.x + 2} ${handR.y - 22}) rotate(8)`} opacity={P.comm}>
            <rect x={-12} y={-30} width={24} height={56} rx={7} fill="#2A2F3A" stroke={INK} strokeWidth={3} />
            <rect x={-7} y={-24} width={14} height={10} rx={2} fill="#5BE37A" />
            <path d="M 6 -30 L 12 -56" stroke={INK} strokeWidth={4} strokeLinecap="round" />
            {[0, 1].map((i) => (
              <path key={i} d={`M ${20 + i * 12} ${-48 - i * 4} q 8 10 0 22`} stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.9 - i * 0.3} />
            ))}
          </g>
        )}
        {P.comm > 0.02 && kit === "medic" && (
          <g transform={`translate(${handR.x + 6} ${handR.y - 24}) rotate(-12)`} opacity={P.comm}>
            <path d="M -8 -12 L 40 -34 L 40 10 L -8 -4 Z" fill="#FF8A00" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
            <rect x={-18} y={-14} width={14} height={14} rx={3} fill="#2A2F3A" stroke={INK} strokeWidth={3} />
            {[0, 1].map((i) => (
              <path key={i} d={`M ${50 + i * 12} ${-28 + i * 2} q 8 10 0 24`} stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.9 - i * 0.3} />
            ))}
          </g>
        )}
        {P.comm > 0.02 && kit === "host" && (
          <g transform={`translate(${handR.x + 4} ${handR.y - 30}) rotate(${Math.sin(t * 12) * 8})`} opacity={P.comm}>
            <rect x={-3} y={0} width={6} height={44} rx={3} fill="#8E6CFF" stroke={INK} strokeWidth={3} />
            <path d="M 0 -32 l 9 20 l 22 2 l -17 14 l 6 22 l -20 -12 l -20 12 l 6 -22 l -17 -14 l 22 -2 Z" fill="#FFE45C" stroke={INK} strokeWidth={4} strokeLinejoin="round" transform="scale(0.8) translate(0 12)" />
          </g>
        )}
        {P.comm > 0.02 && !kit && (
          <g transform={`translate(${handR.x + 18} ${handR.y - 16}) rotate(16)`} opacity={P.comm}>
            <rect x={-12} y={-24} width={24} height={46} rx={7} fill={C.mask} stroke={INK} strokeWidth={3} />
            <rect x={-8} y={-19} width={16} height={14} rx={3} fill="#9AF0FF" />
            <circle cx={0} cy={11} r={4} fill="#FF4D6D" />
          </g>
        )}

        {/* head */}
        <g transform={`translate(0 -186) rotate(${P.tilt})`}>
          {/* hair tuft behind the head top */}
          {kit === "coach" || kit === "host" || kit === "pilot" || kit === "medic" ? null : name === "blaze" ? (
            <g>
              <path d="M -34 -62 q -20 -52 14 -78 q -2 30 18 36 q -6 -34 24 -60 q 2 38 18 54 q 20 -20 12 -52 q 34 40 6 100 Z" fill={C.hairA} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <path d="M -10 -68 q -8 -30 12 -48 q 0 20 12 26 q -4 -18 14 -34 q 2 30 4 56 Z" fill={C.hairB} />
            </g>
          ) : (
            <g>
              <path d="M -38 -60 l 14 -48 l 14 26 l 14 -56 l 14 50 l 16 -30 l 14 60 Z" fill={C.hairA} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <path d="M -4 -68 l 6 -34 l 10 30 Z" fill={C.hairB} />
            </g>
          )}
          <ellipse cx={0} cy={0} rx={82} ry={74} fill={SKIN} stroke={INK} strokeWidth={5} />
          {/* ears */}
          <circle cx={-80} cy={6} r={13} fill={SKIN} stroke={INK} strokeWidth={4} />
          <circle cx={80} cy={6} r={13} fill={SKIN} stroke={INK} strokeWidth={4} />
          {/* mask band */}
          <path d="M -80 -16 q 80 -40 160 0 q -2 34 -50 36 q -30 0 -30 -12 q 0 12 -30 12 q -48 -2 -50 -36 Z" fill={C.mask} />
          {/* eyes — big googly whites, pupils that look and blink */}
          {[-36, 36].map((cx, i) => (
            <g key={cx} transform={`translate(${cx} -2) scale(${P.eyeScale} ${P.eyeScale * blink})`}>
              <ellipse cx={0} cy={0} rx={27} ry={31} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} />
              <circle cx={px * (i === 0 ? 1 : 1)} cy={py + 2} r={13 * P.pupil} fill={INK} />
              <circle cx={px + 5} cy={py - 4} r={4.5} fill="#FFFFFF" />
            </g>
          ))}
          {/* brows */}
          <path
            d={`M -62 ${-44 - P.browL} q 24 ${-14 - P.browTilt * 6} 46 ${6 + P.browTilt * 14}`}
            stroke={INK}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M 62 ${-44 - P.browR} q -24 ${-14 - P.browTilt * 6} -46 ${6 + P.browTilt * 14}`}
            stroke={INK}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
          />
          {/* cheeks */}
          <ellipse cx={-58} cy={28} rx={13} ry={8} fill="#FF7F9E" opacity={0.55} />
          <ellipse cx={58} cy={28} rx={13} ry={8} fill="#FF7F9E" opacity={0.55} />
          {/* mouth */}
          {open > 0.06 ? (
            <g>
              <path d={mouthPath} fill="#7A1030" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <path
                d={`M ${-mouthW * 0.55} ${mouthY + smileY * 0.5 + lowerDrop * 0.85} q ${mouthW * 0.55} ${-lowerDrop * 0.6} ${mouthW * 1.1} 0`}
                stroke="#FF6F91"
                strokeWidth={0}
                fill="none"
              />
              <ellipse cx={0} cy={mouthY + smileY * 0.5 + lowerDrop * 0.78} rx={mouthW * 0.5} ry={Math.max(4, lowerDrop * 0.22)} fill="#FF6F91" />
            </g>
          ) : (
            <path d={upper} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          )}
          {kit === "coach" && (
            <g>
              <path d="M -78 -48 Q -82 -110 0 -116 Q 82 -110 78 -48 Z" fill={C.hairA} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <path d="M -90 -46 Q 0 -78 90 -46 Q 100 -34 80 -34 Q 0 -62 -80 -34 Q -100 -34 -90 -46 Z" fill={C.hairB} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <path d="M 4 -106 l -12 22 l 9 0 l -5 18 l 16 -24 l -9 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
            </g>
          )}
          {kit === "racer" && (
            <g>
              <path d="M -86 -32 Q -92 -124 0 -128 Q 92 -124 86 -32 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <path d="M -10 -128 H 10 V -52 H -10 Z" fill="#FF7A1A" />
              <path d="M -88 -30 Q 0 -66 88 -30" stroke="#FF7A1A" strokeWidth={14} fill="none" strokeLinecap="round" />
              <path d="M -70 -62 Q 0 -96 70 -62 L 74 -44 Q 0 -74 -74 -44 Z" fill="#0B0720" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <path d="M -50 -64 q 24 -14 48 -8" stroke="#2EE6FF" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
            </g>
          )}
          {kit === "runner" && (
            <g>
              <path d="M -84 -34 Q 0 -80 84 -34" stroke="#B6FF2E" strokeWidth={15} fill="none" strokeLinecap="round" />
              <path d="M -84 -34 Q 0 -80 84 -34" stroke="#0B0720" strokeWidth={3} fill="none" strokeDasharray="4 12" strokeLinecap="round" />
              <path d="M 80 -40 q 24 -10 20 12 q -8 18 -26 4 Z" fill="#B6FF2E" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
              <path d="M -76 -6 H 76 L 62 22 Q 0 34 -62 22 Z" fill="#0B0720" opacity={0.0} />
            </g>
          )}
          {kit === "trainer" && (
            <g>
              <path d="M -84 -38 Q 0 -78 84 -38" stroke="#FF8A5B" strokeWidth={16} fill="none" strokeLinecap="round" />
              <path d="M -84 -38 Q 0 -78 84 -38" stroke="#FFFFFF" strokeWidth={3} fill="none" strokeDasharray="6 10" strokeLinecap="round" opacity={0.8} />
              <path d="M 82 -40 q 20 -14 18 8 q -6 18 -24 4 Z" fill="#FF8A5B" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
              <rect x={66} y={-6} width={44} height={9} rx={3} fill="#FFD84D" stroke={INK} strokeWidth={3} transform="rotate(-24 88 -2)" />
              <path d="M 106 -14 l 12 -6 l -4 12 Z" fill="#F5C99B" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
            </g>
          )}
          {kit === "lab" && (
            <g>
              {[-36, 36].map((gx) => (
                <g key={gx}>
                  <circle cx={gx} cy={-2} r={38} fill="none" stroke="#2D3E50" strokeWidth={7} />
                  <path d={`M ${gx - 22} -22 q 14 -14 32 -6`} stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} />
                </g>
              ))}
              <path d="M -2 -4 H 2" stroke="#2D3E50" strokeWidth={7} strokeLinecap="round" />
              <path d="M -74 -6 L -86 -10 M 74 -6 L 86 -10" stroke="#2D3E50" strokeWidth={6} strokeLinecap="round" />
            </g>
          )}
          {kit === "pilot" && (
            <g>
              <path d="M -84 -34 Q -88 -118 0 -122 Q 88 -118 84 -34 Z" fill="#3C4A5C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <path d="M 0 -122 V -52" stroke="#FF8A00" strokeWidth={14} />
              <path d="M -88 -30 Q 0 -66 88 -30" stroke="#2A2F3A" strokeWidth={14} fill="none" strokeLinecap="round" />
              {[-32, 32].map((gx) => (
                <g key={gx}>
                  <circle cx={gx} cy={-62} r={20} fill="#2A2F3A" stroke={INK} strokeWidth={4} />
                  <circle cx={gx} cy={-62} r={13} fill="#7FD6FF" />
                  <path d={`M ${gx - 8} -68 q 6 -8 14 -2`} stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" />
                </g>
              ))}
              <rect x={-96} y={-14} width={20} height={40} rx={9} fill="#2A2F3A" stroke={INK} strokeWidth={4} />
              <rect x={76} y={-14} width={20} height={40} rx={9} fill="#2A2F3A" stroke={INK} strokeWidth={4} />
            </g>
          )}
          {kit === "medic" && (
            <g>
              <path d="M -86 -34 Q -90 -124 0 -128 Q 90 -124 86 -34 Z" fill="#FFD400" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <path d="M -6 -128 H 6 V -56 H -6 Z" fill="#E6B800" />
              <path d="M -96 -32 Q 0 -70 96 -32" stroke="#E6B800" strokeWidth={14} fill="none" strokeLinecap="round" />
              <circle cx={0} cy={-84} r={17} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
              <circle cx={0} cy={-84} r={9} fill="#FFF3A0" />
            </g>
          )}
          {kit === "apron" && (
            <g transform="rotate(-8)">
              <path d="M -46 -62 L 6 -168 L 52 -62 Z" fill="#FF6F6F" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <path d="M -30 -94 L 38 -100 M -38 -78 L 44 -84" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" />
              <circle cx={6} cy={-172} r={14} fill="#FFE45C" stroke={INK} strokeWidth={4} />
              <path d="M -50 -62 H 56" stroke="#41D8B0" strokeWidth={9} strokeLinecap="round" />
            </g>
          )}
          {kit === "host" && (
            <g>
              <ellipse cx={0} cy={-62} rx={92} ry={16} fill="#2A1A5C" stroke={INK} strokeWidth={5} />
              <path d="M -56 -64 L -50 -156 Q 0 -168 50 -156 L 56 -64 Z" fill="#3B2680" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <path d="M -54 -86 H 54" stroke="#FF6F6F" strokeWidth={14} />
              <path d="M 0 -150 l 6 12 l 14 2 l -10 10 l 3 14 l -13 -7 l -13 7 l 3 -14 l -10 -10 l 14 -2 Z" fill="#FFE45C" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" transform="scale(0.55) translate(0 40)" />
            </g>
          )}
          {kit === "ref" && <path d="M -78 -44 Q 0 -78 78 -44" stroke="#FFFFFF" strokeWidth={11} fill="none" strokeLinecap="round" />}
          {/* sweat drop (worry/shock) */}
          {P.sweat > 0.05 && (
            <path
              d={`M 78 ${-30 + ((t * 70) % 40) * 0.5} q 12 22 0 32 q -12 -10 0 -32 Z`}
              fill="#8FDBFF"
              stroke="#2B8FC9"
              strokeWidth={3}
              opacity={P.sweat}
            />
          )}
        </g>
      </g>
    </g>
  );
};
