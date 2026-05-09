/**
 * ClickStyleDemo — Side-by-side preview of 5 click-effect variants.
 *
 * Purpose: let the user pick which click style V1.13 should use globally.
 * Each variant runs for 3s sequentially with a label + description.
 * Cursor approaches a click target → clicks → holds, so the click effect
 * is unmistakable.
 *
 * NOTE: This is a throwaway preview composition. Variants B–E are
 * implemented inline (not via FloatingHand) so the visual differences
 * come from the click effect itself, not from differing rendering paths.
 * Once a variant is chosen, FloatingHand will get a `clickStyle` prop
 * that supports it production-wide.
 */
import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { fontFamily } from '../../lib/fonts';

const VARIANT_FRAMES = 90; // 3s each at 30fps
const VARIANT_COUNT = 5;
export const CLICK_STYLE_DEMO_TOTAL = VARIANT_FRAMES * VARIANT_COUNT; // 450 frames = 15s

type Variant = 'A' | 'B' | 'C' | 'D' | 'E';

const VARIANTS: { id: Variant; label: string; description: string }[] = [
  {
    id: 'A',
    label: 'A — Current (Lottie + Ripple)',
    description:
      'What V1.12 has now: cursor briefly tilts/depresses + teal ripple bursts out',
  },
  {
    id: 'B',
    label: 'B — Soft pulse only',
    description:
      'Cursor scales 1.0 → 0.85 → 1.0 over 8 frames — no ripple, no extras',
  },
  {
    id: 'C',
    label: 'C — Soft pulse + tiny dot',
    description:
      'Pulse + a small white 16px dot fades in/out at the click point',
  },
  {
    id: 'D',
    label: 'D — Soft pulse + small ripple',
    description: 'Pulse + a smaller, softer white ripple (slower than A)',
  },
  {
    id: 'E',
    label: 'E — Lottie only (no ripple)',
    description: 'Cursor depress only, no ripple burst',
  },
];

const CURSOR_SCALE_PEAK = 0.82; // bottom of the pulse
const PULSE_FRAMES = 8;
const RIPPLE_TEAL = 'rgba(46, 212, 191, 0.7)';
const RIPPLE_WHITE = 'rgba(255, 255, 255, 0.55)';

export const ClickStyleDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0a0a0a', fontFamily }}>
      {VARIANTS.map((v, i) => (
        <Sequence
          key={v.id}
          from={i * VARIANT_FRAMES}
          durationInFrames={VARIANT_FRAMES}
          name={v.label}
        >
          <ClickVariantScene variant={v} index={i} total={VARIANT_COUNT} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

type SceneProps = {
  variant: { id: Variant; label: string; description: string };
  index: number;
  total: number;
};

const ClickVariantScene: React.FC<SceneProps> = ({ variant, index, total }) => {
  const frame = useCurrentFrame();

  // Click target: center of composition
  const TARGET_X = 540;
  const TARGET_Y = 1100;

  // Cursor enters from right, arrives at target, clicks
  const ENTER_X = 880;
  const ARRIVE_FRAME = 22;
  const CLICK_FRAME = 30;

  const cursorX = interpolate(frame, [0, ARRIVE_FRAME], [ENTER_X, TARGET_X], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const cursorY = TARGET_Y;

  // Soft pulse curve — 1.0 → CURSOR_SCALE_PEAK → 1.0 over PULSE_FRAMES
  let cursorScale = 1;
  if (frame >= CLICK_FRAME && frame < CLICK_FRAME + PULSE_FRAMES) {
    const t = (frame - CLICK_FRAME) / PULSE_FRAMES;
    // Ease-in-out cubic, peak at midpoint
    const tri = t < 0.5 ? t * 2 : (1 - t) * 2;
    cursorScale = 1 - (1 - CURSOR_SCALE_PEAK) * tri;
  }

  // Lottie-style depress (variants A + E): brief scale 0.92 + slight rotation
  let lottieDepress = 0;
  if (
    (variant.id === 'A' || variant.id === 'E') &&
    frame >= CLICK_FRAME &&
    frame < CLICK_FRAME + 8
  ) {
    const t = (frame - CLICK_FRAME) / 8;
    lottieDepress = t < 0.5 ? t * 2 : (1 - t) * 2;
  }
  const lottieScale = 1 - 0.08 * lottieDepress;
  const lottieRotate = 5 * lottieDepress;

  // Ripple (variant A: teal big; D: white smaller; others none)
  type Ripple = {
    size: number;
    color: string;
    durFrames: number;
    maxScale: number;
  };
  let rippleConfig: Ripple | null = null;
  if (variant.id === 'A') {
    rippleConfig = {
      size: 100,
      color: RIPPLE_TEAL,
      durFrames: 24,
      maxScale: 3.2,
    };
  } else if (variant.id === 'D') {
    rippleConfig = {
      size: 60,
      color: RIPPLE_WHITE,
      durFrames: 28,
      maxScale: 2.0,
    };
  }
  let ripple: {
    scale: number;
    opacity: number;
    size: number;
    color: string;
  } | null = null;
  if (
    rippleConfig &&
    frame >= CLICK_FRAME &&
    frame < CLICK_FRAME + rippleConfig.durFrames
  ) {
    const t = (frame - CLICK_FRAME) / rippleConfig.durFrames;
    ripple = {
      scale: 1 + (rippleConfig.maxScale - 1) * t,
      opacity: 1 - t,
      size: rippleConfig.size,
      color: rippleConfig.color,
    };
  }

  // Variant C: tiny white dot at click point, fades over 14 frames
  let dotOpacity = 0;
  if (variant.id === 'C' && frame >= CLICK_FRAME && frame < CLICK_FRAME + 14) {
    const t = (frame - CLICK_FRAME) / 14;
    dotOpacity = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
  }

  // Apply soft pulse for variants B/C/D, lottie depress for A/E
  const cursorTransform =
    variant.id === 'A' || variant.id === 'E'
      ? `translate(${cursorX - 18}px, ${cursorY - 4}px) scale(${lottieScale}) rotate(${lottieRotate}deg)`
      : `translate(${cursorX - 18}px, ${cursorY - 4}px) scale(${cursorScale})`;

  return (
    <AbsoluteFill>
      {/* Header — variant index + label */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.5, letterSpacing: 4 }}>
          VARIANT {index + 1} OF {total}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            marginTop: 24,
            color: '#fff',
          }}
        >
          {variant.label}
        </div>
        <div
          style={{
            fontSize: 32,
            opacity: 0.65,
            marginTop: 28,
            padding: '0 100px',
            fontWeight: 400,
            lineHeight: 1.4,
          }}
        >
          {variant.description}
        </div>
      </div>

      {/* Click target — a "Buy now" button-like rectangle */}
      <div
        style={{
          position: 'absolute',
          left: TARGET_X - 200,
          top: TARGET_Y - 70,
          width: 400,
          height: 140,
          background: '#2DD4BF',
          borderRadius: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 40px rgba(45, 212, 191, 0.3)',
          color: 'white',
          fontSize: 42,
          fontWeight: 700,
        }}
      >
        Buy now
      </div>

      {/* Ripple effect (under cursor) */}
      {ripple && (
        <div
          style={{
            position: 'absolute',
            left: TARGET_X - ripple.size / 2,
            top: TARGET_Y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            border: `4px solid ${ripple.color}`,
            transform: `scale(${ripple.scale})`,
            opacity: ripple.opacity,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Variant C dot */}
      {variant.id === 'C' && dotOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: TARGET_X - 10,
            top: TARGET_Y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'white',
            opacity: dotOpacity,
            boxShadow: '0 0 12px rgba(255,255,255,0.8)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Cursor */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: cursorTransform,
          transformOrigin: '0 0',
          pointerEvents: 'none',
        }}
      >
        <CursorArrow />
      </div>

      {/* Footer — frame counter + variant ID */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 24,
          letterSpacing: 2,
        }}
      >
        click happens at frame {CLICK_FRAME} · current local frame {frame}
      </div>
    </AbsoluteFill>
  );
};

const CursorArrow: React.FC = () => (
  <svg width="48" height="60" viewBox="0 0 48 60" style={{ display: 'block' }}>
    <path
      d="M4 4 L4 44 L14 36 L21 52 L26 50 L19 34 L32 34 Z"
      fill="black"
      stroke="white"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);
