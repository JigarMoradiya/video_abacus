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
import { Monkey } from "../components/e06/Monkey";
import { Astro } from "../components/e05/Astro";
import { Rabbit } from "../components/e07/Rabbit";
import { Puppy, PUPPY_BOX } from "../components/e08/Puppy";
import { Seagull, GULL_BOX } from "../components/e09/Seagull";
import { Fox, FOX_BOX } from "../components/e10/Fox";
import { Wheel } from "../components/e10/Wheel";
import { Elephant } from "../components/e11/Elephant";
import { Toucan } from "../components/e12/Toucan";
import { Squirrel } from "../components/e13/Squirrel";
import { Hedgehog } from "../components/e14/Hedgehog";
import { Otter, type OtterRole, type Costume, type OtterProp } from "../components/cast";
import { Dino, type DinoKind } from "../components/e08/Dino";
import { Critter, type CritterKind } from "../components/cast/Critters";
import { BB_RIGS } from "../data/bbworlds";
import { Wheel as WheelE14 } from "../components/e14/Wheel";
import { KID_FONT } from "../lib/fonts";
import {
  RIG_WOOD,
  RIG_SEA,
  RIG_CITY,
  RIG_SPACE,
  RIG_JUNGLE,
  RIG_MAGIC,
  RIG_PARK,
  RIG_ICE,
  RIG_SHOW,
  RIG_CIRCUS,
  RIG_TOUCAN,
  RIG_AUTUMN,
  RIG_ARCADE,
  RIG_DINO,
  WORLDS,
  type RigPalette,
  type WorldKind,
} from "../data/theme";
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
  /**
   * The episode's own character, in the corner.
   *
   * A face is the single most reliable thing you can put in a kids' thumbnail, and this one is free:
   * the character already exists, already belongs to the episode, and a returning viewer recognises
   * it before they read anything. It sits in the SAME corner every time so the set still reads as a
   * series, and it is small — the puzzle is still the subject.
   *
   * Only four of the six episodes have one. E01 and E04 have no character at all, and rather than
   * invent one for a thumbnail they go without: their worlds (navy blueprint, lit city) carry the
   * identity instead.
   */
  character?: "monkey" | "astro" | "rabbit" | "puppies" | "seagulls" | "foxes" | "elephants" | "toucans" | "squirrels" | "hedgehogs";
  /** A plain-text SUBTITLE between the title and the orange tag — smaller than the title, no
   *  pill. Optional: only episodes that need a third line (a title AND an expression AND a tag)
   *  set it; the rest keep the original title-then-tag pair unchanged. */
  subtitle?: string;
  /** Override the sub-pill's font size. Defaults to 48 — only set this per-episode, never edit
   *  the shared default, or every thumbnail in the series resizes along with the one you meant. */
  subSize?: number;
  /** The episode's formula, drawn on its own white card (titled SMALL FRIEND) under the sub pill, e.g. "+3 = −2 +5". Optional. */
  formula?: string;
  /** the formula card's title; defaults to SMALL FRIEND */
  formulaTitle?: string;
  /** the subtitle's colour when the episode ink is too light for it on this sky */
  subtitleInk?: string;
  /** The hero instrument, defaults to the abacus. E10 is a recall GAME, not a lesson — every
   *  other thumbnail in the series shows the abacus, and on a feed page of ten near-identical
   *  cards that sameness is a cost, not a virtue, for the one episode that is actually different
   *  in kind. Its own wheel is the more honest "what is this video" image anyway. */
  hero?: "abacus" | "wheel";
  /** The Bead Buddies cast (Pip, Fifi, Tenzo) with a costume, and an optional set-piece dinosaur — replaces `character`. */
  buddies?: { cast: OtterRole[]; costume?: Costume; props?: Partial<Record<OtterRole, OtterProp>>; dino?: DinoKind; piece?: CritterKind };
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
    character: "astro",
  },
  e06: {
    ep: 6,
    hook: "13 + 26 = ?",
    sub: "two rods · tens and ones",
    // The clearing, not the waterfall: at 210px a thumbnail needs one bright field behind the
    // instrument, and the falling water competed with the beads for the eye.
    world: "clearing",
    palette: RIG_JUNGLE,
    // THIRTEEN — the question's starting number, not its answer. Same rule as lessons 3 and 5, and
    // it is the first thumbnail in the series showing TWO live rods, which is the whole lesson.
    //
    // The episode's middle sum rather than its first: 13 + 26 moves BOTH rods, which is what the
    // lesson is actually about, where 21 + 3 only ever touches the ones.
    rods: [3, 1, 0, 0, 0],
    rodCount: 5,
    ink: "#12401F",
    band: "#F2543D",
    character: "monkey",
  },
  e07: {
    ep: 7,
    hook: "3 + 3 = ?",
    // the sub carries the HOOK the sum cannot: this is the episode where the beads run out, which is
    // the only thing in the series so far that sounds like a problem rather than a lesson
    sub: "when the beads run out",
    formula: "+3 = −2 +5",
    // stagefull, not hatreveal — that world draws its own top hat as scenery and the rabbit brings
    // one of its own, which would put two hats in a 210px image
    world: "cloudB",
    palette: BB_RIGS.cloud,
    // THREE, the number the episode gets stuck on. With four lower beads on the rod, a viewer who
    // knows the abacus can already see the problem — which is the whole promise of the video.
    rods: [3, 0, 0, 0, 0],
    rodCount: 5,
    ink: "#FFD873",
    band: "#7A2A56",
    buddies: { cast: ["little", "middle"], costume: "pilot", props: { little: "binoculars" }, piece: "cloudy" },
  },
  e08: {
    ep: 8,
    // FOUR PLUS ONE, which is the ONLY rod value +1 ever gets stuck on — and it looks like the
    // easiest sum on the thumbnail, which is exactly why it earns the click.
    hook: "Small Friend of +5",
    subtitle: "4 + 1 = ?",
    sub: "all four friends of five",
    formula: "+1 = −4 +5",
    world: "dinomeadow",
    palette: RIG_DINO,
    rods: [4, 0, 0, 0, 0],
    rodCount: 5,
    // dark teal on a pale morning sky. This is the first thumbnail in the series with DARK ink —
    // every park world is bright, and the pale golds that worked on E05's space and E07's stage
    // would disappear here.
    ink: "#1C4A40",
    band: "#F0741B",
    buddies: { cast: ["little", "middle"], costume: "explorer", props: { little: "binoculars", middle: "magnifier" }, dino: "trike" },
  },
  e09: {
    ep: 9,
    // FIVE MINUS ONE — the wall itself, the only digit with zero lower beads, the starkest
    // possible "stuck", exactly the reason it opens the episode's worked examples.
    hook: "Small Friend of −5",
    subtitle: "5 − 1 = ?",
    sub: "all four friends, taking away",
    formula: "−1 = +4 −5",
    world: "snowB",
    palette: BB_RIGS.snow,
    rods: [5, 0, 0, 0, 0],
    rodCount: 5,
    ink: "#3A2340",
    band: "#F5567F",
    buddies: { cast: ["little", "middle"], costume: "scarf", props: { little: "binoculars" }, piece: "snowman" },
  },
  e10: {
    ep: 10,
    // FOUR PLUS ONE — round one's own sum, and the easiest-looking one on the wheel, which is
    // exactly why it earns the click: "I know this one."
    hook: "Beat the Beads!",
    subtitle: "4 + 1 = ?",
    sub: "all 8 small friends, mixed up",
    world: "spaceB",
    palette: BB_RIGS.space,
    rods: [4, 0, 0, 0, 0],
    rodCount: 5,
    ink: "#FFE156",
    band: "#FF4D8D",
    buddies: { cast: ["little", "middle"], costume: "helmet", props: { little: "binoculars" }, piece: "robo" },
    hero: "wheel",
  },
  e11: {
    ep: 11,
    // CORRECTED: "9 + 1 = ?" alone (E07's own pattern) read as just another sum, not as "this
    // introduces a whole new named trick" — the user's own words: "how get idea this video
    // introduct big friend formula?" The concept NAME has to be the big bold word here, matching
    // E09's three-tier shape instead (concept name / the sum / what's new about it), and matching
    // the exact on-screen card text this episode itself uses ("BIG FRIENDS").
    hook: "Meet Big Friends!",
    subtitle: "9 + 1 = ?",
    sub: "carry to ten — easy!",
    formula: "+1 = −9 +10",
    formulaTitle: "BIG FRIEND",
    subtitleInk: "#7A1F5C",
    // NOT bigtopchant: that world draws its own top hat as fixed-position scenery (same reason
    // E07's own thumbnail note gives for avoiding hatreveal), and a two-line hook here pushes the
    // abacus panel down far enough in 9:16 to collide with it. `showtime` keeps the same chasing-
    // bulbs circus energy with no fixed prop to collide with anything.
    world: "pirateB",
    palette: BB_RIGS.pirate,
    rods: [9, 0, 0, 0, 0],
    rodCount: 5,
    ink: "#FFF3E0",
    band: "#D6127E",
    buddies: { cast: ["little", "big"], costume: "pirate", props: { little: "binoculars" }, piece: "parrot" },
  },
  e12: {
    ep: 12,
    // CORRECTED (user): "All 5 Big Friends" was wrong on both counts — E12 is ADDITION only (E13 is
    // taking away), and addition has NINE formulas (+1..+9), not five pairs. The title is the
    // episode's own narration ("This video is all about big friend adding"), the subtitle states
    // the range, and the tag says how many.
    hook: "Big Friend Adding!",
    subtitle: "+1 to +9",
    sub: "all 9 formulas!",
    // the episode's own jungle — canopy, godrays, butterflies — no fixed prop to collide with text
    world: "farmB",
    palette: BB_RIGS.farm,
    rods: [9, 0, 0, 0, 0],
    rodCount: 5,
    ink: "#FFF8E8",
    band: "#FF7A3D",
    buddies: { cast: ["little", "big"], costume: "farmer", props: { little: "binoculars" }, piece: "pig" },
  },
  e13: {
    ep: 13,
    // The mirror of E12, phrased the same way but for the OPPOSITE operation: E13 is subtraction
    // only ("this video is all about big friend taking away"), and taking away also has nine
    // formulas (−1..−9, friend-first: −n = +friend − 10), one per friend pair, same as adding.
    hook: "Big Friend Taking Away!",
    subtitle: "−1 to −9",
    sub: "all 9 formulas!",
    // the episode's own autumn park, at its "your turn" quiz beat — warm and legible, no fixed
    // prop in this particular world to collide with the text column
    world: "trainB",
    palette: BB_RIGS.train,
    // 13 — the episode's own final "your turn" example (13 − 9 = 4): a two-digit value (a tens
    // bead AND a near-full ones column) reads as a fuller, more active abacus at thumbnail size
    // than a single small digit would, which matters more here than for E12's adding thumbnail —
    // a lone small number does not itself suggest "taking away" the way it can suggest "adding
    // up to", so the busier board is doing more of the work.
    rods: [3, 1, 0, 0, 0],
    rodCount: 5,
    ink: "#FFF6E8",
    band: "#D9791E",
    buddies: { cast: ["little", "big"], costume: "conductor", props: { little: "binoculars" }, piece: "engine" },
  },
  e14: {
    ep: 14,
    // Same "easiest-looking round earns the click" rule as E10's own thumbnail: round one's own
    // sum (37 + 4), not a scarier two-digit example — a viewer who can do this one taps in.
    hook: "Beat the Beads Again!",
    subtitle: "37 + 4 = ?",
    sub: "adding + taking away, mixed!",
    // the main arcade stage, not the recap/close worlds — same reasoning E10's own note gives
    // for `buzzerstage` over `confettifinale`: legible, no fixed prop to collide with the text.
    world: "fairB",
    palette: BB_RIGS.fair,
    rods: [4, 0, 0, 0, 0],
    rodCount: 5,
    ink: "#C6FF3D",
    band: "#FF3DA6",
    buddies: { cast: ["little", "big"], costume: "ticket", props: { little: "binoculars" }, piece: "bear" },
    // E10's own recall-game precedent: the wheel is the more honest "what is this video" image
    // than the abacus for a recap episode.
    hero: "wheel",
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
      {spec.subtitle && (
        <span
          style={{
            fontFamily: KID_FONT,
            fontWeight: 700,
            // Portrait's shared column `gap` (48px) is tuned for a two-line title+tag pair, and it
            // is shared by every episode's thumbnail — widening it for E08 would nudge E01-E07's
            // already-approved 9:16 thumbnails too. Negative margins pull just the SUBTITLE's own
            // air in, leaving that constant, and everything else it touches, untouched.
            margin: portrait ? "-24px 0" : 0,
            fontSize: (portrait ? 92 : 62) * s,
            color: spec.subtitleInk ?? spec.ink,
            textAlign: "center",
            opacity: spec.subtitleInk ? 1 : 0.85,
          }}
        >
          {spec.subtitle}
        </span>
      )}
      <span
        style={{
          fontFamily: KID_FONT,
          fontWeight: 700,
          fontSize: (spec.subSize ?? 48) * s,
          color: "#FFFFFF",
          background: spec.band,
          borderRadius: 999,
          padding: `${8 * s}px ${26 * s}px`,
          letterSpacing: 0.5,
        }}
      >
        {spec.sub}
      </span>
      {spec.formula && (
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2 * s,
            background: "#FFFFFF",
            borderRadius: 30 * s,
            padding: `${10 * s}px ${34 * s}px ${12 * s}px`,
            boxShadow: `0 ${8 * s}px 0 rgba(26,12,31,0.28)`,
            fontFamily: KID_FONT,
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: (portrait ? 34 : 26) * s, color: spec.band, letterSpacing: 2 * s }}>{spec.formulaTitle ?? "SMALL FRIEND"}</span>
          <span style={{ fontSize: (portrait ? 84 : 66) * s, color: "#3B2A14", lineHeight: 1.05 }}>{spec.formula}</span>
        </span>
      )}
    </div>
  );

  const instrument =
    spec.hero === "wheel" ? (
      // THE WHEEL, not the abacus — E10 is a recall GAME, not a lesson, and every other
      // thumbnail in the series already shows the abacus. Drawn in a LOCAL canvas the same
      // 615px width as the abacus's own (so the column-width math elsewhere needs no change)
      // and scaled through the SVG the same way, never a CSS transform, for the reason the
      // comment above already gives.
      <svg
        width={615 * (portrait ? 1.48 : ABACUS_S)}
        height={600 * (portrait ? 1.48 : ABACUS_S)}
        viewBox="0 0 615 600"
        style={{ overflow: "visible" }}
      >
        {/* landOn=0 is "+1" — the same sum the hook already names. Frame 0, landed, no
            mid-spin state: a thumbnail is one still frame, and it has to be the settled one.
            Portrait: moved up (y 330 -> 245) — `overflow: visible` above means nothing actually
            clips, it just reads as floating too low in the tall 9:16 canvas otherwise. 16:9:
            bigger (radius 170 -> 205) — the OUTPUT box stays the same size (615*ABACUS_S), so the
            column-width math the headline text uses is untouched; only the wheel drawn inside
            that same box gets larger. */}
        {spec.ep === 14 ? (
          // E14's OWN wheel — now all 18 Big Friend formulas (+1..+9, −1..−9 interleaved), not
          // E10's TV-studio one. "+4" — round one's own sum, matching the hook — sits at index 6
          // in that interleaved order (+1,−1,+2,−2,+3,−3,+4,...), not index 0.
          <WheelE14
            x={307.5}
            y={portrait ? 245 : 330}
            radius={portrait ? 170 : 205}
            landOn={6}
            progress={1}
            frame={0}
            fps={30}
            landed
            idle={false}
            landProgress={0}
          />
        ) : (
          <Wheel
            x={307.5}
            y={portrait ? 245 : 330}
            radius={portrait ? 170 : 205}
            landOn={0}
            progress={1}
            frame={0}
            fps={30}
            landed
            idle={false}
            landProgress={0}
          />
        )}
      </svg>
    ) : (
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
            ? (spec.formula ? `${80 * s}px ${40 * s}px ${480 * s}px` : `${120 * s}px ${40 * s}px ${360 * s}px`)
            : "0 64px 150px 72px",
        }}
      >
        {headline}
        {instrument}
      </AbsoluteFill>
      {/* THE CHARACTER, in the empty band below the instrument. Cheering, because a thumbnail is an
          invitation and the pose has to read at 210px — an arms-up silhouette does, a subtle one
          does not. Drawn before the badge so the badge always wins if they ever meet. */}
      {spec.buddies && (
        <svg width="100%" height="100%" viewBox={portrait ? "0 0 1080 1920" : "0 0 1280 720"} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {(() => {
            const n = spec.buddies!.cast.length;
            const roles0 = spec.buddies!.cast;
            // smaller + lower than before: the number crowns made the cast taller, and a crown tip must not poke into the abacus above
            const sc = portrait ? (roles0.includes("big") ? 0.92 : 1.1) : 0.7;
            // name tags keep a fixed pixel size, so the pair needs a fixed centre spacing (~165 px) whatever the scale
            const gap = portrait ? 150 : 165 / sc;
            const cx = portrait ? 720 : 1030;
            const y = portrait ? 1810 : 708;
            const roles = spec.buddies!.cast;
            const d = spec.buddies!.dino;
            return (
              <>
                {d && <Dino kind={d} x={portrait ? (spec.formula ? 330 : 200) : 720} y={portrait ? (spec.formula ? 1790 : 1770) : 700} scale={portrait ? (spec.formula ? 1.2 : 1.45) : 0.7} mood="cheer" frame={4} fps={30} facing={1} seed={2} hatch={1} />}
                {spec.buddies!.piece && <Critter kind={spec.buddies!.piece} x={portrait ? (spec.formula && spec.buddies!.piece !== "cloudy" ? 300 : 200) : 720} y={portrait ? (spec.formula && spec.buddies!.piece !== "cloudy" ? 1795 : 1770) : 700} scale={portrait ? (spec.formula && spec.buddies!.piece !== "cloudy" ? 1.0 : 1.3) : 0.75} mood="cheer" frame={4} fps={30} facing={1} seed={2} />}
                {roles.map((r, i) => (
                  <Otter key={r} x={cx + (i - (n - 1) / 2) * gap * sc} y={y} scale={sc} role={r} mood="present" costume={spec.buddies!.costume} prop={spec.buddies!.props?.[r]} progress={1} frame={4} fps={30} phase={i * 0.7} famScale={sc} tag />
                ))}
              </>
            );
          })()}
        </svg>
      )}
      {spec.character && (
        <svg
          width="100%"
          height="100%"
          viewBox={portrait ? "0 0 1080 1920" : "0 0 1280 720"}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {/* FRAME 0, not mid-animation. The cheer bounces on |sin|, so any other frame lifts the
              monkey off the branch it is standing on and leaves it hovering. A thumbnail is one
              frame — it has to be the settled one. */}
          {spec.character === "monkey" ? (
            <Monkey
              x={portrait ? 812 : 1012}
              y={portrait ? 1596 : 664}
              scale={portrait ? 1.45 : 1.0}
              mood="cheer"
              progress={1}
              frame={0}
              fps={30}
              branch
            />
          ) : spec.character === "puppies" ? (
            /* THE PAIR, sized off the ABACUS BOTTOM exactly as E07's rabbit had to be.
             * The panel is 487 tall, so it draws 312px in 16:9 (x0.64) about a centre of 302 ->
             * bottom 458, and ~721px in 9:16 (x1.48) -> bottom ~1410. The pair is 212 local units
             * tall and 178 half-wide, and the scale is whatever fits under that ceiling.
             * CENTRED in 9:16, not pushed right: two puppies at 178 half-width would run 17px off
             * a 1080 frame at the single-character x of 812. */
            (() => {
              const pv = portrait
                ? { x: 540, y: 1742, s: 1.55 }
                : { x: 1012, y: 668, s: 0.98 };
              const gap = 86 * pv.s;
              return (
                <>
                  <Puppy x={pv.x - gap} y={pv.y} scale={pv.s} mood="cheer" coat="cream"
                         facing={1} progress={1} frame={0} fps={30} />
                  <Puppy x={pv.x + gap} y={pv.y} scale={pv.s} mood="cheer" coat="cocoa"
                         facing={-1} phase={0.7} progress={1} frame={0} fps={30} />
                </>
              );
            })()
          ) : spec.character === "seagulls" ? (
            /* Same treatment as the puppies: sized off the abacus bottom, gap scaled with them.
             * `cheer` reads as a person's arms thrown straight up, not a bird's — a gull doesn't
             * have hands to raise, and on this body shape the pose looked like a mistake rather
             * than excitement. `wave` (one wing lifted, not both) is the same "alive, greeting"
             * read without the double-raised-arm silhouette. */
            (() => {
              const gv = portrait
                ? { x: 540, y: 1742, s: 1.6 }
                : { x: 1012, y: 668, s: 1.0 };
              const gap = 82 * gv.s;
              return (
                <>
                  <Seagull x={gv.x - gap} y={gv.y} scale={gv.s} mood="wave" marking="grey"
                           facing={1} progress={1} frame={0} fps={30} />
                  <Seagull x={gv.x + gap} y={gv.y} scale={gv.s} mood="wave" marking="cream"
                           facing={-1} phase={0.6} progress={1} frame={0} fps={30} />
                </>
              );
            })()
          ) : spec.character === "foxes" ? (
            /* Same treatment again — sized off the abacus bottom, gap scaled with them. One
             * `buzz`es in (this episode's own gag, and the one pose worth showing off here) and
             * the other `wave`s — both low-reach poses, same lesson `wave` already taught the
             * seagulls: `cheer` needs the y-nudge the full episode's own placement built in, and
             * the thumbnail's fixed anchor never got that nudge, so neither fox raises both arms
             * here. */
            (() => {
              const fv = portrait
                ? { x: 540, y: 1742, s: 1.6 }
                : { x: 1012, y: 668, s: 1.0 };
              const gap = 86 * fv.s;
              return (
                <>
                  <Fox x={fv.x - gap} y={fv.y} scale={fv.s} mood="buzz" marking="amber"
                       facing={1} progress={1} frame={0} fps={30} />
                  <Fox x={fv.x + gap} y={fv.y} scale={fv.s} mood="wave" marking="silver"
                       facing={-1} phase={0.6} progress={1} frame={0} fps={30} />
                </>
              );
            })()
          ) : spec.character === "elephants" ? (
            /* Same treatment again — sized off the abacus bottom, gap scaled with them. Elephants
             * are the widest body shape in the series so far (wider than the fox/puppy/seagull
             * pair), so they get a bigger gap and a smaller scale than those three to keep both
             * clear of the frame edges — one `cheer` (trunk up, trumpeting) and one `idea` (the
             * signature "remembered the trick" spark), so the pair reads as two distinct animals
             * rather than a mirrored copy. */
            (() => {
              const ev = portrait
                ? { x: 540, y: 1760, s: 1.05 }
                : { x: 1012, y: 672, s: 0.66 };
              const gap = 132 * ev.s;
              return (
                <>
                  <Elephant x={ev.x - gap} y={ev.y} scale={ev.s} mood="cheer" facing={1} progress={1} frame={0} fps={30} />
                  <Elephant x={ev.x + gap} y={ev.y} scale={ev.s} mood="idea" facing={-1} progress={1} frame={0} fps={30} />
                </>
              );
            })()
          ) : spec.character === "toucans" ? (
            /* Same pair treatment. Both `highfive` — beaks touching is E12's signature interaction
             * (every friend pair confirmed on screen), and it reads as "friends" before any text is
             * read. Spacing matches the episode's own pair gap (half-gap 85 local units). */
            (() => {
              const tv = portrait
                ? { x: 660, y: 1760, s: 1.5 } // right of centre — the LESSON badge owns bottom-left
                : { x: 1012, y: 672, s: 0.95 };
              const half = 85 * tv.s;
              return (
                <>
                  <Toucan x={tv.x - half} y={tv.y} scale={tv.s} mood="highfive" marking="sunrise"
                          facing={1} progress={1} frame={0} fps={30} />
                  <Toucan x={tv.x + half} y={tv.y} scale={tv.s} mood="highfive" marking="citrus"
                          facing={-1} phase={0.4} progress={1} frame={0} fps={30} />
                </>
              );
            })()
          ) : spec.character === "squirrels" ? (
            /* Same pair treatment again. `give` — the acorn hand-off — is E13's signature
             * interaction (every friend trade in the episode plays this pose), the same role
             * `highfive` plays for E12's toucans: it reads as "these two are trading something"
             * before any text is read, and it is a POSE unique to this episode rather than a
             * generic wave/cheer any character could do. Spacing matches the episode's own pair
             * gap (half-gap ~95 local units, `gap: 190*scale` in e13's own `squirrelPairAt`). */
            (() => {
              const sv = portrait
                ? { x: 660, y: 1760, s: 1.5 } // right of centre — the LESSON badge owns bottom-left
                : { x: 1012, y: 672, s: 0.95 };
              const half = 90 * sv.s;
              return (
                <>
                  <Squirrel x={sv.x - half} y={sv.y} scale={sv.s} mood="give" marking="rust"
                            facing={1} progress={1} frame={0} fps={30} />
                  <Squirrel x={sv.x + half} y={sv.y} scale={sv.s} mood="give" marking="cocoa"
                            facing={-1} phase={0.4} progress={1} frame={0} fps={30} />
                </>
              );
            })()
          ) : spec.character === "hedgehogs" ? (
            /* Same pair treatment again — sized off the abacus bottom, gap scaled with them. One
             * `buzz`es in (this episode's own buzz-in gag, carried over from E10's foxes) and the
             * other `wave`s, same reasoning E10's own thumbnail note gives: both low-reach poses,
             * neither needs the full episode's `cheer` y-nudge the thumbnail's fixed anchor never
             * got. */
            (() => {
              const hv = portrait
                ? { x: 540, y: 1742, s: 1.6 }
                : { x: 1012, y: 668, s: 1.0 };
              const gap = 84 * hv.s;
              return (
                <>
                  <Hedgehog x={hv.x - gap} y={hv.y} scale={hv.s} mood="buzz" marking="amber"
                            facing={1} progress={1} frame={0} fps={30} />
                  <Hedgehog x={hv.x + gap} y={hv.y} scale={hv.s} mood="wave" marking="slate"
                            facing={-1} phase={0.6} progress={1} frame={0} fps={30} />
                </>
              );
            })()
          ) : spec.character === "rabbit" ? (
            /* PLACED OFF THE ABACUS BOTTOM, not off the monkey's numbers.
             *
             * The rabbit is TALL — its box is 292 above the anchor against the monkey's much
             * shorter reach — so the shared character position put its ears and hat straight
             * through the beads in both cuts. The panel is 437 + 2x25 = 487 tall, so it draws
             * 312px in 16:9 (x0.64) about a centre of 302 -> bottom 458, and 721px in 9:16
             * (x1.48) -> bottom about 1410. These two numbers are the rabbit's ceiling; the
             * scale is then whatever fits between that ceiling and the frame edge, not a
             * number chosen for how big the rabbit looks. */
            <Rabbit
              x={portrait ? 812 : 1012}
              y={portrait ? 1800 : 684}
              scale={portrait ? 1.24 : 0.72}
              mood="cheer"
              progress={1}
              frame={0}
              fps={30}
              facing={1}
            />
          ) : (
            <Astro
              x={portrait ? 812 : 1012}
              y={portrait ? 1560 : 636}
              scale={portrait ? 1.5 : 1.05}
              mood="cheer"
              progress={1}
              frame={0}
              fps={30}
            />
          )}
        </svg>
      )}

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
export const ThumbE07: React.FC = () => <Thumbnail spec={THUMBS.e07} />;
export const ThumbE08: React.FC = () => <Thumbnail spec={THUMBS.e08} />;
export const ThumbE09: React.FC = () => <Thumbnail spec={THUMBS.e09} />;
export const ThumbE10: React.FC = () => <Thumbnail spec={THUMBS.e10} />;
export const ThumbE11: React.FC = () => <Thumbnail spec={THUMBS.e11} />;
export const ThumbE01V: React.FC = () => <Thumbnail spec={THUMBS.e01} portrait />;
export const ThumbE02V: React.FC = () => <Thumbnail spec={THUMBS.e02} portrait />;
export const ThumbE03V: React.FC = () => <Thumbnail spec={THUMBS.e03} portrait />;
export const ThumbE04V: React.FC = () => <Thumbnail spec={THUMBS.e04} portrait />;
export const ThumbE05V: React.FC = () => <Thumbnail spec={THUMBS.e05} portrait />;
export const ThumbE06V: React.FC = () => <Thumbnail spec={THUMBS.e06} portrait />;
export const ThumbE07V: React.FC = () => <Thumbnail spec={THUMBS.e07} portrait />;
export const ThumbE08V: React.FC = () => <Thumbnail spec={THUMBS.e08} portrait />;
export const ThumbE09V: React.FC = () => <Thumbnail spec={THUMBS.e09} portrait />;
export const ThumbE10V: React.FC = () => <Thumbnail spec={THUMBS.e10} portrait />;
export const ThumbE11V: React.FC = () => <Thumbnail spec={THUMBS.e11} portrait />;
export const ThumbE12: React.FC = () => <Thumbnail spec={THUMBS.e12} />;
export const ThumbE12V: React.FC = () => <Thumbnail spec={THUMBS.e12} portrait />;
export const ThumbE13: React.FC = () => <Thumbnail spec={THUMBS.e13} />;
export const ThumbE13V: React.FC = () => <Thumbnail spec={THUMBS.e13} portrait />;
export const ThumbE14: React.FC = () => <Thumbnail spec={THUMBS.e14} />;
export const ThumbE14V: React.FC = () => <Thumbnail spec={THUMBS.e14} portrait />;
