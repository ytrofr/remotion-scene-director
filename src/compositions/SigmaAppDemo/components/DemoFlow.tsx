/**
 * DemoFlow — Reusable engine for short agent demo compositions.
 * Takes a DemoConfig and renders: hub bg + chat panel + typing → result flow.
 * Chat starts already visible (mid-conversation feel).
 */
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import {
  ChatPanel,
  UserBubble,
  AgentBubble,
  AgentLinkBubble,
  RoutingBadge,
  ThinkingDots,
  CostBadge,
} from './ChatPanel';
import { AudioFromLayers } from '../../SceneDirector/AudioLayerRenderer';
import { COLORS, FONTS } from '../constants';

// ─── Types ─────────────────────────────────────────────────
export interface DemoConfig {
  /** User's chat message */
  message: string;
  /** Agent name for routing badge */
  agent: string;
  /** Agent response text */
  response: string;
  /** Cost info */
  cost: { amount: string; model: string; tokensIn: string; tokensOut: string; steps?: number };
  /** Result card rendered below the agent response */
  resultCard: React.ReactNode;
  /** Optional: page reveal image (staticFile path) */
  pageRevealImage?: string;
  /** Optional: page reveal VIDEO (staticFile path to .mp4) — replaces static image with real app recording */
  pageRevealVideo?: string;
  /** Optional: video start time in seconds (skip initial loading) */
  pageRevealVideoStartSec?: number;
  /** Optional: rendered React page reveal (takes priority over image) */
  pageRevealComponent?: React.ReactNode;
  /** Optional: badge overlay on page reveal (color + label) */
  pageRevealBadge?: { color: string; label: string };
  /** Optional: caption on page reveal */
  pageRevealCaption?: string;
  /** Optional: use AgentLinkBubble instead of AgentBubble */
  link?: { text: string; url: string };
  /** Reveal animation type: 'fade' | 'browser-popup' | 'app-load' (page replaces hub like real app) */
  pageRevealType?: 'fade' | 'browser-popup' | 'app-load';
  /** If true, the page reveal image starts scrolled down to show content below the hero */
  pageRevealScrollDown?: boolean;
  /** Object position for page reveal image (default: 'center') */
  pageRevealObjectPosition?: string;
  /** Total duration in frames */
  durationInFrames: number;
}

// ─── Timing constants (relative to frame 0) ────────────────
const TYPE_START = 15;
const TYPE_DURATION = 40; // ~1.3s at 30fps — fast typing
const SENT = TYPE_START + TYPE_DURATION + 10; // 65
const ROUTE = SENT + 13; // 78
const THINK_START = ROUTE + 12; // 90
const THINK_DURATION = 80;
const THINK_END = THINK_START + THINK_DURATION; // 170
const COST = THINK_END; // 170
const RESULT = THINK_END + 25; // 195
const RESULT_CARD = RESULT + 20; // 215
// Page reveal starts after result is visible
const PAGE_REVEAL_START = RESULT_CARD + 30; // 245

export const DEMO_SCENE_INFO = (duration: number) => [
  { name: 'Chat', start: 0, end: PAGE_REVEAL_START },
  { name: 'PageReveal', start: PAGE_REVEAL_START, end: duration },
];

export const DEMO_SINGLE_SCENE_INFO = (duration: number) => [
  { name: 'Chat', start: 0, end: duration },
];

// ─── FadeOverlay (reused from SigmaAppDemo) ────────────────
const FadeOverlay: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ children, startFrame, duration, fadeIn = 20, fadeOut = 20 }) => {
  const frame = useCurrentFrame();
  const end = startFrame + duration;
  const opacity = Math.min(
    interpolate(frame, [startFrame, startFrame + fadeIn], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    interpolate(frame, [end - fadeOut, end], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  if (frame < startFrame || frame > end) return null;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ─── Main Component ────────────────────────────────────────
export const DemoFlow: React.FC<{ config: DemoConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const {
    message,
    agent,
    response,
    cost,
    resultCard,
    pageRevealImage,
    pageRevealComponent,
    pageRevealBadge,
    pageRevealCaption,
    link,
    durationInFrames,
  } = config;

  // Hub background
  const hubDim = interpolate(frame, [0, 10], [0.5, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Typing animation
  const typedChars = Math.floor(
    interpolate(frame, [TYPE_START, TYPE_START + TYPE_DURATION], [0, message.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const isTyping = frame >= TYPE_START && frame < SENT;
  const typedText = message.slice(0, typedChars);
  const sendEnabled = isTyping && typedChars > 20;

  // Scroll offset when result card appears (push earlier messages up)
  const scrollOffset = interpolate(frame, [RESULT - 10, RESULT + 20], [0, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Page reveal timing
  const hasPageReveal = !!pageRevealImage || !!pageRevealComponent || !!config.pageRevealVideo;
  const pageRevealDuration = hasPageReveal ? durationInFrames - PAGE_REVEAL_START : 0;
  const isAppLoad = config.pageRevealType === 'app-load';

  // SPA transition — 4 phases driven by the video timeline:
  //   Phase 1: page loads in content area (under overlay + chat) — user "clicks" result
  //   Phase 2: chat slides out to right (minimize)
  //   Phase 3: overlay lifts → clean page visible
  //   Phase 4: video keeps playing — user sees real app with scrolling
  const appLoadFrame = frame - PAGE_REVEAL_START;

  // Phase 1 timing: page loads behind chat (frames 0-28 after PAGE_REVEAL_START)
  const LOAD_DURATION = 18;
  const PAGE_IN = 10;
  const mainContentLoading = isAppLoad && frame >= PAGE_REVEAL_START
    ? interpolate(appLoadFrame, [0, 5, LOAD_DURATION - 3, LOAD_DURATION], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  const mainContentPage = isAppLoad && frame >= PAGE_REVEAL_START
    ? interpolate(appLoadFrame, [LOAD_DURATION - 3, LOAD_DURATION - 3 + PAGE_IN], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Phase 2: chat slides out to right immediately after page is loaded
  const CHAT_SLIDE_START = 25; // starts right after page fades in
  const CHAT_SLIDE_DURATION = 20; // ~0.67s slide animation
  const chatSlideOut = isAppLoad && frame >= PAGE_REVEAL_START
    ? interpolate(appLoadFrame, [CHAT_SLIDE_START, CHAT_SLIDE_START + CHAT_SLIDE_DURATION], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Phase 3: overlay lifts right after chat slides out
  const OVERLAY_LIFT_START = CHAT_SLIDE_START + CHAT_SLIDE_DURATION + 5; // 85
  const OVERLAY_LIFT_END = OVERLAY_LIFT_START + 15;
  const overlayLift = isAppLoad && frame >= PAGE_REVEAL_START
    ? interpolate(appLoadFrame, [OVERLAY_LIFT_START, OVERLAY_LIFT_END], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  return (
    <AbsoluteFill style={{ background: '#f1f5f9' }}>
      {/* Audio layers from SceneDirector */}
      <AudioFromLayers />
      {/* Layer 1: Hub screenshot — always visible */}
      <div style={{ position: 'absolute', inset: 0, opacity: hubDim }}>
        <Img
          src={staticFile('sigma-demo/hub_desktop.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Layer 2: SPA page load — starts in content area, expands to full viewport after overlay lifts */}
      {isAppLoad && (mainContentLoading > 0 || mainContentPage > 0) && (() => {
        // After overlay lifts, expand video clip from content area to full viewport
        // so lightbox/fullscreen states in the video cover sidebar/header too
        const clipTop = interpolate(overlayLift, [0, 1], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const clipLeft = interpolate(overlayLift, [0, 1], [160, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
        <div
          style={{
            position: 'absolute',
            top: clipTop,
            left: clipLeft,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
          }}
        >
          {/* Loading state */}
          {mainContentLoading > 0 && mainContentPage < 1 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#f8fafc',
                opacity: mainContentLoading,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  transform: `rotate(${appLoadFrame * 14}deg)`,
                }}
              />
            </div>
          )}

          {/* Page content — video recording OR static screenshot */}
          {mainContentPage > 0 && config.pageRevealVideo ? (
            <div style={{ position: 'absolute', inset: 0, opacity: mainContentPage }}>
              <OffthreadVideo
                src={staticFile(config.pageRevealVideo)}
                startFrom={Math.round((config.pageRevealVideoStartSec ?? 0) * 30)}
                style={{
                  width: 1920,
                  height: 1080,
                  marginTop: -clipTop,
                  marginLeft: -clipLeft,
                  objectFit: 'cover',
                  objectPosition: 'top left',
                }}
                volume={0}
              />
            </div>
          ) : mainContentPage > 0 && pageRevealImage ? (
            <div style={{ position: 'absolute', inset: 0, opacity: mainContentPage }}>
              <Img
                src={staticFile(pageRevealImage)}
                style={{
                  width: 1920,
                  height: 1080,
                  marginTop: -clipTop,
                  marginLeft: -clipLeft,
                  objectFit: 'cover',
                  objectPosition: config.pageRevealObjectPosition ?? 'top left',
                }}
              />
            </div>
          ) : null}
        </div>
        );
      })()}

      {/* Layer 3: Dark overlay — on top of page, under chat */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.15)',
          opacity: 1 - overlayLift,
        }}
      />

      {/* Caption bar — bottom of screen, over everything */}
      {isAppLoad && mainContentPage > 0.8 && pageRevealCaption && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 72,
            background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 60px',
            opacity: interpolate(mainContentPage, [0.8, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 22,
              color: '#fff',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          >
            {pageRevealCaption}
          </p>
        </div>
      )}

      {/* Chat panel — slides out to right after page reveal in app-load mode */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: isAppLoad && chatSlideOut > 0
            ? `translateX(${interpolate(chatSlideOut, [0, 1], [0, 720], { extrapolateRight: 'clamp' })}px)`
            : undefined,
          opacity: isAppLoad ? interpolate(chatSlideOut, [0.8, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1,
          pointerEvents: chatSlideOut >= 1 ? 'none' : 'auto',
        }}
      >
      <ChatPanel
        slideInDelay={-1}
        inputText={isTyping ? typedText : ''}
        inputActive={isTyping}
        sendEnabled={sendEnabled}
        showCursor={isTyping}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            transform: `translateY(${-scrollOffset}px)`,
          }}
        >
          {/* User message (after typing done) */}
          {frame >= SENT && (
            <UserBubble text={message} time="" fadeInDelay={SENT} />
          )}

          {/* Routing badge */}
          {frame >= ROUTE && <RoutingBadge agent={agent} fadeInDelay={ROUTE} />}

          {/* Thinking dots */}
          {frame >= THINK_START && frame < THINK_END && (
            <ThinkingDots agent={agent} fadeInDelay={THINK_START} />
          )}

          {/* Cost badge */}
          {frame >= COST && (
            <CostBadge
              agent={agent}
              steps={cost.steps ?? 3}
              cost={cost.amount}
              model={cost.model}
              tokensIn={cost.tokensIn}
              tokensOut={cost.tokensOut}
              fadeInDelay={COST}
            />
          )}

          {/* Agent response */}
          {frame >= RESULT && (
            link ? (
              <AgentLinkBubble
                text={response}
                linkText={link.text}
                linkUrl={link.url}
                agent={agent}
                time=""
                fadeInDelay={RESULT}
              />
            ) : (
              <AgentBubble text={response} agent={agent} time="" fadeInDelay={RESULT} />
            )
          )}

          {/* Result card */}
          {frame >= RESULT_CARD && (
            <div
              style={{
                opacity: interpolate(frame, [RESULT_CARD, RESULT_CARD + 15], [0, 1], {
                  extrapolateRight: 'clamp',
                }),
                transform: `translateY(${interpolate(frame, [RESULT_CARD, RESULT_CARD + 15], [16, 0], { extrapolateRight: 'clamp' })}px)`,
              }}
            >
              {resultCard}
            </div>
          )}
        </div>
      </ChatPanel>
      </div>

      {/* Page reveal overlay — for non-app-load types (browser-popup, fade) */}
      {hasPageReveal && !isAppLoad && config.pageRevealType === 'browser-popup' ? (
        <Sequence from={PAGE_REVEAL_START}>
          <BrowserWindowReveal
            image={pageRevealImage!}
            url={link?.url}
            badge={pageRevealBadge}
            caption={pageRevealCaption}
            scrollDown={config.pageRevealScrollDown}
          />
        </Sequence>
      ) : hasPageReveal && !isAppLoad ? (
        <FadeOverlay
          startFrame={PAGE_REVEAL_START}
          duration={pageRevealDuration}
          fadeIn={20}
          fadeOut={25}
        >
          {pageRevealComponent ? (
            <RenderedPageReveal badge={pageRevealBadge} caption={pageRevealCaption}>
              {pageRevealComponent}
            </RenderedPageReveal>
          ) : (
            <PageReveal
              image={pageRevealImage!}
              badge={pageRevealBadge}
              caption={pageRevealCaption}
              objectPosition={config.pageRevealObjectPosition}
            />
          )}
        </FadeOverlay>
      ) : null}
    </AbsoluteFill>
  );
};

// ─── Rendered Page Reveal (React component instead of image) ─
const RenderedPageReveal: React.FC<{
  children: React.ReactNode;
  badge?: { color: string; label: string };
  caption?: string;
}> = ({ children, badge, caption }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: caption ? 80 : 0,
          overflow: 'hidden',
          opacity: fadeIn,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>

      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: fadeIn,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: badge.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.heading,
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              boxShadow: `0 4px 20px ${badge.color}66`,
            }}
          >
            {badge.label}
          </div>
        </div>
      )}

      {caption && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: 'linear-gradient(to top, rgba(9,9,11,1), rgba(9,9,11,0.95))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 60px',
            opacity: fadeIn,
          }}
        >
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              color: COLORS.text,
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          >
            {caption}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Browser Window Reveal (macOS-style popup) ────────────
const BrowserWindowReveal: React.FC<{
  image: string;
  url?: string;
  badge?: { color: string; label: string };
  caption?: string;
  scrollDown?: boolean;
}> = ({ image, url = 'sigma-app.vercel.app', badge, caption, scrollDown }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const scale = interpolate(progress, [0, 1], [0.3, 1]);
  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
  const bgOpacity = interpolate(progress, [0, 1], [0, 0.6], { extrapolateRight: 'clamp' });
  const badgeFade = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `rgba(0,0,0,${bgOpacity})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '82%',
          maxWidth: 1440,
          transform: `scale(${scale})`,
          opacity,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* macOS Title bar */}
        <div
          style={{
            height: 44,
            background: '#e5e5e5',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 8,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
          {/* URL bar */}
          <div
            style={{
              flex: 1,
              marginLeft: 16,
              background: '#fff',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 14,
              color: '#666',
              fontFamily: FONTS.body,
            }}
          >
            {url}
          </div>
        </div>
        {/* Page content */}
        <div style={{ height: scrollDown ? 600 : 'auto', overflow: 'hidden' }}>
          <Img
            src={staticFile(image)}
            style={{
              width: '100%',
              display: 'block',
              ...(scrollDown ? { marginTop: -120 } : {}),
            }}
          />
        </div>
      </div>

      {/* Agent badge (top-left) */}
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: badgeFade,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: badge.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.heading,
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              boxShadow: `0 4px 20px ${badge.color}66`,
            }}
          >
            {badge.label}
          </div>
        </div>
      )}

      {/* Caption bar */}
      {caption && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: 'linear-gradient(to top, rgba(9,9,11,1), rgba(9,9,11,0.95))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 60px',
            opacity: badgeFade,
          }}
        >
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              color: COLORS.text,
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          >
            {caption}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Page Reveal (inline, no ScreenScene dependency) ───────
const PageReveal: React.FC<{
  image: string;
  badge?: { color: string; label: string };
  caption?: string;
  objectPosition?: string;
}> = ({ image, badge, caption, objectPosition = 'center' }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 300], [1.0, 1.02], { extrapolateRight: 'clamp' });
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: caption ? 80 : 0,
          overflow: 'hidden',
          opacity: fadeIn,
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition,
            transform: `scale(${scale})`,
            transformOrigin: objectPosition === 'top' ? 'center top' : 'center center',
          }}
        />
      </div>

      {/* Agent badge (top-left) */}
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: fadeIn,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: badge.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONTS.heading,
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              boxShadow: `0 4px 20px ${badge.color}66`,
            }}
          >
            {badge.label}
          </div>
        </div>
      )}

      {/* Caption bar */}
      {caption && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: 'linear-gradient(to top, rgba(9,9,11,1), rgba(9,9,11,0.95))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 60px',
            opacity: fadeIn,
          }}
        >
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              color: COLORS.text,
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          >
            {caption}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
