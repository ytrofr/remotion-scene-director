/**
 * SectionScene - Generic section with pause, callout, and optional scroll transition
 *
 * Each section:
 * 1. Shows content at scrollY position
 * 2. Displays callout (fades in/out)
 * 3. Optionally scrolls to next position
 */
import React from 'react';
import {
  AbsoluteFill,
  spring,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { COLORS, PHONE, SECTIONS } from '../constants';
import {
  PhoneFrame,
  ScrollableContent,
  Callout,
  GradientBackground,
  TopBranding,
  ProgressDots,
  BottomBranding,
} from './shared';

interface SectionSceneProps {
  /** Section index (0-6) */
  sectionIndex: number;
  /** Frames to pause and show callout */
  pauseFrames: number;
  /** Frames for scroll transition (0 = no scroll, last section) */
  scrollFrames: number;
  /** Scroll Y position for this section */
  scrollY: number;
  /** Next scroll Y position (for transition) */
  nextScrollY: number;
  /** Callout title */
  title: string;
  /** Callout subtitle */
  subtitle: string;
  /** Callout position */
  calloutPosition: 'top' | 'bottom';
  /** Is this section currently scrolling? (for hand sync) */
  onScrollStateChange?: (isScrolling: boolean, progress: number) => void;
}

export const SectionScene: React.FC<SectionSceneProps> = ({
  sectionIndex,
  pauseFrames,
  scrollFrames,
  scrollY,
  nextScrollY,
  title,
  subtitle,
  calloutPosition,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = pauseFrames + scrollFrames;

  // Determine if we're in pause phase or scroll phase
  const isPausePhase = frame < pauseFrames;
  const isScrollPhase = frame >= pauseFrames && scrollFrames > 0;

  // Calculate current scroll position
  let currentScrollY = scrollY;
  let scrollProgress = 0;

  if (isScrollPhase) {
    scrollProgress = (frame - pauseFrames) / scrollFrames;
    const easedProgress = Easing.inOut(Easing.cubic)(scrollProgress);
    currentScrollY = interpolate(easedProgress, [0, 1], [scrollY, nextScrollY]);
  }

  // Callout animation
  const pauseProgress = isPausePhase ? frame / pauseFrames : 1;
  const calloutOpacity = interpolate(
    pauseProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, isScrollPhase ? 0.3 : 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fade out callout during scroll
  const scrollFadeOut = isScrollPhase
    ? interpolate(scrollProgress, [0, 0.3], [1, 0], { extrapolateRight: 'clamp' })
    : 1;

  const calloutSlideProgress = spring({
    frame,
    fps,
    config: { damping: 25, stiffness: 150 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <GradientBackground />
      <TopBranding opacity={1} />

      {/* Phone with scrolling content */}
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

      {/* Callout */}
      <Callout
        title={title}
        subtitle={subtitle}
        position={calloutPosition}
        opacity={calloutOpacity * scrollFadeOut}
        slideProgress={calloutSlideProgress}
      />

      <ProgressDots
        currentIndex={sectionIndex}
        totalSections={SECTIONS.length}
        opacity={1}
      />

      <BottomBranding opacity={1} />
    </AbsoluteFill>
  );
};

export default SectionScene;
