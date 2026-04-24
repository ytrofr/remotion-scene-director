# HF Auto-Sync on Save — SceneDirector → HyperFrames (Option B)

**Scope**: Dorian scenes authored visually in SceneDirector that ALSO exist as HF HTML
**Authority**: MANDATORY for any scene wired with auto-sync markers
**Evidence**: 2026-04-24 — scene 4 cursor was missing chat input by 102px in y; one save re-generated correct HF cursor block.

---

## Core Rule

**When a Dorian scene has markers `// @auto-generated-from-scene-director:start/:end` in its HF HTML, the cursor path between them is OWNED by SceneDirector. Never hand-edit that block. Save in SceneDirector → block regenerates from waypoints.**

Code OUTSIDE the markers is user-owned: title fades, panel slides, class toggles, scene-specific side-effects, `<audio>` tags, anything non-cursor. The exporter only touches the block between markers.

## When to Apply

- Adding auto-sync to a new HF scene (wire once, then always save through SceneDirector)
- Editing an HF scene that already has markers → route the edit through SceneDirector, never inline HF
- Debugging a cursor-position mismatch between Remotion and HF → check if markers are present + current

## Wiring a Scene (First Time)

1. Read the scene's current cursor block in `hf/scenes/<NN>-<name>.html`
2. Extract `TIP_X`, `TIP_Y`, `setC` helper vars — keep OUTSIDE markers
3. Extract scene-specific side-effects (e.g. `classList.add('focused')`) into a separate `tl.call()` BEFORE the markers block; re-timed to match Remotion's click frame
4. Replace the cursor path, gsap.set, ripple, fade-out chain with:
   ```html
   // @auto-generated-from-scene-director:start //
   @auto-generated-from-scene-director:end
   ```
5. In SceneDirector, select the scene and hit **Save** — the markers block auto-populates from `codedPaths.data.json`
6. Render the scene standalone via `npx hyperframes render` and visually verify cursor lands on target

## What Gets Auto-Generated

| Input (waypoint)                | Output (HF GSAP)                                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| First waypoint `{x, y, frame}`  | `gsap.set('#cursor', { opacity: frame>0 ? 0 : 1, rotation: wp.rotation\|\|0, ...setC(x, y) });` + `tl.to opacity:1` at frame if frame>0         |
| Pointer waypoint                | `tl.to('#cursor', { ...setC(x, y), duration: d/30, ease: 'power2.out' }, prevFrame/30);`                                                        |
| Drag waypoint (rotation ≠ prev) | `tl.to('#cursor', { rotation: N, duration: d/30 }, prevFrame/30);` — rotation-only emission if same position                                    |
| Click waypoint                  | lottie `seek(35)` tl.call + ripple tl.set + ripple tl.to + cursor fade-out tl.to at `frame+clickDur`                                            |
| Re-show after prior click       | `tl.set('#cursor', { ...setC(wp.x, wp.y) }, hiddenSince/30)` + `tl.to opacity:1` at wp.frame — instant jump while invisible, no animated travel |
| `secondaryLayers[]`             | Each layer processed independently on the shared `#cursor`: tl.set pin at prior fade-out frame + fade-in at layer's first waypoint              |

**NOT auto-generated** (user-owned): class toggles, content mutations, title/panel animations, `<audio>` tags.

**Secondary layers MUST be time-disjoint** — primary's last click fades cursor out, then sec[0] re-shows at its first waypoint, etc. Overlapping layers would collide on the single `#cursor` element.

## API Contract

`POST /api/save-path` response:

```json
{
  "success": true,
  "hfSync": {
    "updated": true, // file was modified
    "hfFile": "04-chatopen.html"
  }
}
```

Alternate `hfSync.updated=false` reasons:

- `"no-op"` — generated block matches existing; no write
- `"no HF file: <name>"` — Remotion scene has no HF counterpart
- `"markers absent in <file>"` — scene not yet wired (first-time setup needed)
- `"scene name format: <X>"` — sceneName doesn't match `^\d+-Name$`

## Stop-Ship Criteria

If auto-generated HF cursor lands in WRONG visual position, HALT rollout. Likely causes:

- HF scene has different phone-stage transform than Remotion's zoom level (coord-system divergence)
- Scene has multi-layer cursors (translator only handles primary layer)
- Remotion waypoints were themselves wrong — fix in SceneDirector first

## Implementation

`scripts/hf-exporter.mjs` (~180 LOC): `waypointsToHfBlock()`, `processLayer()`, `emitMove()`, `sceneNameToHfFilename()`, `updateHfScene()`.
Integration in `vite.config.ts` `/api/save-path` middleware — allowlist: `DorianFull`, `DorianDemo`.

## Health Check

`npm run doctor:dual-stack` — read-only lint for the auto-sync pipeline. 6 checks:

1. Every wired HF scene has `setC` helper + `#cursor` + `#ripple` elements
2. No hand-authored `tl.(to|set)('#cursor')` OUTSIDE markers (prevents drift)
3. Scene entry exists in `codedPaths.data.json` (so Save round-trips)
4. Block byte-exactly matches exporter output (detects stale auto-gen)
5. Scenes in chat-zoom range (4-9) with `#phone-stage` → verify scale 1.528
6. `vite.config.ts` allowlist includes `DorianFull` + `DorianDemo`

Exits 1 on any problem. Run after merges, before renders, after mass edits.

## Companion Rules

- `.claude/rules/dorian-dual-stack.md` — HF/Remotion split + coord-system equivalence
- `.claude/rules/hyperframes-patterns.md` — general HF authoring (not SceneDirector-specific)
- `.claude/rules/remotion-patterns.md` rule 42 — composition-space cursor coords

---

**Last Updated**: 2026-04-24
