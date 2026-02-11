/**
 * DebugSectionPickerInteractive - Interactive tool with on-screen controls
 *
 * Click the +/- buttons to adjust scrollY
 * Click section buttons to switch sections
 */
import React, { useState, useCallback } from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentScale,
} from 'remotion';
import { COLORS, PHONE, SECTIONS } from './constants';

// Phone frame component
const PhoneFrame: React.FC<{
  children: React.ReactNode;
  scale?: number;
}> = ({ children, scale = PHONE.baseScale }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: PHONE.width * scale,
        height: PHONE.height * scale,
        borderRadius: 40 * scale,
        background: 'linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 100%)',
        padding: 8 * scale,
        boxShadow: `
          0 50px 100px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(255, 255, 255, 0.1)
        `,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 32 * scale,
          overflow: 'hidden',
          background: COLORS.background,
          position: 'relative',
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 12 * scale,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120 * scale,
          height: 28 * scale,
          borderRadius: 14 * scale,
          background: '#1a1a2e',
        }}
      />
    </div>
  );
};

// Header height in pixels (before scaling)
const STICKY_HEADER_HEIGHT = 56;

// Scrollable content with sticky header
const ScrollableContent: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const scale = PHONE.baseScale;
  const headerHeight = STICKY_HEADER_HEIGHT * scale;

  return (
    <>
      {/* Scrolling content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: PHONE.width * scale,
          transform: `translateY(${-scrollY * scale}px)`,
        }}
      >
        <Img
          src={staticFile('dashmor/labor-v3-fullpage-mobile.png')}
          style={{
            width: PHONE.width * scale,
            height: 'auto',
          }}
        />
      </div>

      {/* Sticky header overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: PHONE.width * scale,
          height: headerHeight,
          overflow: 'hidden',
          zIndex: 10,
          boxShadow: scrollY > 10 ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        <Img
          src={staticFile('dashmor/labor-v3-fullpage-mobile.png')}
          style={{
            width: PHONE.width * scale,
            height: 'auto',
          }}
        />
      </div>
    </>
  );
};

// Button component
const Button: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  active?: boolean;
}> = ({ onClick, children, color = '#00d9ff', size = 'medium', active = false }) => {
  const scale = useCurrentScale();
  const sizes = {
    small: { padding: '8px 16px', fontSize: 16 },
    medium: { padding: '12px 24px', fontSize: 20 },
    large: { padding: '16px 32px', fontSize: 28 },
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        ...sizes[size],
        background: active ? color : 'rgba(0, 0, 0, 0.8)',
        border: `2px solid ${color}`,
        borderRadius: 8,
        color: active ? '#000' : color,
        cursor: 'pointer',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        transition: 'all 0.1s',
      }}
    >
      {children}
    </button>
  );
};

export const DebugSectionPickerInteractive: React.FC = () => {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [scrollY, setScrollY] = useState(SECTIONS[0].scrollY);

  const section = SECTIONS[sectionIndex];
  const defaultScrollY = section.scrollY;
  const difference = scrollY - defaultScrollY;

  // Change section
  const changeSection = useCallback((index: number) => {
    setSectionIndex(index);
    setScrollY(SECTIONS[index].scrollY);
  }, []);

  // Adjust scrollY
  const adjustScrollY = useCallback((delta: number) => {
    setScrollY(prev => Math.max(0, prev + delta));
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Gradient background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 50% 30%, ${COLORS.primary}15 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${COLORS.primary}10 0%, transparent 40%)
          `,
        }}
      />

      {/* Phone with scrollable content */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <PhoneFrame scale={PHONE.baseScale}>
          <ScrollableContent scrollY={scrollY} />
        </PhoneFrame>
      </div>

      {/* LEFT PANEL - Section Selector */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 30,
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '20px',
          borderRadius: 16,
          border: `2px solid ${COLORS.primary}`,
        }}
      >
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 16,
          color: COLORS.primary,
          fontFamily: 'system-ui, sans-serif',
        }}>
          SELECT SECTION
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SECTIONS.map((s, i) => (
            <Button
              key={s.id}
              onClick={() => changeSection(i)}
              active={i === sectionIndex}
              size="small"
            >
              {i}: {s.name}
            </Button>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - ScrollY Controls */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          right: 30,
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '24px',
          borderRadius: 16,
          border: `2px solid #00ff88`,
          minWidth: 280,
        }}
      >
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 20,
          color: '#00ff88',
          fontFamily: 'system-ui, sans-serif',
        }}>
          ADJUST SCROLL Y
        </div>

        {/* Current Value */}
        <div style={{
          fontSize: 48,
          fontWeight: 700,
          color: '#00ff88',
          fontFamily: 'monospace',
          textAlign: 'center',
          marginBottom: 20,
        }}>
          {scrollY}
        </div>

        {/* Big adjustment buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 15, justifyContent: 'center' }}>
          <Button onClick={() => adjustScrollY(-100)} color="#ff6666" size="medium">-100</Button>
          <Button onClick={() => adjustScrollY(-10)} color="#ffaa00" size="medium">-10</Button>
          <Button onClick={() => adjustScrollY(10)} color="#ffaa00" size="medium">+10</Button>
          <Button onClick={() => adjustScrollY(100)} color="#ff6666" size="medium">+100</Button>
        </div>

        {/* Fine adjustment */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
          <Button onClick={() => adjustScrollY(-50)} color="#888" size="small">-50</Button>
          <Button onClick={() => adjustScrollY(-5)} color="#888" size="small">-5</Button>
          <Button onClick={() => adjustScrollY(-1)} color="#888" size="small">-1</Button>
          <Button onClick={() => adjustScrollY(1)} color="#888" size="small">+1</Button>
          <Button onClick={() => adjustScrollY(5)} color="#888" size="small">+5</Button>
          <Button onClick={() => adjustScrollY(50)} color="#888" size="small">+50</Button>
        </div>

        {/* Reset button */}
        <div style={{ textAlign: 'center', marginBottom: 15 }}>
          <Button onClick={() => setScrollY(defaultScrollY)} color="#888" size="small">
            Reset to {defaultScrollY}
          </Button>
        </div>

        {/* Comparison */}
        <div style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: 14,
        }}>
          <div style={{ color: '#ffaa00', marginBottom: 4 }}>
            Default: {defaultScrollY}
          </div>
          <div style={{ color: difference === 0 ? '#00ff88' : '#ff6666' }}>
            Difference: {difference > 0 ? '+' : ''}{difference}
          </div>
        </div>
      </div>

      {/* BOTTOM - Copy Code */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.95)',
          padding: '20px 40px',
          borderRadius: 16,
          border: '2px solid #00ff88',
          textAlign: 'center',
        }}
      >
        <div style={{
          fontSize: 16,
          color: COLORS.textMuted,
          marginBottom: 10,
          fontFamily: 'system-ui, sans-serif',
        }}>
          Copy this value to constants.ts for section "{section.name}":
        </div>
        <div style={{
          fontSize: 28,
          fontFamily: 'monospace',
          color: '#00ff88',
          padding: '12px 24px',
          background: 'rgba(0, 255, 136, 0.1)',
          borderRadius: 8,
          border: '1px solid rgba(0, 255, 136, 0.3)',
        }}>
          scrollY: {scrollY},
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default DebugSectionPickerInteractive;
