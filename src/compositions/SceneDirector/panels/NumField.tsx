import React, { useCallback } from 'react';

export const NumField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}> = ({ label, value, onChange, step = 1, min }) => {
  const adjust = useCallback((delta: number) => {
    const next = value + delta;
    onChange(min !== undefined ? Math.max(min, next) : next);
  }, [value, onChange, min]);

  return (
    <div className="inspector__field">
      <span className="inspector__field-label">{label}</span>
      <button className="inspector__field-btn" onClick={() => adjust(-step * 10)}>-{step * 10}</button>
      <button className="inspector__field-btn" onClick={() => adjust(-step)}>-{step}</button>
      <span className="inspector__field-value">{value}</span>
      <button className="inspector__field-btn" onClick={() => adjust(step)}>+{step}</button>
      <button className="inspector__field-btn" onClick={() => adjust(step * 10)}>+{step * 10}</button>
    </div>
  );
};
