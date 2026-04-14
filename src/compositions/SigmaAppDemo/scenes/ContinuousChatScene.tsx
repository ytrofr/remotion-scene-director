/**
 * ContinuousChatScene — ONE persistent chat panel spanning the entire conversation.
 * Uses GLOBAL frame numbers so messages accumulate naturally across acts.
 * Hub background dims when chat opens; chat panel slides in once and stays.
 *
 * Timeline (global frames):
 *   0-70:   Hub visible, no chat
 *   70:     Chat panel slides in with WelcomeScreen
 *   180:    WelcomeScreen fades, typing begins (website request)
 *   305:    Website message sent → routing → thinking → result
 *   540:    Chat fades out for PageReveal (handled by parent opacity)
 *   810:    Chat fades back in, shows prior result + starts creative typing
 *   1140:   Chat fades out for CreativeReveal (handled by parent opacity)
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';
import {
  ChatPanel,
  WelcomeScreen,
  UserBubble,
  AgentBubble,
  AgentLinkBubble,
  RoutingBadge,
  ThinkingDots,
  CostBadge,
} from '../components/ChatPanel';

// ─── Messages ───────────────────────────────────────────────
const WEBSITE_MSG =
  'Build a professional website for ADI law firm. Hebrew. Include hero, about, services, testimonials, FAQ, contact.';
const CREATIVE_MSG =
  'Create a professional banner for ADI law firm. Dark blue, Hebrew text, elegant.';
const VERCEL_URL = 'sigma-app.vercel.app/pages/adi-law-firm';

// ─── Global frame keyframes ─────────────────────────────────
// Act 1: Hub + Chat
const CHAT_SLIDE_IN = 70;

// Act 2: Website Request (starts at global 180)
const WS = 180; // websiteRequest scene start
const WS_TYPE_START = WS + 30;
const WS_TYPE_END = WS + 115;
const WS_SENT = WS + 125;
const WS_ROUTE = WS + 138;
const WS_THINK_START = WS + 150;
const WS_THINK_END = WS + 230;
const WS_COST = WS + 230;
const WS_RESULT = WS + 280;

// Act 4: Creative Request (starts at global 810)
const CR = 810; // creativeRequest scene start
const CR_TYPE_START = CR + 5;
const CR_TYPE_END = CR + 55;
const CR_SENT = CR + 65;
const CR_ROUTE = CR + 78;
const CR_THINK_START = CR + 90;
const CR_THINK_END = CR + 170;
const CR_COST = CR + 170;
const CR_RESULT = CR + 195;

export const ContinuousChatScene: React.FC = () => {
  const frame = useCurrentFrame(); // GLOBAL frame (0-1800)

  // ─── Hub background ─────────────────────────────────────
  const hubOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const hubDim = interpolate(frame, [60, 90], [1, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const darkOverlay = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ─── Welcome screen ─────────────────────────────────────
  const welcomeOpacity = interpolate(frame, [WS - 15, WS + 10], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const showWelcome = frame < WS + 15;

  // ─── Website typing ─────────────────────────────────────
  const wsTypedChars = Math.floor(
    interpolate(frame, [WS_TYPE_START, WS_TYPE_END], [0, WEBSITE_MSG.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const wsTyping = frame >= WS_TYPE_START && frame < WS_SENT;
  const wsTypedText = WEBSITE_MSG.slice(0, wsTypedChars);

  // ─── Creative typing ────────────────────────────────────
  const crTypedChars = Math.floor(
    interpolate(frame, [CR_TYPE_START, CR_TYPE_END], [0, CREATIVE_MSG.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const crTyping = frame >= CR_TYPE_START && frame < CR_SENT;
  const crTypedText = CREATIVE_MSG.slice(0, crTypedChars);

  // ─── Input bar state ────────────────────────────────────
  const isTyping = wsTyping || crTyping;
  const inputText = crTyping ? crTypedText : wsTyping ? wsTypedText : '';
  const sendEnabled =
    (wsTyping && wsTypedChars > 30) || (crTyping && crTypedChars > 20);

  // ─── Scrolling: as messages accumulate, older ones shift up ────
  // After website result appears and creative flow starts, scroll up website messages
  const scrollOffset = interpolate(frame, [CR - 30, CR + 20], [0, 280], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: '#f1f5f9' }}>
      {/* Hub screenshot */}
      <div style={{ position: 'absolute', inset: 0, opacity: hubOpacity * hubDim }}>
        <Img
          src={staticFile('sigma-demo/hub_desktop.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Dark overlay when chat opens */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.15)',
          opacity: darkOverlay,
        }}
      />

      {/* ONE chat panel — slides in at frame 70, stays forever */}
      <ChatPanel
        slideInDelay={CHAT_SLIDE_IN}
        inputText={inputText}
        inputActive={isTyping}
        sendEnabled={sendEnabled}
        showCursor={isTyping}
      >
        {/* All messages in a scrollable container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            transform: `translateY(${-scrollOffset}px)`,
            transition: 'transform 0.5s ease-out',
          }}
        >
          {/* Welcome screen (fades before first typing) */}
          {showWelcome && (
            <div style={{ opacity: welcomeOpacity }}>
              <WelcomeScreen />
            </div>
          )}

          {/* ── ACT 2: Website Request ─────────────────── */}

          {/* User message */}
          {frame >= WS_SENT && (
            <UserBubble text={WEBSITE_MSG} time="06:39 PM" fadeInDelay={WS_SENT} />
          )}

          {/* Routing badge */}
          {frame >= WS_ROUTE && <RoutingBadge agent="websites" fadeInDelay={WS_ROUTE} />}

          {/* Thinking dots (visible only while "thinking") */}
          {frame >= WS_THINK_START && frame < WS_THINK_END && (
            <ThinkingDots agent="websites" fadeInDelay={WS_THINK_START} />
          )}

          {/* Cost badge */}
          {frame >= WS_COST && (
            <CostBadge
              agent="websites"
              steps={3}
              cost="$0.0024"
              model="gemini-2.5-flash"
              tokensIn="31K"
              tokensOut="8K"
              fadeInDelay={WS_COST}
            />
          )}

          {/* Agent response with link */}
          {frame >= WS_RESULT && (
            <AgentLinkBubble
              text="Your website for ADI law firm is ready!"
              linkText="View Published Page"
              linkUrl={VERCEL_URL}
              agent="websites"
              time="06:41 PM"
              fadeInDelay={WS_RESULT}
            />
          )}

          {/* ── Success badge (between acts) ───────────── */}
          {frame >= WS_RESULT + 40 && (
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
                opacity: interpolate(frame, [WS_RESULT + 40, WS_RESULT + 55], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              <span>{'✓'}</span>
              <span>
                Website generated — <strong>GQI 92 · Grade A</strong>
              </span>
            </div>
          )}

          {/* ── ACT 4: Creative Request ────────────────── */}

          {/* User message */}
          {frame >= CR_SENT && (
            <UserBubble text={CREATIVE_MSG} time="06:43 PM" fadeInDelay={CR_SENT} />
          )}

          {/* Routing badge */}
          {frame >= CR_ROUTE && <RoutingBadge agent="nano_banana" fadeInDelay={CR_ROUTE} />}

          {/* Thinking dots */}
          {frame >= CR_THINK_START && frame < CR_THINK_END && (
            <ThinkingDots agent="nano_banana" fadeInDelay={CR_THINK_START} />
          )}

          {/* Cost badge */}
          {frame >= CR_COST && (
            <CostBadge
              agent="nano_banana"
              steps={3}
              cost="$0.0010"
              model="gemini-2.0-flash"
              tokensIn="3K"
              tokensOut="168"
              fadeInDelay={CR_COST}
            />
          )}

          {/* Agent response + banner image */}
          {frame >= CR_RESULT && (
            <div
              style={{
                opacity: interpolate(frame, [CR_RESULT, CR_RESULT + 15], [0, 1], {
                  extrapolateRight: 'clamp',
                }),
                transform: `translateY(${interpolate(frame, [CR_RESULT, CR_RESULT + 15], [16, 0], { extrapolateRight: 'clamp' })}px)`,
              }}
            >
              <AgentBubble
                text="Here's your banner! Want any changes or variations?"
                agent="nano_banana"
                time="06:44 PM"
                fadeInDelay={CR_RESULT}
              />
              {/* Rendered dark blue banner */}
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
                <div
                  style={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -20,
                    left: -20,
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                />
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
        </div>
      </ChatPanel>
    </AbsoluteFill>
  );
};
