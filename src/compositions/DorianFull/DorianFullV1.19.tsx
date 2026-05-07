/**
 * DorianFullV1_19 — V1.18 + soft-pulse-ONLY click style (no burst Lottie).
 *
 * Same render output as V1.18 (Funkorama soundtrack + V1.13 visuals). The
 * NEW thing in V1.19 is consistent click visuals across BOTH the rendered
 * MP4 AND the SceneDirector edit-mode preview overlay:
 *   - Render path (Remotion Player): V1.13 already wraps everything in
 *     <ClickStyleProvider value="soft-pulse"> — the cursor shrinks like a
 *     beat on click and the ripple circle is killed. No burst Lottie is
 *     passed by any scene .tsx file. Already correct.
 *   - SD preview path (FloatingHandOverlay): used to load the global
 *     state.clickAnimation Lottie (default 'click-burst-soft-xs') and
 *     overlay it on every cursor click — that's the "bursting lines" the
 *     user was seeing. V1.19 uses the new per-composition
 *     `clickAnimationOverride: null` flag in compositions.ts to suppress
 *     that Lottie load. The cursor still shrinks (soft-pulse) but no
 *     burst lines render.
 *
 * Soundtrack: Kevin MacLeod "Funkorama" (CC-BY 4.0). Attribution required:
 *   credit "Kevin MacLeod (incompetech.com)" in the video description.
 */
import React from 'react';
import { staticFile } from 'remotion';
import { DorianFullV1_13, FULL_VIDEO_V1_13 } from './DorianFullV1.13';
import { BackgroundMusic } from '../../components/BackgroundMusic';
import { useSceneDirectorMode } from '../../components/FloatingHand/SceneDirectorMode';

export const FULL_VIDEO_V1_19 = FULL_VIDEO_V1_13;

const SoundtrackV1_19: React.FC = () => {
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

export const DorianFullV1_19: React.FC = () => (
  <>
    <DorianFullV1_13 />
    <SoundtrackV1_19 />
  </>
);
