/**
 * DorianDebugTapBubble -- Static debug composition.
 *
 * Focused debug picker for the AI bubble tap target position (Scene 3).
 * Uses shared debug components from components/debug/.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { DebugCrosshair } from '../../components/debug';
import { DorianPhoneStatic as DorianPhoneStaticNew } from './DorianPhoneMockup';
import { PHONE } from './constants';

const SCALE = PHONE.displayScale;

export const DorianDebugTapBubble: React.FC = () => {
  const [coords, setCoords] = React.useState<{ x: number; y: number }[]>([]);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  // Current bubble position (from TapAIBubbleScene) - non-zoomed position
  const currentBubbleX = 818;
  const currentBubbleY = 1546;

  return (
    <AbsoluteFill
      style={{ background: '#333', cursor: 'crosshair' }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleRatio = 1080 / rect.width;
        const x = Math.round((e.clientX - rect.left) * scaleRatio);
        const y = Math.round((e.clientY - rect.top) * scaleRatio);
        setCoords([...coords, { x, y }]);
        console.log(`CLICK: (${x}, ${y})`);
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleRatio = 1080 / rect.width;
        setMousePos({
          x: Math.round((e.clientX - rect.left) * scaleRatio),
          y: Math.round((e.clientY - rect.top) * scaleRatio),
        });
      }}
    >
      {/* Phone mockup at scale 1.8 - same as TapAIBubbleScene */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${SCALE})`,
        }}
      >
        <DorianPhoneStaticNew showAIBubble={true} />
      </div>

      {/* Current target marker (green) - dashed circle + solid center dot */}
      <div
        style={{
          position: 'absolute',
          left: currentBubbleX,
          top: currentBubbleY,
          transform: 'translate(-50%, -50%)',
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: '4px dashed #0f0',
          pointerEvents: 'none',
        }}
      />
      {/* SOLID GREEN DOT - exact click target */}
      <div
        style={{
          position: 'absolute',
          left: currentBubbleX,
          top: currentBubbleY,
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#0f0',
          border: '3px solid #fff',
          boxShadow: '0 0 10px #0f0',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: currentBubbleX,
          top: currentBubbleY - 55,
          transform: 'translateX(-50%)',
          background: '#0f0',
          color: '#000',
          padding: '6px 12px',
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 'bold',
          pointerEvents: 'none',
        }}
      >
        CURRENT TARGET: ({currentBubbleX}, {currentBubbleY})
      </div>

      {/* Crosshairs */}
      <DebugCrosshair
        x={mousePos.x}
        y={mousePos.y}
        width={1080}
        height={1920}
        color="rgba(255,0,0,0.7)"
      />

      {/* Control Panel */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.95)',
          padding: 20,
          borderRadius: 12,
          color: 'white',
          fontFamily: 'monospace',
          fontSize: 14,
          minWidth: 350,
        }}
      >
        <div
          style={{
            marginBottom: 15,
            color: '#f00',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          DEBUG: AI BUBBLE TAP
        </div>

        <div style={{ marginBottom: 10 }}>
          <span style={{ color: '#888' }}>Mouse:</span>{' '}
          <span style={{ color: '#ff0' }}>
            ({mousePos.x}, {mousePos.y})
          </span>
        </div>

        <div
          style={{
            marginBottom: 15,
            padding: 10,
            background: '#0a0a0a',
            borderRadius: 6,
          }}
        >
          <div style={{ color: '#0f0', marginBottom: 5 }}>
            Current baseBubbleX/Y:
          </div>
          <div>
            X: {currentBubbleX}, Y: {currentBubbleY}
          </div>
        </div>

        <div style={{ color: '#f00', marginBottom: 5 }}>Clicked Points:</div>
        {coords.length === 0 && (
          <div style={{ color: '#666' }}>Click on the AI bubble...</div>
        )}
        {coords.slice(-5).map((c, i) => (
          <div key={i} style={{ fontSize: 12, color: '#ff0' }}>
            #{coords.length - 4 + i}:{' '}
            <strong>
              ({c.x}, {c.y})
            </strong>
          </div>
        ))}
        {coords.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const last = coords[coords.length - 1];
                navigator.clipboard.writeText(
                  `baseBubbleX = ${last.x};\nbaseBubbleY = ${last.y};`,
                );
              }}
              style={{
                padding: '6px 12px',
                background: '#0f0',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              COPY LAST
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCoords([]);
              }}
              style={{
                padding: '6px 12px',
                background: '#f00',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              CLEAR
            </button>
          </div>
        )}
      </div>

      {/* Clicked points markers */}
      {coords.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            transform: 'translate(-50%, -50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#f00',
            border: '3px solid #fff',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.9)',
          padding: '12px 24px',
          borderRadius: 8,
          color: '#fff',
          fontSize: 16,
        }}
      >
        Click on the AI bubble (teal circle) - Green dashed = current target -
        Red = your clicks
      </div>
    </AbsoluteFill>
  );
};
