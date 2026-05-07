/**
 * Toolbar (Layout C) — Top bar carrying setup + view toggles + commit actions.
 *
 * Edit tools (gesture buttons, Select, Undo, cursor size) live in LeftRail.
 * This bar holds: composition picker, version controls, view toggles
 * (Feedback, Trail), render mode (DorianFull only), save cluster
 * (Save / Save as Version / Revert), and the More overflow menu.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useDirector } from '../context';
import { COMPOSITIONS } from '../compositions';

// Family detection — share with VersionBar logic. A composition id like
// 'DorianFullV1-14' parses to family='DorianFull'. Bare ids (no V\d+-\d+
// suffix) are family bases (V1.00 implicit).
const VERSION_RE = /^(.+?)V(\d+)-(\d{2})$/;
const baseOf = (compId: string): string => {
  const m = VERSION_RE.exec(compId);
  return m ? m[1] : compId;
};
/** Return the family's latest registered version, or the base id if none. */
const familyLatestOrBase = (familyName: string): string => {
  let best: { ord: number; compId: string } | null = null;
  for (const c of COMPOSITIONS) {
    const m = VERSION_RE.exec(c.id);
    if (m && m[1] === familyName) {
      const ord = parseInt(m[2], 10) * 100 + parseInt(m[3], 10);
      if (!best || ord > best.ord) best = { ord, compId: c.id };
    }
  }
  return best?.compId ?? familyName;
};
import { GESTURE_PRESETS } from '../gestures';
import { getReloadBackup } from '../hooks/useSessionPersistence';
import { getCodedPath } from '../codedPaths';
import { diffSave, formatDiffPrompt, type SaveProposal } from '../saveDiff';
import { useReloadFromDisk } from '../hooks/useReloadFromDisk';
import {
  collectScenesToSave,
  buildProposalForScene as buildProposalPure,
  filterPersistableProposals,
} from '../saveAll';
import { useHmrLivePending } from '../hooks/useHmrLivePending';
import { VersionBar } from './VersionBar';
import { MoreMenu } from './MoreMenu';
import {
  SaveIcon,
  SaveVersionIcon,
  RevertIcon,
  LockIcon,
  LockOpenIcon,
} from './icons';

export const Toolbar: React.FC = () => {
  const { state, dispatch, saveSession } = useDirector();
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  // Track whether a reload backup is available (for Undo Reload button).
  // Poll every 5s to handle TTL expiry and cross-tab changes.
  const [hasBackup, setHasBackup] = useState<boolean>(
    () => !!getReloadBackup(),
  );

  // HMR Live-Update badge — fires when codedPaths.ts or layers.ts hot-reloads.
  // The badge is a passive signal; clicking it runs the standard reload flow
  // (backup, locked-scene skip, undo). No auto-apply by design.
  const {
    pending: livePending,
    source: liveSource,
    clear: clearLive,
  } = useHmrLivePending();
  const { reloadAll } = useReloadFromDisk();
  const handleApplyLive = useCallback(async () => {
    const ok = await reloadAll({
      onComplete: () => setHasBackup(!!getReloadBackup()),
    });
    if (ok) clearLive();
  }, [reloadAll, clearLive]);

  // Render mode state (Pure Remotion / Hybrid / Pure HF). Only meaningful for
  // DorianFull — the only composition with an HF counterpart.
  const [renderMode, setRenderMode] = useState<'remotion' | 'hybrid' | 'hf'>(
    'remotion',
  );
  const [renderState, setRenderState] = useState<
    'idle' | 'starting' | 'running' | 'error'
  >('idle');
  const [renderLogPath, setRenderLogPath] = useState<string | null>(null);
  // Render log tail kept polling so the underlying log fills, but no longer
  // shown inline (cluttered the toolbar). Surfaced via the Render button title.
  const [, setRenderTail] = useState<string>('');
  const supportsDualStack = state.compositionId === 'DorianFull';

  const handleRender = useCallback(async () => {
    setRenderState('starting');
    setRenderTail('');
    try {
      const res = await fetch('/api/render-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: renderMode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
      setRenderLogPath(data.logPath);
      setRenderState('running');
    } catch (err) {
      console.error('render failed:', err);
      setRenderState('error');
      setTimeout(() => setRenderState('idle'), 3000);
    }
  }, [renderMode]);

  // Poll the render log while running
  useEffect(() => {
    if (renderState !== 'running' || !renderLogPath) return;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/render-status?logPath=${encodeURIComponent(renderLogPath)}`,
        );
        const data = await res.json();
        if (data.tail) setRenderTail(data.tail);
      } catch {
        // ignore transient poll failures
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [renderState, renderLogPath]);
  useEffect(() => {
    const id = setInterval(() => setHasBackup(!!getReloadBackup()), 5000);
    return () => clearInterval(id);
  }, []);

  const handleSave = useCallback(async () => {
    // "Save" means "persist EVERYTHING in the current composition that has
    // any scene-keyed state" — not just the currently-selected scene. This
    // kills the per-scene save trap that lost user work in the past.
    //
    // Pure logic lives in `saveAll.ts` and is unit-tested separately.
    const sceneList = collectScenesToSave(state);
    const proposals = filterPersistableProposals(
      sceneList.map((scene) => ({
        scene,
        proposal: buildProposalPure(state, scene),
      })),
    );

    if (proposals.length === 0) {
      // Nothing to save — still flush the localStorage session so meta is fresh.
      saveSession();
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
      return;
    }

    // ── 2. Confirm-prompt for locked scenes ──────────────────────────────
    const lockedScenes = proposals.filter((p) => p.proposal.locked);
    if (lockedScenes.length > 0) {
      const names = lockedScenes.map((p) => `"${p.scene}"`).join(', ');
      if (
        !confirm(
          `${lockedScenes.length} locked scene(s) will be overwritten: ${names}\n\nContinue?`,
        )
      ) {
        return;
      }
    }

    // ── 3. Diff prompt for the SELECTED scene only ────────────────────────
    //
    // Bombarding the user with N diff prompts would defeat "save everything",
    // but the destructive-save guard for the in-focus scene is still worth
    // having because that's where the user is actively iterating.
    if (state.selectedScene) {
      const selProposal = proposals.find(
        (p) => p.scene === state.selectedScene,
      );
      if (selProposal) {
        try {
          const r = await fetch(
            `/api/get-saved-entry?compositionId=${encodeURIComponent(state.compositionId)}&sceneName=${encodeURIComponent(state.selectedScene)}`,
          );
          const { entry: diskEntry } = (await r.json()) as {
            entry: SaveProposal | null;
          };
          const registry = getCodedPath(
            state.compositionId,
            state.selectedScene,
          );
          const diff = diffSave(selProposal.proposal, diskEntry, registry);
          if (diff.severity !== 'safe') {
            if (!confirm(formatDiffPrompt(state.selectedScene, diff))) return;
          }
        } catch (err) {
          console.warn(
            'Save diff check failed (proceeding without prompt):',
            err,
          );
        }
      }
    }

    // ── 4. POST sequentially ─────────────────────────────────────────────
    //
    // Sequential to avoid disk thrash on the Vite middleware (which reads,
    // mutates, writes the JSON file each call). On any failure, we stop and
    // surface the error — partial saves are easier to reason about than
    // silent failures buried mid-batch.
    setSaveState('saving');
    let savedCount = 0;
    try {
      for (const { scene, proposal } of proposals) {
        const safeName = scene.replace(/[^a-zA-Z0-9_-]/g, '');
        const res = await fetch('/api/save-path', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            compositionId: state.compositionId,
            sceneName: safeName,
            path: proposal.path,
            gesture: proposal.gesture,
            animation: proposal.animation,
            dark: proposal.dark,
            locked: proposal.locked,
            secondaryLayers: proposal.secondaryLayers,
          }),
        });
        if (!res.ok) {
          throw new Error(
            `Save failed at scene "${scene}" (${savedCount}/${proposals.length} saved before failure)`,
          );
        }
        // Mark scene as saved (creates version snapshot)
        dispatch({ type: 'MARK_SAVED', scene });
        savedCount++;
      }
      // Persist full session to localStorage after all disk writes succeed.
      saveSession();
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      console.error('save-all failed:', err);
      // Even on partial failure, persist localStorage so successful scenes
      // and any in-progress edits aren't lost.
      saveSession();
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 4000);
    }
  }, [
    state.selectedScene,
    state.waypoints,
    state.sceneGesture,
    state.sceneAnimation,
    state.sceneDark,
    state.sceneLocked,
    state.layers,
    state.compositionId,
    saveSession,
    dispatch,
  ]);

  // Toggle lock state for the selected scene. Persists to disk immediately
  // by writing the current path + lock flag via /api/save-path.
  const handleToggleLock = useCallback(async () => {
    if (!state.selectedScene) {
      alert('Select a scene first.');
      return;
    }
    const scene = state.selectedScene;
    const nextLocked = !state.sceneLocked[scene];
    // Update memory state first (so Save sees the new flag)
    dispatch({ type: 'TOGGLE_SCENE_LOCK', scene, locked: nextLocked });
    // Persist current path + new lock flag to disk
    try {
      const waypoints = state.waypoints[scene] || [];
      const gesture = state.sceneGesture[scene] || 'click';
      const preset = GESTURE_PRESETS[gesture];
      const safeName = scene.replace(/[^a-zA-Z0-9_-]/g, '');
      const res = await fetch('/api/save-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compositionId: state.compositionId,
          sceneName: safeName,
          path: waypoints,
          gesture,
          animation: state.sceneAnimation[scene] ?? preset.animation,
          dark: state.sceneDark[scene],
          locked: nextLocked,
          secondaryLayers: (() => {
            const sceneLayers = state.layers[scene] || [];
            const handLayers = sceneLayers.filter((l) => l.type === 'hand');
            const secondary = handLayers.slice(1).map((l) => ({
              gesture: l.data.gesture,
              path: (l.data as { waypoints?: unknown[] }).waypoints || [],
            }));
            return secondary.length > 0 ? secondary : undefined;
          })(),
        }),
      });
      if (!res.ok) throw new Error('Lock save failed');
      saveSession();
    } catch (err) {
      console.error('Lock toggle failed:', err);
      // Revert in-memory state on error
      dispatch({ type: 'TOGGLE_SCENE_LOCK', scene, locked: !nextLocked });
      alert(`Failed to ${nextLocked ? 'lock' : 'unlock'} "${scene}".`);
    }
  }, [
    state.selectedScene,
    state.sceneLocked,
    state.compositionId,
    state.waypoints,
    state.sceneGesture,
    state.sceneAnimation,
    state.sceneDark,
    state.layers,
    dispatch,
    saveSession,
  ]);

  // Listen for Ctrl+S custom event from App.tsx
  useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener('scene-director-save', handler);
    return () => window.removeEventListener('scene-director-save', handler);
  }, [handleSave]);

  // Save current scene to disk, then bump to next sub-version. The bump
  // endpoint auto-seeds the new compId's entry in codedPaths.data.json from
  // the current compId, so the new version inherits the just-saved data.
  // VersionBar listens for 'sd-bump-version' and runs its full bump flow
  // (popover with wire-up checklist).
  const handleSaveAsVersion = useCallback(async () => {
    await handleSave();
    // Wait one tick so disk write completes before backend reads the JSON
    await new Promise((r) => setTimeout(r, 120));
    window.dispatchEvent(new CustomEvent('sd-bump-version'));
  }, [handleSave]);

  return (
    <div className="toolbar">
      {/* Title */}
      <span className="toolbar__logo">SD</span>

      {/* Main video dropdown — one entry per family (base id only). The
          sub-version dropdown (in VersionBar) picks within the family.
          Selecting a different family jumps to that family's latest version. */}
      <select
        className="toolbar__select"
        value={baseOf(state.compositionId)}
        onChange={(e) => {
          const baseId = e.target.value;
          if (baseOf(state.compositionId) === baseId) return; // same family, no-op
          dispatch({
            type: 'SET_COMPOSITION',
            id: familyLatestOrBase(baseId),
          });
        }}
      >
        {(() => {
          // Filter to base comps only (drop versioned siblings).
          const bases = COMPOSITIONS.filter((c) => !VERSION_RE.test(c.id));
          const groups: Record<string, typeof bases> = {};
          for (const c of bases) {
            const g = c.group ?? 'Other';
            (groups[g] ??= []).push(c);
          }
          const order = [
            'Sigma Demos',
            'Sigma Full',
            'Dorian',
            'Mobile Chat',
            'Dashmor',
            'Utilities',
            'Other',
          ];
          return order
            .filter((g) => groups[g]?.length)
            .map((g) => (
              <optgroup key={g} label={g}>
                {groups[g].map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            ));
        })()}
      </select>

      <div className="toolbar__divider" />

      {/* Version control: family + version dropdowns + bump + freeze */}
      <VersionBar />

      <div className="toolbar__spacer" />

      {/* Feedback mode — click-to-pin annotation overlay */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_FEEDBACK_MODE' })}
        className={`toolbar__btn ${state.feedbackMode ? 'toolbar__btn--feedback-on' : ''}`}
        title="Feedback mode — click video to drop a note pin (F)"
      >
        Feedback
        <kbd className="toolbar__kbd">F</kbd>
        {(() => {
          const n = (state.feedbackPins[state.compositionId] ?? []).length;
          return n > 0 ? <span className="toolbar__badge">{n}</span> : null;
        })()}
      </button>

      {/* Trail toggle */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_TRAIL' })}
        className={`toolbar__btn ${state.showTrail ? 'toolbar__btn--trail-on' : ''}`}
        title="Show trail overlay (T)"
      >
        Trail
        <kbd className="toolbar__kbd">T</kbd>
      </button>

      {/* Render Mode — only for DorianFull (dual-stack composition) */}
      {supportsDualStack && (
        <>
          <div className="toolbar__divider" />
          <select
            value={renderMode}
            onChange={(e) =>
              setRenderMode(e.target.value as 'remotion' | 'hybrid' | 'hf')
            }
            className="toolbar__select toolbar__select--compact"
            disabled={renderState === 'running' || renderState === 'starting'}
            title="Render mode"
          >
            <option value="remotion">Pure Remotion</option>
            <option value="hybrid">Hybrid</option>
            <option value="hf">Pure HF</option>
          </select>
          <button
            onClick={handleRender}
            disabled={renderState === 'running' || renderState === 'starting'}
            className={`toolbar__btn ${
              renderState === 'error'
                ? 'toolbar__btn--clear'
                : renderState === 'running'
                  ? 'toolbar__btn--save-ok'
                  : 'toolbar__btn--export'
            }`}
            title={
              renderState === 'running'
                ? `Rendering... log: ${renderLogPath}`
                : `Trigger ${renderMode} render via npm script`
            }
          >
            {renderState === 'starting'
              ? 'Starting…'
              : renderState === 'running'
                ? 'Rendering…'
                : renderState === 'error'
                  ? 'Error'
                  : 'Render'}
          </button>
        </>
      )}

      {/* Sticky right-anchored Save cluster — always visible regardless of
          horizontal toolbar overflow. Save / Save as Version / Revert sit
          here so the user can always reach them. */}
      <div className="toolbar__save-cluster">
        <button
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className={`toolbar__btn toolbar__btn--icon ${
            saveState === 'saved'
              ? 'toolbar__btn--save-ok'
              : saveState === 'error'
                ? 'toolbar__btn--clear'
                : 'toolbar__btn--save'
          }`}
          title="Save scene to disk (Ctrl+S)"
        >
          <SaveIcon size={14} />
          <span>
            {saveState === 'saving'
              ? 'Saving…'
              : saveState === 'saved'
                ? 'Saved!'
                : saveState === 'error'
                  ? 'Error'
                  : 'Save'}
          </span>
        </button>

        <button
          onClick={handleSaveAsVersion}
          disabled={saveState === 'saving'}
          className="toolbar__btn toolbar__btn--icon toolbar__btn--save-version"
          title="Save current scene, then bump composition to next sub-version (V1.0X+1) and seed its data"
        >
          <SaveVersionIcon size={14} />
          <span>Save as Version</span>
        </button>

        {state.selectedScene && (
          <button
            onClick={handleToggleLock}
            className={`toolbar__btn toolbar__btn--icon ${
              state.sceneLocked[state.selectedScene]
                ? 'toolbar__btn--save-ok'
                : ''
            }`}
            title={
              state.sceneLocked[state.selectedScene]
                ? `🔒 "${state.selectedScene}" is locked. Click to unlock — Reload will skip this scene; Save needs confirmation.`
                : `Lock "${state.selectedScene}" — Reload will skip it; Save will require confirmation.`
            }
          >
            {state.sceneLocked[state.selectedScene] ? (
              <LockIcon size={14} />
            ) : (
              <LockOpenIcon size={14} />
            )}
            <span>
              {state.sceneLocked[state.selectedScene] ? 'Locked' : 'Lock'}
            </span>
          </button>
        )}

        {state.selectedScene && state.savedSnapshots[state.selectedScene] && (
          <button
            onClick={() =>
              dispatch({ type: 'REVERT_SCENE', scene: state.selectedScene! })
            }
            className="toolbar__btn toolbar__btn--icon toolbar__btn--clear"
            title="Revert scene to last saved state"
          >
            <RevertIcon size={14} />
            <span>Revert</span>
          </button>
        )}

        {livePending && (
          <button
            type="button"
            onClick={handleApplyLive}
            className="toolbar__btn toolbar__live-badge"
            title={`Live update from ${liveSource ?? 'disk'} — click to reload all unlocked scenes (locked scenes preserved, 10-min undo)`}
            aria-label="Apply live update from disk"
          >
            <span className="toolbar__live-badge__dot" aria-hidden="true" />
            <span>Live update</span>
          </button>
        )}

        <MoreMenu
          hasBackup={hasBackup}
          onReloadComplete={() => setHasBackup(!!getReloadBackup())}
        />
      </div>
    </div>
  );
};
