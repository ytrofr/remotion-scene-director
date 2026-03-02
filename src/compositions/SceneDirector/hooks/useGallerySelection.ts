/**
 * useGallerySelection — bulk select, hide, and mark-bad for gallery cards.
 * Persists hidden items in localStorage.
 */
import { useCallback, useState } from 'react';

const HIDDEN_KEY = 'gallery-hidden-items';

function getHidden(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function persistHidden(ids: Set<string>) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...ids]));
}

export function useGallerySelection() {
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(getHidden);
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

  return {
    selectMode,
    selected,
    hidden,
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
  };
}
