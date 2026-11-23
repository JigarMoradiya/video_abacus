// SET-PIECE CRITTERS for the Bead Buddies themes: round, friendly, big googly eyes, ink outlines. Same mood vocabulary as the dinosaurs
// (calm = breathe + blink, cheer = hop + open mouth, tilt = head cocked). Feet / base at (x, y). Pure functions of the frame.
import React from "react";
import { DINO_INK as INK, eye, blinkOf, Mouth, type DinoMood } from "../e08/Dino";

export type CritterKind =
  | "cloudy" | "sparky" // cloud castle
  | "snowman" | "penguin" // snow mountain
  | "alien" | "robo" // galaxy
  | "parrot" | "crab" // pirate island
  | "pig" | "chick" // farm
  | "engine" | "carriage" // train valley
  | "balloon" | "bear"; // funfair

const O = { stroke: INK, strokeWidth: 5, strokeLinejoin: "round" as const };

export const Critter: React.FC<{
  kind: CritterKind;
  x: number;
  y: number;
  scale: number;
  mood: DinoMood;
  frame: number;
  fps: number;
  facing?: 1 | -1;
  seed?: number;
}> = ({ kind, x, y, scale, mood, frame, fps, facing = 1, seed = 0 }) => {
  const t = frame / fps + seed;
  const cheer = mood === "cheer";
  const hop = cheer ? Math.abs(Math.sin(t * 5)) : 0;
  const sq = cheer ? (hop - 0.5) * 0.16 : Math.sin(t * 1.5) * 0.015;
  const bl = blinkOf(t, seed * 0.37);
  const tilt = mood === "tilt" ? -10 + Math.sin(t * 2) * 2 : Math.sin(t * 0.8) * 1.5;
  const open = cheer ? 0.9 : 0;
  const bob = Math.sin(t * 1.2) * 8;
  const body = (() => {
    switch (kind) {
      case "cloudy":
        return (
          <g transform={`translate(0 ${-110 + bob})`}>
            <ellipse cx={0} cy={20} rx={96} ry={50} fill="#FFFFFF" {...O} />
            <circle cx={-52} cy={-8} r={48} fill="#FFFFFF" {...O} />
            <circle cx={14} cy={-30} r={60} fill="#FFFFFF" {...O} />
            <circle cx={66} cy={0} r={42} fill="#FFFFFF" {...O} />
            <ellipse cx={0} cy={22} rx={90} ry={44} fill="#FFFFFF" />
            <g transform={`rotate(${tilt} 0 0)`}>{eye(-16, -4, 17, bl, 0.3)}{eye(26, -4, 15, bl, 0.3)}<Mouth x={4} y={28} w={22} open={open} /><ellipse cx={-34} cy={22} rx={10} ry={6} fill="#FF9AAE" opacity={0.7} /></g>
          </g>
        );
      case "sparky":
        return (
          <g transform={`translate(0 ${-70 + bob}) rotate(${tilt + Math.sin(t) * 6})`}>
            <path d="M 0 -62 L 17 -20 L 62 -18 L 28 10 L 40 54 L 0 30 L -40 54 L -28 10 L -62 -18 L -17 -20 Z" fill="#FFD23F" {...O} />
            {eye(-14, -4, 13, bl, 0.2)}{eye(16, -4, 12, bl, 0.2)}<Mouth x={0} y={22} w={14} open={open} />
          </g>
        );
      case "snowman":
        return (
          <g transform={`rotate(${tilt * 0.4} 0 0)`}>
            <circle cx={0} cy={-56} r={58} fill="#FFFFFF" {...O} />
            <circle cx={0} cy={-142} r={42} fill="#FFFFFF" {...O} />
            <path d="M -40 -118 Q 0 -100 40 -118 L 36 -102 Q 0 -86 -36 -102 Z" fill="#FF5E7E" {...O} />
            <path d="M 14 -108 q 12 30 -4 44 q -10 -20 4 -44" fill="#FF5E7E" {...O} />
            <rect x={-30} y={-196} width={60} height={34} rx={6} fill="#2A2A5A" {...O} />
            <rect x={-44} y={-168} width={88} height={10} rx={5} fill="#2A2A5A" {...O} />
            {eye(-14, -146, 11, bl, 0.2)}{eye(14, -146, 11, bl, 0.2)}
            <path d="M 0 -138 L 26 -130 L 0 -126 Z" fill="#FF9A3D" {...O} strokeWidth={3} />
            <path d={`M -40 -76 L ${-86 - hop * 10} ${-110 - hop * 20}`} stroke="#6B4420" strokeWidth={7} strokeLinecap="round" />
            <path d={`M 40 -76 L ${86 + hop * 10} ${-100 - hop * 20}`} stroke="#6B4420" strokeWidth={7} strokeLinecap="round" />
            {[-20, 0, 20].map((b, i) => <circle key={i} cx={0} cy={-76 + i * 22} r={5} fill={INK} />)}
          </g>
        );
      case "penguin":
        return (
          <g transform={`rotate(${tilt * 0.5})`}>
            <ellipse cx={0} cy={-62} rx={54} ry={66} fill="#2F4A7A" {...O} />
            <ellipse cx={0} cy={-52} rx={34} ry={48} fill="#FFFFFF" />
            <path d={`M -52 -70 Q -78 ${-50 - hop * 20} -62 -30`} stroke={INK} strokeWidth={5} fill="#2F4A7A" />
            <path d={`M 52 -70 Q 78 ${-50 - hop * 20} 62 -30`} stroke={INK} strokeWidth={5} fill="#2F4A7A" />
            {eye(-16, -88, 14, bl, 0.2)}{eye(16, -88, 14, bl, 0.2)}
            <path d="M -12 -70 L 12 -70 L 0 -56 Z" fill="#FF9A3D" {...O} strokeWidth={3} />
            <ellipse cx={-22} cy={2} rx={20} ry={9} fill="#FF9A3D" {...O} strokeWidth={4} /><ellipse cx={22} cy={2} rx={20} ry={9} fill="#FF9A3D" {...O} strokeWidth={4} />
          </g>
        );
      case "alien":
        return (
          <g transform={`translate(0 ${-80 + bob * 0.5})`}>
            <path d={`M -10 -92 Q -26 -130 -14 ${-140 + Math.sin(t * 3) * 6}`} stroke={INK} strokeWidth={5} fill="none" /><circle cx={-14} cy={-142 + Math.sin(t * 3) * 6} r={9} fill="#FF6FA8" {...O} strokeWidth={4} />
            <path d={`M 10 -92 Q 26 -130 14 ${-140 - Math.sin(t * 3) * 6}`} stroke={INK} strokeWidth={5} fill="none" /><circle cx={14} cy={-142 - Math.sin(t * 3) * 6} r={9} fill="#FFE066" {...O} strokeWidth={4} />
            <ellipse cx={0} cy={0} rx={74} ry={80} fill="#7FE070" {...O} />
            {eye(-26, -20, 22, bl, 0.2)}{eye(26, -20, 22, bl, 0.2)}{eye(0, -44, 14, bl, 0.2)}
            <Mouth x={0} y={32} w={24} open={Math.max(open, 0.4)} />
            <ellipse cx={-48} cy={20} rx={12} ry={7} fill="#FF9AAE" opacity={0.7} />
          </g>
        );
      case "robo":
        return (
          <g transform={`translate(0 ${-70 + bob * 0.4}) rotate(${tilt * 0.4})`}>
            <rect x={-62} y={-60} width={124} height={110} rx={26} fill="#C9D4F0" {...O} />
            <rect x={-6} y={-92} width={12} height={34} fill={INK} /><circle cx={0} cy={-96} r={10} fill="#FF6F6F" {...O} strokeWidth={4} />
            <rect x={-44} y={-40} width={88} height={52} rx={16} fill="#2A3A6A" />
            {eye(-18, -14, 14, bl, 0.2)}{eye(18, -14, 14, bl, 0.2)}
            <Mouth x={0} y={26} w={20} open={open} />
            <rect x={-78} y={-10} width={18} height={50} rx={9} fill="#9AA8D0" {...O} strokeWidth={4} /><rect x={60} y={-10} width={18} height={50} rx={9} fill="#9AA8D0" {...O} strokeWidth={4} />
          </g>
        );
      case "parrot":
        return (
          <g transform={`rotate(${tilt * 0.6})`}>
            <path d="M -20 -40 Q -60 20 -30 40 Q -40 -10 -20 -40" fill="#2FB8E8" {...O} strokeWidth={4} />
            <ellipse cx={0} cy={-60} rx={46} ry={62} fill="#FF4F5E" {...O} />
            <path d={`M -42 -70 Q ${-84 - hop * 10} -40 -50 -20`} fill="#FFD23F" {...O} strokeWidth={4} />
            <circle cx={0} cy={-132} r={44} fill="#FF4F5E" {...O} />
            {eye(-14, -138, 15, bl, 0.3)}{eye(18, -138, 14, bl, 0.3)}
            <path d="M 2 -124 Q 36 -122 30 -96 Q 12 -104 2 -124 Z" fill="#FFD23F" {...O} strokeWidth={4} />
            <path d="M -10 -172 Q 0 -196 14 -172" fill="#2FB8E8" {...O} strokeWidth={4} />
          </g>
        );
      case "crab":
        return (
          <g>
            {[-1, 1].map((sd) => <g key={sd}><path d={`M ${sd * 60} -36 Q ${sd * 100} ${-70 - hop * 20} ${sd * 84} ${-100 - hop * 20}`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" /><path d={`M ${sd * 60} -36 Q ${sd * 100} ${-70 - hop * 20} ${sd * 84} ${-100 - hop * 20}`} stroke="#FF6A4F" strokeWidth={8} fill="none" strokeLinecap="round" /><circle cx={sd * 84} cy={-108 - hop * 20} r={20} fill="#FF6A4F" {...O} strokeWidth={4} /></g>)}
            <ellipse cx={0} cy={-34} rx={68} ry={44} fill="#FF6A4F" {...O} />
            {eye(-22, -62, 15, bl, 0.2)}{eye(22, -62, 15, bl, 0.2)}<Mouth x={0} y={-26} w={20} open={open} />
          </g>
        );
      case "pig":
        return (
          <g>
            {[-40, 36].map((lx) => <rect key={lx} x={lx - 12} y={-34} width={24} height={34} rx={10} fill="#FF9FB8" {...O} strokeWidth={4} />)}
            <ellipse cx={0} cy={-70} rx={88} ry={60} fill="#FFB3C8" {...O} />
            <g transform={`translate(66 -86) rotate(${tilt})`}>
              <path d="M -22 -34 L -30 -66 L -2 -44 Z M 18 -38 L 30 -68 L 36 -34 Z" fill="#FF9FB8" {...O} strokeWidth={4} />
              <ellipse cx={0} cy={0} rx={44} ry={40} fill="#FFB3C8" {...O} />
              <ellipse cx={20} cy={10} rx={22} ry={16} fill="#FF8FB0" {...O} strokeWidth={4} /><circle cx={14} cy={10} r={3} fill={INK} /><circle cx={28} cy={10} r={3} fill={INK} />
              {eye(-8, -12, 12, bl, 0.3)}{eye(18, -14, 11, bl, 0.3)}
            </g>
            <path d="M -86 -76 q -26 -10 -8 -30 q 12 12 4 22" stroke={INK} strokeWidth={5} fill="none" />
          </g>
        );
      case "chick":
        return (
          <g transform={`rotate(${tilt * 0.5})`}>
            <circle cx={0} cy={-56} r={54} fill="#FFE066" {...O} />
            <path d={`M -50 -60 Q ${-80 - hop * 10} -40 -52 -26`} fill="#FFD23F" {...O} strokeWidth={4} /><path d={`M 50 -60 Q ${80 + hop * 10} -40 52 -26`} fill="#FFD23F" {...O} strokeWidth={4} />
            {eye(-18, -66, 14, bl, 0.2)}{eye(18, -66, 14, bl, 0.2)}
            <path d="M -10 -50 L 10 -50 L 0 -36 Z" fill="#FF9A3D" {...O} strokeWidth={3} />
            <path d="M -8 -108 q 0 -18 8 -22 q 8 6 0 22" fill="#FF6F6F" {...O} strokeWidth={3} />
            <path d="M -20 0 v10 M 20 0 v10" stroke="#FF9A3D" strokeWidth={6} />
          </g>
        );
      case "engine":
        return (
          <g>
            <rect x={-110} y={-96} width={150} height={78} rx={14} fill="#FF5E7E" {...O} />
            <rect x={20} y={-146} width={86} height={128} rx={14} fill="#FFD23F" {...O} />
            <rect x={-96} y={-142} width={40} height={50} fill="#4A3F7A" {...O} strokeWidth={4} />
            {[0, 1, 2].map((i) => { const u = (t * 0.6 + i / 3) % 1; return <circle key={i} cx={-76 + u * 20} cy={-150 - u * 120} r={14 + u * 22} fill="#FFFFFF" opacity={0.7 * (1 - u)} />; })}
            <rect x={30} y={-136} width={66} height={50} rx={10} fill="#CFF3FF" {...O} strokeWidth={4} />
            {eye(-70, -62, 17, bl, 0.4)}{eye(-24, -62, 17, bl, 0.4)}<Mouth x={-46} y={-30} w={22} open={open} />
            {[-80, -26, 62].map((wx, i) => <g key={wx} transform={`translate(${wx} -10) rotate(${t * 120})`}><circle r={i === 2 ? 26 : 20} fill="#3A2A6A" {...O} strokeWidth={4} /><path d="M -14 0 H 14 M 0 -14 V 14" stroke="#FFD23F" strokeWidth={4} /></g>)}
          </g>
        );
      case "carriage":
        return (
          <g>
            <rect x={-70} y={-100} width={140} height={84} rx={14} fill="#6FD0F0" {...O} />
            {[-34, 0, 34].map((wx) => <rect key={wx} x={wx - 12} y={-84} width={24} height={26} rx={6} fill="#FFF6D6" {...O} strokeWidth={3} />)}
            {[-40, 40].map((wx) => <g key={wx} transform={`translate(${wx} -10) rotate(${t * 120})`}><circle r={18} fill="#3A2A6A" {...O} strokeWidth={4} /><path d="M -12 0 H 12 M 0 -12 V 12" stroke="#FFD23F" strokeWidth={4} /></g>)}
          </g>
        );
      case "balloon":
        return (
          <g transform={`translate(0 ${-150 + bob}) rotate(${tilt})`}>
            <ellipse cx={0} cy={0} rx={64} ry={78} fill="#FF4F86" {...O} />
            <path d="M -8 78 L 8 78 L 0 92 Z" fill="#FF4F86" {...O} strokeWidth={3} />
            <path d={`M 0 92 Q ${Math.sin(t * 2) * 14} 130 0 170`} stroke={INK} strokeWidth={3} fill="none" />
            <ellipse cx={-24} cy={-36} rx={12} ry={20} fill="#FFFFFF" opacity={0.5} />
            {eye(-22, -8, 17, bl, 0.2)}{eye(22, -8, 17, bl, 0.2)}<Mouth x={0} y={36} w={22} open={Math.max(open, 0.4)} />
          </g>
        );
      case "bear":
        return (
          <g>
            {[-40, 40].map((lx) => <ellipse key={lx} cx={lx} cy={-10} rx={24} ry={16} fill="#C98B5A" {...O} strokeWidth={4} />)}
            <ellipse cx={0} cy={-56} rx={64} ry={58} fill="#D9A06A" {...O} />
            <ellipse cx={0} cy={-46} rx={40} ry={38} fill="#F3D2A8" />
            <g transform={`translate(0 -118) rotate(${tilt})`}>
              {[-44, 44].map((ex) => <circle key={ex} cx={ex} cy={-26} r={20} fill="#C98B5A" {...O} strokeWidth={4} />)}
              <circle cx={0} cy={0} r={54} fill="#D9A06A" {...O} />
              <ellipse cx={0} cy={14} rx={26} ry={20} fill="#F3D2A8" />
              <ellipse cx={0} cy={6} rx={9} ry={6} fill={INK} />
              {eye(-20, -10, 14, bl, 0.2)}{eye(20, -10, 14, bl, 0.2)}<Mouth x={0} y={20} w={14} open={open} />
            </g>
            <path d="M -50 -64 L -72 -90 M 50 -64 L 72 -90" stroke="#C98B5A" strokeWidth={14} strokeLinecap="round" />
          </g>
        );
    }
  })();
  return (
    <g transform={`translate(${x} ${y - hop * 22 * scale}) scale(${facing * scale} ${scale})`}>
      <g transform={`scale(${1 - sq * 0.7} ${1 + sq})`}>{body}</g>
    </g>
  );
};
