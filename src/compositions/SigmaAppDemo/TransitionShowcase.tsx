/**
 * TransitionShowcase — Cycles through all 5 page reveal transitions.
 * 750 frames total (25 seconds at 30fps), 150 frames per transition.
 */
import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import {
  SlideUpPush,
  ScaleBlurReveal,
  WipeReveal,
  MorphZoom,
  SplitSlide,
} from './components/PageTransitions';
import { COLORS, FONTS } from './constants';

const IMAGE = 'sigma-demo/sigma_investor_hero.png';
const BADGE = { color: '#10b981', label: 'A' };
const CAPTION = 'Generated landing page — live in one message.';
const SEGMENT = 150; // frames per transition

const TRANSITIONS = [
  { name: '1. Slide Up Push', Component: SlideUpPush },
  { name: '2. Scale Blur Reveal', Component: ScaleBlurReveal },
  { name: '3. Wipe Reveal', Component: WipeReveal },
  { name: '4. Morph Zoom', Component: MorphZoom },
  { name: '5. Split Slide', Component: SplitSlide },
] as const;

/** Label pill that fades in at frame 0 of each sequence and out by frame 15 */
const TransitionLabel: React.FC<{ name: string }> = ({ name }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 5, 10, 15], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 20,
        opacity,
        background: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        padding: '8px 18px',
      }}
    >
      <span
        style={{
          fontFamily: FONTS.heading,
          fontSize: 20,
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '0.02em',
        }}
      >
        {name}
      </span>
    </div>
  );
};

export const TransitionShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {TRANSITIONS.map(({ name, Component }, i) => (
        <Sequence key={name} from={i * SEGMENT} durationInFrames={SEGMENT}>
          <Component
            image={IMAGE}
            badge={BADGE}
            caption={CAPTION}
          />
          <TransitionLabel name={name} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
