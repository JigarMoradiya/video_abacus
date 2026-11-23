// E11's teaching device: the five big friends.
//
//        1 + 9 = 10        2 + 8 = 10
//        3 + 7 = 10        4 + 6 = 10
//               5 + 5 = 10
//
// Same idiom as E07's `FriendCards` — two cards that snap together, sealed with the number they
// make — but FIVE pairs, not two, and it does NOT try to force them into that component's
// two-pair column. A two-column, three-row GRID keeps the footprint close to `FRIENDS_NAT`'s own
// (430x320-ish), which is what already fits both the 16:9 gutter and the 4:5 card band — five
// rows stacked the way E07 does it would run to ~700px tall and blow through the portrait card
// band entirely.
//
// The fifth pair — five and five — has no partner to sit beside, and it is also the only pair
// that is its OWN friend. Centring it alone under the 2x2 grid says both things visually: one
// more pair, and a special one.

import React from "react";
import { useOverflowGuard } from "../../lib/overflowGuard";
import { Easing, interpolate, interpolateColors } from "remotion";
import { KID_FONT } from "../../lib/fonts";

/** The container is set to this size, so the guard box and the artwork are the same box —
 *  same rule FRIENDS_NAT and FORMULA_NAT follow. */
export const BIG_FRIENDS_NAT = { w: 452, h: 336 };

/** The five pairs that make ten, in reading order: two per row, the mirror pair alone at the
 *  bottom. */
export const BIG_PAIRS: [number, number][] = [
  [1, 9],
  [2, 8],
  [3, 7],
  [4, 6],
  [5, 5],
];

const CARD_W = 68;
const CARD_H = 76;

export const BigFriendCards: React.FC<{
  /** how many pairs have been introduced, 0-5 */
  shown: number;
  /** the pair being USED right now, by index — highlights it and dims the rest */
  active?: number;
  arriving?: boolean;
  prevActive?: number;
  accent: string;
  progress: number;
  /** Opt-in (Bead Buddies remake): the opacity floor for the pairs that are NOT lit (default 0.34). */
  dimFloor?: number;
  /** opt-in: pairs still to come show as dashed "?" cards, so the card is never an empty white box */
  ghost?: boolean;
  scale?: number;
  /** the ONE number tile currently being spoken — scales up and flashes gold exactly on that
   *  word, independent of `active` (which lights a whole pair for the quiz). `k` is 0..1, driven
   *  by the caller off the word's own timing, not off `progress` — a flash has to land on the
   *  word regardless of where in the phrase that word falls. */
  flash?: { pair: number; side: 0 | 1; k: number };
}> = ({ shown, active, arriving = false, prevActive, accent, progress, scale = 1, flash, dimFloor = 0.34, ghost = false }) => {
  const arrive = arriving
    ? interpolate(progress, [0, 0.3], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 1;

  const moved = active !== prevActive;
  const k = moved
    ? interpolate(progress, [0, 0.3], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      })
    : 1;
  const litness = (i: number) => (prevActive === i ? 1 : 0) * (1 - k) + (active === i ? 1 : 0) * k;
  const anyLit = active !== undefined || prevActive !== undefined;

  const Pair: React.FC<{ i: number }> = ({ i }) => {
    const pair = BIG_PAIRS[i];
    const on = i < shown - 1 ? 1 : i === shown - 1 ? arrive : 0;
    const ghostRow = ghost && on < 1 ? (
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 4 * scale, opacity: 0.55 * (1 - on) }}>
        {[0, 1].map((kx) => (
          <div key={kx} style={{ boxSizing: "border-box", width: CARD_W * scale, height: CARD_H * scale, borderRadius: 14 * scale, border: `${3 * scale}px dashed ${accent}`, color: accent, fontSize: 34 * scale, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
        ))}
        <div style={{ marginLeft: 4 * scale, fontSize: 24 * scale, fontWeight: 700, color: accent }}>=10</div>
      </div>
    ) : null;
    if (on <= 0) {
      return ghost ? <div style={{ position: "relative", width: (2 * CARD_W + 8 + 62) * scale, height: CARD_H * scale }}>{ghostRow}</div> : null;
    }
    const lit = litness(i);
    const dimTo = anyLit ? dimFloor + (1 - dimFloor) * lit : 1;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4 * scale,
          opacity: dimTo * on,
          transform: `translateY(${(1 - on) * 10 * scale}px) scale(${1 + 0.05 * lit})`,
        }}
      >
        {pair.map((n, kx) => {
          const fk = flash && flash.pair === i && flash.side === kx ? flash.k : 0;
          return (
            <div
              key={kx}
              style={{
                width: CARD_W * scale,
                height: CARD_H * scale,
                borderRadius: 14 * scale,
                borderTopRightRadius: kx === 0 ? 5 * scale : undefined,
                borderBottomRightRadius: kx === 0 ? 5 * scale : undefined,
                borderTopLeftRadius: kx === 1 ? 5 * scale : undefined,
                borderBottomLeftRadius: kx === 1 ? 5 * scale : undefined,
                background: interpolateColors(lit, [0, 1], [accent, accent]),
                border: `${3 * scale}px solid ${interpolateColors(fk, [0, 1], [accent, "#FFE066"])}`,
                color: "#FFFFFF",
                fontSize: 38 * scale,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 ${3 * scale}px 0 rgba(26,12,31,${0.25 * lit}), 0 0 ${18 * scale * fk}px rgba(255,224,102,${fk})`,
                transform: `scale(${1 + 0.3 * fk})`,
              }}
            >
              {n}
            </div>
          );
        })}
        <div
          style={{
            marginLeft: 4 * scale,
            fontSize: 24 * scale,
            fontWeight: 700,
            color: interpolateColors(lit, [0, 1], ["#8A7C90", accent]),
          }}
        >
          =10
        </div>
      </div>
    );
  };

  const guardRef = React.useRef<HTMLDivElement>(null);
  useOverflowGuard(guardRef, "BIG FRIENDS", 6);
  return (
    <div ref={guardRef}
      style={{
        width: BIG_FRIENDS_NAT.w * scale,
        height: BIG_FRIENDS_NAT.h * scale,
        boxSizing: "border-box",
        background: "rgba(255,255,255,0.97)",
        borderRadius: 30 * scale,
        padding: `${16 * scale}px ${16 * scale}px`,
        boxShadow: `0 ${9 * scale}px 0 rgba(26,12,31,0.3)`,
        fontFamily: KID_FONT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10 * scale,
      }}
    >
      <div style={{ fontSize: 26 * scale, fontWeight: 700, color: accent, letterSpacing: 1.4 }}>
        BIG FRIENDS
      </div>
      <div style={{ display: "flex", gap: 16 * scale }}>
        <Pair i={0} />
        <Pair i={1} />
      </div>
      <div style={{ display: "flex", gap: 16 * scale }}>
        <Pair i={2} />
        <Pair i={3} />
      </div>
      <Pair i={4} />
    </div>
  );
};
