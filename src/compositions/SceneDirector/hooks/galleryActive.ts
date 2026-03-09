/**
 * galleryActive — derives picker lists from gallery data (single source of truth).
 * Used by Inspector + Toolbar to filter available animations/pointers/click effects.
 *
 * Matching rules:
 *   - Hand animations: pickerSlot 'hand:{gesture}' → direct ID match
 *   - Pointers: pickerSlot 'pointer' → direct ID match
 *   - Click effects: pickerSlot 'click-effect' → match if ANY combined pointer-animation
 *     using that style is active (e.g., cursor-real-anim-black-click-burst-soft-xs)
 *     OR if the standalone sunburst is active (click-sunburst-soft-xs)
 */

import { useState, useEffect } from 'react';
import { GESTURES } from '../panels/galleryData';
import type { GestureTool } from '../gestures';

const ACTIVE_KEY = 'gallery-active-items';

/** Derive picker list from gallery entries by pickerSlot */
function getBySlot(slot: string): { id: string; label: string }[] {
  return GESTURES.filter((g) => g.pickerSlot === slot).map((g) => ({
    id: g.id,
    label: g.label,
  }));
}

/** All gallery items that belong to a picker — used as default active set */
const DEFAULT_ACTIVE_IDS = GESTURES.filter((g) => g.pickerSlot).map(
  (g) => g.id,
);

export function getGalleryActiveSet(): Set<string> {
  try {
    const stored = JSON.parse(
      localStorage.getItem(ACTIVE_KEY) || '[]',
    ) as string[];
    // If nothing stored, return defaults (all picker items active)
    if (stored.length === 0 && DEFAULT_ACTIVE_IDS.length > 0) {
      return new Set(DEFAULT_ACTIVE_IDS);
    }
    return new Set(stored);
  } catch {
    return new Set(DEFAULT_ACTIVE_IDS);
  }
}

/**
 * Hook that reads the active set on mount and listens for changes.
 * Re-reads when the component re-mounts (e.g., switching from gallery back to editor).
 */
export function useGalleryActive() {
  const [activeSet, setActiveSet] = useState<Set<string>>(getGalleryActiveSet);

  // Re-read on focus (covers switching back from gallery view)
  useEffect(() => {
    const handler = () => setActiveSet(getGalleryActiveSet());
    window.addEventListener('focus', handler);
    // Also listen for custom event dispatched by gallery
    window.addEventListener('gallery-active-changed', handler);
    return () => {
      window.removeEventListener('focus', handler);
      window.removeEventListener('gallery-active-changed', handler);
    };
  }, []);

  const hasAny = activeSet.size > 0;

  // Filter hand animations for a gesture type
  const filterHandAnims = (gesture: GestureTool) => {
    const all = getBySlot(`hand:${gesture}`);
    if (!hasAny) return all;
    return all.filter((a) => activeSet.has(a.id));
  };

  // Filter pointer animations
  const filterPointers = () => {
    const all = getBySlot('pointer');
    if (!hasAny) return all;
    return all.filter((p) => activeSet.has(p.id));
  };

  // Filter click animations — match by combined file pattern or standalone sunburst
  const filterClickAnims = () => {
    const all = getBySlot('click-effect');
    if (!hasAny) return all;
    return all.filter((ca) => {
      // Direct match
      if (activeSet.has(ca.id)) return true;
      // Match standalone sunburst: click-burst-soft-xs -> click-sunburst-soft-xs
      const sunburstId = ca.id.replace('click-burst', 'click-sunburst');
      if (activeSet.has(sunburstId)) return true;
      // Match any combined pointer-animation containing this style
      // e.g., cursor-real-anim-black-click-burst-soft-xs
      for (const id of activeSet) {
        if (id.includes(`-${ca.id}`)) return true;
      }
      return false;
    });
  };

  return {
    activeSet,
    hasAny,
    filterHandAnims,
    filterPointers,
    filterClickAnims,
  };
}
