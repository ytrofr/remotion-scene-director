/**
 * CaptionOverlay — SRT-based caption display
 * Parses .srt files and renders captions with word-level highlighting.
 * Uses @remotion/captions for parsing.
 */
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { parseSrt } from '@remotion/captions';

export type CaptionStyle = 'full-sentence' | 'word-highlight' | 'karaoke';
export type CaptionPosition = 'top' | 'center' | 'bottom';

export interface CaptionOverlayProps {
  /** SRT content as string (use staticFile + fetch, or inline) */
  srtContent: string;
  /** Display style (default 'full-sentence') */
  style?: CaptionStyle;
  /** Vertical position (default 'bottom') */
  position?: CaptionPosition;
  /** Font size in pixels (default 48) */
  fontSize?: number;
  /** Text color (default white) */
  color?: string;
  /** Background color for text box (default semi-transparent black) */
  backgroundColor?: string;
  /** Horizontal padding (default 24) */
  paddingX?: number;
  /** Vertical padding (default 12) */
  paddingY?: number;
}

const POSITION_FLEX: Record<CaptionPosition, React.CSSProperties> = {
  top: { justifyContent: 'flex-start', paddingTop: 80 },
  center: { justifyContent: 'center' },
  bottom: { justifyContent: 'flex-end', paddingBottom: 120 },
};

interface SrtCue {
  startMs: number;
  endMs: number;
  text: string;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  srtContent,
  style = 'full-sentence',
  position = 'bottom',
  fontSize = 48,
  color = '#FFFFFF',
  backgroundColor = 'rgba(0, 0, 0, 0.7)',
  paddingX = 24,
  paddingY = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Parse SRT content
  const cues = useMemo((): SrtCue[] => {
    try {
      const parsed = parseSrt({ input: srtContent });
      return parsed.captions.map((cap) => ({
        startMs: cap.startMs,
        endMs: cap.endMs,
        text: cap.text,
      }));
    } catch (err) {
      console.warn('CaptionOverlay: Failed to parse SRT content', err);
      return [];
    }
  }, [srtContent]);

  // Current time in ms
  const currentMs = (frame / fps) * 1000;

  // Find active cue
  const activeCue = cues.find(
    (cue) => currentMs >= cue.startMs && currentMs < cue.endMs,
  );

  if (!activeCue) return null;

  const flexStyle = POSITION_FLEX[position];

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        pointerEvents: 'none',
        ...flexStyle,
      }}
    >
      <div
        style={{
          backgroundColor,
          borderRadius: 8,
          padding: `${paddingY}px ${paddingX}px`,
          maxWidth: '85%',
          textAlign: 'center',
        }}
      >
        {style === 'word-highlight' ? (
          <WordHighlight
            text={activeCue.text}
            progress={
              (currentMs - activeCue.startMs) /
              (activeCue.endMs - activeCue.startMs)
            }
            fontSize={fontSize}
            color={color}
          />
        ) : (
          <span
            style={{
              fontSize,
              fontWeight: 700,
              color,
              lineHeight: 1.3,
              fontFamily: 'sans-serif',
            }}
          >
            {activeCue.text}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Word-by-word highlight for karaoke-style captions
const WordHighlight: React.FC<{
  text: string;
  progress: number;
  fontSize: number;
  color: string;
}> = ({ text, progress, fontSize, color }) => {
  const words = text.split(' ');
  const activeWordIndex = Math.floor(progress * words.length);

  return (
    <span
      style={{
        fontSize,
        fontWeight: 700,
        lineHeight: 1.3,
        fontFamily: 'sans-serif',
      }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            color: i <= activeWordIndex ? color : `${color}80`,
            transition: 'color 0.1s',
            marginRight: i < words.length - 1 ? '0.3em' : 0,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};
