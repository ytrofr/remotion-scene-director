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
  DorianFullV1_10,
  FULL_VIDEO_V1_10,
} from './compositions/DorianFull/DorianFullV1.10';
import {
  DorianFullV1_11,
  FULL_VIDEO_V1_11,
} from './compositions/DorianFull/DorianFullV1.11';
import {
  DorianFullV1_12,
  FULL_VIDEO_V1_12,
} from './compositions/DorianFull/DorianFullV1.12';
import {
  DorianFullV1_13,
  FULL_VIDEO_V1_13,
} from './compositions/DorianFull/DorianFullV1.13';
import {
  DorianFullV1_140,
  FULL_VIDEO_V1_140,
} from './compositions/DorianFull/DorianFullV1.140';
import {
  DorianFullV1_14,
  FULL_VIDEO_V1_14,
} from './compositions/DorianFull/DorianFullV1.14';
import {
  DorianFullV1_15,
  FULL_VIDEO_V1_15,
} from './compositions/DorianFull/DorianFullV1.15';
import {
  DorianFullV1_16,
  FULL_VIDEO_V1_16,
} from './compositions/DorianFull/DorianFullV1.16';
import {
  DorianFullV1_17,
  FULL_VIDEO_V1_17,
} from './compositions/DorianFull/DorianFullV1.17';
import {
  DorianFullV1_18,
  FULL_VIDEO_V1_18,
} from './compositions/DorianFull/DorianFullV1.18';
import {
  DorianFullV1_19,
  FULL_VIDEO_V1_19,
} from './compositions/DorianFull/DorianFullV1.19';
import {
  DorianFullV1_20,
  FULL_VIDEO_V1_20,
} from './compositions/DorianFull/DorianFullV1.20';
import {
  DorianFullV1_21,
  FULL_VIDEO_V1_21,
} from './compositions/DorianFull/DorianFullV1.21';
import {
  ClickStyleDemo,
  CLICK_STYLE_DEMO_TOTAL,
} from './compositions/ClickStyleDemo/ClickStyleDemo';
import {
  DorianImprovementsDemo,
  DORIAN_IMPROVEMENTS_TOTAL,
} from './compositions/DorianImprovementsDemo/DorianImprovementsDemo';
import {
  DorianImprovementsDemoV2,
  DORIAN_IMPROVEMENTS_V2_TOTAL,
} from './compositions/DorianImprovementsDemoV2/DorianImprovementsDemoV2';
import {
  SigmaInvestorDemo,
  SIGMA_VIDEO,
} from './compositions/SigmaInvestorDemo';
import {
  ScopeDemoComposition,
  OAuthFlowComposition,
  GMAIL_READONLY,
  GMAIL_SEND,
  GMAIL_COMPOSE,
  GMAIL_MODIFY,
  CALENDAR_DEMO,
  CONTACTS_DEMO,
  SHEETS_DEMO,
  OAUTH_DEMO_FPS,
  OAUTH_DEMO_WIDTH,
  OAUTH_DEMO_HEIGHT,
} from './compositions/AgentSmithOAuth';
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
import {
  ScrollEffectDemo,
  SCROLL_EFFECT_VIDEO,
} from './compositions/ScrollEffectDemo/ScrollEffectDemo';

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
        <Composition
          id="DorianFullV1-10"
          component={DorianFullV1_10}
          durationInFrames={FULL_VIDEO_V1_10.durationInFrames}
          fps={FULL_VIDEO_V1_10.fps}
          width={FULL_VIDEO_V1_10.width}
          height={FULL_VIDEO_V1_10.height}
        />
        <Composition
          id="DorianFullV1-11"
          component={DorianFullV1_11}
          durationInFrames={FULL_VIDEO_V1_11.durationInFrames}
          fps={FULL_VIDEO_V1_11.fps}
          width={FULL_VIDEO_V1_11.width}
          height={FULL_VIDEO_V1_11.height}
        />
        <Composition
          id="DorianFullV1-12"
          component={DorianFullV1_12}
          durationInFrames={FULL_VIDEO_V1_12.durationInFrames}
          fps={FULL_VIDEO_V1_12.fps}
          width={FULL_VIDEO_V1_12.width}
          height={FULL_VIDEO_V1_12.height}
        />
        <Composition
          id="DorianFullV1-13"
          component={DorianFullV1_13}
          durationInFrames={FULL_VIDEO_V1_13.durationInFrames}
          fps={FULL_VIDEO_V1_13.fps}
          width={FULL_VIDEO_V1_13.width}
          height={FULL_VIDEO_V1_13.height}
        />
        <Composition
          id="DorianFullV1-140"
          component={DorianFullV1_140}
          durationInFrames={FULL_VIDEO_V1_140.durationInFrames}
          fps={FULL_VIDEO_V1_140.fps}
          width={FULL_VIDEO_V1_140.width}
          height={FULL_VIDEO_V1_140.height}
        />
        <Composition
          id="DorianFullV1-14"
          component={DorianFullV1_14}
          durationInFrames={FULL_VIDEO_V1_14.durationInFrames}
          fps={FULL_VIDEO_V1_14.fps}
          width={FULL_VIDEO_V1_14.width}
          height={FULL_VIDEO_V1_14.height}
        />
        <Composition
          id="DorianFullV1-15"
          component={DorianFullV1_15}
          durationInFrames={FULL_VIDEO_V1_15.durationInFrames}
          fps={FULL_VIDEO_V1_15.fps}
          width={FULL_VIDEO_V1_15.width}
          height={FULL_VIDEO_V1_15.height}
        />
        <Composition
          id="DorianFullV1-16"
          component={DorianFullV1_16}
          durationInFrames={FULL_VIDEO_V1_16.durationInFrames}
          fps={FULL_VIDEO_V1_16.fps}
          width={FULL_VIDEO_V1_16.width}
          height={FULL_VIDEO_V1_16.height}
        />
        <Composition
          id="DorianFullV1-17"
          component={DorianFullV1_17}
          durationInFrames={FULL_VIDEO_V1_17.durationInFrames}
          fps={FULL_VIDEO_V1_17.fps}
          width={FULL_VIDEO_V1_17.width}
          height={FULL_VIDEO_V1_17.height}
        />
        <Composition
          id="DorianFullV1-18"
          component={DorianFullV1_18}
          durationInFrames={FULL_VIDEO_V1_18.durationInFrames}
          fps={FULL_VIDEO_V1_18.fps}
          width={FULL_VIDEO_V1_18.width}
          height={FULL_VIDEO_V1_18.height}
        />
        <Composition
          id="DorianFullV1-19"
          component={DorianFullV1_19}
          durationInFrames={FULL_VIDEO_V1_19.durationInFrames}
          fps={FULL_VIDEO_V1_19.fps}
          width={FULL_VIDEO_V1_19.width}
          height={FULL_VIDEO_V1_19.height}
        />
        <Composition
          id="DorianFullV1-20"
          component={DorianFullV1_20}
          durationInFrames={FULL_VIDEO_V1_20.durationInFrames}
          fps={FULL_VIDEO_V1_20.fps}
          width={FULL_VIDEO_V1_20.width}
          height={FULL_VIDEO_V1_20.height}
        />
        <Composition
          id="DorianFullV1-21"
          component={DorianFullV1_21}
          durationInFrames={FULL_VIDEO_V1_21.durationInFrames}
          fps={FULL_VIDEO_V1_21.fps}
          width={FULL_VIDEO_V1_21.width}
          height={FULL_VIDEO_V1_21.height}
        />
        <Composition
          id="ClickStyleDemo"
          component={ClickStyleDemo}
          durationInFrames={CLICK_STYLE_DEMO_TOTAL}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="DorianImprovementsDemo"
          component={DorianImprovementsDemo}
          durationInFrames={DORIAN_IMPROVEMENTS_TOTAL}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="DorianImprovementsDemoV2"
          component={DorianImprovementsDemoV2}
          durationInFrames={DORIAN_IMPROVEMENTS_V2_TOTAL}
          fps={30}
          width={1080}
          height={1920}
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
        <Composition
          id="ScrollEffectDemo"
          component={ScrollEffectDemo}
          durationInFrames={SCROLL_EFFECT_VIDEO.durationInFrames}
          fps={SCROLL_EFFECT_VIDEO.fps}
          width={SCROLL_EFFECT_VIDEO.width}
          height={SCROLL_EFFECT_VIDEO.height}
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

      {/* Google OAuth Verification — submission demo videos */}
      <Folder name="AgentSmith-OAuth-Verification">
        <Composition
          id="AgentSmithOAuthFlow"
          component={OAuthFlowComposition}
          durationInFrames={1650}
          fps={OAUTH_DEMO_FPS}
          width={OAUTH_DEMO_WIDTH}
          height={OAUTH_DEMO_HEIGHT}
        />
        <Composition
          id="AgentSmithGmailReadonly"
          component={ScopeDemoComposition}
          defaultProps={{ demo: GMAIL_READONLY }}
          durationInFrames={1500}
          fps={OAUTH_DEMO_FPS}
          width={OAUTH_DEMO_WIDTH}
          height={OAUTH_DEMO_HEIGHT}
        />
        <Composition
          id="AgentSmithGmailSend"
          component={ScopeDemoComposition}
          defaultProps={{ demo: GMAIL_SEND }}
          durationInFrames={1500}
          fps={OAUTH_DEMO_FPS}
          width={OAUTH_DEMO_WIDTH}
          height={OAUTH_DEMO_HEIGHT}
        />
        <Composition
          id="AgentSmithGmailCompose"
          component={ScopeDemoComposition}
          defaultProps={{ demo: GMAIL_COMPOSE }}
          durationInFrames={1500}
          fps={OAUTH_DEMO_FPS}
          width={OAUTH_DEMO_WIDTH}
          height={OAUTH_DEMO_HEIGHT}
        />
        <Composition
          id="AgentSmithGmailModify"
          component={ScopeDemoComposition}
          defaultProps={{ demo: GMAIL_MODIFY }}
          durationInFrames={1500}
          fps={OAUTH_DEMO_FPS}
          width={OAUTH_DEMO_WIDTH}
          height={OAUTH_DEMO_HEIGHT}
        />
        <Composition
          id="AgentSmithCalendar"
          component={ScopeDemoComposition}
          defaultProps={{ demo: CALENDAR_DEMO }}
          durationInFrames={1500}
          fps={OAUTH_DEMO_FPS}
          width={OAUTH_DEMO_WIDTH}
          height={OAUTH_DEMO_HEIGHT}
        />
        <Composition
          id="AgentSmithContacts"
          component={ScopeDemoComposition}
          defaultProps={{ demo: CONTACTS_DEMO }}
          durationInFrames={1500}
          fps={OAUTH_DEMO_FPS}
          width={OAUTH_DEMO_WIDTH}
          height={OAUTH_DEMO_HEIGHT}
        />
        <Composition
          id="AgentSmithSheets"
          component={ScopeDemoComposition}
          defaultProps={{ demo: SHEETS_DEMO }}
          durationInFrames={1500}
          fps={OAUTH_DEMO_FPS}
          width={OAUTH_DEMO_WIDTH}
          height={OAUTH_DEMO_HEIGHT}
        />
      </Folder>
      {/* SceneDirector v2 is now a standalone app: npm run scene-director */}
    </>
  );
};
