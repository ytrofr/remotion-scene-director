/**
 * DemoCreative — Nano Banana agent creates social posts with real OGAS AI images.
 * Duration: 20s (600 frames). Page reveal: REAL Creative Studio scoped to OGAS project.
 */
import React from 'react';
import { DemoFlow, type DemoConfig, DEMO_SCENE_INFO } from '../components/DemoFlow';
import { CreativeImageCard } from '../components/ResultCards';
import { DEMO_CREATIVE_VIDEO } from '../constants';

const CREATIVE_IMAGES = [
  'sigma-demo/creative/creative_01.jpg',
  'sigma-demo/creative/creative_02.jpg',
  'sigma-demo/creative/creative_03.jpg',
];

const config: DemoConfig = {
  message:
    'Create social media posts for SIGMA — Instagram, LinkedIn and Twitter with brand visuals',
  agent: 'nano_banana',
  response: "Done! Here are 3 AI-generated variations — one per platform. Want changes?",
  cost: { amount: '$0.0032', model: 'gemini-2.0-flash', tokensIn: '4K', tokensOut: '512', steps: 4 },
  resultCard: <CreativeImageCard images={CREATIVE_IMAGES} />,
  pageRevealVideo: 'sigma-demo/recordings/creative.mp4',
  pageRevealVideoStartSec: 26,
  pageRevealType: 'app-load',
  pageRevealBadge: { color: '#ec4899', label: 'N' },
  pageRevealCaption: 'Creative Studio — real AI-generated social post variations.',
  durationInFrames: DEMO_CREATIVE_VIDEO.durationInFrames,
};

export const DemoCreative: React.FC = () => <DemoFlow config={config} />;

export const DEMO_CREATIVE_SCENE_INFO = DEMO_SCENE_INFO(DEMO_CREATIVE_VIDEO.durationInFrames);
