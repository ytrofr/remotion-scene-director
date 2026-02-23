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
├── gestures.ts                 # GESTURE_PRESETS (click/scroll/drag/swipe/point)
├── layers.ts                   # Layer types: HandLayer, AudioLayer, ZoomLayer
├── codedPaths.ts               # getCodedPath() — source-of-truth paths per scene
├── compositions.ts             # COMPOSITIONS registry + COMPOSITION_COMPONENTS
├── panels/
│   ├── Toolbar.tsx             # Top bar: tool buttons, dark toggle, save
│   ├── SceneList.tsx           # Left: scene list + layer stack per scene
│   ├── Inspector.tsx           # Right: waypoint/layer editor tabs
│   └── Timeline.tsx            # Bottom: multi-row timeline (scenes/hand/audio)
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
    └── useToComp.ts            # Screen → composition coordinate mapping
```

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
