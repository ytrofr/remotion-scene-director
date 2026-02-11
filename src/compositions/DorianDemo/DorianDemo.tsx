import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Sequence,
  Audio,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Rubik';
import { COLORS, SCENES, TEXT_CONTENT, SPRING_CONFIG } from './constants';
import { FloatingHand } from '../../components/FloatingHand';
import { HandPathPoint } from '../../components/FloatingHand/types';
import { getSavedPath } from '../SceneDirector/codedPaths';
// Import the fixed phone mockup components (creates phone frame in CODE with scrollable content)
import {
  DorianPhoneMockup as DorianPhoneMockupNew,
  DorianPhoneStatic as DorianPhoneStaticNew,
  AIBubble as AIBubbleNew
} from './DorianPhoneMockup';

const { fontFamily } = loadFont();

// ============ REUSABLE COMPONENTS ============

// Animated text that fades and slides in
const AnimatedText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ children, delay = 0, style = {}, direction = 'up' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  const directionMap = {
    up: { x: 0, y: 50 },
    down: { x: 0, y: -50 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 },
  };

  const offset = directionMap[direction];

  return (
    <div
      style={{
        opacity: progress,
        transform: `translate(${offset.x * (1 - progress)}px, ${offset.y * (1 - progress)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// AI Chat Bubble - matches Dorian design exactly
const AIBubble: React.FC<{ scale?: number; pulse?: boolean }> = ({ scale = 1, pulse = false }) => {
  const frame = useCurrentFrame();
  const pulseScale = pulse ? 1 + Math.sin(frame * 0.15) * 0.05 : 1;

  return (
    <div
      style={{
        width: 56 * scale,
        height: 56 * scale,
        borderRadius: '50%',
        background: COLORS.primary,
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

// Dorian Logo Header
const DorianHeader: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: 'white',
        padding: '8px 0',
      }}
    >
      {/* D Icon */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: '3px solid white',
            borderRightColor: 'transparent',
            transform: 'rotate(-45deg)',
          }}
        />
      </div>
      <span
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: COLORS.primary,
          fontFamily,
          letterSpacing: 1,
        }}
      >
        DORIAN
      </span>
    </div>
  );
};

// Phone mockup with WoodMart screen + Dorian overlays - CENTERED
const PhoneMockup: React.FC<{
  src: string;
  scale?: number;
  delay?: number;
  enterFrom?: 'bottom' | 'right' | 'left' | 'none';
  showLogo?: boolean;
  showAIBubble?: boolean;
  scrollOffset?: number;
  children?: React.ReactNode;
}> = ({
  src,
  scale = 1.0,
  delay = 0,
  enterFrom = 'bottom',
  showLogo = true,
  showAIBubble = true,
  scrollOffset = 0,
  children
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideProgress = enterFrom === 'none' ? 1 : spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  const enterOffset = {
    bottom: { x: 0, y: 800 },
    right: { x: 600, y: 0 },
    left: { x: -600, y: 0 },
    none: { x: 0, y: 0 },
  };

  const offset = enterOffset[enterFrom];

  // Phone frame dimensions
  const phoneWidth = 390;
  const phoneHeight = 844;
  const frameWidth = phoneWidth + 24;
  const frameHeight = phoneHeight + 24;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${offset.x * (1 - slideProgress)}px, ${offset.y * (1 - slideProgress)}px) scale(${scale})`,
        opacity: slideProgress,
      }}
    >
      {/* Phone Frame */}
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
          {/* WoodMart Screenshot with scroll */}
          <div
            style={{
              position: 'absolute',
              top: -scrollOffset,
              left: 0,
              width: phoneWidth,
            }}
          >
            <Img
              src={staticFile(`dorian/woodmart/${src}`)}
              style={{
                width: phoneWidth,
                height: 'auto',
              }}
            />
          </div>

          {/* Status Bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 50,
              background: 'white',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '0 25px 5px 25px',
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
            }}
          />

          {/* Dorian Logo Header Overlay */}
          {showLogo && (
            <div
              style={{
                position: 'absolute',
                top: 50,
                left: 0,
                right: 0,
                background: 'white',
                padding: '5px 0',
              }}
            >
              <DorianHeader />
            </div>
          )}

          {/* AI Assistant Bubble */}
          {showAIBubble && (
            <div
              style={{
                position: 'absolute',
                bottom: 70,
                right: 15,
              }}
            >
              <AIBubble scale={1} pulse={true} />
            </div>
          )}

          {/* Bottom Nav Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              background: 'white',
              borderTop: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: '0 10px',
            }}
          >
            {['Menu', 'Wishlist', 'Cart', 'Account'].map((item, i) => (
              <div key={item} style={{ textAlign: 'center' }}>
                <div style={{ width: 24, height: 24, background: '#ccc', borderRadius: 4, margin: '0 auto 4px' }} />
                <span style={{ fontSize: 10, color: '#666' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Additional children (for overlays like typing, etc) */}
          {children}
        </div>
      </div>
    </div>
  );
};

// Static phone mockup (no entrance animation) - for use with external zoom/transform
const PhoneMockupStatic: React.FC<{
  src: string;
  showLogo?: boolean;
  showAIBubble?: boolean;
  scrollOffset?: number;
  children?: React.ReactNode;
}> = ({
  src,
  showLogo = true,
  showAIBubble = true,
  scrollOffset = 0,
  children
}) => {
  // Phone frame dimensions
  const phoneWidth = 390;
  const phoneHeight = 844;
  const frameWidth = phoneWidth + 24;
  const frameHeight = phoneHeight + 24;

  return (
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
        {/* WoodMart Screenshot with scroll */}
        <div
          style={{
            position: 'absolute',
            top: -scrollOffset,
            left: 0,
            width: phoneWidth,
          }}
        >
          <Img
            src={staticFile(`dorian/woodmart/${src}`)}
            style={{
              width: phoneWidth,
              height: 'auto',
            }}
          />
        </div>

        {/* Status Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 50,
            background: 'white',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '0 25px 5px 25px',
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
          }}
        />

        {/* Dorian Logo Header Overlay */}
        {showLogo && (
          <div
            style={{
              position: 'absolute',
              top: 50,
              left: 0,
              right: 0,
              background: 'white',
              padding: '5px 0',
            }}
          >
            <DorianHeader />
          </div>
        )}

        {/* AI Assistant Bubble */}
        {showAIBubble && (
          <div
            style={{
              position: 'absolute',
              bottom: 70,
              right: 15,
            }}
          >
            <AIBubble scale={1} pulse={true} />
          </div>
        )}

        {/* Bottom Nav Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'white',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0 10px',
          }}
        >
          {['Menu', 'Wishlist', 'Cart', 'Account'].map((item) => (
            <div key={item} style={{ textAlign: 'center' }}>
              <div style={{ width: 24, height: 24, background: '#ccc', borderRadius: 4, margin: '0 auto 4px' }} />
              <span style={{ fontSize: 10, color: '#666' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Children (overlays like finger tap, etc) */}
        {children}
      </div>
    </div>
  );
};

// Finger tap animation
const FingerTap: React.FC<{ x: number; y: number; delay: number; show: boolean }> = ({ x, y, delay, show }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tapProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, mass: 0.5, stiffness: 200 },
  });

  if (!show || frame < delay) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${tapProgress})`,
        opacity: interpolate(tapProgress, [0, 0.5, 1], [0, 1, 0.8]),
      }}
    >
      {/* Finger circle */}
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '3px solid rgba(255, 255, 255, 0.8)',
        }}
      />
      {/* Ripple effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${1 + tapProgress * 0.5})`,
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '2px solid rgba(45, 212, 191, 0.5)',
          opacity: 1 - tapProgress,
        }}
      />
    </div>
  );
};

// Dorian Logo component for intro/outro
const DorianLogo: React.FC<{ size?: number; showText?: boolean }> = ({ size = 120, showText = true }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.25,
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
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
            color: COLORS.text,
            letterSpacing: 2,
            fontFamily,
          }}
        >
          DORIAN
        </span>
      )}
    </div>
  );
};

// ============ SCENE COMPONENTS ============

// Scene 1: Intro
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  const subtitleOpacity = spring({
    frame: frame - 20,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.white,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
      }}
    >
      <div style={{ transform: `scale(${logoScale})` }}>
        <DorianLogo size={180} />
      </div>
      <div
        style={{
          opacity: subtitleOpacity,
          fontSize: 48,
          color: COLORS.primary,
          fontWeight: 500,
          letterSpacing: 8,
          fontFamily,
        }}
      >
        {TEXT_CONTENT.intro.subtitle.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};

// Dorian Screen Display - shows actual Dorian screenshots directly (no extra phone frame)
// Screenshots already include phone frame, so we just display and scroll them
const DorianPhoneMockup: React.FC<{
  scrollProgress: number; // 0 = homepage, 1 = products
  scale?: number;
  showAIBubble?: boolean;
}> = ({ scrollProgress, scale = 1.8, showAIBubble = true }) => {
  // Original screenshot dimensions: 608x1080
  const imgWidth = 608;
  const imgHeight = 1080;

  // Scroll offset based on progress (0 = top of homepage, 1 = showing products)
  // Scroll by ~85% of image height to transition between screens
  const scrollOffset = interpolate(scrollProgress, [0, 1], [0, imgHeight * 0.85]);

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      {/* Container with overflow hidden to simulate phone viewport */}
      <div
        style={{
          width: imgWidth,
          height: imgHeight,
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 45,
        }}
      >
        {/* Scrollable Content - Both screenshots stacked */}
        <div
          style={{
            position: 'absolute',
            top: -scrollOffset,
            left: 0,
            width: imgWidth,
          }}
        >
          {/* Homepage Screenshot */}
          <Img
            src={staticFile('dorian/screens/homepage.png')}
            style={{
              width: imgWidth,
              height: imgHeight,
              display: 'block',
            }}
          />
          {/* Products Screenshot - positioned right below */}
          <Img
            src={staticFile('dorian/screens/products.png')}
            style={{
              width: imgWidth,
              height: imgHeight,
              display: 'block',
            }}
          />
        </div>

        {/* AI Assistant Bubble overlay (if needed) */}
        {showAIBubble && (
          <div
            style={{
              position: 'absolute',
              bottom: 100,
              right: 20,
              zIndex: 20,
            }}
          >
            <AIBubble scale={1.2} pulse={true} />
          </div>
        )}
      </div>
    </div>
  );
};

// Scene 2: Home Page with scroll animation - Homepage → Products
const HomeScrollScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scroll progress: 0 = homepage visible, 1 = products visible
  // Start scroll at frame 30, complete by frame 120
  const scrollProgress = interpolate(
    frame,
    [30, 120],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Hand position - FIXED on right side, middle of screen
  const handX = 780; // Fixed X position (right side of phone)
  const handY = 960; // Fixed Y position (center of composition)

  // Hand path - COMPLETELY STATIC position, tilted 30deg left while scrolling
  // NO EXIT - hand stays in place for smooth transition to Scene 3
  const savedScroll = getSavedPath('DorianDemo', '2-HomeScroll');
  const scrollHandPath: HandPathPoint[] = savedScroll?.path ?? [
    { x: 1050, y: handY, frame: 0, gesture: 'pointer', rotation: 0 },              // Enter from right
    { x: handX, y: handY, frame: 20, gesture: 'pointer', rotation: 0 },            // Arrive at position
    { x: handX, y: handY, frame: 28, gesture: 'drag', rotation: -30 },             // Start scroll - tilt left 30deg
    { x: handX, y: handY, frame: 60, gesture: 'drag', rotation: -30 },             // Scrolling... (STATIC)
    { x: handX, y: handY, frame: 90, gesture: 'drag', rotation: -30 },             // Scrolling... (STATIC)
    { x: handX, y: handY, frame: 118, gesture: 'drag', rotation: -30 },            // End scroll (STATIC)
    { x: handX, y: handY, frame: 125, gesture: 'pointer', rotation: 0 },           // Release - back to normal
    { x: handX, y: handY, frame: 150, gesture: 'pointer', rotation: 0 },           // STAY in place (no exit)
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Swipe sound when scroll starts */}
      {frame === 28 && <Audio src={staticFile('audio/u_nharq4usid-swipe-255512.mp3')} volume={0.3} />}

      <AnimatedText
        delay={0}
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            fontFamily,
          }}
        >
          Discover Local Products
        </div>
      </AnimatedText>

      {/* Phone with scrollable content INSIDE (not between mockups) */}
      <DorianPhoneMockupNew
        scrollProgress={scrollProgress}
        scale={1.8}
        showAIBubble={true}
      />

      {/* Scrolling hand - STATIC X position, only vertical movement */}
      <FloatingHand
        path={scrollHandPath}
        startFrame={0}
        animation="hand-scroll-clean"
        size={140}
        dark={true}
        showRipple={false}
        physics={{
          floatAmplitude: 0,       // No floating - keep stable
          floatSpeed: 0,
          velocityScale: 0.1,     // Minimal rotation from movement
          maxRotation: 5,         // Very limited rotation
          shadowEnabled: true,
          shadowDistance: 8,
          shadowBlur: 10,
          smoothing: 0.2,         // Smooth movement
        }}
      />
    </AbsoluteFill>
  );
};

// Dorian Phone Static - for scenes that don't scroll (shows products screen)
// Dorian Screen Static - shows products screen directly (no extra phone frame)
const DorianPhoneStatic: React.FC<{
  showAIBubble?: boolean;
  children?: React.ReactNode;
}> = ({ showAIBubble = true, children }) => {
  // Original screenshot dimensions: 608x1080
  const imgWidth = 608;
  const imgHeight = 1080;

  return (
    <>
      {/* Container matching screenshot dimensions */}
      <div
        style={{
          width: imgWidth,
          height: imgHeight,
          position: 'relative',
          borderRadius: 45,
          overflow: 'hidden',
        }}
      >
        {/* Products Screenshot */}
        <Img
          src={staticFile('dorian/screens/products.png')}
          style={{
            width: imgWidth,
            height: imgHeight,
            display: 'block',
          }}
        />

        {/* AI Assistant Bubble overlay (if needed) */}
        {showAIBubble && (
          <div
            style={{
              position: 'absolute',
              bottom: 100,
              right: 20,
              zIndex: 20,
            }}
          >
            <AIBubble scale={1.2} pulse={true} />
          </div>
        )}

        {/* Children (overlays) */}
        {children}
      </div>
    </>
  );
};

// Scene 3: Tap on AI Bubble with ZOOM and FloatingHand
const TapAIBubbleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // AI bubble position on phone (non-zoomed): (818, 1546)
  // Zoom starts at frame 278 (scene frame 53), click at frame 298 (scene frame 73)
  // After 3x zoom, bubble appears at (518, 992) — that's where hand clicks
  const zoomStartFrame = 53;  // Frame 278 = scene3Start(225) + 53
  const clickFrame = 73;      // Frame 298 = scene3Start(225) + 73

  // Zoom in effect - starts when hand reaches bubble, 3X ZOOM
  const zoomProgress = spring({
    frame: frame - zoomStartFrame,
    fps,
    config: { damping: 15, mass: 1, stiffness: 80 },
  });
  const zoomScale = interpolate(zoomProgress, [0, 1], [1.8, 5.4]);  // 3x zoom
  // Center zoom on AI bubble at (818, 1546) - offsets: -(target - center) * 3
  const zoomOffsetX = interpolate(zoomProgress, [0, 1], [0, -860]);
  const zoomOffsetY = interpolate(zoomProgress, [0, 1], [0, -1730]);

  // Hand path - approach bubble, then track it as zoom moves it
  const savedTap = getSavedPath('DorianDemo', '3-TapBubble');
  const handPath: HandPathPoint[] = savedTap?.path ?? [
    { x: 780, y: 1200, frame: 0, gesture: 'pointer' },        // H1: Start above
    { x: 800, y: 1400, frame: 30, gesture: 'pointer' },       // H2: Moving down
    { x: 818, y: 1546, frame: zoomStartFrame, gesture: 'pointer' }, // H3: At bubble, zoom starts
    { x: 518, y: 992, frame: clickFrame, gesture: 'click', duration: 2 }, // H4: CLICK at zoomed position
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Click sound at frame 73 (absolute 298) */}
      {frame === 73 && <Audio src={staticFile('audio/send-click.wav')} volume={0.5} />}

      <AnimatedText
        delay={0}
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            fontFamily,
          }}
        >
          Meet Your AI Assistant
        </div>
      </AnimatedText>

      {/* Phone with same scrolled view as end of Scene 2 - zoom centers on bubble */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transform: `translate(${zoomOffsetX}px, ${zoomOffsetY}px)`,
      }}>
        <DorianPhoneMockupNew
          scrollProgress={1}
          scale={zoomScale}
          showAIBubble={true}
        />
      </div>

      {/* Floating Hand - pointer during movement, tap animation only on click */}
      <FloatingHand
        path={handPath}
        startFrame={0}
        animation="hand-click"
        size={140}
        dark={true}
        showRipple={true}
        rippleColor="rgba(45, 212, 191, 0.6)"
        physics={{
          floatAmplitude: 0,        // No float - steady hand
          floatSpeed: 0,
          velocityScale: 0.8,       // High rotation based on movement direction
          maxRotation: 35,          // Allow more rotation to follow trail
          shadowEnabled: true,
          shadowDistance: 12,
          shadowBlur: 15,
          smoothing: 0.12,          // Responsive to direction changes
        }}
      />
    </AbsoluteFill>
  );
};

// Scene 4: Chat Opens with zoom effect + hand taps input + starts typing
const ChatOpenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chatSlide = spring({
    frame,
    fps,
    config: { damping: 18, mass: 1, stiffness: 120 }, // Smoother slide
  });

  // Zoom out from scene 3's zoomed-in state (5.4 @ -860, -1730) back to normal (1.8)
  const zoomOutProgress = spring({
    frame,
    fps,
    config: { damping: 18, mass: 1, stiffness: 80 },
  });
  const zoomScale = interpolate(zoomOutProgress, [0, 1], [5.4, 1.8]);
  const zoomOffsetX = interpolate(zoomOutProgress, [0, 1], [-860, 0]);
  const zoomOffsetY = interpolate(zoomOutProgress, [0, 1], [-1730, 0]);

  // Chat height - 30% of phone screen (844 * 0.30 = ~250px)
  const chatHeight = 260;

  // Typing in input box - starts after hand taps input at frame 50
  const message = "I need dog food for large dog";
  const typingStartFrame = 55;
  const typedChars = Math.floor(interpolate(frame, [typingStartFrame, 85], [0, 10], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const typedText = message.slice(0, typedChars);

  // Input focus state - active after hand taps
  const inputFocused = frame >= 48;

  // Hand path: move to input box after zoom settles, tap it, stay during typing
  const savedChatOpen = getSavedPath('DorianDemo', '4-ChatOpen');
  const handPath: HandPathPoint[] = savedChatOpen?.path ?? [
    { x: 518, y: 992, frame: 0, gesture: 'pointer' },       // Start where scene 3 ended (zoomed click pos)
    { x: 500, y: 1200, frame: 20, gesture: 'pointer' },     // Moving down as zoom settles
    { x: 480, y: 1520, frame: 45, gesture: 'pointer' },     // Approaching input box
    { x: 480, y: 1550, frame: 48, gesture: 'click', duration: 5 }, // TAP input box
    { x: 480, y: 1550, frame: 60, gesture: 'pointer' },     // Stay near input during typing
    { x: 480, y: 1550, frame: 90, gesture: 'pointer' },     // Hold position until scene end
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Tap sound when hand clicks input box */}
      {frame === 48 && <Audio src={staticFile('audio/send-click.wav')} volume={0.4} />}

      {/* Typing sound - loops during typing */}
      {frame === typingStartFrame && (
        <Audio src={staticFile('audio/typing-soft.wav')} volume={0.3} />
      )}

      <AnimatedText
        delay={0}
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.text,
            fontFamily,
          }}
        >
          Ask Dorian Anything
        </div>
      </AnimatedText>

      {/* Phone with zoom-out effect - matches scene 3 transform structure for seamless transition */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transform: `translate(${zoomOffsetX}px, ${zoomOffsetY}px)`,
      }}>
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${zoomScale})`,
        }}>
        <DorianPhoneStaticNew showAIBubble={true} scrollOffset={702}>
          {/* Chat overlay sliding up - 30% of screen, covers the AI bubble */}
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              left: 0,
              right: 0,
              height: chatHeight,
              background: 'white',
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
              transform: `translateY(${(1 - chatSlide) * chatHeight}px)`,
              padding: '15px 16px',
              fontFamily,
              zIndex: 5,
            }}
          >
            {/* Chat header - more compact */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AIBubble scale={0.6} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>Dorian</div>
                <div style={{ fontSize: 10, color: COLORS.primary }}>Your AI Assistant</div>
              </div>
            </div>

            {/* AI greeting message - more compact */}
            <div
              style={{
                background: '#f0f0f0',
                padding: '10px 14px',
                borderRadius: '16px 16px 16px 4px',
                maxWidth: '85%',
                fontSize: 13,
                color: COLORS.text,
                lineHeight: 1.4,
              }}
            >
              Hi! How can I help you today?
            </div>

            {/* Input field at bottom - highlights on focus */}
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                background: inputFocused ? '#fff' : '#f5f5f5',
                borderRadius: 20,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: inputFocused ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ color: typedChars > 0 ? COLORS.text : '#999', fontSize: 13 }}>
                {typedChars > 0 ? typedText : 'Type a message...'}
                {inputFocused && <span style={{ opacity: frame % 15 < 8 ? 1 : 0, color: COLORS.text }}>|</span>}
              </span>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: 'white', fontSize: 18 }}>→</span>
              </div>
            </div>
          </div>
        </DorianPhoneStaticNew>
        </div>
      </div>

      {/* Floating Hand - moves to input box and taps, then hides during typing */}
      {frame <= 53 && (
        <FloatingHand
          path={handPath}
          startFrame={0}
          animation="hand-click"
          size={130}
          dark={true}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={{
            floatAmplitude: 2,
            floatSpeed: 0.04,
            velocityScale: 0.6,
            maxRotation: 25,
            shadowEnabled: true,
            shadowDistance: 10,
            shadowBlur: 12,
            smoothing: 0.15,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// Scene 5: User Types Message with zoom on chat (continues from Scene 4's 10 chars)
const UserTypingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const message = "I need dog food for large dog";
  const startChars = 10; // Scene 4 typed first 10 chars
  const typedChars = Math.floor(interpolate(frame, [0, 60], [startChars, message.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const typedText = message.slice(0, typedChars);

  const sendButtonPulse = frame > 105 ? 1 + Math.sin((frame - 105) * 0.3) * 0.08 : 1;

  // Zoom into chat area - chat center is at ~(540, 1378) in composition space
  // Zoom from 1.8 to 3.6 (2x) to center the chat panel on screen
  const zoomInProgress = spring({
    frame,
    fps,
    config: { damping: 18, mass: 1, stiffness: 80 },
  });
  const zoomScale = interpolate(zoomInProgress, [0, 1], [1.8, 2.76]);
  // Offset to bring chat area closer to center
  const zoomOffsetX = 0; // Chat is horizontally centered
  const zoomOffsetY = interpolate(zoomInProgress, [0, 1], [0, -560]);

  // Chat height - 30% of phone screen
  const chatHeight = 260;

  // Hand reappears after typing, moves to send button and clicks
  // Send button is at the right side of the input field
  // At zoom 2.76 with offset -560, approximate send button position:
  const sendHandPath: HandPathPoint[] = [
    { x: 750, y: 1520, frame: 70, gesture: 'pointer' },       // Appear near input area
    { x: 730, y: 1500, frame: 85, gesture: 'pointer' },       // Moving toward send button
    { x: 720, y: 1490, frame: 100, gesture: 'pointer' },      // Approaching
    { x: 720, y: 1490, frame: 105, gesture: 'click', duration: 10 }, // TAP send button
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Typing sound - continues from scene 4 */}
      {frame === 0 && <Audio src={staticFile('audio/typing-soft.wav')} volume={0.3} />}

      {/* Tap sound when hand clicks send button */}
      {frame === 105 && <Audio src={staticFile('audio/send-click.wav')} volume={0.5} />}

      <AnimatedText
        delay={0}
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            fontFamily,
          }}
        >
          Find Exactly What You Need
        </div>
      </AnimatedText>

      {/* Phone zoomed into chat area - same transform structure as scenes 3-4 */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transform: `translate(${zoomOffsetX}px, ${zoomOffsetY}px)`,
      }}>
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${zoomScale})`,
        }}>
        <DorianPhoneStaticNew showAIBubble={false} scrollOffset={702}>
          {/* Chat overlay - 30% height */}
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              left: 0,
              right: 0,
              height: chatHeight,
              background: 'white',
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
              padding: '15px 16px',
              fontFamily,
            }}
          >
            {/* Chat header - compact */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <AIBubble scale={0.6} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>Dorian</div>
                <div style={{ fontSize: 10, color: COLORS.primary }}>Your AI Assistant</div>
              </div>
            </div>

            {/* AI greeting - compact */}
            <div
              style={{
                background: '#f0f0f0',
                padding: '8px 12px',
                borderRadius: '14px 14px 14px 4px',
                maxWidth: '85%',
                fontSize: 12,
                color: COLORS.text,
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              Hi! How can I help you today?
            </div>

            {/* User message bubble - only appears after send (frame 105) */}
            {frame >= 105 && (
              <div
                style={{
                  background: COLORS.primary,
                  padding: '8px 12px',
                  borderRadius: '14px 14px 4px 14px',
                  maxWidth: '80%',
                  marginLeft: 'auto',
                  fontSize: 12,
                  color: 'white',
                  lineHeight: 1.3,
                }}
              >
                {message}
              </div>
            )}

            {/* Input field - focused from start (continues scene 4) */}
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                background: frame < 105 ? '#fff' : '#f5f5f5',
                borderRadius: 18,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: frame < 105 ? `2px solid ${COLORS.primary}` : '2px solid transparent',
              }}
            >
              <span style={{ color: frame < 105 ? COLORS.text : '#999', fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {frame < 105 ? typedText : 'Type a message...'}
                {frame < 105 && <span style={{ opacity: frame % 15 < 8 ? 1 : 0, color: COLORS.text }}>|</span>}
              </span>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: (typedChars > 20 && frame < 105) ? COLORS.primary : '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${sendButtonPulse})`,
                  flexShrink: 0,
                }}
              >
                <span style={{ color: 'white', fontSize: 14 }}>→</span>
              </div>
            </div>
          </div>
        </DorianPhoneStaticNew>
        </div>
      </div>

      {/* Hand reappears after typing is done, clicks send button */}
      {frame >= 70 && (
        <FloatingHand
          path={sendHandPath}
          startFrame={70}
          animation="hand-click"
          size={120}
          dark={true}
          showRipple={true}
          rippleColor="rgba(45, 212, 191, 0.5)"
          physics={{
            floatAmplitude: 2,
            floatSpeed: 0.04,
            velocityScale: 0.5,
            maxRotation: 20,
            shadowEnabled: true,
            shadowDistance: 10,
            shadowBlur: 12,
            smoothing: 0.15,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// Scene 6: Outro
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  const taglineOpacity = spring({
    frame: frame - 25,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  const ctaOpacity = spring({
    frame: frame - 50,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.white,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 50,
      }}
    >
      <div style={{ transform: `scale(${logoScale})` }}>
        <DorianLogo size={200} />
      </div>

      <div
        style={{
          opacity: taglineOpacity,
          fontSize: 48,
          fontWeight: 500,
          color: COLORS.textLight,
          fontFamily,
        }}
      >
        {TEXT_CONTENT.outro.tagline}
      </div>

      <div
        style={{
          opacity: ctaOpacity,
          background: COLORS.primary,
          padding: '25px 60px',
          borderRadius: 50,
          fontSize: 36,
          fontWeight: 700,
          color: COLORS.white,
          fontFamily,
        }}
      >
        {TEXT_CONTENT.outro.cta}
      </div>
    </AbsoluteFill>
  );
};

// ============ DEBUG COMPOSITION ============

export const DorianDebug: React.FC = () => {
  const [coords, setCoords] = React.useState<{x: number, y: number}[]>([]);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = React.useState(300);
  const [showFullImage, setShowFullImage] = React.useState(false);

  const scale = 1.8;

  // Phone dimensions at scale 1.8
  // Phone frame: 414x868, screen: 390x844
  // Centered at (540, 960) in 1080x1920 composition
  const phoneFrameWidth = 414 * scale;  // 745.2
  const phoneFrameHeight = 868 * scale; // 1562.4
  const phoneLeft = 540 - phoneFrameWidth / 2; // 167.4
  const phoneTop = 960 - phoneFrameHeight / 2; // 178.8
  const screenPadding = 12 * scale; // 21.6
  const screenLeft = phoneLeft + screenPadding; // 189
  const screenTop = phoneTop + screenPadding; // 200.4
  const screenWidth = 390 * scale; // 702
  const screenHeight = 844 * scale; // 1519.2

  // AI bubble in phone coords: bottom 70, right 15, size 56
  // Bubble center: x = 390 - 15 - 28 = 347, y = 844 - 70 - 28 = 746
  const bubblePhoneX = 347;
  const bubblePhoneY = 746;
  const bubbleCompX = screenLeft + bubblePhoneX * scale;
  const bubbleCompY = screenTop + bubblePhoneY * scale;

  return (
    <AbsoluteFill
      style={{ background: '#222', cursor: 'crosshair' }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleRatio = 1080 / rect.width;
        const x = Math.round((e.clientX - rect.left) * scaleRatio);
        const y = Math.round((e.clientY - rect.top) * scaleRatio);
        setCoords([...coords, { x, y }]);
        console.log(`Clicked: (${x}, ${y}) | Phone coords: (${Math.round((x - screenLeft) / scale)}, ${Math.round((y - screenTop) / scale)})`);
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleRatio = 1080 / rect.width;
        setMousePos({
          x: Math.round((e.clientX - rect.left) * scaleRatio),
          y: Math.round((e.clientY - rect.top) * scaleRatio),
        });
      }}
    >
      {/* Phone mockup with scrollable content INSIDE */}
      <DorianPhoneMockupNew
        scrollProgress={scrollOffset / 500} // Convert offset to 0-1 progress
        scale={scale}
        showAIBubble={true}
      />

      {/* AI Bubble marker */}
      <div
        style={{
          position: 'absolute',
          left: bubbleCompX,
          top: bubbleCompY,
          transform: 'translate(-50%, -50%)',
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '3px dashed #0f0',
          pointerEvents: 'none',
        }}
      />

      {/* Crosshairs */}
      <div style={{ position: 'absolute', left: mousePos.x, top: 0, bottom: 0, width: 1, background: 'rgba(0,255,255,0.5)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: mousePos.y, left: 0, right: 0, height: 1, background: 'rgba(0,255,255,0.5)', pointerEvents: 'none' }} />

      {/* Control Panel */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.9)',
          padding: 20,
          borderRadius: 12,
          color: 'white',
          fontFamily: 'monospace',
          fontSize: 14,
          minWidth: 320,
        }}
      >
        <div style={{ marginBottom: 15, color: '#0ff', fontSize: 16, fontWeight: 'bold' }}>
          🎯 DORIAN DEBUG
        </div>

        {/* Mouse Position */}
        <div style={{ marginBottom: 10 }}>
          <span style={{ color: '#888' }}>Mouse:</span> ({mousePos.x}, {mousePos.y})
        </div>
        <div style={{ marginBottom: 15, fontSize: 12, color: '#666' }}>
          Phone: ({Math.round((mousePos.x - screenLeft) / scale)}, {Math.round((mousePos.y - screenTop) / scale)})
        </div>

        {/* Scroll Control */}
        <div style={{ marginBottom: 15 }}>
          <div style={{ color: '#0f0', marginBottom: 8 }}>📜 Scroll Offset: {scrollOffset}px</div>
          <input
            type="range"
            min="0"
            max="800"
            value={scrollOffset}
            onChange={(e) => setScrollOffset(Number(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[0, 100, 200, 300, 400, 500].map(val => (
              <button
                key={val}
                onClick={(e) => { e.stopPropagation(); setScrollOffset(val); }}
                style={{
                  padding: '4px 8px',
                  background: scrollOffset === val ? '#0f0' : '#444',
                  color: scrollOffset === val ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Image Toggle */}
        <div style={{ marginBottom: 15 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowFullImage(!showFullImage); }}
            style={{
              padding: '8px 16px',
              background: showFullImage ? '#f80' : '#444',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {showFullImage ? '📄 Using: home-mobile-full.png' : '📄 Using: home-mobile.png'}
          </button>
        </div>

        {/* AI Bubble Info */}
        <div style={{ background: '#0a0a0a', padding: 10, borderRadius: 6, marginBottom: 15 }}>
          <div style={{ color: '#0f0', marginBottom: 5 }}>🎯 AI Bubble Position:</div>
          <div>Composition: ({Math.round(bubbleCompX)}, {Math.round(bubbleCompY)})</div>
          <div style={{ color: '#888', fontSize: 12 }}>Phone: ({bubblePhoneX}, {bubblePhoneY})</div>
        </div>

        {/* Clicked Points */}
        <div style={{ color: '#f00', marginBottom: 5 }}>Clicked Points:</div>
        {coords.length === 0 && <div style={{ color: '#666' }}>Click to record...</div>}
        {coords.map((c, i) => (
          <div key={i} style={{ fontSize: 12 }}>
            #{i + 1}: ({c.x}, {c.y}) → Phone: ({Math.round((c.x - screenLeft) / scale)}, {Math.round((c.y - screenTop) / scale)})
          </div>
        ))}
        {coords.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(JSON.stringify(coords)); }}
              style={{ padding: '6px 12px', background: '#0f0', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              COPY
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCoords([]); }}
              style={{ padding: '6px 12px', background: '#f00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              CLEAR
            </button>
          </div>
        )}
      </div>

      {/* Clicked points markers */}
      {coords.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#f00',
            border: '2px solid #fff',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          padding: '10px 20px',
          borderRadius: 8,
          color: '#fff',
          fontSize: 14,
        }}
      >
        Click anywhere to record coordinates • Use slider to preview scroll • Green circle = AI bubble target
      </div>
    </AbsoluteFill>
  );
};

// ============ DEBUG: TAP AI BUBBLE ============

export const DorianDebugTapBubble: React.FC = () => {
  const [coords, setCoords] = React.useState<{x: number, y: number}[]>([]);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  const scale = 1.8;

  // Phone dimensions at scale 1.8
  const phoneFrameWidth = 414 * scale;
  const phoneFrameHeight = 868 * scale;
  const phoneLeft = 540 - phoneFrameWidth / 2;
  const phoneTop = 960 - phoneFrameHeight / 2;
  const screenPadding = 12 * scale;
  const screenLeft = phoneLeft + screenPadding;
  const screenTop = phoneTop + screenPadding;

  // Current bubble position (from TapAIBubbleScene) - non-zoomed position
  const currentBubbleX = 818;
  const currentBubbleY = 1546;

  return (
    <AbsoluteFill
      style={{ background: '#333', cursor: 'crosshair' }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleRatio = 1080 / rect.width;
        const x = Math.round((e.clientX - rect.left) * scaleRatio);
        const y = Math.round((e.clientY - rect.top) * scaleRatio);
        setCoords([...coords, { x, y }]);
        console.log(`CLICK: (${x}, ${y})`);
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleRatio = 1080 / rect.width;
        setMousePos({
          x: Math.round((e.clientX - rect.left) * scaleRatio),
          y: Math.round((e.clientY - rect.top) * scaleRatio),
        });
      }}
    >
      {/* Phone mockup at scale 1.8 - same as TapAIBubbleScene */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <DorianPhoneStaticNew showAIBubble={true} />
      </div>

      {/* Current target marker (green) - dashed circle + solid center dot */}
      <div
        style={{
          position: 'absolute',
          left: currentBubbleX,
          top: currentBubbleY,
          transform: 'translate(-50%, -50%)',
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: '4px dashed #0f0',
          pointerEvents: 'none',
        }}
      />
      {/* SOLID GREEN DOT - exact click target */}
      <div
        style={{
          position: 'absolute',
          left: currentBubbleX,
          top: currentBubbleY,
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#0f0',
          border: '3px solid #fff',
          boxShadow: '0 0 10px #0f0',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: currentBubbleX,
          top: currentBubbleY - 55,
          transform: 'translateX(-50%)',
          background: '#0f0',
          color: '#000',
          padding: '6px 12px',
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 'bold',
          pointerEvents: 'none',
        }}
      >
        CURRENT TARGET: ({currentBubbleX}, {currentBubbleY})
      </div>

      {/* Crosshairs */}
      <div style={{ position: 'absolute', left: mousePos.x, top: 0, bottom: 0, width: 1, background: 'rgba(255,0,0,0.7)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: mousePos.y, left: 0, right: 0, height: 1, background: 'rgba(255,0,0,0.7)', pointerEvents: 'none' }} />

      {/* Control Panel */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.95)',
          padding: 20,
          borderRadius: 12,
          color: 'white',
          fontFamily: 'monospace',
          fontSize: 14,
          minWidth: 350,
        }}
      >
        <div style={{ marginBottom: 15, color: '#f00', fontSize: 18, fontWeight: 'bold' }}>
          🎯 DEBUG: AI BUBBLE TAP
        </div>

        <div style={{ marginBottom: 10 }}>
          <span style={{ color: '#888' }}>Mouse:</span> <span style={{ color: '#ff0' }}>({mousePos.x}, {mousePos.y})</span>
        </div>

        <div style={{ marginBottom: 15, padding: 10, background: '#0a0a0a', borderRadius: 6 }}>
          <div style={{ color: '#0f0', marginBottom: 5 }}>Current baseBubbleX/Y:</div>
          <div>X: {currentBubbleX}, Y: {currentBubbleY}</div>
        </div>

        <div style={{ color: '#f00', marginBottom: 5 }}>Clicked Points:</div>
        {coords.length === 0 && <div style={{ color: '#666' }}>Click on the AI bubble...</div>}
        {coords.slice(-5).map((c, i) => (
          <div key={i} style={{ fontSize: 12, color: '#ff0' }}>
            #{coords.length - 4 + i}: <strong>({c.x}, {c.y})</strong>
          </div>
        ))}
        {coords.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const last = coords[coords.length - 1];
                navigator.clipboard.writeText(`baseBubbleX = ${last.x};\nbaseBubbleY = ${last.y};`);
              }}
              style={{ padding: '6px 12px', background: '#0f0', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
            >
              COPY LAST
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCoords([]); }}
              style={{ padding: '6px 12px', background: '#f00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              CLEAR
            </button>
          </div>
        )}
      </div>

      {/* Clicked points markers */}
      {coords.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            transform: 'translate(-50%, -50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#f00',
            border: '3px solid #fff',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.9)',
          padding: '12px 24px',
          borderRadius: 8,
          color: '#fff',
          fontSize: 16,
        }}
      >
        Click on the AI bubble (teal circle) • Green dashed = current target • Red = your clicks
      </div>
    </AbsoluteFill>
  );
};

// ============ MAIN COMPOSITION ============

export const DorianDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      <Sequence from={SCENES.intro.start} durationInFrames={SCENES.intro.duration} name="1-Intro">
        <IntroScene />
      </Sequence>

      <Sequence from={SCENES.homeScroll.start} durationInFrames={SCENES.homeScroll.duration} name="2-HomeScroll">
        <HomeScrollScene />
      </Sequence>

      <Sequence from={SCENES.tapBubble.start} durationInFrames={SCENES.tapBubble.duration} name="3-TapBubble">
        <TapAIBubbleScene />
      </Sequence>

      <Sequence from={SCENES.chatOpen.start} durationInFrames={SCENES.chatOpen.duration} name="4-ChatOpen">
        <ChatOpenScene />
      </Sequence>

      <Sequence from={SCENES.userTyping.start} durationInFrames={SCENES.userTyping.duration} name="5-UserTyping">
        <UserTypingScene />
      </Sequence>

      <Sequence from={SCENES.outro.start} durationInFrames={SCENES.outro.duration} name="6-Outro">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

// ============ DEBUG OVERLAY COMPONENT ============

// Scene info for debug display
export const DORIAN_SCENE_INFO = [
  { name: '1-Intro', start: SCENES.intro.start, end: SCENES.intro.start + SCENES.intro.duration, hand: 'none', gesture: '-' },
  { name: '2-HomeScroll', start: SCENES.homeScroll.start, end: SCENES.homeScroll.start + SCENES.homeScroll.duration, hand: 'hand-scroll-clean', gesture: 'drag (scroll)' },
  { name: '3-TapBubble', start: SCENES.tapBubble.start, end: SCENES.tapBubble.start + SCENES.tapBubble.duration, hand: 'hand-click', gesture: 'pointer → click' },
  { name: '4-ChatOpen', start: SCENES.chatOpen.start, end: SCENES.chatOpen.start + SCENES.chatOpen.duration, hand: 'hand-click', gesture: 'pointer → click (input box) → hide' },
  { name: '5-UserTyping', start: SCENES.userTyping.start, end: SCENES.userTyping.start + SCENES.userTyping.duration, hand: 'hand-click', gesture: 'pointer → click (send btn)' },
  { name: '6-Outro', start: SCENES.outro.start, end: SCENES.outro.start + SCENES.outro.duration, hand: 'none', gesture: '-' },
];
const SCENE_INFO = DORIAN_SCENE_INFO;

const DebugOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Find current scene
  const currentScene = SCENE_INFO.find(s => frame >= s.start && frame < s.end) || SCENE_INFO[0];
  const frameInScene = frame - currentScene.start;
  const sceneDuration = currentScene.end - currentScene.start;

  // Time formatting
  const totalSeconds = frame / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const frames = frame % fps;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;

  // Progress
  const sceneProgress = ((frameInScene / sceneDuration) * 100).toFixed(0);
  const totalProgress = ((frame / durationInFrames) * 100).toFixed(0);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Main Debug Panel - Top Left */}
      <div
        style={{
          position: 'absolute',
          top: 15,
          left: 15,
          background: 'rgba(0,0,0,0.9)',
          border: '2px solid #00ff00',
          borderRadius: 12,
          padding: '12px 16px',
          fontFamily: 'monospace',
          fontSize: 14,
          color: '#fff',
          minWidth: 280,
        }}
      >
        {/* Time & Frame */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px solid #333', paddingBottom: 8 }}>
          <span style={{ color: '#00ff00', fontSize: 18, fontWeight: 'bold' }}>{timeStr}</span>
          <span style={{ color: '#ff0' }}>Frame {frame} / {durationInFrames}</span>
        </div>

        {/* Current Scene */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#888' }}>Scene: </span>
          <span style={{ color: '#00d9ff', fontWeight: 'bold', fontSize: 16 }}>{currentScene.name}</span>
        </div>

        {/* Scene Progress Bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#888', fontSize: 11 }}>Scene Frame: {frameInScene}/{sceneDuration}</span>
            <span style={{ color: '#888', fontSize: 11 }}>{sceneProgress}%</span>
          </div>
          <div style={{ height: 6, background: '#333', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${sceneProgress}%`, background: '#00d9ff', borderRadius: 3 }} />
          </div>
        </div>

        {/* Hand Info */}
        <div style={{ background: '#111', padding: 8, borderRadius: 6, marginBottom: 8 }}>
          <div style={{ color: '#f80', marginBottom: 4, fontWeight: 'bold' }}>✋ HAND</div>
          <div><span style={{ color: '#888' }}>Animation: </span><span style={{ color: '#fff' }}>{currentScene.hand}</span></div>
          <div><span style={{ color: '#888' }}>Gesture: </span><span style={{ color: '#0f0' }}>{currentScene.gesture}</span></div>
        </div>

        {/* Total Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#888', fontSize: 11 }}>Total Progress</span>
            <span style={{ color: '#888', fontSize: 11 }}>{totalProgress}%</span>
          </div>
          <div style={{ height: 4, background: '#333', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${totalProgress}%`, background: '#00ff00', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* Scene Timeline - Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 15,
          left: 15,
          right: 15,
          background: 'rgba(0,0,0,0.9)',
          border: '2px solid #444',
          borderRadius: 8,
          padding: '10px 12px',
          fontFamily: 'monospace',
          fontSize: 11,
        }}
      >
        <div style={{ display: 'flex', gap: 4, height: 30 }}>
          {SCENE_INFO.map((scene, i) => {
            const width = ((scene.end - scene.start) / durationInFrames) * 100;
            const isActive = frame >= scene.start && frame < scene.end;
            const isPast = frame >= scene.end;
            return (
              <div
                key={i}
                style={{
                  width: `${width}%`,
                  height: '100%',
                  background: isActive ? '#00d9ff' : isPast ? '#2a5a6a' : '#333',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#000' : '#888',
                  fontWeight: isActive ? 'bold' : 'normal',
                  fontSize: 10,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {scene.name.split('-')[0]}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${sceneProgress}%`,
                      background: 'rgba(0,255,0,0.3)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        {/* Playhead */}
        <div
          style={{
            position: 'absolute',
            left: `${(frame / durationInFrames) * 100}%`,
            top: 8,
            bottom: 8,
            width: 2,
            background: '#ff0',
            marginLeft: 12,
          }}
        />
      </div>

      {/* Quick Scene Reference - Top Right */}
      <div
        style={{
          position: 'absolute',
          top: 15,
          right: 15,
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid #444',
          borderRadius: 8,
          padding: '8px 12px',
          fontFamily: 'monospace',
          fontSize: 10,
          color: '#888',
        }}
      >
        {SCENE_INFO.map((scene, i) => {
          const isActive = frame >= scene.start && frame < scene.end;
          return (
            <div
              key={i}
              style={{
                color: isActive ? '#00ff00' : '#666',
                fontWeight: isActive ? 'bold' : 'normal',
                marginBottom: 2,
              }}
            >
              {isActive ? '▶' : '○'} {scene.name}: {scene.start}-{scene.end} {scene.hand !== 'none' ? `[${scene.hand}]` : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ DEBUG VERSION OF MAIN COMPOSITION ============

export const DorianDemoWithDebug: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Main Demo */}
      <DorianDemo />

      {/* Debug Overlay on top */}
      <DebugOverlay />
    </AbsoluteFill>
  );
};

// ============ INTERACTIVE DEBUG WITH CLICK-TO-MARK ============

export const DorianDebugInteractive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [markers, setMarkers] = React.useState<Array<{x: number, y: number, frame: number, label: string}>>([]);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  // Find current scene
  const currentScene = SCENE_INFO.find(s => frame >= s.start && frame < s.end) || SCENE_INFO[0];
  const frameInScene = frame - currentScene.start;

  // Time formatting
  const seconds = Math.floor(frame / fps);
  const frames = frame % fps;
  const timeStr = `${seconds}:${frames.toString().padStart(2, '0')}`;

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 1080 / rect.width;
    const scaleY = 1920 / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    const label = `M${markers.length + 1}`;
    setMarkers([...markers, { x, y, frame, label }]);
    console.log(`MARKER ${label}: (${x}, ${y}) @ frame ${frame} [${timeStr}] - ${currentScene.name}`);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 1080 / rect.width;
    const scaleY = 1920 / rect.height;
    setMousePos({
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    });
  };

  const exportMarkers = () => {
    const output = markers.map(m => `{ x: ${m.x}, y: ${m.y}, frame: ${m.frame} }, // ${m.label}`).join('\n');
    navigator.clipboard.writeText(output);
    alert('Markers copied to clipboard!\n\n' + output);
  };

  // Current hand path points for Scene 3 (TapBubble) - ALL MARKERS FOR DEBUGGING
  const scene3Start = SCENES.tapBubble.start; // 225
  const predefinedPoints = [
    { x: 780, y: 1200, frame: scene3Start + 0, label: 'H1-Start', color: '#0f0', desc: 'Hand start @ 225' },
    { x: 800, y: 1400, frame: scene3Start + 30, label: 'H2-Move', color: '#0f0', desc: 'Moving down @ 255' },
    { x: 818, y: 1546, frame: scene3Start + 53, label: 'H3-Bubble', color: '#ff0', desc: 'At bubble @ 278 (ZOOM IN)' },
    { x: 518, y: 992, frame: scene3Start + 73, label: 'CLICK', color: '#f00', desc: '★ CLICK @ 298 (zoomed pos)' },
  ];

  // Scene 2 scroll hand end position
  const scene2Points = [
    { x: 780, y: 960, frame: SCENES.homeScroll.start + 150, label: 'S2-End', color: '#00f', desc: 'Scene 2 scroll hand end' },
  ];

  // Scene 4 hand path: zoom-out → move to input → tap → hide
  const scene4Start = SCENES.chatOpen.start; // 300
  const scene4Points = [
    { x: 518, y: 992, frame: scene4Start + 0, label: 'S4-Start', color: '#0ff', desc: 'Start (from S3 zoom click pos) @ 300' },
    { x: 500, y: 1200, frame: scene4Start + 20, label: 'S4-Move', color: '#0ff', desc: 'Moving down @ 320' },
    { x: 480, y: 1520, frame: scene4Start + 45, label: 'S4-Near', color: '#0ff', desc: 'Near input box @ 345' },
    { x: 480, y: 1550, frame: scene4Start + 48, label: 'S4-TAP', color: '#f80', desc: '★ TAP input box @ 348' },
    { x: 480, y: 1550, frame: scene4Start + 53, label: 'S4-Hide', color: '#f00', desc: 'Hand hides @ 353' },
  ];

  // Scene 5 hand path: reappear → move to send → tap
  const scene5Start = SCENES.userTyping.start; // 390
  const scene5Points = [
    { x: 750, y: 1520, frame: scene5Start + 70, label: 'S5-Show', color: '#a0f', desc: 'Hand reappears @ 460' },
    { x: 730, y: 1500, frame: scene5Start + 85, label: 'S5-Move', color: '#a0f', desc: 'Moving to send @ 475' },
    { x: 720, y: 1490, frame: scene5Start + 100, label: 'S5-Near', color: '#a0f', desc: 'Near send btn @ 490' },
    { x: 720, y: 1490, frame: scene5Start + 105, label: 'S5-SEND', color: '#f00', desc: '★ TAP send @ 495' },
  ];

  const allPredefined = [...scene2Points, ...predefinedPoints, ...scene4Points, ...scene5Points];

  return (
    <AbsoluteFill
      style={{ background: COLORS.white, cursor: 'crosshair' }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      {/* Main Demo */}
      <DorianDemo />

      {/* PREDEFINED Hand Path Markers (always visible) */}
      {allPredefined.map((p, i) => {
        const isActive = frame >= p.frame - 5 && frame <= p.frame + 5;
        const isClick = p.label === 'CLICK';
        return (
          <div
            key={`pre-${i}`}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 9990,
              opacity: isActive ? 1 : 0.6,
            }}
          >
            {/* Marker */}
            <div
              style={{
                width: isClick ? 30 : 16,
                height: isClick ? 30 : 16,
                borderRadius: '50%',
                background: p.color,
                border: isActive ? '4px solid #fff' : '2px solid rgba(255,255,255,0.5)',
                boxShadow: isActive ? `0 0 20px ${p.color}` : 'none',
              }}
            />
            {/* Label */}
            <div
              style={{
                position: 'absolute',
                top: isClick ? -35 : -22,
                left: '50%',
                transform: 'translateX(-50%)',
                background: isActive ? p.color : 'rgba(0,0,0,0.8)',
                color: isActive && p.color !== '#ff0' ? '#fff' : '#000',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: isClick ? 12 : 10,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                fontWeight: isClick ? 'bold' : 'normal',
              }}
            >
              {p.label} ({p.x},{p.y})
            </div>
            {/* Frame indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: -18,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#888',
                fontSize: 9,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
              }}
            >
              @{p.frame}
            </div>
          </div>
        );
      })}

      {/* Path lines connecting predefined points */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9989 }}>
        {/* Scene 3 path (green) */}
        {predefinedPoints.slice(0, -1).map((p, i) => {
          const next = predefinedPoints[i + 1];
          return (
            <line
              key={`s3-${i}`}
              x1={p.x} y1={p.y} x2={next.x} y2={next.y}
              stroke={next.label === 'CLICK' ? '#f00' : '#0f0'}
              strokeWidth={2}
              strokeDasharray={next.label === 'CLICK' ? 'none' : '5,5'}
              opacity={0.5}
            />
          );
        })}
        {/* Scene 4 path (cyan) */}
        {scene4Points.slice(0, -1).map((p, i) => {
          const next = scene4Points[i + 1];
          return (
            <line
              key={`s4-${i}`}
              x1={p.x} y1={p.y} x2={next.x} y2={next.y}
              stroke={next.label.includes('TAP') || next.label.includes('Hide') ? '#f80' : '#0ff'}
              strokeWidth={2}
              strokeDasharray={next.label.includes('TAP') ? 'none' : '5,5'}
              opacity={0.5}
            />
          );
        })}
        {/* Scene 3 → Scene 4 transition (dashed white) */}
        <line
          x1={predefinedPoints[predefinedPoints.length - 1].x}
          y1={predefinedPoints[predefinedPoints.length - 1].y}
          x2={scene4Points[0].x}
          y2={scene4Points[0].y}
          stroke="#fff"
          strokeWidth={1}
          strokeDasharray="8,4"
          opacity={0.3}
        />
        {/* Scene 5 path (purple) */}
        {scene5Points.slice(0, -1).map((p, i) => {
          const next = scene5Points[i + 1];
          return (
            <line
              key={`s5-${i}`}
              x1={p.x} y1={p.y} x2={next.x} y2={next.y}
              stroke={next.label.includes('SEND') ? '#f00' : '#a0f'}
              strokeWidth={2}
              strokeDasharray={next.label.includes('SEND') ? 'none' : '5,5'}
              opacity={0.5}
            />
          );
        })}
      </svg>

      {/* Crosshairs */}
      <div style={{ position: 'absolute', left: mousePos.x, top: 0, bottom: 0, width: 1, background: 'rgba(255,0,0,0.5)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: mousePos.y, left: 0, right: 0, height: 1, background: 'rgba(255,0,0,0.5)', pointerEvents: 'none' }} />

      {/* All Markers (persistent across all frames) */}
      {markers.map((m, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: m.x,
            top: m.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        >
          {/* Marker dot */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: frame === m.frame ? '#ff0' : '#f00',
              border: '3px solid #fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            }}
          />
          {/* Label */}
          <div
            style={{
              position: 'absolute',
              top: -25,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#000',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: 10,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
          >
            {m.label} ({m.x},{m.y}) @{m.frame}
          </div>
        </div>
      ))}

      {/* Debug Panel - Top Left */}
      <div
        style={{
          position: 'absolute',
          top: 15,
          left: 15,
          background: 'rgba(0,0,0,0.95)',
          border: '2px solid #00ff00',
          borderRadius: 12,
          padding: '12px 16px',
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#fff',
          minWidth: 300,
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, borderBottom: '1px solid #333', paddingBottom: 8 }}>
          <span style={{ color: '#00ff00', fontSize: 20, fontWeight: 'bold' }}>{timeStr}</span>
          <span style={{ color: '#ff0' }}>Frame {frame}</span>
        </div>

        {/* Scene */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#888' }}>Scene: </span>
          <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{currentScene.name}</span>
          <span style={{ color: '#666' }}> (frame {frameInScene})</span>
        </div>

        {/* Mouse Position */}
        <div style={{ marginBottom: 8, padding: 8, background: '#111', borderRadius: 6 }}>
          <div style={{ color: '#f00', marginBottom: 4 }}>🎯 MOUSE POSITION</div>
          <div style={{ fontSize: 16, color: '#ff0' }}>x: {mousePos.x}, y: {mousePos.y}</div>
        </div>

        {/* Hand Info */}
        <div style={{ marginBottom: 8, padding: 8, background: '#111', borderRadius: 6 }}>
          <div style={{ color: '#f80', marginBottom: 4 }}>✋ HAND</div>
          <div><span style={{ color: '#888' }}>Animation: </span>{currentScene.hand}</div>
          <div><span style={{ color: '#888' }}>Gesture: </span><span style={{ color: '#0f0' }}>{currentScene.gesture}</span></div>
        </div>

        {/* Markers */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: '#f0f', marginBottom: 4 }}>📍 MARKERS ({markers.length})</div>
          <div style={{ maxHeight: 100, overflowY: 'auto', fontSize: 11 }}>
            {markers.length === 0 && <div style={{ color: '#666' }}>Click on video to add markers...</div>}
            {markers.slice(-5).map((m, i) => (
              <div key={i} style={{ color: frame === m.frame ? '#ff0' : '#888' }}>
                {m.label}: ({m.x}, {m.y}) @{m.frame}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={exportMarkers}
            style={{ flex: 1, padding: '8px', background: '#0a0', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
          >
            COPY ALL
          </button>
          <button
            onClick={() => setMarkers([])}
            style={{ flex: 1, padding: '8px', background: '#a00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
          >
            CLEAR
          </button>
        </div>

        {/* Instructions */}
        <div style={{ marginTop: 10, fontSize: 10, color: '#666', borderTop: '1px solid #333', paddingTop: 8 }}>
          Click anywhere to mark • Markers persist across frames<br/>
          Tell me: "Move hand from M1 to M2 at frame X"
        </div>
      </div>

      {/* Scene Timeline - Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 15,
          left: 15,
          right: 15,
          background: 'rgba(0,0,0,0.9)',
          border: '2px solid #444',
          borderRadius: 8,
          padding: '10px 12px',
          fontFamily: 'monospace',
          fontSize: 11,
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      >
        <div style={{ display: 'flex', gap: 4, height: 30 }}>
          {SCENE_INFO.map((scene, i) => {
            const width = ((scene.end - scene.start) / durationInFrames) * 100;
            const isActive = frame >= scene.start && frame < scene.end;
            const isPast = frame >= scene.end;
            const progress = isActive ? ((frame - scene.start) / (scene.end - scene.start)) * 100 : 0;
            return (
              <div
                key={i}
                style={{
                  width: `${width}%`,
                  height: '100%',
                  background: isActive ? '#00d9ff' : isPast ? '#2a5a6a' : '#333',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#000' : '#888',
                  fontWeight: isActive ? 'bold' : 'normal',
                  fontSize: 10,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {scene.name.split('-')[0]}
                {scene.hand !== 'none' && <span style={{ marginLeft: 4 }}>✋</span>}
                {isActive && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: 'rgba(0,255,0,0.3)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
