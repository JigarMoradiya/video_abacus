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
            // Cloud lobes are absolute px, tuned against a 1920 frame. Left alone in the
            // 1080-wide 4:5 cut they filled a third of the sky and swallowed the headline.
            const fit = H > W ? 0.58 : 1;
            const s = (0.7 + rand(i + 55) * 0.75) * fit;
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
        {w.horizon && w.ground && (
          <g>
            <rect
              x={0}
              y={H * w.horizon.at}
              width={W}
              height={H * w.horizon.h}
              fill={w.ground}
              opacity={0.92}
            />
            <rect x={0} y={H * (w.horizon.at - 0.005)} width={W} height={12} fill="#FFF" opacity={0.5} />
          </g>
        )}

        {/* two things side by side */}
        {w.divider && (
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

        {/* a surface to work on */}
        {w.surface && w.ground && (
          <g>
            <rect x={0} y={H * w.surface.at} width={W} height={H * w.surface.h} fill={w.ground} />
            <rect x={0} y={H * w.surface.at} width={W} height={10} fill={w.surface.edge} />
          </g>
        )}

        {/* board + tray */}
        {w.slate && (
          <g>
            <rect x={70} y={70} width={W - 140} height={H - 260} rx={18} fill="#000" opacity={0.14} />
            <rect x={0} y={H * 0.82} width={W} height={H * 0.18} fill={w.slate.tray} />
          </g>
        )}

        {/* Still water. The zero world: the pond is flat because nothing has been counted
            yet, so the only motion is the ripples and a lily pad turning. */}
        {w.water && (
          <g>
            <rect
              x={0}
              y={H * w.water.at}
              width={W}
              height={H * (1 - w.water.at) + 2}
              fill="#2C3E70"
              opacity={0.55}
            />
            <rect x={0} y={H * w.water.at} width={W} height={5} fill="#FFF" opacity={0.35} />
            {/* reflection bands, widening with distance so the surface reads as flat */}
            {Array.from({ length: 7 }, (_, i) => {
              const y = H * w.water!.at + 26 + i * 44;
              const phase = Math.sin(t * 0.7 + i * 0.9);
              const half = (W * (0.1 + i * 0.055)) / 2;
              return (
                <rect
                  key={`rf${i}`}
                  x={W * 0.5 - half + phase * 22}
                  y={y}
                  width={half * 2}
                  height={7}
                  rx={3.5}
                  fill="#FFE0C0"
                  opacity={0.16 + 0.05 * Math.cos(t * 0.9 + i)}
                />
              );
            })}
            {/* lily pads: a notched disc each, drifting a few px and rocking */}
            {[
              { x: 0.10, y: 0.12, r: 84 },
              { x: 0.88, y: 0.26, r: 72 },
              { x: 0.22, y: 0.58, r: 64 },
              { x: 0.78, y: 0.68, r: 96 },
            ].map((pad, i) => {
              const cx = W * pad.x + Math.sin(t * 0.35 + i * 1.7) * 9;
              const cy = H * w.water!.at + (H * (1 - w.water!.at)) * pad.y;
              const rock = Math.sin(t * 0.5 + i) * 4;
              return (
                <g key={`lp${i}`} transform={`rotate(${rock} ${cx} ${cy})`}>
                  <ellipse cx={cx} cy={cy + 5} rx={pad.r} ry={pad.r * 0.34} fill="#0E2044" opacity={0.35} />
                  <ellipse cx={cx} cy={cy} rx={pad.r} ry={pad.r * 0.36} fill="#3E7D3A" />
                  <ellipse cx={cx} cy={cy - 3} rx={pad.r * 0.9} ry={pad.r * 0.3} fill="#57A050" />
                  {/* the notch every lily pad has */}
                  <path
                    d={`M ${cx} ${cy} L ${cx + pad.r * 0.85} ${cy - pad.r * 0.13} L ${cx + pad.r * 0.85} ${cy + pad.r * 0.13} Z`}
                    fill="#2C3E70"
                    opacity={0.5}
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ONE big star, for the one bead that is worth five on its own. Slow: the reveal
            is the subject and a fast sparkle would compete with it. */}
        {w.starburst && (
          // Off-centre on purpose: at mid-frame it sat behind the abacus. In portrait the
          // abacus spans most of the width, so the only clear space is ABOVE it.
          <g
            transform={`translate(${W * (H > W ? 0.2 : 0.17)} ${H * (H > W ? 0.11 : 0.26)})`}
            opacity={0.9}
          >
            <g transform={`rotate(${t * 6})`}>
              {Array.from({ length: 12 }, (_, i) => (
                <rect
                  key={`ray${i}`}
                  x={-4}
                  y={-260}
                  width={8}
                  height={130 + (i % 2) * 60}
                  rx={4}
                  fill="#FFD54F"
                  opacity={0.4}
                  transform={`rotate(${i * 30})`}
                />
              ))}
            </g>
            <g transform={`scale(${1 + Math.sin(t * 1.1) * 0.05})`}>
              <circle r={96} fill="#FFF3B0" opacity={0.28} />
              <circle r={62} fill="url(#sunG)" />
            </g>
          </g>
        )}

        {/* Balloons going up — a send-off, not a party. Each drifts at its own rate and
            they wrap, so the close never runs out of them. */}
        {w.balloons &&
          Array.from({ length: 11 }, (_, i) => {
            const x = W * (0.05 + rand(i + 5) * 0.9) + Math.sin(t * 0.5 + i) * 26;
            const speed = 42 + rand(i + 11) * 46;
            const y = H + 120 - ((t * speed + rand(i + 23) * (H + 240)) % (H + 240));
            const r = 34 + rand(i + 31) * 16;
            const col = ["#EF5350", "#FFCA28", "#42A5F5", "#66BB6A", "#AB47BC", "#FF7043"][i % 6];
            return (
              <g key={`bl${i}`} transform={`rotate(${Math.sin(t * 0.6 + i) * 5} ${x} ${y})`}>
                <path
                  d={`M ${x} ${y + r * 1.15} Q ${x + 7} ${y + r * 1.7} ${x} ${y + r * 2.3}`}
                  stroke="#7A4B2A"
                  strokeWidth={2.5}
                  fill="none"
                  opacity={0.7}
                />
                <ellipse cx={x} cy={y} rx={r} ry={r * 1.14} fill={col} />
                <ellipse cx={x - r * 0.32} cy={y - r * 0.38} rx={r * 0.24} ry={r * 0.3} fill="#FFF" opacity={0.45} />
                <path d={`M ${x - 6} ${y + r * 1.1} L ${x + 6} ${y + r * 1.1} L ${x} ${y + r * 1.26} Z`} fill={col} />
              </g>
            );
          })}

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
