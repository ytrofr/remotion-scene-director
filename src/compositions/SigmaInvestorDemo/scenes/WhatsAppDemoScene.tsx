import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS } from '../constants';

const MESSAGES = [
  {
    role: 'user',
    text: 'I need a website for my law firm. Shilo & Partners, family law in Tel Aviv.',
    delay: 10,
  },
  {
    role: 'bot',
    tag: '\u03A3 ORCHESTRATOR',
    text: 'Activating your team...',
    delay: 35,
  },
  {
    role: 'bot',
    tag: 'WEBSITES',
    text: 'Website live -- shilo-law.sigma.ai\nGQI: 93/100 (Grade A)',
    delay: 60,
  },
  {
    role: 'bot',
    tag: 'NANO BANANA',
    text: '3 logo options ready (Hebrew + English)',
    delay: 85,
  },
  {
    role: 'bot',
    tag: 'GOOGLE ADS',
    text: 'Campaign created -- 24 keywords, family law Tel Aviv',
    delay: 105,
  },
  {
    role: 'bot',
    tag: '\u03A3 ORCHESTRATOR',
    text: 'Done! Website + Ads + Logo in 4 minutes.\nTotal cost: $X.XX',
    delay: 125,
  },
];

export const WhatsAppDemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides up from bottom
  const phoneY = interpolate(frame, [0, 20], [400, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit: phone slides down off screen
  const exitY = interpolate(frame, [155, 180], [0, 600], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(frame, [155, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 120,
        opacity: exitOpacity,
      }}
    >
      {/* Phone mockup -- LARGE 500px wide */}
      <div
        style={{
          width: 500,
          borderRadius: 40,
          background: '#1a1a2e',
          border: '4px solid #333',
          overflow: 'hidden',
          boxShadow:
            '0 30px 100px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.15)',
          opacity: phoneOpacity,
          transform: `translateY(${phoneY + exitY}px)`,
        }}
      >
        {/* WA Header */}
        <div
          style={{
            background: '#075e54',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              color: 'white',
              fontFamily: FONTS.body,
            }}
          >
            {'\u03A3'}
          </div>
          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 20,
                color: 'white',
                fontFamily: FONTS.body,
              }}
            >
              SIGMA AI
            </div>
            <div
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.6)',
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
            minHeight: 520,
          }}
        >
          {MESSAGES.map((msg, i) => {
            // Each message SLIDES UP from bottom
            const msgY = interpolate(
              frame,
              [msg.delay, msg.delay + 12],
              [50, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const msgOpacity = interpolate(
              frame,
              [msg.delay, msg.delay + 8],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            return (
              <div
                key={i}
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: 14,
                  fontSize: 16,
                  lineHeight: 1.5,
                  fontFamily: FONTS.body,
                  color: 'white',
                  opacity: msgOpacity,
                  transform: `translateY(${msgY}px)`,
                  whiteSpace: 'pre-line',
                  ...(msg.role === 'user'
                    ? {
                        background: '#005c4b',
                        alignSelf: 'flex-end' as const,
                        borderBottomRightRadius: 4,
                      }
                    : {
                        background: '#1f2c34',
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
                      fontWeight: 600,
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

      {/* Label BELOW phone */}
      <div
        style={{
          marginTop: 60,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            fontFamily: FONTS.heading,
            color: COLORS.text,
            opacity: interpolate(frame, [20, 35], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          One message.
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            fontFamily: FONTS.body,
            color: COLORS.textSecondary,
            marginTop: 12,
            opacity: interpolate(frame, [30, 45], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Your entire agency responds.
        </div>
      </div>
    </AbsoluteFill>
  );
};
