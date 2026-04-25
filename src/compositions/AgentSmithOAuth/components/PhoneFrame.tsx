import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS, ChatMessage} from '../constants';

/**
 * Reusable Telegram-style phone mockup.
 * Used by every per-scope demo composition. Animations:
 * - Phone slides up from bottom + fades in over 0-15 frames
 * - Each message slides up + fades in at its own delay
 *
 * Caller controls which messages and the channel header text.
 */
export const PhoneFrame: React.FC<{
  channelHeader: string;
  messages: ChatMessage[];
  // Frame at which the phone exits (slides down). Default: never.
  exitFrame?: number;
}> = ({channelHeader, messages, exitFrame}) => {
  const frame = useCurrentFrame();

  const phoneY = interpolate(frame, [0, 18], [400, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitY = exitFrame
    ? interpolate(frame, [exitFrame, exitFrame + 25], [0, 600], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const exitOpacity = exitFrame
    ? interpolate(frame, [exitFrame, exitFrame + 25], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div
      style={{
        width: 540,
        borderRadius: 44,
        background: '#17212b', // Telegram dark
        border: '4px solid #2a2a2a',
        overflow: 'hidden',
        boxShadow: '0 30px 100px rgba(0,0,0,0.6), 0 0 80px rgba(139,92,246,0.15)',
        opacity: phoneOpacity * exitOpacity,
        transform: `translateY(${phoneY + exitY}px)`,
      }}
    >
      {/* Telegram header */}
      <div
        style={{
          background: '#1e2c3a',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderBottom: '1px solid #2a3a4a',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 11,
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 800,
            color: 'white',
            fontFamily: FONTS.body,
          }}
        >
          {'Σ'}
        </div>
        <div style={{flex: 1}}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 19,
              color: 'white',
              fontFamily: FONTS.body,
            }}
          >
            {channelHeader}
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
              fontFamily: FONTS.body,
            }}
          >
            online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minHeight: 720,
          maxHeight: 720,
          overflow: 'hidden',
        }}
      >
        {messages.map((msg, i) => {
          const msgY = interpolate(
            frame,
            [msg.delay, msg.delay + 14],
            [50, 0],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
          const msgOpacity = interpolate(
            frame,
            [msg.delay, msg.delay + 10],
            [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );

          return (
            <div
              key={i}
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: 14,
                fontSize: 17,
                lineHeight: 1.45,
                fontFamily: FONTS.body,
                color: 'white',
                opacity: msgOpacity,
                transform: `translateY(${msgY}px)`,
                whiteSpace: 'pre-line',
                ...(msg.role === 'user'
                  ? {
                      background: '#2b5278', // Telegram outbound blue
                      alignSelf: 'flex-end' as const,
                      borderBottomRightRadius: 4,
                    }
                  : {
                      background: '#182533', // Telegram inbound
                      alignSelf: 'flex-start' as const,
                      borderBottomLeftRadius: 4,
                    }),
              }}
            >
              {msg.tag && (
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: FONTS.mono,
                    color: COLORS.accentLight,
                    marginBottom: 4,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                  }}
                >
                  {msg.tag}
                </div>
              )}
              {msg.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
