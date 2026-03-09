/**
 * useGallerySelection — bulk select, hide, activate, and mark-bad for gallery cards.
 * Persists hidden + active items in localStorage.
 * Auto-seeds active set with all pickerSlot items on first use.
 */
import { useCallback, useState } from 'react';
import { GESTURES } from '../panels/galleryData';

const HIDDEN_KEY = 'gallery-hidden-items';
const ACTIVE_KEY = 'gallery-active-items';

/** All gallery items that belong to a picker (have pickerSlot) — used as default active set */
const DEFAULT_ACTIVE_IDS = GESTURES.filter((g) => g.pickerSlot).map(
  (g) => g.id,
);

function getStored(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch {
    return new Set();
  }
}

function persistSet(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...ids]));
}

function getHidden(): Set<string> {
  return getStored(HIDDEN_KEY);
}

function persistHidden(ids: Set<string>) {
  persistSet(HIDDEN_KEY, ids);
}

export function useGallerySelection() {
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(getHidden);
  const [active, setActive] = useState<Set<string>>(() => {
    const stored = getStored(ACTIVE_KEY);
    // Auto-seed: if no active items in localStorage, activate all picker defaults
    if (stored.size === 0 && DEFAULT_ACTIVE_IDS.length > 0) {
      const defaults = new Set(DEFAULT_ACTIVE_IDS);
      persistSet(ACTIVE_KEY, defaults);
      return defaults;
    }
    return stored;
  });
  const [showHidden, setShowHidden] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Select or deselect a group of IDs atomically (for shape cards) */
  const toggleSelectMany = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, []);

  const enterSelectMode = useCallback(() => {
    setSelectMode(true);
    setSelected(new Set());
  }, []);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelected(new Set());
  }, []);

  const hideSelected = useCallback(() => {
    setHidden((prev) => {
      const next = new Set(prev);
      selected.forEach((id) => next.add(id));
      persistHidden(next);
      return next;
    });
    exitSelectMode();
  }, [selected, exitSelectMode]);

  const unhide = useCallback((id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.delete(id);
      persistHidden(next);
      return next;
    });
  }, []);

  const deleteSelected = useCallback(async () => {
    if (selected.size === 0) return;
    const ids = [...selected];
    try {
      const res = await fetch('/__delete-gallery-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Delete failed: ${data.error}`);
        return;
      }
      // Also clean from hidden set
      setHidden((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        persistHidden(next);
        return next;
      });
      exitSelectMode();
      window.location.reload();
    } catch (err) {
      alert(`Delete failed: ${err}`);
    }
  }, [selected, exitSelectMode]);

  const copySelectedIds = useCallback(() => {
    const ids = [...selected].join(', ');
    navigator.clipboard.writeText(ids).catch(() => {});
    return ids;
  }, [selected]);

  const notifyActiveChanged = useCallback(() => {
    window.dispatchEvent(new Event('gallery-active-changed'));
  }, []);

  const toggleActive = useCallback(
    (id: string) => {
      setActive((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        persistSet(ACTIVE_KEY, next);
        return next;
      });
      notifyActiveChanged();
    },
    [notifyActiveChanged],
  );

  const activateSelected = useCallback(() => {
    setActive((prev) => {
      const next = new Set(prev);
      selected.forEach((id) => next.add(id));
      persistSet(ACTIVE_KEY, next);
      return next;
    });
    notifyActiveChanged();
    exitSelectMode();
  }, [selected, exitSelectMode, notifyActiveChanged]);

  return {
    selectMode,
    selected,
    hidden,
    active,
    showHidden,
    toggleSelect,
    toggleSelectMany,
    enterSelectMode,
    exitSelectMode,
    hideSelected,
    unhide,
    deleteSelected,
    setShowHidden,
    copySelectedIds,
    toggleActive,
    activateSelected,
  };
}
