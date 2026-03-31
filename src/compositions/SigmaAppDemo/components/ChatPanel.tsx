/**
 * ChatPanel — Large, prominent OGAS floating chat panel.
 * Designed to fill ~60-70% of the 1920x1080 viewport.
 * Messages stack from bottom with natural scroll-up as new ones appear.
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { FONTS } from '../constants';

// ─── Chat Panel Shell ───────────────────────────────────────
interface ChatPanelProps {
  children: React.ReactNode;
  /** Frame at which the panel slides in (0 = already visible) */
  slideInDelay?: number;
  /** Input field text (empty = placeholder) */
  inputText?: string;
  /** Whether input is active (has border highlight) */
  inputActive?: boolean;
  /** Whether send button is enabled */
  sendEnabled?: boolean;
  /** Whether to show blinking cursor */
  showCursor?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  children,
  slideInDelay = 0,
  inputText = '',
  inputActive = false,
  sendEnabled = false,
  showCursor = false,
}) => {
  const frame = useCurrentFrame();

  // If slideInDelay < 0, the panel is already fully visible (no animation)
  const alreadyVisible = slideInDelay < 0;
  const slideX = alreadyVisible
    ? 0
    : interpolate(
        frame,
        [slideInDelay, slideInDelay + 20],
        [400, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      );
  const opacity = alreadyVisible
    ? 1
    : interpolate(
        frame,
        [slideInDelay, slideInDelay + 12],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      );

  return (
    <div
      style={{
        position: 'absolute',
        right: 40,
        top: 40,
        bottom: 40,
        width: 640,
        borderRadius: 20,
        background: '#ffffff',
        boxShadow: '0 12px 60px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity,
        transform: `translateX(${slideX}px)`,
        fontFamily: FONTS.body,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#fff',
            }}
          >
            {'✦'}
          </div>
          <span
            style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: '0.02em',
            }}
          >
            OGAS Chat
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 22, height: 22, opacity: 0.7, color: '#fff', fontSize: 16, cursor: 'pointer' }}>{'🗑'}</div>
          <div style={{ width: 22, height: 22, opacity: 0.7, color: '#fff', fontSize: 20, cursor: 'pointer' }}>{'✕'}</div>
        </div>
      </div>

      {/* Messages area — flex-end so messages stack from bottom */}
      <div
        style={{
          flex: 1,
          padding: '20px 24px',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 14,
        }}
      >
        {children}
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f9fafb',
            borderRadius: 14,
            padding: '14px 18px',
            border: inputActive ? '2px solid #10b981' : '2px solid #e5e7eb',
            transition: 'border-color 0.2s',
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: 17,
              color: inputText ? '#1f2937' : '#9ca3af',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {inputText || 'Ask anything...'}
            {showCursor && (
              <span style={{ opacity: frame % 20 < 10 ? 1 : 0, color: '#1f2937', fontWeight: 300 }}>|</span>
            )}
          </span>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: sendEnabled ? '#3b82f6' : '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 12,
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <span style={{ color: '#fff', fontSize: 20 }}>{'↑'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Chat Bubble (User) ─────────────────────────────────────
interface UserBubbleProps {
  text: string;
  time?: string;
  fadeInDelay?: number;
}

export const UserBubble: React.FC<UserBubbleProps> = ({
  text,
  time = '',
  fadeInDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [fadeInDelay, fadeInDelay + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slideY = interpolate(frame, [fadeInDelay, fadeInDelay + 10], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        alignSelf: 'flex-end',
        maxWidth: '85%',
        opacity,
        transform: `translateY(${slideY}px)`,
      }}
    >
      <div
        style={{
          background: '#3b82f6',
          color: '#fff',
          padding: '14px 18px',
          borderRadius: '18px 18px 4px 18px',
          fontSize: 16,
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
      {time && (
        <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 4 }}>{time}</div>
      )}
    </div>
  );
};

// ─── Chat Bubble (Agent) ────────────────────────────────────
interface AgentBubbleProps {
  text: string;
  agent?: string;
  time?: string;
  fadeInDelay?: number;
}

export const AgentBubble: React.FC<AgentBubbleProps> = ({
  text,
  agent,
  time = '',
  fadeInDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [fadeInDelay, fadeInDelay + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slideY = interpolate(frame, [fadeInDelay, fadeInDelay + 12], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ maxWidth: '90%', opacity, transform: `translateY(${slideY}px)` }}>
      {agent && (
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '3px 12px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {agent}
          </span>
        </div>
      )}
      <div
        style={{
          background: '#f3f4f6',
          color: '#1f2937',
          padding: '14px 18px',
          borderRadius: '18px 18px 18px 4px',
          fontSize: 16,
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
      {time && (
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{time}</div>
      )}
    </div>
  );
};

// ─── Clickable Link in Agent Response ───────────────────────
interface AgentLinkBubbleProps {
  text: string;
  linkText: string;
  linkUrl: string;
  agent?: string;
  time?: string;
  fadeInDelay?: number;
}

export const AgentLinkBubble: React.FC<AgentLinkBubbleProps> = ({
  text,
  linkText,
  linkUrl,
  agent,
  time = '',
  fadeInDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [fadeInDelay, fadeInDelay + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slideY = interpolate(frame, [fadeInDelay, fadeInDelay + 12], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ maxWidth: '90%', opacity, transform: `translateY(${slideY}px)` }}>
      {agent && (
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '3px 12px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {agent}
          </span>
        </div>
      )}
      <div
        style={{
          background: '#f3f4f6',
          color: '#1f2937',
          padding: '14px 18px',
          borderRadius: '18px 18px 18px 4px',
          fontSize: 16,
          lineHeight: 1.6,
        }}
      >
        <div>{text}</div>
        <div
          style={{
            marginTop: 10,
            padding: '10px 16px',
            background: '#eff6ff',
            borderRadius: 12,
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>{'🔗'}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>{linkText}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{linkUrl}</div>
          </div>
        </div>
      </div>
      {time && (
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{time}</div>
      )}
    </div>
  );
};

// ─── Routing Badge ──────────────────────────────────────────
interface RoutingBadgeProps {
  agent: string;
  confidence?: string;
  fadeInDelay?: number;
}

export const RoutingBadge: React.FC<RoutingBadgeProps> = ({
  agent,
  confidence = '100%',
  fadeInDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [fadeInDelay, fadeInDelay + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        background: '#f0fdf4',
        borderRadius: 12,
        border: '1px solid #bbf7d0',
        opacity,
        fontSize: 15,
      }}
    >
      <span style={{ color: '#6b7280', fontSize: 16 }}>{'〉〉'}</span>
      <span style={{ color: '#374151' }}>Routed to</span>
      <span style={{ color: '#059669', fontWeight: 700 }}>{agent}</span>
      <span
        style={{
          background: '#dcfce7',
          color: '#16a34a',
          padding: '2px 10px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        {confidence}
      </span>
    </div>
  );
};

// ─── Thinking Dots ──────────────────────────────────────────
interface ThinkingDotsProps {
  agent?: string;
  fadeInDelay?: number;
}

export const ThinkingDots: React.FC<ThinkingDotsProps> = ({
  agent,
  fadeInDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [fadeInDelay, fadeInDelay + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const dots = Array.from({ length: 3 }, (_, i) => {
    const bounce = Math.sin((frame - fadeInDelay) * 0.2 - i * 1.2);
    return Math.max(0, bounce) * 6;
  });

  return (
    <div style={{ opacity }}>
      {agent && (
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '3px 12px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {agent}
          </span>
        </div>
      )}
      <div
        style={{
          background: '#f3f4f6',
          padding: '14px 22px',
          borderRadius: '18px 18px 18px 4px',
          maxWidth: 80,
          display: 'flex',
          gap: 7,
          alignItems: 'center',
        }}
      >
        {dots.map((offset, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#9ca3af',
              transform: `translateY(${-offset}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Agent Cost Badge (Rich) ────────────────────────────────
interface CostBadgeProps {
  agent: string;
  steps?: number;
  cost?: string;
  model?: string;
  tokensIn?: string;
  tokensOut?: string;
  fadeInDelay?: number;
}

export const CostBadge: React.FC<CostBadgeProps> = ({
  agent,
  steps = 3,
  cost = '$0.0024',
  model = 'gemini-2.5-flash',
  tokensIn = '31K',
  tokensOut = '8K',
  fadeInDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [fadeInDelay, fadeInDelay + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ opacity, fontSize: 14 }}>
      {/* Badge row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
        <span
          style={{
            background: '#dbeafe',
            color: '#1d4ed8',
            padding: '3px 12px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {agent}
        </span>
        <span style={{ color: '#6b7280' }}>{steps} steps</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#059669' }}>{'⚡'}</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>{cost}</span>
        </span>
      </div>
      {/* Expandable detail card */}
      <div
        style={{
          background: '#f9fafb',
          borderRadius: 12,
          padding: '12px 16px',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, fontSize: 11, letterSpacing: '0.05em' }}>{agent}</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>{cost}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af', fontSize: 13 }}>{model}</span>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>{tokensIn} in / {tokensOut} out</span>
        </div>
      </div>
    </div>
  );
};

// ─── Welcome Screen ─────────────────────────────────────────
export const WelcomeScreen: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 16,
        padding: '40px 0',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          color: '#fff',
        }}
      >
        {'✦'}
      </div>
      <div style={{ fontWeight: 700, fontSize: 20, color: '#374151' }}>OGAS Orchestrator</div>
      <div style={{ fontSize: 15, color: '#9ca3af' }}>I route your request to the right agent.</div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 12,
        }}
      >
        {['Clone a website', 'Create a campaign', 'Search my Drive', 'Generate an image'].map(
          (label) => (
            <div
              key={label}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                fontSize: 14,
                color: '#374151',
                background: '#fff',
              }}
            >
              {label}
            </div>
          ),
        )}
      </div>
    </div>
  );
};
