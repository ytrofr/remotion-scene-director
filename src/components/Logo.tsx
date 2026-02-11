import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface LogoProps {
  title?: string;
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({
  title = "LIMOR AI",
  subtitle = "מערכת ניהול עלויות חכמה",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animation for scale
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 80,
    },
  });

  // Fade in
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow pulse animation
  const glowIntensity = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.3, 0.8]);

  // Subtitle fade in (delayed)
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleY = interpolate(frame, [30, 50], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a15",
        opacity,
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, rgba(0, 217, 255, ${glowIntensity * 0.15}) 0%, transparent 60%)`,
        }}
      />

      {/* Main title */}
      <h1
        style={{
          fontFamily: "Heebo, Arial, sans-serif",
          fontSize: 140,
          fontWeight: 800,
          color: "#00d9ff",
          margin: 0,
          transform: `scale(${scale})`,
          textShadow: `0 0 ${40 * glowIntensity}px rgba(0, 217, 255, ${glowIntensity}), 0 0 80px rgba(0, 217, 255, 0.3)`,
          letterSpacing: 8,
          zIndex: 1,
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "Heebo, Arial, sans-serif",
          fontSize: 36,
          fontWeight: 400,
          color: "#ffffff",
          margin: "30px 0 0 0",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          direction: "rtl",
          zIndex: 1,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};
