// TARGET NUMBER SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own gameplay recording: header "🎯 Target: N", a shrinking pool of blue number-pill
// tiles, green circular operator buttons, and a growing "All Steps" trail like "(5+2)=7").
// Not a playable engine — one real puzzle plays out over two combine-steps: tap two tiles and
// an operator, they merge into one result tile, and the pool shrinks until a single tile
// equals the target.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export type Op = "+" | "−" | "×" | "÷";

export interface PoolTile {
  id: string;
  value: number;
}

export interface CombineStep {
  aId: string;
  bId: string;
  op: Op;
  result: number;
  resultId: string;
  tapAAt: number;
  tapOpAt: number;
  tapBAt: number;
  /** frame the two operand tiles fuse into the result tile */
  mergeAt: number;
  /** true when this step's result equals the target — the tile glows green */
  isWin?: boolean;
}

const poolAtStep = (initial: PoolTile[], steps: CombineStep[], n: number): PoolTile[] => {
  let pool = [...initial];
  for (let i = 0; i < n; i++) {
    const s = steps[i];
    const idxA = pool.findIndex((p) => p.id === s.aId);
    const idxB = pool.findIndex((p) => p.id === s.bId);
    const keepIdx = Math.min(idxA, idxB);
    const rest = pool.filter((p) => p.id !== s.aId && p.id !== s.bId);
    rest.splice(keepIdx, 0, { id: s.resultId, value: s.result });
    pool = rest;
  }
  return pool;
};

export const TargetNumberSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  target: number;
  initialPool: PoolTile[];
  steps: CombineStep[];
  ops: Op[];
  /** frame the "🎯 Target: N" header appears */
  headerAt: number;
  scale?: number;
}> = ({ frame, fps, x, y, target, initialPool, steps, ops, headerAt, scale = 1 }) => {
  const completedCount = steps.filter((s) => frame >= s.mergeAt).length;
  const pool = poolAtStep(initialPool, steps, completedCount);
  const currentStep = completedCount < steps.length ? steps[completedCount] : undefined;
  const lastStep = completedCount > 0 ? steps[completedCount - 1] : undefined;
  const won = lastStep?.isWin && frame >= lastStep.mergeAt;

  const t = frame / fps;
  const idleBob = Math.sin(t * 1.5) * 5;
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // the "All Steps" trail — one line per completed combine, matching the real side panel
  const trail = steps.slice(0, completedCount).map((s) => {
    const aTile = poolAtStep(initialPool, steps, steps.indexOf(s)).find((p) => p.id === s.aId);
    const bTile = poolAtStep(initialPool, steps, steps.indexOf(s)).find((p) => p.id === s.bId);
    return `(${aTile?.value}${s.op}${bTile?.value})=${s.result}`;
  });

  const pressAmt = (at: number) => Math.max(0, 1 - Math.abs(frame - at) / 6);

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 680, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      {/* header — matches the real "🎯 Target: N" red display */}
      <div style={{ textAlign: "center", marginBottom: 26, opacity: headerIn, transform: `scale(${0.7 + headerIn * 0.3})` }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 62,
            color: "#E53935",
            textShadow: "0 4px 0 rgba(0,0,0,0.14)",
          }}
        >
          🎯 Target: {target}
        </span>
      </div>

      {/* the steps trail */}
      <div style={{ minHeight: 76, textAlign: "center", marginBottom: 16 }}>
        {trail.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 34,
              color: "#3730A3",
              opacity: 0.85,
              marginTop: i === 0 ? 0 : 4,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* the pool of number tiles */}
      <div style={{ display: "flex", justifyContent: "center", gap: 26, transform: `translateY(${idleBob}px)`, minHeight: 128 }}>
        {pool.map((tile) => {
          const isA = currentStep?.aId === tile.id;
          const isB = currentStep?.bId === tile.id;
          const tapAt = isA ? currentStep!.tapAAt : isB ? currentStep!.tapBAt : undefined;
          const press = tapAt !== undefined ? pressAmt(tapAt) : 0;
          const isResult = lastStep?.resultId === tile.id && frame < lastStep.mergeAt + 16;
          const popIn = isResult
            ? interpolate(frame, [lastStep!.mergeAt, lastStep!.mergeAt + 6, lastStep!.mergeAt + 10], [0.3, 1.28, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;
          const isWinTile = won && lastStep?.resultId === tile.id;
          const glow = isWinTile ? 0.5 + Math.sin(t * 2.4) * 0.5 : 0;
          return (
            <div
              key={tile.id}
              style={{
                width: 128,
                height: 100,
                borderRadius: 999,
                background: isWinTile ? "#2E7D32" : press > 0.05 ? "#5B94F5" : "#1E63D6",
                border: `5px solid ${isWinTile ? "#1B5E20" : "#0D3B93"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isWinTile
                  ? `0 0 ${18 + 8 * glow}px ${6 + 3 * glow}px rgba(46,125,50,0.5)`
                  : "0 8px 0 rgba(0,0,0,0.2)",
                transform: `scale(${(press > 0 ? 1 - press * 0.1 : 1) * popIn})`,
              }}
            >
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 46, color: "#FFFFFF" }}>{tile.value}</span>
            </div>
          );
        })}
      </div>

      {/* the operator buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 52 }}>
        {ops.map((op) => {
          const isActiveOp = currentStep?.op === op;
          const press = isActiveOp ? pressAmt(currentStep!.tapOpAt) : 0;
          return (
            <div
              key={op}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: press > 0.05 ? "#66C26E" : "#43A047",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 0 rgba(0,0,0,0.2)",
                transform: `scale(${1 - press * 0.12})`,
              }}
            >
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 40, color: "#FFFFFF" }}>{op}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
