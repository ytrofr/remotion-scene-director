/**
 * DorianFullV1_16 — V1.13 + Kevin MacLeod "Funkorama" (funk).
 *
 * User asked for a funky soundtrack version of DorianFull. Funkorama is a
 * 3:21 instrumental funk track by Kevin MacLeod (CC-BY 4.0, no watermarks)
 * — covers the 87s video easily. Attribution required: credit
 * "Kevin MacLeod (incompetech.com)" in the video description / end card.
 *
 * Track: kml-funkorama.mp3
 */
import React from 'react';
import { staticFile } from 'remotion';
import { DorianFullV1_13, FULL_VIDEO_V1_13 } from './DorianFullV1.13';
import { BackgroundMusic } from '../../components/BackgroundMusic';
import { useSceneDirectorMode } from '../../components/FloatingHand/SceneDirectorMode';

export const FULL_VIDEO_V1_16 = FULL_VIDEO_V1_13;

const SoundtrackV1_16: React.FC = () => {
  const isSceneDirector = useSceneDirectorMode();
  if (isSceneDirector) return null;
  return (
    <BackgroundMusic
      src={staticFile('audio/music/kml-funkorama.mp3')}
      volume={0.15}
      fadeInFrames={30}
      fadeOutFrames={60}
    />
  );
};

export const DorianFullV1_16: React.FC = () => (
  <>
    <DorianFullV1_13 />
    <SoundtrackV1_16 />
  </>
);
