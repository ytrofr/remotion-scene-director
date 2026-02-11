import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from 'remotion';
import { COLORS, PHONE, SECTIONS, TIMING, VIDEO } from './constants';
import { ScrollSyncedHand } from '../../components/FloatingHand';
import { IntroScene } from './scenes/IntroScene';
import { SectionScene } from './scenes/SectionScene';
import { OutroScene } from './scenes/OutroScene';
import { GradientBackground } from './scenes/shared';
import { DashmorAudioLayer } from './DashmorAudioLayer';

/**
 * DashmorDemo - Labor Cost V3 Dashboard Scrolling Demo
 *
 * REFACTORED: Now uses Sequence with individual scenes
 *
 * Structure:
 * - IntroScene (45 frames)
 * - SectionScene x7 (pauseFrames + scrollFrames each)
 * - OutroScene (45 frames)
 *
 * Duration: ~20 seconds @ 30fps
 * Output: 1080x1920 (9:16 vertical)
 */

// Hand position constants
const HAND_POSITION = {
  x: 540 + (PHONE.width * PHONE.baseScale) / 2 - 60, // Right side of phone
  y: 960, // Center of screen
};

// Calculate scene timings
const calculateSceneTimings = () => {
  const timings: { name: string; from: number; durationInFrames: number }[] = [];
  let currentFrame = 0;

  // Intro
  timings.push({
    name: 'Intro',
    from: currentFrame,
    durationInFrames: TIMING.introFrames,
  });
  currentFrame += TIMING.introFrames;

  // Each section
  SECTIONS.forEach((section, i) => {
    const isLastSection = i === SECTIONS.length - 1;
    const sectionDuration = section.pauseFrames + (isLastSection ? 0 : TIMING.scrollFramesPerSection);

    timings.push({
      name: section.name,
      from: currentFrame,
      durationInFrames: sectionDuration,
    });
    currentFrame += sectionDuration;
  });

  // Outro
  timings.push({
    name: 'Outro',
    from: currentFrame,
    durationInFrames: TIMING.outroFrames,
  });

  return timings;
};

export const DASHMOR_SCENE_TIMINGS = calculateSceneTimings();
const SCENE_TIMINGS = DASHMOR_SCENE_TIMINGS;

// Calculate scroll state for hand sync (global across all scenes)
const useScrollState = (frame: number) => {
  let currentFrame = TIMING.introFrames;
  let scrollY = 0;
  let currentSectionIndex = 0;
  let isScrolling = false;
  let scrollProgress = 0;

  for (let i = 0; i < SECTIONS.length; i++) {
    const section = SECTIONS[i];
    const nextSection = SECTIONS[i + 1];

    // During pause at this section
    const pauseEnd = currentFrame + section.pauseFrames;
    if (frame < pauseEnd) {
      scrollY = section.scrollY;
      currentSectionIndex = i;
      isScrolling = false;
      scrollProgress = 0;
      break;
    }
    currentFrame = pauseEnd;

    // During scroll to next section
    if (nextSection) {
      const scrollEnd = currentFrame + TIMING.scrollFramesPerSection;
      if (frame < scrollEnd) {
        scrollProgress = (frame - currentFrame) / TIMING.scrollFramesPerSection;
        const easedProgress = Easing.inOut(Easing.cubic)(scrollProgress);
        scrollY = interpolate(easedProgress, [0, 1], [section.scrollY, nextSection.scrollY]);
        currentSectionIndex = i;
        isScrolling = true;
        break;
      }
      currentFrame = scrollEnd;
    }

    // Past all sections
    if (i === SECTIONS.length - 1) {
      scrollY = section.scrollY;
      currentSectionIndex = i;
      isScrolling = false;
      scrollProgress = 0;
    }
  }

  return { scrollY, currentSectionIndex, isScrolling, scrollProgress };
};

// Main composition
export const DashmorDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get global scroll state for hand sync
  const { isScrolling, scrollProgress } = useScrollState(frame);

  // Outro timing
  const outroStart = VIDEO.durationInFrames - TIMING.outroFrames;

  // Global opacity for intro/outro
  const introOpacity = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const outroOpacity = frame > outroStart
    ? interpolate(frame, [outroStart, VIDEO.durationInFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Background (always visible) */}
      <GradientBackground />

      {/* ========== SCENES ========== */}

      {/* Intro Scene */}
      <Sequence
        name="1. Intro"
        from={SCENE_TIMINGS[0].from}
        durationInFrames={SCENE_TIMINGS[0].durationInFrames}
      >
        <IntroScene durationInFrames={SCENE_TIMINGS[0].durationInFrames} />
      </Sequence>

      {/* Section Scenes */}
      {SECTIONS.map((section, i) => {
        const timing = SCENE_TIMINGS[i + 1]; // +1 because intro is first
        const isLastSection = i === SECTIONS.length - 1;
        const nextSection = SECTIONS[i + 1];

        return (
          <Sequence
            key={section.id}
            name={`${i + 2}. ${section.name}`}
            from={timing.from}
            durationInFrames={timing.durationInFrames}
          >
            <SectionScene
              sectionIndex={i}
              pauseFrames={section.pauseFrames}
              scrollFrames={isLastSection ? 0 : TIMING.scrollFramesPerSection}
              scrollY={section.scrollY}
              nextScrollY={nextSection?.scrollY ?? section.scrollY}
              title={section.callout.title}
              subtitle={section.callout.subtitle}
              calloutPosition={section.callout.position}
            />
          </Sequence>
        );
      })}

      {/* Outro Scene */}
      <Sequence
        name={`${SECTIONS.length + 2}. Outro`}
        from={SCENE_TIMINGS[SCENE_TIMINGS.length - 1].from}
        durationInFrames={SCENE_TIMINGS[SCENE_TIMINGS.length - 1].durationInFrames}
      >
        <OutroScene
          durationInFrames={TIMING.outroFrames}
          finalScrollY={SECTIONS[SECTIONS.length - 1].scrollY}
        />
      </Sequence>

      {/* ========== HAND (Global - synced with scroll) ========== */}
      <ScrollSyncedHand
        x={HAND_POSITION.x}
        y={HAND_POSITION.y}
        isScrolling={isScrolling}
        scrollProgress={scrollProgress}
        enterFrame={0}
        exitFrame={outroStart}
        totalFrames={VIDEO.durationInFrames}
        size={140}
        tilt={-20}
      />

      {/* ========== AUDIO (Gentle scroll sounds) ========== */}
      <DashmorAudioLayer enabled={true} />
    </AbsoluteFill>
  );
};

export default DashmorDemo;
