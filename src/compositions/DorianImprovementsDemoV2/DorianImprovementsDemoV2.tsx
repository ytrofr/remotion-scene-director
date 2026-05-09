import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { Trail } from '@remotion/motion-blur';
import { fontFamily } from '../../lib/fonts';
import { FloatingHand } from '../../components/FloatingHand';
import { HandPathPoint } from '../../components/FloatingHand/types';

// DorianImprovementsDemoV2 — 36s sample-platter showcasing 12 patterns (⑤-⑯).
// Each demo is 3s (90 frames) with a title card explaining what's on screen.

const DEMO_FRAMES = 90;
export const DORIAN_IMPROVEMENTS_V2_TOTAL = DEMO_FRAMES * 12;

// Shared coords (composition space, 1080×1920)
const PHONE_CENTER_X = 540;
const PHONE_CENTER_Y = 960;
const PHONE_W = 414;
const PHONE_H = 868;
const PHONE_LEFT = PHONE_CENTER_X - PHONE_W / 2;
const PHONE_TOP = PHONE_CENTER_Y - PHONE_H / 2;
const CTA_X = 540;
const CTA_Y = 1290;
const ENTRY_X = 760;
const ENTRY_Y = 700;

const STAGE_BG = '#0f172a';
const TEAL = '#2DD4BF';

const STD_PHYSICS = {
  smoothing: 0.05,
  velocityScale: 0,
  maxRotation: 0,
  floatAmplitude: 0,
  floatSpeed: 0,
  shadowEnabled: true,
  shadowDistance: 6,
  shadowBlur: 8,
};

// ─── Shared product card (used by most demos) ───
const ProductCard: React.FC<{
  hideButton?: boolean;
  buttonGlow?: number;
  showAddedChip?: boolean;
  addedChipScale?: number;
  pieceReveal?: number; // 0-1 for build-reveal staggered fade
  colorSwatchProgress?: number; // 0-1 for color swatches demo
  highlightCTA?: boolean;
  // for swipe demo
  scrollY?: number;
}> = ({
  hideButton = false,
  buttonGlow = 0,
  showAddedChip = false,
  addedChipScale = 0,
  pieceReveal = 1,
  colorSwatchProgress = 0,
  highlightCTA = false,
  scrollY = 0,
}) => {
  const fade = (delay: number) =>
    Math.max(0, Math.min(1, (pieceReveal - delay) * 4));

  return (
    <>
      {/* Phone bezel */}
      <div
        style={{
          position: 'absolute',
          left: PHONE_LEFT - 12,
          top: PHONE_TOP - 12,
          width: PHONE_W + 24,
          height: PHONE_H + 24,
          background: '#1a1a1a',
          borderRadius: 55,
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        }}
      />
      {/* Phone screen */}
      <div
        style={{
          position: 'absolute',
          left: PHONE_LEFT,
          top: PHONE_TOP,
          width: PHONE_W,
          height: PHONE_H,
          background: '#ffffff',
          borderRadius: 45,
          overflow: 'hidden',
          fontFamily,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            color: '#1E293B',
            fontSize: 14,
            fontWeight: 600,
            opacity: fade(0.0),
          }}
        >
          <span>10:45</span>
          <span style={{ fontSize: 12, opacity: 0.7 }}>●●●● ▮▮</span>
        </div>
        {/* Brand header */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f1f5f9',
            color: '#1E293B',
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 2,
            opacity: fade(0.1),
          }}
        >
          DORIAN
        </div>

        {/* Scrollable content area */}
        <div
          style={{
            transform: `translateY(${-scrollY}px)`,
            transition: 'none',
          }}
        >
          {/* Product image area */}
          <div
            style={{
              margin: '20px 24px 16px',
              height: 320,
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: fade(0.25),
              transform: `scale(${0.92 + 0.08 * fade(0.25)})`,
            }}
          >
            <div
              style={{
                width: 220,
                height: 140,
                background: '#0f172a',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: TEAL,
                fontSize: 32,
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(15,23,42,0.2)',
              }}
            >
              LG
            </div>
          </div>

          {/* Product info */}
          <div style={{ padding: '0 24px', opacity: fade(0.4) }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: TEAL,
                letterSpacing: 1.5,
                marginBottom: 6,
              }}
            >
              LG ELECTRONICS
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#1E293B',
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              55" OLED 4K Smart TV
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#1E293B' }}>
                $1,299
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: '#94a3b8',
                  textDecoration: 'line-through',
                }}
              >
                $1,599
              </span>
            </div>
          </div>

          {/* Color swatch panel (only when colorSwatchProgress > 0) */}
          {colorSwatchProgress > 0 && (
            <div
              style={{
                margin: '20px 24px 0',
                display: 'flex',
                gap: 12,
                opacity: colorSwatchProgress,
              }}
            >
              {['#2DD4BF', '#3B82F6', '#8B5CF6', '#EC4899'].map((c, i) => {
                const t = Math.max(0, Math.min(1, colorSwatchProgress * 4 - i));
                return (
                  <div
                    key={c}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: c,
                      transform: `scale(${0.4 + 0.6 * t})`,
                      opacity: t,
                      boxShadow:
                        i === 0
                          ? `0 0 0 4px ${c}40`
                          : '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Below-fold scrollable content (for swipe demo) */}
          <div style={{ padding: '24px', opacity: fade(0.5) }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  marginBottom: 16,
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    background: '#e2e8f0',
                    borderRadius: 8,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#1E293B',
                    }}
                  >
                    Product {i}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    ${(199 + i * 100).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add to Cart button — fixed at bottom (not scrollable) */}
        {!hideButton && (
          <div
            style={{
              position: 'absolute',
              left: 24,
              right: 24,
              bottom: 40,
              height: 60,
              background: TEAL,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 0.5,
              boxShadow: highlightCTA
                ? `0 0 0 ${4 + 6 * buttonGlow}px rgba(45,212,191,${0.3 * buttonGlow}), 0 8px 20px rgba(45,212,191,0.45)`
                : '0 8px 20px rgba(45,212,191,0.35)',
              transform: `scale(${1 + 0.04 * buttonGlow})`,
              opacity: fade(0.55),
            }}
          >
            ADD TO CART
          </div>
        )}

        {/* "Added!" confirmation chip */}
        {showAddedChip && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 120,
              transform: `translate(-50%, 0) scale(${addedChipScale})`,
              padding: '12px 24px',
              background: '#10b981',
              color: '#ffffff',
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 800,
              boxShadow: '0 8px 20px rgba(16,185,129,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>✓</span>
            <span>Added to Cart</span>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Title card (top of frame) ───
const TitleCard: React.FC<{
  number: string;
  title: string;
  subtitle: string;
}> = ({ number, title, subtitle }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [DEMO_FRAMES - 15, DEMO_FRAMES], [1, 0], {
    extrapolateLeft: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);
  const slideY = interpolate(frame, [0, 12], [20, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 80,
        width: '100%',
        textAlign: 'center',
        opacity,
        transform: `translateY(${slideY}px)`,
        fontFamily,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: TEAL,
          letterSpacing: 4,
          marginBottom: 12,
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: -1,
          marginBottom: 10,
          padding: '0 60px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: '#94a3b8',
          padding: '0 80px',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

// ─── Stage wrapper ───
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: STAGE_BG }}>{children}</AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════
// ⑤ Hover-pulse pre-click — cursor pulses on the button before clicking
// ═══════════════════════════════════════════════════════════
const Demo5HoverPulse: React.FC = () => {
  const frame = useCurrentFrame();
  // Glow ramps up when cursor is on button (frames 50-72)
  const glow = interpolate(frame, [50, 60, 72, 80], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const path: HandPathPoint[] = [
    { x: ENTRY_X, y: ENTRY_Y, frame: 10, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 50, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 75, gesture: 'click', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 85, gesture: 'click', scale: 0 },
  ];
  return (
    <Stage>
      <ProductCard buttonGlow={glow} highlightCTA />
      <FloatingHand
        path={path}
        animation="cursor-real-anim-black-hover-pulse"
        size={50}
        dark={false}
        physics={STD_PHYSICS}
      />
      <TitleCard
        number="⑤"
        title="Hover-pulse pre-click"
        subtitle="cursor + button pulse together — telegraphs intent"
      />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════
// ⑥ Click-burst on big CTA — punchier impact on the BIG action
// ═══════════════════════════════════════════════════════════
const Demo6ClickBurst: React.FC = () => {
  const path: HandPathPoint[] = [
    { x: ENTRY_X, y: ENTRY_Y, frame: 10, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 60, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 70, gesture: 'click', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 88, gesture: 'click', scale: 0 },
  ];
  return (
    <Stage>
      <ProductCard />
      <FloatingHand
        path={path}
        animation="cursor-real-black"
        clickAnimation="cursor-real-anim-black-click-burst"
        size={120}
        dark={false}
        physics={STD_PHYSICS}
      />
      <TitleCard
        number="⑥"
        title="Click-burst on the big CTA"
        subtitle="punchy radial burst — reserve for hero actions"
      />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════
// ⑦ Swipe gesture for scroll — phone-native vs desktop scrollbar
// ═══════════════════════════════════════════════════════════
const Demo7Swipe: React.FC = () => {
  const frame = useCurrentFrame();
  const scrollY = interpolate(frame, [25, 75], [0, 280], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  // Hand swipes up: starts at lower-middle, ends at upper-middle
  const path: HandPathPoint[] = [
    { x: 540, y: 1300, frame: 15, gesture: 'pointer', scale: 1 },
    { x: 540, y: 1300, frame: 25, gesture: 'drag', scale: 1 },
    { x: 540, y: 900, frame: 75, gesture: 'drag', scale: 1 },
    { x: 540, y: 900, frame: 88, gesture: 'pointer', scale: 0 },
  ];
  return (
    <Stage>
      <ProductCard hideButton scrollY={scrollY} />
      <FloatingHand
        path={path}
        animation="hand-swipe-up"
        size={140}
        dark={false}
        physics={STD_PHYSICS}
      />
      <TitleCard
        number="⑦"
        title="Swipe gesture for scroll"
        subtitle="phone-native thumb swipe — content tracks the gesture"
      />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════
// ⑧ Pinch-zoom on hero image — tactile mobile zoom
// ═══════════════════════════════════════════════════════════
const Demo8Pinch: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [25, 75], [1, 1.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const path: HandPathPoint[] = [
    { x: 540, y: 880, frame: 15, gesture: 'pointer', scale: 1 },
    { x: 540, y: 880, frame: 25, gesture: 'open', scale: 1 },
    { x: 540, y: 880, frame: 75, gesture: 'open', scale: 1 },
    { x: 540, y: 880, frame: 88, gesture: 'pointer', scale: 0 },
  ];
  return (
    <Stage>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          transform: `translate(${PHONE_CENTER_X}px, ${PHONE_CENTER_Y - 100}px) scale(${zoom}) translate(${-PHONE_CENTER_X}px, ${-PHONE_CENTER_Y + 100}px)`,
          transformOrigin: '0 0',
        }}
      >
        <ProductCard hideButton />
      </div>
      <FloatingHand
        path={path}
        animation="hand-pinch"
        size={180}
        dark={false}
        physics={STD_PHYSICS}
      />
      <TitleCard
        number="⑧"
        title="Pinch-zoom on hero image"
        subtitle="tactile mobile gesture for product detail"
      />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════
// ⑨ Cursor wobble during AI thinking — fills the silent moment
// ═══════════════════════════════════════════════════════════
const Demo9Wobble: React.FC = () => {
  const frame = useCurrentFrame();
  const dot1 = (frame / 8) % 3;
  // Path stays still — cursor's own wobble Lottie animates it
  const path: HandPathPoint[] = [
    { x: 540, y: 1100, frame: 10, gesture: 'pointer', scale: 1 },
    { x: 540, y: 1100, frame: 80, gesture: 'pointer', scale: 1 },
    { x: 540, y: 1100, frame: 88, gesture: 'pointer', scale: 0 },
  ];
  return (
    <Stage>
      <div
        style={{
          position: 'absolute',
          left: PHONE_LEFT - 12,
          top: PHONE_TOP - 12,
          width: PHONE_W + 24,
          height: PHONE_H + 24,
          background: '#1a1a1a',
          borderRadius: 55,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: PHONE_LEFT,
          top: PHONE_TOP,
          width: PHONE_W,
          height: PHONE_H,
          background: '#0f172a',
          borderRadius: 45,
          fontFamily,
          padding: 24,
        }}
      >
        <div
          style={{
            color: TEAL,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 24,
          }}
        >
          DORIAN AI
        </div>
        <div
          style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: 16,
            color: '#94a3b8',
            fontSize: 16,
            marginBottom: 16,
          }}
        >
          What's the best 4K TV under $1,500?
        </div>
        <div
          style={{
            background: 'rgba(45,212,191,0.15)',
            borderRadius: 16,
            padding: 16,
            color: '#cbd5e1',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span>Thinking</span>
          <span style={{ display: 'inline-flex', gap: 4 }}>
            <span style={{ opacity: dot1 >= 0 ? 1 : 0.3 }}>•</span>
            <span style={{ opacity: dot1 >= 1 ? 1 : 0.3 }}>•</span>
            <span style={{ opacity: dot1 >= 2 ? 1 : 0.3 }}>•</span>
          </span>
        </div>
      </div>
      <FloatingHand
        path={path}
        animation="cursor-real-anim-black-wobble"
        size={50}
        dark={false}
        physics={STD_PHYSICS}
      />
      <TitleCard
        number="⑨"
        title="Cursor wobble while AI thinks"
        subtitle="idle wobble fills the silent wait — cursor stays alive"
      />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════
// ⑩ Double-click to open detail — distinct from single click
// ═══════════════════════════════════════════════════════════
const Demo10DoubleClick: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Detail panel springs open after double-click at frame 70
  const openSpring = spring({
    frame: frame - 70,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const path: HandPathPoint[] = [
    { x: ENTRY_X, y: ENTRY_Y, frame: 10, gesture: 'pointer', scale: 1 },
    { x: 540, y: 880, frame: 55, gesture: 'pointer', scale: 1 },
    { x: 540, y: 880, frame: 65, gesture: 'click', scale: 1 },
    { x: 540, y: 880, frame: 88, gesture: 'click', scale: 0 },
  ];
  return (
    <Stage>
      <ProductCard hideButton />
      {/* Detail panel slides up from bottom on double-click */}
      <div
        style={{
          position: 'absolute',
          left: PHONE_LEFT,
          right: '50%',
          top: PHONE_TOP + 200,
          width: PHONE_W,
          height: 580,
          background: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 -20px 40px rgba(0,0,0,0.2)',
          transform: `translateY(${interpolate(openSpring, [0, 1], [600, 0])}px)`,
          padding: 24,
          fontFamily,
        }}
      >
        <div
          style={{
            width: 60,
            height: 4,
            background: '#cbd5e1',
            borderRadius: 4,
            margin: '0 auto 24px',
          }}
        />
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#1E293B',
            marginBottom: 12,
          }}
        >
          Product details
        </div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
          OLED · 4K HDR · Smart Apps · Voice Remote · Wi-Fi 6 · Dolby Vision
        </div>
      </div>
      <FloatingHand
        path={path}
        animation="cursor-real-black"
        clickAnimation="cursor-real-anim-black-dblclick"
        size={100}
        dark={false}
        physics={STD_PHYSICS}
      />
      <TitleCard
        number="⑩"
        title="Double-click to open detail"
        subtitle="distinct from single tap — narrates 'opening'"
      />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════
// ⑪ Annotation arrow + caption — narrate UI without voiceover
// ═══════════════════════════════════════════════════════════
const Demo11Annotation: React.FC = () => {
  const frame = useCurrentFrame();
  const arrowFade = interpolate(frame, [40, 55, 75, 88], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const path: HandPathPoint[] = [
    { x: ENTRY_X, y: ENTRY_Y, frame: 10, gesture: 'pointer', scale: 1 },
    { x: CTA_X + 60, y: CTA_Y, frame: 50, gesture: 'pointer', scale: 1 },
    { x: CTA_X + 60, y: CTA_Y, frame: 88, gesture: 'pointer', scale: 1 },
  ];
  return (
    <Stage>
      <ProductCard />
      {/* Annotation: arrow + label pointing at the CTA */}
      <div
        style={{
          position: 'absolute',
          left: 760,
          top: CTA_Y - 30,
          opacity: arrowFade,
          transform: `translateX(${interpolate(arrowFade, [0, 1], [-30, 0])}px)`,
          fontFamily,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Wavy arrow pointing left */}
        <svg width="80" height="60" viewBox="0 0 80 60">
          <path
            d="M 75 30 Q 50 50, 25 25 Q 18 18, 10 30"
            stroke="#fbbf24"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 10 30 L 20 24 M 10 30 L 20 36"
            stroke="#fbbf24"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            background: '#fbbf24',
            color: '#0f172a',
            padding: '10px 18px',
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            transform: 'rotate(-3deg)',
            boxShadow: '0 4px 12px rgba(251,191,36,0.4)',
          }}
        >
          Tap to buy!
        </div>
      </div>
      <FloatingHand
        path={path}
        animation="cursor-real-black"
        size={50}
        dark={false}
        physics={STD_PHYSICS}
      />
      <TitleCard
        number="⑪"
        title="Annotation arrow + caption"
        subtitle="hand-drawn callouts narrate features without voiceover"
      />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════
// ⑫ Scene-build reveal — UI assembles piece by piece
// ═══════════════════════════════════════════════════════════
const Demo12BuildReveal: React.FC = () => {
  const frame = useCurrentFrame();
  // Reveal progresses 0→1 over frames 5-50
  const reveal = interpolate(frame, [5, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <Stage>
      <ProductCard pieceReveal={reveal} />
      <TitleCard
        number="⑫"
        title="Scene-build reveal"
        subtitle="status bar → header → image → text → CTA, staggered"
      />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════
// ⑬ Color swatches — animated brand customization
// ═══════════════════════════════════════════════════════════
const Demo13ColorSwatches: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [15, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <Stage>
      <ProductCard hideButton colorSwatchProgress={progress} />
      <TitleCard
        number="⑬"
        title="Color swatches reveal"
        subtitle="theme tiles spring in — same trick for fonts, sizes, presets"
      />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════
// ⑭ Result chip — confirmation pops in after click
// ═══════════════════════════════════════════════════════════
const Demo14ResultChip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showChip = frame >= 65;
  const chipScale = spring({
    frame: frame - 65,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const chipFade = interpolate(frame, [85, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const path: HandPathPoint[] = [
    { x: ENTRY_X, y: ENTRY_Y, frame: 10, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 55, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 62, gesture: 'click', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 85, gesture: 'click', scale: 0 },
  ];
  return (
    <Stage>
      <ProductCard
        showAddedChip={showChip}
        addedChipScale={chipScale * chipFade}
      />
      <FloatingHand
        path={path}
        animation="cursor-real-black"
        clickAnimation="cursor-real-anim-black-click-burst-soft"
        size={50}
        dark={false}
        physics={STD_PHYSICS}
      />
      <TitleCard
        number="⑭"
        title="Result chip pops after click"
        subtitle="confirms the action — '✓ Added to Cart' springs in"
      />
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════
// ⑮ Cursor motion-blur trail — subtle blur on fast moves
// ═══════════════════════════════════════════════════════════
const Demo15MotionBlur: React.FC = () => {
  // Fast diagonal sweep across the frame so the trail is visible
  const path: HandPathPoint[] = [
    { x: 200, y: 600, frame: 10, gesture: 'pointer', scale: 1 },
    { x: 880, y: 1400, frame: 35, gesture: 'pointer', scale: 1 },
    { x: 200, y: 1400, frame: 55, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 75, gesture: 'click', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 88, gesture: 'click', scale: 0 },
  ];
  return (
    <Stage>
      <ProductCard />
      <Trail layers={6} lagInFrames={2} trailOpacity={0.3}>
        <FloatingHand
          path={path}
          animation="cursor-real-black"
          size={50}
          dark={false}
          physics={STD_PHYSICS}
        />
      </Trail>
      <TitleCard
        number="⑮"
        title="Cursor motion-blur trail"
        subtitle="6 ghost layers @ 0.3 opacity — fast moves feel less mechanical"
      />
    </Stage>
  );
};

// CSS-based light-leak (swiftshader-safe): warm radial bloom + white flash
// sweeping across the frame. Fades in 0-50% then out 50-100% of duration.
const CSSLightLeak: React.FC<{ from: number; duration: number }> = ({
  from,
  duration,
}) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  if (local < 0 || local >= duration) return null;
  const t = local / duration; // 0..1
  const intensity = Math.sin(t * Math.PI); // 0 → 1 → 0
  // Bloom centre sweeps left-to-right
  const cx = interpolate(t, [0, 1], [20, 80]);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(circle at ${cx}% 50%, rgba(255,237,180,${0.85 * intensity}) 0%, rgba(255,200,100,${0.55 * intensity}) 25%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,${0.6 * intensity}) 0%, rgba(255,255,255,0) 100%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════
// ⑯ Light-leak transition — Anthropic-style fluid scene cut
// ═══════════════════════════════════════════════════════════
const Demo16LightLeak: React.FC = () => {
  const frame = useCurrentFrame();
  // First half: product card. Second half: storefront teal background.
  const showSecond = frame >= 45;
  const path: HandPathPoint[] = [
    { x: ENTRY_X, y: ENTRY_Y, frame: 10, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 35, gesture: 'click', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 44, gesture: 'click', scale: 0 },
  ];
  return (
    <Stage>
      {!showSecond && (
        <>
          <ProductCard />
          <FloatingHand
            path={path}
            animation="cursor-real-black"
            clickAnimation="cursor-real-anim-black-click-burst"
            size={50}
            dark={false}
            physics={STD_PHYSICS}
          />
        </>
      )}
      {showSecond && (
        <AbsoluteFill
          style={{
            background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: -2,
              textAlign: 'center',
            }}
          >
            ✓
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                marginTop: 12,
                letterSpacing: 4,
              }}
            >
              ORDER PLACED
            </div>
          </div>
        </AbsoluteFill>
      )}
      {/* CSS light-leak overlay (swiftshader-compatible). Sweeps a warm
          radial bloom + white flash across frames 35-55. */}
      <CSSLightLeak from={35} duration={20} />

      <TitleCard
        number="⑯"
        title="Light-leak transition"
        subtitle="WebGL light leak hides the cut — Anthropic-style fluid scene change"
      />
    </Stage>
  );
};

// ─── Top-level composition ───
export const DorianImprovementsDemoV2: React.FC = () => {
  const demos = [
    Demo5HoverPulse,
    Demo6ClickBurst,
    Demo7Swipe,
    Demo8Pinch,
    Demo9Wobble,
    Demo10DoubleClick,
    Demo11Annotation,
    Demo12BuildReveal,
    Demo13ColorSwatches,
    Demo14ResultChip,
    Demo15MotionBlur,
    Demo16LightLeak,
  ];
  return (
    <AbsoluteFill style={{ background: STAGE_BG }}>
      {demos.map((Demo, i) => (
        <Sequence key={i} from={i * DEMO_FRAMES} durationInFrames={DEMO_FRAMES}>
          <Demo />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
