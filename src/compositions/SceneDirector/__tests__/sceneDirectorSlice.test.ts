/**
 * Tests for the composition-scoped localStorage slicing + reducer wiring.
 *
 * The bleed bug we're fixing: prior to slicing, switching V1.10 → V1.14
 * left V1.10's per-scene work in `state.waypoints` (keyed by scene name
 * only). Save then wrote V1.10 data into V1.14's disk record. Refresh,
 * repeat → cross-composition contamination.
 *
 * These tests verify:
 *   1. saveSlice/loadSlice round-trip per composition
 *   2. SET_COMPOSITION reducer applies slice atomically
 *   3. SET_COMPOSITION without slice clears per-scene state
 *   4. Slices for different comps don't overlap in localStorage
 *   5. Migration from legacy single-key blob → sliced layout
 *   6. Legacy blob with no compositionId is left untouched
 *   7. extractSlice round-trips through saveSlice → loadSlice
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadSlice,
  saveSlice,
  loadMeta,
  saveMeta,
  loadSession,
  migrateLegacySession,
  extractSlice,
} from '../hooks/useSessionPersistence';
import { directorReducer } from '../state';
import { initialState, type DirectorState } from '../state.types';
import type { HandPathPoint } from '../../../components/FloatingHand/types';

const LEGACY_KEY = 'scene-director-session';

function clearAllStorage(): void {
  // Clear every scene-director-* key (slices, meta, legacy, backups)
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('scene-director-')) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

function makeWaypoint(x: number, y: number, frame: number): HandPathPoint {
  return { x, y, frame, gesture: 'pointer', scale: 1 } as HandPathPoint;
}

beforeEach(() => {
  clearAllStorage();
});

describe('Slice round-trip', () => {
  it('saves and loads a slice for one composition', () => {
    const slice = {
      waypoints: {
        '1-Intro': [makeWaypoint(100, 200, 0), makeWaypoint(300, 400, 30)],
      },
      sceneGesture: { '1-Intro': 'point' as const },
    };
    saveSlice('CompA', slice);
    const loaded = loadSlice('CompA');
    expect(loaded.waypoints?.['1-Intro']).toHaveLength(2);
    expect(loaded.waypoints?.['1-Intro']?.[0].x).toBe(100);
    expect(loaded.sceneGesture?.['1-Intro']).toBe('point');
  });

  it('returns empty slice for unknown composition', () => {
    const loaded = loadSlice('NeverSaved');
    expect(loaded).toEqual({});
  });

  it('returns empty slice when compId is empty string', () => {
    const loaded = loadSlice('');
    expect(loaded).toEqual({});
  });

  it('overwrites prior slice on re-save', () => {
    saveSlice('CompA', {
      waypoints: { '1-Intro': [makeWaypoint(1, 1, 0)] },
    });
    saveSlice('CompA', {
      waypoints: { '1-Intro': [makeWaypoint(99, 99, 0)] },
    });
    expect(loadSlice('CompA').waypoints?.['1-Intro']?.[0].x).toBe(99);
  });
});

describe('Cross-composition isolation (the bleed fix)', () => {
  it('different comp IDs get distinct slice keys', () => {
    saveSlice('V1-10', {
      waypoints: { '4-ChatOpen': [makeWaypoint(100, 100, 0)] },
    });
    saveSlice('V1-14', {
      waypoints: { '4-ChatOpen': [makeWaypoint(500, 500, 0)] },
    });
    expect(loadSlice('V1-10').waypoints?.['4-ChatOpen']?.[0].x).toBe(100);
    expect(loadSlice('V1-14').waypoints?.['4-ChatOpen']?.[0].x).toBe(500);
  });

  it('saving V1-14 does not touch V1-10 slice', () => {
    saveSlice('V1-10', {
      waypoints: { '4-ChatOpen': [makeWaypoint(100, 100, 0)] },
    });
    const before = JSON.stringify(loadSlice('V1-10'));
    saveSlice('V1-14', {
      waypoints: { '4-ChatOpen': [makeWaypoint(500, 500, 0)] },
    });
    const after = JSON.stringify(loadSlice('V1-10'));
    expect(after).toBe(before);
  });
});

describe('SET_COMPOSITION reducer', () => {
  it('replaces per-scene state with the supplied slice', () => {
    // Start with V1-10 state holding waypoints
    const state1: DirectorState = {
      ...initialState,
      compositionId: 'V1-10',
      waypoints: { '4-ChatOpen': [makeWaypoint(100, 100, 0)] },
      sceneGesture: { '4-ChatOpen': 'click' },
    };
    // Switch to V1-14 with a different slice
    const next = directorReducer(state1, {
      type: 'SET_COMPOSITION',
      id: 'V1-14',
      slice: {
        waypoints: { '4-ChatOpen': [makeWaypoint(999, 999, 0)] },
        sceneGesture: { '4-ChatOpen': 'point' },
      },
    });
    expect(next.compositionId).toBe('V1-14');
    expect(next.waypoints['4-ChatOpen']?.[0].x).toBe(999);
    expect(next.sceneGesture['4-ChatOpen']).toBe('point');
  });

  it('clears per-scene state when slice is absent', () => {
    const state1: DirectorState = {
      ...initialState,
      compositionId: 'V1-10',
      waypoints: { '4-ChatOpen': [makeWaypoint(100, 100, 0)] },
      sceneGesture: { '4-ChatOpen': 'click' },
      sceneDark: { '4-ChatOpen': true },
      versionHistory: { '4-ChatOpen': [] },
    };
    const next = directorReducer(state1, {
      type: 'SET_COMPOSITION',
      id: 'V1-14',
    });
    expect(next.compositionId).toBe('V1-14');
    expect(next.waypoints).toEqual({});
    expect(next.sceneGesture).toEqual({});
    expect(next.sceneDark).toEqual({});
    expect(next.versionHistory).toEqual({});
  });

  it('clears selectedScene + selectedWaypoint on switch', () => {
    const state1: DirectorState = {
      ...initialState,
      compositionId: 'V1-10',
      selectedScene: '4-ChatOpen',
      selectedWaypoint: 2,
    };
    const next = directorReducer(state1, {
      type: 'SET_COMPOSITION',
      id: 'V1-14',
    });
    expect(next.selectedScene).toBeNull();
    expect(next.selectedWaypoint).toBeNull();
  });

  it('full bleed-prevention scenario: V1-10 work does NOT bleed into V1-14', () => {
    // User edits scene 4-ChatOpen on V1-10
    let state: DirectorState = directorReducer(
      { ...initialState, compositionId: 'V1-10' },
      {
        type: 'SET_WAYPOINTS',
        scene: '4-ChatOpen',
        waypoints: [makeWaypoint(100, 100, 0)],
      },
    );
    expect(state.waypoints['4-ChatOpen']?.[0].x).toBe(100);

    // User switches to V1-14 (no slice exists for it yet)
    state = directorReducer(state, {
      type: 'SET_COMPOSITION',
      id: 'V1-14',
    });
    // V1-14 must NOT see V1-10's waypoints
    expect(state.waypoints['4-ChatOpen']).toBeUndefined();

    // User edits scene 4-ChatOpen on V1-14 to a different shape
    state = directorReducer(state, {
      type: 'SET_WAYPOINTS',
      scene: '4-ChatOpen',
      waypoints: [makeWaypoint(500, 500, 0), makeWaypoint(600, 600, 30)],
    });
    expect(state.waypoints['4-ChatOpen']).toHaveLength(2);
    expect(state.waypoints['4-ChatOpen']?.[0].x).toBe(500);
  });
});

describe('Legacy migration', () => {
  it('migrates a v1 blob into sliced layout under its claimed compositionId', () => {
    const legacy = {
      compositionId: 'V1-14',
      selectedScene: '4-ChatOpen',
      frame: 100,
      waypoints: { '4-ChatOpen': [makeWaypoint(50, 50, 0)] },
      sceneGesture: { '4-ChatOpen': 'click' },
      feedbackPins: { DorianFull: [] },
    };
    localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy));

    const did = migrateLegacySession();
    expect(did).toBe(true);

    // Slice should exist under V1-14
    const slice = loadSlice('V1-14');
    expect(slice.waypoints?.['4-ChatOpen']?.[0].x).toBe(50);
    expect(slice.sceneGesture?.['4-ChatOpen']).toBe('click');

    // Meta should exist
    const meta = loadMeta();
    expect(meta.compositionId).toBe('V1-14');
    expect(meta.frame).toBe(100);

    // Legacy key should be cleared
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();

    // A backup should exist (one of the scene-director-backup-* keys)
    let backupFound = false;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('scene-director-backup-')) {
        backupFound = true;
        break;
      }
    }
    expect(backupFound).toBe(true);
  });

  it('is idempotent — second call with no legacy is a no-op', () => {
    expect(migrateLegacySession()).toBe(false);
  });

  it('skips migration when legacy blob has no compositionId', () => {
    localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify({ waypoints: { '4-ChatOpen': [] } }),
    );
    expect(migrateLegacySession()).toBe(false);
    // Legacy blob preserved (we couldn't safely attribute it)
    expect(localStorage.getItem(LEGACY_KEY)).not.toBeNull();
  });

  it('discards corrupt legacy blob with backup', () => {
    localStorage.setItem(LEGACY_KEY, '{ this is not valid JSON');
    migrateLegacySession();
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    // Should leave a corrupt-* backup
    let found = false;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.includes('-corrupt')) found = true;
    }
    expect(found).toBe(true);
  });
});

describe('loadSession (combined meta + current-comp slice)', () => {
  it('combines meta with slice for current composition', () => {
    saveMeta({
      compositionId: 'V1-14',
      selectedScene: '4-ChatOpen',
      frame: 200,
    });
    saveSlice('V1-14', {
      waypoints: { '4-ChatOpen': [makeWaypoint(7, 7, 0)] },
    });

    const session = loadSession();
    expect(session.compositionId).toBe('V1-14');
    expect(session.frame).toBe(200);
    expect(session.waypoints?.['4-ChatOpen']?.[0].x).toBe(7);
  });

  it('returns slice for the meta compositionId, not other comps', () => {
    saveMeta({ compositionId: 'V1-14' });
    saveSlice('V1-10', {
      waypoints: { '4-ChatOpen': [makeWaypoint(100, 100, 0)] },
    });
    saveSlice('V1-14', {
      waypoints: { '4-ChatOpen': [makeWaypoint(500, 500, 0)] },
    });

    const session = loadSession();
    expect(session.waypoints?.['4-ChatOpen']?.[0].x).toBe(500);
  });

  it('runs legacy migration before loading', () => {
    localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify({
        compositionId: 'V1-14',
        waypoints: { '4-ChatOpen': [makeWaypoint(42, 42, 0)] },
      }),
    );

    const session = loadSession();
    expect(session.compositionId).toBe('V1-14');
    expect(session.waypoints?.['4-ChatOpen']?.[0].x).toBe(42);
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });
});

describe('extractSlice', () => {
  it('round-trips through saveSlice → loadSlice', () => {
    const state: DirectorState = {
      ...initialState,
      compositionId: 'V1-14',
      waypoints: { '2-HomeScroll': [makeWaypoint(10, 20, 0)] },
      sceneGesture: { '2-HomeScroll': 'click' },
      sceneDark: { '2-HomeScroll': true },
    };
    saveSlice(state.compositionId, extractSlice(state));
    const loaded = loadSlice(state.compositionId);
    expect(loaded.waypoints).toEqual(state.waypoints);
    expect(loaded.sceneGesture).toEqual(state.sceneGesture);
    expect(loaded.sceneDark).toEqual(state.sceneDark);
  });
});

describe('Slice key isolation regression — the original bleed scenario', () => {
  it('full lifecycle: edit V1-10, switch to V1-14, edit, switch back, no contamination', () => {
    // Phase 1: editing V1-10
    let state: DirectorState = { ...initialState, compositionId: 'V1-10' };
    state = directorReducer(state, {
      type: 'SET_WAYPOINTS',
      scene: '4-ChatOpen',
      waypoints: [makeWaypoint(100, 100, 0)],
    });
    // Persist V1-10's slice (this is what the wrapper does on SET_COMPOSITION)
    saveSlice(state.compositionId, extractSlice(state));

    // Phase 2: switch to V1-14 (slice doesn't exist yet)
    state = directorReducer(state, {
      type: 'SET_COMPOSITION',
      id: 'V1-14',
      slice: loadSlice('V1-14'), // empty {}
    });
    expect(state.waypoints['4-ChatOpen']).toBeUndefined();

    // Phase 3: edit V1-14
    state = directorReducer(state, {
      type: 'SET_WAYPOINTS',
      scene: '4-ChatOpen',
      waypoints: [makeWaypoint(999, 999, 0)],
    });
    saveSlice(state.compositionId, extractSlice(state));

    // Phase 4: switch back to V1-10 — should see V1-10's original work, not V1-14's
    state = directorReducer(state, {
      type: 'SET_COMPOSITION',
      id: 'V1-10',
      slice: loadSlice('V1-10'),
    });
    expect(state.compositionId).toBe('V1-10');
    expect(state.waypoints['4-ChatOpen']?.[0].x).toBe(100);

    // Phase 5: switch back to V1-14 — should see V1-14's work
    state = directorReducer(state, {
      type: 'SET_COMPOSITION',
      id: 'V1-14',
      slice: loadSlice('V1-14'),
    });
    expect(state.waypoints['4-ChatOpen']?.[0].x).toBe(999);
  });
});
