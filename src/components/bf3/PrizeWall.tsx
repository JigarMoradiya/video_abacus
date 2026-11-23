// THE PRIZE WALL — the funny co-character of Big Friend 3. A coral shelf unit with three shelves of
// cubbies under a scalloped awning, and a FACE on its mint sign. It starts nearly EMPTY (one golden
// jackpot box on the top shelf) and every solved mission RESTOCKS three prizes with a bouncy pop. Moods:
// happy, worry (a sweat drop, shaking, eyes darting), stuck (clenched, a padlock on the jackpot box),
// gasp (huge eyes, O mouth), think (eyes up, a whistling mouth with music notes), cheer (arc eyes,
// open grin, prizes bouncing). Pure function of its inputs. Bare <g>.
// Local box (feet at origin, before scale): halfW 270, up 545.

import React from "react";
import { Txt } from "../bf1/Props";

export type PWMood = "happy" | "worry" | "stuck" | "gasp" | "think" | "cheer";
export const PW_BOX = { halfW: 270, up: 545 };

const INK3 = "#3B1F4E";
const CORAL = "#FF6F6F";
const MINT = "#41D8B0";
const LEMON = "#FFE45C";

/** the 12 cubbies, row-major (row 0 = top shelf). Restock order fills the bottom shelf first. */
export const SLOT_COUNT = 12;
export const JACKPOT_SLOT = 2; // top shelf, third cubby
export const RESTOCK_ORDER = [8, 9, 10, 11, 4, 5, 6, 7, 0, 1, 3];
const KINDS = ["bear", "rocket", "star", "ball", "duck", "gift", "car", "crown", "bear", "gift", "rocket", "star"];

const Prize: React.FC<{ kind: string; k: number; bounce: number; t: number; seed: number }> = ({ kind, k, bounce, t, seed }) => {
  const pop = k <= 0 ? 0 : k < 1 ? 1 + 0.35 * Math.sin(k * Math.PI) * (1 - k) * 2 - Math.pow(1 - k, 3) : 1;
  const hop = bounce * Math.abs(Math.sin(t * 7 + seed)) * 10;
  return (
    <g transform={`translate(0 ${-hop}) scale(${pop})`}>
      {kind === "bear" && (
        <g>
          <circle cx={-18} cy={-52} r={11} fill="#C98B4E" stroke={INK3} strokeWidth={3} />
          <circle cx={18} cy={-52} r={11} fill="#C98B4E" stroke={INK3} strokeWidth={3} />
          <circle cy={-34} r={28} fill="#D9A066" stroke={INK3} strokeWidth={4} />
          <ellipse cy={-26} rx={12} ry={9} fill="#F5D7A8" />
          <circle cx={-10} cy={-40} r={3.5} fill={INK3} />
          <circle cx={10} cy={-40} r={3.5} fill={INK3} />
          <circle cy={-28} r={3.5} fill={INK3} />
        </g>
      )}
      {kind === "rocket" && (
        <g>
          <path d="M 0 -74 Q 20 -50 18 -14 H -18 Q -20 -50 0 -74 Z" fill="#FFFFFF" stroke={INK3} strokeWidth={4} strokeLinejoin="round" />
          <circle cy={-46} r={8} fill="#6FB7FF" stroke={INK3} strokeWidth={3} />
          <path d="M -18 -22 L -32 -6 L -18 -12 Z M 18 -22 L 32 -6 L 18 -12 Z" fill={CORAL} stroke={INK3} strokeWidth={3} strokeLinejoin="round" />
          <path d="M 0 -74 Q 8 -64 10 -56 H -10 Q -8 -64 0 -74 Z" fill={CORAL} />
        </g>
      )}
      {kind === "star" && <path d="M 0 -76 l 11 24 l 26 3 l -19 18 l 5 26 l -23 -13 l -23 13 l 5 -26 l -19 -18 l 26 -3 Z" fill={LEMON} stroke={INK3} strokeWidth={4} strokeLinejoin="round" transform="translate(0 6) scale(0.82)" />}
      {kind === "ball" && (
        <g>
          <circle cy={-34} r={30} fill="#6FB7FF" stroke={INK3} strokeWidth={4} />
          <path d="M -28 -34 Q 0 -54 28 -34 M -26 -22 Q 0 -4 26 -22" stroke="#FFFFFF" strokeWidth={6} fill="none" />
        </g>
      )}
      {kind === "duck" && (
        <g>
          <ellipse cy={-24} rx={30} ry={20} fill={LEMON} stroke={INK3} strokeWidth={4} />
          <circle cx={14} cy={-52} r={18} fill={LEMON} stroke={INK3} strokeWidth={4} />
          <path d="M 28 -50 l 16 4 l -16 6 Z" fill="#FF9F43" stroke={INK3} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={18} cy={-56} r={3.5} fill={INK3} />
        </g>
      )}
      {kind === "gift" && (
        <g>
          <rect x={-28} y={-52} width={56} height={44} rx={6} fill="#B58CFF" stroke={INK3} strokeWidth={4} />
          <rect x={-6} y={-52} width={12} height={44} fill={LEMON} />
          <rect x={-28} y={-34} width={56} height={10} fill={LEMON} />
          <path d="M 0 -52 q -22 -22 -24 -4 q 10 8 24 4 q 14 4 24 -4 q -2 -18 -24 4 Z" fill={CORAL} stroke={INK3} strokeWidth={3} strokeLinejoin="round" />
        </g>
      )}
      {kind === "car" && (
        <g>
          <path d="M -36 -18 V -34 H -20 L -10 -50 H 16 L 26 -34 H 36 V -18 Z" fill={CORAL} stroke={INK3} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={-18} cy={-16} r={9} fill={INK3} />
          <circle cx={20} cy={-16} r={9} fill={INK3} />
          <path d="M -6 -46 H 10 L 18 -34 H -12 Z" fill="#BFF3FF" />
        </g>
      )}
      {kind === "crown" && (
        <g>
          <path d="M -32 -16 L -34 -58 L -16 -38 L 0 -66 L 16 -38 L 34 -58 L 32 -16 Z" fill={LEMON} stroke={INK3} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={-34} cy={-60} r={5} fill={CORAL} />
          <circle cy={-68} r={5} fill={MINT} />
          <circle cx={34} cy={-60} r={5} fill={CORAL} />
        </g>
      )}
    </g>
  );
};

export const PrizeWall: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: PWMood;
  moodFrame: number;
  frame: number;
  fps: number;
  /** per-slot: frames since the prize popped in (negative = not there yet) */
  popAge: number[];
  /** 0..1 prizes bouncing on a cheer */
  bounce?: number;
  /** 0..1 padlock on the jackpot box */
  lock?: number;
  squash?: number;
  hop?: number;
  /** finale: the jackpot box is open (0..1) */
  open?: number;
}> = ({ x, y, scale, mood, moodFrame, frame, fps, popAge, bounce = 0, lock = 0, squash = 0, hop = 0, open = 0 }) => {
  const t = frame / fps;
  const since = Math.max(0, frame - moodFrame);
  const shake = mood === "stuck" ? Math.sin(t * 46) * 3 * Math.min(1, since / 4) : mood === "worry" ? Math.sin(t * 28) * 1.6 : 0;
  const sx = 1 + 0.12 * squash;
  const sy = 1 - 0.12 * squash;
  const blink = (t * 0.4) % 1 > 0.95 ? 0.15 : 1;
  const eyeY = -454;

  const eye = (cx: number, i: number) => {
    if (mood === "cheer") return <path key={i} d={`M ${cx - 24} ${eyeY + 10} Q ${cx} ${eyeY - 30} ${cx + 24} ${eyeY + 10}`} stroke={INK3} strokeWidth={11} fill="none" strokeLinecap="round" />;
    const big = mood === "gasp" ? 1.35 : mood === "worry" ? 1.12 : 1;
    const look = mood === "think" ? [-8, -10] : mood === "worry" ? [Math.sin(t * 7) * 9, 0] : [Math.sin(t * 1.1 + i) * 4, 2];
    const pupil = mood === "gasp" ? 0.55 : 1;
    return (
      <g key={i} transform={`translate(${cx} ${eyeY}) scale(${big} ${big * blink})`}>
        <ellipse rx={38} ry={42} fill="#FFFFFF" stroke={INK3} strokeWidth={5} />
        <circle cx={look[0]} cy={look[1]} r={18 * pupil} fill={INK3} />
        <circle cx={look[0] + 5} cy={look[1] - 5} r={5} fill="#FFFFFF" />
      </g>
    );
  };

  const brows = mood === "worry" || mood === "stuck"
    ? [
        <path key="a" d="M -128 -506 L -52 -490" stroke={INK3} strokeWidth={11} strokeLinecap="round" />,
        <path key="b" d="M 128 -506 L 52 -490" stroke={INK3} strokeWidth={11} strokeLinecap="round" />,
      ]
    : mood === "gasp"
      ? [
          <path key="a" d="M -128 -516 Q -92 -536 -52 -516" stroke={INK3} strokeWidth={11} fill="none" strokeLinecap="round" />,
          <path key="b" d="M 128 -516 Q 92 -536 52 -516" stroke={INK3} strokeWidth={11} fill="none" strokeLinecap="round" />,
        ]
      : null;

  const mouth = (() => {
    const my = -376;
    if (mood === "gasp") return <ellipse cx={0} cy={my + 4} rx={26} ry={30} fill="#7A1030" stroke={INK3} strokeWidth={5} />;
    if (mood === "cheer") return <path d={`M -66 ${my - 10} Q 0 ${my + 62} 66 ${my - 10} Z`} fill="#7A1030" stroke={INK3} strokeWidth={5} strokeLinejoin="round" />;
    if (mood === "stuck") return <path d={`M -48 ${my} l 12 -10 l 12 10 l 12 -10 l 12 10 l 12 -10 l 12 10 l 12 -10`} stroke={INK3} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === "worry") return <path d={`M -44 ${my + 8} Q 0 ${my - 18} 44 ${my + 8}`} stroke={INK3} strokeWidth={8} fill="none" strokeLinecap="round" />;
    if (mood === "think") return <ellipse cx={0} cy={my} rx={13} ry={11} fill="#7A1030" stroke={INK3} strokeWidth={5} />;
    return <path d={`M -56 ${my - 8} Q 0 ${my + 40} 56 ${my - 8}`} stroke={INK3} strokeWidth={8} fill="none" strokeLinecap="round" />;
  })();

  // the 12 cubbies
  const cell = (slot: number) => {
    const row = Math.floor(slot / 4);
    const col = slot % 4;
    return { cx: -165 + col * 110, by: -64 - (2 - row) * 0 - (2 - row) * 0 - row * 0, row };
  };
  const rowBase = [-194, -116, -38];

  return (
    <g transform={`translate(${x + shake * scale} ${y - hop}) scale(${scale * sx} ${scale * sy})`}>
      <ellipse cx={0} cy={8} rx={254} ry={20} fill="#000" opacity={0.25} />
      {/* base and the shelf unit */}
      <rect x={-250} y={-30} width={500} height={30} rx={10} fill={CORAL} stroke={INK3} strokeWidth={7} />
      <rect x={-240} y={-272} width={480} height={246} rx={14} fill={CORAL} stroke={INK3} strokeWidth={8} />
      <rect x={-224} y={-256} width={448} height={216} rx={8} fill="#FFF3C4" stroke={INK3} strokeWidth={4} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={-224} y={rowBase[r]} width={448} height={14} fill={MINT} stroke={INK3} strokeWidth={4} />
          {[1, 2, 3].map((c) => (
            <rect key={c} x={-224 + c * 112 - 4} y={rowBase[r] - 78} width={8} height={78} fill="#F0D98A" stroke={INK3} strokeWidth={2.5} />
          ))}
        </g>
      ))}
      {/* the prizes */}
      {Array.from({ length: SLOT_COUNT }, (_, slot) => {
        const { cx } = cell(slot);
        const row = Math.floor(slot / 4);
        const age = popAge[slot] ?? -1;
        const isJackpot = slot === JACKPOT_SLOT;
        if (!isJackpot && age < 0) return null;
        const k = isJackpot ? 1 : Math.min(1, age / 12);
        return (
          <g key={slot} transform={`translate(${cx} ${rowBase[row]}) scale(0.82)`}>
            {isJackpot ? (
              <g>
                <rect x={-34} y={-62} width={68} height={52} rx={8} fill="#FFC93C" stroke={INK3} strokeWidth={4} />
                <rect x={-34} y={-62} width={68} height={16} rx={6} fill="#FFE45C" stroke={INK3} strokeWidth={4} transform={`rotate(${-open * 40} -34 -62)`} />
                <rect x={-8} y={-50} width={16} height={20} rx={4} fill="#FF6F6F" stroke={INK3} strokeWidth={3} />
                {open > 0.02 && <path d={`M 0 -66 L -22 ${-66 - 90 * open} M 0 -66 L 0 ${-66 - 110 * open} M 0 -66 L 22 ${-66 - 90 * open}`} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.8} />}
                {lock > 0.02 && (
                  <g transform={`translate(0 -34) scale(${0.5 + 0.5 * lock})`} opacity={lock}>
                    <path d="M -12 -14 v -12 a 12 12 0 0 1 24 0 v 12" stroke={INK3} strokeWidth={6} fill="none" />
                    <rect x={-18} y={-14} width={36} height={28} rx={6} fill="#FF6F6F" stroke={INK3} strokeWidth={4} />
                    <circle cy={0} r={4} fill={INK3} />
                  </g>
                )}
              </g>
            ) : (
              <Prize kind={KINDS[slot]} k={k} bounce={bounce} t={t} seed={slot} />
            )}
          </g>
        );
      })}

      {/* the awning under the sign */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={-250 + i * 62.5} y={-318} width={63} height={34} fill={i % 2 ? "#FFFFFF" : CORAL} stroke={INK3} strokeWidth={4} />
          <path d={`M ${-250 + i * 62.5} -284 a 31.25 31.25 0 0 0 62.5 0 Z`} fill={i % 2 ? "#FFFFFF" : CORAL} stroke={INK3} strokeWidth={4} />
        </g>
      ))}
      {/* the face sign */}
      <rect x={-250} y={-545} width={500} height={226} rx={40} fill={MINT} stroke={INK3} strokeWidth={8} />
      <rect x={-234} y={-529} width={468} height={194} rx={28} fill="#7DEAD0" opacity={0.7} />
      {brows}
      {[-92, 92].map((cx, i) => eye(cx, i))}
      <ellipse cx={-140} cy={-396} rx={22} ry={12} fill="#FF9BB0" opacity={0.7} />
      <ellipse cx={140} cy={-396} rx={22} ry={12} fill="#FF9BB0" opacity={0.7} />
      {mouth}
      {mood === "think" &&
        [0, 1].map((i) => {
          const u = ((t * 0.9 + i * 0.5) % 1);
          return (
            <g key={i} transform={`translate(${70 + u * 50} ${-410 - u * 60})`} opacity={1 - u}>
              <circle r={6} cy={8} fill={INK3} />
              <path d="M 6 8 V -14 q 10 2 12 12" stroke={INK3} strokeWidth={4} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
      {(mood === "worry" || mood === "stuck" || mood === "gasp") && (
        <path d={`M 214 ${-480 + ((t * 80) % 50)} q 14 24 0 36 q -14 -12 0 -36 Z`} fill="#8FDBFF" stroke="#2B8FC9" strokeWidth={3} />
      )}
    </g>
  );
};
