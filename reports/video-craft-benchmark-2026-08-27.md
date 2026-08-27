# Video craft benchmark - 2026-08-27

## The headline

**Every automatic metric picked D2. The operator rejected all five films.**

That is the result, not a failure of the run. It says the metrics measure how
furnished and how kinetic a frame is, and those are real properties that v1 genuinely
lacked - but neither of them is *good*. A metric is only trustworthy where it has
agreed with the eye at least once, and this set has now disagreed on its first real
test.

| arm            | ink   | spread | energy | escalation | dead air | edge cuts |
| -------------- | ----- | ------ | ------ | ---------- | -------- | --------- |
| v1 (frozen)    | 3.9%  | 0.270  | 0.0004 | 0.62       | 2        | 0         |
| A0+ (v1+score) | 3.9%  | 0.270  | 0.0004 | 0.64       | 2        | 0         |
| D1 inside      | 8.9%  | 0.309  | 0.0010 | 0.59       | 0        | 0         |
| D2 product     | 29.8% | 0.422  | 0.0025 | 0.73       | 0        | 0         |
| D3 one-take    | 1.9%  | 0.258  | 0.0019 | 0.68       | 1        | 2 by pan  |

## What the run did establish

**The A0+ control worked.** v1-plus-score measured identical to v1 on every visual
dimension, which is exactly what it should do. Had a direction beaten v1 by only as
much as A0+ did, the credit would have belonged to the music. None did, so the craft
differences are real differences - the operator simply does not want them.

**No arm builds.** The best of five reaches escalation 0.73 where 1.0 is level. Every
direction shares one cut sheet, so this is the *story shape*, not any direction's
fault. It is the strongest lead for a next attempt, and the only lead the metrics and
the rejection agree on.

**The instruments found four defects, three of them in themselves.**

| defect                                                      | found by                         |
| ----------------------------------------------------------- | -------------------------------- |
| D1 ran the cost line off the right edge                     | a hand luminance read, then the new probe |
| R1 "the film must build" was armed with no caller           | wiring it to an mp4              |
| the bleed probe's gradient control was non-deterministic    | running the control twice        |
| the bleed probe measured the wrong quantity entirely        | pinning that control             |

The last two are the point of controls. Max-minus-median scored a smooth ramp at 116
and a real severed glyph at 255 - overlapping ranges. Switching to the largest
adjacent-pixel jump moved the margin to 2 versus 255.

**The render environment cost more than the compositions did.** ANGLE's gpu-process
OOM-restarted under stacked blur planes; swiftshader is both immune and faster (100s vs
115s per 60 frames). Three separate drivers ended up alive at once and put load average
56 on 12 cores, which is what made two arms look wedged. D2 needed concurrency 2.

## What is NOT established

- Whether any direction is good. The operator says no, and that overrules the table.
- Whether escalation predicts anything an audience feels. It has never been validated
  against a human judgement, including this one.
- `holds` remains UNCALIBRATED and says so in its own output.
- The bleed probe cannot tell a mistake from a camera move, and says so in its output.
- Lazy Frames measured escalation 2.97, far outside every other arm. Unexplained -
  engine or that arm's cut, nobody has separated them.

## Ledger

Seven rows added to the Stack Ledger under a new `remotion` radar project (there was
none, which is why no engine decision from this repo had ever been recorded). None are
closed: closing requires an operator-eyeballed before/after pair, and the films were
rejected.
