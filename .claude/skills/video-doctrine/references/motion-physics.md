# Motion Physics

Motion reads as expensive when it implies mass, intention and consequence. It reads as
cheap when every property starts and stops together on one generic curve.

## Never linear (doctrine M1)

Every `interpolate` carries a curve; every entrance prefers a spring. Linear is for a
clock or a scanline and nothing else.

**This is the single measured cause of v1 feeling wrong.** It declared
`EASE = [0.22, 0.61, 0.36, 1]` at `timing.ts:62` and consumed it **zero times**, so all
750 frames ran linear. The operator's report was "it doesnt get the feeling right" — not
"the easing is wrong", because the defect is invisible as a defect and only legible as a
feeling.

## Anticipation

A small preparatory move against the main direction: a word compresses 3% before
expanding, a camera pulls back before pushing in, a dot moves backward before launching.
2-6 frames at 24-30fps. It tells the eye where to look.

## Overshoot

Travel slightly past the destination and settle. 2-8% of the travel distance. Heavier
object → slower, smaller return. For logos, product surfaces, camera framing, large type.

**A film may forbid it.** Both LimorFilm and SigmaFilm state "nothing overshoots" in their
token files as a deliberate register choice. That is a valid restraint — what is not valid
is having no position on it.

## Follow-through and overlapping action

The main object stops; secondary parts continue. A line reaches a node and its glow keeps
expanding. A word lands and its shadow settles late. A camera stops and foreground
particles drift on.

**Never end position, rotation, opacity, blur and scale on the same frame.** Offset by
2-10 frames. Simultaneous stops are the mechanical tell.

## Weight through timing

- light particle — quick acceleration, loose drift
- data packet — sharp launch, controlled stop
- glass panel — fast move, subtle elastic settle
- dense form — slow start, momentum, heavy deceleration
- light beam — near-instant travel, soft decay

One 700ms ease on everything means the scene has no material world.

## Curves

- cubic ease-out — reveals
- cubic ease-in-out — camera and elegant transitions
- quintic ease-in-out — large cinematic camera moves
- back ease-out — restrained overshoot on type and marks
- elastic — sparingly; reads playful, rarely premium

Our house curve is `cubic-bezier(0.16, 1, 0.3, 1)` (`CINE` in `src/lib/camera.ts`): short
anticipation, strong acceleration, long deceleration. Exits use a faster curve — things
leave decisively.

## The zero trap

`scale: 0` and `opacity: 0` are meaningful values and both are falsy. `point.scale || 1`
turns an invisible element back on. Use `??`. Doctrine D2; it cost three sessions once,
reported by the operator as "flickering" because the hidden cursor was visibly sliding.
