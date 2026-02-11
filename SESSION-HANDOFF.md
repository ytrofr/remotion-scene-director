# LIMOR AI Demo Video - Session Handoff

**Last Updated**: 2026-02-09
**Project**: `$HOME/limor-video-poc/`

---

## Session 2026-02-09: DashmorDemo (Dashboard Scrolling Video)

### What Was Built

**DashmorDemo** - A 9:16 vertical video showing the Labor Cost V3 dashboard with:
- Phone mockup scrolling through 9 sections
- Scroll-synced hand gesture (ONLY animates during scroll)
- Sticky header that stays at top while content scrolls
- Section callouts with titles/subtitles
- Scene-based architecture with Sequences

### New Components Created

| Component | Location | Purpose |
|-----------|----------|---------|
| `ScrollSyncedHand` | `src/components/FloatingHand/ScrollSyncedHand.tsx` | Hand that ONLY animates during active scroll |
| `ScrollingHand` | `src/components/FloatingHand/ScrollingHand.tsx` | Static hand for simple scroll demos |
| `DebugSectionPickerInteractive` | `src/compositions/DashmorDemo/DebugSectionPickerInteractive.tsx` | Interactive tool to find scroll positions |

### DashmorDemo File Structure
```
src/compositions/DashmorDemo/
├── DashmorDemo.tsx                    # Main composition with Sequences
├── constants.ts                       # Sections, timing, colors
├── DebugSectionPickerInteractive.tsx  # Debug tool with on-screen controls
└── scenes/
    ├── index.ts
    ├── types.ts
    ├── shared.tsx            # PhoneFrame, ScrollableContent (sticky header), Callout
    ├── IntroScene.tsx
    ├── SectionScene.tsx      # Generic (reused for all sections)
    └── OutroScene.tsx
```

### Current Section Values

| # | ID | Name | scrollY | Status |
|---|-----|------|---------|--------|
| 0 | header | Header & Summary | 0 | ✅ |
| 1 | summary-cards | Summary Cards | 750 | ✅ |
| 2 | main-data | Main Data Section | 1500 | ✅ |
| 3 | shift-status | Shift Status | 2300 | ✅ |
| 4 | forecast | Forecast Section | 3180 | ✅ |
| 5 | analytics | Analytics | 4400 | ✅ |
| 6 | details | Detailed Reports | 5820 | ✅ |
| 7 | section-7 | Section 7 | 6800 | ⚠️ Verify |
| 8 | section-8 | Section 8 | 7800 | ⚠️ Verify |

---

## Key Patterns Learned (2026-02-09)

### 1. Scroll-Synced Hand Animation
**Problem**: Lottie animations loop independently, not synced with scroll.

**Solution**: Control playback rate based on scroll state:
```tsx
const playbackRate = isScrolling ? 2 : 0.001;
// When scrolling: animate fast (2x)
// When paused: freeze (0.001x - nearly stopped)
```

### 2. Static Scroll Hand Pattern
For scroll demos, the hand should:
- Stay in ONE PLACE (doesn't move)
- Use `hand-scroll-clean` animation (dark finger, no arrow)
- Tilt 20° to the left (`rotation: -20`)
- No floating/velocity effects
- Screen scrolls while hand stays still

### 3. Scene Debug Methodology ★
**Standard workflow for finding scroll positions:**

1. Open `Debug-DashmorSections` composition
2. Click section buttons on LEFT to select section
3. Click +/- buttons on RIGHT to adjust scrollY
4. Find position where key content is at top of phone
5. Record values and update `constants.ts`

**Controls:**
- `-100` / `+100` - Big jumps
- `-10` / `+10` - Small steps
- `-1` / `+1` - Fine tuning

### 4. Sticky Header Pattern
**Problem**: App header should stay fixed while content scrolls.

**Solution**: Overlay the header portion on top:
```tsx
{/* Scrolling content */}
<div style={{ transform: `translateY(${-scrollY * scale}px)` }}>
  <Img src={fullPageImage} />
</div>

{/* Sticky header overlay */}
<div style={{
  position: 'absolute',
  top: 0,
  height: headerHeight,
  overflow: 'hidden',
  zIndex: 10,
  boxShadow: scrollY > 10 ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
}}>
  <Img src={fullPageImage} />
</div>
```

### 5. Lottie Animation Editing
To remove elements from Lottie JSON:
1. Open the JSON file
2. Find the `layers` array
3. Remove unwanted layers (identified by `nm` property)
4. Example: Removed arrow from `hand-scroll-clean.json`

---

## Quick Commands (DashmorDemo)

```bash
# Start Remotion Studio
npm run dev
# Or if port 3000 busy:
npx remotion studio --port 3001

# Debug scroll positions
# Select: Debug-DashmorSections

# Preview full video
# Select: DashmorDemo

# Render
npx remotion render DashmorDemo out/dashmor-demo.mp4
```

---

## Next Steps for DashmorDemo

1. [ ] Verify sections 7-8 scroll positions using Debug tool
2. [ ] Update section names/callouts for 7-8 based on content
3. [ ] Preview full video and adjust timing if needed
4. [ ] Render final video

---

## Previous Session: AI Chat Demo (2026-02-08)

### Structure
```
src/compositions/
├── MobileChatDemoV2        # Main mobile chat demo
├── MobileChatDemoV3        # Alternative question
├── DorianDemo              # Dorian-specific demo
└── DashmorDemo             # Dashboard scrolling (NEW)
```

### Key Screenshots
- `public/mobile/` - Mobile chat screenshots
- `public/dashmor/labor-v3-fullpage-mobile.png` - Full dashboard (780x20806px)

---

## Hand Component Reference

| Component | Use Case |
|-----------|----------|
| `FloatingHand` | Moving hand that follows a path |
| `ScrollingHand` | Simple static scroll hand |
| `ScrollSyncedHand` | Hand synced with scroll state (pauses/plays) |

### Available Lottie Animations
- `hand-click` - Button clicks
- `hand-tap` - Quick taps
- `hand-scroll-clean` - ★ Scroll gesture (dark finger, no arrow)
- `hand-swipe-up` - Vertical swipe (has arrow)
- `hand-drag` - Drag and drop
- `hand-pinch` - Pinch zoom

---

## Key Learnings Summary

1. **Hand stays still, content moves** - For scroll demos, don't move the hand
2. **Sync animation with state** - Use playbackRate to freeze/play Lottie
3. **Interactive debug tools** - On-screen buttons work better than Remotion props
4. **Sticky header = overlay** - Clip and overlay header portion of image
5. **Scene architecture** - Use Sequences for better organization

---

**Ready to continue**: Select compositions in Remotion Studio or ask for specific changes!
