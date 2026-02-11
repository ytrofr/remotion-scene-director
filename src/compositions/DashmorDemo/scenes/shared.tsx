/**
 * Shared components for DashmorDemo scenes
 */
import React from 'react';
import { Img, staticFile, interpolate } from 'remotion';
import { COLORS, PHONE } from '../constants';

// Phone frame component
export const PhoneFrame: React.FC<{
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
          0 0 0 1px rgba(255, 255, 255, 0.1),
          inset 0 0 0 1px rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      {/* Screen area */}
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

// Header height in pixels (before scaling)
const STICKY_HEADER_HEIGHT = 56; // Limor nav header height

// Scrollable content inside phone with sticky header
export const ScrollableContent: React.FC<{
  scrollY: number;
  stickyHeader?: boolean;
}> = ({ scrollY, stickyHeader = true }) => {
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

      {/* Sticky header overlay - stays fixed at top */}
      {stickyHeader && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: PHONE.width * scale,
            height: headerHeight,
            overflow: 'hidden',
            zIndex: 10,
            // Add subtle shadow to show it's floating
            boxShadow: scrollY > 10 ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {/* Show only the header portion of the image */}
          <Img
            src={staticFile('dashmor/labor-v3-fullpage-mobile.png')}
            style={{
              width: PHONE.width * scale,
              height: 'auto',
              // No transform - shows top of image (header)
            }}
          />
        </div>
      )}
    </>
  );
};

// Callout component
export const Callout: React.FC<{
  title: string;
  subtitle: string;
  position: 'top' | 'bottom';
  opacity: number;
  slideProgress: number;
}> = ({ title, subtitle, position, opacity, slideProgress }) => {
  const yOffset = position === 'top' ? -50 : 50;
  const translateY = interpolate(slideProgress, [0, 1], [yOffset, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        [position]: position === 'top' ? 80 : 120,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: COLORS.cardBg,
          backdropFilter: 'blur(20px)',
          padding: '24px 48px',
          borderRadius: 20,
          border: `1px solid ${COLORS.primary}40`,
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px ${COLORS.primary}20`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.white,
            fontFamily: 'system-ui, sans-serif',
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: COLORS.primary,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};

// Section progress dots
export const ProgressDots: React.FC<{
  currentIndex: number;
  totalSections: number;
  opacity: number;
}> = ({ currentIndex, totalSections, opacity }) => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 40,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: opacity * 0.6,
      }}
    >
      {Array.from({ length: totalSections }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i === currentIndex ? COLORS.primary : COLORS.textMuted,
            transition: 'background 0.2s',
            boxShadow: i === currentIndex ? `0 0 10px ${COLORS.primary}` : 'none',
          }}
        />
      ))}
    </div>
  );
};

// Title branding at top
export const TopBranding: React.FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.primary,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: 4,
        }}
      >
        LIMOR AI
      </div>
    </div>
  );
};

// Bottom branding
export const BottomBranding: React.FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 18,
          color: COLORS.textMuted,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Labor Cost Dashboard V3
      </div>
    </div>
  );
};

// Gradient background
export const GradientBackground: React.FC = () => {
  return (
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
  );
};
