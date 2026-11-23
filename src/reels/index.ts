// The registry: one entry per video. Adding an episode is one line here.
// Composition ids use HYPHENS — Remotion forbids underscores.
import React from "react";
import { E01MeetTheAbacus, E01_DURATION } from "./e01_meet_the_abacus";
import { E02Numbers0To9, E02_DURATION } from "./e02_numbers_0_to_9";
import { E04BiggerNumbers, E04_DURATION } from "./e04_bigger_numbers";
import { E03AddingTwoNumbers, E03_DURATION } from "./e03_adding_two_numbers";
import {
  ThumbE01, ThumbE02, ThumbE03, ThumbE04, ThumbE05, ThumbE06, ThumbE07, ThumbE08, ThumbE09, ThumbE10, ThumbE11,
  ThumbE01V, ThumbE02V, ThumbE03V, ThumbE04V, ThumbE05V, ThumbE06V, ThumbE07V, ThumbE08V, ThumbE09V, ThumbE10V, ThumbE11V, ThumbE12, ThumbE12V,
  ThumbE13, ThumbE13V,
  ThumbE14, ThumbE14V,
} from "./thumbnails";
import { E05TakingAway, E05_DURATION } from "./e05_taking_away";
import { E06TwoRods, E06_DURATION } from "./e06_two_rods";
import { E08AllSmallFriends, E08_DURATION } from "./e08_all_small_friends";
import { E08DinoValley, E08_DINO_DURATION } from "./e08_dino_valley";
import { E09SnowMountain, E09_SNOW_DURATION } from "./e09_snow_mountain";
import { E10GalaxyQuiz, E10_GALAXY_DURATION } from "./e10_galaxy_quiz";
import { E07CloudCastle, E07_CLOUD_DURATION } from "./e07_cloud_castle";
import { E11PirateIsland, E11_PIRATE_DURATION } from "./e11_pirate_island";
import { E12FarmMarket, E12_FARM_DURATION } from "./e12_farm_market";
import { E13TrainValley, E13_TRAIN_DURATION } from "./e13_train_valley";
import { E14StarlightFunfair, E14_FAIR_DURATION } from "./e14_starlight_funfair";
import { E15FamilyPlus, E15_DURATION } from "./e15_family_plus";
import { ShortMathHeroes, MATH_HEROES_DURATION } from "./short_math_heroes";
import { ShortMathHeroes2, MATH_HEROES_2_DURATION } from "./short_math_heroes_2";
import { ShortMathHeroesBF1, BF1_DURATION } from "./short_math_heroes_bf1";
import { ShortMathHeroesBF2, BF2_DURATION } from "./short_math_heroes_bf2";
import { ShortMathHeroesBF3, BF3_DURATION } from "./short_math_heroes_bf3";
import { ShortMathHeroesBF4, BF4_DURATION } from "./short_math_heroes_bf4";
import { ShortMathHeroesBF5, BF5_DURATION } from "./short_math_heroes_bf5";
import { ShortMathHeroesBF6, BF6_DURATION } from "./short_math_heroes_bf6";
import { ShortBeadsValues, BEADS_DURATION } from "./short_beads_values";
import { ShortFingerTechnique, FINGER_DURATION } from "./short_finger_technique";
import { ShortCounting1To10, COUNTING_DURATION } from "./short_counting_1_10";
import { ShortAddingRod1, ADDING_ROD1_DURATION } from "./short_adding_rod1";
import { ShortSubtractingRod1, SUBTRACTING_ROD1_DURATION } from "./short_subtracting_rod1";
import { ShortGameBalloonPop, GAME_BALLOON_POP_DURATION } from "./short_game_balloon_pop";
import { ShortGameCrossMath, GAME_CROSS_MATH_DURATION } from "./short_game_cross_math";
import { ShortGameSpeedCompare, GAME_SPEED_COMPARE_DURATION } from "./short_game_speed_compare";
import { ShortGameTrueOrFalse, GAME_TRUE_OR_FALSE_DURATION } from "./short_game_true_or_false";
import { ShortGameMathBingo, GAME_MATH_BINGO_DURATION } from "./short_game_math_bingo";
import { ShortGameMissingSign, GAME_MISSING_SIGN_DURATION } from "./short_game_missing_sign";
import { ShortGameNumberMerge, GAME_NUMBER_MERGE_DURATION } from "./short_game_number_merge";
import { ShortGameClockMaster, GAME_CLOCK_MASTER_DURATION } from "./short_game_clock_master";
import { ShortGameNumberDetective, GAME_NUMBER_DETECTIVE_DURATION } from "./short_game_number_detective";
import { ShortGameTargetNumber, GAME_TARGET_NUMBER_DURATION } from "./short_game_target_number";
import { ShortGameMathPyramid, GAME_MATH_PYRAMID_DURATION } from "./short_game_math_pyramid";
import { ShortGameSudoku, GAME_SUDOKU_DURATION } from "./short_game_sudoku";
import { ShortGameNumberPath, GAME_NUMBER_PATH_DURATION } from "./short_game_number_path";
import { ShortGameMagicSquare, GAME_MAGIC_SQUARE_DURATION } from "./short_game_magic_square";
import { ShortGamePlaceValue, GAME_PLACE_VALUE_DURATION } from "./short_game_place_value";
import { ShortGameNumberSequence, GAME_NUMBER_SEQUENCE_DURATION } from "./short_game_number_sequence";
import { ShortGameCalcudoku, GAME_CALCUDOKU_DURATION } from "./short_game_calcudoku";
import { ShortGameKakuro, GAME_KAKURO_DURATION } from "./short_game_kakuro";
import { ShortGameEquationMatch, GAME_EQUATION_MATCH_DURATION } from "./short_game_equation_match";
import { ShortGameNumberSnake, GAME_NUMBER_SNAKE_DURATION } from "./short_game_number_snake";
import { ZoneTrailer, ZONE_TRAILER_DURATION } from "./zone_trailer";
import {
  ThumbPlaylistFullCourse,
  PLAYLIST_THUMB_W,
  PLAYLIST_THUMB_H,
} from "./thumb_playlist_full_course";
import { W, H } from "../data/tokens";
import { AD_REELS } from "./ads";

export interface ReelEntry {
  id: string;
  component: React.FC;
  durationInFrames: number;
  width?: number;
  height?: number;
}

// Each episode ships twice: 16:9 for YouTube and 4:5 for Facebook and Instagram. The SAME
// component, registered at two sizes — the phrase table, worlds, audio and teaching are
// identical and only the arrangement differs (src/stage/layout.ts). A second reel file per
// aspect would drift the moment either was edited; the phonics series learned that first.
export const REELS: ReelEntry[] = [
  {
    id: "meet-the-abacus",
    component: E01MeetTheAbacus,
    durationInFrames: E01_DURATION,
    width: W,
    height: H,
  },
  {
    id: "meet-the-abacus-4x5",
    component: E01MeetTheAbacus,
    durationInFrames: E01_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "numbers-0-to-9",
    component: E02Numbers0To9,
    durationInFrames: E02_DURATION,
    width: W,
    height: H,
  },
  {
    id: "numbers-0-to-9-4x5",
    component: E02Numbers0To9,
    durationInFrames: E02_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "adding-two-numbers",
    component: E03AddingTwoNumbers,
    durationInFrames: E03_DURATION,
    width: W,
    height: H,
  },
  {
    id: "bigger-numbers",
    component: E04BiggerNumbers,
    durationInFrames: E04_DURATION,
    width: W,
    height: H,
  },
  {
    id: "bigger-numbers-4x5",
    component: E04BiggerNumbers,
    durationInFrames: E04_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "adding-two-numbers-4x5",
    component: E03AddingTwoNumbers,
    durationInFrames: E03_DURATION,
    width: 1080,
    height: 1350,
  },

  {
    id: "taking-away",
    component: E05TakingAway,
    durationInFrames: E05_DURATION,
    width: W,
    height: H,
  },
  {
    id: "taking-away-4x5",
    component: E05TakingAway,
    durationInFrames: E05_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "two-rods",
    component: E06TwoRods,
    durationInFrames: E06_DURATION,
    width: W,
    height: H,
  },
  {
    id: "two-rods-4x5",
    component: E06TwoRods,
    durationInFrames: E06_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "small-friend-intro",
    component: E07CloudCastle,
    durationInFrames: E07_CLOUD_DURATION,
    width: W,
    height: H,
  },
  {
    id: "small-friend-intro-4x5",
    component: E07CloudCastle,
    durationInFrames: E07_CLOUD_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "all-small-friends",
    component: E08DinoValley,
    durationInFrames: E08_DINO_DURATION,
    width: W,
    height: H,
  },
  {
    id: "all-small-friends-dino",
    component: E08DinoValley,
    durationInFrames: E08_DINO_DURATION,
    width: W,
    height: H,
  },
  {
    id: "small-friend-subtract",
    component: E09SnowMountain,
    durationInFrames: E09_SNOW_DURATION,
    width: W,
    height: H,
  },
  {
    id: "small-friend-subtract-4x5",
    component: E09SnowMountain,
    durationInFrames: E09_SNOW_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "all-small-friends-4x5",
    component: E08DinoValley,
    durationInFrames: E08_DINO_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "small-friend-game",
    component: E10GalaxyQuiz,
    durationInFrames: E10_GALAXY_DURATION,
    width: W,
    height: H,
  },
  {
    id: "small-friend-game-4x5",
    component: E10GalaxyQuiz,
    durationInFrames: E10_GALAXY_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "big-friend-intro",
    component: E11PirateIsland,
    durationInFrames: E11_PIRATE_DURATION,
    width: W,
    height: H,
  },
  {
    id: "big-friend-intro-4x5",
    component: E11PirateIsland,
    durationInFrames: E11_PIRATE_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "all-five-big-friends",
    component: E12FarmMarket,
    durationInFrames: E12_FARM_DURATION,
    width: W,
    height: H,
  },
  {
    id: "all-five-big-friends-4x5",
    component: E12FarmMarket,
    durationInFrames: E12_FARM_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "big-friend-taking-away",
    component: E13TrainValley,
    durationInFrames: E13_TRAIN_DURATION,
    width: W,
    height: H,
  },
  {
    id: "big-friend-taking-away-4x5",
    component: E13TrainValley,
    durationInFrames: E13_TRAIN_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "big-friend-recap",
    component: E14StarlightFunfair,
    durationInFrames: E14_FAIR_DURATION,
    width: W,
    height: H,
  },
  {
    id: "big-friend-recap-4x5",
    component: E14StarlightFunfair,
    durationInFrames: E14_FAIR_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "family-plus",
    component: E15FamilyPlus,
    durationInFrames: E15_DURATION,
    width: W,
    height: H,
  },
  {
    id: "family-plus-4x5",
    component: E15FamilyPlus,
    durationInFrames: E15_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "short-math-heroes",
    component: ShortMathHeroes,
    durationInFrames: MATH_HEROES_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-math-heroes-2",
    component: ShortMathHeroes2,
    durationInFrames: MATH_HEROES_2_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-math-heroes-bf1",
    component: ShortMathHeroesBF1,
    durationInFrames: BF1_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-math-heroes-bf2",
    component: ShortMathHeroesBF2,
    durationInFrames: BF2_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-math-heroes-bf3",
    component: ShortMathHeroesBF3,
    durationInFrames: BF3_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-math-heroes-bf4",
    component: ShortMathHeroesBF4,
    durationInFrames: BF4_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-math-heroes-bf5",
    component: ShortMathHeroesBF5,
    durationInFrames: BF5_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-math-heroes-bf6",
    component: ShortMathHeroesBF6,
    durationInFrames: BF6_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-beads-values",
    component: ShortBeadsValues,
    durationInFrames: BEADS_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-finger-technique",
    component: ShortFingerTechnique,
    durationInFrames: FINGER_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-counting-1-10",
    component: ShortCounting1To10,
    durationInFrames: COUNTING_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-adding-rod1",
    component: ShortAddingRod1,
    durationInFrames: ADDING_ROD1_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-subtracting-rod1",
    component: ShortSubtractingRod1,
    durationInFrames: SUBTRACTING_ROD1_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-balloon-pop",
    component: ShortGameBalloonPop,
    durationInFrames: GAME_BALLOON_POP_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-cross-math",
    component: ShortGameCrossMath,
    durationInFrames: GAME_CROSS_MATH_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-speed-compare",
    component: ShortGameSpeedCompare,
    durationInFrames: GAME_SPEED_COMPARE_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-true-or-false",
    component: ShortGameTrueOrFalse,
    durationInFrames: GAME_TRUE_OR_FALSE_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-math-bingo",
    component: ShortGameMathBingo,
    durationInFrames: GAME_MATH_BINGO_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-missing-sign",
    component: ShortGameMissingSign,
    durationInFrames: GAME_MISSING_SIGN_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-number-merge",
    component: ShortGameNumberMerge,
    durationInFrames: GAME_NUMBER_MERGE_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-clock-master",
    component: ShortGameClockMaster,
    durationInFrames: GAME_CLOCK_MASTER_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-number-detective",
    component: ShortGameNumberDetective,
    durationInFrames: GAME_NUMBER_DETECTIVE_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-target-number",
    component: ShortGameTargetNumber,
    durationInFrames: GAME_TARGET_NUMBER_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-math-pyramid",
    component: ShortGameMathPyramid,
    durationInFrames: GAME_MATH_PYRAMID_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-sudoku",
    component: ShortGameSudoku,
    durationInFrames: GAME_SUDOKU_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-number-path",
    component: ShortGameNumberPath,
    durationInFrames: GAME_NUMBER_PATH_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-magic-square",
    component: ShortGameMagicSquare,
    durationInFrames: GAME_MAGIC_SQUARE_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-place-value",
    component: ShortGamePlaceValue,
    durationInFrames: GAME_PLACE_VALUE_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-number-sequence",
    component: ShortGameNumberSequence,
    durationInFrames: GAME_NUMBER_SEQUENCE_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-calcudoku",
    component: ShortGameCalcudoku,
    durationInFrames: GAME_CALCUDOKU_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-kakuro",
    component: ShortGameKakuro,
    durationInFrames: GAME_KAKURO_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-equation-match",
    component: ShortGameEquationMatch,
    durationInFrames: GAME_EQUATION_MATCH_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "short-game-number-snake",
    component: ShortGameNumberSnake,
    durationInFrames: GAME_NUMBER_SNAKE_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e01",
    component: ThumbE01,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e01-9x16",
    component: ThumbE01V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e02",
    component: ThumbE02,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e02-9x16",
    component: ThumbE02V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e03",
    component: ThumbE03,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e03-9x16",
    component: ThumbE03V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e04",
    component: ThumbE04,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e04-9x16",
    component: ThumbE04V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e05",
    component: ThumbE05,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e05-9x16",
    component: ThumbE05V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e06",
    component: ThumbE06,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e06-9x16",
    component: ThumbE06V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e07",
    component: ThumbE07,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e07-9x16",
    component: ThumbE07V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e08",
    component: ThumbE08,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e08-9x16",
    component: ThumbE08V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e09",
    component: ThumbE09,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e09-9x16",
    component: ThumbE09V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e10",
    component: ThumbE10,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e10-9x16",
    component: ThumbE10V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e11",
    component: ThumbE11,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e11-9x16",
    component: ThumbE11V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e12",
    component: ThumbE12,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e12-9x16",
    component: ThumbE12V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e13",
    component: ThumbE13,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e13-9x16",
    component: ThumbE13V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-e14",
    component: ThumbE14,
    durationInFrames: 200,
    width: 1280,
    height: 720,
  },
  {
    id: "thumb-e14-9x16",
    component: ThumbE14V,
    durationInFrames: 200,
    width: 1080,
    height: 1920,
  },
  {
    id: "zone-trailer",
    component: ZoneTrailer,
    durationInFrames: ZONE_TRAILER_DURATION,
    width: 1080,
    height: 1920,
  },
  {
    id: "thumb-playlist-full-course",
    component: ThumbPlaylistFullCourse,
    durationInFrames: 1,
    width: PLAYLIST_THUMB_W,
    height: PLAYLIST_THUMB_H,
  },
  // paid ads, 9:16, silent until the owner's voice-over (src/reels/ads)
  ...AD_REELS,
];
