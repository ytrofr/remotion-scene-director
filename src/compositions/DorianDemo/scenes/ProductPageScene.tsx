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
import { COLORS, TEXT_CONTENT } from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import { getSavedPath } from '../../SceneDirector/codedPaths';
import { AIBubble } from '../../../components/DorianPhone/AIBubble';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { AIBubble as AIBubbleNew } from '../DorianPhoneMockup';
import { fontFamily } from '../../../lib/fonts';

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

  // Zoom out from chat to full phone view
  const zoomOutProgress = spring({
    frame,
    fps,
    config: { damping: 18, mass: 1, stiffness: 80 },
  });
  const zoomScale = interpolate(zoomOutProgress, [0, 1], [2.76, 1.8]);
  const zoomOffsetY = interpolate(zoomOutProgress, [0, 1], [-560, 0]);

  // Chat panel slides down and fades
  const chatSlide = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Loader phases
  const loaderIn = interpolate(frame, [30, 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const loaderOut = interpolate(frame, [95, 105], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const loaderVisible = Math.min(loaderIn, loaderOut);

  // Spinning animation for loader
  const spinDegrees = frame * 8;

  // LG TV listing fade in
  const listingIn = interpolate(frame, [95, 108], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scroll the listing page
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

  // Content area top (below nav header + search = ~130px)
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
              {frame < 108 && (
                <div
                  style={{
                    position: 'absolute',
                    top: -702,
                    left: 0,
                    width: 390,
                    opacity: 1 - listingIn,
                  }}
                >
                  {/* Home screen */}
                  <div style={{ position: 'relative', marginLeft: -5 }}>
                    <Img
                      src={staticFile('dorian/woodmart/home-mobile.png')}
                      style={{
                        width: 390 + 52,
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 55,
                        background: '#fff',
                      }}
                    />
                  </div>
                  {/* Categories with products */}
                  <div
                    style={{
                      position: 'relative',
                      marginLeft: -5,
                      marginTop: -70,
                    }}
                  >
                    <Img
                      src={staticFile(
                        'dorian/woodmart/categories-mobile-2.png',
                      )}
                      style={{
                        width: 390 + 12,
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 50,
                        background: '#fff',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Layer 2: Dorian branded loader (inside phone content area, below nav header) */}
              {frame >= 30 && frame < 110 && (
                <div
                  style={{
                    position: 'absolute',
                    top: contentTop,
                    left: 0,
                    right: 0,
                    bottom: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    opacity: loaderVisible,
                    zIndex: 3,
                  }}
                >
                  {/* Teal spinner */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      border: '4px solid #E2E8F0',
                      borderTopColor: COLORS.primary,
                      transform: `rotate(${spinDegrees}deg)`,
                      marginBottom: 16,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.text,
                      fontFamily,
                      marginBottom: 4,
                    }}
                  >
                    Finding your products...
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: COLORS.textLight,
                      fontFamily,
                    }}
                  >
                    Powered by Dorian AI
                  </div>
                </div>
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
                <div
                  style={{
                    position: 'absolute',
                    bottom: 60 - chatSlide * 350,
                    left: 0,
                    right: 0,
                    height: chatHeight,
                    background: 'white',
                    borderRadius: '24px 24px 0 0',
                    boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
                    padding: '15px 16px',
                    fontFamily,
                    overflow: 'hidden',
                    opacity: 1 - chatSlide,
                    zIndex: 4,
                  }}
                >
                  {/* Chat header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <AIBubble scale={0.5} />
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 12,
                          color: COLORS.text,
                        }}
                      >
                        Dorian
                      </div>
                      <div style={{ fontSize: 9, color: COLORS.primary }}>
                        Your AI Assistant
                      </div>
                    </div>
                  </div>

                  {/* AI greeting */}
                  <div
                    style={{
                      background: '#f0f0f0',
                      padding: '6px 10px',
                      borderRadius: '12px 12px 12px 4px',
                      maxWidth: '85%',
                      fontSize: 10,
                      color: COLORS.text,
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    Hi! How can I help you today?
                  </div>

                  {/* User message */}
                  <div
                    style={{
                      background: COLORS.primary,
                      padding: '6px 10px',
                      borderRadius: '12px 12px 4px 12px',
                      maxWidth: '80%',
                      marginLeft: 'auto',
                      fontSize: 10,
                      color: 'white',
                      lineHeight: 1.3,
                      marginBottom: 6,
                    }}
                  >
                    {message}
                  </div>

                  {/* AI Response (fully revealed) */}
                  <div
                    style={{
                      background: '#f0f0f0',
                      padding: '6px 10px',
                      borderRadius: '12px 12px 12px 4px',
                      maxWidth: '90%',
                      fontSize: 10,
                      color: COLORS.text,
                      lineHeight: 1.3,
                      marginBottom: 6,
                    }}
                  >
                    {aiMessage}
                  </div>

                  {/* View Products button (tapped state) */}
                  <div
                    style={{
                      background: COLORS.primaryDark,
                      padding: '8px 16px',
                      borderRadius: 16,
                      textAlign: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'white',
                      maxWidth: '60%',
                    }}
                  >
                    View Products {'\u2192'}
                  </div>

                  {/* Input field */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 12,
                      right: 12,
                      background: '#f5f5f5',
                      borderRadius: 18,
                      padding: '7px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '2px solid transparent',
                    }}
                  >
                    <span style={{ color: '#999', fontSize: 10 }}>
                      Type a message...
                    </span>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: 'white', fontSize: 12 }}>
                        {'\u2192'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Bar (always visible) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 50,
                  background: 'white',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  padding: '0 25px 5px 25px',
                  zIndex: 5,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>
                  10:45
                </span>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <svg width="18" height="12" viewBox="0 0 18 12">
                    <rect x="0" y="8" width="3" height="4" fill="#000" />
                    <rect x="5" y="5" width="3" height="7" fill="#000" />
                    <rect x="10" y="2" width="3" height="10" fill="#000" />
                    <rect x="15" y="0" width="3" height="12" fill="#000" />
                  </svg>
                  <div
                    style={{
                      width: 25,
                      height: 12,
                      border: '1px solid #000',
                      borderRadius: 3,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        right: -4,
                        top: 3,
                        width: 2,
                        height: 6,
                        background: '#000',
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: 2,
                        top: 2,
                        right: 4,
                        bottom: 2,
                        background: '#000',
                        borderRadius: 1,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Island */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 125,
                  height: 35,
                  background: '#1a1a1a',
                  borderRadius: 20,
                  zIndex: 6,
                }}
              />

              {/* Dorian Nav Header - stays throughout */}
              <div
                style={{
                  position: 'absolute',
                  top: 50,
                  left: 0,
                  right: 0,
                  background: 'white',
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 20px',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 2,
                        background: '#1E293B',
                        borderRadius: 1,
                      }}
                    />
                    <div
                      style={{
                        width: 22,
                        height: 2,
                        background: '#1E293B',
                        borderRadius: 1,
                      }}
                    />
                    <div
                      style={{
                        width: 16,
                        height: 2,
                        background: '#1E293B',
                        borderRadius: 1,
                      }}
                    />
                  </div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background:
                          'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          border: '2.5px solid white',
                          borderRightColor: 'transparent',
                          transform: 'rotate(-45deg)',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#2DD4BF',
                        fontFamily,
                        letterSpacing: 0.5,
                      }}
                    >
                      DORIAN
                    </span>
                  </div>
                  <div style={{ position: 'absolute', right: 20 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="8"
                        r="4"
                        stroke="#1E293B"
                        strokeWidth="2"
                      />
                      <path
                        d="M4 20c0-4 4-6 8-6s8 2 8 6"
                        stroke="#1E293B"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div
                  style={{ padding: '4px 16px 12px 16px', background: '#fff' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F1F5F9',
                      borderRadius: 25,
                      padding: '10px 16px',
                      gap: 10,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                        stroke="#64748B"
                        strokeWidth="2"
                      />
                      <path
                        d="M16 16l4 4"
                        stroke="#64748B"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      style={{ color: '#94A3B8', fontSize: 14, fontFamily }}
                    >
                      Search for products
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Assistant Bubble */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 70,
                  right: 15,
                  zIndex: 20,
                }}
              >
                <AIBubbleNew scale={1} pulse={true} />
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
          size={140}
          dark={savedScroll?.dark ?? true}
          showRipple={false}
          physics={{
            floatAmplitude: 0,
            floatSpeed: 0,
            velocityScale: 0.1,
            maxRotation: 5,
            shadowEnabled: true,
            shadowDistance: 8,
            shadowBlur: 10,
            smoothing: 0.2,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
