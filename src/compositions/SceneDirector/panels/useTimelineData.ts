/**
 * Timeline data hooks - extracted from Timeline.tsx
 * Collects and organizes hand/audio layers for timeline display.
 */

import { useMemo } from 'react';
import type { DirectorState, SceneInfo } from '../state.types';
import type { AudioLayer, HandLayer } from '../layers';

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
