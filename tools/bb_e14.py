import sys
sys.path.insert(0, "tools")
from bb_convert import convert

HEADER = '''// E14 · STARLIGHT FUNFAIR REMAKE (Bead Buddies series, docs/COVE_SERIES_PLAN.md). SAME audio, phrase table, timings, rounds, wheel mechanic
// and teaching beats as the delivered E14 (src/reels/e14_big_friend_recap.tsx, kept for reference). Only the hedgehogs and the arcade worlds
// are replaced: Fifi (left) and Tenzo (right) are the rival contestants in ticket-collector hats and a pink cape, Pip hosts from
// the left edge, in a calm Starlight Funfair with a balloon and a teddy at the edges.
'''

def extra(s):
    s = s.replace('import { Hedgehog, HEDGEHOG_BOX, type HedgehogMood } from "../components/e14/Hedgehog";',
      'import { CastGroup, Pieces, pieceMood, castRect, pairHalf, CAST_BOX, OT_K, PAIR_GAP as CAST_GAP } from "../components/cast";\nimport { Otter } from "../components/cast";\nimport type { OtterMood } from "../components/cast";\ntype HedgehogMood = "sit" | "wave" | "think" | "curl" | "point" | "cheer" | "buzz";\nconst MOOD: Record<HedgehogMood, OtterMood> = { sit: "float", wave: "wave", think: "think", curl: "worry", point: "point", cheer: "cheer", buzz: "wave" };\nconst HEDGEHOG_BOX = { up: CAST_BOX.up * OT_K, down: CAST_BOX.down, half: CAST_BOX.half * OT_K };')
    s = s.replace('const HEDGE_GAP = 80;', 'const HEDGE_GAP = CAST_GAP * 1.12;')
    s = s.replace('const scale = L.portrait ? 0.82 : 0.95;\n    return { x: L.W - 190 * scale, y: L.H * (L.portrait ? 0.8 : 0.86), scale };', 'const scale = L.portrait ? 0.85 : 1.1;\n    return { x: L.W - (HEDGE_GAP + HEDGEHOG_BOX.half) * scale - 40, y: L.H * (L.portrait ? 0.8 : 0.86), scale };')
    s = s.replace('return { x: 780, y: 1120, scale: 0.8 };', 'return { x: 790, y: 1150, scale: 0.6 };')
    s = s.replace('''  const scale = box.scale * 0.88;
  return {
    x: Math.min(box.left + box.w + HEDGE_HALF * scale + 24, L.W - HEDGE_HALF * scale - 14),''','''  const scale = box.scale * 0.95;
  return {
    x: Math.min(box.left + box.w + HEDGE_HALF * scale + 90, L.W - HEDGE_HALF * scale - 150),''')
    a = s.index('                  <Hedgehog\n')
    b = s.index('                </>', a)
    s = s[:a] + '''                  <CastGroup x={m.x} y={m.y} scale={m.scale} actors={[{ role: "middle", mood: MOOD[scene.hedgehogs!.left], prop: "magnifier" }, { role: "big", mood: MOOD[scene.hedgehogs!.right] }]} costume="ticket" look={ctx.layout.portrait ? 1 : -1} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} />
''' + s[b:]
    s = s.replace('    chipUpper: i < 2 || undefined,\n', '')
    s = s.replace('if (scene.valueChip && !scene.big && !scene.headline) {', 'if (scene.valueChip && !scene.big && !scene.headline && !(L.portrait && scene.formulas)) {')
    s = s.replace('{scene.valueChip && !scene.big && !scene.headline && (', '{scene.valueChip && !scene.big && !scene.headline && !(ctx.layout.portrait && scene.formulas) && (')
    s = s.replace('"#FF3DA6"', '"#9E0A55"').replace('  opacity: 0.4,', '  opacity: 0.8,', 1)
    marker = '        {/* THE HEDGEHOGS */}'
    pieces = '''        {/* THE FUNFAIR'S EDGE FRIENDS: Pip the host (left), a teddy (far right) and a balloon (top-left) */}
        {(() => {
          const L = ctx.layout;
          const p = ctx.p;
          const h = scene.hedgehogs;
          const bothCheer = Boolean(h && h.left === "cheer" && h.right === "cheer");
          const alive = p <= 6 || p >= 90 || bothCheer;
          const unsure = Boolean(h && (h.left === "curl" || h.right === "curl" || h.left === "think" || h.right === "think"));
          const mood = pieceMood(alive, unsure);
          const hostMood: OtterMood = bothCheer ? "cheer" : h && (h.left === "buzz" || h.right === "buzz") ? "point" : unsure ? "think" : "present";
          return (
            <svg width={L.W} height={L.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
              <Pieces mood={mood} frame={ctx.frame} fps={FPS} pieces={[
                { kind: "bear", x: 1850, y: 905, scale: 0.95, facing: -1, show: !L.portrait && !scene.closing },
                { kind: "balloon", x: 170 + Math.sin(ctx.frame / FPS * 0.5) * 40, y: 262, scale: 0.7, show: !L.portrait },
              ]} />
              {!L.portrait && (
                <g>
                  <ellipse cx={190} cy={904} rx={80} ry={11} fill="#000" opacity={0.2} />
                  <Otter x={190} y={900} scale={OT_K * 0.95} role="little" mood={hostMood} costume="ticket" prop="binoculars" look={1} progress={ctx.beatProgress} frame={ctx.frame} fps={FPS} famScale={OT_K * 0.95} />
                </g>
              )}
            </svg>
          );
        })()}

'''
    s = s.replace(marker, pieces + marker, 1)
    s = s.replace('  const rate = STORE_FRAMES / 136;', '  add(on(14, "stuck"), "boing.mp3", 26, 0.2);\n  const rate = STORE_FRAMES / 136;', 1)
    return s

convert('src/reels/e14_big_friend_recap.tsx', 'src/reels/e14_starlight_funfair.tsx', header=HEADER,
        comp='E14BigFriendRecap', comp_new='E14StarlightFunfair', dur='E14_DURATION', dur_new='E14_FAIR_DURATION',
        rig='RIG_ARCADE', rig_new='RIG_FAIR',
        worlds={'ticketglow': 'fairA', 'arcadefloor': 'fairB', 'prizewall': 'fairC', 'arcadeneon': 'fairC', 'jackpotfinale': 'fairD'},
        extra=extra)
