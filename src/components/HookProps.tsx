// Props for the opening, where the abacus must NOT be on screen yet.
//
// The rule this fixes: the stage shows what the narration is talking about. The first
// build parked the abacus on stage from frame 0, so "This is an abacus" on line 4
// revealed an object the viewer had been staring at for thirteen seconds, while lines
// about counting and fingers had no matching visual at all.

import React from "react";
import { interpolate, spring } from "remotion";
import { KID_FONT } from "../lib/fonts";
import { Abacus } from "./Abacus";
import { BEAD } from "../data/theme";

/** Numbers climbing to 100, then the sum that stops them. */
export const CountingRun: React.FC<{
  frame: number;
  fps: number;
  /** 0-1 through the beat; the sum lands in the last third */
  progress: number;
}> = ({ frame, fps, progress }) => {
  const count = Math.min(100, Math.floor(interpolate(progress, [0, 0.55], [1, 100], {
    extrapolateRight: "clamp",
  })));
  const showSum = progress > 0.58;
  const sumPop = spring({
    frame: Math.max(0, frame - Math.round(0.58 * 4 * fps)),
    fps,
    config: { damping: 12 },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      {/* a rising ladder of numbers — the skill the child already has */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 150 }}>
        {[4, 3, 2, 1, 0].map((back) => {
          const n = count - back;
          if (n < 1) return <div key={back} style={{ width: 118 }} />;
          const lead = back === 0;
          return (
            <div
              key={back}
              style={{
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: lead ? 108 : 66,
                color: "#FFFFFF",
                opacity: lead ? 1 : 0.28 + (4 - back) * 0.12,
                lineHeight: 1,
              }}
            >
              {n}
            </div>
          );
        })}
      </div>

      {/* the sum that stops them */}
      {showSum && (
        <div
          style={{
            transform: `scale(${0.6 + sumPop * 0.4})`,
            background: "#F4511E",
            borderRadius: 34,
            padding: "18px 54px",
            boxShadow: "0 10px 0 rgba(0,0,0,0.28)",
          }}
        >
          <span
            style={{
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 104,
              color: "#FFF",
              lineHeight: 1,
            }}
          >
            7 + 8 = ?
          </span>
        </div>
      )}
    </div>
  );
};

/** Two hands, fingers popping up one at a time — counting on fingers. */
export const CountingFingers: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const t = frame / fps;
  const up = Math.min(8, 1 + Math.floor(t * 3.2)); // pops up to 8, the sum being counted
  const skin = "#F3B58C";
  const line = "#C97F55";

  const Hand: React.FC<{ flip?: boolean; from: number }> = ({ flip, from }) => (
    <g transform={flip ? "scale(-1,1) translate(-330,0)" : undefined}>
      {/* palm */}
      <rect x={60} y={190} width={210} height={150} rx={54} fill={skin} stroke={line} strokeWidth={5} />
      {/* four fingers */}
      {[0, 1, 2, 3].map((i) => {
        const isUp = from + i < up;
        const h = isUp ? 168 : 44;
        const x = 78 + i * 50;
        return (
          <rect
            key={i}
            x={x}
            y={200 - h}
            width={42}
            height={h + 40}
            rx={21}
            fill={skin}
            stroke={line}
            strokeWidth={5}
          />
        );
      })}
      {/* thumb */}
      <rect
        x={20}
        y={244}
        width={110}
        height={44}
        rx={22}
        fill={skin}
        stroke={line}
        strokeWidth={5}
      />
    </g>
  );

  return (
    <svg width={760} height={380} viewBox="0 0 760 380" style={{ overflow: "visible" }}>
      <g transform="translate(0,20)">
        <Hand from={0} />
      </g>
      <g transform="translate(430,20)">
        <Hand from={4} />
      </g>
      {/* the tally, so the "counting" is legible and not just wiggling fingers */}
      <g transform="translate(380,-6)">
        <rect x={-58} y={-52} width={116} height={72} rx={26} fill={BEAD.onBottom} />
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fill="#FFF"
          fontSize={54}
          fontWeight={700}
          fontFamily={KID_FONT}
        >
          {up}
        </text>
      </g>
    </svg>
  );
};

/** A staircase with one step missing — "there's a little step missing". */
export const MissingStep: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const t = frame / fps;
  const steps = [0, 1, 2, 3, 4];
  const missing = 2;

  // THE STAIRCASE BUILDS ITSELF, and then something tries to climb it.
  //
  // It used to be five static blocks with one dashed outline blinking — the only moving thing on a
  // line that is the whole reason the episode exists ("there's a little step missing"). A gap you are
  // told about is an assertion; a gap something falls into is an argument.
  //
  //   0.0s  the steps rise in from the left, one every 0.16s
  //   0.9s  a ball hops up them, and STOPS at the gap — twice, so it reads as stuck rather than
  //         mistimed
  //   throughout  the missing step pulses, so the eye knows where the answer should be
  const stepIn = (i: number) =>
    Math.max(0, Math.min(1, (t - i * 0.16) / 0.26));
  const blink = 0.45 + 0.55 * Math.abs(Math.sin(t * 2.2));

  const W = 140;
  const H = 62;
  const xOf = (i: number) => 40 + i * W * 0.95;
  const yOf = (i: number) => 350 - i * H;

  // the climber: hops 0 -> 1 -> stalls at the gap, waits, tries again
  const HOP = 0.42;
  const START = 0.95;
  const cycle = 2.6;
  const ct = Math.max(0, (t - START)) % cycle;
  const hop = Math.min(2, Math.floor(ct / HOP));
  const within = Math.min(1, (ct - hop * HOP) / HOP);
  // on the third hop it tries to reach the missing step and drops back
  const stalled = ct >= 2 * HOP;
  const reach = stalled ? Math.max(0, 1 - (ct - 2 * HOP) / 0.5) : within;
  const from = Math.min(hop, 1);
  const to = Math.min(hop + 1, 2);
  const bx = xOf(from) + (xOf(to) - xOf(from)) * (stalled ? reach * 0.55 : within) + W / 2;
  const by =
    yOf(from) + (yOf(to) - yOf(from)) * (stalled ? reach * 0.55 : within) - 26
    - Math.sin(Math.PI * (stalled ? reach : within)) * 46;

  return (
    <svg width={760} height={430} viewBox="0 0 760 430" style={{ overflow: "visible" }}>
      {steps.map((i) => {
        const k = stepIn(i);
        if (k <= 0) return null;
        const x = xOf(i);
        const y = yOf(i);
        // each step slides up into place rather than appearing
        const dy = (1 - k) * 34;
        if (i === missing) {
          return (
            <g key={i} opacity={blink * k} transform={`translate(0 ${dy})`}>
              <rect
                x={x}
                y={y}
                width={W}
                height={H}
                rx={12}
                fill="none"
                stroke="#FFD166"
                strokeWidth={7}
                strokeDasharray="18 14"
              />
              <text
                x={x + W / 2}
                y={y + 46}
                textAnchor="middle"
                fill="#FFD166"
                fontSize={46}
                fontWeight={700}
                fontFamily={KID_FONT}
              >
                ?
              </text>
            </g>
          );
        }
        return (
          <g key={i} opacity={k} transform={`translate(0 ${dy})`}>
            <rect x={x} y={y + 6} width={W} height={H} rx={12} fill="#000" opacity={0.25} />
            <rect x={x} y={y} width={W} height={H} rx={12} fill="#7C6BD8" />
            <rect x={x} y={y} width={W} height={12} rx={6} fill="#FFF" opacity={0.3} />
          </g>
        );
      })}

      {/* the climber, once the staircase is up */}
      {t > START && (
        <g>
          <ellipse cx={bx} cy={by + 26} rx={17} ry={5} fill="#000" opacity={0.18} />
          <circle cx={bx} cy={by} r={20} fill="#FF7043" stroke="#C1440E" strokeWidth={4} />
          <circle cx={bx - 6} cy={by - 6} r={5} fill="#FFF" opacity={0.75} />
        </g>
      )}
    </svg>
  );
};

/**
 * "People used abacuses to solve maths problems long before calculators were invented."
 *
 * Div-based rather than one big SVG, for reasons found the hard way: the abacus at the left
 * end was hand-drawn here with circular beads and wrong proportions instead of using the
 * real <Abacus>, and every label was a fixed-width <rect> whose text overflowed it, so the
 * backgrounds looked clipped. The abacus is now the real component and every label is an
 * auto-width div that cannot be outgrown by its own text.
 */
export const HistoryTimeline: React.FC<{ frame: number; fps: number; progress: number }> = ({
  frame,
  fps,
  progress,
}) => {
  const t = frame / fps;
  const W = 1460;
  const H = 470;
  const barY = 300;
  const x0 = 150;
  const x1 = W - 170;

  const drawn = interpolate(progress, [0.05, 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const calcIn = interpolate(progress, [0.58, 0.78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gapIn = interpolate(progress, [0.8, 0.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const float = Math.sin(t * 1.6) * 5;

  const pill = (bg: string, ink = "#FFFFFF", size = 30): React.CSSProperties => ({
    display: "inline-block",
    background: bg,
    color: ink,
    fontFamily: KID_FONT,
    fontWeight: 700,
    fontSize: size,
    borderRadius: 999,
    padding: "10px 28px",
    whiteSpace: "nowrap",
    boxShadow: "0 6px 0 rgba(0,0,0,0.18)",
  });

  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect x={x0} y={barY - 7} width={(x1 - x0) * drawn} height={14} rx={7} fill="#FFFFFF" opacity={0.92} />
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
          <circle
            key={i}
            cx={x0 + (x1 - x0) * f}
            cy={barY}
            r={10}
            fill="#FFFFFF"
            opacity={drawn > f ? 0.96 : 0.28}
          />
        ))}
        <g opacity={gapIn}>
          <path
            d={`M ${x0 + 40} ${barY - 66} L ${x1 - 40} ${barY - 66}`}
            stroke="#FFD166"
            strokeWidth={7}
            strokeDasharray="18 13"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* the abacus end — the REAL component, so the beads are the video's own beads */}
      <div
        style={{
          position: "absolute",
          left: x0 - 100,
          top: barY - 214 + float,
          opacity: Math.min(1, drawn * 3),
        }}
      >
        <Abacus rods={[{ value: 8 }, { value: 4 }, { value: 6 }]} scale={0.36} />
      </div>
      <div
        style={{ position: "absolute", left: x0 - 88, top: barY + 36, opacity: Math.min(1, drawn * 3) }}
      >
        <span style={pill(BEAD.onBottom)}>~4000 years ago</span>
      </div>

      {/* the calculator end — late, and smaller */}
      <div
        style={{
          position: "absolute",
          left: x1 - 56,
          top: barY - 190,
          transform: `scale(${0.6 + calcIn * 0.4})`,
          transformOrigin: "bottom left",
          opacity: calcIn,
        }}
      >
        <svg width={130} height={168}>
          <rect x={0} y={0} width={130} height={168} rx={16} fill="#37474F" />
          <rect x={12} y={12} width={106} height={38} rx={7} fill="#A8D5A2" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} x={15 + c * 36} y={62 + r * 33} width={28} height={23} rx={6} fill="#607D8B" />
            ))
          )}
        </svg>
      </div>
      <div style={{ position: "absolute", left: x1 - 72, top: barY + 36, opacity: calcIn }}>
        <span style={pill("#37474F")}>only 1970s</span>
      </div>

      {/* the gap, which is the point of the sentence */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: barY - 128,
          width: W,
          textAlign: "center",
          opacity: gapIn,
        }}
      >
        <span style={pill("#FFD166", "#4A2600", 34)}>the abacus came FIRST</span>
      </div>
    </div>
  );
};
