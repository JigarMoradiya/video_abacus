#!/usr/bin/env python3
"""Original SFX for the Math Heroes BIG FRIEND short 4 (a storm and the rescue chopper).

A weather-and-rescue palette, different from bf1 (arcade), bf2 (sports hall) and bf3 (candy shop):
thunder, rain and wind, a rotor chop that spins up, radio squelch and crackle, mechanical dial clicks,
a warning klaxon, a lock clang, a flare launch and pop, a winch whir, a landing thump, a crowd cheer.
Same helper family as make_math_heroes_sfx.py (imported). Bead clicks, friend sparkle and the
mission-solved chimes in public/audio/sfx/ are reused by the reel.

  bf4_thunder.mp3   a rolling thunderclap: a crack and a long low rumble
  bf4_rain.mp3      a short burst of heavy rain
  bf4_wind.mp3      a wind gust: filtered noise swelling and fading
  bf4_rotor.mp3     rotor chop: thumps that speed up
  bf4_spin.mp3      the rotor spinning up: a rising whine under quick chops
  bf4_squelch.mp3   a radio squelch: a click, a burst of static and a beep
  bf4_crackle.mp3   radio static crackle
  bf4_dial.mp3      a mechanical dial click-click
  bf4_klaxon.mp3    a two-tone warning klaxon
  bf4_lock.mp3      a metal lock clang
  bf4_flare.mp3     a flare launching and popping open
  bf4_winch.mp3     a winch whirring and clacking
  bf4_beep.mp3      one countdown beep
  bf4_land.mp3      a landing thump with a settling whoosh
  bf4_cheer.mp3     a crowd cheer
  bf4_gasp.mp3      a surprised gasp
  bf4_sun.mp3       the sun breaking through: a warm rising chime
  bf4_crate.mp3     a crate thunking into a stack

Usage:  python3 tools/make_bf4_sfx.py   (writes .wav then converts to .mp3 in public/audio/sfx/)
"""
from __future__ import annotations

import math
import random
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_math_heroes_sfx import OUT, SR, bell, click, glide_tone, mix, whoosh, write  # noqa: E402

random.seed(2613)


def noise(dur: float, lp: float = 0.2, pw: float = 1.5, gain: float = 1.0) -> list[float]:
    n = int(dur * SR)
    prev = 0.0
    out = []
    for i in range(n):
        x = i / n
        prev = prev * (1 - lp) + random.uniform(-1, 1) * lp
        out.append(prev * (1 - x) ** pw * gain)
    return out


def shaped(dur: float, lp: float, env, gain: float = 1.0) -> list[float]:
    n = int(dur * SR)
    prev = 0.0
    out = []
    for i in range(n):
        prev = prev * (1 - lp) + random.uniform(-1, 1) * lp
        out.append(prev * env(i / n) * gain)
    return out


def sine(freq: float, dur: float, attack: float = 0.004, pw: float = 2.0) -> list[float]:
    n = int(dur * SR)
    return [math.sin(2 * math.pi * freq * i / SR) * min(1.0, (i / SR) / attack) * (1 - i / n) ** pw for i in range(n)]


def square(freq: float, dur: float, pw: float = 0.8, duty: float = 0.5) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        out.append((1.0 if ((i * freq / SR) % 1.0) < duty else -1.0) * (1 - i / n) ** pw * 0.45)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("BF4 sounds:")

    th = [s * 0.9 for s in noise(0.12, 0.7, 2.5)]
    th = mix(th, shaped(1.6, 0.04, lambda x: (math.sin(math.pi * min(1, x * 6) / 2) * (1 - x) ** 1.6) * (0.7 + 0.3 * math.sin(x * 40)), 3.0), at=0.04)
    th = mix(th, [s * 0.7 for s in sine(48, 1.2, 0.02, 1.4)], at=0.05)
    write(OUT / "bf4_thunder.wav", th)

    write(OUT / "bf4_rain.wav", shaped(0.7, 0.55, lambda x: min(1, x * 8) * (1 - x * 0.6), 0.5))
    write(OUT / "bf4_wind.wav", shaped(1.1, 0.06, lambda x: math.sin(math.pi * x) ** 1.2, 2.6))

    rt: list[float] = []
    t = 0.0
    gap = 0.14
    for i in range(10):
        rt = mix(rt, [s * 0.8 for s in sine(70 + i * 3, 0.07, 0.003, 2.0)], at=t)
        rt = mix(rt, [s * 0.25 for s in noise(0.05, 0.4, 2.0)], at=t)
        t += gap
        gap = max(0.07, gap * 0.9)
    write(OUT / "bf4_rotor.wav", rt)

    sp = glide_tone(120, 900, 0.7, attack=0.02, release_pow=0.7, warmth=0.5, vibrato=0.02)
    t = 0.0
    gap = 0.1
    for i in range(9):
        sp = mix(sp, [s * 0.5 for s in sine(80, 0.05, 0.003, 2.0)], at=t)
        t += gap
        gap = max(0.04, gap * 0.85)
    write(OUT / "bf4_spin.wav", sp)

    sq = click(1800, 0.01, warmth=0.1)
    sq = mix(sq, [s * 0.5 for s in noise(0.12, 0.7, 1.0)], at=0.01)
    sq = mix(sq, [s * 0.7 for s in sine(1200, 0.1, 0.003, 1.5)], at=0.15)
    write(OUT / "bf4_squelch.wav", sq)

    cr = noise(0.4, 0.8, 0.9, 0.5)
    for k in range(10):
        cr = mix(cr, [s * random.uniform(0.3, 0.8) for s in click(random.choice([2200, 3100, 4000]), 0.006, warmth=0.1)], at=random.uniform(0, 0.35))
    write(OUT / "bf4_crackle.wav", cr)

    dl = click(1500, 0.012, warmth=0.2)
    dl = mix(dl, [s * 0.7 for s in click(1100, 0.012, warmth=0.2)], at=0.07)
    dl = mix(dl, [s * 0.3 for s in sine(300, 0.05, 0.002, 2.0)], at=0.0)
    write(OUT / "bf4_dial.wav", dl)

    kx: list[float] = []
    for rep in range(3):
        kx = mix(kx, [s * 0.8 for s in square(660, 0.16, 0.6)], at=rep * 0.34)
        kx = mix(kx, [s * 0.8 for s in square(880, 0.16, 0.6)], at=rep * 0.34 + 0.17)
    write(OUT / "bf4_klaxon.wav", kx)

    lk = [s * 0.8 for s in bell(520, 0.5, attack=0.001)]
    lk = mix(lk, [s * 0.6 for s in bell(1380, 0.3, attack=0.001)], at=0.0)
    lk = mix(lk, [s * 0.6 for s in noise(0.05, 0.5, 2.0)], at=0.0)
    write(OUT / "bf4_lock.wav", lk)

    fl = whoosh(0.5, 300, 2600, lp=0.06)
    fl = mix(fl, [s * 0.9 for s in noise(0.18, 0.5, 2.0)], at=0.5)
    fl = mix(fl, [s * 0.5 for s in bell(1175, 0.4, attack=0.002)], at=0.5)
    write(OUT / "bf4_flare.wav", fl)

    wn: list[float] = []
    for k in range(14):
        wn = mix(wn, [s * 0.5 for s in click(random.choice([900, 1200]), 0.015, warmth=0.4)], at=k * 0.045)
    wn = mix(wn, [s * 0.5 for s in glide_tone(180, 260, 0.6, attack=0.05, release_pow=1.0, warmth=0.9)], at=0.0)
    write(OUT / "bf4_winch.wav", wn)

    write(OUT / "bf4_beep.wav", [s * 0.9 for s in sine(990, 0.1, 0.003, 1.2)])

    ld = [s * 0.9 for s in sine(70, 0.3, 0.003, 2.0)]
    ld = mix(ld, [s * 0.6 for s in noise(0.12, 0.35, 2.0)], at=0.0)
    ld = mix(ld, [s * 0.4 for s in whoosh(0.5, 400, 150, lp=0.05)], at=0.05)
    write(OUT / "bf4_land.wav", ld)

    ch = noise(1.4, 0.12, 0.9)
    ch = [s * (math.sin(math.pi * min(1, i / (1.15 * len(ch)))) ** 0.9) * 0.9 for i, s in enumerate(ch)]
    for k in range(24):
        ch = mix(ch, [s * 0.4 for s in noise(0.025, 0.45, 1.5)], at=0.05 + k * 0.05 + random.uniform(0, 0.02))
    ch = mix(ch, [s * 0.3 for s in glide_tone(320, 540, 1.0, attack=0.12, release_pow=1.2, warmth=0.4, vibrato=0.05)], at=0.05)
    write(OUT / "bf4_cheer.wav", ch)

    gs = glide_tone(340, 540, 0.22, attack=0.05, release_pow=1.0, warmth=0.5)
    gs = mix(gs, [s * 0.25 for s in noise(0.25, 0.4, 1.0)], at=0.0)
    write(OUT / "bf4_gasp.wav", gs)

    sn: list[float] = []
    for k, f in enumerate([784, 988, 1175, 1568]):
        sn = mix(sn, [s * 0.6 for s in bell(f, 0.55, attack=0.004)], at=k * 0.09)
    write(OUT / "bf4_sun.wav", sn)

    cr2 = [s * 0.9 for s in sine(110, 0.14, 0.002, 2.0)]
    cr2 = mix(cr2, [s * 0.5 for s in noise(0.06, 0.3, 2.0)], at=0.0)
    cr2 = mix(cr2, [s * 0.3 for s in click(1500, 0.01, warmth=0.5)], at=0.0)
    write(OUT / "bf4_crate.wav", cr2)

    print("\nconverting to mp3…")
    for wav in OUT.glob("bf4_*.wav"):
        mp3 = wav.with_suffix(".mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True)
        wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
