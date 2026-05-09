import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { VIDEO, SCENES, COLORS } from './constants';
import { StoreDashboardScene } from './scenes/StoreDashboardScene';
import { MapSearchScene } from './scenes/MapSearchScene';
import { AIProductsScene } from './scenes/AIProductsScene';

export { VIDEO };

// Scene info for SceneDirector
export const STORES_SCENE_INFO = [
  {
    name: '1-StoreDashboard',
    start: SCENES.dashboard.start,
    end: SCENES.dashboard.start + SCENES.dashboard.duration,
  },
  {
    name: '2-MapSearch',
    start: SCENES.mapSearch.start,
    end: SCENES.mapSearch.start + SCENES.mapSearch.duration,
  },
  {
    name: '3-AIProducts',
    start: SCENES.aiProducts.start,
    end: SCENES.aiProducts.start + SCENES.aiProducts.duration,
  },
];

export const DorianStores: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      <Sequence
        from={SCENES.dashboard.start}
        durationInFrames={SCENES.dashboard.duration}
        name="1-StoreDashboard"
      >
        <StoreDashboardScene />
      </Sequence>

      <Sequence
        from={SCENES.mapSearch.start}
        durationInFrames={SCENES.mapSearch.duration}
        name="2-MapSearch"
      >
        <MapSearchScene />
      </Sequence>

      <Sequence
        from={SCENES.aiProducts.start}
        durationInFrames={SCENES.aiProducts.duration}
        name="3-AIProducts"
      >
        <AIProductsScene />
      </Sequence>
    </AbsoluteFill>
  );
};
