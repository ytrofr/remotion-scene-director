/**
 * ProductPageSceneV1_09 — V1.09 of ProductPageScene.
 *
 * Diff vs ProductPageScene (V1.00 / V1.08):
 *   - Scroll cursor uses scrollbar-drag pattern (ScrollEffectDemo Option 3
 *     "Big-200px"), matching HomeScrollSceneV1_09.
 *     * X = 880 (scrollbar position), was 780 (mid-content).
 *     * Y travels 200px (Y_TOP=860 → Y_BOT=1060) over the scroll window.
 *       Scroll-active in this scene is f110-f140 (30 frames) — same as V1.00.
 *   - Physics swapped to HAND_PHYSICS.scrollbar (no velocity tilt).
 *   - dark={false}, animation hard-coded to 'cursor-real-black' (rule 43).
 *   - Hardcoded path; does NOT call getSavedPath() — V1.09 pattern locked.
 *
 * All non-cursor logic (zoom-out, loader, listing reveal, chat overlay,
 * timing, content scroll) is unchanged from V1.00.
 *
 * Companion: DorianDemoV1.09.tsx imports this. See .claude/rules/version-safe-iteration.md.
 */
import React from 'react';
import {
  AbsoluteFill,
  Easing,
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
import {
  StatusBar,
  DynamicIsland,
  DorianNavHeader,
  AIBubble,
  AnimatedText,
} from '../../../components/DorianPhone';
import { fontFamily } from '../../../lib/fonts';
import { DorianLoader, ChatOverlay, HomeBackground } from './ProductPageParts';

// Scene 8 V1.09: Product page with scrollbar-drag cursor.
export const ProductPageSceneV1_09: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const message = TEXT_CONTENT.userTyping.userMessage;
  const aiMessage = TEXT_CONTENT.aiResponse.aiMessage;
  const chatHeight = 370;

  const zoomOutProgress = spring({ frame, fps, config: SPRING_CONFIG.zoom });
  const zoomScale = interpolate(zoomOutProgress, [0, 1], [2.75, 1.8]);
  const zoomOffsetY = interpolate(zoomOutProgress, [0, 1], [-374, 0]);

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

  // Content scroll — unchanged from V1.00 (same Easing, same window 110-140).
  const scrollProgress = interpolate(frame, [110, 140], [0, 300], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Scrollbar-drag waypoints. Scroll-active is f110-f140 (30 frames) → 200px
  // travel makes the cursor move ~6.7px/frame, fast but proportional.
  const X_SCROLLBAR = 880;
  const Y_MID = 960;
  const Y_TOP = Y_MID - 100;
  const Y_BOT = Y_MID + 100;
  const scrollHandPath: HandPathPoint[] = [
    // Enter from off-screen right at f105 (slightly before scroll begins)
    {
      x: 1050,
      y: Y_TOP,
      frame: 105,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
    },
    // Arrive at scrollbar by f110 (just as content starts scrolling)
    {
      x: X_SCROLLBAR,
      y: Y_TOP,
      frame: 110,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
    },
    // Begin drag at f112
    {
      x: X_SCROLLBAR,
      y: Y_TOP,
      frame: 112,
      gesture: 'drag',
      rotation: 0,
      scale: 1,
    },
    // End drag at f140 (matches scrollProgress end)
    {
      x: X_SCROLLBAR,
      y: Y_BOT,
      frame: 140,
      gesture: 'drag',
      rotation: 0,
      scale: 1,
    },
    // Release + hold to scene end
    {
      x: X_SCROLLBAR,
      y: Y_BOT,
      frame: 145,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
    },
    {
      x: X_SCROLLBAR,
      y: Y_BOT,
      frame: 150,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
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
              {frame < 108 && <HomeBackground opacity={1 - listingIn} />}

              {frame >= 30 && frame < 110 && (
                <DorianLoader
                  contentTop={contentTop}
                  loaderVisible={loaderVisible}
                  spinDegrees={spinDegrees}
                />
              )}

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

              {frame < 45 && (
                <ChatOverlay
                  chatSlide={chatSlide}
                  chatHeight={chatHeight}
                  message={message}
                  aiMessage={aiMessage}
                />
              )}

              <StatusBar />
              <DynamicIsland />
              <DorianNavHeader />

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

      {/* Scrollbar-drag cursor — appears at frame 105 onward */}
      {frame >= 105 && (
        <FloatingHand
          path={scrollHandPath}
          startFrame={0}
          animation="cursor-real-black"
          size={handSizeForZoom(zoomScale)}
          dark={false}
          showRipple={false}
          physics={HAND_PHYSICS.scrollbar}
        />
      )}
    </AbsoluteFill>
  );
};
