// The interpreter: Scene -> pixels.
//
// One abacus instance, one world instance, driven by the ABSOLUTE frame. There are no
// per-beat <Sequence> wrappers around the stage, because a remount between beats restarts
// idle motion and snaps beads mid-travel. Beats decide state, not ownership.
//
// The layer order below is load-bearing and matches E01's shipped render exactly:
//   world · wash · brand · headline · counter · stage · under · hand
//   · rod band · section band · group box · arrow · card · sum · beadWorth · label
//   · over · caption · sfx · narration
// Episode content enters through the slots (`renderProp`, `renderUnder`, `renderOver`)
// so that inserting it cannot reorder the annotation layers.

import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Abacus } from "../components/Abacus";
import { BeadWorth, SumBreakdown } from "../components/BeadWorth";
import { BrandBadge, HeadlinePill, PoweredBy } from "../components/Brand";
import { Caption } from "../components/Caption";
import { FingerHand } from "../components/FingerHand";
import { PartArrow, samplePath } from "../components/PartArrow";
import { Chip } from "../components/Sticker";
import { SegPanel, cardHeight, segsLines, segsWidth } from "../components/Tooltip";
import { WORLDS } from "../data/theme";
import { World } from "../components/World";
import {
  BAND,
  BEAD_H,
  FPS,
  H,
  HEAVEN_H,
  PLACE_COLORS,
  W,
} from "../data/tokens";
import { bob, pulse } from "../lib/motion";
import { TYPE } from "../lib/fonts";
import { sec, type Track, type TPhrase } from "../lib/timing";
import {
  abacusBox,
  beamY,
  contains,
  groupBox,
  handAnchor,
  intersects,
  lowerBeadY,
  rodBand as rodBandRect,
  rodX,
  sectionBand,
  upperBeadY,
  type AbacusBox,
  type Pt,
  type Rect,
} from "./geometry";
import {
  applyLiveBeads,
  applyRodRamp,
  applySweep,
  clockAt,
  rodsWithFrom,
  runSlotMap,
  runStartFor,
  smoothField,
  spokenCount,
  wordFrameIn,
} from "./clock";
import { StageLabel } from "./cards";
import type { CardSpec, Scene } from "./types";

/** A box that must not be covered by, or cover, any other content. */
export interface GuardBox {
  label: string;
  r: Rect;
  /** The hand reaches in to touch a bead, so it is allowed to sit over the abacus. */
  mayTouchAbacus?: boolean;
}

export interface SfxCue {
  frame: number;
  file: string;
  len: number;
  vol: number;
}

/** What the episode's slots get to draw with. */
export interface StageCtx {
  frame: number;
  fps: number;
  /** phrase index */
  p: number;
  box: AbacusBox;
  /** 0..1 through the current phrase */
  beatProgress: number;
  /** 0..1 bead travel for this frame. A prop that stands for the count must follow this,
   *  or it announces the move before the beads make it. */
  settle: number;
  /** absolute frame the phrase starts on — pass `frame - phraseStart` to prop components */
  phraseStart: number;
  /** centre X of the rod this line is about, and of the ones rod */
  tRodX: number;
  onesCx: number;
  /** the card box, so an episode extra can line up with it instead of guessing */
  panel: { x: number; y: number; w: number; h: number };
}

export interface SceneStageProps<S extends Scene> {
  phrases: TPhrase[];
  track: Track;
  sceneFor: (p: number) => S;
  /** narration, relative to public/ */
  narration: string;
  sfx?: SfxCue[];
  /** Frame the abacus first appears on, so its arrival is a real reveal. */
  abacusFirstFrame?: number;
  /** The teaching card for a line, if it has one. */
  cardFor?: (p: number) => CardSpec | undefined;
  /** What the line is ABOUT, for grouping consecutive lines into one card run. A line with
   *  no card but the same subject continues the run; a line about nothing ends it. */
  subjectFor?: (p: number) => unknown;
  /** Vertical slots for successive card runs, so consecutive sections differ but a single
   *  card never moves while it is on screen. */
  runSlots?: number[];
  /** Draw a non-abacus stage prop. */
  renderProp?: (stage: string, scene: S, ctx: StageCtx) => React.ReactNode;
  /** Episode extras UNDER the annotation layer (chips below the abacus, and so on). */
  renderUnder?: (scene: S, ctx: StageCtx) => React.ReactNode;
  /** Episode extras OVER everything but the caption (quiz cards, close compositions). */
  renderOver?: (scene: S, ctx: StageCtx) => React.ReactNode;
  /**
   * Boxes the episode's own slots occupy, so the overlap check can see them. SceneStage
   * cannot measure what it does not draw.
   */
  boxesFor?: (scene: S, ctx: StageCtx) => GuardBox[];
  /**
   * Fail the render if any two pieces of content overlap (EPISODE_RULES.md §4). Opt-in:
   * E01 is approved and frozen, and enabling it there would change an accepted episode.
   */
  guardOverlap?: boolean;
  /**
   * Widen the arrow's bow when its target sits roughly level with the card, so the arc
   * cannot pass back through the card. Separate from `guardOverlap` because E01 shipped with
   * the flat bow and wants the check without the change.
   */
  arrowClearance?: boolean;
}

const DEFAULT_SLOTS = [120, 265, 195, 345];

export const SceneStage = <S extends Scene>({
  phrases,
  track,
  sceneFor,
  narration,
  sfx = [],
  abacusFirstFrame,
  cardFor,
  subjectFor,
  runSlots = DEFAULT_SLOTS,
  renderProp,
  renderUnder,
  renderOver,
  boxesFor,
  guardOverlap,
  arrowClearance,
}: SceneStageProps<S>) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const { p, startF: phraseStart, endF: phraseEnd, beatProgress, linePop } =
    clockAt(phrases, frame, FPS);
  const scene = sceneFor(p);
  // Bead travel begins on the word that commands it, not at the line's start.
  const moveF =
    (scene.moveOn ? wordFrameIn(phrases[p], scene.moveOn, FPS) : null) ?? phraseStart;
  const settle = interpolate(frame, [moveF, moveF + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const world = WORLDS[scene.world];
  const scale = smoothField(phrases, frame, FPS, sceneFor, (s) => s.scale);

  // ---- rods: only the beads the next number needs may travel ----
  const prevScene = p > 0 ? sceneFor(p - 1) : scene;
  const sameRig =
    prevScene.rods.length === scene.rods.length && prevScene.stage === scene.stage;
  let rods = rodsWithFrom(scene.rods, prevScene.rods, sameRig);
  if (scene.sweepRods) {
    rods = applySweep(rods, scene.sweepRods, frame, phraseStart, phraseEnd);
  }
  let liveSettle = 1;
  if (scene.liveBeads) {
    const live = applyLiveBeads(rods, frame, phraseStart);
    rods = live.rods;
    liveSettle = live.settle;
  }
  if (scene.rodRamp) {
    const ramp = applyRodRamp(rods, scene.rodRamp, frame, phraseStart, phraseEnd);
    rods = ramp.rods;
    liveSettle = ramp.settle;
  }

  // The abacus springs in on the frame it is first named, and stays put after.
  const firstF = abacusFirstFrame ?? 0;
  const reveal =
    frame < firstF
      ? 1
      : interpolate(frame, [firstF, firstF + 12], [0.7, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const box = abacusBox(scene.rods.length, scale, width, frame, FPS);
  const { left, top, w: abacusW, h: abacusH } = box;

  // ---- where the card goes, and what the arrow points at ----
  // Rule: the card sits on the SAME SIDE as the bead being discussed, so the arrow is short
  // and unambiguous. A card pinned left while the subject was the rightmost rod meant the
  // pointer crossed the whole abacus.
  const targetRod = scene.targetRod ?? Math.floor(scene.rods.length / 2);
  const tRodX = rodX(box, targetRod);
  // The SIDE is decided from the phrase's own target scale with no bob — never from the live
  // box. `scale` ramps across a phrase boundary, and where the target rod sits near the
  // screen centre (E01's default middle rod lands at x=959 against a centre of 960) the ramp
  // walks it across the threshold and the card jumps from one side to the other while it is
  // on screen. A card must not move while the viewer is reading it.
  const sideBox = abacusBox(scene.rods.length, scene.scale, width, 0, FPS);
  const panelRight = scene.panelSide
    ? scene.panelSide === "right"
    : rodX(sideBox, targetRod) > W / 2;

  const cardKeyAt = React.useCallback(
    (i: number) => (cardFor ? cardFor(i)?.key : undefined),
    [cardFor]
  );
  const slotOf = React.useMemo(
    () => runSlotMap(phrases.length, cardKeyAt, runSlots),
    [phrases.length, cardKeyAt, runSlots]
  );
  const run = cardFor
    ? runStartFor(p, cardKeyAt, (i) => (subjectFor ? subjectFor(i) : undefined))
    : null;
  const card = run ? cardFor!(run.start) : undefined;

  const panelW = scene.sumBreakdown
    ? 520 // the SumBreakdown card's own fixed width
    : card
    ? segsWidth(card.segs)
    : (() => {
        const s = scene.sideLabel?.text ?? "";
        const longest = Math.max(...s.split("\n").map((l) => l.length), 6);
        return Math.round(
          Math.min(500, Math.max(240, longest * TYPE.tooltip.size * 0.58 + 84))
        );
      })();
  const aboveRod = scene.panelPlace === "aboveRod";
  const panelXRaw = aboveRod
    ? Math.max(40, Math.min(W - 40 - panelW, tRodX - panelW / 2))
    : panelRight
    ? W - 60 - panelW
    : 60;
  // A fixed 60 px margin assumes the card fits the gap beside the abacus. The app's own
  // tour cards cap at 560 px and the gap is 527, so those overhung the frame by 13 px —
  // twice, once in each episode. Slide the card out until it clears, and only as far as the
  // canvas edge allows.
  // Tight on purpose. E01's finger section runs the abacus at PUSH scale, leaving 560 px
  // each side, and the app's "Add upper · index finger · down" card is 552 — so the only way
  // to clear the frame at all is to sit close to the canvas edge. The alternatives were
  // shrinking the close-up (bead detail is the whole point of that section) or cutting the
  // app's own wording, and neither is worth 20 px of margin. E01 previously overlapped the
  // frame here by 52 px.
  const CLEAR = 4;
  const EDGE = 4;
  const panelX =
    !guardOverlap || aboveRod
      ? panelXRaw
      : panelRight
      ? Math.min(W - EDGE - panelW, Math.max(panelXRaw, left + abacusW + CLEAR))
      : Math.max(EDGE, Math.min(panelXRaw, left - CLEAR - panelW));
  // the card's real height, so the arrow can start ON its edge instead of near it
  const cardH = cardHeight(
    card ? segsLines(card.segs) : (scene.sideLabel?.text ?? "").split("\n").length
  );
  const panelY = aboveRod
    // high enough that the card clears the abacus and the arrow has room to be seen
    ? BAND.stageTop - 168 + bob(frame, FPS, 6, 3.8)
    : BAND.stageTop + (run ? slotOf[run.start] ?? 190 : 190) + bob(frame, FPS, 6, 3.8);
  // pop and arrow-draw progress measured from the RUN's first frame, so neither restarts
  const runStart = sec(phrases[run?.start ?? p].start, FPS);
  const runProgress = interpolate(frame, [runStart, runStart + 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bandRect = scene.band ? sectionBand(box, scene.band) : null;
  const rodBand = scene.rodBand !== undefined ? rodBandRect(box, scene.rodBand) : null;
  const gbox = scene.boxRods ? groupBox(box, scene.boxRods) : null;

  const arrowTarget: Pt | null = (() => {
    // a whole-rod band is the target when there is one — aim at its top edge
    if (rodBand) return { x: rodBand.x + rodBand.w / 2, y: rodBand.y + 14 };
    // a whole-section band — aim at its near edge
    if (bandRect) {
      return panelRight
        ? { x: bandRect.x + bandRect.w - 10, y: bandRect.y + bandRect.h / 2 }
        : { x: bandRect.x + 10, y: bandRect.y + bandRect.h / 2 };
    }
    // a card sitting over its rod points straight down at that rod's top bead
    if (aboveRod) return { x: tRodX, y: box.innerTop + BEAD_H * 0.4 * scale };
    // a boxed group — aim at the near edge
    if (gbox) {
      return panelRight
        ? { x: gbox.x + gbox.w + 4, y: gbox.y + gbox.h * 0.5 }
        : { x: gbox.x - 4, y: gbox.y + gbox.h * 0.5 };
    }
    const val = scene.rods[targetRod]?.value ?? 0;
    switch (scene.highlight) {
      case "frame":
        return { x: panelRight ? left + abacusW - 12 : left + 12, y: top + abacusH * 0.8 };
      case "beam":
        return { x: tRodX, y: beamY(box) };
      case "rods":
        return { x: tRodX, y: box.innerTop + (HEAVEN_H - BEAD_H * 0.3) * scale };
      case "top":
        // the heaven bead's actual position: down at the beam when the rod reads 5+
        return { x: tRodX, y: upperBeadY(box, val >= 5) };
      case "bottom":
        // the topmost earth bead, up against the beam when any are raised
        return { x: tRodX, y: lowerBeadY(box, val % 5 > 0 ? 0.5 : 1.5) };
      default:
        return null;
    }
  })();

  // stage-space position of the ones rod, for the hand
  const onesCx = rodX(box, 0);

  const ctx: StageCtx = {
    frame,
    fps: FPS,
    p,
    box,
    beatProgress,
    settle,
    phraseStart,
    tRodX,
    onesCx,
    panel: { x: panelX, y: panelY, w: panelW, h: cardH },
  };

  // ---- everything that carries content, and must not be covered ----
  // The abacus is listed separately: bands, arrows and the hand legitimately sit over it,
  // but a CARD never may.
  const guardBoxes: GuardBox[] = (() => {
    if (!guardOverlap) return [];
    const out: GuardBox[] = [];
    if (scene.headline) {
      // the pill is centred and sized from its text; a generous box is the safe direction
      const w = Math.min(W - 120, scene.headline.length * 34 + 160);
      out.push({ label: "headline", r: { x: (W - w) / 2, y: 30, w, h: 96 } });
    }
    if (scene.counter) {
      const w = scene.counter.length * 34 + 90;
      out.push({
        label: "counter",
        r: { x: (W - w) / 2, y: scene.headline ? 128 : 52, w, h: 72 },
      });
    }
    if (card) out.push({ label: "card", r: { x: panelX, y: panelY, w: panelW, h: cardH } });
    if (scene.centreNote) {
      const w = Math.max(200, scene.centreNote.length * 19 + 70);
      out.push({
        label: "centreNote",
        r: { x: tRodX - w / 2, y: top + abacusH + 18, w, h: 62 },
      });
    }
    if (scene.sideLabel && !card) {
      const above = !aboveRod && (scene.labelPos ?? "side") === "above";
      if (above) {
        // it renders centred in the headline band, not at the side slot — checking the side
        // slot would have been a check of the wrong rectangle
        const t = scene.sideLabel.text;
        const big = /\d/.test(t) && t.replace(/\s/g, "").length <= 7;
        const size = big ? 104 : 46;
        const w = Math.max(160, t.length * size * 0.6 + 80);
        out.push({ label: "label", r: { x: (W - w) / 2, y: 24, w, h: size * 1.35 + 40 } });
      } else {
        out.push({ label: "label", r: { x: panelX, y: panelY, w: panelW, h: cardH } });
      }
    }
    if (scene.hand) {
      // FingerHand reaches in from the right of its rod, with its digit chip above it
      const hx = rodX(box, scene.hand.rod);
      const { y } = handAnchor(box, scene.hand.heaven, scene.hand.direction, rods[scene.hand.rod]?.from ?? 0);
      out.push({
        label: "hand",
        r: { x: hx - 20, y: y - 150 * scale, w: 420 * scale, h: 300 * scale },
        mayTouchAbacus: true,
      });
    }
    return [...out, ...(boxesFor ? boxesFor(scene, ctx) : [])];
  })();

  if (guardOverlap) {
    const abacusRect: Rect = { x: left, y: top, w: abacusW, h: abacusH };
    for (let i = 0; i < guardBoxes.length; i++) {
      const a = guardBoxes[i];
      if (!a.mayTouchAbacus && intersects(a.r, abacusRect, -6)) {
        throw new Error(
          `"${a.label}" overlaps the abacus on phrase ${p} — ` +
            `[${a.r.x.toFixed(0)},${a.r.y.toFixed(0)} ${a.r.w.toFixed(0)}x${a.r.h.toFixed(0)}] ` +
            `vs [${left.toFixed(0)},${top.toFixed(0)} ${abacusW.toFixed(0)}x${abacusH.toFixed(0)}]`
        );
      }
      for (let j = i + 1; j < guardBoxes.length; j++) {
        const b = guardBoxes[j];
        if (intersects(a.r, b.r, -6)) {
          throw new Error(
            `"${a.label}" and "${b.label}" overlap on phrase ${p} — ` +
              `[${a.r.x.toFixed(0)},${a.r.y.toFixed(0)} ${a.r.w.toFixed(0)}x${a.r.h.toFixed(0)}] ` +
              `vs [${b.r.x.toFixed(0)},${b.r.y.toFixed(0)} ${b.r.w.toFixed(0)}x${b.r.h.toFixed(0)}]`
          );
        }
      }
    }
  }

  const dashRamp = (from: number, to: number) =>
    interpolate(runProgress, [from, to], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <World kind={scene.world} />
      {scene.worldWash !== undefined && (
        <AbsoluteFill style={{ background: `rgba(255,255,255,${scene.worldWash})` }} />
      )}
      <BrandBadge />
      <PoweredBy />

      {/* HEADLINE band — a pill, so it reads on both bright and dark worlds */}
      {scene.headline && (
        <div
          style={{
            position: "absolute",
            top: 30,
            width: W,
            textAlign: "center",
            transform: `scale(${pulse(frame, FPS, 0.012, 3)})`,
          }}
        >
          <HeadlinePill
            text={scene.headline}
            fill={world.pill}
            ink={world.pill === "#FFFFFF" ? world.ink : "#FFFFFF"}
            size={scene.headline.includes("\n") ? 54 : 62}
          />
        </div>
      )}

      {/* Centred, not top-right: at top-right it sat underneath the brand badge. */}
      {/* Below the pill when there is one. Both sat at ~30-52 and rendered as one card
          nested inside another; the headline band (0-200) has room for both stacked. */}
      {scene.counter && (
        <div
          style={{
            position: "absolute",
            top: scene.headline ? 128 : 52,
            left: 0,
            width: W,
            textAlign: "center",
          }}
        >
          <Chip label={scene.counter} color={world.accent} size={54} />
        </div>
      )}

      {/* STAGE */}
      {scene.stage === "abacus" && !scene.closing && (
        <div
          style={{
            position: "absolute",
            left,
            top,
            // spring in on the reveal frame, then a small bounce on every new line
            transform: `scale(${reveal * linePop})`,
            transformOrigin: "center",
          }}
        >
          <Abacus
            rods={rods}
            settle={scene.liveBeads || scene.rodRamp ? liveSettle : settle}
            highlight={scene.highlight}
            scale={scale}
            count={scene.count ?? null}
            countLimit={
              scene.countOnNumbers ? spokenCount(phrases[p], frame, FPS) : undefined
            }
          />
        </div>
      )}

      {scene.stage !== "abacus" && renderProp && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: BAND.stageTop,
            width: W,
            height: BAND.stageBottom - BAND.stageTop,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {renderProp(scene.stage, scene, ctx)}
        </div>
      )}

      {/* names the target rod, directly under it */}
      {scene.centreNote && (
        <div
          style={{
            position: "absolute",
            left: tRodX - 230,
            top: top + abacusH + 18,
            width: 460,
            textAlign: "center",
          }}
        >
          <Chip label={scene.centreNote} color={PLACE_COLORS[0]} size={34} />
        </div>
      )}

      {renderUnder?.(scene, ctx)}

      {/* the hand, over the ones rod */}
      {scene.hand && (
        <svg
          width={W}
          height={H}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {(() => {
            const { y, len } = handAnchor(
              box,
              scene.hand.heaven,
              scene.hand.direction,
              rods[scene.hand.rod]?.from ?? 0
            );
            return (
              <FingerHand
                digit={scene.hand.digit}
                direction={scene.hand.direction}
                scale={scale * 0.82}
                x={onesCx}
                y={y}
                len={len}
              />
            );
          })()}
        </svg>
      )}

      {/* the whole-rod band */}
      {rodBand && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <rect
            x={rodBand.x}
            y={rodBand.y}
            width={rodBand.w}
            height={rodBand.h}
            rx={18}
            fill={PLACE_COLORS[0]}
            opacity={0.15 * dashRamp(0, 0.25)}
          />
          <rect
            x={rodBand.x}
            y={rodBand.y}
            width={rodBand.w}
            height={rodBand.h}
            rx={18}
            fill="none"
            stroke={PLACE_COLORS[0]}
            strokeWidth={7}
            strokeDasharray="22 14"
            strokeDashoffset={-(frame % 36)}
            opacity={dashRamp(0, 0.25)}
          />
        </svg>
      )}

      {/* the whole-section band */}
      {bandRect && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <rect x={bandRect.x} y={bandRect.y} width={bandRect.w} height={bandRect.h} rx={16}
            fill={world.accent} opacity={0.18 * dashRamp(0, 0.25)}
          />
          <rect x={bandRect.x} y={bandRect.y} width={bandRect.w} height={bandRect.h} rx={16}
            fill="none" stroke={world.accent} strokeWidth={7} strokeDasharray="24 15"
            strokeDashoffset={-(frame % 39)} opacity={dashRamp(0, 0.25)}
          />
        </svg>
      )}

      {/* the group box for the capacity lines */}
      {gbox && (
        <svg
          width={W}
          height={H}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <rect
            x={gbox.x}
            y={gbox.y}
            width={gbox.w}
            height={gbox.h}
            rx={22}
            fill="none"
            stroke={world.accent}
            strokeWidth={8}
            strokeDasharray="26 16"
            strokeDashoffset={-(frame % 42)}
            opacity={interpolate(beatProgress, [0, 0.2], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
        </svg>
      )}

      {(scene.highlight || gbox || aboveRod || bandRect || rodBand) &&
        (scene.sideLabel || scene.beadWorth || card) &&
        (() => {
          const to = arrowTarget;
          if (!to) return null;
          // ALWAYS the centre of the card's top or bottom edge — top when the target is
          // above the card, bottom when below. The origin sits exactly ON that edge so the
          // stroke is flush; offsetting it outward left a visible gap, and there is no dot
          // to bridge it.
          const cardCx = panelX + panelW / 2;
          const cardCy = panelY + cardH / 2;
          const exitTop = to.y < cardCy;
          const from: Pt = { x: cardCx, y: exitTop ? panelY : panelY + cardH };
          const cardBox: Rect = { x: panelX, y: panelY, w: panelW, h: cardH };
          // Guard rather than eyeball: the arrow's origin must lie inside the card it comes
          // out of. Every positioning bug this series shipped was an origin computed from
          // one coordinate system while the card used another, and every one was found by a
          // human watching the video. This fails the render instead.
          const SLACK = 12;
          if (
            from.x < panelX - SLACK ||
            from.x > panelX + panelW + SLACK ||
            from.y < panelY - SLACK ||
            from.y > panelY + cardH + SLACK
          ) {
            throw new Error(
              `arrow origin (${from.x.toFixed(0)},${from.y.toFixed(0)}) is outside its card ` +
                `[${panelX.toFixed(0)},${panelY.toFixed(0)} ${panelW}x${cardH}] on line ${p}`
            );
          }
          // Bow AWAY from the card. PartArrow offsets the control point along (-dy, dx)/len,
          // so its y-component is dx/len; matching the bow's sign to dx pushes the arc out
          // of a bottom exit, and flipping it does the same upward for a top exit. Signing
          // it any other way curves the arc back across the card.
          const dir = (exitTop ? -1 : 1) * Math.sign(to.x - from.x || 1);
          // A target roughly LEVEL with the card gives a nearly horizontal chord, so a
          // modest bow arcs out and straight back through the card — visible as an arrow
          // that appears cut off behind it. The swing has to clear the card's own half
          // width, so scale the bow to the card rather than using one constant.
          const base = aboveRod ? 70 : 120;
          // Separate flag from guardOverlap on purpose: E01 wants the overlap CHECK but not
          // this geometry change, which altered 18 of its 79 approved frames.
          const level = arrowClearance && Math.abs(to.y - cardCy) < cardH;
          const bow = dir * (level ? Math.max(base, panelW * 0.55 + 60) : base);

          // The path must not pass through the card it comes out of, or through anything
          // else on screen. Checked here rather than by eye: this is the failure the user
          // found at "four is as high as the lower beads can go".
          if (guardOverlap) {
            const path = samplePath(from, to, bow);
            for (const pt of path.slice(3, -1)) {
              if (contains(cardBox, pt, -10)) {
                throw new Error(
                  `arrow path re-enters its own card on phrase ${p} ` +
                    `(bow ${bow.toFixed(0)}, card ${panelW}x${cardH}) — increase the bow ` +
                    `or move the card`
                );
              }
              for (const g of guardBoxes) {
                if (g.label !== "card" && contains(g.r, pt, -6)) {
                  throw new Error(
                    `arrow path crosses "${g.label}" on phrase ${p} — move the card or the prop`
                  );
                }
              }
            }
          }

          return (
            <svg
              width={W}
              height={H}
              style={{ position: "absolute", inset: 0, overflow: "visible" }}
            >
              <PartArrow
                from={from}
                to={to}
                progress={runProgress}
                color={world.accent}
                bow={bow}
                frame={frame - phraseStart}
                fps={FPS}
              />
            </svg>
          );
        })()}

      {/* the teaching card for this line, when there is one */}
      {card && (
        <div style={{ position: "absolute", left: panelX, top: panelY, width: panelW }}>
          <SegPanel
            segs={card.segs}
            color={card.color}
            progress={runProgress}
            width={panelW}
          />
        </div>
      )}

      {scene.sumBreakdown && (
        <div
          style={{
            position: "absolute",
            left: panelX,
            top: BAND.stageTop + 20 + bob(frame, FPS, 6, 3.8),
            width: panelW,
            textAlign: "center",
          }}
        >
          <SumBreakdown
            upper={scene.sumBreakdown.upper}
            lower={scene.sumBreakdown.lower}
            progress={beatProgress}
          />
        </div>
      )}

      {scene.beadWorth && !card && (
        <div
          style={{
            position: "absolute",
            left: panelX,
            top: BAND.stageTop + 150 + bob(frame, FPS, 7, 3.6),
            width: panelW,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <BeadWorth
            which={scene.beadWorth.which}
            worth={scene.beadWorth.worth}
            progress={beatProgress}
          />
        </div>
      )}

      {scene.sideLabel && !card && (
        <StageLabel
          text={scene.sideLabel.text}
          color={scene.sideLabel.color}
          frame={frame}
          limit={left}
          pos={aboveRod ? "aboveRod" : scene.labelPos ?? "side"}
          x={panelX}
          y={panelY}
          w={panelW}
        />
      )}

      {renderOver?.(scene, ctx)}

      {!scene.noCaption && (
        <Caption track={track} frame={frame} ink={world.ink} accent={world.accent} />
      )}

      {/* SFX on every real event: a bead click where beads actually move, the app's chime
          on a reveal, its clap on praise. Kept quiet so nothing competes with narration —
          E01's first pass pushed the mix to 0.0 dB, i.e. clipping. */}
      {sfx.map((c, i) => (
        <Sequence key={i} from={c.frame} durationInFrames={c.len}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol} />
        </Sequence>
      ))}

      {/* A wrong path here renders SILENT with no error — check every rename. */}
      <Audio src={staticFile(narration)} />
    </AbsoluteFill>
  );
};
