/**
 * ProductPageSceneV1_12 — V1.12 of ProductPageScene.
 *
 * Diff vs ProductPageScene (V1.00 / V1.08):
 *   - Scroll cursor uses scrollbar-drag pattern (ScrollEffectDemo Option 3
 *     "Big-200px"), matching HomeScrollSceneV1_12.
 *     * X = 880 (scrollbar position), was 780 (mid-content).
 *     * Y travels 200px (Y_TOP=860 → Y_BOT=1060) over the scroll window.
 *       Scroll-active in this scene is f110-f140 (30 frames) — same as V1.00.
 *   - Physics swapped to HAND_PHYSICS.scrollbar (no velocity tilt).
 *   - dark={false}, animation hard-coded to 'cursor-real-black' (rule 43).
 *   - Hardcoded path; does NOT call getSavedPath() — V1.12 pattern locked.
 *
 * All non-cursor logic (zoom-out, loader, listing reveal, chat overlay,
 * timing, content scroll) is unchanged from V1.00.
 *
 * Companion: DorianDemoV1.12.tsx imports this. See .claude/rules/version-safe-iteration.md.
 *
 * Mini-D refactor (V1.21+): accepts optional `sceneConfig` prop so future
 * versions can extend scene 8 (longer hold before click, different click
 * target) WITHOUT forking this file. Default values match the original V1.12
 * hardcoded behavior — passing nothing == V1.12. See V1.21 for usage.
 */
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import {
  COLORS,
  TEXT_CONTENT,
  SPRING_CONFIG,
  HAND_PHYSICS,
  handSizeForZoom,
} from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import {
  StatusBar,
  DynamicIsland,
  DorianNavHeader,
  AIBubble,
  AnimatedText,
} from '../../../components/DorianPhone';
import { fontFamily } from '../../../lib/fonts';
import { DorianLoader, ChatOverlay, HomeBackground } from './ProductPageParts';
import { getSavedPath } from '../../SceneDirector/codedPaths';

/**
 * Scene-config props for callers (V1.21+) that want to extend the click
 * sequence without forking this file. All fields optional; omitted fields
 * fall back to the V1.12 hardcoded constants.
 *
 * Cursor goes through 4 phases:
 *   1. ENTER (f105 → f110): off-screen → scrollbar
 *   2. SCROLLBAR DRAG (f112 → f140): always tied to scrollProgress, NEVER
 *      configurable — content scroll happens at exactly these frames.
 *   3. POST-DRAG TRAVEL (f142 → preClickFrame): cursor moves from scrollbar
 *      bottom (X_SCROLLBAR, Y_BOT) to the click target (tvCardX, tvCardY).
 *      Slow travel (longer gap between f142 and preClickFrame) = more
 *      deliberate "user is reading the listing" feel.
 *   4. CLICK + FADE (clickFrame, fadeOutFrame): click waypoint then scale: 0
 *      fade-out so the boundary into scene 9 reads as a navigation.
 */
export interface ProductPageSceneV1_12_SceneConfig {
  /** TV-card click target X in composition space. Default 518. */
  tvCardX?: number;
  /** TV-card click target Y in composition space. Default 1150. */
  tvCardY?: number;
  /** Scene-local frame the cursor arrives at the TV card. Default 146. */
  preClickFrame?: number;
  /** Scene-local frame the click waypoint fires. Default 147. */
  clickFrame?: number;
  /** Click waypoint duration. Default 6. */
  clickDuration?: number;
  /** Scene-local frame the cursor scale fades to 0. Default 150. */
  fadeOutFrame?: number;
}

interface ProductPageSceneV1_12_Props {
  sceneConfig?: ProductPageSceneV1_12_SceneConfig;
  /** Optional parent composition ID. When set AND saved data has ≥2
   *  waypoints, scene reads SD-saved waypoints for "8-ProductPage" from
   *  that comp; otherwise falls through to the hardcoded path below.
   *  V1.22+ wires this; V1.13–V1.21 don't pass it (behavior unchanged). */
  compositionId?: string;
}

// Scene 8 V1.12: Product page with scrollbar-drag cursor.
export const ProductPageSceneV1_12: React.FC<ProductPageSceneV1_12_Props> = ({
  sceneConfig,
  compositionId,
} = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const message = TEXT_CONTENT.userTyping.userMessage;
  const aiMessage = TEXT_CONTENT.aiResponse.aiMessage;
  const chatHeight = 370;

  const zoomOutProgress = spring({ frame, fps, config: SPRING_CONFIG.zoom });
  const zoomScale = interpolate(zoomOutProgress, [0, 1], [2.75, 1.8]);
  const zoomOffsetY = interpolate(zoomOutProgress, [0, 1], [-374, 0]);

  const chatSlide = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const loaderIn = interpolate(frame, [30, 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const loaderOut = interpolate(frame, [95, 105], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const loaderVisible = Math.min(loaderIn, loaderOut);
  const spinDegrees = frame * 8;

  const listingIn = interpolate(frame, [95, 108], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Content scroll — unchanged from V1.00 (same Easing, same window 110-140).
  const scrollProgress = interpolate(frame, [110, 140], [0, 300], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // V1.12: Scrollbar drag (f110-f140), then cursor travels to a TV-card and
  // clicks it. Click target + frames are configurable via sceneConfig (Mini-D
  // refactor) so callers like V1.21 can extend the post-drag travel and click
  // window without forking this file.
  const X_SCROLLBAR = 880;
  const Y_MID = 960;
  const Y_TOP = Y_MID - 100;
  const Y_BOT = Y_MID + 100;
  const TV_CARD_X = sceneConfig?.tvCardX ?? 518;
  const TV_CARD_Y = sceneConfig?.tvCardY ?? 1150;
  const PRE_CLICK_FRAME = sceneConfig?.preClickFrame ?? 146;
  const CLICK_FRAME = sceneConfig?.clickFrame ?? 147;
  const CLICK_DURATION = sceneConfig?.clickDuration ?? 6;
  const FADE_OUT_FRAME = sceneConfig?.fadeOutFrame ?? 150;
  // SceneDirector override (V1.22+ via `compositionId` prop). When the
  // caller supplies a comp ID AND that comp has saved waypoints with ≥2
  // points, those waypoints win. Otherwise fall through to the hardcoded
  // path below — preserves V1.13–V1.21 behavior byte-for-byte.
  const sdSaved = compositionId
    ? getSavedPath(compositionId, '8-ProductPage')
    : null;
  const sdPath =
    sdSaved && Array.isArray(sdSaved.path) && sdSaved.path.length >= 2
      ? sdSaved.path
      : null;
  const hardcodedScrollHandPath: HandPathPoint[] = [
    // Enter from off-screen right at f105 (slightly before scroll begins)
    {
      x: 1050,
      y: Y_TOP,
      frame: 105,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
    },
    // Arrive at scrollbar by f110
    {
      x: X_SCROLLBAR,
      y: Y_TOP,
      frame: 110,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
    },
    // Begin drag at f112
    {
      x: X_SCROLLBAR,
      y: Y_TOP,
      frame: 112,
      gesture: 'drag',
      rotation: 0,
      scale: 1,
    },
    // End drag at f140 (matches scrollProgress end — NEVER configurable)
    {
      x: X_SCROLLBAR,
      y: Y_BOT,
      frame: 140,
      gesture: 'drag',
      rotation: 0,
      scale: 1,
    },
    // Release at f142 — pointer briefly holds at scrollbar
    {
      x: X_SCROLLBAR,
      y: Y_BOT,
      frame: 142,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
    },
    // Travel to TV card centre. V1.12 default = f146 (4 frames after release,
    // fast). V1.21 extends to f175 (~33 frames, slow) for a more deliberate
    // "user is reading the listing" feel.
    {
      x: TV_CARD_X,
      y: TV_CARD_Y,
      frame: PRE_CLICK_FRAME,
      gesture: 'pointer',
      rotation: 0,
      scale: 1,
    },
    // Click. Cursor sits on the TV card from PRE_CLICK_FRAME to CLICK_FRAME
    // because both endpoints share (TV_CARD_X, TV_CARD_Y) — interpolation
    // between equal positions is static.
    {
      x: TV_CARD_X,
      y: TV_CARD_Y,
      frame: CLICK_FRAME,
      gesture: 'click',
      rotation: 0,
      scale: 1,
      duration: CLICK_DURATION,
    },
    // Fade out at scene end so the boundary into scene 9 reads as a navigation
    {
      x: TV_CARD_X,
      y: TV_CARD_Y,
      frame: FADE_OUT_FRAME,
      gesture: 'pointer',
      rotation: 0,
      scale: 0,
    },
  ];
  const scrollHandPath: HandPathPoint[] = sdPath ?? hardcodedScrollHandPath;

  const contentTop = 130;

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
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            fontFamily,
          }}
        >
          {TEXT_CONTENT.productPage.title}
        </div>
      </AnimatedText>

      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `translate(0px, ${zoomOffsetY}px)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${zoomScale})`,
          }}
        >
          <div
            style={{
              width: 390 + 24,
              height: 844 + 24,
              background: '#1a1a1a',
              borderRadius: 55,
              padding: 12,
              boxShadow:
                '0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: 390,
                height: 844,
                borderRadius: 45,
                overflow: 'hidden',
                position: 'relative',
                background: '#fff',
              }}
            >
              {frame < 108 && <HomeBackground opacity={1 - listingIn} />}

              {frame >= 30 && frame < 110 && (
                <DorianLoader
                  contentTop={contentTop}
                  loaderVisible={loaderVisible}
                  spinDegrees={spinDegrees}
                />
              )}

              {frame >= 90 && (
                <div
                  style={{
                    position: 'absolute',
                    top: -scrollProgress,
                    left: 0,
                    width: 390,
                    opacity: listingIn,
                  }}
                >
                  <Img
                    src={staticFile('dorian/woodmart/lg-tvs-listing-full.png')}
                    style={{ width: 390, height: 'auto', display: 'block' }}
                  />
                </div>
              )}

              {frame < 45 && (
                <ChatOverlay
                  chatSlide={chatSlide}
                  chatHeight={chatHeight}
                  message={message}
                  aiMessage={aiMessage}
                />
              )}

              <StatusBar />
              <DynamicIsland />
              <DorianNavHeader />

              <div
                style={{
                  position: 'absolute',
                  bottom: 70,
                  right: 15,
                  zIndex: 20,
                }}
              >
                <AIBubble scale={1} pulse />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollbar-drag cursor — appears at frame 105 onward.
          showRipple=true so the TV-card click at f147 emits a ripple;
          ripples only fire on click waypoints, so the scrollbar drag is unaffected. */}
      {frame >= 105 && (
        <FloatingHand
          path={scrollHandPath}
          startFrame={0}
          animation="cursor-real-black"
          size={handSizeForZoom(zoomScale)}
          dark={false}
          showRipple={true}
          physics={HAND_PHYSICS.scrollbar}
        />
      )}
    </AbsoluteFill>
  );
};
