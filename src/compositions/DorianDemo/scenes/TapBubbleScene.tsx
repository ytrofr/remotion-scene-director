import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, HAND_PHYSICS } from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import { getSavedPath } from '../../SceneDirector/codedPaths';
import { DorianPhoneMockup as DorianPhoneMockupNew } from '../DorianPhoneMockup';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { fontFamily } from '../../../lib/fonts';

// Scene 3: Tap on AI Bubble with ZOOM and FloatingHand
export const TapAIBubbleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // AI bubble position on phone (non-zoomed): (818, 1546)
  // Zoom starts at frame 278 (scene frame 53), click at frame 298 (scene frame 73)
  // After 3x zoom, bubble appears at (518, 992) — that's where hand clicks
  const zoomStartFrame = 53; // Frame 278 = scene3Start(225) + 53
  const clickFrame = 73; // Frame 298 = scene3Start(225) + 73

  // Gentle zoom to bottom of phone — full mockup stays visible, just emphasis on lower area
  // Ends at (2.2, 0, -240) — scene 4 starts from this exact state
  const zoomProgress = spring({
    frame: frame - zoomStartFrame,
    fps,
    config: { damping: 15, mass: 1, stiffness: 80 },
  });
  const zoomScale = interpolate(zoomProgress, [0, 1], [1.8, 2.75]);
  const zoomOffsetX = 0; // No horizontal shift — phone stays centered
  const zoomOffsetY = interpolate(zoomProgress, [0, 1], [0, -374]);

  // Hand path - approach bubble, then track it as zoom moves it
  const savedTap = getSavedPath('DorianDemo', '3-TapBubble');
  const handPath: HandPathPoint[] = savedTap?.path ?? [
    { x: 780, y: 1200, frame: 0, gesture: 'pointer', scale: 1 }, // H1: Start above
    { x: 800, y: 1400, frame: 30, gesture: 'pointer', scale: 1 }, // H2: Moving down
    { x: 818, y: 1546, frame: zoomStartFrame, gesture: 'pointer', scale: 1 }, // H3: At bubble, zoom starts
    {
      x: 790,
      y: 1420,
      frame: clickFrame,
      gesture: 'click',
      duration: 2,
      scale: 1.2,
    }, // H4: CLICK — slight shift from gentle zoom
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
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
          Meet Your AI Assistant
        </div>
      </AnimatedText>

      {/* Phone with same scrolled view as end of Scene 2 - zoom centers on bubble */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `translate(${zoomOffsetX}px, ${zoomOffsetY}px)`,
        }}
      >
        <DorianPhoneMockupNew
          scrollProgress={1}
          scale={zoomScale}
          showAIBubble={true}
        />
      </div>

      {/* Floating Hand - pointer during movement, tap animation only on click */}
      <FloatingHand
        path={handPath}
        startFrame={0}
        animation="hand-click"
        size={140}
        dark={savedTap?.dark ?? true}
        showRipple={true}
        rippleColor="rgba(45, 212, 191, 0.6)"
        physics={HAND_PHYSICS.trailResponsive}
      />
    </AbsoluteFill>
  );
};
