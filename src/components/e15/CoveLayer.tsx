// THE KELP COVE — E15's world, drawn once and tuned per beat by the `cove` block on a WorldTheme.
//
// An underwater place you could name with the abacus taken away: a rippling surface with warm light
// falling through it in slow shafts, kelp swaying at BOTH gutters (never behind the middle, where the
// abacus and the cards live), a sandy floor with rocks, coral and starfish along the bottom, bubbles
// climbing, small fish schools crossing, a dawn mist or a night moon. Everything is a pure function of
// the frame (`t` seconds), so it loops with no state and cannot jump on a scene change.
//
// BACKGROUND ONLY — nothing here is guarded content, so the busy shapes live at the edges and the
// middle stays calm. `calm` (0..1) quiets the motion and the shafts further while a lesson card is
// the focus; the scene's own wash/desaturation sits on top of that in SceneStage.

import React from "react";
import type { WorldTheme } from "../../data/theme";

type Cove = NonNullable<WorldTheme["cove"]>;

const rand = (i: number): number => {
  const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  return x - Math.floor(x);
};

const Blade: React.FC<{ x: number; base: number; h: number; w: number; sway: number; t: number; seed: number; fill: string; opacity: number }> = ({ x, base, h, w, sway, t, seed, fill, opacity }) => {
  // a kelp blade is a tapered ribbon whose top swings further than its root
  const seg = 7;
  const pts: [number, number][] = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg;
    const off = Math.sin(t * 0.9 + seed * 1.7 + u * 2.2) * sway * u * u;
    pts.push([x + off, base - h * u]);
  }
  const left = pts.map(([px, py], i) => [px - (w * (1 - i / seg) * 0.5 + 2), py] as const);
  const right = pts.map(([px, py], i) => [px + (w * (1 - i / seg) * 0.5 + 2), py] as const);
  const d =
    `M ${left[0][0]} ${left[0][1]} ` +
    left.slice(1).map(([px, py]) => `L ${px} ${py}`).join(" ") +
    ` ` +
    right.reverse().map(([px, py]) => `L ${px} ${py}`).join(" ") +
    " Z";
  return (
    <g opacity={opacity}>
      <path d={d} fill={fill} />
      {/* small leaf bulbs along the stalk */}
      {pts.slice(2, seg).map(([px, py], i) => (
        <ellipse key={i} cx={px + (i % 2 ? 14 : -14)} cy={py} rx={13} ry={6} fill={fill} transform={`rotate(${(i % 2 ? 24 : -24) + Math.sin(t * 1.3 + i + seed) * 8} ${px} ${py})`} />
      ))}
    </g>
  );
};

export const CoveLayer: React.FC<{ cove: Cove; t: number; W: number; H: number; calm?: number }> = ({ cove, t, W, H, calm = 0 }) => {
  // CALM AND SMOOTH, NOT FULL (user rule, 2026-10-06). The lesson sits in open water: a soft gradient, a few wide faint sunbeams,
  // and every plant, coral, fish and bubble is pushed to the far left and right edges or the sandy floor, drawn low-contrast and
  // slightly blurred so it reads as depth and never competes with the abacus, the cards or the caption. Motion is slow sway only.
  const motion = 0.7 * (1 - 0.4 * calm);
  const floorY = H * 0.9;
  const edge = Math.max(210, W * 0.11); // the width of the planted frame at each side
  const shafts = Array.from({ length: Math.min(3, cove.shafts) }, (_, i) => i);
  const fish = cove.fish ?? [];
  const soft = (px: number) => ({ filter: `blur(${px}px)` });

  return (
    <g>
      <defs>
        <linearGradient id="coveSurface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cove.light} stopOpacity={cove.night ? 0.4 : 0.8} />
          <stop offset="100%" stopColor={cove.light} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="coveShaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cove.light} stopOpacity={0.45} />
          <stop offset="100%" stopColor={cove.light} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="coveMist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF1E6" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#FFF1E6" stopOpacity={0} />
        </linearGradient>
        {/* the edge frame fades into open water toward the middle */}
        <linearGradient id="coveEdgeL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity={1} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="coveEdgeR" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity={1} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id="coveEdgeMask" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect x={0} y={0} width={edge * 1.5} height={H} fill="url(#coveEdgeL)" />
          <rect x={W - edge * 1.5} y={0} width={edge * 1.5} height={H} fill="url(#coveEdgeR)" />
          <rect x={0} y={floorY - 30} width={W} height={H} fill="#fff" opacity={0.9} />
        </mask>
      </defs>

      {/* the glow under the surface */}
      <rect x={0} y={0} width={W} height={H * 0.4} fill="url(#coveSurface)" />

      {/* a few wide, faint sunbeams, drifting very slowly */}
      <g opacity={(cove.night ? 0.1 : 0.16) * (1 - 0.5 * calm)} style={soft(10)}>
        {shafts.map((i) => {
          const cx = W * ((i + 0.6) / (shafts.length + 0.4)) + Math.sin(t * 0.12 * motion + i * 2.1) * 50;
          const w0 = 90 + rand(i + 3) * 60;
          const lean = -150 + Math.sin(t * 0.1 + i) * 30;
          return <path key={i} d={`M ${cx - w0} 0 L ${cx + w0} 0 L ${cx + w0 * 2.2 + lean} ${H * 0.9} L ${cx - w0 * 2.2 + lean} ${H * 0.9} Z`} fill="url(#coveShaft)" />;
        })}
      </g>

      {/* the rippling surface line, soft */}
      <g opacity={0.7} style={soft(1.5)}>
        <path
          d={`M 0 0 H ${W} V 22 ` + Array.from({ length: 41 }, (_, i) => `L ${W - (i / 40) * W} ${16 + Math.sin(t * 1.0 * motion + i * 0.9) * 5}`).join(" ") + " Z"}
          fill={cove.light}
          opacity={cove.night ? 0.25 : 0.55}
        />
      </g>

      {/* a moon at night: glow, disc and a reflection ladder on the water */}
      {cove.night && (
        <g transform={`translate(${W * 0.84} ${H * 0.13})`} style={soft(2)}>
          <circle r={170} fill={cove.light} opacity={0.1} />
          <circle r={96} fill={cove.light} opacity={0.16} />
          <circle r={52} fill="#F4F8FF" />
        </g>
      )}

      {/* THE PLANTED FRAME: kelp, coral, rocks and anemones only at the two edges and along the floor, faded toward the middle */}
      <g mask="url(#coveEdgeMask)">
        {/* far kelp: pale, blurred, low contrast */}
        <g opacity={0.55} style={soft(4)}>
          {Array.from({ length: 5 }, (_, i) => (
            <Blade key={`fl${i}`} x={10 + i * 46 + rand(i + 9) * 24} base={floorY + 10} h={H * (0.4 + rand(i + 21) * 0.18)} w={40} sway={22 * motion} t={t} seed={i} fill={cove.kelp[0]} opacity={1} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <Blade key={`fr${i}`} x={W - 10 - i * 46 - rand(i + 11) * 24} base={floorY + 10} h={H * (0.4 + rand(i + 25) * 0.18)} w={40} sway={22 * motion} t={t} seed={i + 9} fill={cove.kelp[0]} opacity={1} />
          ))}
        </g>
        {/* near kelp: a few tall blades hugging the border, slightly softened */}
        <g opacity={0.85} style={soft(2)}>
          {Array.from({ length: 3 }, (_, i) => (
            <Blade key={`l${i}`} x={16 + i * 58 + rand(i) * 14} base={H + 20} h={H * (0.46 + rand(i + 31) * 0.2)} w={46} sway={30 * motion} t={t} seed={i + 40} fill={cove.kelp[1]} opacity={1} />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <Blade key={`r${i}`} x={W - 16 - i * 58 - rand(i + 5) * 14} base={H + 20} h={H * (0.44 + rand(i + 41) * 0.2)} w={46} sway={30 * motion} t={t} seed={i + 70} fill={cove.kelp[1]} opacity={1} />
          ))}
        </g>
      </g>

      {/* the floor: two soft dunes of sand, with rocks, coral, anemones and starfish only near the edges */}
      <g style={soft(1)}>
        <path d={`M 0 ${floorY + 20} Q ${W * 0.2} ${floorY - 20} ${W * 0.45} ${floorY + 8} T ${W * 0.8} ${floorY - 2} T ${W} ${floorY + 14} V ${H} H 0 Z`} fill={cove.floor[0]} />
        <path d={`M 0 ${floorY + 60} Q ${W * 0.3} ${floorY + 26} ${W * 0.55} ${floorY + 52} T ${W} ${floorY + 40} V ${H} H 0 Z`} fill={cove.floor[0]} opacity={0.8} />
        {[
          [W * 0.04, 90, 56],
          [W * 0.95, 110, 64],
        ].map(([rx, rw, rh], i) => (
          <ellipse key={i} cx={rx} cy={floorY + 34} rx={rw} ry={rh} fill={cove.floor[1]} opacity={cove.rocks ? 0.8 : 0.5} />
        ))}
        {(cove.coral ?? []).slice(0, 2).map((c, i) => {
          const cx = i % 2 === 0 ? W * 0.075 : W * 0.93;
          return (
            <g key={`c${i}`} transform={`translate(${cx} ${floorY + 40})`} opacity={0.8}>
              {[-22, -6, 12, 28].map((dx, k) => (
                <path key={k} d={`M ${dx} 0 Q ${dx * 1.3} ${-40 - k * 7} ${dx * 0.8} ${-70 - k * 9 + Math.sin(t * 0.8 * motion + k + i) * 2}`} stroke={c} strokeWidth={18} strokeLinecap="round" fill="none" />
              ))}
            </g>
          );
        })}
        {[0.16, 0.86].map((fx, i) => (
          <g key={`an${i}`} transform={`translate(${W * fx} ${floorY + 58})`} opacity={0.85}>
            {Array.from({ length: 9 }, (_, k) => {
              const a = -Math.PI + (k / 8) * Math.PI;
              const wob = Math.sin(t * 1.0 * motion + k + i) * 3;
              return <line key={k} x1={0} y1={0} x2={Math.cos(a) * 30 + wob} y2={Math.sin(a) * 38} stroke={["#FF7DAE", "#B58CFF"][i]} strokeWidth={8} strokeLinecap="round" />;
            })}
            <ellipse cx={0} cy={2} rx={18} ry={8} fill={["#FF4F95", "#8F63F0"][i]} />
          </g>
        ))}
        {[0.05, 0.97].map((fx, i) => (
          <g key={`s${i}`} transform={`translate(${W * fx} ${floorY + 74}) rotate(${i * 30 - 12})`} opacity={0.85}>
            <path d="M 0 -20 L 6 -6 L 20 -5 L 9 4 L 13 18 L 0 10 L -13 18 L -9 4 L -20 -5 L -6 -6 Z" fill={["#FF8F70", "#FFC857"][i]} />
          </g>
        ))}
      </g>

      {/* just three slow fish, high above the lesson (or low along the floor), softened */}
      {fish.length > 0 && (
        <g style={soft(1.6)}>
          {Array.from({ length: 3 }, (_, i) => {
            const speed = (cove.stream ? 120 : 26) + rand(i + 11) * 14;
            const span = W + 500;
            const dir = i % 2 === 0 ? 1 : -1;
            const raw = (t * speed * motion + i * 640) % span;
            const x = dir > 0 ? raw - 250 : W + 250 - raw;
            const y = H * (i === 1 ? 0.07 : i === 0 ? 0.15 : 0.08) + Math.sin(t * 0.9 + i) * 8;
            const col = fish[i % fish.length];
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${dir} 1)`} opacity={0.62}>
                {[0, 1].map((k) => (
                  <g key={k} transform={`translate(${-k * 46} ${(k % 2) * 12 - 6 + Math.sin(t * 3 + k) * 2})`}>
                    <ellipse rx={22} ry={11} fill={col} />
                    <path d={`M -16 0 L -30 ${-9 + Math.sin(t * 5 + k) * 3} L -30 ${9 + Math.sin(t * 5 + k) * 3} Z`} fill={col} />
                    <circle cx={9} cy={-2} r={2.2} fill="#0B3B4A" />
                  </g>
                ))}
              </g>
            );
          })}
        </g>
      )}

      {/* a few slow bubbles, only in the outer margins */}
      {Array.from({ length: Math.min(6, cove.bubbles) }, (_, i) => {
        const per = 12 + rand(i + 5) * 8;
        const u = ((t * 0.7 + i * 2.9) % per) / per;
        const left = i % 2 === 0;
        const x = (left ? W * 0.02 : W * 0.9) + rand(i + 13) * W * 0.07 + Math.sin(t * 0.8 + i) * 8;
        const y = floorY - u * (floorY + 20);
        const r = 5 + rand(i + 29) * 8;
        return (
          <g key={i} opacity={Math.min(1, u * 5) * (1 - u * 0.6) * 0.55} style={soft(0.8)}>
            <circle cx={x} cy={y} r={r} fill="none" stroke="#FFFFFF" strokeWidth={2} />
          </g>
        );
      })}

      {/* the dawn mist, drifting just under the surface */}
      {cove.mist ? (
        <g opacity={cove.mist * (0.8 + 0.2 * Math.sin(t * 0.3))} style={soft(6)}>
          <rect x={0} y={0} width={W} height={H * 0.46} fill="url(#coveMist)" />
        </g>
      ) : null}
    </g>
  );
};
