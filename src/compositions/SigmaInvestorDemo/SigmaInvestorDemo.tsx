import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SCENES, COLORS } from './constants';
import { ProblemIntroScene } from './scenes/ProblemIntroScene';
import { VendorStackScene } from './scenes/VendorStackScene';
import { TotalCostScene } from './scenes/TotalCostScene';
import { TransitionScene } from './scenes/TransitionScene';
import { SigmaRevealScene } from './scenes/SigmaRevealScene';
import { OrchestraScene } from './scenes/OrchestraScene';
import { WhatsAppDemoScene } from './scenes/WhatsAppDemoScene';
import { MetricsScene } from './scenes/MetricsScene';
import { MarketScene } from './scenes/MarketScene';
import { BeforeAfterScene } from './scenes/BeforeAfterScene';
import { TeamScene } from './scenes/TeamScene';
import { TheAskScene } from './scenes/TheAskScene';
import { OutroScene } from './scenes/OutroScene';

export const SigmaInvestorDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Grid background */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Act 1: The Problem */}
      <Sequence from={SCENES.problemIntro.start} durationInFrames={SCENES.problemIntro.duration}>
        <ProblemIntroScene />
      </Sequence>

      <Sequence from={SCENES.vendorStack.start} durationInFrames={SCENES.vendorStack.duration}>
        <VendorStackScene />
      </Sequence>

      <Sequence from={SCENES.totalCost.start} durationInFrames={SCENES.totalCost.duration}>
        <TotalCostScene />
      </Sequence>

      {/* Act 2: The Solution */}
      <Sequence from={SCENES.transition.start} durationInFrames={SCENES.transition.duration}>
        <TransitionScene />
      </Sequence>

      <Sequence from={SCENES.sigmaReveal.start} durationInFrames={SCENES.sigmaReveal.duration}>
        <SigmaRevealScene />
      </Sequence>

      <Sequence from={SCENES.orchestraActivation.start} durationInFrames={SCENES.orchestraActivation.duration}>
        <OrchestraScene />
      </Sequence>

      <Sequence from={SCENES.whatsappDemo.start} durationInFrames={SCENES.whatsappDemo.duration}>
        <WhatsAppDemoScene />
      </Sequence>

      {/* Act 3: The Impact */}
      <Sequence from={SCENES.metricsReveal.start} durationInFrames={SCENES.metricsReveal.duration}>
        <MetricsScene />
      </Sequence>

      <Sequence from={SCENES.marketSize.start} durationInFrames={SCENES.marketSize.duration}>
        <MarketScene />
      </Sequence>

      <Sequence from={SCENES.beforeAfter.start} durationInFrames={SCENES.beforeAfter.duration}>
        <BeforeAfterScene />
      </Sequence>

      {/* Act 4: The Ask */}
      <Sequence from={SCENES.team.start} durationInFrames={SCENES.team.duration}>
        <TeamScene />
      </Sequence>

      <Sequence from={SCENES.theAsk.start} durationInFrames={SCENES.theAsk.duration}>
        <TheAskScene />
      </Sequence>

      <Sequence from={SCENES.outro.start} durationInFrames={SCENES.outro.duration}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
