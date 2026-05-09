# SceneDirector Multi-Row Hand Bars + Lane Override

**Scope**: SceneDirector Timeline hand-bar layout (`panels/useTimelineData.ts::useHandLayerRows`, `panels/Timeline.tsx`, `layers.ts::HandLayerData.laneOverride`)
**Authority**: MANDATORY — Timeline is high-touch; reverting any of these invariants regresses the multi-layer UX
**Evidence**: 2026-05-07 — overlapping primary + secondary hand layers in the same scene window piled onto a single row, making them un-selectable. User asked for both auto-split AND manual lane pinning. Verified in browser: 12 layers in DorianFull, ghost rendering + override persistence + greedy fallback all functional.

---

## Core Rule

**Hand bars stack into multiple rows by greedy time-overlap pack, with `HandLayerData.laneOverride?: number` as a manual pin. Two-pass placement: Pass 1 places overrides in their preferred lane (extending row count if needed); Pass 2 greedy-packs unpinned layers around them, falling back to greedy when an override conflicts in time. Drag-UX: plain drag = move in time (unchanged), `Shift+drag` = lane reassignment.**

This is the only safe way to support multiple independent hand gestures per scene visually. Without multi-row, primary + secondary layers visually collide on one bar and become un-selectable.

## Five Invariants

1. **`laneOverride` lives on `HandLayerData`** — typed `number | undefined`, persisted via the existing slice mechanism (no separate save flow). Undefined = auto-pack; number = pin to that lane.
2. **Two-pass row pack** in `useHandLayerRows` (entries pre-sorted by global start frame):
   - Pass 1: every entry with `typeof laneOverride === 'number'` gets placed at `rows[laneOverride]`, extending the array with empty rows if needed. If another override-entry already occupies that lane at an overlapping time, demote to Pass 2.
   - Pass 2: every other entry (or demoted) greedy-packs into the first row where `entry.gs >= row.last.ge`; new row appended on no fit.
   - Compact step removes fully-empty rows (allows dragging far past the visible last row to create exactly one new lane, not lane-N gaps).
3. **Drag-axis routing at mousedown via Shift modifier**, NOT post-mousedown axis detection. Reason: synthesizing a fake `React.MouseEvent` to bridge from a custom mousemove listener to a useEffect-listener-based drag hook (`handleHandEdgeDown`) leaves a 1-2 frame React render gap where mousemoves are dropped — felt sluggish/broken. Modifier-based routing is decided synchronously at the source event, so plain drag stays instant.
4. **Lane-drag listeners attach to `window`** (not the bar). Required because the bar moves out from under the cursor as the ghost follows the target row, and a listener on the bar would lose mousemove events the moment the cursor leaves the bar's bounding rect.
5. **Visual feedback during lane drag**: source bar dims to 35% opacity with dashed outline (`timeline__hand-bar--lane-dragging`), target row highlights teal (`timeline__row--lane-target`), ghost bar follows the cursor's target lane (`timeline__hand-bar--ghost`). Cleared on `mouseup`. Without these the user can't tell which lane will receive the drop.

## Edge Cases (load-bearing)

- **Drop past the last row** → `targetRowIdx === handLayerRows.length` (one slot past end) creates a new lane on release. Don't clamp to `length - 1`.
- **Override conflict** → if two override-entries pin the same lane and overlap in time, the LATER one (sorted by globalStart) demotes to Pass 2 greedy. Predictable: earliest-wins.
- **`laneOverride === undefined`** vs `laneOverride === 0` are NOT equivalent — undefined means auto-pack, zero means pin to row 0. Inspector reset uses `data: { laneOverride: undefined }` (the spread merge in `UPDATE_LAYER_DATA` correctly stores undefined as a JSON-dropped key).
- **Override beyond visible rows** → e.g. user pins to lane 5 when only 2 rows would auto-pack. Pass 1 fills empty rows up to 5, then compact step removes them, so the override visually clamps to the next available row. Self-correcting on re-drag.

## Inspector Affordance

When the selected hand layer has `laneOverride` set, Inspector shows `Lane: pinned to row N [Reset]`. Reset dispatches `UPDATE_LAYER_DATA { layerId, data: { laneOverride: undefined } }` to restore auto-pack.

## When to Apply

- Editing `useHandLayerRows`
- Adding new `HandLayerData` fields (verify they don't break the slicing or the two-pass placement)
- Designing similar timeline UIs (audio rows, caption rows) — the audio row code uses the same greedy algorithm and would benefit from the same override field if multi-track UX is ever needed there
- Debugging "I dragged a bar but it didn't move rows" — confirm the user used Shift+drag (tooltip on every bar reads `drag to move in time, Shift+drag to change row`)

## Anti-Patterns

| Wrong                                                                     | Right                                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Axis-detect on mousedown then bridge to existing drag hook via fake event | Modifier (Shift) decides at source mousedown — no bridging, no render gap |
| Lane-drag listener on the bar element                                     | Window-level listener — bar moves out from under cursor during drag       |
| Clamp `targetRowIdx` to `handLayerRows.length - 1`                        | Allow `length` (one past end) to create a new lane on drop                |
| Strip empty rows BEFORE two-pass placement                                | Strip AFTER — Pass 1 needs the empty slots to pin to far-out lane indices |
| Reset via `laneOverride: 0`                                               | Reset via `laneOverride: undefined` (zero is a valid PIN to row 0)        |

## Companion Rules

- `.claude/rules/scene-director-bar-label-truth.md` — per-layer gesture as label source of truth (sibling concern: per-layer truth wins over scene-level)
- `.claude/rules/scene-director-state-isolation.md` — laneOverride lives inside `HandLayerData` inside `state.layers`, so the per-composition slice mechanism handles it transparently (no schema changes needed)
- `.claude/rules/scene-director-save-semantics.md` — Save iterates all scenes, persists laneOverride as part of each layer's data automatically

---

**Last Updated**: 2026-05-07
