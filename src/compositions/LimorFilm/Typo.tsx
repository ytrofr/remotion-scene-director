import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { sec, tokens, EASE } from './timing';

const P = tokens.palette;
const T = tokens.type;
const M = tokens.motion;

const ease = Easing.bezier(...(EASE as unknown as [number, number, number, number]));

export type Weight = 300 | 400 | 500;
export type Size = keyof typeof T.scale;

/**
 * Every piece of type in this film enters the same way: opacity plus a short vertical
 * settle, on one restrained ease. There is deliberately no scale, no blur, no
 * character-by-character stagger and no overshoot available here - the brief asks for
 * "restrained motion", and the cheapest way to guarantee that is to make the flashy
 * options impossible to reach rather than merely discouraged.
 */
export const useEnter = (delay: number, holdFrames?: number) => {
  const frame = useCurrentFrame();
  const t = frame - delay;

  const opacity = interpolate(t, [0, M.fadeInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  const out = holdFrames === undefined
    ? 1
    : interpolate(t, [holdFrames, holdFrames + M.fadeOutFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: ease,
      });

  const y = interpolate(t, [0, M.settleFrames], [M.riseDistance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  return { opacity: opacity * out, y };
};

const baseStyle = (size: Size, weight: Weight, color: string): React.CSSProperties => ({
  fontFamily: `${T.family}, system-ui, sans-serif`,
  fontSize: T.scale[size],
  fontWeight: weight,
  letterSpacing: `${(T.tracking as Record<string, number>)[size] ?? 0}em`,
  lineHeight: T.leading,
  color,
  margin: 0,
  whiteSpace: 'pre-wrap',
});

export const Line: React.FC<{
  children: React.ReactNode;
  delay?: number;
  hold?: number;
  size?: Size;
  weight?: Weight;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, hold, size = 'statement', weight = 300, color = P.bone, style }) => {
  const { opacity, y } = useEnter(delay, hold);
  return (
    <div
      style={{
        ...baseStyle(size, weight, color),
        opacity,
        transform: `translateY(${y}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Centred single statement - the film's default posture. Extreme negative space. */
export const Statement: React.FC<{
  children: React.ReactNode;
  delay?: number;
  hold?: number;
  size?: Size;
  weight?: Weight;
  color?: string;
  maxWidth?: number;
}> = ({ children, delay = 0, hold, size = 'statement', weight = 300, color = P.bone, maxWidth = 1340 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 220px',
    }}
  >
    <Line delay={delay} hold={hold} size={size} weight={weight} color={color} style={{ maxWidth, textAlign: 'center' }}>
      {children}
    </Line>
  </div>
);

/** Left-aligned stack, revealed top to bottom. Used where the brief lists ideas. */
export const Stack: React.FC<{
  items: string[];
  delay?: number;
  step?: number;
  hold?: number;
  size?: Size;
  weight?: Weight;
  color?: string;
  align?: 'center' | 'left';
  gap?: number;
}> = ({ items, delay = 0, step = sec(0.5), hold, size = 'line', weight = 300, color = P.bone, align = 'center', gap = 22 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      justifyContent: 'center',
      gap,
      padding: align === 'center' ? '0 220px' : '0 260px',
    }}
  >
    {items.map((it, i) => (
      <Line
        key={it}
        delay={delay + i * step}
        hold={hold === undefined ? undefined : hold - i * step}
        size={size}
        weight={weight}
        color={color}
        style={{ textAlign: align }}
      >
        {it}
      </Line>
    ))}
  </div>
);

export const palette = P;
export const typeScale = T;
