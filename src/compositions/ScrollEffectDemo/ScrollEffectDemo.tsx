import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { FloatingHand } from '../../components/FloatingHand';
import { SceneDirectorModeProvider } from '../../components/FloatingHand/SceneDirectorMode';
import {
  HandPathPoint,
  HandPhysicsConfig,
} from '../../components/FloatingHand/types';
import { fontFamily } from '../../lib/fonts';

export const SCROLL_EFFECT_VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 90 * 7, // 7 scenes × 90 frames = 21s
};

// Scrollbar-drag family: cursor lives on the right scrollbar position and
// slides vertically while content scrolls. Variants below explore drag
// distance + motion style (smooth vs stutter, with/without click, with/without
// approach entry).
type MotionKind =
  | 'sb-mini' // 30px slide (subtle baseline)
  | 'sb-medium' // 100px slide
  | 'sb-big' // 200px slide
  | 'sb-full' // 400px slide (full scrollbar travel)
  | 'sb-approach' // approach from inside phone, then 200px drag
  | 'sb-click-drag' // press-down (scale 0.7) then 200px smooth drag
  | 'sb-stutter'; // 200px drag in 4 stutter-step increments

type Variant = {
  name: string;
  label: string;
  animation: string;
  physicsOverride?: Partial<HandPhysicsConfig>;
  size?: number;
  dark?: boolean;
  motion: MotionKind;
  description: string;
};

export const SCROLL_VARIANTS: Variant[] = [
  {
    name: '1-Mini-30px',
    label: 'Option 1: Tiny drag — 30px',
    animation: 'cursor-real-black',
    physicsOverride: { velocityScale: 0, maxRotation: 0 },
    size: 140,
    motion: 'sb-mini',
    description:
      'Cursor sits on the scrollbar and slides 30px (15px above center → 15px below). Subtle, almost-static. Original baseline.',
  },
  {
    name: '2-Medium-100px',
    label: 'Option 2: Medium drag — 100px',
    animation: 'cursor-real-black',
    physicsOverride: { velocityScale: 0, maxRotation: 0 },
    size: 140,
    motion: 'sb-medium',
    description:
      'Cursor slides 100px down the scrollbar. Visible motion that signals scroll intent without being aggressive.',
  },
  {
    name: '3-Big-200px',
    label: 'Option 3: Big drag — 200px',
    animation: 'cursor-real-black',
    physicsOverride: { velocityScale: 0, maxRotation: 0 },
    size: 140,
    motion: 'sb-big',
    description:
      'Cursor slides 200px down the scrollbar. Clearly active scrollbar interaction. Good for emphasizing the scroll.',
  },
  {
    name: '4-Full-400px',
    label: 'Option 4: Full scrollbar travel — 400px',
    animation: 'cursor-real-black',
    physicsOverride: { velocityScale: 0, maxRotation: 0 },
    size: 140,
    motion: 'sb-full',
    description:
      'Cursor travels 400px — top of scrollbar → bottom. Most dramatic version. Content scrolls fully under the gesture.',
  },
  {
    name: '5-Approach-200px',
    label: 'Option 5: Approach + 200px drag',
    animation: 'cursor-real-black',
    physicsOverride: { velocityScale: 0, maxRotation: 0 },
    size: 140,
    motion: 'sb-approach',
    description:
      'Cursor flies in from inside the phone (left), arrives at the scrollbar, then drags 200px. Adds the "user reaches for scrollbar" beat.',
  },
  {
    name: '6-Click-Drag-200px',
    label: 'Option 6: Press + 200px drag',
    animation: 'cursor-real-black',
    physicsOverride: { velocityScale: 0, maxRotation: 0 },
    size: 140,
    motion: 'sb-click-drag',
    description:
      'Cursor parks on scrollbar, scales down to 0.7 for 3 frames as a "press" beat, then drags 200px. Communicates "click and drag."',
  },
  {
    name: '7-Stutter-200px',
    label: 'Option 7: Stutter-step drag (4 increments)',
    animation: 'cursor-real-black',
    physicsOverride: { velocityScale: 0, maxRotation: 0 },
    size: 140,
    motion: 'sb-stutter',
    description:
      'Cursor drags 200px total but in 4 stutter-step increments (50px each, with 3-frame pauses). Mimics manual scrollbar drag-and-release rhythm.',
  },
];

// Phone mockup constants (matching DorianDemo)
const PHONE = {
  width: 390,
  height: 844,
  frameWidth: 414,
  frameHeight: 868,
  centerX: 540,
  centerY: 960,
  zoom: 1.8,
};

// Simple scrollable list content
const ScrollableContent: React.FC<{ scrollProgress: number }> = ({
  scrollProgress,
}) => {
  const items = [
    { title: '4K Smart TV', price: '$899', img: '#2DD4BF' },
    { title: 'Wireless Headphones', price: '$249', img: '#F97316' },
    { title: 'Gaming Console', price: '$549', img: '#3B82F6' },
    { title: 'Smart Watch', price: '$399', img: '#A855F7' },
    { title: 'Bluetooth Speaker', price: '$129', img: '#EAB308' },
    { title: 'Laptop Pro', price: '$1299', img: '#EC4899' },
    { title: 'Tablet 11"', price: '$649', img: '#10B981' },
    { title: 'DSLR Camera', price: '$1499', img: '#EF4444' },
  ];
  // Each item ~100px high; scroll moves up to ~400px
  const offsetY = -scrollProgress * 400;
  return (
    <div
      style={{
        position: 'absolute',
        top: 100 + offsetY,
        left: 0,
        right: 0,
        padding: '0 20px',
        fontFamily,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 12,
          color: '#1E293B',
        }}
      >
        Featured Products
      </div>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 14px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              background: it.img,
              marginRight: 12,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
              {it.title}
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>In stock</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#14B8A6' }}>
            {it.price}
          </div>
        </div>
      ))}
    </div>
  );
};

// Phone bezel + screen
const Phone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const S = PHONE.zoom;
  return (
    <div
      style={{
        position: 'absolute',
        left: PHONE.centerX - (PHONE.frameWidth * S) / 2,
        top: PHONE.centerY - (PHONE.frameHeight * S) / 2,
        width: PHONE.frameWidth * S,
        height: PHONE.frameHeight * S,
        background: '#1a1a1a',
        borderRadius: 55 * S,
        padding: ((PHONE.frameWidth - PHONE.width) / 2) * S,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: PHONE.width * S,
          height: PHONE.height * S,
          background: '#FFFFFF',
          borderRadius: 45 * S,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Status bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            fontFamily,
            fontWeight: 600,
            fontSize: 16,
            zIndex: 5,
          }}
        >
          <span>10:45</span>
          <span style={{ fontSize: 14 }}>•••</span>
        </div>
        {/* Inner content scaled to phone screen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${S})`,
            transformOrigin: 'top left',
            width: PHONE.width,
            height: PHONE.height,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Build a HandPathPoint[] for each motion pattern.
 *
 * Convention: scene is 90 frames. Frames 0-15 = enter from right.
 * Frames 15-75 = scroll window. Frames 75-89 = exit hold.
 *
 * Note: scale=0 with `gesture:'pointer'` is the FloatingHand "invisible"
 * convention (see useHandAnimation `??` fix). Used to teleport between
 * positions without an animated travel.
 */
function buildPath(
  motion: MotionKind,
  X: number,
  Y_TOP: number,
  Y_BOT: number,
  Y_MID: number,
): HandPathPoint[] {
  // Frame budget: 0..15 enter, 20..70 = scroll active drag, 70..89 = settle.
  // X_SCROLLBAR = right scrollbar position (composition-space). Phone screen
  // content spans X≈189..891 (390×1.8 zoom centered at 540), bezel out to ≈912.
  // Scrollbar at the right edge of CONTENT, just inside the bezel: X≈880.
  // X_INSIDE = mid-phone for "approach" entry (left of scrollbar).
  const X_SCROLLBAR = 880;
  const X_INSIDE = 500;

  // Helper: smooth top→bottom scrollbar drag with total travel = `range` px,
  // centered on Y_MID. Frame budget: 0 enter → 15 arrive → 20 begin drag → 70 end → 89 hold.
  const smoothDrag = (range: number): HandPathPoint[] => {
    const half = range / 2;
    return [
      {
        x: 1080,
        y: Y_MID - half,
        frame: 0,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - half,
        frame: 15,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - half,
        frame: 20,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID + half,
        frame: 70,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID + half,
        frame: 89,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
    ];
  };

  if (motion === 'sb-mini') return smoothDrag(30);
  if (motion === 'sb-medium') return smoothDrag(100);
  if (motion === 'sb-big') return smoothDrag(200);
  if (motion === 'sb-full') return smoothDrag(400);

  if (motion === 'sb-approach') {
    // Cursor flies in from inside the phone (left/lower), curves up to the
    // scrollbar at f18, then drags 200px. Adds the "user reaches for scrollbar" beat.
    const half = 100;
    return [
      {
        x: X_INSIDE,
        y: Y_MID + 200,
        frame: 0,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_INSIDE + 100,
        y: Y_MID + 60,
        frame: 9,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - half,
        frame: 18,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - half,
        frame: 22,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID + half,
        frame: 70,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID + half,
        frame: 89,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
    ];
  }

  if (motion === 'sb-click-drag') {
    // Cursor parks on scrollbar (f15), presses (scale 0.7 at f17), releases (f20),
    // begins drag (f22), drags to bottom of 200px range (f70), holds.
    const half = 100;
    return [
      {
        x: 1080,
        y: Y_MID - half,
        frame: 0,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - half,
        frame: 15,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - half,
        frame: 17,
        gesture: 'pointer',
        rotation: 0,
        scale: 0.7,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - half,
        frame: 20,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - half,
        frame: 22,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID + half,
        frame: 70,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID + half,
        frame: 89,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
    ];
  }

  if (motion === 'sb-stutter') {
    // 200px drag in 4 stutter-step increments of 50px each. Each step takes 10
    // frames of motion + 3 frames of pause. Steps end at f30, f43, f56, f69.
    const half = 100;
    return [
      {
        x: 1080,
        y: Y_MID - half,
        frame: 0,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - half,
        frame: 15,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - half,
        frame: 20,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - 50,
        frame: 30,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID - 50,
        frame: 33,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID,
        frame: 43,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID,
        frame: 46,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID + 50,
        frame: 56,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID + 50,
        frame: 59,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID + half,
        frame: 69,
        gesture: 'drag',
        rotation: 0,
        scale: 1,
      },
      {
        x: X_SCROLLBAR,
        y: Y_MID + half,
        frame: 89,
        gesture: 'pointer',
        rotation: 0,
        scale: 1,
      },
    ];
  }

  // Fallback (should be unreachable)
  return [
    { x: X, y: Y_MID, frame: 0, gesture: 'pointer', rotation: 0, scale: 1 },
  ];
}

const VariantScene: React.FC<{ variant: Variant }> = ({ variant }) => {
  const frame = useCurrentFrame();

  // Scroll progress: 0..1 over frames 20..70 (50-frame scroll)
  const scrollProgress = interpolate(frame, [20, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const X = 780;
  const Y_TOP = 600;
  const Y_BOT = 1500;
  const Y_MID = 1050;
  const path: HandPathPoint[] = buildPath(
    variant.motion,
    X,
    Y_TOP,
    Y_BOT,
    Y_MID,
  );

  const physics: Partial<HandPhysicsConfig> = {
    floatAmplitude: 0,
    floatSpeed: 0,
    velocityScale: 0.1,
    maxRotation: 5,
    shadowEnabled: true,
    shadowDistance: 8,
    shadowBlur: 10,
    smoothing: 0.2,
    ...(variant.physicsOverride ?? {}),
  };

  return (
    <AbsoluteFill style={{ background: '#F1F5F9' }}>
      <Phone>
        <ScrollableContent scrollProgress={scrollProgress} />
      </Phone>
      {/* SceneDirectorModeProvider value={false} forces FloatingHand to
          render even when the parent app is in SceneDirector mode. We want
          the cursor visible during variant preview, not suppressed. */}
      <SceneDirectorModeProvider value={false}>
        <FloatingHand
          path={path}
          animation={variant.animation}
          size={variant.size ?? 120}
          dark={variant.dark ?? false}
          physics={physics}
        />
      </SceneDirectorModeProvider>
      {/* Variant label overlay */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily,
          color: '#0F172A',
          zIndex: 100,
        }}
      >
        <div style={{ fontSize: 38, fontWeight: 800, marginBottom: 8 }}>
          {variant.label}
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#475569',
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          {variant.description}
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 12,
            padding: '6px 16px',
            fontSize: 18,
            color: '#64748B',
            background: '#E2E8F0',
            borderRadius: 999,
            fontFamily: 'monospace',
          }}
        >
          {variant.animation}.json
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SCROLL_EFFECT_SCENES = SCROLL_VARIANTS.map((v, i) => ({
  name: v.name,
  start: i * 90,
  end: (i + 1) * 90,
}));

export const ScrollEffectDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      {SCROLL_VARIANTS.map((variant, i) => (
        <Sequence key={variant.name} from={i * 90} durationInFrames={90}>
          <VariantScene variant={variant} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
