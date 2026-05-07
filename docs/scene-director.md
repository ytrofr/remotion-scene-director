# SceneDirector Editor

On-demand reference for the interactive hand-path editor (port 3001).
See also: `CLAUDE.md` for project overview, `.claude/rules/remotion-patterns.md` rules 7-8, 21-25 for enforcement rules.

---

## SceneDirector Editor ★

Interactive hand-path editor (port 3001) with timeline, waypoint markers, and layer system.

### Architecture

```
src/compositions/SceneDirector/
├── App.tsx                     # Root: player + overlays + context provider
├── state.ts                    # directorReducer + all action types
├── undoReducer.ts              # Undo/redo wrapper (past/present/future stacks)
├── context.tsx                 # DirectorContextValue interface + useDirector()
├── gestures.ts                 # GESTURE_PRESETS (click/scroll/drag/swipe/point) — NO hardcoded arrays
├── layers.ts                   # Layer types: HandLayer, AudioLayer, ZoomLayer
├── codedPaths.ts               # getCodedPath() — source-of-truth paths per scene
├── compositions.ts             # COMPOSITIONS registry + COMPOSITION_COMPONENTS
├── panels/
│   ├── LeftRail.tsx            # Vertical 72px tool surface (gestures, Select, Undo, cursor size)
│   ├── Toolbar.tsx             # Slim top bar: composition · version · feedback/trail · render · save cluster · ⋯ More
│   ├── VersionBar.tsx          # Sub-version dropdown + lock badge (in Toolbar) — see "Version Dropdown Contract" below
│   ├── MoreMenu.tsx            # ⋯ overflow menu: Reload / Undo Reload / Export / Gallery / Freeze
│   ├── ToolbarDemos.tsx        # Standalone design-decision page at ?view=toolbar-demos
│   ├── icons.tsx               # Inline SVG icon set (currentColor stroke)
│   ├── SceneList.tsx           # Left: scene list + layer stack per scene
│   ├── Inspector.tsx           # Right: waypoint/layer editor tabs
│   ├── Timeline.tsx            # Bottom: multi-row timeline (scenes/hand/audio)
│   ├── GalleryView.tsx         # Animation gallery (overlays editor, doesn't unmount it)
│   ├── galleryData.ts          # SINGLE SOURCE OF TRUTH: all animations + pickerSlot tags
│   └── PointerShapeCard.tsx    # Pointer variant cards with star/activate buttons
├── overlays/
│   ├── DrawingCanvas.tsx       # Click/drag interaction layer (zIndex 10)
│   ├── FloatingHandOverlay.tsx # Renders ALL visible hand layers (zIndex 11)
│   ├── WaypointMarkers.tsx     # Draggable dots for selected hand layer
│   ├── HandCursorPreview.tsx   # Lottie cursor preview while hovering
│   └── Crosshairs.tsx          # Precision crosshair for waypoint placement
└── hooks/
    ├── useKeyboardShortcuts.ts # 1-5 gesture keys, Ctrl+Z/Y, space, arrows
    ├── usePlayerControls.ts    # Zoom-to-cursor + Alt-drag pan
    ├── useSessionPersistence.ts# localStorage save/restore
    ├── useToComp.ts            # Screen → composition coordinate mapping
    ├── useGallerySelection.ts  # Gallery active set + localStorage persistence
    └── galleryActive.ts        # Derives picker lists from galleryData pickerSlot
```

### Toolbar Layout (Layout C — Left Rail + Slim Top, since 2026-04-26)

CSS grid in `styles/base.css` adds a `rail` column on the left:

```
grid-template-columns: 72px 210px 1fr 250px;
grid-template-areas:
  "rail toolbar  toolbar   toolbar"
  "rail scenes   player    inspector"
  "rail timeline timeline  timeline";
```

**LeftRail** (72px, full height, Figma-style):

- 5 gesture buttons (Click/Scroll/Drag/Swipe/Point) — keys 1-5
- divider → Select (S) + Undo (Ctrl+Z)
- divider → cursor size slider (only when a non-Select tool is active)
- Click an active gesture again → variant flyout pops to the **right** of the rail (Hand Style / Pointer / Light-Dark / Click Effect)

**Top Toolbar** (slim) carries:

- SD logo · Composition select · `<VersionBar>` · spacer
- Feedback (F) · Trail (T)
- Render mode select + Render button (only when composition supports dual-stack — i.e. DorianFull)
- **Save cluster**: Save (Ctrl+S) · Save as Version · Revert · ⋯ More

**Save cluster mechanics**:

- **Save** writes current scene to disk + marks snapshot
- **Save as Version** = Save + auto-bump (V1.0X → V1.0X+1). Backend `/api/versions/bump` clones the .tsx file, auto-seeds `codedPaths.data.json`, AND auto-wires all 5 registries (Root.tsx, compositions.ts COMPOSITIONS array + component-map, codedPaths.ts, layers.ts, package.json render scripts). Popover shows ✓/✗ per registry — anything ✗ is a manual fallback. Helpers live at the top of `vite.config.ts` (`wireRootTsx`, `wireCompositionsTs`, `wireCodedPathsTs`, `wireLayersTs`, `wirePackageJson`). See `.claude/rules/version-safe-iteration.md` for the procedure.
- **Revert** restores last saved snapshot (only shown when a snapshot exists)
- **⋯ More** popover holds: Reload from disk · Undo Reload · Export code · Gallery · Freeze

**Cross-component triggers**: SaveCluster fires `window.dispatchEvent(new CustomEvent('sd-bump-version'))` after Save → VersionBar listens via window event and runs its existing onBump (popover renders anchored to VersionBar). Same pattern: MoreMenu's Freeze fires `sd-freeze-version`. Avoids state-lifting refactor.

**Design-decision pattern**: visit `?view=toolbar-demos` to see the 4 mock layouts side-by-side using real CSS. Resize the window to test responsiveness. Layout C was picked here on 2026-04-26.

### Version Dropdown Contract — TWO dropdowns, never three

**Source of truth**: `Toolbar.tsx` (composition picker) + `VersionBar.tsx` (sub-version picker). Both are required. Adding a third is a regression — the family dropdown was deleted on 2026-05-04 because it duplicated information already encoded in the other two.

| Dropdown        | File             | Source                                                                  | What it shows                                                         | What clicking does                                                                              |
| --------------- | ---------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Main video**  | `Toolbar.tsx`    | `COMPOSITIONS` filtered by `!VERSION_RE.test(c.id)` (base ids only)     | One row per family, base label only (e.g. "Dorian Full")              | Same family → no-op; different family → jumps to family's LATEST version (`familyLatestOrBase`) |
| **Sub-version** | `VersionBar.tsx` | `detectFamilies()` walking `COMPOSITIONS` for `^.+V\d+-\d+$` ids + base | V1.00 → V1.0N for the current family; hidden when comp is unversioned | Sets `compositionId` to the chosen version                                                      |

**Invariants**:

- Main dropdown's `value` is `baseOf(state.compositionId)` — NOT the raw compositionId. So `DorianFullV1-15` shows "Dorian Full" selected.
- VersionBar renders nothing when the current comp is non-versioned (e.g. SigmaAppDemo). Test: `if (!currentFamily) return null`.
- Versioned comp ids match `^(.+?)V(\d+)-(\d{2})$` (dash form, NOT dot form). The dot form `V1.15` is the human label; in code it's always `V1-15`.

**Anti-pattern (DO NOT add)**: a family dropdown above the sub-version. The family is fully encoded by the main video dropdown — adding a third selector creates redundant state and a synchronization tax (which dropdown is the source of truth?).

### Layer System

**Primary vs Secondary hand layers:**

- **Primary** (index 0): waypoints synced from `state.waypoints[scene]` via `syncHandLayer()`. Uses scene-level `sceneAnimation` + `sceneDark` overrides.
- **Secondary** (index 1+): created by `ADD_HAND_GESTURE`. Waypoints live exclusively in `layer.data.waypoints`. Use gesture preset defaults for animation/dark.
- `UPDATE_WAYPOINT` / `DELETE_WAYPOINT` route to secondary layers when `state.selectedLayerId` matches a non-primary hand layer.
- `REMOVE_LAYER` only clears `state.waypoints[scene]` when removing the primary hand layer.

**Adding independent gestures:**

```typescript
dispatch({ type: 'ADD_HAND_GESTURE', scene, points: [wp], gesture: 'click' });
// Creates a new HandLayer with its own waypoints — never modifies primary
```

### DrawingCanvas Interaction Modes

| Mode   | Condition             | Short click (<5 mouse points)   | Freehand drag (>=5 points)            |
| ------ | --------------------- | ------------------------------- | ------------------------------------- |
| CREATE | No waypoints in scene | `ADD_WAYPOINT` × generatePath() | `SET_WAYPOINTS` (2 pts)               |
| EDIT   | Waypoints exist       | `ADD_HAND_GESTURE` (new layer)  | `ADD_HAND_GESTURE` (2 pts, new layer) |

### Keyboard Shortcuts

| Key                       | Action                                              |
| ------------------------- | --------------------------------------------------- |
| `1`–`5`                   | Select gesture tool (Click/Scroll/Drag/Swipe/Point) |
| Same key again            | Toggle dark/light hand for current scene            |
| `S`                       | Select tool (deselect)                              |
| `Ctrl+S`                  | Save session                                        |
| `Ctrl+Z`                  | Undo                                                |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo                                                |
| `Space`                   | Play/pause                                          |
| `←` / `→`                 | Step 1 frame                                        |
| `Shift+←` / `Shift+→`     | Step 10 frames                                      |
| `Delete` / `Backspace`    | Delete selected waypoint or layer                   |
| `T`                       | Toggle trail                                        |
| `E`                       | Toggle export                                       |
| `0`                       | Reset zoom/pan                                      |
| `Escape`                  | Deselect waypoint / close export                    |

### Undo/Redo Stack

`undoReducer.ts` wraps `directorReducer` with three stacks:

- `past`: states before last undoable action
- `present`: current state
- `future`: states available for redo (cleared on any new undoable action)

**Undoable actions**: `ADD_WAYPOINT`, `DELETE_WAYPOINT`, `SET_WAYPOINTS`, `UPDATE_WAYPOINT` (outside drag), `ADD_HAND_GESTURE`, `ADD_LAYER`, `REMOVE_LAYER`, `UPDATE_LAYER_DATA`, `SET_SCENE_GESTURE`, `REVERT_SCENE`, `RESTORE_VERSION`, `IMPORT_PATHS`, all layer visibility/lock/reorder actions.

**Drag coalescing**: `START_DRAG` creates one undo point; `UPDATE_WAYPOINT` mid-drag is coalesced (no new entry).

### Zoom / Pan

- **Scroll wheel**: zoom toward cursor (refs track current zoom/pan; pan adjusted so content under cursor stays fixed)
- **Alt+drag** or **middle-click drag**: pan
- **`0` key**: reset zoom and pan
- CSS transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` on `.player-frame`

### Gallery — Single Source of Truth for Pickers

The animation gallery (`GalleryView.tsx`) controls which hand animations, pointers, and click effects appear in the Inspector and Toolbar pickers.

**Architecture**:

```
galleryData.ts (113 entries + pickerSlot) ──→ galleryActive.ts (derive + filter) ──→ Inspector/Toolbar
                                          ──→ GalleryView.tsx (display + activate)
```

- **pickerSlot field**: Each gallery entry declares which picker it belongs to (e.g., `hand:click`, `pointer`, `click-effect`)
- **galleryActive.ts**: Derives picker lists from `GESTURES` array using `getBySlot()`. No hardcoded arrays.
- **Star buttons**: All gallery cards (including pointer shape cards) have activate/deactivate star buttons
- **Auto-seed**: First load activates all `pickerSlot` items (20 defaults). Persisted to `localStorage['gallery-active-items']`.
- **Strict filtering**: Only activated items appear in pickers. No fallback to "show all".
- **Overlay pattern**: Gallery renders as overlay with `display: none` on editor — editor stays mounted to preserve Player refs and event listeners.
