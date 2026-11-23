// THE STORM AND THE HELIPAD — the world of Big Friend 4. Safety yellow, sky blue and slate: a stormy
// sky (dark clouds, slanted rain, lightning, a blinking radio mast, a spinning wind turbine) that CLEARS
// as the missions are solved: the clouds turn white, the sky turns blue, the sun comes out, and in the
// finale a rainbow arcs over the helipad. A yellow-and-black hazard barrier is the ledge the heroes
// stand on, a slate control console holds the lesson, and the floor is a concrete helipad with a big H.
// BACKGROUND only. `storm` is 1 (black sky) .. 0 (clear); `flash` is a lightning flash 0..1; `calm`
// quiets the decoration while the lesson is the focus.

import React from "react";

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixc = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
};

const Cloud: React.FC<{ x: number; y: number; s: number; fill: string }> = ({ x, y, s, fill }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={150} ry={50} fill={fill} />
    <circle cx={-70} cy={-30} r={55} fill={fill} />
    <circle cx={10} cy={-52} r={70} fill={fill} />
    <circle cx={80} cy={-24} r={52} fill={fill} />
  </g>
);

export const StormWorld: React.FC<{ width: number; height: number; frame: number; fps: number; storm: number; flash?: number; bolt?: number; burst?: number; counterY?: number; calm?: number; finale?: number }> = ({
  width,
  height,
  frame,
  fps,
  storm,
  flash = 0,
  bolt = 0,
  burst = 0,
  counterY = 600,
  calm = 0,
  finale = 0,
}) => {
  const t = frame / fps;
  const cx = width / 2;
  const floorY = height * 0.775;
  const clear = 1 - storm;
  const skyTop = mixc("#3C4C66", "#3E9BF2", clear);
  const skyBot = mixc("#7488A6", "#C4E9FF", clear);
  const cloudCol = mixc("#56667E", "#FFFFFF", clear);
  const cloudCol2 = mixc("#485770", "#E4F3FF", clear);
  const hillA = mixc("#3A4A5E", "#4CB36B", clear);
  const hillB = mixc("#2E3C4E", "#37A05A", clear);
  const decor = 1 - 0.45 * calm;
  const bx = 160 + ((bolt * 211) % 700);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="swSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id="swFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8C9AAA" />
          <stop offset="100%" stopColor="#6A7888" />
        </linearGradient>
        <linearGradient id="swConsole" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C3A4E" />
          <stop offset="100%" stopColor="#1B2533" />
        </linearGradient>
        <radialGradient id="swSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6B0" stopOpacity={0.95} />
          <stop offset="100%" stopColor="#FFD84A" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect width={width} height={height} fill="url(#swSky)" />

      {/* the sun breaks through as the storm clears */}
      {clear > 0.25 && (
        <g opacity={clamp((clear - 0.25) / 0.5)} transform={`translate(${width - 190} ${Math.max(250, counterY - 330)})`}>
          <circle r={190 + burst * 40} fill="url(#swSun)" />
          <g transform={`rotate(${t * 6})`}>
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d={`M ${Math.cos((i / 12) * 6.283) * 108} ${Math.sin((i / 12) * 6.283) * 108} L ${Math.cos((i / 12) * 6.283) * 150} ${Math.sin((i / 12) * 6.283) * 150}`} stroke="#FFE066" strokeWidth={10} strokeLinecap="round" />
            ))}
          </g>
          <circle r={76} fill="#FFE066" stroke="#FFF6B0" strokeWidth={8} />
        </g>
      )}

      {/* a rainbow over the helipad in the finale */}
      {finale > 0.02 && (
        <g opacity={0.8 * finale}>
          {["#FF5A4D", "#FF9F43", "#FFE45C", "#6FE38C", "#6FB7FF", "#B58CFF"].map((c, i) => (
            <path key={i} d={`M ${cx - 500 + i * 28} ${counterY + 30} A ${500 - i * 28} ${500 - i * 28} 0 0 1 ${cx + 500 - i * 28} ${counterY + 30}`} stroke={c} strokeWidth={28} fill="none" />
          ))}
        </g>
      )}

      {/* clouds: dark and heavy in the storm, white and puffy when it clears */}
      <g opacity={decor}>
        {[
          { x: 120, y: 230, s: 1.2, sp: 12 },
          { x: 460, y: 190, s: 1.5, sp: 9 },
          { x: 820, y: 260, s: 1.25, sp: 14 },
          { x: 280, y: 420, s: 1.0, sp: 11 },
          { x: 720, y: 440, s: 1.1, sp: 8 },
          { x: 1000, y: 380, s: 0.9, sp: 10 },
        ].map((c, i) => {
          const dx = ((t * c.sp + i * 130) % (width + 500)) - 250;
          return <Cloud key={i} x={dx} y={c.y + Math.sin(t * 0.6 + i) * 6} s={c.s} fill={i % 2 ? cloudCol2 : cloudCol} />;
        })}
      </g>

      {/* hills at the horizon */}
      <path d={`M -20 ${counterY - 50} Q 160 ${counterY - 170} 360 ${counterY - 70} T 760 ${counterY - 90} T ${width + 20} ${counterY - 60} V ${counterY + 20} H -20 Z`} fill={hillA} opacity={0.9} />
      <path d={`M -20 ${counterY - 20} Q 260 ${counterY - 110} 520 ${counterY - 30} T ${width + 20} ${counterY - 40} V ${counterY + 20} H -20 Z`} fill={hillB} />

      {/* the radio mast with a blinking red light, and a wind turbine */}
      <g opacity={decor} transform={`translate(72 ${counterY})`}>
        <path d="M -16 0 L 0 -250 L 16 0 M -12 -60 H 12 M -9 -120 H 9 M -6 -180 H 6" stroke="#1B2533" strokeWidth={6} fill="none" strokeLinejoin="round" />
        <circle cy={-256} r={11} fill={Math.floor(t * 2) % 2 === 0 ? "#FF3B3B" : "#7A1F1F"} />
      </g>
      <g opacity={decor} transform={`translate(${width - 70} ${counterY})`}>
        <path d="M -7 0 L 0 -230 L 7 0 Z" fill="#E4EBF2" stroke="#1B2533" strokeWidth={4} />
        <g transform={`translate(0 -232) rotate(${t * (60 + storm * 260)})`}>
          {[0, 120, 240].map((a) => (
            <path key={a} d="M 0 0 L -9 -92 L 9 -92 Z" fill="#FFFFFF" stroke="#1B2533" strokeWidth={3.5} strokeLinejoin="round" transform={`rotate(${a})`} />
          ))}
          <circle r={10} fill="#1B2533" />
        </g>
      </g>

      {/* rain */}
      {storm > 0.05 &&
        Array.from({ length: 70 }, (_, i) => {
          const x = (i * 97 + ((t * 600 + i * 31) % 160)) % (width + 200) - 100;
          const y = (i * 151 + t * 1300 * (0.8 + (i % 3) * 0.2)) % (counterY + 40);
          return <path key={i} d={`M ${x} ${y} l -14 36`} stroke="#CFE6FF" strokeWidth={3} strokeLinecap="round" opacity={0.55 * storm * decor} />;
        })}

      {/* lightning */}
      {flash > 0.02 && (
        <g>
          <path d={`M ${bx} 0 L ${bx - 50} 160 L ${bx + 10} 180 L ${bx - 70} 360 L ${bx + 20} 380 L ${bx - 40} ${counterY - 120}`} stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={flash} />
          <path d={`M ${bx} 0 L ${bx - 50} 160 L ${bx + 10} 180 L ${bx - 70} 360 L ${bx + 20} 380 L ${bx - 40} ${counterY - 120}`} stroke="#FFF59A" strokeWidth={6} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={flash} />
          <rect width={width} height={counterY} fill="#FFFFFF" opacity={0.35 * flash} />
        </g>
      )}

      {/* the LEDGE: a hazard-striped barrier on a concrete deck */}
      <g>
        <rect x={-10} y={counterY - 2} width={width + 20} height={32} fill="#FFD400" stroke="#1B2533" strokeWidth={6} />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M ${i * 48 - 20} ${counterY + 28} l 24 -28 h 24 l -24 28 Z`} fill="#1B2533" opacity={0.9} />
        ))}
        <rect x={-10} y={counterY + 28} width={width + 20} height={68} fill="#7F8EA0" stroke="#1B2533" strokeWidth={6} />
        {Array.from({ length: 22 }, (_, i) => {
          const on = (Math.floor(t * 3) + i) % 2 === 0;
          return (
            <g key={i}>
              <circle cx={24 + i * 48} cy={counterY + 62} r={9} fill={on ? "#5BE37A" : "#FF5A4D"} stroke="#1B2533" strokeWidth={3} opacity={0.95} />
              <circle cx={24 + i * 48} cy={counterY + 44} r={3} fill="#4A5667" />
            </g>
          );
        })}
        <rect x={-10} y={counterY + 90} width={width + 20} height={10} fill="#1B2533" opacity={0.4} />
      </g>

      {/* the control console for the lesson */}
      <rect x={20} y={counterY + 118} width={width - 40} height={floorY - counterY - 118 - 8} rx={40} fill="url(#swConsole)" opacity={0.92} />
      <rect x={20} y={counterY + 118} width={width - 40} height={floorY - counterY - 118 - 8} rx={40} fill="none" stroke="#7FD6FF" strokeOpacity={0.45} strokeWidth={5} />
      {[[44, counterY + 142], [width - 44, counterY + 142], [44, floorY - 36], [width - 44, floorY - 36]].map(([rx, ry], i) => (
        <circle key={i} cx={rx} cy={ry} r={8} fill="#55657A" stroke="#1B2533" strokeWidth={3} />
      ))}

      {/* the helipad: concrete, a painted ring and a big H */}
      <g>
        <rect x={0} y={floorY} width={width} height={height - floorY} fill="url(#swFloor)" />
        <ellipse cx={cx} cy={floorY + (height - floorY) * 0.5} rx={440} ry={150} fill="none" stroke="#FFFFFF" strokeWidth={14} opacity={0.5} />
        <path d={`M ${cx - 70} ${floorY + 60} V ${floorY + 240} M ${cx + 70} ${floorY + 60} V ${floorY + 240} M ${cx - 70} ${floorY + 150} H ${cx + 70}`} stroke="#FFD400" strokeWidth={34} opacity={0.4} strokeLinecap="round" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={i * 100 + 10} y={height - 22} width={60} height={10} rx={4} fill="#FFD400" opacity={0.55} />
        ))}
        <rect x={0} y={floorY} width={width} height={12} fill="#FFD400" />
        <rect x={0} y={floorY + 12} width={width} height={6} fill="#1B2533" opacity={0.3} />
      </g>
    </svg>
  );
};

const clamp = (v: number) => Math.max(0, Math.min(1, v));
