#!/usr/bin/env python3
"""A smooth, steady background bed for narrated lessons: a warm quartal pad with soft music-box notes on top.

Constant level (no deep swells, unlike music_bed.mp3), seamless 26.7 s loop, normalised to about -27 dB mean so it sits ~10 dB under narration.
Same fingerprint-safe choices as make_music.py: quartal chords (no clear major/minor tonic), an odd loop length, a detuned harmonic,
and a non-pop pentatonic melody. Output: public/lesson_bed.wav (WAV, so an encoder gap cannot open at the loop point)
"""
import subprocess
import numpy as np

SR = 44100
BEAT = 60.0 / 72.0
BEATS = 32
N = int(SR * BEAT * BEATS)
t = np.arange(N) / SR
f = lambda st: 440.0 * 2 ** (st / 12.0)

# pad: quartal chords, 8 beats each, 1.2 s crossfade; the chord wraps so the loop is seamless
CH = [[-14, -9, -7], [-12, -7, -5], [-16, -11, -9], [-9, -4, -2]]
pad = np.zeros(N)
seg = N // 4
for k, ch in enumerate(CH):
    env = np.zeros(N)
    a = k * seg
    for i in range(N):
        pass
    x = (np.arange(N) - a) / SR
    # smooth rise and fall around the chord's slot, wrapped
    d = ((np.arange(N) - a + N // 2) % N) - N // 2
    w = np.clip(1.0 - np.abs((d - seg / 2) / (seg / 2 + 1.2 * SR)), 0, 1)
    env = np.sin(np.pi / 2 * np.clip(w * 1.6, 0, 1)) ** 2
    for st in ch:
        pad += env * (np.sin(2 * np.pi * f(st) * t) + 0.25 * np.sin(2 * np.pi * f(st) * 2.003 * t))
pad /= np.max(np.abs(pad)) + 1e-9

# soft music-box notes: D-major pentatonic, a gentle pattern every beat, some rests, notes wrapping at the loop end
rng = np.random.default_rng(7)
PENT = [14, 16, 18, 21, 23, 26, 28, 30]   # semitones above A4: D5 E5 F#5 A5 B5 D6 E6 F#6
bells = np.zeros(N + 3 * SR)
for b in range(BEATS * 2):
    if rng.random() < 0.38:
        continue
    st = PENT[int(rng.integers(0, len(PENT)))]
    start = int(b * BEAT / 2 * SR)
    L = int(2.2 * SR)
    tt = np.arange(L) / SR
    amp = 0.55 + 0.45 * rng.random()
    note = amp * (np.sin(2 * np.pi * f(st) * tt) + 0.18 * np.sin(2 * np.pi * f(st) * 3.0 * tt)) * np.exp(-tt * 2.4)
    note *= np.minimum(1, tt / 0.006)
    bells[start:start + L] += note
bells[:3 * SR] += 0
bells = bells[:N] + np.concatenate([bells[N:], np.zeros(N - 3 * SR)])  # wrap the tail onto the start
bells /= np.max(np.abs(bells)) + 1e-9

mix = 0.75 * pad + 0.35 * bells
# slow gentle breathing only (+-1 dB)
mix *= 1 + 0.06 * np.sin(2 * np.pi * t / (BEAT * 16))
rms = np.sqrt(np.mean(mix ** 2))
mix *= 10 ** (-27 / 20) / rms
mix = np.clip(mix, -0.98, 0.98)
pcm = (mix * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "public/lesson_bed.wav"], input=pcm, check=True)
print("loop seconds", N / SR, "frames @30fps", N / SR * 30)
