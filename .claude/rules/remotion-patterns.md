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

28. **Saved session is sacred**: NEVER auto-modify, overwrite, or "sync" user-saved
    SceneDirector data (waypoints, layers, gestures) on load. The Save button is
    the single source of truth. `useRestoredInitialState` must restore saved data
    exactly as-is. `codedPaths.data.json` is only a default for scenes with NO
    saved data (via `ENSURE_SCENE_LAYERS`). Any code that mutates saved state on
    load is a bug.

29. **Gallery is single source of truth for pickers**: All hand animations, pointers,
    and click effects are defined in `galleryData.ts` with a `pickerSlot` field.
    `galleryActive.ts` derives picker lists using `getBySlot()`. Never add hardcoded
    animation arrays to `gestures.ts` — add a gallery entry with the correct
    `pickerSlot` instead. Gallery activation (star buttons) controls what appears
    in Inspector and Toolbar pickers.

30. **Gallery renders as overlay, never unmounts editor**: `GalleryView` renders
    alongside the editor with `display: none` on the editor div. Never use
    conditional returns that unmount the editor tree — it destroys Player refs,
    event listeners (frameupdate, wheel zoom), and component state.

31. **Noise over Math.random()**: For animated backgrounds, particle effects,
    or any per-frame variation, use `noise2D/3D('seed', x, y)` from
    `@remotion/noise`. Returns deterministic values in [-1, 1]. Use the z
    parameter of `noise3D` for time/frame animation. Never use `Math.random()`
    (rule 26 still applies — this extends it with the preferred alternative).

32. **SFX from local staticFile**: Sound effects live in `public/audio/sfx/`.
    Always use `staticFile('audio/sfx/whoosh.wav')`, never CDN URLs like
    `https://remotion.media/...`. Local files are faster, work offline, and
    don't break if the CDN changes. Available: whoosh, whip, page-turn,
    switch, mouse-click, shutter-modern, shutter-old.

33. **Voiceover files to public/voiceover/**: ElevenLabs TTS output goes in
    `public/voiceover/{scene-name}.mp3`. Use `getAudioDurationInSeconds()`
    from `@remotion/media-utils` + `calculateMetadata` to set composition
    duration from audio length. Never hardcode voiceover durations.

34. **Shared spring configs**: Import `SPRING_CONFIG` from `src/lib/springs.ts`.
    DorianDemo re-exports as `SHARED_SPRING_CONFIG` for new code. Never define
    inline spring configs like `{ damping: 18, mass: 1, stiffness: 80 }` — use
    a named preset from `springs.ts` or add one if none fits.

35. **Named easing only**: Use `applyNamedEasing(t, name)` from `src/lib/easings.ts`.
    Available: linear, ease-in, ease-out, ease-in-out, spring, bounce, elastic.
    Never inline easing math in scene or layer files.

36. **Pointer via animation prop**: Pass any pointer gallery ID (e.g.,
    `"cursor-real-black"`) as the `animation` prop to FloatingHand. No special
    component needed — FloatingHand renders any Lottie file. Use
    `isPointerAnimation()` from `src/lib/pointers.ts` to detect pointer cursors.

37. **Cursor autoRotate**: Enable `physics.autoRotate: true` for pointer cursors.
    This uses `atan2` direction-based rotation instead of velocity tilt. Set
    `rotationOffset: -45` for standard arrow cursors so the tip follows the
    movement arc. Hand gestures should NOT use autoRotate (velocity tilt is better
    for organic hand movement).

38. **BackgroundMusic volume**: Music at `volume: 0.15`. SFX at `0.5-0.8`.
    Voiceover at `0.85`. Always add `fadeInFrames`/`fadeOutFrames`. Use
    `MIXING_LEVELS` from `src/lib/audioEnvelope.ts` for standard values.
    Use `duckTriggers` to reduce music during voiceover sections.

39. **Volume envelope on audio layers**: Set `fadeInFrames`/`fadeOutFrames` on
    `AudioLayerData` for smooth volume ramps. `AudioLayerRenderer` automatically
    uses `computeVolumeAtFrame()` when fade fields are present. Flat volume is
    preserved when no fade fields are set (backward compatible).

40. **Crossfade between scenes**: Use `crossfadeTiming()` from
    `src/components/CrossfadeTransition.tsx` with TransitionSeries. Use presets:
    `CROSSFADE.quick` (10f), `CROSSFADE.standard` (20f), `CROSSFADE.slow` (45f).
    For Sequence-based layouts, use `SequenceCrossfade` wrapper instead.

41. **CaptionOverlay for subtitles**: Use `CaptionOverlay` from
    `src/components/CaptionOverlay.tsx`. Pass SRT content as string. Supports
    `full-sentence` and `word-highlight` styles. Position: top/center/bottom.
    Source `.srt` files from `public/captions/` directory.

42. **Hand coordinates are composition-space, zoom-aware**: FloatingHand
    renders OUTSIDE zoom wrappers. Coordinates must be in composition space
    (1080x1920). Use formula: `compX = 540 + S*(phoneFrameX - 207)`,
    `compY = 960 + offsetY + S*(phoneFrameY - 434)`. Phone frame center
    = (207, 434), composition center = (540, 960). Calculate coordinates
    for each interaction point at the zoom level active at that frame.

43. **`dark={false}` for dark cursor**: The `dark` prop is INVERTED.
    `dark={true}` applies CSS `invert(1)` = WHITE cursor. Always use
    `dark: false` in codedPaths.ts and scene files for a dark/black cursor.

44. **secondaryLayers in codedPaths.ts**: Multi-phase interactions need
    `secondaryLayers` in `codedPaths.ts`. `ENSURE_SCENE_LAYERS` creates
    both primary and secondary hand layers in SceneDirector. Each secondary
    layer appears as its own editable hand block in the timeline. Without
    `secondaryLayers`, only the primary hand appears — later clicks are
    invisible in SceneDirector.

45. **Three data override layers for hand paths**: Priority order:
    (1) `localStorage['scene-director-session']` (browser cache, highest)
    (2) `codedPaths.data.json` (saved via SceneDirector Save button)
    (3) `codedPaths.ts` (hardcoded TypeScript, lowest priority).
    When debugging missing/wrong gestures, clear localStorage first, then
    check JSON, then check .ts. `mergePaths()` spreads saved JSON OVER
    hardcoded — saved data wins at the property level.

46. **Gesture spec before code**: Before writing ANY entry in `codedPaths.ts`
    or `CODED_AUDIO_REGISTRY`, fill out the Gesture Spec Template and present
    it to the user for approval. The spec MUST include for each interaction:
    (1) action type (click/scroll/drag/swipe/point), (2) target element with
    comp-space coordinates from `docs/coordinate-map.md`, (3) local frame
    number, (4) audio SFX file + frame + volume. MUST include audio for every
    click (mouse-click/soft-click/send-click). Last waypoint MUST be the final
    meaningful gesture — never add a trailing `pointer` waypoint after the last
    click. Always add BOTH codedPaths AND audio entries together. Run
    `npm run validate:hands` after writing code. Template:
    ```
    ## Gesture Spec: [Composition] / [Scene]
    Dimensions: [1080x1920 | 1920x1080]  Scene frames: [start]-[end]
    ### Interactions:
    1. ACTION: [type]  TARGET: [element] ([x], [y])  FRAME: [N]  AUDIO: [file] @[N] vol=[V]
    ### Secondary layers needed: [yes/no]
    ### Exit: [hand disappears at last click | exits frame]
    ```
