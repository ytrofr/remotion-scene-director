import React from 'react';

export const DynamicIsland: React.FC<{ zIndex?: number }> = ({ zIndex = 6 }) => (
  <div
    style={{
      position: 'absolute',
      top: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 125,
      height: 35,
      background: '#1a1a1a',
      borderRadius: 20,
      zIndex,
    }}
  />
);
