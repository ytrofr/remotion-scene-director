import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from 'remotion';
import {
  COLORS,
  TEXT_CONTENT,
  HAND_PHYSICS,
  handSizeForZoom,
} from '../constants';
import { FloatingHand } from '../../../components/FloatingHand';
import { HandPathPoint } from '../../../components/FloatingHand/types';
import { getSavedPath } from '../../SceneDirector/codedPaths';
import { DorianPhoneStatic as DorianPhoneStaticNew } from '../DorianPhoneMockup';
import { AIBubble } from '../../../components/DorianPhone/AIBubble';
import { AnimatedText } from '../../../components/DorianPhone/AnimatedText';
import { fontFamily } from '../../../lib/fonts';

// Scene 5: User Types Message with zoom on chat (all typing happens here)
export const UserTypingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const message = TEXT_CONTENT.userTyping.userMessage;
  const typedChars = Math.floor(
    interpolate(frame, [5, 70], [0, message.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const typedText = message.slice(0, typedChars);

  const sendButtonPulse =
    frame > 105 ? 1 + Math.sin((frame - 105) * 0.3) * 0.08 : 1;

  // Fixed zoom — same across scenes 4/5/6
  const zoomScale = 2.75;
  const zoomOffsetX = 0;
  const zoomOffsetY = -374;

  // Chat height - tall enough to cover the AI bubble
  const chatHeight = 370;

  // Hand appears after typing finishes, moves to send button and clicks
  // Send button is at the right side of the input field
  // At zoom 2.76 with offset -560, approximate send button position:
  const savedTyping = getSavedPath('DorianDemo', '5-UserTyping');
  const sendHandPath: HandPathPoint[] = savedTyping?.path ?? [
    { x: 750, y: 1520, frame: 70, gesture: 'pointer' }, // Appear near input area
    { x: 730, y: 1500, frame: 85, gesture: 'pointer' }, // Moving toward send button
    { x: 720, y: 1490, frame: 100, gesture: 'pointer' }, // Approaching
    { x: 720, y: 1490, frame: 105, gesture: 'click', duration: 10 }, // TAP send button
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
          Find Exactly What You Need
        </div>
      </AnimatedText>

      {/* Phone zoomed into chat area - same transform structure as scenes 3-4 */}
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
          <DorianPhoneStaticNew showAIBubble={false} scrollOffset={702}>
            {/* Chat overlay - covers bottom of phone fully */}
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
              {/* Chat header - compact */}
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

              {/* AI greeting - compact */}
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

              {/* User message bubble - only appears after send (frame 105) */}
              {frame >= 105 && (
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
                  }}
                >
                  {message}
                </div>
              )}

              {/* Input field - focused from start (scene 4 tapped it), typing begins at frame 5 */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  background: frame < 105 ? '#fff' : '#f5f5f5',
                  borderRadius: 18,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border:
                    frame < 105
                      ? `2px solid ${COLORS.primary}`
                      : '2px solid transparent',
                }}
              >
                <span
                  style={{
                    color: typedChars > 0 && frame < 105 ? COLORS.text : '#999',
                    fontSize: 11,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {frame < 105
                    ? typedChars > 0
                      ? typedText
                      : 'Type a message...'
                    : 'Type a message...'}
                  {frame < 105 && (
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
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background:
                      typedChars > 20 && frame < 105 ? COLORS.primary : '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${sendButtonPulse})`,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: 'white', fontSize: 14 }}>→</span>
                </div>
              </div>
            </div>
          </DorianPhoneStaticNew>
        </div>
      </div>

      {/* Hand reappears after typing is done, clicks send button */}
      {frame >= (savedTyping ? (sendHandPath[0]?.frame ?? 0) : 70) && (
        <FloatingHand
          path={sendHandPath}
          startFrame={savedTyping ? 0 : 70}
          animation="hand-click"
          size={handSizeForZoom(zoomScale)}
          dark={savedTyping?.dark ?? true}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={HAND_PHYSICS.tapGentle}
        />
      )}
    </AbsoluteFill>
  );
};
