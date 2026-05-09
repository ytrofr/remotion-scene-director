/**
 * DemoCampaign — Google Ads agent creates a search campaign.
 * Duration: 15s (450 frames). Page reveal: REAL app screenshot.
 */
import React from 'react';
import { DemoFlow, type DemoConfig, DEMO_SCENE_INFO } from '../components/DemoFlow';
import { CampaignResultCard } from '../components/ResultCards';
import { DEMO_CAMPAIGN_VIDEO } from '../constants';

const config: DemoConfig = {
  message:
    "Create Google Search Ads campaign for SIGMA targeting 'AI tools for small business'",
  agent: 'google_ads',
  response: 'Campaign ready! 3 ad groups, 12 keywords, 4 responsive search ads.',
  cost: { amount: '$0.0031', model: 'gemini-2.5-flash', tokensIn: '22K', tokensOut: '6K', steps: 5 },
  resultCard: <CampaignResultCard budget="$50/day" keywords={12} adGroups={3} ads={4} />,
  pageRevealVideo: 'sigma-demo/recordings/google_ads.mp4',
  pageRevealVideoStartSec: 7,
  pageRevealType: 'app-load',
  pageRevealBadge: { color: '#f59e0b', label: 'G' },
  pageRevealCaption: 'Google Ads Campaign Generator — ready to launch.',
  durationInFrames: DEMO_CAMPAIGN_VIDEO.durationInFrames,
};

export const DemoCampaign: React.FC = () => <DemoFlow config={config} />;

export const DEMO_CAMPAIGN_SCENE_INFO = DEMO_SCENE_INFO(DEMO_CAMPAIGN_VIDEO.durationInFrames);
