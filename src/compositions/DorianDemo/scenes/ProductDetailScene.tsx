import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Rubik';
import { COLORS, TEXT_CONTENT } from '../constants';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { AIBubble as AIBubbleNew } from '../DorianPhoneMockup';

const { fontFamily } = loadFont();

// Scene 9: Product Detail - hand taps first product, crossfade to detail page
export const ProductDetailScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Crossfade from listing to detail
  const crossfadeProgress = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

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

      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%) scale(1.8)',
      }}>
        <div
          style={{
            width: 390 + 24,
            height: 844 + 24,
            background: '#1a1a1a',
            borderRadius: 55,
            padding: 12,
            boxShadow: '0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
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
            <div style={{ position: 'absolute', top: -300, left: 0, width: 390, opacity: 1 - crossfadeProgress }}>
              <Img
                src={staticFile('dorian/woodmart/lg-tvs-listing-full.png')}
                style={{ width: 390, height: 'auto', display: 'block' }}
              />
            </div>

            {/* Product detail page fading in */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 390, opacity: crossfadeProgress }}>
              <Img
                src={staticFile('dorian/woodmart/lg-tv-detail.png')}
                style={{ width: 390, height: 'auto', display: 'block' }}
              />
            </div>

            {/* Status Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 50,
                background: 'white',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 25px 5px 25px',
                zIndex: 5,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>10:45</span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <svg width="18" height="12" viewBox="0 0 18 12">
                  <rect x="0" y="8" width="3" height="4" fill="#000" />
                  <rect x="5" y="5" width="3" height="7" fill="#000" />
                  <rect x="10" y="2" width="3" height="10" fill="#000" />
                  <rect x="15" y="0" width="3" height="12" fill="#000" />
                </svg>
                <div style={{ width: 25, height: 12, border: '1px solid #000', borderRadius: 3, position: 'relative' }}>
                  <div style={{ position: 'absolute', right: -4, top: 3, width: 2, height: 6, background: '#000', borderRadius: '0 2px 2px 0' }} />
                  <div style={{ position: 'absolute', left: 2, top: 2, right: 4, bottom: 2, background: '#000', borderRadius: 1 }} />
                </div>
              </div>
            </div>

            {/* Dynamic Island */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 125,
                height: 35,
                background: '#1a1a1a',
                borderRadius: 20,
                zIndex: 6,
              }}
            />

            {/* Dorian Nav Header - Hamburger + Logo + Account + Search */}
            <div
              style={{
                position: 'absolute',
                top: 50,
                left: 0,
                right: 0,
                background: 'white',
                zIndex: 5,
              }}
            >
              {/* Header Row: Hamburger + Logo + Account */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 20px',
                  position: 'relative',
                }}
              >
                {/* Hamburger Menu - Left */}
                <div style={{ position: 'absolute', left: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ width: 22, height: 2, background: '#1E293B', borderRadius: 1 }} />
                  <div style={{ width: 22, height: 2, background: '#1E293B', borderRadius: 1 }} />
                  <div style={{ width: 16, height: 2, background: '#1E293B', borderRadius: 1 }} />
                </div>
                {/* Logo - Center */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid white', borderRightColor: 'transparent', transform: 'rotate(-45deg)' }} />
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#2DD4BF', fontFamily, letterSpacing: 0.5 }}>DORIAN</span>
                </div>
                {/* Account Icon - Right */}
                <div style={{ position: 'absolute', right: 20 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#1E293B" strokeWidth="2" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              {/* Search Bar */}
              <div style={{ padding: '4px 16px 12px 16px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: 25, padding: '10px 16px', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="#64748B" strokeWidth="2" />
                    <path d="M16 16l4 4" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span style={{ color: '#94A3B8', fontSize: 14, fontFamily }}>Search for products</span>
                </div>
              </div>
            </div>

            {/* AI Assistant Bubble */}
            <div style={{ position: 'absolute', bottom: 70, right: 15, zIndex: 20 }}>
              <AIBubbleNew scale={1} pulse={true} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
