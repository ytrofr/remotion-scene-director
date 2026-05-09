/**
 * Scene 4: Creative banner request — types request, routes to nano_banana,
 * image appears in chat with description.
 * CONTINUITY: Shows previous website result from Scene 2 in chat history.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';
import {
  ChatPanel,
  UserBubble,
  AgentBubble,
  AgentLinkBubble,
  RoutingBadge,
  ThinkingDots,
  CostBadge,
} from '../components/ChatPanel';

const CREATIVE_MESSAGE =
  'Create a professional banner for ADI law firm. Dark blue, Hebrew text, elegant.';

export const CreativeRequestScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 1: Typing (5-55)
  const typedChars = Math.floor(
    interpolate(frame, [5, 55], [0, CREATIVE_MESSAGE.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const typedText = CREATIVE_MESSAGE.slice(0, typedChars);
  const isTyping = frame < 65;
  const isSent = frame >= 65;

  return (
    <AbsoluteFill style={{ background: '#f1f5f9' }}>
      {/* Hub background dimmed */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <Img
          src={staticFile('sigma-demo/hub_desktop.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />

      <ChatPanel
        slideInDelay={-10}
        inputText={isTyping ? typedText : ''}
        inputActive={isTyping}
        sendEnabled={typedChars > 20 && isTyping}
        showCursor={isTyping}
      >
        {/* Previous conversation — website result from Scene 2 (condensed) */}
        <AgentLinkBubble
          text="Your website for ADI law firm is ready!"
          linkText="View Published Page"
          linkUrl="sigma-app.vercel.app/pages/adi-law-firm"
          agent="websites"
          time="06:41 PM"
          fadeInDelay={-10}
        />

        {/* Success summary badge */}
        <div
          style={{
            padding: '8px 14px',
            background: '#f0fdf4',
            borderRadius: 10,
            border: '1px solid #bbf7d0',
            fontSize: 13,
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>{'✓'}</span>
          <span>Website generated — <strong>GQI 92 · Grade A</strong></span>
        </div>

        {/* User creative message */}
        {isSent && <UserBubble text={CREATIVE_MESSAGE} time="06:43 PM" fadeInDelay={65} />}

        {/* Routing to nano_banana */}
        {frame >= 78 && <RoutingBadge agent="nano_banana" fadeInDelay={78} />}

        {/* Thinking */}
        {frame >= 90 && frame < 170 && (
          <ThinkingDots agent="nano_banana" fadeInDelay={90} />
        )}

        {/* Cost badge */}
        {frame >= 170 && (
          <CostBadge
            agent="nano_banana"
            steps={3}
            cost="$0.0010"
            model="gemini-2.0-flash"
            tokensIn="3K"
            tokensOut="168"
            fadeInDelay={170}
          />
        )}

        {/* Agent response + banner image */}
        {frame >= 195 && (
          <div
            style={{
              opacity: interpolate(frame, [195, 210], [0, 1], {
                extrapolateRight: 'clamp',
              }),
              transform: `translateY(${interpolate(frame, [195, 210], [16, 0], { extrapolateRight: 'clamp' })}px)`,
            }}
          >
            <AgentBubble
              text="Here's your banner! Want any changes or variations?"
              agent="nano_banana"
              time="06:44 PM"
              fadeInDelay={195}
            />
            {/* Banner image — rendered dark blue card */}
            <div
              style={{
                width: '85%',
                height: 140,
                background: 'linear-gradient(135deg, #1e3a5f, #0c1f3a)',
                borderRadius: 12,
                marginTop: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              <div
                style={{
                  fontFamily: "'Frank Ruhl Libre', serif",
                  fontSize: 24,
                  color: '#e2e8f0',
                  fontWeight: 700,
                  direction: 'rtl',
                  textAlign: 'center',
                  lineHeight: 1.4,
                }}
              >
                {'עדי משפט'}
                <br />
                <span style={{ fontSize: 15, fontWeight: 400, color: '#94a3b8' }}>
                  {'הגנה משפטית עוצמתית ומקצועית'}
                </span>
              </div>
            </div>
          </div>
        )}
      </ChatPanel>
    </AbsoluteFill>
  );
};
