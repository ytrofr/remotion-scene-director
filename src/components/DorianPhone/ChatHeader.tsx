import React from 'react';
import { AIBubble } from './AIBubble';

export const ChatHeader: React.FC<{
  compact?: boolean;
  textColor?: string;
  primaryColor?: string;
}> = ({
  compact = false,
  textColor = '#1E293B',
  primaryColor = '#2DD4BF',
}) => {
  const bubbleScale = compact ? 0.5 : 0.6;
  const nameSize = compact ? 12 : 14;
  const subtitleSize = compact ? 9 : 10;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 8 : 10, marginBottom: compact ? 8 : 12 }}>
      <AIBubble scale={bubbleScale} />
      <div>
        <div style={{ fontWeight: 700, fontSize: nameSize, color: textColor }}>Dorian</div>
        <div style={{ fontSize: subtitleSize, color: primaryColor }}>Your AI Assistant</div>
      </div>
    </div>
  );
};
