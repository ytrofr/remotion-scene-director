import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, TEXT_CONTENT } from '../constants';
import { AIBubble } from '../../../components/DorianPhone/AIBubble';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { DorianPhoneStatic as DorianPhoneStaticNew } from '../DorianPhoneMockup';
import { fontFamily } from '../../../lib/fonts';

// Scene 6: AI Thinking - thinking dots animation
export const AIThinkingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const message = TEXT_CONTENT.userTyping.userMessage;

  // Fixed zoom — same across scenes 4/5/6
  const zoomScale = 2.75;
  const zoomOffsetY = -374;

  // Chat height - tall enough to cover the AI bubble
  const chatHeight = 370;

  // Animated thinking dots
  const dotCount = 3;
  const dots = Array.from({ length: dotCount }, (_, i) => {
    const bounce = Math.sin(frame * 0.2 - i * 1.2);
    return Math.max(0, bounce) * 6;
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
          {TEXT_CONTENT.aiThinking.title}
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

              {/* User message bubble */}
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

              {/* Thinking dots */}
              <div
                style={{
                  background: '#f0f0f0',
                  padding: '10px 16px',
                  borderRadius: '14px 14px 14px 4px',
                  maxWidth: 60,
                  display: 'flex',
                  gap: 5,
                  alignItems: 'center',
                }}
              >
                {dots.map((offset, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#999',
                      transform: `translateY(${-offset}px)`,
                    }}
                  />
                ))}
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
    </AbsoluteFill>
  );
};
