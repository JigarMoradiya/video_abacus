import sys
sys.path.insert(0, "tools")
from bb_convert import convert

HEADER = '''// E10 · GALAXY QUIZ STATION REMAKE (Bead Buddies series, docs/COVE_SERIES_PLAN.md). SAME audio, phrase table, timings, rounds, wheel
// mechanic and teaching beats as the delivered E10 (src/reels/e10_small_friend_game.tsx, kept for reference). Only the foxes and the
// TV-studio worlds are replaced: Fifi (left) and Tenzo (right) are the rival contestants in space helmets and a cape, Pip hosts from
// the left edge, in a calm Galaxy Quiz Station with an alien and a robot at the edges.
'''

def extra(s):
    s = s.replace('import { Fox, FOX_BOX, type FoxMood } from "../components/e10/Fox";',
      'import { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, OT_K, PAIR_GAP as CAST_GAP } from "../components/cast";\nimport { Otter } from "../components/cast";\nimport type { OtterMood } from "../components/cast";\ntype FoxMood = "sit" | "wave" | "think" | "worry" | "point" | "cheer" | "buzz";\nconst MOOD: Record<FoxMood, OtterMood> = { sit: "float", wave: "wave", think: "think", worry: "worry", point: "point", cheer: "cheer", buzz: "wave" };\nconst FOX_BOX = { up: CAST_BOX.up * OT_K, down: CAST_BOX.down, half: CAST_BOX.half * OT_K };')
    s = s.replace('const FOX_GAP = 84;', 'const FOX_GAP = CAST_GAP * 1.12;')
    s = s.replace('return { x: L.W - 190 * scale, y: L.H * (L.portrait ? 0.8 : 0.86), scale };', 'return { x: L.W - (FOX_GAP + FOX_BOX.half) * scale - 40, y: L.H * (L.portrait ? 0.8 : 0.86), scale };').replace('const scale = L.portrait ? 0.85 : 1.0;\n    return { x: L.W','const scale = L.portrait ? 0.85 : 1.1;\n    return { x: L.W')
    s = s.replace('return { x: 780, y: 1120, scale: 0.85 };', 'return { x: 790, y: 1140, scale: 0.78 };')
    s = s.replace('x: Math.min(box.left + box.w + FOX_HALF * scale + 26, L.W - FOX_HALF * scale - 14),', 'x: Math.min(box.left + box.w + FOX_HALF * scale + 40, L.W - FOX_HALF * scale - 200),')
    s = s.replace('const scale = box.scale * 0.92;\n  return {\n    x: Math.min', 'const scale = box.scale * 0.95;\n  return {\n    x: Math.min')
    a = s.index('                  <Fox\n')
    b = s.index('                </>', a)
    s = s[:a] + '''                  <CastGroup x={m.x} y={m.y} scale={m.scale} actors={[{ role: "middle", mood: MOOD[scene.foxes!.left], prop: "magnifier" }, { role: "big", mood: MOOD[scene.foxes!.right] }]} costume="helmet" look={ctx.layout.portrait ? 1 : -1} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
''' + s[b:]
    marker = '        {/* THE FOXES */}'
    pieces = '''        {/* THE QUIZ STATION'S EDGE FRIENDS: Pip the host (left), an alien (far right) and a robot (top-left) */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const f = scene.foxes;
          const bothCheer = Boolean(f && f.left === "cheer" && f.right === "cheer");
          const alive = p <= 5 || p >= 76 || bothCheer;
          const unsure = Boolean(f && (f.left === "worry" || f.right === "worry" || f.left === "think" || f.right === "think"));
          const mood = pieceMood(alive, unsure);
          const hostMood: OtterMood = bothCheer ? "cheer" : f && (f.left === "buzz" || f.right === "buzz") ? "point" : unsure ? "think" : "present";
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Pieces mood={mood} frame={ctx.frame} fps={FPS} pieces={[
                { kind: "alien", x: 1850, y: 905, scale: 0.95, facing: -1, show: !L.portrait && !scene.closing },
                { kind: "robo", x: 170 + Math.sin(ctx.frame / FPS * 0.5) * 50, y: 300, scale: 0.9, show: !L.portrait },
              ]} />
              {!L.portrait && (
                <g>
                  <ellipse cx={190} cy={904} rx={80} ry={11} fill="#000" opacity={0.2} />
                  <Otter x={190} y={900} scale={OT_K * 0.95} role="little" mood={hostMood} costume="helmet" prop="binoculars" look={1} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} famScale={OT_K * 0.95} />
                </g>
              )}
            </svg>
          );
        })()}

'''
    s = s.replace(marker, pieces + marker, 1)
    return s

convert('src/reels/e10_small_friend_game.tsx', 'src/reels/e10_galaxy_quiz.tsx', header=HEADER,
        comp='E10SmallFriendGame', comp_new='E10GalaxyQuiz', dur='E10_DURATION', dur_new='E10_GALAXY_DURATION',
        rig='RIG_SHOW', rig_new='RIG_SPACE',
        worlds={'showlights': 'spaceA', 'buzzerstage': 'spaceB', 'greenroom': 'spaceC', 'buzzerstagehot': 'spaceC', 'confettifinale': 'spaceD'},
        extra=extra)
