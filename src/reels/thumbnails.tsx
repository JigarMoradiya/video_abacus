// Thumbnails — one still per episode, in 16:9 and 9:16.
//
// Built in Remotion rather than a design tool on purpose: they use the SAME abacus component, the
// same rigs, the same worlds and the same font as the videos, so a thumbnail can never drift from
// what the episode actually looks like, and a new episode's thumbnail is a data row.
//
// WHAT A THUMBNAIL HAS TO DO, and what these are built around:
//
//   1. Read at 210 x 118 px. That is the width of a mobile feed card, and it is the only size that
//      matters — a thumbnail that needs a laptop to parse has already lost. Everything here is
//      tested at that size: three words maximum, one focal object, no fine detail.
//   2. Pose a question the viewer wants answered. Maths content clicks when the image IS a puzzle:
//      an abacus showing a number with "= ?" beside it is a question a child cannot leave alone.
//      This is why none of them repeats the video's title — the title says what it is, the
//      thumbnail says why you should care.
//   3. Look like a series. Same layout, same badge, same type, different world and different
//      question, so episode four is recognisably by whoever made episode one.
//   4. High contrast against a WHITE feed. The abacus panel is near-white, so every thumbnail
//      keeps a saturated world behind it and a dark rule under the headline.

import React from "react";
import { AbsoluteFill } from "remotion";
import { Abacus, type RodState } from "../components/Abacus";
import { World } from "../components/World";
import { AppIcon } from "../components/AppShowcase";
import { KID_FONT } from "../lib/fonts";
import { RIG_WOOD, RIG_SEA, RIG_CITY, RIG_SPACE, RIG_JUNGLE, WORLDS, type RigPalette, type WorldKind } from "../data/theme";
import { ROD_DIM } from "../data/tokens";

export interface ThumbSpec {
  ep: number;
  /** the hook. THREE WORDS MAX — this is the whole design constraint */
  hook: string;
  /** the small line under it, for search-relevant words the hook cannot carry */
  sub: string;
  world: WorldKind;
  palette: RigPalette;
  /** rod values, index 0 = ones = rightmost */
  rods: number[];
  /** how many rods to draw */
  rodCount: number;
  /** the headline's colour — pulled from the world so the set stays coherent */
  ink: string;
  band: string;
}

export const THUMBS: Record<string, ThumbSpec> = {
  e01: {
    ep: 1,
    hook: "WHAT IS THIS?",
    sub: "meet the abacus",
    world: "blueprint",
    palette: RIG_WOOD,
    rods: [0, 0, 0, 0, 0],
    rodCount: 5,
    // Bright yellow, not white. White text with a white halo on a dark navy world had nothing to
    // separate the letters from their own glow, and it was the only thumbnail in the set whose hook
    // did not read as ink. Yellow on navy is the strongest pairing available here.
    ink: "#FFD54F",
    band: "#00A2C7",
  },
  e02: {
    ep: 2,
    hook: "WHAT NUMBER?",
    sub: "read any rod · 0 to 9",
    world: "sky",
    palette: RIG_WOOD,
    rods: [7, 0, 0, 0, 0],
    rodCount: 5,
    ink: "#08344F",
    band: "#FF8F00",
  },
  e03: {
    ep: 3,
    hook: "1 + 2 = ?",
    sub: "adding on the abacus",
    world: "rockpool",
    palette: RIG_SEA,
    // ONE bead, not three. The rod showed the answer to the question printed beside it, which
    // closes the loop the thumbnail exists to open — a puzzle thumbnail must not resolve itself.
    rods: [1, 0, 0, 0, 0],
    rodCount: 5,
    ink: "#04343A",
    // Deep sea ink. The rose it replaced was a colour from nowhere in this world — it sat on the
    // turquoise as a sticker rather than as part of the picture. A dark chip pulled from the hook's
    // own ink reads unmistakably as a LABEL while still belonging to the frame, and it keeps the
    // set varied against lesson 1's cyan, lesson 2's orange and lesson 4's blue.
    band: "#06414A",
  },
  e04: {
    ep: 4,
    hook: "HOW BIG?",
    sub: "tens · hundreds",
    world: "summit",
    palette: RIG_CITY,
    rods: [7, 4, 2, 0, 0],
    rodCount: 5,
    ink: "#40160F",
    band: "#2E5F8A",
  },
  e05: {
    ep: 5,
    hook: "8 - 3 = ?",
    sub: "abacus subtraction",
    // Earth's limb and a starfield. The launch worlds run dawn-to-dark across the episode, and this
    // is the one that reads at 210px: a big lit curve, black above it, nothing else competing.
    world: "orbit",
    palette: RIG_SPACE,
    // EIGHT — the question's starting number, not its answer. Same rule as lesson 3: the rod poses
    // the sum, the hook asks for the result. Eight also happens to be the value that shows both
    // kinds of bead at once, which is exactly what this lesson is about.
    rods: [8, 0, 0, 0, 0],
    rodCount: 5,
    ink: "#5CE1E6",
    band: "#E8543F",
  },
  e06: {
    ep: 6,
    hook: "21 + 3 = ?",
    sub: "two rods · tens and ones",
    // The clearing, not the waterfall: at 210px a thumbnail needs one bright field behind the
    // instrument, and the falling water competed with the beads for the eye.
    world: "clearing",
    palette: RIG_JUNGLE,
    // TWENTY-ONE — the question's starting number, not its answer. Same rule as lessons 3 and 5, and
    // it is the first thumbnail in the series showing TWO live rods, which is the whole lesson.
    rods: [1, 2, 0, 0, 0],
    rodCount: 5,
    ink: "#12401F",
    band: "#F2543D",
  },
};

/**
 * Is this ink LIGHT? The drop shadow has to be the opposite of the letters or it does nothing — a
 * white halo under white type is how lesson one lost its outline. That was patched by testing for
 * one exact hex, which quietly meant the next light ink added to this table would inherit the bug.
 */
const isLightInk = (hex: string): boolean => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 140;
};

const rig = (spec: ThumbSpec): RodState[] =>
  Array.from({ length: spec.rodCount }, (_, i) => ({
    value: spec.rods[i] ?? 0,
    focus: (spec.rods[i] ?? 0) > 0 ? 1 : ROD_DIM,
  }));

/**
 * The episode chip. Small, bottom-left, never competing with the hook — its job is to say "there
 * are more of these", which is what turns one view into a session.
 */
const EpisodeChip: React.FC<{ ep: number; band: string; scale: number }> = ({ ep, band, scale }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14 * scale,
      background: "rgba(255,255,255,0.95)",
      borderRadius: 999,
      padding: `${10 * scale}px ${24 * scale}px ${10 * scale}px ${12 * scale}px`,
      boxShadow: `0 ${6 * scale}px 0 rgba(0,0,0,0.2)`,
    }}
  >
    <AppIcon size={54 * scale} />
    <span
      style={{
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: 34 * scale,
        color: band,
        letterSpacing: 0.5,
      }}
    >
      LESSON {ep}
    </span>
  </div>
);

/**
 * The abacus's share of a 16:9 thumbnail. Down from 0.72: at that size the instrument took 443 of
 * the 1280px and left the hook a 623px column, which is what forced "21 + 3 = ?" onto two lines. The
 * beads are still perfectly legible at 0.64 — the hook is the thing being read at 210px.
 */
const ABACUS_S = 0.64;

export const Thumbnail: React.FC<{ spec: ThumbSpec; portrait?: boolean }> = ({
  spec,
  portrait = false,
}) => {
  const w = WORLDS[spec.world];
  // 9:16 is 1080x1920 and 16:9 is 1280x720, so everything is expressed against the SHORT edge and
  // scaled — one layout, two crops, the same rule the reels follow.
  const s = portrait ? 1080 / 1280 : 1;
  // Sized off the frame's SHORT edge, not off a number that felt right on a laptop: 26% of the
  // height in 16:9, 19% of the width in 9:16. At 132 it came out around a tenth of the frame, which
  // is legible at full size and gone at 210 px — the one size a thumbnail is actually judged at.
  // ONE LINE IF IT CAN BE, TWO ONLY IF IT MUST — and never a hard break in the data.
  //
  // The breaks used to be hard-coded per hook, which is why "1 + 2 = ?" sat on two lines even in
  // 9:16 where it had a thousand pixels of room, and why lesson 1 read as three stacked words. A
  // break is a function of the space available, so it is computed from the space available: fit the
  // whole hook on one line, and accept a second line only when one line would drop the type below
  // the size a feed card needs.
  // The 16:9 column reserves a 78 px GUTTER before the abacus. Without it the hook was fitted right
  // up to the instrument's edge, so the longest line finished a few pixels from the beads and the
  // two halves of the thumbnail ran together. Reserving the gap also takes the type down a notch,
  // which is the same fix from the other end.
  // Trimmed from 78. The gutter exists so the hook does not finish against the beads, and 50 is
  // still clear air — the 28px it gives back goes straight into the type size of a one-line sum.
  const GUTTER = 50;
  const column = portrait ? 1080 - 80 : 1280 - 64 - 72 - 615 * ABACUS_S - GUTTER;
  // Width of the hook, as a multiple of its font size. A flat 0.62 per character over-counted a sum
  // badly — "21 + 3 = ?" is three SPACES and three thin operator glyphs out of ten characters, so the
  // estimate said it needed 20% more room than it does, and that phantom width is what pushed it onto
  // a second line in the first place.
  const CH = 0.62;
  const widthOf = (t: string) =>
    [...t].reduce((w, c) => w + (c === " " ? 0.28 : "+-−=?".includes(c) ? 0.52 : CH), 0);
  const FLOOR = 118; // under this the hook stops working at 210px wide, so wrapping is worth it
  const cap = portrait ? 205 : 187;
  const oneLine = (column * 0.94) / widthOf(spec.hook);
  const wraps = oneLine < FLOOR;
  // (an expression ignores this — see below)
  // A wrapped hook breaks at a WORD, so it has to be sized off the longest line it can actually
  // produce — not off half its characters. "WHAT NUMBER?" is twelve characters, but it breaks into
  // "WHAT" and "NUMBER?", and sizing it as if each line were six ran the second one off the frame.
  const words = spec.hook.split(" ");
  // A hook that is a SUM must never break mid-expression. The balanced-split rule below is right for
  // "WHAT NUMBER?" and wrong for "21 + 3 = ?": every token is a word, so the most balanced break
  // landed after the plus and the thumbnail read "21 +" over "3 = ?".
  //
  // An expression breaks at the EQUALS or not at all — question on one line, answer on the next,
  // which is how a child writes it and how this series' own sum card lays it out.
  // A SUM IS ALWAYS ONE LINE. Any break splits the sentence a child is being asked to read —
  // "21 +" over "3 = ?" is nonsense, and even a tidy break at the equals makes the reader assemble
  // two fragments. It is a ten-character string; it fits, and the type is big enough without it.
  const isExpression = /^[\d\s+\-−×÷=?]+$/.test(spec.hook) && spec.hook.includes("=");
  const bestSplit = Math.min(
    ...words.slice(1).map((_, k) => {
      const a = words.slice(0, k + 1).join(" ").length;
      const b = words.slice(k + 1).join(" ").length;
      return Math.max(a, b);
    })
  );
  const hookSize = Math.min(cap, wraps && !isExpression ? (column * 0.94) / (bestSplit * CH) : oneLine);

  const headline = (
    // 9:16 gives the hook and its tag real separation. At 8 px the two were reading as one block —
    // the hook is the headline and the tag is a caption under it, and that relationship only comes
    // through if there is air between them. 16:9 keeps its tighter setting: the pair share a narrow
    // column there and too much air would break them apart instead.
    <div style={{ display: "flex", flexDirection: "column", gap: portrait ? 48 : 10, alignItems: "center" }}>
      <span
        style={{
          fontFamily: KID_FONT,
          fontWeight: 700,
          fontSize: hookSize,
          lineHeight: 0.94,
          color: spec.ink,
          textAlign: "center",
          whiteSpace: wraps && !isExpression ? "normal" : "nowrap",
          textWrap: "balance",
          maxWidth: column,
          // a hard outline, because the feed shows this at 210px on unpredictable backgrounds
          // A light hook needs a DARK drop, a dark hook needs a light one — a white halo under white
          // letters is invisible, which is exactly how lesson one lost its outline.
          textShadow: isLightInk(spec.ink)
            ? `0 ${7 * s}px 0 rgba(4,26,38,0.85), 0 0 ${20 * s}px rgba(4,26,38,0.6)`
            : `0 ${8 * s}px 0 rgba(255,255,255,0.7), 0 0 ${20 * s}px rgba(255,255,255,0.55)`,
          letterSpacing: -1,
        }}
      >
        {spec.hook}
      </span>
      <span
        style={{
          fontFamily: KID_FONT,
          fontWeight: 700,
          fontSize: 48 * s,
          color: "#FFFFFF",
          background: spec.band,
          borderRadius: 999,
          padding: `${8 * s}px ${26 * s}px`,
          letterSpacing: 0.5,
        }}
      >
        {spec.sub}
      </span>
    </div>
  );

  const instrument = (
    // SIZED THROUGH THE COMPONENT, never with a CSS transform. A transform does not change an
    // element's layout box, so flex reserved the unscaled 477 px height while the abacus drew 706 —
    // and the overflow went straight up over the sub-chip, hiding it behind the beads. Passing
    // `scale` sets the SVG's own width and height, so what is laid out is what is drawn.
    //
    // 9:16 gives the instrument ~85% of the width: vertical has height to spare and width to fill.
    <Abacus rods={rig(spec)} scale={portrait ? 1.48 : ABACUS_S} palette={spec.palette} />
  );

  return (
    <AbsoluteFill>
      <World kind={spec.world} />
      {/* a white scrim under the text half, so the hook survives a busy world */}
      <AbsoluteFill
        style={{
          background: portrait
            ? "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 42%)"
            : "linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 55%)",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: portrait ? "column" : "row",
          alignItems: "center",
          justifyContent: portrait ? "center" : "space-between",
          gap: portrait ? 90 * s : 0,
          // The bottom padding RESERVES the badge's strip. Without it the content is centred against
          // the whole frame, so a three-line hook pushed its sub-chip straight down onto the LESSON
          // card — the badge is fixed furniture and the composition has to be told it is there.
          padding: portrait
            // top-weighted on purpose: the badge owns the bottom strip, and a vertical thumbnail is
            // cropped from the bottom in some feed placements, so the hook belongs high.
            ? `${120 * s}px ${40 * s}px ${360 * s}px`
            : "0 64px 116px 72px",
        }}
      >
        {headline}
        {instrument}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: portrait ? 48 : 40, bottom: portrait ? 56 : 34 }}>
        <EpisodeChip ep={spec.ep} band={spec.band} scale={portrait ? 1.25 : 1} />
      </div>
    </AbsoluteFill>
  );
};

export const ThumbE01: React.FC = () => <Thumbnail spec={THUMBS.e01} />;
export const ThumbE02: React.FC = () => <Thumbnail spec={THUMBS.e02} />;
export const ThumbE03: React.FC = () => <Thumbnail spec={THUMBS.e03} />;
export const ThumbE04: React.FC = () => <Thumbnail spec={THUMBS.e04} />;
export const ThumbE05: React.FC = () => <Thumbnail spec={THUMBS.e05} />;
export const ThumbE06: React.FC = () => <Thumbnail spec={THUMBS.e06} />;
export const ThumbE01V: React.FC = () => <Thumbnail spec={THUMBS.e01} portrait />;
export const ThumbE02V: React.FC = () => <Thumbnail spec={THUMBS.e02} portrait />;
export const ThumbE03V: React.FC = () => <Thumbnail spec={THUMBS.e03} portrait />;
export const ThumbE04V: React.FC = () => <Thumbnail spec={THUMBS.e04} portrait />;
export const ThumbE05V: React.FC = () => <Thumbnail spec={THUMBS.e05} portrait />;
export const ThumbE06V: React.FC = () => <Thumbnail spec={THUMBS.e06} portrait />;
