// E08's hero: the four small friends, big enough to be the thing on stage.
//
// E07 already has a `FormulaList` and this deliberately does NOT replace it — that one is a gutter
// card, 430 units wide, sitting beside a live abacus. This is the same table promoted to the stage
// for the nine lines where the formulas ARE the lesson and there is no abacus on screen at all.
//
// Same text, same gold, same order as E07's card, because a child should meet one table in this
// series and recognise it every time. What is new is three things a side card never needed:
//
//   upto     — reveal the rows one at a time, as they are spoken.
//   mystery  — the last visible row shows "?" instead of its formula. "Now you guess the last one"
//              is a real question with a real 3-second silence after it, and the board has to ask
//              it rather than answer it early.
//   hilite   — colour ONE column across all four rows. This is what makes the pattern visible:
//              on "the number we take away is always the friend" the friends light up together and
//              the child sees a column, not four sentences.
//
// FRIEND FIRST: each row reads `+n = −friend +5`, matching the bead order (lower beads move first,
// then the upper bead) and the series convention set in `FormulaList`. The first draft wrote it
// `+n = +5 − friend` and then said "add five, take away four" in the script that plays over this
// exact board — two different orders for the same idea on screen at once.
//
// Rows are drawn as SEGMENTS rather than one string, which is the only way `hilite` can exist. That
// is also why this is a separate component: segmenting E07's card would have moved pixels in an
// episode that is already rendered and approved.

import React from "react";
import { useOverflowGuard } from "../../lib/overflowGuard";
import { Easing, interpolate, interpolateColors } from "remotion";
import { KID_FONT } from "../../lib/fonts";
import { SMALL_FRIENDS } from "../e07/FormulaList";

/** Measured off the layout below: 4 rows of 78 + 3 gaps of 14 + title 52 + padding 2×26. */
export const BOARD_NAT = { w: 720, h: 470 };

const ROW_H = 78;
const GAP = 14;

export const GOLD = "#C07A05";
const DIM = "#6B5C72";
const LIT_BG = "#FFF3D6";

export const FormulaBoard: React.FC<{
  /** how many rows are visible, 0..4 */
  upto: number;
  /** which row is lit, by its +n */
  active?: number;
  /** the last visible row shows "?" for its formula */
  mystery?: boolean;
  /** colour one column across every row */
  hilite?: "friend" | "five";
  /** true only on the line the contents change, so it animates once and then holds still */
  arriving?: boolean;
  progress: number;
  frame: number;
  fps: number;
  scale?: number;
  /** Opt-in (Bead Buddies remake): rows still to come show a dashed "+n = ?" ghost, so the board is never an empty white card. */
  ghost?: boolean;
}> = ({ upto, active, mystery = false, hilite, arriving = false, progress, frame, fps, scale = 1, ghost = false }) => {
  const t = frame / fps;
  // the opt-in (`ghost`) look uses darker ink so every formula passes the contrast audit on its pale row
  const GOLDX = ghost ? "#7A4300" : GOLD;
  const HOTX = ghost ? "#A8340A" : "#F0741B";
  const DIMX = ghost ? "#4A3F52" : DIM;
  const rowIn = (i: number) => {
    // the row that is ARRIVING eases up; rows already on the board hold still
    if (i < upto - 1) return 1;
    if (i > upto - 1) return 0;
    return arriving
      ? interpolate(progress, ghost ? [0.01, 0.1] : [0.05, 0.42], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        })
      : 1;
  };
  /**
   * THE HIGHLIGHTED COLUMN RIPPLES DOWN THE ROWS, one after another, rather than pulsing as one
   * block. Two reasons, and the second is the real one:
   *
   * A single synchronised pulse on four small numbers is almost no moving pixels — `motion_check`
   * read "every single time" as a FROZEN line, and a child would read it the same way.
   *
   * And a ripple says what the words say. "The number we take away is ALWAYS the friend" is a claim
   * about all four rows in turn; a light running down the column is that sentence, where four
   * numbers brightening in lockstep is just a flash.
   */
  const pulseAt = (i: number) => (hilite ? 0.72 + Math.abs(Math.sin(t * 2.4 - i * 0.7)) * 0.28 : 0);

  const guardRef = React.useRef<HTMLDivElement>(null);
  useOverflowGuard(guardRef, "SMALL FRIENDS", 6);
  return (
    <div ref={guardRef}
      style={{
        width: BOARD_NAT.w * scale,
        height: BOARD_NAT.h * scale,
        boxSizing: "border-box",
        position: "relative",
        overflow: ghost ? "hidden" : undefined,
        background: "rgba(255,255,255,0.97)",
        borderRadius: 40 * scale,
        padding: `${26 * scale}px ${30 * scale}px`,
        boxShadow: `0 ${11 * scale}px 0 rgba(20,40,34,0.28)`,
        fontFamily: KID_FONT,
        display: "flex",
        flexDirection: "column",
        gap: GAP * scale,
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 34 * scale,
          fontWeight: 700,
          color: GOLDX,
          letterSpacing: 2,
          height: 52 * scale,
          display: "flex",
          alignItems: "center",
        }}
      >
        SMALL FRIENDS
      </div>

      {SMALL_FRIENDS.map((f, i) => {
        const on = rowIn(i);
        const lit = active === f.n;
        const isMystery = mystery && i === upto - 1;
        // each row is: +n  =  +5  −  friend
        const pulse = pulseAt(i);
        // FRIEND FIRST — the minus sign travels WITH the friend's number as one segment, since
        // "−1" is the unit that moves as a piece, the same way "+5" is.
        const seg = (text: string, kind: "plain" | "five" | "friend") => {
          const isHot = hilite === kind;
          return (
            <span
              style={{
                color: isHot
                  ? interpolateColors(pulse, [0.7, 1], [GOLDX, HOTX])
                  : lit
                    ? GOLDX
                    : DIMX,
                background: isHot ? "rgba(240,116,27,0.16)" : undefined,
                borderRadius: isHot ? 10 * scale : undefined,
                padding: isHot ? `${2 * scale}px ${8 * scale}px` : undefined,
                transform: isHot ? `scale(${ghost ? 0.94 + pulse * 0.16 : 0.98 + pulse * 0.08})` : undefined,
                display: "inline-block",
              }}
            >
              {text}
            </span>
          );
        };
        const rowEl = (
          <div
            key={f.n}
            style={{
              width: "100%",
              height: ROW_H * scale,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10 * scale,
              fontSize: 50 * scale,
              fontWeight: 700,
              background: lit ? LIT_BG : "#F4F1F0",
              border: `${lit ? 4 : 0}px solid ${GOLDX}`,
              borderRadius: 20 * scale,
              opacity: on,
              // the lit row breathes, so a line that holds one row lit for several seconds never goes still
              transform: `translateY(${(1 - on) * 16 * scale}px) scale(${lit ? 1.03 + 0.025 * Math.sin(t * 4.2) : 1})`,
            }}
          >
            {isMystery ? (
              <>
                {seg(`+${f.n}`, "plain")}
                {seg("=", "plain")}
                <span style={{ color: ghost ? "#5B3FD0" : "#8E6BFF", fontSize: 58 * scale }}>?</span>
              </>
            ) : (
              <>
                {seg(`+${f.n}`, "plain")}
                {seg("=", "plain")}
                {seg(`−${5 - f.n}`, "friend")}
                {seg("+5", "five")}
              </>
            )}
          </div>
        );
        if (!ghost) return rowEl;
        return (
          <div key={f.n} style={{ position: "relative", width: "100%" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxSizing: "border-box",
                borderRadius: 20 * scale,
                border: `${4 * scale}px dashed ${GOLDX}`,
                opacity: 0.55 * (1 - on),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44 * scale,
                fontWeight: 700,
                color: GOLDX,
              }}
            >
              {`+${f.n} = ?`}
            </div>
            {rowEl}
          </div>
        );
      })}
      {ghost && (
        <svg style={{ position: "absolute", left: -40 * scale, top: -30 * scale, overflow: "visible", pointerEvents: "none" }} width={(BOARD_NAT.w + 80) * scale} height={(BOARD_NAT.h + 60) * scale}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const u = (t * 0.5 + i / 6) % 1;
            const side = i % 2 === 0;
            const x = (side ? 8 : BOARD_NAT.w + 72) * scale;
            const y = (30 + u * (BOARD_NAT.h - 20)) * scale;
            const r = (8 + 8 * Math.sin(u * Math.PI)) * scale;
            return (
              <path key={i} transform={`translate(${x} ${y}) rotate(${u * 180})`} d={`M 0 ${-r} L ${r * 0.28} ${-r * 0.28} L ${r} 0 L ${r * 0.28} ${r * 0.28} L 0 ${r} L ${-r * 0.28} ${r * 0.28} L ${-r} 0 L ${-r * 0.28} ${-r * 0.28} Z`} fill="#FFD23F" stroke="#B3580A" strokeWidth={2 * scale} opacity={Math.sin(u * Math.PI)} />
            );
          })}
        </svg>
      )}
    </div>
  );
};
