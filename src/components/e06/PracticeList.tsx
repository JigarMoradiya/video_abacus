// "Try a few more two rod sums on your own abacus" — the sums, on screen.
//
// That line used to run over the store beat, which was a bug; but even fixed, a practice prompt with
// nothing on screen is a wasted twenty seconds. A child who is told to try a few more needs to be
// shown WHICH few more, or they have to invent their own — and inventing a two-rod sum that does not
// need a formula is exactly the thing they cannot do yet.
//
// Six sums, revealed a pair at a time so the card fills across the line rather than arriving as a
// wall of text. Three add, three take away, and EVERY ONE IS DIRECT: each digit stays inside its own
// rod, so a child can finish all six with what this episode taught and nothing else.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export interface Drill {
  text: string;
  answer: number;
}

/**
 * THE TEST FOR "DIRECT", written down because getting it wrong shipped two formula sums.
 *
 * The first version of this list checked only that each digit stayed inside its own rod — that no
 * carry crossed between the tens and the ones. That is necessary and NOT sufficient. A digit move is
 * direct only if the earth beads also do not cross five WITHIN the digit:
 *
 *     add a to d       (d % 5) + (a % 5) <= 4   and   (d >= 5) + (a >= 5) <= 1
 *     take a from d    (d % 5) >= (a % 5)       and   (d >= 5) >= (a >= 5)
 *
 * Under the wrong test, "34 + 12" and "21 + 33" both passed and both need the small friend:
 *   34 + 12 -> ones 4 + 2. All four earth beads are already up; there is no fifth. (+2 = -3+5)
 *   21 + 33 -> tens 2 + 3. Same wall, one rod to the left.
 *
 * Every sum below is checked against the rule above, digit by digit:
 *   22 + 12 -> ones 2+2=4 ✓   tens 2+1=3 ✓
 *   61 + 13 -> ones 1+3=4 ✓   tens 6+1 (earth 1+1=2, heaven already down) ✓
 *   52 + 16 -> ones 2+6 (earth 2+1=3, heaven arrives) ✓   tens 5+1 (earth 0+1) ✓
 *   47 - 12 -> ones 7-2 (earth 2-2) ✓   tens 4-1 ✓
 *   79 - 25 -> ones 9-5 (heaven leaves) ✓   tens 7-2 (earth 2-2) ✓
 *   86 - 51 -> ones 6-1 (earth 1-1) ✓   tens 8-5 (heaven leaves) ✓
 */
export const DRILLS: Drill[] = [
  { text: "22 + 12", answer: 34 },
  { text: "61 + 13", answer: 74 },
  { text: "52 + 16", answer: 68 },
  { text: "47 − 12", answer: 35 },
  { text: "79 − 25", answer: 54 },
  { text: "86 − 51", answer: 35 },
];

/**
 * MEASURED, not estimated. Declared 372 while the card draws about 411 — padding 60, title 46 plus
 * an 18 margin, three rows of 85 and two 16 gaps. The overlap guard checks THIS number, so a
 * constant smaller than the artwork is a guard that cannot fail: 39px of this card were invisible to
 * every check. Same class of bug as E07's formula card overflowing into the caption.
 */
export const PRACTICE_NAT = { w: 760, h: 412 };

export const PracticeList: React.FC<{
  /** 0..1 across the line; sums appear in pairs as it advances */
  progress: number;
  scale?: number;
  accent: string;
}> = ({ progress, scale = 1, accent }) => (
  <div
    style={{
      width: PRACTICE_NAT.w,
      boxSizing: "border-box",
      background: "rgba(255,255,255,0.97)",
      borderRadius: 40,
      padding: 30,
      boxShadow: "0 12px 0 rgba(62,36,16,0.22)",
      fontFamily: KID_FONT,
      transform: `scale(${scale})`,
      transformOrigin: "top center",
    }}
  >
    <div
      style={{
        fontSize: 38,
        fontWeight: 700,
        color: accent,
        letterSpacing: 1.6,
        textAlign: "center",
        marginBottom: 18,
      }}
    >
      TRY THESE
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}
    >
      {DRILLS.map((d, i) => {
        // pairs land one after another, all six up by 70% of the line
        const at = 0.08 + Math.floor(i / 2) * 0.2;
        const in_ = interpolate(progress, [at, at + 0.16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={d.text}
            style={{
              fontSize: 54,
              fontWeight: 700,
              color: "#3E2410",
              background: "#FFF3C4",
              borderRadius: 20,
              padding: "10px 0",
              textAlign: "center",
              opacity: in_,
              transform: `translateY(${(1 - in_) * 16}px)`,
            }}
          >
            {d.text}
          </div>
        );
      })}
    </div>
  </div>
);
