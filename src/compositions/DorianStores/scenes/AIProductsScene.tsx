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

  // Zoom system: zoom in when input tapped, zoom out when products appear
  const zoomInProgress = spring({
    frame: frame - 12,
    fps,
    config: SPRING_CONFIG.zoom,
  });
  const zoomInScale = interpolate(zoomInProgress, [0, 1], [1.8, 2.6]);
  const zoomInOffsetY = interpolate(zoomInProgress, [0, 1], [0, -350]);

  const zoomOutProgress = spring({
    frame: frame - 140,
    fps,
    config: SPRING_CONFIG.zoom,
  });
  const finalZoomScale = interpolate(
    zoomOutProgress,
    [0, 1],
    [zoomInScale, 1.8],
  );
  const finalZoomOffsetY = interpolate(
    zoomOutProgress,
    [0, 1],
    [zoomInOffsetY, 0],
  );

  const handSize = handSizeForZoom(finalZoomScale);

  // Hand path: type prompt, then tap send
  // Zoomed (S=2.6, O=-350): input at phone (207,826) → comp (540, 1630)
  //   send btn at phone (365,826) → comp (951, 1630)
  const savedPath = getSavedPath('DorianStores', '3-AIProducts');
  const handPath: HandPathPoint[] = savedPath?.path ?? [
    { x: 540, y: 1700, frame: 5, gesture: 'pointer' as const, scale: 1 },
    { x: 540, y: 1630, frame: 10, gesture: 'pointer' as const, scale: 1 },
    { x: 540, y: 1630, frame: 12, gesture: 'click' as const, scale: 1, duration: 8 },
    // Stay near input during typing
    { x: 540, y: 1630, frame: 55, gesture: 'pointer' as const, scale: 1 },
    // Move to send button
    { x: 750, y: 1630, frame: 62, gesture: 'pointer' as const, scale: 1 },
    { x: 951, y: 1630, frame: 68, gesture: 'pointer' as const, scale: 1 },
    { x: 951, y: 1630, frame: 70, gesture: 'click' as const, scale: 1, duration: 10 },
    { x: 850, y: 1700, frame: 85, gesture: 'pointer' as const, scale: 1 },
  ];

  // Second hand: click "Add Products to Store" button
  // Post-zoom (S=1.8, O=0): button centered at phone (207,760) → comp (540, 1547)
  const handPath2: HandPathPoint[] = [
    { x: 540, y: 1400, frame: 210, gesture: 'pointer' as const, scale: 1 },
    { x: 540, y: 1500, frame: 218, gesture: 'pointer' as const, scale: 1 },
    { x: 540, y: 1547, frame: 225, gesture: 'pointer' as const, scale: 1 },
    { x: 540, y: 1547, frame: 228, gesture: 'click' as const, scale: 1, duration: 10 },
  ];

  // "Add Products to Store" button spring
  const addBtnAppear = spring({
    frame: frame - 210,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  // Crossfade: chat fades out, store fades in
  const chatFadeOut = interpolate(frame, [235, 250], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const storeFadeIn = interpolate(frame, [240, 255], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Store page products
  const storeProducts = [
    {
      name: 'Classic Watch',
      price: '$89.99',
      image: 'dorian/stores/product-tote-bag.jpg',
      isNew: false,
    },
    {
      name: 'Running Shoes',
      price: '$65.00',
      image: 'dorian/stores/product-ocean-shorts.jpg',
      isNew: false,
    },
    {
      name: 'Desk Lamp',
      price: '$42.00',
      image: 'dorian/stores/product-linen-top.jpg',
      isNew: false,
    },
    {
      name: 'Phone Case',
      price: '$19.99',
      image: 'dorian/stores/product-maxi-dress.jpg',
      isNew: false,
    },
    {
      name: 'Breezy Linen Top',
      price: '$34.99',
      image: 'dorian/stores/product-linen-top.jpg',
      isNew: true,
    },
    {
      name: 'Ocean Wave Shorts',
      price: '$29.99',
      image: 'dorian/stores/product-ocean-shorts.jpg',
      isNew: true,
    },
    {
      name: 'Sunset Maxi Dress',
      price: '$54.99',
      image: 'dorian/stores/product-maxi-dress.jpg',
      isNew: true,
    },
    {
      name: 'Palm Leaf Tote',
      price: '$24.99',
      image: 'dorian/stores/product-tote-bag.jpg',
      isNew: true,
    },
  ];
  const newProductDelays = [248, 252, 256, 260];

  // Products data
  const products = [
    {
      name: 'Breezy Linen Top',
      price: '$34.99',
      color: '#2DD4BF',
      delay: 145,
      image: 'dorian/stores/product-linen-top.jpg',
    },
    {
      name: 'Ocean Wave Shorts',
      price: '$29.99',
      color: '#3B82F6',
      delay: 160,
      image: 'dorian/stores/product-ocean-shorts.jpg',
    },
    {
      name: 'Sunset Maxi Dress',
      price: '$54.99',
      color: '#F97316',
      delay: 175,
      image: 'dorian/stores/product-maxi-dress.jpg',
    },
    {
      name: 'Palm Leaf Tote',
      price: '$24.99',
      color: '#22C55E',
      delay: 190,
      image: 'dorian/stores/product-tote-bag.jpg',
    },
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

      {/* Phone frame — two-nested-div zoom system */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(0px, ${finalZoomOffsetY}px)`,
        }}
      >
        <div
          style={{
            transform: `translate(-50%, -50%) scale(${finalZoomScale})`,
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
              {/* Content area — crossfade wrapper */}
              <div
                style={{
                  position: 'absolute',
                  top: 148,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                {/* Chat UI (fades out at frame 235) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: chatFadeOut,
                  }}
                >
                  {/* AI Chat area */}
                  <div
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      overflow: 'hidden',
                    }}
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

                        {/* Add Products to Store button */}
                        {frame >= 210 && (
                          <div
                            style={{
                              background: COLORS.primary,
                              borderRadius: 14,
                              padding: 12,
                              textAlign: 'center',
                              opacity: addBtnAppear,
                              transform: `scale(${addBtnAppear}) translateY(${(1 - addBtnAppear) * 15}px)`,
                              marginTop: 4,
                            }}
                          >
                            <span
                              style={{
                                color: 'white',
                                fontSize: 13,
                                fontWeight: 700,
                                fontFamily,
                              }}
                            >
                              Add Products to Store
                            </span>
                          </div>
                        )}
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

                {/* Store page (fades in at frame 240) */}
                {frame >= 240 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: storeFadeIn,
                      background: COLORS.white,
                      padding: '16px 16px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: COLORS.text,
                        fontFamily,
                        marginBottom: 4,
                      }}
                    >
                      Your Store
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: COLORS.textLight,
                        fontFamily,
                        marginBottom: 14,
                      }}
                    >
                      8 products
                    </div>

                    {/* 2x4 product grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 10,
                      }}
                    >
                      {storeProducts.map((sp, i) => {
                        const isNewItem = sp.isNew;
                        const newIdx = isNewItem ? i - 4 : -1;
                        const delay = isNewItem ? newProductDelays[newIdx] : 0;
                        const itemAppear = isNewItem
                          ? spring({
                              frame: frame - delay,
                              fps,
                              config: SPRING_CONFIG.bouncy,
                            })
                          : 1;

                        return (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              background: COLORS.white,
                              borderRadius: 10,
                              padding: 8,
                              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                              border: `1px solid ${COLORS.border}`,
                              position: 'relative',
                              opacity: itemAppear,
                              transform: `scale(${itemAppear})`,
                            }}
                          >
                            {/* NEW badge */}
                            {isNewItem && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 6,
                                  right: 6,
                                  background: COLORS.primary,
                                  color: 'white',
                                  fontSize: 8,
                                  fontWeight: 700,
                                  fontFamily,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  zIndex: 2,
                                }}
                              >
                                NEW
                              </div>
                            )}
                            <Img
                              src={staticFile(sp.image)}
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: 'cover',
                                borderRadius: 8,
                                marginBottom: 6,
                              }}
                            />
                            <div
                              style={{
                                fontSize: 10,
                                color: COLORS.text,
                                fontFamily,
                                textAlign: 'center',
                                marginBottom: 2,
                              }}
                            >
                              {sp.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: COLORS.text,
                                fontFamily,
                              }}
                            >
                              {sp.price}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
      </div>

      {/* Primary hand: type prompt + tap send (frames 5-85) */}
      {frame >= 5 && frame < 85 && (
        <FloatingHand
          path={handPath}
          startFrame={0}
          animation={savedPath?.animation ?? 'cursor-real-black'}
          size={handSize}
          dark={savedPath?.dark ?? false}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={HAND_PHYSICS.tapGentle}
        />
      )}

      {/* Second hand: click "Add Products to Store" button (frames 210-245) */}
      {frame >= 210 && frame < 245 && (
        <FloatingHand
          path={handPath2}
          startFrame={0}
          animation="cursor-real-black"
          size={handSizeForZoom(1.8)}
          dark={false}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={HAND_PHYSICS.tapGentle}
        />
      )}
    </AbsoluteFill>
  );
};
