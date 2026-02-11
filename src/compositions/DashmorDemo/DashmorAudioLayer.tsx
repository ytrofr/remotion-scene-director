import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { SECTIONS, TIMING } from './constants';

/**
 * DashmorAudioLayer - Gentle scroll sounds for dashboard demo
 *
 * Plays a soft sound effect during each scroll transition.
 *
 * To replace with custom sound:
 * 1. Download a gentle swipe/scroll sound from:
 *    - https://mixkit.co/free-sound-effects/swoosh/
 *    - https://pixabay.com/sound-effects/search/swipe/
 * 2. Save as public/audio/scroll-swipe.wav (or .mp3)
 * 3. Update SCROLL_SOUND_FILE below
 */

// Sound file to use
const SCROLL_SOUND_FILE = 'audio/u_nharq4usid-swipe-255512.mp3';
const SCROLL_VOLUME = 0.8; // 80% volume

interface DashmorAudioLayerProps {
  enabled?: boolean;
}

export const DashmorAudioLayer: React.FC<DashmorAudioLayerProps> = ({
  enabled = true,
}) => {
  if (!enabled) {
    return null;
  }

  // Calculate when each scroll transition happens
  const scrollTimings: number[] = [];
  let currentFrame = TIMING.introFrames;

  SECTIONS.forEach((section, i) => {
    currentFrame += section.pauseFrames;

    // Add scroll timing (except for last section which has no scroll after it)
    if (i < SECTIONS.length - 1) {
      scrollTimings.push(currentFrame);
      currentFrame += TIMING.scrollFramesPerSection;
    }
  });

  return (
    <>
      {/* Play gentle sound at start of each scroll transition */}
      {scrollTimings.map((frame, i) => (
        <Sequence
          key={`scroll-sound-${i}`}
          from={frame}
          durationInFrames={TIMING.scrollFramesPerSection}
          name={`Scroll Sound ${i + 1}`}
        >
          <Audio
            src={staticFile(SCROLL_SOUND_FILE)}
            volume={SCROLL_VOLUME}
          />
        </Sequence>
      ))}
    </>
  );
};

export default DashmorAudioLayer;
