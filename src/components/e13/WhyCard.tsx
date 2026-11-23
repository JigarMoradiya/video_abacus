// E13's "why does it work?" card — the formula −1 = +9 − 10 explained one sentence at a time.
//
//        +9        −10        = −1
//     add it back  too much!   left over
//                  9 extra
//
// It is the ANSWER to "Why does it work?", so it builds with the narration instead of appearing
// whole: step 1 "taking away ten takes away too much" → the −10 cell; step 2 "it takes away nine
// extra" → its note; step 3 "so we add the nine back first" → +9; step 4 "and we are left with
// taking away one" → = −1. Cells sit in formula order (friend first), so the finished card reads
// exactly like the formula strip the child has just been shown.

import React from "react";
import { useOverflowGuard } from "../../lib/overflowGuard";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export const WHY_NAT = { w: 600, h: 250 };

export const WhyCard: React.FC<{
  /** 0 = title only, 1 = −10, 2 = + its "9 extra" note, 3 = +9, 4 = = −1 */
  step: number;
  /** the step on the previous line — only the NEW piece animates in */
  prevStep: number;
  accent: string;
  progress: number;
  scale?: number;
  /** Opt-in (Bead Buddies remake): dashed "?" ghosts for the cells still to come, and darker cell fills for contrast. */
  ghost?: boolean;
}> = ({ step, prevStep, accent, progress, scale = 1, ghost = false }) => {
  const k = interpolate(progress, [0, 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shown = (n: number) => (step >= n ? (prevStep >= n ? 1 : k) : 0);

  const cell = (text: string, note: string, note2: string | null, o: number, o2: number, hot: boolean) => (
    <div style={{ position: "relative", width: 160 * scale }}>
      {ghost && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 72 * scale, boxSizing: "border-box", borderRadius: 18 * scale, border: `${4 * scale}px dashed ${accent}`, opacity: 0.55 * (1 - o), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 * scale, fontWeight: 700, color: accent }}>?</div>
      )}
    <div
      style={{
        width: 160 * scale,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6 * scale,
        opacity: o,
        transform: `translateY(${(1 - o) * 14 * scale}px) scale(${0.9 + 0.1 * o})`,
      }}
    >
      <div
        style={{
          width: "100%",
          textAlign: "center",
          fontSize: 56 * scale,
          fontWeight: 700,
          color: "#FFFFFF",
          background: hot ? accent : ghost ? "#5E4F66" : "#8A7C90",
          borderRadius: 18 * scale,
          padding: `${6 * scale}px 0`,
          boxShadow: `0 ${4 * scale}px 0 rgba(26,12,31,0.25)`,
        }}
      >
        {text}
      </div>
      <div style={{ fontSize: 24 * scale, fontWeight: 700, color: accent }}>{note}</div>
      {note2 && <div style={{ fontSize: 22 * scale, fontWeight: 700, color: "#6B5C72", opacity: o2 }}>{note2}</div>}
    </div>
    </div>
  );

  const guardRef = React.useRef<HTMLDivElement>(null);
  useOverflowGuard(guardRef, "WHY", 6);
  return (
    <div ref={guardRef}
      style={{
        width: WHY_NAT.w * scale,
        height: WHY_NAT.h * scale,
        boxSizing: "border-box",
        background: "rgba(255,255,255,0.97)",
        borderRadius: 30 * scale,
        padding: `${16 * scale}px ${18 * scale}px`,
        boxShadow: `0 ${9 * scale}px 0 rgba(26,12,31,0.3)`,
        fontFamily: KID_FONT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12 * scale,
      }}
    >
      <div style={{ fontSize: 28 * scale, fontWeight: 700, color: accent, letterSpacing: 1.4 }}>WHY DOES IT WORK?</div>
      <div style={{ display: "flex", gap: 18 * scale, alignItems: "flex-start" }}>
        {cell("+9", "add it back", null, shown(3), 0, step === 3)}
        {cell("−10", "too much!", "9 extra", shown(1), shown(2), step === 1 || step === 2)}
        {cell("= −1", "left over", null, shown(4), 0, step === 4)}
      </div>
    </div>
  );
};
