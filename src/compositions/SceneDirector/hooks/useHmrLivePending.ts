/// <reference types="vite/client" />
/**
 * useHmrLivePending — Detect when Vite HMR has updated codedPaths.ts or
 * layers.ts so the user can apply the change with one click.
 *
 * Returns { pending, source, clear }:
 *   - `pending` flips true when a relevant module hot-updates.
 *   - `source` names the module that changed (for the tooltip).
 *   - `clear()` resets to false (called after the user applies).
 *
 * No-op in production: import.meta.hot is undefined, hook returns
 * { pending: false, source: null, clear: noop }.
 *
 * Wired by App.tsx (which already imports both modules) so the relative
 * paths resolve correctly. Hook is a thin observer — it does NOT auto-apply.
 * The user clicks the badge to trigger the actual reload, which goes
 * through useReloadFromDisk (backup, locked-scene skip, undo, all reused).
 *
 * Why opt-in apply instead of auto-apply: an HMR fire mid-waypoint-drag
 * would clobber unsaved edits. Explicit click = explicit consent.
 */
import { useEffect, useState, useCallback } from 'react';

type LiveSource = 'codedPaths' | 'layers' | null;

export function useHmrLivePending() {
  const [pending, setPending] = useState(false);
  const [source, setSource] = useState<LiveSource>(null);

  useEffect(() => {
    if (!import.meta.hot) return;
    const onCodedPaths = () => {
      setPending(true);
      setSource('codedPaths');
    };
    const onLayers = () => {
      setPending(true);
      setSource('layers');
    };
    import.meta.hot.accept('../codedPaths', onCodedPaths);
    import.meta.hot.accept('../layers', onLayers);
    // No cleanup needed — Vite handles HMR listener lifecycle per module.
  }, []);

  const clear = useCallback(() => {
    setPending(false);
    setSource(null);
  }, []);

  return { pending, source, clear };
}
