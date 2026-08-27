---
name: video-playbook
description: The routine for making a film end to end in this repo - brief, direction, build, verify, score. Phases have pass-gates. Use when starting, reviewing, or shipping any video composition.
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Video Playbook

The routine lives in `routines.json` (house schema: phases, each with a `gate`; steps
typed MACHINE / AGENT / PRINCIPLE). This file is the router.

## The shape, in one screen

```
1 MEASURE THE BRIEF     gate: duration x script arithmetic done, conflict surfaced
2 DECLARE THE DIRECTION gate: one big idea + restraint statement written down FIRST
3 BUILD                 gate: doctrine linter clean
4 LOOK                  gate: range-rendered and actually watched, not stills alone
5 MEASURE THE ARTIFACT  gate: probes run, negative controls fired
6 SCORE                 gate: blind, order-swapped, baseline present
```

## The two that get skipped and cost the most

**Phase 2, the restraint statement.** Before any code: what is the one big idea, and what
will you deliberately NOT do? A direction without a stated restraint converges on the same
shell every time, and "add more effects" is the default failure mode of fixing "it feels
flat". Ask the grid-fallback question: *if this were reduced to a plain centred layout,
what idea would break?* If the answer is "not much", the direction is not ready.

**Phase 4, looking at it.** Stills at mid-segment frames are clean by construction.
Flicker, mount flashes, transition seams and camera judder live *between* waypoints and
are invisible to a still. Range-render (`--frames=A-B`) anything with a camera move.

## Costs already paid, so you don't pay them again

| what happened | the rule it became |
| --- | --- |
| A brief fixed 15s AND supplied a script measuring 302s | Measure the script before accepting the duration (phase 1) |
| 3 of 5 defects in one arm were visible ONLY in the render | Phase 4 is not optional |
| A cutsheet guard emitted `NaN:` while its test matched `nan:` | Every gate needs a mutation that makes it fire |
| Full render broke, scoped render clean, 5 sessions of code edits | Same code + different output ⇒ vary the ENVIRONMENT (rule 57) |
| `scale: 0` eaten by `\|\| 1`, read by the operator as "flickering" | `??` for every numeric default |
| feTurbulence at 1920x1080 cost 1.68 s/frame | Price the grade; grain renders at 1/3 res and scales up |

## Companions

`video-doctrine` (the law + linter) · `framework-selection` (Remotion vs HyperFrames) ·
`scripts/bench-video/` (probes + scoring) · `video-storyboard` (planning artifacts)
