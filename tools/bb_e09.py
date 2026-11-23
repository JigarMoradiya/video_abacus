import sys
sys.path.insert(0, "tools")
from bb_convert import convert

HEADER = '''// E09 · SNOW MOUNTAIN REMAKE (Bead Buddies series, docs/COVE_SERIES_PLAN.md). SAME audio, phrase table, timings, teaching beats, cards
// and abacus tables as the delivered E09 (src/reels/e09_small_friend_subtract.tsx, kept for reference). Only the seagulls and the
// boardwalk worlds are replaced: Pip and Fifi in woolly scarves and beanies in a calm Snow Mountain, with a snowman and a penguin at the edges.
// Taking away is going DOWN: the friend arrives at the bend. The call-box gag keeps its beats (Pip calls out, Fifi answers).
'''

def extra(s):
    s = s.replace('import { Seagull, GULL_BOX, type SeagullMood } from "../components/e09/Seagull";',
      'import { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, OT_K, PAIR_GAP as CAST_GAP } from "../components/cast";\nimport type { OtterMood } from "../components/cast";\ntype SeagullMood = "sit" | "wave" | "think" | "worry" | "point" | "cheer" | "call" | "ring";\nconst MOOD: Record<SeagullMood, OtterMood> = { sit: "float", wave: "wave", think: "think", worry: "worry", point: "point", cheer: "cheer", call: "wave", ring: "present" };\nconst GULL_BOX = { up: CAST_BOX.up * OT_K, down: CAST_BOX.down, half: CAST_BOX.half * OT_K };')
    s = s.replace('const GULL_GAP = 84;', 'const GULL_GAP = CAST_GAP;')
    s = s.replace('return { x: L.W - 190 * scale, y: L.H * (L.portrait ? 0.8 : 0.86), scale };', 'return { x: L.W - (GULL_GAP + GULL_BOX.half) * scale - 40, y: L.H * (L.portrait ? 0.8 : 0.86), scale };').replace('const scale = L.portrait ? 0.85 : 1.0;\n    return { x: L.W','const scale = L.portrait ? 0.85 : 1.15;\n    return { x: L.W')
    s = s.replace('return { x: 780, y: 1120, scale: 0.85 };', 'return { x: 790, y: 1140, scale: 0.78 };')
    s = s.replace('x: Math.min(box.left + box.w + GULL_HALF * scale + 26, L.W - GULL_HALF * scale - 14),', 'x: Math.min(box.left + box.w + GULL_HALF * scale + 40, L.W - GULL_HALF * scale - 200),')
    s = s.replace('const scale = box.scale * 0.92;\n  return {\n    x: Math.min', 'const scale = box.scale * 0.95;\n  return {\n    x: Math.min')
    a = s.index('                  <Seagull\n')
    b = s.index('                </>', a)
    s = s[:a] + '''                  <CastGroup x={m.x} y={m.y} scale={m.scale} actors={[{ role: "little", mood: MOOD[scene.gulls!.left], prop: "binoculars" }, { role: "middle", mood: MOOD[scene.gulls!.right] }]} costume="scarf" look={ctx.layout.portrait ? 1 : -1} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
''' + s[b:]
    marker = '        {/* THE SEAGULLS */}'
    pieces = '''        {/* THE SNOW MOUNTAIN'S EDGE FRIENDS: a snowman (bottom-left) and a penguin (far right), calm while teaching */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const g = scene.gulls;
          const alive = p <= 6 || p >= 86 || Boolean(g && g.left === "cheer" && g.right === "cheer");
          const unsure = Boolean(g && (g.left === "worry" || g.right === "worry" || g.left === "think" || g.right === "think"));
          const mood = pieceMood(alive, unsure);
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Pieces mood={mood} frame={ctx.frame} fps={FPS} pieces={[
                { kind: "snowman", x: 170, y: 890, scale: 0.95, show: !L.portrait },
                { kind: "penguin", x: 1850, y: 905, scale: 1.05, facing: -1, show: !L.portrait && !scene.closing },
              ]} />
            </svg>
          );
        })()}

'''
    s = s.replace(marker, pieces + marker, 1)
    return s

convert('src/reels/e09_small_friend_subtract.tsx', 'src/reels/e09_snow_mountain.tsx', header=HEADER,
        comp='E09SmallFriendSubtract', comp_new='E09SnowMountain', dur='E09_DURATION', dur_new='E09_SNOW_DURATION',
        rig='RIG_ICE', rig_new='RIG_SNOW',
        worlds={'boardwalkdusk': 'snowA', 'cartfront': 'snowB', 'emptytray': 'snowB', 'scoopdelivery': 'snowC', 'callbox': 'snowC', 'benchlights': 'snowB', 'carouselglow': 'snowC', 'duskdock': 'snowD', 'ferriswheel': 'snowD', 'fireworks': 'snowD'},
        extra=extra)
