// THE FORMULA WHILE IT IS BEING DONE: "+3 = −2 +5", the friend-first small-friend formula, with the move
// the beads are making RIGHT NOW lit. Step 1 lights "−2" (take away the friend's lower beads), step 2 lights
// "+5" (push the upper bead down). Step 0 shows the formula with nothing lit (the line before the first move).
// Same card look as FormulaList's single strip, so a child sees one formula design the whole episode.

import React from "react";
import { KID_FONT } from "../../lib/fonts";
import { useOverflowGuard } from "../../lib/overflowGuard";

/** the card is a title row ("SMALL FRIEND") over the formula row */
export const STRIP_NAT = { w: 330, h: 150 };

export const FormulaStrip: React.FC<{
  /** the number being added (or taken away, in "sub" mode); 0 = the general rule ("−friend +5" / "+friend −5") */
  n: number;
  /** 0 nothing lit, 1 the "take away" part lit, 2 the "+5" part lit */
  step: 0 | 1 | 2;
  accent: string;
  scale?: number;
  /** the card's own title, e.g. "SMALL FRIEND" */
  title?: string;
  /** "add": +n = −(5−n) +5 (E07, E08).  "sub": −n = +(5−n) −5 (E09): the friend is ADDED first, then five is taken away. */
  mode?: "add" | "sub";
  /** 5 = small friends (E07-E10), 10 = big friends (E11-E15): the friend is (base − n) and the carry/borrow is ±base */
  base?: 5 | 10;
}> = ({ n, step, accent, scale = 1, title, mode = "add", base = 5 }) => {
  const ttl = title ?? (base === 10 ? "BIG FRIEND" : "SMALL FRIEND");
  const ref = React.useRef<HTMLDivElement>(null);
  useOverflowGuard(ref, "STRIP", 4);
  const tok = (text: string, lit: boolean) => (
    <span
      style={{
        fontSize: 44 * scale,
        fontWeight: 700,
        lineHeight: 1,
        padding: `${7 * scale}px ${11 * scale}px`,
        borderRadius: 14 * scale,
        color: lit ? "#FFFFFF" : "#6B5C72",
        background: lit ? accent : "#F1ECF3",
        transform: lit ? `scale(1.06)` : undefined,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
  return (
    <div
      ref={ref}
      style={{
        width: STRIP_NAT.w * scale,
        height: STRIP_NAT.h * scale,
        boxSizing: "border-box",
        background: "rgba(255,255,255,0.97)",
        borderRadius: 34 * scale,
        boxShadow: `0 ${9 * scale}px 0 rgba(26,12,31,0.3)`,
        fontFamily: KID_FONT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10 * scale,
      }}
    >
      <div style={{ fontSize: 28 * scale, fontWeight: 700, color: accent, letterSpacing: 1.6 * scale, lineHeight: 1 }}>{ttl}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 * scale }}>
        {n > 0 && tok(mode === "add" ? `+${n}` : `−${n}`, false)}
        {n > 0 && <span style={{ fontSize: 40 * scale, fontWeight: 700, color: "#6B5C72" }}>=</span>}
        {mode === "add"
          ? tok(n > 0 ? `−${base - n}` : "−friend", step === 1)
          : tok(n > 0 ? `+${base - n}` : "+friend", step === 1)}
        {tok(mode === "add" ? `+${base}` : `−${base}`, step === 2)}
      </div>
    </div>
  );
};
