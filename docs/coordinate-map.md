# UI Element Coordinate Map

Reference for hand gesture waypoint coordinates. All values are **composition-space** coordinates — use these directly in `codedPaths.ts` waypoints.

## Coordinate Formulas (Vertical 1080x1920)

For phone mockup compositions (DorianDemo, DorianStores):

```
compX = 540 + scale * (phoneX - 207)
compY = 960 + offsetY + scale * (phoneY - 434)
```

- **Phone frame center**: (207, 434) in phone-space
- **Composition center**: (540, 960) in comp-space
- **scale**: zoom level (1.8 = normal, 2.4-2.76 = zoomed in)
- **offsetY**: vertical pan offset at the given zoom level

---

## DorianDemo (1080x1920, 30fps)

### 2-HomeScroll (scroll gesture)

| UI Element          | Comp (x,y)  | Frames | Notes                    |
| ------------------- | ----------- | ------ | ------------------------ |
| Entry point (right) | (1050, 960) | 0      | Cursor enters from right |
| Scroll center       | (780, 960)  | 20-125 | Scroll drag zone         |

### 3-TapBubble (click gesture, dark=true)

| UI Element   | Comp (x,y)  | Frames | Notes                 |
| ------------ | ----------- | ------ | --------------------- |
| Entry area   | (780, 1200) | 0      | Approach from above   |
| AI Bubble    | (818, 1546) | 53     | Approach position     |
| Bubble click | (518, 992)  | 73     | Click target (zoomed) |

### 4-ChatOpen (click gesture, dark=true)

| UI Element      | Comp (x,y)  | Frames | Notes                    |
| --------------- | ----------- | ------ | ------------------------ |
| Starting pos    | (518, 992)  | 0      | Continues from TapBubble |
| Chat input area | (480, 1520) | 45     | Approach                 |
| Input click     | (480, 1550) | 48     | Click target             |

### 5-UserTyping (click gesture, dark=true)

| UI Element  | Comp (x,y)  | Frames  | Notes             |
| ----------- | ----------- | ------- | ----------------- |
| Chat area   | (750, 1520) | 70      | Starting position |
| Input field | (720, 1490) | 100-105 | Click target      |

### 7-AIResponse (click gesture, dark=true)

| UI Element  | Comp (x,y)  | Frames | Notes             |
| ----------- | ----------- | ------ | ----------------- |
| Chat area   | (540, 1600) | 70     | Starting position |
| AI response | (540, 1450) | 95     | Click target      |

### 8-ProductPage (scroll gesture, dark=true)

| UI Element    | Comp (x,y)  | Frames  | Notes                    |
| ------------- | ----------- | ------- | ------------------------ |
| Entry (right) | (1050, 960) | 105     | Cursor enters from right |
| Scroll center | (780, 960)  | 115-145 | Scroll drag zone         |

---

## DorianStores (1080x1920, 30fps)

### 1-StoreDashboard (frames 0-570)

**Zoom levels**: S=1.8 (normal), S=2.75 (chat zoom, offsetY=-374), S=2.4 (confirm, offsetY=-200)

| UI Element     | Phone-space | Zoom | Comp (x,y)  | Frames  | Notes                    |
| -------------- | ----------- | ---- | ----------- | ------- | ------------------------ |
| AI Bubble      | (359, 758)  | 1.8  | (814, 1543) | 10-55   | Bottom-right teal circle |
| Chat Input     | (207, 826)  | 2.75 | (540, 1664) | 85-200  | After zoom to chat       |
| Send Button    | (365, 826)  | 2.75 | (975, 1664) | 200-210 | Right side of input      |
| Confirm Button | (207, 805)  | 2.4  | (540, 1650) | 480-510 | Secondary layer          |

**Audio sync points**: bubble-tap@55, slide@65, input-tap@100, typing@105-200, send@205, response@240

### 2-MapSearch (frames 0-180)

| UI Element | Phone-space | Zoom | Comp (x,y) | Frames  | Notes                      |
| ---------- | ----------- | ---- | ---------- | ------- | -------------------------- |
| Search Bar | (207, 190)  | 1.8  | (540, 521) | 5-18    | Approximated as (540, 550) |
| Map Pin    | (208, 328)  | 1.8  | (542, 769) | 120-150 | Approximated as (542, 769) |

**Audio sync points**: search-tap@18, typing@22-72, pins@80-112, pin-click@150

### 3-AIProducts (frames 0-280)

| UI Element       | Phone-space | Zoom | Comp (x,y)  | Frames  | Notes              |
| ---------------- | ----------- | ---- | ----------- | ------- | ------------------ |
| Chat Input       | (207, 826)  | 2.6  | (540, 1630) | 5-12    | Zoomed input field |
| Send Button      | (365, 826)  | 2.6  | (951, 1630) | 62-70   | Right of input     |
| Add to Store Btn | (207, 760)  | 1.8  | (540, 1547) | 210-228 | Secondary layer    |

**Audio sync points**: input-tap@12, typing@16-61, send@68, thinking@110, cards@145-190, add-btn@225

---

## SigmaAppDemo (1920x1080, 30fps, landscape)

**No phone mockup** — direct composition coordinates. Chat panel: right side, x range ~1240-1880.

### Constants

| Element           | Coordinates  | Notes            |
| ----------------- | ------------ | ---------------- |
| SIGMA_INPUT       | (1500, 1010) | Chat input bar   |
| SIGMA_SEND        | (1820, 1010) | Send button      |
| SIGMA_CHAT_CENTER | (1560, 500)  | Chat area center |
| SIGMA_LINK_AREA   | (1450, 780)  | Result link area |

### HubChatOpen (point gesture)

| UI Element           | Comp (x,y)   | Frames | Notes         |
| -------------------- | ------------ | ------ | ------------- |
| Entry (bottom-right) | (1920, 900)  | 50     | Cursor enters |
| Chat welcome         | (1560, 500)  | 120    | Hover area    |
| Input field          | (1500, 1010) | 160    | End position  |

### WebsiteRequest (click gesture)

| UI Element  | Comp (x,y)   | Frames  | Notes         |
| ----------- | ------------ | ------- | ------------- |
| Input field | (1500, 1010) | 25-30   | Click to type |
| Send button | (1820, 1010) | 118-125 | Click to send |
| Result link | (1450, 780)  | 290-300 | Click result  |

**Audio sync points**: input-click@28, typing@35-115, send@123, routing@136, notification@228, chime@278

### PageReveal (point gesture, no clicks)

| UI Element  | Comp (x,y) | Frames | Notes                 |
| ----------- | ---------- | ------ | --------------------- |
| Top area    | (700, 400) | 10     | Page observation      |
| Mid area    | (600, 500) | 80     | Scrolling observation |
| Bottom area | (500, 600) | 160    | Continue watching     |

### CreativeRequest (click gesture)

| UI Element  | Comp (x,y)   | Frames  | Notes             |
| ----------- | ------------ | ------- | ----------------- |
| Input field | (1500, 1010) | 1-3     | Click to type     |
| Send button | (1820, 1010) | 58-63   | Click to send     |
| Banner area | (1400, 850)  | 210-250 | Hover over result |

**Audio sync points**: input-click@3, typing@5-55, send@63, routing@76, notification@168, sparkle@193

### CreativeReveal (point gesture, no clicks)

| UI Element   | Comp (x,y) | Frames | Notes             |
| ------------ | ---------- | ------ | ----------------- |
| Center top   | (960, 400) | 10     | Page observation  |
| Center       | (800, 500) | 60     | Mid scroll        |
| Lower center | (700, 600) | 120    | Continue watching |

### Closing (point gesture, dark=true)

| UI Element | Comp (x,y) | Frames  | Notes            |
| ---------- | ---------- | ------- | ---------------- |
| Center     | (960, 540) | 200-400 | Resting position |

---

## Available SFX Files

| File                              | Use for                         | Typical volume |
| --------------------------------- | ------------------------------- | -------------- |
| `audio/sfx/mouse-click.wav`       | Button clicks, bubble taps      | 0.6            |
| `audio/sfx/soft-click.wav`        | Input field taps, subtle clicks | 0.5            |
| `audio/send-click.wav`            | Send button clicks              | 0.6            |
| `audio/typing-soft.wav`           | Typing sounds (long duration)   | 0.3            |
| `audio/sfx/slide.wav`             | Panel slides, chat open/close   | 0.3-0.4        |
| `audio/sfx/whoosh.wav`            | AI response, fast transitions   | 0.4-0.5        |
| `audio/sfx/swoosh-transition.wav` | Scene transitions, morphs       | 0.4            |
| `audio/sfx/chime.wav`             | Success, elements appearing     | 0.3-0.35       |
| `audio/sfx/pop-up.wav`            | Cards/items appearing (stagger) | 0.3-0.5        |
| `audio/sfx/notification.wav`      | AI thinking, badge appear       | 0.25-0.3       |
| `audio/sfx/sparkle.wav`           | Quality badges, special reveals | 0.3            |
| `audio/sfx/bass-impact.wav`       | Logo reveals, heavy emphasis    | 0.35           |
| `audio/sfx/switch.wav`            | Toggle, mode change             | 0.7            |
