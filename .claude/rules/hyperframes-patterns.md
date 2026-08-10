# HyperFrames Authoring Patterns

**Scope**: HyperFrames compositions (HTML + GSAP + data-attrs) — parallel stack to Remotion
**Authority**: MANDATORY for any HyperFrames scene authoring
**Evidence**: 2026-04-22 evaluation session (Basic Memory: `limor-video-poc/session-summaries/hyperframes-vs-remotion-evaluation-session-2026-04-22`)

---

## Core Rule

**HyperFrames is the parallel stack for motion-graphics, pitch-deck, and website-capture scenes. For WHEN to use it vs Remotion, invoke the `framework-selection` skill. For HOW to author scenes, follow these patterns.**

---

## 1. The `.clip` Layout Rule (load-bearing)

HyperFrames' `class="clip"` CSS absolute-positions the element for per-clip visibility scheduling. If applied to every child of the stage, flex-column layout collapses and all elements stack at (0,0).

```html
<!-- CORRECT: one class="clip" on root; content in .scene-content flex wrapper -->
<div
  id="stage"
  class="clip"
  data-composition-id="main"
  data-start="0"
  data-duration="7"
  data-track-index="0"
  data-width="1080"
  data-height="1920"
>
  <div class="bg-glow"></div>
  <!-- decoratives: no class="clip" -->
  <div class="scene-content">
    <!-- flex wrapper: no class="clip" -->
    <div id="title">...</div>
    <!-- content: no class="clip", no data-* -->
    <div id="subtitle">...</div>
  </div>
</div>
```

```css
.scene-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
```

**Anti-pattern**: `class="clip"` on `#title`, `#subtitle` → all children stack at (0,0).

## 2. Synchronous Timeline Registration

HyperFrames' capture engine reads `window.__timelines` synchronously after page load. **Never** register inside `async/await`, `setTimeout`, `DOMContentLoaded`, or Promise callbacks.

```js
// CORRECT
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
tl.to('#title', { opacity: 1, duration: 0.5 }, 0);
window.__timelines['main'] = tl;   // Sync, at module scope

// ANTI-PATTERN
document.addEventListener('DOMContentLoaded', () => {
  window.__timelines['main'] = gsap.timeline(...);   // Too late — engine missed it
});
```

## 3. Lottie Seek Pattern (inlined JSON + goToAndStop)

```html
<script id="lottie-data" type="application/json">
  {...pasted-minified-json...}
</script>
<script>
  const lottieData = JSON.parse(
    document.getElementById('lottie-data').textContent,
  );
  const anim = lottie.loadAnimation({
    container: document.getElementById('hand'),
    renderer: 'svg',
    loop: false,
    autoplay: false,
    animationData: lottieData, // INLINE — never async path:
  });

  const tl = gsap.timeline({ paused: true });
  tl.to(
    { t: 0 },
    {
      t: 1,
      duration: SECONDS,
      ease: 'none',
      onUpdate: function () {
        anim.goToAndStop(this.targets()[0].t * (TOTAL_FRAMES - 1), true);
      },
    },
    0,
  );
  window.__timelines['main'] = tl;
</script>
```

**Why inline**: `path:` is async XHR; races synchronous timeline registration. Inline JSON via `<script type="application/json">` loads synchronously.

## 4. Remotion → GSAP Translation Cheat Sheet

| Remotion primitive                                    | GSAP equivalent                                                                                                      |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `spring({ damping: 10, mass: 1.2 })` (bouncy)         | `ease: 'elastic.out(1, 0.45)'`                                                                                       |
| `spring({ damping: 15 })` (snappy)                    | `ease: 'back.out(1.5)'`                                                                                              |
| `spring({ damping: 20 })` (gentle)                    | `ease: 'power2.out'`                                                                                                 |
| `interpolate(frame, [A, B], [0, 1])`                  | `tl.to('#el', { opacity: 1, duration: (B-A)/30, ease: 'power2.out' }, A/30)`                                         |
| `interpolate(frame, [A, B, C, D], [0, 1, 1, 0])`      | Two `tl.to()` at `A/30` and `C/30`                                                                                   |
| `Math.floor(interpolate(f, [A,B], [0,N]))` — count-up | `tl.to({n:0}, {n:N, onUpdate(){ el.textContent = Math.floor(this.targets()[0].n) }}, A/30)`                          |
| Per-frame `Math.sin(frame * k)`                       | `tl.to({v:0}, {v:1, duration, ease:'none', onUpdate(){ const frame = this.targets()[0].v * TOTAL_FRAMES; ... }}, 0)` |

**Frame-to-seconds**: HyperFrames durations are in seconds. Convert Remotion frame numbers via `frameNum / fps` (typically `/30`).

## 5. Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

The compiler auto-fetches these and caches them to `~/.cache/hyperframes/fonts/` as deterministic `@font-face` rules. No manual download needed.

**Synonym font** (Fontshare-only, not on Google Fonts): substitute with `'Space Grotesk', sans-serif` at 600 weight. Visually near-identical.

## 6. CLI Commands

```bash
npx hyperframes init . --example blank --non-interactive --skip-skills  # scaffold
npx hyperframes lint                    # HTML structure + audio/image ID check
npx hyperframes validate                # WCAG contrast + runtime check
npx hyperframes render -f 30 -q standard -o renders/scene.mp4
npx hyperframes render -f 30 -q standard --crf 20        # override encoder quality
npx hyperframes snapshot                # per-frame PNG export
npx hyperframes capture <url>           # website-to-video (bypasses Cloudflare)
npx hyperframes benchmark               # auto-tune fps/quality/workers
npx hyperframes doctor                  # system deps check
```

**`validate` finds WCAG contrast violations** that Remotion ships silently. Always run after color/typography changes.

## 7. Render-Output Conventions

- MP4 at `renders/<name>.mp4` by convention
- Default 30fps, standard quality (CRF 23), H.264
- Extract verification frames: `ffmpeg -ss <t> -i renders/scene.mp4 -frames:v 1 probe-frames/t<t>.png`

## 8. Anti-Patterns (session evidence)

| Anti-pattern                                                   | Symptom                                  | Fix                                               |
| -------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| `class="clip"` on all content children                         | Layout collapse, all at (0,0)            | One root-only, use `.scene-content` wrapper       |
| Async Lottie load via `path:`                                  | Timeline seeks empty Lottie              | Inline JSON as `<script type="application/json">` |
| `window.__timelines['main'] = tl` in `DOMContentLoaded`        | Engine misses registration               | Register synchronously at module scope            |
| Inline `style="transform: translateX(-600px)"` with later GSAP | `gsap_css_transform_conflict` lint warn  | Use `gsap.set(el, { x: -600 })` instead           |
| **ANY** CSS-declared transform (stylesheet class, not just inline) on an element GSAP later animates with `x`/`y` | Silent: element snaps to the tween's origin. N stacked rows collapse onto ONE baseline | Let flexbox own layout, GSAP own entrance. Never position with `transform` an element you also tween |
| Exit tween scheduled BEFORE that element's entrance tween | Element stays visible for the REST of the film. No error, no warning | Assert `leaveTime > enterTime` at build time; fit staggers to the frame's real duration |
| `<audio>` without `id` attr                                    | Silent in rendered MP4                   | Always set `id` even if not referenced by JS      |
| Multiple `.html` files at root with `data-composition-id`      | Lint error: `multiple_root_compositions` | Keep only one root; move others to subdirs        |

## 9. The Imperative-Timeline Bug Class (2026-08-10, L.I.M.O.R film)

A GSAP timeline describes a SEQUENCE OF WRITES; a Remotion component describes WHAT IS
TRUE AT A FRAME. Two failure modes exist only on the timeline side, and neither errors:

1. **GSAP and CSS fight over `transform`.** Animating `y` writes `transform`, silently
   discarding any `translateY` a stylesheet set for layout. Three stacked lines rendered
   on top of each other, unreadable.
2. **Order is not validated.** Scheduling a fade-out at t=69.30 for an element that fades
   in at t=69.34 leaves it on screen permanently. It surfaced 30s later, in the middle of
   the brand reveal.

Both were invisible in the generator and only appeared in the finished MP4, where the
feedback loop is a ~7 minute render.

**Guard both at build time** — generators must refuse to emit:

```js
// exit-before-entrance: the element would never leave the screen
enters.forEach((enterTime, sel) => {
  const leaveTime = leaves.get(sel);
  if (leaveTime !== undefined && leaveTime <= enterTime) fail(sel);
});
// an undefined token stringifies to "NaN", which GSAP accepts and then animates nothing
if (/NaN/.test(generatedHtml)) fail('token lookup returned undefined');
```

Reference implementation: `scripts/build-limor-hf.mts` (all three guards, each proven to
fire on the real defect before it was fixed).

## See Also

- Skill `framework-selection` (this project) — when HF vs Remotion vs hybrid
- `~/hyperframes-test/` (on-disk reference projects, 4 gates + 4 pilot scenes)
- Basic Memory: `limor-video-poc/session-summaries/hyperframes-vs-remotion-evaluation-session-2026-04-22`

---

**Last Updated**: 2026-08-10 (+§9 imperative-timeline bug class + 2 anti-pattern rows — L.I.M.O.R film tournament); 2026-04-22 (initial — HyperFrames evaluation)
