import React, { useState } from "react";
import { Img, staticFile } from "remotion";

interface CoordinateFitScreenProps {
  screenshot: string;
  section?: 1 | 2; // 1 = full page fit, 2 = bottom half zoomed
}

// Simple fit-to-screen: shows entire 1920x1080 image scaled to fit
// Section 2 shows the bottom half of the page at larger scale for detail
// Coordinates are automatically converted to real values
export const CoordinateFitScreen: React.FC<CoordinateFitScreenProps> = ({
  screenshot,
  section = 1,
}) => {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [clickHistory, setClickHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);

  // Original image dimensions
  const originalWidth = 1920;
  const originalHeight = 1080;

  // Display dimensions (fit to 1280x720 with padding for UI)
  const displayWidth = 1280;
  const displayHeight = 720;

  // Section 1: Full image fit (scale 0.667)
  // Section 2: Bottom half at larger scale (shows y: 540-1080)
  const isSection2 = section === 2;
  const yOffset = isSection2 ? 540 : 0; // Start from middle for section 2
  const visibleHeight = isSection2 ? 540 : originalHeight; // Half height for section 2
  const scale = isSection2
    ? displayHeight / visibleHeight // 720/540 = 1.33
    : displayWidth / originalWidth; // 1280/1920 = 0.667

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    // Convert to original coordinates
    const realX = Math.round(clickX / scale);
    const realY = Math.round(clickY / scale) + yOffset;
    setCoords({ x: realX, y: realY });
    setClickHistory((prev) => [...prev, { x: realX, y: realY }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const realX = Math.round(clickX / scale);
    const realY = Math.round(clickY / scale) + yOffset;
    setCoords({ x: realX, y: realY });
  };

  return (
    <div
      style={{
        width: 1280,
        height: 900,
        backgroundColor: "#0a0a15",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 15,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: isSection2
              ? "rgba(255, 165, 0, 0.9)"
              : "rgba(0, 217, 255, 0.9)",
            color: "#000",
            padding: "10px 25px",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          🎯 {isSection2 ? "SECTION 2 (Bottom Half)" : "SECTION 1 (Full Page)"}{" "}
          - Click anywhere
        </div>

        {coords && (
          <div
            style={{
              background: "rgba(0, 255, 0, 0.2)",
              border: "2px solid #00ff00",
              color: "#00ff00",
              padding: "10px 25px",
              borderRadius: 8,
              fontFamily: "monospace",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            x={coords.x}, y={coords.y}
          </div>
        )}
      </div>

      {/* Image container */}
      <div
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{
          cursor: "crosshair",
          position: "relative",
          width: displayWidth,
          height: displayHeight,
          borderRadius: 8,
          overflow: "hidden",
          border: isSection2
            ? "2px solid rgba(255, 165, 0, 0.5)"
            : "2px solid rgba(0, 217, 255, 0.3)",
        }}
      >
        <Img
          src={staticFile(screenshot)}
          style={{
            width: originalWidth * scale,
            height: originalHeight * scale,
            display: "block",
            transform: isSection2
              ? `translateY(-${yOffset * scale}px)`
              : "none",
          }}
        />

        {/* Crosshair */}
        {coords && (
          <>
            <div
              style={{
                position: "absolute",
                left: coords.x * scale,
                top: 0,
                width: 1,
                height: displayHeight,
                backgroundColor: "rgba(255, 0, 0, 0.6)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: (coords.y - yOffset) * scale,
                width: displayWidth,
                height: 1,
                backgroundColor: "rgba(255, 0, 0, 0.6)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: coords.x * scale - 8,
                top: (coords.y - yOffset) * scale - 8,
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "2px solid #00ff00",
                pointerEvents: "none",
              }}
            />
          </>
        )}
      </div>

      {/* Click history panel */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          padding: "12px 20px",
          borderRadius: 8,
          fontFamily: "monospace",
          display: "flex",
          alignItems: "center",
          gap: 20,
          border: "1px solid rgba(0, 217, 255, 0.3)",
        }}
      >
        <span style={{ color: "#ffff00", fontWeight: "bold" }}>📋 Clicks:</span>
        <div style={{ flex: 1, color: "#ffff00", fontSize: 14 }}>
          {clickHistory.length === 0 ? (
            <span style={{ color: "#666" }}>
              Click on elements to build cursor path...
            </span>
          ) : (
            clickHistory.map((c, i) => (
              <span key={i} style={{ marginRight: 15 }}>
                {`{ x: ${c.x}, y: ${c.y}, click: true },`}
              </span>
            ))
          )}
        </div>
        {clickHistory.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setClickHistory([]);
            }}
            style={{
              padding: "6px 15px",
              background: "#ff4444",
              border: "none",
              borderRadius: 4,
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
