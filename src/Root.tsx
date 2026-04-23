import React from 'react';
import { Composition, Folder, Still } from 'remotion';
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
import { DorianFull, FULL_VIDEO } from './compositions/DorianFull/DorianFull';
import {
  SigmaInvestorDemo,
  SIGMA_VIDEO,
} from './compositions/SigmaInvestorDemo';
import { SigmaAppDemo, SIGMA_APP_VIDEO } from './compositions/SigmaAppDemo';
import { DemoCreative } from './compositions/SigmaAppDemo/demos/DemoCreative';
import { DemoContext } from './compositions/SigmaAppDemo/demos/DemoContext';
import { DemoEditWebsite } from './compositions/SigmaAppDemo/demos/DemoEditWebsite';
import { DemoSEO } from './compositions/SigmaAppDemo/demos/DemoSEO';
import { DemoCampaign } from './compositions/SigmaAppDemo/demos/DemoCampaign';
import {
  DEMO_CREATIVE_VIDEO,
  DEMO_CONTEXT_VIDEO,
  DEMO_EDIT_VIDEO,
  DEMO_SEO_VIDEO,
  DEMO_CAMPAIGN_VIDEO,
} from './compositions/SigmaAppDemo/constants';
import { TransitionShowcase } from './compositions/SigmaAppDemo/TransitionShowcase';
import {
  ScrollStyleDemo,
  SCROLL_DEMO_VIDEO,
} from './compositions/ScrollStyleDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ========== SIGMA DEMOS (Agent Pitch Clips) ========== */}
      <Folder name="Sigma-Demos">
        <Composition
          id="DemoCreative"
          component={DemoCreative}
          durationInFrames={DEMO_CREATIVE_VIDEO.durationInFrames}
          fps={DEMO_CREATIVE_VIDEO.fps}
          width={DEMO_CREATIVE_VIDEO.width}
          height={DEMO_CREATIVE_VIDEO.height}
        />
        <Composition
          id="DemoContext"
          component={DemoContext}
          durationInFrames={DEMO_CONTEXT_VIDEO.durationInFrames}
          fps={DEMO_CONTEXT_VIDEO.fps}
          width={DEMO_CONTEXT_VIDEO.width}
          height={DEMO_CONTEXT_VIDEO.height}
        />
        <Composition
          id="DemoEditWebsite"
          component={DemoEditWebsite}
          durationInFrames={DEMO_EDIT_VIDEO.durationInFrames}
          fps={DEMO_EDIT_VIDEO.fps}
          width={DEMO_EDIT_VIDEO.width}
          height={DEMO_EDIT_VIDEO.height}
        />
        <Composition
          id="DemoSEO"
          component={DemoSEO}
          durationInFrames={DEMO_SEO_VIDEO.durationInFrames}
          fps={DEMO_SEO_VIDEO.fps}
          width={DEMO_SEO_VIDEO.width}
          height={DEMO_SEO_VIDEO.height}
        />
        <Composition
          id="DemoCampaign"
          component={DemoCampaign}
          durationInFrames={DEMO_CAMPAIGN_VIDEO.durationInFrames}
          fps={DEMO_CAMPAIGN_VIDEO.fps}
          width={DEMO_CAMPAIGN_VIDEO.width}
          height={DEMO_CAMPAIGN_VIDEO.height}
        />
        <Composition
          id="TransitionShowcase"
          component={TransitionShowcase}
          durationInFrames={750}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      {/* ========== SIGMA FULL (Product + Investor) ========== */}
      <Folder name="Sigma-Full">
        <Composition
          id="SigmaAppDemo"
          component={SigmaAppDemo}
          durationInFrames={SIGMA_APP_VIDEO.durationInFrames}
          fps={SIGMA_APP_VIDEO.fps}
          width={SIGMA_APP_VIDEO.width}
          height={SIGMA_APP_VIDEO.height}
        />
        <Composition
          id="SigmaInvestorDemo"
          component={SigmaInvestorDemo}
          durationInFrames={SIGMA_VIDEO.durationInFrames}
          fps={SIGMA_VIDEO.fps}
          width={SIGMA_VIDEO.width}
          height={SIGMA_VIDEO.height}
        />
      </Folder>

      {/* ========== DORIAN ========== */}
      <Folder name="Dorian">
        <Composition
          id="DorianDemo"
          component={DorianDemo}
          durationInFrames={DORIAN_VIDEO.durationInFrames}
          fps={DORIAN_VIDEO.fps}
          width={DORIAN_VIDEO.width}
          height={DORIAN_VIDEO.height}
        />
        <Composition
          id="DorianDemo-60fps"
          component={DorianDemo}
          durationInFrames={DORIAN_VIDEO.durationInFrames * 2}
          fps={60}
          width={DORIAN_VIDEO.width}
          height={DORIAN_VIDEO.height}
        />
        <Composition
          id="DorianDemoEnhanced"
          component={DorianDemoEnhanced}
          durationInFrames={ENHANCED_VIDEO.durationInFrames}
          fps={ENHANCED_VIDEO.fps}
          width={ENHANCED_VIDEO.width}
          height={ENHANCED_VIDEO.height}
        />
        <Composition
          id="DorianStores"
          component={DorianStores}
          durationInFrames={STORES_VIDEO.durationInFrames}
          fps={STORES_VIDEO.fps}
          width={STORES_VIDEO.width}
          height={STORES_VIDEO.height}
        />
        <Composition
          id="DorianFull"
          component={DorianFull}
          durationInFrames={FULL_VIDEO.durationInFrames}
          fps={FULL_VIDEO.fps}
          width={FULL_VIDEO.width}
          height={FULL_VIDEO.height}
        />
      </Folder>

      {/* ========== MOBILE CHAT ========== */}
      <Folder name="Mobile-Chat">
        <Composition
          id="MobileChatDemoV2"
          component={MobileChatDemoRefactored}
          durationInFrames={320}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="MobileChatDemoV3"
          component={MobileChatDemoV3}
          durationInFrames={335}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="MobileChatDemoV4"
          component={MobileChatDemoV4}
          durationInFrames={335}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="MobileChatDemoCombined"
          component={MobileChatDemoCombined}
          durationInFrames={COMBINED_VIDEO.durationInFrames}
          fps={COMBINED_VIDEO.fps}
          width={COMBINED_VIDEO.width}
          height={COMBINED_VIDEO.height}
        />
      </Folder>

      {/* ========== DASHMOR ========== */}
      <Folder name="Dashmor">
        <Composition
          id="DashmorDemo"
          component={DashmorDemo}
          durationInFrames={DASHMOR_VIDEO.durationInFrames}
          fps={DASHMOR_VIDEO.fps}
          width={DASHMOR_VIDEO.width}
          height={DASHMOR_VIDEO.height}
        />
      </Folder>

      {/* ========== UTILITIES ========== */}
      <Folder name="Utilities">
        <Composition
          id="HandGestureGallery"
          component={HandGestureGallery}
          durationInFrames={GALLERY_VIDEO.durationInFrames}
          fps={GALLERY_VIDEO.fps}
          width={GALLERY_VIDEO.width}
          height={GALLERY_VIDEO.height}
        />
        <Composition
          id="CapabilitiesDemo"
          component={CapabilitiesDemo}
          durationInFrames={CAPABILITIES_VIDEO.durationInFrames}
          fps={CAPABILITIES_VIDEO.fps}
          width={CAPABILITIES_VIDEO.width}
          height={CAPABILITIES_VIDEO.height}
        />
        <Composition
          id="SharedComponentsDemo"
          component={SharedComponentsDemo}
          durationInFrames={DEMO_VIDEO.durationInFrames}
          fps={DEMO_VIDEO.fps}
          width={DEMO_VIDEO.width}
          height={DEMO_VIDEO.height}
        />
        <Composition
          id="ScrollStyleDemo"
          component={ScrollStyleDemo}
          durationInFrames={SCROLL_DEMO_VIDEO.durationInFrames}
          fps={SCROLL_DEMO_VIDEO.fps}
          width={SCROLL_DEMO_VIDEO.width}
          height={SCROLL_DEMO_VIDEO.height}
        />
      </Folder>

      {/* ========== DEBUG ========== */}
      <Folder name="Debug">
        <Still
          id="DorianDebug"
          component={DorianDebug}
          width={DORIAN_VIDEO.width}
          height={DORIAN_VIDEO.height}
        />
        <Composition
          id="DorianDemo-DEBUG"
          component={DorianDemoWithDebug}
          durationInFrames={DORIAN_VIDEO.durationInFrames}
          fps={DORIAN_VIDEO.fps}
          width={DORIAN_VIDEO.width}
          height={DORIAN_VIDEO.height}
        />
        <Composition
          id="DorianDemo-INTERACTIVE"
          component={DorianDebugInteractive}
          durationInFrames={DORIAN_VIDEO.durationInFrames}
          fps={DORIAN_VIDEO.fps}
          width={DORIAN_VIDEO.width}
          height={DORIAN_VIDEO.height}
        />
        <Composition
          id="MobileChatDemoV4-INTERACTIVE"
          component={MobileChatDemoV4DebugInteractive}
          durationInFrames={335}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="MobileChatDemoCombined-INTERACTIVE"
          component={MobileChatDemoCombinedDebugInteractive}
          durationInFrames={COMBINED_VIDEO.durationInFrames}
          fps={COMBINED_VIDEO.fps}
          width={COMBINED_VIDEO.width}
          height={COMBINED_VIDEO.height}
        />
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
        <Composition
          id="DashmorDemo-INTERACTIVE"
          component={DebugSectionPickerInteractive}
          durationInFrames={DASHMOR_VIDEO.durationInFrames}
          fps={DASHMOR_VIDEO.fps}
          width={DASHMOR_VIDEO.width}
          height={DASHMOR_VIDEO.height}
        />
        <Composition
          id="DorianStoresDebug"
          component={DorianStoresDebug}
          durationInFrames={STORES_DEBUG_DURATION}
          fps={STORES_VIDEO.fps}
          width={STORES_VIDEO.width}
          height={STORES_VIDEO.height}
        />
      </Folder>
      {/* SceneDirector v2 is now a standalone app: npm run scene-director */}
    </>
  );
};
