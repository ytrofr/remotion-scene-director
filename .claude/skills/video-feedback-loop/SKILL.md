---
name: video-feedback-loop
description: 'Self-learning feedback loop for video production. Captures what worked/failed after each render, accumulates learnings across sessions, and improves future videos. Use after rendering a video or when reviewing video quality.'
---

# Video Feedback Loop — Self-Learning System

## How It Works

Every video render triggers a feedback cycle:

```
Render → Review → Capture Learnings → Store → Next Video Uses Learnings
```

Claude gets better at making videos for THIS project because learnings accumulate in
`docs/video-learnings.md` and memory. Each new video benefits from all past mistakes.

---

## When to Trigger

- After any `npx remotion render` or `npm run render:*` completes
- When user says "that looks wrong" / "fix the timing" / "the animation is off"
- When reviewing video output in Remotion Studio
- After any significant scene iteration (3+ prompt cycles on same scene)

---

## Step 1: Post-Render Review Checklist

After rendering, evaluate these categories:

```markdown
### Render Review: [Composition] — [Date]

**Visual Quality**

- [ ] Animations smooth (no jank/stutter)
- [ ] Colors match art direction
- [ ] Text readable at target size
- [ ] No overlapping elements
- [ ] Hand cursor follows intended path

**Timing**

- [ ] Scene transitions feel natural
- [ ] No dead frames (empty/static content)
- [ ] Audio synced with visuals
- [ ] Total duration appropriate

**Technical**

- [ ] No console errors during render
- [ ] File size reasonable for content
- [ ] Render time acceptable
- [ ] No webpack cache issues

**What Worked Well**

- (note specific animations, timings, or patterns that looked good)

**What Needs Improvement**

- (note specific issues with frame numbers if possible)

**Root Cause (if issues found)**

- (why did the issue happen — wrong spring config? stale offset? etc.)
```

## Step 2: Capture Learnings

After review, append findings to `docs/video-learnings.md`:

```markdown
## [YYYY-MM-DD] [Composition Name] — Render #N

### What Worked

- Spring config `snappy` (damping:20, stiffness:200) perfect for UI transitions
- Light leak hueShift=30 (warm orange) looks professional between scenes
- Hand cursor at 0.8 scale feels natural on phone mockup

### What Failed

- Text animation too slow at 45 frames — reduced to 25 frames
- Zoom offset not reset after Scene 5 — left stale translateX
- Audio SFX too loud relative to voiceover — need volume:0.3

### Learnings (Reusable)

- **[timing]** UI element entrances: 20-30 frames max. Longer feels sluggish.
- **[spring]** For button taps: use `quick` preset, not `gentle`
- **[audio]** SFX volume should be 0.2-0.4 when voiceover is present
- **[hand]** Scale 0.8 for phone demos, 1.0 for full-screen compositions

### Applied Fix

- Changed spring from `gentle` to `quick` in Scene5
- Added zoom offset reset in Scene5 exit
- Set SFX volume to 0.3
```

## Step 3: Update Project Memory

After capturing learnings, check if any are worth persisting:

**Promote to rule** (`remotion-patterns.md`) if:

- Same mistake happened 2+ times
- It's a pattern that applies to ALL compositions
- Breaking it causes visible artifacts

**Promote to memory** (`MEMORY.md`) if:

- It's project-specific context (e.g., "Dorian scenes look best with warm light leaks")
- It's a preference that should persist across sessions

**Keep in learnings doc** if:

- It's composition-specific
- It's a one-time observation
- It might not apply broadly

## Step 4: Feed Forward

When starting a new composition or scene, Claude should:

1. Read `docs/video-learnings.md` for recent patterns
2. Apply known-good settings (springs, timings, volumes)
3. Avoid known-bad patterns
4. Reference successful compositions as templates

---

## Learnings File Format

`docs/video-learnings.md` structure:

```markdown
# Video Production Learnings

Quick reference of what works and what doesn't, accumulated across renders.

## Universal Patterns (apply to all compositions)

### Timing

- UI entrances: 20-30 frames
- Scene transitions: 15-20 frames
- Hold after key content: 30-45 frames

### Springs

- Button tap: `quick` (damping:20, stiffness:200)
- Slide in: `snappy` (damping:15, stiffness:120)
- Gentle reveal: `gentle` (damping:30, stiffness:80)

### Audio

- SFX volume with voiceover: 0.2-0.4
- SFX volume without voiceover: 0.6-1.0
- Voiceover: stability 0.5, similarity 0.75

### Hand Cursor

- Phone mockup scale: 0.8
- Full-screen scale: 1.0
- Click duration: 15-20 frames

## Per-Composition History

(Append each render review below)
```

---

## Integration with SceneDirector

SceneDirector already captures hand path data. The feedback loop extends this:

1. **Timeline feedback**: If hand timing feels off, adjust waypoint frames and note the correction
2. **Gesture feedback**: If click animation speed doesn't match content, note the optimal `clickSpeed`
3. **Layer feedback**: If audio layers need volume adjustment, note per-scene volumes
4. **Export feedback**: When exporting from SceneDirector, compare coded paths with final render

---

## Automation Hooks

For future automation, these could be Claude Code hooks:

```yaml
# .claude/hooks/post-render.sh (future)
# After npx remotion render completes:
# 1. Open rendered video for review
# 2. Prompt Claude for feedback capture
# 3. Auto-append to learnings doc
```

Currently manual: after render, tell Claude "review the render" or "capture learnings".
