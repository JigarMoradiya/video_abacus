// One world per beat. This is the layer that makes the video feel like a place rather
// than a UI screen, and the reason no two stretches of the episode look alike.
//
// Still ONE instance for the whole episode: the world's props change, the component
// never remounts, so cloud drift and star twinkle keep running across a scene change
// instead of jumping back to their start.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { WORLDS, type WorldKind } from "../data/theme";

const rand = (i: number): number => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const World: React.FC<{ kind: WorldKind }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = frame / fps;
  const w = WORLDS[kind];
  const groundY = H * 0.74;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${w.sky[0]} 0%, ${w.sky[1]} 100%)`,
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="sunG">
            <stop offset="0%" stopColor="#FFF3B0" />
            <stop offset="70%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FFC107" />
          </radialGradient>
          <radialGradient id="vig">
            <stop offset="45%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.62} />
          </radialGradient>
        </defs>

        {/* blueprint grid — reads as a technical drawing while parts get named */}
        {w.grid && (
          <g opacity={0.3}>
            {Array.from({ length: Math.ceil(W / 80) }, (_, i) => (
              <line
                key={`v${i}`}
                x1={i * 80}
                y1={0}
                x2={i * 80}
                y2={H}
                stroke={w.accent}
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: Math.ceil(H / 80) }, (_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                y1={i * 80}
                x2={W}
                y2={i * 80}
                stroke={w.accent}
                strokeWidth={1}
              />
            ))}
          </g>
        )}

        {/* stars — twinkle is deterministic from frame time */}
        {w.stars &&
          Array.from({ length: 60 }, (_, i) => {
            const x = rand(i + 1) * W;
            const y = rand(i + 91) * H * 0.8;
            const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.7 + i));
            return (
              <circle key={i} cx={x} cy={y} r={rand(i + 41) * 3 + 1.4} fill="#FFF" opacity={tw * 0.9} />
            );
          })}

        {w.sun && (
          <g>
            <circle cx={W * 0.09} cy={H * 0.14} r={92} fill="url(#sunG)" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2 + t * 0.12;
              const r1 = 108;
              const r2 = 108 + 34 + Math.sin(t * 1.4 + i) * 8;
              return (
                <line
                  key={i}
                  x1={W * 0.09 + Math.cos(a) * r1}
                  y1={H * 0.14 + Math.sin(a) * r1}
                  x2={W * 0.09 + Math.cos(a) * r2}
                  y2={H * 0.14 + Math.sin(a) * r2}
                  stroke="#FFD54F"
                  strokeWidth={9}
                  strokeLinecap="round"
                  opacity={0.85}
                />
              );
            })}
          </g>
        )}

        {/* Clouds drift across and wrap, so there is always motion on screen.
            Built from overlapping lobes of varied size and offset — a cartoon cloud is a
            union of blobs, and every cloud gets its own arrangement so five clouds do not
            read as one repeated. An earlier attempt drew a single path with bumps along a
            flat baseline and came out as a row of humps. */}
        {w.clouds &&
          Array.from({ length: 5 }, (_, i) => {
            const speed = 13 + i * 5;
            const x = ((rand(i + 7) * W + t * speed) % (W + 560)) - 280;
            const y = H * (0.07 + rand(i + 23) * 0.25);
            const s = 0.7 + rand(i + 55) * 0.75;
            const lobeCount = 4 + Math.floor(rand(i + 71) * 3); // 4-6

            const lobes = Array.from({ length: lobeCount }, (_, k) => {
              const f = k / (lobeCount - 1); // 0..1 across the cloud
              const rx = 42 + rand(i * 31 + k * 7 + 1) * 46;
              const ry = rx * (0.62 + rand(i * 37 + k * 11 + 2) * 0.3);
              return {
                cx: -120 + f * 240 + (rand(i * 41 + k * 13 + 3) - 0.5) * 34,
                // bigger lobes sit higher, and the bottoms stay near the same line
                cy: -ry * (0.35 + rand(i * 43 + k * 17 + 4) * 0.5),
                rx,
                ry,
              };
            });

            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
                {/* flat-ish base so the cloud sits on air rather than floating as blobs */}
                <ellipse cx={0} cy={0} rx={148} ry={34} fill="#FFFFFF" opacity={0.97} />
                {lobes.map((l, k) => (
                  <ellipse
                    key={k}
                    cx={l.cx}
                    cy={l.cy}
                    rx={l.rx}
                    ry={l.ry}
                    fill="#FFFFFF"
                    opacity={0.97}
                  />
                ))}
                {/* faint shading along the underside */}
                <ellipse cx={6} cy={12} rx={132} ry={20} fill="#CFE4F5" opacity={0.45} />
              </g>
            );
          })}

        {/* rolling hills */}
        {w.hills && w.ground && (
          <g>
            <path
              d={`M 0 ${groundY + 40} Q ${W * 0.22} ${groundY - 70} ${W * 0.5} ${groundY + 10} T ${W} ${groundY - 20} L ${W} ${H} L 0 ${H} Z`}
              fill={w.ground}
              opacity={0.55}
            />
            <path
              d={`M 0 ${groundY + 90} Q ${W * 0.3} ${groundY + 4} ${W * 0.62} ${groundY + 70} T ${W} ${groundY + 30} L ${W} ${H} L 0 ${H} Z`}
              fill={w.ground}
            />
          </g>
        )}

        {/* heaven / earth split — the beam's own metaphor, used while the two
            sections are being named */}
        {kind === "heavenearth" && (
          <g>
            <rect x={0} y={H * 0.46} width={W} height={H * 0.54} fill={w.ground} opacity={0.92} />
            <rect x={0} y={H * 0.455} width={W} height={12} fill="#FFF" opacity={0.5} />
          </g>
        )}

        {/* small-vs-big divider */}
        {kind === "compare" && (
          <line
            x1={W * 0.5}
            y1={0}
            x2={W * 0.5}
            y2={H}
            stroke="#FFF"
            strokeWidth={6}
            opacity={0.4}
            strokeDasharray="22 18"
          />
        )}

        {/* workbench surface for the finger close-up */}
        {kind === "bench" && w.ground && (
          <g>
            <rect x={0} y={H * 0.78} width={W} height={H * 0.22} fill={w.ground} />
            <rect x={0} y={H * 0.78} width={W} height={10} fill="#DDA15E" />
          </g>
        )}

        {/* chalkboard tray */}
        {kind === "chalk" && (
          <g>
            <rect x={70} y={70} width={W - 140} height={H - 260} rx={18} fill="#000" opacity={0.14} />
            <rect x={0} y={H * 0.82} width={W} height={H * 0.18} fill="#6D4326" />
          </g>
        )}

        {w.confetti &&
          Array.from({ length: 70 }, (_, i) => {
            const x = rand(i + 3) * W;
            const fall = ((t * (90 + rand(i + 17) * 110) + rand(i + 29) * H) % (H + 160)) - 80;
            const col = ["#F4511E", "#FFD166", "#4CAF50", "#42A5F5", "#AB47BC"][i % 5];
            const rot = t * 180 + i * 37;
            return (
              <rect
                key={i}
                x={x}
                y={fall}
                width={16}
                height={26}
                rx={4}
                fill={col}
                transform={`rotate(${rot} ${x + 8} ${fall + 13})`}
                opacity={0.92}
              />
            );
          })}

        {w.vignette && <rect x={0} y={0} width={W} height={H} fill="url(#vig)" />}
      </svg>
    </AbsoluteFill>
  );
};

/** Cross-fade helper: worlds swap over ~10 frames so a scene change is never a hard cut. */
export const worldFade = (frame: number, startFrame: number): number =>
  interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
