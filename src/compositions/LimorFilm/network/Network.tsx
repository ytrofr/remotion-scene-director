import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { NODES, LINKS, drift, linkPath, type Link } from './model';
import { sec, tokens } from '../timing';

const P = tokens.palette;
const { width, height } = tokens.canvas;
const GROW = tokens.network.growthFrames;

/**
 * The film's spine. It persists ACROSS every frame of the cut sheet rather than living
 * inside any one of them, because the whole point is that it accumulates: fragmentation
 * to connection to memory to one entity.
 *
 * Restraint is the hard part here. The brief is explicit that the structure must never
 * get brighter or more technological as it matures - it gets more COHERENT, and by the
 * end it should be "impressive because it belongs", not because it glows. So the
 * opacity envelope PEAKS in the middle of the film and decays through the last act.
 */

const SEED_AT = sec(25.5);   // F5 - the single warm point
const GROW_FROM = sec(31.5); // F6 - first pathway, with the first question
const GROW_TO = sec(75.5);   // structure essentially complete
const MATURE_AT = sec(81.5); // begins receding into the surface
const CLEAR_AT = sec(96.0);  // gone before the brand reveal

const linkBirth = (l: Link) => GROW_FROM + l.order * (GROW_TO - GROW_FROM);

/** A node fades in with the first pathway that reaches it. */
const nodeBirths = (() => {
  const births = new Map<number, number>();
  births.set(0, SEED_AT);
  for (const l of LINKS) {
    const b = linkBirth(l);
    for (const i of [l.a, l.b]) {
      if (!births.has(i) || births.get(i)! > b) births.set(i, b);
    }
  }
  return births;
})();

/** Point on the quadratic bezier, for the small amber tip that leads each pathway. */
const bezierAt = (t: number, ax: number, ay: number, cx: number, cy: number, bx: number, by: number) => {
  const u = 1 - t;
  return { x: u * u * ax + 2 * u * t * cx + t * t * bx, y: u * u * ay + 2 * u * t * cy + t * t * by };
};

export const Network: React.FC<{ opacityScale?: number }> = ({ opacityScale = 1 }) => {
  const frame = useCurrentFrame();

  const envelope = interpolate(
    frame,
    [GROW_FROM, sec(60), MATURE_AT, CLEAR_AT],
    [0, 0.55, 0.55, 0.16],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const positions = useMemo(
    () => NODES.map((n) => ({ n, ...drift(n, frame) })),
    [frame]
  );

  const seedGlow = interpolate(frame, [SEED_AT, SEED_AT + sec(1.2)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < SEED_AT) return null;

  return (
    <AbsoluteFill style={{ opacity: opacityScale }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g opacity={envelope}>
          {LINKS.map((l, i) => {
            const born = linkBirth(l);
            if (frame < born) return null;
            const progress = Math.min(1, (frame - born) / GROW);
            const a = positions[l.a];
            const b = positions[l.b];
            const d = linkPath(a.x, a.y, b.x, b.y, l.bow);
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={P.clay}
                strokeWidth={l.w}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - progress}
                opacity={0.42 + l.order * 0.2}
              />
            );
          })}

          {/* The leading tip. One small warm point per pathway, only while it grows. */}
          {LINKS.map((l, i) => {
            const born = linkBirth(l);
            const progress = (frame - born) / GROW;
            if (progress < 0 || progress >= 1) return null;
            const a = positions[l.a];
            const b = positions[l.b];
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const p = bezierAt(progress, a.x, a.y, mx + (-dy / len) * l.bow, my + (dx / len) * l.bow, b.x, b.y);
            return <circle key={`t${i}`} cx={p.x} cy={p.y} r={1.6} fill={P.amber} opacity={0.7 * (1 - progress)} />;
          })}

          {positions.map(({ n, x, y }) => {
            const born = nodeBirths.get(n.i) ?? Infinity;
            if (frame < born) return null;
            const fade = Math.min(1, (frame - born) / sec(0.9));
            return <circle key={n.i} cx={x} cy={y} r={n.r} fill={P.sand} opacity={0.5 * fade} />;
          })}
        </g>

        {/* The seed itself outlives the envelope - it is the point the film opens onto. */}
        <circle
          cx={positions[0].x}
          cy={positions[0].y}
          r={3.4}
          fill={P.amber}
          opacity={seedGlow * interpolate(frame, [MATURE_AT, CLEAR_AT], [0.9, 0.25], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}
        />
      </svg>
    </AbsoluteFill>
  );
};
