# Episode 1 narration — drop the file in this folder

Exact path and filename:

```
abacus/video-pipeline/public/audio/e01_meet_the_abacus/e01_meet_the_abacus.mp3
```

The name must match the folder name. Everything downstream (alignment output, the reel module, the
render script) derives its paths from this slug, so a different filename silently breaks the chain.

## It must be mp3

The Remotion renderer **cannot decode `.opus`, `.m4a` or `.caf`**. If you recorded on a phone or on
Voice Memos you almost certainly have `.m4a`. Convert first:

```bash
ffmpeg -i your_recording.m4a -codec:a libmp3lame -q:a 2 e01_meet_the_abacus.mp3
```

## Then run these three, in order

**1. Measure it.** The duration gets hardcoded into the data file so composition length is known
without rendering.

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 public/audio/e01_meet_the_abacus/e01_meet_the_abacus.mp3
```

Expect roughly **290 s (4:49)**. Much shorter means lines were skipped; much longer means the pauses
are too long for a kids' video.

**2. Force-align** against the script to get real word and phrase times. This is what makes the beats
land on the narration instead of drifting against it.

```bash
python3 tools/align_audio.py public/audio/e01_meet_the_abacus/e01_meet_the_abacus.mp3 docs/E01_lines.txt
```

Writes `e01_meet_the_abacus.phrases.json`, `.words.json` and `.srt` next to the mp3. The `#` comment
lines in `E01_lines.txt` are ignored by the aligner — leave them in.

**3. Refine the counted runs.** Alignment collapses repeated identical words, so the counting beats on
lines 14, 22 and 35 ("one, two, three, four", "zero to nine", "one, two, three") will be mistimed by up
to about half a second. This re-times them from the audio envelope's syllable peaks:

```bash
python3 tools/refine_phrase_onsets.py public/audio/e01_meet_the_abacus/e01_meet_the_abacus.phrases.json
```

Not optional. Thirteen of the twenty-six phonics episodes shipped mistimed before this pass existed.

## Recording notes

- **One continuous take for all 41 lines.** Not line-by-line — the pipeline expects a single file, and
  stitched takes leave audible seams at every join.
- **Hold three full seconds of silence** after *"Your turn. What number is this one showing?"* Do not
  cut the gap short; it is the recall beat and the animation fills it.
- **Line 40 says "Abacus Kids".** The store title is still unconfirmed. Since this is one take, changing
  the name later means re-recording the whole thing — settle it before you start.
- **Line 16's "On an abacus this size"** is load-bearing, not filler. Do not drop it.
- No TTS. A real human voice is a hard constraint of the pipeline.

## A silent render is the failure mode to watch for

A wrong audio path renders **silent, with no error**. After any path change, measure energy in each
expected window rather than trusting that it worked.
