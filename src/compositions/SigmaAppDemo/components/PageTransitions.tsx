/**
 * PageTransitions — 5 transition variants for page reveal animations.
 * Each component renders a full-screen page reveal with its own entry animation.
 * Standalone — does NOT modify DemoFlow.tsx.
 */
import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

// ─── Shared Props ──────────────────────────────────────────
export interface TransitionProps {
  image: string; // staticFile path
  badge?: { color: string; label: string };
  caption?: string;
  objectPosition?: string;
}

// ─── Badge + Caption (shared across all transitions) ───────
const Badge: React.FC<{
  badge: { color: string; label: string };
  opacity: number;
}> = ({ badge, opacity }) => (
  <div
    style={{
      position: 'absolute',
      top: 24,
      left: 24,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      opacity,
      zIndex: 10,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: badge.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONTS.heading,
        fontSize: 18,
        fontWeight: 700,
        color: '#fff',
        boxShadow: `0 4px 20px ${badge.color}66`,
      }}
    >
      {badge.label}
    </div>
  </div>
);

const CaptionBar: React.FC<{ caption: string; opacity: number }> = ({
  caption,
  opacity,
}) => (
  <div
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 80,
      background:
        'linear-gradient(to top, rgba(9,9,11,1), rgba(9,9,11,0.95))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 60px',
      opacity,
      zIndex: 10,
    }}
  >
    <p
      style={{
        fontFamily: FONTS.body,
        fontSize: 24,
        color: COLORS.text,
        textAlign: 'center',
        letterSpacing: '0.02em',
      }}
    >
      {caption}
    </p>
  </div>
);

/** Fade for badge/caption after main transition settles */
const useOverlayFade = (delayFrame: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [delayFrame, delayFrame + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

// ─── 1. SlideUpPush ────────────────────────────────────────
export const SlideUpPush: React.FC<TransitionProps> = ({
  image,
  badge,
  caption,
  objectPosition = 'center',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  const translateY = interpolate(progress, [0, 1], [100, 0]);
  const overlayFade = useOverlayFade(20);

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: caption ? 80 : 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: '100%', height: '100%', transform: `translateY(${translateY}%)` }}>
          <Img
            src={staticFile(image)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition,
            }}
          />
        </div>
      </div>
      {badge && <Badge badge={badge} opacity={overlayFade} />}
      {caption && <CaptionBar caption={caption} opacity={overlayFade} />}
    </AbsoluteFill>
  );
};

// ─── 2. ScaleBlurReveal ────────────────────────────────────
export const ScaleBlurReveal: React.FC<TransitionProps> = ({
  image,
  badge,
  caption,
  objectPosition = 'center',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 16 },
  });
  const scale = interpolate(progress, [0, 1], [0.92, 1]);
  const blur = interpolate(progress, [0, 1], [12, 0]);
  const overlayFade = useOverlayFade(18);

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: caption ? 80 : 0,
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition,
            transform: `scale(${scale})`,
            filter: `blur(${blur}px)`,
          }}
        />
      </div>
      {badge && <Badge badge={badge} opacity={overlayFade} />}
      {caption && <CaptionBar caption={caption} opacity={overlayFade} />}
    </AbsoluteFill>
  );
};

// ─── 3. WipeReveal ─────────────────────────────────────────
export const WipeReveal: React.FC<TransitionProps> = ({
  image,
  badge,
  caption,
  objectPosition = 'center',
}) => {
  const frame = useCurrentFrame();

  // Diagonal wipe from bottom-left to top-right over ~25 frames
  const wipeProgress = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Animate polygon points for diagonal wipe
  const topY = interpolate(wipeProgress, [0, 1], [100, 0]);
  const rightX = interpolate(wipeProgress, [0, 1], [0, 200]);
  const bottomY = interpolate(wipeProgress, [0, 1], [100, 200]);

  const clipPath = `polygon(0% ${topY}%, ${rightX}% 0%, 0% ${bottomY}%)`;
  const overlayFade = useOverlayFade(25);

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: caption ? 80 : 0,
          overflow: 'hidden',
          clipPath,
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition,
          }}
        />
      </div>
      {badge && <Badge badge={badge} opacity={overlayFade} />}
      {caption && <CaptionBar caption={caption} opacity={overlayFade} />}
    </AbsoluteFill>
  );
};

// ─── 4. MorphZoom ──────────────────────────────────────────
export const MorphZoom: React.FC<TransitionProps> = ({
  image,
  badge,
  caption,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 160 },
  });

  const w = interpolate(progress, [0, 1], [200, vw]);
  const h = interpolate(progress, [0, 1], [120, vh]);
  const borderRadius = interpolate(progress, [0, 1], [12, 0]);
  // Start at bottom-center (~960, 700) and move to fill
  const cx = interpolate(progress, [0, 1], [960 - 100, 0]);
  const cy = interpolate(progress, [0, 1], [700 - 60, 0]);
  const overlayFade = useOverlayFade(22);

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          width: w,
          height: h,
          borderRadius,
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      {badge && <Badge badge={badge} opacity={overlayFade} />}
      {caption && (
        <CaptionBar caption={caption} opacity={overlayFade} />
      )}
    </AbsoluteFill>
  );
};

// ─── 5. SplitSlide ─────────────────────────────────────────
export const SplitSlide: React.FC<TransitionProps> = ({
  image,
  badge,
  caption,
  objectPosition = 'center',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: slide in from right to cover right half (frames 0-20ish via spring)
  const slideProgress = spring({
    frame,
    fps,
    config: { damping: 14 },
  });
  const translateX = interpolate(slideProgress, [0, 1], [100, 0]);

  // Phase 2: expand left edge from 50% to 0% (starts after phase 1 settles ~frame 18)
  const expandProgress = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 16, stiffness: 200 },
  });
  const leftEdge = interpolate(expandProgress, [0, 1], [50, 0]);

  const overlayFade = useOverlayFade(30);

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: `${leftEdge}%`,
          right: 0,
          bottom: caption ? 80 : 0,
          overflow: 'hidden',
          transform: `translateX(${translateX}%)`,
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: '100vw',
            height: '100%',
            objectFit: 'cover',
            objectPosition,
            // Offset image left so it shows the full page, not just right half
            marginLeft: `-${leftEdge}vw`,
          }}
        />
      </div>
      {badge && <Badge badge={badge} opacity={overlayFade} />}
      {caption && <CaptionBar caption={caption} opacity={overlayFade} />}
    </AbsoluteFill>
  );
};
