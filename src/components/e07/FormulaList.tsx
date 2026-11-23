// The four small friends, written as formulas.
//
//        +1 = −4 +5
//        +2 = −3 +5
//        +3 = −2 +5
//        +4 = −1 +5
//
// FRIEND FIRST, then five — this is the direction the CONSTANT below writes it, matching the bead
// order (lower beads move first, then the upper bead). An earlier draft had the constant read
// `+n = +5 − friend` because one beat's narration says "we add five and take away two"; the series
// convention was corrected on E08 to always read friend-first, since a static reference table has
// no narration of its own to match, and friend-first is what the hands actually do.
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
 * The four small friends, written FRIEND FIRST: `+n = −(5−n) +5`.
 *
 * This is the bead order — lower beads move first, then the upper bead — and it is now the series
 * convention everywhere this table is a static REFERENCE: the closing reveal, and the next-episode
 * teasers. It reads `+4 = −1 +5`, not `+4 = +5 −1`.
 *
 * One beat in THIS episode still says the words the other way round — "instead of adding three we
 * add five and take away two" — and its inline strip is written to match THAT sentence, because a
 * strip tied to a specific spoken instant has to agree with the instant, not with the table. This
 * constant is for the beats that have no sentence of their own to match.
 */
export const SMALL_FRIENDS = [1, 2, 3, 4].map((n) => ({
  n,
  text: `+${n} = −${5 - n} +5`,
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
   * On the rule beats the strip has to match the WORDS — this episode's one five-first sentence
   * ("add five and take away two") gets a five-first strip via this override; every other use of
   * this table, including the closing line right below and E08 onward, reads friend-first.
   */
  label?: string;
  accent: string;
  progress: number;
  scale?: number;
  /** opt-in: rows still to come show as dashed "?" placeholders, so the card is never an empty box */
  ghost?: boolean;
}> = ({
  active,
  stagger = false,
  arriving = false,
  only = false,
  label,
  accent,
  progress,
  scale = 1,
  ghost = false,
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
        <div key={f.n} style={{ position: "relative", width: "100%" }}>
          {ghost && !only && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxSizing: "border-box",
                border: `${3 * scale}px dashed ${accent}`,
                borderRadius: 14 * scale,
                opacity: 0.5 * (1 - on),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34 * scale,
                fontWeight: 700,
                color: accent,
              }}
            >
              ?
            </div>
          )}
          <div
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
        </div>
      );
    })}
  </div>
);
