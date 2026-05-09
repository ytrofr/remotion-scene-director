import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../constants';

/**
 * Stylised reproduction of the Google OAuth consent screen.
 * Used in the OAuthFlowDemo composition (the "show the consent screen" video Google requires).
 *
 * Note: Google's verification reviewers prefer a real screen recording but
 * accept clear stylised reproductions when paired with explanatory voiceover,
 * provided the app name, scopes, and consent action are all visible.
 */
export const ConsentScreenScene: React.FC = () => {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardY = interpolate(frame, [0, 22], [60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Allow button highlight that fades in late, then "click" pulse
  const allowHighlight = interpolate(frame, [120, 160], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const allowPulse = interpolate(frame, [160, 175, 190], [1, 1.06, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scopes = [
    'See, edit, create or change your email settings and filters',
    'Read, compose, send, and permanently delete all your email',
    'See, edit, share, and permanently delete your calendars',
    'See and download your contacts',
    'See and download contact info automatically saved in your "Other contacts"',
    'See, edit, create, and delete your spreadsheets',
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.googleLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 920,
          background: COLORS.googleBg,
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
          padding: '64px 56px',
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
        }}
      >
        {/* Google G logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 36,
          }}
        >
          <span style={{color: '#4285f4', fontSize: 28, fontFamily: 'sans-serif', fontWeight: 500}}>G</span>
          <span style={{color: '#ea4335', fontSize: 28, fontFamily: 'sans-serif', fontWeight: 500}}>o</span>
          <span style={{color: '#fbbc04', fontSize: 28, fontFamily: 'sans-serif', fontWeight: 500}}>o</span>
          <span style={{color: '#4285f4', fontSize: 28, fontFamily: 'sans-serif', fontWeight: 500}}>g</span>
          <span style={{color: '#34a853', fontSize: 28, fontFamily: 'sans-serif', fontWeight: 500}}>l</span>
          <span style={{color: '#ea4335', fontSize: 28, fontFamily: 'sans-serif', fontWeight: 500}}>e</span>
        </div>

        {/* App identification */}
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28}}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 900,
              color: 'white',
              fontFamily: FONTS.body,
            }}
          >
            Σ
          </div>
          <div>
            <div style={{fontSize: 30, color: '#202124', fontFamily: 'Roboto, sans-serif', fontWeight: 400}}>
              AgentSmith wants to access your Google Account
            </div>
            <div
              style={{
                fontSize: 18,
                color: COLORS.googleGray,
                fontFamily: 'Roboto, sans-serif',
                marginTop: 6,
              }}
            >
              jordan@example.com
            </div>
          </div>
        </div>

        {/* Disclosure */}
        <div
          style={{
            fontSize: 17,
            color: COLORS.googleGray,
            fontFamily: 'Roboto, sans-serif',
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          This will allow AgentSmith to:
        </div>

        {/* Scopes list */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            marginBottom: 32,
          }}
        >
          {scopes.map((s, i) => {
            const opacity = interpolate(frame, [20 + i * 8, 36 + i * 8], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  padding: '10px 0',
                  fontSize: 16,
                  color: '#202124',
                  fontFamily: 'Roboto, sans-serif',
                  opacity,
                  borderBottom: i < scopes.length - 1 ? '1px solid #e8eaed' : 'none',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#e8f0fe',
                    color: COLORS.googleBlue,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  i
                </span>
                {s}
              </li>
            );
          })}
        </ul>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 32,
          }}
        >
          <button
            type="button"
            style={{
              padding: '10px 22px',
              fontSize: 15,
              border: 'none',
              background: 'transparent',
              color: COLORS.googleBlue,
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            style={{
              padding: '10px 26px',
              fontSize: 15,
              border: 'none',
              borderRadius: 4,
              background: COLORS.googleBlue,
              color: 'white',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: `0 0 ${20 * allowHighlight}px ${COLORS.googleBlue}88`,
              transform: `scale(${allowPulse})`,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </AbsoluteFill>
  );
};
