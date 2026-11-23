// Shared stage dressing for the Bead Buddies remakes: the cast pair/trio at a point, and a world's set-piece critters at the edges.
import React from "react";
import { Otter, type OtterMood, type Costume, type OtterProp, type OtterRole } from "./Otter";
import { Critter, type CritterKind } from "./Critters";
import type { DinoMood } from "../e08/Dino";

export const CAST_BOX = { up: 300, down: 30, half: 96 };
/** the pair's geometry at pair scale 1: the gap between the two bodies and the half-width of the group */
export const PAIR_GAP = 122;
export const OT_K = 1.22;
export const pairHalf = (n = 2) => (n === 3 ? PAIR_GAP * 1.5 + CAST_BOX.half * OT_K : PAIR_GAP + CAST_BOX.half * OT_K);
export const castRect = (m: { x: number; y: number; scale: number }, n = 2) => ({
  x: m.x - pairHalf(n) * m.scale,
  y: m.y - CAST_BOX.up * OT_K * m.scale,
  w: pairHalf(n) * 2 * m.scale,
  h: (CAST_BOX.up + CAST_BOX.down) * OT_K * m.scale,
});

export interface Actor {
  role: OtterRole;
  mood: OtterMood;
  prop?: OtterProp;
  /** 0 = not on stage yet (its slot stays empty), 0..1 pops in, 1 = present (default) */
  enter?: number;
  /** 0..1: the number crown is worn (default 1); keep 0 until the friend has been introduced */
  crown?: number;
}

/** The cast standing together at (x, y) on the ground. Draws soft ground shadows (ground=true) so they stand on something. */
export const CastGroup: React.FC<{
  x: number;
  y: number;
  scale: number;
  actors: Actor[];
  costume?: Costume;
  progress: number;
  frame: number;
  fps: number;
  look?: number;
  shadow?: string | null;
  /** name tags on the belly (default on: ME / SMALL FRIEND / BIG FRIEND) */
  tags?: boolean;
}> = ({ x, y, scale, actors, costume, progress, frame, fps, look = -1, shadow = "#000000", tags = true }) => {
  const n = actors.length;
  const gap = PAIR_GAP * scale * (n === 3 ? 1.12 : 1);
  return (
    <>
      {actors.map((a, i) => {
        const ox = (i - (n - 1) / 2) * 2 * gap;
        const size = { little: 0.7, middle: 0.85, big: 1 }[a.role];
        const en = a.enter ?? 1;
        if (en <= 0.001) return null;
        const ez = en >= 1 ? 1 : 1 - Math.pow(1 - en, 3);
        const sp = en >= 1 ? 1 : 0.3 + 0.7 * ez + Math.sin(ez * Math.PI) * 0.12;
        return (
          <g key={a.role} opacity={Math.min(1, en * 3)} transform={`translate(${x + ox} ${y}) scale(${sp}) translate(${-(x + ox)} ${-y})`}>
            {shadow && <ellipse cx={x + ox} cy={y + 4} rx={74 * size * OT_K * scale} ry={11 * scale} fill={shadow} opacity={0.2} />}
            <Otter x={x + ox} y={y} scale={scale * OT_K} role={a.role} mood={a.mood} prop={a.prop} costume={costume} look={look} phase={i * 0.7} progress={progress} frame={frame} fps={fps} famScale={scale * OT_K} tag={tags} crown={a.crown ?? 1} />
          </g>
        );
      })}
    </>
  );
};

export interface Piece {
  kind: CritterKind;
  x: number;
  y: number;
  scale: number;
  facing?: 1 | -1;
  seed?: number;
  /** only draw when true (default true) */
  show?: boolean;
}

export const Pieces: React.FC<{ pieces: Piece[]; mood: DinoMood; frame: number; fps: number }> = ({ pieces, mood, frame, fps }) => (
  <>
    {pieces.filter((p) => p.show !== false).map((p, i) => (
      <Critter key={i} kind={p.kind} x={p.x} y={p.y} scale={p.scale} mood={mood} frame={frame} fps={fps} facing={p.facing} seed={p.seed ?? i} />
    ))}
  </>
);

/** the standard mood for set-piece characters: alive on the hook, answers and close; head-tilt when the lesson is stuck/thinking; calm otherwise. */
export const pieceMood = (alive: boolean, unsure: boolean): DinoMood => (alive ? "cheer" : unsure ? "tilt" : "calm");

/** Soft twinkling stars drifting around the middle: gives the static next-video teaser a small continuous motion (motion_check). */
export const Twinkles: React.FC<{ frame: number; W: number; H: number; /** a card the stars must not touch: they fade out as they drift over it */ avoid?: { x: number; y: number; w: number; h: number } }> = ({ frame, W, H, avoid }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
    {Array.from({ length: 16 }, (_, i) => {
      const t = frame / 30;
      const x = W * (0.2 + 0.6 * ((i * 0.37 + 0.11) % 1)) + Math.sin(t * 1.3 + i) * 30;
      const y = H * (0.18 + 0.56 * ((i * 0.53 + 0.07) % 1)) + Math.cos(t * 1.1 + i) * 24;
      const k = 0.55 + 0.45 * Math.sin(t * 2.4 + i * 1.7);
      const r = 16 + 16 * k;
      // distance from the star's centre to the avoid box; invisible within r + 30 px of it, full strength 90 px away
      const dx = avoid ? Math.max(avoid.x - x, 0, x - (avoid.x + avoid.w)) : 999;
      const dy = avoid ? Math.max(avoid.y - y, 0, y - (avoid.y + avoid.h)) : 999;
      const away = Math.min(1, Math.max(0, (Math.hypot(dx, dy) - (r + 30)) / 60));
      if (away <= 0) return null;
      return <path key={i} transform={`translate(${x} ${y}) rotate(${t * 40 + i * 20})`} d={`M 0 ${-r} L ${r * 0.28} ${-r * 0.28} L ${r} 0 L ${r * 0.28} ${r * 0.28} L 0 ${r} L ${-r * 0.28} ${r * 0.28} L ${-r} 0 L ${-r * 0.28} ${-r * 0.28} Z`} fill="#FFD23F" stroke="#B3580A" strokeWidth={2} opacity={(0.5 + 0.5 * k) * away} />;
    })}
  </svg>
);

/** Largest scale (<= base) at which a group of half-width `half` fits between the abacus' right edge (+gap) and the frame edge (-24). */
export const castFit = (box: { left: number; w: number }, L: { W: number }, base: number, half: number, gap: number): number =>
  Math.max(0.3, Math.min(base, (L.W - 130 - (box.left + box.w + gap)) / (2 * half)));
