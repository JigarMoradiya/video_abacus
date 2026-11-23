// DINO VALLEY — E08's world (the Bead Buddies pilot). CALM AND SMOOTH, NOT FULL: a soft sky gradient, two rolling hills, a faint
// volcano with a slow smoke plume, a sun, and ferns / eggs only at the far left and right edges and along the ground, all low
// contrast and slightly blurred, with a clean open middle behind the abacus, the cards and the caption. Slow sway only.
import React from "react";
import type { WorldTheme } from "../../data/theme";

type Dino = NonNullable<WorldTheme["dino"]>;
const soft = (px: number) => ({ filter: `blur(${px}px)` });

const Fern: React.FC<{ x: number; base: number; h: number; t: number; seed: number; fill: string }> = ({ x, base, h, t, seed, fill }) => {
  const fronds = 7;
  return (
    <g>
      {Array.from({ length: fronds }, (_, i) => {
        const a = -Math.PI * 0.5 + ((i - (fronds - 1) / 2) / fronds) * 2.1 + Math.sin(t * 0.5 + seed + i) * 0.03;
        const len = h * (0.75 + 0.25 * Math.cos((i - 3) * 0.5));
        const ex = x + Math.cos(a) * len;
        const ey = base + Math.sin(a) * len;
        const cx = x + Math.cos(a) * len * 0.5 + (i - 3) * 6;
        const cy = base + Math.sin(a) * len * 0.62;
        return <path key={i} d={`M ${x} ${base} Q ${cx} ${cy} ${ex} ${ey}`} stroke={fill} strokeWidth={14} strokeLinecap="round" fill="none" />;
      })}
    </g>
  );
};

export const DinoLayer: React.FC<{ dino: Dino; t: number; W: number; H: number }> = ({ dino, t, W, H }) => {
  const floor = H * 0.88;
  const edge = Math.max(210, W * 0.11);
  return (
    <g>
      <defs>
        <radialGradient id="dinoSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={dino.sun ?? "#FFF1B8"} stopOpacity={0.95} />
          <stop offset="100%" stopColor={dino.sun ?? "#FFF1B8"} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="dinoEdgeL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity={1} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="dinoEdgeR" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity={1} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id="dinoEdgeMask" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect x={0} y={0} width={edge * 1.5} height={H} fill="url(#dinoEdgeL)" />
          <rect x={W - edge * 1.5} y={0} width={edge * 1.5} height={H} fill="url(#dinoEdgeR)" />
        </mask>
      </defs>

      {/* the sun, a soft glow high in a corner */}
      {dino.sun && !dino.dusk && <circle cx={W * 0.14} cy={H * 0.14} r={170} fill="url(#dinoSun)" />}
      {dino.dusk && <circle cx={W * 0.82} cy={H * 0.5} r={260} fill="#FFD0A0" opacity={0.35} style={soft(10)} />}

      {/* a few slow clouds */}
      <g opacity={0.5} style={soft(6)}>
        {[0, 1].map((i) => {
          const x = ((t * 6 + i * 900) % (W + 600)) - 300;
          return <ellipse key={i} cx={x} cy={H * (0.12 + i * 0.06)} rx={190} ry={34} fill="#FFFFFF" />;
        })}
      </g>

      {/* the faint volcano on the right, with a slow smoke plume */}
      {dino.volcano && (
        <g style={soft(4)} opacity={0.55}>
          <path d={`M ${W * 0.74} ${floor} L ${W * 0.85} ${H * 0.4} Q ${W * 0.875} ${H * 0.37} ${W * 0.9} ${H * 0.4} L ${W * 1.02} ${floor} Z`} fill={dino.hills[1]} />
          <ellipse cx={W * 0.875} cy={H * 0.395} rx={W * 0.03} ry={9} fill={dino.glow} />
          {[0, 1, 2].map((i) => {
            const u = ((t * 0.12 + i / 3) % 1);
            return <circle key={i} cx={W * 0.875 + Math.sin(t * 0.6 + i) * 18 + u * 50} cy={H * 0.39 - u * 150} r={26 + u * 38} fill="#FFFFFF" opacity={0.5 * (1 - u)} />;
          })}
        </g>
      )}

      {/* two rolling hills */}
      <g style={soft(2)} opacity={0.9}>
        <path d={`M 0 ${floor - 90} Q ${W * 0.22} ${floor - 190} ${W * 0.5} ${floor - 100} T ${W} ${floor - 120} V ${H} H 0 Z`} fill={dino.hills[1]} opacity={0.7} />
        <path d={`M 0 ${floor - 30} Q ${W * 0.3} ${floor - 100} ${W * 0.6} ${floor - 30} T ${W} ${floor - 50} V ${H} H 0 Z`} fill={dino.hills[0]} />
      </g>

      {/* the planted frame: ferns at the two edges, faded toward the middle */}
      <g mask="url(#dinoEdgeMask)">
        <g style={soft(3)} opacity={0.6}>
          {[0, 1, 2].map((i) => (
            <Fern key={`l${i}`} x={30 + i * 110} base={H * 0.95} h={H * (0.34 + (i % 2) * 0.1)} t={t} seed={i} fill={dino.fern[i % 2]} />
          ))}
          {[0, 1, 2].map((i) => (
            <Fern key={`r${i}`} x={W - 30 - i * 110} base={H * 0.95} h={H * (0.36 - (i % 2) * 0.08)} t={t} seed={i + 5} fill={dino.fern[(i + 1) % 2]} />
          ))}
        </g>
      </g>

      {/* pink and yellow flowers dotting the two edges */}
      <g mask="url(#dinoEdgeMask)" opacity={0.95}>
        {Array.from({ length: 14 }, (_, i) => {
          const left = i % 2 === 0;
          const fx = left ? 20 + (i * 37) % 260 : W - 20 - ((i * 53) % 260);
          const fy = floor + 20 + ((i * 29) % 90);
          const col = ["#FF6FA8", "#FFD23F", "#FFFFFF", "#FF9F45"][i % 4];
          const sway = Math.sin(t * 0.9 + i) * 2;
          return (
            <g key={i} transform={`translate(${fx + sway} ${fy})`}>
              <line x1={0} y1={0} x2={0} y2={30} stroke="#2A8F4A" strokeWidth={4} />
              {[0, 1, 2, 3, 4].map((k) => (
                <circle key={k} cx={Math.cos((k / 5) * Math.PI * 2) * 9} cy={Math.sin((k / 5) * Math.PI * 2) * 9} r={7} fill={col} />
              ))}
              <circle r={5} fill="#FFB020" />
            </g>
          );
        })}
      </g>

      {/* the ground, a soft band; a nest of speckled eggs at the far left */}
      <g style={soft(1)}>
        <path d={`M 0 ${floor + 14} Q ${W * 0.3} ${floor - 12} ${W * 0.6} ${floor + 10} T ${W} ${floor + 4} V ${H} H 0 Z`} fill={dino.hills[0]} />
        <path d={`M 0 ${floor + 54} Q ${W * 0.35} ${floor + 28} ${W * 0.7} ${floor + 50} T ${W} ${floor + 46} V ${H} H 0 Z`} fill={dino.hills[1]} opacity={0.85} />
        {dino.eggs &&
          [0.05, 0.095, 0.075].map((fx, i) => (
            <g key={i} transform={`translate(${W * fx} ${floor + 62 + (i === 2 ? -22 : 0)})`}>
              <ellipse rx={30} ry={38} fill={["#FFF3D6", "#E9F7E4", "#FFE7C9"][i]} stroke="#6B4420" strokeWidth={3} opacity={0.9} />
              <circle cx={-8} cy={-8} r={5} fill="#E88B4A" />
              <circle cx={10} cy={8} r={6} fill="#6BBF8A" />
            </g>
          ))}
        {[0.96, 0.9].map((fx, i) => (
          <ellipse key={`s${i}`} cx={W * fx} cy={floor + 76 + i * 8} rx={44 + i * 14} ry={22 + i * 6} fill="#8A7A62" opacity={0.45} />
        ))}
      </g>

      {/* two slow butterflies in the top margin */}
      <g opacity={0.6} style={soft(1)}>
        {[0, 1].map((i) => {
          const x = ((t * 14 + i * 1000) % (W + 200)) - 100;
          return <ellipse key={i} cx={x} cy={H * 0.07 + Math.sin(t * 0.9 + i) * 10} rx={9} ry={5} fill={["#FF8FB4", "#FFD36B"][i]} />;
        })}
      </g>
    </g>
  );
};
