/**
 * FloatingHandOverlay - Renders ALL visible hand layers in SceneDirector editor.
 * Each hand layer gets its own FloatingHand instance with gesture-appropriate animation.
 * Instant show/hide based on each layer's waypoint frame range + duration.
 */

import React, { useMemo } from 'react';
import { FloatingHand } from '../../../components/FloatingHand';
import { DEFAULT_PHYSICS } from '../../../components/FloatingHand/types';
import type { HandLayer } from '../layers';
import { GESTURE_PRESETS } from '../gestures';
import type { CompositionEntry, DirectorState } from '../state';
import type { Layer } from '../layers';

interface Props {
  state: DirectorState;
  sceneLayers: Layer[];
  composition: CompositionEntry;
  frame: number;
  playerScale: number;
  currentScene: { start: number; end: number };
}

/** Renders a single hand layer's FloatingHand */
const SingleHandRenderer: React.FC<{
  layer: HandLayer;
  isPrimary: boolean;
  state: DirectorState;
  frame: number;
  currentScene: { start: number; end: number };
}> = ({ layer, isPrimary, state, frame, currentScene }) => {
  const wps = layer.data.waypoints;
  if (!wps || wps.length === 0) return null;

  const gesture = layer.data.gesture || 'click';
  const preset = GESTURE_PRESETS[gesture];

  // Check if this specific layer is being dragged
  const isSelected = state.selectedLayerId === layer.id;
  const isDragging =
    isSelected && state.draggingIndex !== null && wps[state.draggingIndex];
  const dragWp = isDragging ? wps[state.draggingIndex!] : null;
  const handPath = dragWp ? [{ ...dragWp, frame: 0 }] : wps;
  const handFrame = dragWp ? 0 : frame;
  const handStartFrame = dragWp ? 0 : currentScene.start;

  // Compute global frame range for instant show/hide
  const first = wps[0];
  const last = wps[wps.length - 1];
  const handStartGlobal = currentScene.start + (first.frame ?? 0);
  const handEndGlobal =
    currentScene.start + (last.frame ?? 0) + (last.duration ?? 0);

  // Instant hide outside range (unless dragging)
  if (!dragWp && (frame < handStartGlobal || frame > handEndGlobal)) {
    return null;
  }

  // Primary layer uses scene-level overrides; secondary layers use gesture defaults
  const animation = isPrimary
    ? (state.sceneAnimation[state.selectedScene!] ?? preset.animation)
    : preset.animation;
  const dark = isPrimary
    ? (state.sceneDark[state.selectedScene!] ?? preset.dark)
    : preset.dark;

  return (
    <FloatingHand
      frame={handFrame}
      path={handPath}
      startFrame={handStartFrame}
      animation={animation}
      size={preset.size}
      showRipple={preset.showRipple}
      dark={dark}
      physics={{ ...DEFAULT_PHYSICS, ...preset.physics }}
    />
  );
};

export const FloatingHandOverlay: React.FC<Props> = ({
  state,
  sceneLayers,
  composition,
  frame,
  playerScale,
  currentScene,
}) => {
  const visibleHandLayers = useMemo(
    () =>
      sceneLayers.filter((l): l is HandLayer => l.type === 'hand' && l.visible),
    [sceneLayers],
  );

  if (visibleHandLayers.length === 0) return null;

  // The first hand layer is the "primary" (synced from state.waypoints, uses scene-level overrides)
  const primaryId = visibleHandLayers[0].id;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 11,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: composition.video.width,
          height: composition.video.height,
          transformOrigin: 'top left',
          transform: `scale(${playerScale}) translateY(${composition.globalOffsetY ?? 0}px)`,
          pointerEvents: 'none',
        }}
      >
        {visibleHandLayers.map((layer) => (
          <SingleHandRenderer
            key={layer.id}
            layer={layer}
            isPrimary={layer.id === primaryId}
            state={state}
            frame={frame}
            currentScene={currentScene}
          />
        ))}
      </div>
    </div>
  );
};
