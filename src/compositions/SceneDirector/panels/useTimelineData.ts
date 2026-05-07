/**
 * Timeline data hooks - extracted from Timeline.tsx
 * Collects and organizes hand/audio/caption layers for timeline display.
 */

import { useMemo } from 'react';
import type { DirectorState, SceneInfo } from '../state.types';
import type { AudioLayer, CaptionLayer, HandLayer } from '../layers';

// ─── Hand layers ─────────────────────────────────────────────

export interface HandLayerEntry {
  layer: HandLayer;
  sceneStart: number;
  sceneEnd: number;
  sceneName: string;
}

export function useHandLayers(
  layers: DirectorState['layers'],
  scenes: SceneInfo[],
): HandLayerEntry[] {
  return useMemo(() => {
    const result: HandLayerEntry[] = [];
    for (const [sceneName, sceneLayers] of Object.entries(layers)) {
      const scene = scenes.find((s) => s.name === sceneName);
      if (!scene) continue;
      for (const l of sceneLayers) {
        if (l.type === 'hand' && l.visible) {
          result.push({
            layer: l as HandLayer,
            sceneStart: scene.start,
            sceneEnd: scene.end,
            sceneName,
          });
        }
      }
    }
    return result;
  }, [layers, scenes]);
}

// ─── Hand layers with row assignment (audio-style) ───────────
//
// When multiple hand-gesture bars overlap in the timeline (e.g. a primary
// path + several secondary click layers in the same scene window), they
// pile up on a single row and become hard to drag. Greedy-assign each bar
// to the first row where it doesn't overlap — same algorithm as audio.

export function useHandLayerRows(
  layers: DirectorState['layers'],
  scenes: SceneInfo[],
): HandLayerEntry[][] {
  return useMemo(() => {
    type Entry = HandLayerEntry & { gs: number; ge: number };
    const all: Entry[] = [];
    for (const [sceneName, sceneLayers] of Object.entries(layers)) {
      const scene = scenes.find((s) => s.name === sceneName);
      if (!scene) continue;
      for (const l of sceneLayers) {
        if (l.type !== 'hand' || !l.visible) continue;
        const hand = l as HandLayer;
        const wps = hand.data.waypoints || [];
        if (wps.length === 0) continue;
        const firstFrame = wps[0].frame ?? 0;
        const lastWp = wps[wps.length - 1];
        const lastFrame = (lastWp.frame ?? 0) + (lastWp.duration ?? 0);
        all.push({
          layer: hand,
          sceneStart: scene.start,
          sceneEnd: scene.end,
          sceneName,
          gs: scene.start + firstFrame,
          ge: scene.start + lastFrame,
        });
      }
    }
    // Sort by global start so placement is deterministic and override
    // conflicts (rare) are resolved earliest-wins.
    const sorted = all.sort((a, b) => a.gs - b.gs);
    const rows: Entry[][] = [];

    // Pass 1 — entries with explicit laneOverride get their preferred lane
    // when feasible (extending row array as needed; falling back to greedy if
    // another override-entry already occupies the lane at an overlapping time).
    // Pass 2 — entries without override greedy-pack into first non-overlapping
    // row. Both passes share the same `rows` array so override pins are
    // honored before greedy packing fills around them.
    const noOverride: Entry[] = [];
    for (const entry of sorted) {
      const override = entry.layer.data.laneOverride;
      if (typeof override !== 'number' || override < 0) {
        noOverride.push(entry);
        continue;
      }
      while (rows.length <= override) rows.push([]);
      const target = rows[override];
      const last = target[target.length - 1];
      if (!last || entry.gs >= last.ge) {
        target.push(entry);
      } else {
        // Override conflicts with an earlier-placed bar in the same lane —
        // defer to greedy so the user's pin doesn't visually overlap.
        noOverride.push(entry);
      }
    }
    for (const entry of noOverride) {
      let placed = false;
      for (const row of rows) {
        const last = row[row.length - 1];
        if (!last || entry.gs >= last.ge) {
          row.push(entry);
          placed = true;
          break;
        }
      }
      if (!placed) rows.push([entry]);
    }
    // Drop fully-empty rows (can happen when an override targets a lane far
    // beyond what greedy would otherwise produce, e.g. user pins to lane 5
    // when only 2 lanes are needed).
    const compacted = rows.filter((r) => r.length > 0);
    // Strip the gs/ge helpers; consumer doesn't need them
    return compacted.map((row) =>
      row.map(({ gs: _gs, ge: _ge, ...rest }) => rest),
    );
  }, [layers, scenes]);
}

// ─── Audio layers with row assignment ────────────────────────

export interface AudioEntry {
  layer: AudioLayer;
  sceneStart: number;
  sceneName: string;
  globalStart: number;
  globalEnd: number;
}

export function useAudioRows(
  layers: DirectorState['layers'],
  scenes: SceneInfo[],
): AudioEntry[][] {
  return useMemo(() => {
    const allAudio: AudioEntry[] = [];
    for (const [sceneName, sceneLayers] of Object.entries(layers)) {
      const scene = scenes.find((s) => s.name === sceneName);
      if (!scene) continue;
      for (const l of sceneLayers) {
        if (l.type === 'audio' && l.visible) {
          const a = l as AudioLayer;
          const gs = scene.start + a.data.startFrame;
          const ge = gs + (a.data.durationInFrames || 60);
          allAudio.push({
            layer: a,
            sceneStart: scene.start,
            sceneName,
            globalStart: gs,
            globalEnd: ge,
          });
        }
      }
    }
    // Assign rows greedily: each audio bar goes in the first row where it doesn't overlap
    const rows: AudioEntry[][] = [];
    for (const entry of allAudio.sort(
      (a, b) => a.globalStart - b.globalStart,
    )) {
      let placed = false;
      for (const row of rows) {
        const lastInRow = row[row.length - 1];
        if (entry.globalStart >= lastInRow.globalEnd) {
          row.push(entry);
          placed = true;
          break;
        }
      }
      if (!placed) rows.push([entry]);
    }
    return rows;
  }, [layers, scenes]);
}

// ─── Caption layers ──────────────────────────────────────────

export interface CaptionBarEntry {
  layer: CaptionLayer;
  sceneName: string;
  globalStart: number;
  globalEnd: number;
}

export function useCaptionBars(
  layers: DirectorState['layers'],
): CaptionBarEntry[] {
  return useMemo(() => {
    const result: CaptionBarEntry[] = [];
    for (const [sceneName, sceneLayers] of Object.entries(layers)) {
      for (const l of sceneLayers) {
        if (l.type === 'caption' && l.visible) {
          const c = l as CaptionLayer;
          result.push({
            layer: c,
            sceneName,
            globalStart: c.data.startFrame,
            globalEnd: c.data.startFrame + c.data.durationInFrames,
          });
        }
      }
    }
    return result.sort((a, b) => a.globalStart - b.globalStart);
  }, [layers]);
}
