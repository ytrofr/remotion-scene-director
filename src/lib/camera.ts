/**
 * A 2D camera with depth.
 *
 * The measured defect in SigmaFilm v1 was that nothing had a camera and nothing had a
 * z-position: every element sat on one plane and only its opacity changed. That reads as
 * a slide, because a slide is exactly what it is. Depth is what turns a layout into a
 * space, and a camera is what turns a space into a shot.
 *
 * The model: layers declare a DEPTH in [0, 1] (0 = at the camera, 1 = at infinity). The
 * camera declares a position, a zoom and a focus depth. Everything else - parallax,
 * scale, blur, haze - is DERIVED from the difference between the two. Nothing is
 * hand-tuned per layer, so a camera move stays coherent across every plane by
 * construction rather than by discipline.
 *
 * Everything here is pure and frame-driven. No Math.random (rule 26), no hidden state,
 * so two renders of the same frame are identical.
 */
import { interpolate, Easing } from 'remotion';

export type Camera = {
  /** Composition-space pan, in px, at depth 0. */
  x: number;
  y: number;
  /** Multiplier at depth 0. 1 = neutral. */
  zoom: number;
  /** Which depth is sharp. Everything else defocuses away from it. */
  focus: number;
};

export type CameraKey = Partial<Camera> & { at: number };

export const NEUTRAL: Camera = { x: 0, y: 0, zoom: 1, focus: 0.5 };

/**
 * Cinematic default. Slow to leave, long to arrive - the curve that reads as expensive.
 * A linear ramp is the single most-cited "generic" tell, and v1 used it everywhere by
 * accident (it declared an EASE constant and never consumed it).
 */
export const CINE = Easing.bezier(0.16, 1, 0.3, 1);
/** For a camera that must feel driven rather than gliding. */
export const DRIVE = Easing.bezier(0.65, 0, 0.35, 1);

const lerpKey = (
  t: number,
  keys: CameraKey[],
  field: keyof Camera,
  easing: (n: number) => number,
): number => {
  const pts = keys.filter((k) => k[field] !== undefined);
  if (pts.length === 0) return NEUTRAL[field];
  if (pts.length === 1) return pts[0][field] as number;
  const times = pts.map((p) => p.at);
  const vals = pts.map((p) => p[field] as number);
  return interpolate(t, times, vals, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
};

/**
 * Resolve the camera at time `t` (seconds) from sparse keyframes.
 *
 * Each field interpolates independently, so a pan can finish while a zoom is still
 * travelling. Ending every property on the same frame is what makes motion feel
 * mechanical; offsetting them is follow-through.
 */
export const cameraAt = (
  t: number,
  keys: CameraKey[],
  easing: (n: number) => number = CINE,
): Camera => ({
  x: lerpKey(t, keys, 'x', easing),
  y: lerpKey(t, keys, 'y', easing),
  zoom: lerpKey(t, keys, 'zoom', easing),
  focus: lerpKey(t, keys, 'focus', easing),
});

/**
 * How strongly a plane responds to the camera. Near planes move and scale more.
 * This single function is what produces parallax; there is no per-layer tuning.
 */
const response = (depth: number) => 1 - clamp01(depth) * 0.92;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** The CSS transform for a layer sitting at `depth`. */
export const planeTransform = (cam: Camera, depth: number): string => {
  const r = response(depth);
  const scale = 1 + (cam.zoom - 1) * r;
  return `translate3d(${(-cam.x * r).toFixed(3)}px, ${(-cam.y * r).toFixed(3)}px, 0) scale(${scale.toFixed(4)})`;
};

/**
 * Defocus as a function of distance from the focal plane.
 *
 * Blurring the whole frame is an effect; blurring by depth is a lens. `maxBlur` is the
 * px at full separation - keep it small for background haze, larger for a foreground
 * occluder that is meant to read as out-of-frame.
 */
export const depthBlur = (cam: Camera, depth: number, maxBlur = 8): number =>
  Math.abs(clamp01(depth) - clamp01(cam.focus)) * maxBlur;

/**
 * Atmospheric perspective. Distant things lose contrast and gain haze before they lose
 * detail. Without this, layered planes read as flat cards sliding past each other.
 */
export const atmosphere = (depth: number) => {
  const d = clamp01(depth);
  return { opacity: 1 - d * 0.55, saturate: 1 - d * 0.35 };
};

/** Everything a layer needs, in one call. Spread onto a div's style. */
export const planeStyle = (
  cam: Camera,
  depth: number,
  opts: { maxBlur?: number; haze?: boolean } = {},
): React.CSSProperties => {
  const { maxBlur = 8, haze = true } = opts;
  const blur = depthBlur(cam, depth, maxBlur);
  const air = atmosphere(depth);
  const filters = [blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : '', haze ? `saturate(${air.saturate.toFixed(3)})` : '']
    .filter(Boolean)
    .join(' ');
  return {
    transform: planeTransform(cam, depth),
    transformOrigin: 'center center',
    ...(filters ? { filter: filters } : {}),
    ...(haze ? { opacity: air.opacity } : {}),
    willChange: 'transform',
  };
};

/**
 * A push-in expressed as keyframes, so it composes with whatever else the camera does.
 * `toward` is a composition-space point the camera moves toward - a push-in that does
 * not also translate reads as a UI zoom, not as cinematography.
 */
export const pushIn = (
  from: number,
  to: number,
  toward: { x: number; y: number },
  zoomTo = 1.35,
): CameraKey[] => [
  { at: from, zoom: 1, x: 0, y: 0 },
  { at: to, zoom: zoomTo, x: toward.x, y: toward.y },
];

/** A focus pull. The background falls away and the foreground resolves. */
export const focusPull = (from: number, to: number, fromDepth: number, toDepth: number): CameraKey[] => [
  { at: from, focus: fromDepth },
  { at: to, focus: toDepth },
];
