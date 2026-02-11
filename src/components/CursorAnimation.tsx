import React from "react";
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from "remotion";

interface Point {
  x: number;
  y: number;
  frame: number; // Frame when cursor should be at this point
  click?: boolean; // Whether to show click effect at this point
}

interface CursorAnimationProps {
  path: Point[];
  startFrame?: number;
  cursorSize?: number;
  cursorColor?: string;
}

// Smooth cursor SVG
const CursorSVG: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))" }}
  >
    <path
      d="M4 4L20 12L12 14L10 22L4 4Z"
      fill={color}
      stroke="#000"
      strokeWidth="1"
    />
  </svg>
);

// Click ripple effect
const ClickRipple: React.FC<{ frame: number; clickFrame: number }> = ({
  frame,
  clickFrame,
}) => {
  const elapsed = frame - clickFrame;
  if (elapsed < 0 || elapsed > 20) return null;

  const scale = interpolate(elapsed, [0, 20], [0, 2], {
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(elapsed, [0, 20], [0.8, 0], {
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "3px solid #00d9ff",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const CursorAnimation: React.FC<CursorAnimationProps> = ({
  path,
  startFrame = 0,
  cursorSize = 24,
  cursorColor = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || path.length < 2) return null;

  // Find current segment
  let currentX = path[0].x;
  let currentY = path[0].y;
  let activeClick: number | null = null;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];

    if (relativeFrame >= p1.frame && relativeFrame <= p2.frame) {
      // Interpolate between points with easing
      const progress = interpolate(
        relativeFrame,
        [p1.frame, p2.frame],
        [0, 1],
        { easing: Easing.inOut(Easing.cubic) },
      );
      currentX = p1.x + (p2.x - p1.x) * progress;
      currentY = p1.y + (p2.y - p1.y) * progress;

      // Check for click at destination
      if (p2.click && relativeFrame >= p2.frame - 10) {
        activeClick = p2.frame;
      }
      break;
    } else if (relativeFrame > p2.frame) {
      currentX = p2.x;
      currentY = p2.y;
      if (p2.click && relativeFrame - p2.frame < 20) {
        activeClick = p2.frame;
      }
    }
  }

  // Cursor press effect during click
  const isClicking =
    activeClick !== null && Math.abs(relativeFrame - activeClick) < 5;
  const clickScale = isClicking
    ? spring({
        frame: relativeFrame - (activeClick || 0) + 5,
        fps,
        config: { damping: 20, stiffness: 300 },
      })
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: currentX,
        top: currentY,
        transform: `scale(${0.8 + clickScale * 0.2})`,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <CursorSVG color={cursorColor} size={cursorSize} />
      {activeClick !== null && (
        <ClickRipple frame={relativeFrame} clickFrame={activeClick} />
      )}
    </div>
  );
};

// Helper to create smooth cursor path
export const createCursorPath = (
  points: Array<{ x: number; y: number; click?: boolean }>,
  framesPerMove: number = 30,
  startFrame: number = 0,
): Point[] => {
  return points.map((point, index) => ({
    x: point.x,
    y: point.y,
    frame: startFrame + index * framesPerMove,
    click: point.click,
  }));
};
