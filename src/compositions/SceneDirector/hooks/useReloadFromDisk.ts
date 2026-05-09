/**
 * useReloadFromDisk — Shared "reload from codedPaths.data.json" logic.
 *
 * Single source of truth for the Reload flow. Used by:
 *   - MoreMenu's "Reload all scenes" / "Reload this scene" menu items
 *   - The HMR Live-Update badge in Toolbar (one-click apply)
 *
 * Behavior:
 *   - Fetches FRESH disk state from /api/get-saved-comp (or /api/get-saved-entry)
 *     so saves made this session aren't lost.
 *   - Skips locked scenes.
 *   - Creates a 10-min reload backup before discarding in-memory edits.
 *   - Disk wins on conflict; falls back to module-load registry when disk has
 *     no entry for a scene.
 */
import { useCallback } from 'react';
import { useDirector } from '../context';
import { COMPOSITIONS } from '../compositions';
import { getCodedPath } from '../codedPaths';
import { createReloadBackup } from './useSessionPersistence';

type ReloadOptions = {
  /** Show a native confirm() before discarding edits. Default true. */
  confirmBeforeReload?: boolean;
  /** Called after a successful reload (e.g. to refresh hasBackup state). */
  onComplete?: () => void;
};

export function useReloadFromDisk() {
  const { state, dispatch, saveSession } = useDirector();

  const reloadAll = useCallback(
    async (opts: ReloadOptions = {}) => {
      const { confirmBeforeReload = true, onComplete } = opts;
      const comp = COMPOSITIONS.find((c) => c.id === state.compositionId);
      if (!comp) return false;
      const lockedScenes = comp.scenes.filter((s) => state.sceneLocked[s.name]);
      const reloadable = comp.scenes.filter((s) => !state.sceneLocked[s.name]);
      const lockNote =
        lockedScenes.length > 0
          ? `\n\n🔒 Skipping ${lockedScenes.length} locked scene${lockedScenes.length > 1 ? 's' : ''}: ${lockedScenes.map((s) => s.name).join(', ')}`
          : '';
      if (
        confirmBeforeReload &&
        !confirm(
          `Reload ${reloadable.length}/${comp.scenes.length} scenes in "${comp.label}" from codedPaths.data.json?\n\nThis discards unsaved edits in unlocked scenes — but we'll keep a 10-minute rollback. Click "Undo Reload" to get your work back.${lockNote}`,
        )
      ) {
        return false;
      }
      createReloadBackup();
      let freshDisk: Record<string, unknown> = {};
      try {
        const r = await fetch(
          `/api/get-saved-comp?compositionId=${encodeURIComponent(state.compositionId)}`,
        );
        if (r.ok) {
          const { entries } = (await r.json()) as {
            entries: Record<string, unknown>;
          };
          freshDisk = entries ?? {};
        }
      } catch (err) {
        console.warn(
          'Reload: failed to fetch fresh disk state, falling back to module-load registry:',
          err,
        );
      }
      for (const s of reloadable) {
        const stale = getCodedPath(state.compositionId, s.name);
        const fresh = freshDisk[s.name];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const coded = fresh
          ? ({ ...(stale ?? {}), ...(fresh as any) } as typeof stale)
          : stale;
        dispatch({ type: 'RELOAD_SCENE_FROM_DISK', scene: s.name });
        dispatch({
          type: 'ENSURE_SCENE_LAYERS',
          scene: s.name,
          compositionId: state.compositionId,
          codedPath: coded,
          sceneZoom: s.zoom,
        });
      }
      saveSession();
      onComplete?.();
      return true;
    },
    [state.compositionId, state.sceneLocked, dispatch, saveSession],
  );

  const reloadScene = useCallback(
    async (sceneName: string, opts: ReloadOptions = {}) => {
      const { confirmBeforeReload = true, onComplete } = opts;
      const comp = COMPOSITIONS.find((c) => c.id === state.compositionId);
      if (!comp) return false;
      const sceneInfo = comp.scenes.find((s) => s.name === sceneName);
      if (!sceneInfo) return false;
      if (state.sceneLocked[sceneName]) {
        alert(
          `"${sceneName}" is locked 🔒. Unlock it from the toolbar Lock button before reloading.`,
        );
        return false;
      }
      if (
        confirmBeforeReload &&
        !confirm(
          `Reload only "${sceneName}" from codedPaths.data.json?\n\nThis discards unsaved edits in this scene only. Other scenes are untouched. We'll keep a 10-minute rollback. Click "Undo Reload" to get your work back.`,
        )
      ) {
        return false;
      }
      createReloadBackup();
      let fresh: unknown = null;
      try {
        const r = await fetch(
          `/api/get-saved-entry?compositionId=${encodeURIComponent(state.compositionId)}&sceneName=${encodeURIComponent(sceneName)}`,
        );
        if (r.ok) {
          const { entry } = (await r.json()) as { entry: unknown };
          fresh = entry;
        }
      } catch (err) {
        console.warn(
          'Reload: failed to fetch fresh disk state for scene, falling back to module-load registry:',
          err,
        );
      }
      const stale = getCodedPath(state.compositionId, sceneName);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coded = fresh
        ? ({ ...(stale ?? {}), ...(fresh as any) } as typeof stale)
        : stale;
      dispatch({ type: 'RELOAD_SCENE_FROM_DISK', scene: sceneName });
      dispatch({
        type: 'ENSURE_SCENE_LAYERS',
        scene: sceneName,
        compositionId: state.compositionId,
        codedPath: coded,
        sceneZoom: sceneInfo.zoom,
      });
      saveSession();
      onComplete?.();
      return true;
    },
    [state.compositionId, state.sceneLocked, dispatch, saveSession],
  );

  return { reloadAll, reloadScene };
}
