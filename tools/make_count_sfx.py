#!/usr/bin/env python3
"""Counting sounds for E01's hook — pure stdlib synthesis, same house style as make_reveal_sfx.py.

WHY THESE EXIST. The hook animates counting twice: a number ladder running 1 to 100, and a hand
popping fingers up one at a time. Both were first given `btn_click.mp3`, which is a UI TAP — the
sound of pressing a button, not of counting. Twenty taps in a row is a machine, not a child counting.

Counting has a shape, and the shape is that it RISES. So each of these is a short marimba-ish note
whose pitch climbs with the count, and the two runs climb differently because they are counting
different things:

  count_tick_1..8.wav  the number ladder. Eight notes up a major scale, played in sequence and then
                       looped by the reel as the numbers race to a hundred. Bright, short, wooden —
                       it should feel like something being tallied, and it should not out-shout the
                       narration underneath it.

  finger_pop_1..8.wav  one per finger. Softer and rounder than the ladder — a finger going up is a
                       small physical event, not a tally mark — and it climbs the same scale so the
                       two runs in the hook are audibly the same idea at different speeds.

Kept as EIGHT separate files rather than one long clip because the reel places cues at frames, and
the two runs have different spacing (the ladder is even, the fingers are every 1/3.2 s). Separate
notes let the pitch follow the count in both without either being re-timed.

Usage:  python3 tools/make_count_sfx.py
        (then convert to mp3 — the renderer prefers it)
"""
from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public/audio/sfx"

# A major scale, because a rising major run reads as "going up" to any ear, including a four-year
# old's. C5 up to C6 — high enough to sit above narration without being shrill.
SCALE = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]


def write(path: Path, samples: list[float], peak_at: float = 0.72) -> None:
    peak = max(1e-9, max(abs(s) for s in samples))
    norm = peak_at / peak
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(
            b"".join(struct.pack("<h", int(max(-1, min(1, s * norm)) * 32767)) for s in samples)
        )
    print(f"  {path.name}  {len(samples)/SR:.3f}s")


def pluck(freq: float, dur: float, bright: float, body: float) -> list[float]:
    """A struck wooden note: fundamental, a couple of partials, fast attack, quick decay."""
    n = int(dur * SR)
    out: list[float] = []
    for i in range(n):
        t = i / SR
        x = i / n
        # fast attack, exponential decay — the envelope of something struck
        env = min(1.0, t / 0.003) * math.exp(-x * body)
        # a struck object drifts slightly flat as it decays
        f = freq * (1.0 - 0.01 * x)
        s = (
            math.sin(2 * math.pi * f * t)
            + math.sin(2 * math.pi * f * 2.0 * t) * (0.30 * bright)
            + math.sin(2 * math.pi * f * 3.01 * t) * (0.12 * bright)
        )
        # a touch of wooden knock in the first few milliseconds
        if t < 0.006:
            s += (1.0 - t / 0.006) * 0.5 * math.sin(2 * math.pi * 2400 * t)
        out.append(s * env)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("counting sounds:")
    # the ladder: bright and short, it has to survive being played twenty times in three seconds
    for k, f in enumerate(SCALE, start=1):
        write(OUT / f"count_tick_{k}.wav", pluck(f, 0.13, bright=1.0, body=9.0))
    # the fingers: rounder, a little longer, fewer partials — a softer physical event
    for k, f in enumerate(SCALE, start=1):
        write(OUT / f"finger_pop_{k}.wav", pluck(f * 0.5, 0.20, bright=0.45, body=6.0))


if __name__ == "__main__":
    main()
