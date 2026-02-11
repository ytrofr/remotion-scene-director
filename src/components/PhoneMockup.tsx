import React from "react";
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
  Img,
  staticFile,
} from "remotion";

interface PhoneMockupProps {
  children?: React.ReactNode;
  screenshot?: string;
  width?: number; // Phone screen width (default: 390)
  height?: number; // Phone screen height (default: 844)
  bezelColor?: string; // Frame color (default: dark gray)
  bezelWidth?: number; // Frame thickness (default: 6)
  borderRadius?: number; // Corner radius (default: 40)
  showHomeIndicator?: boolean; // Bottom bar indicator (default: true)
  shadowIntensity?: number; // Drop shadow (0-1, default: 0.5)
  animateIn?: boolean; // Slide in animation (default: false)
  animateInDelay?: number; // Animation delay in frames (default: 0)
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  screenshot,
  width = 390,
  height = 844,
  bezelColor = "#1a1a1a",
  bezelWidth = 6,
  borderRadius = 40,
  showHomeIndicator = true,
  shadowIntensity = 0.5,
  animateIn = false,
  animateInDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate total phone dimensions including bezel
  const totalWidth = width + bezelWidth * 2;
  const totalHeight = height + bezelWidth * 2;

  // Slide-in animation from bottom
  let translateY = 0;
  let opacity = 1;

  if (animateIn) {
    const animationFrame = frame - animateInDelay;

    if (animationFrame < 0) {
      translateY = totalHeight + 100;
      opacity = 0;
    } else {
      const springValue = spring({
        frame: animationFrame,
        fps,
        config: {
          damping: 20,
          stiffness: 100,
          mass: 1,
        },
      });
      translateY = interpolate(springValue, [0, 1], [totalHeight + 100, 0]);
      opacity = interpolate(animationFrame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
      });
    }
  }

  // Shadow based on intensity
  const shadowBlur = 40 * shadowIntensity;
  const shadowSpread = 10 * shadowIntensity;
  const shadowOpacity = 0.4 * shadowIntensity;

  return (
    <div
      style={{
        width: totalWidth,
        height: totalHeight,
        position: "relative",
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      {/* Phone frame (bezel) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: totalWidth,
          height: totalHeight,
          backgroundColor: bezelColor,
          borderRadius: borderRadius + bezelWidth,
          boxShadow: `
            0 ${shadowBlur / 2}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity}),
            0 ${shadowBlur}px ${shadowBlur * 2}px rgba(0, 0, 0, ${shadowOpacity * 0.5}),
            inset 0 1px 1px rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Subtle edge highlight */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: borderRadius + bezelWidth,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Screen area */}
      <div
        style={{
          position: "absolute",
          top: bezelWidth,
          left: bezelWidth,
          width: width,
          height: height,
          borderRadius: borderRadius,
          overflow: "hidden",
          backgroundColor: "#0a0a15",
        }}
      >
        {/* Screenshot image */}
        {screenshot && (
          <Img
            src={staticFile(`mobile/${screenshot}`)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Custom children content */}
        {children}

        {/* Home indicator bar */}
        {showHomeIndicator && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 134,
              height: 5,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: 3,
            }}
          />
        )}
      </div>
    </div>
  );
};

// Wrapper component for centering phone in composition
export const CenteredPhone: React.FC<
  PhoneMockupProps & { backgroundColor?: string }
> = ({ backgroundColor = "#0a0a15", ...props }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor,
      }}
    >
      <PhoneMockup {...props} />
    </div>
  );
};
