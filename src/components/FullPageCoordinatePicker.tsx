import React, { useState } from "react";
import { Img, staticFile } from "remotion";

interface FullPageCoordinatePickerProps {
  screenshot: string;
  sectionNumber: number; // 1-11 for the full page
}

/**
 * Coordinate picker for full-page screenshots (1920x11280)
 * Each section shows 1080px of the page
 * Coordinates are converted to absolute Y position
 */
export const FullPageCoordinatePicker: React.FC<
  FullPageCoordinatePickerProps
> = ({ screenshot, sectionNumber }) => {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [clickHistory, setClickHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);

  // Full page dimensions
  const pageWidth = 1920;
  const pageHeight = 11280;
  const sectionHeight = 1080;

  // Display dimensions (scaled to fit)
  const displayWidth = 1280;
  const displayHeight = 720;
  const scale = displayWidth / pageWidth; // 0.667

  // Section offset
  const yOffset = (sectionNumber - 1) * sectionHeight;
  const totalSections = Math.ceil(pageHeight / sectionHeight);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    // Convert to real coordinates
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

  // Section labels for reference
  const sectionLabels: Record<number, string> = {
    1: "Header + KPIs",
    2: "AI Morning Report + Shift Status",
    3: "Order Forecast Table (Top)",
    4: "Order Forecast Table (Bottom)",
    5: "Branch Comparison Graphs",
    6: "LIMOR INSIGHTS (Top)",
    7: "LIMOR INSIGHTS (Bottom)",
    8: "LIMOR RED ALERTS (Top)",
    9: "LIMOR RED ALERTS (Middle)",
    10: "LIMOR RED ALERTS (Bottom) + FORECASTS",
    11: "FORECASTS + TAKE CARE OF IT NOW",
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
        gap: 10,
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
            background: "linear-gradient(135deg, #00d9ff 0%, #0066ff 100%)",
            color: "#000",
            padding: "8px 20px",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Section {sectionNumber}/{totalSections}:{" "}
          {sectionLabels[sectionNumber] || "Content"}
        </div>

        <div
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            color: "#888",
            padding: "8px 15px",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "monospace",
          }}
        >
          Y range: {yOffset} - {yOffset + sectionHeight}px
        </div>

        {coords && (
          <div
            style={{
              background: "rgba(0, 255, 0, 0.2)",
              border: "2px solid #00ff00",
              color: "#00ff00",
              padding: "8px 20px",
              borderRadius: 8,
              fontFamily: "monospace",
              fontSize: 20,
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
          border: "2px solid rgba(0, 217, 255, 0.3)",
        }}
      >
        {/* Full page image, offset to show current section */}
        <Img
          src={staticFile(screenshot)}
          style={{
            width: pageWidth * scale,
            height: pageHeight * scale,
            display: "block",
            transform: `translateY(-${yOffset * scale}px)`,
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
          padding: "10px 15px",
          borderRadius: 8,
          fontFamily: "monospace",
          display: "flex",
          alignItems: "center",
          gap: 15,
          border: "1px solid rgba(0, 217, 255, 0.3)",
          fontSize: 13,
        }}
      >
        <span style={{ color: "#ffff00", fontWeight: "bold" }}>Clicks:</span>
        <div style={{ flex: 1, color: "#ffff00", overflow: "auto" }}>
          {clickHistory.length === 0 ? (
            <span style={{ color: "#666" }}>Click on elements...</span>
          ) : (
            clickHistory.map((c, i) => (
              <span key={i} style={{ marginRight: 10 }}>
                {`{ x: ${c.x}, y: ${c.y} },`}
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
              padding: "4px 12px",
              background: "#ff4444",
              border: "none",
              borderRadius: 4,
              color: "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
