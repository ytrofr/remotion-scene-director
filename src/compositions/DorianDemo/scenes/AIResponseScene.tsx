import React from 'react';
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, TEXT_CONTENT, SPRING_CONFIG } from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import { getSavedPath } from '../../SceneDirector/codedPaths';
import { AIBubble } from '../../../components/DorianPhone/AIBubble';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { DorianPhoneStatic as DorianPhoneStaticNew } from '../DorianPhoneMockup';
import { fontFamily } from '../../../lib/fonts';

// Scene 7: AI Response - response message slides in + "View Products" button + hand tap
export const AIResponseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const message = TEXT_CONTENT.userTyping.userMessage;
  const aiMessage = TEXT_CONTENT.aiResponse.aiMessage;

  // Stay zoomed in
  const zoomScale = 2.76;
  const zoomOffsetY = -560;
  const chatHeight = 260;

  // AI response slides in
  const responseSlide = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, mass: 1, stiffness: 100 },
  });

  // "View Products" button appears after response
  const buttonAppear = spring({
    frame: frame - 40,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  // Chars revealed for typewriter effect
  const revealedChars = Math.floor(interpolate(frame, [5, 50], [0, aiMessage.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  // Hand appears and taps "View Products" button
  const savedPath = getSavedPath('DorianDemo', '7-AIResponse');
  const handPath: HandPathPoint[] = savedPath?.path ?? [
    { x: 540, y: 1600, frame: 70, gesture: 'pointer' as const },
    { x: 540, y: 1480, frame: 85, gesture: 'pointer' as const },
    { x: 540, y: 1450, frame: 95, gesture: 'click' as const, duration: 10 },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Click sound when hand taps "View Products" button */}
      {frame === 95 && <Audio src={staticFile('audio/send-click.wav')} volume={0.5} />}

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
          {TEXT_CONTENT.aiResponse.title}
        </div>
      </AnimatedText>

      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transform: `translate(0px, ${zoomOffsetY}px)`,
      }}>
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${zoomScale})`,
        }}>
        <DorianPhoneStaticNew showAIBubble={false} scrollOffset={702}>
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              left: 0,
              right: 0,
              height: chatHeight,
              background: 'white',
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
              padding: '15px 16px',
              fontFamily,
              overflow: 'hidden',
            }}
          >
            {/* Chat header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <AIBubble scale={0.5} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.text }}>Dorian</div>
                <div style={{ fontSize: 9, color: COLORS.primary }}>Your AI Assistant</div>
              </div>
            </div>

            {/* AI greeting - smaller to make room */}
            <div
              style={{
                background: '#f0f0f0',
                padding: '6px 10px',
                borderRadius: '12px 12px 12px 4px',
                maxWidth: '85%',
                fontSize: 10,
                color: COLORS.text,
                marginBottom: 6,
                lineHeight: 1.3,
              }}
            >
              Hi! How can I help you today?
            </div>

            {/* User message */}
            <div
              style={{
                background: COLORS.primary,
                padding: '6px 10px',
                borderRadius: '12px 12px 4px 12px',
                maxWidth: '80%',
                marginLeft: 'auto',
                fontSize: 10,
                color: 'white',
                lineHeight: 1.3,
                marginBottom: 6,
              }}
            >
              {message}
            </div>

            {/* AI Response - slides in */}
            <div
              style={{
                transform: `translateY(${(1 - responseSlide) * 30}px)`,
                opacity: responseSlide,
              }}
            >
              <div
                style={{
                  background: '#f0f0f0',
                  padding: '6px 10px',
                  borderRadius: '12px 12px 12px 4px',
                  maxWidth: '90%',
                  fontSize: 10,
                  color: COLORS.text,
                  lineHeight: 1.3,
                  marginBottom: 6,
                }}
              >
                {aiMessage.slice(0, revealedChars)}
                {revealedChars < aiMessage.length && <span style={{ opacity: frame % 10 < 5 ? 1 : 0 }}>|</span>}
              </div>

              {/* View Products button */}
              {frame >= 40 && (
                <div
                  style={{
                    background: COLORS.primary,
                    padding: '8px 16px',
                    borderRadius: 16,
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'white',
                    maxWidth: '60%',
                    opacity: buttonAppear,
                    transform: `scale(${buttonAppear})`,
                  }}
                >
                  View Products {'\u2192'}
                </div>
              )}
            </div>

            {/* Input field */}
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: 12,
                right: 12,
                background: '#f5f5f5',
                borderRadius: 18,
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '2px solid transparent',
              }}
            >
              <span style={{ color: '#999', fontSize: 10 }}>Type a message...</span>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: 'white', fontSize: 12 }}>{'\u2192'}</span>
              </div>
            </div>
          </div>
        </DorianPhoneStaticNew>
        </div>
      </div>

      {/* Hand taps "View Products" button */}
      {frame >= 70 && (
        <FloatingHand
          path={handPath}
          startFrame={70}
          animation="hand-click"
          size={120}
          dark={true}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={{
            floatAmplitude: 2,
            floatSpeed: 0.04,
            velocityScale: 0.5,
            maxRotation: 20,
            shadowEnabled: true,
            shadowDistance: 10,
            shadowBlur: 12,
            smoothing: 0.15,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
