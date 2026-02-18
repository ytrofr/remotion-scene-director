/**
 * AudioLayerRenderer - Injects <Audio> elements from SceneDirector audio layers.
 * Used as a wrapper around composition components so audio layers actually play.
 */

import React, { createContext, useContext } from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import type { AudioLayer } from './layers';

interface AudioEntry {
  id: string;
  file: string;
  globalFrom: number;
  durationInFrames: number;
  volume: number;
}

const AudioEntriesContext = createContext<AudioEntry[]>([]);

/**
 * Renders Audio elements from context. Place inside a Remotion composition.
 */
export const AudioFromLayers: React.FC = () => {
  const entries = useContext(AudioEntriesContext);
  return (
    <>
      {entries.map(e => (
        <Sequence key={e.id} from={e.globalFrom} durationInFrames={e.durationInFrames || 60}>
          <Audio src={staticFile(e.file)} volume={e.volume} />
        </Sequence>
      ))}
    </>
  );
};

/**
 * Creates a wrapped component that renders the original + audio layers.
 */
export function withAudioLayers(
  Component: React.FC,
  audioEntries: AudioEntry[],
): React.FC {
  const Wrapped: React.FC = () => (
    <AudioEntriesContext.Provider value={audioEntries}>
      <Component />
      <AudioFromLayers />
    </AudioEntriesContext.Provider>
  );
  Wrapped.displayName = `WithAudio(${Component.displayName || Component.name})`;
  return Wrapped;
}

export type { AudioEntry };
