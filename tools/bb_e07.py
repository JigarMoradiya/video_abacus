import sys, re
sys.path.insert(0, "tools")
from bb_convert import convert

HEADER = '''// E07 · CLOUD CASTLE REMAKE (Bead Buddies series, docs/COVE_SERIES_PLAN.md). SAME audio, phrase table, timings, teaching beats, cards and
// abacus tables as the delivered E07 (src/reels/e07_small_friend_intro.tsx, kept for reference): only the rabbit/magic-show world
// is replaced by Fifi (the small friend, lead) and Pip in aviator gear in a calm Cloud Castle sky with Cloudy and Sparky at the edges.
'''

def extra(s):
    s = s.replace('import { Rabbit, type RabbitMood } from "../components/e07/Rabbit";',
      'import { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, OT_K, PAIR_GAP } from "../components/cast";\nimport type { OtterMood } from "../components/cast";\ntype RabbitMood = "peek" | "stuck" | "idea" | "show" | "cheer";\nconst PAIRMOOD: Record<RabbitMood, [OtterMood, OtterMood]> = { peek: ["wave", "float"], stuck: ["worry", "worry"], idea: ["present", "gasp"], show: ["point", "think"], cheer: ["cheer", "cheer"] };')
    s = s.replace('const RABBIT_BOX = { up: 292, down: 26, half: 112 };', 'const RABBIT_BOX = { up: CAST_BOX.up * OT_K, down: CAST_BOX.down, half: pairHalf(2) };')
    # landscape placement: beside the abacus on the ground; closing bigger
    s = s.replace('''  const scale = box.scale * 0.98;
  return {
    // stands on the abacus's own baseline, so the hat is on the boards next to the instrument
    x: Math.min(box.left + box.w + 172 * box.scale, L.W - RABBIT_BOX.half * scale - 16),
    y: box.top + box.h,
    scale,
  };''','''  const scale = box.scale * 0.95;
  return {
    x: Math.min(box.left + box.w + pairHalf(2) * scale + 40, L.W - pairHalf(2) * scale - 200),
    y: box.top + box.h + 16,
    scale,
  };''')
    s = s.replace('const scale = L.portrait ? 1.05 : 1.25;\n    return { x: L.W - 150 * scale,','const scale = L.portrait ? 0.9 : 1.15;\n    return { x: L.W - pairHalf(2) * scale - 40,')
    s = s.replace('''  const rabbitRect = (m''','''  const rabbitRect = (m''')
    s = s.replace('''const rabbitRect = (m: { x: number; y: number; scale: number }) => ({
  x: m.x - RABBIT_BOX.half * m.scale,
  y: m.y - RABBIT_BOX.up * m.scale,
  w: RABBIT_BOX.half * 2 * m.scale,
  h: (RABBIT_BOX.up + RABBIT_BOX.down) * m.scale,
});''','''const rabbitRect = (m: { x: number; y: number; scale: number }) => castRect(m, 2);''')
    a = s.index('                <Rabbit\n')
    b = s.index('/>', a) + 2
    s = s[:a] + '''                <CastGroup x={m.x} y={m.y} scale={m.scale} actors={[{ role: "little", mood: PAIRMOOD[scene.rabbit!][1], prop: "binoculars" }, { role: "middle", mood: PAIRMOOD[scene.rabbit!][0] }]} costume="pilot" progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />''' + s[b:]
    # set pieces: Cloudy bottom-left, Sparky top-left, edges only
    marker = '        {/* THE RABBIT */}'
    pieces = '''        {/* THE CLOUD CASTLE'S EDGE FRIENDS: Cloudy (floating bottom-left) and Sparky (a star, top-left) */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const alive = p <= 1 || p >= 58 || scene.rabbit === "cheer";
          const unsure = scene.rabbit === "stuck" || scene.rabbit === "idea";
          const mood = pieceMood(alive, unsure);
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Pieces mood={mood} frame={ctx.frame} fps={FPS} pieces={[
                { kind: "sparky", x: L.portrait ? 120 : 150 + Math.sin(ctx.frame / FPS * 0.5) * 60, y: L.portrait ? 235 : 215, scale: 0.7 },
                { kind: "cloudy", x: 210, y: L.portrait ? 1175 : 905, scale: 0.9, show: !L.portrait && !scene.closing },
              ]} />
            </svg>
          );
        })()}

'''
    s = s.replace(marker, pieces + marker, 1)
    s = s.replace('abacusFirstFrame={0}', 'abacusFirstFrame={0}', 1)
    return s

convert('src/reels/e07_small_friend_intro.tsx', 'src/reels/e07_cloud_castle.tsx', header=HEADER,
        comp='E07SmallFriendIntro', comp_new='E07CloudCastle', dur='E07_DURATION', dur_new='E07_CLOUD_DURATION',
        rig='RIG_MAGIC', rig_new='RIG_CLOUD',
        worlds={'curtain': 'cloudA', 'hardspot': 'cloudB', 'goldlight': 'cloudC', 'backstage': 'cloudB', 'hatreveal': 'cloudC', 'stagefull': 'cloudA', 'encore': 'cloudB', 'applause': 'cloudC', 'finale': 'cloudD'},
        extra=extra)
