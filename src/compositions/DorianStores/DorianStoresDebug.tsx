import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SCENES, COLORS } from './constants';
import { StoreDashboardScene } from './scenes/StoreDashboardScene';

export const STORES_DEBUG_DURATION = SCENES.dashboard.duration; // 660 frames

export const DorianStoresDebug: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      <StoreDashboardScene />
    </AbsoluteFill>
  );
};
