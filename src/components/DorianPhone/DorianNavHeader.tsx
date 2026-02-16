import React from 'react';
import { loadFont } from '@remotion/google-fonts/Rubik';

const { fontFamily } = loadFont();

export const DorianNavHeader: React.FC<{ showSearch?: boolean; zIndex?: number }> = React.memo(({
  showSearch = true,
  zIndex = 5,
}) => (
  <div
    style={{
      position: 'absolute',
      top: 50,
      left: 0,
      right: 0,
      background: 'white',
      zIndex,
    }}
  >
    {/* Header row: Hamburger + Logo + Account */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 20px',
        position: 'relative',
      }}
    >
      {/* Hamburger Menu - Left */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ width: 22, height: 2, background: '#1E293B', borderRadius: 1 }} />
        <div style={{ width: 22, height: 2, background: '#1E293B', borderRadius: 1 }} />
        <div style={{ width: 16, height: 2, background: '#1E293B', borderRadius: 1 }} />
      </div>

      {/* Logo - Center */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: '2.5px solid white',
              borderRightColor: 'transparent',
              transform: 'rotate(-45deg)',
            }}
          />
        </div>
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#2DD4BF',
            fontFamily,
            letterSpacing: 0.5,
          }}
        >
          DORIAN
        </span>
      </div>

      {/* Account Icon - Right */}
      <div style={{ position: 'absolute', right: 20 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="#1E293B" strokeWidth="2" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>

    {/* Search Bar */}
    {showSearch && (
      <div style={{ padding: '4px 16px 12px 16px', background: '#fff' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F1F5F9',
            borderRadius: 25,
            padding: '10px 16px',
            gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#64748B" strokeWidth="2" />
            <path d="M16 16l4 4" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ color: '#94A3B8', fontSize: 14, fontFamily }}>
            Search for products
          </span>
        </div>
      </div>
    )}
  </div>
));
