---
name: remotion-pipeline
description: "Record app interactions via Playwright for Remotion compositions. Use when recording demos, creating video assets, or working with Scene Director."
disable-model-invocation: true
---

# Remotion Video Pipeline

**Scope**: ALL projects needing demo video recording (OGAS, limor-video-poc)
**Authority**: MANDATORY when recording app interactions for Remotion compositions
**Source**: DemoCreative recording pipeline (2026-04-12)

---

## Core Rule

**Record real app interactions via Playwright screenshot loop → ffmpeg assembly → mp4 asset → Remotion `<OffthreadVideo>`. Preview in Scene Director only. NEVER render Remotion video without explicit user permission.**

---

## Recording Pipeline

```
1. CAPTURE: scripts/record_demo.py (in ogas-websites repo)
   └─ Playwright headless @ 1920x1080, screenshot loop at 25fps
   └─ Sine ease-in-out scroll, React fiber click for overlays
   └─ ffmpeg assembles PNGs → mp4 (H.264, yuv420p)

2. OUTPUT: ~/limor-video-poc/public/sigma-demo/recordings/{name}.mp4

3. EMBED (in limor-video-poc):
   <OffthreadVideo
     src={staticFile("sigma-demo/recordings/{name}.mp4")}
     startFrom={Math.round(startSec * 30)}
     style={{ width: 1920, height: 1080 }}
   />

4. PREVIEW: Scene Director at localhost:3001 (NOT Remotion Studio)
   └─ Select composition → PageReveal scene → scrub to frame 245+
```

## Video Asset Requirements

| Property | Value | Why |
|----------|-------|-----|
| Resolution | 1920x1080 | Hardcoded in DemoFlow.tsx:233-234 |
| Format | mp4 (H.264, yuv420p) | Remotion OffthreadVideo compatibility |
| FPS | 25 (assembly) | Remotion plays at 30fps — slight slow-mo is fine |
| Quality | CRF 20 | Good quality, reasonable file size |

## Cross-Repo File Map

| Repo | File | Purpose |
|------|------|---------|
| ogas-websites | `scripts/record_demo.py` | Playwright capture script (screenshot loop + ffmpeg) |
| ogas-websites | `web/src/features/creative/` | Creative Studio app (what gets recorded) |
| limor-video-poc | `src/compositions/SigmaAppDemo/demos/DemoCreative.tsx` | Composition config (pageRevealVideo path) |
| limor-video-poc | `src/compositions/SigmaAppDemo/components/DemoFlow.tsx` | Reusable engine (renders OffthreadVideo) |
| limor-video-poc | `src/compositions/SigmaAppDemo/constants.ts` | Video configs (1920x1080@30fps, 600 frames) |
| limor-video-poc | `public/sigma-demo/recordings/` | Output mp4 files |

## DemoConfig Props for Page Reveal

| Prop | Type | Example | Purpose |
|------|------|---------|---------|
| `pageRevealVideo` | string | `"sigma-demo/recordings/creative.mp4"` | staticFile path to mp4 |
| `pageRevealVideoStartSec` | number | `0` | Skip N seconds from video start |
| `pageRevealType` | string | `"app-load"` | Transition style (chat slides away) |

## Scene Director (localhost:3001)

Interactive hand-path editor for cursor animations over compositions.

| Key | Action |
|-----|--------|
| Space | Play/pause |
| 1-5 | Select gesture (Click/Scroll/Drag/Swipe/Point) |
| ←/→ | Step 1 frame |
| Shift+←/→ | Step 10 frames |
| S | Select tool |
| T | Toggle trail |
| Ctrl+S | Save session |

## Capture Methods (Tested 2026-04-12)

| Method | FPS | Overlay Support | Status |
|--------|-----|-----------------|--------|
| **Playwright recordVideo** | **25 native** | **YES (--headless=new)** | **WINNER — use this** |
| Screenshot loop + ffmpeg | 5-6 real, 25 output | YES | FALLBACK — slower, heavier |
| GIF creator (chrome MCP) | 1 per action | YES | REJECTED — choppy, no smooth scroll |
| CDP Page.startScreencast | 1 fps | YES | REJECTED — too slow |

**Key finding**: `recordVideo` with `--headless=new` (Playwright default since v1.30) now captures `position:fixed` overlays correctly. The old limitation (crbug.com/1400167) is fixed in new headless mode.

## Audio in Compositions (CRITICAL — Learned 2026-04-12)

Scene Director audio pipeline has TWO parts:
1. **Provider**: Scene Director creates audio layers from `getCodedAudio()` → provides via `AudioEntriesContext`
2. **Consumer**: The composition MUST render `<AudioFromLayers />` to read context and inject Remotion `<Audio>` elements

**If audio layers appear in the timeline but produce no sound**: the composition is missing `<AudioFromLayers />`. Add it inside the component's `<AbsoluteFill>`:

```tsx
import { AudioFromLayers } from '../../SceneDirector/AudioLayerRenderer';

// Inside the composition's return:
<AbsoluteFill>
  <AudioFromLayers />
  {/* ... rest of composition */}
</AbsoluteFill>
```

Compositions that have it: DorianDemo, DorianDemoEnhanced, AudioTest, CapabilitiesDemo, **DemoFlow** (added 2026-04-12).
Compositions that DON'T (audio won't play): any new composition without it.

## Recording Gotchas (Learned 2026-04-12)

### Lazy-loaded images appear as 404
`loading="lazy"` images below viewport never trigger in headless recording. They report `complete=true, naturalWidth=0` but never start loading.
**Fix**: Pre-scroll to bottom to trigger all lazy images, wait for `naturalWidth > 0`, then scroll back to top before recording starts.

### `pageRevealVideoStartSec` must account for loading time
Recording includes page load + auth inject + image loading time at the start. Set `pageRevealVideoStartSec` to skip this dead time. Check frames with `ffmpeg -ss Ns -i video.mp4 -vframes 1 frame.jpg` to find the right offset.

### z-index collisions with app chrome
App header (`z-50` sticky) and modals (`z-50` fixed) are at the same level. Modals must use React Portal (`createPortal(modal, document.body)`) + `z-[100]` — `position:fixed` alone does NOT escape parent stacking context created by `overflow-y-auto` on `<main>`.

### Fullscreen modals need 100% opaque overlay for recordings
`bg-black/80` or `bg-black/95` lets sidebar/header text bleed through in Playwright `recordVideo` captures. Use `bg-black` (100% opaque) for lightbox/modal overlays that must hide the app chrome completely.

### DemoFlow clip must expand for fullscreen video states
DemoFlow clips the video to the content area (`top:50, left:160`) to show the hub sidebar/header. When the recorded video enters a fullscreen state (lightbox, modal), the clip area MUST expand to full viewport (`top:0, left:0`). Use `overlayLift` interpolation to animate the expansion:
```tsx
const clipTop = interpolate(overlayLift, [0, 1], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const clipLeft = interpolate(overlayLift, [0, 1], [160, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
```

### Corrupt image files (HTML-as-PNG)
Use `file image.png` to verify format — the backend serves any file with 200 regardless of content. HTML saved as .png causes persistent 404 in browsers. Delete file + Firestore gallery entry.

## RULES

1. **NEVER render** Remotion video without explicit user permission
2. **NEVER use** GIF creator for demo videos — too choppy
3. **ALWAYS** 1920x1080 — other sizes cause truncation in DemoFlow
4. **ALWAYS** test in Scene Director before claiming success
5. **ALWAYS** use `?projectId=` URL param to scope gallery content
6. **ALWAYS** add `<AudioFromLayers />` to new compositions that need Scene Director audio
7. **ALWAYS** pre-scroll to trigger lazy images before recording gallery pages
8. **ALWAYS** use React Portal for fullscreen modals/lightboxes — `position:fixed` alone can't escape stacking contexts
9. **ALWAYS** use `bg-black` (100% opaque) for modal overlays in recorded app interactions
10. **ALWAYS** expand DemoFlow video clip to full viewport when overlay lifts — prevents hub bleed-through on fullscreen video states

---

**Last Updated**: 2026-04-12 (+Portal for modals, +100% opaque overlays, +DemoFlow clip expansion, +corrupt file detection)
