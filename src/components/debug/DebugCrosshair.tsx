/**
 * DebugCrosshair - Renders vertical + horizontal lines at a given position.
 *
 * Used in all interactive debug compositions to show mouse position
 * within the composition coordinate space.
 */
import React from 'react';

interface DebugCrosshairProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  thickness?: number;
  showCenterDot?: boolean;
}

const DebugCrosshairInner: React.FC<DebugCrosshairProps> = ({
  x,
  y,
  width,
  height,
  color = 'rgba(255,0,0,0.5)',
  thickness = 1,
  showCenterDot = false,
}) => {
  return (
    <>
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          left: x - Math.floor(thickness / 2),
          top: 0,
          width: thickness,
          height,
          background: color,
          pointerEvents: 'none',
          zIndex: 9995,
        }}
      />
      {/* Horizontal line */}
      <div
        style={{
          position: 'absolute',
          top: y - Math.floor(thickness / 2),
          left: 0,
          width,
          height: thickness,
          background: color,
          pointerEvents: 'none',
          zIndex: 9995,
        }}
      />
      {/* Center dot */}
      {showCenterDot && (
        <div
          style={{
            position: 'absolute',
            left: x - 4,
            top: y - 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#ff0',
            border: `1px solid ${color}`,
            pointerEvents: 'none',
            zIndex: 9996,
          }}
        />
      )}
    </>
  );
};

export const DebugCrosshair = React.memo(DebugCrosshairInner);
