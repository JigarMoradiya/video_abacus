// NUMBER PATH SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own gameplay recording: a zigzag maze of tiles — a blue START tile, green
// operation tiles showing "+N"/"-N", and a yellow 🎯 GOAL tile — with a small buddy riding
// the current tile and a blue running-total bubble above it). Not a playable engine — one
// fixed 4-tile path plays out: start on 5, hop through −2, +1, +3, landing on the goal
// exactly when the running total hits the target.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface PathTile {
  kind: "start" | "op" | "goal";
  /** the +N/-N shown on an op or goal tile; absent on start */
  op?: number;
  /** the running total once the buddy has passed through this tile */
  totalAfter: number;
  /** frame this tile pops into view ("the path stretches ahead") */
  revealAt: number;
  /** frame the narrator names this tile's own number/operation */
  emphasizeAt?: number;
}

export interface WrongBranch {
  /** which real tile in `tiles[]` this detour forks off from */
  fromIndex: number;
  /** the two ops of the wrong detour — it reconnects to the SAME goal tile as the real path,
   *  it just gets there with the wrong total, and gets bounced back */
  op1: number;
  op2: number;
  wrongTotal: number;
  side: "left" | "right";
  revealAt: number;
  /** frame the goal tile flashes the wrong total + shakes, rejecting this arrival */
  rejectAt: number;
}

export const NumberPathSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  tiles: PathTile[];
  target: number;
  /** frame the buddy lands on tiles[i] — hopAt[0] is always the start, instant */
  hopAt: number[];
  headerAt: number;
  /** an optional decoy fork shown branching off the real path, rejected with a ✕ — without
      this, the sim only ever shows the ONE correct route, which undersells that Number Path
      is a maze with real choices in it. */
  wrongBranch?: WrongBranch;
  scale?: number;
}> = ({ frame, fps, x, y, tiles, target, hopAt, headerAt, wrongBranch, scale = 1 }) => {
  const t = frame / fps;
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pressAmt = (at: number | undefined, span = 9) => (at === undefined ? 0 : Math.max(0, 1 - Math.abs(frame - at) / span));

  // which tile the buddy currently occupies, and how far into the hop-to-next-tile it is
  let atIndex = 0;
  for (let i = 0; i < hopAt.length; i++) if (frame >= hopAt[i]) atIndex = i;
  const nextAt = atIndex + 1 < hopAt.length ? hopAt[atIndex + 1] : null;
  const hopProgress = nextAt !== null ? Math.max(0, Math.min(1, (frame - hopAt[atIndex]) / Math.max(1, nextAt - hopAt[atIndex]))) : 0;
  const reachedGoal = atIndex === tiles.length - 1 && frame >= hopAt[hopAt.length - 1];
  const currentTotal = tiles[atIndex].kind === "start" ? tiles[0].totalAfter : tiles[atIndex].totalAfter;

  // a continuous idle bob on the whole path — without it, the several seconds between the
  // path fully revealing and the buddy's first real hop (narrator naming/describing the game)
  // sit completely still, which motion_check correctly flags as frozen. Every other sim in
  // this series carries this same idle motion for the same reason.
  const idleBob = Math.sin(t * 1.5) * 5;
  // a traveling glow that sweeps tile-to-tile while "Hop from tile to tile" is being said —
  // illustrates the hopping concept before the buddy's own first real hop happens.
  // a continuous chase-light sweeps tile to tile for the whole stretch before the buddy's
  // own first real hop — the gap between the path finishing its reveal and that first hop
  // covers several spoken lines ("This is Number Path!", "Hop from tile to tile...") with
  // otherwise nothing changing in the sim's own content area.
  const chaseActive = frame < hopAt[0];
  const chasePhase = (t * 1.3) % tiles.length;
  const previewGlow = (i: number) => {
    if (!chaseActive) return 0;
    const d = Math.abs(chasePhase - i);
    const dist = Math.min(d, tiles.length - d);
    return Math.max(0, 1 - dist);
  };

  const TILE = 128;
  const stepX = 118;
  const stepY = 150;
  const positions = tiles.map((_, i) => ({ x: (i % 2) * stepX, y: i * stepY }));
  const goalIdx = tiles.length - 1;
  const branchGap = 168;
  // a two-tile detour that runs alongside the real path and reconnects into the SAME goal
  // tile — a genuine alternate route, not a dead end — ending one step short of the goal so
  // there's a visible dashed line INTO it showing where this wrong route also arrives.
  const branchPositions = wrongBranch
    ? [
        { x: positions[wrongBranch.fromIndex].x + (wrongBranch.side === "right" ? branchGap : -branchGap), y: positions[wrongBranch.fromIndex].y + stepY * 0.35 },
        { x: positions[wrongBranch.fromIndex].x + (wrongBranch.side === "right" ? branchGap : -branchGap), y: positions[goalIdx].y + stepY * 0.15 },
      ]
    : null;
  // the branch must fork toward positive x (choose `fromIndex`/`side` so this holds) — the
  // path's own left edge is always x=0, so a leftward branch would render off-screen.
  const pathW = Math.max(...positions.map((p) => p.x), ...(branchPositions ?? []).map((p) => p.x)) + TILE;
  const pathH = Math.max(...positions.map((p) => p.y)) + TILE;

  // buddy's on-screen position — interpolated between its current and next tile mid-hop,
  // with a small arc up so it visibly leaves the tile rather than sliding along the ground
  const curP = positions[atIndex];
  const nxtP = nextAt !== null ? positions[atIndex + 1] : curP;
  const buddyX = curP.x + (nxtP.x - curP.x) * hopProgress;
  const buddyY = curP.y + (nxtP.y - curP.y) * hopProgress - Math.sin(hopProgress * Math.PI) * 46;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: pathW + 220, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      <div style={{ textAlign: "center", marginBottom: 26, opacity: headerIn, transform: `scale(${0.7 + headerIn * 0.3})` }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 32,
            color: "#1B1440",
            background: "rgba(255,255,255,0.96)",
            border: "3px solid #2E9E62",
            borderRadius: 999,
            padding: "9px 30px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          🐸 Number Path
        </span>
      </div>

      <div style={{ position: "relative", width: pathW, height: pathH, margin: "0 auto", transform: `translateY(${idleBob}px)` }}>
        {/* dashed connector line between consecutive tiles, matching the real maze's path */}
        <svg width={pathW} height={pathH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {positions.slice(1).map((p, i) => {
            const prev = positions[i];
            const revealed = frame >= tiles[i + 1].revealAt;
            return (
              <line
                key={i}
                x1={prev.x + TILE / 2}
                y1={prev.y + TILE / 2}
                x2={p.x + TILE / 2}
                y2={p.y + TILE / 2}
                stroke="#FF9E6D"
                strokeWidth={6}
                strokeDasharray="4 14"
                strokeLinecap="round"
                opacity={revealed ? 0.8 : 0}
              />
            );
          })}
          {branchPositions && wrongBranch && (
            <>
              <line
                x1={positions[wrongBranch.fromIndex].x + TILE / 2}
                y1={positions[wrongBranch.fromIndex].y + TILE / 2}
                x2={branchPositions[0].x + TILE / 2}
                y2={branchPositions[0].y + TILE / 2}
                stroke="#C9B8B0"
                strokeWidth={6}
                strokeDasharray="4 14"
                strokeLinecap="round"
                opacity={frame >= wrongBranch.revealAt ? 0.6 : 0}
              />
              <line
                x1={branchPositions[0].x + TILE / 2}
                y1={branchPositions[0].y + TILE / 2}
                x2={branchPositions[1].x + TILE / 2}
                y2={branchPositions[1].y + TILE / 2}
                stroke="#C9B8B0"
                strokeWidth={6}
                strokeDasharray="4 14"
                strokeLinecap="round"
                opacity={frame >= wrongBranch.revealAt ? 0.6 : 0}
              />
              {/* the detour's own dashed line INTO the real goal tile — the part that makes
                  this a genuine alternate route, not a dead end */}
              <line
                x1={branchPositions[1].x + TILE / 2}
                y1={branchPositions[1].y + TILE / 2}
                x2={positions[goalIdx].x + TILE / 2}
                y2={positions[goalIdx].y + TILE / 2}
                stroke="#C9B8B0"
                strokeWidth={6}
                strokeDasharray="4 14"
                strokeLinecap="round"
                opacity={frame >= wrongBranch.revealAt ? 0.6 : 0}
              />
            </>
          )}
        </svg>

        {tiles.map((tile, i) => {
          const revealed = frame >= tile.revealAt;
          const popIn = interpolate(frame, [tile.revealAt, tile.revealAt + 6, tile.revealAt + 10], [0.3, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const pulse = pressAmt(tile.emphasizeAt);
          const passed = i <= atIndex;
          const isGoalWon = tile.kind === "goal" && reachedGoal;
          // once the WHOLE path is done, the op tiles that made up the real route get their
          // own distinct "solved" look — a bolder green + soft pulsing glow, staggered per
          // tile for a little ripple down the path — instead of just sitting in the same flat
          // pale "passed" tint they wore while the buddy was still mid-hop.
          const pathDone = reachedGoal && tile.kind === "op";
          const solvedPulse = pathDone ? 0.5 + Math.sin(t * 2.4 + i * 0.5) * 0.5 : 0;
          // the wrong detour reconnects into THIS tile — right at rejectAt it flashes the
          // wrong total and shakes, then settles back to the plain 🎯 target, well before the
          // buddy's own real, correct arrival later.
          const wrongArrival = tile.kind === "goal" && wrongBranch ? pressAmt(wrongBranch.rejectAt, 10) : 0;
          const shakeX = wrongArrival > 0.05 ? Math.sin(frame * 3) * 6 * wrongArrival : 0;
          const bg = wrongArrival > 0.3 ? "#FDECEA" : pulse > 0.15 ? "#FFF3D0" : isGoalWon ? "#E8F5E9" : tile.kind === "start" ? "#1E63D6" : tile.kind === "goal" ? "#FFD54F" : pathDone ? "#CDEFDA" : passed ? "#DFF3E6" : "#FFFFFF";
          const border = wrongArrival > 0.3 ? "#D9534F" : pulse > 0.15 ? "#F57C00" : isGoalWon ? "#2E7D32" : tile.kind === "start" ? "#0D3B93" : tile.kind === "goal" ? "#E8A317" : pathDone ? "#2E7D32" : "#D8D8D8";
          const textColor = wrongArrival > 0.3 ? "#B02A1C" : pulse > 0.15 ? "#B4460B" : tile.kind === "start" ? "#FFFFFF" : isGoalWon ? "#2E7D32" : pathDone ? "#2E7D32" : "#1B1440";
          const label = wrongArrival > 0.3
            ? String(wrongBranch!.wrongTotal)
            : tile.kind === "start"
            ? String(tile.totalAfter)
            : tile.kind === "goal"
            ? (isGoalWon ? "🎉" : `🎯${target}`)
            : `${tile.op! > 0 ? "+" : ""}${tile.op}`;
          // a quick traveling glow, tile by tile, while "Hop from tile to tile" is being
          // said — real motion illustrating the mechanic during the gap before the buddy's
          // own first hop, not just a held frame waiting for it.
          const glow = previewGlow(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: positions[i].x,
                top: positions[i].y,
                width: TILE,
                height: TILE,
                borderRadius: 22,
                background: bg,
                border: `5px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: revealed ? 1 : 0,
                boxShadow: wrongArrival > 0.3
                  ? `0 0 ${10 + 10 * wrongArrival}px ${4 + 3 * wrongArrival}px rgba(217,83,79,0.5)`
                  : isGoalWon
                  ? `0 0 ${16 + 8 * (0.5 + Math.sin(t * 2.4) * 0.5)}px ${5 + 3 * (0.5 + Math.sin(t * 2.4) * 0.5)}px rgba(46,125,50,0.5)`
                  : pathDone
                  ? `0 0 ${10 + 8 * solvedPulse}px ${3 + 3 * solvedPulse}px rgba(46,125,50,0.4)`
                  : glow > 0.05
                  ? `0 0 ${10 + 12 * glow}px ${4 + 4 * glow}px rgba(255,158,109,0.6)`
                  : "0 6px 0 rgba(0,0,0,0.14)",
                transform: `translateX(${shakeX}px) scale(${popIn * (1 + pulse * 0.2 + glow * 0.08)})`,
              }}
            >
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: tile.kind === "goal" && !isGoalWon && wrongArrival < 0.3 ? 26 : 34, color: textColor }}>
                {label}
              </span>
            </div>
          );
        })}

        {/* a wrong DETOUR — two real tiles the buddy could hop instead, reconnecting into the
            SAME goal tile, so the path reads as a maze with a genuine choice rather than the
            one lane it actually hops. Both fade toward the goal tile at rejectAt, where the
            wrong total flashes and gets bounced. */}
        {branchPositions && wrongBranch && (() => {
          const revealed = frame >= wrongBranch.revealAt;
          const rejected = pressAmt(wrongBranch.rejectAt, 14);
          const ops = [wrongBranch.op1, wrongBranch.op2];
          return branchPositions.map((pos, bi) => {
            const popIn = interpolate(frame, [wrongBranch.revealAt + bi * 4, wrongBranch.revealAt + bi * 4 + 6, wrongBranch.revealAt + bi * 4 + 10], [0.3, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div
                key={bi}
                style={{
                  position: "absolute",
                  left: pos.x,
                  top: pos.y,
                  width: TILE,
                  height: TILE,
                  borderRadius: 22,
                  background: "#FFFFFF",
                  border: "5px dashed #D8D8D8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: revealed ? 1 - rejected * 0.5 : 0,
                  boxShadow: "0 6px 0 rgba(0,0,0,0.14)",
                  transform: `scale(${popIn})`,
                }}
              >
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 34, color: "#9A9A9A" }}>
                  {ops[bi] > 0 ? "+" : ""}
                  {ops[bi]}
                </span>
              </div>
            );
          });
        })()}

        {/* the hopping buddy + its running-total bubble, matching the real UI exactly — held
            back until its own tile has actually popped in, so it never floats over nothing */}
        {frame >= tiles[0].revealAt && (
        <div style={{ position: "absolute", left: buddyX + TILE / 2 - 34, top: buddyY - 10, width: 68, textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 24,
              color: "#FFFFFF",
              background: "#1E63D6",
              borderRadius: 999,
              padding: "4px 14px",
              marginBottom: 6,
              boxShadow: "0 3px 0 rgba(0,0,0,0.2)",
            }}
          >
            {currentTotal}
          </div>
          <div style={{ fontSize: 48, transform: `scale(${1 - Math.sin(hopProgress * Math.PI) * 0.1}) rotate(${Math.sin(hopProgress * Math.PI) * -10}deg)` }}>🐸</div>
        </div>
        )}
      </div>
    </div>
  );
};
