# Limor AI Demo Videos - Complete Context

**Project**: Programmatic demo videos for Limor AI chat interface
**Framework**: Remotion 4.0.419 (React-based video generation)
**Last Updated**: 2026-02-09

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Video Specifications](#video-specifications)
3. [Video 1: Revenue Question (V2)](#video-1-revenue-question-v2)
4. [Video 2: Worker Hours (V3)](#video-2-worker-hours-v3)
5. [Video 3: Dashmor Dashboard Scroll](#video-3-dashmor-dashboard-scroll)
6. [Screenshot Capture Workflow](#screenshot-capture-workflow)
7. [Dark Mode CSS Patterns](#dark-mode-css-patterns)
8. [Technical Learnings & Patterns](#technical-learnings--patterns)
9. [Coordinate System](#coordinate-system)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Future Plans](#future-plans)

---

## Project Overview

### Purpose
Create polished mobile demo videos showing the Limor AI chat interface in action. Videos demonstrate:
- User typing Hebrew questions
- AI thinking animation
- AI responses appearing with smooth transitions

### Tech Stack
- **Remotion**: React-based programmatic video creation
- **Playwright**: Headless browser for screenshot capture
- **TypeScript**: Type-safe development

### Directory Structure
```
Limor/
├── CONTEXT.md                    # This file
├── assets/
│   ├── screenshots/
│   │   ├── v1/                   # Video 1 screenshots (revenue question)
│   │   ├── v2/                   # Video 2 screenshots (worker hours)
│   │   └── dashmor/              # Dashmor dashboard screenshots
│   └── audio/
│       ├── typing-soft.wav       # Keyboard typing sound
│       └── send-click.wav        # Button click sound
├── scripts/
│   ├── capture-user-message.ts   # Capture script for V1
│   ├── capture-video2-worker-hours.ts  # Capture script for V2
│   ├── capture-mobile-chat-dark.ts     # Full typing capture
│   └── capture-dashmor-mobile.ts       # Dashmor full-page capture
├── compositions/
│   ├── v2/                       # Video 1 composition code
│   ├── v3/                       # Video 2 composition code
│   ├── dashmor/                  # Dashmor scroll composition
│   └── components/               # Shared components
└── output/                       # Rendered video files
```

---

## Video Specifications

| Property | Value |
|----------|-------|
| Dimensions | 1080 x 1920 (9:16 vertical) |
| Frame Rate | 30 fps |
| Phone Viewport | 390 x 844 (iPhone 14 Pro) |
| Phone Scale | 2.4x (in composition) |
| Output Format | MP4 |

### Render Commands
```bash
npm run render:v2    # Video 1 (revenue question)
npm run render:v3    # Video 2 (worker hours)
```

---

## Video 1: Revenue Question (V2)

**Composition ID**: `MobileChatDemoV2`
**Duration**: 320 frames (~10.7 seconds)
**Question**: "כמה הכנסות היו השבוע?" (How much revenue was there this week?)

### Scene Breakdown

| # | Scene | Frames | Duration | Description |
|---|-------|--------|----------|-------------|
| 1 | Intro | 35 | 1.17s | Phone slides in from bottom |
| 2 | ChatEmpty | 45 | 1.5s | Empty chat with brand title |
| 3 | Typing | 70 | 2.33s | Letter-by-letter typing (21 chars) + zoom |
| 4 | Send | 30 | 1s | Pan to send button, tap |
| 5 | UserMessage | 30 | 1s | User message appears in chat |
| 6 | Thinking | 45 | 1.5s | Animated thinking dots |
| 7 | Response | 60 | 2s | AI response slides up |
| 8 | Outro | 35 | 1.17s | CTA overlay |

### Screenshot Mapping

| Scene | Screenshot File | Notes |
|-------|-----------------|-------|
| 1-2 | mobile-chat-1-empty.png | Empty chat state |
| 3 | mobile-chat-type-01.png ... 21.png | 21 typing stages |
| 4 | mobile-chat-3-ready.png | Fully typed, ready to send |
| 5-6 | mobile-chat-user-message.png | User message only (no AI) |
| 7 | mobile-chat-5-response.png | Full response |

### Key Animations

- **Typing Scene**: Zoom 1.0 → 1.4, offset to center input (X: -120)
- **Send Scene**: Pan X: -120 → +100, then zoom out
- **UserMessage**: Smooth pan X: 100 → 0 (matches Send ending)
- **Response**: Slide up 30px while fading in

---

## Video 2: Worker Hours (V3)

**Composition ID**: `MobileChatDemoV3`
**Duration**: 335 frames (~11.2 seconds)
**Question**: "כמה שעות עבדו העובדים השבוע?" (How many hours did employees work this week?)

### Scene Breakdown

| # | Scene | Frames | Duration | Description |
|---|-------|--------|----------|-------------|
| 1 | Intro | 35 | 1.17s | Phone slides in showing first Q&A |
| 2 | ChatWithResponse | 45 | 1.5s | Shows existing conversation |
| 3 | Typing | 85 | 2.83s | Letter-by-letter (28 chars) + zoom |
| 4 | Send | 30 | 1s | Pan to send, tap |
| 5 | UserMessage | 30 | 1s | Second question appears |
| 6 | Thinking | 45 | 1.5s | Animated thinking dots |
| 7 | Response | 60 | 2s | AI response slides up |
| 8 | Outro | 35 | 1.17s | CTA overlay |

### Screenshot Mapping

| Scene | Screenshot File | Notes |
|-------|-----------------|-------|
| 1-2 | v2-chat-with-response.png | Shows first Q&A |
| 3 | v2-type-01.png ... 28.png | 28 typing stages |
| 4 | v2-ready-to-send.png | Fully typed |
| 5-6 | v2-user-message.png | Second question (no AI) |
| 7 | v2-response.png | Both conversations with AI response |

---

## Video 3: Dashmor Dashboard Scroll

**Composition ID**: `DashmorDemo`
**Duration**: ~20 seconds @ 30fps (615 frames)
**Content**: Labor Cost V3 Dashboard scrolling demo

### Overview

A scrolling showcase of the Labor Cost V3 dashboard. The phone mockup displays the full dashboard page (10,403px tall) and smoothly scrolls through sections with pauses and feature callouts.

### Features

- **Section-by-section scroll**: Pauses at each major section
- **Text callouts**: Feature highlights appear at each section
- **Progress indicator**: Dot indicator showing current section
- **Intro/Outro**: Branded entrance and exit animations

### Section Breakdown

| # | Section | Scroll Y | Pause | Callout |
|---|---------|----------|-------|---------|
| 1 | Header & Summary | 0px | 2s | "Labor Cost Dashboard" |
| 2 | Summary Cards | 400px | 1.5s | "Key Metrics" |
| 3 | Main Data | 1200px | 2s | "Detailed Breakdown" |
| 4 | Shift Status | 2000px | 1.5s | "Shift Overview" |
| 5 | Forecast | 2800px | 2s | "Cost Forecast" |
| 6 | Analytics | 4000px | 2s | "Analytics & Trends" |
| 7 | Details | 5500px | 2s | "Detailed Reports" |

### Screenshot Files

| File | Description |
|------|-------------|
| `labor-v3-fullpage-mobile.png` | Full page (390x10403px) |
| `labor-v3-section-01.png` ... `09.png` | Viewport sections |

### Render Command
```bash
npm run render:dashmor
```

---

## Screenshot Capture Workflow

### Prerequisites
1. Limor app running on `localhost:8080`
2. No auth required (or auth token set via script)

### Capture Process

1. **Set auth token** via localStorage before navigation
2. **Inject dark mode CSS** (critical for visual consistency)
3. **Intercept API** with `page.route()` to delay AI response
4. **Capture intermediate states** (user message, thinking)
5. **Reload and re-send** to get final response screenshot

### API Interception Pattern
```typescript
let routeActive = true;
await page.route('**/api/true-ai/**', async (route) => {
  await new Promise(resolve => setTimeout(resolve, 15000));
  if (routeActive) {
    try {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type":"done"}\n\n'
      });
    } catch (e) { /* Route already handled */ }
  }
});

// Later, before reload:
routeActive = false;
await page.unroute('**/api/true-ai/**');
```

### Hiding Native Thinking Bubble
```typescript
await page.evaluate(() => {
  // Hide by class
  document.querySelectorAll(
    '.thinking-message, .thinking-dots, [class*="thinking"]'
  ).forEach(el => el.style.display = 'none');

  // Hide by position (x:43, y:510 area)
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 20 && rect.width < 120 &&
        rect.height > 20 && rect.height < 80 &&
        rect.left < 80 &&
        rect.top > 400 && rect.top < 600) {
      if (el.textContent?.trim().length < 10) {
        el.style.display = 'none';
      }
    }
  });
});
```

---

## Dark Mode CSS Patterns

### Critical: Full CSS Injection Required
Do NOT just set `data-theme="dark"`. You MUST inject full CSS to match existing screenshots.

### Key CSS Rules
```css
/* Background */
html, body { background-color: #0a0a15 !important; }

/* Header gradient */
header, nav {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
}

/* Chat area */
.chat-container { background-color: #0f0f1a !important; }

/* User message - ONLY force white text, keep native bubble color */
.message.user * { color: #ffffff !important; }
/* DO NOT override background - breaks native teal color */

/* Feedback SVGs - make visible (cyan) */
.feedback-btn svg { fill: #00d9ff !important; stroke: #00d9ff !important; }

/* Hide native thinking indicators */
.thinking-message, .thinking-dots, [class*="thinking"] {
  display: none !important;
}
```

### Common Mistakes
1. **Overriding user message background** → Changes bubble from teal to purple
2. **Using `data-theme="dark"` alone** → Doesn't match existing screenshots
3. **Forgetting feedback SVGs** → Appear as white circles

---

## Technical Learnings & Patterns

### Animation Patterns

| Pattern | Implementation |
|---------|----------------|
| Smooth scene transition | Match ending state of previous scene (e.g., zoomOffsetX) |
| Slide up + fade | `translateY` with decreasing value + opacity 0→1 |
| Thinking dots | 3 dots with cycling opacity via `frame % 18` |
| No pulsing | Use static values, not `Math.sin()` animations |

### Finger/Touch Animation Rules

| Scene | Finger Behavior |
|-------|-----------------|
| Typing | Tap input (frames 0-8) → disappears during typing |
| Send | No finger during pan → appears at send button (frames 12-25) |
| UserMessage/Thinking/Response | No finger |

### Spring Configurations
```typescript
// Snappy (quick settle)
{ damping: 25, stiffness: 200 }

// Bouncy (playful)
{ damping: 12, stiffness: 150 }

// Smooth (gentle)
{ damping: 30, stiffness: 80 }
```

---

## Coordinate System

### Phone Viewport (390 x 844)
```
┌─────────────────────────┐
│        Header           │ y: 0-80
├─────────────────────────┤
│                         │
│     Chat Messages       │ y: 80-650
│                         │
├─────────────────────────┤
│   Input Area            │ y: 650-720
│   [Input]  [Send]       │
│   x:250    x:43         │ y: 687
└─────────────────────────┘
```

### Key Coordinates
| Element | X | Y | Notes |
|---------|---|---|-------|
| Chat Input | 250 | 687 | RTL - input on right |
| Send Button | 43 | 687 | RTL - send on left |
| Thinking Dots | 20 | bottom: 210 | Overlay position |
| Native Bubble | 43 | 510 | Hidden via JS |

### Debug Coordinate Picker
Use `Debug-CoordinatePicker` or `Debug-V3-*` compositions in Remotion Studio to find exact positions.

---

## Troubleshooting Guide

### Problem: Screenshots appear in light mode
**Solution**: Inject full dark mode CSS, don't rely on `data-theme`

### Problem: User message bubble wrong color (purple instead of teal)
**Solution**: Remove background override from `.message.user` CSS

### Problem: Feedback SVGs appear as white circles
**Solution**: Add explicit fill/stroke colors for `.feedback-btn svg`

### Problem: Native thinking bubble still visible
**Solution**: Use position-based hiding (x:43, y:510 area) in addition to class selectors

### Problem: API route handler error after reload
**Solution**: Use `routeActive` flag to prevent fulfill after unroute

### Problem: Second AI message content empty
**Solution**: Wait for `aiCount >= 2 && content.length > 5` before capturing

### Problem: Scene transition "jumps"
**Solution**: Match starting state with previous scene's ending state (zoom, offset values)

---

## Future Plans

### Potential Enhancements
- [ ] Add more demo videos (different questions/features)
- [ ] Add sound effects for response appearance
- [ ] Add light leak transition effects
- [ ] Create English version of demos
- [ ] Add logo animation in intro/outro

### Video Ideas
- Dashboard overview demo
- Multi-turn conversation demo
- Feature comparison demo

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start Remotion Studio

# Capture Screenshots
npx tsx scripts/capture-user-message.ts           # V1 user message
npx tsx scripts/capture-video2-worker-hours.ts    # V2 full capture

# Render Videos
npm run render:v2        # Video 1 (revenue)
npm run render:v3        # Video 2 (worker hours)

# Debug
# Select Debug-CoordinatePicker or Debug-V3-* in Remotion Studio
```

---

## File References

### Source Code Locations
| File | Purpose |
|------|---------|
| `src/Root.tsx` | Composition registry |
| `src/compositions/MobileChatDemoRefactored.tsx` | V1 main composition |
| `src/compositions/MobileChatDemoV3.tsx` | V2 main composition |
| `src/compositions/MobileChatDemo/constants.ts` | V1 constants |
| `src/compositions/MobileChatDemoV3/constants.ts` | V2 constants |

### Assets Locations
| Type | Path |
|------|------|
| V1 Screenshots | `public/mobile/mobile-chat-*.png` |
| V2 Screenshots | `public/mobile/v2-*.png` |
| Audio | `public/audio/*.wav` |
| Rendered Videos | `out/*.mp4` |

---

**Maintained by**: Claude Code
**Project**: limor-video-poc
