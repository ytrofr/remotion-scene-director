import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { sec, tokens, EASE, getFrame } from '../timing';
import { Line } from '../Typo';

const P = tokens.palette;
const T = tokens.type;
const { width, height } = tokens.canvas;
const ease = Easing.bezier(...(EASE as unknown as [number, number, number, number]));

/**
 * The brand reveal.
 *
 * Everything the brief asks for here is a subtraction: silence, an empty mineral
 * surface, the wordmark ALONE first, the slogan arriving late and never spoken, and a
 * hold of at least four seconds ending in complete quiet. The one addition is a faint
 * trace of warm light moving through the surface - the last echo of the network,
 * almost below the threshold of notice.
 */

const Trace: React.FC = () => {
  const frame = useCurrentFrame();

  // A single slow sweep. Peaks early, then recedes so the final hold is genuinely still.
  const travel = interpolate(frame, [0, sec(7.5)], [-0.25, 1.25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });
  const strength = interpolate(frame, [0, sec(1.8), sec(4.2), sec(7.0)], [0, 0.5, 0.28, 0.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: strength }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <radialGradient id="limor-trace" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={P.amber} stopOpacity={0.5} />
            <stop offset="55%" stopColor={P.amberDim} stopOpacity={0.14} />
            <stop offset="100%" stopColor={P.amber} stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={travel * width} cy={height * 0.52} rx={620} ry={280} fill="url(#limor-trace)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const f = getFrame('REVEAL');
  const markAt = sec(f.wordmarkAt ?? 1);
  const sloganAt = sec(f.sloganAt ?? 3.5);

  // The wordmark's tracking settles as it arrives - the only letter-spacing move in the
  // whole film, saved for the one word that matters.
  const tracking = interpolate(frame - markAt, [0, sec(2.2)], [0.42, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.mineral }}>
      <Trace />
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 46,
        }}
      >
        <Line
          delay={markAt}
          size="hero"
          weight={300}
          color={P.bone}
          style={{ letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em` }}
        >
          {f.wordmark}
        </Line>

        <div style={{ height: 1, width: 168, backgroundColor: P.ash, opacity: frame >= sloganAt ? 0.7 : 0 }} />

        <Line
          delay={sloganAt}
          size="fragment"
          weight={300}
          color={P.sand}
          style={{ letterSpacing: `${T.tracking.fragment}em`, textAlign: 'center' }}
        >
          {f.slogan}
        </Line>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
