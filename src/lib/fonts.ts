import { loadFont } from "@remotion/google-fonts/Fredoka";

// Fredoka. Baloo 2 was the first pick on the theory that a different face from the
// phonics series would keep the two products distinct — but it renders tall and narrow,
// which reads closer to a UI font than a children's one, and that was the complaint. The
// series is distinguished by its worlds and palette; the font's only job is to look like
// it belongs to a kids' product, and Fredoka's wide, soft, very round letterforms do that
// much better. Weights 300-700 (there is no 800).
//
// LOAD EVERY WEIGHT THE VIDEO USES. Asking for a weight that was not loaded does not
// synthesise it — that element alone drops to a system font, so one component silently
// renders in a different family. That shipped: tooltips were fine at 600/800 while the
// captions asked for 700, which was not in this list, and the captions came out in a
// fallback face. If you introduce a weight anywhere, add it here.
const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
});

export const KID_FONT = fontFamily;

/**
 * The one type scale for the series. Components read from here instead of choosing their
 * own numbers, so "the tooltip is a different font from the caption" cannot recur.
 *
 * The app is the reference for tooltip WORDING only. Type is the video's own.
 */
export const TYPE = {
  family: KID_FONT,
  /** running narration in the caption band */
  caption: { size: 46, weight: 700 },
  /** the app's tour tooltip: plain text and its highlighted terms */
  tooltip: { size: 37, weight: 600, strong: 700 },
  /** part labels and short prompts beside the stage */
  label: { size: 46, weight: 700 },
  /** a number that is the answer */
  answer: { size: 104, weight: 700 },
  /** headline pill */
  headline: { size: 62, weight: 700 },
  /** value chips under a rod, and bead numbering */
  chip: { size: 27, weight: 700 },
} as const;
