/**
 * FloatingHandOverlay - Renders the FloatingHand preview in SceneDirector editor.
 * Extracted from App.tsx IIFE for modularity.
 */

import React from 'react';
import { FloatingHand } from '../../../components/FloatingHand';
import { DEFAULT_PHYSICS } from '../../../components/FloatingHand/types';
import type { HandPathPoint } from '../../../components/FloatingHand/types';
import type { HandLayer } from '../layers';
import type { GesturePreset } from '../gestures';
import type { CompositionEntry, DirectorState } from '../state';
import type { Layer } from '../layers';

interface Props {
  state: DirectorState;
  effectiveWaypoints: HandPathPoint[];
  sceneLayers: Layer[];
  scenePreset: GesturePreset;
  composition: CompositionEntry;
  frame: number;
  playerScale: number;
  currentScene: { start: number; end: number };
}

export const FloatingHandOverlay: React.FC<Props> = ({
  state,
  effectiveWaypoints,
  sceneLayers,
  scenePreset,
  composition,
  frame,
  playerScale,
  currentScene,
}) => {
  // Hand only renders if a visible hand layer exists (layers are source of truth)
  const handLayer = sceneLayers.find((l): l is HandLayer => l.type === 'hand');
  if (!handLayer || !handLayer.visible) return null;

  const isDragging = state.draggingIndex !== null && effectiveWaypoints[state.draggingIndex];
  const dragWp = isDragging ? effectiveWaypoints[state.draggingIndex!] : null;
  const handPath = dragWp ? [{ ...dragWp, frame: 0 }] : effectiveWaypoints;
  const handFrame = dragWp ? 0 : frame;
  const handStartFrame = dragWp ? 0 : currentScene.start;

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 11,
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: composition.video.width,
        height: composition.video.height,
        transformOrigin: 'top left',
        transform: `scale(${playerScale}) translateY(${composition.globalOffsetY ?? 0}px)`,
        pointerEvents: 'none',
      }}>
        <FloatingHand
          frame={handFrame}
          path={handPath}
          startFrame={handStartFrame}
          animation={state.sceneAnimation[state.selectedScene!] ?? scenePreset.animation}
          size={scenePreset.size}
          showRipple={scenePreset.showRipple}
          dark={state.sceneDark[state.selectedScene!] ?? scenePreset.dark}
          physics={{ ...DEFAULT_PHYSICS, ...scenePreset.physics }}
        />
      </div>
    </div>
  );
};
