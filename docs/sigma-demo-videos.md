# SIGMA Investor Demo Videos — Complete Reference

**Last Updated**: 2026-04-12
**Scene Director**: http://localhost:3001/scene-director.html
**Remotion Studio**: http://localhost:3000

---

## Architecture

### Reusable Engine

All 5 agent demo clips use the same `DemoFlow` engine:

```
demos/Demo*.tsx  (config only, ~30 lines each)
  └── components/DemoFlow.tsx  (rendering engine, ~600 lines)
        ├── components/ChatPanel.tsx  (chat UI: bubbles, routing, typing, cost)
        └── components/ResultCards.tsx  (rich result cards per agent)
```

### DemoFlow Timeline (30fps, frames relative to 0)

| Phase | Frames | What Happens |
|-------|--------|-------------|
| Typing | 15-55 | User message types letter-by-letter |
| Sent | 65 | Message appears as sent bubble |
| Routing | 78 | Agent routing badge appears |
| Thinking | 90-170 | Animated thinking dots |
| Cost Badge | 170 | Cost/model/tokens badge |
| Agent Response | 195 | Agent text reply |
| Result Card | 215 | Rich card (images, scores, campaign) |
| **Page Reveal** | **245+** | Background page loads (SPA transition) |

### Page Reveal Types

| Type | Config Value | Description | Used By |
|------|-------------|-------------|---------|
| **SPA App Load** | `'app-load'` | Page loads in content area behind chat (like real app navigation) | DemoCreative, DemoSEO, DemoCampaign |
| **Browser Popup** | `'browser-popup'` | macOS browser window pops up with spring animation | DemoEditWebsite |
| **Fade** | `'fade'` (default) | Simple opacity fade overlay | Legacy/fallback |

### SPA App-Load Transition (current implementation)

Render order (bottom to top):
1. **Hub screenshot** at 50% opacity (always visible — sidebar + header)
2. **Page screenshot** in content area (`top: 50px, left: 160px`) — clips to main content region, uses negative margins to align with hub's sidebar/header
3. **Dark overlay** `rgba(0,0,0,0.15)` — dims the page while chat is open
4. **Chat panel** — always on top, never hidden

Phases:
- Frame 245-260: Loading spinner in content area
- Frame 260-270: Page screenshot fades in (under overlay)
- Frame 385-400: Overlay lifts (near end of video)

---

## The 5 Demo Compositions

### 1. DemoCreative (nano_banana) — 600 frames / 20s

**File**: `demos/DemoCreative.tsx`
**Message**: "Create social media posts for SIGMA — Instagram, LinkedIn and Twitter with brand visuals"
**Agent**: nano_banana | **Cost**: $0.0032, gemini-2.0-flash
**Result Card**: `CreativeImageCard` — 3 real AI image thumbnails with platform labels
**Page Reveal**: `'app-load'` → **REAL VIDEO** `sigma-demo/recordings/creative.mp4` (1920x1080, 25fps, ~50s)
**Video content**: Creative Studio gallery scoped to OGAS project (`?projectId=`), smooth scroll through AI banners, lightbox open + next navigation
**`pageRevealVideoStartSec: 26`** — skips ~26s of page load + lazy image pre-scroll
**Cursor paths**: Chat (click input → type → send) + PageReveal (scroll → click image → lightbox)
**Audio layers**: Chat (soft-click, typing, send, whoosh, notification, sparkle) + PageReveal (swoosh, slide, mouse-click, pop-up)
**Recording**: `scripts/record_demo.py creative` in ogas-websites repo

### 2. DemoContext (orchestrator) — 390 frames / 13s

**File**: `demos/DemoContext.tsx`
**Message**: "Save our business context: SIGMA, AI platform for SMBs, targeting small business owners"
**Agent**: orchestrator | **Cost**: $0.0003, gemini-2.5-flash
**Result Card**: `ContextSavedCard` — 12/12 fields with green checkmarks
**Page Reveal**: None (no page transition — context save is in-chat only)

### 3. DemoEditWebsite (websites) — 450 frames / 15s

**File**: `demos/DemoEditWebsite.tsx`
**Message**: "Build a landing page for SIGMA — dark theme, hero with gradient, 'Agentify Your Business'"
**Agent**: websites | **Cost**: $0.0048, gemini-2.5-flash
**Result Card**: `WebsitePreviewCard` — SIGMA investor page preview thumbnail + link
**Page Reveal**: `'browser-popup'` → `sigma_investor_hero.png` (macOS browser window popup with spring animation)
**Props**: `previewImage` uses `sigma_investor_hero.png`, `pageRevealScrollDown: true` (shows below hero)

### 4. DemoSEO (reach) — 450 frames / 15s

**File**: `demos/DemoSEO.tsx`
**Message**: "Analyze SEO for sigma-app.vercel.app — audit performance, generate meta tags + schema"
**Agent**: reach | **Cost**: $0.0018, gemini-2.5-flash
**Result Card**: `SEOResultCard` — score 92/100, 8 meta tags, 3 schema types, 6 OG tags
**Page Reveal**: `'app-load'` → `analytics_dashboard.png` (Reach dashboard)

### 5. DemoCampaign (google_ads) — 450 frames / 15s

**File**: `demos/DemoCampaign.tsx`
**Message**: "Create Google Search Ads campaign for SIGMA targeting 'AI tools for small business'"
**Agent**: google_ads | **Cost**: $0.0031, gemini-2.5-flash
**Result Card**: `CampaignResultCard` — $50/day budget, 12 keywords, 3 ad groups, 4 RSAs
**Page Reveal**: `'app-load'` → `googleads_dashboard.png` (Meitav campaign with 15 Hebrew headlines)
**Screenshot source**: Captured from `localhost:5173/projects/1efc145d.../google_ads` (Meitav project)

---

## Screenshots (public/sigma-demo/)

| File | Source | Content | Used By |
|------|--------|---------|---------|
| `hub_desktop.png` | Hub page screenshot | OGAS Agent Hub with all 12 agent cards | All demos (background) |
| `sigma_investor_hero.png` | Vercel investor page | SIGMA "Agentify Your Business" hero | DemoEditWebsite |
| `recordings/creative.mp4` | Playwright recording | Creative Studio gallery (OGAS project, smooth scroll + lightbox) | DemoCreative (video) |
| `creative_dashboard.png` | Meitav /nano_banana | Creative Studio with 22 items (2 have sync errors) | Legacy (replaced by video) |
| `googleads_dashboard.png` | Meitav /google_ads | Campaign with 15 Hebrew headlines, $25/day | DemoCampaign |
| `analytics_dashboard.png` | Screenshot | Reach/Analytics dashboard | DemoSEO |
| `creative/creative_01-03.jpg` | AI-generated | 3 real Gemini-generated creatives for in-chat card | DemoCreative card |

### Known Screenshot Issues

- `creative_dashboard.png`: Legacy static screenshot replaced by `recordings/creative.mp4` (live video recording)
- `analytics_dashboard.png`: May need re-capture for freshness

---

## Scene Director Organization

Compositions organized into `<optgroup>` groups in the dropdown:

| Group | Compositions |
|-------|-------------|
| **Sigma Demos** | Creative, Context Save, Edit Website, SEO Analysis, Campaign, Transition Showcase |
| **Sigma Full** | SIGMA App Demo (60s walkthrough), SIGMA Investor Demo (pitch deck) |
| **Dorian** | Marketplace, Enhanced, Stores, Full, Debug |
| **Mobile Chat** | Combined (V2+V4) |
| **Dashmor** | Dashboard |
| **Utilities** | Audio Test, Capabilities, Shared Components |

**Files changed**: `SceneDirector/compositions.ts` (added `group` field), `SceneDirector/panels/Toolbar.tsx` (optgroup rendering), `SceneDirector/state.types.ts` (CompositionEntry type)

---

## Remotion Studio Organization (Root.tsx)

Compositions wrapped in `<Folder>` components with matching group names. Same structure as Scene Director.

---

## Result Card Components (ResultCards.tsx)

| Component | Props | Used By |
|-----------|-------|---------|
| `CreativeImageCard` | `images?: string[]` | DemoCreative |
| `CreativeStudioReveal` | `images?: string[]` | (available, not currently used) |
| `WebsitePreviewCard` | `title, url, description, previewImage` | DemoEditWebsite |
| `SEOResultCard` | `score, metaCount, schemaTypes, ogTags` | DemoSEO |
| `CampaignResultCard` | `budget, keywords, adGroups, ads` | DemoCampaign |
| `ContextSavedCard` | `fields, totalFields` | DemoContext |

---

## Transition Showcase (TransitionShowcase.tsx)

5 transition effects implemented in `PageTransitions.tsx` for comparison:
1. SlideUpPush, 2. ScaleBlurReveal, 3. WipeReveal, 4. MorphZoom, 5. SplitSlide

**Decision**: These were rejected in favor of the SPA `'app-load'` transition which feels like real app navigation. The showcase composition remains available for reference.

---

## Live Video Recording Pipeline (2026-04-12)

### Overview
DemoCreative uses a **real Playwright recording** of the running app instead of a static screenshot. The recording shows the actual Creative Studio with smooth scroll and lightbox interaction.

### Pipeline
```
1. ogas-websites/scripts/record_demo.py
   └─ Playwright headless @ 1920x1080, recordVideo (25fps native)
   └─ Pre-scroll to trigger lazy images → wait for all loaded → scroll back to top
   └─ human_scroll_main() with sine ease-in-out → click via React fiber → lightbox next
   └─ ffmpeg webm → mp4 (H.264, yuv420p, CRF 23)

2. Output: public/sigma-demo/recordings/creative.mp4

3. DemoCreative.tsx: pageRevealVideo + pageRevealVideoStartSec (skip loading)

4. DemoFlow.tsx: <OffthreadVideo> renders the mp4 in the composition
```

### Audio Architecture
Scene Director audio has **two required parts**:
1. **Coded audio entries** in `SceneDirector/layers.ts` — maps scene name → array of `{file, startFrame, durationInFrames, volume}`
2. **`<AudioFromLayers />`** inside the composition — reads `AudioEntriesContext` and renders Remotion `<Audio>` elements

**Without `<AudioFromLayers />`**: layers appear in timeline but produce zero sound.

### Cursor Gesture Architecture
Hand cursor paths in `SceneDirector/codedPaths.ts`:
- Each scene gets a `CodedPath` with `gesture` type (click/scroll/point), `animation` (cursor-real-black), and `path` array of `HandPathPoint`
- Points use composition-space coordinates (1920x1080) with `frame` timing and `gesture` type per point
- Scene Director merges coded paths with user-saved overrides from `codedPaths.data.json`

### Key Gotchas Discovered
| Gotcha | Root Cause | Fix |
|--------|-----------|-----|
| Audio layers visible but silent | Composition missing `<AudioFromLayers />` consumer | Add `<AudioFromLayers />` to DemoFlow's `<AbsoluteFill>` |
| Gallery images show 404 in recording | `loading="lazy"` images below viewport never trigger in headless | Pre-scroll to bottom to trigger lazy loading, wait, scroll back |
| Lightbox doesn't cover sidebar/header | Modal `z-50` = same as sticky header `z-50` | Bump modal to `z-[100]` |
| Video shows 20s of loading at start | Auth inject + page load + image wait all recorded | Set `pageRevealVideoStartSec` to skip dead time |

---

## Bug Fixes During This Work

### 1. Meitav Project 500 Error (OGAS backend)
**File**: `api/routers/projects_helpers.py:71`
**Root cause**: `WorkItemResponse.trigger` typed as `dict` but data had `'manual'` (string)
**Fix**: Normalize string triggers to `{"type": "manual"}`

### 2. Chat Panel Disappearing in Page Reveal
**Root cause**: Wrapper `<div>` with `transform` created a new CSS containing block, breaking ChatPanel's `position: absolute` positioning
**Fix**: Removed wrapper div, chat panel renders directly in AbsoluteFill

---

## How to Continue

### To modify a demo:
1. Edit `demos/Demo*.tsx` — change message, agent, cost, result card
2. For new screenshots: capture via Playwright from running OGAS app (`localhost:5173`)
3. Save to `public/sigma-demo/` and reference in config

### To change transition behavior:
1. Edit `components/DemoFlow.tsx` — the SPA transition is in the "Layer 2" section
2. Timing constants: `LOAD_DURATION`, `PAGE_IN`, `OVERLAY_LIFT_START`

### To add a new demo:
1. Create `demos/DemoNewAgent.tsx` (copy any existing one)
2. Add video config to `constants.ts`
3. Register in `Root.tsx` (inside Sigma Demos folder)
4. Register in `SceneDirector/compositions.ts` (with `group: 'Sigma Demos'`)
5. Add component to `COMPOSITION_COMPONENTS` map

### Pending improvements:
- [x] ~~Re-capture `creative_dashboard.png`~~ — replaced with live video recording (`recordings/creative.mp4`)
- [x] ~~Add cursor/click animation~~ — DemoCreative has full cursor paths + audio layers (2026-04-12)
- [ ] Re-capture `analytics_dashboard.png` for freshness
- [ ] DemoEditWebsite: browser popup `scrollDown` offset may need tuning (-120px)
- [ ] Record live videos for DemoSEO, DemoCampaign, DemoEditWebsite (same pattern as DemoCreative)
- [ ] Add cursor paths + audio to remaining 4 demo compositions
