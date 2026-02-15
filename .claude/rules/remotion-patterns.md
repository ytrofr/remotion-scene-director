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

7. **codedPaths key must match scene name**: `getSavedPath()` / `getCodedPath()` keys
   must exactly match the scene name used in the COMPOSITIONS registry in `state.ts`.
   Mismatch causes "phantom" waypoints that reappear after deletion or edits that revert.

8. **Never reset waypoints in SELECT_SCENE**: The SELECT_SCENE reducer must only change
   `selectedScene`, `selectedWaypoint`, `draggingIndex`. Never include `waypoints: {}`
   — it destroys all waypoints across all scenes.

9. **dark prop is inverted**: FloatingHand `dark={true}` applies `filter: invert(1)`,
   making the hand LIGHT-colored on screen. UI labels must be swapped: "Light" button
   dispatches `dark: true`, "Dark" button dispatches `dark: false`.

10. **FPS-relative frame numbers**: All new interpolate() calls MUST use
    `f(frame30, fps)` from timing.ts. Hardcoded frame numbers break
    multi-fps rendering. Only exception: spring() delay offsets < 5 frames.

11. **Named spring presets only**: Never inline spring configs like
    `{ damping: 18, mass: 1, stiffness: 80 }`. Always use SPRING_CONFIG
    from constants.ts. Add a new named preset if none fits.

12. **DorianPhone shared components**: For new Dorian scenes, use shared
    components from `components/DorianPhone/` (StatusBar, DynamicIsland,
    DorianNavHeader, AIBubble, ChatHeader, AnimatedText, FingerTap, DorianLogo).
    Never duplicate these UI elements inline.

13. **Single AIBubble source**: Import AIBubble from
    `components/DorianPhone/AIBubble`. Never define inline. Two definitions
    existed before (DorianDemo.tsx + DorianPhoneMockup.tsx) causing drift.

14. **Scene file size limit**: Each scene file must be < 250 lines.
    If a scene grows beyond this, extract sub-components or shared utilities.

15. **Hand physics presets**: Use HAND_PHYSICS from constants.ts (scroll,
    tap, trail). Never inline physics objects in scene files.

16. **Render before commit**: After any scene change, verify in Remotion
    Studio (scrub all affected scenes) before committing. Broken renders
    are hard to debug after multiple commits.

17. **Asset protection**: Files in public/dorian/woodmart/ are real
    screenshots that CANNOT be recaptured (Cloudflare blocks automation).
    Never delete, rename, or overwrite without user confirmation.

18. **2x speed via ffmpeg blend**: Use `npm run postrender:2x` (ffmpeg
    minterpolate blend + setpts). Never change composition fps as a
    speed hack — it breaks spring timing.
