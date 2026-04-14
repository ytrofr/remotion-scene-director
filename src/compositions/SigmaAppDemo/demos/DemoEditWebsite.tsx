/**
 * DemoEditWebsite — Websites agent generates the SIGMA investor landing page.
 * Duration: 15s (450 frames). Page reveal: browser window popup with real investor page.
 */
import React from 'react';
import { DemoFlow, type DemoConfig, DEMO_SCENE_INFO } from '../components/DemoFlow';
import { WebsitePreviewCard } from '../components/ResultCards';
import { DEMO_EDIT_VIDEO } from '../constants';

const config: DemoConfig = {
  message:
    "Build a landing page for SIGMA — dark theme, hero with gradient, 'Agentify Your Business'",
  agent: 'websites',
  response: 'Your landing page is live! Grade A quality. Click to preview:',
  cost: { amount: '$0.0048', model: 'gemini-2.5-flash', tokensIn: '31K', tokensOut: '12K', steps: 5 },
  resultCard: (
    <WebsitePreviewCard
      title="SIGMA — Agentify Your Business"
      url="example.com/investors"
      description="AI platform for SMBs — 11 agents, one conversation"
      previewImage="sigma-demo/sigma_investor_hero.png"
    />
  ),
  link: { text: 'Open Website', url: 'example.com/investors' },
  pageRevealImage: 'sigma-demo/sigma_investor_hero.png',
  pageRevealType: 'browser-popup',
  pageRevealBadge: { color: '#10b981', label: 'A' },
  pageRevealCaption: 'Generated landing page — live in one message.',
  pageRevealScrollDown: true,
  durationInFrames: DEMO_EDIT_VIDEO.durationInFrames,
};

export const DemoEditWebsite: React.FC = () => <DemoFlow config={config} />;

export const DEMO_EDIT_SCENE_INFO = DEMO_SCENE_INFO(DEMO_EDIT_VIDEO.durationInFrames);
