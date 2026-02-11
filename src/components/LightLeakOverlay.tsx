import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LightLeak } from '@remotion/light-leaks';

interface LightLeakOverlayProps {
  seed?: number;
  hueShift?: number; // 0-360, default cyan is around 180
  durationInFrames: number;
}

/**
 * LightLeakOverlay - Cinematic light leak effect
 *
 * Used with TransitionSeries.Overlay for dramatic reveals
 * The effect reveals during first half and retracts during second half
 */
export const LightLeakOverlay: React.FC<LightLeakOverlayProps> = ({
  seed = 42,
  hueShift = 180, // Cyan-ish
  durationInFrames,
}) => {
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
      <LightLeak
        seed={seed}
        hueShift={hueShift}
        durationInFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
};
