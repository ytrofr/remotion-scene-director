/**
 * FloatingHandOverlay - Renders ALL visible hand layers in SceneDirector editor.
 * Each hand layer gets its own FloatingHand instance with gesture-appropriate animation.
 * Instant show/hide based on each layer's waypoint frame range + duration.
 */

import React, { useMemo } from 'react';
import { FloatingHand } from '../../../components/FloatingHand';
import type { HandLayer } from '../layers';
import { CLICK_ANIM_DURATION, MIN_CLICK_DURATION } from '../gestures';
import { resolveSDPreviewProps } from '../floatingHandPropResolver';
import type { CompositionEntry, DirectorState, SceneInfo } from '../state';
import type { Layer } from '../layers';

interface Props {
  state: DirectorState;
  sceneLayers: Layer[];
  composition: CompositionEntry;
  frame: number;
  playerScale: number;
  currentScene: SceneInfo;
  /** All scenes in the composition (for click bleed-over detection) */
  allScenes?: SceneInfo[];
}

/** Renders a single hand layer's FloatingHand */
const SingleHandRenderer: React.FC<{
  layer: HandLayer;
  isPrimary: boolean;
  state: DirectorState;
  frame: number;
  /** The scene this layer belongs to (may differ from selected scene for bleed-over) */
  ownerScene: SceneInfo;
  ownerSceneName: string;
  /** Per-composition override for the click-animation Lottie. */
  clickAnimationOverride?: string | null;
  /** Per-composition click visual style (mirrors render-path ClickStyleProvider). */
  clickStyle?: 'default' | 'soft-pulse';
}> = ({
  layer,
  isPrimary,
  state,
  frame,
  ownerScene,
  ownerSceneName,
  clickAnimationOverride,
  clickStyle,
}) => {
  const wps = layer.data.waypoints;
  if (!wps || wps.length === 0) return null;

  const gesture = layer.data.gesture || 'click';

  // Check if this specific layer is being dragged
  const isSelected = state.selectedLayerId === layer.id;
  const isDragging =
    isSelected && state.draggingIndex !== null && wps[state.draggingIndex];
  const dragWp = isDragging ? wps[state.draggingIndex!] : null;
  const handPath = dragWp ? [{ ...dragWp, frame: 0 }] : wps;
  const handFrame = dragWp ? 0 : frame;
  const handStartFrame = dragWp ? 0 : ownerScene.start;

  // Compute global frame range for instant show/hide
  const first = wps[0];
  const last = wps[wps.length - 1];
  const handStartGlobal = ownerScene.start + (first.frame ?? 0);
  // Click waypoints stay visible for at least MIN_CLICK_DURATION (user may have
  // shortened the duration below CLICK_ANIM_DURATION via timeline drag).
  const lastDuration =
    last.gesture === 'click'
      ? Math.max(last.duration ?? 0, MIN_CLICK_DURATION)
      : (last.duration ?? 0);
  const handEndGlobal = ownerScene.start + (last.frame ?? 0) + lastDuration;

  // Instant hide outside range (unless dragging)
  if (!dragWp && (frame < handStartGlobal || frame > handEndGlobal)) {
    return null;
  }

  // Single source of truth for prop computation — shared with parity test.
  const resolved = resolveSDPreviewProps({
    compositionId: '', // not consumed by formula today
    sceneName: ownerSceneName,
    sceneZoom: ownerScene.zoom ?? 1.8,
    gesture,
    layerData: layer.data,
    state,
    composition: { clickAnimationOverride, clickStyle },
  });

  // Compute click animation speed: scales proportionally to user-set duration
  // speed = CLICK_ANIM_DURATION / actual_duration (normal=1.0 at 45f, faster when shorter)
  const clickSpeed =
    last.gesture === 'click'
      ? CLICK_ANIM_DURATION /
        Math.max(MIN_CLICK_DURATION, last.duration ?? CLICK_ANIM_DURATION)
      : undefined;

  return (
    <FloatingHand
      frame={handFrame}
      path={handPath}
      startFrame={handStartFrame}
      animation={resolved.animation}
      size={resolved.size}
      showRipple={resolved.showRipple}
      dark={resolved.dark}
      physics={resolved.physics}
      clickAnimation={resolved.clickAnimationFile}
      clickSpeed={clickSpeed}
      clickStyle={resolved.clickStyle}
    />
  );
};

/** Check if a hand layer's click animation bleeds past its scene end into the current frame */
function isClickBleeding(
  layer: HandLayer,
  scene: SceneInfo,
  frame: number,
): boolean {
  const wps = layer.data.waypoints;
  if (!wps || wps.length === 0) return false;
  const last = wps[wps.length - 1];
  if (last.gesture !== 'click') return false;
  const clickEnd =
    scene.start +
    (last.frame ?? 0) +
    Math.max(last.duration ?? 0, CLICK_ANIM_DURATION);
  // Bleeds if click animation extends past scene end AND current frame is in that zone
  return clickEnd > scene.end && frame >= scene.end && frame <= clickEnd;
}

export const FloatingHandOverlay: React.FC<Props> = ({
  state,
  sceneLayers,
  composition,
  frame,
  playerScale,
  currentScene,
  allScenes,
}) => {
  // Collect hand layers to render: selected scene's layers + bleeding layers from other scenes
  const layersToRender = useMemo(() => {
    const result: { layer: HandLayer; scene: SceneInfo; sceneName: string }[] =
      [];

    // Current scene's visible hand layers
    for (const l of sceneLayers) {
      if (l.type === 'hand' && l.visible) {
        result.push({
          layer: l as HandLayer,
          scene: currentScene,
          sceneName: currentScene.name,
        });
      }
    }

    // Check other scenes for click bleed-over
    if (allScenes) {
      for (const scene of allScenes) {
        if (scene.name === currentScene.name) continue;
        const otherLayers = state.layers[scene.name] || [];
        for (const l of otherLayers) {
          if (
            l.type === 'hand' &&
            l.visible &&
            isClickBleeding(l as HandLayer, scene, frame)
          ) {
            result.push({
              layer: l as HandLayer,
              scene,
              sceneName: scene.name,
            });
          }
        }
      }
    }

    return result;
  }, [sceneLayers, currentScene, allScenes, state.layers, frame]);

  if (layersToRender.length === 0) return null;

  const primaryId = layersToRender[0].layer.id;

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
        {layersToRender.map(({ layer, scene, sceneName }) => (
          <SingleHandRenderer
            key={layer.id}
            layer={layer}
            isPrimary={layer.id === primaryId}
            state={state}
            frame={frame}
            ownerScene={scene}
            ownerSceneName={sceneName}
            clickAnimationOverride={composition.clickAnimationOverride}
            clickStyle={composition.clickStyle}
          />
        ))}
      </div>
    </div>
  );
};
