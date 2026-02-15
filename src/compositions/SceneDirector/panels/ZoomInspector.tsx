import React, { useCallback } from 'react';
import { useDirector } from '../context';
import type { ZoomLayer, ZoomKeyframe } from '../layers';
import { NumField } from './NumField';

const EASING_OPTIONS: ZoomKeyframe['easing'][] = ['linear', 'ease-in', 'ease-out', 'ease-in-out'];

export const ZoomInspector: React.FC<{ layer: ZoomLayer; scene: string }> = ({ layer, scene }) => {
  const { state, dispatch, frame, currentScene } = useDirector();
  const localFrame = currentScene ? Math.max(0, frame - currentScene.start) : 0;

  const addKeyframe = useCallback(() => {
    const newKf: ZoomKeyframe = {
      frame: localFrame,
      zoom: 1.5,
      centerX: 0.5,
      centerY: 0.5,
      easing: 'ease-in-out',
    };
    const updated = [...layer.data.keyframes, newKf].sort((a, b) => a.frame - b.frame);
    dispatch({ type: 'UPDATE_LAYER_DATA', scene, layerId: layer.id, data: { keyframes: updated } });
  }, [localFrame, layer, scene, dispatch]);

  const updateKeyframe = useCallback((idx: number, changes: Partial<ZoomKeyframe>) => {
    const updated = layer.data.keyframes.map((kf, i) => i === idx ? { ...kf, ...changes } : kf);
    dispatch({ type: 'UPDATE_LAYER_DATA', scene, layerId: layer.id, data: { keyframes: updated } });
  }, [layer, scene, dispatch]);

  const removeKeyframe = useCallback((idx: number) => {
    const updated = layer.data.keyframes.filter((_, i) => i !== idx);
    dispatch({ type: 'UPDATE_LAYER_DATA', scene, layerId: layer.id, data: { keyframes: updated } });
  }, [layer, scene, dispatch]);

  return (
    <div className="inspector__zoom-section">
      <div className="inspector__section-title">Zoom Keyframes</div>
      <button className="inspector__field-btn" onClick={addKeyframe} style={{ marginBottom: 8, width: '100%' }}>
        + Add at frame {localFrame}
      </button>
      {layer.data.keyframes.length === 0 ? (
        <div className="inspector__empty-text" style={{ padding: '8px 0' }}>
          No keyframes. Click + to add.
        </div>
      ) : (
        <div className="inspector__wp-table">
          {layer.data.keyframes.map((kf, i) => (
            <div key={i} className="zoom-kf">
              <div className="zoom-kf__header">
                <span className="zoom-kf__label">KF {i + 1}</span>
                <span className="zoom-kf__frame">f{kf.frame}</span>
                <button className="zoom-kf__delete" onClick={() => removeKeyframe(i)}>x</button>
              </div>
              <NumField label="Frame" value={kf.frame} onChange={v => updateKeyframe(i, { frame: v })} min={0} />
              <NumField label="Zoom" value={Math.round(kf.zoom * 100)} onChange={v => updateKeyframe(i, { zoom: v / 100 })} step={10} min={50} />
              <NumField label="CtrX" value={Math.round(kf.centerX * 100)} onChange={v => updateKeyframe(i, { centerX: v / 100 })} step={5} min={0} />
              <NumField label="CtrY" value={Math.round(kf.centerY * 100)} onChange={v => updateKeyframe(i, { centerY: v / 100 })} step={5} min={0} />
              <div className="inspector__field">
                <span className="inspector__field-label">Ease</span>
                <select
                  value={kf.easing}
                  onChange={e => updateKeyframe(i, { easing: e.target.value as ZoomKeyframe['easing'] })}
                  className="zoom-kf__select"
                >
                  {EASING_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
