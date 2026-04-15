/**
 * Session persistence hook — saves/restores SceneDirector state to localStorage.
 *
 * - Auto-saves on every state change (debounced 400ms) so edits survive
 *   refresh, HMR reload, crashes, and accidental Reload-button clicks.
 * - Reload button creates a rollback snapshot (see createReloadBackup) so
 *   even a "Reload → oh no" can be undone within the 10 minute window.
 * - Manual saveSession() is still available for explicit Save / Ctrl+S
 *   (Save additionally pushes to codedPaths.data.json via Vite middleware).
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { DirectorState, SceneSnapshot, VersionEntry } from '../state';
import type { Layer } from '../layers';
import type { HandPathPoint } from '../../../components/FloatingHand/types';

const STORAGE_KEY = 'scene-director-session';
const BACKUP_KEY = 'scene-director-reload-backup';
const BACKUP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface SavedSession {
  compositionId?: string;
  selectedScene?: string | null;
  frame?: number;
  sceneGesture?: Record<string, string>;
  sceneAnimation?: Record<string, string>;
  sceneDark?: Record<string, boolean>;
  clearedSceneLayers?: Record<string, boolean>;
  layers?: Record<string, Layer[]>;
  waypoints?: Record<string, HandPathPoint[]>;
  savedSnapshots?: Record<string, SceneSnapshot>;
  sidebarTab?: 'editor' | 'history';
  versionHistory?: Record<string, VersionEntry[]>;
}

interface ReloadBackup {
  data: SavedSession;
  timestamp: number;
}

export function loadSession(): SavedSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveSessionData(s: SavedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota errors */
  }
}

function buildSessionData(state: DirectorState, frame: number): SavedSession {
  return {
    compositionId: state.compositionId,
    selectedScene: state.selectedScene,
    frame,
    sceneGesture: state.sceneGesture,
    sceneAnimation: state.sceneAnimation,
    sceneDark: state.sceneDark,
    clearedSceneLayers: state.clearedSceneLayers,
    layers: state.layers,
    waypoints: state.waypoints,
    savedSnapshots: state.savedSnapshots,
    sidebarTab: state.sidebarTab,
    versionHistory: state.versionHistory,
  };
}

/**
 * Snapshot the current session to the rollback backup slot.
 * Call this BEFORE any destructive operation (Reload button).
 * Backup expires after 10 minutes.
 */
export function createReloadBackup(): void {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (!current) return;
    const backup: ReloadBackup = {
      data: JSON.parse(current),
      timestamp: Date.now(),
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
  } catch {
    /* ignore */
  }
}

/**
 * Returns a valid (non-expired) reload backup, or null.
 */
export function getReloadBackup(): ReloadBackup | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    const backup = JSON.parse(raw) as ReloadBackup;
    if (Date.now() - backup.timestamp > BACKUP_TTL_MS) {
      localStorage.removeItem(BACKUP_KEY);
      return null;
    }
    return backup;
  } catch {
    return null;
  }
}

/**
 * Restore the backup into the live session slot. Caller should reload
 * the page after calling this so React re-initializes from the backup.
 */
export function restoreReloadBackup(): boolean {
  const backup = getReloadBackup();
  if (!backup) return false;
  saveSessionData(backup.data);
  localStorage.removeItem(BACKUP_KEY);
  return true;
}

export function clearReloadBackup(): void {
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch {
    /* ignore */
  }
}

export function useSessionPersistence(state: DirectorState, frame: number) {
  const savedSession = useMemo(() => loadSession(), []);

  // Keep a ref with the latest state+frame so the debounced auto-save
  // always writes the freshest data without needing to re-run the effect.
  const latestRef = useRef({ state, frame });
  latestRef.current = { state, frame };

  // Auto-save on state changes. Debounced 400ms to batch rapid edits.
  // Depending only on `state` (not `frame`) prevents save-every-frame
  // during playback — frame is still persisted via the latest ref when
  // the debounce fires after an actual state change.
  useEffect(() => {
    const t = setTimeout(() => {
      saveSessionData(
        buildSessionData(latestRef.current.state, latestRef.current.frame),
      );
    }, 400);
    return () => clearTimeout(t);
  }, [state]);

  // Manual save — identical to before, used by Save button / Ctrl+S.
  // Still useful because Save also pushes to codedPaths.data.json.
  const saveSession = useCallback(() => {
    saveSessionData(buildSessionData(state, frame));
  }, [state, frame]);

  return { savedSession, saveSession };
}
