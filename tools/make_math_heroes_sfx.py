#!/usr/bin/env python3
"""Original SFX for the Math Heroes reel — pure stdlib synthesis, same technique family as
make_e10_sfx.py (rounded envelopes, portamento, layered tones) plus the low-pass-filtered-noise
whoosh from make_smooth_sfx.py. Nothing here reuses or resembles an existing file in
public/audio/sfx/ — this reel has its own comic-book/superhero palette (alert whoop, hero
whoosh, communicator beep), not the classroom-abacus one the numbered episodes use.

NINE SOUNDS, one per beat that doesn't already read clearly without one:

  intro_stuck.wav       the opening line's "gets stuck" — a quick three-click stutter dropping
                      in pitch, a stumble/freeze rather than a single hit.
  intro_hero_sting.wav  "Math Heroes save the day!" — a bright triumphant three-note rising
                      sting, timed to Blaze's own hero pose on the word "save".
  hero_alert.wav     the notification dropping in — a comic "ALERT" whoop, two tones sweeping
                      up then settling, not a harsh klaxon (this is a kids' show).
  hero_call.wav      "Let's call a friend!" — two bright ascending communicator beeps.
  hero_entry.wav     Spark's slide-in — an airy whoosh (filtered noise) under a RISING glide,
                      so it reads as something arriving with speed, not just wind.
  bead_subtract.wav  the friend coming off the rod — three soft descending clicks, beads
                      tumbling away from the beam.
  bead_add.wav       the five bead landing — one bright ascending "got it" chime.
  mission_solved.wav the reveal — a short three-note victory fanfare.
  cta_pop.wav        the close beat's icon arriving — a soft pop with a light shimmer tail.

Usage:  python3 tools/make_math_heroes_sfx.py
        (writes .wav then converts to .mp3 via ffmpeg, into public/audio/sfx/)
"""
from __future__ import annotations

import math
import random
import struct
import subprocess
import wave
from pathlib import Path

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public/audio/sfx"
random.seed(20)


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
               warmth: float = 0.5, vibrato: float = 0.0) -> list[float]:
    n = int(dur * SR)
    out: list[float] = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        x = i / n
        gx = x * x * (3 - 2 * x)
        f = f_start + (f_end - f_start) * gx
        if vibrato:
            f *= 1.0 + vibrato * math.sin(2 * math.pi * 7 * t)
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


def whoosh(dur: float, glide_start: float, glide_end: float, lp: float = 0.05) -> list[float]:
    """Airy filtered-noise whoosh with a tonal glide riding under it — the technique
    make_smooth_sfx.py uses for its soft letter-move swoosh, tuned brighter and with a
    RISING glide so this one reads as an arrival, not an ambient puff of air."""
    n = int(dur * SR)
    out = [0.0] * n
    prev = 0.0
    for i in range(n):
        t = i / SR
        x = t / dur
        white = random.uniform(-1, 1)
        prev = prev * (1 - lp) + white * lp
        env = math.sin(math.pi * x) ** 1.4
        glide = glide_start + (glide_end - glide_start) * (x * x)
        body = 0.4 * math.sin(2 * math.pi * glide * t)
        out[i] = (prev * 3.0 + body) * env * 0.55
    return out


def stutter_click(freq: float, dur: float, reps: int, warmth: float = 0.5) -> list[float]:
    """A quick stutter of the SAME short click, close together — reads as a stumble/freeze
    rather than a single hit. Used for the opening line's "gets stuck" moment."""
    out: list[float] = []
    t = 0.0
    for _ in range(reps):
        out = mix(out, click(freq, dur, warmth=warmth), at=t)
        t += dur * 0.7
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("Math Heroes sounds:")

    # INTRO STUCK — the opening line's own "gets stuck" moment. A quick three-click stutter
    # dropping in pitch, like a stumble/freeze, then let go — sets up "Math Heroes save the
    # day!" as the fix.
    stuck_open = stutter_click(340, 0.055, 3, warmth=0.55)
    stuck_open = mix(stuck_open, glide_tone(260, 180, 0.14, attack=0.01, release_pow=1.6, warmth=0.55), at=0.17)
    write(OUT / "intro_stuck.wav", stuck_open)

    # INTRO HERO STING — "Math Heroes save the day!" A bright three-note rising sting,
    # brassier and more triumphant than mission_solved's fanfare — this is the ENTRANCE of
    # the idea, not a puzzle reveal.
    sting = bell(392, 0.13, attack=0.006)                         # G4
    sting = mix(sting, bell(523, 0.13, attack=0.006), at=0.1)     # C5
    sting = mix(sting, bell(784, 0.5, attack=0.006), at=0.2)      # G5, held and bright
    write(OUT / "intro_hero_sting.wav", sting)

    # HERO ALERT — the notification dropping in. Two tones sweeping up then settling: a
    # comic "ALERT", not a harsh klaxon.
    alert = glide_tone(520, 760, 0.16, attack=0.006, release_pow=1.3, warmth=0.3, vibrato=0.03)
    alert = mix(alert, glide_tone(760, 660, 0.22, attack=0.01, release_pow=1.6, warmth=0.4), at=0.14)
    write(OUT / "hero_alert.wav", alert)

    # HERO CALL — "Let's call a friend!" Two bright ascending communicator beeps.
    call = click(880, 0.09, warmth=0.15)
    call = mix(call, click(1180, 0.1, warmth=0.15), at=0.13)
    write(OUT / "hero_call.wav", call)

    # HERO ENTRY — Spark's slide-in. Airy whoosh with a rising glide underneath, so it reads
    # as something arriving with speed rather than a puff of ambient wind.
    write(OUT / "hero_entry.wav", whoosh(0.55, 180, 640, lp=0.045))

    # BEAD SUBTRACT — the friend coming off the rod. Three soft descending clicks, beads
    # tumbling away from the beam, spacing widening slightly as they settle.
    sub: list[float] = []
    t = 0.0
    freqs = [360, 300, 250]
    gap = 0.07
    for i, f in enumerate(freqs):
        sub = mix(sub, click(f, 0.09, warmth=0.5), at=t)
        t += gap
        gap *= 1.15
    write(OUT / "bead_subtract.wav", sub)

    # BEAD ADD — the five bead landing. One bright ascending "got it" chime.
    write(OUT / "bead_add.wav", bell(720, 0.32, attack=0.008))

    # MISSION SOLVED — the reveal. A short three-note victory fanfare, each note brighter
    # than the last.
    solved = bell(523, 0.16, attack=0.006)          # C5
    solved = mix(solved, bell(659, 0.16, attack=0.006), at=0.12)   # E5
    solved = mix(solved, bell(784, 0.4, attack=0.006), at=0.24)    # G5, held
    write(OUT / "mission_solved.wav", solved)

    # CTA POP — the close beat's icon arriving. A soft pop with a light shimmer tail.
    pop = click(200, 0.05, warmth=0.6)
    pop = mix(pop, bell(1046, 0.22, attack=0.02), at=0.02)
    write(OUT / "cta_pop.wav", pop)

    print("\nconverting to mp3…")
    for wav in OUT.glob("*.wav"):
        mp3 = wav.with_suffix(".mp3")
        if wav.stem in {"hero_alert", "hero_call", "hero_entry", "bead_subtract", "bead_add",
                          "mission_solved", "cta_pop", "intro_stuck", "intro_hero_sting"}:
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True
            )
            wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
