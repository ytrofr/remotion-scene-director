import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS, ChatMessage} from '../constants';
import {PhoneFrame} from '../components/PhoneFrame';

/**
 * 4-37s — Phone with the chat demonstrating one scope. Drives most of the runtime.
 */
export const ChatScene: React.FC<{
  channelHeader: string;
  messages: ChatMessage[];
  caption: string;
}> = ({channelHeader, messages, caption}) => {
  const frame = useCurrentFrame();

  const captionOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 100,
      }}
    >
      <PhoneFrame channelHeader={channelHeader} messages={messages} />

      {/* Caption below the phone */}
      <div
        style={{
          marginTop: 60,
          textAlign: 'center',
          opacity: captionOpacity,
          maxWidth: 900,
          padding: '0 60px',
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            fontFamily: FONTS.heading,
            color: COLORS.textSecondary,
            lineHeight: 1.35,
          }}
        >
          {caption}
        </div>
      </div>
    </AbsoluteFill>
  );
};
