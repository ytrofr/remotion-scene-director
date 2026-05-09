/**
 * ScrollStyleDemo — 6 scroll variants side-by-side for visual A/B comparison.
 *
 * Each column runs the SAME scroll (480px over 90 frames) with a different
 * motion curve + hand behavior so you can scrub and pick the one you like.
 *
 * Landscape 1920x1080, 180f (6s) with 30f lead-in pause and 60f tail.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { noise2D } from '@remotion/noise';
import { fontFamily } from '../lib/fonts';

export const SCROLL_DEMO_VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 180,
};

// ── Scroll window: 30..120 (90 frames, same as HomeScrollScene) ──
const SCROLL_START = 30;
const SCROLL_END = 120;
const SCROLL_DIST = 480; // px of content travel

type Variant = {
  id: string;
  label: string;
  sub: string;
  scroll: (frame: number) => number; // 0..SCROLL_DIST
  handDy: (frame: number) => number; // vertical offset of hand vs rest position
  handRot: (frame: number) => number; // deg
  handJitter?: (frame: number) => number; // px
};

// Helpers
const clamp = (t: number) => Math.max(0, Math.min(1, t));
const progress = (frame: number) =>
  clamp((frame - SCROLL_START) / (SCROLL_END - SCROLL_START));

// Eases
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Smooth rotation: starts at 0, dips to -targetDeg during drag, returns to 0.
// Uses a bell curve over the scroll window.
const smoothRotation = (frame: number, targetDeg: number) => {
  const t = progress(frame);
  if (t <= 0 || t >= 1) return 0;
  // Sine bell: 0 → 1 → 0 over [0,1]
  const bell = Math.sin(t * Math.PI);
  return -targetDeg * bell;
};

// Multi-flick: two flicks (0..0.5) then (0.55..1), each easeOut, with micro-pause.
const multiFlick = (frame: number) => {
  const t = progress(frame);
  if (t < 0.5) {
    return easeOutCubic(t / 0.5) * (SCROLL_DIST * 0.55);
  } else if (t < 0.58) {
    return SCROLL_DIST * 0.55; // brief pause between flicks
  }
  return (
    SCROLL_DIST * 0.55 + easeOutCubic((t - 0.58) / 0.42) * (SCROLL_DIST * 0.45)
  );
};

const VARIANTS: Variant[] = [
  {
    id: 'A',
    label: 'A · Linear (current)',
    sub: 'constant velocity, static hand',
    scroll: (f) => progress(f) * SCROLL_DIST,
    handDy: () => 0,
    handRot: (f) => (progress(f) > 0 && progress(f) < 1 ? -30 : 0),
  },
  {
    id: 'B',
    label: 'B · Ease-out cubic',
    sub: 'quick flick, slow settle',
    scroll: (f) => easeOutCubic(progress(f)) * SCROLL_DIST,
    handDy: () => 0,
    handRot: (f) => smoothRotation(f, 22),
  },
  {
    id: 'C',
    label: 'C · Ease-out + hand travels',
    sub: 'finger moves with content',
    scroll: (f) => easeOutQuint(progress(f)) * SCROLL_DIST,
    handDy: (f) => easeOutQuint(progress(f)) * 70,
    handRot: (f) => smoothRotation(f, 22),
  },
  {
    id: 'D',
    label: 'D · Flick + overshoot',
    sub: 'ios-style bounce settle',
    scroll: (f) => {
      const t = progress(f);
      // Overshoot to 1.04, settle back to 1.0
      const raw = interpolate(t, [0, 0.8, 1], [0, 1.04, 1]);
      return raw * SCROLL_DIST;
    },
    handDy: (f) => easeOutCubic(progress(f)) * 55,
    handRot: (f) => smoothRotation(f, 25),
  },
  {
    id: 'E',
    label: 'E · Multi-flick',
    sub: 'two swipes, micro-pause',
    scroll: multiFlick,
    handDy: (f) => {
      const t = progress(f);
      if (t < 0.5) return easeOutCubic(t / 0.5) * 45;
      if (t < 0.58) return 45;
      return 45 + easeOutCubic((t - 0.58) / 0.42) * 45;
    },
    handRot: (f) => {
      const t = progress(f);
      if (t < 0.5) return -22 * Math.sin((t / 0.5) * Math.PI);
      if (t < 0.58) return 0;
      return -22 * Math.sin(((t - 0.58) / 0.42) * Math.PI);
    },
  },
  {
    id: 'F',
    label: 'F · Human blend',
    sub: 'easing + hand travel + jitter',
    scroll: (f) => easeInOutCubic(progress(f)) * SCROLL_DIST,
    handDy: (f) => easeInOutCubic(progress(f)) * 60,
    handRot: (f) => smoothRotation(f, 24),
    handJitter: (f) => {
      const t = progress(f);
      if (t <= 0 || t >= 1) return 0;
      return noise2D('scroll-jitter', f * 0.18, 0) * 3;
    },
  },
];

// ── Mini phone component ──
const PHONE_W = 260;
const PHONE_H = 520;
const VIEWPORT_H = 460;
const CONTENT_H = 1200;

const PhoneColumn: React.FC<{ variant: Variant; colIndex: number }> = ({
  variant,
  colIndex,
}) => {
  const frame = useCurrentFrame();
  const scrollOffset = variant.scroll(frame);
  const handDy = variant.handDy(frame);
  const handRot = variant.handRot(frame);
  const jitter = variant.handJitter?.(frame) ?? 0;

  const handRestX = PHONE_W / 2 + 65;
  const handRestY = PHONE_H / 2;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: PHONE_W + 40,
        gap: 14,
      }}
    >
      {/* Label */}
      <div
        style={{
          color: '#fff',
          fontFamily,
          fontWeight: 700,
          fontSize: 20,
          textAlign: 'center',
        }}
      >
        {variant.label}
      </div>
      <div
        style={{
          color: '#9ca3af',
          fontFamily,
          fontSize: 13,
          textAlign: 'center',
          height: 16,
        }}
      >
        {variant.sub}
      </div>

      {/* Phone bezel */}
      <div
        style={{
          position: 'relative',
          width: PHONE_W,
          height: PHONE_H,
          background: '#1a1a1a',
          borderRadius: 32,
          padding: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Viewport */}
        <div
          style={{
            position: 'relative',
            width: PHONE_W - 16,
            height: VIEWPORT_H,
            borderRadius: 24,
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          {/* Scrollable content — numbered tiles */}
          <div
            style={{
              position: 'absolute',
              top: -scrollOffset,
              left: 0,
              right: 0,
              width: '100%',
              height: CONTENT_H,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 100,
                  margin: '0 12px 12px 12px',
                  borderRadius: 12,
                  background: `hsl(${(i * 30 + colIndex * 11) % 360}, 65%, 88%)`,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 16,
                  fontFamily,
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#1e293b',
                }}
              >
                Item {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Finger cursor — simple circle with shadow */}
        <div
          style={{
            position: 'absolute',
            left: handRestX - 22,
            top: handRestY - 22 + handDy + jitter,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(30, 41, 59, 0.95)',
            border: '3px solid rgba(255,255,255,0.9)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            transform: `rotate(${handRot}deg)`,
            transformOrigin: 'center center',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

// ── Main composition ──
export const ScrollStyleDemo: React.FC = () => {
  const frame = useCurrentFrame();

  // Progress bar showing where in the scroll window we are
  const scrollT = clamp((frame - SCROLL_START) / (SCROLL_END - SCROLL_START));

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        padding: '40px 40px 60px',
      }}
    >
      {/* Header */}
      <div
        style={{
          color: '#fff',
          fontFamily,
          fontWeight: 700,
          fontSize: 36,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Scroll Style Comparison
      </div>
      <div
        style={{
          color: '#94a3b8',
          fontFamily,
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        Same 480px scroll · 90 frames · 6 motion curves · scrub to compare
      </div>

      {/* Phones row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 16,
          flex: 1,
        }}
      >
        {VARIANTS.map((v, i) => (
          <PhoneColumn key={v.id} variant={v} colIndex={i} />
        ))}
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 40,
          right: 40,
          height: 6,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 3,
        }}
      >
        <div
          style={{
            width: `${scrollT * 100}%`,
            height: '100%',
            background: '#2DD4BF',
            borderRadius: 3,
            transition: 'none',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
