import sys
sys.path.insert(0, "tools")
from bb_convert import convert

HEADER = '''// E13 · TOY TRAIN VALLEY REMAKE (Bead Buddies series, docs/COVE_SERIES_PLAN.md). SAME audio, phrase table, timings, teaching beats and
// abacus tables as the delivered E13 (src/reels/e13_big_friend_taking_away.tsx, kept for reference). Only the squirrels and the autumn
// park worlds are replaced: Fifi and Tenzo (a PAIR) in conductor caps and a blue cape in a calm Toy Train Valley, with a
// toy engine and a carriage at the edges. The squirrels' acorn "give" is now a bead handed paw to paw.
'''

def extra(s):
    s = s.replace('import { Squirrel, type SquirrelMood, SQUIRREL_BOX } from "../components/e13/Squirrel";',
      'import { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, OT_K } from "../components/cast";\nimport type { OtterMood } from "../components/cast";\ntype SquirrelMood = "sit" | "wave" | "think" | "worry" | "point" | "cheer" | "give";\nconst MOOD: Record<SquirrelMood, OtterMood> = { sit: "float", wave: "wave", think: "think", worry: "worry", point: "point", cheer: "cheer", give: "present" };\nconst SQUIRREL_BOX = { up: CAST_BOX.up * OT_K, down: CAST_BOX.down, half: pairHalf(2) };')
    s = s.replace('const scale = L.portrait ? 0.62 : 0.72;\n    return { x: L.W - 220 * scale, y: L.H * (L.portrait ? 0.74 : 0.8), scale, gap: 130 * scale };', 'const scale = L.portrait ? 0.9 : 1.15;\n    return { x: L.W - pairHalf(2) * scale - 40, y: L.H * (L.portrait ? 0.74 : 0.84), scale, gap: 0 };')
    s = s.replace('const scale = box.scale * (aside ? 0.56 : 0.66) * (crowded ? 0.66 : 1);\n    return {\n      x: aside ? L.W - SQUIRREL_BOX.half * scale - 70 : L.W / 2,\n      y: box.top + box.h + 380 * scale + portraitLift,\n      scale,\n      gap: 140 * scale,','const scale = box.scale * (aside ? 0.55 : 0.7) * (crowded ? 0.66 : 1);\n    return {\n      x: aside ? L.W - SQUIRREL_BOX.half * scale - 40 : L.W / 2,\n      y: box.top + box.h + 400 * scale + portraitLift,\n      scale,\n      gap: 0,')
    s = s.replace('''  const scale = box.scale * 0.64 * (crowded ? 0.5 : 1);
  return {
    x: Math.min(box.left + box.w + 300 * box.scale, L.W - SQUIRREL_BOX.half * scale * 2 - 16),
    y: box.top + box.h + (crowded ? 40 : 0),
    scale,
    // half-gap ≈ 95·scale (base scale), so the acorns meet on `give` without overlapping at rest
    gap: 190 * scale,''','''  const scale = box.scale * 0.95 * (crowded ? 0.5 : 1);
  return {
    x: Math.min(box.left + box.w + SQUIRREL_BOX.half * scale + 190, L.W - SQUIRREL_BOX.half * scale - 50),
    y: box.top + box.h + 16 + (crowded ? 40 : 0),
    scale,
    gap: 0,''')
    s = s.replace('''const squirrelPairRect = (m: { x: number; y: number; scale: number; gap: number }) => ({
  x: m.x - (SQUIRREL_BOX.half * m.scale + m.gap / 2),
  y: m.y - SQUIRREL_BOX.up * m.scale,
  w: SQUIRREL_BOX.half * m.scale * 2 + m.gap,
  h: (SQUIRREL_BOX.up + SQUIRREL_BOX.down) * m.scale,
});''','''const squirrelPairRect = (m: { x: number; y: number; scale: number; gap: number }) => castRect(m, 2);''')
    a = s.index('                  <Squirrel\n')
    b = s.index('                </>', a)
    s = s[:a] + '''                  <CastGroup x={m.x} y={m.y} scale={m.scale} actors={[{ role: "middle", mood: MOOD[scene.squirrel!] }, { role: "big", mood: MOOD[scene.squirrel!] }]} costume="conductor" look={ctx.layout.portrait ? 1 : -1} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
''' + s[b:]
    i = s.index('<WhyCard'); j = s.index('/>', i)
    s = s[:i] + s[i:j].rstrip() + '\n                ghost\n              ' + s[j:]
    s = s.replace('  opacity: 0.4,', '  opacity: 0.8,', 1)
    s = s.replace('  const rate = STORE_FRAMES / 136;', '  add(at(26) + 4, "boing.mp3", 26, 0.2);\n  const rate = STORE_FRAMES / 136;', 1)
    marker = '        {/* THE TWO SQUIRRELS */}'
    pieces = '''        {/* THE VALLEY'S EDGE FRIENDS: a toy engine with a carriage (bottom-left) and a second carriage far right */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const t = scene.squirrel;
          const alive = p <= 3 || p >= 106 || t === "cheer" || t === "give";
          const unsure = t === "worry" || t === "think";
          const mood = pieceMood(alive, unsure);
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Pieces mood={mood} frame={ctx.frame} fps={FPS} pieces={[
                { kind: "engine", x: 200, y: 905, scale: 0.9, facing: 1, show: !L.portrait },
                { kind: "carriage", x: 1860, y: 905, scale: 1.0, show: !L.portrait && !scene.closing },
                { kind: "engine", x: 150, y: 300, scale: 0.55, show: L.portrait },
              ]} />
            </svg>
          );
        })()}

'''
    s = s.replace(marker, pieces + marker, 1)
    return s

convert('src/reels/e13_big_friend_taking_away.tsx', 'src/reels/e13_train_valley.tsx', card_accent='#9A4A0A', header=HEADER,
        comp='E13BigFriendTakingAway', comp_new='E13TrainValley', dur='E13_DURATION', dur_new='E13_TRAIN_DURATION',
        rig='RIG_AUTUMN', rig_new='RIG_TRAIN',
        worlds={'parkfall': 'trainA', 'hollowtrunk': 'trainB', 'emptybranch': 'trainB', 'acornstash': 'trainC', 'whyclearing': 'trainB', 'russetpath': 'trainC', 'goldenfall': 'trainC', 'duskgrove': 'trainD', 'leafdrift': 'trainC', 'acornchallenge': 'trainB', 'harvestglow': 'trainD'},
        extra=extra)
