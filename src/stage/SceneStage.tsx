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
import { PartArrow } from "../components/PartArrow";
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
  groupBox,
  handAnchor,
  lowerBeadY,
  rodBand as rodBandRect,
  rodX,
  sectionBand,
  upperBeadY,
  type AbacusBox,
  type Pt,
} from "./geometry";
import {
  applyLiveBeads,
  applySweep,
  clockAt,
  rodsWithFrom,
  runSlotMap,
  runStartFor,
  smoothField,
} from "./clock";
import { StageLabel } from "./cards";
import type { CardSpec, Scene } from "./types";

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
}: SceneStageProps<S>) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const { p, startF: phraseStart, endF: phraseEnd, beatProgress, settle, linePop } =
    clockAt(phrases, frame, FPS);
  const scene = sceneFor(p);
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
  const panelRight = scene.panelSide ? scene.panelSide === "right" : tRodX > W / 2;

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
  const panelX = aboveRod
    ? Math.max(40, Math.min(W - 40 - panelW, tRodX - panelW / 2))
    : panelRight
    ? W - 60 - panelW
    : 60;
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
    phraseStart,
    tRodX,
    onesCx,
    panel: { x: panelX, y: panelY, w: panelW, h: cardH },
  };

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
      {scene.counter && (
        <div
          style={{ position: "absolute", top: 52, left: 0, width: W, textAlign: "center" }}
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
            settle={scene.liveBeads ? liveSettle : settle}
            highlight={scene.highlight}
            scale={scale}
            count={scene.count ?? null}
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
            const { y, len } = handAnchor(box, scene.hand.heaven, scene.hand.direction);
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
                // Bow AWAY from the card. PartArrow offsets the control point along
                // (-dy, dx)/len, so its y-component is dx/len; matching the bow's sign to
                // dx pushes the arc out of a bottom exit, and flipping it does the same
                // upward for a top exit. Signing it any other way curved the arc back
                // across the card, which read as an arrow starting from the side.
                bow={
                  (exitTop ? -1 : 1) *
                  Math.sign(to.x - from.x || 1) *
                  (aboveRod ? 70 : 120)
                }
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
