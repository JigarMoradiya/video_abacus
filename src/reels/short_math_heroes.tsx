// MATH HEROES — a standalone 9:16 short-form reel. NOT part of the numbered episode series and
// NOT built on SceneStage: there is no abacus in this content at all, and SceneStage's whole
// design assumes one is always on stage. This composition drives itself directly off the frame,
// the same underlying idea (state is a pure function of frame, never of a mounted Sequence) but
// without the abacus-specific machinery.
//
// THE STORY: Blaze is alone on the rooftop when the alarm sounds. Stuck, he calls for backup —
// "let's call a friend!" — and Spark bursts in (a real hero entry: a slide-in from off-stage
// with speed lines, not just an appearance) to crack it together. Two missions, same trick,
// different numbers — recall, not re-teaching.
//
// Timing from public/audio/short_video_001/short_video_001.phrases.json, aligned from
// docs/reel_math_heroes_lines.txt. 19 phrases, 54.13s, 99% word match.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/math_heroes.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Hero, HeroSpeedLines, HERO_COLORS, type HeroMood } from "../components/heroes/Hero";
import { MathAlarm, type AlarmState } from "../components/heroes/MathAlarm";
import { Celebration } from "../components/heroes/Celebration";
import { HeroHQ } from "../components/heroes/HeroHQ";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Abacus } from "../components/Abacus";
import { BeadArrow } from "../stage/BeadArrow";
import { sectionBand, type AbacusBox } from "../stage/geometry";
import { NoRoomCallout } from "../components/heroes/NoRoomCallout";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { KID_FONT } from "../lib/fonts";
import { ABACUS_INNER_H, FRAME_LW, ROD_PITCH } from "../data/tokens";
import { FormulaList, FORMULA_ONE } from "../components/e07/FormulaList";
import { BrandBadge, PoweredBy } from "../components/Brand";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 54.13;
export const FPS = 30;
export const MATH_HEROES_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

// ---------------------------------------------------------------- the two missions
const MISSION_1 = { a: 3, b: 2, op: "+" as const, answer: 5, friend: 3 };
const MISSION_2 = { a: 4, b: 1, op: "+" as const, answer: 5, friend: 4 };

// The abacus's own box on screen — a single rod, sized and centred to fill the real gap
// between the alarm card and the heroes rather than floating small in the middle of it.
// Scaled back slightly from its max size (0.95 -> 0.85) to buy a clear gap under the alert
// card instead of crowding right up against it.
const ABX_SCALE = 0.85;
const ABX_W = (1 * ROD_PITCH + FRAME_LW * 2) * ABX_SCALE;
const ABX_H = (ABACUS_INNER_H + FRAME_LW * 2) * ABX_SCALE;
const ABX_LEFT = 1080 / 2 - ABX_W / 2;
const ABX_TOP = 1920 * 0.31;
const ABX_BOX: AbacusBox = {
  left: ABX_LEFT,
  top: ABX_TOP,
  w: ABX_W,
  h: ABX_H,
  innerLeft: ABX_LEFT + FRAME_LW * ABX_SCALE,
  innerTop: ABX_TOP + FRAME_LW * ABX_SCALE,
  innerW: 1 * ROD_PITCH * ABX_SCALE,
  scale: ABX_SCALE,
  rodCount: 1,
};

// The formula card sits in the wide open margin beside the rod — there's ~450px clear on
// either side of a single narrow rod, and putting the notation right next to the beads it
// describes reads better than stacking it above or below the whole group.
const FORMULA_CARD_W = FORMULA_ONE.w;
const FORMULA_CARD_H = FORMULA_ONE.h;
const FORMULA_LEFT = ABX_LEFT + ABX_W + 36;
const FORMULA_TOP = ABX_TOP + ABX_H / 2 - FORMULA_CARD_H / 2;

/**
 * The bead move the heroes actually teach — "take away the friend, THEN add five" — as two
 * SEQUENTIAL phases, never blended into one cross-fade. A single interpolate from the stuck
 * number straight to the answer would move the lower beads and the heaven bead at once, which
 * is not the trick being narrated and, worse, is not how the real bead move works: the friend
 * complement has to come off the rod before the five goes on.
 *
 *   resting at the stuck number  →  ARROW primes the subtract (beads still at rest)  →
 *   beads retract to zero        →  heaven bead descends to five  →  resting at the answer
 */
const beadPhaseFor = (frame: number, p: number): { from: number; to: number; settle: number } => {
  const primeIdx = p <= 8 ? 5 : 13; // "___'s friend is ___!"
  const moveIdx = p <= 8 ? 6 : 14; // "Take away ___, then add five!"
  const missionA = p <= 8 ? MISSION_1.a : MISSION_2.a;
  const missionAns = p <= 8 ? MISSION_1.answer : MISSION_2.answer;

  const primeStart = sec(PHRASES[primeIdx].start, FPS);
  const moveStart = sec(PHRASES[moveIdx].start, FPS);
  const moveEnd = sec(PHRASES[moveIdx].end, FPS);
  const subEnd = moveStart + (moveEnd - moveStart) * 0.45; // "take away" gets slightly more than half

  if (frame < primeStart) return { from: missionA, to: missionA, settle: 1 };
  if (frame < moveStart) return { from: missionA, to: 0, settle: 0 };
  if (frame < subEnd) {
    return {
      from: missionA,
      to: 0,
      settle: interpolate(frame, [moveStart, subEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    };
  }
  if (frame < moveEnd) {
    return {
      from: 0,
      to: missionAns,
      settle: interpolate(frame, [subEnd, moveEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    };
  }
  return { from: missionAns, to: missionAns, settle: 1 };
};

// The hook line's own pose beat — Blaze throws a hero pose right as the narrator says "save
// the day!", so the line isn't just heard, it's acted out. Timed to the WORD, not the phrase,
// since p0 covers the whole 4.1s line and "save the day" is only its back half.
const HEROES_SAVE_START = sec(PHRASES[0].words[7].start, FPS); // "save"

// The two reveal moments — where the celebration burst and its chime both fire.
const SOLVE1_START = sec(PHRASES[7].start, FPS);
const SOLVE2_START = sec(PHRASES[15].start, FPS);

// Spark's entry window — starts the instant Blaze says "Let's call a friend!" (p4's own start),
// so the slide is already under way before the line even finishes, and lands partway through
// p5 rather than the instant it begins (a hero does not teleport).
const ENTRY_START = sec(PHRASES[4].start, FPS);
// Lands exactly when p4 ENDS, not some fixed duration later. p4->p5 has a zero-second gap
// (Blaze finishes "a friend!" right as p5's caption and Spark's own line begin), so a slide
// that took 1.8s used to land 0.8s INTO p5 — Spark was still visibly sliding in while the
// caption already showed the words Spark was about to say. Ending it exactly on the
// boundary means both the entry and the call-focus spotlight (also scoped to p4) resolve
// cleanly before the next line arrives, instead of visibly cut off mid-motion.
const ENTRY_END = sec(PHRASES[4].end, FPS);

// The close beat's own store-flow demo — same "search it, open it, tap GET" component every
// episode uses. STORE_FRAMES is deliberately well under the real ~150-frame close window
// (span < the flow's native 136 frames = plays FASTER than real time), so the whole search
// → detail → GET → download beat is done and resting on OPEN well before the narration is,
// rather than crawling through it in slow motion.
const STORE_START = sec(PHRASES[18].start, FPS);
const STORE_FRAMES = 92;

// ---------------------------------------------------------------- SFX cues
// Original sounds for this reel, synthesized by tools/make_math_heroes_sfx.py — a comic-book
// palette (alert whoop, communicator beep, hero whoosh) distinct from every other episode's
// classroom-abacus sound set, not a reuse of anything already in public/audio/sfx/.
type SfxCue = { frame: number; file: string; vol?: number };

const beadMoveFrames = (moveIdx: number) => {
  const moveStart = sec(PHRASES[moveIdx].start, FPS);
  const moveEnd = sec(PHRASES[moveIdx].end, FPS);
  const subEnd = Math.round(moveStart + (moveEnd - moveStart) * 0.45);
  return { moveStart, subEnd };
};
const m1Move = beadMoveFrames(6);
const m2Move = beadMoveFrames(14);

// Volumes sit under the narration's own headroom rather than at it — the first pass (0.7-0.9)
// pushed the mix's overall peak to -0.0 dB wherever a cue landed on top of a loud word, which
// is one clipped sample away from an audible crackle. Scaled down ~35% across the board.
const SFX_CUES: SfxCue[] = [
  // the opening line's own two beats: "gets stuck" stumbles, "save the day" lands the sting
  { frame: sec(PHRASES[0].words[4].start, FPS), file: "intro_stuck.mp3", vol: 0.5 },
  { frame: HEROES_SAVE_START, file: "intro_hero_sting.mp3", vol: 0.55 },
  // the alert notification dropping in, once per mission
  { frame: sec(PHRASES[1].start, FPS), file: "hero_alert.mp3", vol: 0.55 },
  { frame: sec(PHRASES[9].start, FPS), file: "hero_alert.mp3", vol: 0.55 },
  // each mission's own "...and it's stuck!" — the alarm card is already up and pulsing red
  // here, but nothing was SOUNDING stuck. Same stumble sound as the opening line's "gets
  // stuck", landing right on the word, once per mission.
  { frame: sec(PHRASES[2].words[5].start, FPS), file: "intro_stuck.mp3", vol: 0.5 },
  { frame: sec(PHRASES[10].words[5].start, FPS), file: "intro_stuck.mp3", vol: 0.5 },
  // "let's call a friend!" — Blaze calling in mission 1, Spark calling in mission 2
  { frame: sec(PHRASES[4].start, FPS), file: "hero_call.mp3", vol: 0.5 },
  { frame: sec(PHRASES[12].start, FPS), file: "hero_call.mp3", vol: 0.5 },
  // Spark's own hero-entry slide — only happens once, alongside mission 1's call
  { frame: ENTRY_START, file: "hero_entry.mp3", vol: 0.48 },
  // the bead move itself: subtract the friend, then land on five — once per mission
  { frame: m1Move.moveStart, file: "bead_subtract.mp3", vol: 0.45 },
  { frame: m1Move.subEnd, file: "bead_add.mp3", vol: 0.52 },
  { frame: m2Move.moveStart, file: "bead_subtract.mp3", vol: 0.45 },
  { frame: m2Move.subEnd, file: "bead_add.mp3", vol: 0.52 },
  // the reveal, once per mission
  { frame: SOLVE1_START, file: "mission_solved.mp3", vol: 0.58 },
  { frame: SOLVE2_START, file: "mission_solved.mp3", vol: 0.58 },
  // the close beat's icon arriving
  { frame: STORE_START + 4, file: "cta_pop.mp3", vol: 0.45 },
];

// The shared karaoke Caption (word-highlight-as-spoken) instead of a plain static pill —
// every other episode in the series highlights the active word, and a reel with none of that
// reads as broken rather than as a stylistic choice.
const REEL_LAYOUT: Layout = {
  W,
  H,
  portrait: true,
  band: { headlineTop: 0, headlineBottom: 0, stageTop: 0, stageBottom: 0, captionTop: H - 230, captionBottom: H - 90 },
  cardBand: null,
  cardMaxW: W - 80,
  edge: 20,
  captionMaxW: W - 120,
  captionSize: 34,
  propScale: 1,
};
const CAPTION_KEYWORDS = ["friend", "alert", "alarm", "stuck", "solved", "mission", "hero", "heroes"];

export const ShortMathHeroes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  // ---------------------------------------------------------------- alarm state
  const mission = p <= 8 ? MISSION_1 : MISSION_2;
  const alarmVisible = p >= 1 && p <= 17;
  const alarmState: AlarmState = !alarmVisible
    ? "idle"
    : (p >= 1 && p <= 6) || (p >= 9 && p <= 14)
      ? "alert"
      : "solved"; // p7-8 and p15-16, plus the calm p17 tail, all read as solved

  // ---------------------------------------------------------------- the alarm's own entrance
  // A real push notification doesn't fade in where it lives — it drops in from off the top
  // edge of the screen. Each mission's FIRST alert (p1, then p9's "another alert") gets its
  // own slide-down-with-bounce; for the rest of that mission it is already landed and just
  // sits at rest while its border/text update in place.
  const alertEntryFrame = p <= 8 ? sec(PHRASES[1].start, FPS) : sec(PHRASES[9].start, FPS);
  const alertSpring = spring({ frame: frame - alertEntryFrame, fps, config: { damping: 11, mass: 0.7 } });
  const consoleRestY = H * 0.2;
  const consoleY = interpolate(alertSpring, [0, 1], [-260, consoleRestY]);

  // The rod the heroes are actually solving — from the STUCK number to the answer, in the
  // two real sequential steps (see beadPhaseFor), not one blended cross-fade.
  const bead = beadPhaseFor(frame, p);
  const abacusGlow = alarmState === "solved" ? "#1FA855" : alarmState === "alert" ? "#E23B3B" : "transparent";

  // "There's no room to add ___" — a real annotation on the lower beads (a marching-ants
  // box + a callout bubble), not just a subtle dim/bright difference a viewer could miss.
  const noRoomBeat = p === 3 || p === 11;
  const noRoomText = `No room for ${mission.b}!`;

  // ---------------------------------------------------------------- the formula
  // "Take away three, then add five!" is the trick spelled out in words; the series' own
  // notation for it — friend first, then five, same order as the beads actually move — goes
  // up right as that line is said and stays through the reveal, same as every other episode's
  // formula card.
  const formulaVisible = (p >= 6 && p <= 8) || (p >= 14 && p <= 16);
  const formulaArriving = p === 6 || p === 14;
  const formulaLabel = `+${mission.b} = −${mission.friend} +5`;

  // ---------------------------------------------------------------- Spark's entry
  const sparkVisible = frame >= ENTRY_START;
  const entryProgress = Math.max(0, Math.min(1, (frame - ENTRY_START) / (ENTRY_END - ENTRY_START)));
  const sparkLanded = frame >= ENTRY_END;

  // ---------------------------------------------------------------- moods
  // Opening line: Blaze sits through "when a number gets stuck," then throws a hero pose
  // right on the word "save" — the line is ACTED OUT, not just narrated over a static sit.
  const blazeOpeningCheer = p === 0 && frame >= HEROES_SAVE_START;
  const blazeMood: HeroMood =
    blazeOpeningCheer ? "cheer" :
    p === 0 ? "sit" :
    p === 1 || p === 2 ? "point" :
    p === 3 ? "worry" :
    p === 4 ? "call" :
    p === 5 ? "sit" :
    p === 6 ? "point" :
    p === 7 || p === 8 ? "cheer" :
    p === 9 || p === 10 ? "point" :
    p === 11 ? "worry" :
    p === 12 ? "think" :
    p === 13 ? "sit" :
    p === 14 ? "point" :
    p === 15 || p === 16 ? "cheer" :
    "sit";

  const sparkMood: HeroMood =
    !sparkLanded ? "entry" :
    p === 5 ? "point" :
    p === 6 ? "think" :
    p === 7 || p === 8 ? "cheer" :
    p === 9 || p === 10 ? "worry" :
    p === 11 ? "worry" :
    p === 12 ? "call" :
    p === 13 ? "cheer" :
    p === 14 ? "think" :
    p === 15 || p === 16 ? "cheer" :
    "sit";

  const heroY = H * 0.66;
  const blazeX = sparkVisible ? W * 0.32 : W * 0.5;
  const sparkX = W * 0.68;

  // ---------------------------------------------------------------- the call, in focus
  // "Let's call a friend!" used to be just another pose lost among the alarm card, the
  // speed lines and (in mission 2) the other hero standing right next to it. Whoever is
  // actually holding the communicator now gets a spotlight glow behind them, a scale pop,
  // and the other hero dims slightly — the same "state you can read across the room" idea
  // as the alarm's own colour, aimed at a HERO instead of a prop.
  const blazeCalling = blazeMood === "call";
  const sparkCalling = sparkMood === "call";
  const callFocusStart = blazeCalling ? sec(PHRASES[4].start, FPS) : sparkCalling ? sec(PHRASES[12].start, FPS) : 0;
  const callPop = blazeCalling || sparkCalling
    ? spring({ frame: frame - callFocusStart, fps, config: { damping: 9, mass: 0.55 } })
    : 0;
  // Phased off time SINCE THE CALL STARTED, not absolute video time — an absolute clock put
  // each occurrence at whatever random point the sine happened to be at when the call began,
  // so mission 1's blink and mission 2's blink looked like two different effects (one barely
  // pulsed, the other pulsed several times) purely by coincidence of timing. Locked to its
  // own start, both calls now blink the same way: about 2.5 times a second, every time.
  const callElapsed = Math.max(0, (frame - callFocusStart) / fps);
  const callGlowPulse = 0.55 + 0.45 * Math.sin(callElapsed * 15.5);
  const blazeScale = 1.15 + (blazeCalling ? callPop * 0.14 : 0);
  const sparkScale = 1.15 + (sparkCalling ? callPop * 0.14 : 0);
  const blazeDim = sparkCalling ? 1 - callPop * 0.45 : 1;
  const sparkDim = blazeCalling ? 1 - callPop * 0.45 : 1;

  // Blaze's own gesture clock for the opening pose — NOT beatProgress. p0 spans all 4.1s of
  // the line, so beatProgress is already past 0.3 (the gesture's own arm-raise window) by the
  // time "save" is even said; reusing it would make the pose snap fully extended instead of
  // rising with the word. A local 0..1 window from the word's own start fixes that.
  const blazeProgress = blazeOpeningCheer
    ? interpolate(frame, [HEROES_SAVE_START, HEROES_SAVE_START + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : beatProgress;

  // The hook line is the ONE beat that otherwise looks exactly like every alert beat after
  // it — same skyline, same Blaze, nothing happening yet. A slow push-in, gone the instant
  // the alarm actually fires, gives the opening its own camera move instead of sitting as
  // static as the rest of the reel.
  const introZoom = p === 0
    ? interpolate(frame, [0, sec(PHRASES[0].end, FPS)], [1, 1.09], { extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill style={{ background: "#0E1240" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${introZoom})`, transformOrigin: "50% 62%" }}>
        <HeroHQ width={W} height={H} frame={frame} fps={fps} />

        {/* THE TITLE CARD */}
        {p === 0 && (
          <div
            style={{
              position: "absolute",
              top: H * 0.1,
              left: 0,
              width: W,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 92, color: "#FFE156", textShadow: "0 6px 0 rgba(0,0,0,0.4)" }}>
              MATH
            </span>
            <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 92, color: "#FF4D4D", textShadow: "0 6px 0 rgba(0,0,0,0.4)" }}>
              HEROES
            </span>
          </div>
        )}

        {/* Every character/prop below is an SVG <g>, not a standalone element — same reason every
            Fox/Wheel/Seagull render in the other reels sits inside its own <svg> wrapper. Rendering
            a bare <g> straight into a plain HTML container (AbsoluteFill is a div) draws nothing. */}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <radialGradient id="callGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE9B0" stopOpacity={0.85} />
              <stop offset="55%" stopColor="#FFD873" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#FFD873" stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* SPARK's speed lines, behind Spark, only mid-slide */}
          {sparkVisible && !sparkLanded && (
            <HeroSpeedLines x={sparkX} y={heroY} facing={-1} entryProgress={1 - entryProgress} color={HERO_COLORS.spark.cape} />
          )}

          {/* THE CALL SPOTLIGHT — behind whichever hero is on the communicator, so "let's
              call a friend!" reads as a moment instead of getting lost in everything else
              on screen. */}
          {blazeCalling && (
            <circle cx={blazeX} cy={heroY - 60} r={210 * (0.7 + callPop * 0.3)} fill="url(#callGlow)" opacity={callGlowPulse * callPop} />
          )}
          {sparkCalling && (
            <circle cx={sparkX} cy={heroY - 60} r={210 * (0.7 + callPop * 0.3)} fill="url(#callGlow)" opacity={callGlowPulse * callPop} />
          )}

          {/* BLAZE */}
          <g opacity={blazeDim}>
            <Hero
              x={blazeX}
              y={heroY}
              scale={blazeScale}
              mood={blazeMood}
              name="blaze"
              progress={blazeProgress}
              frame={frame}
              fps={fps}
              facing={sparkVisible ? 1 : 1}
            />
          </g>

          {/* THE CELEBRATION — hexagon "bead" confetti, once per reveal. Shaped like the
              app's own beads rather than generic stars, so a win in an abacus story looks
              like ITS win. */}
          <Celebration x={(blazeX + sparkX) / 2} y={heroY - 250} frame={frame} fps={fps} startFrame={SOLVE1_START} />
          <Celebration x={(blazeX + sparkX) / 2} y={heroY - 250} frame={frame} fps={fps} startFrame={SOLVE2_START} />

          {/* SPARK */}
          {sparkVisible && (
            <g opacity={sparkDim}>
              <Hero
                x={sparkX}
                y={heroY}
                scale={sparkScale}
                mood={sparkMood}
                name="spark"
                progress={beatProgress}
                frame={frame}
                fps={fps}
                facing={-1}
                entryProgress={entryProgress}
                entryDistance={380}
              />
            </g>
          )}
        </svg>
      </div>

      {/* THE ALARM — a real push notification, dropped in from off the top edge rather than
          fading in wherever it happens to sit. Its own HTML overlay (not SVG) so it can use
          a real box-shadow/glow, the way an actual OS banner does. */}
      {alarmVisible && (
        <MathAlarm
          y={consoleY}
          width={700}
          a={mission.a}
          b={mission.b}
          op={mission.op}
          answer={mission.answer}
          state={alarmState}
          frame={frame}
          fps={fps}
        />
      )}

      {/* THE ABACUS ITSELF — a floating, glowing rod between the two heroes, sized to fill
          the real gap between the alarm and the heroes rather than sitting small in the
          middle of it. This is an Abacus Kids ad; nothing else in the reel actually showed
          one. The bead move follows the real trick in two sequential steps (see
          beadPhaseFor) — subtract the friend, THEN add five — not one blended cross-fade,
          and the same arrow every episode uses says which bead is about to move and why. */}
      {alarmVisible && (
        <>
          <div
            style={{
              position: "absolute",
              left: ABX_LEFT,
              top: ABX_TOP,
              filter: `drop-shadow(0 0 40px ${abacusGlow})`,
              opacity: 0.98,
            }}
          >
            <Abacus rods={[{ value: bead.to, from: bead.from, focus: 1 }]} settle={bead.settle} scale={ABX_SCALE} colorOnArrival />
          </div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <BeadArrow box={ABX_BOX} rod={0} from={bead.from} to={bead.to} settle={bead.settle} />
            {noRoomBeat && (
              <NoRoomCallout box={sectionBand(ABX_BOX, "bottom")} frame={frame} fps={fps} text={noRoomText} side="right" />
            )}
          </svg>
        </>
      )}

      {/* THE FORMULA — the series' own small-friend notation, friend first then five, same
          order the beads just moved in. Goes up the instant "take away three, then add
          five" is said and holds through the reveal. */}
      {formulaVisible && (
        <div style={{ position: "absolute", left: FORMULA_LEFT, top: FORMULA_TOP }}>
          <div
            style={{
              textAlign: "center",
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 2,
              color: "#FFB37A",
              marginBottom: 8,
            }}
          >
            SMALL FRIEND
          </div>
          <FormulaList
            only
            active={mission.b}
            label={formulaLabel}
            arriving={formulaArriving}
            accent="#C2410C"
            progress={beatProgress}
          />
        </div>
      )}

      {/* p18 is the store/download beat — the phone mockup and CTA card already fill that
          space, and every other episode's close beat drops the caption there too rather
          than have the pill collide with the card. */}
      {p !== 18 && (
        <Caption
          track={track}
          frame={frame}
          ink="#1A1A2E"
          accent="#E8432C"
          keywords={CAPTION_KEYWORDS}
          layout={REEL_LAYOUT}
        />
      )}

      {/* THE CLOSE — the same store-flow demo (search it, open the detail page, tap GET,
          watch it download) every episode's outro uses, plus the icon/name/rating/badges
          column. DownloadCta's text colour is an opt-in prop precisely for this: a dark
          background passes a light colour directly instead of getting a second white card
          stacked behind the icon and name. */}
      {p === 18 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: H * 0.06,
            gap: 36,
            background: "rgba(10,13,48,0.86)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* Locked brand furniture — the same top-right badge and credit card every numbered
          episode carries, on top of everything (including the close beat's dark overlay) so
          it's never covered. */}
      <BrandBadge portrait />
      <PoweredBy portrait />

      {SFX_CUES.map((c, i) => (
        <Sequence key={i} from={c.frame} durationInFrames={40}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol ?? 1} />
        </Sequence>
      ))}

      <Audio src={staticFile("audio/short_video_001/short_video_001.mp3")} />
    </AbsoluteFill>
  );
};
