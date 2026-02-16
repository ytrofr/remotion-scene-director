// DorianPhoneMockup.tsx - Phone frame created in CODE with scrollable content INSIDE
// This fixes the "scrolling between mockups" issue by using a single long screenshot

import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { fontFamily } from '../../lib/fonts';

// AI Chat Bubble - matches Dorian design
export const AIBubble: React.FC<{ scale?: number; pulse?: boolean }> = ({ scale = 1, pulse = false }) => {
  const frame = useCurrentFrame();
  const pulseScale = pulse ? 1 + Math.sin(frame * 0.15) * 0.05 : 1;

  return (
    <div
      style={{
        width: 56 * scale,
        height: 56 * scale,
        borderRadius: '50%',
        background: '#2DD4BF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(45, 212, 191, 0.4)',
        transform: `scale(${pulseScale})`,
      }}
    >
      {/* Face */}
      <div style={{ position: 'relative', width: 28 * scale, height: 20 * scale }}>
        {/* Left eye */}
        <div
          style={{
            position: 'absolute',
            left: 2 * scale,
            top: 0,
            width: 10 * scale,
            height: 10 * scale,
            borderRadius: '50%',
            background: 'white',
          }}
        />
        {/* Right eye */}
        <div
          style={{
            position: 'absolute',
            right: 2 * scale,
            top: 0,
            width: 10 * scale,
            height: 10 * scale,
            borderRadius: '50%',
            background: 'white',
          }}
        />
        {/* Smile */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: 14 * scale,
            height: 7 * scale,
            borderRadius: `0 0 ${14 * scale}px ${14 * scale}px`,
            border: `2px solid white`,
            borderTop: 'none',
          }}
        />
      </div>
    </div>
  );
};

// Phone Mockup - Creates phone frame in CODE with scrollable content INSIDE
// Uses a LONG screenshot (home-mobile-full.png 277x6108) that scrolls within the phone viewport
export const DorianPhoneMockup: React.FC<{
  scrollProgress: number; // 0 = top, 1 = scrolled down
  scale?: number;
  showAIBubble?: boolean;
}> = ({ scrollProgress, scale = 1.8, showAIBubble = true }) => {
  // Phone frame dimensions (iPhone-style)
  const phoneWidth = 390;
  const phoneHeight = 844;
  const frameWidth = phoneWidth + 24;
  const frameHeight = phoneHeight + 24;

  // Stacking two images: home-mobile.png (302x583) → categories-mobile-2.png (276x587)
  // Scale both to fit phone width (390px)
  const img1Width = 302;
  const img1Height = 583;
  const img2Width = 276;
  const img2Height = 587;

  const img1Scale = phoneWidth / img1Width; // ~1.29
  const img2Scale = phoneWidth / img2Width; // ~1.41

  const scaledImg1Height = img1Height * img1Scale; // ~752px
  const scaledImg2Height = img2Height * img2Scale; // ~828px

  // Scroll from top of first image to show second image
  // At progress 0: show home-mobile.png
  // At progress 1: show categories-mobile-2.png
  const maxScroll = scaledImg1Height - 50; // Scroll past first image (+50px more up)
  const scrollOffset = scrollProgress * maxScroll;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      {/* Phone Frame - Dark bezel */}
      <div
        style={{
          width: frameWidth,
          height: frameHeight,
          background: '#1a1a1a',
          borderRadius: 55,
          padding: 12,
          boxShadow: '0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Screen Container - viewport for scrolling content */}
        <div
          style={{
            width: phoneWidth,
            height: phoneHeight,
            borderRadius: 45,
            overflow: 'hidden',
            position: 'relative',
            background: '#fff',
          }}
        >
          {/* Scrollable Stacked Screenshots: home-mobile → categories-mobile-2 */}
          {/* DEBUG: Red border shows content boundaries - remove after positioning */}
          <div
            style={{
              position: 'absolute',
              top: -scrollOffset,
              left: 0,  // Adjusted: negative=left, positive=right
              width: phoneWidth,
              // border: '2px solid red',  // Uncomment to see content bounds
            }}
          >
            {/* First screen: Home */}
            <div style={{ position: 'relative', marginLeft: -5 }}>
              <Img
                src={staticFile('dorian/woodmart/home-mobile.png')}
                style={{
                  width: phoneWidth + 52,  // +5 both sides (+10 total)
                  height: 'auto',
                  display: 'block',
                }}
              />
              {/* Hide bottom nav (menu, heart, cart, account) */}
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
            {/* Second screen: Categories with products */}
            <div style={{ position: 'relative', marginLeft: -5, marginTop: -70 }}>
              <Img
                src={staticFile('dorian/woodmart/categories-mobile-2.png')}
                style={{
                  width: phoneWidth + 12,  // +5 to the left
                  height: 'auto',
                  display: 'block',
                }}
              />
              {/* Hide search bar and icon at top */}
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

          {/* ===== STICKY HEADER OVERLAY ===== */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              background: '#fff',
            }}
          >
            {/* Status Bar */}
            <div
              style={{
                height: 50,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 25px 5px 25px',
                background: '#fff',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>10:45</span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {/* Signal */}
                <svg width="18" height="12" viewBox="0 0 18 12">
                  <rect x="0" y="8" width="3" height="4" fill="#000" />
                  <rect x="5" y="5" width="3" height="7" fill="#000" />
                  <rect x="10" y="2" width="3" height="10" fill="#000" />
                  <rect x="15" y="0" width="3" height="12" fill="#000" />
                </svg>
                {/* Battery */}
                <div style={{ width: 25, height: 12, border: '1px solid #000', borderRadius: 3, position: 'relative' }}>
                  <div style={{ position: 'absolute', right: -4, top: 3, width: 2, height: 6, background: '#000', borderRadius: '0 2px 2px 0' }} />
                  <div style={{ position: 'absolute', left: 2, top: 2, right: 4, bottom: 2, background: '#000', borderRadius: 1 }} />
                </div>
              </div>
            </div>

            {/* Dynamic Island */}
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
                zIndex: 25,
              }}
            />

            {/* Header with Hamburger + Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 20px',
                background: '#fff',
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
                  cursor: 'pointer',
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
              <div
                style={{
                  position: 'absolute',
                  right: 20,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#1E293B" strokeWidth="2" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Search Bar */}
            <div
              style={{
                padding: '4px 16px 12px 16px',
                background: '#fff',
              }}
            >
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
                {/* Search Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="#64748B" strokeWidth="2" />
                  <path d="M16 16l4 4" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ color: '#94A3B8', fontSize: 14, fontFamily }}>
                  Search for products
                </span>
              </div>
            </div>
          </div>
          {/* ===== END STICKY HEADER ===== */}

          {/* AI Assistant Bubble - fixed position on screen */}
          {showAIBubble && (
            <div
              style={{
                position: 'absolute',
                bottom: 70,
                right: 15,
                zIndex: 20,
              }}
            >
              <AIBubble scale={1} pulse={true} />
            </div>
          )}

          {/* Bottom Home Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 140,
              height: 5,
              background: '#000',
              borderRadius: 3,
              zIndex: 15,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Phone Static - For scenes after scrolling (shows scrolled position)
export const DorianPhoneStatic: React.FC<{
  showAIBubble?: boolean;
  scrollOffset?: number;
  children?: React.ReactNode;
}> = ({ showAIBubble = true, scrollOffset = 1200, children }) => {
  // Phone frame dimensions (iPhone-style)
  const phoneWidth = 390;
  const phoneHeight = 844;
  const frameWidth = phoneWidth + 24;
  const frameHeight = phoneHeight + 24;

  return (
    <>
      {/* Phone Frame - Dark bezel */}
      <div
        style={{
          width: frameWidth,
          height: frameHeight,
          background: '#1a1a1a',
          borderRadius: 55,
          padding: 12,
          boxShadow: '0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Screen Container */}
        <div
          style={{
            width: phoneWidth,
            height: phoneHeight,
            borderRadius: 45,
            overflow: 'hidden',
            position: 'relative',
            background: '#fff',
          }}
        >
          {/* Stacked Screenshots - scrolled to show products */}
          <div
            style={{
              position: 'absolute',
              top: -scrollOffset,
              left: 0,  // Match DorianPhoneMockup offset
              width: phoneWidth,
            }}
          >
            {/* First screen: Home */}
            <div style={{ position: 'relative', marginLeft: -5 }}>
              <Img
                src={staticFile('dorian/woodmart/home-mobile.png')}
                style={{
                  width: phoneWidth + 52,  // +5 both sides (+10 total)
                  height: 'auto',
                  display: 'block',
                }}
              />
              {/* Hide bottom nav (menu, heart, cart, account) */}
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
            {/* Second screen: Categories with products */}
            <div style={{ position: 'relative', marginLeft: -5, marginTop: -70 }}>
              <Img
                src={staticFile('dorian/woodmart/categories-mobile-2.png')}
                style={{
                  width: phoneWidth + 12,  // +5 to the left
                  height: 'auto',
                  display: 'block',
                }}
              />
              {/* Hide search bar and icon at top */}
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

          {/* ===== STICKY HEADER OVERLAY ===== */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              background: '#fff',
            }}
          >
            {/* Status Bar */}
            <div
              style={{
                height: 50,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 25px 5px 25px',
                background: '#fff',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>10:45</span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <svg width="18" height="12" viewBox="0 0 18 12">
                  <rect x="0" y="8" width="3" height="4" fill="#000" />
                  <rect x="5" y="5" width="3" height="7" fill="#000" />
                  <rect x="10" y="2" width="3" height="10" fill="#000" />
                  <rect x="15" y="0" width="3" height="12" fill="#000" />
                </svg>
                <div style={{ width: 25, height: 12, border: '1px solid #000', borderRadius: 3, position: 'relative' }}>
                  <div style={{ position: 'absolute', right: -4, top: 3, width: 2, height: 6, background: '#000', borderRadius: '0 2px 2px 0' }} />
                  <div style={{ position: 'absolute', left: 2, top: 2, right: 4, bottom: 2, background: '#000', borderRadius: 1 }} />
                </div>
              </div>
            </div>

            {/* Dynamic Island */}
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
                zIndex: 25,
              }}
            />

            {/* Header with Hamburger + Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 20px',
                background: '#fff',
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
                  cursor: 'pointer',
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
              <div
                style={{
                  position: 'absolute',
                  right: 20,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#1E293B" strokeWidth="2" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Search Bar */}
            <div
              style={{
                padding: '4px 16px 12px 16px',
                background: '#fff',
              }}
            >
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
          </div>
          {/* ===== END STICKY HEADER ===== */}

          {/* AI Assistant Bubble */}
          {showAIBubble && (
            <div
              style={{
                position: 'absolute',
                bottom: 70,
                right: 15,
                zIndex: 20,
              }}
            >
              <AIBubble scale={1} pulse={true} />
            </div>
          )}

          {/* Bottom Home Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 140,
              height: 5,
              background: '#000',
              borderRadius: 3,
              zIndex: 15,
            }}
          />

          {/* Children (overlays like chat, tap effects) */}
          {children}
        </div>
      </div>
    </>
  );
};
