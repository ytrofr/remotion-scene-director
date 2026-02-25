import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import {
  COLORS,
  TEXT_CONTENT,
  SPRING_CONFIG,
  HAND_PHYSICS,
  handSizeForZoom,
} from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import { getSavedPath } from '../../SceneDirector/codedPaths';
import {
  StatusBar,
  DynamicIsland,
  DorianNavHeader,
  AIBubble,
  AnimatedText,
} from '../../../components/DorianPhone';
import { fontFamily } from '../../../lib/fonts';
import { DorianLoader, ChatOverlay, HomeBackground } from './ProductPageParts';

// Scene 8: Product Page - zoom out from chat, loader inside phone, then LG TV listing
export const ProductPageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const message = TEXT_CONTENT.userTyping.userMessage;
  const aiMessage = TEXT_CONTENT.aiResponse.aiMessage;
  const chatHeight = 260;

  // Phase 1 (frames 0-25): Zoom out from 2.76 to 1.8 to reveal full phone
  // Phase 2 (frames 25-40): Chat panel slides down, loader appears inside phone content area
  // Phase 3 (frames 40-100): Dorian branded loader visible (~2s)
  // Phase 4 (frames 95-105): Loader fades, LG TV listing fades in
  // Phase 5 (frames 105-150): Hand scrolls listing

  const zoomOutProgress = spring({ frame, fps, config: SPRING_CONFIG.zoom });
  const zoomScale = interpolate(zoomOutProgress, [0, 1], [2.75, 1.8]);
  const zoomOffsetY = interpolate(zoomOutProgress, [0, 1], [-560, 0]);

  const chatSlide = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const loaderIn = interpolate(frame, [30, 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const loaderOut = interpolate(frame, [95, 105], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const loaderVisible = Math.min(loaderIn, loaderOut);
  const spinDegrees = frame * 8;

  const listingIn = interpolate(frame, [95, 108], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scrollProgress = interpolate(frame, [110, 140], [0, 300], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Hand for scrolling
  const handX = 780;
  const handY = 960;
  const savedScroll = getSavedPath('DorianDemo', '8-ProductPage');
  const scrollHandPath: HandPathPoint[] = savedScroll?.path ?? [
    { x: 1050, y: handY, frame: 105, gesture: 'pointer' as const, rotation: 0 },
    {
      x: handX,
      y: handY,
      frame: 115,
      gesture: 'pointer' as const,
      rotation: 0,
    },
    { x: handX, y: handY, frame: 118, gesture: 'drag' as const, rotation: -30 },
    { x: handX, y: handY, frame: 130, gesture: 'drag' as const, rotation: -30 },
    { x: handX, y: handY, frame: 140, gesture: 'drag' as const, rotation: -30 },
    {
      x: handX,
      y: handY,
      frame: 145,
      gesture: 'pointer' as const,
      rotation: 0,
    },
    {
      x: handX,
      y: handY,
      frame: 150,
      gesture: 'pointer' as const,
      rotation: 0,
    },
  ];

  const contentTop = 130;

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
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            fontFamily,
          }}
        >
          {TEXT_CONTENT.productPage.title}
        </div>
      </AnimatedText>

      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `translate(0px, ${zoomOffsetY}px)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${zoomScale})`,
          }}
        >
          {/* Single phone frame throughout the scene */}
          <div
            style={{
              width: 390 + 24,
              height: 844 + 24,
              background: '#1a1a1a',
              borderRadius: 55,
              padding: 12,
              boxShadow:
                '0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: 390,
                height: 844,
                borderRadius: 45,
                overflow: 'hidden',
                position: 'relative',
                background: '#fff',
              }}
            >
              {/* Layer 1: Background - same stacked screenshots as scene 7 (scrollOffset 702) */}
              {frame < 108 && <HomeBackground opacity={1 - listingIn} />}

              {/* Layer 2: Dorian branded loader */}
              {frame >= 30 && frame < 110 && (
                <DorianLoader
                  contentTop={contentTop}
                  loaderVisible={loaderVisible}
                  spinDegrees={spinDegrees}
                />
              )}

              {/* Layer 3: LG TV listing (fades in after loader, then scrolls) */}
              {frame >= 90 && (
                <div
                  style={{
                    position: 'absolute',
                    top: -scrollProgress,
                    left: 0,
                    width: 390,
                    opacity: listingIn,
                  }}
                >
                  <Img
                    src={staticFile('dorian/woodmart/lg-tvs-listing-full.png')}
                    style={{ width: 390, height: 'auto', display: 'block' }}
                  />
                </div>
              )}

              {/* Chat overlay panel - slides down after zoom out completes */}
              {frame < 45 && (
                <ChatOverlay
                  chatSlide={chatSlide}
                  chatHeight={chatHeight}
                  message={message}
                  aiMessage={aiMessage}
                />
              )}

              {/* Shared phone chrome */}
              <StatusBar />
              <DynamicIsland />
              <DorianNavHeader />

              {/* AI Assistant Bubble */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 70,
                  right: 15,
                  zIndex: 20,
                }}
              >
                <AIBubble scale={1} pulse />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling hand */}
      {frame >= (savedScroll ? (scrollHandPath[0]?.frame ?? 0) : 105) && (
        <FloatingHand
          path={scrollHandPath}
          startFrame={savedScroll ? 0 : 105}
          animation="hand-scroll-clean"
          size={handSizeForZoom(zoomScale)}
          dark={savedScroll?.dark ?? true}
          showRipple={false}
          physics={HAND_PHYSICS.scroll}
        />
      )}
    </AbsoluteFill>
  );
};
