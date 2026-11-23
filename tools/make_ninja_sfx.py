#!/usr/bin/env python3
"""Original SFX for Zip & Dash's "quick math" reels (adding/subtracting on rod 1) — pure
stdlib synthesis, same technique family as the other reels' make_*_sfx.py tools. A sharper,
whoosh-forward palette than any prior reel — this cast is ninjas, so speed comes first.

FOUR SOUNDS:
  ninja_hook.wav    a quick double "shuriken swipe" for the opening hook.
  ninja_push.wav    one bead move (any direction, any count of beads) — a short air-whoosh
                     into a crisp click landing. Reused for every push/pull in the reel.
  ninja_reset.wav   the rod snapping back to empty between examples — a soft reverse-whoosh.
  ninja_tip.wav     a calm, single confirming chime for the technique tip — deliberately
                     understated next to the whooshes, since this beat is advice, not action.

Usage:  python3 tools/make_ninja_sfx.py
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


def noise_whoosh(f_start: float, f_end: float, dur: float, attack: float, release_pow: float) -> list[float]:
    """A filtered-noise-ish whoosh: a swept tone plus light noise, for an air/blade feel."""
    n = int(dur * SR)
    out: list[float] = []
    phase = 0.0
    seed = 12345
    for i in range(n):
        t = i / SR
        x = i / n
        gx = x * x * (3 - 2 * x)
        f = f_start + (f_end - f_start) * gx
        phase += 2 * math.pi * f / SR
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        noise = ((seed / 0x7FFFFFFF) * 2 - 1) * 0.35
        out.append((math.sin(phase) * 0.75 + noise) * round_env(t, dur, attack, release_pow))
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


def bell(freq: float, dur: float, attack: float = 0.008) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        env = round_env(t, dur, attack, release_pow=1.8)
        s = math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * freq * 2.01 * t)
        out.append(s * env)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("Zip & Dash sounds:")

    hook = noise_whoosh(900, 300, 0.14, attack=0.004, release_pow=1.4)
    hook = mix(hook, noise_whoosh(1100, 380, 0.16, attack=0.004, release_pow=1.4), at=0.1)
    write(OUT / "ninja_hook.wav", hook)

    push = noise_whoosh(500, 900, 0.11, attack=0.006, release_pow=1.2)
    push = mix(push, click(760, 0.08, warmth=0.5), at=0.09)
    write(OUT / "ninja_push.wav", push)

    reset = noise_whoosh(700, 260, 0.16, attack=0.01, release_pow=1.3)
    write(OUT / "ninja_reset.wav", reset)

    write(OUT / "ninja_tip.wav", bell(587, 0.4, attack=0.015))

    print("\nconverting to mp3…")
    for wav in OUT.glob("*.wav"):
        if wav.stem in {"ninja_hook", "ninja_push", "ninja_reset", "ninja_tip"}:
            mp3 = wav.with_suffix(".mp3")
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True
            )
            wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
