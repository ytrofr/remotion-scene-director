/**
 * useAudioEntries - Derives audio entries from user-edited audio layers.
 * Only injects extras when the user has explicitly added/edited audio layers in SceneDirector.
 * Compositions already play their own inline <Audio> tags.
 */

import { useMemo } from 'react';
import type { AudioLayer } from '../layers';
import type { AudioEntry } from '../AudioLayerRenderer';
import type { DirectorState, SceneInfo } from '../state';

/**
 * Collects audio entries ONLY from user-edited audio layers (not coded fallbacks).
 *
 * @param layers - state.layers record (scene -> Layer[])
 * @param scenes - composition.scenes array
 * @returns AudioEntry[] for wrapping the composition component
 */
export function useAudioEntries(
  layers: DirectorState['layers'],
  scenes: SceneInfo[],
): AudioEntry[] {
  return useMemo(() => {
    const entries: AudioEntry[] = [];
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
    return entries;
  }, [layers, scenes]);
}
