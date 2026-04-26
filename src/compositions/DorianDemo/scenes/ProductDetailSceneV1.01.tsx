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
import { COLORS, SPRING_CONFIG, HAND_PHYSICS } from '../constants';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import {
  StatusBar,
  DynamicIsland,
  DorianNavHeader,
  AIBubble,
} from '../../../components/DorianPhone';
import { fontFamily } from '../../../lib/fonts';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';

// Scene 9 V1.01: extended detail (180f / 6s):
// 0-25  detail crossfade
// 25-50 scroll image up 380px to expose product specs
// 50-75 hand→Add to Cart→click→ripple
// 75-95 button → "Added ✓"
// 95-120 hand→hamburger→click
// 120-140 drawer slides in from left
// 140-160 hand→"My Store" menu item→click
// 160-180 whole scene slides off left (handled by DorianFullV1.01 wrapper too — see below)
//
// The slide-off transform is APPLIED HERE so the hand goes with it.
// DorianFullV1.01 starts scene 10 underneath at frame 1030 (overlap 20f) so
// scene 10 is revealed as scene 9 slides left.

const SCENE_W = 1080;

export const ProductDetailSceneV1_01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase animations
  const crossfade = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scroll content down to expose Add to Cart (image translates up)
  const scrollY = interpolate(frame, [25, 50], [0, -380], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3), // cubic ease-out
  });

  // Add to Cart button states
  const cartClicked = frame >= 70;
  const addedShown = frame >= 75;
  const checkmarkPop = spring({
    frame: frame - 78,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  // Drawer slide in from left (frames 120-140)
  const drawerSlide = spring({
    frame: frame - 120,
    fps,
    config: SPRING_CONFIG.slide,
  });
  const drawerVisible = frame >= 118;
  // Drawer width 280px at phone scale, slides from -280 to 0
  const drawerX = interpolate(drawerSlide, [0, 1], [-280, 0]);

  // Menu item highlight (clicked at frame 160)
  const menuClicked = frame >= 158;

  // Whole scene slides off left at end (frames 160-180)
  // Linear easing — feels like a deliberate page transition, not a snap.
  const sceneSlideX = interpolate(frame, [160, 180], [0, -SCENE_W], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Hand path (composition-space coords; scene 9 is at zoom 1.8, offsetY 0) ──
  // Formula: compX = 540 + 1.8*(phoneX - 207); compY = 960 + 1.8*(phoneY - 434)
  // Add to Cart at phone (195, 740) → comp (518, 1511)
  // Hamburger at phone (32, 88) → comp (225, 337)
  // Drawer "My Store" item at phone (140, 360) → comp (419, 827)
  const handPath: HandPathPoint[] = [
    // Move to Add to Cart
    { x: 700, y: 1700, frame: 50, gesture: 'pointer', scale: 1, rotation: 0 },
    { x: 518, y: 1511, frame: 65, gesture: 'pointer', scale: 1, rotation: 0 },
    {
      x: 518,
      y: 1511,
      frame: 70,
      gesture: 'click',
      scale: 1,
      rotation: 0,
      duration: 8,
    },
    // Move to hamburger
    { x: 400, y: 1100, frame: 100, gesture: 'pointer', scale: 1, rotation: 0 },
    { x: 225, y: 337, frame: 115, gesture: 'pointer', scale: 1, rotation: 0 },
    {
      x: 225,
      y: 337,
      frame: 118,
      gesture: 'click',
      scale: 1,
      rotation: 0,
      duration: 6,
    },
    // Move to "My Store" menu item
    { x: 350, y: 600, frame: 145, gesture: 'pointer', scale: 1, rotation: 0 },
    { x: 419, y: 827, frame: 155, gesture: 'pointer', scale: 1, rotation: 0 },
    {
      x: 419,
      y: 827,
      frame: 160,
      gesture: 'click',
      scale: 1,
      rotation: 0,
      duration: 6,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.white,
        transform: `translateX(${sceneSlideX}px)`,
      }}
    >
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
          Product Details
        </div>
      </AnimatedText>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scale(1.8)',
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
            {/* Listing fading out */}
            <div
              style={{
                position: 'absolute',
                top: -300 + scrollY,
                left: 0,
                width: 390,
                opacity: 1 - crossfade,
              }}
            >
              <Img
                src={staticFile('dorian/woodmart/lg-tvs-listing-full.png')}
                style={{ width: 390, height: 'auto', display: 'block' }}
              />
            </div>

            {/* Detail page */}
            <div
              style={{
                position: 'absolute',
                top: scrollY,
                left: 0,
                width: 390,
                opacity: crossfade,
              }}
            >
              <Img
                src={staticFile('dorian/woodmart/lg-tv-detail.png')}
                style={{ width: 390, height: 'auto', display: 'block' }}
              />
            </div>

            <StatusBar />
            <DynamicIsland />
            <DorianNavHeader showSearch={true} />

            {/* Add to Cart button — sticky bottom of phone */}
            <div
              style={{
                position: 'absolute',
                left: 16,
                right: 16,
                bottom: 24,
                zIndex: 15,
                opacity: frame >= 25 ? 1 : 0,
              }}
            >
              <div
                style={{
                  background: addedShown
                    ? COLORS.primaryDark
                    : cartClicked
                      ? COLORS.primaryDark
                      : COLORS.primary,
                  borderRadius: 24,
                  padding: '14px 20px',
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily,
                  color: 'white',
                  transform:
                    cartClicked && !addedShown ? 'scale(0.96)' : 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
                }}
              >
                {addedShown ? (
                  <>
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ transform: `scale(${checkmarkPop})` }}
                    >
                      <circle cx="12" cy="12" r="11" fill="white" />
                      <path
                        d="M7 12l3 3 7-7"
                        stroke={COLORS.primaryDark}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Added to Cart
                  </>
                ) : (
                  'Add to Cart'
                )}
              </div>
            </div>

            {/* Hamburger drawer (left side) */}
            {drawerVisible && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: 280,
                  background: 'white',
                  zIndex: 30,
                  transform: `translateX(${drawerX}px)`,
                  boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
                  paddingTop: 70,
                  fontFamily,
                }}
              >
                <div
                  style={{
                    padding: '16px 24px',
                    fontSize: 13,
                    color: COLORS.textLight,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  MENU
                </div>
                {[
                  { label: 'Home', highlight: false },
                  { label: 'Categories', highlight: false },
                  { label: 'My Cart', highlight: false },
                  { label: 'My Orders', highlight: false },
                  { label: 'My Store', highlight: true }, // navigation target
                  { label: 'Settings', highlight: false },
                ].map((item) => {
                  const isTarget = item.highlight;
                  const tappedNow = isTarget && menuClicked;
                  return (
                    <div
                      key={item.label}
                      style={{
                        padding: '14px 24px',
                        fontSize: 14,
                        fontWeight: isTarget ? 700 : 500,
                        color: tappedNow
                          ? 'white'
                          : isTarget
                            ? COLORS.primary
                            : COLORS.text,
                        background: tappedNow ? COLORS.primary : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      {isTarget && (
                        <svg
                          width={16}
                          height={16}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="6"
                            width="18"
                            height="14"
                            rx="2"
                            stroke={tappedNow ? 'white' : COLORS.primary}
                            strokeWidth="2"
                          />
                          <path
                            d="M3 10h18"
                            stroke={tappedNow ? 'white' : COLORS.primary}
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                      {item.label}
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Bubble - hidden once drawer opens */}
            {!drawerVisible && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 90,
                  right: 15,
                  zIndex: 20,
                }}
              >
                <AIBubble scale={1} pulse={true} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hand cursor (composition-space) */}
      {frame >= 50 && frame < 175 && (
        <FloatingHand
          path={handPath}
          startFrame={0}
          animation="cursor-real-black"
          size={120 * (1.8 / 1.8)} // ~120 at zoom 1.8
          dark={false}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={HAND_PHYSICS.tapGentle}
        />
      )}
    </AbsoluteFill>
  );
};
