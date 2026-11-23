#!/usr/bin/env python3
"""Original SFX for the Math Heroes BIG FRIEND short 6 (the one-minute LIGHTNING ROUND against the clock).

A fast, high-energy game-show / racetrack palette, different from bf1-bf5: a start pistol crack, a fast
ticking clock, whooshes and zips, countdown beeps, a final buzzer, a power-up zap, a jam clunk, a stopwatch
click, a flag flap, a crowd roar and bright dings. Same helper family as make_math_heroes_sfx.py
(imported). Bead clicks, friend sparkle and the mission-solved chimes in public/audio/sfx/ are reused.

  bf6_gun.mp3       the start pistol: a sharp crack and a short echo
  bf6_tick.mp3      one fast clock tick (the reel plays them in bursts)
  bf6_whoosh.mp3    a fast whoosh with a rising zip
  bf6_zip.mp3       a quick zip for the next-round transition
  bf6_buzzer.mp3    the final buzzer: long, loud, two-tone
  bf6_beep.mp3      one countdown beep (the reel plays three)
  bf6_go.mp3        the long green-light beep
  bf6_zap.mp3       a power-up zap for the friend call
  bf6_jam.mp3       a jam: a metal clunk and a stuttering whine
  bf6_click.mp3     a stopwatch click
  bf6_flag.mp3      a flag flap
  bf6_roar.mp3      a crowd roar with whistles
  bf6_ding.mp3      a bright ding
  bf6_gasp.mp3      a surprised gasp
  bf6_score.mp3     a rising score jingle for the perfect score

Usage:  python3 tools/make_bf6_sfx.py   (writes .wav then converts to .mp3 in public/audio/sfx/)
"""
from __future__ import annotations

import math
import random
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_math_heroes_sfx import OUT, SR, bell, click, glide_tone, mix, whoosh, write  # noqa: E402

random.seed(2615)


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


def square(freq: float, dur: float, pw: float = 0.8, duty: float = 0.5) -> list[float]:
    n = int(dur * SR)
    return [(1.0 if ((i * freq / SR) % 1.0) < duty else -1.0) * (1 - i / n) ** pw * 0.45 for i in range(n)]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("BF6 sounds:")

    gn = [s * 1.0 for s in noise(0.06, 0.8, 3.0)]
    gn = mix(gn, [s * 0.6 for s in sine(160, 0.12, 0.001, 3.0)], at=0.0)
    gn = mix(gn, [s * 0.35 for s in noise(0.35, 0.25, 2.2)], at=0.04)
    write(OUT / "bf6_gun.wav", gn)

    tk = click(2200, 0.01, warmth=0.2)
    tk = mix(tk, [s * 0.5 for s in sine(900, 0.04, 0.001, 3.0)], at=0.0)
    write(OUT / "bf6_tick.wav", tk)

    wh = whoosh(0.35, 250, 1800, lp=0.07)
    wh = mix(wh, [s * 0.4 for s in glide_tone(300, 1500, 0.3, attack=0.02, release_pow=1.0, warmth=0.2)], at=0.0)
    write(OUT / "bf6_whoosh.wav", wh)

    write(OUT / "bf6_zip.wav", [s * 0.8 for s in glide_tone(500, 2600, 0.14, attack=0.005, release_pow=1.2, warmth=0.2)])

    bz = [s * 0.9 for s in square(180, 0.5, 0.3, 0.5)]
    bz = mix(bz, [s * 0.7 for s in square(270, 0.5, 0.3, 0.35)], at=0.0)
    bz = mix(bz, [s * 0.6 for s in square(180, 0.35, 0.6, 0.5)], at=0.5)
    write(OUT / "bf6_buzzer.wav", bz)

    write(OUT / "bf6_beep.wav", [s * 0.8 for s in sine(880, 0.1, 0.003, 1.2)])
    write(OUT / "bf6_go.wav", [s * 0.8 for s in sine(1320, 0.45, 0.003, 0.9)])

    zp = glide_tone(200, 1800, 0.18, attack=0.004, release_pow=0.6, warmth=0.3)
    zp = mix(zp, [s * 0.6 for s in bell(1760, 0.25, attack=0.002)], at=0.16)
    zp = mix(zp, [s * 0.3 for s in noise(0.1, 0.6, 1.5)], at=0.0)
    write(OUT / "bf6_zap.wav", zp)

    jm = [s * 0.9 for s in sine(100, 0.2, 0.002, 2.0)]
    jm = mix(jm, [s * 0.6 for s in bell(560, 0.35, attack=0.001)], at=0.0)
    for k in range(5):
        jm = mix(jm, [s * 0.35 for s in square(300 - k * 40, 0.04, 0.5)], at=0.1 + k * 0.05)
    write(OUT / "bf6_jam.wav", jm)

    cl = click(1800, 0.012, warmth=0.1)
    cl = mix(cl, [s * 0.6 for s in click(1200, 0.012, warmth=0.1)], at=0.05)
    write(OUT / "bf6_click.wav", cl)

    fl = noise(0.3, 0.5, 1.0)
    fl = [s * (0.5 + 0.5 * math.sin(i / SR * 60)) * 0.8 for i, s in enumerate(fl)]
    write(OUT / "bf6_flag.wav", fl)

    rr = noise(1.4, 0.1, 0.8)
    rr = [s * (math.sin(math.pi * min(1, i / (1.15 * len(rr)))) ** 0.8) * 0.9 for i, s in enumerate(rr)]
    for k in range(24):
        rr = mix(rr, [s * 0.4 for s in noise(0.025, 0.45, 1.5)], at=0.04 + k * 0.05 + random.uniform(0, 0.02))
    rr = mix(rr, [s * 0.35 for s in glide_tone(2400, 2900, 0.5, attack=0.02, release_pow=0.8, warmth=0.1, vibrato=0.04)], at=0.2)
    write(OUT / "bf6_roar.wav", rr)

    dg = bell(1760, 0.5, attack=0.002)
    dg = mix(dg, [s * 0.6 for s in bell(2349, 0.4, attack=0.002)], at=0.04)
    write(OUT / "bf6_ding.wav", dg)

    gs = glide_tone(340, 560, 0.2, attack=0.05, release_pow=1.0, warmth=0.5)
    gs = mix(gs, [s * 0.25 for s in noise(0.22, 0.4, 1.0)], at=0.0)
    write(OUT / "bf6_gasp.wav", gs)

    sc: list[float] = []
    for k, f in enumerate([784, 988, 1175, 1568, 1976, 2349]):
        sc = mix(sc, [s * 0.6 for s in bell(f, 0.4, attack=0.003)], at=k * 0.08)
    sc = mix(sc, [s * 0.8 for s in bell(2349, 0.9, attack=0.003)], at=0.5)
    write(OUT / "bf6_score.wav", sc)

    print("\nconverting to mp3…")
    for wav in OUT.glob("bf6_*.wav"):
        mp3 = wav.with_suffix(".mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True)
        wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
