#!/usr/bin/env python3
"""Original SFX for the Math Heroes BIG FRIEND short 1 (arcade grand opening, ticket machine).

Pure stdlib synthesis, same helper family as make_math_heroes_sfx.py (imported, not copied).
New sounds only — the bead clicks, friend sparkle, hero call/alert and mission-solved chimes
already in public/audio/sfx/ are reused by the reel. Everything here is a comic arcade palette:
a jamming/grumpy ticket machine, a countdown tick, a ticket printer, a crowd cheer, scissors and
big doors for the ribbon cutting.

  bf1_jam.mp3      the machine jamming: clunk, metal rattle, a dying whine
  bf1_stamp.mp3    STUCK! stamped onto the sum board — a heavy thud
  bf1_tick.mp3     one countdown tick (3, 2, 1)
  bf1_go.mp3       the countdown lands — a bright ding
  bf1_print.mp3    the ticket printer: a fast ratchet run, a tear, a little bell
  bf1_cheer.mp3    a crowd cheer with claps
  bf1_snip.mp3     scissors cutting the ribbon
  bf1_doors.mp3    doors swinging open under a fanfare
  bf1_squeak.mp3   a squeaky-toy hero reaction
  bf1_poof.mp3     a puff of smoke
  bf1_siren.mp3    a comic wee-woo siren for the alert
  bf1_swoosh.mp3   a short panel/ticket swoosh
  bf1_pair.mp3     two big-friend numbers clicking together into ten

Usage:  python3 tools/make_bf1_sfx.py   (writes .wav then converts to .mp3 in public/audio/sfx/)
"""
from __future__ import annotations

import math
import random
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_math_heroes_sfx import (  # noqa: E402
    OUT,
    SR,
    bell,
    click,
    glide_tone,
    mix,
    whoosh,
    write,
)

random.seed(2610)


def lowpass_noise(dur: float, lp: float, env_pow: float = 2.0, gain: float = 1.0) -> list[float]:
    n = int(dur * SR)
    prev = 0.0
    out = []
    for i in range(n):
        x = i / n
        prev = prev * (1 - lp) + random.uniform(-1, 1) * lp
        out.append(prev * (1 - x) ** env_pow * gain)
    return out


def bandnoise(dur: float, lo: float, hi: float, env=lambda x: 1 - x) -> list[float]:
    """Cheap band-limited noise: difference of two one-pole lowpasses."""
    n = int(dur * SR)
    a = math.exp(-2 * math.pi * hi / SR)
    b = math.exp(-2 * math.pi * lo / SR)
    p1 = p2 = 0.0
    out = []
    for i in range(n):
        w = random.uniform(-1, 1)
        p1 = a * p1 + (1 - a) * w
        p2 = b * p2 + (1 - b) * w
        out.append((p1 - p2) * env(i / n) * 3.0)
    return out


def thump(f0: float, f1: float, dur: float) -> list[float]:
    n = int(dur * SR)
    phase = 0.0
    out = []
    for i in range(n):
        x = i / n
        f = f0 + (f1 - f0) * x
        phase += 2 * math.pi * f / SR
        out.append(math.sin(phase) * (1 - x) ** 2.2)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("BF1 sounds:")

    # JAM — clunk, then a handful of out-of-tune metal rattles, then the whine winds down.
    jam = thump(110, 45, 0.22)
    for k, (f, at) in enumerate([(1710, 0.05), (1230, 0.11), (2050, 0.17), (990, 0.24)]):
        jam = mix(jam, [s * 0.33 for s in bell(f, 0.09, attack=0.002)], at=at)
    jam = mix(jam, [s * 0.35 for s in bandnoise(0.28, 700, 3400)], at=0.04)
    jam = mix(jam, [s * 0.5 for s in glide_tone(420, 90, 0.45, attack=0.01, release_pow=1.4, warmth=0.8, vibrato=0.05)], at=0.2)
    write(OUT / "bf1_jam.wav", jam)

    # STAMP — a heavy rubber-stamp thud with a tiny rattle.
    stamp = thump(150, 55, 0.2)
    stamp = mix(stamp, [s * 0.4 for s in lowpass_noise(0.12, 0.3, 2.5)], at=0.0)
    write(OUT / "bf1_stamp.wav", stamp)

    # TICK — a dry woodblock.
    tick = click(1250, 0.05, warmth=0.1)
    tick = mix(tick, [s * 0.6 for s in click(620, 0.07, warmth=0.2)], at=0.0)
    write(OUT / "bf1_tick.wav", tick)

    # GO — a bright ding that closes the countdown.
    go = bell(1175, 0.55, attack=0.004)
    go = mix(go, [s * 0.6 for s in bell(1760, 0.45, attack=0.004)], at=0.02)
    write(OUT / "bf1_go.wav", go)

    # PRINT — the ratchet of a thermal printer, accelerating, a tear at the end, a bell.
    pr: list[float] = []
    t = 0.0
    gap = 0.075
    for i in range(14):
        c = [s * (0.55 + 0.35 * random.random()) for s in click(random.choice([1500, 1900, 2300]), 0.014, warmth=0.1)]
        c = mix(c, [s * 0.25 for s in bandnoise(0.02, 1500, 5000)], at=0.0)
        pr = mix(pr, c, at=t)
        t += gap
        gap = max(0.028, gap * 0.9)
    pr = mix(pr, [s * 0.45 for s in bandnoise(0.12, 2500, 7500, env=lambda x: (1 - x) ** 0.8)], at=t)
    pr = mix(pr, [s * 0.7 for s in bell(1568, 0.35, attack=0.004)], at=t + 0.06)
    write(OUT / "bf1_print.wav", pr)

    # CHEER — a crowd swell with claps on top.
    ch = bandnoise(1.3, 300, 2600, env=lambda x: math.sin(math.pi * min(1, x * 1.15)) ** 0.9)
    ch = [s * 0.6 for s in ch]
    for k in range(26):
        at = 0.05 + k * 0.045 + random.uniform(0, 0.02)
        ch = mix(ch, [s * 0.4 for s in bandnoise(0.025, 900, 4200)], at=at)
    ch = mix(ch, [s * 0.35 for s in glide_tone(300, 520, 0.9, attack=0.1, release_pow=1.2, warmth=0.4, vibrato=0.06)], at=0.05)
    write(OUT / "bf1_cheer.wav", ch)

    # SNIP — two quick metal clicks and a short scrape.
    sn = click(3300, 0.012, warmth=0.1)
    sn = mix(sn, [s * 0.6 for s in bandnoise(0.07, 2000, 7000)], at=0.0)
    sn = mix(sn, click(2700, 0.012, warmth=0.1), at=0.07)
    sn = mix(sn, [s * 0.5 for s in bandnoise(0.06, 2000, 7000)], at=0.07)
    write(OUT / "bf1_snip.wav", sn)

    # DOORS — a swing whoosh under a three-note major fanfare.
    dr = whoosh(0.8, 120, 380, lp=0.04)
    dr = mix(dr, bell(523, 0.2, attack=0.006), at=0.1)
    dr = mix(dr, bell(659, 0.2, attack=0.006), at=0.22)
    dr = mix(dr, bell(784, 0.6, attack=0.006), at=0.34)
    write(OUT / "bf1_doors.wav", dr)

    # SQUEAK — a squeaky-toy chirp: a fast pitch rise with vibrato.
    write(OUT / "bf1_squeak.wav", glide_tone(520, 1650, 0.16, attack=0.006, release_pow=1.4, warmth=0.5, vibrato=0.04))

    # POOF — a soft smoke puff.
    write(OUT / "bf1_poof.wav", lowpass_noise(0.35, 0.09, 1.6, 1.4))

    # SIREN — wee-woo, twice, short.
    siren = glide_tone(560, 880, 0.2, attack=0.01, release_pow=0.8, warmth=0.4)
    siren = mix(siren, glide_tone(880, 560, 0.2, attack=0.01, release_pow=0.8, warmth=0.4), at=0.2)
    siren = mix(siren, glide_tone(560, 880, 0.2, attack=0.01, release_pow=0.8, warmth=0.4), at=0.4)
    siren = mix(siren, glide_tone(880, 560, 0.25, attack=0.01, release_pow=1.2, warmth=0.4), at=0.6)
    write(OUT / "bf1_siren.wav", siren)

    # SWOOSH — a quick panel/ticket slide.
    write(OUT / "bf1_swoosh.wav", whoosh(0.28, 300, 900, lp=0.07))

    # PAIR — two numbers clicking together into ten: two blips then a ding.
    pair = click(700, 0.06, warmth=0.2)
    pair = mix(pair, click(940, 0.06, warmth=0.2), at=0.1)
    pair = mix(pair, bell(1397, 0.34, attack=0.004), at=0.2)
    write(OUT / "bf1_pair.wav", pair)

    print("\nconverting to mp3…")
    for wav in OUT.glob("bf1_*.wav"):
        mp3 = wav.with_suffix(".mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True)
        wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
