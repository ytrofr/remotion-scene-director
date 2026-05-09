/**
 * Tests for sceneConfig resolver — chain walk, cycle detection, depth limit,
 * property-level merge.
 *
 * Each pure function is tested with a synthetic registry argument to avoid
 * coupling to the real sceneConfig.data.json (which starts empty + grows
 * over time).
 */

import { describe, it, expect } from 'vitest';
import {
  walkExtendsChain,
  mergeSceneEntry,
  resolveSceneConfig,
  resolveAllScenes,
  hasSceneConfig,
  SceneConfigError,
  type SceneConfigRegistry,
  type SceneConfigEntry,
} from '../sceneConfig';

// ── walkExtendsChain ────────────────────────────────────────────────────────

describe('walkExtendsChain', () => {
  it('returns single-element chain when no _extends', () => {
    const reg: SceneConfigRegistry = {
      A: { _scenes: {} },
    };
    expect(walkExtendsChain('A', reg)).toEqual(['A']);
  });

  it('walks 3-level chain root→leaf', () => {
    const reg: SceneConfigRegistry = {
      Root: { _scenes: {} },
      Mid: { _extends: 'Root', _scenes: {} },
      Leaf: { _extends: 'Mid', _scenes: {} },
    };
    expect(walkExtendsChain('Leaf', reg)).toEqual(['Root', 'Mid', 'Leaf']);
  });

  it('returns chain even when comp has no entry (orphan compId)', () => {
    // Caller may pass a compId that doesn't exist in the registry — the
    // walk should still return [compId] so the resolver can return null
    // gracefully.
    const reg: SceneConfigRegistry = {};
    expect(walkExtendsChain('Ghost', reg)).toEqual(['Ghost']);
  });

  it('throws SceneConfigError on direct cycle (A→A)', () => {
    const reg: SceneConfigRegistry = {
      A: { _extends: 'A', _scenes: {} },
    };
    expect(() => walkExtendsChain('A', reg)).toThrow(SceneConfigError);
    expect(() => walkExtendsChain('A', reg)).toThrow(/cycle/);
  });

  it('throws SceneConfigError on indirect cycle (A→B→A)', () => {
    const reg: SceneConfigRegistry = {
      A: { _extends: 'B', _scenes: {} },
      B: { _extends: 'A', _scenes: {} },
    };
    expect(() => walkExtendsChain('A', reg)).toThrow(/cycle/);
  });

  it('throws SceneConfigError when chain depth > 5', () => {
    const reg: SceneConfigRegistry = {
      L1: { _scenes: {} },
      L2: { _extends: 'L1', _scenes: {} },
      L3: { _extends: 'L2', _scenes: {} },
      L4: { _extends: 'L3', _scenes: {} },
      L5: { _extends: 'L4', _scenes: {} },
      L6: { _extends: 'L5', _scenes: {} },
      L7: { _extends: 'L6', _scenes: {} },
    };
    expect(() => walkExtendsChain('L7', reg)).toThrow(/depth/);
  });

  it('allows exactly 5-level chain (boundary)', () => {
    const reg: SceneConfigRegistry = {
      L1: { _scenes: {} },
      L2: { _extends: 'L1', _scenes: {} },
      L3: { _extends: 'L2', _scenes: {} },
      L4: { _extends: 'L3', _scenes: {} },
      L5: { _extends: 'L4', _scenes: {} },
    };
    expect(walkExtendsChain('L5', reg)).toEqual(['L1', 'L2', 'L3', 'L4', 'L5']);
  });
});

// ── mergeSceneEntry ────────────────────────────────────────────────────────

describe('mergeSceneEntry', () => {
  it('returns empty object when both undefined', () => {
    expect(mergeSceneEntry(undefined, undefined)).toEqual({});
  });

  it('returns shallow clone of base when child undefined', () => {
    const base: SceneConfigEntry = { meta: { duration: 100 } };
    const result = mergeSceneEntry(base, undefined);
    expect(result).toEqual(base);
    expect(result).not.toBe(base); // different reference
  });

  it('returns shallow clone of child when base undefined', () => {
    const child: SceneConfigEntry = { meta: { duration: 100 } };
    const result = mergeSceneEntry(undefined, child);
    expect(result).toEqual(child);
    expect(result).not.toBe(child);
  });

  it('child wins on top-level keys', () => {
    const base: SceneConfigEntry = { _locked: false };
    const child: SceneConfigEntry = { _locked: true };
    expect(mergeSceneEntry(base, child)._locked).toBe(true);
  });

  it('deep-merges meta (child wins on overlap, base preserved otherwise)', () => {
    const base: SceneConfigEntry = { meta: { duration: 100, zoom: 1.5 } };
    const child: SceneConfigEntry = { meta: { duration: 200 } };
    expect(mergeSceneEntry(base, child).meta).toEqual({
      duration: 200, // child wins
      zoom: 1.5, // base preserved
    });
  });

  it('deep-merges hand', () => {
    const base: SceneConfigEntry = { hand: { path: [] } };
    const child: SceneConfigEntry = {
      hand: { path: [{ x: 1, y: 2, frame: 0 } as never] },
    };
    expect(mergeSceneEntry(base, child).hand?.path).toHaveLength(1);
  });

  it('deep-merges markers by key', () => {
    const base: SceneConfigEntry = {
      markers: { tvCard: { x: 540, y: 1480 }, sendBtn: { x: 950, y: 1700 } },
    };
    const child: SceneConfigEntry = {
      markers: { tvCard: { x: 600, y: 1500 } }, // override one
    };
    const result = mergeSceneEntry(base, child).markers;
    expect(result?.tvCard).toEqual({ x: 600, y: 1500 }); // child wins
    expect(result?.sendBtn).toEqual({ x: 950, y: 1700 }); // base preserved
  });

  it('replaces clickFlash array wholesale (child wins)', () => {
    const base: SceneConfigEntry = {
      clickFlash: [
        { x: 1, y: 1, frame: 1 },
        { x: 2, y: 2, frame: 2 },
      ],
    };
    const child: SceneConfigEntry = {
      clickFlash: [{ x: 99, y: 99, frame: 99 }],
    };
    expect(mergeSceneEntry(base, child).clickFlash).toEqual([
      { x: 99, y: 99, frame: 99 },
    ]);
  });

  it('replaces audio array wholesale (child wins)', () => {
    const base: SceneConfigEntry = {
      audio: [{ file: 'a.wav', frame: 0 }],
    };
    const child: SceneConfigEntry = {
      audio: [{ file: 'b.wav', frame: 10 }],
    };
    expect(mergeSceneEntry(base, child).audio).toEqual([
      { file: 'b.wav', frame: 10 },
    ]);
  });

  it('falls back to base when child explicitly omits an array key', () => {
    // child.clickFlash undefined → base preserved
    const base: SceneConfigEntry = { clickFlash: [{ x: 1, y: 1, frame: 1 }] };
    const child: SceneConfigEntry = { _locked: true };
    expect(mergeSceneEntry(base, child).clickFlash).toEqual([
      { x: 1, y: 1, frame: 1 },
    ]);
  });
});

// ── resolveSceneConfig ─────────────────────────────────────────────────────

describe('resolveSceneConfig', () => {
  it('returns null when no entries exist anywhere in chain', () => {
    const reg: SceneConfigRegistry = {
      A: { _scenes: {} },
    };
    expect(resolveSceneConfig('A', 'sceneX', reg)).toBeNull();
  });

  it('returns leaf entry when no inheritance', () => {
    const reg: SceneConfigRegistry = {
      A: { _scenes: { 'scene-1': { meta: { duration: 100 } } } },
    };
    expect(resolveSceneConfig('A', 'scene-1', reg)).toEqual({
      meta: { duration: 100 },
    });
  });

  it('inherits scene entry from parent when leaf has no override', () => {
    const reg: SceneConfigRegistry = {
      Base: { _scenes: { s1: { meta: { duration: 100 } } } },
      Leaf: { _extends: 'Base', _scenes: {} },
    };
    expect(resolveSceneConfig('Leaf', 's1', reg)).toEqual({
      meta: { duration: 100 },
    });
  });

  it('child overrides + base preserves non-overridden fields', () => {
    const reg: SceneConfigRegistry = {
      Base: {
        _scenes: {
          s1: {
            meta: { duration: 100, zoom: 1.5 },
            clickFlash: [{ x: 1, y: 1, frame: 1 }],
          },
        },
      },
      Leaf: {
        _extends: 'Base',
        _scenes: {
          s1: { meta: { duration: 250 } }, // only duration
        },
      },
    };
    const r = resolveSceneConfig('Leaf', 's1', reg);
    expect(r?.meta).toEqual({ duration: 250, zoom: 1.5 });
    expect(r?.clickFlash).toEqual([{ x: 1, y: 1, frame: 1 }]); // inherited
  });

  it('walks 3-level chain correctly (Root→Mid→Leaf, leaf wins)', () => {
    const reg: SceneConfigRegistry = {
      Root: { _scenes: { s1: { meta: { duration: 100, zoom: 1 } } } },
      Mid: { _extends: 'Root', _scenes: { s1: { meta: { zoom: 2 } } } },
      Leaf: {
        _extends: 'Mid',
        _scenes: { s1: { _locked: true } },
      },
    };
    const r = resolveSceneConfig('Leaf', 's1', reg);
    expect(r).toEqual({
      meta: { duration: 100, zoom: 2 }, // Mid's zoom won over Root's
      _locked: true, // Leaf added
    });
  });
});

// ── resolveAllScenes ───────────────────────────────────────────────────────

describe('resolveAllScenes', () => {
  it('returns empty record when no entries', () => {
    expect(resolveAllScenes('Ghost', {})).toEqual({});
  });

  it('union of scenes across chain', () => {
    const reg: SceneConfigRegistry = {
      Base: { _scenes: { s1: { meta: { duration: 100 } } } },
      Leaf: {
        _extends: 'Base',
        _scenes: { s2: { meta: { duration: 200 } } },
      },
    };
    expect(resolveAllScenes('Leaf', reg)).toEqual({
      s1: { meta: { duration: 100 } },
      s2: { meta: { duration: 200 } },
    });
  });
});

// ── hasSceneConfig ─────────────────────────────────────────────────────────

describe('hasSceneConfig', () => {
  it('returns false for empty registry', () => {
    expect(hasSceneConfig('A', {})).toBe(false);
  });

  it('returns false when comp has no _scenes entries anywhere', () => {
    const reg: SceneConfigRegistry = { A: { _scenes: {} } };
    expect(hasSceneConfig('A', reg)).toBe(false);
  });

  it('returns true when leaf has scenes', () => {
    const reg: SceneConfigRegistry = {
      A: { _scenes: { s1: { meta: { duration: 100 } } } },
    };
    expect(hasSceneConfig('A', reg)).toBe(true);
  });

  it('returns true when ancestor has scenes', () => {
    const reg: SceneConfigRegistry = {
      Base: { _scenes: { s1: { meta: { duration: 100 } } } },
      Leaf: { _extends: 'Base', _scenes: {} },
    };
    expect(hasSceneConfig('Leaf', reg)).toBe(true);
  });

  it('returns false (fail-closed) on cycle', () => {
    const reg: SceneConfigRegistry = {
      A: { _extends: 'B', _scenes: {} },
      B: { _extends: 'A', _scenes: {} },
    };
    expect(hasSceneConfig('A', reg)).toBe(false);
  });
});
