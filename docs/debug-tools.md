# Debug Tools Reference

Shared debug component library for Remotion composition overlays.
Used in all interactive debug compositions to find hand coordinates, inspect scene timing, and copy path data.

Import path: `src/components/debug/`

---

## Overview

These components exist to solve a single problem: **how do you find the right (x, y) coordinates to pass to `FloatingHand`?** The workflow is:

1. Open a `*DebugInteractive` composition in Remotion Studio
2. Scrub to the frame you care about
3. Click on the video — a numbered marker appears with its exact composition coordinates
4. Copy markers to clipboard → paste into your hand path array

All components are wrapped in `React.memo`. All coordinates are in composition space (not screen pixels).

---

## Types

```typescript
import type {
  DebugMarker,
  DebugSceneInfo,
  DebugPathMarker,
} from 'src/components/debug';
```

### DebugMarker

A click marker placed by the user during interactive debug.

| Field    | Type     | Description                                                      |
| -------- | -------- | ---------------------------------------------------------------- |
| `x`      | `number` | Composition-space X coordinate                                   |
| `y`      | `number` | Composition-space Y coordinate                                   |
| `frame`  | `number` | Frame at which the marker was placed                             |
| `label?` | `string` | Display label, e.g. `"M1"`. Auto-assigned if omitted             |
| `color?` | `string` | Marker dot color. Defaults to red (`#f00`) or yellow when active |

### DebugSceneInfo

Scene metadata used by the overlay and timeline.

| Field      | Type     | Description                                                                                 |
| ---------- | -------- | ------------------------------------------------------------------------------------------- |
| `name`     | `string` | Scene display name, e.g. `"3-Typing"`                                                       |
| `start`    | `number` | First frame of this scene (inclusive)                                                       |
| `end`      | `number` | Last frame of this scene (exclusive)                                                        |
| `hand?`    | `string` | Hand animation name for the overlay panel, e.g. `"hand-click"`                              |
| `gesture?` | `string` | Gesture label shown in overlay, e.g. `"tap"`                                                |
| `part?`    | `string` | Part badge (`"V2"` or `"V4"`) for combined compositions. Controls segment color in timeline |

### DebugPathMarker

Extends `DebugMarker` with scene context. Used for predefined hand path visualization.

| Field      | Type     | Description                              |
| ---------- | -------- | ---------------------------------------- |
| `scene?`   | `string` | Scene name for grouping connecting lines |
| `desc?`    | `string` | Tooltip text shown below the marker dot  |
| (inherits) |          | All `DebugMarker` fields                 |

---

## useDebugCoordinates

Hook that converts screen mouse events to composition-space coordinates and stores click markers.

```typescript
import { useDebugCoordinates } from 'src/components/debug';

const { mousePos, handleMouseMove, handleClick, markers, clearMarkers } =
  useDebugCoordinates(compositionWidth, compositionHeight);
```

### Parameters

| Parameter           | Type     | Description                                      |
| ------------------- | -------- | ------------------------------------------------ |
| `compositionWidth`  | `number` | Width of the composition in pixels, e.g. `1080`  |
| `compositionHeight` | `number` | Height of the composition in pixels, e.g. `1920` |

### Return Values

| Value             | Type                                           | Description                                                         |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| `mousePos`        | `{ x: number; y: number }`                     | Current mouse position in composition space, updated on `mousemove` |
| `handleMouseMove` | `(e: React.MouseEvent) => void`                | Attach to `onMouseMove` on the root container                       |
| `handleClick`     | `(e: React.MouseEvent, frame: number) => void` | Attach to `onClick`. Adds a marker and logs to console              |
| `markers`         | `DebugMarker[]`                                | All markers placed so far in this session                           |
| `clearMarkers`    | `() => void`                                   | Removes all markers                                                 |

Uses `getBoundingClientRect()` for coordinate conversion (rule 4 — never `offsetX/offsetY`).
Each click also logs `MARKER M1: (x, y) @ frame N` to the browser console.

### Usage Example

```tsx
const { mousePos, handleMouseMove, handleClick, markers, clearMarkers } =
  useDebugCoordinates(1080, 1920);

<AbsoluteFill
  style={{ cursor: 'crosshair' }}
  onClick={(e) => handleClick(e, frame)}
  onMouseMove={handleMouseMove}
>
  <MyComposition />
  <DebugCrosshair x={mousePos.x} y={mousePos.y} width={1080} height={1920} />
  <DebugClickMarkers
    markers={markers}
    currentFrame={frame}
    onClear={clearMarkers}
  />
</AbsoluteFill>;
```

---

## DebugCrosshair

Renders a full-width vertical line and full-height horizontal line at the current mouse position.

```typescript
import { DebugCrosshair } from 'src/components/debug';
```

### Props

| Prop             | Type      | Default               | Description                                    |
| ---------------- | --------- | --------------------- | ---------------------------------------------- |
| `x`              | `number`  | required              | X position of the vertical line                |
| `y`              | `number`  | required              | Y position of the horizontal line              |
| `width`          | `number`  | required              | Composition width (for horizontal line length) |
| `height`         | `number`  | required              | Composition height (for vertical line length)  |
| `color?`         | `string`  | `'rgba(255,0,0,0.5)'` | Line color                                     |
| `thickness?`     | `number`  | `1`                   | Line thickness in pixels                       |
| `showCenterDot?` | `boolean` | `false`               | Yellow 8px dot at the intersection point       |

### Usage Example

```tsx
<DebugCrosshair
  x={mousePos.x}
  y={mousePos.y}
  width={1080}
  height={1920}
  color="rgba(255,0,0,0.6)"
  showCenterDot={true}
/>
```

---

## DebugClickMarkers

Renders numbered marker dots at user-clicked positions. Includes a bottom action panel with COPY and CLEAR buttons when markers are present.

```typescript
import { DebugClickMarkers } from 'src/components/debug';
```

### Props

| Prop            | Type                                    | Default      | Description                                                          |
| --------------- | --------------------------------------- | ------------ | -------------------------------------------------------------------- |
| `markers`       | `DebugMarker[]`                         | required     | Markers to render, from `useDebugCoordinates`                        |
| `currentFrame?` | `number`                                | —            | Highlights the marker whose `frame` matches. Yellow when active      |
| `variant?`      | `'simple' \| 'crosshair' \| 'numbered'` | `'numbered'` | Display style (see below)                                            |
| `onClear?`      | `() => void`                            | —            | Shows CLEAR button; calls this when clicked                          |
| `onCopy?`       | `() => void`                            | —            | Custom copy handler. Defaults to writing `[{x,y}]` JSON to clipboard |

### Variants

| Variant     | What Renders                                                           |
| ----------- | ---------------------------------------------------------------------- |
| `simple`    | Colored dot only, no label                                             |
| `crosshair` | Dot with 40px mini crosshair lines, label with bold colored background |
| `numbered`  | Dot with label showing `M1 (x,y) @frame` above it                      |

The action panel (COPY/CLEAR) only appears when `markers.length > 0` and at least one of `onClear` or `onCopy` is provided.

### Usage Example

```tsx
<DebugClickMarkers
  markers={markers}
  currentFrame={frame}
  variant="numbered"
  onClear={clearMarkers}
  onCopy={() => {
    const out = markers
      .map((m) => `{ x: ${m.x}, y: ${m.y}, frame: ${m.frame} }`)
      .join('\n');
    navigator.clipboard.writeText(out);
  }}
/>
```

---

## DebugSceneOverlay

Top-left info panel showing current time, scene name, scene progress bar, mouse position, and optional hand info. Accepts a `children` slot for custom content.

```typescript
import { DebugSceneOverlay } from 'src/components/debug';
```

### Props

| Prop            | Type                       | Default  | Description                                                                |
| --------------- | -------------------------- | -------- | -------------------------------------------------------------------------- |
| `scenes`        | `DebugSceneInfo[]`         | required | Scene list — used to determine the active scene                            |
| `currentFrame`  | `number`                   | required | Current playback frame                                                     |
| `fps`           | `number`                   | required | Composition FPS for time formatting                                        |
| `mousePos?`     | `{ x: number; y: number }` | —        | Shows a red MOUSE POSITION block if provided                               |
| `markerCount?`  | `number`                   | —        | Shows a magenta MARKERS (N) line if provided                               |
| `showHandInfo?` | `boolean`                  | `false`  | Shows an orange HAND block with `hand` and `gesture` from the active scene |
| `children?`     | `React.ReactNode`          | —        | Extra content rendered at the bottom of the panel                          |

The panel displays time as `MM:SS:FF` in green, current scene in cyan, and a teal progress bar showing how far through the current scene playback is.

### Usage Example

```tsx
<DebugSceneOverlay
  scenes={MY_SCENE_INFO}
  currentFrame={frame}
  fps={fps}
  mousePos={mousePos}
  markerCount={markers.length}
  showHandInfo={true}
>
  <div style={{ color: '#666', fontSize: 10 }}>
    Click anywhere to add markers
  </div>
</DebugSceneOverlay>
```

---

## DebugPathVisualization

Renders predefined hand path waypoints as numbered dots with optional SVG connecting lines. Dots closest to the current frame are brighter; distant dots fade to 40% opacity.

```typescript
import { DebugPathVisualization } from 'src/components/debug';
```

### Props

| Prop                   | Type                | Default  | Description                                                                  |
| ---------------------- | ------------------- | -------- | ---------------------------------------------------------------------------- |
| `markers`              | `DebugPathMarker[]` | required | Predefined path points to render                                             |
| `currentFrame`         | `number`            | required | Active dot (exact match) renders at full opacity with a glow and larger size |
| `showConnectingLines?` | `boolean`           | `true`   | Draws dashed SVG polylines between sequential markers                        |
| `groupByScene?`        | `boolean`           | `false`  | Groups connecting lines by `marker.scene`. Each scene gets its own polyline  |

Opacity logic: exact frame match = `1.0`, within 5 frames = `0.8`, all others = `0.4`.

### Usage Example

```tsx
// Define path points in a separate file, e.g. debugPaths.ts
const MY_HAND_PATH: DebugPathMarker[] = [
  { x: 540, y: 800, frame: 0, scene: 'Intro', label: 'P1', color: '#0f0' },
  { x: 300, y: 1200, frame: 30, scene: 'Intro', label: 'P2', color: '#0f0' },
  { x: 600, y: 1600, frame: 60, scene: 'Scroll', label: 'P3', color: '#ff0' },
];

<DebugPathVisualization
  markers={MY_HAND_PATH}
  currentFrame={frame}
  showConnectingLines={true}
  groupByScene={true}
/>;
```

---

## DebugSceneTimeline

Horizontal bar at the bottom of the composition showing all scenes as proportional color-coded segments with a yellow playhead.

```typescript
import { DebugSceneTimeline } from 'src/components/debug';
```

### Props

| Prop           | Type               | Description                                                                  |
| -------------- | ------------------ | ---------------------------------------------------------------------------- |
| `scenes`       | `DebugSceneInfo[]` | Scene list. Segment widths are proportional to `(end - start) / totalFrames` |
| `currentFrame` | `number`           | Drives the playhead position and active segment highlighting                 |
| `totalFrames`  | `number`           | Total composition frame count                                                |

Active segment is cyan (`#00d9ff`). Past segments are dark cyan. Future segments are `#333`. When `scene.part` is set, V2 scenes use orange tones and non-V2 use green tones.

### Usage Example

```tsx
<DebugSceneTimeline
  scenes={MY_SCENE_INFO}
  currentFrame={frame}
  totalFrames={durationInFrames}
/>
```

---

## Complete Example

A minimal interactive debug composition using all components together.

```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  useDebugCoordinates,
  DebugCrosshair,
  DebugClickMarkers,
  DebugSceneOverlay,
  DebugSceneTimeline,
} from '../../components/debug';
import type { DebugSceneInfo } from '../../components/debug';
import { MyComposition } from './MyComposition';

const SCENES: DebugSceneInfo[] = [
  { name: '1-Intro', start: 0, end: 60 },
  { name: '2-Action', start: 60, end: 150, hand: 'hand-tap', gesture: 'tap' },
  { name: '3-Outro', start: 150, end: 210 },
];

export const MyDebugInteractive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { mousePos, handleMouseMove, handleClick, markers, clearMarkers } =
    useDebugCoordinates(1080, 1920);

  return (
    <AbsoluteFill
      style={{ cursor: 'crosshair' }}
      onClick={(e) => handleClick(e, frame)}
      onMouseMove={handleMouseMove}
    >
      <MyComposition />

      <DebugCrosshair
        x={mousePos.x}
        y={mousePos.y}
        width={1080}
        height={1920}
      />

      <DebugClickMarkers
        markers={markers}
        currentFrame={frame}
        variant="numbered"
        onClear={clearMarkers}
      />

      <DebugSceneOverlay
        scenes={SCENES}
        currentFrame={frame}
        fps={fps}
        mousePos={mousePos}
        markerCount={markers.length}
        showHandInfo={true}
      />

      <DebugSceneTimeline
        scenes={SCENES}
        currentFrame={frame}
        totalFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
};
```

Register it in `Root.tsx` under an id like `"MyDebug"` — it will not be rendered to video, only used in Studio.

---

## Compositions Using This Library

| Composition                              | File                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| `DorianDebugInteractive`                 | `src/compositions/DorianDemo/DorianDebugInteractive.tsx`                     |
| `MobileChatDemoV4DebugInteractive`       | `src/compositions/MobileChatDemo/MobileChatDemoV4DebugInteractive.tsx`       |
| `MobileChatDemoCombinedDebugInteractive` | `src/compositions/MobileChatDemo/MobileChatDemoCombinedDebugInteractive.tsx` |

All three follow the same pattern: wrap their main composition, pass `useDebugCoordinates(1080, 1920)`, and layer all five debug components on top.
