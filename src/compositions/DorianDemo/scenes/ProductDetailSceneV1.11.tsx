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
import { getSavedPath } from '../../SceneDirector/codedPaths';

// Scene 9 V1.11 (250f / 8.33s):
//
// Diff vs V1.08:
//   - Replaced free-form scroll waypoints (frames 0-120) with the BIG
//     scrollbar-drag pattern matching V1.09 scenes 2 + 8. Cursor lives on
//     the right-edge scrollbar at X=880, drags Y from 860→1060 (200px range)
//     while content scrolls in the background.
//   - After scroll-drag (frame 122), cursor invisibly teleports to Add to
//     Cart and the existing V1.08 click sequence runs unchanged.
//   - Scroll content interpolation, audio cues, drawer/cart logic identical
//     to V1.08.

const SKIP_START = 880;
const SKIP_END = 1380;
const HOLD_OFFSET = -75;
const SCROLL_END = -1075;

export const ProductDetailSceneV1_11: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scroll mirrors hand drag exactly (same as V1.07).
  const detailTop = interpolate(
    frame,
    [0, 50, 78, 85, 115],
    [HOLD_OFFSET, HOLD_OFFSET, -505, -505, SCROLL_END],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const cartClicked = frame >= 145;
  const addedShown = frame >= 150;
  const checkmarkPop = spring({
    frame: frame - 153,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  const drawerVisible = frame >= 188;
  const drawerSlide = spring({
    frame: frame - 190,
    fps,
    config: SPRING_CONFIG.slide,
  });
  const drawerX = interpolate(drawerSlide, [0, 1], [-280, 0]);
  const myStoreClicked = frame >= 232;

  const pageLoadVisible = interpolate(frame, [238, 250], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pageLoadSpin = (frame - 238) * 8;

  // Single cursor path — covers entire scene, scale:0 hides between actions.
  // Coords are composition-space (1080×1920); FloatingHand renders OUTSIDE
  // the scaled phone wrapper. Phone center=(540,960), scale=1.8.
  //   Add to Cart   phone (195, 740) → comp (518, 1635)
  //   Hamburger     phone (32,  88)  → comp (225, 337)
  //   My Store      phone (140, 360) → comp (419, 827)
  // V1.11 path: BIG scrollbar drag (X=880, Y 860→1060 over frames 25-115),
  // then invisible jump to Add to Cart and existing click sequence.
  const savedPath = getSavedPath('DorianFullV1-10', '9-ProductDetail');
  const handPath: HandPathPoint[] = savedPath?.path ?? [
    // Hold invisible at scene start (Lottie loads, SVG renders before reveal)
    { x: 880, y: 860, frame: 0, gesture: 'pointer', scale: 0, rotation: 0 },
    { x: 880, y: 860, frame: 20, gesture: 'pointer', scale: 0, rotation: 0 },
    // Cursor appears on scrollbar (top of track)
    { x: 880, y: 860, frame: 25, gesture: 'pointer', scale: 1, rotation: 0 },
    // Begin drag
    { x: 880, y: 860, frame: 32, gesture: 'drag', scale: 1, rotation: 0 },
    // Drag down the scrollbar — covers content scroll window
    { x: 880, y: 1060, frame: 115, gesture: 'drag', scale: 1, rotation: 0 },
    // Release
    { x: 880, y: 1060, frame: 120, gesture: 'pointer', scale: 1, rotation: 0 },
    // → Add to Cart (invisible jump)
    { x: 880, y: 1060, frame: 122, gesture: 'pointer', scale: 0, rotation: 0 },
    { x: 650, y: 1700, frame: 124, gesture: 'pointer', scale: 0, rotation: 0 },
    { x: 650, y: 1700, frame: 126, gesture: 'pointer', scale: 1, rotation: 0 },
    { x: 518, y: 1635, frame: 142, gesture: 'pointer', scale: 1, rotation: 0 },
    {
      x: 518,
      y: 1635,
      frame: 145,
      gesture: 'click',
      scale: 1,
      rotation: 0,
      duration: 8,
    },
    // → Hamburger (invisible jump)
    { x: 518, y: 1635, frame: 158, gesture: 'pointer', scale: 0, rotation: 0 },
    { x: 400, y: 1000, frame: 173, gesture: 'pointer', scale: 0, rotation: 0 },
    { x: 400, y: 1000, frame: 175, gesture: 'pointer', scale: 1, rotation: 0 },
    { x: 225, y: 337, frame: 187, gesture: 'pointer', scale: 1, rotation: 0 },
    {
      x: 225,
      y: 337,
      frame: 190,
      gesture: 'click',
      scale: 1,
      rotation: 0,
      duration: 6,
    },
    // → My Store (invisible jump)
    { x: 225, y: 337, frame: 202, gesture: 'pointer', scale: 0, rotation: 0 },
    { x: 350, y: 600, frame: 213, gesture: 'pointer', scale: 0, rotation: 0 },
    { x: 350, y: 600, frame: 215, gesture: 'pointer', scale: 1, rotation: 0 },
    { x: 419, y: 827, frame: 229, gesture: 'pointer', scale: 1, rotation: 0 },
    {
      x: 419,
      y: 827,
      frame: 232,
      gesture: 'click',
      scale: 1,
      rotation: 0,
      duration: 6,
    },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {frame < 238 && (
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
      )}

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
            {/* Detail page — TWO segments to skip image-y SKIP_START..SKIP_END */}
            <div
              style={{
                position: 'absolute',
                top: detailTop,
                left: 0,
                width: 390,
                height: SKIP_START,
                overflow: 'hidden',
              }}
            >
              <Img
                src={staticFile('dorian/woodmart/lg-tv-detail.png')}
                style={{ width: 390, height: 'auto', display: 'block' }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                top: detailTop + SKIP_START,
                left: 0,
                width: 390,
                height: 8655 - SKIP_END,
                overflow: 'hidden',
              }}
            >
              <Img
                src={staticFile('dorian/woodmart/lg-tv-detail.png')}
                style={{
                  width: 390,
                  height: 'auto',
                  display: 'block',
                  marginTop: -SKIP_END,
                }}
              />
            </div>

            <StatusBar />
            <DynamicIsland />
            <DorianNavHeader showSearch={true} />

            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 100,
                background: COLORS.white,
                zIndex: 14,
              }}
            />

            {/* Add to Cart button */}
            <div
              style={{
                position: 'absolute',
                left: 16,
                right: 16,
                bottom: 24,
                zIndex: 15,
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
                  { label: 'My Store', highlight: true },
                  { label: 'Settings', highlight: false },
                ].map((item) => {
                  const isTarget = item.highlight;
                  const tappedNow = isTarget && myStoreClicked;
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

            {frame >= 238 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'white',
                  opacity: pageLoadVisible,
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: '4px solid #E2E8F0',
                    borderTopColor: COLORS.primary,
                    transform: `rotate(${pageLoadSpin}deg)`,
                    marginBottom: 16,
                  }}
                />
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.text,
                    fontFamily,
                  }}
                >
                  Opening My Store...
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: COLORS.textLight,
                    fontFamily,
                    marginTop: 4,
                  }}
                >
                  Powered by Dorian AI
                </div>
              </div>
            )}

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

      {/* Single FloatingHand mounted for entire scene — single Lottie load,
          scale:0 waypoints hide cursor between discrete click events. */}
      <FloatingHand
        path={handPath}
        startFrame={0}
        animation="cursor-real-black"
        size={120}
        dark={false}
        showRipple={true}
        rippleColor="rgba(45, 212, 191, 0.5)"
        physics={HAND_PHYSICS.scrollbar}
      />
    </AbsoluteFill>
  );
};
