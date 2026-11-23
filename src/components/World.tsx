// One world per beat. This is the layer that makes the video feel like a place rather
// than a UI screen, and the reason no two stretches of the episode look alike.
//
// Still ONE instance for the whole episode: the world's props change, the component
// never remounts, so cloud drift and star twinkle keep running across a scene change
// instead of jumping back to their start.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { WORLDS, type WorldKind } from "../data/theme";
import { CoveLayer } from "./e15/CoveLayer";
import { DinoLayer } from "./e08/DinoLayer";
import { ThemeLayer } from "./cast/ThemeLayer";

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
          <g opacity={0.18}>
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

        {/* A REAL sun: a bright core, a soft corona and a wide atmospheric bloom, breathing very
            slightly. It used to be a disc with twelve rotating spokes — a child's drawing of a sun,
            which fought the rest of the art rather than sitting behind it. */}
        {w.sun && (
          <g>
            <defs>
              <radialGradient id="sunReal">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
                <stop offset="38%" stopColor="#FFF6C8" stopOpacity={0.98} />
                <stop offset="62%" stopColor="#FFD873" stopOpacity={0.75} />
                <stop offset="100%" stopColor="#FFC24E" stopOpacity={0} />
              </radialGradient>
              <radialGradient id="sunBloom">
                <stop offset="0%" stopColor="#FFE9A8" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#FFE9A8" stopOpacity={0} />
              </radialGradient>
            </defs>
            {(() => {
              const sx = W * 0.11;
              const sy = H * 0.15;
              const breathe = 1 + Math.sin(t * 0.5) * 0.015;
              return (
                <g transform={`translate(${sx},${sy}) scale(${breathe})`}>
                  <circle r={300} fill="url(#sunBloom)" />
                  <circle r={150} fill="url(#sunReal)" />
                  <circle r={70} fill="#FFFDF0" opacity={0.95} />
                </g>
              );
            })()}
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
                {/* Flat-ish base so the cloud sits on air rather than floating as blobs — but a
                    flattened cloud has no base at all, because the hard bottom edge is exactly what
                    makes E01's read as a cartoon. */}
                <ellipse
                  cx={0}
                  cy={0}
                  rx={148}
                  ry={34 * (w.cloudFlat ?? 1)}
                  fill={w.cloudInk ?? "#FFFFFF"}
                  opacity={w.cloudAlpha ?? 0.97}
                />
                {lobes.map((l, k) => (
                  <ellipse
                    key={k}
                    cx={l.cx}
                    cy={l.cy}
                    rx={l.rx * (w.cloudFlat ? 1.5 : 1)}
                    ry={l.ry * (w.cloudFlat ?? 1)}
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

        {/* ------------------------------------------------------------------ magic show (E07)
            Drawn back to front: the spotlight cones (they are light, so everything sits IN them),
            then backstage clutter, then the boards, then the curtains down the sides, then the
            bulbs. The curtains are last of the scenery because they frame everything else. */}

        {/* THE SPOTLIGHT. A cone from above the frame, brightest at the top and gone by the boards —
            the one prop that tells the whole story of this episode, because the light narrows when
            the sum jams and opens out when the trick works. */}
        {w.spot && (
          <g>
            <defs>
              <linearGradient id="spotG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={w.spot.colour} stopOpacity={0.5} />
                <stop offset="55%" stopColor={w.spot.colour} stopOpacity={0.22} />
                <stop offset="100%" stopColor={w.spot.colour} stopOpacity={0} />
              </linearGradient>
            </defs>
            {(() => {
              const cx = W * w.spot!.at;
              const half = W * w.spot!.width * 0.5;
              const sway = Math.sin(t * 0.4) * 8;
              return (
                <path
                  d={`M ${cx - 46 + sway} -20 L ${cx + 46 + sway} -20 L ${cx + half} ${H * 0.95} L ${cx - half} ${H * 0.95} Z`}
                  fill="url(#spotG)"
                />
              );
            })()}
          </g>
        )}
        {w.spot2 && (
          <g>
            <defs>
              <linearGradient id="spot2G" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={w.spot2.colour} stopOpacity={0.55} />
                <stop offset="60%" stopColor={w.spot2.colour} stopOpacity={0.3} />
                <stop offset="100%" stopColor={w.spot2.colour} stopOpacity={0} />
              </linearGradient>
            </defs>
            {(() => {
              const cx = W * w.spot2!.at;
              const half = W * w.spot2!.width * 0.5;
              return (
                <path
                  d={`M ${cx - 26} -20 L ${cx + 26} -20 L ${cx + half} ${H * 0.62} L ${cx - half} ${H * 0.62} Z`}
                  fill="url(#spot2G)"
                />
              );
            })()}
          </g>
        )}

        {/* backstage: ropes from the flies, a crate and a stool — the room behind the trick */}
        {w.backstage && (
          <g opacity={0.9}>
            {[0.08, 0.15, 0.88, 0.94].map((f, i) => (
              <g key={`rope${i}`}>
                <line
                  x1={W * f}
                  y1={-10}
                  x2={W * f + Math.sin(t * 0.5 + i) * 10}
                  y2={H * (0.44 + (i % 2) * 0.12)}
                  stroke="#8A6A46"
                  strokeWidth={7}
                  strokeLinecap="round"
                />
                <circle cx={W * f + Math.sin(t * 0.5 + i) * 10} cy={H * (0.44 + (i % 2) * 0.12)} r={9} fill="#6B4F31" />
              </g>
            ))}
            {/* a crate, bottom left */}
            <g transform={`translate(${W * 0.07} ${H * 0.7})`}>
              <rect x={0} y={0} width={150} height={120} rx={8} fill="#7A5B37" />
              <rect x={0} y={0} width={150} height={16} rx={6} fill="#96754A" />
              {[30, 60, 90].map((y) => (
                <rect key={y} x={8} y={y} width={134} height={8} rx={4} fill="#5E4426" opacity={0.7} />
              ))}
            </g>
            {/* a stool, bottom right */}
            <g transform={`translate(${W * 0.88} ${H * 0.74})`}>
              <rect x={-52} y={0} width={104} height={16} rx={8} fill="#8A6A46" />
              {[-38, 34].map((x) => (
                <rect key={x} x={x} y={14} width={12} height={88} rx={6} fill="#6B4F31" />
              ))}
            </g>
          </g>
        )}

        {/* the boards: the stage floor, with a lit front edge */}
        {w.boards && (
          <g>
            <rect x={0} y={H * w.boards.at} width={W} height={H} fill={w.boards.face} />
            <rect x={0} y={H * w.boards.at} width={W} height={12} fill={w.boards.edge} />
            {/* plank seams, in perspective — closer together towards the middle */}
            {Array.from({ length: 11 }, (_, i) => {
              const f = (i - 5) / 5;
              return (
                <line
                  key={`plank${i}`}
                  x1={W / 2 + f * W * 0.2}
                  y1={H * w.boards!.at}
                  x2={W / 2 + f * W * 0.75}
                  y2={H}
                  stroke="#000"
                  strokeWidth={3}
                  opacity={0.16}
                />
              );
            })}
          </g>
        )}

        {/* the top hat, on the boards, with its own little sparkle. hx used to sit at 0.12 —
            inside the side curtain's own 0–0.17 covered band (see the curtains block below,
            `drop = W * 0.17`) — so almost the whole hat rendered hidden behind the curtain
            fabric, just a sliver of its right edge peeking out. Moved clear of that band. */}
        {w.tophat && (() => {
          const hx = W * 0.26;
          const hy = H * 0.8;
          const tilt = Math.sin(t * 0.8) * 2.5;
          const hs = portrait ? 0.62 : 1; // smaller in portrait — the narrower frame made it read oversized
          return (
            <g transform={`translate(${hx} ${hy}) rotate(${tilt}) scale(${hs})`}>
              <ellipse cx={0} cy={12} rx={116} ry={22} fill="#1A0F22" />
              <rect x={-72} y={-128} width={144} height={140} rx={12} fill="#241533" />
              <rect x={-72} y={-46} width={144} height={30} fill="#C4284C" />
              <ellipse cx={0} cy={-128} rx={72} ry={16} fill="#2E1B40" />
              {[0, 1, 2].map((i) => {
                const a = t * 1.6 + i * 2.1;
                return (
                  <g key={i} transform={`translate(${Math.cos(a) * 96} ${-150 - Math.abs(Math.sin(a)) * 40})`}>
                    <path d="M 0 -9 L 2.6 -2.6 L 9 0 L 2.6 2.6 L 0 9 L -2.6 2.6 L -9 0 L -2.6 -2.6 Z" fill="#FFD873" />
                  </g>
                );
              })}
            </g>
          );
        })()}

        {/* THE CURTAINS. Down both sides with a swag across the top, and `closed` brings them to meet
            in the middle for the beat before anything has happened. */}
        {w.curtains && (() => {
          const c = w.curtains!;
          const drop = c.closed ? W * 0.5 : W * 0.17;
          const fold = (x0: number, dir: 1 | -1) =>
            Array.from({ length: 7 }, (_, i) => {
              const fx = x0 + dir * (i * drop) / 7;
              const bow = Math.sin(t * 0.5 + i) * 5;
              return (
                <path
                  key={`${dir}${i}`}
                  d={`M ${fx} 0 Q ${fx + dir * 18 + bow} ${H * 0.5} ${fx} ${H}`}
                  stroke={i % 2 ? c.shade : c.cloth}
                  strokeWidth={(drop / 7) * 1.25}
                  fill="none"
                  opacity={0.96}
                />
              );
            });
          return (
            <g>
              {fold(0, 1)}
              {fold(W, -1)}
              {/* the swag across the top */}
              <path
                d={`M 0 0 L ${W} 0 L ${W} ${H * 0.1} Q ${W * 0.5} ${H * 0.2} 0 ${H * 0.1} Z`}
                fill={c.cloth}
              />
              <path
                d={`M 0 ${H * 0.1} Q ${W * 0.5} ${H * 0.2} ${W} ${H * 0.1}`}
                stroke="#FFD873"
                strokeWidth={7}
                fill="none"
                opacity={0.85}
              />
            </g>
          );
        })()}

        {/* bulbs around the proscenium, chasing */}
        {w.bulbs &&
          Array.from({ length: 22 }, (_, i) => {
            const f = i / 21;
            const x = W * 0.03 + f * W * 0.94;
            const y = H * 0.055 + Math.sin(f * Math.PI) * H * 0.035;
            const on = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.2 - i * 0.5));
            return (
              <g key={`bulb${i}`}>
                <circle cx={x} cy={y} r={16} fill="#FFD873" opacity={0.18 * on} />
                <circle cx={x} cy={y} r={7} fill="#FFF3C4" opacity={on} />
              </g>
            );
          })}

        {/* sparkles drifting in the light */}
        {w.sparkle &&
          Array.from({ length: 16 }, (_, i) => {
            const cols = w.sparkle!;
            const col = cols[i % cols.length];
            const x = rand(i + 61) * W + Math.sin(t * 0.6 + i) * 30;
            const y = ((t * (16 + rand(i + 7) * 22) + rand(i + 13) * H) % (H + 100)) - 50;
            const k = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.7 + i));
            const r = 5 + rand(i + 23) * 5;
            return (
              <g key={`sp${i}`} transform={`translate(${x} ${y}) rotate(${t * 30 + i * 25})`} opacity={0.75 * k}>
                <path
                  d={`M 0 ${-r} L ${r * 0.3} ${-r * 0.3} L ${r} 0 L ${r * 0.3} ${r * 0.3} L 0 ${r} L ${-r * 0.3} ${r * 0.3} L ${-r} 0 L ${-r * 0.3} ${-r * 0.3} Z`}
                  fill={col}
                />
              </g>
            );
          })}

        {/* ------------------------------------------------------------------ jungle (E06)
            Drawn back-to-front: waterfall, then the hanging canopy from the top of the frame, then
            vines, then the rope bridge, then ferns along the bottom. Everything lives in the
            MARGINS — the canopy hangs from the top edge and the ferns grow from the bottom — because
            the stage band across the middle is the abacus's, and a jungle drawn edge to edge would
            be a wall of leaves behind the beads. */}

        {/* the waterfall: a bright column with a plunge pool, on the left */}
        {w.falls && (() => {
          const fx = W * w.falls.at;
          const fw = W * 0.085;
          const toBottom = Boolean(w.falls.toBottom);
          const pool = toBottom ? H + 40 : H * 0.8;
          return (
            <g>
              <rect x={fx - fw / 2} y={0} width={fw} height={pool} fill={w.falls.water} opacity={0.75} />
              {/* falling streaks, offset so the column reads as moving water rather than a bar */}
              {Array.from({ length: 7 }, (_, i) => {
                const sx = fx - fw / 2 + ((i + 0.5) * fw) / 7;
                const speed = 260 + rand(i + 3) * 190;
                const y = ((t * speed + rand(i + 9) * pool) % (pool + 160)) - 80;
                return (
                  <rect
                    key={`fw${i}`}
                    x={sx - 3}
                    y={y}
                    width={6}
                    height={70 + rand(i) * 60}
                    rx={3}
                    fill={w.falls!.foam}
                    opacity={0.55}
                  />
                );
              })}
              {!toBottom && (
                <ellipse cx={fx} cy={pool} rx={fw * 1.5} ry={fw * 0.42} fill={w.falls.foam} opacity={0.85} />
              )}
              {/* spray, rising and fading — only where there is a pool for it to rise from */}
              {!toBottom && Array.from({ length: 9 }, (_, i) => {
                const a = (t * 0.8 + rand(i + 21)) % 1;
                return (
                  <circle
                    key={`sp${i}`}
                    cx={fx + (rand(i + 5) - 0.5) * fw * 2.4}
                    cy={pool - a * 90}
                    r={4 + rand(i + 13) * 7}
                    fill={w.falls!.foam}
                    opacity={0.5 * (1 - a)}
                  />
                );
              })}
            </g>
          );
        })()}

        {/* THE CANOPY: two parallax rows of leaves hanging from the top edge. `depth` scales how far
            down they reach, so one drawing serves a dense morning canopy and an open clearing. */}
        {w.canopy &&
          [0, 1].map((row) => {
            const c = w.canopy!;
            const colour = row === 0 ? c.far : c.near;
            const drop = H * (row === 0 ? 0.13 : 0.1) * c.depth;
            const n = row === 0 ? 7 : 6;
            return (
              <g key={`can${row}`} opacity={row === 0 ? 0.8 : 1}>
                <rect x={0} y={-20} width={W} height={drop * 0.55 + 20} fill={colour} />
                {Array.from({ length: n }, (_, i) => {
                  const cx = ((i + (row === 0 ? 0 : 0.5)) * W) / (n - 0.5);
                  const sway = Math.sin(t * 0.5 + i * 1.3) * 7;
                  const rw = W * 0.1;
                  const rh = drop;
                  return (
                    <g key={i} transform={`translate(${cx + sway} ${drop * 0.4})`}>
                      <ellipse cx={0} cy={0} rx={rw} ry={rh} fill={colour} />
                      <path
                        d={`M ${-rw * 0.8} 0 Q 0 ${rh * 0.34} ${rw * 0.8} 0`}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={3}
                        opacity={0.16}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

        {/* HANGING VINES, in PAIRS. The episode is about two rods working together, so the scenery
            is full of things that come in twos — said by the picture before the script says it. */}
        {w.vines &&
          Array.from({ length: w.vines.count }, (_, i) => {
            const v = w.vines!;
            // pairs sit close together, then a wide gap to the next pair
            const pair = Math.floor(i / 2);
            const within = i % 2;
            const base = v.pairs
              ? ((pair + 0.5) / Math.ceil(v.count / 2)) * W + (within ? 34 : -34)
              : ((i + 0.5) / v.count) * W;
            // vines hang in the GUTTERS: pushed to whichever edge they are nearer, so none of them
            // hangs down the middle of the stage.
            const x = base < W / 2 ? base * 0.42 : W - (W - base) * 0.42;
            const len = H * (0.2 + rand(i + 7) * 0.16);
            const sway = Math.sin(t * 0.6 + i) * 16;
            return (
              <g key={`vine${i}`}>
                <path
                  d={`M ${x} ${-10} Q ${x + sway * 0.5} ${len * 0.55} ${x + sway} ${len}`}
                  fill="none"
                  stroke={v.colour}
                  strokeWidth={7}
                  strokeLinecap="round"
                />
                <ellipse cx={x + sway} cy={len + 12} rx={13} ry={20} fill={v.colour} />
              </g>
            );
          })}

        {/* TWO banana bunches, one per gutter, hanging from the canopy. Paired like everything else
            in this world set, and they keep the left gutter occupied on the lines where the job card
            is not up. */}
        {w.bananas &&
          [0, 1].map((k) => {
            const x = k === 0 ? W * 0.11 : W * 0.89;
            const y = H * 0.2 + Math.sin(t * 0.7 + k * 2) * 9;
            return (
              <g key={`ban${k}`} transform={`translate(${x} ${y})`}>
                {/* the stalk up into the leaves */}
                <path d={`M 0 0 Q ${k ? 10 : -10} -40 ${k ? 4 : -4} -84`} fill="none" stroke="#5A9E4C" strokeWidth={7} strokeLinecap="round" />
                <ellipse cx={0} cy={2} rx={16} ry={11} fill="#6E5622" />
                {[-1, 0, 1].map((i) =>
                  [0, 1].map((row) => (
                    <path
                      key={`${i}${row}`}
                      d={`M ${i * 17} ${10 + row * 22} q ${18} ${14} ${6} ${34} q ${-14} ${-6} ${-18} ${-30} z`}
                      fill={row ? "#F5C93E" : "#FFD966"}
                      stroke="#B98B1E"
                      strokeWidth={2.5}
                      transform={`rotate(${i * 16} ${i * 17} ${10 + row * 22})`}
                    />
                  ))
                )}
              </g>
            );
          })}

        {/* the rope bridge: TWO ropes, one deck, low in the frame */}
        {w.ropebridge && (() => {
          const b = w.ropebridge!;
          const y = H * b.at;
          const sag = (x: number) => y + Math.sin((x / W) * Math.PI) * 34;
          const pts = Array.from({ length: 24 }, (_, i) => (i / 23) * W);
          return (
            <g opacity={0.9}>
              {[0, 26].map((off, k) => (
                <path
                  key={`rope${k}`}
                  d={pts.map((x, i) => `${i ? "L" : "M"} ${x} ${sag(x) - off}`).join(" ")}
                  fill="none"
                  stroke={b.rope}
                  strokeWidth={k ? 5 : 7}
                  strokeLinecap="round"
                />
              ))}
              {pts.filter((_, i) => i % 2 === 0).map((x, i) => (
                <rect
                  key={`plank${i}`}
                  x={x - 14}
                  y={sag(x) - 6}
                  width={28}
                  height={11}
                  rx={3}
                  fill={b.plank}
                />
              ))}
            </g>
          );
        })()}

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
              const shoal = w.fishInk ?? ["#FFC244", "#FF8A4C", "#FFE08A", "#F4A259", "#FFD166"];
              const col = shoal[i % shoal.length];
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

        {/* ------------------------------------------------------------------ city
            Two parallax rows of towers on a ground band, with a lit-window grid. ONE drawing for
            the whole of E04: the world gets from dawn to full night by turning `windows` up, which
            is also the episode's idea — the city fills as the numbers grow.

            The towers are derived from `rand(i)` rather than authored, so no two are the same width
            or height, and the far row is both shorter and desaturated by sitting behind. */}
        {w.skyline && (() => {
          const sk = w.skyline;
          const groundY = H * sk.at;
          const row = (
            seed: number,
            fill: string,
            maxH: number,
            step: number,
            lit: boolean
          ) => {
            const out: React.ReactNode[] = [];
            let x = -40;
            for (let i = 0; x < W + 40; i++) {
              const bw = step * (0.72 + rand(seed + i * 3) * 0.7);
              const bh = maxH * (0.34 + rand(seed + i * 7 + 1) * 0.66);
              const top = groundY - bh;
              out.push(<rect key={`t${seed}${i}`} x={x} y={top} width={bw} height={bh} fill={fill} />);
              if (lit) {
                // window grid, inset from the tower edges. A window is ON when its own hash falls
                // under the world's `windows` level, so the same tower lights up progressively
                // across the episode instead of flickering randomly per world.
                const cols = Math.max(1, Math.floor((bw - 16) / 22));
                const rows = Math.max(1, Math.floor((bh - 18) / 26));
                for (let c = 0; c < cols; c++) {
                  for (let r = 0; r < rows; r++) {
                    const h = rand(seed * 31 + i * 97 + c * 13 + r * 7 + 5);
                    if (h > sk.windows) continue;
                    // a slow twinkle, so the city is never a frozen image
                    // Held well under half strength. A window is a 11x14 rectangle at high
                    // contrast, and a few hundred of them read as a texture that competes with the
                    // beads — the background was winning the frame.
                    const flick = 0.3 + 0.16 * Math.abs(Math.sin(t * 0.35 + h * 9));
                    out.push(
                      <rect
                        key={`w${seed}${i}${c}${r}`}
                        x={x + 10 + c * 22}
                        y={top + 12 + r * 26}
                        width={11}
                        height={14}
                        rx={2}
                        fill={sk.lit}
                        opacity={flick}
                      />
                    );
                  }
                }
              }
              x += bw + 4 + rand(seed + i * 11 + 2) * 10;
            }
            return out;
          };
          return (
            <g>
              {/* far row: shorter, no windows, so it reads as distance */}
              <g opacity={0.42}>{row(3, sk.far, H * 0.3, 118, false)}</g>
              <g opacity={0.8}>{row(41, sk.near, H * 0.46, 152, true)}</g>
              {/* ground, with a lit kerb line where it meets the towers */}
              <rect x={0} y={groundY} width={W} height={H - groundY + 2} fill={sk.ground} />
              <rect x={0} y={groundY} width={W} height={4} fill={sk.lit} opacity={0.2} />
              {/* street lamps along the kerb, dimmer by day */}
              {Array.from({ length: Math.ceil(W / 260) + 1 }, (_, i) => {
                const lx = 70 + i * 260;
                return (
                  <g key={`lamp${i}`} opacity={0.2 + sk.windows * 0.3}>
                    <rect x={lx - 2} y={groundY - 74} width={4} height={74} fill={sk.lit} opacity={0.5} />
                    <circle cx={lx} cy={groundY - 78} r={7} fill={sk.lit} />
                    <circle cx={lx} cy={groundY - 78} r={16} fill={sk.lit} opacity={0.14} />
                  </g>
                );
              })}
            </g>
          );
        })()}

        {/* A tower crane. It swings slowly through a small arc and its hook rides up and down —
            the only moving machine in the series, and it says "more towers are going up", which is
            what "that is what the other rods are for" means. */}
        {w.crane && w.skyline && (() => {
          const bx = W * 0.14;
          const by = H * w.skyline.at;
          const mastTop = by - H * 0.42;
          const swing = Math.sin(t * 0.22) * 7;
          const hook = mastTop + 40 + (Math.sin(t * 0.5) * 0.5 + 0.5) * (by - mastTop - 120);
          const jib = W * 0.2;
          return (
            <g stroke="#8FA3B0" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7}>
              <line x1={bx} y1={by} x2={bx} y2={mastTop} />
              {/* mast lattice */}
              {Array.from({ length: 9 }, (_, i) => {
                const y0 = mastTop + ((by - mastTop) / 9) * i;
                const y1 = mastTop + ((by - mastTop) / 9) * (i + 1);
                return <line key={`m${i}`} x1={bx - 11} y1={y0} x2={bx + 11} y2={y1} strokeWidth={3} />;
              })}
              <line x1={bx - 11} y1={by} x2={bx - 11} y2={mastTop} strokeWidth={3} />
              <line x1={bx + 11} y1={by} x2={bx + 11} y2={mastTop} strokeWidth={3} />
              <g transform={`rotate(${swing} ${bx} ${mastTop})`}>
                <line x1={bx - jib * 0.3} y1={mastTop} x2={bx + jib} y2={mastTop} />
                <line x1={bx - jib * 0.3} y1={mastTop - 26} x2={bx + jib * 0.55} y2={mastTop - 26} strokeWidth={3} />
                <line x1={bx} y1={mastTop - 30} x2={bx} y2={mastTop} strokeWidth={3} />
                <line x1={bx + jib * 0.55} y1={mastTop - 26} x2={bx + jib} y2={mastTop} strokeWidth={3} />
                <line x1={bx + jib * 0.78} y1={mastTop} x2={bx + jib * 0.78} y2={hook} strokeWidth={2.5} />
                <rect
                  x={bx + jib * 0.78 - 15}
                  y={hook}
                  width={30}
                  height={20}
                  rx={4}
                  fill="#E8A33A"
                  stroke="#8A5F14"
                  strokeWidth={3}
                />
              </g>
            </g>
          );
        })()}

        {/* ------------------------------------------------------------------ flight
            A planet's limb across the bottom with an atmospheric rim above it. `at` is where the
            curve's apex sits, so the world climbs simply by pushing it down the frame: the ground
            fills half the shot at the pad and is a thin blue arc by orbit. One drawing, eight
            altitudes — the same economy as E04's skyline. */}
        {w.planet && (() => {
          const pl = w.planet;
          const apex = H * pl.at;
          // a very wide ellipse reads as a curve rather than a hill
          const rx = W * 1.6;
          const ry = H * 0.55;
          return (
            <g>
              <ellipse cx={W / 2} cy={apex + ry} rx={rx} ry={ry} fill={pl.body} />
              {/* lit crescent along the top edge, and the atmosphere above it */}
              <ellipse
                cx={W / 2}
                cy={apex + ry + 12}
                rx={rx}
                ry={ry}
                fill="none"
                stroke={pl.lit}
                strokeWidth={14}
                opacity={0.5}
              />
              <ellipse
                cx={W / 2}
                cy={apex + ry + 46}
                rx={rx * 1.005}
                ry={ry * 1.02}
                fill="none"
                stroke={pl.rim}
                strokeWidth={44}
                opacity={0.28}
              />
            </g>
          );
        })()}

        {/* Nebula: slow soft colour fields for the deep beats. Drawn with big blurred-looking
            ellipse stacks rather than a filter, so it stays cheap and deterministic. */}
        {w.nebula &&
          w.nebula.map((col, i) => {
            const cx = W * (0.18 + i * 0.32) + Math.sin(t * 0.09 + i) * 40;
            const cy = H * (0.24 + (i % 2) * 0.22);
            return (
              <g key={`neb${i}`}>
                {[1, 0.72, 0.46].map((k, j) => (
                  <ellipse
                    key={j}
                    cx={cx}
                    cy={cy}
                    rx={W * 0.3 * k}
                    ry={H * 0.2 * k}
                    fill={col}
                    opacity={0.055}
                  />
                ))}
              </g>
            );
          })}

        {/* The launch gantry.
            IT STANDS ON THE GROUND, and that took actual arithmetic. The planet is a very wide
            ellipse whose apex is at `planet.at`, so its surface DROPS as you move towards the frame
            edge — anchoring the tower to the apex left it hanging in the air on the left, which is
            exactly what it looked like. The base is now solved from the ellipse at the tower's own x.

            Built like a real one, too: a broad footing, two battered legs that taper as they rise,
            full cross-bracing, three service arms reaching towards the pad, and a lightning mast. */}
        {w.gantry && w.planet && (() => {
          // SMALLER IN PORTRAIT, uniformly. The tower's height was a fraction of H and its widths
          // were absolute pixels, so moving to 1080x1350 made it both taller AND proportionally
          // wider — it stood over the abacus and ran its footing off the bottom of the frame. One
          // factor on every dimension keeps the tower's own proportions and just makes it scenery
          // again. Landscape is untouched at 1.
          const portrait = H > W;
          const g = portrait ? 0.55 : 1;
          const gx = W * (portrait ? 0.13 : 0.1);
          // where the planet's surface actually is at THIS x
          const apex = H * w.planet.at;
          const rx = W * 1.6;
          const ry = H * 0.55;
          const cy = apex + ry;
          const dx = Math.min(1, Math.abs(gx - W / 2) / rx);
          const base = cy - ry * Math.sqrt(1 - dx * dx);
          const top = base - H * 0.6 * g;
          const halfBase = 34 * g;
          const halfTop = 17 * g;
          const legX = (f: number, side: number) => gx + side * (halfBase + (halfTop - halfBase) * f);
          const yAt = (f: number) => base - (base - top) * f;
          const RUNGS = 12;
          return (
            <g opacity={0.82}>
              {/* footing */}
              <rect x={gx - halfBase - 22 * g} y={base - 12 * g} width={(halfBase + 22 * g) * 2} height={20 * g} rx={5} fill="#5E6B80" />
              <rect x={gx - halfBase - 34 * g} y={base + 4 * g} width={(halfBase + 34 * g) * 2} height={12 * g} rx={4} fill="#4A5566" />
              <g stroke="#8492A8" strokeWidth={7 * g} fill="none" strokeLinecap="round">
                {/* battered legs */}
                <line x1={legX(0, -1)} y1={base} x2={legX(1, -1)} y2={top} />
                <line x1={legX(0, 1)} y1={base} x2={legX(1, 1)} y2={top} />
                {/* cross-bracing, every bay */}
                {Array.from({ length: RUNGS }, (_, k) => {
                  const f0 = k / RUNGS;
                  const f1 = (k + 1) / RUNGS;
                  return (
                    <g key={`b${k}`} strokeWidth={3 * g}>
                      <line x1={legX(f0, -1)} y1={yAt(f0)} x2={legX(f1, 1)} y2={yAt(f1)} />
                      <line x1={legX(f0, 1)} y1={yAt(f0)} x2={legX(f1, -1)} y2={yAt(f1)} />
                      <line x1={legX(f1, -1)} y1={yAt(f1)} x2={legX(f1, 1)} y2={yAt(f1)} strokeWidth={4 * g} />
                    </g>
                  );
                })}
                {/* Service arms, BOTH SIDES. A real gantry is symmetric about its mast, and with
                    arms on one side only the tower read as half-drawn — a lopsided silhouette on the
                    one piece of built scenery in the episode. */}
                {[0.34, 0.58, 0.8].map((f, k) =>
                  [-1, 1].map((side) => {
                    const x0 = legX(f, side);
                    const x1 = x0 + side * 96 * g;
                    return (
                      <g key={`arm${k}${side}`}>
                        <line x1={x0} y1={yAt(f)} x2={x1} y2={yAt(f)} strokeWidth={6 * g} />
                        <line x1={x1} y1={yAt(f)} x2={x1} y2={yAt(f) + 26 * g} strokeWidth={4 * g} />
                        <line x1={x0} y1={yAt(f) - 26 * g} x2={x0 + side * 88 * g} y2={yAt(f)} strokeWidth={3 * g} />
                      </g>
                    );
                  })
                )}
                {/* lightning mast */}
                <line x1={gx} y1={top} x2={gx} y2={top - 74 * g} strokeWidth={5 * g} />
              </g>
              {/* beacon */}
              <circle
                cx={gx}
                cy={top - 80 * g}
                r={7 * g}
                fill="#FF5C4D"
                opacity={0.35 + 0.65 * Math.abs(Math.sin(t * 1.5))}
              />
            </g>
          );
        })()}

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

        {/* --------------------------------------------------------- jungle foreground (E06) */}

        {/* GOD RAYS through the canopy. The one thing that makes a green frame read as a jungle
            rather than as a hedge — and it is light, so it never fights the beads for attention. */}
        {w.godrays && (
          <g opacity={0.3}>
            {Array.from({ length: 4 }, (_, i) => {
              const x = W * (0.16 + i * 0.23);
              const drift = Math.sin(t * 0.25 + i) * 18;
              return (
                <path
                  key={`ray${i}`}
                  d={`M ${x + drift - 40} 0 L ${x + drift + 40} 0 L ${x + drift + 150} ${H} L ${x + drift + 30} ${H} Z`}
                  fill="#FFFFFF"
                  opacity={0.5 + 0.2 * Math.sin(t * 0.4 + i)}
                />
              );
            })}
          </g>
        )}

        {/* ══════════════════════════════ E08 · THE PARK ══════════════════════════════
            Ten worlds share one ground and swap what stands on it. Everything here is drawn
            BEHIND the stage band and out of the two gutters the cards use, because world props
            are not covered by the overlap guard — placement is by hand, against the occupied
            regions, exactly as §4 of the standing brief says. */}

        {/* the ground: grass, a darker seam at the horizon, then the path along the bottom */}
        {w.parkground && (() => {
          const g = w.parkground!;
          const gy = H * g.at;
          const py = H * (g.at + 0.145);
          return (
            <g>
              <rect x={0} y={gy} width={W} height={H - gy} fill={g.grass} />
              <rect x={0} y={gy} width={W} height={10} fill={g.grassDark} opacity={0.55} />
              {/* mown stripes — the thing that makes grass read as a kept lawn rather than a slab */}
              {Array.from({ length: 9 }, (_, i) => (
                <polygon
                  key={`mow${i}`}
                  points={`${(i / 9) * W},${H} ${((i + 0.5) / 9) * W},${H} ${
                    W / 2 + (((i + 0.5) / 9) * W - W / 2) * 0.42
                  },${gy} ${W / 2 + ((i / 9) * W - W / 2) * 0.42},${gy}`}
                  fill={g.grassDark}
                  opacity={0.16}
                />
              ))}
              <rect x={0} y={py} width={W} height={H - py} fill={g.path} />
              <rect x={0} y={py} width={W} height={7} fill="#000" opacity={0.07} />
            </g>
          );
        })()}

        {/* TREES: two parallax rows of round crowns on the horizon. Round, not conifer — a park
            is planted, and the silhouette has to read at thumbnail size.
            SOFT-FOCUS ON PURPOSE. These were drawn at full saturation and full sharpness, which put
            them in visual competition with the abacus, the cards and the pair — nothing on screen
            said "this is scenery, not content". A camera does this with depth of field: the thing
            you're meant to look at is sharp, everything behind it recedes. `filter: blur(...)
            saturate(...)` is that, done in CSS instead of glass — softened and slightly desaturated
            so the eye slides past them on the way to the abacus, exactly as intended. */}
        {w.trees && w.parkground && (() => {
          const tr = w.trees!;
          const gy = H * w.parkground!.at;
          return (
            <g>
              {/* FAR ROW — furthest from the subject, so it recedes the most: heavier blur, more
                  desaturation, lower opacity. Keeps out of the MIDDLE THIRD too: the see-saw's
                  fulcrum and the formula board both stand there, and a tree crown directly behind a
                  fulcrum reads as clutter regardless of focus. World props are not covered by the
                  overlap guard, so this is placement by hand against the occupied region — §4 of the
                  standing brief. */}
              <g style={{ filter: "blur(2.2px) saturate(0.55) brightness(1.06)" }} opacity={0.68}>
                {Array.from({ length: 7 }, (_, i) => {
                  const u = (i + 0.5) / 7;
                  const x = (u < 0.5 ? u * 0.62 : 1 - (1 - u) * 0.62) * W + (rand(i + 61) - 0.5) * 70;
                  const r = H * (0.085 + rand(i + 5) * 0.03);
                  const sway = Math.sin(t * 0.5 + i * 1.3) * 3;
                  return (
                    <g key={`tf${i}`} transform={`translate(${sway} 0)`}>
                      <rect x={x - 7} y={gy - r * 0.9} width={14} height={r} fill={tr.trunk} opacity={0.7} />
                      <circle cx={x} cy={gy - r * 1.25} r={r} fill={tr.far} />
                    </g>
                  );
                })}
              </g>
              {/* NEAR ROW — closer, so it stays readable as "trees" while still sitting a clear step
                  behind anything a line is actually about: lighter blur, milder desaturation. */}
              <g style={{ filter: "blur(1.1px) saturate(0.72) brightness(1.03)" }} opacity={0.82}>
                {Array.from({ length: 4 }, (_, i) => {
                  // kept OUT of the middle: the stage band lives there
                  const x = i < 2 ? W * (0.06 + i * 0.1) : W * (0.84 + (i - 2) * 0.1);
                  const r = H * (0.12 + rand(i + 9) * 0.035);
                  const sway = Math.sin(t * 0.42 + i * 2.1) * 4;
                  return (
                    <g key={`tn${i}`} transform={`translate(${sway} 0)`}>
                      <rect x={x - 12} y={gy - r * 1.0} width={24} height={r * 1.1} fill={tr.trunk} />
                      <circle cx={x} cy={gy - r * 1.5} r={r} fill={tr.near} />
                      <circle cx={x - r * 0.5} cy={gy - r * 1.2} r={r * 0.62} fill={tr.near} />
                      <circle cx={x + r * 0.52} cy={gy - r * 1.22} r={r * 0.6} fill={tr.near} />
                      <circle cx={x - r * 0.3} cy={gy - r * 1.75} r={r * 0.5} fill="#FFFFFF" opacity={0.12} />
                    </g>
                  );
                })}
              </g>
            </g>
          );
        })()}

        {/* a white picket fence along the grass line */}
        {w.fence && w.parkground && (() => {
          const gy = H * w.parkground!.at + 6;
          const n = Math.ceil(W / 46);
          return (
            <g opacity={0.92}>
              {Array.from({ length: n }, (_, i) => (
                <g key={`pk${i}`}>
                  <rect x={i * 46 + 8} y={gy - 34} width={13} height={40} rx={3} fill={w.fence} />
                  <polygon
                    points={`${i * 46 + 8},${gy - 34} ${i * 46 + 14.5},${gy - 44} ${i * 46 + 21},${gy - 34}`}
                    fill={w.fence}
                  />
                </g>
              ))}
              <rect x={0} y={gy - 24} width={W} height={7} fill={w.fence} />
            </g>
          );
        })()}

        {/* flowers in the grass — dotted along the two gutters only */}
        {w.flowers && w.parkground &&
          Array.from({ length: 22 }, (_, i) => {
            const side = i % 2 === 0;
            const x = side ? rand(i + 71) * W * 0.22 : W * 0.78 + rand(i + 73) * W * 0.22;
            const y = H * w.parkground!.at + 16 + rand(i + 77) * (H * 0.13);
            const c = w.flowers![i % w.flowers!.length];
            const s = 1 + Math.sin(t * 1.6 + i) * 0.06;
            return (
              <g key={`fl${i}`} transform={`translate(${x} ${y}) scale(${s})`}>
                <rect x={-1.6} y={0} width={3.2} height={16} fill="#3C7A38" />
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx={0} cy={-7} rx={4.4} ry={7} fill={c} transform={`rotate(${a} 0 0)`} />
                ))}
                <circle cx={0} cy={0} r={3.6} fill="#FFF3B0" />
              </g>
            );
          })}

        {/* the swing set, left gutter — TWO swings, because everything in this world comes in twos */}
        {w.swings && w.parkground && (() => {
          const gy = H * w.parkground!.at + H * 0.075;
          const x = W * 0.13;
          const hgt = H * 0.3;
          return (
            <g>
              <line x1={x - hgt * 0.42} y1={gy} x2={x} y2={gy - hgt} stroke="#8E6BFF" strokeWidth={11} strokeLinecap="round" />
              <line x1={x + hgt * 0.42} y1={gy} x2={x} y2={gy - hgt} stroke="#8E6BFF" strokeWidth={11} strokeLinecap="round" />
              <line x1={x - hgt * 0.62} y1={gy - hgt} x2={x + hgt * 0.62} y2={gy - hgt} stroke="#7351E8" strokeWidth={12} strokeLinecap="round" />
              {[-1, 1].map((k, i) => {
                const sw = Math.sin(t * 1.1 + i * Math.PI) * 0.16;
                const sx = x + k * hgt * 0.3;
                const len = hgt * 0.6;
                const tx = sx + Math.sin(sw) * len;
                const ty = gy - hgt + Math.cos(sw) * len;
                return (
                  <g key={`sw${i}`}>
                    <line x1={sx} y1={gy - hgt} x2={tx} y2={ty} stroke="#5E4A2E" strokeWidth={4} />
                    <rect x={tx - 20} y={ty} width={40} height={9} rx={4} fill="#FF6B8A" />
                  </g>
                );
              })}
            </g>
          );
        })()}

        {/* the slide, right gutter */}
        {w.slide && w.parkground && (() => {
          const sl = w.slide!;
          const gy = H * w.parkground!.at + H * 0.085;
          const x = W * 0.87;
          const hgt = H * 0.24;
          return (
            <g>
              <rect x={x + 22} y={gy - hgt} width={12} height={hgt} rx={5} fill={sl.rail} />
              <rect x={x + 58} y={gy - hgt} width={12} height={hgt} rx={5} fill={sl.rail} />
              {Array.from({ length: 5 }, (_, i) => (
                <rect key={`st${i}`} x={x + 22} y={gy - hgt + 16 + i * (hgt / 6)} width={48} height={8} rx={4} fill={sl.chute} />
              ))}
              <path
                d={`M ${x + 22} ${gy - hgt + 4} L ${x - 62} ${gy - 6} L ${x - 62} ${gy + 12} L ${x + 30} ${gy - hgt + 20} Z`}
                fill={sl.chute}
              />
              <path d={`M ${x + 22} ${gy - hgt + 4} L ${x - 62} ${gy - 6}`} stroke={sl.rail} strokeWidth={7} strokeLinecap="round" />
            </g>
          );
        })()}

        {/* kites, high in the sky where nothing else is */}
        {w.kites &&
          w.kites.map((c, i) => {
            const x = W * (0.13 + i * 0.26) + Math.sin(t * 0.4 + i * 2) * W * 0.05;
            const y = H * (0.09 + i * 0.05) + Math.sin(t * 0.62 + i) * H * 0.02;
            const tilt = Math.sin(t * 0.62 + i) * 14;
            return (
              <g key={`kt${i}`} transform={`translate(${x} ${y}) rotate(${tilt})`}>
                <polygon points="0,-30 22,0 0,42 -22,0" fill={c} />
                <polygon points="0,-30 0,42 -22,0" fill="#000" opacity={0.12} />
                <path
                  d={`M 0 42 q ${Math.sin(t * 3) * 10} 22 0 44 q ${-Math.sin(t * 3) * 10} 22 0 44`}
                  stroke={c}
                  strokeWidth={3}
                  fill="none"
                  opacity={0.8}
                />
              </g>
            );
          })}

        {/* falling autumn leaves — E13's equivalent of kites/butterflies, motion where nothing
            else is. Each colour gets 3 individually phased leaves, drifting down and swaying
            side to side, looping from the top once they pass the bottom edge. One continuous
            animation layer, no per-frame conditionals, so nothing ever snaps. */}
        {w.leaves &&
          w.leaves.flatMap((c, ci) =>
            [0, 1, 2].map((li) => {
              const seed = ci * 3 + li;
              const fallSpeed = 0.028 + (seed % 3) * 0.006;
              const xBase = (seed * 0.171) % 1;
              const y = ((t * fallSpeed + seed * 0.37) % 1.15) * H - H * 0.1;
              const sway = Math.sin(t * (0.7 + (seed % 4) * 0.15) + seed * 1.7) * W * 0.045;
              const x = xBase * W + sway;
              const spin = t * (30 + seed * 11) + seed * 40;
              const s = 0.6 + (seed % 3) * 0.18;
              return (
                <g key={`lf${ci}-${li}`} transform={`translate(${x} ${y}) rotate(${spin}) scale(${s})`} opacity={0.85}>
                  <path
                    d="M 0 -16 C 10 -10 12 4 0 16 C -12 4 -10 -10 0 -16 Z"
                    fill={c}
                  />
                  <path d="M 0 -14 L 0 14" stroke="#000" strokeWidth={1.4} opacity={0.18} />
                </g>
              );
            })
          )}

        {/* chalk hopscotch on the path */}
        {w.chalksquares && w.parkground && (() => {
          const py = H * (w.parkground!.at + 0.145) + 18;
          return (
            <g opacity={0.5} stroke="#FFFFFF" strokeWidth={5} fill="none">
              {Array.from({ length: 4 }, (_, i) => (
                <rect key={`hs${i}`} x={W * 0.06 + i * 96} y={py + (i % 2) * 10} width={78} height={64} rx={6} />
              ))}
              {Array.from({ length: 4 }, (_, i) => (
                <rect key={`hs2${i}`} x={W * 0.72 + i * 96} y={py + ((i + 1) % 2) * 10} width={78} height={64} rx={6} />
              ))}
            </g>
          );
        })()}

        {/* the picnic blanket, bottom-left, under the stage band */}
        {w.blanket && w.parkground && (() => {
          const [a, b] = w.blanket!;
          const y = H * (w.parkground!.at + 0.09);
          return (
            <g transform={`translate(${W * 0.04} ${y})`}>
              <ellipse cx={130} cy={62} rx={150} ry={44} fill="#000" opacity={0.1} />
              <rect x={0} y={0} width={260} height={92} rx={12} fill={a} transform="rotate(-3)" />
              {Array.from({ length: 5 }, (_, i) => (
                <rect key={`bl${i}`} x={i * 52} y={0} width={24} height={92} fill={b} opacity={0.55} transform="rotate(-3)" />
              ))}
            </g>
          );
        })()}

        {/* the bandstand, behind the stage but off-centre so it never sits under the abacus */}
        {w.bandstand && w.parkground && (() => {
          const gy = H * w.parkground!.at + 8;
          const x = W * 0.16;
          const rw = W * 0.16;
          return (
            <g opacity={0.95}>
              {Array.from({ length: 4 }, (_, i) => (
                <rect key={`bp${i}`} x={x - rw / 2 + (i * rw) / 3 - 5} y={gy - H * 0.17} width={11} height={H * 0.17} fill="#FFF6E4" />
              ))}
              <rect x={x - rw / 2 - 14} y={gy - H * 0.185} width={rw + 28} height={16} rx={6} fill="#FFF6E4" />
              <path d={`M ${x - rw / 2 - 26} ${gy - H * 0.185} Q ${x} ${gy - H * 0.31} ${x + rw / 2 + 26} ${gy - H * 0.185} Z`} fill="#FF6B8A" />
              <circle cx={x} cy={gy - H * 0.315} r={9} fill="#FFD23F" />
              <rect x={x - rw / 2 - 14} y={gy - 8} width={rw + 28} height={14} rx={5} fill="#E7D6B4" />
            </g>
          );
        })()}

        {/* paper lanterns strung between the trees — the evening close */}
        {w.lanterns && (() => {
          const cols = w.lanterns!;
          const sag = H * 0.055;
          const y0 = H * 0.1;
          return (
            <g>
              <path d={`M -20 ${y0} Q ${W / 2} ${y0 + sag * 2.2} ${W + 20} ${y0}`} stroke="#2A1C3E" strokeWidth={4} fill="none" opacity={0.75} />
              {Array.from({ length: 11 }, (_, i) => {
                const u = (i + 0.5) / 11;
                const x = -20 + u * (W + 40);
                const y = y0 + Math.sin(Math.PI * u) * sag * 2.2 * 0.5 + 10;
                const c = cols[i % cols.length];
                const glow = 0.7 + Math.sin(t * 1.4 + i * 0.9) * 0.22;
                return (
                  <g key={`ln${i}`}>
                    <circle cx={x} cy={y + 26} r={34} fill={c} opacity={0.14 * glow} />
                    <ellipse cx={x} cy={y + 26} rx={15} ry={19} fill={c} opacity={glow} />
                    <rect x={x - 7} y={y + 6} width={14} height={7} rx={2} fill="#2A1C3E" opacity={0.8} />
                  </g>
                );
              })}
            </g>
          );
        })()}

        {/* two small birds, wandering. The park's version of E03's gulls. */}
        {w.birds &&
          [0, 1].map((i) => {
            const u = ((t * 0.035 + i * 0.45) % 1.3) - 0.15;
            const x = u * W;
            const y = H * (0.13 + i * 0.06) + Math.sin(t * 0.9 + i * 2) * 14;
            const flap = Math.sin(t * 6 + i * 1.7) * 8;
            return (
              <g key={`bd${i}`} opacity={0.55}>
                <path
                  d={`M ${x - 15} ${y} q 8 ${-9 - flap} 15 0 q 7 ${-9 - flap} 15 0`}
                  stroke={w.ink}
                  strokeWidth={3.4}
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

        {/* ══════════════════════════════ E09 · THE BOARDWALK AT DUSK ══════════════════════════════
            Eleven worlds share one pier (deck, railing, dark water) and swap what stands on it.
            Background pieces (stalls, carousel, ferris wheel) get the SAME soft-focus treatment
            E08's trees learned they needed — blurred and desaturated, so the eye goes to the
            abacus and the cards, not the scenery. */}

        {/* the pier: deck, a darker seam at the rail line, dark water below with a soft shimmer */}
        {w.pier && (() => {
          const pr = w.pier!;
          const dy = H * pr.at;
          return (
            <g>
              <rect x={0} y={dy} width={W} height={H - dy} fill={pr.sea} />
              {Array.from({ length: 5 }, (_, i) => {
                const y = dy + H * 0.03 + i * H * 0.045;
                const wob = Math.sin(t * 0.6 + i * 1.4) * 10;
                return (
                  <rect key={`shim${i}`} x={wob} y={y} width={W} height={2} fill="#FFFFFF" opacity={0.08} />
                );
              })}
              <rect x={0} y={dy - H * 0.16} width={W} height={H * 0.16} fill={pr.deck} />
              <rect x={0} y={dy - H * 0.16} width={W} height={6} fill="#000" opacity={0.12} />
              {Array.from({ length: Math.ceil(W / 70) }, (_, i) => (
                <rect key={`plank${i}`} x={i * 70} y={dy - H * 0.16} width={3} height={H * 0.16} fill={pr.deckDark} opacity={0.35} />
              ))}
            </g>
          );
        })()}

        {/* background stalls: two soft-focus rows of peaked-roof silhouettes */}
        {w.stalls && w.pier && (() => {
          const st = w.stalls!;
          const gy = H * w.pier!.at - H * 0.16;
          return (
            <g>
              <g style={{ filter: "blur(2px) saturate(0.55) brightness(1.08)" }} opacity={0.6}>
                {Array.from({ length: 6 }, (_, i) => {
                  const u = (i + 0.5) / 6;
                  const x = (u < 0.5 ? u * 0.6 : 1 - (1 - u) * 0.6) * W;
                  const hgt = H * 0.1;
                  const wid = W * 0.11;
                  return (
                    <g key={`sf${i}`}>
                      <rect x={x - wid / 2} y={gy - hgt} width={wid} height={hgt} fill={st.far} />
                      <polygon points={`${x - wid / 2 - 6},${gy - hgt} ${x},${gy - hgt - hgt * 0.55} ${x + wid / 2 + 6},${gy - hgt}`} fill={st.roof} />
                    </g>
                  );
                })}
              </g>
              <g style={{ filter: "blur(1px) saturate(0.7) brightness(1.04)" }} opacity={0.75}>
                {[0, 1].map((i) => {
                  const x = i === 0 ? W * 0.1 : W * 0.9;
                  const hgt = H * 0.15;
                  const wid = W * 0.15;
                  const glow = 0.5 + Math.sin(t * 1.6 + i) * 0.15;
                  return (
                    <g key={`sn${i}`}>
                      <rect x={x - wid / 2} y={gy - hgt} width={wid} height={hgt} fill={st.near} />
                      <polygon points={`${x - wid / 2 - 8},${gy - hgt} ${x},${gy - hgt - hgt * 0.5} ${x + wid / 2 + 8},${gy - hgt}`} fill={st.roof} />
                      <rect x={x - wid * 0.28} y={gy - hgt * 0.62} width={wid * 0.22} height={hgt * 0.3} fill="#FFE9A8" opacity={glow} />
                      <rect x={x + wid * 0.06} y={gy - hgt * 0.62} width={wid * 0.22} height={hgt * 0.3} fill="#FFE9A8" opacity={glow} />
                    </g>
                  );
                })}
              </g>
            </g>
          );
        })()}

        {/* pier railing along the deck line */}
        {w.railing && w.pier && (() => {
          const gy = H * w.pier!.at - H * 0.16 + 4;
          const n = Math.ceil(W / 60);
          return (
            <g opacity={0.85}>
              <rect x={0} y={gy - 30} width={W} height={5} fill={w.railing} />
              {Array.from({ length: n }, (_, i) => (
                <rect key={`rl${i}`} x={i * 60 + 10} y={gy - 30} width={5} height={30} fill={w.railing} />
              ))}
            </g>
          );
        })()}

        {/* the ice-cream cart, left gutter — SMALL and LOW enough to clear the sum card.
            The sum card occupies x:44-320, y:254-550 (16:9, at its own natural size). The cart
            used to reach y=475, deep into that box, for the entire "look first"/"the wall"/
            "one more" run — 36 phrases. Shrunk to clear the card's bottom by ~15px in the
            tightest case (scoopdelivery's pier.at=0.75) rather than just moved, since a cart the
            same size sitting further away still reads as a cart; a corner sliver would not. */}
        {w.cart && w.pier && (() => {
          const gy = H * w.pier!.at - H * 0.16;
          const x = W * 0.08;
          const cw = W * 0.08;
          const ch = H * 0.068;
          const sway = Math.sin(t * 1.1) * 2;
          return (
            <g transform={`translate(${sway} 0)`}>
              <rect x={x - cw / 2} y={gy - ch} width={cw} height={ch} rx={10} fill="#FFF3EC" />
              <rect x={x - cw / 2} y={gy - ch} width={cw} height={ch * 0.22} fill="#F5567F" />
              {Array.from({ length: 5 }, (_, i) => (
                <polygon
                  key={`aw${i}`}
                  points={`${x - cw / 2 + (i * cw) / 5},${gy - ch + ch * 0.22} ${x - cw / 2 + ((i + 1) * cw) / 5},${gy - ch + ch * 0.22} ${x - cw / 2 + ((i + 1) * cw) / 5},${gy - ch + ch * 0.34} ${x - cw / 2 + (i * cw) / 5 + cw * 0.03},${gy - ch + ch * 0.4}`}
                  fill={i % 2 === 0 ? "#FFFFFF" : "#F5567F"}
                />
              ))}
              <circle cx={x - cw * 0.28} cy={gy + 8} r={9} fill="#5A3F28" />
              <circle cx={x + cw * 0.28} cy={gy + 8} r={9} fill="#5A3F28" />
              <rect x={x - cw * 0.42} y={gy - ch * 0.36} width={cw * 0.84} height={ch * 0.3} rx={6} fill="#33574F" />
            </g>
          );
        })()}

        {/* the red call box — "so we call a friend", made literal. Same clearance fix as the cart:
            was reaching y=432, well inside the sum card's y:254-550. */}
        {w.callbox && w.pier && (() => {
          const gy = H * w.pier!.at - H * 0.16;
          const x = W * 0.09;
          const bw = W * 0.045;
          const bh = H * 0.075;
          const glow = 0.7 + Math.sin(t * 2.4) * 0.3;
          return (
            <g>
              <rect x={x - bw / 2} y={gy - bh} width={bw} height={bh} rx={4} fill="#C4284C" />
              <rect x={x - bw / 2 + 5} y={gy - bh + 10} width={bw - 10} height={bh * 0.42} rx={2} fill="#7A1030" opacity={0.6} />
              <rect x={x - bw * 0.36} y={gy - bh * 0.52} width={bw * 0.72} height={bh * 0.3} rx={2} fill="#FFF3C4" opacity={glow} />
              <rect x={x - bw / 2 - 6} y={gy - bh - 8} width={bw + 12} height={10} rx={3} fill="#A61E3E" />
            </g>
          );
        })()}

        {/* a turning carousel silhouette, soft-focus, warm lit canopy */}
        {w.carousel && w.pier && (() => {
          const gy = H * w.pier!.at - H * 0.16;
          const x = W * 0.16;
          const r = H * 0.16;
          const spin = (t * 14) % 360;
          return (
            <g style={{ filter: "blur(1.4px) saturate(0.65) brightness(1.05)" }} opacity={0.7}>
              <polygon points={`${x - r},${gy - r * 0.7} ${x},${gy - r * 1.5} ${x + r},${gy - r * 0.7}`} fill="#B95E8E" />
              <rect x={x - r} y={gy - r * 0.72} width={r * 2} height={8} fill="#FFE08A" />
              <g transform={`rotate(${spin} ${x} ${gy - r * 0.3})`}>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const a = (i / 6) * Math.PI * 2;
                  return (
                    <line key={i} x1={x} y1={gy - r * 0.3} x2={x + Math.cos(a) * r * 0.65} y2={gy - r * 0.3 + Math.sin(a) * r * 0.65} stroke="#FFE08A" strokeWidth={3} />
                  );
                })}
              </g>
              <rect x={x - r * 0.9} y={gy - r * 0.36} width={r * 1.8} height={r * 0.36} fill="#8A4C8E" />
            </g>
          );
        })()}

        {/* a turning ferris wheel silhouette, soft-focus, lit spokes */}
        {w.ferriswheel && w.pier && (() => {
          const gy = H * w.pier!.at - H * 0.16;
          const x = W * 0.82;
          const r = H * 0.26;
          const spin = (t * 8) % 360;
          return (
            <g style={{ filter: "blur(1.6px) saturate(0.6) brightness(1.05)" }} opacity={0.62}>
              <circle cx={x} cy={gy - r} r={r} fill="none" stroke="#FFAE4A" strokeWidth={6} opacity={0.55} />
              <g transform={`rotate(${spin} ${x} ${gy - r})`}>
                {Array.from({ length: 8 }, (_, i) => {
                  const a = (i / 8) * Math.PI * 2;
                  const px = x + Math.cos(a) * r;
                  const py = gy - r + Math.sin(a) * r;
                  return (
                    <g key={i}>
                      <line x1={x} y1={gy - r} x2={px} y2={py} stroke="#FFAE4A" strokeWidth={3} opacity={0.5} />
                      <circle cx={px} cy={py} r={7} fill="#FFE08A" opacity={0.85} />
                    </g>
                  );
                })}
              </g>
              <line x1={x} y1={gy - r * 2} x2={x} y2={gy} stroke="#8A5A3C" strokeWidth={6} opacity={0.5} />
            </g>
          );
        })()}

        {/* fireworks bursting over the pier — the close */}
        {w.fireworksBurst &&
          w.fireworksBurst.map((c, i) => {
            const cyc = 3.2;
            const ph = (t / cyc + i * 0.37) % 1;
            const x = W * (0.18 + i * 0.22);
            const y = H * 0.22 + i * H * 0.03;
            const grow = ph < 0.5 ? ph / 0.5 : 1 - (ph - 0.5) / 0.5;
            if (grow <= 0.02) return null;
            const rad = 20 + grow * 70;
            return (
              <g key={`fw${i}`} opacity={Math.min(1, grow * 1.6)}>
                {Array.from({ length: 10 }, (_, k) => {
                  const a = (k / 10) * Math.PI * 2;
                  return (
                    <circle key={k} cx={x + Math.cos(a) * rad} cy={y + Math.sin(a) * rad} r={4} fill={c} />
                  );
                })}
              </g>
            );
          })}

        {/* FERNS along the bottom edge: blades fanning up from below the frame. Undergrowth is what
            stops a ground band being a green rectangle — the same lesson E03's shells taught. */}
        {w.ferns &&
          Array.from({ length: 16 }, (_, i) => {
            const x = ((i + 0.5) / 16) * W + (rand(i + 31) - 0.5) * 40;
            const hgt = H * (0.07 + rand(i + 3) * 0.07);
            const lean = (rand(i + 17) - 0.5) * 46 + Math.sin(t * 0.7 + i) * 6;
            return (
              <g key={`fern${i}`}>
                <path
                  d={`M ${x} ${H + 10} Q ${x + lean * 0.4} ${H - hgt * 0.6} ${x + lean} ${H - hgt}`}
                  fill="none"
                  stroke={w.ferns}
                  strokeWidth={6}
                  strokeLinecap="round"
                />
                {[0.35, 0.6, 0.85].map((f, k) => {
                  const bx = x + lean * f;
                  const by = H + 10 - hgt * f;
                  return (
                    <g key={k}>
                      <ellipse cx={bx - 13} cy={by} rx={13} ry={6} fill={w.ferns} transform={`rotate(-24 ${bx - 13} ${by})`} />
                      <ellipse cx={bx + 13} cy={by} rx={13} ry={6} fill={w.ferns} transform={`rotate(24 ${bx + 13} ${by})`} />
                    </g>
                  );
                })}
              </g>
            );
          })}

        {/* blossoms: a few in the canopy, a few drifting down past it */}
        {w.blossoms &&
          Array.from({ length: 14 }, (_, i) => {
            const cols = w.blossoms!;
            const col = cols[i % cols.length];
            const x = rand(i + 41) * W + Math.sin(t * 0.5 + i) * 26;
            const fall = ((t * (24 + rand(i + 5) * 26) + rand(i + 11) * H) % (H + 120)) - 60;
            const r = 7 + rand(i + 19) * 5;
            return (
              <g key={`bl${i}`} transform={`translate(${x} ${fall}) rotate(${t * 22 + i * 40})`} opacity={0.9}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx={0} cy={-r} rx={r * 0.5} ry={r} fill={col} transform={`rotate(${a})`} />
                ))}
                <circle r={r * 0.42} fill="#FFF3C4" />
              </g>
            );
          })}

        {/* two butterflies, wandering high — the jungle's answer to E03's gulls.
            TWO LOBES PER SIDE (a bigger rounded upper wing, a smaller trailing lower wing), not a
            single ellipse — a real butterfly's silhouette is not a blob, and a flap that only
            scaled an ellipse's width read as a shrinking pill rather than a wingbeat. The flap
            itself now scales each wing PAIR horizontally toward the body (0.3..1.0), which is the
            actual shape of a wingbeat — closing toward the body, not shrinking in place — plus a
            slight body roll into the sine drift so the flight path reads as banking, not sliding
            sideways on rails. */}
        {w.butterflies &&
          w.butterflies.map((col, i) => {
            const per = 15 + i * 4;
            const a = ((t + i * 7) % per) / per;
            const x = -70 + a * (W + 140);
            const drift = Math.sin(t * 1.6 + i * 2);
            const y = H * (0.14 + i * 0.1) + drift * 42;
            const flap = Math.abs(Math.sin(t * 9 + i));
            const wingOpen = 0.3 + flap * 0.7;
            return (
              <g key={`bf${i}`} transform={`translate(${x} ${y}) rotate(${drift * 14})`}>
                {[-1, 1].map((side) => (
                  <g key={side} transform={`scale(${side * wingOpen} 1)`}>
                    {/* upper wing — the bigger, rounder lobe */}
                    <path d="M 2 -2 C 10 -20 30 -22 34 -6 C 36 4 22 8 8 4 Z" fill={col} opacity={0.96} />
                    {/* lower wing — smaller, trailing */}
                    <path d="M 2 2 C 8 14 22 18 24 8 C 25 2 14 -1 6 1 Z" fill={col} opacity={0.8} />
                    {/* a pale spot on the upper wing — the detail that stops it reading as a flat cutout */}
                    <ellipse cx={18} cy={-8} rx={4} ry={3} fill="#FFFFFF" opacity={0.55} />
                  </g>
                ))}
                {/* body — a small round head, then a tapered thorax/abdomen */}
                <circle cx={0} cy={-6} r={2.4} fill="#3A2A1E" />
                <path d="M 0 -4 Q -1.6 6 0 14 Q 1.6 6 0 -4 Z" fill="#3A2A1E" />
                {/* antennae */}
                <path
                  d="M 0 -8 Q -4 -14 -6 -17 M 0 -8 Q 4 -14 6 -17"
                  stroke="#3A2A1E"
                  strokeWidth={1.2}
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

        {/* E15 · the sea-otter kelp cove — only worlds that set `cove` draw it */}
        {w.cove && <CoveLayer cove={w.cove} t={t} W={W} H={H} />}
        {/* E08 · Dino Valley — only worlds that set `dino` draw it */}
        {w.dino && <DinoLayer dino={w.dino} t={t} W={W} H={H} />}
        {w.bb && <ThemeLayer theme={w.bb.theme} mood={w.bb.mood} t={t} W={W} H={H} />}

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
