// One world per beat. This is the layer that makes the video feel like a place rather
// than a UI screen, and the reason no two stretches of the episode look alike.
//
// Still ONE instance for the whole episode: the world's props change, the component
// never remounts, so cloud drift and star twinkle keep running across a scene change
// instead of jumping back to their start.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { WORLDS, type WorldKind } from "../data/theme";

const rand = (i: number): number => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const World: React.FC<{ kind: WorldKind }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = frame / fps;
  const w = WORLDS[kind];
  const groundY = H * 0.74;
  const portrait = H > W;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${w.sky[0]} 0%, ${w.sky[1]} 100%)`,
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="sunG">
            <stop offset="0%" stopColor="#FFF3B0" />
            <stop offset="70%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FFC107" />
          </radialGradient>
          <radialGradient id="vig">
            <stop offset="45%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.62} />
          </radialGradient>
        </defs>

        {/* blueprint grid — reads as a technical drawing while parts get named */}
        {w.grid && (
          <g opacity={0.3}>
            {Array.from({ length: Math.ceil(W / 80) }, (_, i) => (
              <line
                key={`v${i}`}
                x1={i * 80}
                y1={0}
                x2={i * 80}
                y2={H}
                stroke={w.accent}
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: Math.ceil(H / 80) }, (_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                y1={i * 80}
                x2={W}
                y2={i * 80}
                stroke={w.accent}
                strokeWidth={1}
              />
            ))}
          </g>
        )}

        {/* stars — twinkle is deterministic from frame time */}
        {w.stars &&
          Array.from({ length: 60 }, (_, i) => {
            const x = rand(i + 1) * W;
            const y = rand(i + 91) * H * 0.8;
            const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.7 + i));
            return (
              <circle key={i} cx={x} cy={y} r={rand(i + 41) * 3 + 1.4} fill="#FFF" opacity={tw * 0.9} />
            );
          })}

        {w.sun && (
          <g>
            <circle cx={W * 0.09} cy={H * 0.14} r={92} fill="url(#sunG)" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2 + t * 0.12;
              const r1 = 108;
              const r2 = 108 + 34 + Math.sin(t * 1.4 + i) * 8;
              return (
                <line
                  key={i}
                  x1={W * 0.09 + Math.cos(a) * r1}
                  y1={H * 0.14 + Math.sin(a) * r1}
                  x2={W * 0.09 + Math.cos(a) * r2}
                  y2={H * 0.14 + Math.sin(a) * r2}
                  stroke="#FFD54F"
                  strokeWidth={9}
                  strokeLinecap="round"
                  opacity={0.85}
                />
              );
            })}
          </g>
        )}

        {/* Clouds drift across and wrap, so there is always motion on screen.
            Built from overlapping lobes of varied size and offset — a cartoon cloud is a
            union of blobs, and every cloud gets its own arrangement so five clouds do not
            read as one repeated. An earlier attempt drew a single path with bumps along a
            flat baseline and came out as a row of humps. */}
        {w.clouds &&
          Array.from({ length: 5 }, (_, i) => {
            const speed = 13 + i * 5;
            const x = ((rand(i + 7) * W + t * speed) % (W + 560)) - 280;
            const y = H * (0.07 + rand(i + 23) * 0.25);
            // Cloud lobes are absolute px, tuned against a 1920 frame. Left alone in the
            // 1080-wide 4:5 cut they filled a third of the sky and swallowed the headline.
            const fit = H > W ? 0.58 : 1;
            // `cloudSize` defaults to 1, which is E01/E02's shipped size. E03 dials it down: at
            // full size the biggest clouds spanned nearly a third of a 1920 frame and read as
            // weather rather than as scenery.
            const s = (0.7 + rand(i + 55) * 0.75) * fit * (w.cloudSize ?? 1);
            const lobeCount = 4 + Math.floor(rand(i + 71) * 3); // 4-6

            const lobes = Array.from({ length: lobeCount }, (_, k) => {
              const f = k / (lobeCount - 1); // 0..1 across the cloud
              const rx = 42 + rand(i * 31 + k * 7 + 1) * 46;
              const ry = rx * (0.62 + rand(i * 37 + k * 11 + 2) * 0.3);
              return {
                cx: -120 + f * 240 + (rand(i * 41 + k * 13 + 3) - 0.5) * 34,
                // bigger lobes sit higher, and the bottoms stay near the same line
                cy: -ry * (0.35 + rand(i * 43 + k * 17 + 4) * 0.5),
                rx,
                ry,
              };
            });

            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
                {/* flat-ish base so the cloud sits on air rather than floating as blobs */}
                <ellipse
                  cx={0}
                  cy={0}
                  rx={148}
                  ry={34}
                  fill={w.cloudInk ?? "#FFFFFF"}
                  opacity={w.cloudAlpha ?? 0.97}
                />
                {lobes.map((l, k) => (
                  <ellipse
                    key={k}
                    cx={l.cx}
                    cy={l.cy}
                    rx={l.rx}
                    ry={l.ry}
                    fill={w.cloudInk ?? "#FFFFFF"}
                    opacity={w.cloudAlpha ?? 0.97}
                  />
                ))}
                {/* Faint shading along the underside. At E01's 0.45 it read on E03's teal skies
                    as a grey stain across the bottom of every cloud — the "clouds look too dark"
                    note — so that episode's worlds turn it down with `cloudShade`. */}
                <ellipse cx={6} cy={12} rx={132} ry={20} fill={w.cloudShadeInk ?? "#CFE4F5"} opacity={w.cloudShade ?? 0.45} />
              </g>
            );
          })}

        {/* ------------------------------------------------------------------ seaside
            Sea, wet sand, dry sand, and foam that runs up the beach and back. Drawn before
            everything else on the ground so the castle, the parasol and the shells sit ON it.
            Three bands rather than one: a single sand rectangle is what made the first pass
            of these worlds read as a gradient with a box at the bottom. */}
        {w.beach && (() => {
          // PORTRAIT: the horizon comes UP. At the shared fraction the sea line lands below the
          // abacus's feet, so the instrument appears to float over the water with a field of empty
          // sand beneath it. Raising it puts the abacus ON the beach, which is where it belongs,
          // and spends the 4:5 cut's extra height on the thing worth seeing.
          const at = w.beach.at - (H > W ? 0.1 : 0);
          const sea = { ...w.beach, at };
          return (
          <g>
            <rect x={0} y={H * sea.at} width={W} height={H} fill={sea.sea} />
            {/* The horizon has to be a LINE. Sea against sky, both blue, both gradients, read
                as one wash with a slight step in it. */}
            <rect x={0} y={H * sea.at - 3} width={W} height={7} fill="#FFFFFF" opacity={0.55} />
            {/* swell lines, wider and further apart as they come towards us */}
            {Array.from({ length: 5 }, (_, i) => {
              const y = H * sea.at + 10 + i * 15;
              const phase = Math.sin(t * 0.8 + i * 1.1);
              const half = (W * (0.16 + i * 0.07)) / 2;
              return (
                <rect
                  key={`sw${i}`}
                  x={W * 0.5 - half + phase * 30}
                  y={y}
                  width={half * 2}
                  height={6}
                  rx={3}
                  fill="#FFFFFF"
                  opacity={0.22}
                />
              );
            })}
            {/* wet sand, then dry sand — the tide line is what says "beach" */}
            <path
              d={`M 0 ${H * sea.at + 96} Q ${W * 0.3} ${H * sea.at + 74 + Math.sin(t * 0.5) * 8} ${W * 0.56} ${H * sea.at + 100} T ${W} ${H * sea.at + 84} L ${W} ${H} L 0 ${H} Z`}
              fill={sea.wet}
            />
            {/* foam on the tide line, running up and back */}
            <path
              d={`M 0 ${H * sea.at + 96} Q ${W * 0.3} ${H * sea.at + 74 + Math.sin(t * 0.5) * 8} ${W * 0.56} ${H * sea.at + 100} T ${W} ${H * sea.at + 84}`}
              stroke="#FFFFFF"
              strokeWidth={9 + Math.sin(t * 0.9) * 3}
              fill="none"
              opacity={0.75}
              strokeLinecap="round"
            />
            {/* Fish, drawn BEFORE the sand so the sand always covers their bottom edge — a fish
                overlapping the beach is the one way this can go wrong. Each swims its own way at
                its own speed and wraps, and the tail beats off frame time, so there is always
                something alive in the water. Deterministic: position is a pure function of t. */}
            {Array.from({ length: w.fish ?? 0 }, (_, i) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const seaTop = H * sea.at + 14;
              const seaH = 74;
              const dirRight = i % 2 === 0;
              const speed = 34 + rand(i + 13) * 46;
              const span = W + 200;
              const raw = (t * speed + rand(i + 29) * span) % span;
              const x = dirRight ? raw - 100 : W + 100 - raw;
              const y = seaTop + rand(i + 47) * seaH + Math.sin(t * 1.3 + i * 2) * 5;
              const sc = (1.15 + rand(i + 61) * 0.6) * (H > W ? 0.82 : 1);
              // tail beat
              const wag = Math.sin(t * 7 + i * 1.9) * 9;
              const col = ["#FFC244", "#FF8A4C", "#FFE08A", "#F4A259", "#FFD166"][i % 5];
              return (
                <g
                  key={`fi${i}`}
                  transform={`translate(${x},${y}) scale(${dirRight ? sc : -sc},${sc})`}
                  opacity={0.9}
                >
                  <ellipse cx={0} cy={0} rx={22} ry={12} fill={col} />
                  <path d={`M -19 0 L ${-39} ${-12 + wag} L ${-39} ${12 + wag} Z`} fill={col} />
                  {/* dorsal fin and a pale belly, so it reads as a fish and not a leaf */}
                  <path d="M 1 -10 L 9 -19 L 15 -9 Z" fill={col} opacity={0.85} />
                  <ellipse cx={-1} cy={5} rx={14} ry={5} fill="#FFFFFF" opacity={0.3} />
                  <circle cx={12} cy={-2} r={2.7} fill="#0B3B45" />
                </g>
              );
            })}
            <path
              d={`M 0 ${H * sea.at + 168} Q ${W * 0.36} ${H * sea.at + 140} ${W * 0.66} ${H * sea.at + 176} T ${W} ${H * sea.at + 152} L ${W} ${H} L 0 ${H} Z`}
              fill={sea.sand}
            />
          </g>
          );
        })()}

        {/* Gulls: two shallow V's gliding across, high up. The sky above the headline band is
            the one region no episode content ever uses. */}
        {w.gulls &&
          [0, 1].map((i) => {
            const x = ((t * (28 + i * 11) + i * 900) % (W + 320)) - 160;
            const y = H * (0.08 + i * 0.055) + Math.sin(t * 0.7 + i * 2) * 14;
            const flap = Math.sin(t * 3.4 + i) * 12;
            const s = 1 - i * 0.25;
            return (
              <g key={`gl${i}`} transform={`translate(${x},${y}) scale(${s})`} opacity={0.6}>
                <path
                  d={`M -34 0 Q -17 ${-14 - flap} 0 -2 Q 17 ${-14 - flap} 34 0`}
                  stroke="#FFFFFF"
                  strokeWidth={5}
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

        {/* Bunting: a slung line of triangle flags. Cheap, instantly playful, and it lives in
            the top corners where the headline pill never reaches. */}
        {w.bunting && (
          <g>
            {(() => {
              const y0 = H * 0.045;
              const sagAt = (f: number) => y0 + Math.sin(f * Math.PI) * H * 0.055;
              const n = Math.max(8, Math.round(W / 130));
              const pts = Array.from({ length: n + 1 }, (_, i) => ({
                x: (i / n) * W,
                y: sagAt(i / n) + Math.sin(t * 0.9 + i * 0.4) * 3,
              }));
              return (
                <>
                  <path
                    d={pts.map((q, i) => `${i ? "L" : "M"} ${q.x} ${q.y}`).join(" ")}
                    stroke="#FFFFFF"
                    strokeWidth={4}
                    fill="none"
                    opacity={0.8}
                  />
                  {pts.slice(0, -1).map((q, i) => {
                    const nx = pts[i + 1];
                    const mx = (q.x + nx.x) / 2;
                    const my = (q.y + nx.y) / 2;
                    const flagW = (nx.x - q.x) * 0.82;
                    const sway = Math.sin(t * 1.6 + i * 0.7) * 4;
                    return (
                      <path
                        key={`bn${i}`}
                        d={`M ${mx - flagW / 2} ${my} L ${mx + flagW / 2} ${my} L ${mx + sway} ${my + 72} Z`}
                        fill={w.bunting![i % w.bunting!.length]}
                        opacity={0.95}
                      />
                    );
                  })}
                </>
              );
            })()}
          </g>
        )}

        {/* A sandcastle, bottom-left, below the stage band. Three stacked blocks, crenellations
            and a flag that flutters — more is more, which is the lesson. */}
        {w.sandcastle && (
          <g transform={`translate(${W * 0.075} ${H * 0.93}) scale(${H > W ? 0.7 : 0.85})`} opacity={0.95}>
            {[
              { w: 250, h: 54, y: 0 },
              { w: 190, h: 50, y: -54 },
              { w: 130, h: 46, y: -104 },
            ].map((b, i) => (
              <g key={`sc${i}`}>
                <rect x={-b.w / 2} y={b.y - b.h} width={b.w} height={b.h} fill="#E0BC85" />
                <rect x={-b.w / 2} y={b.y - b.h} width={b.w} height={7} fill="#F6DCAE" />
                {Array.from({ length: Math.floor(b.w / 40) }, (_, k) => (
                  <rect
                    key={k}
                    x={-b.w / 2 + 6 + k * 40}
                    y={b.y - b.h - 16}
                    width={22}
                    height={18}
                    fill="#E0BC85"
                  />
                ))}
              </g>
            ))}
            <line x1={0} y1={-150} x2={0} y2={-216} stroke="#8A5A2E" strokeWidth={6} />
            <path
              d={`M 0 -216 L ${58 + Math.sin(t * 2.4) * 8} -202 L 0 -186 Z`}
              fill="#EF5D5D"
            />
          </g>
        )}

        {/* A striped parasol, bottom-right. Placed low and to the edge: the stage band and the
            card gutters both need to stay clear of it.

            16:9 ONLY. In 4:5 the bucket owns the bottom-left and the plus character the
            bottom-right, and every position left over put the canopy either under the character or
            half outside the frame — a parasol sliced by the frame edge is worse than no parasol.
            The starfish and shells carry the beach dressing in that cut: they are small and set
            well away from the edges, so they cannot be cut. */}
        {w.umbrella && !portrait && (
          // At 0.9 the canopy sat exactly where the plus character stands in the 16:9 cut. Out at
          // the edge it reads as a parasol further down the beach and leaves the gutter free.
          <g transform={`translate(${W * 0.975} ${H * 0.94}) scale(0.9)`}>
            <line x1={6} y1={-236} x2={-4} y2={26} stroke="#9C6B3A" strokeWidth={9} />
            {Array.from({ length: 8 }, (_, i) => {
              const a0 = Math.PI + (i / 8) * Math.PI;
              const a1 = Math.PI + ((i + 1) / 8) * Math.PI;
              const R = 150;
              return (
                <path
                  key={`um${i}`}
                  d={`M 6 -236 L ${6 + Math.cos(a0) * R} ${-236 - Math.sin(a0) * R * 0.42} A ${R} ${R * 0.42} 0 0 1 ${6 + Math.cos(a1) * R} ${-236 - Math.sin(a1) * R * 0.42} Z`}
                  fill={i % 2 ? "#FFFFFF" : "#EF5D5D"}
                />
              );
            })}
            <ellipse cx={6} cy={-234} rx={150} ry={9} fill="#C74A48" opacity={0.5} />
          </g>
        )}

        {/* Starfish and shells on the sand: five of each, in fixed spots that avoid the middle
            third, because the middle third is where the abacus stands. */}
        {w.shellsOnSand &&
          [
            { x: 0.06, y: 0.94, k: 0 },
            { x: 0.17, y: 0.88, k: 1 },
            { x: 0.28, y: 0.96, k: 0 },
            { x: 0.72, y: 0.95, k: 1 },
            { x: 0.84, y: 0.89, k: 0 },
            { x: 0.94, y: 0.95, k: 1 },
          ].map((o, i) => {
            const x = W * o.x;
            const y = H * o.y;
            const wob = Math.sin(t * 0.6 + i) * 2;
            return o.k === 0 ? (
              <g key={`sf${i}`} transform={`translate(${x},${y}) rotate(${i * 27 + wob})`}>
                {Array.from({ length: 5 }, (_, k) => (
                  <ellipse
                    key={k}
                    cx={0}
                    cy={-22}
                    rx={9}
                    ry={24}
                    fill="#F2843C"
                    transform={`rotate(${k * 72})`}
                  />
                ))}
                <circle r={9} fill="#FFB067" />
              </g>
            ) : (
              <g key={`sh${i}`} transform={`translate(${x},${y}) rotate(${wob * 2})`}>
                <path d="M -26 6 A 26 26 0 0 1 26 6 Z" fill="#FFF1E0" stroke="#E0B48C" strokeWidth={2.5} />
                {[-16, -8, 0, 8, 16].map((dx) => (
                  <line key={dx} x1={0} y1={6} x2={dx} y2={-20} stroke="#E0B48C" strokeWidth={2} />
                ))}
              </g>
            );
          })}

        {/* rolling hills */}
        {w.hills && w.ground && (
          <g>
            <path
              d={`M 0 ${groundY + 40} Q ${W * 0.22} ${groundY - 70} ${W * 0.5} ${groundY + 10} T ${W} ${groundY - 20} L ${W} ${H} L 0 ${H} Z`}
              fill={w.ground}
              opacity={0.55}
            />
            <path
              d={`M 0 ${groundY + 90} Q ${W * 0.3} ${groundY + 4} ${W * 0.62} ${groundY + 70} T ${W} ${groundY + 30} L ${W} ${H} L 0 ${H} Z`}
              fill={w.ground}
            />
          </g>
        )}

        {/* heaven / earth split — the beam's own metaphor, used while the two
            sections are being named */}
        {w.horizon && w.ground && (
          <g>
            <rect
              x={0}
              y={H * w.horizon.at}
              width={W}
              height={H * w.horizon.h}
              fill={w.ground}
              opacity={0.92}
            />
            <rect x={0} y={H * (w.horizon.at - 0.005)} width={W} height={12} fill="#FFF" opacity={0.5} />
          </g>
        )}

        {/* two things side by side */}
        {w.divider && (
          <line
            x1={W * 0.5}
            y1={0}
            x2={W * 0.5}
            y2={H}
            stroke="#FFF"
            strokeWidth={6}
            opacity={0.4}
            strokeDasharray="22 18"
          />
        )}

        {/* a surface to work on */}
        {w.surface && w.ground && (
          <g>
            <rect x={0} y={H * w.surface.at} width={W} height={H * w.surface.h} fill={w.ground} />
            <rect x={0} y={H * w.surface.at} width={W} height={10} fill={w.surface.edge} />
          </g>
        )}

        {/* board + tray */}
        {w.slate && (
          <g>
            <rect x={70} y={70} width={W - 140} height={H - 260} rx={18} fill="#000" opacity={0.14} />
            <rect x={0} y={H * 0.82} width={W} height={H * 0.18} fill={w.slate.tray} />
          </g>
        )}

        {/* Still water. The zero world: the pond is flat because nothing has been counted
            yet, so the only motion is the ripples and a lily pad turning. */}
        {w.water && (
          <g>
            <rect
              x={0}
              y={H * w.water.at}
              width={W}
              height={H * (1 - w.water.at) + 2}
              fill="#2C3E70"
              opacity={0.55}
            />
            <rect x={0} y={H * w.water.at} width={W} height={5} fill="#FFF" opacity={0.35} />
            {/* reflection bands, widening with distance so the surface reads as flat */}
            {Array.from({ length: 7 }, (_, i) => {
              const y = H * w.water!.at + 26 + i * 44;
              const phase = Math.sin(t * 0.7 + i * 0.9);
              const half = (W * (0.1 + i * 0.055)) / 2;
              return (
                <rect
                  key={`rf${i}`}
                  x={W * 0.5 - half + phase * 22}
                  y={y}
                  width={half * 2}
                  height={7}
                  rx={3.5}
                  fill="#FFE0C0"
                  opacity={0.16 + 0.05 * Math.cos(t * 0.9 + i)}
                />
              );
            })}
            {/* lily pads: a notched disc each, drifting a few px and rocking */}
            {[
              { x: 0.10, y: 0.12, r: 84 },
              { x: 0.88, y: 0.26, r: 72 },
              { x: 0.22, y: 0.58, r: 64 },
              { x: 0.78, y: 0.68, r: 96 },
            ].map((pad, i) => {
              const cx = W * pad.x + Math.sin(t * 0.35 + i * 1.7) * 9;
              const cy = H * w.water!.at + (H * (1 - w.water!.at)) * pad.y;
              const rock = Math.sin(t * 0.5 + i) * 4;
              return (
                <g key={`lp${i}`} transform={`rotate(${rock} ${cx} ${cy})`}>
                  <ellipse cx={cx} cy={cy + 5} rx={pad.r} ry={pad.r * 0.34} fill="#0E2044" opacity={0.35} />
                  <ellipse cx={cx} cy={cy} rx={pad.r} ry={pad.r * 0.36} fill="#3E7D3A" />
                  <ellipse cx={cx} cy={cy - 3} rx={pad.r * 0.9} ry={pad.r * 0.3} fill="#57A050" />
                  {/* the notch every lily pad has */}
                  <path
                    d={`M ${cx} ${cy} L ${cx + pad.r * 0.85} ${cy - pad.r * 0.13} L ${cx + pad.r * 0.85} ${cy + pad.r * 0.13} Z`}
                    fill="#2C3E70"
                    opacity={0.5}
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ONE big star, for the one bead that is worth five on its own. Slow: the reveal
            is the subject and a fast sparkle would compete with it. */}
        {w.starburst && (
          // Off-centre on purpose: at mid-frame it sat behind the abacus. In portrait the
          // abacus spans most of the width, so the only clear space is ABOVE it.
          <g
            transform={`translate(${W * (H > W ? 0.2 : 0.17)} ${H * (H > W ? 0.11 : 0.26)})`}
            opacity={0.9}
          >
            <g transform={`rotate(${t * 6})`}>
              {Array.from({ length: 12 }, (_, i) => (
                <rect
                  key={`ray${i}`}
                  x={-4}
                  y={-260}
                  width={8}
                  height={130 + (i % 2) * 60}
                  rx={4}
                  fill="#FFD54F"
                  opacity={0.4}
                  transform={`rotate(${i * 30})`}
                />
              ))}
            </g>
            <g transform={`scale(${1 + Math.sin(t * 1.1) * 0.05})`}>
              <circle r={96} fill="#FFF3B0" opacity={0.28} />
              <circle r={62} fill="url(#sunG)" />
            </g>
          </g>
        )}

        {/* Balloons going up — a send-off, not a party. Each drifts at its own rate and
            they wrap, so the close never runs out of them. */}
        {w.balloons &&
          Array.from({ length: 11 }, (_, i) => {
            const x = W * (0.05 + rand(i + 5) * 0.9) + Math.sin(t * 0.5 + i) * 26;
            const speed = 42 + rand(i + 11) * 46;
            const y = H + 120 - ((t * speed + rand(i + 23) * (H + 240)) % (H + 240));
            const r = 34 + rand(i + 31) * 16;
            const col = ["#EF5350", "#FFCA28", "#42A5F5", "#66BB6A", "#AB47BC", "#FF7043"][i % 6];
            return (
              <g key={`bl${i}`} transform={`rotate(${Math.sin(t * 0.6 + i) * 5} ${x} ${y})`}>
                <path
                  d={`M ${x} ${y + r * 1.15} Q ${x + 7} ${y + r * 1.7} ${x} ${y + r * 2.3}`}
                  stroke="#7A4B2A"
                  strokeWidth={2.5}
                  fill="none"
                  opacity={0.7}
                />
                <ellipse cx={x} cy={y} rx={r} ry={r * 1.14} fill={col} />
                <ellipse cx={x - r * 0.32} cy={y - r * 0.38} rx={r * 0.24} ry={r * 0.3} fill="#FFF" opacity={0.45} />
                <path d={`M ${x - 6} ${y + r * 1.1} L ${x + 6} ${y + r * 1.1} L ${x} ${y + r * 1.26} Z`} fill={col} />
              </g>
            );
          })}

        {w.confetti &&
          Array.from({ length: 70 }, (_, i) => {
            const x = rand(i + 3) * W;
            const fall = ((t * (90 + rand(i + 17) * 110) + rand(i + 29) * H) % (H + 160)) - 80;
            const col = ["#F4511E", "#FFD166", "#4CAF50", "#42A5F5", "#AB47BC"][i % 5];
            const rot = t * 180 + i * 37;
            return (
              <rect
                key={i}
                x={x}
                y={fall}
                width={16}
                height={26}
                rx={4}
                fill={col}
                transform={`rotate(${rot} ${x + 8} ${fall + 13})`}
                opacity={0.92}
              />
            );
          })}

        {w.vignette && <rect x={0} y={0} width={W} height={H} fill="url(#vig)" />}
      </svg>
    </AbsoluteFill>
  );
};

/** Cross-fade helper: worlds swap over ~10 frames so a scene change is never a hard cut. */
export const worldFade = (frame: number, startFrame: number): number =>
  interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
