import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS } from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import { getSavedPath } from '../../SceneDirector/codedPaths';
import { DorianPhoneStatic as DorianPhoneStaticNew } from '../DorianPhoneMockup';
import { AIBubble } from '../../../components/DorianPhone/AIBubble';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { fontFamily } from '../../../lib/fonts';

// Scene 4: Chat Opens with zoom-out + hand taps input (no typing — typing is in scene 5)
export const ChatOpenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chatSlide = spring({
    frame,
    fps,
    config: { damping: 18, mass: 1, stiffness: 120 },
  });

  // Zoom out from scene 3's zoomed-in state (5.4 @ -860, -1730) back to normal (1.8)
  // Gentle spring — takes ~35 frames to settle for smooth cinematic feel
  const zoomOutProgress = spring({
    frame,
    fps,
    config: { damping: 22, mass: 1.5, stiffness: 40 },
  });
  const zoomScale = interpolate(zoomOutProgress, [0, 1], [5.4, 1.8]);
  const zoomOffsetX = interpolate(zoomOutProgress, [0, 1], [-860, 0]);
  const zoomOffsetY = interpolate(zoomOutProgress, [0, 1], [-1730, 0]);

  // Chat height - 30% of phone screen (844 * 0.30 = ~250px)
  const chatHeight = 260;

  // Input focus state - active after hand taps
  const inputFocused = frame >= 48;

  // Hand path: move to input box after zoom settles, tap it, then exit
  const savedChatOpen = getSavedPath('DorianDemo', '4-ChatOpen');
  const handPath: HandPathPoint[] = savedChatOpen?.path ?? [
    { x: 518, y: 992, frame: 0, gesture: 'pointer', scale: 2.2 }, // Match scene 3 end (big hand)
    { x: 500, y: 1200, frame: 20, gesture: 'pointer', scale: 1.5 }, // Shrinking with zoom-out
    { x: 480, y: 1520, frame: 45, gesture: 'pointer', scale: 1 }, // Normal size, approaching input
    { x: 480, y: 1550, frame: 48, gesture: 'click', scale: 1, duration: 5 }, // TAP input box
    { x: 480, y: 1550, frame: 60, gesture: 'pointer', scale: 1 }, // Linger briefly
    { x: 480, y: 1550, frame: 90, gesture: 'pointer', scale: 1 }, // Hold position until scene end
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
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            fontFamily,
          }}
        >
          Ask Dorian Anything
        </div>
      </AnimatedText>

      {/* Phone with zoom-out effect - matches scene 3 transform structure for seamless transition */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `translate(${zoomOffsetX}px, ${zoomOffsetY}px)`,
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
          <DorianPhoneStaticNew showAIBubble={true} scrollOffset={702}>
            {/* Chat overlay sliding up - 30% of screen, covers the AI bubble */}
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
                transform: `translateY(${(1 - chatSlide) * chatHeight}px)`,
                padding: '15px 16px',
                fontFamily,
                zIndex: 5,
              }}
            >
              {/* Chat header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
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

              {/* AI greeting message */}
              <div
                style={{
                  background: '#f0f0f0',
                  padding: '10px 14px',
                  borderRadius: '16px 16px 16px 4px',
                  maxWidth: '85%',
                  fontSize: 13,
                  color: COLORS.text,
                  lineHeight: 1.4,
                }}
              >
                Hi! How can I help you today?
              </div>

              {/* Input field at bottom - highlights on focus, no typing (typing is in scene 5) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  background: inputFocused ? '#fff' : '#f5f5f5',
                  borderRadius: 20,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: inputFocused
                    ? `2px solid ${COLORS.primary}`
                    : '2px solid transparent',
                }}
              >
                <span style={{ color: '#999', fontSize: 13 }}>
                  Type a message...
                  {inputFocused && (
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
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: 'white', fontSize: 18 }}>
                    {'\u2192'}
                  </span>
                </div>
              </div>
            </div>
          </DorianPhoneStaticNew>
        </div>
      </div>

      {/* Floating Hand - moves to input box and taps, then hides */}
      {frame <= 53 && (
        <FloatingHand
          path={handPath}
          startFrame={0}
          animation="hand-click"
          size={140}
          dark={savedChatOpen?.dark ?? true}
          showRipple={false}
          physics={{
            floatAmplitude: 2,
            floatSpeed: 0.04,
            velocityScale: 0.6,
            maxRotation: 25,
            shadowEnabled: false,
            shadowDistance: 10,
            shadowBlur: 12,
            smoothing: 0.15,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
