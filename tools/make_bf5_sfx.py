#!/usr/bin/env python3
"""Original SFX for the Math Heroes BIG FRIEND short 5 (the calm check-up / speed drill in the bead gym).

A soft, friendly training-room palette, different from bf1-bf4 (no sirens, no panic): a rubber check
stamp, a pen tick, a pencil scribble, a soft whistle, a gentle chime, a bubble pop, a bubbling pour, a
page flip, a lightbulb ding, a sneaker squeak, a clipboard clip click, a soft cheer and a medal fanfare.
Same helper family as make_math_heroes_sfx.py (imported). Bead clicks, friend sparkle and the
mission-solved chimes in public/audio/sfx/ are reused by the reel.

  bf5_stamp.mp3    a rubber check stamp thunk with a tiny ink slap
  bf5_tick.mp3     a pen tick: a quick two-note check mark
  bf5_scribble.mp3 a pencil scribble
  bf5_whistle.mp3  a soft, short coach whistle
  bf5_chime.mp3    a gentle three-note chime
  bf5_pop.mp3      a soft bubble pop
  bf5_pour.mp3     a bubbling pour for the flask
  bf5_flip.mp3     a page flip
  bf5_ding.mp3     a lightbulb ding
  bf5_squeak.mp3   a sneaker squeak
  bf5_clip.mp3     a clipboard clip click
  bf5_cheer.mp3    a soft crowd cheer
  bf5_medal.mp3    a medal fanfare
  bf5_beep.mp3     one ready-steady beep

Usage:  python3 tools/make_bf5_sfx.py   (writes .wav then converts to .mp3 in public/audio/sfx/)
"""
from __future__ import annotations

import math
import random
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_math_heroes_sfx import OUT, SR, bell, click, glide_tone, mix, whoosh, write  # noqa: E402

random.seed(2614)


def noise(dur: float, lp: float = 0.2, pw: float = 1.5, gain: float = 1.0) -> list[float]:
    n = int(dur * SR)
    prev = 0.0
    out = []
    for i in range(n):
        x = i / n
        prev = prev * (1 - lp) + random.uniform(-1, 1) * lp
        out.append(prev * (1 - x) ** pw * gain)
    return out


def sine(freq: float, dur: float, attack: float = 0.004, pw: float = 2.0) -> list[float]:
    n = int(dur * SR)
    return [math.sin(2 * math.pi * freq * i / SR) * min(1.0, (i / SR) / attack) * (1 - i / n) ** pw for i in range(n)]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("BF5 sounds:")

    st = [s * 0.9 for s in sine(120, 0.16, 0.002, 2.0)]
    st = mix(st, [s * 0.5 for s in noise(0.07, 0.35, 2.0)], at=0.0)
    st = mix(st, [s * 0.5 for s in bell(1568, 0.3, attack=0.002)], at=0.03)
    write(OUT / "bf5_stamp.wav", st)

    tk = [s * 0.7 for s in sine(1320, 0.07, 0.002, 2.0)]
    tk = mix(tk, [s * 0.8 for s in sine(1976, 0.12, 0.002, 2.0)], at=0.07)
    write(OUT / "bf5_tick.wav", tk)

    sc: list[float] = []
    for k in range(9):
        sc = mix(sc, [s * 0.5 for s in noise(0.05, 0.6, 1.2)], at=k * 0.045)
    write(OUT / "bf5_scribble.wav", sc)

    n = int(0.28 * SR)
    wh = []
    ph = 0.0
    for i in range(n):
        t = i / SR
        x = i / n
        f = 2300 + 160 * math.sin(2 * math.pi * 30 * t) + 120 * (1 - x)
        ph += 2 * math.pi * f / SR
        wh.append(math.sin(ph) * min(1.0, t / 0.01) * (1 - x) ** 0.8 * 0.7)
    write(OUT / "bf5_whistle.wav", wh)

    ch = bell(784, 0.5, attack=0.004)
    ch = mix(ch, bell(988, 0.5, attack=0.004), at=0.1)
    ch = mix(ch, bell(1175, 0.7, attack=0.004), at=0.2)
    write(OUT / "bf5_chime.wav", [s * 0.8 for s in ch])

    pp = glide_tone(300, 800, 0.06, attack=0.003, release_pow=1.2, warmth=0.3)
    pp = mix(pp, [s * 0.4 for s in noise(0.04, 0.5, 2.0)], at=0.0)
    write(OUT / "bf5_pop.wav", pp)

    po: list[float] = []
    for k in range(14):
        po = mix(po, [s * 0.5 for s in glide_tone(300 + random.uniform(0, 300), 700 + random.uniform(0, 500), 0.05, attack=0.003, release_pow=1.0, warmth=0.3)], at=k * 0.045 + random.uniform(0, 0.02))
    po = mix(po, [s * 0.2 for s in noise(0.6, 0.15, 0.8)], at=0.0)
    write(OUT / "bf5_pour.wav", po)

    fl = [s * 0.7 for s in whoosh(0.18, 600, 2200, lp=0.08)]
    fl = mix(fl, [s * 0.4 for s in click(1400, 0.01, warmth=0.5)], at=0.14)
    write(OUT / "bf5_flip.wav", fl)

    dg = bell(1760, 0.6, attack=0.002)
    dg = mix(dg, [s * 0.5 for s in bell(2637, 0.5, attack=0.002)], at=0.0)
    write(OUT / "bf5_ding.wav", dg)

    sq = glide_tone(1500, 2400, 0.07, attack=0.003, release_pow=0.8, warmth=0.1)
    sq = mix(sq, glide_tone(2300, 1700, 0.08, attack=0.003, release_pow=0.9, warmth=0.1), at=0.07)
    write(OUT / "bf5_squeak.wav", [s * 0.7 for s in sq])

    cl = click(2000, 0.012, warmth=0.15)
    cl = mix(cl, [s * 0.7 for s in click(1300, 0.012, warmth=0.15)], at=0.05)
    write(OUT / "bf5_clip.wav", cl)

    cr = noise(1.2, 0.12, 0.9)
    cr = [s * (math.sin(math.pi * min(1, i / (1.15 * len(cr)))) ** 0.9) * 0.7 for i, s in enumerate(cr)]
    for k in range(18):
        cr = mix(cr, [s * 0.35 for s in noise(0.025, 0.45, 1.5)], at=0.05 + k * 0.055 + random.uniform(0, 0.02))
    write(OUT / "bf5_cheer.wav", cr)

    md = bell(784, 0.25, attack=0.004)
    md = mix(md, bell(988, 0.25, attack=0.004), at=0.14)
    md = mix(md, bell(1175, 0.25, attack=0.004), at=0.28)
    md = mix(md, [s * 0.9 for s in bell(1568, 0.9, attack=0.004)], at=0.42)
    md = mix(md, [s * 0.5 for s in bell(2093, 0.8, attack=0.004)], at=0.46)
    write(OUT / "bf5_medal.wav", md)

    write(OUT / "bf5_beep.wav", [s * 0.8 for s in sine(880, 0.09, 0.003, 1.2)])

    print("\nconverting to mp3…")
    for wav in OUT.glob("bf5_*.wav"):
        mp3 = wav.with_suffix(".mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True)
        wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
