#!/usr/bin/env python3
"""Original SFX for the "Which Finger?" reel — pure stdlib synthesis, same technique family
as make_beads_sfx.py / make_math_heroes_sfx.py.

FOUR SOUNDS:
  finger_chime.wav       the opening hook's soft welcome bell.
  finger_hook_pop.wav    a punchy rising swoop for the hook's very first frame — the thing
                          that has to make noise in the same instant the title/hand icons
                          snap on screen, since the first 3-4s is the whole reel's hook.
  finger_push.wav        a bead actually moving — one soft press-click into a bright landing
                          note. Reused for every push regardless of direction or which bead;
                          the physical action is the same each time.
  finger_recap_ding.wav  a single bright confirming note for each recap line ("Up is thumb."
                          / "Down is index finger.") — deliberately simple, this is the beat
                          where the rule gets stated flatly, not embellished. Also reused,
                          layered as two quick notes, for "Every single time!".

Usage:  python3 tools/make_finger_sfx.py
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


def click(freq: float, dur: float, warmth: float = 0.4) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        env = round_env(t, dur, attack=0.004, release_pow=2.0)
        s = math.sin(2 * math.pi * freq * t) - warmth * math.sin(2 * math.pi * freq * 2 * t)
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
    print("Which Finger? sounds:")

    write(OUT / "finger_chime.wav", bell(659, 0.46, attack=0.02))

    # a fast rising swoop into a bright landing bell — the hook's own punch, on screen at
    # frame 0 alongside the title pop and the flying-in hand icons.
    hook = glide_tone(220, 880, 0.22, attack=0.01, release_pow=1.2)
    hook = mix(hook, bell(988, 0.32, attack=0.006), at=0.2)
    write(OUT / "finger_hook_pop.wav", hook)

    push = click(300, 0.09, warmth=0.45)
    push = mix(push, bell(720, 0.3, attack=0.006), at=0.075)
    write(OUT / "finger_push.wav", push)

    write(OUT / "finger_recap_ding.wav", bell(587, 0.34, attack=0.008))

    print("\nconverting to mp3…")
    for wav in OUT.glob("*.wav"):
        if wav.stem in {"finger_chime", "finger_hook_pop", "finger_push", "finger_recap_ding"}:
            mp3 = wav.with_suffix(".mp3")
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True
            )
            wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
