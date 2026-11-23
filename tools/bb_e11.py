import sys
sys.path.insert(0, "tools")
from bb_convert import convert

HEADER = '''// E11 · PIRATE TREASURE ISLAND REMAKE (Bead Buddies series, docs/COVE_SERIES_PLAN.md). SAME audio, phrase table, timings, teaching beats
// and abacus tables as the delivered E11 (src/reels/e11_big_friend_intro.tsx, kept for reference). Only the elephant and the circus worlds
// are replaced: Tenzo (the Big Friend, lead, in a pirate cape) and Pip (pirate hat, binoculars) in a calm Pirate Treasure Island, with a
// parrot and a crab at the edges. Carrying a bead to the tens rod is Tenzo's two-paw lift, like putting a coin in the treasure chest.
'''

def extra(s):
    s = s.replace('import { Elephant, type ElephantMood } from "../components/e11/Elephant";',
      'import { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, OT_K } from "../components/cast";\nimport type { OtterMood } from "../components/cast";\ntype ElephantMood = "peek" | "stuck" | "idea" | "show" | "carry" | "cheer";\nconst LEAD: Record<ElephantMood, OtterMood> = { peek: "wave", stuck: "worry", idea: "present", show: "point", carry: "present", cheer: "cheer" };\nconst SIDE: Record<ElephantMood, OtterMood> = { peek: "float", stuck: "worry", idea: "gasp", show: "think", carry: "point", cheer: "cheer" };')
    s = s.replace('const ELEPHANT_BOX = { up: 300, down: 30, half: 150 };', 'const ELEPHANT_BOX = { up: CAST_BOX.up * OT_K, down: CAST_BOX.down, half: pairHalf(2) };')
    s = s.replace('const scale = L.portrait ? 1.05 : 1.25;\n    return { x: L.W - 150 * scale,', 'const scale = L.portrait ? 0.9 : 1.15;\n    return { x: L.W - pairHalf(2) * scale - 40,')
    s = s.replace('''  const scale = box.scale * 0.86;
  return {
    x: Math.min(box.left + box.w + 340 * box.scale, L.W - ELEPHANT_BOX.half * scale - 16),''','''  const scale = box.scale * 0.95;
  return {
    x: Math.min(box.left + box.w + pairHalf(2) * scale + 190, L.W - pairHalf(2) * scale - 50),''')
    s = s.replace('const scale = box.scale * (aside ? 0.5 : 0.6);','const scale = box.scale * (aside ? 0.55 : 0.75);')
    s = s.replace('''const elephantRect = (m: { x: number; y: number; scale: number }) => ({
  x: m.x - ELEPHANT_BOX.half * m.scale,
  y: m.y - ELEPHANT_BOX.up * m.scale,
  w: ELEPHANT_BOX.half * 2 * m.scale,
  h: (ELEPHANT_BOX.up + ELEPHANT_BOX.down) * m.scale,
});''','''const elephantRect = (m: { x: number; y: number; scale: number }) => castRect(m, 2);''')
    a = s.index('                <Elephant\n')
    b = s.index('/>', a) + 2
    s = s[:a] + '''                <CastGroup x={m.x} y={m.y} scale={m.scale} actors={[{ role: "little", mood: SIDE[scene.elephant!], prop: "binoculars" }, { role: "big", mood: LEAD[scene.elephant!] }]} costume="pirate" progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />''' + s[b:]
    marker = '        {/* THE ELEPHANT */}'
    pieces = '''        {/* THE ISLAND'S EDGE FRIENDS: a parrot (bottom-left) and a crab (far right) */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const e = scene.elephant;
          const alive = p <= 3 || p >= 66 || e === "cheer";
          const unsure = e === "stuck" || e === "idea";
          const mood = pieceMood(alive, unsure);
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Pieces mood={mood} frame={ctx.frame} fps={FPS} pieces={[
                { kind: "parrot", x: 170, y: 890, scale: 0.9, show: !L.portrait },
                { kind: "crab", x: 1850, y: 925, scale: 0.9, facing: -1, show: !L.portrait && !scene.closing },
                { kind: "parrot", x: 120, y: 330, scale: 0.7, show: L.portrait, facing: 1 },
              ]} />
            </svg>
          );
        })()}

'''
    s = s.replace(marker, pieces + marker, 1)
    return s

convert('src/reels/e11_big_friend_intro.tsx', 'src/reels/e11_pirate_island.tsx', header=HEADER,
        comp='E11BigFriendIntro', comp_new='E11PirateIsland', dur='E11_DURATION', dur_new='E11_PIRATE_DURATION',
        rig='RIG_CIRCUS', rig_new='RIG_PIRATE',
        worlds={'ringclosed': 'pirateA', 'sawdustring': 'pirateB', 'secondring': 'pirateB', 'bigtopnaming': 'pirateC', 'bigtopchant': 'pirateC', 'centerring': 'pirateB', 'showtime': 'pirateA', 'secondact': 'pirateC', 'yourturnring': 'pirateB', 'finalebow': 'pirateD'},
        extra=extra)
