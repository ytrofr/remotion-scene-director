// DorianPhoneMockup.tsx - Phone frame created in CODE with scrollable content INSIDE
// This fixes the "scrolling between mockups" issue by using a single long screenshot

import React from 'react';
import { Img, staticFile } from 'remotion';
import {
  StatusBar,
  DynamicIsland,
  DorianNavHeader,
  AIBubble,
} from '../../components/DorianPhone';

// Re-export AIBubble so existing imports from this file still work
export { AIBubble };

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
          boxShadow:
            '0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
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
              left: 0, // Adjusted: negative=left, positive=right
              width: phoneWidth,
              // border: '2px solid red',  // Uncomment to see content bounds
            }}
          >
            {/* First screen: Home */}
            <div style={{ position: 'relative', marginLeft: -5 }}>
              <Img
                src={staticFile('dorian/woodmart/home-mobile.png')}
                style={{
                  width: phoneWidth + 52, // +5 both sides (+10 total)
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
            <div
              style={{ position: 'relative', marginLeft: -5, marginTop: -70 }}
            >
              <Img
                src={staticFile('dorian/woodmart/categories-mobile-2.png')}
                style={{
                  width: phoneWidth + 12, // +5 to the left
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
          {/* Height matches original flow layout: StatusBar(50) + NavHeader(~98) = 148 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 148,
              zIndex: 20,
              background: '#fff',
            }}
          >
            <StatusBar />
            <DynamicIsland />
            <DorianNavHeader showSearch={true} />
          </div>

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
          boxShadow:
            '0 50px 100px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
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
              left: 0, // Match DorianPhoneMockup offset
              width: phoneWidth,
            }}
          >
            {/* First screen: Home */}
            <div style={{ position: 'relative', marginLeft: -5 }}>
              <Img
                src={staticFile('dorian/woodmart/home-mobile.png')}
                style={{
                  width: phoneWidth + 52, // +5 both sides (+10 total)
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
            <div
              style={{ position: 'relative', marginLeft: -5, marginTop: -70 }}
            >
              <Img
                src={staticFile('dorian/woodmart/categories-mobile-2.png')}
                style={{
                  width: phoneWidth + 12, // +5 to the left
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
          {/* Height matches original flow layout: StatusBar(50) + NavHeader(~98) = 148 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 148,
              zIndex: 20,
              background: '#fff',
            }}
          >
            <StatusBar />
            <DynamicIsland />
            <DorianNavHeader showSearch={true} />
          </div>

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
