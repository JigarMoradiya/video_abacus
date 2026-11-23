import sys
sys.path.insert(0, "tools")
from bb_convert import convert

HEADER = '''// E12 · SUNNY FARM MARKET REMAKE (Bead Buddies series, docs/COVE_SERIES_PLAN.md). SAME audio, phrase table, timings, teaching beats and
// abacus tables as the delivered E12 (src/reels/e12_all_five_big_friends.tsx, kept for reference). Only the two toucans and the jungle
// worlds are replaced: Fifi and Tenzo (a PAIR, like the friend pairs) in straw hats and a red cape in a calm Sunny Farm Market,
// with a pig and a chick at the edges. Their high-five is a paw bump.
'''

def extra(s):
    s = s.replace('import { Toucan, type ToucanMood } from "../components/e12/Toucan";',
      'import { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, OT_K } from "../components/cast";\nimport type { OtterMood } from "../components/cast";\ntype ToucanMood = "perch" | "wave" | "think" | "worry" | "point" | "cheer" | "highfive";\nconst MOOD: Record<ToucanMood, OtterMood> = { perch: "float", wave: "wave", think: "think", worry: "worry", point: "point", cheer: "cheer", highfive: "present" };')
    s = s.replace('const TOUCAN_BOX = { up: 176, down: 20, half: 150 };', 'const TOUCAN_BOX = { up: CAST_BOX.up * OT_K, down: CAST_BOX.down, half: pairHalf(2) };')
    s = s.replace('const scale = L.portrait ? 0.62 : 0.72;\n    return { x: L.W - 220 * scale, y: L.H * (L.portrait ? 0.74 : 0.8), scale, gap: 170 * scale };', 'const scale = L.portrait ? 0.9 : 1.15;\n    return { x: L.W - pairHalf(2) * scale - 40, y: L.H * (L.portrait ? 0.74 : 0.84), scale, gap: 0 };')
    s = s.replace('const scale = box.scale * (aside ? 0.56 : 0.66);\n    return {\n      x: aside ? L.W - TOUCAN_BOX.half * scale - 70 : L.W / 2,\n      y: box.top + box.h + 380 * scale,\n      scale,\n      gap: 178 * scale,','const scale = box.scale * (aside ? 0.55 : 0.7);\n    return {\n      x: aside ? L.W - TOUCAN_BOX.half * scale - 40 : L.W / 2,\n      y: box.top + box.h + 400 * scale,\n      scale,\n      gap: 0,')
    s = s.replace('''  const scale = box.scale * 0.64 * (crowded ? 0.5 : 1);
  return {
    x: Math.min(box.left + box.w + 300 * box.scale, L.W - TOUCAN_BOX.half * scale * 2 - 16),
    y: box.top + box.h + (crowded ? 40 : 0),
    scale,
    gap: 170 * scale,''','''  const scale = box.scale * 0.95 * (crowded ? 0.5 : 1);
  return {
    x: Math.min(box.left + box.w + TOUCAN_BOX.half * scale + 190, L.W - TOUCAN_BOX.half * scale - 50),
    y: box.top + box.h + 16 + (crowded ? 40 : 0),
    scale,
    gap: 0,''')
    s = s.replace('''const toucanPairRect = (m: { x: number; y: number; scale: number; gap: number }) => ({
  x: m.x - (TOUCAN_BOX.half * m.scale + m.gap / 2),
  y: m.y - TOUCAN_BOX.up * m.scale,
  w: TOUCAN_BOX.half * m.scale * 2 + m.gap,
  h: (TOUCAN_BOX.up + TOUCAN_BOX.down) * m.scale,
});''','''const toucanPairRect = (m: { x: number; y: number; scale: number; gap: number }) => castRect(m, 2);''')
    a = s.index('                  <Toucan\n')
    b = s.index('                </>', a)
    s = s[:a] + '''                  <CastGroup x={m.x} y={m.y} scale={m.scale} actors={[{ role: "middle", mood: MOOD[scene.toucan!] }, { role: "big", mood: MOOD[scene.toucan!] }]} costume="farmer" look={ctx.layout.portrait ? 1 : -1} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
''' + s[b:]
    marker = '        {/* THE TWO TOUCANS */}'
    pieces = '''        {/* THE FARM'S EDGE FRIENDS: a pig (bottom-left) and a chick (far right) */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const t = scene.toucan;
          const alive = p <= 3 || p >= 122 || t === "cheer" || t === "highfive";
          const unsure = t === "worry" || t === "think";
          const mood = pieceMood(alive, unsure);
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Pieces mood={mood} frame={ctx.frame} fps={FPS} pieces={[
                { kind: "pig", x: 190, y: 905, scale: 0.9, show: !L.portrait },
                { kind: "chick", x: 1850, y: 915, scale: 1.0, facing: -1, show: !L.portrait && !scene.closing },
                { kind: "chick", x: 130, y: 300, scale: 0.8, show: L.portrait },
              ]} />
            </svg>
          );
        })()}

'''
    s = s.replace(marker, pieces + marker, 1)
    return s

convert('src/reels/e12_all_five_big_friends.tsx', 'src/reels/e12_farm_market.tsx', card_accent='#B83A0A', header=HEADER,
        comp='E12AllFiveBigFriends', comp_new='E12FarmMarket', dur='E12_DURATION', dur_new='E12_FARM_DURATION',
        rig='RIG_TOUCAN', rig_new='RIG_FARM',
        worlds={'canopyrise': 'farmA', 'friendbranch': 'farmB', 'clearingcheck': 'farmB', 'twinvines': 'farmC', 'buddyperch': 'farmB', 'patternleaf': 'farmC', 'flipbridge': 'farmC', 'yourturncanopy': 'farmB', 'duskfarewell': 'farmD'},
        extra=extra)
