import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { CHAT_SCENES, COLORS } from './constants';
import { HubChatOpenScene } from './scenes/HubChatOpenScene';
import { WebsiteRequestScene } from './scenes/WebsiteRequestScene';
import { PageRevealScene } from './scenes/PageRevealScene';
import { CreativeRequestScene } from './scenes/CreativeRequestScene';
import { CreativeRevealScene } from './scenes/CreativeRevealScene';
import { ScreenScene } from './scenes/ScreenScene';

export const SigmaAppDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Act 1: Hub + Chat Opens */}
      <Sequence
        from={CHAT_SCENES.hubChatOpen.start}
        durationInFrames={CHAT_SCENES.hubChatOpen.duration}
        name="HubChatOpen"
      >
        <HubChatOpenScene />
      </Sequence>

      {/* Act 2: Website Request — typing, routing, result */}
      <Sequence
        from={CHAT_SCENES.websiteRequest.start}
        durationInFrames={CHAT_SCENES.websiteRequest.duration}
        name="WebsiteRequest"
      >
        <WebsiteRequestScene />
      </Sequence>

      {/* Act 3: Page Reveal — crossfade to generated page, scroll */}
      <Sequence
        from={CHAT_SCENES.pageReveal.start}
        durationInFrames={CHAT_SCENES.pageReveal.duration}
        name="PageReveal"
      >
        <PageRevealScene />
      </Sequence>

      {/* Act 4: Creative Request — banner generation */}
      <Sequence
        from={CHAT_SCENES.creativeRequest.start}
        durationInFrames={CHAT_SCENES.creativeRequest.duration}
        name="CreativeRequest"
      >
        <CreativeRequestScene />
      </Sequence>

      {/* Act 4b: Creative Reveal — Creative Studio page */}
      <Sequence
        from={CHAT_SCENES.creativeReveal.start}
        durationInFrames={CHAT_SCENES.creativeReveal.duration}
        name="CreativeReveal"
      >
        <CreativeRevealScene />
      </Sequence>

      {/* Act 5: Closing — reuse existing ClosingScene */}
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
