---
name: video-storyboard
description: 'Structured video planning with art direction, scene breakdown, and asset inventory. Use when creating new video compositions or planning multi-scene productions.'
---

# Video Storyboard — Structured Scene Planning

## When to Use

- Creating a new video composition from scratch
- Planning a multi-scene product demo or explainer
- Defining visual style before implementation
- Coordinating assets across scenes

---

## Step 1: Art Direction Document

Create a markdown file defining the visual identity. This gives Claude consistent style context.

```markdown
# Art Direction — [Video Name]

## Visual Style

- **Mood**: Professional, modern, approachable
- **Color palette**: Primary #2DD4BF, Secondary #1E293B, Accent #F59E0B
- **Typography**: Rubik (400/600/700), clean sans-serif
- **Background**: Dark gradient (#0F172A → #1E293B)

## Motion Style

- **Entrances**: Slide up with spring (damping: 15, stiffness: 120)
- **Transitions**: Light leaks between scenes, crossfade within scenes
- **Timing**: Snappy (0.3-0.5s animations), no lingering
- **Hand cursor**: Click gesture with pointer animation

## Brand Elements

- Logo placement: Top-left or centered intro
- Phone mockup: iPhone 14 Pro (390x844), dark bezel
- Screenshots: Real app captures from public/dorian/
```

## Step 2: Scene Breakdown

Define each scene with timing, content, and transitions.

```markdown
# Storyboard — [Video Name]

## Scene Flow

| #   | Scene     | Duration | Content                         | Transition In |
| --- | --------- | -------- | ------------------------------- | ------------- |
| 1   | Intro     | 2s       | Logo fade-in + tagline          | None          |
| 2   | Problem   | 3s       | Pain point text animation       | Light leak    |
| 3   | Solution  | 4s       | App screenshot + hand demo      | Slide         |
| 4   | Feature 1 | 3s       | Browse products + scroll        | Crossfade     |
| 5   | Feature 2 | 3s       | AI chat interaction             | Crossfade     |
| 6   | CTA       | 2s       | Download now + app store badges | Light leak    |

**Total**: ~17s at 30fps = 510 frames

## Scene Details

### Scene 1: Intro (60 frames)

- Frame 0-15: Black → logo fade in (spring)
- Frame 15-45: Tagline slides up below logo
- Frame 45-60: Hold

### Scene 2: Problem (90 frames)

- Frame 0-30: "Shopping online is broken" types in
- Frame 30-60: Pain points appear as bullet list
- Frame 60-90: Fade out
```

## Step 3: Asset Inventory

```markdown
# Assets — [Video Name]

## Screenshots (from public/)

- [ ] dorian/home-screen.png — Main marketplace view
- [ ] dorian/product-detail.png — Product page
- [ ] dorian/ai-chat.png — AI assistant conversation

## Generated Assets (Claude creates)

- [ ] SVG logo animation
- [ ] Background gradient component
- [ ] Text animation components

## Audio

- [ ] Voiceover: ElevenLabs (Rachel voice)
- [ ] SFX: whoosh.wav (transitions), mouse-click.wav (taps)
- [ ] Background: none / subtle ambient

## Lottie Animations

- [ ] hand-click — cursor pointer click gesture
- [ ] cursor-arrow — pointer cursor
```

## Step 4: Implementation Checklist

```markdown
## Implementation Order

1. [ ] Create composition in Root.tsx with correct dimensions/fps
2. [ ] Build shared components (if new patterns needed)
3. [ ] Implement scenes 1-by-1 in order
4. [ ] Add hand animations via SceneDirector
5. [ ] Add audio (SFX + voiceover if applicable)
6. [ ] Add transitions between scenes
7. [ ] Preview full video in Remotion Studio
8. [ ] Polish timing and animations
9. [ ] Render final video
```

---

## Templates

### Product Demo (Phone Mockup)

Best for: App showcases, feature walkthroughs

- Phone in center, hand cursor interacting
- 6-10 scenes, 15-30 seconds
- Uses: DorianPhoneMockup, FloatingHand, ScrollSyncedHand

### Motion Graphics (Full Screen)

Best for: Marketing videos, explainers, social media

- Full 1080x1920 canvas, text animations, shapes
- 4-8 scenes, 10-20 seconds
- Uses: noise backgrounds, shapes, animated emoji, light leaks

### Narrated Explainer

Best for: Product tours, tutorials, onboarding

- Voiceover + captions + visual content
- Dynamic duration from audio length
- Uses: voiceover-pipeline skill, captions, calculateMetadata
