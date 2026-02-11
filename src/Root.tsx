import React, { useState } from 'react';
import { Composition, Still, useCurrentScale, useCurrentFrame } from 'remotion';
import { MobileChatDemoRefactored } from './compositions/MobileChatDemoRefactored';
import { MobileChatDemoV3 } from './compositions/MobileChatDemoV3';
import {
  MobileChatDemoV4,
  MobileChatDemoV4DebugInteractive,
} from './compositions/MobileChatDemoV4';
import {
  MobileChatDemoCombined,
  MobileChatDemoCombinedDebugInteractive,
  COMBINED_VIDEO,
} from './compositions/MobileChatDemoCombined';
import {
  DorianDemo,
  DorianDebug,
  DorianDebugTapBubble,
  DorianDemoWithDebug,
  DorianDebugInteractive,
  VIDEO as DORIAN_VIDEO,
} from './compositions/DorianDemo';
import {
  DashmorDemo,
  VIDEO as DASHMOR_VIDEO,
} from './compositions/DashmorDemo';
import { DebugSectionPicker } from './compositions/DashmorDemo/DebugSectionPicker';
import { DebugSectionPickerInteractive } from './compositions/DashmorDemo/DebugSectionPickerInteractive';
import { Img, staticFile, AbsoluteFill } from 'remotion';
import { FloatingHand, LottieHand } from './components/FloatingHand';
import { HandGesture } from './components/FloatingHand/types';

// Debug component to compare scroll/swipe animations
const DebugScrollAnimations: React.FC = () => {
  const frame = useCurrentFrame();

  const scrollAnimations = [
    {
      name: 'hand-scroll-clean',
      label: '★ Clean Scroll',
      size: '5KB',
      desc: 'Dark finger, no arrow',
    },
    { name: 'hand-click', label: 'Click', size: '10KB', desc: 'Finger press' },
    { name: 'hand-tap', label: 'Tap', size: '14KB', desc: 'Quick tap' },
    {
      name: 'hand-point',
      label: 'Point',
      size: '4KB',
      desc: 'Pointing finger',
    },
    {
      name: 'hand-swipe-up',
      label: 'Swipe Up',
      size: '5KB',
      desc: 'White + arrow',
    },
    {
      name: 'hand-swipe-right',
      label: 'Swipe Right',
      size: '5KB',
      desc: 'Horizontal',
    },
    { name: 'hand-drag', label: 'Drag', size: '64KB', desc: 'Drag & drop' },
    { name: 'hand-pinch', label: 'Pinch', size: '106KB', desc: 'Zoom in/out' },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#00d9ff',
          fontSize: 32,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 600,
        }}
      >
        Scroll Animation Comparison - Frame {frame}
      </div>
      {/* Grid of animations */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 20,
          right: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
        }}
      >
        {scrollAnimations.map((anim, i) => (
          <div
            key={anim.name}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 20,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: i < 2 ? '3px solid #00ff88' : '2px solid #444',
            }}
          >
            {/* Label */}
            <div
              style={{
                color: i < 2 ? '#00ff88' : '#fff',
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {i < 2 ? '★ ' : ''}
              {anim.label}
            </div>
            <div style={{ color: '#888', fontSize: 14, marginBottom: 15 }}>
              {anim.size} • {anim.desc}
            </div>

            {/* Animation */}
            <div
              style={{
                width: 180,
                height: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a15',
                borderRadius: 12,
              }}
            >
              <LottieHand
                gesture="scroll"
                size={140}
                animationFile={anim.name}
              />
            </div>

            {/* Filename */}
            <div
              style={{
                color: '#666',
                fontSize: 12,
                marginTop: 10,
                fontFamily: 'monospace',
              }}
            >
              {anim.name}.json
            </div>
          </div>
        ))}
      </div>
      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#888',
          fontSize: 18,
        }}
      >
        ★ = Currently in use | Compare animations and pick your favorite
      </div>
    </AbsoluteFill>
  );
};

// Debug component to test FloatingHand in isolation
const DebugFloatingHand: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#00d9ff',
          fontSize: 28,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 600,
        }}
      >
        FloatingHand Debug - Frame {frame}
      </div>
      {/* LOTTIE HAND - Light (for dark backgrounds) */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 60,
          color: '#00ff88',
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        ★ Light Hand (for dark backgrounds)
      </div>
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 60,
          display: 'flex',
          gap: 40,
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <LottieHand gesture="pointer" size={120} />
          <div style={{ color: '#888', marginTop: 10 }}>dark=false</div>
        </div>
        <div
          style={{
            textAlign: 'center',
            background: '#fff',
            padding: 20,
            borderRadius: 10,
          }}
        >
          <LottieHand gesture="pointer" size={120} dark={true} />
          <div style={{ color: '#333', marginTop: 10 }}>dark=true</div>
        </div>
      </div>
      {/* Animated demo - Light */}
      <div
        style={{
          position: 'absolute',
          top: 380,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#00ff88',
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        ★ Animated Demo (Lottie + Physics)
      </div>
      <FloatingHand
        path={[
          { x: 150, y: 550, frame: 0, gesture: 'pointer' },
          { x: 400, y: 650, frame: 35, gesture: 'pointer' },
          { x: 650, y: 550, frame: 70, gesture: 'drag' },
          { x: 800, y: 750, frame: 105, gesture: 'drag' },
          { x: 550, y: 950, frame: 140, gesture: 'click', duration: 12 },
          { x: 300, y: 800, frame: 175, gesture: 'pointer' },
          { x: 150, y: 600, frame: 210, gesture: 'pointer' },
        ]}
        size={100}
        showRipple={false}
        physics={{
          floatAmplitude: 4,
          floatSpeed: 0.04,
          velocityScale: 0.4,
          maxRotation: 15,
          shadowEnabled: true,
          shadowDistance: 10,
          shadowBlur: 12,
          smoothing: 0.2,
        }}
      />
      {/* Animated demo - Dark (on light area) */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 60,
          right: 60,
          height: 400,
          background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
          borderRadius: 20,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#333',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Dark Hand on Light Background
        </div>
        <FloatingHand
          path={[
            { x: 200, y: 1550, frame: 0, gesture: 'pointer' },
            { x: 450, y: 1650, frame: 40, gesture: 'pointer' },
            { x: 700, y: 1550, frame: 80, gesture: 'drag' },
            { x: 850, y: 1700, frame: 120, gesture: 'click', duration: 15 },
            { x: 500, y: 1600, frame: 170, gesture: 'pointer' },
            { x: 200, y: 1550, frame: 220, gesture: 'pointer' },
          ]}
          size={90}
          dark={true}
          showRipple={false}
          physics={{
            floatAmplitude: 3,
            floatSpeed: 0.04,
            velocityScale: 0.4,
            maxRotation: 12,
            shadowEnabled: true,
            shadowDistance: 8,
            shadowBlur: 10,
            smoothing: 0.2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Interactive coordinate picker for mobile chat screenshot - FULL HEIGHT
const MobileChatCoordinatePicker: React.FC = () => {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [clickHistory, setClickHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);

  // Get Remotion's current scale (how much the preview is scaled in the Studio)
  const previewScale = useCurrentScale();

  // Phone viewport dimensions
  const phoneWidth = 390;
  const phoneHeight = 844;

  // Display at full height (1920px composition), width scales proportionally
  const displayHeight = 1820; // Leave room for top bar
  const displayWidth = (phoneWidth / phoneHeight) * displayHeight;
  const scale = displayHeight / phoneHeight;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Account for Remotion preview scale
    const clickX = (e.clientX - rect.left) / previewScale;
    const clickY = (e.clientY - rect.top) / previewScale;
    const realX = Math.round(clickX / scale);
    const realY = Math.round(clickY / scale);
    setCoords({ x: realX, y: realY });
    setClickHistory((prev) => [...prev, { x: realX, y: realY }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Account for Remotion preview scale
    const clickX = (e.clientX - rect.left) / previewScale;
    const clickY = (e.clientY - rect.top) / previewScale;
    const realX = Math.round(clickX / scale);
    const realY = Math.round(clickY / scale);
    setCoords({ x: realX, y: realY });
  };

  // Current button position
  const currentButtonX = 80;
  const currentButtonY = 795;

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#0a0a15',
        position: 'relative',
      }}
    >
      {/* Top info bar - compact */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 10,
          borderBottom: '2px solid #00d9ff',
        }}
      >
        {/* Coordinates display */}
        <div
          style={{
            background: coords
              ? 'rgba(0, 255, 0, 0.3)'
              : 'rgba(100,100,100,0.3)',
            border: '2px solid #00ff00',
            color: '#00ff00',
            padding: '10px 25px',
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 28,
            fontWeight: 'bold',
          }}
        >
          {coords ? `x: ${coords.x}, y: ${coords.y}` : 'Move mouse...'}
        </div>
        {/* Current position */}
        <div
          style={{ color: '#ff6666', fontFamily: 'monospace', fontSize: 16 }}
        >
          🔴 Current: x:{currentButtonX}y:{currentButtonY}
        </div>
        {/* Click history count */}
        <div
          style={{ color: '#ffff00', fontFamily: 'monospace', fontSize: 16 }}
        >
          Clicks: {clickHistory.length}{' '}
          {clickHistory.length > 0 &&
            `(last: ${clickHistory[clickHistory.length - 1].x}, ${clickHistory[clickHistory.length - 1].y})`}
        </div>
      </div>
      {/* Full-height image container */}
      <div
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{
          position: 'absolute',
          top: 90,
          left: (1080 - displayWidth) / 2,
          cursor: 'crosshair',
          width: displayWidth,
          height: displayHeight,
          overflow: 'hidden',
          border: '2px solid rgba(0, 217, 255, 0.5)',
        }}
      >
        <Img
          src={staticFile('mobile/mobile-chat-3-ready.png')}
          style={{
            width: displayWidth,
            height: displayHeight,
            display: 'block',
          }}
        />
        {/* Current button position marker (red) */}
        <div
          style={{
            position: 'absolute',
            left: currentButtonX * scale - 15,
            top: currentButtonY * scale - 15,
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 0, 0, 0.7)',
            border: '3px solid yellow',
            pointerEvents: 'none',
          }}
        />
        {/* Click markers - show all clicks as blue dots */}
        {clickHistory.map((click, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: click.x * scale - 15,
              top: click.y * scale - 15,
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 100, 255, 0.8)',
              border: '3px solid #00ffff',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 14,
              fontWeight: 'bold',
            }}
          >
            {i + 1}
          </div>
        ))}
        {/* Crosshair */}
        {coords && (
          <>
            <div
              style={{
                position: 'absolute',
                left: coords.x * scale,
                top: 0,
                width: 2,
                height: displayHeight,
                backgroundColor: 'rgba(0, 255, 0, 0.8)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: coords.y * scale,
                width: displayWidth,
                height: 2,
                backgroundColor: 'rgba(0, 255, 0, 0.8)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: coords.x * scale - 12,
                top: coords.y * scale - 12,
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '3px solid #00ff00',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      </div>
      {/* Click history panel at bottom */}
      {clickHistory.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            background: 'rgba(0,0,0,0.9)',
            border: '2px solid #00ffff',
            borderRadius: 8,
            padding: '10px 15px',
            fontFamily: 'monospace',
            fontSize: 18,
            color: '#00ffff',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 15,
          }}
        >
          <strong>Clicks:</strong>
          {clickHistory.map((c, i) => (
            <span key={i}>
              #{i + 1}: x:{c.x} y:{c.y}
            </span>
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Copy to clipboard
              const text = clickHistory
                .map((c, i) => `#${i + 1}: x:${c.x} y:${c.y}`)
                .join('\n');
              navigator.clipboard.writeText(text);
              alert('Copied to clipboard!\n\n' + text);
            }}
            style={{
              marginLeft: 'auto',
              padding: '8px 20px',
              background: '#00cc00',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            COPY
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setClickHistory([]);
            }}
            style={{
              padding: '8px 20px',
              background: '#ff4444',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            CLEAR
          </button>
        </div>
      )}
    </div>
  );
};

// V3 Coordinate Picker - accepts screenshot prop
const MobileChatCoordinatePickerV3: React.FC<{ screenshot: string }> = ({
  screenshot,
}) => {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [clickHistory, setClickHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);

  const previewScale = useCurrentScale();

  const phoneWidth = 390;
  const phoneHeight = 844;
  const displayHeight = 1820;
  const displayWidth = (phoneWidth / phoneHeight) * displayHeight;
  const scale = displayHeight / phoneHeight;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / previewScale;
    const clickY = (e.clientY - rect.top) / previewScale;
    const realX = Math.round(clickX / scale);
    const realY = Math.round(clickY / scale);
    setCoords({ x: realX, y: realY });
    setClickHistory((prev) => [...prev, { x: realX, y: realY }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / previewScale;
    const clickY = (e.clientY - rect.top) / previewScale;
    const realX = Math.round(clickX / scale);
    const realY = Math.round(clickY / scale);
    setCoords({ x: realX, y: realY });
  };

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#0a0a15',
        position: 'relative',
      }}
    >
      {/* Top info bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 10,
          borderBottom: '2px solid #00d9ff',
        }}
      >
        <div
          style={{
            background: coords
              ? 'rgba(0, 255, 0, 0.3)'
              : 'rgba(100,100,100,0.3)',
            border: '2px solid #00ff00',
            color: '#00ff00',
            padding: '10px 25px',
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 28,
            fontWeight: 'bold',
          }}
        >
          {coords ? `x: ${coords.x}, y: ${coords.y}` : 'Click to mark bubble'}
        </div>
        <div
          style={{ color: '#ffff00', fontFamily: 'monospace', fontSize: 20 }}
        >
          {screenshot}
        </div>
        <div
          style={{ color: '#ffff00', fontFamily: 'monospace', fontSize: 16 }}
        >
          Clicks: {clickHistory.length}
        </div>
      </div>
      {/* Image container */}
      <div
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{
          position: 'absolute',
          top: 90,
          left: (1080 - displayWidth) / 2,
          cursor: 'crosshair',
          width: displayWidth,
          height: displayHeight,
          overflow: 'hidden',
          border: '2px solid rgba(0, 217, 255, 0.5)',
        }}
      >
        <Img
          src={staticFile(`mobile/${screenshot}`)}
          style={{
            width: displayWidth,
            height: displayHeight,
            display: 'block',
          }}
        />
        {/* Click markers */}
        {clickHistory.map((click, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: click.x * scale - 20,
              top: click.y * scale - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              border: '3px solid #ffff00',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            {i + 1}
          </div>
        ))}
        {/* Crosshair */}
        {coords && (
          <>
            <div
              style={{
                position: 'absolute',
                left: coords.x * scale,
                top: 0,
                width: 2,
                height: displayHeight,
                backgroundColor: 'rgba(0, 255, 0, 0.8)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: coords.y * scale,
                width: displayWidth,
                height: 2,
                backgroundColor: 'rgba(0, 255, 0, 0.8)',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      </div>
      {/* Click history panel */}
      {clickHistory.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            background: 'rgba(0,0,0,0.9)',
            border: '2px solid #00ffff',
            borderRadius: 8,
            padding: '10px 15px',
            fontFamily: 'monospace',
            fontSize: 18,
            color: '#00ffff',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 15,
          }}
        >
          <strong>Marked:</strong>
          {clickHistory.map((c, i) => (
            <span key={i}>
              #{i + 1}: x:{c.x} y:{c.y}
            </span>
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setClickHistory([]);
            }}
            style={{
              marginLeft: 'auto',
              padding: '8px 20px',
              background: '#ff4444',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            CLEAR
          </button>
        </div>
      )}
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ========== DORIAN DEMO ========== */}
      <Composition
        id="DorianDemo"
        component={DorianDemo}
        durationInFrames={DORIAN_VIDEO.durationInFrames}
        fps={DORIAN_VIDEO.fps}
        width={DORIAN_VIDEO.width}
        height={DORIAN_VIDEO.height}
      />
      {/* Dorian Debug - Click to get coordinates */}
      <Still
        id="DorianDebug"
        component={DorianDebug}
        width={DORIAN_VIDEO.width}
        height={DORIAN_VIDEO.height}
      />
      {/* Dorian Debug - AI Bubble Tap Position */}

      {/* ★ Dorian Demo WITH Debug Overlay - USE THIS FOR DEBUGGING */}
      <Composition
        id="DorianDemo-DEBUG"
        component={DorianDemoWithDebug}
        durationInFrames={DORIAN_VIDEO.durationInFrames}
        fps={DORIAN_VIDEO.fps}
        width={DORIAN_VIDEO.width}
        height={DORIAN_VIDEO.height}
      />
      {/* ★★ Dorian INTERACTIVE Debug - CLICK TO MARK POSITIONS */}
      <Composition
        id="DorianDemo-INTERACTIVE"
        component={DorianDebugInteractive}
        durationInFrames={DORIAN_VIDEO.durationInFrames}
        fps={DORIAN_VIDEO.fps}
        width={DORIAN_VIDEO.width}
        height={DORIAN_VIDEO.height}
      />
      {/* ========== LIMOR DEMOS ========== */}
      {/* Main Mobile Demo V2 - First Question (Revenue) */}
      <Composition
        id="MobileChatDemoV2"
        component={MobileChatDemoRefactored}
        durationInFrames={320}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Mobile Demo V3 - Second Question (Worker Hours) */}
      <Composition
        id="MobileChatDemoV3"
        component={MobileChatDemoV3}
        durationInFrames={335}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Mobile Demo V4 - With Lottie Hand Gestures */}
      <Composition
        id="MobileChatDemoV4"
        component={MobileChatDemoV4}
        durationInFrames={335}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* ★★ MobileChatDemoV4 INTERACTIVE Debug - CLICK TO MARK POSITIONS */}
      <Composition
        id="MobileChatDemoV4-INTERACTIVE"
        component={MobileChatDemoV4DebugInteractive}
        durationInFrames={335}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* ★★★ Mobile Demo COMBINED - V2 + V4 (Two Questions) */}
      <Composition
        id="MobileChatDemoCombined"
        component={MobileChatDemoCombined}
        durationInFrames={COMBINED_VIDEO.durationInFrames}
        fps={COMBINED_VIDEO.fps}
        width={COMBINED_VIDEO.width}
        height={COMBINED_VIDEO.height}
      />
      {/* ★★★ Combined INTERACTIVE Debug */}
      <Composition
        id="MobileChatDemoCombined-INTERACTIVE"
        component={MobileChatDemoCombinedDebugInteractive}
        durationInFrames={COMBINED_VIDEO.durationInFrames}
        fps={COMBINED_VIDEO.fps}
        width={COMBINED_VIDEO.width}
        height={COMBINED_VIDEO.height}
      />
      {/* Dashmor Demo - Labor Cost V3 Dashboard Scroll */}
      <Composition
        id="DashmorDemo"
        component={DashmorDemo}
        durationInFrames={DASHMOR_VIDEO.durationInFrames}
        fps={DASHMOR_VIDEO.fps}
        width={DASHMOR_VIDEO.width}
        height={DASHMOR_VIDEO.height}
      />
      {/* Dashmor Debug - Interactive scroll position picker */}
      {/* Interactive Coordinate Picker - click to find button position */}
      {/* Debug Coordinate Picker for V3 - User Message screenshot */}
      {/* Debug Coordinate Picker for V3 - Thinking screenshot */}
      {/* Debug Coordinate Picker for V3 - Response screenshot */}
      {/* Debug FloatingHand - Test all hand styles and gestures */}
      {/* Debug Scroll Animations - Compare all scroll/swipe variations */}
      {/* SceneDirector v2 is now a standalone app: npm run scene-director */}
    </>
  );
};
