import React from "react";
import { Img, staticFile, interpolate, useCurrentFrame } from "remotion";

interface ScreenFrameProps {
  screenshot: string;
  scale?: number;
  fadeIn?: boolean;
  startFrame?: number;
  showBrowserFrame?: boolean;
}

export const ScreenFrame: React.FC<ScreenFrameProps> = ({
  screenshot,
  scale = 1, // Changed default to 1 (no scaling)
  fadeIn = true,
  startFrame = 0,
  showBrowserFrame = false, // Disabled by default - show full screenshot
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  const opacity = fadeIn
    ? interpolate(relativeFrame, [0, 15], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // Simple content without browser frame - shows full screenshot
  if (!showBrowserFrame) {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          opacity,
        }}
      >
        <Img
          src={staticFile(screenshot)}
          style={{
            width: 1920,
            height: 1080,
            display: "block",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        />
      </div>
    );
  }

  // With browser frame (optional)
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Browser toolbar */}
        <div
          style={{
            height: 32,
            background: "linear-gradient(180deg, #2d2d3a 0%, #1a1a2e 100%)",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#ff5f57",
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#febc2e",
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#28c840",
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              height: 20,
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 30,
              marginRight: 30,
            }}
          >
            <span
              style={{
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            >
              limor.app
            </span>
          </div>
        </div>
        <Img
          src={staticFile(screenshot)}
          style={{ width: 1920, height: 1080, display: "block" }}
        />
      </div>
    </div>
  );
};
