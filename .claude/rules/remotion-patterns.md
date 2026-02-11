# Remotion Patterns - Enforced Rules

1. **Audio inside scenes**: Audio <Sequence> MUST go inside scene components
   using local frame numbers. Never place Audio as sibling to TransitionSeries.

2. **Zoom offset reset**: Every zoom-out must animate ALL offsets (X, Y, scale)
   back to 0. Never leave stale pan offsets after zoom-out.

3. **Hand scale uniformity**: All HandPathPoint.scale = 1 unless intentionally varied.
   Mixed scales cause jarring size changes.

4. **Coordinate method**: Always use getBoundingClientRect() for debug tools.
   Never use offsetX/offsetY.

5. **Visual communication**: For hand animations, use SceneDirector export.
   Draw paths visually, don't describe in text.

6. **Webpack cache stale errors**: When you see "ENOENT: no such file or directory"
   for a module that actually exists on disk (e.g. lottie-web), clear the webpack
   cache: `rm -rf node_modules/.cache` then restart dev server. Do NOT reinstall
   packages - the file is there, the cache is stale.
