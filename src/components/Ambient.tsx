// The ONE global ambient layer. Mounted once, on the absolute frame, outside every
// scene — a per-scene copy restarts its drift at each cut and the orbs visibly jump.
// Ported from BackgroundImage.swift, with wall-clock time replaced by frame time so
// renders are deterministic and frame 0 is a finished image.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AMBIENT_GRADIENT,
  ORBS,
  ORB_SCALE,
  SPARKLES,
  SPARKLE_COLOR,
  ORB_PEAK,
} from "../data/tokens";

const gradientCss = `linear-gradient(135deg, ${AMBIENT_GRADIENT.map(
  (s) => `${s.color} ${s.at * 100}%`
).join(", ")})`;

// 8-point star, first vertex at -π/4 — matches drawSparkles()
const starPoints = (cx: number, cy: number, r: number): string => {
  const ir = r * 0.25;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 4;
    const rad = i % 2 === 0 ? r : ir;
    pts.push(`${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`);
  }
  return pts.join(" ");
};

export const Ambient: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const minDim = Math.min(width, height);
  const amp = height * 0.025;

  return (
    <AbsoluteFill style={{ background: gradientCss }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {ORBS.map((o, i) => (
            <radialGradient key={i} id={`orb${i}`}>
              <stop offset="0%" stopColor={o.color} stopOpacity={ORB_PEAK} />
              <stop offset="60%" stopColor={o.color} stopOpacity={ORB_PEAK * 0.36} />
              <stop offset="100%" stopColor={o.color} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>

        {ORBS.map((o, i) => {
          const r = o.radius * ORB_SCALE;
          const cx = o.cx * width + Math.sin(t * o.speed * Math.PI + o.phase) * o.drift;
          const cy =
            o.cy * height +
            Math.cos(t * o.speed * Math.PI + o.phase + 1.0) * o.drift * 0.6;
          return <circle key={i} cx={cx} cy={cy} r={r} fill={`url(#orb${i})`} />;
        })}

        {SPARKLES.map((s, i) => {
          const cx = s.cx * width;
          const cy = s.cy * height + Math.sin(t * s.speed * Math.PI + s.phase) * amp;
          return (
            <polygon
              key={i}
              points={starPoints(cx, cy, s.size * minDim)}
              fill={SPARKLE_COLOR}
              opacity={0.11}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
