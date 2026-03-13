/**
 * Inspector v3.3 - X, Y, Frame fields + scene gesture display + Hand Style picker + Delete + Waypoint List
 * Waypoint list shows all scene waypoints with click-to-select-and-seek.
 * Hand Style section: animation variant picker + dark/light toggle per scene.
 */

import React, { useCallback } from 'react';
import type {
  HandPathPoint,
  LottieAnimation,
} from '../../../components/FloatingHand/types';
import { useDirector } from '../context';
import {
  GESTURE_PRESETS,
  CLICK_ANIM_DURATION,
  buildClickAnimationFile,
  type GestureTool,
} from '../gestures';
import type { AudioLayer, CaptionLayer, ZoomLayer } from '../layers';
import { LottieThumbnail } from '../overlays/LottieThumbnail';
import { AudioInspector } from './AudioInspector';
import { CaptionInspector } from './CaptionInspector';
import { useGalleryActive } from '../hooks/galleryActive';
import { ActivityLog } from './ActivityLog';
import { HistoryTab } from './HistoryTab';
import { LayerPanel } from './LayerPanel';
import { NumField } from './NumField';
import { ZoomInspector } from './ZoomInspector';

// Gesture abbreviations for compact display
const GESTURE_ABBR: Record<string, string> = {
  pointer: 'PTR',
  click: 'CLK',
  drag: 'DRG',
  scroll: 'SCR',
  open: 'OPN',
};

const GESTURE_OPTIONS: GestureTool[] = [
  'click',
  'scroll',
  'drag',
  'swipe',
  'point',
];

export const Inspector: React.FC = () => {
  const {
    state,
    dispatch,
    sceneWaypoints,
    effectiveWaypoints,
    playerRef,
    currentScene,
    scenePreset,
    selectedLayer,
    sceneLayers,
  } = useDirector();
  const scene = state.selectedScene;
  const idx = state.selectedWaypoint;
  const waypoint: HandPathPoint | null =
    idx !== null && sceneWaypoints[idx] ? sceneWaypoints[idx] : null;

  if (!scene) return null;

  const currentGesture = state.sceneGesture[scene];
  // Resolve effective gesture for animation picker
  // Priority: manual sceneGesture > reverse-lookup from scenePreset > active tool > 'click' fallback
  const effectiveGesture: GestureTool =
    currentGesture ??
    (scenePreset
      ? (Object.keys(GESTURE_PRESETS) as GestureTool[]).find(
          (k) => GESTURE_PRESETS[k] === scenePreset,
        )
      : undefined) ??
    (state.activeTool !== 'select' ? state.activeTool : 'click');

  const handleWaypointClick = useCallback(
    (i: number, wp: HandPathPoint) => {
      dispatch({ type: 'SELECT_WAYPOINT', index: i });
      if (playerRef.current && currentScene) {
        playerRef.current.seekTo(currentScene.start + (wp.frame ?? 0));
      }
    },
    [dispatch, playerRef, currentScene],
  );

  // Current effective animation, dark mode, and hand size
  const currentAnimation: LottieAnimation | null =
    state.sceneAnimation[scene] ?? scenePreset?.animation ?? null;
  const currentDark: boolean =
    state.sceneDark[scene] ?? scenePreset?.dark ?? false;
  // Per-layer hand size: prefer selected hand layer, fallback to first visible hand layer in scene
  const selectedHandLayer =
    selectedLayer?.type === 'hand'
      ? selectedLayer
      : (sceneLayers.find((l) => l.type === 'hand' && l.visible) ?? null);
  // Default size scales with scene zoom (base 120 at zoom 1.8)
  const sceneZoom = currentScene?.zoom ?? 1.8;
  const zoomDefault = Math.round(120 * (sceneZoom / 1.8));
  const layerSize: number =
    (selectedHandLayer?.data as { size?: number } | undefined)?.size ??
    zoomDefault;

  // Scene gesture header (always visible)
  const gestureHeader = (
    <div className="inspector__scene-gesture">
      <div className="inspector__section-title">Scene Gesture</div>
      <div className="inspector__gesture-row">
        {GESTURE_OPTIONS.map((g) => {
          const preset = GESTURE_PRESETS[g];
          const active = currentGesture === g;
          return (
            <button
              key={g}
              onClick={() =>
                dispatch({ type: 'SET_SCENE_GESTURE', scene, gesture: g })
              }
              className={`inspector__gesture ${active ? 'inspector__gesture--active' : ''}`}
              title={`${preset.label}: ${preset.animation}`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      {currentGesture && (
        <div className="inspector__gesture-info">
          {currentAnimation ?? GESTURE_PRESETS[currentGesture].animation} |{' '}
          {layerSize}px
        </div>
      )}
    </div>
  );

  // Gallery active filtering
  const gallery = useGalleryActive();
  // Hand Style section (animation picker + dark/light toggle) - always visible
  const animations = gallery.filterHandAnims(effectiveGesture);
  const handStyleSection = (
    <div className="inspector__hand-style">
      <div className="inspector__section-title">Hand Style</div>
      <div className="inspector__anim-row">
        {animations.map((anim) => {
          const active = currentAnimation === anim.id;
          return (
            <button
              key={anim.id}
              onClick={() =>
                dispatch({
                  type: 'SET_SCENE_ANIMATION',
                  scene,
                  animation: anim.id,
                })
              }
              className={`inspector__anim-btn inspector__anim-btn--with-thumb ${active ? 'inspector__anim-btn--active' : ''}`}
              title={anim.id}
            >
              <LottieThumbnail
                animationFile={anim.id}
                size={20}
                dark={currentDark}
              />
              {anim.label}
            </button>
          );
        })}
      </div>
      <div className="inspector__section-subtitle">Pointer</div>
      <div className="inspector__anim-row">
        {gallery.filterPointers().map((ptr) => {
          const active = currentAnimation === ptr.id;
          return (
            <button
              key={ptr.id}
              onClick={() =>
                dispatch({
                  type: 'SET_SCENE_ANIMATION',
                  scene,
                  animation: ptr.id,
                })
              }
              className={`inspector__anim-btn inspector__anim-btn--with-thumb ${active ? 'inspector__anim-btn--active' : ''}`}
              title={ptr.id}
            >
              <LottieThumbnail
                animationFile={ptr.id}
                size={20}
                dark={currentDark}
              />
              {ptr.label}
            </button>
          );
        })}
      </div>
      <div className="inspector__dark-row">
        <button
          onClick={() =>
            dispatch({ type: 'SET_SCENE_DARK', scene, dark: true })
          }
          className={`inspector__dark-btn ${currentDark ? 'inspector__dark-btn--active' : ''}`}
        >
          Light
        </button>
        <button
          onClick={() =>
            dispatch({ type: 'SET_SCENE_DARK', scene, dark: false })
          }
          className={`inspector__dark-btn ${!currentDark ? 'inspector__dark-btn--active' : ''}`}
        >
          Dark
        </button>
      </div>
      {/* Click Effect picker — only for pointer-based animations */}
      {currentAnimation &&
        buildClickAnimationFile(currentAnimation, 'click') && (
          <>
            <div className="inspector__section-subtitle">Click Effect</div>
            <div className="inspector__anim-row">
              {gallery.filterClickAnims().map((ca) => {
                const active = state.clickAnimation === ca.id;
                const previewFile = buildClickAnimationFile(
                  currentAnimation,
                  ca.id,
                );
                return (
                  <button
                    key={ca.id}
                    onClick={() =>
                      dispatch({
                        type: 'SET_CLICK_ANIMATION',
                        animation: ca.id,
                      })
                    }
                    className={`inspector__anim-btn inspector__anim-btn--with-thumb ${active ? 'inspector__anim-btn--active' : ''}`}
                    title={previewFile ?? ca.id}
                  >
                    {previewFile && (
                      <LottieThumbnail
                        animationFile={previewFile}
                        size={20}
                        dark={currentDark}
                      />
                    )}
                    {ca.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      {selectedHandLayer && (
        <div className="inspector__size-row">
          <label className="inspector__size-label">Size</label>
          <input
            type="range"
            min={40}
            max={300}
            step={5}
            value={layerSize}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_LAYER_DATA',
                scene,
                layerId: selectedHandLayer.id,
                data: { size: Number(e.target.value) },
              })
            }
            className="inspector__size-slider"
          />
          <span className="inspector__size-value">{layerSize}</span>
        </div>
      )}
    </div>
  );

  // Waypoint list (always visible when there are waypoints)
  const waypointList =
    effectiveWaypoints.length > 0 ? (
      <div className="inspector__waypoint-list">
        <div className="inspector__section-title">
          Waypoints ({effectiveWaypoints.length})
        </div>
        <div className="inspector__wp-table">
          {effectiveWaypoints.map((wp, i) => {
            const isSelected = i === idx;
            const gesture = (wp.gesture || 'pointer') as string;
            return (
              <button
                key={i}
                onClick={() => handleWaypointClick(i, wp)}
                className={`inspector__wp-row ${isSelected ? 'inspector__wp-row--active' : ''}`}
              >
                <span className="inspector__wp-num">{i + 1}</span>
                <span className="inspector__wp-coords">
                  {wp.x},{wp.y}
                </span>
                <span className="inspector__wp-frame">f{wp.frame ?? 0}</span>
                <span className="inspector__wp-gesture">
                  {GESTURE_ABBR[gesture] || gesture}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  // Zoom layer inspector (when a zoom layer is selected)
  const zoomInspectorSection =
    selectedLayer?.type === 'zoom' ? (
      <ZoomInspector layer={selectedLayer as ZoomLayer} scene={scene} />
    ) : null;

  // Audio layer inspector (when an audio layer is selected)
  const audioInspectorSection =
    selectedLayer?.type === 'audio' ? (
      <AudioInspector layer={selectedLayer as AudioLayer} scene={scene} />
    ) : null;

  // Caption layer inspector (when a caption layer is selected)
  const captionInspectorSection =
    selectedLayer?.type === 'caption' ? (
      <CaptionInspector
        layer={selectedLayer as CaptionLayer}
        scene="__captions__"
      />
    ) : null;

  const sidebarTab = state.sidebarTab;

  // Tab switcher (always visible)
  const tabSwitcher = (
    <div className="inspector__tabs">
      <button
        className={`inspector__tab ${sidebarTab === 'editor' ? 'inspector__tab--active' : ''}`}
        onClick={() => dispatch({ type: 'SET_SIDEBAR_TAB', tab: 'editor' })}
      >
        Editor
      </button>
      <button
        className={`inspector__tab ${sidebarTab === 'history' ? 'inspector__tab--active' : ''}`}
        onClick={() => dispatch({ type: 'SET_SIDEBAR_TAB', tab: 'history' })}
      >
        History
      </button>
    </div>
  );

  // History tab content
  if (sidebarTab === 'history') {
    return (
      <div className="inspector">
        {tabSwitcher}
        <HistoryTab />
      </div>
    );
  }

  // Determine which section to show based on selected layer type
  const selectedType = selectedLayer?.type ?? null;
  const showHand = !selectedType || selectedType === 'hand';

  // Editor tab content
  if (idx === null || !waypoint) {
    return (
      <div className="inspector">
        {tabSwitcher}
        <LayerPanel />
        {showHand && gestureHeader}
        {showHand && handStyleSection}
        {selectedType === 'zoom' && zoomInspectorSection}
        {selectedType === 'audio' && audioInspectorSection}
        {selectedType === 'caption' && captionInspectorSection}
        {showHand && waypointList}
        {showHand && !waypointList && (
          <div className="inspector__empty-text">
            Pick a gesture tool and click on the video
          </div>
        )}
        <ActivityLog />
      </div>
    );
  }

  const update = (partial: Partial<HandPathPoint>) => {
    dispatch({ type: 'UPDATE_WAYPOINT', scene, index: idx, point: partial });
  };

  const isLastWaypoint = idx === sceneWaypoints.length - 1;
  const hasClickEnd = waypoint.gesture === 'click';

  // Add click end to movement-only bar: appends a click waypoint after the last wp
  const handleAddClickEnd = () => {
    const lastWp = sceneWaypoints[sceneWaypoints.length - 1];
    const clickFrame = (lastWp.frame ?? 0) + 15; // 15f after last wp
    dispatch({
      type: 'ADD_WAYPOINT',
      scene,
      point: {
        x: lastWp.x,
        y: lastWp.y,
        frame: clickFrame,
        gesture: 'click',
        scale: 1,
        duration: CLICK_ANIM_DURATION,
      },
    });
  };

  const WP_GESTURE_OPTIONS: HandPathPoint['gesture'][] = [
    'pointer',
    'click',
    'drag',
    'scroll',
    'open',
  ];

  return (
    <div className="inspector">
      {tabSwitcher}
      <LayerPanel />
      {showHand && gestureHeader}
      {showHand && handStyleSection}
      {selectedType === 'zoom' && zoomInspectorSection}
      {selectedType === 'audio' && audioInspectorSection}
      {selectedType === 'caption' && captionInspectorSection}
      {showHand && waypointList}

      {showHand && (
        <>
          <div className="inspector__header">
            <span className="inspector__header-title">Waypoint #{idx + 1}</span>
            <span className="inspector__header-meta">
              of {sceneWaypoints.length}
            </span>
          </div>

          <NumField
            label="X"
            value={waypoint.x}
            onChange={(v) => update({ x: v })}
            step={5}
          />
          <NumField
            label="Y"
            value={waypoint.y}
            onChange={(v) => update({ y: v })}
            step={5}
          />
          <NumField
            label="Frame"
            value={waypoint.frame ?? 0}
            onChange={(v) => update({ frame: v })}
            min={0}
          />

          {/* Gesture selector per waypoint */}
          <div className="inspector__field">
            <span className="inspector__field-label">Gesture</span>
            <select
              className="inspector__gesture-select"
              value={waypoint.gesture ?? 'pointer'}
              onChange={(e) =>
                update({
                  gesture: e.target.value as HandPathPoint['gesture'],
                  duration:
                    e.target.value === 'click'
                      ? (waypoint.duration ?? CLICK_ANIM_DURATION)
                      : waypoint.duration,
                })
              }
            >
              {WP_GESTURE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <NumField
            label="Duration"
            value={waypoint.duration ?? 0}
            onChange={(v) => update({ duration: v })}
            min={0}
            step={5}
          />

          {/* Add Click End — only on last non-click waypoint */}
          {isLastWaypoint && !hasClickEnd && (
            <button
              onClick={handleAddClickEnd}
              className="inspector__add-click-btn"
              title="Append a click waypoint at the end of this path"
            >
              + Add Click End
            </button>
          )}

          {/* Delete button */}
          <button
            onClick={() =>
              dispatch({ type: 'DELETE_WAYPOINT', scene, index: idx })
            }
            className="inspector__delete-btn"
            title="Delete waypoint (Delete key)"
          >
            Delete Waypoint
          </button>
        </>
      )}
      <ActivityLog />
    </div>
  );
};
