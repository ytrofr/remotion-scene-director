# ffmpeg Concat Failure Modes — 3 Silent Killers

**Scope**: ALL multi-source video assembly (dual-stack, multi-engine renders)
**Authority**: MANDATORY when concatenating MP4s from different encoders
**Evidence**: 2026-04-23 to 2026-04-24 — Dorian hybrid build produced visually-broken output and stale 2x renders before all three were fixed.

---

## 1. Mismatched time_base → visual corruption (silent)

**Symptom**: Concat output plays scenes in wrong order / at wrong timestamps. Duration looks correct. No error messages. Only visible in actual rendered output.

**Cause**: ffmpeg `concat demuxer` (`-f concat -safe 0 -i list.txt`) preserves each input's time_base. Mixing HF MP4s (time_base `1/90000`) with Remotion-encoded slices (time_base `1/15360`) produces non-monotonic packet PTS → decoded frames land on wrong timeline positions.

**Fix**: Use concat FILTER, not demuxer:

```bash
ffmpeg -i intro.mp4 -i middle.mp4 -i outro.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -crf 20 -c:a aac -r 30 out.mp4
```

The filter decodes all inputs, concatenates in a unified filter graph, and re-encodes. Slower but correct.

**Diagnostic**: `ffprobe -show_streams <file>` → compare `time_base` across inputs. If different, switch to concat filter.

## 2. Audio stream presence mismatch → audio dropped silently

**Symptom**: Concat output has no audio. Downstream 2x post-process fails with `Stream specifier ':a' in filtergraph description matches no streams`.

**Cause**: Concat demuxer drops audio if ANY input lacks an audio stream. HF scenes without `<audio>` elements produce video-only MP4s; concatenating them with audio-bearing Remotion clips silently drops audio for the entire output.

**Fix**: Normalize each input — add a silent AAC track if missing, before concat:

```bash
if ! ffprobe "$clip" 2>&1 | grep -q "Stream.*Audio"; then
  ffmpeg -i "$clip" \
    -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=48000" \
    -shortest -c:v copy -c:a aac -b:a 160k "${clip%.mp4}-with-silence.mp4"
fi
```

Concat filter ALSO requires matching stream counts across inputs — the normalization step is mandatory regardless of which concat method you pick.

## 3. Stale upstream artifacts in multi-stage pipelines

**Symptom**: Fix committed + script re-run + bundled output still has the bug.

**Cause**: Assembly scripts that re-slice / post-process existing upstream MP4s don't re-render them. `assemble-dorian-three-way.sh` runs `apply_2x` on `out/dorian-full.mp4` but doesn't trigger `render:dorian-full`. If upstream is from before the code fix, downstream inherits the bug.

**Fix**: Pipeline-stage freshness check. Before running a downstream stage, verify upstream was rebuilt after the last relevant code change:

```bash
# Before apply_2x:
upstream_ts=$(stat -c %Y "$UPSTREAM")
code_ts=$(git log -1 --format=%ct -- "$RELATED_CODE_PATHS")
if [ "$upstream_ts" -lt "$code_ts" ]; then
  echo "WARNING: $UPSTREAM is older than related code. Re-render first."
  exit 1
fi
```

Or simpler: delete `out/dorian-full.mp4` before assembly and let the guard fail loud.

## 4. Per-stage CRF ≠ final quality when a downstream step re-encodes

**Symptom**: Unifying CRF across all pre-concat inputs produces no visible quality delta. Bitrate differs by <1%, SSIM >0.99.

**Cause**: If a downstream step re-encodes everything at CRF N (e.g. `apply_2x` at CRF 20), the output quality is bounded by **that step's CRF**, not by upstream per-input CRF. The re-encode acts as a codec equalizer — upstream CRF differences vanish.

**Implication**: When one concat input "looks lower quality" than another at the same final CRF, the difference is **content complexity** (simpler scenes compress smaller at the same perceptual target), not encoder settings.

**Fix**: Don't chase per-input CRF uniformity if a downstream re-encode exists. Either:

- Accept content-driven size variance (normal)
- Raise the FINAL CRF setting (CRF 20 → CRF 18) if the whole bundle looks too compressed
- Investigate content: maybe the "lower quality" input actually has fewer visible details, not worse encoding

**Evidence**: 2026-04-24 — added `--crf 20` to hyperframes per-scene render to match Remotion slice CRF 20. SSIM of HF 2x before/after: 0.9922. Bitrate delta: -1% (within encoding noise). The change is cosmetically cleaner but produces zero visible improvement because `apply_2x` already normalizes at CRF 20.

---

## Companion Rules

- `.claude/rules/dorian-dual-stack.md` — HF vs Remotion scene split + 2x post-process convention
- `.claude/rules/hyperframes-patterns.md` — HF authoring (`.clip` layout, GSAP/CSS conflicts)
- `.claude/rules/remotion-patterns.md` rule 54 — Studio ≠ render; verification funnel

---

**Last Updated**: 2026-04-24
