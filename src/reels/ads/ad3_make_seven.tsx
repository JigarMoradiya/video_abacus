// AD 3 — "Can your child make 7?" Proof ad: the app's own playable tutorial, rebuilt. A finger
// swipes real beads (lower beads first, then the upper bead), the number plate flashes gold,
// stars land, then the Small Friend trick (4 + 3: +3 = −2 +5, lower beads first). World: pirate island;
// characters Parrot and Crab.
//
// Beats (30 fps): 0-60 hook · 60-200 make 7 · 200-330 4 + 3 Small Friend · 330-432 tutorial
// steps + FREE · 432-480 free trial · 480-600 end card.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { World } from "../../components/World";
import { Celebration } from "../../components/heroes/Celebration";
import { BB_RIGS } from "../../data/bbworlds";
import { BrandBadge } from "../../components/Brand";
import {
  AD_H, AD_W, AdBuddies, AdEndCard, AdSound, END_SFX, TRIAL_AT, GameHud, GoalChip, HookBurst, NumberPlate, Panel, PlayableAbacus, PopLine, StarGain, Sticker,
  abacusAt, playBox, type BuddyMood, popIn, ramp, valueOf, windowIn, type AbacusPlay, type AdSfx,
} from "./AdKit";
import { KID_FONT } from "../../lib/fonts";

const ACCENT = "#2E9E62";
const SCALE = 1.85;
const BAND_TOP = 560;
const BAND_BOTTOM = 1520;

const PLAY: AbacusPlay = {
  rods: 3,
  start: [0, 0, 0],
  moves: [
    // make 7: two lower beads up, then the upper bead down
    { at: 92, to: [2, 0, 0], hand: { rod: 0, heaven: false, direction: "up", digit: "thumb" } },
    { at: 136, to: [7, 0, 0], hand: { rod: 0, heaven: true, direction: "down", digit: "index" } },
    // next step: the abacus shows 4 ...
    { at: 214, dur: 8, to: [4, 0, 0] },
    // ... + 3 with no lower beads left: Small Friend +3 = −2 +5, lower beads first: two lower beads down (−2) ...
    { at: 266, to: [2, 0, 0], hand: { rod: 0, heaven: false, direction: "down", digit: "index" } },
    // ... then the upper bead down (+5)
    { at: 304, to: [7, 0, 0], hand: { rod: 0, heaven: true, direction: "down", digit: "index" } },
  ],
};
const WIN_1 = 146;
const WIN_2 = 314;
const FLASHES = [102, 146, 222, 276, 314];
const ABACUS_OUT = 336;

export const AD3_SFX: AdSfx[] = [
  { frame: 0, file: "gz_hook.mp3" },
  { frame: 14, file: "gz_star.mp3" },
  { frame: 60, file: "gz_tap.mp3" },
  { frame: 92, file: "bead_add.mp3" },
  { frame: 136, file: "bead_upper_swap.mp3" },
  { frame: WIN_1, file: "gz_correct.mp3" },
  { frame: WIN_1 + 4, file: "gz_star.mp3" },
  { frame: 214, file: "abacus_move.mp3" },
  { frame: 236, file: "gz_benefit.mp3" },
  { frame: 266, file: "bead_subtract.mp3" },
  { frame: 304, file: "bead_upper_swap.mp3" },
  { frame: WIN_2, file: "gz_win.mp3" },
  { frame: 340, file: "gz_star.mp3" },
  ...END_SFX,
];

const STEPS = ["1", "3", "7", "2+1", "4+3"];

export const Ad3MakeSeven: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = playBox(PLAY, SCALE, BAND_TOP, BAND_BOTTOM, frame, fps);
  const value = valueOf(abacusAt(PLAY, frame).values);
  const abacusOp = 1 - ramp(frame, ABACUS_OUT, ABACUS_OUT + 10);
  const plateY = box.top - 150;

  const mood = (who: 0 | 1): BuddyMood => {
    if (frame < 60) return "cheer";
    if ((frame >= WIN_1 && frame < WIN_1 + 50) || (frame >= WIN_2 && frame < WIN_2 + 60)) return "cheer";
    if (frame >= 236 && frame < 266) return who === 0 ? "calm" : "tilt";
    return "calm";
  };

  return (
    <AbsoluteFill style={{ fontFamily: KID_FONT }}>
      <World kind="pirateA" />

      {/* the playable abacus + plate */}
      {frame < ABACUS_OUT + 10 && (
        <>
          <PlayableAbacus frame={frame} fps={fps} play={PLAY} scale={SCALE} top={BAND_TOP} bottom={BAND_BOTTOM} palette={BB_RIGS.pirate} focusRod={0} opacity={abacusOp} />
          <div style={{ opacity: abacusOp * ramp(frame, 56, 64) }}>
            <NumberPlate frame={frame} value={value} flashAt={FLASHES} x={AD_W / 2} y={plateY} ink="#1F5A33" />
          </div>
        </>
      )}

      {/* hook */}
      <HookBurst frame={frame} fps={fps} until={60} x={AD_W / 2} y={1050} text="7" size={280} />
      <PopLine frame={frame} fps={fps} at={0} until={60} y={210} text="Can your child" size={112} />
      <PopLine frame={frame} fps={fps} at={10} until={60} y={350} text="make 7?" size={170} color="#FFD84D" outline="#5A2E00" tilt={-3} />

      <GameHud frame={frame} fps={fps} level="Level 1" starAt={[WIN_1, WIN_2, 360]} accent={ACCENT} showFrom={56} />
      {frame < 200 && <GoalChip frame={frame} fps={fps} at={62} text="Make 7" y={300} bg="#FF8A3D" done={frame >= WIN_1} />}
      {frame >= 200 && frame < ABACUS_OUT && <GoalChip frame={frame} fps={fps} at={204} text="4 + 3" y={300} bg="#7E57C2" done={frame >= WIN_2} />}

      {/* the win text after step 1 */}
      <PopLine frame={frame} fps={fps} at={WIN_1 + 4} until={200} y={1560} text="You made 7! 🎉" size={78} color="#FFFFFF" outline="#1F5A33" />

      {/* Small Friend trick card */}
      {frame >= 232 && frame < ABACUS_OUT && (
        <div style={{ position: "absolute", top: 1545, left: 0, width: AD_W, display: "flex", justifyContent: "center", transform: `scale(${popIn(frame, fps, 232)})`, opacity: windowIn(frame, 232, ABACUS_OUT) }}>
          <Panel bg="#FFFFFF" base="#7E57C2" pad="16px 34px">
            <div style={{ textAlign: "center" }}>
              <Sticker text="Small Friend trick" size={46} color="#7E57C2" outline="#FFFFFF" />
              <div style={{ fontSize: 70, fontWeight: 700, color: "#3A1F6E", lineHeight: 1.1 }}>
                +3 = <span style={{ color: "#E8432C" }}>− 2</span> <span style={{ color: "#2E9E62" }}>+ 5</span>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* step-by-step tutorial path, FREE */}
      {frame >= ABACUS_OUT && frame < TRIAL_AT && (
        <div style={{ position: "absolute", top: 520, left: 0, width: AD_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 44, opacity: windowIn(frame, ABACUS_OUT, TRIAL_AT) }}>
          <div style={{ transform: `scale(${popIn(frame, fps, ABACUS_OUT + 2)})` }}>
            <Sticker text={"Learn it step\nby step"} size={104} style={{ textAlign: "center", display: "block" }} />
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            {STEPS.map((s, i) => {
              const at = ABACUS_OUT + 14 + i * 8;
              const k = popIn(frame, fps, at);
              return (
                <div key={s} style={{ transform: `scale(${k}) translateY(${Math.sin((frame + i * 9) / 9) * 6}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 150, height: 150, borderRadius: 999, background: i < 3 ? "#FF8A3D" : "#7E57C2", border: "7px solid #FFFFFF", boxShadow: "0 10px 0 rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sticker text={s} size={s.length > 1 ? 50 : 72} outline="rgba(0,0,0,0.4)" />
                  </div>
                  <span style={{ fontSize: 40 }}>{frame >= at + 10 ? "⭐" : "☆"}</span>
                </div>
              );
            })}
          </div>
          <div style={{ transform: `scale(${popIn(frame, fps, ABACUS_OUT + 60)})` }}>
            <Panel bg="#FFD84D" base="#B7791F" radius={999} pad="16px 48px">
              <Sticker text="Playable tutorial · FREE" size={60} color="#FFFFFF" outline="#7A4A00" />
            </Panel>
          </div>
        </div>
      )}

      <StarGain frame={frame} at={WIN_1 + 2} x={AD_W * 0.78} y={plateY + 20} />
      <StarGain frame={frame} at={WIN_2 + 2} x={AD_W * 0.78} y={plateY + 20} />

      <svg width={AD_W} height={AD_H} viewBox={`0 0 ${AD_W} ${AD_H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={AD_W / 2} y={plateY + 60} frame={frame} fps={fps} startFrame={WIN_1} />
        <Celebration x={AD_W / 2} y={plateY + 60} frame={frame} fps={fps} startFrame={WIN_2} />
        <Celebration x={AD_W * 0.3} y={900} frame={frame} fps={fps} startFrame={ABACUS_OUT + 60} />
        <Celebration x={AD_W * 0.7} y={900} frame={frame} fps={fps} startFrame={ABACUS_OUT + 66} />
      </svg>

      <AdBuddies frame={frame} fps={fps} kinds={["parrot", "crab"]} mood={[mood(0), mood(1)]} />

      <AdEndCard frame={frame} fps={fps} headline="Try the tutorial FREE" sub="Real beads · Real progress" accent={ACCENT} />
      <BrandBadge portrait />
      <AdSound cues={AD3_SFX} />
    </AbsoluteFill>
  );
};
