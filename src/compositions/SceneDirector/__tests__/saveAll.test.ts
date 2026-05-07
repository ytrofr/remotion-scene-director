/**
 * Tests for save-all logic: which scenes get included, what proposals look
 * like, and which get persisted vs filtered out.
 *
 * The bug we're fixing: prior to "save everything", only the selected
 * scene was POSTed to /api/save-path. Other scenes the user had edited
 * (but not actively viewed when clicking Save) stayed in localStorage and
 * were lost on the next refresh / HMR.
 */

import { describe, it, expect } from 'vitest';
import {
  collectScenesToSave,
  buildProposalForScene,
  filterPersistableProposals,
} from '../saveAll';
import { initialState, type DirectorState } from '../state.types';
import type { HandPathPoint } from '../../../components/FloatingHand/types';
import type { Layer, HandLayerData } from '../layers';

function makeWaypoint(x: number, y: number, frame: number): HandPathPoint {
  return { x, y, frame, gesture: 'pointer', scale: 1 } as HandPathPoint;
}

function makeHandLayer(scene: string, waypoints: HandPathPoint[]): Layer {
  const data: HandLayerData = {
    type: 'hand',
    waypoints,
    gesture: 'click',
    animation: 'hand-click',
    dark: false,
    size: 120,
  } as HandLayerData;
  return {
    id: `hand-${scene}`,
    scene,
    type: 'hand',
    name: 'Hand',
    visible: true,
    locked: false,
    order: 0,
    data,
  } as Layer;
}

describe('collectScenesToSave', () => {
  it('returns empty array when state has no scene data', () => {
    expect(collectScenesToSave(initialState)).toEqual([]);
  });

  it('collects scenes with waypoints', () => {
    const state: DirectorState = {
      ...initialState,
      waypoints: {
        '1-Intro': [makeWaypoint(0, 0, 0)],
        '2-Scene': [makeWaypoint(0, 0, 0)],
      },
    };
    expect(collectScenesToSave(state)).toEqual(['1-Intro', '2-Scene']);
  });

  it('collects scenes with sceneGesture, sceneAnimation, sceneDark, sceneLocked', () => {
    const state: DirectorState = {
      ...initialState,
      sceneGesture: { a: 'click' },
      sceneAnimation: { b: 'hand-click' },
      sceneDark: { c: true },
      sceneLocked: { d: true },
    };
    expect(collectScenesToSave(state)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('collects scenes with hand layers', () => {
    const state: DirectorState = {
      ...initialState,
      layers: {
        'scene-x': [makeHandLayer('scene-x', [makeWaypoint(0, 0, 0)])],
      },
    };
    expect(collectScenesToSave(state)).toEqual(['scene-x']);
  });

  it('does NOT include scenes with empty layer arrays from default seeding', () => {
    const state: DirectorState = {
      ...initialState,
      layers: { 'empty-scene': [] },
    };
    expect(collectScenesToSave(state)).toEqual([]);
  });

  it('deduplicates scenes appearing in multiple maps', () => {
    const state: DirectorState = {
      ...initialState,
      waypoints: { '1-Intro': [makeWaypoint(0, 0, 0)] },
      sceneGesture: { '1-Intro': 'click' },
      sceneDark: { '1-Intro': true },
    };
    expect(collectScenesToSave(state)).toEqual(['1-Intro']);
  });

  it('returns scenes in deterministic sorted order', () => {
    const state: DirectorState = {
      ...initialState,
      waypoints: {
        'z-last': [makeWaypoint(0, 0, 0)],
        'a-first': [makeWaypoint(0, 0, 0)],
        'm-middle': [makeWaypoint(0, 0, 0)],
      },
    };
    expect(collectScenesToSave(state)).toEqual([
      'a-first',
      'm-middle',
      'z-last',
    ]);
  });
});

describe('buildProposalForScene', () => {
  it('builds proposal with waypoints, gesture, animation defaults', () => {
    const state: DirectorState = {
      ...initialState,
      waypoints: {
        '1-Intro': [makeWaypoint(100, 200, 0), makeWaypoint(300, 400, 30)],
      },
      sceneGesture: { '1-Intro': 'click' },
    };
    const proposal = buildProposalForScene(state, '1-Intro');
    expect(proposal.path).toHaveLength(2);
    expect(proposal.gesture).toBe('click');
    expect(proposal.locked).toBe(false);
  });

  it('includes locked status', () => {
    const state: DirectorState = {
      ...initialState,
      waypoints: { '1-Intro': [makeWaypoint(0, 0, 0)] },
      sceneLocked: { '1-Intro': true },
    };
    expect(buildProposalForScene(state, '1-Intro').locked).toBe(true);
  });

  it('produces empty path for scene with no waypoints', () => {
    const proposal = buildProposalForScene(initialState, 'never-edited');
    expect(proposal.path).toEqual([]);
    expect(proposal.locked).toBe(false);
  });

  it('uses sceneAnimation override over preset default', () => {
    const state: DirectorState = {
      ...initialState,
      waypoints: { a: [makeWaypoint(0, 0, 0)] },
      sceneAnimation: { a: 'cursor-real-black' },
    };
    expect(buildProposalForScene(state, 'a').animation).toBe(
      'cursor-real-black',
    );
  });
});

describe('filterPersistableProposals', () => {
  it('keeps proposals with non-empty paths', () => {
    const proposals = [
      {
        scene: 'a',
        proposal: {
          path: [makeWaypoint(0, 0, 0)],
          gesture: 'click' as const,
          animation: 'hand-click',
          dark: false,
          locked: false,
        },
      },
    ];
    expect(filterPersistableProposals(proposals)).toHaveLength(1);
  });

  it('filters out proposals with empty paths AND not locked', () => {
    const proposals = [
      {
        scene: 'a',
        proposal: {
          path: [],
          gesture: 'click' as const,
          animation: 'hand-click',
          dark: false,
          locked: false,
        },
      },
    ];
    expect(filterPersistableProposals(proposals)).toEqual([]);
  });

  it('keeps locked proposals even with empty paths', () => {
    const proposals = [
      {
        scene: 'a',
        proposal: {
          path: [],
          gesture: 'click' as const,
          animation: 'hand-click',
          dark: false,
          locked: true,
        },
      },
    ];
    expect(filterPersistableProposals(proposals)).toHaveLength(1);
  });
});

describe('Save-everything regression: the scene 1/2/3 lost-work scenario', () => {
  it('the scenario that broke for the user: 3 scenes with waypoints all get saved', () => {
    // The user edited 3 scenes (2-HomeScroll, 3-TapBubble, 4-ChatOpen)
    // but only had 4-ChatOpen actively selected when clicking Save.
    // Old code persisted only 4-ChatOpen. New code must save all 3.
    const state: DirectorState = {
      ...initialState,
      compositionId: 'DorianFullV1-14',
      selectedScene: '4-ChatOpen',
      waypoints: {
        '2-HomeScroll': [makeWaypoint(100, 100, 0), makeWaypoint(200, 200, 30)],
        '3-TapBubble': [makeWaypoint(150, 150, 0)],
        '4-ChatOpen': [makeWaypoint(518, 992, 0), makeWaypoint(480, 1550, 60)],
      },
    };

    const scenes = collectScenesToSave(state);
    expect(scenes).toContain('2-HomeScroll');
    expect(scenes).toContain('3-TapBubble');
    expect(scenes).toContain('4-ChatOpen');
    expect(scenes).toHaveLength(3);

    const proposals = filterPersistableProposals(
      scenes.map((scene) => ({
        scene,
        proposal: buildProposalForScene(state, scene),
      })),
    );
    expect(proposals).toHaveLength(3);
    expect(
      proposals.find((p) => p.scene === '2-HomeScroll')!.proposal.path,
    ).toHaveLength(2);
    expect(
      proposals.find((p) => p.scene === '3-TapBubble')!.proposal.path,
    ).toHaveLength(1);
    expect(
      proposals.find((p) => p.scene === '4-ChatOpen')!.proposal.path,
    ).toHaveLength(2);
  });
});
