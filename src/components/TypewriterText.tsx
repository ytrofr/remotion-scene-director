import React from "react";
import { useCurrentFrame } from "remotion";

interface TypewriterTextProps {
  text: string;
  startFrame?: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
  cursorColor?: string;
  showCursor?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  charsPerFrame = 0.8,
  style,
  cursorColor = "#00d9ff",
  showCursor = true,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const visibleChars = Math.min(
    Math.floor(elapsed * charsPerFrame),
    text.length,
  );
  const isTyping = visibleChars < text.length;

  // Blinking cursor
  const cursorVisible = isTyping || frame % 30 < 15;

  return (
    <span
      style={{
        fontFamily: "Heebo, Arial, sans-serif",
        direction: "rtl",
        ...style,
      }}
    >
      {text.slice(0, visibleChars)}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: "1em",
            backgroundColor: cursorVisible ? cursorColor : "transparent",
            marginRight: 2,
            verticalAlign: "text-bottom",
          }}
        />
      )}
    </span>
  );
};
