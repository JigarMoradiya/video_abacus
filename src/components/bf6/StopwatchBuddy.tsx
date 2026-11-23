// TICK, the co-character of Big Friend 6: a racing STOPWATCH with a face, running shoes and a crown button.
// Its dial is the REAL one-minute clock: the seconds hand sweeps and the lime wedge of "time left" drains
// as the round runs. Moods: ready (a cocky smirk), race (squinting, the hand whirring, speed lines),
// jam (the hand shakes and sticks, sweat and wide eyes when a number is stuck), gasp (huge eyes at the
// friend), boost (flames at its shoes while the beads move), win (arms up, a grin), buzz (the final buzzer:
// the whole body flashes). Pure function of its inputs. Bare <g>.
// Local box (soles at the origin, before scale): halfW 200, up 420.

import React from "react";

export type SWMood = "ready" | "race" | "jam" | "gasp" | "boost" | "win" | "buzz";
export const SW_BOX = { halfW: 200, up: 420 };

const INK = "#0B0720";
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const polar = (r: number, deg: number) => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r] as const;

export const StopwatchBuddy: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: SWMood;
  moodFrame: number;
  frame: number;
  fps: number;
  /** seconds left on the one-minute clock, 60 .. 0 */
  secLeft: number;
  squash?: number;
  hop?: number;
}> = ({ x, y, scale, mood, moodFrame, frame, fps, secLeft, squash = 0, hop = 0 }) => {
  const t = frame / fps;
  const since = Math.max(0, frame - moodFrame);
  const shake = mood === "jam" ? Math.sin(t * 48) * 3 * Math.min(1, since / 4) : mood === "race" ? Math.sin(t * 20) * 1.4 : mood === "buzz" ? Math.sin(t * 60) * 4 : 0;
  const run = mood === "race" || mood === "boost" ? Math.sin(t * 16) : 0;
  const win = mood === "win" ? Math.abs(Math.sin(t * 5.4)) * 14 : 0;
  const sx = 1 + 0.12 * squash;
  const sy = 1 - 0.12 * squash;
  const blink = (t * 0.45) % 1 > 0.95 ? 0.15 : 1;
  const buzzOn = mood === "buzz" && Math.floor(t * 8) % 2 === 0;
  const elapsed = Math.max(0, Math.min(60, 60 - secLeft));
  const hand = elapsed * 6 + (mood === "jam" ? Math.sin(t * 50) * 4 : 0);
  const eyeY = -274;

  const eye = (cx: number, i: number) => {
    if (mood === "win") return <path key={i} d={`M ${cx - 24} ${eyeY + 8} Q ${cx} ${eyeY - 28} ${cx + 24} ${eyeY + 8}`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />;
    const big = mood === "gasp" ? 1.35 : mood === "jam" ? 1.2 : 1;
    const squint = mood === "race" || mood === "boost" ? 0.62 : 1;
    const lookX = mood === "race" || mood === "boost" ? 7 : mood === "jam" ? Math.sin(t * 20) * 6 : Math.sin(t * 1.4 + i) * 4;
    return (
      <g key={i} transform={`translate(${cx} ${eyeY}) scale(${big} ${big * squint * blink})`}>
        <ellipse rx={27} ry={31} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={lookX} cy={2} r={mood === "gasp" ? 7 : 13} fill={INK} />
        <circle cx={lookX + 4} cy={-4} r={4} fill="#FFFFFF" />
      </g>
    );
  };
  const brows =
    mood === "race" || mood === "boost" ? (
      <g stroke={INK} strokeWidth={11} strokeLinecap="round">
        <path d={`M -80 ${eyeY - 40} L -26 ${eyeY - 26}`} />
        <path d={`M 80 ${eyeY - 40} L 26 ${eyeY - 26}`} />
      </g>
    ) : mood === "jam" ? (
      <g stroke={INK} strokeWidth={10} strokeLinecap="round">
        <path d={`M -78 ${eyeY - 28} L -26 ${eyeY - 44}`} />
        <path d={`M 78 ${eyeY - 28} L 26 ${eyeY - 44}`} />
      </g>
    ) : null;
  const my = -204;
  const mouth =
    mood === "gasp" ? <ellipse cx={0} cy={my} rx={20} ry={26} fill="#4A0F2A" stroke={INK} strokeWidth={5} /> :
    mood === "win" ? <path d={`M -56 ${my - 14} Q 0 ${my + 50} 56 ${my - 14} Z`} fill="#4A0F2A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> :
    mood === "jam" ? <path d={`M -40 ${my} l 10 -9 l 10 9 l 10 -9 l 10 9 l 10 -9 l 10 9 l 10 -9`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /> :
    mood === "race" || mood === "boost" ? <g><rect x={-38} y={my - 14} width={76} height={28} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={5} /><path d={`M -38 ${my} H 38 M -13 ${my - 14} V ${my + 14} M 13 ${my - 14} V ${my + 14}`} stroke={INK} strokeWidth={3} /></g> :
    mood === "buzz" ? <ellipse cx={0} cy={my} rx={30} ry={22} fill="#4A0F2A" stroke={INK} strokeWidth={5} /> :
    <path d={`M -44 ${my - 4} Q -4 ${my + 24} 44 ${my - 20}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;

  return (
    <g transform={`translate(${x + shake * scale} ${y - hop - win * scale}) scale(${scale * sx} ${scale * sy})`}>
      <ellipse cx={0} cy={8} rx={150} ry={14} fill="#000" opacity={0.35} />
      {/* speed lines behind a running stopwatch */}
      {(mood === "race" || mood === "boost") &&
        [0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${190 + ((t * 600 + i * 90) % 140)} ${-300 + i * 70} h 70`} stroke="#B6FF2E" strokeWidth={9} strokeLinecap="round" opacity={0.7} />
        ))}
      {/* legs and shoes */}
      {[-1, 1].map((s) => {
        const leg = run * s * 16;
        return (
          <g key={s} transform={`translate(${s * 56} 0)`}>
            <rect x={-12} y={-108 - Math.max(0, leg) * 0.5} width={24} height={72} rx={9} fill={INK} />
            <g transform={`translate(${s * 6 + leg} ${-26 - Math.max(0, -leg) * 0.5})`}>
              <path d="M -34 8 Q -34 -22 -8 -24 L 18 -24 Q 40 -20 42 6 Z" fill="#B6FF2E" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
              <path d="M -30 2 H 38" stroke={INK} strokeWidth={5} />
              <path d="M -8 -20 l 18 0" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
            </g>
            {mood === "boost" && (
              <path d={`M ${-s * 30} -10 q ${-s * 50} ${-6 + Math.sin(t * 40 + s) * 6} ${-s * 90} 14 q ${s * 36} -4 ${s * 40} -14 Z`} fill="#FF7A1A" stroke="#FFD84D" strokeWidth={4} strokeLinejoin="round" opacity={0.95} />
            )}
          </g>
        );
      })}
      {/* arms */}
      {[-1, 1].map((s) => {
        const a = mood === "win" ? -1 : mood === "race" || mood === "boost" ? run * s : 0;
        const hx = s * 190 + (mood === "win" ? s * 12 : 0);
        const hy = mood === "win" ? -380 - Math.sin(t * 9 + s) * 12 : -220 + a * 40;
        return (
          <g key={s}>
            <path d={`M ${s * 142} -250 Q ${s * 190} ${(hy - 250) / 2 - 20} ${hx} ${hy}`} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
            <path d={`M ${s * 142} -250 Q ${s * 190} ${(hy - 250) / 2 - 20} ${hx} ${hy}`} stroke="#FF7A1A" strokeWidth={12} fill="none" strokeLinecap="round" />
            <circle cx={hx} cy={hy} r={20} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          </g>
        );
      })}
      {/* the crown button and the side button */}
      <rect x={-20} y={-420} width={40} height={28} rx={8} fill="#C9D3DF" stroke={INK} strokeWidth={6} />
      <rect x={-12} y={-396} width={24} height={30} fill="#8896AA" stroke={INK} strokeWidth={5} />
      <g transform="translate(106 -362) rotate(40)">
        <rect x={-14} y={-18} width={28} height={30} rx={7} fill="#C9D3DF" stroke={INK} strokeWidth={6} />
      </g>
      {/* the body */}
      <circle cx={0} cy={-250} r={158} fill={buzzOn ? "#FF3B3B" : "#FF7A1A"} stroke={INK} strokeWidth={9} />
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = polar(142, i * 30);
        return <circle key={i} cx={x1} cy={-250 + y1} r={5} fill="#FFFFFF" opacity={0.85} />;
      })}
      <circle cx={0} cy={-250} r={124} fill="#F4F2FF" stroke={INK} strokeWidth={6} />
      {/* the draining wedge of time left, and the minute ticks */}
      <g transform="translate(0 -250)">
        <path d={`M 0 0 L ${polar(118, elapsed * 6)[0]} ${polar(118, elapsed * 6)[1]} A 118 118 0 ${elapsed < 30 ? 1 : 0} 1 0 -118 Z`} fill={secLeft < 12 ? "#FF7A1A" : "#B6FF2E"} opacity={elapsed >= 60 ? 0 : 0.5} />
        {Array.from({ length: 12 }, (_, i) => {
          const [x1, y1] = polar(104, i * 30);
          const [x2, y2] = polar(120, i * 30);
          return <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={INK} strokeWidth={i % 3 === 0 ? 6 : 3} strokeLinecap="round" />;
        })}
      </g>
      {/* the face sits over the dial */}
      {brows}
      {[-52, 52].map((cx, i) => eye(cx, i))}
      <ellipse cx={-92} cy={-230} rx={15} ry={9} fill="#FF9A8A" opacity={0.55} />
      <ellipse cx={92} cy={-230} rx={15} ry={9} fill="#FF9A8A" opacity={0.55} />
      {mouth}
      {/* the seconds hand: the real clock */}
      <g transform={`translate(0 -250) rotate(${hand})`}>
        <path d="M 0 14 L 0 -112" stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <path d="M 0 -112 L -8 -96 L 8 -96 Z" fill="#E5273D" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <circle r={9} fill="#E5273D" stroke={INK} strokeWidth={4} />
      </g>
      {(mood === "jam" || mood === "gasp") && (
        <path d={`M 150 ${-330 + ((t * 80) % 50)} q 14 24 0 36 q -14 -12 0 -36 Z`} fill="#8FDBFF" stroke="#2B8FC9" strokeWidth={3} />
      )}
      {mood === "buzz" && hash(Math.floor(frame / 3)) > 0 && (
        <g stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const [x1, y1] = polar(176, i * 60 + 20 + (frame % 6) * 3);
            const [x2, y2] = polar(212, i * 60 + 20 + (frame % 6) * 3);
            return <path key={i} d={`M ${x1} ${-250 + y1} L ${x2} ${-250 + y2}`} />;
          })}
        </g>
      )}
    </g>
  );
};
