// E15's cast: a FAMILY OF THREE SEA OTTERS who float upright in a row holding paws.
//
//     little otter  =  "plus the lower beads"   (sunny yellow bandana)
//     middle otter  =  "minus five"             (coral bandana)
//     big otter     =  "plus ten"               (aqua bandana)
//
// Sea otters really do float in a chain holding paws so the current cannot pull them apart, and the Family
// formula is exactly THREE parts that always travel together: +lower beads, −5, +10. So the family IS the
// formula. They link paws when the formula is named, and each one lights up (a soft glow in its own colour
// and a bounce) on its own part while that part's beads move.
//
// One component for a single otter, one for the row. Moods are keyed to the mood NAME, never to an
// oscillation (the series rule for every mascot), and every number is a pure function of the frame, so
// nothing needs state. Bare <g> — render inside an <svg>.
//
// Colour discipline: `PART_COLOURS` are the three part colours used by the formula card too, all chosen so
// DARK ink (#0B3B4A) reads on them at 4.5:1 or better — the card never needs white text on a bright fill.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export type OtterMood = "float" | "wave" | "point" | "think" | "worry" | "gasp" | "cheer" | "link" | "doze" | "present";

export type OtterRole = "little" | "middle" | "big";

/** A world's costume, drawn over the head/neck only; faces and the necklace / star / crown never change. */
export type Costume = "explorer" | "pilot" | "scarf" | "helmet" | "pirate" | "farmer" | "conductor" | "ticket" | undefined;
export type OtterProp = "binoculars" | "magnifier" | undefined;

export const PART_COLOURS: Record<OtterRole, string> = {
  little: "#FFC53D",
  middle: "#FF7A66",
  big: "#2CC4D8",
};
export const INK = "#0B3B4A";

const FUR: Record<OtterRole, { body: string; face: string; ear: string; size: number }> = {
  little: { body: "#F2A24B", face: "#FFF3D6", ear: "#C9722A", size: 0.7 },
  middle: { body: "#E0813C", face: "#FFEFD0", ear: "#B3561C", size: 0.85 },
  big: { body: "#C9622D", face: "#FFE9C8", ear: "#8E3A14", size: 1 },
};

/** A single otter's local box at scale 1 (waterline at y = 0): measured off the shapes below. */
export const OTTER_BOX = { up: 290, half: 120, down: 24 };

type Pt = { x: number; y: number };

export const Otter: React.FC<{
  x: number;
  y: number;
  scale: number;
  role: OtterRole;
  mood: OtterMood;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** 0..1: this otter's own part of the formula is being worked — glow + bounce */
  lit?: number;
  /** -1 looks left, +1 looks right */
  look?: number;
  /** de-synchronise the three: each gets its own phase so they never bob as one body */
  phase?: number;
  /** local-space paw targets, used by the row to make the paws MEET at a junction */
  pawL?: Pt;
  pawR?: Pt;
  /** the small chip above the head naming this otter's formula part ("+1", "−5", "+10") */
  badge?: string;
  /** the family's on-screen scale, so tiny accessories skip text they could not show legibly */
  famScale?: number;
  costume?: Costume;
  /** what the paws hold: binoculars hang at the chest, a magnifier rides in the right paw */
  prop?: OtterProp;
  /** WHO IS WHO: a name chip on the belly ("ME", "SMALL FRIEND", "BIG FRIEND") in the cast colour. */
  tag?: boolean;
  tagPx?: number;
  /** 0..1: the number crown drops onto the head (0 = not worn yet, used until the friend has been introduced) */
  crown?: number;
}> = ({ x, y, scale, role, mood, progress, frame, fps, lit = 0, look = 0, phase = 0, pawL, pawR, badge, famScale, costume, prop, tag, tagPx, crown = 1 }) => {
  // the "−5" on the star and the "+10" on the crown are only drawn where they are big enough to read (hook, like ask, close)
  const accText = (famScale ?? scale) * FUR[role].size >= 0.9;
  const t = frame / fps + phase;
  const F = FUR[role];
  const gest = interpolate(progress, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cheer = mood === "cheer";
  const startHop = Math.sin(Math.min(1, progress / 0.22) * Math.PI) * 11; // every new line, the friends perk up
  const bob = -startHop + Math.sin(t * 1.6) * 4 + (cheer ? Math.abs(Math.sin(t * 5.2)) * -22 : 0) + lit * Math.abs(Math.sin(t * 7)) * -10;
  const sway = Math.sin(t * 1.1) * 2.4 + (mood === "worry" ? Math.sin(t * 22) * 3 : 0);
  const blinkT = (t * 0.33 + (role === "little" ? 0.3 : role === "middle" ? 0.62 : 0)) % 1;
  const blink = mood === "doze" || cheer ? 0 : blinkT > 0.955 ? 0.12 : 1;
  const tilt = mood === "think" ? -8 : mood === "worry" ? Math.sin(t * 20) * 3 : mood === "wave" ? 5 : 0;
  // SQUASH AND STRETCH: stretch tall on the way up of a hop, squash wide on landing; a gasp pops tall then settles
  const hop = cheer ? Math.abs(Math.sin(t * 5.2)) : lit > 0.02 ? lit * Math.abs(Math.sin(t * 7)) * 0.7 : 0;
  const sq = (hop - 0.5) * (cheer ? 0.2 : 0.12) * (hop > 0 ? 1 : 0) + (mood === "gasp" ? 0.1 * (1 - gest) : 0) + Math.sin(t * 1.6 + 1) * 0.012;
  const sx = 1 - sq * 0.7;
  const sy = 1 + sq;

  // ---- arms: resting paws held together over the belly unless a gesture or a link says otherwise
  const rest: { l: Pt; r: Pt } = { l: { x: -22, y: -74 }, r: { x: 22, y: -74 } };
  let l: Pt = { ...rest.l };
  let r: Pt = { ...rest.r };
  if (mood === "wave") r = { x: 78 + 4 * Math.sin(t * 9) * gest, y: -196 - 4 * gest + Math.sin(t * 9) * 8 };
  if (mood === "point") r = { x: 104 * gest + 22 * (1 - gest) + Math.sin(t * 6) * 3 * gest, y: -170 * gest - 74 * (1 - gest) + Math.sin(t * 6) * 3 * gest };
  if (mood === "present") {
    l = { x: -88 * gest - 22 * (1 - gest), y: -190 * gest - 74 * (1 - gest) };
    r = { x: 88 * gest + 22 * (1 - gest), y: -190 * gest - 74 * (1 - gest) };
  }
  if (mood === "think") r = { x: 18, y: -130 };
  if (mood === "gasp") {
    l = { x: -66, y: -168 };
    r = { x: 66, y: -168 };
  }
  if (cheer) {
    const up = 0.55 + 0.45 * Math.abs(Math.sin(t * 5.2));
    l = { x: -76, y: -150 - 80 * up };
    r = { x: 76, y: -150 - 80 * up };
  }
  if (mood === "worry") {
    l = { x: -40, y: -150 };
    r = { x: 40, y: -150 };
  }
  if (pawL) l = pawL;
  if (pawR) r = pawR;

  // ---- face
  const open = mood === "gasp" ? 1 : cheer ? 0.95 : mood === "present" ? 0.8 : mood === "wave" ? 0.65 : mood === "point" ? 0.55 : mood === "link" ? 0.6 : mood === "float" ? 0.4 : 0;
  const worried = mood === "worry";
  const smile = worried ? -0.9 : mood === "gasp" ? 0 : mood === "think" ? 0.15 : 1;
  const eyeScale = mood === "gasp" ? 1.3 : worried ? 1.12 : 1;
  const pupilR = mood === "gasp" ? 0.55 : worried ? 0.8 : 1;
  const lookX = look * 6 + (mood === "think" ? -5 : 0) + (mood === "point" || mood === "present" ? 6 : 0) + Math.sin(t * 2.3 + (phase ?? 0)) * 2.2;
  const lookY = mood === "think" ? -6 : 0;

  const eyeX = 28;
  const eyeY = -206;

  const mouth = () => {
    const my = -170;
    if (open > 0.3) {
      const hgt = 10 + open * 26;
      const wid = 16 + open * 6;
      return (
        <g>
          <path d={`M ${-wid} ${my - 4} Q 0 ${my - 1} ${wid} ${my - 4} Q ${wid + 3} ${my + hgt} 0 ${my + hgt + 4} Q ${-wid - 3} ${my + hgt} ${-wid} ${my - 4} Z`} fill="#6B1F33" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <ellipse cx={0} cy={my + hgt - 2} rx={wid * 0.55} ry={Math.max(3, hgt * 0.28)} fill="#FF7F9A" />
          {/* two cartoon buck teeth */}
          <rect x={-7} y={my - 3} width={6.5} height={Math.min(10, hgt * 0.45)} rx={2} fill="#FFFFFF" stroke={INK} strokeWidth={1.6} />
          <rect x={0.5} y={my - 3} width={6.5} height={Math.min(10, hgt * 0.45)} rx={2} fill="#FFFFFF" stroke={INK} strokeWidth={1.6} />
        </g>
      );
    }
    if (worried) return <path d={`M -18 ${my + 8} q 6 -10 12 0 q 6 10 12 0 q 6 -10 12 0`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    if (mood === "doze") return <path d={`M -10 ${my + 2} Q 0 ${my + 10} 10 ${my + 2}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
    if (mood === "think") return <path d={`M -14 ${my + 2} Q 2 ${my + 8} 18 ${my - 8}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    return <path d={`M -16 ${my - 2} Q 0 ${my + 12 * smile + 4} 16 ${my - 2}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  };

  const arm = (sx: number, sy: number, e: Pt) => (
    <g>
      <path d={`M ${sx} ${sy} Q ${(sx + e.x) / 2 + (sx < 0 ? -10 : 10)} ${(sy + e.y) / 2 + 12} ${e.x} ${e.y}`} stroke={INK} strokeWidth={34} strokeLinecap="round" fill="none" />
      <path d={`M ${sx} ${sy} Q ${(sx + e.x) / 2 + (sx < 0 ? -10 : 10)} ${(sy + e.y) / 2 + 12} ${e.x} ${e.y}`} stroke={F.body} strokeWidth={26} strokeLinecap="round" fill="none" />
      <circle cx={e.x} cy={e.y} r={17} fill={F.ear} stroke={INK} strokeWidth={4} />
      <circle cx={e.x - 4} cy={e.y - 4} r={4.5} fill="#FFFFFF" opacity={0.22} />
    </g>
  );

  const col = PART_COLOURS[role];

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F.size})`}>
      {/* the glow of a lit otter, behind everything */}
      {lit > 0.02 && (
        <g opacity={lit}>
          <circle cx={0} cy={-150 + bob} r={170 + 10 * Math.sin(t * 6)} fill={col} opacity={0.34} />
          <circle cx={0} cy={-150 + bob} r={128} fill={col} opacity={0.3} />
        </g>
      )}
      <g transform={`translate(${sway} ${bob}) rotate(${tilt} 0 -60) scale(${sx} ${sy})`}>
        {costume && role === "big" && (
          <path d={`M -64 -150 Q -112 -60 -86 10 L 86 10 Q 112 -60 64 -150 Z`} fill={{ explorer: "#B3522E", pilot: "#8A6BE8", scarf: "#FF4F86", helmet: "#5A4FC8", pirate: "#C0392B", farmer: "#E0463A", conductor: "#3A5AC8", ticket: "#FF4F86" }[costume]} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        )}
        {/* the body: a long rounded capsule, lighter belly */}
        <path d="M -60 6 C -74 -60 -58 -150 -34 -170 L 34 -170 C 58 -150 74 -60 60 6 Z" fill={F.body} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <ellipse cx={0} cy={-84} rx={38} ry={66} fill={F.face} />
        {/* the bandana — its colour is this otter's part of the formula */}
        <path d="M -44 -150 Q 0 -132 44 -150 L 36 -128 Q 0 -108 -36 -128 Z" fill={col} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d="M 0 -118 l -10 22 l 20 0 Z" fill={col} stroke={INK} strokeWidth={3} strokeLinejoin="round" />

        {/* arms behind the head, in front of the body */}
        {arm(-46, -138, l)}
        {arm(46, -138, r)}
        {prop === "binoculars" && (
          <g transform="translate(0 -128) scale(0.8)">
            <path d="M -30 -34 Q 0 -6 30 -34" stroke={INK} strokeWidth={5} fill="none" />
            {[-20, 20].map((bx) => (
              <g key={bx}>
                <rect x={bx - 15} y={-8} width={30} height={34} rx={9} fill="#6B4A2E" stroke={INK} strokeWidth={4} />
                <ellipse cx={bx} cy={28} rx={17} ry={9} fill="#8FD8F0" stroke={INK} strokeWidth={4} />
              </g>
            ))}
          </g>
        )}
        {prop === "magnifier" && (
          <g transform={`translate(${r.x} ${r.y}) rotate(-30)`}>
            <rect x={-5} y={-4} width={10} height={44} rx={5} fill="#8A5A2B" stroke={INK} strokeWidth={4} />
            <circle cx={0} cy={-26} r={26} fill="#CFF3FF" fillOpacity={0.7} stroke="#D9A23A" strokeWidth={8} />
            <circle cx={0} cy={-26} r={26} fill="none" stroke={INK} strokeWidth={3} />
            <path d="M -14 -36 q 6 -10 16 -10" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* ears */}
        <circle cx={-48} cy={-246} r={17} fill={F.ear} stroke={INK} strokeWidth={4} />
        <circle cx={48} cy={-246} r={17} fill={F.ear} stroke={INK} strokeWidth={4} />
        <circle cx={-48} cy={-246} r={7} fill={F.face} opacity={0.7} />
        <circle cx={48} cy={-246} r={7} fill={F.face} opacity={0.7} />

        {/* head */}
        <ellipse cx={0} cy={-200} rx={66} ry={60} fill={F.body} stroke={INK} strokeWidth={4.5} />
        {/* the cream face mask — the sea otter's own marking */}
        <path d="M -52 -196 Q -48 -250 0 -250 Q 48 -250 52 -196 Q 54 -156 0 -148 Q -54 -156 -52 -196 Z" fill={F.face} />
        {/* cheeks */}
        <ellipse cx={-42} cy={-176} rx={11} ry={7} fill="#FF9A9A" opacity={0.55} />
        <ellipse cx={42} cy={-176} rx={11} ry={7} fill="#FF9A9A" opacity={0.55} />
        {/* eyes: big, shiny, looking where the line is looking */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * eyeX} ${eyeY}) scale(${eyeScale} ${eyeScale * Math.max(0.12, blink)})`}>
            {mood === "doze" || (cheer && blink === 0) ? (
              <path d={`M -17 4 Q 0 ${cheer ? -16 : 12} 17 4`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
            ) : (
              <g>
                <ellipse rx={21} ry={25} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
                <circle cx={lookX} cy={lookY + 3} r={12.5 * pupilR} fill={INK} />
                <circle cx={lookX + 4.5} cy={lookY - 3} r={4.8} fill="#FFFFFF" />
                <circle cx={lookX - 4} cy={lookY + 7} r={2.2} fill="#FFFFFF" />
              </g>
            )}
          </g>
        ))}
        {/* brows: worried lifts the middle ends, think raises one */}
        {worried && (
          <g stroke={INK} strokeWidth={5} strokeLinecap="round">
            <path d="M -48 -226 L -12 -244" />
            <path d="M 48 -226 L 12 -244" />
          </g>
        )}
        {mood === "think" && <path d="M 12 -236 Q 28 -246 44 -236" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />}
        {mood === "gasp" && (
          <g stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round">
            <path d="M -44 -238 Q -28 -252 -12 -238" />
            <path d="M 44 -238 Q 28 -252 12 -238" />
          </g>
        )}
        {/* nose, muzzle, whiskers */}
        <ellipse cx={0} cy={-184} rx={11} ry={8} fill={INK} />
        <ellipse cx={-3} cy={-187} rx={3.5} ry={2} fill="#FFFFFF" opacity={0.5} />
        <path d="M -30 -180 L -62 -186 M -30 -174 L -62 -172 M 30 -180 L 62 -186 M 30 -174 L 62 -172" stroke={INK} strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />
        {mouth()}
        {/* a sweat drop when worried or startled */}
        {(worried || mood === "gasp") && (
          <path d={`M 60 ${-232 + ((t * 70) % 40)} q 11 19 0 28 q -11 -9 0 -28 Z`} fill="#BFEFFF" stroke="#3A9CC4" strokeWidth={2.5} />
        )}
        {costume && role !== "big" && (
          <g transform="translate(0 -250)">
            {costume === "explorer" && (<>
              <ellipse cx={0} cy={4} rx={78} ry={13} fill="#D9B26B" stroke={INK} strokeWidth={4} />
              <path d="M -48 2 Q -46 -44 0 -46 Q 46 -44 48 2 Z" fill="#E8C47E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <path d="M -47 -6 Q 0 4 47 -6 L 48 2 Q 0 12 -48 2 Z" fill="#B3522E" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
              <circle cx={0} cy={-52} r={5} fill="#D9B26B" stroke={INK} strokeWidth={3} />
            </>)}
            {costume === "pilot" && (<>
              <path d="M -54 6 Q -58 -40 0 -44 Q 58 -40 54 6 Z" fill="#C79A5B" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <rect x={-52} y={-18} width={104} height={14} rx={7} fill="#6B4420" stroke={INK} strokeWidth={3} />
              <circle cx={-24} cy={-14} r={20} fill="#CFF3FF" stroke={INK} strokeWidth={4} /><circle cx={24} cy={-14} r={20} fill="#CFF3FF" stroke={INK} strokeWidth={4} />
              <circle cx={-30} cy={-20} r={5} fill="#FFFFFF" /><circle cx={18} cy={-20} r={5} fill="#FFFFFF" />
            </>)}
            {costume === "scarf" && (<>
              <path d="M -52 8 Q -56 -44 0 -48 Q 56 -44 52 8 Z" fill="#FF4F86" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <rect x={-58} y={-4} width={116} height={16} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
              <circle cx={0} cy={-54} r={14} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
            </>)}
            {costume === "helmet" && (<>
              <ellipse cx={0} cy={-10} rx={74} ry={66} fill="#CFF3FF" fillOpacity={0.35} stroke="#FFFFFF" strokeWidth={6} />
              <ellipse cx={0} cy={-10} rx={74} ry={66} fill="none" stroke={INK} strokeWidth={3} />
              <path d="M -40 -50 Q -20 -66 4 -62" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" />
              <rect x={-6} y={-96} width={12} height={34} fill={INK} /><circle cx={0} cy={-100} r={9} fill="#FF6F6F" stroke={INK} strokeWidth={3} />
            </>)}
            {costume === "pirate" && (<>
              <path d="M -62 6 Q -58 -50 0 -52 Q 58 -50 62 6 Q 0 -10 -62 6 Z" fill="#2A2A3A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <path d="M -62 6 Q 0 -10 62 6" stroke="#FFD23F" strokeWidth={5} fill="none" />
              <circle cx={0} cy={-26} r={10} fill="#FFFFFF" stroke={INK} strokeWidth={3} /><path d="M -5 -26 h10 M 0 -31 v10" stroke={INK} strokeWidth={3} />
            </>)}
            {costume === "farmer" && (<>
              <ellipse cx={0} cy={4} rx={84} ry={14} fill="#F0D060" stroke={INK} strokeWidth={4} />
              <path d="M -46 2 Q -44 -42 0 -44 Q 44 -42 46 2 Z" fill="#F7E08A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <rect x={-46} y={-14} width={92} height={12} fill="#E0463A" stroke={INK} strokeWidth={3} />
            </>)}
            {costume === "conductor" && (<>
              <path d="M -50 6 Q -52 -40 0 -42 Q 52 -40 50 6 Z" fill="#3A5AC8" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <path d="M -52 6 Q 0 26 52 6 L 56 -4 Q 0 14 -56 -4 Z" fill="#1F2F7A" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
              <circle cx={0} cy={-22} r={11} fill="#FFD23F" stroke={INK} strokeWidth={3} />
            </>)}
            {costume === "ticket" && (<>
              <rect x={-44} y={-70} width={88} height={74} rx={6} fill="#2A1F6A" stroke={INK} strokeWidth={4} />
              <ellipse cx={0} cy={4} rx={70} ry={12} fill="#2A1F6A" stroke={INK} strokeWidth={4} />
              <rect x={-44} y={-26} width={88} height={14} fill="#FF4F86" /><rect x={-14} y={-60} width={28} height={22} rx={4} fill="#FFE066" stroke={INK} strokeWidth={3} />
            </>)}
          </g>
        )}
        {/* the ACCESSORY that names this otter's part of the formula */}
        {role === "little" && (
          <g>
            {/* a necklace of beads: lower beads, "plus" */}
            {[-30, -15, 0, 15, 30].map((bx, i) => (
              <ellipse key={i} cx={bx} cy={-138 + 16 * (1 - Math.pow(bx / 34, 2)) * 0.9} rx={8.5} ry={6.5} fill={["#FF7A66", "#FFC53D", "#2CC4D8", "#FF7AB6", "#9B7BFF"][i]} stroke={INK} strokeWidth={2.5} />
            ))}
          </g>
        )}
        {role === "middle" && (
          <g transform="translate(0 -104)">
            <path d="M 0 -34 L 10 -12 L 34 -10 L 16 6 L 22 30 L 0 18 L -22 30 L -16 6 L -34 -10 L -10 -12 Z" fill="#FFF0A0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          </g>
        )}
        {(role === "big" || role === "middle") && crown > 0.01 && (() => {
          // THE NUMBER CROWN: Tenzo's gold crown "10" and Fifi's coral crown "5", same shape and size, SEATED on the head:
          // its band sits on the crown of the head (head top is y -260, ears -246) and the spikes rise above it; over a hat it sits on the hat.
          const sc = Math.max(0.2, (famScale ?? scale) * FUR[role].size);
          // legibility boost for small characters, CAPPED at the 16:9 lesson size (~1.4): past that the crown is wider than the head (it was 2.2 in 4:5)
          const k = Math.max(1, Math.min(1.4, 34 / (sc * 22)));
          const lift = role === "middle" && costume ? (costume === "helmet" ? 60 : 30) : 0;
          const big = role === "big";
          const drop = (1 - Math.min(1, crown)) * -90; // comes down from above while it appears
          return (
            <g transform={`translate(0 ${-246 - lift + drop}) scale(${k})`} opacity={Math.min(1, crown * 2.5)}>
              {/* spikes + body, flared slightly to hug the round head */}
              <path d="M -46 4 L -52 -44 L -26 -22 L 0 -56 L 26 -22 L 52 -44 L 46 4 Q 0 14 -46 4 Z" fill={big ? "#FFD23F" : "#FF7A66"} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
              <circle cx={-52} cy={-46} r={5} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />
              <circle cx={52} cy={-46} r={5} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />
              <circle cx={0} cy={-58} r={5.5} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />
              {/* the number sits on its own plate, fully inside it */}
              <rect x={-27} y={-24} width={54} height={34} rx={10} fill="#FFF6CC" stroke={INK} strokeWidth={3} />
              <text x={0} y={-6} textAnchor="middle" dominantBaseline="central" fontFamily={KID_FONT} fontWeight={700} fontSize={big ? 24 : 28} fill={INK}>
                {big ? "10" : "5"}
              </text>
              {/* the band the crown sits on */}
              <rect x={-48} y={6} width={96} height={13} rx={6} fill={big ? "#FFB020" : "#E5503E"} stroke={INK} strokeWidth={4} />
            </g>
          );
        })()}
        {tag && (() => {
          // WHO IS WHO: a big plate on the lower belly. Its text is held at ~40 px IN THE FRAME (52 px on the hook / big views)
          // whatever the character's scale, so a child can read it.
          const sc = Math.max(0.2, (famScale ?? scale) * FUR[role].size);
          const target = tagPx ?? (sc > 1.05 ? 46 : 34);
          const fs = target / sc;
          const lines = role === "little" ? ["ME"] : role === "middle" ? ["SMALL", "FRIEND"] : ["BIG", "FRIEND"];
          const longest = Math.max(...lines.map((l) => l.length));
          const w = longest * 0.64 * fs + 30;
          const h = lines.length * fs * 1.1 + 18;
          const y0 = -2 - h;
          return (
            <g>
              <rect x={-w / 2} y={y0} width={w} height={h} rx={16} fill={PART_COLOURS[role]} stroke={INK} strokeWidth={4.5} />
              {lines.map((ln, i) => (
                <text key={i} x={0} y={y0 + 9 + fs * 1.1 * (i + 0.5)} textAnchor="middle" dominantBaseline="central" fontFamily={KID_FONT} fontWeight={700} fontSize={fs} fill={INK}>
                  {ln}
                </text>
              ))}
            </g>
          );
        })()}
        {/* the part badge: a rounded chip riding above the head while lit */}
        {badge && lit > 0.02 && (
          <g transform={`translate(0 ${-322 - 10 * Math.abs(Math.sin(t * 6))}) scale(${0.6 + 0.4 * lit})`} opacity={lit}>
            <rect x={-46} y={-26} width={92} height={50} rx={25} fill={col} stroke={INK} strokeWidth={4} />
            <text x={0} y={12} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={36} fill={INK}>
              {badge}
            </text>
          </g>
        )}
      </g>
    </g>
  );
};

/** Row geometry, exported for the guard box. `gap` is the centre-to-centre spacing at scale 1. */
export const FAMILY_GAP = 185;
export const FAMILY_BOX = { up: 350, half: FAMILY_GAP + 110, down: 30 };

export const OtterFamily: React.FC<{
  /** the point between the middle otter's feet, on the waterline */
  x: number;
  y: number;
  scale: number;
  mood: OtterMood;
  /** per-otter mood overrides [little, middle, big] */
  moods?: [OtterMood, OtterMood, OtterMood];
  /** 0..1: paws linked into a chain, with a glow at each junction */
  link?: number;
  /** lit[i] 0..1 for [little, middle, big] */
  lit?: [number, number, number];
  badges?: [string, string, string];
  progress: number;
  frame: number;
  fps: number;
  look?: number;
  /** draw the water in front of them */
  water?: boolean;
  costume?: Costume;
  tags?: boolean;
  tagPx?: number;
  /** per-otter entrance [little, middle, big]: 0 = not on stage yet, 0..1 pops in, 1 = present (default all present) */
  enter?: [number, number, number];
  /** per-otter number crown [little, middle, big] 0..1 (default all worn) */
  crowns?: [number, number, number];
}> = ({ x, y, scale, mood, moods, link = 0, lit = [0, 0, 0], badges, progress, frame, fps, look = 0, water = true, costume, tags = false, tagPx, enter = [1, 1, 1], crowns = [1, 1, 1] }) => {
  const t = frame / fps;
  const roles: OtterRole[] = ["little", "middle", "big"];
  const xs = [-FAMILY_GAP, 0, FAMILY_GAP];
  const sizes = roles.map((r) => FUR[r].size);
  // paw junctions: halfway between neighbouring bodies, at belly height; local targets divide out each otter's size
  const junction = (i: number) => ({ wx: (xs[i] + xs[i + 1]) / 2, wy: -86 });
  const pawFor = (i: number, side: "L" | "R"): Pt | undefined => {
    if (link <= 0.02) return undefined;
    const j = side === "R" ? junction(i) : junction(i - 1);
    if ((side === "R" && i === 2) || (side === "L" && i === 0)) return undefined;
    const s = sizes[i];
    const lx = (j.wx - xs[i]) / s;
    const ly = j.wy / s;
    const mix = link;
    const restX = side === "R" ? 22 : -22;
    return { x: restX + (lx - restX) * mix, y: -74 + (ly + 74 * 1) * mix * 0 + (ly - -74) * mix };
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* link glows under the paws */}
      {link > 0.02 &&
        [0, 1].map((i) => {
          const j = junction(i);
          return (
            <g key={i} transform={`translate(${j.wx} ${j.wy - 14})`} opacity={link}>
              <circle r={26 + 5 * Math.sin(t * 7 + i)} fill="#FFFFFF" opacity={0.35} />
              <circle r={14} fill="#FFE27A" stroke={INK} strokeWidth={3} />
              <path d="M -6 0 l 4 4 l 8 -9" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
      {[2, 1, 0].map((i) => {
        const role = roles[i];
        const m = moods ? moods[i] : mood;
        const en = enter[i];
        if (en <= 0.001) return null;
        const ez = en >= 1 ? 1 : 1 - Math.pow(1 - en, 3);
        const sp = en >= 1 ? 1 : 0.3 + 0.7 * ez + Math.sin(ez * Math.PI) * 0.12;
        return (
          <g key={role} opacity={Math.min(1, en * 3)} transform={`translate(${xs[i]} 0) scale(${sp}) translate(${-xs[i]} 0)`}>
          <Otter
            key={role}
            crown={crowns[i]}
            x={xs[i]}
            y={0}
            scale={1}
            role={role}
            mood={link > 0.5 && !moods ? "link" : m}
            progress={progress}
            frame={frame}
            fps={fps}
            lit={lit[i]}
            look={look}
            phase={i * 0.9}
            pawL={pawFor(i, "L")}
            pawR={pawFor(i, "R")}
            badge={badges?.[i]}
            famScale={scale}
            costume={costume}
            tag={tags}
            tagPx={tagPx}
          />
          </g>
        );
      })}
      {/* the water: a soft band across the lower bodies with a bright rippling edge and rings; it fades out sideways and downward so it never reads as a box */}
      {water && (
        <g>
          <defs>
            <linearGradient id="otterWaterV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2AA7B8" stopOpacity={0.78} />
              <stop offset="100%" stopColor="#2AA7B8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="otterWaterH" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fff" stopOpacity={0} />
              <stop offset="14%" stopColor="#fff" stopOpacity={1} />
              <stop offset="86%" stopColor="#fff" stopOpacity={1} />
              <stop offset="100%" stopColor="#fff" stopOpacity={0} />
            </linearGradient>
            <mask id="otterWaterMask" maskUnits="userSpaceOnUse" x={-FAMILY_BOX.half - 60} y={-20} width={FAMILY_BOX.half * 2 + 120} height={140}>
              <rect x={-FAMILY_BOX.half - 40} y={-20} width={FAMILY_BOX.half * 2 + 80} height={140} fill="url(#otterWaterH)" />
            </mask>
          </defs>
          <g mask="url(#otterWaterMask)">
            <path
              d={`M ${-FAMILY_BOX.half - 40} 6 ` + Array.from({ length: 29 }, (_, i) => `L ${-FAMILY_BOX.half - 40 + (i / 28) * (FAMILY_BOX.half * 2 + 80)} ${6 + Math.sin(t * 2.1 + i * 0.8) * 4}`).join(" ") + ` L ${FAMILY_BOX.half + 40} 90 L ${-FAMILY_BOX.half - 40} 90 Z`}
              fill="url(#otterWaterV)"
            />
            <path
              d={`M ${-FAMILY_BOX.half - 40} 6 ` + Array.from({ length: 29 }, (_, i) => `L ${-FAMILY_BOX.half - 40 + (i / 28) * (FAMILY_BOX.half * 2 + 80)} ${6 + Math.sin(t * 2.1 + i * 0.8) * 4}`).join(" ")}
              stroke="#FFFFFF"
              strokeWidth={4}
              fill="none"
              opacity={0.55}
            />
          </g>
          {xs.map((cx, i) => (
            <ellipse key={i} cx={cx} cy={10} rx={74 * sizes[i] + ((t * 24 + i * 12) % 30)} ry={12 + ((t * 5 + i * 3) % 6)} fill="none" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.35} />
          ))}
        </g>
      )}
    </g>
  );
};
