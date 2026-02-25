import React from 'react';
import {
  AbsoluteFill,
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

  // Fixed zoom — same across scenes 4/5/6/7
  const zoomScale = 2.75;
  const zoomOffsetY = -374;
  const chatHeight = 370;

  // AI response slides in
  const responseSlide = spring({
    frame: frame - 5,
    fps,
    config: SPRING_CONFIG.response,
  });

  // "View Products" button appears after response
  const buttonAppear = spring({
    frame: frame - 40,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  // Chars revealed for typewriter effect
  const revealedChars = Math.floor(
    interpolate(frame, [5, 50], [0, aiMessage.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  // Hand appears and taps "View Products" button
  const savedPath = getSavedPath('DorianDemo', '7-AIResponse');
  const handPath: HandPathPoint[] = savedPath?.path ?? [
    { x: 540, y: 1600, frame: 70, gesture: 'pointer' as const },
    { x: 540, y: 1480, frame: 85, gesture: 'pointer' as const },
    { x: 540, y: 1450, frame: 95, gesture: 'click' as const, duration: 10 },
  ];

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
          {TEXT_CONTENT.aiResponse.title}
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
          <DorianPhoneStaticNew showAIBubble={false} scrollOffset={702}>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: chatHeight,
                background: 'white',
                borderRadius: '24px 24px 0 0',
                boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
                padding: '15px 16px',
                fontFamily,
              }}
            >
              {/* Chat header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <AIBubble scale={0.6} />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: COLORS.text,
                    }}
                  >
                    Dorian
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.primary }}>
                    Your AI Assistant
                  </div>
                </div>
              </div>

              {/* AI greeting */}
              <div
                style={{
                  background: '#f0f0f0',
                  padding: '8px 12px',
                  borderRadius: '14px 14px 14px 4px',
                  maxWidth: '85%',
                  fontSize: 12,
                  color: COLORS.text,
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}
              >
                Hi! How can I help you today?
              </div>

              {/* User message */}
              <div
                style={{
                  background: COLORS.primary,
                  padding: '8px 12px',
                  borderRadius: '14px 14px 4px 14px',
                  maxWidth: '80%',
                  marginLeft: 'auto',
                  fontSize: 12,
                  color: 'white',
                  lineHeight: 1.3,
                  marginBottom: 8,
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
                    padding: '8px 12px',
                    borderRadius: '14px 14px 14px 4px',
                    maxWidth: '90%',
                    fontSize: 12,
                    color: COLORS.text,
                    lineHeight: 1.3,
                    marginBottom: 8,
                  }}
                >
                  {aiMessage.slice(0, revealedChars)}
                  {revealedChars < aiMessage.length && (
                    <span style={{ opacity: frame % 10 < 5 ? 1 : 0 }}>|</span>
                  )}
                </div>

                {/* View Products button */}
                {frame >= 40 && (
                  <div
                    style={{
                      background: COLORS.primary,
                      padding: '8px 16px',
                      borderRadius: 16,
                      textAlign: 'center',
                      fontSize: 12,
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

              {/* Input field - inactive after send */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  background: '#f5f5f5',
                  borderRadius: 18,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '2px solid transparent',
                }}
              >
                <span style={{ color: '#999', fontSize: 11 }}>
                  Type a message...
                </span>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: 'white', fontSize: 14 }}>
                    {'\u2192'}
                  </span>
                </div>
              </div>
            </div>
          </DorianPhoneStaticNew>
        </div>
      </div>

      {/* Hand taps "View Products" button */}
      {frame >= (savedPath ? (handPath[0]?.frame ?? 0) : 70) && (
        <FloatingHand
          path={handPath}
          startFrame={savedPath ? 0 : 70}
          animation="hand-click"
          size={handSizeForZoom(zoomScale)}
          dark={savedPath?.dark ?? true}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={HAND_PHYSICS.tapGentle}
        />
      )}
    </AbsoluteFill>
  );
};
