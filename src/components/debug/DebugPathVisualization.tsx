/**
 * DebugPathVisualization - Renders hand path markers with frame-aware styling.
 *
 * Extracted from DorianDebugInteractive and MobileChatDemoCombinedDebugInteractive
 * which both render predefined hand path points with connecting lines.
 *
 * Features:
 * - Frame-aware opacity (active markers brighter, distant markers dimmer)
 * - Optional SVG connector lines between sequential markers
 * - Grouped by scene when groupByScene is enabled
 * - Numbered labels at each marker
 */
import React from 'react';
import type { DebugPathMarker } from './types';

interface DebugPathVisualizationProps {
  markers: DebugPathMarker[];
  currentFrame: number;
  showConnectingLines?: boolean;
  groupByScene?: boolean;
}

const DebugPathVisualizationInner: React.FC<DebugPathVisualizationProps> = ({
  markers,
  currentFrame,
  showConnectingLines = true,
  groupByScene = false,
}) => {
  // Group markers by scene for connecting lines
  const sceneGroups = groupByScene
    ? markers.reduce<Record<string, DebugPathMarker[]>>((acc, m) => {
        const key = m.scene ?? '__default__';
        if (!acc[key]) acc[key] = [];
        acc[key].push(m);
        return acc;
      }, {})
    : { __all__: markers };

  return (
    <>
      {/* Connecting lines between markers */}
      {showConnectingLines && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9989,
          }}
        >
          {Object.entries(sceneGroups).map(([sceneName, pts]) => {
            if (pts.length < 2) return null;
            return (
              <polyline
                key={sceneName}
                points={pts.map((m) => `${m.x},${m.y}`).join(' ')}
                fill="none"
                stroke={pts[0].color ?? '#0f0'}
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            );
          })}
        </svg>
      )}

      {/* Marker dots */}
      {markers.map((m, i) => {
        const isCurrentFrame = currentFrame === m.frame;
        const isInRange =
          currentFrame >= m.frame - 5 && currentFrame <= m.frame + 5;
        const opacity = isCurrentFrame ? 1 : isInRange ? 0.8 : 0.4;
        const markerColor = m.color ?? '#0f0';

        return (
          <div
            key={`path-${i}`}
            style={{
              position: 'absolute',
              left: m.x,
              top: m.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 9990,
              opacity,
            }}
          >
            {/* Marker dot */}
            <div
              style={{
                width: isCurrentFrame ? 22 : 16,
                height: isCurrentFrame ? 22 : 16,
                borderRadius: '50%',
                background: markerColor,
                border: isCurrentFrame
                  ? '4px solid #fff'
                  : '2px solid rgba(255,255,255,0.5)',
                boxShadow: isCurrentFrame
                  ? `0 0 20px ${markerColor}`
                  : '0 0 8px rgba(0,0,0,0.5)',
              }}
            />
            {/* Label */}
            <div
              style={{
                position: 'absolute',
                top: -25,
                left: '50%',
                transform: 'translateX(-50%)',
                background: isCurrentFrame ? markerColor : 'rgba(0,0,0,0.8)',
                color:
                  isCurrentFrame && markerColor !== '#ff0' ? '#fff' : '#000',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 9,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
              }}
            >
              {m.label ?? `#${i + 1}`}
            </div>
            {/* Frame indicator */}
            {m.desc && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.8)',
                  color: '#fff',
                  padding: '1px 4px',
                  borderRadius: 3,
                  fontSize: 8,
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                @{m.frame}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export const DebugPathVisualization = React.memo(DebugPathVisualizationInner);
