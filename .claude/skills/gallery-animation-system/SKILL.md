---
name: gallery-animation-system
description: "Unified animation gallery with picker slots and star activation. Use when managing animation presets, building picker UIs for media types, or implementing single-source-of-truth asset registries."
user-invocable: false
---

# Gallery Animation System

## WHEN TO USE (Triggers)
1. When managing 20+ animation presets (gestures, pointers, effects)
2. When the same animation needs to appear in different pickers
3. When adding new animations without modifying picker components
4. When users need to activate/deactivate animations from a gallery
5. When animation data is scattered across multiple files

## FAILED ATTEMPTS
| # | Attempt | Why Failed | Lesson |
|---|---------|-----------|--------|
| 1 | Defined animations in each picker component separately | Duplicated definitions, out of sync between pickers | Single source of truth: galleryData.ts defines ALL animations |
| 2 | Hardcoded which animations appear in which picker | Adding new animation required editing 3 files | pickerSlot tag on each animation determines routing automatically |
| 3 | Star activation state in component state | Lost on page navigation, couldn't share between views | localStorage with custom event for cross-component sync |

## CORRECT PATTERN

### Gallery Data (Single Source of Truth)
```typescript
interface GalleryGesture {
  id: string;
  label: string;
  category: 'tap' | 'swipe-scroll' | 'touch-drag' | 'click-effects' | 'pointers' | 'sfx';
  installed: boolean;
  pickerSlot?: string;  // Routes to picker: 'hand:tap', 'pointer', 'click-effect'
  source?: string;      // Lottie file path or animation name
}

// galleryData.ts -- THE definitive list
const GESTURES: GalleryGesture[] = [
  { id: 'hand-tap-single', label: 'Single Tap', category: 'tap', installed: true, pickerSlot: 'hand:tap' },
  { id: 'cursor-real-black', label: 'Real Arrow Black', category: 'pointers', installed: true, pickerSlot: 'pointer' },
  { id: 'sfx-click-01', label: 'Click Sound', category: 'sfx', installed: true, pickerSlot: 'sfx' },
  // ... 26+ entries
];
```

### Picker Slot Routing
```typescript
function getBySlot(slot: string): GalleryGesture[] {
  return GESTURES.filter(g => g.pickerSlot === slot && g.installed);
}

// In Inspector: gesture picker
const tapAnimations = getBySlot('hand:tap');     // Only tap gestures
const pointers = getBySlot('pointer');            // Only pointer cursors
const clickEffects = getBySlot('click-effect');   // Only click effects
```

### Star Activation (localStorage + events)
```typescript
const ACTIVE_KEY = 'gallery-active-items';

function toggleActive(id: string) {
  const active = getGalleryActiveSet();
  if (active.has(id)) active.delete(id);
  else active.add(id);
  localStorage.setItem(ACTIVE_KEY, JSON.stringify([...active]));
  window.dispatchEvent(new Event('gallery-active-changed'));
}

function useGalleryActive() {
  const [activeSet, setActiveSet] = useState(getGalleryActiveSet);
  useEffect(() => {
    const handler = () => setActiveSet(getGalleryActiveSet());
    window.addEventListener('focus', handler);
    window.addEventListener('gallery-active-changed', handler);
    return () => { /* cleanup */ };
  }, []);
  return { activeSet, filterBySlot: (slot) => getBySlot(slot).filter(g => activeSet.has(g.id)) };
}
```

## EVIDENCE
| Metric | Value | Source |
|--------|-------|--------|
| Total animation entries | 26+ (gestures + pointers + effects) | galleryData.ts |
| Picker categories | 8 (tap, swipe, drag, click, cursors, pointer-anim, sfx) | pickerSlot routing |
| Files to edit for new animation | 1 (galleryData.ts only) | Single source of truth |
| Cross-component sync | Instant via custom events | localStorage + dispatchEvent |

## QUICK START (< 5 minutes)
1. **Define gallery data** (2 min): Array of entries with id, label, category, pickerSlot
2. **Create getBySlot** (30 sec): Filter function for picker routing
3. **Add activation state** (1 min): localStorage + custom event for sync
4. **Use in pickers** (1 min): `getBySlot('hand:tap').filter(inActiveSet)`
5. **Test** (30 sec): Add entry to gallery, verify it appears in correct picker
