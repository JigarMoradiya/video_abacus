#!/usr/bin/env python3
"""Original SFX for E15 (Family Plus, the sea-otter kelp cove). Soft, watery, friendly; none of them is
percussive in its first 150 ms (a hard transient at an episode's start collides with the intro seam).
Same helper family as make_math_heroes_sfx.py (imported). The bead clicks, friend sparkle, quiz chirps,
fanfares and store sounds already in public/audio/sfx/ are reused by the reel.

  e15_bubble.mp3   a soft bubble pop: a quick rising blip with a watery tail (card arrivals)
  e15_chirp.mp3    an otter chirp: two quick rising squeaks (cheer / gasp / hello)
  e15_link.mp3     paws linking: a warm two-note glass clink and a tiny shimmer (the family joins)
  e15_splash.mp3   a gentle splash: filtered noise swelling and falling (the hook, the finale)
  e15_glub.mp3     a worried glub: a falling bubbly wobble (the big friend gets stuck)
  e15_tide.mp3     a slow wash of water: long filtered swell (scene changes)

Usage:  python3 tools/make_e15_sfx.py   (writes .wav then converts to .mp3 in public/audio/sfx/)
"""
from __future__ import annotations

import math
import random
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_math_heroes_sfx import OUT, SR, bell, glide_tone, mix, write  # noqa: E402

random.seed(2615)


def noise(dur: float, lp: float, env) -> list[float]:
    n = int(dur * SR)
    prev = 0.0
    out = []
    for i in range(n):
        prev = prev * (1 - lp) + random.uniform(-1, 1) * lp
        out.append(prev * env(i / n))
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("E15 sounds:")
    # BUBBLE: a rising blip whose attack is soft (no click)
    b = glide_tone(380, 980, 0.11, attack=0.03, release_pow=1.4, warmth=0.1)
    b = mix(b, [s * 0.35 for s in glide_tone(760, 1500, 0.09, attack=0.03, release_pow=1.6, warmth=0.1)], at=0.03)
    b = mix(b, [s * 0.25 for s in noise(0.18, 0.12, lambda x: math.sin(math.pi * x) * (1 - x))], at=0.02)
    write(OUT / "e15_bubble.wav", b)
    # CHIRP: two rising squeaks
    c = glide_tone(700, 1300, 0.12, attack=0.03, release_pow=1.0, warmth=0.15)
    c = mix(c, glide_tone(900, 1700, 0.14, attack=0.025, release_pow=1.0, warmth=0.15), at=0.15)
    write(OUT / "e15_chirp.wav", [s * 0.8 for s in c])
    # LINK: two glass notes, the second a fifth up, a tiny shimmer
    l = bell(660, 0.5, attack=0.012)
    l = mix(l, [s * 0.85 for s in bell(990, 0.6, attack=0.012)], at=0.13)
    l = mix(l, [s * 0.4 for s in bell(1980, 0.4, attack=0.01)], at=0.16)
    write(OUT / "e15_link.wav", [s * 0.7 for s in l])
    # SPLASH: swelling band noise
    sp = noise(0.9, 0.09, lambda x: math.sin(math.pi * min(1, x * 1.3)) ** 1.5 * (1 - x) ** 0.6)
    write(OUT / "e15_splash.wav", [s * 1.4 for s in sp])
    # GLUB: falling wobble
    g = glide_tone(520, 190, 0.34, attack=0.04, release_pow=1.2, warmth=0.6, vibrato=0.08)
    g = mix(g, [s * 0.5 for s in glide_tone(330, 140, 0.3, attack=0.05, release_pow=1.2, warmth=0.6, vibrato=0.1)], at=0.12)
    write(OUT / "e15_glub.wav", [s * 0.8 for s in g])
    # TIDE: a slow wash
    td = noise(1.6, 0.05, lambda x: math.sin(math.pi * x) ** 2)
    write(OUT / "e15_tide.wav", [s * 1.6 for s in td])
    print("\nconverting to mp3…")
    for wav in OUT.glob("e15_*.wav"):
        mp3 = wav.with_suffix(".mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True)
        wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
