import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';

interface TitleCardTypewriterProps {
  text: string;
  subtitle?: string;
  position?: 'top' | 'bottom' | 'center';
  startFrame?: number;
  durationFrames?: number;
  typingSpeed?: number; // Characters per frame (higher = faster)
  showCursor?: boolean;
}

/**
 * TitleCardTypewriter - Animated title card with typewriter effect
 *
 * Features:
 * - Character-by-character text reveal
 * - Blinking cursor during and after typing
 * - Fade in/out with slide animation
 * - RTL support for Hebrew
 */
export const TitleCardTypewriter: React.FC<TitleCardTypewriterProps> = ({
  text,
  subtitle,
  position = 'bottom',
  startFrame = 0,
  durationFrames = 60,
  typingSpeed = 1.5,
  showCursor = true,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  // Typing animation - calculate visible characters
  const typingFrames = Math.ceil(text.length / typingSpeed);
  const visibleChars = Math.min(
    Math.floor(Math.max(0, relativeFrame) * typingSpeed),
    text.length
  );
  const isTyping = visibleChars < text.length;

  // Blinking cursor - toggles every 15 frames
  const cursorVisible = showCursor && (isTyping || Math.floor(frame / 15) % 2 === 0);

  // Fade in/out timing
  const fadeFrames = Math.min(10, Math.floor(durationFrames / 4));
  const fadeInEnd = fadeFrames;
  const fadeOutStart = Math.max(fadeInEnd + 1, durationFrames - fadeFrames);

  const opacity = interpolate(
    relativeFrame,
    [0, fadeInEnd, fadeOutStart, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Slide up animation
  const translateY = interpolate(relativeFrame, [0, 20], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    top: { top: 60, left: 0, right: 0 },
    center: {
      top: '50%',
      left: 0,
      right: 0,
      transform: `translateY(-50%) translateY(${translateY}px)`,
    },
    bottom: { bottom: 180, left: 0, right: 0 },
  };

  // Subtitle fade in (after typing completes)
  const subtitleOpacity = subtitle
    ? interpolate(
        relativeFrame,
        [typingFrames, typingFrames + 10],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyles[position],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: position !== 'center' ? `translateY(${translateY}px)` : undefined,
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(20,20,40,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          padding: '20px 60px',
          borderRadius: 16,
          border: '1px solid rgba(0, 217, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 217, 255, 0.2)',
        }}
      >
        <h2
          style={{
            fontFamily: 'Heebo, Arial, sans-serif',
            fontSize: 42,
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            textAlign: 'center',
            direction: 'rtl',
            textShadow: '0 2px 10px rgba(0, 217, 255, 0.5)',
          }}
        >
          {text.slice(0, visibleChars)}
          {showCursor && (
            <span
              style={{
                display: 'inline-block',
                width: 3,
                height: '0.85em',
                backgroundColor: cursorVisible ? '#00d9ff' : 'transparent',
                marginRight: 4,
                marginLeft: 2,
                verticalAlign: 'text-bottom',
                transition: 'background-color 0.05s',
              }}
            />
          )}
        </h2>
        {subtitle && visibleChars >= text.length && (
          <p
            style={{
              fontFamily: 'Heebo, Arial, sans-serif',
              fontSize: 24,
              fontWeight: 400,
              color: '#00d9ff',
              margin: '10px 0 0 0',
              textAlign: 'center',
              direction: 'rtl',
              opacity: subtitleOpacity,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
