/**
 * DorianFullV1_140 — V1.13 + Kevin MacLeod "Backbay Lounge" (jazz lounge).
 *
 * Replaces the prior Bensound "Cozy Coffee House" track which had embedded
 * "bensound dot com" voice watermarks. Kevin MacLeod tracks (incompetech.com)
 * are CC-BY 4.0 — instrumental, no watermarks. Attribution required: credit
 * "Kevin MacLeod (incompetech.com)" in the video description / end card.
 *
 * Track: kml-backbay-lounge.mp3 (4:26 — covers 87s video easily)
 */
import React from 'react';
import { staticFile } from 'remotion';
import { DorianFullV1_13, FULL_VIDEO_V1_13 } from './DorianFullV1.13';
import { BackgroundMusic } from '../../components/BackgroundMusic';
import { useSceneDirectorMode } from '../../components/FloatingHand/SceneDirectorMode';

export const FULL_VIDEO_V1_140 = FULL_VIDEO_V1_13;

const SoundtrackV1_140: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;
  return (
    <BackgroundMusic
      src={staticFile('audio/music/kml-backbay-lounge.mp3')}
      volume={0.15}
      fadeInFrames={30}
      fadeOutFrames={60}
    />
  );
};

export const DorianFullV1_140: React.FC = () => (
  <>
    <DorianFullV1_13 />
    <SoundtrackV1_140 />
  </>
);
