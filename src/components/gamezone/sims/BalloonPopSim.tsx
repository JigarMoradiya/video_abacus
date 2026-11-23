// BALLOON POP SIM — a scripted, frame-driven recreation of the real game (iOS "Balloon Make
// Ten"), not a playable engine. Colors, target-capsule styling and the balloon silhouette are
// copied from the app (MakeTenBalloonCell palette, BalloonShape ellipse+wavy rope, white
// capsule target with the FF8400 stroke and E65100 text) so parents recognize the actual game
// when they open the store. The reel file supplies the storyboard: which balloons exist, when
// each spawns, and when one gets popped (or wrongly tapped and wiggles).

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

/** the app's own balloon palette — MakeTenBalloonCell.swift */
export const BALLOON_PALETTE = ["#FF6B6B", "#4ECDC4", "#FFC107", "#9B59B6", "#0074D5", "#FF8400", "#2ECC71", "#E91E63"];

export interface BalloonSpec {
  number: number;
  colorIdx: number;
  /** horizontal center, as a fraction of sim width */
  x: number;
  spawnFrame: number;
  /** rise speed in px/second */
  riseSpeed: number;
  /** if set, a tap-ring appears just before this frame and the balloon bursts on it */
  popAt?: number;
  /** if set, a tap-ring appears and the balloon just wiggles (the app's no-penalty wrong tap) */
  wiggleAt?: number;
  /** wrong-answer pops don't feed the streak chip */
  countsForStreak?: boolean;
  scale?: number;
}

const BURST_FRAMES = 14;

const TapRing: React.FC<{ frame: number; at: number; x: number; y: number }> = ({ frame, at, x, y }) => {
  // ring closes in over the 8 frames before the tap lands
  const p = interpolate(frame, [at - 8, at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < at - 8 || frame > at + 4) return null;
  return (
    <circle
      cx={x}
      cy={y}
      r={interpolate(p, [0, 1], [86, 52])}
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={7}
      opacity={interpolate(p, [0, 0.3, 1], [0, 1, 1])}
    />
  );
};

const Burst: React.FC<{ frame: number; at: number; x: number; y: number; color: string }> = ({ frame, at, x, y, color }) => {
  const local = frame - at;
  if (local < 0 || local > BURST_FRAMES) return null;
  const p = local / BURST_FRAMES;
  const ease = 1 - Math.pow(1 - p, 2);
  return (
    <g opacity={1 - p}>
      {Array.from({ length: 10 }, (_, i) => {
        const ang = (i / 10) * Math.PI * 2 + (i % 3) * 0.3;
        const dist = (52 + (i % 3) * 22) * ease;
        return <circle key={i} cx={x + Math.cos(ang) * dist} cy={y + Math.sin(ang) * dist} r={9 - p * 5} fill={color} />;
      })}
    </g>
  );
};

export const BalloonPopSim: React.FC<{
  frame: number;
  fps: number;
  width: number;
  height: number;
  balloons: BalloonSpec[];
  targetText?: string;
  /** when the target capsule pops in; omit to hide it */
  targetInAt?: number;
  showStreak?: boolean;
  /** absolute px from the top of this box where the target capsule sits — lets the rise
   *  area extend well above the capsule (all the way to the screen top) without moving it */
  targetTop?: number;
}> = ({ frame, fps, width, height, balloons, targetText, targetInAt, showStreak = false, targetTop = 0 }) => {
  // Balloons spawn at height+bh, i.e. centered just below the box's own bottom edge (=the
  // world's visual ground line, passed in as `height`). Since the SVG viewBox stops at
  // `height` with overflow hidden, that spawn point renders fully off-canvas already — the
  // balloon only appears once it's risen enough to cross back above the ground line, which
  // reads as it emerging from the ground instead of popping into view mid-air.
  const ground = height;
  const streak = balloons.filter((b) => b.popAt !== undefined && b.popAt <= frame && b.countsForStreak !== false).length;
  const lastPopAt = Math.max(0, ...balloons.filter((b) => b.popAt !== undefined && b.popAt <= frame && b.countsForStreak !== false).map((b) => b.popAt as number));
  const streakPop = 1 + Math.max(0, interpolate(frame, [lastPopAt, lastPopAt + 5, lastPopAt + 12], [0, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const targetIn =
    targetInAt === undefined
      ? 0
      : interpolate(frame, [targetInAt, targetInAt + 8, targetInAt + 14], [0, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "relative", width, height, overflow: "visible" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {balloons.map((b, i) => {
          if (frame < b.spawnFrame) return null;
          const popped = b.popAt !== undefined && frame >= b.popAt;
          const t = (frame - b.spawnFrame) / fps;
          const s = b.scale ?? 1;
          const bw = 118 * s;
          const bh = 136 * s;
          const cx = b.x * width + Math.sin(t * 1.6 + i * 1.3) * 13;
          const cy = ground + bh - t * b.riseSpeed;
          const color = BALLOON_PALETTE[b.colorIdx % BALLOON_PALETTE.length];

          // the no-penalty wrong tap: the balloon shakes for ~16 frames, keeps rising
          const wiggle =
            b.wiggleAt !== undefined && frame >= b.wiggleAt && frame <= b.wiggleAt + 18
              ? Math.sin((frame - b.wiggleAt) * 1.4) * 9 * (1 - (frame - b.wiggleAt) / 18)
              : 0;

          return (
            <g key={i}>
              {!popped && cy > -bh && (
                <g transform={`rotate(${wiggle} ${cx} ${cy})`}>
                  {/* rope — the app's wavy 4-segment rope */}
                  <path
                    d={`M ${cx},${cy + bh / 2} q ${14 * s},${16 * s} 0,${32 * s} q ${-14 * s},${16 * s} 0,${32 * s}`}
                    fill="none"
                    stroke="#8D6E63"
                    strokeWidth={3.5 * s}
                  />
                  <path d={`M ${cx},${cy + bh / 2} l ${-8 * s},${12 * s} l ${16 * s},0 Z`} fill={color} />
                  <ellipse cx={cx} cy={cy} rx={bw / 2} ry={bh / 2} fill={color} />
                  <ellipse cx={cx - bw * 0.18} cy={cy - bh * 0.2} rx={bw * 0.14} ry={bh * 0.11} fill="#FFFFFF" opacity={0.4} />
                  <text
                    x={cx}
                    y={cy + 16 * s}
                    textAnchor="middle"
                    fontFamily={KID_FONT}
                    fontWeight={700}
                    fontSize={52 * s}
                    fill="#FFFFFF"
                    stroke="rgba(0,0,0,0.18)"
                    strokeWidth={1}
                  >
                    {b.number}
                  </text>
                </g>
              )}
              {b.popAt !== undefined && (
                <>
                  <TapRing frame={frame} at={b.popAt} x={b.x * width + Math.sin(((b.popAt - b.spawnFrame) / fps) * 1.6 + i * 1.3) * 13} y={height + bh - ((b.popAt - b.spawnFrame) / fps) * b.riseSpeed} />
                  <Burst frame={frame} at={b.popAt} x={b.x * width + Math.sin(((b.popAt - b.spawnFrame) / fps) * 1.6 + i * 1.3) * 13} y={height + bh - ((b.popAt - b.spawnFrame) / fps) * b.riseSpeed} color={color} />
                </>
              )}
              {b.wiggleAt !== undefined && !popped && (
                <TapRing frame={frame} at={b.wiggleAt} x={cx} y={cy} />
              )}
            </g>
          );
        })}
      </svg>

      {/* the target capsule — white 0.9 capsule, FF8400 stroke, E65100 heavy text, like the
          app, scaled up + given a slow idle pulse so it stays the loudest thing on screen
          (this is the one line every balloon in the round refers back to). */}
      {targetText && targetIn > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: targetTop,
            left: 0,
            width,
            textAlign: "center",
            transform: `scale(${targetIn * (1 + Math.sin((frame / fps) * 1.8) * 0.02)})`,
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 60,
              color: "#E65100",
              background: "rgba(255,255,255,0.96)",
              border: "4px solid #FF8400",
              borderRadius: 999,
              padding: "16px 46px",
              boxShadow: "0 8px 0 rgba(0,0,0,0.18)",
            }}
          >
            {targetText}
          </span>
        </div>
      )}

      {showStreak && streak > 0 && (
        <div style={{ position: "absolute", top: targetTop + 118, left: 0, width, textAlign: "center", transform: `scale(${streakPop})` }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 32,
              color: "#FFF",
              background: "#FF8400",
              borderRadius: 999,
              padding: "6px 22px",
              boxShadow: "0 5px 0 rgba(0,0,0,0.2)",
            }}
          >
            🔥 ×{streak}
          </span>
        </div>
      )}
    </div>
  );
};
