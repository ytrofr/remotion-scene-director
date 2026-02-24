import React from 'react';
import { Img, staticFile } from 'remotion';
import { COLORS } from '../constants';
import { AIBubble } from '../../../components/DorianPhone';
import { fontFamily } from '../../../lib/fonts';

// --- Extracted sub-components for ProductPageScene (rule 14: 250-line limit) ---

/** Dorian branded loading spinner with "Finding your products..." text */
export const DorianLoader: React.FC<{
  contentTop: number;
  loaderVisible: number;
  spinDegrees: number;
}> = ({ contentTop, loaderVisible, spinDegrees }) => (
  <div
    style={{
      position: 'absolute',
      top: contentTop,
      left: 0,
      right: 0,
      bottom: 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'white',
      opacity: loaderVisible,
      zIndex: 3,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '4px solid #E2E8F0',
        borderTopColor: COLORS.primary,
        transform: `rotate(${spinDegrees}deg)`,
        marginBottom: 16,
      }}
    />
    <div
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: COLORS.text,
        fontFamily,
        marginBottom: 4,
      }}
    >
      Finding your products...
    </div>
    <div style={{ fontSize: 11, color: COLORS.textLight, fontFamily }}>
      Powered by Dorian AI
    </div>
  </div>
);

/** Chat overlay panel showing conversation history, slides down and fades out */
export const ChatOverlay: React.FC<{
  chatSlide: number;
  chatHeight: number;
  message: string;
  aiMessage: string;
}> = ({ chatSlide, chatHeight, message, aiMessage }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 60 - chatSlide * 350,
      left: 0,
      right: 0,
      height: chatHeight,
      background: 'white',
      borderRadius: '24px 24px 0 0',
      boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
      padding: '15px 16px',
      fontFamily,
      overflow: 'hidden',
      opacity: 1 - chatSlide,
      zIndex: 4,
    }}
  >
    {/* Chat header */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
      }}
    >
      <AIBubble scale={0.5} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.text }}>
          Dorian
        </div>
        <div style={{ fontSize: 9, color: COLORS.primary }}>
          Your AI Assistant
        </div>
      </div>
    </div>

    {/* AI greeting */}
    <div
      style={{
        background: '#f0f0f0',
        padding: '6px 10px',
        borderRadius: '12px 12px 12px 4px',
        maxWidth: '85%',
        fontSize: 10,
        color: COLORS.text,
        marginBottom: 6,
        lineHeight: 1.3,
      }}
    >
      Hi! How can I help you today?
    </div>

    {/* User message */}
    <div
      style={{
        background: COLORS.primary,
        padding: '6px 10px',
        borderRadius: '12px 12px 4px 12px',
        maxWidth: '80%',
        marginLeft: 'auto',
        fontSize: 10,
        color: 'white',
        lineHeight: 1.3,
        marginBottom: 6,
      }}
    >
      {message}
    </div>

    {/* AI Response (fully revealed) */}
    <div
      style={{
        background: '#f0f0f0',
        padding: '6px 10px',
        borderRadius: '12px 12px 12px 4px',
        maxWidth: '90%',
        fontSize: 10,
        color: COLORS.text,
        lineHeight: 1.3,
        marginBottom: 6,
      }}
    >
      {aiMessage}
    </div>

    {/* View Products button (tapped state) */}
    <div
      style={{
        background: COLORS.primaryDark,
        padding: '8px 16px',
        borderRadius: 16,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 700,
        color: 'white',
        maxWidth: '60%',
      }}
    >
      View Products {'\u2192'}
    </div>

    {/* Input field */}
    <div
      style={{
        position: 'absolute',
        bottom: 10,
        left: 12,
        right: 12,
        background: '#f5f5f5',
        borderRadius: 18,
        padding: '7px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '2px solid transparent',
      }}
    >
      <span style={{ color: '#999', fontSize: 10 }}>Type a message...</span>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'white', fontSize: 12 }}>{'\u2192'}</span>
      </div>
    </div>
  </div>
);

/** Stacked home + categories background (same as scene 7, scrollOffset 702) */
export const HomeBackground: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: 'absolute',
      top: -702,
      left: 0,
      width: 390,
      opacity,
    }}
  >
    <div style={{ position: 'relative', marginLeft: -5 }}>
      <Img
        src={staticFile('dorian/woodmart/home-mobile.png')}
        style={{ width: 390 + 52, height: 'auto', display: 'block' }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 55,
          background: '#fff',
        }}
      />
    </div>
    <div style={{ position: 'relative', marginLeft: -5, marginTop: -70 }}>
      <Img
        src={staticFile('dorian/woodmart/categories-mobile-2.png')}
        style={{ width: 390 + 12, height: 'auto', display: 'block' }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 50,
          background: '#fff',
        }}
      />
    </div>
  </div>
);
