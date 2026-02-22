/**
 * FloatingHandOverlay - Renders the FloatingHand preview in SceneDirector editor.
 * Extracted from App.tsx IIFE for modularity.
 * Fades out ~8 frames after the last waypoint ends.
 */

import React, { useMemo } from 'react';
import { FloatingHand } from '../../../components/FloatingHand';
import { DEFAULT_PHYSICS } from '../../../components/FloatingHand/types';
import type { HandPathPoint } from '../../../components/FloatingHand/types';
import type { HandLayer } from '../layers';
import type { GesturePreset } from '../gestures';
import type { CompositionEntry, DirectorState } from '../state';
import type { Layer } from '../layers';

const FADE_FRAMES = 8;

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

  const isDragging =
    state.draggingIndex !== null && effectiveWaypoints[state.draggingIndex];
  const dragWp = isDragging ? effectiveWaypoints[state.draggingIndex!] : null;
  const handPath = dragWp ? [{ ...dragWp, frame: 0 }] : effectiveWaypoints;
  const handFrame = dragWp ? 0 : frame;
  const handStartFrame = dragWp ? 0 : currentScene.start;

  // Compute the global frames where the first waypoint starts and last ends
  const { handStartGlobal, handEndGlobal } = useMemo(() => {
    if (!effectiveWaypoints.length)
      return {
        handStartGlobal: currentScene.start,
        handEndGlobal: currentScene.end,
      };
    const first = effectiveWaypoints[0];
    const last = effectiveWaypoints[effectiveWaypoints.length - 1];
    return {
      handStartGlobal: currentScene.start + (first.frame ?? 0),
      handEndGlobal:
        currentScene.start + (last.frame ?? 0) + (last.duration ?? 0),
    };
  }, [effectiveWaypoints, currentScene.start, currentScene.end]);

  // Hide before first waypoint (with fade-in) and after last waypoint (with fade-out)
  const framesBefore = handStartGlobal - frame;
  const framesAfterEnd = frame - handEndGlobal;
  if (dragWp) {
    // Always visible during drag
  } else if (framesBefore > FADE_FRAMES) {
    return null;
  } else if (framesAfterEnd > FADE_FRAMES) {
    return null;
  }

  let opacity = 1;
  if (!dragWp) {
    if (framesBefore > 0) {
      opacity = 1 - framesBefore / FADE_FRAMES; // fade in
    } else if (framesAfterEnd > 0) {
      opacity = 1 - framesAfterEnd / FADE_FRAMES; // fade out
    }
  }

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
        opacity,
        transition: 'none',
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
        <FloatingHand
          frame={handFrame}
          path={handPath}
          startFrame={handStartFrame}
          animation={
            state.sceneAnimation[state.selectedScene!] ?? scenePreset.animation
          }
          size={scenePreset.size}
          showRipple={scenePreset.showRipple}
          dark={state.sceneDark[state.selectedScene!] ?? scenePreset.dark}
          physics={{ ...DEFAULT_PHYSICS, ...scenePreset.physics }}
        />
      </div>
    </div>
  );
};
