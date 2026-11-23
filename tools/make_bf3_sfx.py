#!/usr/bin/env python3
"""Original SFX for the Math Heroes BIG FRIEND short 3 (the prize shop: an almost-empty prize wall).

A candy-shop palette, different from bf1 (arcade) and bf2 (sports hall): a cash register ka-ching,
a shop-door bell, rattling shelves, squeaky toys, a rotary phone ring, a wind-up toy, a ticket tear,
a lollipop-candy tick, jigsaw snaps, a restock pop, a drum roll into a fanfare, a coin shower.
Same helper family as make_math_heroes_sfx.py (imported). Bead clicks, friend sparkle and the
mission-solved chimes in public/audio/sfx/ are reused by the reel.

  bf3_register.mp3  ka-ching: the drawer clunk and two bright bells
  bf3_door.mp3      the shop-door bell: a little tinkle of three notes
  bf3_rattle.mp3    shelves rattling: fast wooden clatters, fading
  bf3_lock.mp3      a padlock clunk with a tiny dull ring
  bf3_squeak.mp3    a squeaky toy
  bf3_ring.mp3      an old rotary phone ringing: a double warble burst
  bf3_wind.mp3      a wind-up toy key: a quick ratchet
  bf3_tick.mp3      one candy countdown tick: a glassy tap
  bf3_snap.mp3      two jigsaw pieces snapping together, then a tiny chime
  bf3_restock.mp3   a prize popping onto a shelf: a bubble pop and a sparkle
  bf3_drum.mp3      a short drum roll
  bf3_fanfare.mp3   a bright jackpot fanfare
  bf3_coins.mp3     a shower of coins landing
  bf3_gasp.mp3      a surprised gasp / "oooh"
  bf3_sad.mp3       a tiny sad trombone slide
  bf3_horn.mp3      a party horn blast
  bf3_shimmer.mp3   a magic shimmer for the secret

Usage:  python3 tools/make_bf3_sfx.py   (writes .wav then converts to .mp3 in public/audio/sfx/)
"""
from __future__ import annotations

import math
import random
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_math_heroes_sfx import OUT, SR, bell, click, glide_tone, mix, whoosh, write  # noqa: E402

random.seed(2612)


def noise(dur: float, lp: float = 0.2, pw: float = 1.5, gain: float = 1.0) -> list[float]:
    n = int(dur * SR)
    prev = 0.0
    out = []
    for i in range(n):
        x = i / n
        prev = prev * (1 - lp) + random.uniform(-1, 1) * lp
        out.append(prev * (1 - x) ** pw * gain)
    return out


def sine(freq: float, dur: float, attack: float = 0.005, pw: float = 2.0, vib: float = 0.0) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        f = freq * (1 + vib * math.sin(2 * math.pi * 6 * t))
        out.append(math.sin(2 * math.pi * f * t) * min(1.0, t / attack) * (1 - i / n) ** pw)
    return out


def tri(freq: float, dur: float, pw: float = 1.5) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        ph = (i * freq / SR) % 1.0
        out.append((4 * abs(ph - 0.5) - 1) * (1 - i / n) ** pw * 0.6)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("BF3 sounds:")

    kc = [s * 0.7 for s in noise(0.08, 0.3, 2.0)]
    kc = mix(kc, [s * 0.6 for s in sine(110, 0.12, 0.002, 2.0)], at=0.0)
    kc = mix(kc, [s * 0.8 for s in bell(2093, 0.7, attack=0.002)], at=0.1)
    kc = mix(kc, [s * 0.7 for s in bell(2637, 0.6, attack=0.002)], at=0.16)
    write(OUT / "bf3_register.wav", kc)

    dr = bell(1568, 0.5, attack=0.002)
    dr = mix(dr, [s * 0.8 for s in bell(2093, 0.5, attack=0.002)], at=0.06)
    dr = mix(dr, [s * 0.7 for s in bell(2349, 0.5, attack=0.002)], at=0.13)
    write(OUT / "bf3_door.wav", dr)

    rt: list[float] = []
    for k in range(14):
        rt = mix(rt, [s * (0.9 - k * 0.05) for s in click(random.choice([700, 950, 1300]), 0.02, warmth=0.6)], at=k * 0.035 + random.uniform(0, 0.01))
    rt = mix(rt, [s * 0.25 for s in noise(0.4, 0.2, 1.2)], at=0.0)
    write(OUT / "bf3_rattle.wav", rt)

    lk = sine(140, 0.14, 0.002, 2.0)
    lk = mix(lk, [s * 0.5 for s in click(1800, 0.01, warmth=0.1)], at=0.0)
    lk = mix(lk, [s * 0.3 for s in bell(880, 0.25, attack=0.002)], at=0.02)
    write(OUT / "bf3_lock.wav", lk)

    sq = glide_tone(900, 2100, 0.1, attack=0.004, release_pow=0.8, warmth=0.1)
    sq = mix(sq, [s * 0.8 for s in glide_tone(2100, 1300, 0.12, attack=0.004, release_pow=1.0, warmth=0.1)], at=0.09)
    write(OUT / "bf3_squeak.wav", sq)

    rg: list[float] = []
    for rep in range(2):
        base = rep * 0.55
        for k in range(12):
            f = 1250 if k % 2 == 0 else 1520
            rg = mix(rg, [s * 0.45 for s in sine(f, 0.04, 0.002, 0.8)], at=base + k * 0.032)
    write(OUT / "bf3_ring.wav", rg)

    wd: list[float] = []
    for k in range(9):
        wd = mix(wd, [s * 0.6 for s in click(2200 + k * 90, 0.01, warmth=0.1)], at=k * 0.03)
        wd = mix(wd, [s * 0.15 for s in noise(0.02, 0.5, 1.5)], at=k * 0.03)
    write(OUT / "bf3_wind.wav", wd)

    tk = sine(1760, 0.06, 0.002, 3.0)
    tk = mix(tk, [s * 0.5 for s in click(2600, 0.008, warmth=0.1)], at=0.0)
    write(OUT / "bf3_tick.wav", tk)

    sn = click(500, 0.03, warmth=0.5)
    sn = mix(sn, [s * 0.8 for s in click(900, 0.03, warmth=0.5)], at=0.09)
    sn = mix(sn, [s * 0.8 for s in bell(1319, 0.3, attack=0.003)], at=0.12)
    write(OUT / "bf3_snap.wav", sn)

    rs = glide_tone(250, 900, 0.07, attack=0.003, release_pow=1.2, warmth=0.3)
    rs = mix(rs, [s * 0.6 for s in bell(1760, 0.3, attack=0.002)], at=0.05)
    rs = mix(rs, [s * 0.4 for s in bell(2349, 0.25, attack=0.002)], at=0.09)
    write(OUT / "bf3_restock.wav", rs)

    dm: list[float] = []
    for k in range(22):
        dm = mix(dm, [s * (0.3 + 0.02 * k) for s in noise(0.04, 0.35, 2.0)], at=k * 0.03)
    dm = mix(dm, [s * 0.4 for s in sine(90, 0.7, 0.01, 1.0)], at=0.0)
    write(OUT / "bf3_drum.wav", dm)

    ff = bell(784, 0.25, attack=0.004)
    ff = mix(ff, bell(988, 0.25, attack=0.004), at=0.14)
    ff = mix(ff, bell(1175, 0.25, attack=0.004), at=0.28)
    ff = mix(ff, [s * 0.9 for s in bell(1568, 0.9, attack=0.004)], at=0.42)
    ff = mix(ff, [s * 0.5 for s in bell(2093, 0.8, attack=0.004)], at=0.46)
    ff = mix(ff, [s * 0.4 for s in whoosh(0.5, 300, 1200, lp=0.05)], at=0.4)
    write(OUT / "bf3_fanfare.wav", ff)

    cn: list[float] = []
    for k in range(28):
        f = random.choice([2349, 2637, 3136, 3520])
        cn = mix(cn, [s * random.uniform(0.3, 0.6) for s in bell(f, 0.18, attack=0.001)], at=k * 0.045 + random.uniform(0, 0.02))
    write(OUT / "bf3_coins.wav", cn)

    gs = glide_tone(330, 520, 0.22, attack=0.05, release_pow=1.0, warmth=0.5)
    gs = mix(gs, [s * 0.25 for s in noise(0.25, 0.4, 1.0)], at=0.0)
    write(OUT / "bf3_gasp.wav", gs)

    sd = glide_tone(440, 392, 0.25, attack=0.02, release_pow=0.8, warmth=0.8, vibrato=0.05)
    sd = mix(sd, glide_tone(392, 330, 0.25, attack=0.02, release_pow=0.8, warmth=0.8, vibrato=0.05), at=0.27)
    sd = mix(sd, glide_tone(330, 196, 0.5, attack=0.02, release_pow=1.2, warmth=0.8, vibrato=0.08), at=0.54)
    write(OUT / "bf3_sad.wav", sd)

    hn = glide_tone(320, 420, 0.4, attack=0.02, release_pow=0.6, warmth=0.9)
    hn = mix(hn, [s * 0.5 for s in noise(0.4, 0.5, 0.5)], at=0.0)
    write(OUT / "bf3_horn.wav", hn)

    sh: list[float] = []
    for k, f in enumerate([1568, 1976, 2349, 2794, 3136, 3951]):
        sh = mix(sh, [s * 0.5 for s in bell(f, 0.5, attack=0.003)], at=k * 0.06)
    write(OUT / "bf3_shimmer.wav", sh)

    print("\nconverting to mp3…")
    for wav in OUT.glob("bf3_*.wav"):
        mp3 = wav.with_suffix(".mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True)
        wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
