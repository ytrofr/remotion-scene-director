import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { CHAT_SCENES, COLORS } from './constants';
import { ContinuousChatScene } from './scenes/ContinuousChatScene';
import { PageRevealScene } from './scenes/PageRevealScene';
import { CreativeRevealScene } from './scenes/CreativeRevealScene';
import { ScreenScene } from './scenes/ScreenScene';

/**
 * Fade wrapper — fades an overlay in and back out.
 * Used for PageReveal and CreativeReveal to crossfade over the chat.
 */
const FadeOverlay: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  duration: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}> = ({ children, startFrame, duration, fadeInFrames = 20, fadeOutFrames = 20 }) => {
  const frame = useCurrentFrame();
  const endFrame = startFrame + duration;

  const opacity = Math.min(
    interpolate(frame, [startFrame, startFrame + fadeInFrames], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    interpolate(frame, [endFrame - fadeOutFrames, endFrame], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  if (frame < startFrame || frame > endFrame) return null;

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

export const SigmaAppDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Layer 1: Continuous chat — spans from Hub through Creative */}
      <Sequence
        from={0}
        durationInFrames={CHAT_SCENES.creativeReveal.start}
        name="ContinuousChat"
      >
        <ContinuousChatScene />
      </Sequence>

      {/* Layer 2: Page Reveal overlay — fades in over chat, fades out back to chat */}
      <FadeOverlay
        startFrame={CHAT_SCENES.pageReveal.start}
        duration={CHAT_SCENES.pageReveal.duration}
        fadeInFrames={20}
        fadeOutFrames={25}
      >
        <PageRevealScene />
      </FadeOverlay>

      {/* Layer 3: Creative Reveal overlay — fades in over chat, fades out */}
      <FadeOverlay
        startFrame={CHAT_SCENES.creativeReveal.start}
        duration={CHAT_SCENES.creativeReveal.duration}
        fadeInFrames={20}
        fadeOutFrames={25}
      >
        <CreativeRevealScene />
      </FadeOverlay>

      {/* Layer 4: Closing — SIGMA logo */}
      <Sequence
        from={CHAT_SCENES.closing.start}
        durationInFrames={CHAT_SCENES.closing.duration}
        name="Closing"
      >
        <ScreenScene
          image="sigma-demo/hub_desktop.png"
          caption="One platform. Eleven agents. Zero friction."
          isClosing={true}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
