/**
 * DemoContext — Orchestrator saves business context.
 * Duration: 13s (390 frames). No page reveal.
 */
import React from 'react';
import { DemoFlow, type DemoConfig, DEMO_SINGLE_SCENE_INFO } from '../components/DemoFlow';
import { ContextSavedCard } from '../components/ResultCards';
import { DEMO_CONTEXT_VIDEO } from '../constants';

const config: DemoConfig = {
  message:
    'Save our business context: SIGMA, AI platform for SMBs, targeting small business owners',
  agent: 'orchestrator',
  response: "Business context saved! I'll use this for all future requests.",
  cost: { amount: '$0.0003', model: 'gemini-2.5-flash', tokensIn: '2K', tokensOut: '512', steps: 2 },
  resultCard: <ContextSavedCard fields={12} totalFields={12} />,
  durationInFrames: DEMO_CONTEXT_VIDEO.durationInFrames,
};

export const DemoContext: React.FC = () => <DemoFlow config={config} />;

export const DEMO_CONTEXT_SCENE_INFO = DEMO_SINGLE_SCENE_INFO(DEMO_CONTEXT_VIDEO.durationInFrames);
