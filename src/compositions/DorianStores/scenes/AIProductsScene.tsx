import React from 'react';
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  interpolate,
  spring,
  staticFile,
  useVideoConfig,
} from 'remotion';
import {
  COLORS,
  PHONE,
  HAND_PHYSICS,
  handSizeForZoom,
  SPRING_CONFIG,
} from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import {
  StatusBar,
  DynamicIsland,
  DorianNavHeader,
  AIBubble,
} from '../../../components/DorianPhone';
import { fontFamily } from '../../../lib/fonts';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { getSavedPath } from '../../SceneDirector/codedPaths';

// Product card that appears ajax-style
const ProductCard: React.FC<{
  name: string;
  price: string;
  color: string;
  delay: number;
  frame: number;
  fps: number;
  image: string;
}> = ({ name, price, color, delay, frame, fps, image }) => {
  const appear = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG.bouncy,
  });
  // Shimmer loading effect before card appears
  const isLoading = frame >= delay - 15 && frame < delay;

  if (isLoading) {
    return (
      <div
        style={{
          background: '#F1F5F9',
          borderRadius: 12,
          padding: 10,
          width: '100%',
        }}
      >
        <div
          style={{
            width: '100%',
            height: 100,
            background: '#E2E8F0',
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
        <div
          style={{
            width: '70%',
            height: 10,
            background: '#E2E8F0',
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <div
          style={{
            width: '40%',
            height: 10,
            background: '#E2E8F0',
            borderRadius: 4,
          }}
        />
      </div>
    );
  }

  if (frame < delay) return null;

  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 12,
        padding: 10,
        width: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: `1px solid ${COLORS.border}`,
        opacity: appear,
        transform: `scale(${appear}) translateY(${(1 - appear) * 20}px)`,
      }}
    >
      {/* Product image */}
      <Img
        src={staticFile(image)}
        style={{
          width: '100%',
          height: 100,
          objectFit: 'cover',
          borderRadius: 8,
          marginBottom: 8,
        }}
      />
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: COLORS.text,
          fontFamily,
          marginBottom: 4,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.primary,
          fontFamily,
        }}
      >
        {price}
      </div>
    </div>
  );
};

export const AIProductsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // User prompt text
  const promptText = 'Create a summer collection';
  const typedChars = Math.floor(
    interpolate(frame, [15, 60], [0, promptText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const typedPrompt = promptText.slice(0, typedChars);

  // Send at frame 70
  const sent = frame >= 70;

  // AI thinking dots
  const thinking = frame >= 75 && frame < 110;
  const thinkingDots = thinking
    ? Array.from(
        { length: 3 },
        (_, i) => Math.sin((frame - 75) * 0.25 - i * 1.2) * 3,
      )
    : [];

  // AI response
  const aiResponseText = "I've created 4 products for your summer collection:";
  const aiAppear = spring({
    frame: frame - 110,
    fps,
    config: SPRING_CONFIG.gentle,
  });
  const aiChars = Math.floor(
    interpolate(frame, [112, 140], [0, aiResponseText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  const scale = PHONE.displayScale;

  // Hand path: type prompt, then tap send
  const savedPath = getSavedPath('DorianStores', '3-AIProducts');
  const handPath: HandPathPoint[] = savedPath?.path ?? [
    { x: 540, y: 1500, frame: 5, gesture: 'pointer' as const },
    { x: 540, y: 1480, frame: 12, gesture: 'click' as const, duration: 8 },
    { x: 700, y: 1480, frame: 60, gesture: 'pointer' as const },
    { x: 700, y: 1480, frame: 68, gesture: 'click' as const, duration: 10 },
  ];

  // Products data
  const products = [
    { name: 'Breezy Linen Top', price: '$34.99', color: '#2DD4BF', delay: 145, image: 'dorian/stores/product-linen-top.jpg' },
    { name: 'Ocean Wave Shorts', price: '$29.99', color: '#3B82F6', delay: 160, image: 'dorian/stores/product-ocean-shorts.jpg' },
    { name: 'Sunset Maxi Dress', price: '$54.99', color: '#F97316', delay: 175, image: 'dorian/stores/product-maxi-dress.jpg' },
    { name: 'Palm Leaf Tote', price: '$24.99', color: '#22C55E', delay: 190, image: 'dorian/stores/product-tote-bag.jpg' },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Title overlay */}
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
          AI Product Creator
        </div>
      </AnimatedText>

      {/* Phone frame */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <div
          style={{
            width: PHONE.frameWidth,
            height: PHONE.frameHeight,
            background: '#1a1a1a',
            borderRadius: 55,
            padding: 12,
            boxShadow:
              '0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              width: PHONE.width,
              height: PHONE.height,
              borderRadius: 45,
              overflow: 'hidden',
              position: 'relative',
              background: COLORS.white,
            }}
          >
            {/* Content area */}
            <div
              style={{
                position: 'absolute',
                top: 148,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* AI Chat area */}
              <div
                style={{ flex: 1, padding: '12px 16px', overflow: 'hidden' }}
              >
                {/* Chat header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <AIBubble scale={0.6} />
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: COLORS.text,
                        fontFamily,
                      }}
                    >
                      Dorian AI
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: COLORS.primary,
                        fontFamily,
                      }}
                    >
                      Product Creator
                    </div>
                  </div>
                </div>

                {/* AI greeting */}
                <div
                  style={{
                    background: '#f0f0f0',
                    padding: '10px 14px',
                    borderRadius: '14px 14px 14px 4px',
                    maxWidth: '85%',
                    fontSize: 12,
                    color: COLORS.text,
                    fontFamily,
                    lineHeight: 1.4,
                    marginBottom: 10,
                  }}
                >
                  What kind of products would you like me to create for your
                  store?
                </div>

                {/* User message - appears after send */}
                {sent && (
                  <div
                    style={{
                      background: COLORS.primary,
                      padding: '10px 14px',
                      borderRadius: '14px 14px 4px 14px',
                      maxWidth: '80%',
                      marginLeft: 'auto',
                      fontSize: 12,
                      color: 'white',
                      fontFamily,
                      lineHeight: 1.4,
                      marginBottom: 10,
                    }}
                  >
                    {promptText}
                  </div>
                )}

                {/* AI thinking dots */}
                {thinking && (
                  <div
                    style={{
                      background: '#f0f0f0',
                      padding: '10px 14px',
                      borderRadius: '14px 14px 14px 4px',
                      width: 60,
                      display: 'flex',
                      gap: 4,
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    {thinkingDots.map((offset, i) => (
                      <div
                        key={i}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: COLORS.textLight,
                          transform: `translateY(${offset}px)`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* AI response + products */}
                {frame >= 110 && (
                  <div
                    style={{
                      opacity: aiAppear,
                      transform: `translateY(${(1 - aiAppear) * 15}px)`,
                    }}
                  >
                    <div
                      style={{
                        background: '#f0f0f0',
                        padding: '10px 14px',
                        borderRadius: '14px 14px 14px 4px',
                        maxWidth: '90%',
                        fontSize: 12,
                        color: COLORS.text,
                        fontFamily,
                        lineHeight: 1.4,
                        marginBottom: 10,
                      }}
                    >
                      {aiResponseText.slice(0, aiChars)}
                      {aiChars < aiResponseText.length && (
                        <span style={{ opacity: frame % 10 < 5 ? 1 : 0 }}>
                          |
                        </span>
                      )}
                    </div>

                    {/* Product cards - 2x2 grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 10,
                        paddingBottom: 8,
                      }}
                    >
                      {products.map((p, i) => (
                        <ProductCard
                          key={i}
                          name={p.name}
                          price={p.price}
                          color={p.color}
                          delay={p.delay}
                          frame={frame}
                          fps={fps}
                          image={p.image}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input field */}
              <div
                style={{
                  padding: '8px 16px 20px',
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    background: sent ? '#f5f5f5' : COLORS.white,
                    borderRadius: 18,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border:
                      !sent && frame >= 12
                        ? `2px solid ${COLORS.primary}`
                        : '2px solid #E2E8F0',
                  }}
                >
                  <span
                    style={{
                      color: !sent && typedChars > 0 ? COLORS.text : '#999',
                      fontSize: 12,
                      fontFamily,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {!sent
                      ? typedChars > 0
                        ? typedPrompt
                        : 'Describe products to create...'
                      : 'Describe products to create...'}
                    {!sent && frame >= 12 && (
                      <span
                        style={{
                          opacity: frame % 15 < 8 ? 1 : 0,
                          color: COLORS.text,
                        }}
                      >
                        |
                      </span>
                    )}
                  </span>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background:
                        !sent && typedChars > 15 ? COLORS.primary : '#ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: 'white', fontSize: 14 }}>
                      {'\u2192'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky header */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 148,
                zIndex: 20,
                background: COLORS.white,
              }}
            >
              <StatusBar />
              <DynamicIsland />
              <DorianNavHeader showSearch={false} />
            </div>

            {/* Home indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 140,
                height: 5,
                background: '#000',
                borderRadius: 3,
                zIndex: 15,
              }}
            />
          </div>
        </div>
      </div>

      {/* Hand cursor */}
      {frame >= 5 && frame < 80 && (
        <FloatingHand
          path={handPath}
          startFrame={0}
          animation={savedPath?.animation ?? 'cursor-real-black'}
          size={handSizeForZoom(scale)}
          dark={savedPath?.dark ?? true}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={HAND_PHYSICS.tapGentle}
        />
      )}
    </AbsoluteFill>
  );
};
