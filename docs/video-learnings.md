# Video Production Learnings

Quick reference of what works and what doesn't, accumulated across renders.
Read this file before creating new compositions or scenes.

---

## Universal Patterns (apply to all compositions)

### Timing

- UI entrances: 20-30 frames (0.7-1s). Longer feels sluggish.
- Scene transitions: 15-20 frames overlap
- Hold after key content: 30-45 frames before transitioning
- Typing animation: 2-3 frames per character
- Button tap feedback: 8-12 frames for visual response

### Springs (from constants.ts SPRING_CONFIG)

- Button tap / quick actions: `quick` (damping:20, stiffness:200)
- Slide in / panel entrance: `snappy` (damping:15, stiffness:120)
- Gentle reveal / fade: `gentle` (damping:30, stiffness:80)
- Zoom in/out: `smooth` (damping:25, stiffness:100)
- Never inline spring configs — always use named presets (rule 11)

### Audio

- SFX volume with voiceover present: 0.2-0.4
- SFX volume standalone (no voiceover): 0.6-1.0
- Voiceover settings: stability=0.5, similarity_boost=0.75, style=0.3
- Audio `<Sequence>` must go INSIDE scene components (rule 1)
- SFX files: use `staticFile('audio/sfx/...')`, never CDN URLs (rule 32)

### Hand Cursor

- Phone mockup scenes: scale 0.8
- Full-screen compositions: scale 1.0
- Click animation duration: 15-20 frames (CLICK_ANIM_DURATION)
- All HandPathPoint.scale should be uniform (rule 3)
- `dark={true}` = light hand, `dark={false}` = dark hand (inverted, rule 9)

### Zoom & Pan

- Always reset ALL offsets on zoom-out (X, Y, scale → 0) (rule 2)
- Combined video: 120px global translateY offset
- Zoom state changes: animate over 15-20 frames, not instant

### Performance

- JPEG faster than PNG (use PNG only for transparency)
- `audioCodec: 'mp3'` faster than AAC in combining stage
- GPU CSS (box-shadow, blur, drop-shadow) slow on cloud renders
- `useMemo()` for expensive per-frame computations
- Avoid fetching remote resources during render

### Post-Processing

- 2x speed: ONLY `setpts=0.5*PTS` — NEVER minterpolate (rule 18)
- Isolate scenes for artifact debugging before touching post-processing (rule 18b)

---

## Composition-Specific Notes

### DorianDemo

- Phone: 390x844 viewport, baseScale 2.4, bezel #1a1a1a
- Colors: primary=#2DD4BF, primaryDark=#14B8A6, text=#1E293B
- Zoom states: normal=1.8, chat-zoom=2.76 (offsetY: -560)
- Shared components: DorianPhone/\* (StatusBar, DynamicIsland, NavHeader, AIBubble)
- Screenshots in public/dorian/woodmart/ are IRREPLACEABLE (Cloudflare blocks)

### MobileChatDemo

- Scene 3 (Typing): Finger tap frames 0-8, zoom with zoomOffsetX:-120
- Scene 4 (Send): Pan from input to send button, finger frames 12-25
- Scenes 5-7: No finger visible
- Thinking dots: bottom 210px position

---

## Per-Render History

(Append new render reviews below using the format from video-feedback-loop skill)
