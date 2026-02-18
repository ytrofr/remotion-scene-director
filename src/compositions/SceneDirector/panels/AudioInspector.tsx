import React, { useCallback } from 'react';
import { useDirector } from '../context';
import { AUDIO_FILES, type AudioLayer } from '../layers';
import { NumField } from './NumField';

export const AudioInspector: React.FC<{ layer: AudioLayer; scene: string }> = ({ layer, scene }) => {
  const { dispatch } = useDirector();

  const updateData = useCallback((changes: Partial<AudioLayer['data']>) => {
    dispatch({ type: 'UPDATE_LAYER_DATA', scene, layerId: layer.id, data: changes });
  }, [layer.id, scene, dispatch]);

  const handleFileChange = useCallback((file: string) => {
    const label = AUDIO_FILES.find(f => f.id === file)?.label ?? 'Audio';
    updateData({ file });
    dispatch({ type: 'UPDATE_LAYER', scene, layerId: layer.id, changes: { name: `Audio - ${label}` } });
  }, [updateData, scene, layer.id, dispatch]);

  return (
    <div className="inspector__zoom-section">
      <div className="inspector__section-title">Audio</div>
      <div className="inspector__field">
        <span className="inspector__field-label">File</span>
        <select
          value={layer.data.file}
          onChange={e => handleFileChange(e.target.value)}
          className="zoom-kf__select"
        >
          {AUDIO_FILES.map(f => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>
      <NumField label="Start" value={layer.data.startFrame} onChange={v => updateData({ startFrame: v })} min={0} />
      <NumField label="Duration" value={layer.data.durationInFrames || 60} onChange={v => updateData({ durationInFrames: v })} min={1} />
      <div className="inspector__field">
        <span className="inspector__field-label">Volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={layer.data.volume}
          onChange={e => updateData({ volume: parseFloat(e.target.value) })}
          style={{ flex: 1 }}
        />
        <span style={{ marginLeft: 6, fontSize: 11, minWidth: 30, textAlign: 'right' }}>
          {Math.round(layer.data.volume * 100)}%
        </span>
      </div>
    </div>
  );
};
