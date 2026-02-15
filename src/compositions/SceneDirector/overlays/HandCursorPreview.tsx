/**
 * HandCursorPreview - Animated Lottie hand cursor for SceneDirector.
 * Replaces crosshairs when a gesture tool is active.
 * Uses LottieHandStandalone (lottie-web, no Remotion context needed).
 * Size auto-scales to player viewport with a user-adjustable multiplier.
 */

import React from 'react';
import { useDirector } from '../context';
import { LottieHandStandalone } from '../../../components/FloatingHand/hands/LottieHandStandalone';
import type { GesturePreset } from '../gestures';

interface Props {
  x: number | null;
  y: number | null;
  preset: GesturePreset;
}

export const HandCursorPreview: React.FC<Props> = ({ x, y, preset }) => {
  const { composition, playerScale, cursorScale, state } = useDirector();
  const compWidth = composition.video.width;
  const compHeight = composition.video.height;
  const visible = x !== null && y !== null;

  // Scale hand to match the player viewport size, then apply user multiplier
  const scaledSize = Math.round(preset.size * playerScale * cursorScale);

  // Use scene-level dark override if set, otherwise fall back to preset default
  const isDark = (state.selectedScene ? state.sceneDark[state.selectedScene] : undefined) ?? preset.dark;

  return (
    <>
      {/* Animated Lottie hand — always mounted, visibility toggled */}
      <div
        style={{
          position: 'absolute',
          left: visible ? `${(x! / compWidth) * 100}%` : 0,
          top: visible ? `${(y! / compHeight) * 100}%` : 0,
          transform: 'translate(-25%, -10%)',
          pointerEvents: 'none',
          zIndex: 14,
          visibility: visible ? 'visible' : 'hidden',
        }}
      >
        <LottieHandStandalone
          gesture="pointer"
          size={scaledSize}
          animationFile={preset.animation}
          dark={isDark}
        />
      </div>

      {/* Coordinate label (SVG viewBox for auto-scaling) */}
      {visible && (
        <svg
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 14,
          }}
          viewBox={`0 0 ${compWidth} ${compHeight}`}
          preserveAspectRatio="none"
        >
          <rect x={x! + 14} y={y! - 24} width={80} height={20}
            rx={3} fill="rgba(0,0,0,0.8)" />
          <text x={x! + 18} y={y! - 10}
            fill="#58a6ff" fontSize={12} fontFamily="monospace">
            {x},{y}
          </text>
        </svg>
      )}
    </>
  );
};
