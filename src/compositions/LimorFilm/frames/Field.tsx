import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { sec, tokens, EASE, getFrame, scatterItems, stringItems, type ScatterItem } from '../timing';
import { Line, Statement } from '../Typo';
import { NODES } from '../network/model';

const P = tokens.palette;
const T = tokens.type;
const { width, height } = tokens.canvas;
const ease = Easing.bezier(...(EASE as unknown as [number, number, number, number]));

/**
 * The word field - Act I's "thousands of moving parts that do not know one another",
 * and its mirror in Act V where the same words rejoin as organs of one mind.
 *
 * The words are deliberately NOT on a grid and NOT aligned to each other. Each one
 * also drifts on its own phase, so the field reads as independent objects sharing a
 * space rather than as a layout.
 */

const wordDrift = (frame: number, seed: number) => {
  const t = frame / 190 + seed * 7.3;
  return { x: Math.sin(t) * 7, y: Math.cos(t * 0.81) * 5 };
};

export const WordField: React.FC<{
  items: ScatterItem[];
  startDelay?: number;
  step?: number;
  size?: keyof typeof T.scale;
  color?: string;
  dim?: number;
  /** 0 = in place, 1 = fully collapsed onto the centre point. */
  converge?: number;
}> = ({ items, startDelay = 0, step = sec(0.22), size = 'word', color = P.sand, dim = 1, converge = 0 }) => {
  const frame = useCurrentFrame();
  const cx = width * 0.5;
  const cy = height * 0.52;

  return (
    <AbsoluteFill>
      {items.map((it, i) => {
        const delay = startDelay + i * step;
        const t = frame - delay;
        if (t < 0) return null;

        const appear = interpolate(t, [0, sec(0.9)], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease,
        });
        const d = wordDrift(frame, i);
        const px = it.x * width + d.x;
        const py = it.y * height + d.y;
        const x = px + (cx - px) * converge;
        const y = py + (cy - py) * converge;

        return (
          <div
            key={it.t}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              fontFamily: `${T.family}, system-ui, sans-serif`,
              fontSize: T.scale[size],
              fontWeight: 300,
              letterSpacing: `${T.tracking.word}em`,
              color,
              opacity: appear * dim * (1 - converge * 0.85),
              whiteSpace: 'nowrap',
            }}
          >
            {it.t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** F1 - the twelve standing words. */
export const Scatter: React.FC = () => (
  <WordField items={scatterItems(getFrame('F1'))} startDelay={sec(0.4)} step={sec(0.34)} />
);

/**
 * F2 - specific fragments arrive BETWEEN the standing words and the field gets denser
 * and slightly harder to follow. The F1 words stay, dimmed, because the point is
 * accumulation: nothing was resolved, there is simply more of it.
 */
export const ScatterDense: React.FC = () => (
  <>
    <WordField items={scatterItems(getFrame('F1'))} dim={0.4} />
    <WordField
      items={scatterItems(getFrame('F2'))}
      startDelay={sec(0.15)}
      step={sec(0.36)}
      size="fragment"
      color={P.clay}
    />
  </>
);

/**
 * F4 - everything moves toward one central invisible point while the phrases arrive.
 * The convergence is the visual argument: it all has to pass through one person.
 */
export const Converge: React.FC = () => {
  const frame = useCurrentFrame();
  const f = getFrame('F4');
  const seq = f.sequence ?? [];
  const finalAt = sec(f.finalAt ?? 0);

  const collapse = interpolate(frame, [0, sec(4.6)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  const step = sec(0.82);

  return (
    <>
      <WordField items={scatterItems(getFrame('F1'))} dim={0.5} converge={collapse} />
      <WordField items={scatterItems(getFrame('F2'))} dim={0.32} size="fragment" converge={collapse} />

      {frame < finalAt &&
        seq.map((s, i) => (
          <Statement key={s} delay={i * step} hold={step - sec(0.18)} size="line" color={P.bone}>
            {s}
          </Statement>
        ))}

      {frame >= finalAt && (
        <Statement delay={finalAt} size="statement" weight={400} color={P.bone}>
          {f.final as string}
        </Statement>
      )}
    </>
  );
};

/** Words settle onto the structure itself rather than floating free. */
const onNodes = (items: string[], offset: number): ScatterItem[] =>
  items.map((t, i) => {
    const n = NODES[(i * 5 + offset) % NODES.length];
    return { t, x: n.x / width, y: n.y / height };
  });

/** F8 - the structure learns the people, the products, the branches, the language. */
export const Orbit: React.FC = () => (
  <WordField items={onNodes(stringItems(getFrame('F8')), 9)} startDelay={sec(0.1)} step={sec(0.36)} color={P.sand} />
);

/**
 * F12 - the module words return exactly as separate as they began, then join the same
 * structure. Same words, same treatment as F1, different destination.
 */
export const Rejoin: React.FC = () => {
  const frame = useCurrentFrame();
  const items = stringItems(getFrame('F12'));
  const scattered = scatterItems(getFrame('F1'));

  const join = interpolate(frame, [sec(1.1), sec(2.9)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  const targets = onNodes(items, 3);
  const placed: ScatterItem[] = items.map((t, i) => {
    const from = scattered[i % scattered.length];
    const to = targets[i];
    return { t, x: from.x + (to.x - from.x) * join, y: from.y + (to.y - from.y) * join };
  });

  return <WordField items={placed} startDelay={0} step={sec(0.12)} color={P.sand} />;
};

/**
 * F16 - each particle briefly carries one concept before joining the pattern.
 * "One pixel is information. Thousands become understanding." Never literal pixels.
 */
export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const f = getFrame('F16');
  const items = stringItems(f);
  const final = (f.final as string[]) ?? [];
  const finalAt = sec(1.7);

  const placed = onNodes(items, 17);

  return (
    <>
      {frame < finalAt && (
        <WordField items={placed} startDelay={0} step={sec(0.12)} size="whisper" color={P.clay} />
      )}
      {frame >= finalAt && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
          }}
        >
          {final.map((s, i) => (
            <Line key={s} delay={finalAt + i * sec(0.4)} size="line" color={i === 1 ? P.bone : P.sand}>
              {s}
            </Line>
          ))}
        </div>
      )}
    </>
  );
};
