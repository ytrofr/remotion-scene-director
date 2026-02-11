import React from "react";
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from "remotion";

interface TouchPoint {
  x: number;
  y: number;
  frame: number; // Frame when touch should occur
  tap?: boolean; // Quick tap (default)
  hold?: boolean; // Touch and hold
  holdDuration?: number; // Hold duration in frames
}

interface TouchAnimationProps {
  path: TouchPoint[];
  startFrame?: number;
  fingerSize?: number; // Finger indicator size (default: 50)
  fingerColor?: string; // Finger color (default: semi-transparent white)
  rippleColor?: string; // Ripple effect color (default: cyan)
  showFinger?: boolean; // Show finger indicator (default: true)
}

// Finger touch indicator - circular with gradient
const FingerIndicator: React.FC<{
  size: number;
  color: string;
  pressed: boolean;
}> = ({ size, color, pressed }) => {
  const scale = pressed ? 0.85 : 1;
  const opacity = pressed ? 0.9 : 0.7;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 40% 40%, ${color}, rgba(150, 150, 150, ${opacity}))`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        boxShadow: `
          0 4px 8px rgba(0, 0, 0, 0.3),
          inset 0 2px 4px rgba(255, 255, 255, 0.2)
        `,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
};

// Tap ripple effect
const TapRipple: React.FC<{
  frame: number;
  tapFrame: number;
  color: string;
}> = ({ frame, tapFrame, color }) => {
  const elapsed = frame - tapFrame;

  // Ripple duration: 20 frames
  if (elapsed < 0 || elapsed > 25) return null;

  const scale = interpolate(elapsed, [0, 25], [0.3, 2.5], {
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(elapsed, [0, 25], [0.6, 0], {
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// Inner tap pulse (smaller, faster)
const TapPulse: React.FC<{
  frame: number;
  tapFrame: number;
  color: string;
}> = ({ frame, tapFrame, color }) => {
  const elapsed = frame - tapFrame;

  if (elapsed < 0 || elapsed > 15) return null;

  const scale = interpolate(elapsed, [0, 15], [0.5, 1.5], {
    easing: Easing.out(Easing.quad),
  });
  const opacity = interpolate(elapsed, [0, 15], [0.8, 0], {
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        width: 30,
        height: 30,
        borderRadius: "50%",
        backgroundColor: color,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const TouchAnimation: React.FC<TouchAnimationProps> = ({
  path,
  startFrame = 0,
  fingerSize = 50,
  fingerColor = "rgba(200, 200, 200, 0.9)",
  rippleColor = "#00d9ff",
  showFinger = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || path.length === 0) return null;

  // Find current position and state
  let currentX = path[0].x;
  let currentY = path[0].y;
  let isPressed = false;
  let activeTap: number | null = null;

  // Interpolate position between points
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];

    if (relativeFrame >= p1.frame && relativeFrame <= p2.frame) {
      // Smooth movement between points
      const progress = interpolate(
        relativeFrame,
        [p1.frame, p2.frame],
        [0, 1],
        { easing: Easing.inOut(Easing.cubic) },
      );
      currentX = p1.x + (p2.x - p1.x) * progress;
      currentY = p1.y + (p2.y - p1.y) * progress;

      // Check for tap at destination
      if (p2.tap && relativeFrame >= p2.frame - 5) {
        activeTap = p2.frame;
        isPressed = Math.abs(relativeFrame - p2.frame) < 8;
      }

      // Check for hold
      if (p2.hold) {
        const holdEnd = p2.frame + (p2.holdDuration || 30);
        if (relativeFrame >= p2.frame && relativeFrame <= holdEnd) {
          isPressed = true;
        }
      }
      break;
    } else if (relativeFrame > p2.frame) {
      currentX = p2.x;
      currentY = p2.y;

      // Check for recent tap
      if (p2.tap && relativeFrame - p2.frame < 25) {
        activeTap = p2.frame;
        isPressed = relativeFrame - p2.frame < 8;
      }
    }
  }

  // Handle last point
  const lastPoint = path[path.length - 1];
  if (relativeFrame >= lastPoint.frame) {
    currentX = lastPoint.x;
    currentY = lastPoint.y;

    if (lastPoint.tap && relativeFrame - lastPoint.frame < 25) {
      activeTap = lastPoint.frame;
      isPressed = relativeFrame - lastPoint.frame < 8;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: currentX,
        top: currentY,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      {/* Tap effects */}
      {activeTap !== null && (
        <>
          <TapPulse
            frame={relativeFrame}
            tapFrame={activeTap}
            color={rippleColor}
          />
          <TapRipple
            frame={relativeFrame}
            tapFrame={activeTap}
            color={rippleColor}
          />
        </>
      )}

      {/* Finger indicator */}
      {showFinger && (
        <FingerIndicator
          size={fingerSize}
          color={fingerColor}
          pressed={isPressed}
        />
      )}
    </div>
  );
};

// Helper to create touch path with timing
export const createTouchPath = (
  points: Array<{
    x: number;
    y: number;
    tap?: boolean;
    hold?: boolean;
    holdDuration?: number;
  }>,
  framesPerMove: number = 30,
  startFrame: number = 0,
): TouchPoint[] => {
  return points.map((point, index) => ({
    x: point.x,
    y: point.y,
    frame: startFrame + index * framesPerMove,
    tap: point.tap,
    hold: point.hold,
    holdDuration: point.holdDuration,
  }));
};
