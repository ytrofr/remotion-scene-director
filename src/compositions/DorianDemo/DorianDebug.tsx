/**
 * DorianDebug -- Static debug composition.
 *
 * Interactive coordinate picker with scroll control,
 * AI bubble position reference, and click-to-record.
 *
 * Uses shared debug components from components/debug/.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { DebugCrosshair } from '../../components/debug';
import { DorianPhoneMockup as DorianPhoneMockupNew } from './DorianPhoneMockup';

// ============ SHARED PHONE LAYOUT CONSTANTS ============

const SCALE = 1.8;
const PHONE_FRAME_WIDTH = 414 * SCALE;
const PHONE_FRAME_HEIGHT = 868 * SCALE;
const PHONE_LEFT = 540 - PHONE_FRAME_WIDTH / 2;
const PHONE_TOP = 960 - PHONE_FRAME_HEIGHT / 2;
const SCREEN_PADDING = 12 * SCALE;
const SCREEN_LEFT = PHONE_LEFT + SCREEN_PADDING;
const SCREEN_TOP = PHONE_TOP + SCREEN_PADDING;

// ============ DEBUG COMPOSITION ============

export const DorianDebug: React.FC = () => {
  const [coords, setCoords] = React.useState<{ x: number; y: number }[]>([]);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = React.useState(300);
  const [showFullImage, setShowFullImage] = React.useState(false);

  // AI bubble in phone coords: bottom 70, right 15, size 56
  // Bubble center: x = 390 - 15 - 28 = 347, y = 844 - 70 - 28 = 746
  const bubblePhoneX = 347;
  const bubblePhoneY = 746;
  const bubbleCompX = SCREEN_LEFT + bubblePhoneX * SCALE;
  const bubbleCompY = SCREEN_TOP + bubblePhoneY * SCALE;

  return (
    <AbsoluteFill
      style={{ background: '#222', cursor: 'crosshair' }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleRatio = 1080 / rect.width;
        const x = Math.round((e.clientX - rect.left) * scaleRatio);
        const y = Math.round((e.clientY - rect.top) * scaleRatio);
        setCoords([...coords, { x, y }]);
        console.log(
          `Clicked: (${x}, ${y}) | Phone coords: (${Math.round((x - SCREEN_LEFT) / SCALE)}, ${Math.round((y - SCREEN_TOP) / SCALE)})`,
        );
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
      {/* Phone mockup with scrollable content INSIDE */}
      <DorianPhoneMockupNew
        scrollProgress={scrollOffset / 500}
        scale={SCALE}
        showAIBubble={true}
      />

      {/* AI Bubble marker */}
      <div
        style={{
          position: 'absolute',
          left: bubbleCompX,
          top: bubbleCompY,
          transform: 'translate(-50%, -50%)',
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '3px dashed #0f0',
          pointerEvents: 'none',
        }}
      />

      {/* Crosshairs */}
      <DebugCrosshair
        x={mousePos.x}
        y={mousePos.y}
        width={1080}
        height={1920}
        color="rgba(0,255,255,0.5)"
      />

      {/* Control Panel */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.9)',
          padding: 20,
          borderRadius: 12,
          color: 'white',
          fontFamily: 'monospace',
          fontSize: 14,
          minWidth: 320,
        }}
      >
        <div
          style={{
            marginBottom: 15,
            color: '#0ff',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          DORIAN DEBUG
        </div>

        {/* Mouse Position */}
        <div style={{ marginBottom: 10 }}>
          <span style={{ color: '#888' }}>Mouse:</span> ({mousePos.x},{' '}
          {mousePos.y})
        </div>
        <div style={{ marginBottom: 15, fontSize: 12, color: '#666' }}>
          Phone: ({Math.round((mousePos.x - SCREEN_LEFT) / SCALE)},{' '}
          {Math.round((mousePos.y - SCREEN_TOP) / SCALE)})
        </div>

        {/* Scroll Control */}
        <div style={{ marginBottom: 15 }}>
          <div style={{ color: '#0f0', marginBottom: 8 }}>
            Scroll Offset: {scrollOffset}px
          </div>
          <input
            type="range"
            min="0"
            max="800"
            value={scrollOffset}
            onChange={(e) => setScrollOffset(Number(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[0, 100, 200, 300, 400, 500].map((val) => (
              <button
                key={val}
                onClick={(e) => {
                  e.stopPropagation();
                  setScrollOffset(val);
                }}
                style={{
                  padding: '4px 8px',
                  background: scrollOffset === val ? '#0f0' : '#444',
                  color: scrollOffset === val ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Image Toggle */}
        <div style={{ marginBottom: 15 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFullImage(!showFullImage);
            }}
            style={{
              padding: '8px 16px',
              background: showFullImage ? '#f80' : '#444',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {showFullImage
              ? 'Using: home-mobile-full.png'
              : 'Using: home-mobile.png'}
          </button>
        </div>

        {/* AI Bubble Info */}
        <div
          style={{
            background: '#0a0a0a',
            padding: 10,
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          <div style={{ color: '#0f0', marginBottom: 5 }}>
            AI Bubble Position:
          </div>
          <div>
            Composition: ({Math.round(bubbleCompX)}, {Math.round(bubbleCompY)})
          </div>
          <div style={{ color: '#888', fontSize: 12 }}>
            Phone: ({bubblePhoneX}, {bubblePhoneY})
          </div>
        </div>

        {/* Clicked Points */}
        <div style={{ color: '#f00', marginBottom: 5 }}>Clicked Points:</div>
        {coords.length === 0 && (
          <div style={{ color: '#666' }}>Click to record...</div>
        )}
        {coords.map((c, i) => (
          <div key={i} style={{ fontSize: 12 }}>
            #{i + 1}: ({c.x}, {c.y}) → Phone: (
            {Math.round((c.x - SCREEN_LEFT) / SCALE)},{' '}
            {Math.round((c.y - SCREEN_TOP) / SCALE)})
          </div>
        ))}
        {coords.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(JSON.stringify(coords));
              }}
              style={{
                padding: '6px 12px',
                background: '#0f0',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              COPY
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
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#f00',
            border: '2px solid #fff',
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
          background: 'rgba(0,0,0,0.8)',
          padding: '10px 20px',
          borderRadius: 8,
          color: '#fff',
          fontSize: 14,
        }}
      >
        Click anywhere to record coordinates - Use slider to preview scroll -
        Green circle = AI bubble target
      </div>
    </AbsoluteFill>
  );
};
