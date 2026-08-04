// The reading rule, written out.
//
// The take says "reading a rod is always the same" and then gives two steps. Two numbered
// slots that FILL IN as each step is spoken, so the rule is assembled on screen rather than
// appearing whole — a finished list on the first line would give away step 2 while the
// narration is still on step 1.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

const Slot: React.FC<{
  n: number;
  text: string;
  /** 0 = empty outline, 1 = filled */
  fill: number;
  accent: string;
  wide?: boolean;
}> = ({ n, text, fill, accent, wide }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 24,
      background: fill > 0.5 ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.12)",
      border: `4px ${fill > 0.5 ? "solid" : "dashed"} rgba(255,255,255,0.6)`,
      borderRadius: 30,
      padding: wide ? "10px 22px" : "16px 24px",
      transform: `scale(${0.94 + fill * 0.06})`,
      width: wide ? 640 : 486,
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        width: wide ? 40 : 52,
        height: wide ? 40 : 52,
        flexShrink: 0,
        borderRadius: 999,
        background: fill > 0.5 ? accent : "rgba(255,255,255,0.25)",
        color: "#FFF",
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {n}
    </div>
    <span
      style={{
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: wide ? 26 : 33,
        lineHeight: 1.25,
        color: fill > 0.5 ? "#0F3B3A" : "rgba(255,255,255,0.5)",
        textAlign: "left",
      }}
    >
      {fill > 0.5 ? text : "…"}
    </span>
  </div>
);

export const RuleBoard: React.FC<{
  /** which steps are filled so far: 0 none, 1 the first, 2 both */
  filled: number;
  /** 0..1 within the current line, for the arriving slot */
  progress: number;
  accent: string;
  /** show the worked sum under the two steps */
  sum?: string;
  /**
   * Compact form for the 4:5 cut, where the board sits in the 240 px card band under the
   * abacus. Still a column — a row of two 452 px slots plus the answer reached the frame edge
   * and left the answer looking detached — just smaller.
   */
  compact?: boolean;
}> = ({ filled, progress, accent, sum, compact }) => {
  const arriving = interpolate(progress, [0, 0.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 8 : 22,
        alignItems: compact ? "center" : "flex-start",
        justifyContent: "center",
      }}
    >
      <Slot
        n={1}
        text={"upper bead down\n= five"}
        fill={filled > 1 ? 1 : filled === 1 ? arriving : 0}
        accent={accent}
        wide={compact}
      />
      <Slot
        n={2}
        text={"count the lower beads\ntouching the beam"}
        fill={filled > 2 ? 1 : filled === 2 ? arriving : 0}
        accent={accent}
        wide={compact}
      />
      {sum && (
        <div
          style={{
            alignSelf: "center",
            flexShrink: 0,
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: compact ? 44 : 64,
            color: accent,
            textShadow: "3px 3px 0 rgba(0,0,0,0.35)",
            opacity: arriving,
          }}
        >
          {sum}
        </div>
      )}
    </div>
  );
};
