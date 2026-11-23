// AD KIT — shared parts for the paid-ad videos (9:16, 20 s each). Ads are watched muted
// first, so every message is ON SCREEN as big sticker text; the owner adds his own voice-over
// and sound at the very end, which is why INCLUDE_AUDIO is off and every ad keeps its SFX cue
// list ready (timed to the picture) for that pass.
//
// The look is the app's game look: chunky sticker text, a star / level HUD, real hexagon
// beads moved by a finger, a gold flash on every number, confetti on every win.

import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile } from "remotion";
import { Abacus } from "../../components/Abacus";
import { FingerHand, type Digit } from "../../components/FingerHand";
import { DownloadCta } from "../../components/AppShowcase";
import { BeadArrow } from "../../stage/BeadArrow";
import { abacusBox, handAnchor, rodX, type AbacusBox } from "../../stage/geometry";
import type { RigPalette } from "../../data/theme";
import { KID_FONT } from "../../lib/fonts";
import { Critter, type CritterKind } from "../../components/cast";

export const AD_W = 1080;
export const AD_H = 1920;
export const AD_FPS = 30;
export const AD_FRAMES = 600; // 20 s
/** the free-trial beat starts here in every ad (owner, 2026-11-06: tell the trial right before the download card) */
export const TRIAL_AT = 432;
/** the download end card starts here in every ad */
export const END_AT = 495;

/** Off until the owner's voice-over arrives: then turn on and retime to his take. */
export const INCLUDE_AUDIO = false;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ramp = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const popIn = (frame: number, fps: number, at: number, damping = 11) =>
  frame < at ? 0 : spring({ frame: frame - at, fps, config: { damping, stiffness: 170 } });
/** visible window with a quick fade at both ends */
export const windowIn = (frame: number, from: number, to: number, fade = 6) =>
  Math.min(ramp(frame, from, from + fade), 1 - ramp(frame, to - fade, to));

// ---------------------------------------------------------------- text

/** Big sticker word(s): thick dark outline + drop, the way the app draws its game titles. */
export const Sticker: React.FC<{
  text: string;
  size: number;
  color?: string;
  outline?: string;
  style?: React.CSSProperties;
}> = ({ text, size, color = "#FFFFFF", outline = "#2A1050", style }) => (
  <span
    style={{
      fontFamily: KID_FONT,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.05,
      color,
      WebkitTextStroke: `${Math.max(4, size * 0.09)}px ${outline}`,
      paintOrder: "stroke fill",
      textShadow: `0 ${size * 0.08}px 0 ${outline}`,
      whiteSpace: "pre",
      ...style,
    }}
  >
    {text}
  </span>
);

/** A line that pops in at `at` (scale overshoot), centred at y. */
export const PopLine: React.FC<{
  frame: number;
  fps: number;
  at: number;
  until?: number;
  y: number;
  text: string;
  size: number;
  color?: string;
  outline?: string;
  tilt?: number;
}> = ({ frame, fps, at, until = Infinity, y, text, size, color, outline, tilt = 0 }) => {
  if (frame < at || frame >= until) return null;
  const s = popIn(frame, fps, at);
  const out = until === Infinity ? 1 : 1 - ramp(frame, until - 6, until);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: AD_W,
        top: y,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${s}) rotate(${tilt}deg)`,
        transformOrigin: `50% ${size / 2}px`,
        opacity: out,
      }}
    >
      <Sticker text={text} size={size} color={color} outline={outline} style={{ textAlign: "center", display: "block" }} />
    </div>
  );
};

/** A rounded game panel with a darker base under it (the app's chunky 3D button look). */
export const Panel: React.FC<{
  children: React.ReactNode;
  bg: string;
  base: string;
  radius?: number;
  pad?: string;
  style?: React.CSSProperties;
}> = ({ children, bg, base, radius = 44, pad = "26px 40px", style }) => (
  <div
    style={{
      borderRadius: radius,
      background: bg,
      padding: pad,
      boxShadow: `0 12px 0 ${base}, 0 22px 40px rgba(0,0,0,0.28)`,
      border: "5px solid rgba(255,255,255,0.85)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------- game HUD

/** Top bar like a game: level badge, an XP bar and a star counter that ticks up on each win. */
export const GameHud: React.FC<{
  frame: number;
  fps: number;
  level: string;
  /** frames where a star is earned */
  starAt: number[];
  accent: string;
  showFrom?: number;
  hideAt?: number;
  top?: number;
}> = ({ frame, level, starAt, accent, showFrom = 0, hideAt = TRIAL_AT, top = 130 }) => {
  const vis = windowIn(frame, showFrom, hideAt, 8);
  if (vis <= 0) return null;
  const stars = starAt.filter((f) => frame >= f).length;
  const lastStar = [...starAt].reverse().find((f) => frame >= f);
  const bump = lastStar === undefined ? 1 : 1 + 0.35 * Math.max(0, 1 - (frame - lastStar) / 10);
  const xp = clamp01(stars / Math.max(1, starAt.length));
  const xpShown = lastStar === undefined ? 0 : interpolate(frame, [lastStar, lastStar + 12], [Math.max(0, stars - 1) / starAt.length, xp], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top, left: 40, right: 40, display: "flex", alignItems: "center", gap: 18, opacity: vis }}>
      <Panel bg={accent} base="rgba(0,0,0,0.3)" radius={999} pad="10px 26px">
        <Sticker text={level} size={36} outline="rgba(0,0,0,0.45)" />
      </Panel>
      <div style={{ flex: 1, height: 34, borderRadius: 999, background: "rgba(255,255,255,0.85)", border: "4px solid rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ width: `${xpShown * 100}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#FFD84D,#FF9F1C)" }} />
      </div>
      <Panel bg="#FFFFFF" base="rgba(0,0,0,0.22)" radius={999} pad="8px 22px">
        <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 40, color: "#5A3A00", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-block", transform: `scale(${bump})` }}>⭐</span>
          {stars}
        </span>
      </Panel>
    </div>
  );
};

/** "+1 ⭐" that floats up from a point after a win. */
export const StarGain: React.FC<{ frame: number; at: number; x: number; y: number; text?: string }> = ({ frame, at, x, y, text = "+1 ⭐" }) => {
  const t = frame - at;
  if (t < 0 || t > 30) return null;
  return (
    <div style={{ position: "absolute", left: x - 150, width: 300, top: y - t * 4, textAlign: "center", opacity: 1 - ramp(frame, at + 20, at + 30) }}>
      <Sticker text={text} size={60} color="#FFE15A" outline="#6A3A00" />
    </div>
  );
};

/** A tap: a ring that closes onto the point, then a burst. Render inside an <svg>. */
export const TapRing: React.FC<{ frame: number; at: number; x: number; y: number; color?: string }> = ({ frame, at, x, y, color = "#FFFFFF" }) => {
  const t = frame - at;
  if (t < -10 || t > 14) return null;
  const closing = t < 0;
  const r = closing ? 30 + -t * 6 : 30 + t * 5;
  const op = closing ? ramp(t, -10, -4) : 1 - t / 14;
  return <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={closing ? 8 : 10} opacity={op} />;
};

// ---------------------------------------------------------------- the playable abacus

export interface BeadMove {
  /** frame the beads start moving */
  at: number;
  dur?: number;
  /** every rod's value AFTER the move, ones rod first */
  to: number[];
  /** the finger doing it (one bead group per move, like a real child's swipe) */
  hand?: { rod: number; heaven: boolean; direction: "up" | "down"; digit?: Digit };
}

export interface AbacusPlay {
  rods: number;
  start: number[];
  moves: BeadMove[];
}

const MOVE_DUR = 10;

/** Where every bead is at this frame, and which move (if any) is under way. */
export const abacusAt = (play: AbacusPlay, frame: number) => {
  let cur = play.start;
  for (const m of play.moves) {
    const dur = m.dur ?? MOVE_DUR;
    if (frame < m.at) return { values: cur, from: cur, settle: 1, move: null as BeadMove | null, next: m };
    if (frame < m.at + dur) {
      const k = (frame - m.at) / dur;
      return { values: m.to, from: cur, settle: 1 - Math.pow(1 - k, 3), move: m, next: m };
    }
    cur = m.to;
  }
  return { values: cur, from: cur, settle: 1, move: null as BeadMove | null, next: null as BeadMove | null };
};

/** The number shown by a list of rod values (ones first). */
export const valueOf = (values: number[]) => values.reduce((sum, v, i) => sum + v * Math.pow(10, i), 0);

export const PlayableAbacus: React.FC<{
  frame: number;
  fps: number;
  play: AbacusPlay;
  scale: number;
  /** vertical band the abacus is centred in */
  top: number;
  bottom: number;
  palette: RigPalette;
  /** rod index lit; others dimmed a little (like the app tutorial's ones rod) */
  focusRod?: number;
  opacity?: number;
  /** show the hand this many frames before each move */
  lead?: number;
  /** name each rod under the frame (ones, tens, hundreds): names only, no place values */
  placeNames?: boolean;
}> = ({ frame, fps, play, scale, top, bottom, palette, focusRod, opacity = 1, lead = 12, placeNames = false }) => {
  const box = abacusBox(play.rods, scale, AD_W, frame, fps, { stageTop: top, stageBottom: bottom });
  const st = abacusAt(play, frame);
  const rods = st.values.map((v, i) => ({ value: v, from: st.from[i], focus: focusRod === undefined || focusRod === i ? 1 : 0.55, }));
  // the hand appears `lead` frames before its move and lingers a moment after
  const handMove = st.move ?? (st.next && frame >= st.next.at - lead ? st.next : null);
  let hand: React.ReactNode = null;
  if (handMove?.hand) {
    const h = handMove.hand;
    const fromVals = st.move ? st.from : st.values;
    const anchor = handAnchor(box, h.heaven, h.direction, fromVals[h.rod], handMove.to[h.rod], h.digit ?? "index", box.scale);
    const travel = st.move ? st.settle : 0;
    const y = anchor.y + (h.direction === "up" ? -1 : 1) * anchor.len * travel;
    const fade = ramp(frame, handMove.at - lead, handMove.at - lead + 6);
    hand = (
      <FingerHand
        digit={h.digit ?? "index"}
        direction={h.direction}
        x={rodX(box, h.rod)}
        y={y}
        len={anchor.len}
        scale={box.scale}
        opacity={fade}
        showChip={false}
        showArrow={false}
      />
    );
  }
  // one arrow on EVERY bead that moves (three beads up = three arrows), shown with the hand before
  // the move and fading as the beads land; the hand itself draws none
  const arrowFrom = st.move ? st.from : st.values;
  const arrowSettle = st.move ? st.settle : 0;
  const arrows = handMove ? (
    <g opacity={ramp(frame, handMove.at - lead, handMove.at - lead + 6)}>
      {handMove.to.map((to, i) => (
        <BeadArrow key={i} box={box} rod={i} from={arrowFrom[i]} to={to} settle={arrowSettle} />
      ))}
    </g>
  ) : null;
  return (
    <>
      <div style={{ position: "absolute", left: box.left, top: box.top, opacity }}>
        <Abacus rods={rods} settle={st.settle} scale={box.scale} palette={palette} colorOnArrival />
      </div>
      <svg width={AD_W} height={AD_H} viewBox={`0 0 ${AD_W} ${AD_H}`} style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}>
        {placeNames &&
          st.values.map((_, i) => (
            <g key={i}>
              <rect x={rodX(box, i) - 78} y={box.top + box.h + 16} width={156} height={58} rx={29} fill="#FFFFFF" stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
              <text x={rodX(box, i)} y={box.top + box.h + 56} textAnchor="middle" fill="#2A1A6E" fontSize={36} fontWeight={700} fontFamily={KID_FONT}>{PLACE_NAMES[i]}</text>
            </g>
          ))}
        {arrows}
        {hand}
      </svg>
    </>
  );
};

const PLACE_NAMES = ["ones", "tens", "hundreds"];

export type BuddyMood = "calm" | "cheer" | "tilt";
/** Each ad's own pair of characters, standing on the world's ground at the two bottom corners. */
export const AdBuddies: React.FC<{ frame: number; fps: number; kinds: [CritterKind, CritterKind]; mood: BuddyMood | [BuddyMood, BuddyMood]; scale?: number; y?: number }> = ({
  frame, fps, kinds, mood, scale = 1.15, y = AD_H * 0.9,
}) => {
  const [m0, m1] = Array.isArray(mood) ? mood : [mood, mood];
  return (
    <svg width={AD_W} height={AD_H} viewBox={`0 0 ${AD_W} ${AD_H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <Critter kind={kinds[0]} x={AD_W * 0.14} y={y} scale={scale} mood={m0} frame={frame} fps={fps} facing={1} seed={0} />
      <Critter kind={kinds[1]} x={AD_W * 0.86} y={y} scale={scale * 0.92} mood={m1} frame={frame} fps={fps} facing={-1} seed={1.4} />
    </svg>
  );
};

export const playBox = (play: AbacusPlay, scale: number, top: number, bottom: number, frame: number, fps: number): AbacusBox =>
  abacusBox(play.rods, scale, AD_W, frame, fps, { stageTop: top, stageBottom: bottom });

/** The number plate the app shows above its abacus; flashes gold + grows when it changes. */
export const NumberPlate: React.FC<{
  frame: number;
  value: number;
  /** frames where the value lands (flash) */
  flashAt: number[];
  x: number;
  y: number;
  ink: string;
  bg?: string;
  size?: number;
}> = ({ frame, value, flashAt, x, y, ink, bg = "#FFFFFF", size = 96 }) => {
  const last = [...flashAt].reverse().find((f) => frame >= f && frame < f + 18);
  const k = last === undefined ? 0 : 1 - (frame - last) / 18;
  return (
    <div style={{ position: "absolute", left: x - 160, width: 320, top: y, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          minWidth: 200,
          textAlign: "center",
          borderRadius: 999,
          padding: "6px 36px",
          background: k > 0 ? `linear-gradient(180deg,#FFF3A8,#FFC93C)` : bg,
          boxShadow: `0 10px 0 rgba(0,0,0,0.22), 0 0 ${60 * k}px rgba(255,210,60,${0.9 * k})`,
          border: "5px solid rgba(255,255,255,0.9)",
          transform: `scale(${1 + 0.28 * k})`,
          fontFamily: KID_FONT,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.1,
          color: k > 0 ? "#6A3A00" : ink,
        }}
      >
        {value}
      </div>
    </div>
  );
};

/** "Make 7" goal capsule from the tutorial. */
export const GoalChip: React.FC<{ frame: number; fps: number; at: number; text: string; y: number; bg: string; done?: boolean }> = ({ frame, fps, at, text, y, bg, done }) => {
  if (frame < at) return null;
  const s = popIn(frame, fps, at);
  return (
    <div style={{ position: "absolute", top: y, left: 0, width: AD_W, display: "flex", justifyContent: "center", transform: `scale(${s})` }}>
      <Panel bg={done ? "#2EB85C" : bg} base="rgba(0,0,0,0.3)" radius={999} pad="14px 44px">
        <Sticker text={done ? `✔ ${text}` : text} size={64} outline="rgba(0,0,0,0.45)" />
      </Panel>
    </div>
  );
};

// ---------------------------------------------------------------- end card

/** The close every ad shares. First a short free-trial beat (Monthly 3 days, Yearly 7 days, everything unlocked),
 *  then the download card: a promise line, then icon + name + FREE + badges. The world stays dimmed across both. */
const END_CTA_SCALE = 1.62;
const TRIALS = [
  { name: "Monthly", days: 3, c: ["#2C6FE8", "#1B4FB8"] },
  { name: "Yearly", days: 7, c: ["#FF8A3D", "#E8432C"] },
];

/** the Home features the trial opens, named as on the Home tiles */
const TRIAL_FEATURES = ["⏱️ Exercise", "📝 Exam", "🎮 Math Games", "🎯 Custom Challenge Mode"];

/** Where the close lands. Defaults are the silent-cut timing; an ad with a voice-over passes its own so the trial step
 *  and the download card start on the spoken words, and the 3 / 7 flash when "three" / "seven" are said. */
export type CloseTiming = { trialAt: number; endAt: number; flash?: [number, number] };
export const DEFAULT_CLOSE: CloseTiming = { trialAt: TRIAL_AT, endAt: END_AT };

const TrialBeat: React.FC<{ frame: number; fps: number; t: CloseTiming }> = ({ frame, fps, t: tm }) => {
  const TRIAL_AT = tm.trialAt;
  const END_AT = tm.endAt;
  const out = 1 - ramp(frame, END_AT - 4, END_AT + 2);
  return (
    <AbsoluteFill style={{ opacity: out, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 360, gap: 44 }}>
      <div style={{ transform: `scale(${popIn(frame, fps, TRIAL_AT)})` }}>
        <Sticker text="Try ALL premium FREE" size={84} color="#FFE15A" outline="#3A1A00" style={{ whiteSpace: "nowrap" }} />
      </div>
      <div style={{ display: "flex", gap: 40 }}>
        {TRIALS.map((t, i) => {
          const at = TRIAL_AT + 4 + i * 6;
          const flashAt = tm.flash ? tm.flash[i] : at + 4;
          const k = frame < flashAt ? 0 : Math.max(0, 1 - (frame - flashAt) / 14);
          return (
            <div key={t.name} style={{ transform: `scale(${popIn(frame, fps, at)})` }}>
              <div
                style={{
                  width: 400,
                  borderRadius: 46,
                  background: `linear-gradient(180deg, ${t.c[0]}, ${t.c[1]})`,
                  border: "8px solid #FFFFFF",
                  boxShadow: "0 14px 0 rgba(0,0,0,0.25)",
                  padding: "24px 0 30px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Sticker text={t.name} size={56} outline="rgba(0,0,0,0.35)" />
                <div
                  style={{
                    fontFamily: KID_FONT,
                    fontWeight: 700,
                    fontSize: 190,
                    lineHeight: 1,
                    color: "#FFE15A",
                    transform: `scale(${1 + 0.25 * k})`,
                    textShadow: `0 0 ${46 * k}px rgba(255,210,60,1), 0 8px 0 rgba(0,0,0,0.25)`,
                  }}
                >
                  {t.days}
                </div>
                <Sticker text="days FREE" size={54} outline="rgba(0,0,0,0.35)" style={{ whiteSpace: "nowrap" }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ transform: `scale(${popIn(frame, fps, TRIAL_AT + 16)})` }}>
        <Panel bg="#FFFFFF" base="#2EB85C" radius={999} pad="14px 44px">
          <div style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 52, color: "#145A2B", whiteSpace: "nowrap" }}>🔓 Every feature unlocked</div>
        </Panel>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px 18px", width: 960, marginTop: -14 }}>
        {TRIAL_FEATURES.map((f, i) => (
          <div key={f} style={{ transform: `scale(${popIn(frame, fps, TRIAL_AT + 22 + i * 4)})` }}>
            <Panel bg="#FFF6D6" base="#B7791F" radius={999} pad="10px 30px">
              <div style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 42, color: "#6A3A00", whiteSpace: "nowrap" }}>{f}</div>
            </Panel>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** The closing sound cues every ad shares (trial beat, then the download card). */
export const endSfx = (t: CloseTiming = DEFAULT_CLOSE): AdSfx[] => [
  { frame: t.trialAt, file: "gz_benefit.mp3" },
  { frame: t.flash ? t.flash[0] : t.trialAt + 8, file: "gz_star.mp3" },
  { frame: t.flash ? t.flash[1] : t.trialAt + 14, file: "gz_star.mp3" },
  ...[0, 1, 2, 3].map((i) => ({ frame: t.trialAt + 22 + i * 4, file: "gz_tap.mp3", vol: 0.35 })),
  { frame: t.endAt, file: "cta_pop.mp3" },
];
export const END_SFX: AdSfx[] = endSfx();

export const AdEndCard: React.FC<{
  frame: number;
  fps: number;
  headline: string;
  sub?: string;
  accent: string;
  dim?: string;
  /** false for the trial ad itself, which tells the trial in its own beats */
  trial?: boolean;
  timing?: CloseTiming;
}> = ({ frame, fps, headline, sub, accent, dim = "rgba(20,8,40,0.62)", trial = true, timing = DEFAULT_CLOSE }) => {
  const END_AT = timing.endAt;
  const from = trial ? timing.trialAt : END_AT;
  if (frame < from) return null;
  const d = ramp(frame, from, from + 8);
  const progress = clamp01((frame - END_AT - 8) / 50);
  return (
    <AbsoluteFill style={{ background: dim, opacity: d }}>
      {trial && frame < END_AT + 2 && <TrialBeat frame={frame} fps={fps} t={timing} />}
      {frame >= END_AT && (
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 220, gap: 34 }}>
          <div style={{ transform: `scale(${popIn(frame, fps, END_AT)})` }}>
            <Panel bg={accent} base="rgba(0,0,0,0.35)" radius={60} pad="24px 48px">
              <Sticker text={headline} size={84} outline="rgba(0,0,0,0.5)" style={{ whiteSpace: "nowrap" }} />
            </Panel>
          </div>
          {sub && (
            <div style={{ opacity: ramp(frame, END_AT + 10, END_AT + 18) }}>
              <Sticker text={sub} size={64} color="#FFE15A" outline="#3A1A00" style={{ whiteSpace: "nowrap" }} />
            </div>
          )}
          {/* the store block is drawn at its episode size, then scaled up to use the tall 9:16 height */}
          <div style={{ marginTop: 60, transform: `scale(${END_CTA_SCALE})`, transformOrigin: "top center" }}>
            <DownloadCta progress={progress} nameColor="#FFFFFF" badgeMarginTop={20} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- sound (owner's pass)

export type AdSfx = { frame: number; file: string; vol?: number };

/** SFX cues, plus the owner's voice-over once it exists for an ad (`voice` = file under public/audio/ads). With a voice
 *  the SFX sit lower so every word stays clear. */
export const AdSound: React.FC<{ cues: AdSfx[]; voice?: string }> = ({ cues, voice }) =>
  INCLUDE_AUDIO || voice ? (
    <>
      {voice && <Audio src={staticFile(`audio/ads/${voice}`)} volume={1} />}
      {cues.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.frame)} durationInFrames={40}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={(c.vol ?? 0.55) * (voice ? 0.45 : 1)} />
        </Sequence>
      ))}
    </>
  ) : null;

// ---------------------------------------------------------------- hook burst

/** Frame-0 attention grabber: spinning sun rays + a giant bouncing badge (a number or emoji). */
export const HookBurst: React.FC<{
  frame: number;
  fps: number;
  until: number;
  x: number;
  y: number;
  text: string;
  size?: number;
  rays?: string;
  badge?: string;
  ink?: string;
}> = ({ frame, fps, until, x, y, text, size = 300, rays = "rgba(255,216,77,0.55)", badge = "linear-gradient(180deg,#FFF3A8,#FFC93C)", ink = "#6A3A00" }) => {
  if (frame >= until) return null;
  const s = popIn(frame, fps, 0, 8);
  const out = 1 - ramp(frame, until - 8, until);
  const bounce = 1 + Math.sin(frame / 4) * 0.04;
  const R = size * 1.9;
  return (
    <div style={{ position: "absolute", left: x - R, top: y - R, width: R * 2, height: R * 2, opacity: out, pointerEvents: "none" }}>
      <svg width={R * 2} height={R * 2} style={{ position: "absolute", inset: 0, transform: `rotate(${frame * 1.6}deg) scale(${s})` }}>
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const b = a + Math.PI / 14;
          return <path key={i} d={`M ${R} ${R} L ${R + Math.cos(a) * R} ${R + Math.sin(a) * R} L ${R + Math.cos(b) * R} ${R + Math.sin(b) * R} Z`} fill={rays} />;
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: R - size * 0.62,
          top: R - size * 0.62,
          width: size * 1.24,
          height: size * 1.24,
          borderRadius: 999,
          background: badge,
          border: "10px solid #FFFFFF",
          boxShadow: "0 16px 0 rgba(0,0,0,0.25), 0 0 80px rgba(255,210,60,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${s * bounce})`,
          fontFamily: KID_FONT,
          fontWeight: 700,
          fontSize: size * (text.length > 2 ? 0.42 : 0.9),
          color: ink,
          lineHeight: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
};
