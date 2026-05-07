/**
 * DorianFullV1_20 — V1.19 + scene-4 cursor-size normalization.
 *
 * Same wrapper as V1.19 (V1.13 visuals + Funkorama soundtrack + soft-pulse
 * SD-overlay flags). Diff from V1.19 is data-only, in codedPaths.data.json
 * for `DorianFullV1-20`:
 *   - 4-ChatOpen primary[0] (frame 11, gesture=pointer): scale 2.2 → 1.
 *     V1.19's f11 waypoint had a leftover scale=2.2 that interpolated down
 *     to scale=1 at the click frame, making the cursor "start big and
 *     shrink across the path". V1.20 normalizes it so the cursor stays at
 *     a constant size (= layer.data.size), and the only size change you
 *     see is the soft-pulse shrink at the click frame itself.
 *
 * Audited V1.19 across all 14 scenes — only this single waypoint had a
 * non-1 scale value, so V1.20 needs no other waypoint changes.
 *
 * Soundtrack: Kevin MacLeod "Funkorama" (CC-BY 4.0). Attribution required:
 *   credit "Kevin MacLeod (incompetech.com)" in the video description.
 */
import React from 'react';
import { staticFile } from 'remotion';
import { DorianFullV1_13, FULL_VIDEO_V1_13 } from './DorianFullV1.13';
import { BackgroundMusic } from '../../components/BackgroundMusic';
import { useSceneDirectorMode } from '../../components/FloatingHand/SceneDirectorMode';

export const FULL_VIDEO_V1_20 = FULL_VIDEO_V1_13;

const SoundtrackV1_20: React.FC = () => {
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

export const DorianFullV1_20: React.FC = () => (
  <>
    <DorianFullV1_13 />
    <SoundtrackV1_20 />
  </>
);
