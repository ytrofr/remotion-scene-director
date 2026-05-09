import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from './constants';
import {IntroScene} from './scenes/IntroScene';
import {ConsentScreenScene} from './scenes/ConsentScreenScene';
import {OutroScene} from './scenes/OutroScene';
import {PhoneFrame} from './components/PhoneFrame';

/**
 * OAuth Flow Demonstration video — required by Google for verification.
 * Shows the full flow: user asks → AgentSmith returns OAuth URL → consent screen
 * → user clicks Continue → tokens issued → success in chat.
 *
 * Runtime ~75s = 2250 frames.
 */

const PRE_CONSENT_MESSAGES = [
  {role: 'user' as const, text: 'connect google', delay: 10},
  {
    role: 'agent' as const,
    tag: 'AGENTSMITH',
    text:
      '🔐 To use Gmail, Calendar, Contacts and Sheets, AgentSmith needs your Google permission.\n\nTap below to authorise — you stay in control.',
    delay: 60,
  },
  {role: 'agent' as const, tag: 'AGENTSMITH', text: '[ Re-authorise Google ]', delay: 200},
];

const POST_CONSENT_MESSAGES = [
  ...PRE_CONSENT_MESSAGES,
  {
    role: 'agent' as const,
    tag: 'AGENTSMITH',
    text:
      '✅ Connected.\n\nYou granted: Gmail · Calendar · Contacts · Sheets\n\nYou can revoke any time at myaccount.google.com/permissions.',
    delay: 30,
  },
];

const PreConsentChat: React.FC = () => {
  const frame = useCurrentFrame();
  const captionOpacity = interpolate(frame, [20, 60], [0, 1], {
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
      <PhoneFrame channelHeader="AgentSmith" messages={PRE_CONSENT_MESSAGES} />
      <div
        style={{
          marginTop: 60,
          fontSize: 38,
          fontFamily: FONTS.heading,
          color: COLORS.textSecondary,
          opacity: captionOpacity,
          textAlign: 'center',
          maxWidth: 920,
          padding: '0 60px',
          lineHeight: 1.35,
        }}
      >
        AgentSmith returns a signed, single-use OAuth URL bound to this user.
      </div>
    </AbsoluteFill>
  );
};

const PostConsentChat: React.FC = () => {
  const frame = useCurrentFrame();
  const captionOpacity = interpolate(frame, [20, 60], [0, 1], {
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
      <PhoneFrame channelHeader="AgentSmith" messages={POST_CONSENT_MESSAGES} />
      <div
        style={{
          marginTop: 60,
          fontSize: 38,
          fontFamily: FONTS.heading,
          color: COLORS.emerald,
          opacity: captionOpacity,
          textAlign: 'center',
          maxWidth: 920,
          padding: '0 60px',
          lineHeight: 1.35,
        }}
      >
        Refresh token stored encrypted-at-rest in Neon PostgreSQL.
      </div>
    </AbsoluteFill>
  );
};

export const OAuthFlowComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{background: COLORS.bg}}>
      {/* English voice-over starts after intro logo reveal */}
      <Sequence from={90}>
        <Audio
          src={staticFile('agentsmith-voiceover/oauth-flow.mp3')}
          volume={0.85}
        />
      </Sequence>

      {/* 0-4s — Intro */}
      <Sequence from={0} durationInFrames={120}>
        <IntroScene
          scopeTitle="Google OAuth flow"
          scopeSubtitle="how AgentSmith connects to your Google account"
        />
      </Sequence>

      {/* 4-15s — User asks AgentSmith to connect, AgentSmith returns signed URL */}
      <Sequence from={120} durationInFrames={330}>
        <PreConsentChat />
      </Sequence>

      {/* 15-30s — Google consent screen with all 9 scopes visible, "Continue" highlighted */}
      <Sequence from={450} durationInFrames={450}>
        <ConsentScreenScene />
      </Sequence>

      {/* 30-45s — User taps Continue, returns to chat with success */}
      <Sequence from={900} durationInFrames={450}>
        <PostConsentChat />
      </Sequence>

      {/* 45-55s — Outro */}
      <Sequence from={1350} durationInFrames={300}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
