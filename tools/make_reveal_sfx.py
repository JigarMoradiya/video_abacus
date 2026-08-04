#!/usr/bin/env python3
"""Original SFX for the abacus reveal — pure stdlib synthesis, no samples, no app sounds.

Produces:
  reveal.wav   "This is an abacus."  — a soft rise, then a bright bead-like arpeggio that
               lands on a major chord, with a short wooden knock at the top so it sounds
               like an object arriving rather than a generic UI ding.
  swipe.wav    a short air-swish for a card or arrow entering.

Why synthesised: the same reason the music bed is (see tools/make_music.py). A stock sting
carries licensing risk and a fingerprint match; something built here does not. It also lets
the reveal be tuned to this series specifically — the arpeggio is the 1-3-5-8 of the bead
values the episode teaches, which is a nicer accident than it sounds.

Usage:  python3 tools/make_reveal_sfx.py
        (then convert to mp3 — the renderer prefers it)
"""
from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public/audio/sfx"
random.seed(11)


def write(path: Path, samples: list[float]) -> None:
    peak = max(1e-9, max(abs(s) for s in samples))
    # leave headroom: the first SFX pass clipped the mix at 0.0 dB
    norm = 0.72 / peak
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(
            b"".join(struct.pack("<h", int(max(-1, min(1, s * norm)) * 32767)) for s in samples)
        )
    print(f"  {path.name}  {len(samples)/SR:.2f}s")


def adsr(i: int, n: int, a: float, d: float) -> float:
    t = i / SR
    total = n / SR
    if t < a:
        return t / a
    x = (t - a) / max(1e-6, total - a)
    return max(0.0, (1.0 - x)) ** (1.0 / max(0.05, d))


def bead_tone(freq: float, dur: float, at: float, amp: float, out: list[float]) -> None:
    """A struck-bead tone: fundamental plus a couple of partials and a fast wooden click."""
    n = int(dur * SR)
    start = int(at * SR)
    for i in range(n):
        e = adsr(i, n, 0.004, 0.5)
        t = i / SR
        # slight downward pitch drift, as a struck object has
        f = freq * (1.0 - 0.012 * (i / n))
        s = (
            math.sin(2 * math.pi * f * t) * 1.0
            + math.sin(2 * math.pi * f * 2.02 * t) * 0.26
            + math.sin(2 * math.pi * f * 3.01 * t) * 0.10
        )
        # wooden transient in the first few ms
        if i < SR * 0.006:
            s += (random.random() * 2 - 1) * 0.5 * (1 - i / (SR * 0.006))
        j = start + i
        if j < len(out):
            out[j] += s * e * amp


def rise(dur: float, at: float, amp: float, out: list[float]) -> None:
    """Filtered-noise swell that sweeps upward — the 'here it comes'."""
    n = int(dur * SR)
    start = int(at * SR)
    lp = 0.0
    for i in range(n):
        x = i / n
        # one-pole low-pass whose cutoff opens as the swell rises
        k = 0.02 + 0.30 * x
        lp += k * ((random.random() * 2 - 1) - lp)
        env = (x**1.6) * (1.0 - x) * 4.0
        j = start + i
        if j < len(out):
            out[j] += lp * env * amp


def shimmer(dur: float, at: float, amp: float, out: list[float]) -> None:
    """A few high twinkles scattered after the landing."""
    for k in range(7):
        f = random.choice([1568, 1760, 2093, 2637, 3136])
        t0 = at + 0.06 + random.random() * (dur - 0.2)
        n = int(0.16 * SR)
        start = int(t0 * SR)
        for i in range(n):
            e = adsr(i, n, 0.003, 0.35)
            j = start + i
            if j < len(out):
                out[j] += math.sin(2 * math.pi * f * (i / SR)) * e * amp * 0.5


def make_reveal() -> None:
    total = 1.6
    buf = [0.0] * int(total * SR)
    rise(0.52, 0.0, 0.55, buf)
    # C-E-G-C, i.e. the 1-3-5-8 the episode is about to teach
    for step, (f, at) in enumerate(
        [(523.25, 0.34), (659.25, 0.44), (783.99, 0.54), (1046.50, 0.66)]
    ):
        bead_tone(f, 0.85 if step == 3 else 0.5, at, 0.34 if step < 3 else 0.5, buf)
    shimmer(0.9, 0.66, 0.18, buf)
    write(OUT / "reveal.wav", buf)


def make_swipe() -> None:
    total = 0.34
    buf = [0.0] * int(total * SR)
    n = len(buf)
    lp = 0.0
    for i in range(n):
        x = i / n
        k = 0.05 + 0.45 * x
        lp += k * ((random.random() * 2 - 1) - lp)
        env = math.sin(math.pi * x) ** 1.5
        buf[i] += lp * env * 0.6
    write(OUT / "swipe.wav", buf)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    print("synthesising:")
    make_reveal()
    make_swipe()
