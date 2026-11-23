#!/usr/bin/env python3
"""Original SFX for E08 — pure stdlib synthesis, no samples, no reused app sounds.

SECOND PASS. The first pass built four sounds on the SAME technique as the rest of the library
(sharp attack, exponential decay, sine + harmonics) — which is why they still read as clicks and
taps despite being new files. A click is the right sound for a bead landing on a rod; it is the
wrong sound for a see-saw creaking, a formula sparkling into view, or a puppy chirping. This pass
changes the TECHNIQUE, not just the pitch, for each one:

  seesaw_creak.wav   PORTAMENTO, not a knock. A real see-saw plank doesn't click when it tips — it
                     creaks and settles. The pitch SLIDES down with a slow, rounded envelope, the
                     way a spring or a hinge does, instead of attacking instantly and decaying fast.
  seesaw_resolve.wav Three rounded notes in quick overlapping succession (a glissando run), not two
                     plucked bell tones. A run reads as "arriving somewhere"; two plucks read as a
                     doorbell.
  friend_sparkle.wav Four quick ascending notes with shimmer (tremolo + slight pitch waver on each),
                     overlapping so they blend into one gesture rather than four separate dings —
                     built for "something magical just appeared", which is what a formula card
                     popping in is supposed to feel like.
  pup_yip.wav        NEW. A two-note pitch-bent chirp — up-down on the first note, a shorter second
                     note right behind it — built from a softer, rounder tone (fewer harsh upper
                     harmonics) than anything else in the library. For the puppies' worried
                     reactions ("Oh no."), which had been borrowing `boing.mp3` — a spring sound
                     built for a ladybird's shrug in a different episode, not a dog's.
  reassure.wav       NEW. "Do not worry." — the pivot from worried to rescued had NO sound at all.
                     Two long, warm, overlapping notes with a slow rounded attack and a gentle
                     rise — calm rather than excited, so it doesn't step on the celebration that
                     follows two lines later. Deliberately NOT `pup_yip` again: that sound already
                     means "worried"; reusing it here would make comfort and worry sound identical.
  quiz_chirp.wav     A warm two-note "boop-beep", each note gliding UP a little rather than struck
                     flat. Replaces the plucked `quiz_pop` — same job (the friends-of-five quiz
                     answers), warmer character.

Usage:  python3 tools/make_e08_sfx.py
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
random.seed(8)


def write(path: Path, samples: list[float]) -> None:
    peak = max(1e-9, max(abs(s) for s in samples))
    norm = 0.72 / peak
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
    """A ROUNDED envelope — soft fade-in, then a curved (not exponential) release. The difference
    between this and every `exp(-x*body)` decay elsewhere in the library is exactly the difference
    between a struck object and a breathed/sprung one."""
    if t < attack:
        # smoothstep, not linear — a linear fade-in still sounds like a switch flicking
        x = t / attack
        return x * x * (3 - 2 * x)
    x = (t - attack) / max(1e-6, total - attack)
    return max(0.0, (1.0 - x)) ** release_pow


def glide_tone(f_start: float, f_end: float, dur: float, attack: float, release_pow: float,
               warmth: float = 0.5) -> list[float]:
    """A tone whose pitch SLIDES from f_start to f_end — portamento, the core trick none of the
    library's percussive sounds use. `warmth` mixes in a triangle-ish (odd-harmonic-light) colour
    so it reads as breath/spring rather than struck metal or wood."""
    n = int(dur * SR)
    out: list[float] = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        x = i / n
        # ease the pitch slide too, so it glides rather than ramping linearly
        gx = x * x * (3 - 2 * x)
        f = f_start + (f_end - f_start) * gx
        phase += 2 * math.pi * f / SR
        fundamental = math.sin(phase)
        # a soft triangle-like overtone for body, without the harsh bright harmonics a pluck uses
        triangle_ish = math.sin(phase) - 0.15 * math.sin(3 * phase) + 0.06 * math.sin(5 * phase)
        s = fundamental * (1 - warmth) + triangle_ish * warmth
        out.append(s * round_env(t, dur, attack, release_pow))
    return out


def sparkle_note(freq: float, dur: float, attack: float = 0.02) -> list[float]:
    """One note of the shimmer run: rounded attack, gentle tremolo, soft upper partial — built to
    OVERLAP with its neighbours rather than stand alone, which is what makes a run feel like one
    gesture instead of separate dings."""
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        env = round_env(t, dur, attack, release_pow=1.6)
        shimmer = 1.0 + 0.08 * math.sin(2 * math.pi * 9 * t)
        s = math.sin(2 * math.pi * freq * t * shimmer) + 0.22 * math.sin(2 * math.pi * freq * 2 * t)
        out.append(s * env)
    return out


def chirp(f_lo: float, f_hi: float, dur: float, attack: float = 0.012) -> list[float]:
    """A short upward pitch-bend chirp — a puppy yip or a friendly boop, never a flat pluck."""
    n = int(dur * SR)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        x = i / n
        gx = x * x * (3 - 2 * x)
        f = f_lo + (f_hi - f_lo) * gx
        phase += 2 * math.pi * f / SR
        # rounder than a sine alone: soften with a touch of triangle-ish colour, no bright harmonics
        s = math.sin(phase) - 0.12 * math.sin(3 * phase)
        out.append(s * round_env(t, dur, attack, release_pow=1.3))
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("E08 sounds (v2 — warmer, no clicks):")

    # SEE-SAW CREAK — pitch SLIDES down, slow rounded attack, spring-like. Not a knock.
    creak = glide_tone(320, 210, 0.30, attack=0.05, release_pow=1.8, warmth=0.6)
    write(OUT / "seesaw_creak.wav", creak)

    # SEE-SAW RESOLVE — a three-note rounded run, overlapping, landing on a sustained top note.
    resolve = sparkle_note(523.25, 0.34, attack=0.03)  # C5
    resolve = mix(resolve, sparkle_note(659.25, 0.36, attack=0.03), at=0.07)  # E5
    resolve = mix(resolve, sparkle_note(784.0, 0.5, attack=0.03), at=0.15)  # G5, sustained
    write(OUT / "seesaw_resolve.wav", resolve)

    # FRIEND SPARKLE — four quick ascending shimmering notes, heavily overlapped into one gesture.
    sparkle = sparkle_note(587.33, 0.28, attack=0.02)  # D5
    sparkle = mix(sparkle, sparkle_note(698.46, 0.28, attack=0.02), at=0.06)  # F5
    sparkle = mix(sparkle, sparkle_note(880.0, 0.28, attack=0.02), at=0.12)  # A5
    sparkle = mix(sparkle, sparkle_note(1174.66, 0.36, attack=0.02), at=0.18)  # D6, the sparkle top
    write(OUT / "friend_sparkle.wav", sparkle)

    # PUP YIP — two quick pitch-bent chirps, softer/rounder than anything else in the library.
    yip = chirp(520, 760, 0.11)
    yip = mix(yip, chirp(600, 820, 0.09), at=0.13)
    write(OUT / "pup_yip.wav", yip)

    # QUIZ CHIRP — a warm two-note "boop-beep", each note gliding up, not struck flat.
    boop = chirp(440, 560, 0.13)
    boop = mix(boop, chirp(560, 700, 0.15), at=0.11)
    write(OUT / "quiz_chirp.wav", boop)
    # REASSURE — "Do not worry." Two long warm notes, slow attack, calm — not the sparkle/chirp
    # vocabulary used everywhere else, on purpose: this is a comfort, not a celebration.
    reassure = glide_tone(390, 430, 0.42, attack=0.09, release_pow=2.0, warmth=0.7)
    reassure = mix(reassure, glide_tone(490, 520, 0.4, attack=0.1, release_pow=2.0, warmth=0.7), at=0.1)
    write(OUT / "reassure.wav", reassure)


if __name__ == "__main__":
    main()
