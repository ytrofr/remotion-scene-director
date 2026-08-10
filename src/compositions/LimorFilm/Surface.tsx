import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { tokens } from './timing';

const P = tokens.palette;
const { width, height } = tokens.canvas;

/**
 * The mineral surface everything sits on, plus grain.
 *
 * Flat #000 reads as "digital black" and makes typography look like a slide. A warm
 * near-black with a slow off-centre light fall and a little grain reads as a MATERIAL -
 * limestone, dark stone, paper under low light - which is the world the brief asks for.
 */

export const Surface: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: P.mineral }}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <radialGradient id="limor-fall" cx="38%" cy="34%" r="78%">
          <stop offset="0%" stopColor={P.limestone} stopOpacity={0.85} />
          <stop offset="48%" stopColor={P.mineralWarm} stopOpacity={0.5} />
          <stop offset="100%" stopColor={P.mineral} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#limor-fall)" />
    </svg>
  </AbsoluteFill>
);

/**
 * Film grain. The seed steps with the frame so the grain MOVES - a static noise plate
 * reads as a dirty lens instead of as film. Deterministic (frame-derived, never
 * random) so both tournament arms and every re-render agree.
 */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 12;

  return (
    <AbsoluteFill style={{ opacity: tokens.grain.opacity, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <svg width={width} height={height}>
        <filter id={`limor-grain-${seed}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={width} height={height} filter={`url(#limor-grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Vignette. Keeps the eye centred without ever reading as a lens effect. */
export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <radialGradient id="limor-vignette" cx="50%" cy="50%" r="72%">
          <stop offset="55%" stopColor={P.mineral} stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#limor-vignette)" />
    </svg>
  </AbsoluteFill>
);
