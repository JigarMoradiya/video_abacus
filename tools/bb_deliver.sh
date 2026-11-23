#!/usr/bin/env bash
# Bead Buddies delivery: guard sweep (every 3rd frame, low res), full plain render, intro merge.
#   sh tools/bb_deliver.sh <composition-id> <delivered.mp4> <scratch-dir> [phrases.json]
# 16:9 only gets motion_check + phrase_sheet (they assume 1920x1080).
set -eu
ID="$1"; OUT="$2"; SCR="$3"; PH="${4:-}"
mkdir -p "$SCR" "$(dirname "$OUT")"
rm -rf /var/folders/*/*/T/remotion-webpack-bundle-* 2>/dev/null || true
LOG="$SCR/deliver_$ID.log"
: > "$LOG"
echo "guard sweep" >> "$LOG"
npx remotion render "$ID" "$SCR/guard_$ID.mp4" --scale=0.2 --every-nth-frame=3 --crf=45 --muted --concurrency=8 > "$SCR/guard_$ID.log" 2>&1 || { echo "GUARD FAILED" >> "$LOG"; grep -i "error:" "$SCR/guard_$ID.log" | head -3 >> "$LOG"; echo FINISHED >> "$LOG"; exit 1; }
rm -f "$SCR/guard_$ID.mp4"
echo "full render" >> "$LOG"
npx remotion render "$ID" "$SCR/plain_$ID.mp4" --concurrency=4 > "$SCR/render_$ID.log" 2>&1 || { echo "RENDER FAILED" >> "$LOG"; echo FINISHED >> "$LOG"; exit 1; }
DIMS=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$SCR/plain_$ID.mp4")
if [ -n "$PH" ] && [ "${DIMS%%x*}" = "1920" ]; then
  python3 tools/motion_check.py "$SCR/plain_$ID.mp4" "$PH" 2>&1 | grep -A3 "FROZEN\|QUIET" >> "$LOG" || true
  python3 tools/phrase_sheet.py "$SCR/plain_$ID.mp4" "$PH" "$SCR/psheet_$ID" 2>&1 | grep -E "STALE|QUIET|none" >> "$LOG" || true
fi
ffmpeg -hide_banner -i "$SCR/plain_$ID.mp4" -af volumedetect -vn -f null - 2>&1 | grep -E "mean_volume|max_volume" >> "$LOG" || true
sh tools/merge_intro.sh "$SCR/plain_$ID.mp4" "$OUT" >> "$LOG" 2>&1
rm -f "$SCR/plain_$ID.mp4"
rm -rf /var/folders/*/*/T/remotion-webpack-bundle-* 2>/dev/null || true
echo "DELIVERED $OUT" >> "$LOG"
echo FINISHED >> "$LOG"
