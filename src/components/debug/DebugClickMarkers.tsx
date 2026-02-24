/**
 * DebugClickMarkers - Renders numbered markers at user-clicked positions.
 *
 * Supports three display variants:
 * - simple: colored dot only
 * - crosshair: dot with mini crosshair lines at each marker
 * - numbered: dot with label showing coordinates and frame
 *
 * Includes a bottom action panel with copy-to-clipboard and clear buttons.
 */
import React from 'react';
import type { DebugMarker } from './types';

interface DebugClickMarkersProps {
  markers: DebugMarker[];
  currentFrame?: number;
  variant?: 'simple' | 'crosshair' | 'numbered';
  onClear?: () => void;
  onCopy?: () => void;
}

const DebugClickMarkersInner: React.FC<DebugClickMarkersProps> = ({
  markers,
  currentFrame,
  variant = 'numbered',
  onClear,
  onCopy,
}) => {
  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      return;
    }
    const output = JSON.stringify(
      markers.map((m) => ({ x: m.x, y: m.y })),
      null,
      2,
    );
    navigator.clipboard.writeText(output);
  };

  return (
    <>
      {/* Marker dots */}
      {markers.map((m, i) => {
        const isActive = currentFrame !== undefined && currentFrame === m.frame;
        const markerColor = m.color ?? (isActive ? '#ff0' : '#f00');

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: m.x,
              top: m.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 9998,
            }}
          >
            {/* Mini crosshair lines for crosshair variant */}
            {variant === 'crosshair' && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: -20,
                    top: -1,
                    width: 40,
                    height: 2,
                    background: markerColor,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: -20,
                    left: -1,
                    width: 2,
                    height: 40,
                    background: markerColor,
                  }}
                />
              </>
            )}

            {/* Marker circle */}
            <div
              style={{
                width: variant === 'crosshair' ? 24 : 20,
                height: variant === 'crosshair' ? 24 : 20,
                borderRadius: '50%',
                background: markerColor,
                border: '3px solid #fff',
                boxShadow: `0 0 10px rgba(0,0,0,0.5)`,
                ...(variant === 'crosshair'
                  ? {
                      position: 'absolute' as const,
                      top: 0,
                      left: 0,
                      transform: 'translate(-50%, -50%)',
                    }
                  : {}),
              }}
            />

            {/* Label with coordinates */}
            {variant !== 'simple' && (
              <div
                style={{
                  position: 'absolute',
                  top: -25,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: variant === 'crosshair' ? markerColor : '#000',
                  color: variant === 'crosshair' ? '#000' : '#fff',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  fontWeight: variant === 'crosshair' ? 'bold' : 'normal',
                }}
              >
                {m.label ?? `#${i + 1}`} ({m.x},{m.y}) @{m.frame}
              </div>
            )}
          </div>
        );
      })}

      {/* Action panel */}
      {markers.length > 0 && (onClear || onCopy !== undefined) && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            style={{
              padding: '6px 12px',
              background: '#0a0',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            COPY ({markers.length})
          </button>
          {onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              style={{
                padding: '6px 12px',
                background: '#a00',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'monospace',
              }}
            >
              CLEAR
            </button>
          )}
        </div>
      )}
    </>
  );
};

export const DebugClickMarkers = React.memo(DebugClickMarkersInner);
