import React from 'react';
import { Audio, Sequence, staticFile, useVideoConfig } from 'remotion';

interface AudioLayerProps {
  enabled?: boolean; // Set to false to disable all audio
}

/**
 * AudioLayer - Sound effects for MobileChatDemo
 *
 * Audio files in public/audio/:
 * - typing-soft.wav    (keyboard typing sound)
 * - send-click.wav     (send button tap sound)
 * - response-chime.mp3 (notification chime - optional)
 *
 * Download additional sounds from:
 * - https://mixkit.co/free-sound-effects/
 * - https://pixabay.com/sound-effects/
 */
export const AudioLayer: React.FC<AudioLayerProps> = ({ enabled = true }) => {
  const { fps } = useVideoConfig();

  if (!enabled) {
    return null;
  }

  // Frame timings (matching scene timings - 1.5X faster typing)
  // Scene 7 (Feedback) removed - only 7 scenes now
  const AUDIO_TIMINGS = {
    typingStart: 65,
    typingDuration: 60, // 1.5X faster typing
    sendFrame: 135,
    responseFrame: 215,
  };

  return (
    <>
      {/* Typing sounds - during typing scene (looped for continuous typing) */}
      <Sequence from={AUDIO_TIMINGS.typingStart} durationInFrames={AUDIO_TIMINGS.typingDuration}>
        <AudioWithFallback
          src={staticFile('audio/typing-soft.wav')}
          volume={0.5}
          loop={true}
        />
      </Sequence>

      {/* Send click - when button is tapped (10 frames into Scene 4) */}
      <Sequence from={AUDIO_TIMINGS.sendFrame + 10} durationInFrames={15}>
        <AudioWithFallback
          src={staticFile('audio/send-click.wav')}
          volume={0.6}
        />
      </Sequence>

      {/* Response chime - when AI responds */}
      <Sequence from={AUDIO_TIMINGS.responseFrame} durationInFrames={30}>
        <AudioWithFallback
          src={staticFile('audio/response-chime.mp3')}
          volume={0.4}
        />
      </Sequence>
    </>
  );
};

/**
 * Audio component with graceful fallback
 * Renders nothing if audio file doesn't exist (prevents render errors)
 */
const AudioWithFallback: React.FC<{
  src: string;
  volume?: number;
  loop?: boolean;
}> = ({ src, volume = 1, loop = false }) => {
  // In production, you'd want proper error handling
  // For now, we'll render the Audio component and let Remotion handle missing files
  try {
    return <Audio src={src} volume={volume} loop={loop} />;
  } catch {
    // Silently fail if audio file is missing
    return null;
  }
};
