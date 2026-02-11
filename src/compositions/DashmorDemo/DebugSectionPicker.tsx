/**
 * DebugSectionPicker - Interactive tool to find exact scroll positions
 *
 * Usage:
 * 1. Select this composition in Remotion Studio
 * 2. Use the sectionIndex input to select a section (0-6)
 * 3. Use the scrollY input to adjust scroll position
 * 4. Copy the scrollY value to constants.ts
 */
import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { COLORS, PHONE, SECTIONS } from './constants';

// Props for the debug composition
interface DebugSectionPickerProps {
  /** Which section to preview (0-6) */
  sectionIndex: number;
  /** Scroll Y position to test */
  scrollY: number;
}

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
      {/* Notch */}
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

// Scrollable content
const ScrollableContent: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const scale = PHONE.baseScale;
  return (
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
  );
};

export const DebugSectionPicker: React.FC<DebugSectionPickerProps> = ({
  sectionIndex,
  scrollY,
}) => {
  const frame = useCurrentFrame();
  const section = SECTIONS[sectionIndex] || SECTIONS[0];

  // Use provided scrollY or section's default
  const currentScrollY = scrollY;
  const defaultScrollY = section.scrollY;
  const difference = currentScrollY - defaultScrollY;

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
          <ScrollableContent scrollY={currentScrollY} />
        </PhoneFrame>
      </div>

      {/* Debug Info Panel */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          background: 'rgba(0, 0, 0, 0.85)',
          padding: '24px 32px',
          borderRadius: 16,
          border: `2px solid ${COLORS.primary}`,
          fontFamily: 'monospace',
          color: COLORS.white,
          minWidth: 350,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: COLORS.primary }}>
          Section Debug
        </div>

        <div style={{ fontSize: 18, marginBottom: 12 }}>
          <span style={{ color: COLORS.textMuted }}>Section:</span>{' '}
          <span style={{ color: COLORS.primary }}>{sectionIndex}</span> - {section.name}
        </div>

        <div style={{ fontSize: 18, marginBottom: 12 }}>
          <span style={{ color: COLORS.textMuted }}>Current scrollY:</span>{' '}
          <span style={{ color: '#00ff88', fontSize: 24, fontWeight: 700 }}>{currentScrollY}</span>
        </div>

        <div style={{ fontSize: 18, marginBottom: 12 }}>
          <span style={{ color: COLORS.textMuted }}>Default scrollY:</span>{' '}
          <span style={{ color: '#ffaa00' }}>{defaultScrollY}</span>
        </div>

        <div style={{ fontSize: 18, marginBottom: 16 }}>
          <span style={{ color: COLORS.textMuted }}>Difference:</span>{' '}
          <span style={{ color: difference === 0 ? '#00ff88' : '#ff6666' }}>
            {difference > 0 ? '+' : ''}{difference}
          </span>
        </div>

        <div style={{
          fontSize: 14,
          padding: '12px',
          background: 'rgba(0, 217, 255, 0.1)',
          borderRadius: 8,
          border: '1px solid rgba(0, 217, 255, 0.3)',
        }}>
          <div style={{ color: COLORS.primary, marginBottom: 8 }}>Copy to constants.ts:</div>
          <code style={{ color: '#00ff88' }}>
            scrollY: {currentScrollY},
          </code>
        </div>
      </div>

      {/* Section List */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          right: 40,
          background: 'rgba(0, 0, 0, 0.85)',
          padding: '24px',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.2)',
          fontFamily: 'monospace',
          color: COLORS.white,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: COLORS.primary }}>
          All Sections
        </div>
        {SECTIONS.map((s, i) => (
          <div
            key={s.id}
            style={{
              fontSize: 14,
              marginBottom: 8,
              padding: '8px 12px',
              borderRadius: 8,
              background: i === sectionIndex ? 'rgba(0, 217, 255, 0.2)' : 'transparent',
              border: i === sectionIndex ? `1px solid ${COLORS.primary}` : '1px solid transparent',
            }}
          >
            <span style={{ color: COLORS.primary }}>{i}</span>
            <span style={{ color: COLORS.textMuted }}> - </span>
            <span>{s.name}</span>
            <span style={{ color: COLORS.textMuted }}> (Y: {s.scrollY})</span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
          right: 40,
          background: 'rgba(0, 0, 0, 0.85)',
          padding: '16px 24px',
          borderRadius: 12,
          fontFamily: 'system-ui, sans-serif',
          color: COLORS.textMuted,
          textAlign: 'center',
          fontSize: 16,
        }}
      >
        <strong style={{ color: COLORS.white }}>Instructions:</strong> Use the input controls in Remotion Studio sidebar →{' '}
        <span style={{ color: COLORS.primary }}>sectionIndex</span> (0-6) to select section,{' '}
        <span style={{ color: '#00ff88' }}>scrollY</span> to adjust position
      </div>
    </AbsoluteFill>
  );
};

export default DebugSectionPicker;
