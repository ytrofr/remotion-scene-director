import React from 'react';
import { Composition, Still } from 'remotion';
import { MobileChatDemoRefactored } from './compositions/MobileChatDemoRefactored';
import { MobileChatDemoV3 } from './compositions/MobileChatDemoV3';
import {
  MobileChatDemoV4,
  MobileChatDemoV4DebugInteractive,
} from './compositions/MobileChatDemoV4';
import {
  MobileChatDemoCombined,
  COMBINED_VIDEO,
} from './compositions/MobileChatDemoCombined';
import { MobileChatDemoCombinedDebugInteractive } from './compositions/MobileChatDemoCombinedDebug';
import {
  DorianDemo,
  DorianDebug,
  DorianDemoWithDebug,
  DorianDebugInteractive,
  VIDEO as DORIAN_VIDEO,
} from './compositions/DorianDemo';
import {
  DashmorDemo,
  VIDEO as DASHMOR_VIDEO,
} from './compositions/DashmorDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ========== DORIAN DEMO ========== */}
      <Composition
        id="DorianDemo"
        component={DorianDemo}
        durationInFrames={DORIAN_VIDEO.durationInFrames}
        fps={DORIAN_VIDEO.fps}
        width={DORIAN_VIDEO.width}
        height={DORIAN_VIDEO.height}
      />
      {/* DorianDemo 60fps variant - smooth rendering after fps-relative conversion */}
      <Composition
        id="DorianDemo-60fps"
        component={DorianDemo}
        durationInFrames={DORIAN_VIDEO.durationInFrames * 2}
        fps={60}
        width={DORIAN_VIDEO.width}
        height={DORIAN_VIDEO.height}
      />
      {/* Dorian Debug - Click to get coordinates */}
      <Still
        id="DorianDebug"
        component={DorianDebug}
        width={DORIAN_VIDEO.width}
        height={DORIAN_VIDEO.height}
      />
      {/* ★ Dorian Demo WITH Debug Overlay - USE THIS FOR DEBUGGING */}
      <Composition
        id="DorianDemo-DEBUG"
        component={DorianDemoWithDebug}
        durationInFrames={DORIAN_VIDEO.durationInFrames}
        fps={DORIAN_VIDEO.fps}
        width={DORIAN_VIDEO.width}
        height={DORIAN_VIDEO.height}
      />
      {/* ★★ Dorian INTERACTIVE Debug - CLICK TO MARK POSITIONS */}
      <Composition
        id="DorianDemo-INTERACTIVE"
        component={DorianDebugInteractive}
        durationInFrames={DORIAN_VIDEO.durationInFrames}
        fps={DORIAN_VIDEO.fps}
        width={DORIAN_VIDEO.width}
        height={DORIAN_VIDEO.height}
      />
      {/* ========== LIMOR DEMOS ========== */}
      {/* Main Mobile Demo V2 - First Question (Revenue) */}
      <Composition
        id="MobileChatDemoV2"
        component={MobileChatDemoRefactored}
        durationInFrames={320}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Mobile Demo V3 - Second Question (Worker Hours) */}
      <Composition
        id="MobileChatDemoV3"
        component={MobileChatDemoV3}
        durationInFrames={335}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Mobile Demo V4 - With Lottie Hand Gestures */}
      <Composition
        id="MobileChatDemoV4"
        component={MobileChatDemoV4}
        durationInFrames={335}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* ★★ MobileChatDemoV4 INTERACTIVE Debug - CLICK TO MARK POSITIONS */}
      <Composition
        id="MobileChatDemoV4-INTERACTIVE"
        component={MobileChatDemoV4DebugInteractive}
        durationInFrames={335}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* ★★★ Mobile Demo COMBINED - V2 + V4 (Two Questions) */}
      <Composition
        id="MobileChatDemoCombined"
        component={MobileChatDemoCombined}
        durationInFrames={COMBINED_VIDEO.durationInFrames}
        fps={COMBINED_VIDEO.fps}
        width={COMBINED_VIDEO.width}
        height={COMBINED_VIDEO.height}
      />
      {/* ★★★ Combined INTERACTIVE Debug */}
      <Composition
        id="MobileChatDemoCombined-INTERACTIVE"
        component={MobileChatDemoCombinedDebugInteractive}
        durationInFrames={COMBINED_VIDEO.durationInFrames}
        fps={COMBINED_VIDEO.fps}
        width={COMBINED_VIDEO.width}
        height={COMBINED_VIDEO.height}
      />
      {/* Dashmor Demo - Labor Cost V3 Dashboard Scroll */}
      <Composition
        id="DashmorDemo"
        component={DashmorDemo}
        durationInFrames={DASHMOR_VIDEO.durationInFrames}
        fps={DASHMOR_VIDEO.fps}
        width={DASHMOR_VIDEO.width}
        height={DASHMOR_VIDEO.height}
      />
      {/* SceneDirector v2 is now a standalone app: npm run scene-director */}
    </>
  );
};
