# SceneDirector Hand-Bar Label — Per-Layer Gesture Wins

**Scope**: SceneDirector Timeline hand-bar rendering (`panels/Timeline.tsx`)
**Authority**: MANDATORY — reversing this priority silently mislabels every multi-layer scene
**Evidence**: 2026-05-07 — adding a NEW click layer to scene 9 (whose `state.sceneGesture` was "scroll") rendered the new bar with label "scroll" because the bar pulled from sceneGesture FIRST and only fell back to layer.data.gesture if undefined. User reported "I clicked click + trail and still see scroll event". Layer's `data.gesture` was correctly `'click'`; the BAR LABEL was wrong, not the underlying data.

---

## Core Rule

**The Timeline hand-bar label MUST read `layer.data.gesture` first, with `state.sceneGesture[sceneName]` only as a fallback for legacy layers that lack `data.gesture`. Per-layer is the source of truth. Scene-level is a default for new layers, never an override on existing ones.**

```tsx
// CORRECT — per-layer wins
const gesture = layer.data.gesture || state.sceneGesture[sceneName] || 'click';

// WRONG — scene-level overrides per-layer (the bug)
const gesture = state.sceneGesture[sceneName] || layer.data.gesture || 'click';
```

## Why

Once you support multiple hand layers per scene (which `ADD_HAND_GESTURE` does — secondary click layers, separate tap events), each layer has its own gesture. The scene-level gesture is now just the DEFAULT for the next layer the user creates with the toolbar — it is NOT a property of all existing layers. Reversing the priority hijacks every layer's identity in the UI without changing the underlying data, so:

- The hand animation plays correctly (per-layer data is intact).
- The bar label, tooltip, and any per-bar styling all show the wrong gesture.
- The user clicks "click", sees a bar labeled "scroll", concludes the click tool is broken, and refiles the bug.

## Companion

Same precedence applies anywhere a layer's effective gesture is computed for DISPLAY (not for animation playback): tooltips, status text, inspector header. For animation playback, `useHandAnimation` already reads from `layer.data` — that path was always correct.

## When to Apply

- Editing `panels/Timeline.tsx` hand-bar rendering
- Adding any new "show gesture for this layer" UI in Inspector or overlays
- Refactoring `state.sceneGesture[scene]` semantics — confirm existing-layer labels still come from `layer.data.gesture`

## Anti-Pattern

Treating `state.sceneGesture[scene]` as scene-wide truth. It is the **next-layer-default** record. Conflating these two semantics is the root cause of this rule.

---

**Last Updated**: 2026-05-07
