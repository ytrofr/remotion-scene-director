import cutsheetJson from './cutsheet.json';
import tokensJson from './tokens.json';

export type ScatterItem = { t: string; x: number; y: number };

export type CutFrame = {
  id: string;
  act: string;
  start: number;
  dur: number;
  kind: string;
  note?: string;
  items?: (string | ScatterItem)[];
  keepPrevious?: boolean;
  a?: string;
  b?: string;
  swapAt?: number;
  sequence?: string[];
  final?: string | string[];
  finalAt?: number;
  silenceAt?: number;
  text?: string;
  seedPoint?: boolean;
  growPathway?: boolean;
  hero?: boolean;
  recall?: boolean;
  resolved?: boolean;
  tail?: string[];
  wordmark?: string;
  wordmarkAt?: number;
  slogan?: string;
  sloganAt?: number;
  holdSeconds?: number;
};

export const cutsheet = cutsheetJson as unknown as {
  title: string;
  totalSeconds: number;
  fps: number;
  vo: { id: string; at: number; text: string }[];
  audio: { beds: { id: string; start: number; end: number; peak: number }[] };
  frames: CutFrame[];
};

export const tokens = tokensJson;
export const FPS = cutsheet.fps;

/** Seconds to frames. The cut sheet speaks in seconds; Remotion counts frames. */
export const sec = (s: number) => Math.round(s * FPS);

export const getFrame = (id: string): CutFrame => {
  const f = cutsheet.frames.find((x) => x.id === id);
  if (!f) throw new Error(`cutsheet: no frame "${id}"`);
  return f;
};

/** Strings only - the scatter frames carry positioned objects instead. */
export const stringItems = (f: CutFrame): string[] =>
  (f.items ?? []).filter((i): i is string => typeof i === 'string');

export const scatterItems = (f: CutFrame): ScatterItem[] =>
  (f.items ?? []).filter((i): i is ScatterItem => typeof i === 'object');

/**
 * Deterministic PRNG. The organic network must land in exactly the same place on
 * every render and in both tournament arms, so nothing here may use Math.random.
 */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Restrained ease. No overshoot anywhere in this film. */
export const EASE = [0.22, 0.61, 0.36, 1] as const;
