import { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { interpolate, Easing } from 'remotion';
import {
  HandPathPoint,
  HandPhysicsConfig,
  HandState,
  HandGesture,
  DEFAULT_PHYSICS,
} from './types';

/**
 * Custom smooth easing - starts slow, accelerates, then decelerates smoothly
 * Creates a natural "flowing" movement feel
 */
const smoothFlowEasing = (t: number): number => {
  // Custom bezier-like curve for smooth acceleration/deceleration
  // Slow start -> fast middle -> smooth end
  if (t < 0.3) {
    // Slow acceleration at start (ease-in)
    return Easing.out(Easing.quad)(t / 0.3) * 0.15;
  } else if (t < 0.7) {
    // Fast movement in middle
    const midT = (t - 0.3) / 0.4;
    return 0.15 + midT * 0.7;
  } else {
    // Smooth deceleration at end (ease-out)
    const endT = (t - 0.7) / 0.3;
    return 0.85 + Easing.out(Easing.cubic)(endT) * 0.15;
  }
};

/**
 * Even smoother easing using bezier curve
 */
const ultraSmoothEasing = (t: number): number => {
  // Bezier-like smooth curve with gentle acceleration
  return Easing.bezier(0.25, 0.1, 0.25, 1)(t);
};

/**
 * Pure computation: calculate hand state at a given frame.
 * Extracted for use outside Remotion context (e.g., SceneDirector live preview).
 */
export function computeHandState(
  frame: number,
  path: HandPathPoint[],
  startFrame: number = 0,
  physics: HandPhysicsConfig = DEFAULT_PHYSICS
): HandState {
  const relativeFrame = frame - startFrame;
  return computeHandStateInner(relativeFrame, path, physics);
}

/**
 * Pure computation: calculate float effect at a given frame.
 */
export function computeFloatEffect(
  frame: number,
  physics: HandPhysicsConfig = DEFAULT_PHYSICS
): { offsetY: number; shadowScale: number } {
  const offsetY = Math.sin(frame * physics.floatSpeed) * physics.floatAmplitude;
  const shadowScale = 1 + Math.sin(frame * physics.floatSpeed) * 0.1;
  return { offsetY, shadowScale };
}

/**
 * Hook to calculate hand state (position, rotation, gesture) at current frame
 * Handles path interpolation and physics-based effects with smooth flowing movement
 */
export function useHandAnimation(
  path: HandPathPoint[],
  startFrame: number = 0,
  physics: HandPhysicsConfig = DEFAULT_PHYSICS
): HandState {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  return useMemo(() => computeHandStateInner(relativeFrame, path, physics), [path, relativeFrame, physics]);
}

/**
 * Internal: pure hand state computation (shared by hook and standalone function)
 */
function computeHandStateInner(
  relativeFrame: number,
  path: HandPathPoint[],
  physics: HandPhysicsConfig
): HandState {
    if (path.length === 0) {
      return {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        gesture: 'pointer' as HandGesture,
        velocityX: 0,
        velocityY: 0,
        isMoving: false,
      };
    }

    if (path.length === 1) {
      const point = path[0];
      return {
        x: point.x,
        y: point.y,
        rotation: point.rotation || 0,
        scale: point.scale || 1,
        gesture: point.gesture || 'pointer',
        velocityX: 0,
        velocityY: 0,
        isMoving: false,
      };
    }

    // Build timeline from path
    const timeline: Array<{
      frame: number;
      x: number;
      y: number;
      gesture: HandGesture;
      scale: number;
      rotation?: number;
    }> = [];

    let currentFrame = 0;
    const defaultFramesPerSegment = 30;

    for (let i = 0; i < path.length; i++) {
      const point = path[i];

      if (point.frame !== undefined) {
        currentFrame = point.frame;
      }

      timeline.push({
        frame: currentFrame,
        x: point.x,
        y: point.y,
        gesture: point.gesture || 'pointer',
        scale: point.scale || 1,
        rotation: point.rotation,
      });

      // Add pause duration if specified
      if (point.duration) {
        currentFrame += point.duration;
      }

      // Add travel time to next point
      if (i < path.length - 1) {
        const nextPoint = path[i + 1];
        if (nextPoint.frame === undefined) {
          currentFrame += defaultFramesPerSegment;
        }
      }
    }

    // Find current segment
    let segmentIndex = 0;
    for (let i = 0; i < timeline.length - 1; i++) {
      if (relativeFrame >= timeline[i].frame && relativeFrame < timeline[i + 1].frame) {
        segmentIndex = i;
        break;
      }
      if (i === timeline.length - 2 && relativeFrame >= timeline[i + 1].frame) {
        segmentIndex = i;
      }
    }

    // Clamp to valid range
    if (relativeFrame < 0) {
      const first = timeline[0];
      return {
        x: first.x,
        y: first.y,
        rotation: first.rotation || 0,
        scale: first.scale,
        gesture: first.gesture,
        velocityX: 0,
        velocityY: 0,
        isMoving: false,
      };
    }

    const current = timeline[segmentIndex];
    const next = timeline[Math.min(segmentIndex + 1, timeline.length - 1)];

    // Calculate progress within segment
    const segmentDuration = next.frame - current.frame;
    const segmentProgress = segmentDuration > 0
      ? Math.min(1, Math.max(0, (relativeFrame - current.frame) / segmentDuration))
      : 1;

    // Use ultra-smooth easing for flowing movement
    const easedProgress = ultraSmoothEasing(segmentProgress);

    // Interpolate position with smooth curve
    const x = interpolate(easedProgress, [0, 1], [current.x, next.x]);
    const y = interpolate(easedProgress, [0, 1], [current.y, next.y]);

    // Calculate instantaneous velocity based on easing derivative
    // This gives us acceleration-aware velocity for rotation
    const deltaX = next.x - current.x;
    const deltaY = next.y - current.y;

    // Velocity peaks in the middle of movement (derivative of easing)
    const velocityMultiplier = Math.sin(segmentProgress * Math.PI); // Peaks at 0.5
    const velocityX = (deltaX / Math.max(1, segmentDuration)) * (1 + velocityMultiplier);
    const velocityY = (deltaY / Math.max(1, segmentDuration)) * (1 + velocityMultiplier);

    // Calculate rotation based on velocity direction and magnitude
    let rotation = 0;
    if (current.rotation !== undefined) {
      // Smooth interpolation of explicit rotation
      rotation = interpolate(
        Easing.out(Easing.cubic)(segmentProgress),
        [0, 1],
        [current.rotation, next.rotation || current.rotation]
      );
    } else {
      // Physics-based rotation: tilt toward movement direction
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

      // Calculate movement angle and apply smooth tilt
      if (speed > 0.1) {
        // Tilt based on horizontal movement direction
        const horizontalTilt = velocityX * physics.velocityScale * 2;

        // Add vertical component (diving/rising feel)
        const verticalTilt = velocityY * physics.velocityScale * 0.5;

        rotation = horizontalTilt + verticalTilt;

        // Apply smooth clamping
        const maxRot = physics.maxRotation;
        rotation = Math.tanh(rotation / maxRot) * maxRot;
      }

      // Smooth rotation back to neutral when slowing down
      if (segmentProgress > 0.8) {
        const returnProgress = (segmentProgress - 0.8) / 0.2;
        rotation *= (1 - Easing.out(Easing.cubic)(returnProgress));
      }
    }

    // Calculate scale with subtle pulse during movement
    let scale = interpolate(easedProgress, [0, 1], [current.scale, next.scale]);

    // Slight scale increase during peak velocity (subtle "pushing forward" feel)
    if (segmentProgress > 0.2 && segmentProgress < 0.8) {
      const pulseAmount = Math.sin((segmentProgress - 0.2) / 0.6 * Math.PI) * 0.02;
      scale *= (1 + pulseAmount);
    }

    // Determine gesture with smooth transition timing
    const gesture = segmentProgress < 0.3 ? current.gesture : next.gesture;

    // Is moving? (with smooth threshold)
    const isMoving = segmentProgress > 0.05 && segmentProgress < 0.95;

    return {
      x,
      y,
      rotation,
      scale,
      gesture,
      velocityX,
      velocityY,
      isMoving,
    };
}

/**
 * Calculate floating/hovering offset
 */
export function useFloatEffect(
  physics: HandPhysicsConfig = DEFAULT_PHYSICS
): { offsetY: number; shadowScale: number } {
  const frame = useCurrentFrame();

  return useMemo(() => {
    const offsetY = Math.sin(frame * physics.floatSpeed) * physics.floatAmplitude;
    const shadowScale = 1 + Math.sin(frame * physics.floatSpeed) * 0.1;

    return { offsetY, shadowScale };
  }, [frame, physics.floatSpeed, physics.floatAmplitude]);
}
