# Camera Language in 2D

The camera is the protagonist. Moving every element independently creates activity;
moving the camera creates a shot. v1 had no camera at all, which is why it reads as a
deck: a deck is exactly a sequence of elements changing on a fixed plane.

## Push-in

Scale the WHOLE world up while translating toward the focal point. Slow start, strong
middle, soft settle.

Scaling the hero alone reads as a UI zoom, not cinematography — the giveaway is that
nothing else in frame reacts. Our implementation is `pushIn()` in `src/lib/camera.ts`,
which takes a `toward` point precisely so the translation cannot be forgotten.

Says: discovery, commitment, this matters.

## Dolly vs zoom

A zoom changes magnification. A dolly moves through space, and only parallax tells them
apart — layers at different depths must move by different amounts.

- zoom → graphic, editorial, diagrammatic
- dolly → immersion, spatial discovery
- dolly + slight perspective → the expensive one

## Continuous camera

One move carrying several visual states without a cut: through a particle field, into a
route forming, into a product surface, into the mark. It reads as *one system becoming
another*, which is precisely the SIGMA argument, and it is what D3 is built on.

Never reset the camera between scenes. The next scene already exists outside the frame.

**The cost, stated:** a continuous take cannot fix pacing in the edit. Rhythm has to live
in the LAYOUT — how far apart things are — because camera speed is the only other lever.

## Whip pan

Fast directional move used as a transition. Directional blur, smeared horizontals, and
the incoming scene begins BEFORE the camera settles. 2-5 frames of smear, not a crisp
sweep. Outgoing and incoming should share a direction.

## Match cut

Two moments joined by a shared property: circle → node, line → bar, bright point → logo
dot, ring → aperture, expanding mask → surface.

Preserve at least two of position / scale / direction / rotation / luminance / motion
blur. Matching *shape* alone is basic; matching *movement* is the cinematic version.

## When to cut at all

Cut when the visual language changes: macro→wide, chaos→order, dark→bright,
abstract→concrete. A cut with a reason reads as authored. A cut between unrelated
compositions reads as a slideshow — which is the whole failure this doctrine exists for.
