#!/usr/bin/env bash
# The two arms still outstanding, strictly serial, with the corrected watchdog.
#
# Why this script exists rather than a re-run of the queue: three separate drivers ended
# up alive at once (the swiftshader queue, a leftover A0+ driver from earlier, and two
# waiters), so three renders competed on 12 cores. D3 and A0+ survived that and are
# valid at 750 frames; D1 needs a re-render for the edge-bleed fix and D2 never produced
# a file. Nothing else runs while this does.
set -uo pipefail
cd "$(dirname "$0")/../.."
LOG=out/render-log-sw.txt
say() { echo "$*" | tee -a "$LOG"; }

# Progress = encoded bytes + frame-file count, because Remotion writes element-NNN.jpeg
# for the whole first half of a render and pre-encode.mp4 does not exist yet.
progress() {
  local d; d=$(ls -dt /tmp/react-motion-render* 2>/dev/null | head -1)
  echo $(( $(stat -c %s "$d/pre-encode.mp4" 2>/dev/null || echo 0) + $(ls "$d" 2>/dev/null | wc -l) ))
}

watchdog() {  # pid label
  local pid=$1 label=$2 last=-1 same=0 p
  while kill -0 "$pid" 2>/dev/null; do
    sleep 30
    p=$(progress)
    if [ "$p" = "$last" ]; then
      same=$((same + 1))
      if [ "$same" -ge 8 ]; then
        say "STALL  $label  no progress for 240s - killing the group"
        kill -- -"$(ps -o pgid= "$pid" | tr -d ' ')" 2>/dev/null || kill "$pid" 2>/dev/null
        return
      fi
    else same=0; fi
    last=$p
  done
}

run() {  # comp out label conc
  local comp=$1 out=$2 label=$3 conc=$4 t0 pid wd rc
  t0=$(date +%s)
  npx remotion render src/index.ts "$comp" "$out" \
    --gl=swiftshader --codec h264 --crf 18 --concurrency "$conc" --log=error >/dev/null 2>&1 &
  pid=$!; watchdog "$pid" "$label" & wd=$!
  wait "$pid"; rc=$?
  kill "$wd" 2>/dev/null
  local n; n=$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of csv=p=0 "$out" 2>/dev/null | tr -d ',')
  say "$label  $(( $(date +%s) - t0 ))s  exit=$rc  frames=${n:-none}"
}

run SigmaFilmD1 out/d1-inside-the-system.mp4 "REDO   D1 bleed-fix"   3
run SigmaFilmD2 out/d2-the-product.mp4       "RETRY  D2 conc2"       2

for f in out/sigma-film-25s.mp4 out/a0plus-v1-with-score.mp4 out/d1-inside-the-system.mp4 \
         out/d2-the-product.mp4 out/d3-one-take.mp4; do
  [ -s "$f" ] && node scripts/bench-video/probe-bleed.mjs "$f" >> out/probe-results.txt 2>&1
done
node scripts/bench-video/probe-frame.mjs  out/sigma-film-25s.mp4 out/a0plus-v1-with-score.mp4 \
     out/d1-inside-the-system.mp4 out/d2-the-product.mp4 out/d3-one-take.mp4 >> out/probe-results.txt 2>&1
node scripts/bench-video/probe-motion.mjs out/sigma-film-25s.mp4 out/a0plus-v1-with-score.mp4 \
     out/d1-inside-the-system.mp4 out/d2-the-product.mp4 out/d3-one-take.mp4 >> out/probe-results.txt 2>&1
say "ALL-ARMS-DONE"
