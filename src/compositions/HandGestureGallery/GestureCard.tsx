import React, { useEffect, useState } from 'react';
import { Lottie, LottieAnimationData } from '@remotion/lottie';
import {
  staticFile,
  delayRender,
  continueRender,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { invertLottieColors } from '../../components/FloatingHand/hands/LottieHand';
import { fontFamily } from '../../lib/fonts';
import { COLORS, GalleryGesture } from './constants';

const CARD_WIDTH = 280;
const PREVIEW_SIZE = 120;
const CARD_RADIUS = 16;
export const CARD_GAP = 24;

interface GestureCardProps {
  gesture: GalleryGesture;
  entranceDelay: number;
}

export const GestureCard: React.FC<GestureCardProps> = ({
  gesture,
  entranceDelay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring entrance animation
  const entrance = spring({
    frame: frame - entranceDelay,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
  });

  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Load two copies: normal + dark-inverted
  const [lightData, setLightData] = useState<LottieAnimationData | null>(null);
  const [darkData, setDarkData] = useState<LottieAnimationData | null>(null);
  const [handle] = useState(() =>
    delayRender(`Loading ${gesture.id} animation`),
  );

  useEffect(() => {
    fetch(staticFile(`lottie/${gesture.id}.json`))
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        // Strip decorative "Lines" layers
        if (Array.isArray(data.layers)) {
          data.layers = (data.layers as Array<Record<string, unknown>>).filter(
            (l) => {
              const name = String(l.nm || '');
              return !name.includes('Lines');
            },
          );
        }

        // Light version (original)
        setLightData(data as unknown as LottieAnimationData);

        // Dark version (deep clone + invert colors)
        const darkClone = JSON.parse(JSON.stringify(data)) as Record<
          string,
          unknown
        >;
        if (Array.isArray(darkClone.layers)) {
          invertLottieColors(
            darkClone.layers as Array<Record<string, unknown>>,
          );
        }
        setDarkData(darkClone as unknown as LottieAnimationData);

        continueRender(handle);
      })
      .catch((error) => {
        console.error(`Failed to load ${gesture.id}:`, error);
        continueRender(handle);
      });
  }, [gesture.id, handle]);

  if (!lightData || !darkData) return null;

  return (
    <div
      style={{
        width: CARD_WIDTH,
        opacity,
        transform: `translateY(${translateY}px)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Card label */}
      <div
        style={{
          fontFamily,
          fontSize: 18,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 10,
          textAlign: 'center',
        }}
      >
        {gesture.label}
      </div>

      {/* Light + Dark preview row */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {/* Light variant */}
        <PreviewBox
          animationData={lightData}
          bgColor={COLORS.cardLight}
          label="Light"
        />

        {/* Dark variant */}
        <PreviewBox
          animationData={darkData}
          bgColor={COLORS.cardDark}
          label="Dark"
        />
      </div>

      {/* Animation ID */}
      <div
        style={{
          fontFamily,
          fontSize: 12,
          color: COLORS.textMuted,
          textAlign: 'center',
          marginTop: 8,
        }}
      >
        {gesture.id}.json
      </div>
    </div>
  );
};

interface PreviewBoxProps {
  animationData: LottieAnimationData;
  bgColor: string;
  label: string;
}

const PreviewBox: React.FC<PreviewBoxProps> = ({
  animationData,
  bgColor,
  label,
}) => {
  return (
    <div
      style={{
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE + 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <div
        style={{
          width: PREVIEW_SIZE,
          height: PREVIEW_SIZE,
          backgroundColor: bgColor,
          borderRadius: CARD_RADIUS,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: PREVIEW_SIZE * 0.7, height: PREVIEW_SIZE * 0.7 }}>
          <Lottie
            animationData={animationData}
            style={{ width: '100%', height: '100%' }}
            playbackRate={0.8}
            loop
          />
        </div>
      </div>
      <div
        style={{
          fontFamily,
          fontSize: 11,
          color: COLORS.textMuted,
          textAlign: 'center',
        }}
      >
        {label}
      </div>
    </div>
  );
};
