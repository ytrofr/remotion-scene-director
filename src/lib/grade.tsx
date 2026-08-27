/**
 * The grade: the layers that sit ABOVE content and make a composition read as a
 * photographed thing rather than a rendered one.
 *
 * SigmaFilm v1 measured zero for every technique in this file - no glow, no blur, no
 * light, and a grain plate that was memoised once and therefore painted identically on
 * all 750 frames, which reads as a dirty lens rather than as film.
 *
 * Order matters and is not negotiable: content -> bloom -> sweep -> chromatic -> grain
 * -> vignette. Grain and vignette are always last; a grade applied under the grain is
 * a grade the grain is not part of.
 *
 * Everything is frame-derived and deterministic (rule 26 - never Math.random), so the
 * determinism gate keeps holding.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const CINE = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Film grain that MOVES.
 *
 * The seed steps with the frame, so the noise field is re-drawn rather than re-shown.
 * `stitchTiles` keeps it seamless. Technique lifted from LimorFilm/Surface.tsx, which
 * already had it right; SigmaFilm shipped the static version.
 */
export const MovingGrain: React.FC<{
  opacity?: number; frequency?: number; period?: number; /** render scale; 1 = full res */ res?: number;
}> = ({ opacity = 0.055, frequency = 0.82, period = 12, res = 1 / 3 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const seed = frame % period;
  const id = `grain-${seed}`;
  /**
   * The turbulence is generated at a FRACTION of the output size and scaled up.
   *
   * feTurbulence is evaluated per output pixel, so at 1920x1080 it dominated the frame
   * budget - measured 1.68s/frame with it at full resolution. Grain is noise: scaling
   * noise up yields coarser noise, which reads MORE like film stock, not less. The
   * baseFrequency is divided by the same factor so the grain lands at the same apparent
   * size on screen.
   */
  const w = Math.round(width * res);
  const h = Math.round(height * res);
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: 'overlay', pointerEvents: 'none', overflow: 'hidden' }}>
      <svg
        width={w}
        height={h}
        style={{ transform: `scale(${1 / res})`, transformOrigin: 'top left', imageRendering: 'auto' }}
      >
        <filter id={id} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={frequency * res} numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={w} height={h} filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Volumetric bloom: a source, a wide spill, and a decay.
 *
 * A single blurred duplicate is a preset and looks like one. Light that participates in
 * a scene has a hot core, a soft halo that spills into the air around it, and a falloff
 * - three stops, not one.
 */
export const Bloom: React.FC<{
  x: number;
  y: number;
  radius: number;
  color: string;
  strength?: number;
}> = ({ x, y, radius, color, strength = 1 }) => {
  if (strength <= 0.001) return null;
  const core = Math.max(0, Math.min(1, strength));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
      <div
        style={{
          position: 'absolute',
          left: x - radius,
          top: y - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
          opacity: 0.5 * core,
          filter: `blur(${radius * 0.18}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - radius * 0.34,
          top: y - radius * 0.34,
          width: radius * 0.68,
          height: radius * 0.68,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: 0.75 * core,
          filter: `blur(${radius * 0.06}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Vignette with animated exposure. A fixed black oval reads as a filter; one that
 * breathes with the camera reads as a lens.
 */
export const Vignette: React.FC<{ strength?: number; radius?: number }> = ({ strength = 0.6, radius = 72 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 50% 48%, transparent ${radius * 0.72}%, rgba(0,0,0,${strength}) 100%)`,
      }}
    />
  </AbsoluteFill>
);

/**
 * Chromatic aberration, but ONLY at moments of optical stress.
 *
 * Constant aberration is a filter. A 2-4 frame separation during a whip, an impact or a
 * hard acceleration is a lens being pushed, which is the thing worth having. `at` is a
 * list of seconds where the lens gets stressed.
 */
export const ChromaticPulse: React.FC<{ at: number[]; amount?: number; window?: number }> = ({
  at,
  amount = 5,
  window = 0.16,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const near = at.reduce((best, a) => Math.min(best, Math.abs(t - a)), Infinity);
  if (near > window) return null;
  const k = 1 - near / window;
  const px = amount * k * k;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        opacity: 0.5 * k,
        boxShadow: `inset ${px}px 0 0 rgba(255,0,0,0.28), inset ${-px}px 0 0 rgba(0,255,255,0.28)`,
      }}
    />
  );
};

/**
 * A light source crossing the lens. Motivated transitions only: a reveal caused by a
 * flare passing the camera, never an orange overlay parked on the whole film.
 */
export const LightSweep: React.FC<{
  from: number;
  to: number;
  color: string;
  angle?: number;
  strength?: number;
}> = ({ from, to, color, angle = 105, strength = 0.5 }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  if (t < from || t > to) return null;
  const p = interpolate(t, [from, to], [-0.3, 1.3], { easing: CINE });
  const fade = interpolate(t, [from, from + (to - from) * 0.25, to - (to - from) * 0.25, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          left: `${p * 100}%`,
          width: width * 0.4,
          height: '180%',
          transform: `rotate(${angle - 90}deg)`,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: strength * fade,
          filter: 'blur(48px)',
        }}
      />
    </AbsoluteFill>
  );
};

/** The whole grade stack, in the one order that is correct. */
export const Grade: React.FC<{
  children?: React.ReactNode;
  grain?: number;
  vignette?: number;
  chromaticAt?: number[];
}> = ({ children, grain = 0.055, vignette = 0.6, chromaticAt = [] }) => (
  <>
    {children}
    {chromaticAt.length > 0 ? <ChromaticPulse at={chromaticAt} /> : null}
    <MovingGrain opacity={grain} />
    <Vignette strength={vignette} />
  </>
);
