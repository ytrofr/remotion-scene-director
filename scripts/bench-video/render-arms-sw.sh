#!/usr/bin/env bash
# Second attempt at the arm queue, after --gl=angle crash-looped on D1.
#
# WHY swiftshader: ANGLE's gpu-process grew ~1 GB / 10 s, was OOM-killed, restarted,
# and pre-encode.mp4 did not advance a single byte across a 20 s window. That is the
# render-context-dependent class in remotion-patterns rule 56/57 — the code is fine,
# the environment is not — so the variable changed here is the RASTERISER, not a line
# of the compositions. D1/D2/D3 all stack blurred depth planes + per-frame
# feTurbulence, which is exactly the load rule 56 says ANGLE degrades under.
#
# A stall watchdog is included because "slow" and "wedged" looked identical for ~9
# minutes on the first attempt, and only sampling the pre-encode size told them apart.
set -uo pipefail
cd "$(dirname "$0")/../.."
LOG=out/render-log-sw.txt
: > "$LOG"
say() { echo "$*" | tee -a "$LOG"; }

# Kills a render whose pre-encode file has not grown for STALL_S seconds.
watchdog() {  # child_pid label
  local pid=$1 label=$2 last=-1 same=0 sz d
  while kill -0 "$pid" 2>/dev/null; do
    sleep 30
    d=$(ls -dt /tmp/react-motion-render* 2>/dev/null | head -1)
    # Progress has TWO phases and pre-encode.mp4 only exists in the second. During the
    # first, Remotion writes element-NNN.jpeg one per frame. Watching only the mp4 made
    # this watchdog read a healthy render as frozen-at-zero and it would have killed D3
    # at frame 433 of 750. Count BOTH: bytes once encoding starts, files before that.
    sz=$(( $(stat -c %s "$d/pre-encode.mp4" 2>/dev/null || echo 0) + $(ls "$d" 2>/dev/null | wc -l) ))
    if [ "$sz" = "$last" ]; then
      same=$((same + 1))
      if [ "$same" -ge 8 ]; then   # 4 min of zero progress
        say "STALL  $label  pre-encode frozen at ${sz}b for 240s - killing"
        # Kill the PROCESS GROUP. `kill $pid` hits the npx wrapper only; the node
        # child survives, reparents to init, and the queue starts the next arm on
        # top of it. Measured 2026-08-26: D2's orphan ran 5 more minutes alongside
        # D3, load average 56 on 12 cores.
        kill -- -"$(ps -o pgid= "$pid" | tr -d ' ')" 2>/dev/null || kill "$pid" 2>/dev/null
        return
      fi
    else same=0; fi
    last=$sz
  done
}

run() {  # composition outfile label [extra flags...]
  local comp=$1 out=$2 label=$3; shift 3
  local t0=$(date +%s)
  npx remotion render src/index.ts "$comp" "$out" \
    --gl=swiftshader --codec h264 --crf 18 --concurrency "${CONC:-4}" --log=error \
    "$@" >/dev/null 2>&1 &
  local pid=$!
  watchdog "$pid" "$label" &
  local wd=$!
  wait "$pid"; local rc=$?
  kill "$wd" 2>/dev/null
  say "$label  $(( $(date +%s) - t0 ))s  exit=$rc  $(stat -c %s "$out" 2>/dev/null || echo 0)b"
  return $rc
}

# Gate: prove swiftshader survives 60 frames of D1 before spending an hour on it.
run SigmaFilmD1 out/.sw-probe.mp4 "PROBE  D1 swiftshader" --frames=180-239
if [ ! -s out/.sw-probe.mp4 ]; then
  say "ABORT  swiftshader probe produced no file - both rasterisers now failing, escalate"
  exit 1
fi

run SigmaFilmD1     out/d1-inside-the-system.mp4    "FULL   D1 inside-the-system"
run SigmaFilmD2     out/d2-the-product.mp4          "FULL   D2 the-product"
run SigmaFilmD3     out/d3-one-take.mp4             "FULL   D3 one-take"
run SigmaFilmA0Plus out/a0plus-v1-with-score.mp4    "FULL   A0+ v1-with-score"
say "DONE"
