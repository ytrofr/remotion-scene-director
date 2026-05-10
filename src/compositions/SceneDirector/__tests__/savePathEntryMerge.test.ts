/**
 * Regression tests for /api/save-path entry merging.
 *
 * Bug history (2026-05-10): Stage 2 added physicsPreset/showRipple/size
 * to the client save proposal but the server endpoint silently dropped
 * them. Every Save wiped seeded values; parity test went red the first
 * time a user saved any scene. These tests pin the preserve-on-absence
 * semantic so future Stage N fields can't regress the same way.
 */

import { describe, expect, it } from 'vitest';
import { mergeSavePathEntry } from '../savePathEntryMerge';

const incomingMin = {
  gesture: 'click',
  animation: 'cursor-real-black',
  path: [
    { x: 100, y: 200, frame: 0, gesture: 'pointer' },
    { x: 200, y: 300, frame: 30, gesture: 'click' },
  ],
};

describe('mergeSavePathEntry', () => {
  describe('Stage 1 fields (always-present)', () => {
    it('writes gesture/animation/path from incoming', () => {
      const out = mergeSavePathEntry(null, incomingMin);
      expect(out.gesture).toBe('click');
      expect(out.animation).toBe('cursor-real-black');
      expect(out.path).toEqual(incomingMin.path);
    });

    it('writes dark when explicitly set', () => {
      const out = mergeSavePathEntry(null, { ...incomingMin, dark: false });
      expect(out.dark).toBe(false);
    });

    it('omits dark when undefined', () => {
      const out = mergeSavePathEntry(null, incomingMin);
      expect('dark' in out).toBe(false);
    });

    it('writes _locked only when locked === true', () => {
      const t = mergeSavePathEntry(null, { ...incomingMin, locked: true });
      const f = mergeSavePathEntry(null, { ...incomingMin, locked: false });
      expect(t._locked).toBe(true);
      expect('_locked' in f).toBe(false);
    });

    it('writes secondaryLayers when non-empty array', () => {
      const sec = [{ gesture: 'click', path: [{ x: 0, y: 0, frame: 0 }] }];
      const out = mergeSavePathEntry(null, {
        ...incomingMin,
        secondaryLayers: sec,
      });
      expect(out.secondaryLayers).toEqual(sec);
    });

    it('omits secondaryLayers when empty or absent', () => {
      const a = mergeSavePathEntry(null, {
        ...incomingMin,
        secondaryLayers: [],
      });
      const b = mergeSavePathEntry(null, incomingMin);
      expect('secondaryLayers' in a).toBe(false);
      expect('secondaryLayers' in b).toBe(false);
    });
  });

  describe('Stage 2 preserve-on-absence (THE BUG FIX)', () => {
    it('preserves prevEntry.physicsPreset when incoming.physicsPreset === undefined', () => {
      const prev = { physicsPreset: 'tap', showRipple: true };
      const out = mergeSavePathEntry(prev, incomingMin);
      expect(out.physicsPreset).toBe('tap');
      expect(out.showRipple).toBe(true);
    });

    it('preserves prevEntry.size when incoming.size === undefined', () => {
      const prev = { size: 144 };
      const out = mergeSavePathEntry(prev, incomingMin);
      expect(out.size).toBe(144);
    });

    it('overrides when incoming has new value', () => {
      const prev = { physicsPreset: 'tap', showRipple: true };
      const out = mergeSavePathEntry(prev, {
        ...incomingMin,
        physicsPreset: 'scrollbar',
        showRipple: false,
      });
      expect(out.physicsPreset).toBe('scrollbar');
      expect(out.showRipple).toBe(false);
    });

    it('explicit null clears the field (incoming null wins over prev value)', () => {
      const prev = { physicsPreset: 'tap', showRipple: true, size: 120 };
      const out = mergeSavePathEntry(prev, {
        ...incomingMin,
        physicsPreset: null,
        showRipple: null,
        size: null,
      });
      expect('physicsPreset' in out).toBe(false);
      expect('showRipple' in out).toBe(false);
      expect('size' in out).toBe(false);
    });

    it('omits Stage 2 fields when prev is null and incoming is undefined', () => {
      const out = mergeSavePathEntry(null, incomingMin);
      expect('physicsPreset' in out).toBe(false);
      expect('showRipple' in out).toBe(false);
      expect('size' in out).toBe(false);
    });

    it('first-save with explicit Stage 2 values writes them', () => {
      const out = mergeSavePathEntry(null, {
        ...incomingMin,
        physicsPreset: 'tap',
        showRipple: true,
        size: 144,
      });
      expect(out.physicsPreset).toBe('tap');
      expect(out.showRipple).toBe(true);
      expect(out.size).toBe(144);
    });
  });

  describe('regression: the original bug scenario', () => {
    it('user re-saves scene 4-ChatOpen (waypoint edit only) — physicsPreset survives', () => {
      // Reproduces: Stage 2 seeded JSON, user opens SD, edits a waypoint
      // on scene 4 without touching Inspector, hits Save. Client sends
      // physicsPreset undefined (Inspector untouched). Server must
      // preserve "tap" from prevEntry.
      const prev = {
        gesture: 'click',
        animation: 'cursor-real-black',
        physicsPreset: 'tap',
        showRipple: true,
        path: [{ x: 0, y: 0, frame: 0 }],
      };
      const incoming = {
        ...incomingMin,
        path: [
          { x: 973, y: 1502, frame: 11, gesture: 'pointer' },
          { x: 488, y: 1608, frame: 86, gesture: 'click' },
        ],
        // physicsPreset/showRipple/size NOT present (Inspector untouched)
      };
      const out = mergeSavePathEntry(prev, incoming);
      expect(out.physicsPreset).toBe('tap'); // ← the bug: was undefined → null → wiped
      expect(out.showRipple).toBe(true);
      expect(out.path).toEqual(incoming.path); // waypoint edit landed
    });
  });
});
