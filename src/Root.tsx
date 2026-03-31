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
  DebugSectionPicker,
  DebugSectionPickerInteractive,
  VIDEO as DASHMOR_VIDEO,
} from './compositions/DashmorDemo';
import { HandGestureGallery } from './compositions/HandGestureGallery/HandGestureGallery';
import { VIDEO as GALLERY_VIDEO } from './compositions/HandGestureGallery/constants';
import {
  CapabilitiesDemo,
  CAPABILITIES_VIDEO,
} from './compositions/CapabilitiesDemo';
import {
  SharedComponentsDemo,
  DEMO_VIDEO,
} from './compositions/SharedComponentsDemo';
import {
  DorianDemoEnhanced,
  ENHANCED_VIDEO,
} from './compositions/DorianDemoEnhanced';
import {
  DorianStores,
  VIDEO as STORES_VIDEO,
} from './compositions/DorianStores/DorianStores';
import {
  DorianStoresDebug,
  STORES_DEBUG_DURATION,
} from './compositions/DorianStores/DorianStoresDebug';
import {
  DorianFull,
  FULL_VIDEO,
} from './compositions/DorianFull/DorianFull';
import {
  SigmaInvestorDemo,
  SIGMA_VIDEO,
} from './compositions/SigmaInvestorDemo';
import {
  SigmaAppDemo,
  SIGMA_APP_VIDEO,
} from './compositions/SigmaAppDemo';

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
      {/* ★ Dashmor DEBUG - Section scroll position picker */}
      <Composition
        id="DashmorDemo-DEBUG"
        component={DebugSectionPicker as React.FC}
        durationInFrames={DASHMOR_VIDEO.durationInFrames}
        fps={DASHMOR_VIDEO.fps}
        width={DASHMOR_VIDEO.width}
        height={DASHMOR_VIDEO.height}
        defaultProps={{
          sectionIndex: 0,
          scrollY: 0,
        }}
      />
      {/* ★★ Dashmor INTERACTIVE - Click to adjust scroll positions */}
      <Composition
        id="DashmorDemo-INTERACTIVE"
        component={DebugSectionPickerInteractive}
        durationInFrames={DASHMOR_VIDEO.durationInFrames}
        fps={DASHMOR_VIDEO.fps}
        width={DASHMOR_VIDEO.width}
        height={DASHMOR_VIDEO.height}
      />
      {/* ========== UTILITIES ========== */}
      {/* Hand Gesture Gallery - Preview all Lottie animations */}
      <Composition
        id="HandGestureGallery"
        component={HandGestureGallery}
        durationInFrames={GALLERY_VIDEO.durationInFrames}
        fps={GALLERY_VIDEO.fps}
        width={GALLERY_VIDEO.width}
        height={GALLERY_VIDEO.height}
      />
      {/* ========== CAPABILITIES DEMO ========== */}
      <Composition
        id="CapabilitiesDemo"
        component={CapabilitiesDemo}
        durationInFrames={CAPABILITIES_VIDEO.durationInFrames}
        fps={CAPABILITIES_VIDEO.fps}
        width={CAPABILITIES_VIDEO.width}
        height={CAPABILITIES_VIDEO.height}
      />
      {/* ========== SHARED COMPONENTS DEMO ========== */}
      <Composition
        id="SharedComponentsDemo"
        component={SharedComponentsDemo}
        durationInFrames={DEMO_VIDEO.durationInFrames}
        fps={DEMO_VIDEO.fps}
        width={DEMO_VIDEO.width}
        height={DEMO_VIDEO.height}
      />
      {/* ========== DORIAN DEMO ENHANCED ========== */}
      <Composition
        id="DorianDemoEnhanced"
        component={DorianDemoEnhanced}
        durationInFrames={ENHANCED_VIDEO.durationInFrames}
        fps={ENHANCED_VIDEO.fps}
        width={ENHANCED_VIDEO.width}
        height={ENHANCED_VIDEO.height}
      />
      {/* ========== DORIAN STORES ========== */}
      <Composition
        id="DorianStores"
        component={DorianStores}
        durationInFrames={STORES_VIDEO.durationInFrames}
        fps={STORES_VIDEO.fps}
        width={STORES_VIDEO.width}
        height={STORES_VIDEO.height}
      />
      {/* ========== DORIAN FULL (Demo + Stores combined) ========== */}
      <Composition
        id="DorianFull"
        component={DorianFull}
        durationInFrames={FULL_VIDEO.durationInFrames}
        fps={FULL_VIDEO.fps}
        width={FULL_VIDEO.width}
        height={FULL_VIDEO.height}
      />
      {/* Debug: Scene 1 only */}
      <Composition
        id="DorianStoresDebug"
        component={DorianStoresDebug}
        durationInFrames={STORES_DEBUG_DURATION}
        fps={STORES_VIDEO.fps}
        width={STORES_VIDEO.width}
        height={STORES_VIDEO.height}
      />
      {/* ========== SIGMA INVESTOR DEMO ========== */}
      <Composition
        id="SigmaInvestorDemo"
        component={SigmaInvestorDemo}
        durationInFrames={SIGMA_VIDEO.durationInFrames}
        fps={SIGMA_VIDEO.fps}
        width={SIGMA_VIDEO.width}
        height={SIGMA_VIDEO.height}
      />
      {/* ========== SIGMA APP DEMO (Product Demo) ========== */}
      <Composition
        id="SigmaAppDemo"
        component={SigmaAppDemo}
        durationInFrames={SIGMA_APP_VIDEO.durationInFrames}
        fps={SIGMA_APP_VIDEO.fps}
        width={SIGMA_APP_VIDEO.width}
        height={SIGMA_APP_VIDEO.height}
      />
      {/* SceneDirector v2 is now a standalone app: npm run scene-director */}
    </>
  );
};
