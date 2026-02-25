import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import { COLORS, TEXT_CONTENT } from '../constants';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import {
  StatusBar,
  DynamicIsland,
  DorianNavHeader,
  AIBubble,
} from '../../../components/DorianPhone';
import { fontFamily } from '../../../lib/fonts';

// Scene 9: Product Detail - hand taps first product, crossfade to detail page
export const ProductDetailScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Crossfade from listing to detail
  const crossfadeProgress = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
          {TEXT_CONTENT.productDetail.title}
        </div>
      </AnimatedText>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scale(1.8)',
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
            {/* LG TV listing fading out */}
            <div
              style={{
                position: 'absolute',
                top: -300,
                left: 0,
                width: 390,
                opacity: 1 - crossfadeProgress,
              }}
            >
              <Img
                src={staticFile('dorian/woodmart/lg-tvs-listing-full.png')}
                style={{ width: 390, height: 'auto', display: 'block' }}
              />
            </div>

            {/* Product detail page fading in */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 390,
                opacity: crossfadeProgress,
              }}
            >
              <Img
                src={staticFile('dorian/woodmart/lg-tv-detail.png')}
                style={{ width: 390, height: 'auto', display: 'block' }}
              />
            </div>

            <StatusBar />
            <DynamicIsland />
            <DorianNavHeader showSearch={true} />

            {/* AI Assistant Bubble */}
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
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
