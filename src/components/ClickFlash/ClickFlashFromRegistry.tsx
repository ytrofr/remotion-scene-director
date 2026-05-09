/**
 * ClickFlashFromRegistry — renders all CODED_CLICK_FLASH_REGISTRY entries for
 * a given compositionId across N scenes, converting scene-local frame numbers
 * to global frames using the provided sceneOffsets map.
 *
 * Pattern mirrors how DorianFullStoresAudioV1_13 reads CODED_AUDIO_REGISTRY:
 * a thin renderer that walks the registry and emits one ClickFlash per entry.
 *
 * Used by DorianFullV1.21+. Future versions wire by adding their compositionId
 * to layers.ts's CODED_CLICK_FLASH_REGISTRY — no code change needed in the
 * composition wrapper itself.
 */
import React from 'react';
import { ClickFlash } from './ClickFlash';
import { getCodedClickFlashes } from '../../compositions/SceneDirector/layers';

export interface ClickFlashFromRegistryProps {
  /** compositionId key into CODED_CLICK_FLASH_REGISTRY (e.g. 'DorianFullV1-21') */
  compositionId: string;
  /** Map of scene name → global frame offset (where scene starts in the comp). */
  sceneOffsets: Record<string, number>;
}

export const ClickFlashFromRegistry: React.FC<ClickFlashFromRegistryProps> = ({
  compositionId,
  sceneOffsets,
}) => {
  const flashes: React.ReactElement[] = [];
  for (const [sceneName, offset] of Object.entries(sceneOffsets)) {
    const entries = getCodedClickFlashes(compositionId, sceneName);
    for (const entry of entries) {
      flashes.push(
        <ClickFlash
          key={`${sceneName}-${entry.x}-${entry.y}-${entry.frame}`}
          x={entry.x}
          y={entry.y}
          startFrame={offset + entry.frame}
          color={entry.color}
          peakRadius={entry.peakRadius}
          durationInFrames={entry.durationInFrames}
        />,
      );
    }
  }
  return <>{flashes}</>;
};
