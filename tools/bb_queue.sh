#!/bin/sh
# Sequential job runner: reads /tmp-style queue file (one shell command per line); polls for new lines; stops at a line "STOP".
Q="$1"; n=0
while true; do
  total=$(wc -l < "$Q")
  if [ "$n" -lt "$total" ]; then
    n=$((n+1)); cmd=$(sed -n "${n}p" "$Q")
    [ "$cmd" = "STOP" ] && break
    echo "[queue] $n: $cmd" >> "$Q.log"
    sh -c "$cmd" >> "$Q.log" 2>&1 || echo "[queue] FAILED $n" >> "$Q.log"
  else sleep 10; fi
done
echo "[queue] done" >> "$Q.log"
