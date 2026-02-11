import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface TitleCardProps {
  text: string;
  subtitle?: string;
  position?: "top" | "bottom" | "center";
  startFrame?: number;
  durationFrames?: number;
}

export const TitleCard: React.FC<TitleCardProps> = ({
  text,
  subtitle,
  position = "bottom",
  startFrame = 0,
  durationFrames = 60,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  // Fade in/out timing - adjust for short durations
  const fadeFrames = Math.min(10, Math.floor(durationFrames / 4));
  const fadeInEnd = fadeFrames;
  const fadeOutStart = Math.max(fadeInEnd + 1, durationFrames - fadeFrames);

  // Fade in, stay, fade out
  const opacity = interpolate(
    relativeFrame,
    [0, fadeInEnd, fadeOutStart, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Slide up animation
  const translateY = interpolate(relativeFrame, [0, 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const positionStyles: Record<string, React.CSSProperties> = {
    top: { top: 60, left: 0, right: 0 },
    center: {
      top: "50%",
      left: 0,
      right: 0,
      transform: `translateY(-50%) translateY(${translateY}px)`,
    },
    bottom: { bottom: 80, left: 0, right: 0 },
  };

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyles[position],
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform:
          position !== "center" ? `translateY(${translateY}px)` : undefined,
        zIndex: 100,
      }}
    >
      {/* Background blur effect */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(20,20,40,0.8) 100%)",
          backdropFilter: "blur(10px)",
          padding: "20px 60px",
          borderRadius: 16,
          border: "1px solid rgba(0, 217, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 217, 255, 0.2)",
        }}
      >
        <h2
          style={{
            fontFamily: "Heebo, Arial, sans-serif",
            fontSize: 42,
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            textAlign: "center",
            direction: "rtl",
            textShadow: "0 2px 10px rgba(0, 217, 255, 0.5)",
          }}
        >
          {text}
        </h2>
        {subtitle && (
          <p
            style={{
              fontFamily: "Heebo, Arial, sans-serif",
              fontSize: 24,
              fontWeight: 400,
              color: "#00d9ff",
              margin: "10px 0 0 0",
              textAlign: "center",
              direction: "rtl",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
