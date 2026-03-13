import React, { useCallback } from 'react';
import { useDirector } from '../context';
import type { CaptionLayer } from '../layers';
import { NumField } from './NumField';

export const CaptionInspector: React.FC<{
  layer: CaptionLayer;
  scene: string;
}> = ({ layer, scene }) => {
  const { dispatch } = useDirector();

  const updateData = useCallback(
    (changes: Partial<CaptionLayer['data']>) => {
      dispatch({
        type: 'UPDATE_LAYER_DATA',
        scene,
        layerId: layer.id,
        data: changes,
      });
    },
    [layer.id, scene, dispatch],
  );

  const handleTextChange = useCallback(
    (text: string) => {
      updateData({ text });
      // Also update the layer name for the layer panel
      const name = text.length > 20 ? text.slice(0, 20) + '...' : text;
      dispatch({
        type: 'UPDATE_LAYER',
        scene,
        layerId: layer.id,
        changes: { name },
      });
    },
    [updateData, scene, layer.id, dispatch],
  );

  return (
    <div className="inspector__zoom-section">
      <div className="inspector__section-title">Caption</div>
      <div
        className="inspector__field"
        style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}
      >
        <span className="inspector__field-label">Text</span>
        <textarea
          value={layer.data.text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 8px',
            fontSize: 12,
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>
      <NumField
        label="Start (f)"
        value={layer.data.startFrame}
        onChange={(v) => updateData({ startFrame: v })}
        min={0}
      />
      <NumField
        label="Duration (f)"
        value={layer.data.durationInFrames}
        onChange={(v) => updateData({ durationInFrames: v })}
        min={1}
      />
    </div>
  );
};
