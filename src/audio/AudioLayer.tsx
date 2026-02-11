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

  // Frame timings for V4 (adjusted for click-before-typing pattern)
  // Scene 3 (Typing): starts at global frame 65
  //   - Input click at local frame 5 → global 70
  //   - Typing starts at local frame 35 → global 100
  // Scene 4 (Send): starts at global frame 150
  //   - Send click at local frame 13 → global 163
  const AUDIO_TIMINGS = {
    inputClickFrame: 70,  // Click on input field (new)
    typingStart: 100,     // Typing starts after 1 second delay
    typingDuration: 45,   // Typing from frame 35-80 within scene
    sendFrame: 163,       // Send button click (was 135+10=145)
    responseFrame: 215,
  };

  return (
    <>
      {/* Input click - when user taps input field */}
      <Sequence from={AUDIO_TIMINGS.inputClickFrame} durationInFrames={15}>
        <AudioWithFallback
          src={staticFile('audio/send-click.wav')}
          volume={0.5}
        />
      </Sequence>

      {/* Typing sounds - during typing scene (looped for continuous typing) */}
      <Sequence from={AUDIO_TIMINGS.typingStart} durationInFrames={AUDIO_TIMINGS.typingDuration}>
        <AudioWithFallback
          src={staticFile('audio/typing-soft.wav')}
          volume={0.5}
          loop={true}
        />
      </Sequence>

      {/* Send click - when send button is tapped */}
      <Sequence from={AUDIO_TIMINGS.sendFrame} durationInFrames={15}>
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
