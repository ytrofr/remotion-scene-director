import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { fontFamily } from '../../lib/fonts';
import { FloatingHand } from '../../components/FloatingHand';
import { HandPathPoint } from '../../components/FloatingHand/types';

// DorianImprovementsDemo — 12s sample-platter demo (4 × 3s)
//
// Compares 4 cursor/UX improvements against a baseline, applied to the same
// product-card canvas so the differences are visible at a glance.
//
//   ① Baseline V1.00         — straight-line, constant speed, big ripple
//   ② Pre-click deceleration — settles into the click target
//   ③ Subtle click ripple    — smaller radius, faster fade
//   ④ Zoom-in + scene title  — pulls focus to CTA, labels the action

const DEMO_FRAMES = 90; // 3s per demo
export const DORIAN_IMPROVEMENTS_TOTAL = DEMO_FRAMES * 4; // 360 frames = 12s

// Shared product-card canvas constants (composition space, 1080×1920)
const PHONE_CENTER_X = 540;
const PHONE_CENTER_Y = 960;
const PHONE_W = 414;
const PHONE_H = 868;
const PHONE_LEFT = PHONE_CENTER_X - PHONE_W / 2;
const PHONE_TOP = PHONE_CENTER_Y - PHONE_H / 2;

// Click target — Add to Cart button center, in composition space
const CTA_X = 540;
const CTA_Y = 1290;

// Cursor entry point (off-card, upper-right area)
const ENTRY_X = 760;
const ENTRY_Y = 700;

// ────────────────────────────────────────────────────────────
// Shared product-card canvas (visually identical in all 4 demos)
// ────────────────────────────────────────────────────────────
const ProductCard: React.FC<{ zoom?: number; zoomCenterY?: number }> = ({
  zoom = 1,
  zoomCenterY = PHONE_CENTER_Y,
}) => {
  const dx = PHONE_CENTER_X;
  const dy = zoomCenterY;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        transform: `translate(${dx}px, ${dy}px) scale(${zoom}) translate(${-dx}px, ${-dy}px)`,
        transformOrigin: '0 0',
      }}
    >
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
          }}
        >
          DORIAN
        </div>

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
            color: '#94a3b8',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {/* Inline TV silhouette */}
          <div
            style={{
              width: 220,
              height: 140,
              background: '#0f172a',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2DD4BF',
              fontSize: 32,
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(15,23,42,0.2)',
            }}
          >
            LG
          </div>
        </div>

        {/* Product info */}
        <div style={{ padding: '0 24px' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#2DD4BF',
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
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#1E293B',
              }}
            >
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

        {/* Add to Cart button — click target */}
        <div
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            bottom: 40,
            height: 60,
            background: '#2DD4BF',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 0.5,
            boxShadow: '0 8px 20px rgba(45,212,191,0.35)',
          }}
        >
          ADD TO CART
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Title card overlay (shows demo number + label)
// ────────────────────────────────────────────────────────────
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
          color: '#2DD4BF',
          letterSpacing: 4,
          marginBottom: 12,
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: -1,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: '#94a3b8',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

// Mini scene-title pill that floats above the phone (used in demo ④)
const SceneTitlePill: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [70, 85], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);
  return (
    <div
      style={{
        position: 'absolute',
        left: PHONE_CENTER_X - 80,
        top: PHONE_TOP - 80,
        width: 160,
        textAlign: 'center',
        opacity,
        fontFamily,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: 'rgba(45,212,191,0.95)',
          color: '#0f172a',
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: 3,
          borderRadius: 999,
          boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// 4 demo variants
// ────────────────────────────────────────────────────────────
// Each demo:
//   - Frames 15-65: cursor approaches CTA
//   - Frame ~70: click
//   - Frame 85+: cursor faded out / scene fades

// ① Baseline — linear path, constant speed, big ripple
const DemoBaseline: React.FC = () => {
  const path: HandPathPoint[] = [
    { x: ENTRY_X, y: ENTRY_Y, frame: 10, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 65, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 70, gesture: 'click', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 85, gesture: 'click', scale: 0 },
  ];
  return (
    <AbsoluteFill style={{ background: '#0f172a' }}>
      <ProductCard />
      <FloatingHand
        path={path}
        animation="cursor-real-black"
        size={120}
        dark={false}
        showRipple
        rippleColor="rgba(45,212,191,0.7)"
        physics={{
          smoothing: 0.05,
          velocityScale: 0,
          maxRotation: 0,
          floatAmplitude: 0,
          floatSpeed: 0,
          shadowEnabled: true,
          shadowDistance: 8,
          shadowBlur: 10,
        }}
      />
      <TitleCard
        number="①"
        title="Baseline"
        subtitle="straight line · constant speed · big ripple"
      />
    </AbsoluteFill>
  );
};

// ② Pre-click deceleration — slows in last 30px before target
// Implemented via easing: the same end coords as Baseline but with an
// intermediate slow-in waypoint 3 frames before the click.
const DemoDecel: React.FC = () => {
  const path: HandPathPoint[] = [
    { x: ENTRY_X, y: ENTRY_Y, frame: 10, gesture: 'pointer', scale: 1 },
    // Approach speed: covers 80% of distance by frame 50
    {
      x: CTA_X + 30,
      y: CTA_Y - 30,
      frame: 50,
      gesture: 'pointer',
      scale: 1,
    },
    // Settle: last 30px takes 17 frames (much slower) — feels "intentional"
    { x: CTA_X, y: CTA_Y, frame: 67, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 72, gesture: 'click', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 85, gesture: 'click', scale: 0 },
  ];
  return (
    <AbsoluteFill style={{ background: '#0f172a' }}>
      <ProductCard />
      <FloatingHand
        path={path}
        animation="cursor-real-black"
        size={120}
        dark={false}
        showRipple
        rippleColor="rgba(45,212,191,0.7)"
        physics={{
          smoothing: 0.05,
          velocityScale: 0,
          maxRotation: 0,
          floatAmplitude: 0,
          floatSpeed: 0,
          shadowEnabled: true,
          shadowDistance: 8,
          shadowBlur: 10,
        }}
      />
      <TitleCard
        number="②"
        title="Pre-click deceleration"
        subtitle="settles into the target · feels intentional"
      />
    </AbsoluteFill>
  );
};

// ③ Subtle click ripple — same path as decel, but smaller ripple radius
const DemoSmallRipple: React.FC = () => {
  const path: HandPathPoint[] = [
    { x: ENTRY_X, y: ENTRY_Y, frame: 10, gesture: 'pointer', scale: 1 },
    {
      x: CTA_X + 30,
      y: CTA_Y - 30,
      frame: 50,
      gesture: 'pointer',
      scale: 1,
    },
    { x: CTA_X, y: CTA_Y, frame: 67, gesture: 'pointer', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 72, gesture: 'click', scale: 1 },
    { x: CTA_X, y: CTA_Y, frame: 85, gesture: 'click', scale: 0 },
  ];
  return (
    <AbsoluteFill style={{ background: '#0f172a' }}>
      <ProductCard />
      <FloatingHand
        path={path}
        animation="cursor-real-black"
        size={50} // smaller cursor + smaller ripple bound
        dark={false}
        showRipple
        rippleColor="rgba(45,212,191,0.85)"
        physics={{
          smoothing: 0.05,
          velocityScale: 0,
          maxRotation: 0,
          floatAmplitude: 0,
          floatSpeed: 0,
          shadowEnabled: true,
          shadowDistance: 6,
          shadowBlur: 8,
        }}
      />
      <TitleCard
        number="③"
        title="Subtle click ripple"
        subtitle="smaller radius · faster fade · less visual noise"
      />
    </AbsoluteFill>
  );
};

// ④ Zoom-in + scene-title overlay — pulls focus to the CTA, labels action
const DemoZoom: React.FC = () => {
  const frame = useCurrentFrame();
  // Zoom from 1.0 → 1.25 between frames 20-55 centered on the CTA
  const zoom = interpolate(frame, [20, 55], [1.0, 1.25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const zoomCenterY = interpolate(frame, [20, 55], [PHONE_CENTER_Y, CTA_Y], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  // Cursor coords also need to track the zoom — recompute target as
  // (CTA + (CTA - zoomCenter) * (zoom - 1)). For simplicity, since the
  // cursor renders OUTSIDE the zoom wrapper, we move the cursor to the
  // POST-zoom screen position.
  const ctaScreenX = PHONE_CENTER_X + (CTA_X - PHONE_CENTER_X) * zoom;
  const ctaScreenY = zoomCenterY + (CTA_Y - zoomCenterY) * zoom;
  const path: HandPathPoint[] = [
    { x: ENTRY_X, y: ENTRY_Y, frame: 10, gesture: 'pointer', scale: 1 },
    {
      x: ctaScreenX + 30,
      y: ctaScreenY - 30,
      frame: 50,
      gesture: 'pointer',
      scale: 1,
    },
    {
      x: ctaScreenX,
      y: ctaScreenY,
      frame: 67,
      gesture: 'pointer',
      scale: 1,
    },
    {
      x: ctaScreenX,
      y: ctaScreenY,
      frame: 72,
      gesture: 'click',
      scale: 1,
    },
    {
      x: ctaScreenX,
      y: ctaScreenY,
      frame: 85,
      gesture: 'click',
      scale: 0,
    },
  ];
  return (
    <AbsoluteFill style={{ background: '#0f172a' }}>
      <ProductCard zoom={zoom} zoomCenterY={zoomCenterY} />
      <SceneTitlePill label="BUY" />
      <FloatingHand
        path={path}
        animation="cursor-real-black"
        size={50}
        dark={false}
        showRipple
        rippleColor="rgba(45,212,191,0.85)"
        physics={{
          smoothing: 0.05,
          velocityScale: 0,
          maxRotation: 0,
          floatAmplitude: 0,
          floatSpeed: 0,
          shadowEnabled: true,
          shadowDistance: 6,
          shadowBlur: 8,
        }}
      />
      <TitleCard
        number="④"
        title="Zoom + scene title"
        subtitle="pulls focus to CTA · narrates the action"
      />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────────────────────────
// Top-level composition
// ────────────────────────────────────────────────────────────
export const DorianImprovementsDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0f172a' }}>
      <Sequence from={0} durationInFrames={DEMO_FRAMES}>
        <DemoBaseline />
      </Sequence>
      <Sequence from={DEMO_FRAMES} durationInFrames={DEMO_FRAMES}>
        <DemoDecel />
      </Sequence>
      <Sequence from={DEMO_FRAMES * 2} durationInFrames={DEMO_FRAMES}>
        <DemoSmallRipple />
      </Sequence>
      <Sequence from={DEMO_FRAMES * 3} durationInFrames={DEMO_FRAMES}>
        <DemoZoom />
      </Sequence>
    </AbsoluteFill>
  );
};
