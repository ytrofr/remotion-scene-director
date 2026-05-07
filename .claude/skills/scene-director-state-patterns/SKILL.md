---
name: scene-director-state-patterns
description: 'React reducer state management with multi-undo, coalesced drag updates, and gesture-first dispatch. Use when building interactive editors, implementing undo/redo, or managing complex UI state.'
user-invocable: false
---

# Scene Director State Patterns

## WHEN TO USE (Triggers)

1. When building an interactive editor with undo/redo
2. When drag operations create too many undo entries (one per pixel)
3. When state has multiple "layers" that need independent control
4. When switching between tools/modes in an editor
5. When state needs to persist across browser sessions (localStorage)

## FAILED ATTEMPTS

| #   | Attempt                                                                                                                         | Why Failed                                                                                                                                                                                                                                                                                       | Lesson                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | useState for each piece of state                                                                                                | 15+ useState calls, impossible to coordinate undo                                                                                                                                                                                                                                                | Single reducer with all state in one object                                                                                                                                                                                                                  |
| 2   | Undo on every UPDATE_WAYPOINT during drag                                                                                       | 100 undo entries per drag operation, undo unusable                                                                                                                                                                                                                                               | Coalesce: START_DRAG creates undo point, updates during drag don't                                                                                                                                                                                           |
| 3   | Undo stack with no limit                                                                                                        | Memory grew unbounded over long editing sessions                                                                                                                                                                                                                                                 | Cap at MAX_HISTORY = 50 entries                                                                                                                                                                                                                              |
| 4   | Per-scene maps keyed by sceneName only (single localStorage blob)                                                               | Same scene names in V1.10 / V1.14 / DorianFull collided → switching comp left prior data in same map slot → next Save wrote contaminated data → user lost work repeatedly                                                                                                                        | Composition-scoped slicing: `scene-director-slice-{compId}` per comp + atomic slice swap in dispatch wrapper                                                                                                                                                 |
| 5   | Save persisting only `state.selectedScene`                                                                                      | User edits multiple scenes, only the active one reaches disk, HMR/refresh wipes the rest                                                                                                                                                                                                         | Save iterates ALL scenes via `collectScenesToSave(state)` and POSTs sequentially                                                                                                                                                                             |
| 6   | localStorage I/O inside reducer                                                                                                 | React strict mode double-invokes reducer + breaks purity contract                                                                                                                                                                                                                                | Pre-dispatch I/O in `dispatch` wrapper: read/write localStorage synchronously BEFORE forwarding to reducer; reducer stays pure with action.slice payload                                                                                                     |
| 7   | Axis-detect drag on bar mousedown then synthesize a fake `React.MouseEvent` to bridge into a useEffect-listener-based drag hook | Listener mounts on the NEXT React render → 1-2 frame gap where user's mousemoves are dropped → horizontal drag felt sluggish and lane drag never registered. Tested in Playwright: ghost rendered correctly but `targetRowIdx` stayed at sourceRowIdx because the bridge missed the move events. | Decide drag mode at the SOURCE mousedown via modifier key (Shift+drag = lane reassign, plain drag = time move). No bridging, no fake events, no render gap. Tooltip on every bar reads `drag to move in time, Shift+drag to change row` for discoverability. |
| 8   | Lane-drag mousemove listener on the bar element                                                                                 | Bar moves out from under the cursor as the ghost follows the target row, listener loses events the moment cursor exits the bar's bounding rect → lane-drag stops mid-motion                                                                                                                      | Attach mousemove + mouseup to `window` for any drag where the source element changes position or the cursor leaves it (lane-drag, freehand draw, multi-cell selection)                                                                                       |

## CORRECT PATTERN

### Undoable Reducer Wrapper

```typescript
interface UndoableState {
  past: DirectorState[]; // Undo stack (max 50)
  present: DirectorState; // Current state
  future: DirectorState[]; // Redo stack
}

const UNDOABLE_ACTIONS = new Set([
  'SET_WAYPOINTS',
  'ADD_WAYPOINT',
  'DELETE_WAYPOINT',
  'ADD_LAYER',
  'REMOVE_LAYER',
  'REVERT_SCENE',
]);

function undoableReducer(state: UndoableState, action): UndoableState {
  // UNDO: pop from past, push present to future
  if (action.type === 'UNDO' && state.past.length > 0) {
    return {
      past: state.past.slice(0, -1),
      present: state.past[state.past.length - 1],
      future: [state.present, ...state.future].slice(0, MAX_HISTORY),
    };
  }

  // START_DRAG: save undo point, then apply
  if (action.type === 'START_DRAG') {
    const newPresent = directorReducer(state.present, action);
    return {
      past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
      present: newPresent,
      future: [], // Clear redo on new action
    };
  }

  // UPDATE_WAYPOINT during drag: coalesce (no new undo point)
  if (
    action.type === 'UPDATE_WAYPOINT' &&
    state.present.draggingIndex !== null
  ) {
    return { ...state, present: directorReducer(state.present, action) };
  }

  // Normal undoable action: save undo point
  if (UNDOABLE_ACTIONS.has(action.type)) {
    const newPresent = directorReducer(state.present, action);
    return {
      past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
      present: newPresent,
      future: [],
    };
  }

  // Non-undoable action: just apply, no history change
  return { ...state, present: directorReducer(state.present, action) };
}
```

### 3-Layer Persistence

```
Priority (highest wins):
1. localStorage -- browser session cache (ephemeral)
2. codedPaths.data.json -- saved via Save button
3. codedPaths.ts -- hardcoded TypeScript defaults (lowest)
```

## CORRECT PATTERN — Composition-Scoped Slicing (added 2026-05-04)

When the editor manages multiple "documents" (compositions) that share scene names, scene-keyed state maps MUST be scoped per composition. Otherwise switching documents leaves prior data in the same map slots and Save writes contaminated data.

### localStorage layout

```
scene-director-meta              → top-level UI state (compId, frame, view, ...)
scene-director-slice-{compId}    → per-comp scene-keyed maps (waypoints, layers, ...)
scene-director-backup-{ts}       → migration safety net (one-session rollback)
```

### Atomic slice swap via dispatch wrapper

Reducers must stay pure, so localStorage I/O happens in a dispatch wrapper BEFORE the action reaches the reducer. The reducer receives the new comp's slice as part of the action payload:

```typescript
// Wrap useReducer's dispatch
const dispatch = useCallback((action: DirectorAction) => {
  if (action.type === 'SET_COMPOSITION' &&
      action.id !== stateRef.current.compositionId) {
    saveSlice(stateRef.current.compositionId, extractSlice(stateRef.current));
    rawDispatch({ ...action, slice: loadSlice(action.id) });
  } else {
    rawDispatch(action);
  }
}, []);

// Reducer applies slice atomically
case 'SET_COMPOSITION': {
  const slice = action.slice ?? {};
  return {
    ...state,
    compositionId: action.id,
    waypoints: slice.waypoints ?? {},
    layers: slice.layers ?? {},
    sceneGesture: slice.sceneGesture ?? {},
    // ... 6 more scene-keyed fields
  };
}
```

### Save iterates ALL scenes (not active selection)

A "Save" button that persists only the currently-selected scene is a UX trap that loses user work on HMR/refresh. Save must iterate every scene with state and POST sequentially:

```typescript
const sceneList = collectScenesToSave(state); // pure helper
const proposals = filterPersistableProposals(
  sceneList.map(s => ({ scene: s, proposal: buildProposalForScene(state, s) })),
);
for (const { scene, proposal } of proposals) {
  await fetch('/api/save-path', { method: 'POST', body: JSON.stringify(...) });
}
```

Pure helpers extracted to `saveAll.ts` for unit testing — covered by 15 tests in `__tests__/saveAll.test.ts`.

### Migration with backup

Schema changes to localStorage MUST: (a) write a backup under `scene-director-backup-{ts}` before transforming, (b) be idempotent (second call = no-op), (c) handle corrupt blobs by archiving them under a `-corrupt` suffix and dropping the active key. Reference impl: `migrateLegacySession()` in `useSessionPersistence.ts`.

## EVIDENCE

| Metric                | Value                 | Source                    |
| --------------------- | --------------------- | ------------------------- |
| Undo entries per drag | 1 (was 100+)          | Coalesced drag pattern    |
| State actions         | 30+ action types      | directorReducer           |
| Max undo depth        | 50 entries            | MAX_HISTORY constant      |
| Session recovery      | 100% via localStorage | Auto-save on every change |

## QUICK START (< 5 minutes)

1. **Create reducer** (2 min): Single reducer for all editor state
2. **Wrap with undo** (2 min): UndoableState wrapper with past/present/future
3. **Define UNDOABLE_ACTIONS** (30 sec): Which actions create undo points
4. **Add drag coalescing** (30 sec): START_DRAG saves, updates during drag don't
