# Depth and Atmosphere

A dark background with dots is flat when every element shares one sharpness, scale,
contrast and speed. That was v1: measured spatial spread 0.270, against 0.58 for a frame
used evenly, and against 0.151 for a synthetic "caption on an empty screen" fixture.

## Five planes

- **far background** — slow gradients, low-contrast noise
- **atmospheric middle** — haze, soft particles, light fields
- **structural middle** — grids, routes, diagrams
- **hero** — the product form, the central mark
- **foreground** — blurred particles, cropped shapes, lens artifacts

Each differs in speed, scale, blur, contrast, opacity and camera response.
**Rule of thumb: the closer the layer, the more it moves, blurs, crops and occludes.**

## Depth of field

Do not blur the frame. Blur *layers*, by their distance from the focal plane:
`blur = |layerDepth - focusDepth| * maxBlur`, which is `depthBlur()` in `src/lib/camera.ts`.

Rough budget: background 2-6px · midground 0.5-2px · hero sharp · foreground 4-12px.

**Animate the focus.** A background that starts sharp and falls away as a foreground word
resolves builds hierarchy without a title card.

## Atmospheric perspective

Distant elements: lower contrast, lower saturation, less detail, more haze, slower
movement. Without it, planes read as flat cards sliding past each other rather than as
distance. `atmosphere()` returns the opacity/saturation pair.

## Volumetric glow

A single blurred duplicate is a preset and looks like one. Real light has a hot core, a
wide low-opacity spill, and a decay — three components minimum. Our `Bloom` renders core
+ spill; the decay comes from the plane's own haze.

When a node activates, do not switch a glow on. Let the light **bloom → spill into the
haze → trigger neighbours → travel the paths → fade**. That sequence is the light
participating in the process rather than decorating it.

## Grain, vignette, chromatic aberration

- **Grain must MOVE.** A memoised plate is a dirty lens. Doctrine clause L1; v1 painted
  the same 900 rects on all 750 frames.
- **Vignette** is a staging tool, not an effect. Broad and soft, stronger where there is
  no content. Never a symmetrical black oval.
- **Chromatic aberration** only at optical stress — a whip, an impact, a hard
  acceleration. 1-4 frames. Constant aberration is a filter; brief aberration is a lens
  being pushed.

## The cost, measured

Depth is not free. Three full-screen CSS blur planes cost **1.68 s/frame** at 1920x1080 —
21 minutes for a 25-second film. Moving the grain to 1/3 resolution bought 3%, which
proved the grain was never the cost. Rasterising the *blurred planes* at half resolution
and dropping any blur under 0.6px is where the win actually was. Price the grade as you
add it.
