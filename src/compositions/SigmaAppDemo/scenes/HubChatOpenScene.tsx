/**
 * Scene 1: Hub overview → chat panel slides in.
 * Hub is full brightness initially, dims as chat opens.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';
// Hub screenshot with chat panel sliding in
import { ChatPanel, WelcomeScreen } from '../components/ChatPanel';

export const HubChatOpenScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Hub fades in fully, then dims when chat opens
  const hubOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const hubDim = interpolate(frame, [60, 90], [1, 0.5], {
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
      {frame >= 60 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.15)',
            opacity: interpolate(frame, [60, 90], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        />
      )}

      {/* Chat panel slides in at frame 70 */}
      <ChatPanel slideInDelay={70}>
        <WelcomeScreen />
      </ChatPanel>
    </AbsoluteFill>
  );
};
