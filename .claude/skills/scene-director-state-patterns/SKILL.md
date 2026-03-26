---
name: scene-director-state-patterns
description: "React reducer state management with multi-undo, coalesced drag updates, and gesture-first dispatch. Use when building interactive editors, implementing undo/redo, or managing complex UI state."
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
| # | Attempt | Why Failed | Lesson |
|---|---------|-----------|--------|
| 1 | useState for each piece of state | 15+ useState calls, impossible to coordinate undo | Single reducer with all state in one object |
| 2 | Undo on every UPDATE_WAYPOINT during drag | 100 undo entries per drag operation, undo unusable | Coalesce: START_DRAG creates undo point, updates during drag don't |
| 3 | Undo stack with no limit | Memory grew unbounded over long editing sessions | Cap at MAX_HISTORY = 50 entries |

## CORRECT PATTERN

### Undoable Reducer Wrapper
```typescript
interface UndoableState {
  past: DirectorState[];     // Undo stack (max 50)
  present: DirectorState;    // Current state
  future: DirectorState[];   // Redo stack
}

const UNDOABLE_ACTIONS = new Set([
  'SET_WAYPOINTS', 'ADD_WAYPOINT', 'DELETE_WAYPOINT',
  'ADD_LAYER', 'REMOVE_LAYER', 'REVERT_SCENE',
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
      future: [],  // Clear redo on new action
    };
  }

  // UPDATE_WAYPOINT during drag: coalesce (no new undo point)
  if (action.type === 'UPDATE_WAYPOINT' && state.present.draggingIndex !== null) {
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

## EVIDENCE
| Metric | Value | Source |
|--------|-------|--------|
| Undo entries per drag | 1 (was 100+) | Coalesced drag pattern |
| State actions | 30+ action types | directorReducer |
| Max undo depth | 50 entries | MAX_HISTORY constant |
| Session recovery | 100% via localStorage | Auto-save on every change |

## QUICK START (< 5 minutes)
1. **Create reducer** (2 min): Single reducer for all editor state
2. **Wrap with undo** (2 min): UndoableState wrapper with past/present/future
3. **Define UNDOABLE_ACTIONS** (30 sec): Which actions create undo points
4. **Add drag coalescing** (30 sec): START_DRAG saves, updates during drag don't
