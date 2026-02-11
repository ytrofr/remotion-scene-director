import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface OutroProps {
  title?: string;
  url?: string;
  cta?: string;
}

export const Outro: React.FC<OutroProps> = ({
  title = "LIMOR AI",
  url = "limor.app",
  cta = "נסו עכשיו",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Scale animation
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 20,
      stiffness: 100,
    },
  });

  // CTA button animation (delayed)
  const ctaOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaScale = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: {
      damping: 15,
      stiffness: 150,
    },
  });

  // Pulsing glow for CTA
  const ctaGlow = interpolate(Math.sin((frame - 40) * 0.15), [-1, 1], [0.5, 1]);

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
          background:
            "radial-gradient(circle at 50% 50%, rgba(0, 217, 255, 0.1) 0%, transparent 60%)",
        }}
      />

      {/* Logo */}
      <h1
        style={{
          fontFamily: "Heebo, Arial, sans-serif",
          fontSize: 100,
          fontWeight: 800,
          color: "#00d9ff",
          margin: 0,
          transform: `scale(${scale})`,
          textShadow: "0 0 40px rgba(0, 217, 255, 0.5)",
          letterSpacing: 6,
          zIndex: 1,
        }}
      >
        {title}
      </h1>

      {/* URL */}
      <p
        style={{
          fontFamily: "monospace",
          fontSize: 32,
          fontWeight: 400,
          color: "rgba(255, 255, 255, 0.7)",
          margin: "20px 0 40px 0",
          zIndex: 1,
        }}
      >
        {url}
      </p>

      {/* CTA Button */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, rgba(0, 217, 255, ${ctaGlow}) 0%, rgba(0, 150, 255, ${ctaGlow}) 100%)`,
            padding: "18px 60px",
            borderRadius: 50,
            boxShadow: `0 0 ${30 * ctaGlow}px rgba(0, 217, 255, ${ctaGlow * 0.6})`,
          }}
        >
          <span
            style={{
              fontFamily: "Heebo, Arial, sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#ffffff",
              direction: "rtl",
            }}
          >
            {cta}
          </span>
        </div>
      </div>
    </div>
  );
};
