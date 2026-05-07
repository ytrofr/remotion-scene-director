/**
 * Session persistence — composition-scoped localStorage slicing.
 *
 * Architecture (v2, replaces single-key v1):
 *   - `scene-director-meta`     → top-level state (compositionId, selectedScene,
 *                                  frame, sidebarTab, currentView, clickAnimation,
 *                                  feedbackPins, ...)
 *   - `scene-director-slice-{compositionId}` → per-composition slice with all
 *                                  scene-keyed maps (waypoints, layers,
 *                                  sceneGesture, sceneAnimation, sceneDark,
 *                                  sceneLocked, clearedSceneLayers,
 *                                  savedSnapshots, versionHistory)
 *
 * Why: the v1 layout kept all 9 scene-keyed maps in one blob. Switching
 * composition (V1.10 → V1.14) bled work between them because scene names
 * collide ("4-ChatOpen" exists in both). Slicing makes cross-composition
 * bleed structurally impossible.
 *
 * Migration: on first load with a v1 blob present, we copy its slice fields
 * under `scene-director-slice-{itsCompId}` and write meta from its top-level
 * fields. We also dump the raw v1 payload to `scene-director-backup-{ts}`
 * for one-session rollback safety. The v1 key is then cleared.
 *
 * Auto-save behaviour: still debounced 400ms on state change. Reload-backup
 * (10 min TTL) and feedback-pin disk auto-sync are unchanged.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { DirectorState, DirectorSlice, FeedbackPin } from '../state';

const META_KEY = 'scene-director-meta';
const SLICE_PREFIX = 'scene-director-slice-';
const LEGACY_KEY = 'scene-director-session';
const BACKUP_PREFIX = 'scene-director-backup-';
const RELOAD_BACKUP_KEY = 'scene-director-reload-backup';
const BACKUP_TTL_MS = 10 * 60 * 1000;

/** Top-level UI / meta state — not scene-keyed, shared across compositions. */
export interface SessionMeta {
  compositionId?: string;
  selectedScene?: string | null;
  frame?: number;
  sidebarTab?: 'editor' | 'history';
  currentView?: 'editor' | 'gallery' | 'sound-gallery';
  clickAnimation?: string;
  feedbackPins?: Record<string, FeedbackPin[]>;
}

/** Combined view returned to consumers — meta plus the slice for compositionId. */
export interface SavedSession extends SessionMeta, DirectorSlice {}

interface ReloadBackup {
  data: SavedSession;
  timestamp: number;
}

// ── Slice keys ──────────────────────────────────────────────────────────────

function sliceKey(compId: string): string {
  return `${SLICE_PREFIX}${compId}`;
}

// ── Pure I/O primitives ─────────────────────────────────────────────────────

export function loadMeta(): SessionMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SessionMeta;
  } catch {
    return {};
  }
}

export function saveMeta(meta: SessionMeta): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* quota errors swallowed */
  }
}

export function loadSlice(compId: string): DirectorSlice {
  if (!compId) return {};
  try {
    const raw = localStorage.getItem(sliceKey(compId));
    if (!raw) return {};
    return JSON.parse(raw) as DirectorSlice;
  } catch {
    return {};
  }
}

export function saveSlice(compId: string, slice: DirectorSlice): void {
  if (!compId) return;
  try {
    localStorage.setItem(sliceKey(compId), JSON.stringify(slice));
  } catch {
    /* quota errors swallowed */
  }
}

// ── Migration from legacy single-key blob ──────────────────────────────────

/**
 * Returns true if migration was performed (v1 blob found and converted).
 * Idempotent: subsequent calls are no-ops.
 *
 * The legacy blob's top-level fields become meta. Its scene-keyed maps are
 * attributed to the compositionId it claimed. The raw blob is dumped under
 * `scene-director-backup-{ts}` so a one-session rollback is possible. Then
 * the legacy key is cleared.
 *
 * Callers (typically `loadSession`) should run this BEFORE reading meta/slice.
 */
export function migrateLegacySession(): boolean {
  let raw: string | null;
  try {
    raw = localStorage.getItem(LEGACY_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;

  let blob: Record<string, unknown>;
  try {
    blob = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // Corrupt blob — drop it but keep a backup
    try {
      localStorage.setItem(`${BACKUP_PREFIX}${Date.now()}-corrupt`, raw);
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* ignore */
    }
    return false;
  }

  const compId = (blob.compositionId as string) || '';
  if (!compId) {
    // Nothing to attribute the slice to — keep blob untouched, surface nothing
    return false;
  }

  // Backup the raw blob for rollback safety
  try {
    localStorage.setItem(`${BACKUP_PREFIX}${Date.now()}`, raw);
  } catch {
    /* ignore */
  }

  // Build slice from blob's per-scene fields
  const slice: DirectorSlice = {};
  if (blob.sceneGesture)
    slice.sceneGesture = blob.sceneGesture as DirectorSlice['sceneGesture'];
  if (blob.sceneAnimation)
    slice.sceneAnimation =
      blob.sceneAnimation as DirectorSlice['sceneAnimation'];
  if (blob.sceneDark)
    slice.sceneDark = blob.sceneDark as DirectorSlice['sceneDark'];
  if (blob.sceneLocked)
    slice.sceneLocked = blob.sceneLocked as DirectorSlice['sceneLocked'];
  if (blob.clearedSceneLayers)
    slice.clearedSceneLayers =
      blob.clearedSceneLayers as DirectorSlice['clearedSceneLayers'];
  if (blob.layers) slice.layers = blob.layers as DirectorSlice['layers'];
  if (blob.waypoints)
    slice.waypoints = blob.waypoints as DirectorSlice['waypoints'];
  if (blob.savedSnapshots)
    slice.savedSnapshots =
      blob.savedSnapshots as DirectorSlice['savedSnapshots'];
  if (blob.versionHistory)
    slice.versionHistory =
      blob.versionHistory as DirectorSlice['versionHistory'];

  saveSlice(compId, slice);

  // Build meta from blob's top-level fields
  const meta: SessionMeta = {
    compositionId: compId,
    selectedScene: (blob.selectedScene as string | null) ?? null,
    frame: typeof blob.frame === 'number' ? (blob.frame as number) : 0,
    sidebarTab: (blob.sidebarTab as SessionMeta['sidebarTab']) ?? 'editor',
    currentView: (blob.currentView as SessionMeta['currentView']) ?? 'editor',
    feedbackPins: (blob.feedbackPins as SessionMeta['feedbackPins']) ?? {},
  };
  saveMeta(meta);

  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
  return true;
}

// ── Combined load (meta + current-comp slice) ──────────────────────────────

/**
 * Load combined session for the active composition.
 * Runs legacy migration if a v1 blob is present.
 */
export function loadSession(): SavedSession {
  migrateLegacySession();
  const meta = loadMeta();
  const slice = meta.compositionId ? loadSlice(meta.compositionId) : {};
  return { ...slice, ...meta };
}

// ── Build persisted shapes from a state ────────────────────────────────────

export function extractSlice(state: DirectorState): DirectorSlice {
  return {
    sceneGesture: state.sceneGesture,
    sceneAnimation: state.sceneAnimation,
    sceneDark: state.sceneDark,
    sceneLocked: state.sceneLocked,
    clearedSceneLayers: state.clearedSceneLayers,
    layers: state.layers,
    waypoints: state.waypoints,
    savedSnapshots: state.savedSnapshots,
    versionHistory: state.versionHistory,
  };
}

export function extractMeta(state: DirectorState, frame: number): SessionMeta {
  return {
    compositionId: state.compositionId,
    selectedScene: state.selectedScene,
    frame,
    sidebarTab: state.sidebarTab,
    currentView: state.currentView,
    clickAnimation: state.clickAnimation,
    feedbackPins: state.feedbackPins,
  };
}

// ── Reload-button safety backup (unchanged behaviour) ───────────────────────

export function createReloadBackup(): void {
  try {
    const metaRaw = localStorage.getItem(META_KEY);
    if (!metaRaw) return;
    const compId = (JSON.parse(metaRaw) as SessionMeta).compositionId;
    if (!compId) return;
    const sliceRaw = localStorage.getItem(sliceKey(compId));
    if (!sliceRaw) return;
    const backup: ReloadBackup = {
      data: { ...JSON.parse(metaRaw), ...JSON.parse(sliceRaw) } as SavedSession,
      timestamp: Date.now(),
    };
    localStorage.setItem(RELOAD_BACKUP_KEY, JSON.stringify(backup));
  } catch {
    /* ignore */
  }
}

export function getReloadBackup(): ReloadBackup | null {
  try {
    const raw = localStorage.getItem(RELOAD_BACKUP_KEY);
    if (!raw) return null;
    const backup = JSON.parse(raw) as ReloadBackup;
    if (Date.now() - backup.timestamp > BACKUP_TTL_MS) {
      localStorage.removeItem(RELOAD_BACKUP_KEY);
      return null;
    }
    return backup;
  } catch {
    return null;
  }
}

export function restoreReloadBackup(): boolean {
  const backup = getReloadBackup();
  if (!backup) return false;
  // Re-split backup into meta + slice
  const compId = backup.data.compositionId;
  if (!compId) return false;
  const slice: DirectorSlice = {
    sceneGesture: backup.data.sceneGesture,
    sceneAnimation: backup.data.sceneAnimation,
    sceneDark: backup.data.sceneDark,
    sceneLocked: backup.data.sceneLocked,
    clearedSceneLayers: backup.data.clearedSceneLayers,
    layers: backup.data.layers,
    waypoints: backup.data.waypoints,
    savedSnapshots: backup.data.savedSnapshots,
    versionHistory: backup.data.versionHistory,
  };
  const meta: SessionMeta = {
    compositionId: compId,
    selectedScene: backup.data.selectedScene,
    frame: backup.data.frame,
    sidebarTab: backup.data.sidebarTab,
    currentView: backup.data.currentView,
    clickAnimation: backup.data.clickAnimation,
    feedbackPins: backup.data.feedbackPins,
  };
  saveSlice(compId, slice);
  saveMeta(meta);
  try {
    localStorage.removeItem(RELOAD_BACKUP_KEY);
  } catch {
    /* ignore */
  }
  return true;
}

export function clearReloadBackup(): void {
  try {
    localStorage.removeItem(RELOAD_BACKUP_KEY);
  } catch {
    /* ignore */
  }
}

// ── React hook ──────────────────────────────────────────────────────────────

export function useSessionPersistence(state: DirectorState, frame: number) {
  const savedSession = useMemo(() => loadSession(), []);

  // Latest values for the debounced auto-save callback
  const latestRef = useRef({ state, frame });
  latestRef.current = { state, frame };

  // Debounced auto-save: writes meta + current-comp slice 400ms after state changes
  useEffect(() => {
    const t = setTimeout(() => {
      const { state: s, frame: f } = latestRef.current;
      saveMeta(extractMeta(s, f));
      if (s.compositionId) {
        saveSlice(s.compositionId, extractSlice(s));
      }
    }, 400);
    return () => clearTimeout(t);
  }, [state]);

  // Feedback-pin disk auto-sync — unchanged from v1
  const lastPinsJsonRef = useRef<string>(JSON.stringify(state.feedbackPins));
  useEffect(() => {
    const pinsJson = JSON.stringify(state.feedbackPins);
    if (pinsJson === lastPinsJsonRef.current) return;
    const t = setTimeout(() => {
      lastPinsJsonRef.current = pinsJson;
      fetch('/api/save-feedback-pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackPins: state.feedbackPins }),
      }).catch(() => {
        /* best-effort */
      });
    }, 800);
    return () => clearTimeout(t);
  }, [state.feedbackPins]);

  // Manual save — explicit Save button / Ctrl+S
  const saveSession = useCallback(() => {
    saveMeta(extractMeta(state, frame));
    if (state.compositionId) {
      saveSlice(state.compositionId, extractSlice(state));
    }
  }, [state, frame]);

  return { savedSession, saveSession };
}
