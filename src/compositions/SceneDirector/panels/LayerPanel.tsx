/**
 * LayerPanel - Layer list with visibility/lock toggles and add layer controls.
 * Renders inside the Inspector for the selected scene.
 */

import React, { useCallback, useState } from 'react';
import { useDirector } from '../context';
import { createHandLayer, createZoomLayer, createAudioLayer, type Layer, type LayerType, type ZoomLayer } from '../layers';
import type { GestureTool } from '../gestures';

export const LayerPanel: React.FC = () => {
  const { state, dispatch } = useDirector();
  const scene = state.selectedScene;
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sceneLayers = scene ? (state.layers[scene] || []) : [];

  const handleAddLayer = useCallback((type: LayerType) => {
    if (!scene) return;
    const order = sceneLayers.length;
    if (type === 'hand') {
      const gesture: GestureTool = state.sceneGesture[scene] ?? (state.activeTool !== 'select' ? state.activeTool : 'click');
      const layer = createHandLayer(scene, [], gesture, order);
      dispatch({ type: 'ADD_LAYER', scene, layer });
    } else if (type === 'zoom') {
      const layer = createZoomLayer(scene, order);
      dispatch({ type: 'ADD_LAYER', scene, layer });
    } else if (type === 'audio') {
      const layer = createAudioLayer(scene, order);
      dispatch({ type: 'ADD_LAYER', scene, layer });
    }
    setShowAddMenu(false);
  }, [scene, sceneLayers.length, state.sceneGesture, state.activeTool, dispatch]);

  const handleSelect = useCallback((layerId: string) => {
    dispatch({ type: 'SELECT_LAYER', layerId });
  }, [dispatch]);

  const handleToggleVisibility = useCallback((e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    if (!scene) return;
    dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', scene, layerId });
  }, [scene, dispatch]);

  const handleToggleLock = useCallback((e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    if (!scene) return;
    dispatch({ type: 'TOGGLE_LAYER_LOCK', scene, layerId });
  }, [scene, dispatch]);

  const handleRemove = useCallback((e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    if (!scene) return;
    dispatch({ type: 'REMOVE_LAYER', scene, layerId });
  }, [scene, dispatch]);

  const handleMoveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    if (!scene) return;
    const ids = sceneLayers.map(l => l.id);
    const idx = ids.indexOf(layerId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= ids.length) return;
    [ids[idx], ids[newIdx]] = [ids[newIdx], ids[idx]];
    dispatch({ type: 'REORDER_LAYERS', scene, layerIds: ids });
  }, [scene, sceneLayers, dispatch]);

  if (!scene) return null;

  const typeIcon = (type: LayerType) => type === 'hand' ? '\u{1F590}' : type === 'zoom' ? '\u{1F50D}' : '\u{266B}';

  return (
    <div className="layer-panel">
      <div className="layer-panel__header">
        <span className="inspector__section-title">Layers</span>
        <div style={{ position: 'relative' }}>
          <button
            className="layer-panel__add-btn"
            onClick={() => setShowAddMenu(!showAddMenu)}
            title="Add layer"
          >
            +
          </button>
          {showAddMenu && (
            <div className="layer-panel__add-menu">
              <button className="layer-panel__add-menu-item" onClick={() => handleAddLayer('hand')}>
                Hand Gesture
              </button>
              <button className="layer-panel__add-menu-item" onClick={() => handleAddLayer('zoom')}>
                Zoom
              </button>
              <button className="layer-panel__add-menu-item" onClick={() => handleAddLayer('audio')}>
                Audio
              </button>
            </div>
          )}
        </div>
      </div>

      {sceneLayers.length === 0 ? (
        <div className="layer-panel__empty">
          No layers. Use [+] to add.
        </div>
      ) : (
        <div className="layer-panel__list">
          {sceneLayers.map((layer, i) => {
            const isSelected = layer.id === state.selectedLayerId;
            return (
              <div
                key={layer.id}
                className={`layer-panel__item ${isSelected ? 'layer-panel__item--selected' : ''}`}
                onClick={() => handleSelect(layer.id)}
              >
                <button
                  className={`layer-panel__icon-btn ${layer.visible ? '' : 'layer-panel__icon-btn--off'}`}
                  onClick={(e) => handleToggleVisibility(e, layer.id)}
                  title={layer.visible ? 'Hide' : 'Show'}
                >
                  {layer.visible ? '\u{1F441}' : '\u{1F441}\u{200D}\u{1F5E8}'}
                </button>
                <button
                  className={`layer-panel__icon-btn ${layer.locked ? 'layer-panel__icon-btn--locked' : ''}`}
                  onClick={(e) => handleToggleLock(e, layer.id)}
                  title={layer.locked ? 'Unlock' : 'Lock'}
                >
                  {layer.locked ? '\u{1F512}' : '\u{1F513}'}
                </button>
                <span className="layer-panel__type-icon">{typeIcon(layer.type)}</span>
                <span className="layer-panel__name">{layer.name}</span>
                <div className="layer-panel__actions">
                  {i > 0 && (
                    <button
                      className="layer-panel__icon-btn layer-panel__icon-btn--small"
                      onClick={(e) => { e.stopPropagation(); handleMoveLayer(layer.id, 'up'); }}
                      title="Move up"
                    >^</button>
                  )}
                  {i < sceneLayers.length - 1 && (
                    <button
                      className="layer-panel__icon-btn layer-panel__icon-btn--small"
                      onClick={(e) => { e.stopPropagation(); handleMoveLayer(layer.id, 'down'); }}
                      title="Move down"
                    >v</button>
                  )}
                  <button
                    className="layer-panel__icon-btn layer-panel__icon-btn--delete"
                    onClick={(e) => handleRemove(e, layer.id)}
                    title="Remove layer"
                  >x</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
