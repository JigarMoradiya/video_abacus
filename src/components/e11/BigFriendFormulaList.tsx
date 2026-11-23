// The five big friends, written as formulas.
//
//        +1 = −9 + 10
//        +2 = −8 + 10
//        +3 = −7 + 10
//        +4 = −6 + 10
//        +5 = −5 + 10
//
// CORRECTED 2026-09-21: this used to read `+10 − friend` (carry first), which was simply wrong
// — a first recording was made to that order and the user caught it. The real bead order does
// NOT reverse E07's small-friend notation (`+n = −friend +5`, friend first) — Big Friend uses
// the SAME friend-first shape, just with +10 instead of +5: the friend comes off the ones rod
// FIRST (lower beads before the upper bead, same as Small Friend), THEN the carry to the tens
// rod happens. The formula reads in that order — "take away the friend, then add ten" — so a
// child who has just watched the trick performed sees the symbols agree with the hands.
//
// Same component shape as E07's `FormulaList`: the one just performed can light up on its own as
// a single strip (`only`), and the full five-row table reveals with none lit — the worked
// examples used +1/+2/+3 but "there is one for every number" means all five, so singling one out
// on that line would point at the wrong one, same reasoning E07 used for its own four.

import React from "react";
import { useOverflowGuard } from "../../lib/overflowGuard";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

/** Measured, not guessed — the guard box and the drawn card must be the same box. */
export const BIG_FORMULA_NAT = { w: 430, h: 456 };
/** the single-formula strip: one row, no title */
export const BIG_FORMULA_ONE = { w: 340, h: 104 };

const formula = (n: number) => ({
  n,
  text: `+${n} = −${10 - n} + 10`,
  opStr: `+${n}`,
  friendStr: `−${10 - n}`,
  tenStr: `+ 10`,
});

/** The five taught in E11/E12's worked examples — the card E11 ships with. */
export const BIG_FRIEND_FORMULAS = [1, 2, 3, 4, 5].map(formula);

/** ALL NINE. `+1` and `+9` share the pair {1,9} but are different moves (different starting rod,
 *  different friend), so a card that claims to be "the pattern" has to list every one of them.
 *  E12's pattern-recap and closing cards use this; E11's five-row card is untouched. */
export const BIG_FRIEND_FORMULAS_ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(formula);
/** Measured for nine rows at the tighter type below — same footprint width, taller. */
export const BIG_FORMULA_ALL_NAT = { w: 430, h: 516 };
/** The same nine as a 3×3 GRID — wide and short, for the portrait card band (240 px tall), where a
 *  nine-row tower can only ever be ~13 px type. Three rows of three keeps every row at full size. */
export const BIG_FORMULA_GRID_NAT = { w: 780, h: 206 };

/** TAKING AWAY (E13): friend first, then the ten — `−1 = +9 − 10`. Same friend-first order as the
 *  corrected adding formulas and as Small Friend taking away (`−1 = +4 − 5`). */
const takeFormula = (n: number) => ({
  n,
  text: `−${n} = +${10 - n} − 10`,
  opStr: `−${n}`,
  friendStr: `+${10 - n}`,
  tenStr: `− 10`,
});
export const BIG_FRIEND_TAKE_ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(takeFormula);

export const BigFriendFormulaList: React.FC<{
  /** which formula is lit, by its +n; undefined lights none */
  active?: number;
  /** reveal them one at a time across the line */
  stagger?: boolean;
  /** true only on the line the list first appears; otherwise it holds still */
  arriving?: boolean;
  /** show ONLY the active formula, as a single strip */
  only?: boolean;
  /** all nine formulas, not the five taught — tighter type so nine rows fit the same gutter */
  all?: boolean;
  /** with `all`: lay the nine out as a 3×3 grid instead of a tower (portrait) */
  grid?: boolean;
  /** TAKING AWAY formulas instead of adding: `−n = +friend − 10` (friend first, E13). Off for E11/E12. */
  take?: boolean;
  /** WORD-SYNCED per-NUMBER flash within the `only` strip — which of the formula's three numbers
   *  the narration is naming RIGHT NOW ("Plus four equals minus six, plus ten." names the operand,
   *  then the friend, then ten, one at a time). `undefined` lights none. Reuses the exact `flash`
   *  idiom `ColumnSum` already has (a caller-driven 0..1 `k`, not a fixed animation), just applied
   *  to a substring of one row's own text instead of a whole row. Only meaningful with `only`. */
  flashPart?: "operand" | "friend" | "ten";
  /** 0..1 across the flashed word, same meaning as `ColumnSum`'s own `flash.k`. */
  flashK?: number;
  accent: string;
  progress: number;
  scale?: number;
}> = ({
  active,
  stagger = false,
  arriving = false,
  only = false,
  all = false,
  grid = false,
  take = false,
  flashPart,
  flashK = 0,
  accent,
  progress,
  scale = 1,
}) => {
  const asGrid = all && grid;
  const nat = only ? BIG_FORMULA_ONE : asGrid ? BIG_FORMULA_GRID_NAT : all ? BIG_FORMULA_ALL_NAT : BIG_FORMULA_NAT;
  // taking away always draws from the full nine (a single `only` strip can be any of −1…−9)
  const rows = take ? BIG_FRIEND_TAKE_ALL : all ? BIG_FRIEND_FORMULAS_ALL : BIG_FRIEND_FORMULAS;
  const step = all ? 0.085 : 0.14;
  const cells = rows
    .filter((f) => !only || f.n === active)
    .map((f, i) => {
      const at = stagger ? 0.06 + i * step : 0;
      const on =
        arriving || stagger
          ? interpolate(progress, [at, at + step], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 1;
      const lit = active === f.n;
      // Per-number flash — only meaningful on the single `only` strip, where there is exactly
      // one row to look at and three numbers in it. Each flashed number pops (scale + a bright
      // ring) independent of the row's own base "lit" styling, same additive idiom `ColumnSum`
      // already uses for its own digit flash.
      const numSpan = (text: string, part: "operand" | "friend" | "ten") => {
        const fk = only && flashPart === part ? flashK : 0;
        return (
          <span
            key={part}
            style={{
              display: "inline-block",
              transform: `scale(${1 + fk * 0.28})`,
              color: fk > 0.01 ? "#FFE156" : undefined,
              textShadow: fk > 0.01 ? `0 0 ${10 * fk}px rgba(255,225,86,${fk})` : undefined,
            }}
          >
            {text}
          </span>
        );
      };
      return (
        <div
          key={f.n}
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: (asGrid ? 32 : all ? 30 : 38) * scale,
            fontWeight: 700,
            color: lit ? "#FFFFFF" : "#6B5C72",
            background: lit ? accent : "#F1ECF3",
            borderRadius: 14 * scale,
            padding: `${(all ? 4 : 6) * scale}px 0`,
            opacity: (lit ? 1 : 0.72) * on,
            transform: `translateY(${(1 - on) * 10 * scale}px) scale(${lit ? 1.04 : 1})`,
          }}
        >
          {only ? (
            <>
              {numSpan(f.opStr, "operand")} = {numSpan(f.friendStr, "friend")} {numSpan(f.tenStr, "ten")}
            </>
          ) : (
            f.text
          )}
        </div>
      );
    });
  const guardRef = React.useRef<HTMLDivElement>(null);
  useOverflowGuard(guardRef, "BIG FORMULAS", 6);
  return (
    <div ref={guardRef}
      style={{
        width: nat.w * scale,
        height: nat.h * scale,
        boxSizing: "border-box",
        justifyContent: "center",
        background: "rgba(255,255,255,0.97)",
        borderRadius: 34 * scale,
        padding: `${(all ? 14 : 18) * scale}px ${18 * scale}px`,
        boxShadow: `0 ${9 * scale}px 0 rgba(26,12,31,0.3)`,
        fontFamily: KID_FONT,
        display: "flex",
        flexDirection: "column",
        gap: (all ? 5 : 8) * scale,
        alignItems: "center",
      }}
    >
      {!only && (
        <div style={{ fontSize: (all ? 24 : 28) * scale, fontWeight: 700, color: accent, letterSpacing: 1.4 }}>
          BIG FRIENDS
        </div>
      )}
      {asGrid ? (
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: `${5 * scale}px ${10 * scale}px`,
          }}
        >
          {cells}
        </div>
      ) : (
        cells
      )}
    </div>
  );
};
