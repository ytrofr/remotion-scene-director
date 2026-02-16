import React from 'react';
import { fontFamily } from '../../lib/fonts';

export const DorianLogo: React.FC<{ size?: number; showText?: boolean }> = React.memo(({
  size = 120,
  showText = true,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.25,
          background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(45, 212, 191, 0.3)',
        }}
      >
        <div
          style={{
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: '50%',
            border: `${size * 0.08}px solid white`,
            borderRightColor: 'transparent',
            transform: 'rotate(-45deg)',
          }}
        />
      </div>
      {showText && (
        <span
          style={{
            fontSize: size * 0.6,
            fontWeight: 800,
            color: '#1E293B',
            letterSpacing: 2,
            fontFamily,
          }}
        >
          DORIAN
        </span>
      )}
    </div>
  );
});
