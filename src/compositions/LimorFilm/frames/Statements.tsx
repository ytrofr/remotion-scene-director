import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { sec, tokens, EASE, getFrame, stringItems, type CutFrame } from '../timing';
import { Line, Statement, Stack } from '../Typo';

const P = tokens.palette;
const ease = Easing.bezier(...(EASE as unknown as [number, number, number, number]));

/**
 * The statement frames. One major idea on screen at a time, which is the brief's
 * central typographic rule - so every component here renders exactly one thought and
 * gets out of the way.
 */

/**
 * A replaced B. The film's most-used move: hold a truth, remove it, replace it with
 * the truth that reframes it. The outgoing line must be GONE before the incoming one
 * arrives; a crossfade would let the viewer read them as a pair rather than as a turn.
 */
export const Swap: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const f = getFrame(id);
  const at = sec(f.swapAt ?? 0);
  const tail = f.tail ?? [];

  return (
    <>
      {frame < at && (
        <Statement hold={at - sec(0.5)} weight={300} color={P.sand}>
          {f.a}
        </Statement>
      )}
      {frame >= at && tail.length === 0 && (
        <Statement delay={at} weight={400} color={P.bone}>
          {f.b}
        </Statement>
      )}
      {frame >= at && tail.length > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 30,
          }}
        >
          <Line delay={at} size="statement" weight={400} color={P.bone} style={{ textAlign: 'center' }}>
            {f.b}
          </Line>
          {tail.map((s, i) => (
            <Line
              key={s}
              delay={at + sec(0.7) + i * sec(0.34)}
              size="fragment"
              weight={300}
              color={P.clay}
              style={{ textAlign: 'center' }}
            >
              {s}
            </Line>
          ))}
        </div>
      )}
    </>
  );
};

/**
 * F5 - the door opens. Almost empty frame, one tiny warm point, and the question is
 * NOT answered. The seed point is drawn by Network; here we only make room for it.
 */
export const Question: React.FC = () => {
  const f = getFrame('F5');
  return (
    <Statement delay={sec(0.9)} size="hero" weight={300} color={P.bone} maxWidth={1500}>
      {f.text}
    </Statement>
  );
};

/**
 * F6 - one question at a time, each owning the whole frame. Deliberately no overlap
 * between them: the pause between questions is the content.
 */
export const Questions: React.FC = () => {
  const frame = useCurrentFrame();
  const items = stringItems(getFrame('F6'));
  const slot = sec(getFrame('F6').dur) / items.length;
  const index = Math.min(items.length - 1, Math.floor(frame / slot));

  return (
    <Statement key={index} delay={index * slot} hold={slot - sec(0.28)} size="question" weight={300} color={P.bone}>
      {items[index]}
    </Statement>
  );
};

/** F7, F13, F19, F23 - stacked lines revealed in order. */
export const StackFrame: React.FC<{ id: string }> = ({ id }) => {
  const f = getFrame(id);
  const items = stringItems(f);
  const step = sec(f.dur) / (items.length + 1.4);

  return (
    <Stack
      items={items}
      delay={sec(0.3)}
      step={step}
      size={f.hero ? 'statement' : 'line'}
      weight={f.hero ? 400 : 300}
      color={f.resolved || f.hero ? P.bone : P.sand}
      gap={f.hero ? 30 : 20}
    />
  );
};

/**
 * F10 - a sentence someone actually said, which dissolves into the structure and
 * leaves a pathway behind. Quoted, sentence-cased against the film's uppercase, so it
 * reads as speech rather than as a headline.
 */
export const Dissolve: React.FC = () => {
  const frame = useCurrentFrame();
  const items = stringItems(getFrame('F10'));
  const slot = sec(getFrame('F10').dur) / items.length;
  const index = Math.min(items.length - 1, Math.floor(frame / slot));
  const local = frame - index * slot;

  const dissolveOut = interpolate(local, [slot * 0.55, slot * 0.95], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const drift = interpolate(local, [slot * 0.55, slot * 0.95], [0, -16], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: dissolveOut,
        transform: `translateY(${drift}px)`,
      }}
    >
      <Line key={index} delay={index * slot} size="line" weight={300} color={P.bone} style={{ textAlign: 'center' }}>
        {items[index]}
      </Line>
    </div>
  );
};

/** F11 - a conversation becomes a rule becomes a tool becomes capability. */
export const Chain: React.FC = () => {
  const frame = useCurrentFrame();
  const f = getFrame('F11');
  const items = stringItems(f);
  const step = sec(0.46);
  const finalAt = sec(2.1);

  if (frame >= finalAt) {
    return (
      <Statement delay={finalAt} size="line" weight={400} color={P.bone}>
        {f.final as string}
      </Statement>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      {items.map((s, i) => (
        <Line key={s} delay={i * step} size="fragment" weight={300} color={i === items.length - 1 ? P.bone : P.sand}>
          {s}
        </Line>
      ))}
    </div>
  );
};

/**
 * F14 - single words owning the whole frame. The brief names these exactly:
 * REMEMBER. LEARN. DECIDE. ACT. EVOLVE.
 */
export const Words: React.FC = () => {
  const frame = useCurrentFrame();
  const f = getFrame('F14');
  const items = stringItems(f);
  const slot = sec(f.dur) / items.length;
  const index = Math.min(items.length - 1, Math.floor(frame / slot));

  return (
    <Statement key={index} delay={index * slot} hold={slot - sec(0.14)} size="hero" weight={300} color={P.bone}>
      {items[index]}
    </Statement>
  );
};

/**
 * F21 - mutual evolution. Two lines that mirror each other, arriving from opposite
 * sides of the centre line and settling level. No hearts, no pets, no characters.
 */
export const Mutual: React.FC = () => {
  const frame = useCurrentFrame();
  const f = getFrame('F21');
  const second = sec(1.15);

  const slide = (delay: number, from: number) =>
    interpolate(frame - delay, [0, sec(1.1)], [from, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ease,
    });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 34,
      }}
    >
      <Line delay={0} size="line" weight={300} color={P.sand} style={{ transform: `translateX(${slide(0, -34)}px)` }}>
        {f.a}
      </Line>
      <Line delay={second} size="line" weight={300} color={P.sand} style={{ transform: `translateX(${slide(second, 34)}px)` }}>
        {f.b}
      </Line>
    </div>
  );
};

export const byKind = (f: CutFrame): React.ReactNode => {
  switch (f.kind) {
    case 'swap': return <Swap id={f.id} />;
    case 'question': return <Question />;
    case 'questions': return <Questions />;
    case 'stack': return <StackFrame id={f.id} />;
    case 'dissolve': return <Dissolve />;
    case 'chain': return <Chain />;
    case 'words': return <Words />;
    case 'mutual': return <Mutual />;
    default: return null;
  }
};
