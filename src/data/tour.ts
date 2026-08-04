// The app's OWN tour tooltips, extracted verbatim from
// iOS/Abacus/Resources/Localizable.xcstrings (keys free_mode_highlight_*), which
// Strings.freeModeHighlightSteps feeds into the Free Mode spotlight overlay.
//
// Using these instead of wording of our own means the video says exactly what the child
// reads when they open Free Mode. It also settles the colour question: these hexes are
// the app's, not invented.
//
// GENERATED — re-extract rather than hand-editing.

export type Seg = { kind: "plain" | "bold" | "strong"; text: string; color?: string };

export const TOUR: Seg[][] = [
  // frame_of_abacus
  [{ kind: "plain", text: "This is " }, { kind: "strong", text: "Frame", color: "#FF5722" }, { kind: "plain", text: " of Abacus" }],
  // rods_of_abacus
  [{ kind: "plain", text: "This all are " }, { kind: "strong", text: "Rods", color: "#0000EE" }, { kind: "plain", text: " or " }, { kind: "strong", text: "Column", color: "#0000EE" }, { kind: "plain", text: " of Abacus" }],
  // beam_of_abacus
  [{ kind: "plain", text: "This is " }, { kind: "strong", text: "Bar", color: "#6200EA" }, { kind: "plain", text: " or " }, { kind: "strong", text: "Beam", color: "#6200EA" }, { kind: "plain", text: " of Abacus" }],
  // top_sections
  [{ kind: "strong", text: "Top section", color: "#E91E63" }, { kind: "plain", text: " for upper beads" }],
  // bottom_sections
  [{ kind: "strong", text: "Bottom section", color: "#9C27B0" }, { kind: "plain", text: " for lower beads" }],
  // top_beads
  [{ kind: "plain", text: "This all are " }, { kind: "strong", text: "Upper Beads", color: "#E91E63" }, { kind: "plain", text: " of Abacus" }],
  // bottom_beads
  [{ kind: "plain", text: "This all are " }, { kind: "strong", text: "Lower Beads", color: "#9C27B0" }, { kind: "plain", text: " of Abacus" }],
  // unit_place
  [{ kind: "strong", text: "Unit's Place", color: "#0000EE" }, { kind: "plain", text: " " }, { kind: "bold", text: "(Ones column)" }, { kind: "plain", text: "\nof Abacus" }],
  // first_column_value
  [{ kind: "bold", text: "On 1st ROD" }, { kind: "plain", text: " " }, { kind: "strong", text: "(Ones column)", color: "#0000EE" }, { kind: "plain", text: "\neach lower bead " }, { kind: "strong", text: "value is 1", color: "#D81B60" }, { kind: "plain", text: "\nand the upper bead " }, { kind: "strong", text: "value is 5", color: "#388E3C" }],
  // second_column_value
  [{ kind: "bold", text: "On 2nd ROD" }, { kind: "plain", text: " " }, { kind: "strong", text: "(Tens column)", color: "#0000EE" }, { kind: "plain", text: "\neach lower bead " }, { kind: "strong", text: "value is 10", color: "#D81B60" }, { kind: "plain", text: "\nand the upper bead " }, { kind: "strong", text: "value is 50", color: "#388E3C" }],
  // third_column_value
  [{ kind: "bold", text: "On 3rd ROD" }, { kind: "plain", text: " " }, { kind: "strong", text: "(Hundreds column)", color: "#0000EE" }, { kind: "plain", text: "\neach lower bead " }, { kind: "strong", text: "value is 100", color: "#D81B60" }, { kind: "plain", text: "\nand the upper bead " }, { kind: "strong", text: "value is 500,", color: "#388E3C" }, { kind: "plain", text: "\nso on.." }],
  // one_column_represent
  [{ kind: "bold", text: "One Column" }, { kind: "plain", text: "\ncan show any number from " }, { kind: "strong", text: "0 to 9", color: "#EE0000" }],
  // two_column_represent
  [{ kind: "bold", text: "Two Column" }, { kind: "plain", text: "\ncan show any numbers from " }, { kind: "strong", text: "0 to 99", color: "#EE0000" }],
  // three_column_represent
  [{ kind: "bold", text: "Three Column" }, { kind: "plain", text: "\ncan show any numbers from " }, { kind: "strong", text: "0 to 999", color: "#EE0000" }],
  // addition_thumb
  [{ kind: "bold", text: "For Addition" }, { kind: "plain", text: "\nalways use your " }, { kind: "strong", text: "thumb", color: "#D81B60" }, { kind: "plain", text: "\nto " }, { kind: "strong", text: "move lower beads to upward", color: "#0000EE" }],
  // addition_finger
  [{ kind: "bold", text: "For Addition" }, { kind: "plain", text: "\nalways use your " }, { kind: "strong", text: "index finger", color: "#D81B60" }, { kind: "plain", text: "\nto " }, { kind: "strong", text: "move upper bead to downward", color: "#0000EE" }],
  // subtraction_finger
  [{ kind: "bold", text: "For Subtraction" }, { kind: "plain", text: "\nalways use your " }, { kind: "strong", text: "index finger", color: "#D81B60" }, { kind: "plain", text: "\nto " }, { kind: "strong", text: "move lower beads to downward", color: "#0000EE" }],
  // subtraction_thumb
  [{ kind: "bold", text: "For Subtraction" }, { kind: "plain", text: "\nalways use your " }, { kind: "strong", text: "thumb", color: "#D81B60" }, { kind: "plain", text: "\nto " }, { kind: "strong", text: "move upper bead to upward", color: "#0000EE" }],
];

/** Accent colours the app uses inside its tooltips. */
export const TOUR_INK = {
  frame: "#FF5722",
  rods: "#0000EE",
  beam: "#6200EA",
  topSection: "#E91E63",
  bottomSection: "#9C27B0",
  lowerValue: "#D81B60",
  upperValue: "#388E3C",
  range: "#EE0000",
} as const;

/**
 * SHORT forms, for video.
 *
 * The app's own wording is written for a tooltip a child can dwell on ("This all are Rods
 * or Column of Abacus"). On screen for two seconds next to a caption saying the same
 * thing, that is too much text to read. These keep the app's TERMS and its colours — so
 * the vocabulary still matches what the child meets in Free Mode — and drop the framing
 * words. The verbatim originals stay in TOUR above for reference.
 */
export const TOUR_SHORT: Seg[][] = [
  // 0 frame
  [{ kind: "strong", text: "Frame", color: TOUR_INK.frame }],
  // 1 rods
  [{ kind: "strong", text: "Rods", color: TOUR_INK.rods }, { kind: "plain", text: " or " }, { kind: "strong", text: "Column", color: TOUR_INK.rods }],
  // 2 beam
  [{ kind: "strong", text: "Beam", color: TOUR_INK.beam }, { kind: "plain", text: " or " }, { kind: "strong", text: "Bar", color: TOUR_INK.beam }],
  // 3 top section
  [{ kind: "strong", text: "Top section", color: TOUR_INK.topSection }, { kind: "plain", text: "\nupper beads" }],
  // 4 bottom section
  [{ kind: "strong", text: "Bottom section", color: TOUR_INK.bottomSection }, { kind: "plain", text: "\nlower beads" }],
  // 5 upper beads
  [{ kind: "strong", text: "Upper Beads", color: TOUR_INK.topSection }, { kind: "plain", text: "\none on every rod" }],
  // 6 lower beads
  [{ kind: "strong", text: "Lower Beads", color: TOUR_INK.bottomSection }, { kind: "plain", text: "\nfour on every rod" }],
  // 7 unit's place
  [{ kind: "strong", text: "Unit's Place", color: TOUR_INK.rods }, { kind: "bold", text: "\n(Ones rod)" }],
  // 8 1st rod values
  [{ kind: "bold", text: "1st ROD " }, { kind: "strong", text: "(Ones)", color: TOUR_INK.rods }, { kind: "plain", text: "\nlower " }, { kind: "strong", text: "1", color: TOUR_INK.lowerValue }, { kind: "plain", text: "  ·  upper " }, { kind: "strong", text: "5", color: TOUR_INK.upperValue }],
  // 9 2nd rod values
  [{ kind: "bold", text: "2nd ROD " }, { kind: "strong", text: "(Tens)", color: TOUR_INK.rods }, { kind: "plain", text: "\nlower " }, { kind: "strong", text: "10", color: TOUR_INK.lowerValue }, { kind: "plain", text: "  ·  upper " }, { kind: "strong", text: "50", color: TOUR_INK.upperValue }],
  // 10 3rd rod values
  [{ kind: "bold", text: "3rd ROD " }, { kind: "strong", text: "(Hundreds)", color: TOUR_INK.rods }, { kind: "plain", text: "\nlower " }, { kind: "strong", text: "100", color: TOUR_INK.lowerValue }, { kind: "plain", text: "  ·  upper " }, { kind: "strong", text: "500", color: TOUR_INK.upperValue }],
  // 11 one column
  [{ kind: "bold", text: "One rod\n" }, { kind: "strong", text: "0 to 9", color: TOUR_INK.range }],
  // 12 two columns
  [{ kind: "bold", text: "Two rods\n" }, { kind: "strong", text: "0 to 99", color: TOUR_INK.range }],
  // 13 three columns
  [{ kind: "bold", text: "Three rods\n" }, { kind: "strong", text: "0 to 999", color: TOUR_INK.range }],
  // 14 addition, thumb, lower up
  [{ kind: "bold", text: "Add lower\n" }, { kind: "strong", text: "thumb", color: TOUR_INK.lowerValue }, { kind: "plain", text: " · " }, { kind: "strong", text: "up", color: TOUR_INK.rods }],
  // 15 addition, index, upper down
  [{ kind: "bold", text: "Add upper\n" }, { kind: "strong", text: "index finger", color: TOUR_INK.lowerValue }, { kind: "plain", text: " · " }, { kind: "strong", text: "down", color: TOUR_INK.rods }],
  // 16 subtraction, index, lower down
  [{ kind: "bold", text: "Take lower\n" }, { kind: "strong", text: "index finger", color: TOUR_INK.lowerValue }, { kind: "plain", text: " · " }, { kind: "strong", text: "down", color: TOUR_INK.rods }],
  // 17 subtraction, thumb, upper up
  [{ kind: "bold", text: "Take upper\n" }, { kind: "strong", text: "thumb", color: TOUR_INK.lowerValue }, { kind: "plain", text: " · " }, { kind: "strong", text: "up", color: TOUR_INK.rods }],
];
