/**
 * AudioLayerRenderer - Injects <Audio> elements from SceneDirector user-added audio layers.
 *
 * Architecture: AudioEntriesContext is provided ABOVE the Remotion Player in PlayerArea.
 * AudioFromLayers is rendered INSIDE each composition (e.g. DorianDemo).
 * This avoids HOC wrappers that change the Player's component prop and cause remounts.
 *
 * Coded audio (baseline SFX) is handled by DorianAudio directly — not through this context.
 * This context only carries user-added audio layers from SceneDirector.
 *
 * - SceneDirector: context has user audio layer entries → AudioFromLayers plays them
 * - Remotion Studio: no provider → default [] → AudioFromLayers renders nothing
 */

import React, { createContext, useContext } from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { computeVolumeAtFrame } from '../../lib/audioEnvelope';

export interface AudioEntry {
  id: string;
  file: string;
  globalFrom: number;
  durationInFrames: number;
  volume: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}

export const AudioEntriesContext = createContext<AudioEntry[]>([]);

/**
 * Renders Audio elements from context. Place inside a Remotion composition.
 * When no AudioEntriesContext provider exists (e.g. Remotion Studio), renders nothing.
 */
export const AudioFromLayers: React.FC = () => {
  const entries = useContext(AudioEntriesContext);
  return (
    <>
      {entries.map((e) => (
        <Sequence
          key={e.id}
          from={e.globalFrom}
          durationInFrames={e.durationInFrames || 60}
        >
          <Audio
            src={staticFile(e.file)}
            volume={
              e.fadeInFrames || e.fadeOutFrames
                ? (f) =>
                    computeVolumeAtFrame(f, {
                      baseVolume: e.volume,
                      fadeInFrames: e.fadeInFrames,
                      fadeOutFrames: e.fadeOutFrames,
                      totalFrames: e.durationInFrames || 60,
                    })
                : e.volume
            }
          />
        </Sequence>
      ))}
    </>
  );
};
