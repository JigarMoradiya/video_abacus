// THE BEAD BUDDIES — the series' recurring cast (docs/COVE_SERIES_PLAN.md).
//   Pip   (little otter, yellow)  the lower beads, the learner who asks
//   Fifi  (middle otter, coral)   the SMALL FRIEND, the five-helper (star badge)
//   Tenzo (big otter, aqua)       the BIG FRIEND, the ten-helper (crown)
// One drawing everywhere; each world adds a costume (hat, scarf, helmet) on top, never changes the faces or accessories.
export { Otter, OtterFamily, PART_COLOURS, INK, FAMILY_BOX, FAMILY_GAP, OTTER_BOX } from "./Otter";
export type { OtterMood, OtterRole, Costume, OtterProp } from "./Otter";
export const CAST_NAMES = { little: "Pip", middle: "Fifi", big: "Tenzo" } as const;
export { Critter, type CritterKind } from "./Critters";
export { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, PAIR_GAP, OT_K, Twinkles, castFit } from "./Actors";
export type { Actor, Piece } from "./Actors";
