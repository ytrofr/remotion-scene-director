/**
 * Scene 2: Website request — typing → send → routing → thinking → result with link.
 * CONTINUITY: Starts with WelcomeScreen visible (matching end of Scene 1),
 * then crossfades to typing state.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';
import {
  ChatPanel,
  WelcomeScreen,
  UserBubble,
  RoutingBadge,
  ThinkingDots,
  CostBadge,
  AgentLinkBubble,
} from '../components/ChatPanel';

const USER_MESSAGE =
  'Build a professional website for ADI law firm. Hebrew. Include hero, about, services, testimonials, FAQ, contact.';

const VERCEL_URL = 'sigma-app.vercel.app/pages/adi-law-firm';

export const WebsiteRequestScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 0: WelcomeScreen visible (frames 0-30), fades out as typing begins
  const welcomeOpacity = interpolate(frame, [15, 35], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const showWelcome = frame < 40;

  // Phase 1: Typing starts at frame 30 (frames 30-120)
  const typingStart = 30;
  const typedChars = Math.floor(
    interpolate(frame, [typingStart + 5, typingStart + 85], [0, USER_MESSAGE.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const typedText = USER_MESSAGE.slice(0, typedChars);
  const isTyping = frame >= typingStart && frame < typingStart + 95;
  const isSent = frame >= typingStart + 95; // frame 125

  // Hub dimmed from start (matching end of Scene 1)
  return (
    <AbsoluteFill style={{ background: '#f1f5f9' }}>
      {/* Hub screenshot — dimmed (matches scene 1 end state) */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <Img
          src={staticFile('sigma-demo/hub_desktop.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />

      {/* Chat panel — already visible (no slide-in, matches Scene 1 end) */}
      <ChatPanel
        slideInDelay={-10}
        inputText={isTyping ? typedText : ''}
        inputActive={isTyping}
        sendEnabled={typedChars > 30 && isTyping}
        showCursor={isTyping}
      >
        {/* WelcomeScreen fades out — continuity from Scene 1 */}
        {showWelcome && (
          <div style={{ opacity: welcomeOpacity, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WelcomeScreen />
          </div>
        )}

        {/* User message bubble */}
        {isSent && <UserBubble text={USER_MESSAGE} time="06:39 PM" fadeInDelay={typingStart + 95} />}

        {/* Routing badge */}
        {frame >= typingStart + 108 && <RoutingBadge agent="websites" fadeInDelay={typingStart + 108} />}

        {/* Thinking dots */}
        {frame >= typingStart + 120 && frame < typingStart + 200 && (
          <ThinkingDots agent="websites" fadeInDelay={typingStart + 120} />
        )}

        {/* Cost badge */}
        {frame >= typingStart + 200 && (
          <CostBadge
            agent="websites"
            steps={3}
            cost="$0.0024"
            model="gemini-2.5-flash"
            tokensIn="31K"
            tokensOut="8K"
            fadeInDelay={typingStart + 200}
          />
        )}

        {/* Agent response with clickable link */}
        {frame >= typingStart + 250 && (
          <AgentLinkBubble
            text="Your website for ADI law firm is ready!"
            linkText="View Published Page"
            linkUrl={VERCEL_URL}
            agent="websites"
            time="06:41 PM"
            fadeInDelay={typingStart + 250}
          />
        )}
      </ChatPanel>
    </AbsoluteFill>
  );
};
