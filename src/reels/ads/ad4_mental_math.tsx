// AD 4 — "Quick! 47 + 38?" Aspiration: mental math. The sum is done on real beads, right to left
// (the ones rod first: + 8, then the tens: + 30), then the abacus moves into Robo's head and new
// sums are answered without beads, then a speed-round win. World: galaxy; characters Alien and Robo.
//
// Bead logic, checked rod by rod (lower beads always move first):
//   47 +  8: ones rod 7 + 8 → no room → Big Friend +8 = −2 +10: two lower beads down on ones (−2) → 45,
//            then +10 = +1 on tens, tens is 4 (all lower beads up) → Small Friend +1 = −4 +5:
//            four lower beads down (−4), then the upper bead down (+5) → 55
//   55 + 30: tens rod 5 + 3 → direct: three lower beads up → 85
//
// Beats (30 fps): 0-66 hook · 66-232 bead sum · 232-345 mind abacus · 345-432 speed round · 432 free trial · 480 end.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Abacus } from "../../components/Abacus";
import { World } from "../../components/World";
import { Critter } from "../../components/cast";
import { Celebration } from "../../components/heroes/Celebration";
import { ResultPopup } from "../../components/gamezone/ResultPopup";
import { BB_RIGS } from "../../data/bbworlds";
import { BrandBadge } from "../../components/Brand";
import { KID_FONT } from "../../lib/fonts";
import {
  AD_H, AD_W, AdBuddies, AdEndCard, AdSound, END_SFX, GameHud, HookBurst, NumberPlate, Panel, PlayableAbacus, PopLine, StarGain, Sticker,
  abacusAt, playBox, popIn, ramp, valueOf, windowIn, type AbacusPlay, type AdSfx,
} from "./AdKit";

const ACCENT = "#7C4DFF";
const SCALE = 1.75;
const BAND_TOP = 640;
const BAND_BOTTOM = 1420; // leaves room for the rod-name cards under the frame
const SUM_FROM = 66;
const SUM_TO = 232;
const MIND_TO = 345;

const PLAY: AbacusPlay = {
  rods: 2,
  start: [7, 4],
  moves: [
    // + 8 on the ones: −2 ...
    { at: 104, to: [5, 4], hand: { rod: 0, heaven: false, direction: "down", digit: "index" } },
    // ... +10 on the tens (4 → 5): −4 then +5
    { at: 132, to: [5, 0], hand: { rod: 1, heaven: false, direction: "down", digit: "index" } },
    { at: 160, to: [5, 5], hand: { rod: 1, heaven: true, direction: "down", digit: "index" } },
    // + 30 on the tens: three lower beads up
    { at: 196, to: [5, 8], hand: { rod: 1, heaven: false, direction: "up", digit: "thumb" } },
  ],
};
const FLASHES = [114, 142, 170, 206];
/** the step being done, with its formula (lower beads first) */
const stepAt = (f: number) =>
  f < 128 ? { op: "+ 8", rule: "Ones: +8 = −2 +10", c: "#FF8A3D" } : f < 182 ? { op: "+ 8", rule: "Tens: +1 = −4 +5", c: "#FF8A3D" } : { op: "+ 30", rule: "Tens: +3", c: "#2EB85C" };
const WIN = 206;

const MIND_SUMS = [
  { q: "23 + 45", a: "68", at: 262 },
  { q: "56 + 27", a: "83", at: 296 },
];
const RESULT_AT = 350;

export const AD4_SFX: AdSfx[] = [
  { frame: 0, file: "gz_hook.mp3" },
  ...[20, 32, 44].map((f) => ({ frame: f, file: "bf1_tick.mp3" })),
  { frame: 104, file: "bead_subtract.mp3" },
  { frame: 132, file: "bead_subtract.mp3" },
  { frame: 160, file: "bead_upper_swap.mp3" },
  { frame: 196, file: "bead_add.mp3" },
  { frame: WIN, file: "gz_correct.mp3" },
  { frame: 240, file: "gz_benefit.mp3" },
  ...MIND_SUMS.map((s) => ({ frame: s.at + 16, file: "gz_correct.mp3" })),
  { frame: RESULT_AT, file: "gz_win.mp3" },
  ...END_SFX,
];

const Timer: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame >= SUM_FROM) return null;
  const t = Math.max(0, frame - 8);
  const left = Math.max(1, 3 - Math.floor(t / 14));
  const k = (t % 14) / 14;
  return (
    <div style={{ position: "absolute", top: 540, right: 70, width: 150, height: 150, borderRadius: 999, background: "#E8432C", border: "8px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.15 * (1 - k)})`, boxShadow: "0 10px 0 rgba(0,0,0,0.3)" }}>
      <Sticker text={`${left}`} size={90} outline="rgba(0,0,0,0.4)" />
    </div>
  );
};

export const Ad4MentalMath: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = playBox(PLAY, SCALE, BAND_TOP, BAND_BOTTOM, frame, fps);
  const value = valueOf(abacusAt(PLAY, frame).values);
  const sumVis = windowIn(frame, SUM_FROM - 10, SUM_TO, 10);
  const plateY = box.top - 150;
  const step = stepAt(frame);

  return (
    <AbsoluteFill style={{ fontFamily: KID_FONT }}>
      <World kind="spaceB" />

      {/* hook */}
      <HookBurst frame={frame} fps={fps} until={66} x={AD_W / 2} y={1120} text="⚡" size={240} rays="rgba(124,77,255,0.5)" />
      <PopLine frame={frame} fps={fps} at={0} until={66} y={190} text="Quick!" size={120} color="#FFD84D" outline="#3A1A6E" />
      <PopLine frame={frame} fps={fps} at={0} until={66} y={340} text="47 + 38 = ?" size={150} outline="#3A1A6E" />
      <Timer frame={frame} />

      {/* the sum on beads */}
      {sumVis > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: sumVis }}>
          <div style={{ position: "absolute", top: 300, left: 0, width: AD_W, display: "flex", justifyContent: "center", gap: 24 }}>
            <Panel bg="#FFFFFF" base={ACCENT} radius={999} pad="10px 40px">
              <div style={{ fontWeight: 700, fontSize: 64, color: "#2A1A6E" }}>47 + 38</div>
            </Panel>
            {frame >= 80 && (
              <div style={{ transform: `scale(${popIn(frame, fps, frame < 182 ? 80 : 182)})` }}>
                <Panel bg={step.c} base="rgba(0,0,0,0.3)" radius={999} pad="10px 36px">
                  <Sticker text={step.op} size={64} outline="rgba(0,0,0,0.4)" />
                </Panel>
              </div>
            )}
          </div>
          {frame >= 84 && frame < WIN + 4 && (
            <div style={{ position: "absolute", top: 1650, left: 0, width: AD_W, display: "flex", justifyContent: "center", transform: `scale(${popIn(frame, fps, frame < 128 ? 84 : frame < 182 ? 128 : 182)})` }}>
              <Panel bg="#FFFFFF" base={step.c} radius={999} pad="8px 36px">
                <div style={{ fontWeight: 700, fontSize: 58, color: "#2A1A6E" }}>{step.rule}</div>
              </Panel>
            </div>
          )}
          <PlayableAbacus frame={frame} fps={fps} play={PLAY} scale={SCALE} top={BAND_TOP} bottom={BAND_BOTTOM} palette={BB_RIGS.space} placeNames />
          <NumberPlate frame={frame} value={value} flashAt={FLASHES} x={AD_W / 2} y={plateY} ink="#2A1A6E" />
          <PopLine frame={frame} fps={fps} at={WIN + 4} until={SUM_TO} y={1660} text="= 85 ✔" size={88} color="#7CFFB2" outline="#0B3A20" />
        </div>
      )}
      <GameHud frame={frame} fps={fps} level="Speed round" starAt={[WIN, ...MIND_SUMS.map((s) => s.at + 16)]} accent={ACCENT} showFrom={SUM_FROM} hideAt={MIND_TO + 60} />
      <StarGain frame={frame} at={WIN + 2} x={AD_W * 0.8} y={plateY + 20} />

      {/* the abacus moves into Robo's head */}
      {frame >= SUM_TO && frame < MIND_TO && (
        <div style={{ position: "absolute", inset: 0, opacity: windowIn(frame, SUM_TO, MIND_TO) }}>
          <div style={{ position: "absolute", top: 260, left: 0, width: AD_W, display: "flex", justifyContent: "center", transform: `scale(${popIn(frame, fps, SUM_TO + 2)})` }}>
            <Sticker text={"Then the beads move\nin their head ✨"} size={84} style={{ textAlign: "center", display: "block" }} />
          </div>
          {/* thought bubble with a glowing ghost abacus */}
          <div style={{ position: "absolute", left: AD_W / 2 - 300, top: 560, width: 600, height: 440, borderRadius: 220, background: "rgba(255,255,255,0.14)", border: "6px solid rgba(255,255,255,0.7)", boxShadow: "0 0 80px rgba(160,120,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${popIn(frame, fps, SUM_TO + 6)})` }}>
            <div style={{ opacity: 0.75, filter: "drop-shadow(0 0 18px #B9A2FF)" }}>
              <Abacus rods={[{ value: (frame >> 3) % 10 }, { value: (frame >> 4) % 10 }]} scale={0.8} palette={BB_RIGS.space} />
            </div>
          </div>
          <svg width={AD_W} height={AD_H} style={{ position: "absolute", inset: 0 }}>
            <circle cx={AD_W / 2 - 40} cy={1050} r={26} fill="rgba(255,255,255,0.5)" />
            <circle cx={AD_W / 2 - 70} cy={1110} r={16} fill="rgba(255,255,255,0.5)" />
          </svg>
          {MIND_SUMS.map((s, i) => {
            if (frame < s.at) return null;
            const answered = frame >= s.at + 16;
            return (
              <div key={i} style={{ position: "absolute", top: 1180 + i * 150, left: 0, width: AD_W, display: "flex", justifyContent: "center", transform: `scale(${popIn(frame, fps, s.at)})` }}>
                <Panel bg={answered ? "#2EB85C" : "#FFFFFF"} base="rgba(0,0,0,0.3)" radius={999} pad="10px 44px">
                  <div style={{ fontWeight: 700, fontSize: 70, color: answered ? "#FFFFFF" : "#2A1A6E" }}>
                    {s.q} = {answered ? `${s.a} ✔` : "?"}
                  </div>
                </Panel>
              </div>
            );
          })}
        </div>
      )}

      {frame >= RESULT_AT && frame < 436 && (
        <div style={{ opacity: 1 - ramp(frame, 426, 436) }}>
          <ResultPopup frame={frame} startFrame={RESULT_AT} title="Speed round!" subtitle="3 / 3 correct" stars={3} accent={ACCENT} x={AD_W / 2 - 380} y={560} width={760} />
        </div>
      )}

      <svg width={AD_W} height={AD_H} viewBox={`0 0 ${AD_W} ${AD_H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={AD_W / 2} y={plateY + 60} frame={frame} fps={fps} startFrame={WIN} />
        <Celebration x={AD_W / 2} y={800} frame={frame} fps={fps} startFrame={RESULT_AT + 6} />
        <Celebration x={AD_W / 2} y={800} frame={frame} fps={fps} startFrame={RESULT_AT + 30} />
        {frame >= SUM_TO && frame < MIND_TO && <Critter kind="robo" x={AD_W / 2 - 160} y={AD_H * 0.9} scale={1.3} mood={frame > MIND_SUMS[0].at ? "cheer" : "tilt"} frame={frame} fps={fps} />}
      </svg>

      {!(frame >= SUM_TO && frame < MIND_TO) && (
        <AdBuddies frame={frame} fps={fps} kinds={["alien", "robo"]} mood={[frame >= WIN && frame < WIN + 30 ? "cheer" : frame < SUM_FROM ? "tilt" : "calm", frame >= RESULT_AT ? "cheer" : "calm"]} />
      )}

      <AdEndCard frame={frame} fps={fps} headline="Start with Level 1 FREE" sub="Beads first, then mental math" accent={ACCENT} dim="rgba(8,6,30,0.55)" />
      <BrandBadge portrait dark />
      <AdSound cues={AD4_SFX} />
    </AbsoluteFill>
  );
};
