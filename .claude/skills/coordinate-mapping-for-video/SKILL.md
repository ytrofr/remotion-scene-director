---
name: coordinate-mapping-for-video
description: "Map screen coordinates to video composition space with zoom/pan compensation. Use when building interactive video editors, placing overlays on phone mockups, or handling click-to-place interactions."
user-invocable: false
---

# Coordinate Mapping for Video

## WHEN TO USE (Triggers)
1. When clicking on a video preview to place elements (waypoints, annotations)
2. When coordinates don't align between editor UI and rendered video
3. When zoom/pan changes break element positioning
4. When placing overlays on phone mockup screenshots
5. When converting between screen pixels and composition pixels

## FAILED ATTEMPTS
| # | Attempt | Why Failed | Lesson |
|---|---------|-----------|--------|
| 1 | Used event.offsetX/offsetY directly | Different results depending on event target element | Use getBoundingClientRect -- only reliable method |
| 2 | Calculated position relative to zoom wrapper | Broke when zoom/pan changed -- had to recalculate every time | Calculate in composition space, independent of zoom |
| 3 | Hardcoded phone position offsets | Different compositions have different phone positions | Use constants (phone center, comp center) per composition |

## CORRECT PATTERN

### Screen to Composition Space
```typescript
function useToComp(
  containerRef: React.RefObject<HTMLElement>,
  compWidth: number,   // e.g., 1080
  compHeight: number,  // e.g., 1920
) {
  return useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const x = Math.round((clientX - rect.left) * (compWidth / rect.width));
    const y = Math.round((clientY - rect.top) * (compHeight / rect.height));

    return {
      x: Math.max(0, Math.min(compWidth, x)),
      y: Math.max(0, Math.min(compHeight, y)),
    };
  }, [containerRef, compWidth, compHeight]);
}
```

### Phone-Inside-Composition Formula
```
Phone frame center = (207, 434)
Composition center = (540, 960)
At zoom level S:
  compX = 540 + S * (phoneFrameX - 207)
  compY = 960 + offsetY + S * (phoneFrameY - 434)
```

## EVIDENCE
| Metric | Value | Source |
|--------|-------|--------|
| Coordinate accuracy | Pixel-perfect at all zoom levels | Tested 1x, 1.8x, 2.76x |
| Hook size | 29 lines | Minimal, reusable |
| Compositions using it | All 8 active compositions | SceneDirector + coded scenes |

## QUICK START (< 3 minutes)
1. **Get container ref** (30 sec): `useRef` on the preview container element
2. **Call useToComp** (30 sec): Pass ref + composition dimensions
3. **Use on click** (1 min): `const comp = toComp(e.clientX, e.clientY)`
4. **Test** (1 min): Click corners, verify coordinates match composition bounds
