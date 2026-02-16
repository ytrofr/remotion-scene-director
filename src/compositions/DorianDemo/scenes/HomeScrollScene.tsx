import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame, interpolate, useVideoConfig, Audio } from 'remotion';
import { COLORS } from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import { getSavedPath } from '../../SceneDirector/codedPaths';
import { DorianPhoneMockup as DorianPhoneMockupNew } from '../DorianPhoneMockup';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { fontFamily } from '../../../lib/fonts';

// Scene 2: Home Page with scroll animation - Homepage -> Products
export const HomeScrollScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scroll progress: 0 = homepage visible, 1 = products visible
  // Start scroll at frame 30, complete by frame 120
  const scrollProgress = interpolate(
    frame,
    [30, 120],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Hand position - FIXED on right side, middle of screen
  const handX = 780; // Fixed X position (right side of phone)
  const handY = 960; // Fixed Y position (center of composition)

  // Hand path - COMPLETELY STATIC position, tilted 30deg left while scrolling
  // NO EXIT - hand stays in place for smooth transition to Scene 3
  const savedScroll = getSavedPath('DorianDemo', '2-HomeScroll');
  const scrollHandPath: HandPathPoint[] = savedScroll?.path ?? [
    { x: 1050, y: handY, frame: 0, gesture: 'pointer', rotation: 0 },              // Enter from right
    { x: handX, y: handY, frame: 20, gesture: 'pointer', rotation: 0 },            // Arrive at position
    { x: handX, y: handY, frame: 28, gesture: 'drag', rotation: -30 },             // Start scroll - tilt left 30deg
    { x: handX, y: handY, frame: 60, gesture: 'drag', rotation: -30 },             // Scrolling... (STATIC)
    { x: handX, y: handY, frame: 90, gesture: 'drag', rotation: -30 },             // Scrolling... (STATIC)
    { x: handX, y: handY, frame: 118, gesture: 'drag', rotation: -30 },            // End scroll (STATIC)
    { x: handX, y: handY, frame: 125, gesture: 'pointer', rotation: 0 },           // Release - back to normal
    { x: handX, y: handY, frame: 150, gesture: 'pointer', rotation: 0 },           // STAY in place (no exit)
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Swipe sound when scroll starts */}
      {frame === 28 && <Audio src={staticFile('audio/u_nharq4usid-swipe-255512.mp3')} volume={0.3} />}

      <AnimatedText
        delay={0}
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            fontFamily,
          }}
        >
          Discover Local Products
        </div>
      </AnimatedText>

      {/* Phone with scrollable content INSIDE (not between mockups) */}
      <DorianPhoneMockupNew
        scrollProgress={scrollProgress}
        scale={1.8}
        showAIBubble={true}
      />

      {/* Scrolling hand - STATIC X position, only vertical movement */}
      <FloatingHand
        path={scrollHandPath}
        startFrame={0}
        animation="hand-scroll-clean"
        size={140}
        dark={true}
        showRipple={false}
        physics={{
          floatAmplitude: 0,       // No floating - keep stable
          floatSpeed: 0,
          velocityScale: 0.1,     // Minimal rotation from movement
          maxRotation: 5,         // Very limited rotation
          shadowEnabled: true,
          shadowDistance: 8,
          shadowBlur: 10,
          smoothing: 0.2,         // Smooth movement
        }}
      />
    </AbsoluteFill>
  );
};
