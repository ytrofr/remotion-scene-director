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

18. **2x speed via setpts ONLY — no minterpolate blend**: Use `npm run postrender:2x`
    (plain `setpts=0.5*PTS`). NEVER use `minterpolate=mi_mode=blend` — it creates
    ghost frames at every scene boundary by pixel-averaging adjacent frames, producing
    overlapping hands, double titles, and blurry artifacts. Never change composition
    fps as a speed hack either — it breaks spring timing.

18b. **Debug rendering artifacts by isolating scenes first**: When the full video
has visual artifacts but it's unclear where they come from, render each hand-gesture
scene individually with `--frames=START-END`. If individual scenes look clean,
the bug is in post-processing (ffmpeg filters, encoding) or at scene boundaries —
NOT in the component rendering. This avoids hours of debugging the wrong layer.

19. **Centralized font loading**: Import `fontFamily` from `src/lib/fonts.ts`.
    Never call `loadFont()` directly in scene or component files. The shared
    module loads Rubik with only needed weights (400-800) and latin subset,
    avoiding 84+ redundant network requests per render tab.

20. **Static components use React.memo**: DorianPhone components (StatusBar,
    DynamicIsland, DorianNavHeader, DorianLogo) are wrapped in React.memo.
    Any new purely-props-driven component that renders every frame should
    also be wrapped.

21. **Multi-hand-layer architecture**: Each click/draw in SceneDirector edit mode
    creates a NEW independent hand layer via `ADD_HAND_GESTURE`. Never use
    `ADD_WAYPOINT` or `SET_WAYPOINTS` in edit mode — those modify the primary layer.
    Secondary layers store waypoints ONLY in `layer.data.waypoints`, never in
    `state.waypoints[scene]`. Primary = index 0 (synced by syncHandLayer).

22. **Secondary hand layer routing**: `UPDATE_WAYPOINT` and `DELETE_WAYPOINT`
    check `state.selectedLayerId` to decide whether to route to primary (flat
    state.waypoints) or secondary (layer.data.waypoints). Always dispatch
    `SELECT_LAYER` before any waypoint mutation on a secondary layer.

23. **REMOVE_LAYER clears flat waypoints for primary only**: When removing a
    hand layer, only clear `state.waypoints[scene]` if removing the FIRST hand
    layer (primary). Secondary layers carry their own waypoints — removing them
    needs no flat state cleanup.

24. **Undo/redo future stack**: undoableReducer has `past`, `present`, `future`.
    Any new undoable action MUST clear `future: []`. ADD_HAND_GESTURE is
    undoable. Non-undoable actions (SELECT_SCENE, SELECT_WAYPOINT, UI toggles)
    preserve the future stack so redo still works after navigation.

25. **Zoom-to-cursor via refs**: Wheel zoom handler reads current zoom/pan via
    refs (not stale closure state). New pan = `mouseRel - (mouseRel - oldPan) / oldZoom * newZoom`
    where mouseRel is mouse distance from player-area center. Always update
    zoom and pan atomically in same event handler.

26. **Determinism**: NEVER use `Math.random()` — causes different renders on
    each frame. Use `random('seed')` from Remotion for seeded randomness.
    ALWAYS use `staticFile()` for assets in `/public` — never construct paths
    manually.

27. **Shared debug library**: Import debug components from `src/components/debug/`
    (DebugCrosshair, DebugClickMarkers, DebugSceneOverlay, DebugPathVisualization,
    DebugSceneTimeline) and the `useDebugCoordinates` hook. Never re-implement
    coordinate conversion, crosshair lines, click-marker panels, or scene-info
    overlays inline in composition files. See `docs/debug-tools.md` for the API.
