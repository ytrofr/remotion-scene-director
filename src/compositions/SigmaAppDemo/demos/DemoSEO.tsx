/**
 * DemoSEO — Reach agent analyzes SEO. Page reveal: REAL Analytics dashboard with data.
 * Duration: 15s (450 frames).
 */
import React from 'react';
import { DemoFlow, type DemoConfig, DEMO_SCENE_INFO } from '../components/DemoFlow';
import { SEOResultCard } from '../components/ResultCards';
import { DEMO_SEO_VIDEO } from '../constants';

const config: DemoConfig = {
  message:
    'Analyze SEO for sigma-app.vercel.app — audit performance, generate meta tags + schema',
  agent: 'reach',
  response: 'SEO analysis complete! Score 92/100. Meta tags, schema, and OG cards generated.',
  cost: { amount: '$0.0018', model: 'gemini-2.5-flash', tokensIn: '18K', tokensOut: '4K', steps: 4 },
  resultCard: <SEOResultCard score={92} metaCount={8} schemaTypes={3} ogTags={6} />,
  pageRevealVideo: 'sigma-demo/recordings/analytics.mp4',
  pageRevealVideoStartSec: 3,
  pageRevealType: 'app-load',
  pageRevealBadge: { color: '#16a34a', label: 'R' },
  pageRevealCaption: 'Reach Agent — SEO audit, meta tags, schema markup — automated.',
  durationInFrames: DEMO_SEO_VIDEO.durationInFrames,
};

export const DemoSEO: React.FC = () => <DemoFlow config={config} />;

export const DEMO_SEO_SCENE_INFO = DEMO_SCENE_INFO(DEMO_SEO_VIDEO.durationInFrames);
