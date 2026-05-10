/**
 * HomeScrollSceneV1_09 — V1.09 of HomeScrollScene.
 *
 * Diff vs HomeScrollScene (V1.00 / V1.08):
 *   - Scroll cursor uses scrollbar-drag pattern (selected from
 *     ScrollEffectDemo Option 3 "Big-200px"):
 *     * X = 880 (right scrollbar position, just inside phone bezel)
 *       Was: 780 (mid-content). Old position read as "cursor floating in
 *       the list" — new position reads as "cursor on the scrollbar."
 *     * Y travels 200px (Y=860 → Y=1060) over the scroll-active window.
 *       Old version held cursor STATIC and used velocity-driven tilt to
 *       fake scroll gesture; new version visibly slides on scrollbar.
 *   - Physics swapped to HAND_PHYSICS.scrollbar (velocityScale:0, maxRotation:0).
 *     Kills the "weird tilt" (rotation: -22 in old waypoints + 5° velocity
 *     tilt from HAND_PHYSICS.scroll).
 *   - dark={false} (correct cursor — cursor-real-black is already dark; rule 43).
 *   - Hardcoded path; intentionally does NOT consult getSavedPath() so the
 *     V1.09 scrollbar pattern is locked regardless of any V1.00-era saved data
 *     for scene "2-HomeScroll".
 *
 * Companion: DorianDemoV1.09.tsx imports this. See .claude/rules/version-safe-iteration.md.
 */
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, HAND_PHYSICS, PHONE, handSizeForZoom } from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import { DorianPhoneMockup as DorianPhoneMockupNew } from '../DorianPhoneMockup';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { fontFamily } from '../../../lib/fonts';
import { getSavedPath } from '../../SceneDirector/codedPaths';

/**
 * Optional `compositionId` prop — when set, the scene reads SD-saved
 * waypoints for "2-HomeScroll" from that comp. If saved data is present
 * (≥2 waypoints), it OVERRIDES the hardcoded scrollbar-drag pattern
 * below. If no compositionId is passed (V1.10–V1.21 callers), behavior
 * is unchanged: hardcoded x=880 path locked in.
 *
 * V1.22+ wires this so SceneDirector edits actually render. Earlier
 * versions deliberately froze the pattern; that freeze stands for them.
 */
export const HomeScrollSceneV1_09: React.FC<{ compositionId?: string }> = ({
  compositionId,
}) => {
  const frame = useCurrentFrame();

  // Scroll progress: 0 = homepage, 1 = products. Same window as V1.00 (30-120).
  const scrollProgress = interpolate(frame, [30, 120], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Scrollbar-drag waypoints (Big-200px). X=880 right edge of phone content.
  // Y travels Y_TOP=860 → Y_BOT=1060 over the scroll window (frames 30-120).
  const X_SCROLLBAR = 880;
  const Y_MID = 960;
  const Y_TOP = Y_MID - 100;
  const Y_BOT = Y_MID + 100;
  // SceneDirector override (V1.22+ via `compositionId` prop). When the
  // caller supplies a comp ID AND that comp has saved waypoints with ≥2
  // points, those waypoints win. Otherwise fall through to the hardcoded
  // scrollbar pattern below — preserves V1.10–V1.21 behavior byte-for-byte.
  const sdSaved = compositionId
    ? getSavedPath(compositionId, '2-HomeScroll')
    : null;
  const sdPath =
    sdSaved && Array.isArray(sdSaved.path) && sdSaved.path.length >= 2
      ? sdSaved.path
      : null;

  const hardcodedScrollHandPath: HandPathPoint[] = [
    // Enter from off-screen right at scrollbar's start Y
    { x: 1050, y: Y_TOP, frame: 0, gesture: 'pointer', rotation: 0, scale: 1 },
    // Arrive at scrollbar
    {
      x: X_SCROLLBAR,
      y: Y_TOP,
      frame: 20,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
    },
    // Begin drag (scroll-active starts at f30)
    {
      x: X_SCROLLBAR,
      y: Y_TOP,
      frame: 30,
      gesture: 'drag',
      rotation: 0,
      scale: 1,
    },
    // End drag at f120 (scroll-active ends)
    {
      x: X_SCROLLBAR,
      y: Y_BOT,
      frame: 120,
      gesture: 'drag',
      rotation: 0,
      scale: 1,
    },
    // Release to pointer, hold to end of scene
    {
      x: X_SCROLLBAR,
      y: Y_BOT,
      frame: 125,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
    },
    {
      x: X_SCROLLBAR,
      y: Y_BOT,
      frame: 150,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
    },
  ];

  const scrollHandPath: HandPathPoint[] = sdPath ?? hardcodedScrollHandPath;

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      <AnimatedText
        delay={0}
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            fontFamily,
          }}
        >
          Discover Local Products
        </div>
      </AnimatedText>

      {/* Phone with scrollable content INSIDE */}
      <DorianPhoneMockupNew
        scrollProgress={scrollProgress}
        scale={1.8}
        showAIBubble={true}
      />

      {/* Scrollbar-drag cursor */}
      <FloatingHand
        path={scrollHandPath}
        startFrame={0}
        animation="cursor-real-black"
        size={handSizeForZoom(PHONE.displayScale)}
        dark={false}
        showRipple={false}
        physics={HAND_PHYSICS.scrollbar}
      />
    </AbsoluteFill>
  );
};
