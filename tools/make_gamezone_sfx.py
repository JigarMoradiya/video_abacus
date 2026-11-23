#!/usr/bin/env python3
"""Original SFX for the Math Game Zone reel series — pure stdlib synthesis, same technique
family as the other make_*_sfx.py tools. An arcade palette shared by all 18 game reels
(consistent series sound), plus per-game signature sounds where the game has an iconic one.
Character intentionally echoes the app's OWN synthesized SFX set (balloon_pop, correct_ding,
sparkle, tile_place, merge_pop) so the reels sound like the product.

SHARED SET (every game reel):
  gz_hook.wav       bright double-pop for frame 0.
  gz_tap.wav        a small tap/click — the on-screen "finger" touching something.
  gz_correct.wav    correct-answer ding.
  gz_wrong.wav      soft two-tone "uh-oh" — friendly, never harsh.
  gz_win.wav        result-popup fanfare (3 rising notes) for the stars/confetti moment.
  gz_benefit.wav    warm two-note chime for the parent BenefitCard.

SIGNATURES (pilot):
  gz_balloon_pop.wav   noise-burst balloon pop.
  gz_tile_place.wav    soft plop of a number tile landing (Cross Math and friends).
  gz_star.wav          single star ping (played once per star, staggered).

Usage:  python3 tools/make_gamezone_sfx.py
"""
from __future__ import annotations

import math
import struct
import subprocess
import wave
from pathlib import Path

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public/audio/sfx"

NAMES = {
    "gz_hook", "gz_tap", "gz_correct", "gz_wrong", "gz_win", "gz_benefit",
    "gz_balloon_pop", "gz_tile_place", "gz_star",
}


def write(path: Path, samples: list[float]) -> None:
    peak = max(1e-9, max(abs(s) for s in samples))
    norm = 0.78 / peak
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(
            b"".join(struct.pack("<h", int(max(-1, min(1, s * norm)) * 32767)) for s in samples)
        )
    print(f"  {path.name}  {len(samples)/SR:.3f}s")


def mix(a: list[float], b: list[float], at: float = 0.0) -> list[float]:
    start = int(at * SR)
    n = max(len(a), start + len(b))
    out = list(a) + [0.0] * (n - len(a))
    for i, s in enumerate(b):
        out[start + i] += s
    return out


def round_env(t: float, total: float, attack: float, release_pow: float) -> float:
    if t < attack:
        x = t / attack
        return x * x * (3 - 2 * x)
    x = (t - attack) / max(1e-6, total - attack)
    return max(0.0, (1.0 - x)) ** release_pow


def bell(freq: float, dur: float, attack: float = 0.008) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        env = round_env(t, dur, attack, release_pow=1.8)
        s = math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * freq * 2.01 * t) \
            + 0.12 * math.sin(2 * math.pi * freq * 3.0 * t) * math.exp(-t * 16)
        out.append(s * env)
    return out


def click(freq: float, dur: float, warmth: float = 0.4) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        env = round_env(t, dur, attack=0.003, release_pow=2.2)
        s = math.sin(2 * math.pi * freq * t) - warmth * math.sin(2 * math.pi * freq * 2 * t)
        out.append(s * env)
    return out


def noise_burst(dur: float, lp_mix: float = 0.5, release_pow: float = 1.6) -> list[float]:
    """Filtered-noise burst — the body of a balloon pop."""
    n = int(dur * SR)
    out: list[float] = []
    seed = 987654321
    prev = 0.0
    for i in range(n):
        t = i / SR
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        raw = (seed / 0x7FFFFFFF) * 2 - 1
        prev = prev * lp_mix + raw * (1 - lp_mix)
        out.append(prev * round_env(t, dur, attack=0.001, release_pow=release_pow))
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("Game Zone sounds:")

    hook = bell(740, 0.14, attack=0.005)
    hook = mix(hook, bell(988, 0.3, attack=0.005), at=0.09)
    write(OUT / "gz_hook.wav", hook)

    write(OUT / "gz_tap.wav", click(620, 0.07, warmth=0.5))

    write(OUT / "gz_correct.wav", bell(880, 0.28, attack=0.005))

    wrong = bell(392, 0.14, attack=0.008)
    wrong = mix(wrong, bell(311, 0.24, attack=0.008), at=0.13)
    write(OUT / "gz_wrong.wav", [s * 0.6 for s in wrong])

    win = bell(523, 0.16, attack=0.006)
    win = mix(win, bell(659, 0.16, attack=0.006), at=0.14)
    win = mix(win, bell(880, 0.46, attack=0.006), at=0.28)
    write(OUT / "gz_win.wav", win)

    benefit = bell(587, 0.2, attack=0.012)
    benefit = mix(benefit, bell(784, 0.42, attack=0.012), at=0.18)
    write(OUT / "gz_benefit.wav", benefit)

    pop = noise_burst(0.09, lp_mix=0.25)
    pop = mix(pop, click(320, 0.06, warmth=0.6), at=0.0)
    write(OUT / "gz_balloon_pop.wav", pop)

    place = click(240, 0.08, warmth=0.55)
    place = mix(place, bell(480, 0.14, attack=0.004), at=0.05)
    write(OUT / "gz_tile_place.wav", place)

    write(OUT / "gz_star.wav", bell(1175, 0.22, attack=0.004))

    print("\nconverting to mp3…")
    for wav in OUT.glob("*.wav"):
        if wav.stem in NAMES:
            mp3 = wav.with_suffix(".mp3")
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True)
            wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
