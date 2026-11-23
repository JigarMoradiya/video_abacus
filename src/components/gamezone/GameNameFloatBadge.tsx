// PARENT-BEAT GAME BADGE — the actual "3 + 7 = 10" balloon equation from the game's own
// difficulty-select screen (three balloons with an operator between them), with just the
// game's name underneath. Reuses the real balloon shape + the real BALLOON_PALETTE colors
// so it reads as "the actual game", not a generic decoration.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";
import { BALLOON_PALETTE } from "./sims/BalloonPopSim";

interface EquationBalloon {
  label: string;
  colorIdx: number;
}

export const GameNameFloatBadge: React.FC<{
  frame: number;
  fps: number;
  startFrame: number;
  title: string;
  equation?: EquationBalloon[];
  operators?: string[];
  x: number;
  y: number;
  width: number;
}> = ({
  frame,
  fps,
  startFrame,
  title,
  equation = [
    { label: "3", colorIdx: 0 },
    { label: "7", colorIdx: 1 },
    { label: "10", colorIdx: 5 },
  ],
  operators = ["+", "="],
  x,
  y,
  width,
}) => {
  const pop = interpolate(frame, [startFrame, startFrame + 8, startFrame + 14], [0.3, 1.1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [startFrame, startFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = frame / fps;
  const bw = 92;
  const bh = 106;
  const gap = 56;
  const stripH = bh + 40;
  const n = equation.length;
  const totalW = n * bw + (n - 1) * gap;
  const startX = (width - totalW) / 2;

  return (
    <div style={{ position: "absolute", left: x, top: y, width, opacity, transform: `scale(${pop})` }}>
      <svg width={width} height={stripH} viewBox={`0 0 ${width} ${stripH}`} style={{ overflow: "visible" }}>
        {equation.map((b, i) => {
          const cx = startX + i * (bw + gap) + bw / 2;
          const bob = Math.sin(t * 1.8 + i * 1.2) * 6;
          const cy = stripH * 0.42 + bob;
          const color = BALLOON_PALETTE[b.colorIdx % BALLOON_PALETTE.length];
          return (
            <g key={i}>
              <path
                d={`M ${cx},${cy + bh / 2} q 8,12 0,24 q -8,12 0,24`}
                fill="none"
                stroke="#8D6E63"
                strokeWidth={3}
              />
              <ellipse cx={cx} cy={cy} rx={bw / 2} ry={bh / 2} fill={color} />
              <ellipse cx={cx - bw * 0.18} cy={cy - bh * 0.2} rx={bw * 0.14} ry={bh * 0.11} fill="#FFFFFF" opacity={0.4} />
              <text x={cx} y={cy + 14} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={38} fill="#FFFFFF" stroke="rgba(0,0,0,0.18)" strokeWidth={1}>
                {b.label}
              </text>
              {i < n - 1 && (
                <text x={cx + bw / 2 + gap / 2} y={cy + 14} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={44} fill="#E8432C">
                  {operators[i] ?? "+"}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: "center", marginTop: 6 }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 800,
            fontSize: 46,
            color: "#FFFFFF",
            textShadow: "0 4px 0 rgba(0,0,0,0.22)",
            background: "rgba(0,0,0,0.14)",
            borderRadius: 999,
            padding: "6px 30px",
          }}
        >
          {title}
        </span>
      </div>
    </div>
  );
};
