import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface ScrollAnimationProps {
  children: React.ReactNode;
  scrollY: number; // Target scroll position
  startFrame: number;
  durationFrames?: number;
  style?: React.CSSProperties;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  scrollY,
  startFrame,
  durationFrames = 30,
  style,
}) => {
  const frame = useCurrentFrame();

  const currentScroll = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, scrollY],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          transform: `translateY(-${currentScroll}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
