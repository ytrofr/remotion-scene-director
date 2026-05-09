import React from 'react';
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  interpolate,
  spring,
  staticFile,
  useVideoConfig,
} from 'remotion';
import {
  COLORS,
  PHONE,
  HAND_PHYSICS,
  handSizeForZoom,
  SPRING_CONFIG,
} from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import {
  StatusBar,
  DynamicIsland,
  DorianNavHeader,
  AIBubble,
} from '../../../components/DorianPhone';
import { fontFamily } from '../../../lib/fonts';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { getSavedPath } from '../../SceneDirector/codedPaths';

// Map pin with drop animation
const MapPin: React.FC<{
  x: number;
  y: number;
  label: string;
  delay: number;
  frame: number;
  fps: number;
  highlighted?: boolean;
}> = ({ x, y, label, delay, frame, fps, highlighted = false }) => {
  const drop = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG.bouncy,
  });
  const pinColor = highlighted ? COLORS.accent : COLORS.primary;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -100%) scale(${drop})`,
        transformOrigin: 'bottom center',
        opacity: drop,
      }}
    >
      {/* Pin shape */}
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path
          d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z"
          fill={pinColor}
        />
        <circle cx="14" cy="14" r="6" fill="white" />
      </svg>
      {/* Label */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          padding: '2px 6px',
          borderRadius: 6,
          fontSize: 8,
          fontWeight: 600,
          color: COLORS.text,
          fontFamily,
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const MapSearchScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Search text typing
  const searchText = 'Downtown Tel Aviv';
  const typedChars = Math.floor(
    interpolate(frame, [20, 70], [0, searchText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const typedSearch = searchText.slice(0, typedChars);

  // Map fade in after search
  const mapAppear = spring({
    frame: frame - 75,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  // Phase 2 (frames 18-75): Screen zoom into search input
  const screenZoomIn = spring({
    frame: frame - 18,
    fps,
    config: SPRING_CONFIG.zoom,
  });
  const screenZoomScale = interpolate(screenZoomIn, [0, 1], [1.8, 2.5]);
  const screenZoomOffsetY = interpolate(screenZoomIn, [0, 1], [0, 200]);

  // Phase 3 (frames 75-110): Screen zoom back out
  const screenZoomOut = spring({
    frame: frame - 75,
    fps,
    config: SPRING_CONFIG.zoom,
  });
  const finalScreenScale = interpolate(
    screenZoomOut,
    [0, 1],
    [screenZoomScale, 1.8],
  );
  const finalScreenOffsetY = interpolate(
    screenZoomOut,
    [0, 1],
    [screenZoomOffsetY, 0],
  );

  // Phase 4 (frames 110+): Map image zooms in (CSS scale on the map image only)
  const mapZoomProgress = spring({
    frame: frame - 110,
    fps,
    config: SPRING_CONFIG.gentle,
  });
  const mapImageScale = interpolate(mapZoomProgress, [0, 1], [1, 2.2]);

  const handSize = handSizeForZoom(finalScreenScale);

  // Hand path: tap search bar, then move to a pin
  // Pre-zoom (S=1.8, O=0): search bar at phone (207,190) → comp (540, 521)
  // Zoomed (S=2.5, O=200): search bar → comp (540, 550)
  // Post-zoom (S=1.8, O=0): pin at phone ~(208,328) → comp (542, 769)
  const savedPath = getSavedPath('DorianStores', '2-MapSearch');
  const handPath: HandPathPoint[] = savedPath?.path ?? [
    { x: 540, y: 700, frame: 5, gesture: 'pointer' as const, scale: 1 },
    { x: 540, y: 550, frame: 14, gesture: 'pointer' as const, scale: 1 },
    { x: 540, y: 550, frame: 18, gesture: 'click' as const, scale: 1, duration: 8 },
    // Stay near search during typing (zoomed state)
    { x: 540, y: 550, frame: 70, gesture: 'pointer' as const, scale: 1 },
    // After zoom out, move to highlighted pin (Coffee District at map 180,120)
    { x: 540, y: 750, frame: 120, gesture: 'pointer' as const, scale: 1 },
    { x: 542, y: 769, frame: 140, gesture: 'pointer' as const, scale: 1 },
    { x: 542, y: 769, frame: 150, gesture: 'click' as const, scale: 1, duration: 15 },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Title overlay */}
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
          Find Stores Nearby
        </div>
      </AnimatedText>

      {/* Phone frame — zoom wrapper */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(0px, ${finalScreenOffsetY}px)`,
        }}
      >
        <div
          style={{
            transform: `translate(-50%, -50%) scale(${finalScreenScale})`,
          }}
        >
          <div
            style={{
              width: PHONE.frameWidth,
              height: PHONE.frameHeight,
              background: '#1a1a1a',
              borderRadius: 55,
              padding: 12,
              boxShadow:
                '0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: PHONE.width,
                height: PHONE.height,
                borderRadius: 45,
                overflow: 'hidden',
                position: 'relative',
                background: '#E8F4E8',
              }}
            >
              {/* Content area */}
              <div
                style={{
                  position: 'absolute',
                  top: 148,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                {/* Search bar */}
                <div
                  style={{
                    margin: '12px 16px',
                    background: COLORS.white,
                    borderRadius: 12,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border:
                      frame >= 18 && frame < 75
                        ? `2px solid ${COLORS.primary}`
                        : '2px solid transparent',
                  }}
                >
                  {/* Search icon */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={COLORS.textLight}
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <span
                    style={{
                      fontSize: 12,
                      color: typedChars > 0 ? COLORS.text : COLORS.textLight,
                      fontFamily,
                      flex: 1,
                    }}
                  >
                    {typedChars > 0 ? typedSearch : 'Search stores near you...'}
                    {frame >= 18 && frame < 75 && (
                      <span
                        style={{
                          opacity: frame % 15 < 8 ? 1 : 0,
                          color: COLORS.text,
                        }}
                      >
                        |
                      </span>
                    )}
                  </span>
                </div>

                {/* Map area */}
                <div
                  style={{
                    position: 'relative',
                    margin: '0 16px',
                    height: 420,
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: '#E8EEE4',
                    opacity: mapAppear * 0.3 + 0.7,
                  }}
                >
                  {/* Zoom container — map, pins, and dot zoom together */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      transform: `scale(${mapImageScale})`,
                      transformOrigin: 'center center',
                    }}
                  >
                    {/* Real OpenStreetMap background */}
                    <Img
                      src={staticFile('dorian/stores/tel-aviv-map.png')}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />

                    {/* Store pins - appear after search */}
                    {frame >= 80 && (
                      <>
                        <MapPin
                          x={180}
                          y={120}
                          label="Dorian Market"
                          delay={80}
                          frame={frame}
                          fps={fps}
                          highlighted={true}
                        />
                        <MapPin
                          x={90}
                          y={200}
                          label="Fresh & Co"
                          delay={88}
                          frame={frame}
                          fps={fps}
                        />
                        <MapPin
                          x={270}
                          y={180}
                          label="TechZone"
                          delay={96}
                          frame={frame}
                          fps={fps}
                        />
                        <MapPin
                          x={150}
                          y={300}
                          label="StyleHouse"
                          delay={104}
                          frame={frame}
                          fps={fps}
                        />
                        <MapPin
                          x={300}
                          y={320}
                          label="GreenGrocer"
                          delay={112}
                          frame={frame}
                          fps={fps}
                        />
                      </>
                    )}

                    {/* "You are here" dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 195,
                        top: 220,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#4285F4',
                        border: '3px solid white',
                        boxShadow:
                          '0 0 0 4px rgba(66, 133, 244, 0.3), 0 2px 4px rgba(0,0,0,0.2)',
                        zIndex: 5,
                      }}
                    />
                  </div>
                </div>

                {/* Store count badge */}
                {frame >= 115 && (
                  <div
                    style={{
                      margin: '12px 16px',
                      background: COLORS.white,
                      borderRadius: 12,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      opacity: spring({
                        frame: frame - 115,
                        fps,
                        config: SPRING_CONFIG.gentle,
                      }),
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: `${COLORS.primary}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={COLORS.primary}
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: COLORS.text,
                          fontFamily,
                        }}
                      >
                        5 stores found nearby
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: COLORS.textLight,
                          fontFamily,
                        }}
                      >
                        Within 2 km of your location
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky header */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 148,
                  zIndex: 20,
                  background: COLORS.white,
                }}
              >
                <StatusBar />
                <DynamicIsland />
                <DorianNavHeader showSearch={false} />
              </div>

              {/* AI Bubble */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 70,
                  right: 15,
                  zIndex: 20,
                }}
              >
                <AIBubble scale={1} pulse={true} />
              </div>

              {/* Home indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 140,
                  height: 5,
                  background: '#000',
                  borderRadius: 3,
                  zIndex: 15,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hand cursor */}
      {frame >= 10 && (
        <FloatingHand
          path={handPath}
          startFrame={0}
          animation={savedPath?.animation ?? 'cursor-real-black'}
          size={handSize}
          dark={savedPath?.dark ?? false}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={HAND_PHYSICS.tapGentle}
        />
      )}
    </AbsoluteFill>
  );
};
