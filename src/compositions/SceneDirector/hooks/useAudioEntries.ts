/**
 * useAudioEntries - Collects user-edited audio layers for SceneDirector.
 *
 * Coded audio (baseline SFX) is handled by DorianAudio inside the composition.
 * This hook only collects user-added audio layers so they can be injected via
 * AudioEntriesContext → AudioFromLayers inside the composition.
 *
 * STABILITY: Returns a stable reference — only changes when actual audio content changes.
 * This prevents the Player from re-mounting on unrelated state updates (waypoint drag, etc.).
 */

import { useMemo, useRef } from 'react';
import type { AudioLayer } from '../layers';
import type { AudioEntry } from '../AudioLayerRenderer';
import type { DirectorState, SceneInfo } from '../state';

/**
 * Collects audio entries from user-edited audio layers (added/modified in SceneDirector).
 * Coded audio is NOT included here — it's rendered by DorianAudio directly.
 *
 * @param compositionId - e.g. 'DorianDemo'
 * @param layers - state.layers record (scene -> Layer[])
 * @param scenes - composition.scenes array
 * @returns AudioEntry[] — stable reference (only changes when audio content changes)
 */
export function useAudioEntries(
  compositionId: string,
  layers: DirectorState['layers'],
  scenes: SceneInfo[],
): AudioEntry[] {
  const prevRef = useRef<AudioEntry[]>([]);
  const prevKeyRef = useRef('');

  return useMemo(() => {
    const entries: AudioEntry[] = [];

    // All audio layers (auto-created from coded audio + user-added via UI)
    for (const [sceneName, sceneLayers] of Object.entries(layers)) {
      const scene = scenes.find((s) => s.name === sceneName);
      if (!scene) continue;
      for (const layer of sceneLayers) {
        if (layer.type !== 'audio' || !layer.visible) continue;
        const audioData = (layer as AudioLayer).data;
        entries.push({
          id: layer.id,
          file: audioData.file,
          globalFrom: scene.start + audioData.startFrame,
          durationInFrames: audioData.durationInFrames || 60,
          volume: audioData.volume,
        });
      }
    }

    // Stable reference: only return a new array when content actually changes.
    // This prevents Player re-mount on unrelated state changes (waypoint drag, etc.)
    const key = entries
      .map((e) => `${e.id}:${e.globalFrom}:${e.durationInFrames}:${e.volume}`)
      .join('|');
    if (key === prevKeyRef.current) {
      return prevRef.current;
    }
    prevKeyRef.current = key;
    prevRef.current = entries;
    return entries;
  }, [compositionId, layers, scenes]);
}
