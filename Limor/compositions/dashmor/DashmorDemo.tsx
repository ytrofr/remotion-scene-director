import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from 'remotion';
import { COLORS, PHONE, PAGE, SECTIONS, TIMING, VIDEO } from './constants';

/**
 * DashmorDemo - Labor Cost V3 Dashboard Scrolling Demo
 *
 * Features:
 * - Phone mockup showing full dashboard
 * - Section-by-section scrolling with pauses
 * - Text callouts highlighting features
 *
 * Duration: ~20 seconds @ 30fps
 * Output: 1080x1920 (9:16 vertical)
 */

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

// Scrollable content inside phone
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

// Callout component
const Callout: React.FC<{
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

// Calculate scroll position and current section based on frame
const useScrollState = (frame: number) => {
  let currentFrame = TIMING.introFrames;
  let scrollY = 0;
  let currentSectionIndex = 0;
  let sectionProgress = 0; // 0-1 progress within current section's pause

  for (let i = 0; i < SECTIONS.length; i++) {
    const section = SECTIONS[i];
    const nextSection = SECTIONS[i + 1];

    // During pause at this section
    const pauseEnd = currentFrame + section.pauseFrames;
    if (frame < pauseEnd) {
      scrollY = section.scrollY;
      currentSectionIndex = i;
      sectionProgress = (frame - currentFrame) / section.pauseFrames;
      break;
    }
    currentFrame = pauseEnd;

    // During scroll to next section
    if (nextSection) {
      const scrollEnd = currentFrame + TIMING.scrollFramesPerSection;
      if (frame < scrollEnd) {
        const scrollProgress = (frame - currentFrame) / TIMING.scrollFramesPerSection;
        const easedProgress = Easing.inOut(Easing.cubic)(scrollProgress);
        scrollY = interpolate(easedProgress, [0, 1], [section.scrollY, nextSection.scrollY]);
        currentSectionIndex = i;
        sectionProgress = 1; // Callout should be fading out
        break;
      }
      currentFrame = scrollEnd;
    }

    // If we're past all sections
    if (i === SECTIONS.length - 1) {
      scrollY = section.scrollY;
      currentSectionIndex = i;
      sectionProgress = 1;
    }
  }

  return { scrollY, currentSectionIndex, sectionProgress };
};

// Main composition
export const DashmorDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro animation
  const introProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  // Outro animation (last 45 frames)
  const outroStart = VIDEO.durationInFrames - TIMING.outroFrames;
  const outroProgress = frame > outroStart
    ? interpolate(frame, [outroStart, VIDEO.durationInFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  // Get scroll state
  const { scrollY, currentSectionIndex, sectionProgress } = useScrollState(frame);
  const currentSection = SECTIONS[currentSectionIndex];

  // Phone entrance animation
  const phoneY = interpolate(introProgress, [0, 1], [400, 0]);
  const phoneOpacity = introProgress;

  // Callout animation - fade in at start of pause, fade out near end
  const calloutOpacity = interpolate(sectionProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const calloutSlideProgress = spring({
    frame: Math.max(0, frame - TIMING.introFrames),
    fps,
    config: { damping: 25, stiffness: 150 },
  });

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

      {/* Title at top */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: introProgress * outroProgress,
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

      {/* Phone with scrollable content */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${phoneY}px)`,
          opacity: phoneOpacity * outroProgress,
        }}
      >
        <PhoneFrame scale={PHONE.baseScale}>
          <ScrollableContent scrollY={scrollY} />
        </PhoneFrame>
      </div>

      {/* Current section callout */}
      {currentSection && frame > TIMING.introFrames && frame < outroStart && (
        <Callout
          title={currentSection.callout.title}
          subtitle={currentSection.callout.subtitle}
          position={currentSection.callout.position}
          opacity={calloutOpacity}
          slideProgress={calloutSlideProgress}
        />
      )}

      {/* Scroll progress indicator */}
      <div
        style={{
          position: 'absolute',
          right: 40,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: introProgress * outroProgress * 0.6,
        }}
      >
        {SECTIONS.map((section, i) => (
          <div
            key={section.id}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i === currentSectionIndex ? COLORS.primary : COLORS.textMuted,
              transition: 'background 0.2s',
              boxShadow: i === currentSectionIndex ? `0 0 10px ${COLORS.primary}` : 'none',
            }}
          />
        ))}
      </div>

      {/* Bottom branding */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: introProgress * outroProgress,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: COLORS.textMuted,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Labor Cost Dashboard V3
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default DashmorDemo;
