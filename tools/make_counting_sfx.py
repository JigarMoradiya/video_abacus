#!/usr/bin/env python3
"""Original SFX for the "Count to 10" reel — pure stdlib synthesis, same technique family as
make_beads_sfx.py / make_finger_sfx.py. A distinct, brighter "xylophone" palette — this reel
is the most purely playful of the three, so the sounds lean more musical than the others.

FIVE SOUNDS:
  count_hook.wav      the opening hook's own double-chime pop.
  count_bell.wav       ONE bell, reused for every count 1-9 at an increasing Remotion
                       `playbackRate` (handled in the reel, not here) so it rises like a
                       xylophone scale without needing nine separate files.
  count_full.wav       a satisfied low-high "that's it" plateau for "nine is the most this
                       one rod can show" — the one line that previously had no sound at all.
  count_carry.wav      the "for ten, we move over" moment — a whoosh into a warm landing chord.
  count_fanfare.wav     three-note triumphant run for "you just counted one to ten!"

Usage:  python3 tools/make_counting_sfx.py
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


def bell(freq: float, dur: float, attack: float = 0.008) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        env = round_env(t, dur, attack, release_pow=1.9)
        # a xylophone-ish spectrum: strong 3rd-partial-ish overtone, fast decay on the top end
        s = math.sin(2 * math.pi * freq * t) + 0.35 * math.sin(2 * math.pi * freq * 2.76 * t) * math.exp(-t * 14) \
            + 0.15 * math.sin(2 * math.pi * freq * 4.0 * t) * math.exp(-t * 22)
        out.append(s * env)
    return out


def glide_tone(f_start: float, f_end: float, dur: float, attack: float, release_pow: float) -> list[float]:
    n = int(dur * SR)
    out: list[float] = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        x = i / n
        gx = x * x * (3 - 2 * x)
        f = f_start + (f_end - f_start) * gx
        phase += 2 * math.pi * f / SR
        out.append(math.sin(phase) * round_env(t, dur, attack, release_pow))
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("Count to 10 sounds:")

    # HOOK — a quick double-pop, brighter/quicker than either prior reel's opener.
    hook = bell(784, 0.16, attack=0.005)
    hook = mix(hook, bell(1046, 0.28, attack=0.005), at=0.1)
    write(OUT / "count_hook.wav", hook)

    # THE reusable count bell — played at an increasing playbackRate per number in the reel.
    write(OUT / "count_bell.wav", bell(659, 0.3, attack=0.006))

    # FULL — a settled two-note "that's the top" for the rod-is-full beat.
    full = bell(440, 0.16, attack=0.008)
    full = mix(full, bell(392, 0.4, attack=0.01), at=0.14)
    write(OUT / "count_full.wav", full)

    # CARRY — a rising whoosh into a warm two-note landing, for "we move over".
    carry = glide_tone(260, 620, 0.26, attack=0.02, release_pow=1.0)
    carry = mix(carry, bell(523, 0.3, attack=0.01), at=0.22)
    carry = mix(carry, bell(659, 0.42, attack=0.01), at=0.3)
    write(OUT / "count_carry.wav", carry)

    # FANFARE — three-note triumphant run for the close.
    fanfare = bell(523, 0.18, attack=0.006)
    fanfare = mix(fanfare, bell(659, 0.18, attack=0.006), at=0.16)
    fanfare = mix(fanfare, bell(880, 0.5, attack=0.006), at=0.32)
    write(OUT / "count_fanfare.wav", fanfare)

    print("\nconverting to mp3…")
    for wav in OUT.glob("*.wav"):
        if wav.stem in {"count_hook", "count_bell", "count_full", "count_carry", "count_fanfare"}:
            mp3 = wav.with_suffix(".mp3")
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True
            )
            wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
