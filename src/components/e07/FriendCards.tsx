// E07's teaching device: the friends of five.
//
//        1 + 4 = 5
//        2 + 3 = 5
//
// Two pairs, and the whole episode turns on them. "Every small number has a friend" is an idea a
// six-year-old can hold, but only if the friends are OBJECTS they can see paired — a spoken list of
// four numbers is four numbers, not two friendships.
//
// So each pair is drawn as two cards that SNAP TOGETHER, with the join sealed by a five. The pair
// being used lifts and lights; the other dims but stays, because "the other one still exists" is
// half of what makes this a table a child can look things up in.
//
// It carries the episode's other job too: on "three's friend is two" the 2-3 pair is the answer to a
// question the narration just asked, so `active` is a lookup, not decoration.

import React from "react";
import { Easing, interpolate, interpolateColors } from "remotion";
import { KID_FONT } from "../../lib/fonts";

/** Same rule as the formula card: the container is set to this height, so the guard box and the
 *  artwork are the same box. */
export const FRIENDS_NAT = { w: 430, h: 320 };

/** The two pairs that make five. There are only two, which is the good news the episode delivers. */
export const PAIRS: [number, number][] = [
  [1, 4],
  [2, 3],
];

const CARD_W = 96;
const CARD_H = 104;

export const FriendCards: React.FC<{
  /** how many pairs have been introduced: 0, 1 or 2 */
  shown: number;
  /** the pair being USED right now, by index — highlights it and dims the other */
  active?: number;
  /** the number whose friend is being looked up, so its card reads as the question */
  asking?: number;
  /**
   * Is a pair ARRIVING on this line?
   *
   * `progress` restarts at every phrase boundary, so an arrival animation driven straight off it
   * replays on every line the card is up — the second pair fading in from nothing five times in a
   * row, which on screen is a blink. The card animates once, when its contents change, and holds
   * still otherwise. Same law as E03's sum card and for the same reason.
   */
  arriving?: boolean;
  /** what was lit on the LINE BEFORE — the highlight travels between the two instead of jumping */
  prevActive?: number;
  prevAsking?: number;
  accent: string;
  progress: number;
  scale?: number;
}> = ({
  shown,
  active,
  asking,
  arriving = false,
  prevActive,
  prevAsking,
  accent,
  progress,
  scale = 1,
}) => {
  // EASED, not linear. A straight ramp starts and stops abruptly, which is half of why the card
  // looked like it was flicking rather than arriving.
  const arrive = arriving
    ? interpolate(progress, [0, 0.34], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 1;

  /**
   * THE HIGHLIGHT TRAVELS. It used to switch rows between one frame and the next, which reads as a
   * blink even when nothing is fading. `k` is how far through the move we are, and every row's
   * "litness" is a blend of where the highlight WAS and where it is going — so the fill, the lift and
   * the shadow all slide instead of snapping. Same mechanism as E03's sum card.
   */
  const moved = active !== prevActive || asking !== prevAsking;
  const k = moved
    ? interpolate(progress, [0, 0.3], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      })
    : 1;
  const litness = (i: number) =>
    (prevActive === i ? 1 : 0) * (1 - k) + (active === i ? 1 : 0) * k;
  const askness = (n: number) =>
    (prevAsking === n ? 1 : 0) * (1 - k) + (asking === n ? 1 : 0) * k;

  return (
    <div
      style={{
        width: FRIENDS_NAT.w * scale,
        height: FRIENDS_NAT.h * scale,
        justifyContent: "center",
        boxSizing: "border-box",
        background: "rgba(255,255,255,0.97)",
        borderRadius: 34 * scale,
        padding: `${20 * scale}px ${18 * scale}px`,
        boxShadow: `0 ${9 * scale}px 0 rgba(26,12,31,0.3)`,
        fontFamily: KID_FONT,
        display: "flex",
        flexDirection: "column",
        gap: 14 * scale,
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 32 * scale,
          fontWeight: 700,
          color: accent,
          letterSpacing: 1.6,
        }}
      >
        SMALL FRIENDS
      </div>

      {PAIRS.map((pair, i) => {
        // a pair that has not been introduced yet is absent; the one arriving fades up
        const on = i < shown - 1 ? 1 : i === shown - 1 ? arrive : 0;
        if (on <= 0) return null;
        const lit = litness(i);
        // anything not lit dims towards 0.34, and it gets there over the same travel
        const anyLit = active !== undefined || prevActive !== undefined;
        const dimTo = anyLit ? 0.34 + 0.66 * lit : 1;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6 * scale,
              opacity: dimTo * on,
              transform: `translateY(${(1 - on) * 12 * scale}px) scale(${1 + 0.06 * lit})`,
            }}
          >
            {pair.map((n, k) => {
              // the number being LOOKED UP is outlined; its friend is filled — the answer
              // 0..1, so the "being asked" card inverts smoothly rather than flipping
              const ask = Math.min(lit, askness(n));
              return (
                <div
                  key={k}
                  style={{
                    width: CARD_W * scale,
                    height: CARD_H * scale,
                    borderRadius: 18 * scale,
                    // the two cards meet flat, so the pair reads as one object
                    borderTopRightRadius: k === 0 ? 6 * scale : undefined,
                    borderBottomRightRadius: k === 0 ? 6 * scale : undefined,
                    borderTopLeftRadius: k === 1 ? 6 * scale : undefined,
                    borderBottomLeftRadius: k === 1 ? 6 * scale : undefined,
                    background: interpolateColors(ask, [0, 1], [accent, "#FFFFFF"]),
                    border: `${4 * scale}px solid ${accent}`,
                    color: interpolateColors(ask, [0, 1], ["#FFFFFF", accent]),
                    fontSize: 58 * scale,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 ${4 * scale}px 0 rgba(26,12,31,${0.25 * lit})`,
                  }}
                >
                  {n}
                </div>
              );
            })}
            {/* the seal on the join: what the pair adds up to */}
            <div
              style={{
                marginLeft: 10 * scale,
                fontSize: 40 * scale,
                fontWeight: 700,
                color: interpolateColors(lit, [0, 1], ["#8A7C90", accent]),
              }}
            >
              = 5
            </div>
          </div>
        );
      })}
    </div>
  );
};
