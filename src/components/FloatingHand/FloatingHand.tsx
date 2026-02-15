import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import {
  FloatingHandProps,
  HandPhysicsConfig,
  DEFAULT_PHYSICS,
  LottieAnimation,
  HandGesture,
} from './types';
import { useHandAnimation, useFloatEffect, computeHandState, computeFloatEffect } from './useHandAnimation';
import { LottieHand } from './hands/LottieHand';
import { LottieHandStandalone } from './hands/LottieHandStandalone';
import { useSceneDirectorMode } from './SceneDirectorMode';

/**
 * SimpleCursorHand - SVG cursor for standalone rendering (outside Remotion).
 * Shows hand position and gesture type without requiring Remotion's Lottie.
 */
/**
 * Gesture color map for visual feedback
 */
const GESTURE_COLORS: Record<string, string> = {
  pointer: '#58a6ff',
  click: '#3fb950',
  drag: '#f0883e',
  scroll: '#58a6ff',
  open: '#8b949e',
  thumbsUp: '#f0883e',
  peace: '#58a6ff',
};

const SimpleCursorHand: React.FC<{ gesture: HandGesture; size: number; dark: boolean }> = ({
  gesture, size, dark,
}) => {
  const fill = dark ? '#222' : '#f5f5f5';
  const stroke = dark ? '#888' : '#333';
  const gestureColor = GESTURE_COLORS[gesture] || '#58a6ff';
  const isClick = gesture === 'click';
  const isDrag = gesture === 'drag';
  const isScroll = gesture === 'scroll';

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: 'visible' }}>
      {/* Prominent position ring - always visible */}
      <circle cx={12} cy={22} r={28} fill="none" stroke={gestureColor} strokeWidth={3} opacity={0.6} />
      <circle cx={12} cy={22} r={22} fill={gestureColor} opacity={0.15} />

      {/* Cursor pointer shape */}
      <path
        d="M8,2 L8,42 L17,33 L26,48 L31,45 L22,30 L34,30 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Gesture label */}
      <text x={12} y={-8} textAnchor="middle" fill={gestureColor}
        fontSize={11} fontWeight={700} fontFamily="monospace">
        {gesture.toUpperCase()}
      </text>

      {/* Click ripple indicator */}
      {isClick && (
        <>
          <circle cx={12} cy={22} r={10} fill="none" stroke="#3fb950" strokeWidth={3} opacity={0.9} />
          <circle cx={12} cy={22} r={18} fill="none" stroke="#3fb950" strokeWidth={2} opacity={0.5} />
        </>
      )}
      {/* Drag indicator */}
      {isDrag && (
        <>
          <line x1={40} y1={20} x2={55} y2={20} stroke="#f0883e" strokeWidth={3} />
          <polygon points="55,15 64,20 55,25" fill="#f0883e" />
        </>
      )}
      {/* Scroll indicator */}
      {isScroll && (
        <>
          <line x1={42} y1={10} x2={42} y2={34} stroke="#58a6ff" strokeWidth={3} />
          <polygon points="37,10 42,2 47,10" fill="#58a6ff" />
          <polygon points="37,34 42,42 47,34" fill="#58a6ff" />
        </>
      )}
    </svg>
  );
};

/**
 * FloatingHandStandalone - Renders outside Remotion context using lottie-web directly.
 * Shows the REAL Lottie hand animation (same as final video) with live position updates.
 */
const FloatingHandStandalone: React.FC<FloatingHandProps & { frame: number }> = ({
  frame,
  path,
  startFrame = 0,
  animation = 'hand-click',
  size = 120,
  dark = false,
  physics: physicsOverrides,
}) => {
  const physics: HandPhysicsConfig = { ...DEFAULT_PHYSICS, ...physicsOverrides };

  const handState = useMemo(
    () => computeHandState(frame, path, startFrame, physics),
    [frame, path, startFrame, physics],
  );
  const floatEffect = useMemo(
    () => computeFloatEffect(frame, physics),
    [frame, physics],
  );

  if (frame < startFrame) return null;

  const finalX = handState.x;
  const finalY = handState.y + floatEffect.offsetY;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: finalX,
          top: finalY,
          transform: `
            translate(-25%, -10%)
            rotate(${handState.rotation}deg)
            scale(${handState.scale})
          `,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
      >
        <LottieHandStandalone
          gesture={handState.gesture}
          size={size}
          animationFile={animation}
          dark={dark}
        />
      </div>
    </div>
  );
};

/**
 * FloatingHand - Remotion wrapper (uses useCurrentFrame + Lottie)
 * Only used when rendered inside a Remotion Player composition.
 */
const FloatingHandRemotionWrapper: React.FC<FloatingHandProps> = ({
  path,
  startFrame = 0,
  animation = 'hand-click',
  size = 64,
  dark = false,
  physics: physicsOverrides,
  showRipple = false,
  rippleColor = 'rgba(0, 217, 255, 0.5)',
}) => {
  const isSceneDirector = useSceneDirectorMode();
  const frame = useCurrentFrame();

  // Hide composition's built-in hand when SceneDirector provides its own overlay
  if (isSceneDirector) return null;
  const physics: HandPhysicsConfig = { ...DEFAULT_PHYSICS, ...physicsOverrides };
  const handState = useHandAnimation(path, startFrame, physics);
  const { offsetY, shadowScale } = useFloatEffect(physics);

  if (frame < startFrame) return null;

  const finalX = handState.x;
  const finalY = handState.y + offsetY;
  const finalRotation = handState.rotation;
  const finalScale = handState.scale;

  const isClickGesture = handState.gesture === 'click';
  const rippleScale = isClickGesture
    ? interpolate((frame - startFrame) % 30, [0, 15, 30], [0.5, 1.5, 0.5])
    : 0;
  const rippleOpacity = isClickGesture
    ? interpolate((frame - startFrame) % 30, [0, 15, 30], [0.8, 0, 0])
    : 0;

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
      {showRipple && isClickGesture && (
        <div style={{
          position: 'absolute', left: finalX, top: finalY, width: size, height: size,
          borderRadius: '50%', border: `3px solid ${rippleColor}`,
          transform: `translate(-50%, -50%) scale(${rippleScale})`, opacity: rippleOpacity, pointerEvents: 'none',
        }} />
      )}
      {physics.shadowEnabled && (
        <div style={{
          position: 'absolute', left: finalX + physics.shadowDistance * 0.3,
          top: finalY + size * 0.8 + physics.shadowDistance, width: size * 0.5, height: size * 0.15,
          borderRadius: '50%', background: 'rgba(0, 0, 0, 0.15)',
          filter: `blur(${physics.shadowBlur * 0.8}px)`,
          transform: `translate(-50%, 0) scale(${finalScale * shadowScale})`, pointerEvents: 'none', zIndex: -1,
        }} />
      )}
      <div style={{
        position: 'absolute', left: finalX, top: finalY,
        transform: `translate(-25%, -10%) rotate(${finalRotation}deg) scale(${finalScale})`,
        transformOrigin: 'center center', pointerEvents: 'none',
        filter: handState.isMoving ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}>
        <LottieHand gesture={handState.gesture} size={size} animationFile={animation} dark={dark} />
      </div>
    </div>
  );
};

/**
 * FloatingHand Component
 *
 * Works both inside Remotion compositions (auto-detects frame) and outside
 * (pass `frame` prop for SceneDirector live preview).
 *
 * @example
 * ```tsx
 * // Inside Remotion composition (uses useCurrentFrame automatically)
 * <FloatingHand path={[...]} animation="hand-click" />
 *
 * // Outside Remotion (SceneDirector live preview)
 * <FloatingHand path={[...]} animation="hand-click" frame={currentFrame} />
 * ```
 */
export const FloatingHand: React.FC<FloatingHandProps> = (props) => {
  if (props.frame !== undefined) {
    // External frame provided — use standalone renderer (no Remotion dependencies)
    return <FloatingHandStandalone {...props} frame={props.frame} />;
  }
  // No frame prop — use Remotion's useCurrentFrame (must be inside Player)
  return <FloatingHandRemotionWrapper {...props} />;
};

export default FloatingHand;
