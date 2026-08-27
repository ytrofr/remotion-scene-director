---
name: video-doctrine
description: The law for making a film in this repo - what makes a shot cinematic rather than a slide, and a linter that enforces it. Use before authoring any composition, when a render "doesn't feel right", or when reviewing motion work.
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash
---

# Video Doctrine

**The law lives in `doctrine.json`, not in this file.** Eleven clauses, each with a `rule`
(the normative sentence), a `plain` gloss, and a `cost` naming the measured failure that
earned it. `lint-composition.mjs` reads that same file, so the rule and its enforcement
cannot drift apart.

## Run it

```bash
node .claude/skills/video-doctrine/lint-composition.mjs src/compositions/<Name>
node .claude/skills/video-doctrine/lint-composition.mjs --selftest   # must FAIL v1
```

The RED fixture is **real shipped code**: `src/compositions/SigmaFilm` (v1), frozen, which
measured zero on eight craft primitives. The selftest requires the linter to fail it. A
linter nobody has watched fire is not a gate.

## The four that fire on v1, and why they exist

| id  | rule                                    | what it cost us                                                        |
| --- | --------------------------------------- | ---------------------------------------------------------------------- |
| M1  | Never linear                            | v1 declared `EASE` and consumed it **0 times**. 750 frames, all linear |
| M2  | A declared constant that is unused lies | `EASE` and an SVG gradient defined, never referenced. Review passed    |
| L1  | Grain moves or it is dirt               | 900 noise rects memoised with `[]` - one plate on every frame          |
| S1  | More than one plane                     | no camera, no parallax, no blur. Measured spread 0.270 vs 0.58 even    |

## The honest limits, stated

- **M3** (an entrance moves more than opacity) and **S2** (type names, it does not
  introduce) have **no detector**. They are reported as `no-detector`, never silently
  skipped - a doctrine that hides which clauses it cannot check is worse than a shorter one.
- **M1's detector is a proxy**: it counts easing mentions against `interpolate` calls. It
  cannot easily false-pass, but it under-credits code that applies one shared curve
  through a helper. Read a failure as "open this file", not as a score.
- **R1** (the film must build) needs a rendered MP4 and is answered by
  `scripts/bench-video/probe-motion.mjs`, not by source.

Three detectors have already been rewritten after producing a wrong verdict on a known
case - a false pass on L1, a false fail on S1, and a numerator that counted declarations
instead of use sites. Each rewrite is recorded in that clause's own `cost` field.

## The craft, by subject

`references/` — one file per pillar, each written as *technique + what it does + how it
fails*: `camera-language.md` · `depth-and-atmosphere.md` · `motion-physics.md` ·
`editing-rhythm.md` · `showing-systems.md` · `type-as-image.md`.

## Companions

`video-playbook` (the routine that applies this) · `scripts/bench-video/` (measures the
artifact) · `.claude/rules/remotion-patterns.md` rules 53-58 (render-engine fragility) ·
`.claude/rules/visual-bug-render-trace.md` (render and LOOK before theorising)
