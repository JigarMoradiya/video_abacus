#!/usr/bin/env python3
"""Original SFX for the Bead Values reel — pure stdlib synthesis, same technique family as
make_math_heroes_sfx.py (rounded envelopes, portamento, layered tones). A gentler, more
"classroom" palette than either Math Heroes reel's comic-book sounds — this one is direct
teaching, not a mystery to solve.

FOUR SOUNDS:
  bead_chime_lo.wav     the opening hook's own soft chime — a single warm bell, not an alert.
  bead_upper_swap.wav   the "lower beads retract, heaven bead drops" moment — a short
                        descending run into one brighter landing note, played on EVERY rod's
                        upper-bead reveal (ones, tens, hundreds).
  bead_recap_sting.wav  "Ones, tens, hundreds — bigger and bigger!" — a rising three-note
                        run, one per place value, ending bright.
  cta_pop.wav           the close beat's icon arriving — reused verbatim from the Math
                        Heroes set (it's a generic soft pop, not tied to that reel's story).

Usage:  python3 tools/make_beads_sfx.py
        (writes .wav then converts to .mp3 via ffmpeg, into public/audio/sfx/)
"""
from __future__ import annotations

import math
import struct
import subprocess
import wave
from pathlib import Path

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public/audio/sfx"


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


def glide_tone(f_start: float, f_end: float, dur: float, attack: float, release_pow: float,
               warmth: float = 0.5) -> list[float]:
    n = int(dur * SR)
    out: list[float] = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        x = i / n
        gx = x * x * (3 - 2 * x)
        f = f_start + (f_end - f_start) * gx
        phase += 2 * math.pi * f / SR
        fundamental = math.sin(phase)
        triangle_ish = math.sin(phase) - 0.15 * math.sin(3 * phase) + 0.06 * math.sin(5 * phase)
        s = fundamental * (1 - warmth) + triangle_ish * warmth
        out.append(s * round_env(t, dur, attack, release_pow))
    return out


def bell(freq: float, dur: float, attack: float = 0.01) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        env = round_env(t, dur, attack, release_pow=1.7)
        s = math.sin(2 * math.pi * freq * t) + 0.28 * math.sin(2 * math.pi * freq * 2.01 * t) \
            + 0.12 * math.sin(2 * math.pi * freq * 3.0 * t)
        out.append(s * env)
    return out


def click(freq: float, dur: float, warmth: float = 0.35) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        env = round_env(t, dur, attack=0.003, release_pow=2.0)
        s = math.sin(2 * math.pi * freq * t) - warmth * math.sin(2 * math.pi * freq * 2 * t)
        out.append(s * env)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("Bead Values sounds:")

    # OPENING CHIME — a single warm bell, welcoming rather than urgent.
    write(OUT / "bead_chime_lo.wav", bell(587, 0.5, attack=0.02))

    # UPPER-BEAD SWAP — three soft descending clicks (lower beads retracting) into one
    # brighter landing note (heaven bead settling). Reused for every rod's reveal.
    swap: list[float] = []
    t = 0.0
    gap = 0.065
    for f in (340, 285, 235):
        swap = mix(swap, click(f, 0.08, warmth=0.5), at=t)
        t += gap
        gap *= 1.1
    swap = mix(swap, bell(660, 0.34, attack=0.008), at=t + 0.03)
    write(OUT / "bead_upper_swap.wav", swap)

    # RECAP STING — "ones, tens, hundreds" — three rising notes, one per place value.
    recap = bell(494, 0.16, attack=0.006)           # B4
    recap = mix(recap, bell(587, 0.16, attack=0.006), at=0.15)   # D5
    recap = mix(recap, bell(784, 0.42, attack=0.006), at=0.3)    # G5, held and bright
    write(OUT / "bead_recap_sting.wav", recap)

    print("\nconverting to mp3…")
    for wav in OUT.glob("*.wav"):
        if wav.stem in {"bead_chime_lo", "bead_upper_swap", "bead_recap_sting"}:
            mp3 = wav.with_suffix(".mp3")
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True
            )
            wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
