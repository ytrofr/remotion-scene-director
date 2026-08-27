# bench-video - measuring whether a film is any good

Four probes, a Bradley-Terry ranker, and a blind pairwise scoring page. Built for one
question the operator asked in plain words - *"the current screens are too texty"* - and
the answer is that "texty" is measurable and "good" is not.

## The probes

| script            | measures                                   | controls |
| ----------------- | ------------------------------------------ | -------- |
| `probe-frame.mjs` | ink share, spread, evenness                | 7        |
| `probe-motion.mjs`| energy, escalation, holds, dead air        | 6        |
| `probe-bleed.mjs` | anything severed by the frame edge         | 6        |
| `rank.mjs`        | Bradley-Terry + bootstrap CIs + stability  | 4        |

Every one runs `--selftest` or `--negative-control` and refuses to be trusted when a
control misbehaves. That is not ceremony: the controls caught **four defects in these
probes before any of them touched a film**, and two more afterwards - including one
probe measuring entirely the wrong quantity, which review had passed twice.

## What these numbers are NOT

On their first real test, every metric here picked one arm and the operator rejected
all five films. They measure how furnished and how kinetic a frame is. Neither is
*good*. Treat a number here as a prompt to look, never as a verdict - and see
`reports/video-craft-benchmark-2026-08-27.md` for the full account.

`holds` is UNCALIBRATED and says so in its own output. `probe-bleed` cannot tell a
mistake from a camera move and says so too.

## Fixtures

`.claude/skills/video-doctrine/lint-composition.mjs --selftest` needs a composition
that genuinely violates the doctrine as its RED fixture. The one it was written
against is not in this repo, so the selftest exits 1 with `RED fixture missing`. That
is correct behaviour - a gate nobody has watched fail is not evidence - and it is
waiting for a fixture rather than broken.

## Render notes earned the hard way

- `--gl=swiftshader`, not `angle`, for anything stacking blurred depth planes: ANGLE's
  gpu-process OOM-restarts on long renders, and swiftshader measured *faster* anyway
  (100s vs 115s per 60 frames).
- `--concurrency 2` for compositions decoding real video, or they wedge at a pipe
  boundary.
- One render driver at a time. Three alive at once put load average 56 on 12 cores and
  made two healthy arms look wedged.
