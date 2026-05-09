/**
 * MoreMenu — Overflow dropdown for less-used toolbar actions.
 *
 * Houses Reload, Undo Reload, Export, Gallery, and Freeze. Keeps the main
 * toolbar uncluttered so Save/Save-as-Version/Revert stay visible at all times.
 *
 * Freeze fires the `sd-freeze-version` window event; VersionBar listens and
 * runs its existing freeze flow (with confirmation popover).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDirector } from '../context';
import {
  getReloadBackup,
  restoreReloadBackup,
  clearReloadBackup,
} from '../hooks/useSessionPersistence';
import { useReloadFromDisk } from '../hooks/useReloadFromDisk';
import { MoreIcon, LockIcon, RefreshIcon } from './icons';

type Props = {
  /** True when a Reload backup exists (parent owns the polling). */
  hasBackup: boolean;
  /** Called after Reload to update parent's hasBackup flag. */
  onReloadComplete: () => void;
};

export const MoreMenu: React.FC<Props> = ({ hasBackup, onReloadComplete }) => {
  const { state, dispatch } = useDirector();
  const { reloadAll, reloadScene } = useReloadFromDisk();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleReload = useCallback(async () => {
    const ok = await reloadAll({ onComplete: onReloadComplete });
    if (ok) setOpen(false);
  }, [reloadAll, onReloadComplete]);

  const handleReloadScene = useCallback(async () => {
    const sceneName = state.selectedScene;
    if (!sceneName) {
      alert('Select a scene first.');
      return;
    }
    const ok = await reloadScene(sceneName, { onComplete: onReloadComplete });
    if (ok) setOpen(false);
  }, [reloadScene, state.selectedScene, onReloadComplete]);

  const handleUndoReload = useCallback(() => {
    const backup = getReloadBackup();
    if (!backup) {
      onReloadComplete();
      return;
    }
    const ageMin = Math.round((Date.now() - backup.timestamp) / 60000);
    if (
      !confirm(
        `Restore session from ${ageMin}m ago? The page will reload to apply the restore.`,
      )
    ) {
      return;
    }
    if (restoreReloadBackup()) {
      window.location.reload();
    }
  }, [onReloadComplete]);

  const handleDiscardBackup = useCallback(() => {
    if (confirm('Discard the reload backup?')) {
      clearReloadBackup();
      onReloadComplete();
      setOpen(false);
    }
  }, [onReloadComplete]);

  const handleExport = useCallback(() => {
    dispatch({ type: 'TOGGLE_EXPORT' });
    setOpen(false);
  }, [dispatch]);

  const handleGallery = useCallback(() => {
    dispatch({ type: 'SET_VIEW', view: 'gallery' });
    setOpen(false);
  }, [dispatch]);

  const handleSoundGallery = useCallback(() => {
    dispatch({ type: 'SET_VIEW', view: 'sound-gallery' });
    setOpen(false);
  }, [dispatch]);

  const handleFreeze = useCallback(() => {
    window.dispatchEvent(new CustomEvent('sd-freeze-version'));
    setOpen(false);
  }, []);

  return (
    <div className="more-menu" ref={wrapperRef}>
      <button
        type="button"
        className={`toolbar__btn more-menu__trigger ${open ? 'more-menu__trigger--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="More actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreIcon size={16} />
        <span>More</span>
      </button>

      {open && (
        <div className="more-menu__popover" role="menu">
          <button
            type="button"
            className="more-menu__item"
            onClick={handleReloadScene}
            role="menuitem"
            disabled={!state.selectedScene}
            title={
              state.selectedScene
                ? `Reload only "${state.selectedScene}"`
                : 'Select a scene first'
            }
          >
            <RefreshIcon size={14} />
            <span>Reload this scene</span>
            <small className="more-menu__hint">
              {state.selectedScene ?? 'select a scene'}
            </small>
          </button>

          <button
            type="button"
            className="more-menu__item"
            onClick={handleReload}
            role="menuitem"
          >
            <RefreshIcon size={14} />
            <span>Reload all scenes</span>
            <small className="more-menu__hint">discards local edits</small>
          </button>

          {hasBackup && (
            <button
              type="button"
              className="more-menu__item more-menu__item--accent"
              onClick={handleUndoReload}
              onContextMenu={(e) => {
                e.preventDefault();
                handleDiscardBackup();
              }}
              role="menuitem"
            >
              <RefreshIcon size={14} />
              <span>Undo Reload</span>
              <small className="more-menu__hint">right-click to discard</small>
            </button>
          )}

          <div className="more-menu__divider" />

          <button
            type="button"
            className="more-menu__item"
            onClick={handleExport}
            role="menuitem"
          >
            <span>Export code</span>
            <small className="more-menu__hint">E</small>
          </button>

          <button
            type="button"
            className="more-menu__item"
            onClick={handleGallery}
            role="menuitem"
          >
            <span>Gallery</span>
            <small className="more-menu__hint">G</small>
          </button>

          <button
            type="button"
            className="more-menu__item"
            onClick={handleSoundGallery}
            role="menuitem"
          >
            <span>Sound Gallery</span>
            <small className="more-menu__hint">audition tracks</small>
          </button>

          <div className="more-menu__divider" />

          <button
            type="button"
            className="more-menu__item"
            onClick={handleFreeze}
            role="menuitem"
          >
            <LockIcon size={14} />
            <span>Freeze current version</span>
            <small className="more-menu__hint">seal in .frozen.json</small>
          </button>
        </div>
      )}
    </div>
  );
};
