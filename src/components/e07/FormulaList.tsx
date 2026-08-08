// The four small friends, written as formulas.
//
//        +1 = −4 +5
//        +2 = −3 +5
//        +3 = −2 +5
//        +4 = −1 +5
//
// This is the NOTATION, and E07 is where a child should first see it — on the two lines that say
// "that is your first abacus formula" and "there is one for every small number". Before this the
// episode has been careful to speak in words ("add five and take away two"), which is right for
// teaching the idea; but E08 teaches all four in symbols, and introducing symbols cold in E08 would
// waste the fact that the child has just watched one of them work.
//
// So the one they DID lights up and the other three sit under it, dimmed. That is the whole argument
// of the closing lines in one object: you know this one, and it has three siblings.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

/**
 * THE CARD IS EXACTLY THIS TALL — the container sets `height` from these numbers, so the constant
 * the overlap guard uses and the box actually drawn are the same thing by construction.
 *
 * They were an estimate before: declared 300 while the card rendered about 364, which made the guard
 * box SMALLER than the artwork. A guard box smaller than what it guards cannot fail, so the card
 * overflowed into the caption in 4:5 and every check passed. Measured-not-guessed is the same lesson
 * the rabbit's box taught two hours ago.
 */
export const FORMULA_NAT = { w: 430, h: 372 };
/** the single-formula strip: one row, no title */
export const FORMULA_ONE = { w: 330, h: 104 };

/**
 * The four small friends, written ONE way: `+n = +5 − (5−n)`.
 *
 * Not `+n = −(5−n) +5`. Both are the same arithmetic and the second is the order the BEADS move in,
 * but this episode says it out loud as "add five and take away two" — the headline says it, the
 * caption says it, and the strip on the rule beats says `+5 − 2`. Writing the closing formulas the
 * other way round put two notations for one idea in a single video, which is the sort of thing that
 * makes a child think they have missed something.
 *
 * The bead ORDER is still lower-first-then-upper, and the episode teaches that in words; the
 * notation matches the sentence rather than the choreography.
 */
export const SMALL_FRIENDS = [1, 2, 3, 4].map((n) => ({
  n,
  text: `+${n} = +5 − ${5 - n}`,
}));

export const FormulaList: React.FC<{
  /** which formula is lit, by its +n; undefined lights none */
  active?: number;
  /** reveal them one at a time across the line */
  stagger?: boolean;
  /** true only on the line the list first appears; otherwise it holds still rather than re-fading */
  arriving?: boolean;
  /**
   * Show ONLY the active formula, as a single strip.
   *
   * The four-row table belongs on "there is one for every small number", which is the line that says
   * there are four. On the line that states THIS trick — "instead of adding three we add five and
   * take away two" — three formulas the episode has not taught are three distractions.
   */
  only?: boolean;
  /**
   * Override the text of the single strip.
   *
   * On the rule beats the strip has to match the WORDS — the narration and the headline both say
   * "add five and take away two", so the strip reads `+5 −2` in that order. The canonical
   * `+3 = −2 +5` is kept for the closing line that names it as a formula, which is the notation E08
   * goes on to use.
   */
  label?: string;
  accent: string;
  progress: number;
  scale?: number;
}> = ({
  active,
  stagger = false,
  arriving = false,
  only = false,
  label,
  accent,
  progress,
  scale = 1,
}) => (
  <div
    style={{
      width: (only ? FORMULA_ONE.w : FORMULA_NAT.w) * scale,
      height: (only ? FORMULA_ONE.h : FORMULA_NAT.h) * scale,
      boxSizing: "border-box",
      justifyContent: "center",
      background: "rgba(255,255,255,0.97)",
      borderRadius: 34 * scale,
      padding: `${20 * scale}px ${18 * scale}px`,
      boxShadow: `0 ${9 * scale}px 0 rgba(26,12,31,0.3)`,
      fontFamily: KID_FONT,
      display: "flex",
      flexDirection: "column",
      gap: 10 * scale,
      alignItems: "center",
    }}
  >
    {!only && (
      <div style={{ fontSize: 30 * scale, fontWeight: 700, color: accent, letterSpacing: 1.6 }}>
        SMALL FRIENDS
      </div>
    )}
    {SMALL_FRIENDS.filter((f) => !only || f.n === active).map((f, i) => {
      const at = stagger ? 0.1 + i * 0.16 : 0;
      // only animate when the list is arriving or deliberately staggering in; otherwise hold
      const on =
        arriving || stagger
          ? interpolate(progress, [at, at + 0.14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 1;
      const lit = active === f.n;
      return (
        <div
          key={f.n}
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: 42 * scale,
            fontWeight: 700,
            color: lit ? "#FFFFFF" : "#6B5C72",
            background: lit ? accent : "#F1ECF3",
            borderRadius: 14 * scale,
            padding: `${6 * scale}px 0`,
            opacity: (lit ? 1 : 0.72) * on,
            transform: `translateY(${(1 - on) * 10 * scale}px) scale(${lit ? 1.04 : 1})`,
          }}
        >
          {only && label ? label : f.text}
        </div>
      );
    })}
  </div>
);
