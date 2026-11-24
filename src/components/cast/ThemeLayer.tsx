// THE BEAD BUDDIES THEME LAYERS — one calm world per theme (docs/COVE_SERIES_PLAN.md and docs/SCRIPT_CHECKLIST.md section 8):
// a soft gradient (drawn by World from `sky`), a few faint shapes far back, and detail ONLY at the far left and right edges and along
// the ground, softened and faded toward a clean open middle. Pure functions of `t`; slow sway only.
import React from "react";
import type { BBTheme } from "../../data/bbworlds";

const soft = (px: number) => ({ filter: `blur(${px}px)` });
const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  return x - Math.floor(x);
};

const Edge: React.FC<{ id: string; W: number; H: number; edge: number; children: React.ReactNode; floor?: number }> = ({ id, W, H, edge, children, floor }) => (
  <>
    <defs>
      <linearGradient id={`${id}L`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fff" stopOpacity={1} /><stop offset="100%" stopColor="#fff" stopOpacity={0} /></linearGradient>
      <linearGradient id={`${id}R`} x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stopColor="#fff" stopOpacity={1} /><stop offset="100%" stopColor="#fff" stopOpacity={0} /></linearGradient>
      <mask id={`${id}M`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
        <rect x={0} y={0} width={edge * 1.5} height={H} fill={`url(#${id}L)`} />
        <rect x={W - edge * 1.5} y={0} width={edge * 1.5} height={H} fill={`url(#${id}R)`} />
        {floor !== undefined && <rect x={0} y={floor} width={W} height={H - floor} fill="#fff" />}
      </mask>
    </defs>
    <g mask={`url(#${id}M)`}>{children}</g>
  </>
);

const Cloud: React.FC<{ x: number; y: number; s: number; fill?: string; o?: number }> = ({ x, y, s, fill = "#FFFFFF", o = 0.9 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={90} ry={34} fill={fill} />
    <circle cx={-34} cy={-22} r={34} fill={fill} />
    <circle cx={20} cy={-30} r={42} fill={fill} />
    <circle cx={58} cy={-8} r={28} fill={fill} />
  </g>
);
const Pine: React.FC<{ x: number; y: number; s: number; snow?: boolean }> = ({ x, y, s, snow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-8} y={-30} width={16} height={34} fill="#6B4420" />
    {[0, 1, 2].map((i) => <path key={i} d={`M ${-70 + i * 14} ${-30 - i * 56} L 0 ${-110 - i * 56} L ${70 - i * 14} ${-30 - i * 56} Z`} fill={snow ? "#3FA86A" : "#2F9A5A"} />)}
    {snow && [0, 1, 2].map((i) => <path key={i} d={`M ${-40 + i * 8} ${-70 - i * 56} L 0 ${-110 - i * 56} L ${40 - i * 8} ${-70 - i * 56} Z`} fill="#FFFFFF" opacity={0.9} />)}
  </g>
);

export const ThemeLayer: React.FC<{ theme: BBTheme; mood: number; t: number; W: number; H: number }> = ({ theme, mood, t, W, H }) => {
  const floor = H * 0.88;
  const edge = Math.max(210, W * 0.11);
  const sway = Math.sin(t * 0.5);
  if (theme === "cloud") {
    return (
      <g>
        <g style={soft(6)} opacity={0.75}>
          {[0, 1, 2].map((i) => <Cloud key={i} x={((t * 7 + i * 700) % (W + 500)) - 250} y={H * (0.1 + i * 0.07)} s={1.2 + i * 0.2} o={0.7} />)}
        </g>
        {/* a faint rainbow arc behind the right side */}
        <g style={soft(4)} opacity={0.35}>
          {["#FF6F91", "#FFC857", "#7FE0D0", "#8E9BFF"].map((c, i) => <path key={c} d={`M ${W * 0.8} ${H * 0.62} Q ${W * 0.93} ${H * 0.15} ${W * 1.1} ${H * 0.62}`} stroke={c} strokeWidth={26} fill="none" transform={`translate(0 ${i * 26})`} />)}
        </g>
        <Edge id="cl" W={W} H={H} edge={edge} floor={H * 0.94}>
          <g style={soft(2)} opacity={0.9}>
            {/* floating islands with a little castle */}
            <g transform={`translate(${W * 0.07} ${H * 0.62 + sway * 6})`}>
              <path d="M -130 0 Q -90 70 0 90 Q 90 70 130 0 Z" fill="#B89AF0" />
              <ellipse cx={0} cy={0} rx={130} ry={22} fill="#8FE0A0" />
              <rect x={-30} y={-80} width={60} height={80} fill="#FFE3F0" stroke="#7A5AC8" strokeWidth={3} />
              <path d="M -38 -80 L 0 -126 L 38 -80 Z" fill="#FF7FB0" />
              <rect x={-9} y={-34} width={18} height={34} rx={9} fill="#7A5AC8" />
            </g>
            <g transform={`translate(${W * 0.94} ${H * 0.7 - sway * 6})`}>
              <path d="M -110 0 Q -70 60 0 76 Q 70 60 110 0 Z" fill="#B89AF0" />
              <ellipse cx={0} cy={0} rx={110} ry={20} fill="#8FE0A0" />
              <circle cx={-30} cy={-24} r={20} fill="#FF9FC0" /><circle cx={24} cy={-30} r={26} fill="#FFD36B" />
            </g>
            {Array.from({ length: 6 }, (_, i) => <Cloud key={i} x={(i % 2 ? W - 60 - (i * 40) % 160 : 40 + (i * 60) % 180)} y={H * 0.92 + (i % 3) * 18} s={0.9} o={0.95} />)}
          </g>
        </Edge>
        {[0, 1, 2, 3, 4].map((i) => <path key={i} transform={`translate(${rand(i) * W} ${H * 0.04 + rand(i + 4) * H * 0.12}) scale(${0.5 + 0.5 * Math.abs(Math.sin(t * 1.4 + i))})`} d="M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z" fill="#FFFFFF" opacity={0.7} />)}
      </g>
    );
  }
  if (theme === "snow") {
    return (
      <g>
        <g style={soft(3)} opacity={0.5}>
          <path d={`M ${W * 0.05} ${floor} L ${W * 0.2} ${H * 0.4} L ${W * 0.36} ${floor} Z`} fill="#FFFFFF" />
          <path d={`M ${W * 0.62} ${floor} L ${W * 0.82} ${H * 0.3} L ${W * 1.02} ${floor} Z`} fill="#FFFFFF" />
        </g>
        {mood === 3 && (
          <g style={soft(14)} opacity={0.4}>
            <path d={`M 0 ${H * 0.12} Q ${W * 0.3} ${H * 0.0 + sway * 20} ${W * 0.6} ${H * 0.14} T ${W} ${H * 0.1}`} stroke="#6FFFC0" strokeWidth={60} fill="none" />
            <path d={`M 0 ${H * 0.2} Q ${W * 0.35} ${H * 0.08 - sway * 20} ${W * 0.7} ${H * 0.22} T ${W} ${H * 0.18}`} stroke="#FF9FF0" strokeWidth={40} fill="none" />
          </g>
        )}
        <Edge id="sn" W={W} H={H} edge={edge} floor={H * 0.94}>
          <g style={soft(1.5)}>
            {[0, 1, 2].map((i) => <Pine key={`l${i}`} x={30 + i * 90} y={H * 0.93 - (i % 2) * 14} s={1.0 + (i % 2) * 0.35} snow />)}
            {[0, 1, 2].map((i) => <Pine key={`r${i}`} x={W - 30 - i * 90} y={H * 0.93 - (i % 2) * 10} s={1.1 + (i % 2) * 0.3} snow />)}
            <g transform={`translate(${W * 0.97} ${H * 0.9})`}>
              <rect x={-50} y={-70} width={100} height={70} fill="#E8A66B" stroke="#7A4A22" strokeWidth={4} /><path d="M -62 -70 L 0 -120 L 62 -70 Z" fill="#C0392B" /><rect x={-12} y={-44} width={24} height={44} fill="#FFE066" />
            </g>
          </g>
        </Edge>
        <path d={`M 0 ${floor + 10} Q ${W * 0.3} ${floor - 30} ${W * 0.6} ${floor + 6} T ${W} ${floor} V ${H} H 0 Z`} fill="#FFFFFF" opacity={0.95} style={soft(1)} />
        {Array.from({ length: 12 }, (_, i) => { const left = i % 2 === 0; const x = (left ? 0.02 : 0.9) * W + rand(i) * W * 0.08; const u = ((t * 0.05 + i * 0.173) % 1); return <circle key={i} cx={x + Math.sin(t + i) * 8} cy={u * H} r={3 + rand(i + 3) * 4} fill="#FFFFFF" opacity={0.85} />; })}
      </g>
    );
  }
  if (theme === "space") {
    return (
      <g>
        {Array.from({ length: 36 }, (_, i) => { const x = rand(i) * W; const y = rand(i + 50) * H * 0.85; const edgeish = x < edge * 1.3 || x > W - edge * 1.3; return <circle key={i} cx={x} cy={y} r={edgeish ? 2.4 : 1.4} fill="#FFFFFF" opacity={(edgeish ? 0.9 : 0.35) * (0.6 + 0.4 * Math.sin(t * 1.3 + i))} />; })}
        <g style={soft(10)} opacity={0.25}><ellipse cx={W * 0.5} cy={H * 0.3} rx={W * 0.4} ry={H * 0.2} fill="#FF7AD0" /></g>
        <Edge id="sp" W={W} H={H} edge={edge} floor={H * 0.94}>
          <g style={soft(1.5)}>
            <g transform={`translate(${W * 0.06} ${H * 0.42 + sway * 6})`}><circle r={78} fill="#FF9F5B" /><ellipse rx={130} ry={24} fill="none" stroke="#FFE066" strokeWidth={10} transform="rotate(-18)" /><circle cx={-22} cy={-18} r={12} fill="#FFC27A" /></g>
            <g transform={`translate(${W * 0.95} ${H * 0.3 - sway * 6})`}><circle r={54} fill="#6FE0F0" /><circle cx={14} cy={-10} r={10} fill="#3FB0C8" /><circle cx={-16} cy={18} r={7} fill="#3FB0C8" /></g>
            <g transform={`translate(${W * 0.93} ${H * 0.72})`}><circle r={36} fill="#B58CFF" /></g>
            <path d={`M ${W * 0.0} ${H * 0.93} Q ${W * 0.1} ${H * 0.86} ${W * 0.22} ${H * 0.93} V ${H} H 0 Z`} fill="#4A3FA8" />
            <path d={`M ${W} ${H * 0.93} Q ${W * 0.9} ${H * 0.85} ${W * 0.78} ${H * 0.93} V ${H} H ${W} Z`} fill="#4A3FA8" />
          </g>
        </Edge>
        <rect x={0} y={floor + 40} width={W} height={H} fill="#2A1F7A" opacity={0.55} />
        <g transform={`translate(${((t * 30) % (W + 400)) - 200} ${H * 0.06 + 30})`} opacity={0.8}><path d="M 0 0 L -120 8 L -120 -8 Z" fill="#FFFFFF" opacity={0.4} /><circle r={9} fill="#FFFFFF" /></g>
      </g>
    );
  }
  if (theme === "pirate") {
    return (
      <g>
        <circle cx={W * 0.86} cy={H * 0.14} r={90} fill="#FFF1B0" opacity={0.55} style={soft(6)} />
        <g style={soft(2)} opacity={0.9}>
          <path d={`M 0 ${floor - 40} Q ${W * 0.3} ${floor - 70} ${W * 0.6} ${floor - 40} T ${W} ${floor - 50} V ${H} H 0 Z`} fill="#38C8E0" />
        </g>
        <Edge id="pi" W={W} H={H} edge={edge} floor={H * 0.94}>
          <g style={soft(1.5)}>
            <g transform={`translate(${W * 0.05} ${H * 0.9})`}><path d="M -120 0 Q -60 -60 0 -50 Q 80 -60 140 0 Z" fill="#F2D590" /><rect x={-8} y={-190} width={16} height={150} fill="#7A4A22" transform={`rotate(${-6 + sway * 2} 0 -40)`} />{[-70, -30, 10, 50].map((a, i) => <path key={i} d={`M 0 -190 Q ${a} ${-240 + i * 8} ${a * 1.7} ${-200 + i * 14}`} stroke="#2F9A5A" strokeWidth={16} strokeLinecap="round" fill="none" />)}</g>
            <g transform={`translate(${W * 0.94} ${H * 0.82 + sway * 4})`}><path d="M -110 0 L 110 0 L 80 40 L -80 40 Z" fill="#8A5A2B" stroke="#4A2E14" strokeWidth={4} /><rect x={-5} y={-130} width={10} height={130} fill="#4A2E14" /><path d="M 5 -126 L 90 -40 L 5 -30 Z" fill="#FFFFFF" stroke="#C0392B" strokeWidth={4} /><path d="M -5 -110 L -66 -40 L -5 -30 Z" fill="#FFF3D6" /></g>
          </g>
        </Edge>
        <path d={`M 0 ${floor + 30} Q ${W * 0.3} ${floor + 5} ${W * 0.6} ${floor + 30} T ${W} ${floor + 26} V ${H} H 0 Z`} fill="#F7DC9B" style={soft(1)} />
        {[0, 1, 2].map((i) => <path key={i} d={`M ${W * (0.2 + i * 0.28) + sway * 20} ${floor - 48} q 20 -10 40 0 q 20 10 40 0`} stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.6} />)}
      </g>
    );
  }
  if (theme === "farm") {
    return (
      <g>
        <circle cx={W * 0.12} cy={H * 0.14} r={80} fill="#FFF1B0" opacity={0.55} style={soft(6)} />
        <g style={soft(3)} opacity={0.75}>
          <path d={`M 0 ${floor - 120} Q ${W * 0.25} ${floor - 200} ${W * 0.5} ${floor - 130} T ${W} ${floor - 140} V ${H} H 0 Z`} fill="#9BE070" />
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M ${W * (0.05 + i * 0.18)} ${floor - 100} Q ${W * (0.12 + i * 0.18)} ${floor - 60} ${W * (0.2 + i * 0.18)} ${floor - 100}`} stroke="#6FC050" strokeWidth={5} fill="none" opacity={0.6} />)}
        </g>
        <Edge id="fa" W={W} H={H} edge={edge} floor={H * 0.94}>
          <g style={soft(1.5)}>
            <g transform={`translate(${W * 0.94} ${H * 0.86})`}><rect x={-70} y={-110} width={140} height={110} fill="#E0463A" stroke="#7A1F18" strokeWidth={4} /><path d="M -84 -110 L 0 -168 L 84 -110 Z" fill="#B2362D" /><rect x={-22} y={-60} width={44} height={60} fill="#FFE3C0" /><path d="M -22 -60 L 22 0 M 22 -60 L -22 0" stroke="#7A1F18" strokeWidth={4} /></g>
            <g transform={`translate(${W * 0.06} ${H * 0.86})`}><rect x={-20} y={-150} width={40} height={150} fill="#F4E4C0" stroke="#7A5A2A" strokeWidth={4} /><g transform={`translate(0 -150) rotate(${t * 30})`}>{[0, 90, 180, 270].map((a) => <rect key={a} x={-8} y={-86} width={16} height={86} fill="#FFFFFF" stroke="#7A5A2A" strokeWidth={3} transform={`rotate(${a})`} />)}</g></g>
            {Array.from({ length: 7 }, (_, i) => { const left = i % 2 === 0; const x = left ? 20 + i * 24 : W - 20 - i * 22; return <g key={i} transform={`translate(${x + sway * 3} ${floor + 30})`}><line y2={50} stroke="#2A8F4A" strokeWidth={5} /><circle r={18} fill="#FFD23F" /><circle r={9} fill="#7A4A22" /></g>; })}
          </g>
        </Edge>
        <path d={`M 0 ${floor + 20} Q ${W * 0.3} ${floor - 6} ${W * 0.6} ${floor + 18} T ${W} ${floor + 12} V ${H} H 0 Z`} fill="#7FD060" style={soft(1)} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={W * 0.03 + i * (W * 0.07)} y={floor + 6} width={8} height={30} fill="#FFFFFF" opacity={i * W * 0.07 > edge * 1.4 && i * W * 0.07 < W - edge * 1.4 ? 0 : 0.8} />)}
      </g>
    );
  }
  if (theme === "train") {
    return (
      <g>
        <circle cx={W * 0.78} cy={H * 0.22} r={110} fill="#FFE3A0" opacity={0.55} style={soft(8)} />
        <g style={soft(3)} opacity={0.7}>
          <path d={`M 0 ${floor - 80} Q ${W * 0.2} ${floor - 220} ${W * 0.4} ${floor - 90} T ${W * 0.8} ${floor - 100} T ${W} ${floor - 90} V ${H} H 0 Z`} fill="#8F6FD0" />
          <path d={`M 0 ${floor - 30} Q ${W * 0.3} ${floor - 120} ${W * 0.6} ${floor - 30} T ${W} ${floor - 40} V ${H} H 0 Z`} fill="#B58CF0" />
        </g>
        <Edge id="tr" W={W} H={H} edge={edge} floor={H * 0.94}>
          <g style={soft(1.5)}>
            <g transform={`translate(${W * 0.05} ${floor + 10})`}><path d="M -90 0 Q -90 -110 0 -112 Q 90 -110 90 0 Z" fill="#8A7A9A" /><path d="M -50 0 Q -50 -76 0 -78 Q 50 -76 50 0 Z" fill="#2A1F3A" /></g>
            {[0.09, 0.93].map((fx, i) => <g key={i} transform={`translate(${W * fx} ${floor + 24})`}><rect x={-5} y={-150} width={10} height={150} fill="#7A4A22" /><rect x={-34} y={-150} width={68} height={8} fill="#7A4A22" /><circle cx={0} cy={-170} r={14} fill={i ? "#FF5E5E" : "#7FE070"} /></g>)}
          </g>
        </Edge>
        <rect x={0} y={floor + 30} width={W} height={6} fill="#5A3A22" opacity={0.7} />
        {Array.from({ length: 24 }, (_, i) => <rect key={i} x={i * 86 + 10} y={floor + 36} width={44} height={10} fill="#7A4A22" opacity={0.55} />)}
        <path d={`M 0 ${floor + 50} H ${W} V ${H} H 0 Z`} fill="#6A4AB8" opacity={0.7} />
      </g>
    );
  }
  if (theme === "canyon") {
    const night = mood >= 2;
    const cactus = (x: number, y: number, k: number, key: string) => (
      <g key={key} transform={`translate(${x} ${y}) scale(${k})`}>
        <rect x={-12} y={-130} width={24} height={130} rx={12} fill="#3FA06A" />
        <path d="M -12 -70 H -38 V -104" stroke="#3FA06A" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M 12 -50 H 36 V -88" stroke="#3FA06A" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    );
    return (
      <g>
        {night && Array.from({ length: 30 }, (_, i) => <circle key={i} cx={rand(i) * W} cy={rand(i + 50) * H * 0.55} r={1.6} fill="#FFFFFF" opacity={(mood === 3 ? 0.85 : 0.45) * (0.6 + 0.4 * Math.sin(t * 1.2 + i))} />)}
        <circle cx={W * 0.8} cy={H * (night ? 0.2 : 0.3)} r={night ? 62 : 96} fill={night ? "#FFF3CF" : "#FFF0C0"} opacity={night ? 0.85 : 0.6} style={soft(night ? 2 : 8)} />
        <g style={soft(3)} opacity={0.6}>
          <path d={`M 0 ${floor} V ${H * 0.52} H ${W * 0.07} L ${W * 0.09} ${H * 0.44} H ${W * 0.2} L ${W * 0.22} ${floor} Z`} fill={night ? "#7A4A8A" : "#D9805A"} />
          <path d={`M ${W * 0.58} ${floor} L ${W * 0.62} ${H * 0.5} H ${W * 0.76} L ${W * 0.8} ${H * 0.44} H ${W * 0.9} L ${W * 0.93} ${floor} Z`} fill={night ? "#6A3F80" : "#C8704A"} />
        </g>
        <Edge id="cn" W={W} H={H} edge={edge} floor={H * 0.94}>
          <g style={soft(1.5)}>
            <path d={`M 0 ${floor + 20} V ${H * 0.4} H ${W * 0.045} L ${W * 0.06} ${H * 0.3} H ${W * 0.09} L ${W * 0.1} ${floor + 20} Z`} fill={night ? "#8A4F6A" : "#C25F3A"} />
            <path d={`M 0 ${H * 0.4} H ${W * 0.045} M 0 ${H * 0.5} H ${W * 0.075} M 0 ${H * 0.62} H ${W * 0.085}`} stroke={night ? "#B26F8A" : "#E08A5A"} strokeWidth={6} opacity={0.7} />
            {cactus(W * 0.13 + sway * 2, floor + 28, 1.1, "c1")}
            <path d={`M ${W} ${floor + 20} V ${H * 0.36} H ${W * 0.955} L ${W * 0.94} ${H * 0.28} H ${W * 0.905} L ${W * 0.895} ${floor + 20} Z`} fill={night ? "#8A4F6A" : "#C25F3A"} />
            <path d={`M ${W} ${H * 0.36} H ${W * 0.955} M ${W} ${H * 0.48} H ${W * 0.925} M ${W} ${H * 0.6} H ${W * 0.915}`} stroke={night ? "#B26F8A" : "#E08A5A"} strokeWidth={6} opacity={0.7} />
            <g transform={`translate(${W * 0.9} ${floor + 30})`}><path d="M -70 0 Q -66 -64 0 -70 Q 66 -64 70 0 Z" fill="#9A5A3A" /><path d="M -34 0 Q -32 -42 0 -44 Q 32 -42 34 0 Z" fill="#2A1428" /></g>
            {cactus(W * 0.87 - sway * 2, floor + 30, 0.9, "c2")}
          </g>
        </Edge>
        <path d={`M 0 ${floor + 22} Q ${W * 0.22} ${floor - 18} ${W * 0.45} ${floor + 16} T ${W * 0.9} ${floor + 6} T ${W} ${floor + 14} V ${H} H 0 Z`} fill={night ? "#C27A6A" : "#F0B27A"} style={soft(1)} />
        <path d={`M 0 ${floor + 52} Q ${W * 0.3} ${floor + 26} ${W * 0.6} ${floor + 50} T ${W} ${floor + 44} V ${H} H 0 Z`} fill={night ? "#9A5A7A" : "#E09A62"} opacity={0.9} />
      </g>
    );
  }
  // fair
  return (
    <g>
      {Array.from({ length: 28 }, (_, i) => <circle key={i} cx={rand(i) * W} cy={rand(i + 40) * H * 0.55} r={1.6} fill="#FFFFFF" opacity={0.3 + 0.4 * Math.abs(Math.sin(t + i))} />)}
      <g style={soft(1)} opacity={0.9}>
        <path d={`M 0 ${H * 0.06} Q ${W * 0.25} ${H * 0.14} ${W * 0.5} ${H * 0.07} T ${W} ${H * 0.07}`} stroke="#3A2A6A" strokeWidth={3} fill="none" />
        {Array.from({ length: 22 }, (_, i) => { const x = (i / 21) * W; const y = H * 0.07 + Math.sin((i / 21) * Math.PI * 4) * H * 0.04; return <circle key={i} cx={x} cy={y} r={9} fill={["#FFE066", "#FF6FA8", "#6FE0F0", "#B58CFF"][i % 4]} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />; })}
      </g>
      <Edge id="fr" W={W} H={H} edge={edge} floor={H * 0.94}>
        <g style={soft(1.5)}>
          <g transform={`translate(${W * 0.93} ${H * 0.52})`}><g transform={`rotate(${t * 6})`}>{Array.from({ length: 12 }, (_, i) => <g key={i} transform={`rotate(${i * 30})`}><line y2={-170} stroke="#FF9FD0" strokeWidth={6} /><circle cy={-170} r={15} fill={["#FFE066", "#6FE0F0", "#FF6FA8"][i % 3]} transform={`rotate(${-(i * 30) - t * 6} 0 -170)`} /></g>)}<circle r={176} fill="none" stroke="#FF9FD0" strokeWidth={6} /></g><path d="M -50 190 L 0 0 L 50 190" stroke="#FF9FD0" strokeWidth={8} fill="none" /></g>
          <g transform={`translate(${W * 0.06} ${floor + 30})`}><path d="M -80 0 L -80 -90 L 0 -150 L 80 -90 L 80 0 Z" fill="#FF6FA8" /><path d="M -80 -90 L 80 -90" stroke="#FFFFFF" strokeWidth={6} /><rect x={-24} y={-52} width={48} height={52} fill="#FFE066" /></g>
        </g>
      </Edge>
      <path d={`M 0 ${floor + 14} Q ${W * 0.3} ${floor - 8} ${W * 0.6} ${floor + 12} T ${W} ${floor + 8} V ${H} H 0 Z`} fill="#4A2F9A" opacity={0.9} style={soft(1)} />
    </g>
  );
};
