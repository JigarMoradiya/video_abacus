// THE GRUMPY TICKET MACHINE — the story's funny villain/victim: the brand-new prize-ticket machine
// at the arcade's grand opening. It has a face (big googly eyes and brows on a dark screen), its
// ticket slot is its MOUTH, it has stubby arms with gloves, a chasing-light "TICKETS" marquee and
// a row of blinking buttons. It jams (dizzy spiral eyes, shaking, steam, a crumpled ticket stuck
// in its mouth), it sweats while the heroes count down, it gasps at the friend reveal, and it
// SPITS a ticket with the answer printed on it when the sum is solved.
//
// Bare <g> — render inside an <svg>. Local origin = bottom centre of the machine's feet.
// Pose is keyed to the mood; everything else is a pure function of the frame.

import React from "react";
import { KID_FONT } from "../../lib/fonts";

export type MachineMood = "grumpy" | "alarm" | "jam" | "nervous" | "gasp" | "happy" | "cheer";

/** Measured off the shapes: feet at y=0, marquee top at y=-470. */
export const MACHINE_BOX = { halfW: 232, up: 500 };

const INK = "#2A1430";
const RED = "#FF3D5E";
const RED_D = "#C81E45";
const YELLOW = "#FFD60A";

const Spiral: React.FC<{ r: number; turns: number; t: number }> = ({ r, turns, t }) => {
  const pts: string[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * turns * Math.PI * 2 + t * 9;
    const rr = (i / steps) * r;
    pts.push(`${i === 0 ? "M" : "L"} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return <path d={pts.join(" ")} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
};

export const TicketMachine: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: MachineMood;
  frame: number;
  fps: number;
  /** frame the current mood began (for entrance pops) */
  moodFrame?: number;
  /** extra shake 0..1 on top of the mood's own */
  shake?: number;
  /** a ticket sliding out of the slot, 0..1 (1 = fully out) */
  ticket?: number;
  ticketText?: string;
  /** a crumpled ticket stuck in the mouth, 0..1 */
  jammed?: number;
  /** alarm light intensity 0..1 */
  alarm?: number;
  /** -1 stretched .. +1 squashed */
  squash?: number;
  hop?: number;
}> = ({ x, y, scale, mood, frame, fps, moodFrame = 0, shake = 0, ticket = 0, ticketText = "", jammed = 0, alarm = 0, squash = 0, hop = 0 }) => {
  const t = frame / fps;
  const since = Math.max(0, (frame - moodFrame) / fps);

  const baseShake = mood === "jam" ? 1 : mood === "alarm" ? 0.7 : mood === "nervous" ? 0.35 : 0;
  const sh = Math.min(1.4, baseShake + shake);
  const shakeX = Math.sin(t * 48) * 7 * sh;
  const shakeY = Math.cos(t * 41) * 3 * sh;
  const sx = 1 + 0.16 * squash;
  const sy = 1 - 0.16 * squash;

  // eyes
  const dizzy = mood === "jam";
  const happy = mood === "happy" || mood === "cheer";
  const wide = mood === "alarm" || mood === "gasp";
  const darting = mood === "nervous" ? Math.sin(t * 5.5) * 9 : 0;
  const eyeR = wide ? 40 : 33;
  const blinkT = (t * 0.36) % 1;
  const blink = blinkT > 0.955 && !wide && !dizzy ? 0.1 : 1;

  // brows: grumpy slants down toward the middle; happy arches up
  const browAngle = happy ? -8 : mood === "gasp" ? -14 : mood === "nervous" ? -10 : 16;
  const browY = happy || wide ? -10 : 0;

  // mouth = the ticket slot
  const slotW = 224;
  const slotY = 70;
  const open = mood === "gasp" ? 1 : happy ? 0.55 : mood === "alarm" ? 0.5 : 0.12;
  const wobble = mood === "nervous" || mood === "jam" ? Math.sin(t * 22) * 3 : 0;

  // chasing marquee bulbs
  const bulbs = Array.from({ length: 11 }, (_, i) => {
    const on = ((Math.floor(t * 6) + i) % 3) === 0;
    const bx = -190 + i * 38;
    const by = -430 + Math.abs(i - 5) * -0 + (1 - Math.cos(((i - 5) / 5) * Math.PI * 0.5)) * 18;
    return { bx, by, on };
  });

  const steam = mood === "jam" ? 1 : mood === "alarm" ? 0.5 : 0;

  const armUp = mood === "cheer" ? 1 : mood === "alarm" ? 0.55 : mood === "gasp" ? 0.8 : 0;
  const armWag = mood === "jam" || mood === "alarm" ? Math.sin(t * 20) * 14 : 0;

  return (
    <g transform={`translate(${x + shakeX} ${y - hop + shakeY}) scale(${scale * sx} ${scale * sy})`}>
      <ellipse cx={0} cy={8} rx={190} ry={22} fill="#000" opacity={0.2} />

      {/* steam vents on top */}
      {steam > 0 &&
        [-120, 0, 120].map((vx, i) => (
          <g key={i}>
            {[0, 1, 2].map((k) => {
              const ph = ((t * 1.1 + k / 3 + i * 0.27) % 1);
              return (
                <circle
                  key={k}
                  cx={vx + Math.sin(ph * 6 + i) * 14}
                  cy={-486 - ph * 120}
                  r={14 + ph * 26}
                  fill="#FFFFFF"
                  opacity={(1 - ph) * 0.65 * steam}
                />
              );
            })}
          </g>
        ))}

      {/* feet */}
      <rect x={-150} y={-30} width={84} height={34} rx={14} fill={RED_D} stroke={INK} strokeWidth={5} />
      <rect x={66} y={-30} width={84} height={34} rx={14} fill={RED_D} stroke={INK} strokeWidth={5} />

      {/* side arms */}
      {[-1, 1].map((s) => {
        const hx = s * (236 + armUp * 28 + (s === 1 ? armWag : -armWag) * 0.6);
        const hy = -150 - armUp * 190 + (armUp === 0 ? 60 : 0);
        return (
          <g key={s}>
            <path d={`M ${s * 196} -200 Q ${s * 250} ${(hy - 200) / 2 - 10} ${hx} ${hy}`} stroke={RED_D} strokeWidth={30} strokeLinecap="round" fill="none" />
            <path d={`M ${s * 196} -200 Q ${s * 250} ${(hy - 200) / 2 - 10} ${hx} ${hy}`} stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.0} />
            <circle cx={hx} cy={hy} r={25} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          </g>
        );
      })}

      {/* body */}
      <path d="M -204 -26 q -14 -250 6 -372 q 6 -26 34 -26 h 328 q 28 0 34 26 q 20 122 6 372 q -2 28 -30 28 h -348 q -28 0 -30 -28 Z" fill={RED} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {/* highlight + side stripes */}
      <path d="M -176 -60 q -8 -170 4 -300" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={12} fill="none" strokeLinecap="round" />
      <rect x={-198} y={-250} width={20} height={190} rx={8} fill={YELLOW} stroke={INK} strokeWidth={4} />
      <rect x={178} y={-250} width={20} height={190} rx={8} fill={YELLOW} stroke={INK} strokeWidth={4} />

      {/* the marquee */}
      <path d="M -204 -392 q 204 -62 408 0 l -6 -68 q -198 -48 -396 0 Z" fill={YELLOW} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <text x={0} y={-418} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={52} fill="#B3123F" stroke={INK} strokeWidth={0} letterSpacing={6}>
        TICKETS
      </text>
      {bulbs.map((b, i) => (
        <circle key={i} cx={b.bx} cy={b.by + 20} r={7} fill={b.on ? "#FFFFFF" : "#FFE9A8"} stroke={INK} strokeWidth={2} opacity={b.on ? 1 : 0.6} />
      ))}

      {/* alarm light on top */}
      <g transform="translate(0 -500)">
        <rect x={-34} y={-8} width={68} height={22} rx={8} fill="#7A1030" stroke={INK} strokeWidth={4} />
        <path d="M -30 -8 q 30 -62 60 0 Z" fill={alarm > 0.05 ? "#FF2D2D" : "#8A2A3A"} stroke={INK} strokeWidth={4} opacity={0.6 + 0.4 * alarm} />
        {alarm > 0.05 && <circle cx={0} cy={-26} r={70 + 20 * Math.sin(t * 14)} fill="#FF3030" opacity={0.18 * alarm} />}
      </g>

      {/* the face screen */}
      <rect x={-146} y={-376} width={292} height={190} rx={34} fill="#1B1F4B" stroke={INK} strokeWidth={6} />
      <rect x={-136} y={-366} width={272} height={170} rx={28} fill="#2A3180" opacity={0.7} />
      {/* eyes */}
      {[-62, 62].map((ex, i) => (
        <g key={ex} transform={`translate(${ex} -290)`}>
          <g transform={`scale(1 ${blink})`}>
            {happy ? (
              <path d={`M ${-eyeR} 8 Q 0 ${-eyeR * 1.2} ${eyeR} 8`} stroke="#FFFFFF" strokeWidth={11} fill="none" strokeLinecap="round" />
            ) : (
              <>
                <circle r={eyeR} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
                {dizzy ? (
                  <Spiral r={eyeR - 6} turns={2.4} t={t * (i ? -1 : 1)} />
                ) : (
                  <circle cx={darting + (mood === "alarm" ? 0 : -4 * (i ? -1 : 1))} cy={mood === "grumpy" ? 6 : 0} r={wide ? 12 : 16} fill={INK} />
                )}
                {!dizzy && !happy && <circle cx={(darting || 0) + 5} cy={-7} r={5} fill="#FFFFFF" />}
              </>
            )}
          </g>
          {/* brow */}
          <path
            d={`M ${-eyeR - 8} ${-eyeR - 12 + browY} L ${eyeR + 8} ${-eyeR - 12 + browY - 0}`}
            stroke="#FFFFFF"
            strokeWidth={9}
            strokeLinecap="round"
            transform={`rotate(${i === 0 ? browAngle : -browAngle} 0 ${-eyeR - 12 + browY})`}
          />
          {/* eyelid for the grumpy half-lid */}
          {mood === "grumpy" && <path d={`M ${-eyeR} -2 a ${eyeR} ${eyeR} 0 0 1 ${eyeR * 2} 0 Z`} fill="#1B1F4B" transform="translate(0 -6)" />}
        </g>
      ))}
      {mood === "nervous" && <path d="M 112 -330 q 12 22 0 32 q -12 -10 0 -32 Z" fill="#8FDBFF" stroke="#2B8FC9" strokeWidth={3} transform={`translate(0 ${((t * 60) % 30)})`} opacity={0.9} />}

      {/* control panel: blinking buttons */}
      <rect x={-146} y={-170} width={292} height={64} rx={20} fill="#FFE9A8" stroke={INK} strokeWidth={5} />
      {["#FF3D5E", "#2F7BFF", "#2FD27A", "#FFB400", "#B04DFF"].map((c, i) => {
        const on = (Math.floor(t * 4) + i) % 5 === 0 || mood === "cheer";
        return <circle key={c} cx={-100 + i * 50} cy={-138} r={15} fill={c} stroke={INK} strokeWidth={3.5} opacity={on ? 1 : 0.65} />;
      })}

      {/* the mouth: a wide ticket slot */}
      <g transform={`translate(${wobble} ${-slotY})`}>
        <rect x={-slotW / 2} y={-16 - open * 18} width={slotW} height={32 + open * 36} rx={16 + open * 12} fill="#14081A" stroke={INK} strokeWidth={6} />
        {/* grumpy corners / smile */}
        {mood === "grumpy" || mood === "alarm" || mood === "nervous" ? (
          <path d={`M ${-slotW / 2 - 4} 14 q 14 -26 30 -22 M ${slotW / 2 + 4} 14 q -14 -26 -30 -22`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        ) : null}
        {happy && <path d={`M ${-slotW / 2 + 6} -6 q 108 52 ${slotW - 12} 0`} stroke="#FFFFFF" strokeWidth={0} fill="none" />}
        {/* a crumpled ticket stuck in the slot */}
        {jammed > 0.02 && (
          <g transform={`translate(${-14 + Math.sin(t * 30) * 2 * jammed} ${8 + 14 * jammed}) rotate(${-8 + Math.sin(t * 24) * 3})`} opacity={Math.min(1, jammed * 3)}>
            <path d="M -62 -8 l 18 -22 l 16 20 l 18 -24 l 16 22 l 20 -18 l 12 30 l -10 40 l -30 8 l -26 -6 l -30 6 l -12 -20 Z" fill="#FFF3C4" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <path d="M -40 8 l 20 -6 M -10 14 l 26 -8 M 22 6 l 20 -4" stroke="#E0A93A" strokeWidth={3} strokeLinecap="round" />
          </g>
        )}
      </g>

      {/* the ticket tray + a ticket sliding out, with the answer on it */}
      <rect x={-130} y={-50} width={260} height={28} rx={10} fill={RED_D} stroke={INK} strokeWidth={5} />
      {ticket > 0.01 && (
        <g transform={`translate(0 ${-62 + ticket * 124})`}>
          <path d="M -86 -54 h 172 v 108 q -16 0 -16 -14 q 0 -14 -16 -14 q -16 0 -16 14 q 0 14 -16 14 q -16 0 -16 -14 q 0 -14 -16 -14 q -16 0 -16 14 q 0 14 -16 14 q -16 0 -16 -14 q 0 -14 -16 -14 q -16 0 -16 14 q 0 14 -16 14 Z" fill="#FFE156" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={-86} cy={-8} r={12} fill="#1B1F4B" />
          <circle cx={86} cy={-8} r={12} fill="#1B1F4B" />
          <text x={0} y={22} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={70} fill="#B3123F" stroke={INK} strokeWidth={0}>
            {ticketText}
          </text>
          <path d="M -60 -34 h 120" stroke={RED_D} strokeWidth={5} strokeDasharray="10 8" strokeLinecap="round" />
        </g>
      )}

      {/* mood extras: cheer sparkles */}
      {mood === "cheer" &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const ph = ((since * 1.3 + i / 6) % 1);
          return <path key={i} d="M 0 -10 l 4 8 l 8 2 l -8 4 l -2 8 l -4 -8 l -8 -2 l 8 -4 Z" fill="#FFE156" stroke={INK} strokeWidth={2} transform={`translate(${-150 + i * 60} ${-420 - ph * 70}) scale(${1 + 0.6 * (1 - ph)})`} opacity={1 - ph} />;
        })}
    </g>
  );
};
