// MATH HEROES 2: "SUNRISE SQUAD" — the sequel reel, deliberately different in tone from reel 1,
// not a recolour of the same footage. Reel 1 was a NIGHT alert ("a number is stuck"); this one
// is a bright MORNING mission ("a number went missing") — different sky, different alarm
// wording, different hero costumes. Same rig, same proven systems underneath (the sequential
// bead move + arrow, the notification-style alert, the formula card, the hexagon-confetti
// celebration, the call-focus spotlight) — all ported as-is from short_math_heroes.tsx,
// because those were fixed through real iteration and this reel shouldn't have to rediscover
// the same bugs.
//
// THE TRICK: Small Friend SUBTRACTION, the mirror of reel 1's addition trick — and the SAME
// bead order: the lower beads (the friend) move FIRST, five moves second, exactly like reel 1
// never adds five before the friend is off the rod. For 5-1=4 that's add four (5 -> 9, heaven
// still on), THEN subtract five (9 -> 4). Both missions start at 5 (heaven bead only) and
// subtract down, teaching the friends of 1 and 3 (reel 1 taught 2 and 1; together all four).
//
// Timing from public/audio/short_video_002/short_video_002.phrases.json, aligned from
// docs/reel_math_heroes_2_lines.txt. 19 phrases, ~54.5s. Two words ("One's", "Three's") had
// their real onset patched after the aligner absorbed a genuine recording pause into the
// word — see the fix note by MISSION_1/2 below; this is the SAME class of bug reel 1 hit once,
// caught here in BOTH missions before anything was built on top of the bad timestamps.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/math_heroes_2.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Hero, HeroSpeedLines, HERO_COLORS, type HeroMood } from "../components/heroes/Hero";
import { MathAlarm, type AlarmState } from "../components/heroes/MathAlarm";
import { Celebration } from "../components/heroes/Celebration";
import { HeroHQDay } from "../components/heroes/HeroHQDay";
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
export const AUDIO_SEC = 58.82775; // the replacement recording's real ffprobe duration
export const FPS = 30;
export const MATH_HEROES_2_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

// ---------------------------------------------------------------- the two missions
// Both start at 5 (heaven bead alone) and subtract DOWN — the mirror of reel 1, which started
// low and added UP. "friend" is still the (5-b) complement; the notation just reads
// friend-first-then-five in the other direction: -b = -5 +friend.
const MISSION_1 = { a: 5, b: 1, op: "−" as const, answer: 4, friend: 4 };
const MISSION_2 = { a: 5, b: 3, op: "−" as const, answer: 2, friend: 2 };

// The abacus's own box on screen — identical geometry to reel 1's, proven to fit the gap
// between the alert card and the heroes without crowding either.
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

const FORMULA_CARD_W = FORMULA_ONE.w;
const FORMULA_CARD_H = FORMULA_ONE.h;
const FORMULA_LEFT = ABX_LEFT + ABX_W + 36;
const FORMULA_TOP = ABX_TOP + ABX_H / 2 - FORMULA_CARD_H / 2;

/**
 * Small Friend subtraction moves the LOWER beads first, same as reel 1's convention — the
 * friend always goes on/off the rod before five does, never after. Corrected from an earlier
 * draft that had this backwards (heaven first): the real move for 5-1=4 is
 *
 *   5 (heaven on, earth 0)  →  add the friend, 4 earth beads rise (value reads 9 briefly,
 *   heaven still on)  →  THEN push heaven up, subtracting five (value settles at 4)
 *
 * i.e. missionA -> mid -> missionAns, where mid = missionA + friend (earth-only move, heaven
 * unchanged since both sides are >=5), then mid -> missionAns (heaven-only move, earth
 * unchanged since both sides share the same %5). Same BeadArrow logic as ever — it reads the
 * direction off the values, not off which order an episode intends.
 */
const beadPhaseFor = (frame: number, p: number): { from: number; to: number; settle: number } => {
  const primeIdx = p <= 8 ? 5 : 13; // "___'s friend is ___!"
  const moveIdx = p <= 8 ? 6 : 14; // "Take away five, then add ___!"
  const mission = p <= 8 ? MISSION_1 : MISSION_2;
  const missionA = mission.a;
  const missionAns = mission.answer;
  const mid = missionA + mission.friend;

  const primeStart = sec(PHRASES[primeIdx].start, FPS);
  const moveStart = sec(PHRASES[moveIdx].start, FPS);
  const moveEnd = sec(PHRASES[moveIdx].end, FPS);
  const subEnd = moveStart + (moveEnd - moveStart) * 0.45;

  if (frame < primeStart) return { from: missionA, to: missionA, settle: 1 };
  if (frame < moveStart) return { from: missionA, to: mid, settle: 0 };
  if (frame < subEnd) {
    return {
      from: missionA,
      to: mid,
      settle: interpolate(frame, [moveStart, subEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    };
  }
  if (frame < moveEnd) {
    return {
      from: mid,
      to: missionAns,
      settle: interpolate(frame, [subEnd, moveEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    };
  }
  return { from: missionAns, to: missionAns, settle: 1 };
};

const HEROES_SAVE_START = sec(PHRASES[0].words[7].start, FPS); // "save"

const SOLVE1_START = sec(PHRASES[7].start, FPS);
const SOLVE2_START = sec(PHRASES[15].start, FPS);
// "Mission solved!"/"Heroes win again!" land a beat AFTER the reveal — by then the reveal's
// own confetti has fully decayed (its ~1.15s window is over), so that line coasted on a held
// cheer pose with nothing new. A second, smaller burst right on the line gives it its own pop.
const CHEER1_START = sec(PHRASES[8].start, FPS);
const CHEER2_START = sec(PHRASES[16].start, FPS);

const ENTRY_START = sec(PHRASES[4].start, FPS);
const ENTRY_END = sec(PHRASES[4].end, FPS);

const STORE_START = sec(PHRASES[18].start, FPS);
const STORE_FRAMES = 92;

// ---------------------------------------------------------------- SFX cues
// Reusing reel 1's original SFX files, not reel 1's footage — they're this series' OWN sounds
// (synthesized fresh for Math Heroes, never part of the numbered episodes' library), generic
// enough that an alert whoop, a communicator beep and a bead click work for either mission's
// direction. Regenerating new ones just to have new ones would be novelty for its own sake.
type SfxCue = { frame: number; file: string; vol?: number };

const beadMoveFrames = (moveIdx: number) => {
  const moveStart = sec(PHRASES[moveIdx].start, FPS);
  const moveEnd = sec(PHRASES[moveIdx].end, FPS);
  const subEnd = Math.round(moveStart + (moveEnd - moveStart) * 0.45);
  return { moveStart, subEnd };
};
const m1Move = beadMoveFrames(6);
const m2Move = beadMoveFrames(14);

const SFX_CUES: SfxCue[] = [
  { frame: sec(PHRASES[0].words[4].start, FPS), file: "intro_stuck.mp3", vol: 0.5 },
  { frame: HEROES_SAVE_START, file: "intro_hero_sting.mp3", vol: 0.55 },
  { frame: sec(PHRASES[1].start, FPS), file: "hero_alert.mp3", vol: 0.55 },
  { frame: sec(PHRASES[9].start, FPS), file: "hero_alert.mp3", vol: 0.55 },
  // "...and it's stuck!" — 7 words this time ("Five take away one, and it's stuck!"), so the
  // word is index 6, not reel 1's index 5. Measured from this recording's own word list, not
  // copied from reel 1's.
  { frame: sec(PHRASES[2].words[6].start, FPS), file: "intro_stuck.mp3", vol: 0.5 },
  { frame: sec(PHRASES[10].words[6].start, FPS), file: "intro_stuck.mp3", vol: 0.5 },
  { frame: sec(PHRASES[4].start, FPS), file: "hero_call.mp3", vol: 0.5 },
  { frame: sec(PHRASES[12].start, FPS), file: "hero_call.mp3", vol: 0.5 },
  { frame: ENTRY_START, file: "hero_entry.mp3", vol: 0.48 },
  // The bead order here is friend-first (lower beads rise), five-second (heaven departs) —
  // the OPPOSITE order from reel 1. These cues were left pointing at reel 1's order in the
  // first pass: bead_subtract.mp3 (a descending tumble) played while beads were actually
  // RISING, and bead_add.mp3 (an ascending "landing" chime) played while the heaven bead was
  // actually LEAVING — backwards. Swapped to match the corrected visual: the ascending chime
  // now lands on the lower beads coming up, the descending sound on the heaven bead departing.
  { frame: m1Move.moveStart, file: "bead_add.mp3", vol: 0.52 },
  { frame: m1Move.subEnd, file: "bead_subtract.mp3", vol: 0.45 },
  { frame: m2Move.moveStart, file: "bead_add.mp3", vol: 0.52 },
  { frame: m2Move.subEnd, file: "bead_subtract.mp3", vol: 0.45 },
  { frame: SOLVE1_START, file: "mission_solved.mp3", vol: 0.58 },
  { frame: SOLVE2_START, file: "mission_solved.mp3", vol: 0.58 },
  // the second, smaller pop on "Mission solved!"/"Heroes win again!" — matches the second
  // confetti burst on that line rather than coasting on the reveal's already-decayed one.
  { frame: CHEER1_START, file: "cta_pop.mp3", vol: 0.4 },
  { frame: CHEER2_START, file: "cta_pop.mp3", vol: 0.4 },
  { frame: STORE_START + 4, file: "cta_pop.mp3", vol: 0.45 },
];

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
const CAPTION_KEYWORDS = ["friend", "alert", "stuck", "solved", "mission", "hero", "heroes"];

export const ShortMathHeroes2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  const mission = p <= 8 ? MISSION_1 : MISSION_2;
  const alarmVisible = p >= 1 && p <= 17;
  const alarmState: AlarmState = !alarmVisible
    ? "idle"
    : (p >= 1 && p <= 6) || (p >= 9 && p <= 14)
      ? "alert"
      : "solved";

  const alertEntryFrame = p <= 8 ? sec(PHRASES[1].start, FPS) : sec(PHRASES[9].start, FPS);
  const alertSpring = spring({ frame: frame - alertEntryFrame, fps, config: { damping: 11, mass: 0.7 } });
  const consoleRestY = H * 0.2;
  const consoleY = interpolate(alertSpring, [0, 1], [-260, consoleRestY]);

  const bead = beadPhaseFor(frame, p);
  const abacusGlow = alarmState === "solved" ? "#1FA855" : alarmState === "alert" ? "#F4A100" : "transparent";

  // "There's no room to take away ___" — a real annotation on the lower beads (a
  // marching-ants box + a callout bubble), same as reel 1.
  const noRoomBeat = p === 3 || p === 11;
  const noRoomText = `No room for ${mission.b}!`;

  // "Mission solved!"/"Heroes win again!" is the trick's own curtain call — the abacus and
  // formula have done their job by the reveal a beat earlier, so they bow out here instead of
  // just sitting there identically held while only the confetti replays. Snaps back to full
  // the instant the NEXT mission's alert arrives (p9), same as every other per-mission reset.
  const toolFadeOut = p === 8
    ? interpolate(frame, [CHEER1_START, CHEER1_START + 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : p === 16
      ? interpolate(frame, [CHEER2_START, CHEER2_START + 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 1;

  const formulaVisible = (p >= 6 && p <= 8) || (p >= 14 && p <= 16);
  const formulaArriving = p === 6 || p === 14;
  const formulaLabel = `−${mission.b} = +${mission.friend} −5`;

  const sparkVisible = frame >= ENTRY_START;
  const entryProgress = Math.max(0, Math.min(1, (frame - ENTRY_START) / (ENTRY_END - ENTRY_START)));
  const sparkLanded = frame >= ENTRY_END;

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

  const blazeCalling = blazeMood === "call";
  const sparkCalling = sparkMood === "call";
  const callFocusStart = blazeCalling ? sec(PHRASES[4].start, FPS) : sparkCalling ? sec(PHRASES[12].start, FPS) : 0;
  const callPop = blazeCalling || sparkCalling
    ? spring({ frame: frame - callFocusStart, fps, config: { damping: 9, mass: 0.55 } })
    : 0;
  const callElapsed = Math.max(0, (frame - callFocusStart) / fps);
  const callGlowPulse = 0.55 + 0.45 * Math.sin(callElapsed * 15.5);
  const blazeScale = 1.15 + (blazeCalling ? callPop * 0.14 : 0);
  const sparkScale = 1.15 + (sparkCalling ? callPop * 0.14 : 0);
  const blazeDim = sparkCalling ? 1 - callPop * 0.45 : 1;
  const sparkDim = blazeCalling ? 1 - callPop * 0.45 : 1;

  const blazeProgress = blazeOpeningCheer
    ? interpolate(frame, [HEROES_SAVE_START, HEROES_SAVE_START + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : beatProgress;

  const introZoom = p === 0
    ? interpolate(frame, [0, sec(PHRASES[0].end, FPS)], [1, 1.09], { extrapolateRight: "clamp" })
    : 1;

  const outline = "0 6px 0 rgba(0,0,0,0.22), -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff";

  return (
    <AbsoluteFill style={{ background: "#AEE0F7" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${introZoom})`, transformOrigin: "50% 62%" }}>
        <HeroHQDay width={W} height={H} frame={frame} fps={fps} />

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
            <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 92, color: "#FFC400", textShadow: outline }}>
              MATH
            </span>
            <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 92, color: "#FF4D4D", textShadow: outline }}>
              HEROES
            </span>
          </div>
        )}

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <radialGradient id="callGlow2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE9B0" stopOpacity={0.85} />
              <stop offset="55%" stopColor="#FFD873" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#FFD873" stopOpacity={0} />
            </radialGradient>
          </defs>

          {sparkVisible && !sparkLanded && (
            <HeroSpeedLines x={sparkX} y={heroY} facing={-1} entryProgress={1 - entryProgress} color={HERO_COLORS.sparkSunrise.cape} />
          )}

          {blazeCalling && (
            <circle cx={blazeX} cy={heroY - 60} r={210 * (0.7 + callPop * 0.3)} fill="url(#callGlow2)" opacity={callGlowPulse * callPop} />
          )}
          {sparkCalling && (
            <circle cx={sparkX} cy={heroY - 60} r={210 * (0.7 + callPop * 0.3)} fill="url(#callGlow2)" opacity={callGlowPulse * callPop} />
          )}

          <g opacity={blazeDim}>
            <Hero
              x={blazeX}
              y={heroY}
              scale={blazeScale}
              mood={blazeMood}
              name="blazeSunrise"
              progress={blazeProgress}
              frame={frame}
              fps={fps}
              facing={sparkVisible ? 1 : 1}
            />
          </g>

          <Celebration x={(blazeX + sparkX) / 2} y={heroY - 250} frame={frame} fps={fps} startFrame={SOLVE1_START} />
          <Celebration x={(blazeX + sparkX) / 2} y={heroY - 250} frame={frame} fps={fps} startFrame={SOLVE2_START} />
          <Celebration x={(blazeX + sparkX) / 2} y={heroY - 250} frame={frame} fps={fps} startFrame={CHEER1_START} />
          <Celebration x={(blazeX + sparkX) / 2} y={heroY - 250} frame={frame} fps={fps} startFrame={CHEER2_START} />

          {sparkVisible && (
            <g opacity={sparkDim}>
              <Hero
                x={sparkX}
                y={heroY}
                scale={sparkScale}
                mood={sparkMood}
                name="sparkSunrise"
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
          alertColor="#F4A100"
        />
      )}

      {alarmVisible && (
        <>
          <div
            style={{
              position: "absolute",
              left: ABX_LEFT,
              top: ABX_TOP,
              filter: `drop-shadow(0 0 40px ${abacusGlow})`,
              opacity: 0.98 * toolFadeOut,
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

      {formulaVisible && (
        <div style={{ position: "absolute", left: FORMULA_LEFT, top: FORMULA_TOP, opacity: toolFadeOut }}>
          <div
            style={{
              textAlign: "center",
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 2,
              color: "#FFFFFF",
              textShadow: "0 2px 0 rgba(0,0,0,0.35), 0 0 6px rgba(0,0,0,0.25)",
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

      <Audio src={staticFile("audio/short_video_002/short_video_002.mp3")} />
    </AbsoluteFill>
  );
};
