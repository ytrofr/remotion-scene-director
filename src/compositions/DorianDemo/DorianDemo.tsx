import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
} from 'remotion';
import { COLORS, SCENES } from './constants';
import {
  DorianPhoneMockup as DorianPhoneMockupNew,
  DorianPhoneStatic as DorianPhoneStaticNew,
} from './DorianPhoneMockup';
import {
  IntroScene,
  HomeScrollScene,
  TapAIBubbleScene,
  ChatOpenScene,
  UserTypingScene,
  AIThinkingScene,
  AIResponseScene,
  ProductPageScene,
  ProductDetailScene,
  OutroScene,
} from './scenes';
import { getCodedAudio } from '../SceneDirector/layers';
import {
  getSavedSecondaryLayers,
  getCodedPath,
} from '../SceneDirector/codedPaths';
import { GESTURE_PRESETS } from '../SceneDirector/gestures';
import { FloatingHand } from '../../components/FloatingHand';
import { DEFAULT_PHYSICS } from '../../components/FloatingHand/types';

// ============ CENTRALIZED AUDIO ============
// All audio is driven from the coded audio registry (layers.ts).
// Scene components no longer contain inline <Audio> — this is the single source of truth.

const SCENE_ENTRIES = [
  {
    name: '1-Intro',
    start: SCENES.intro.start,
    duration: SCENES.intro.duration,
  },
  {
    name: '2-HomeScroll',
    start: SCENES.homeScroll.start,
    duration: SCENES.homeScroll.duration,
  },
  {
    name: '3-TapBubble',
    start: SCENES.tapBubble.start,
    duration: SCENES.tapBubble.duration,
  },
  {
    name: '4-ChatOpen',
    start: SCENES.chatOpen.start,
    duration: SCENES.chatOpen.duration,
  },
  {
    name: '5-UserTyping',
    start: SCENES.userTyping.start,
    duration: SCENES.userTyping.duration,
  },
  {
    name: '6-AIThinking',
    start: SCENES.aiThinking.start,
    duration: SCENES.aiThinking.duration,
  },
  {
    name: '7-AIResponse',
    start: SCENES.aiResponse.start,
    duration: SCENES.aiResponse.duration,
  },
  {
    name: '8-ProductPage',
    start: SCENES.productPage.start,
    duration: SCENES.productPage.duration,
  },
  {
    name: '9-ProductDetail',
    start: SCENES.productDetail.start,
    duration: SCENES.productDetail.duration,
  },
  {
    name: '10-Outro',
    start: SCENES.outro.start,
    duration: SCENES.outro.duration,
  },
];

const DorianAudio: React.FC = () => {
  // In SceneDirector, audio is injected via withAudioLayers() HOC — skip to avoid double playback
  const isSceneDirector =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('scene-director');
  if (isSceneDirector) return null;

  const audioElements: React.ReactElement[] = [];
  for (const scene of SCENE_ENTRIES) {
    const entries = getCodedAudio('DorianDemo', scene.name);
    for (const entry of entries) {
      const globalFrom = scene.start + entry.startFrame;
      audioElements.push(
        <Sequence
          key={`${scene.name}-${entry.file}-${entry.startFrame}`}
          from={globalFrom}
          durationInFrames={entry.durationInFrames}
        >
          <Audio src={staticFile(entry.file)} volume={entry.volume} />
        </Sequence>,
      );
    }
  }
  return <>{audioElements}</>;
};

// ============ CENTRALIZED SECONDARY HANDS ============
// Renders secondary hand layers (user-added gestures beyond the primary)
// from the coded paths registry. Same skip-in-SceneDirector pattern as DorianAudio.

const DorianSecondaryHands: React.FC = () => {
  const isSceneDirector =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('scene-director');
  if (isSceneDirector) return null;

  const elements: React.ReactElement[] = [];
  for (const scene of SCENE_ENTRIES) {
    const layers = getSavedSecondaryLayers('DorianDemo', scene.name);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const preset = GESTURE_PRESETS[layer.gesture] || GESTURE_PRESETS.click;
      const codedPath = getCodedPath('DorianDemo', scene.name);
      const dark = codedPath?.dark ?? true;
      elements.push(
        <Sequence
          key={`${scene.name}-hand-${i}`}
          from={scene.start}
          durationInFrames={scene.duration}
        >
          <FloatingHand
            path={layer.path}
            startFrame={0}
            animation={preset.animation}
            size={preset.size}
            showRipple={preset.showRipple}
            dark={dark}
            physics={{ ...DEFAULT_PHYSICS, ...preset.physics }}
          />
        </Sequence>,
      );
    }
  }
  return <>{elements}</>;
};

// ============ MAIN COMPOSITION ============

export const DorianDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.white }}>
      {/* Audio layer — single source of truth */}
      <DorianAudio />
      {/* Secondary hand layers from SceneDirector */}
      <DorianSecondaryHands />

      <Sequence
        from={SCENES.intro.start}
        durationInFrames={SCENES.intro.duration}
        name="1-Intro"
      >
        <IntroScene />
      </Sequence>

      <Sequence
        from={SCENES.homeScroll.start}
        durationInFrames={SCENES.homeScroll.duration}
        name="2-HomeScroll"
      >
        <HomeScrollScene />
      </Sequence>

      <Sequence
        from={SCENES.tapBubble.start}
        durationInFrames={SCENES.tapBubble.duration}
        name="3-TapBubble"
      >
        <TapAIBubbleScene />
      </Sequence>

      <Sequence
        from={SCENES.chatOpen.start}
        durationInFrames={SCENES.chatOpen.duration}
        name="4-ChatOpen"
      >
        <ChatOpenScene />
      </Sequence>

      <Sequence
        from={SCENES.userTyping.start}
        durationInFrames={SCENES.userTyping.duration}
        name="5-UserTyping"
      >
        <UserTypingScene />
      </Sequence>

      <Sequence
        from={SCENES.aiThinking.start}
        durationInFrames={SCENES.aiThinking.duration}
        name="6-AIThinking"
      >
        <AIThinkingScene />
      </Sequence>

      <Sequence
        from={SCENES.aiResponse.start}
        durationInFrames={SCENES.aiResponse.duration}
        name="7-AIResponse"
      >
        <AIResponseScene />
      </Sequence>

      <Sequence
        from={SCENES.productPage.start}
        durationInFrames={SCENES.productPage.duration}
        name="8-ProductPage"
      >
        <ProductPageScene />
      </Sequence>

      <Sequence
        from={SCENES.productDetail.start}
        durationInFrames={SCENES.productDetail.duration}
        name="9-ProductDetail"
      >
        <ProductDetailScene />
      </Sequence>

      <Sequence
        from={SCENES.outro.start}
        durationInFrames={SCENES.outro.duration}
        name="10-Outro"
      >
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

// ============ SCENE INFO FOR DEBUG ============

export const DORIAN_SCENE_INFO = [
  {
    name: '1-Intro',
    start: SCENES.intro.start,
    end: SCENES.intro.start + SCENES.intro.duration,
    hand: 'none',
    gesture: '-',
  },
  {
    name: '2-HomeScroll',
    start: SCENES.homeScroll.start,
    end: SCENES.homeScroll.start + SCENES.homeScroll.duration,
    hand: 'hand-scroll-clean',
    gesture: 'drag (scroll)',
  },
  {
    name: '3-TapBubble',
    start: SCENES.tapBubble.start,
    end: SCENES.tapBubble.start + SCENES.tapBubble.duration,
    hand: 'hand-click',
    gesture: 'pointer → click',
  },
  {
    name: '4-ChatOpen',
    start: SCENES.chatOpen.start,
    end: SCENES.chatOpen.start + SCENES.chatOpen.duration,
    hand: 'hand-click',
    gesture: 'pointer → click (input box) → hide',
  },
  {
    name: '5-UserTyping',
    start: SCENES.userTyping.start,
    end: SCENES.userTyping.start + SCENES.userTyping.duration,
    hand: 'hand-click',
    gesture: 'pointer → click (send btn)',
  },
  {
    name: '6-AIThinking',
    start: SCENES.aiThinking.start,
    end: SCENES.aiThinking.start + SCENES.aiThinking.duration,
    hand: 'none',
    gesture: 'thinking dots',
  },
  {
    name: '7-AIResponse',
    start: SCENES.aiResponse.start,
    end: SCENES.aiResponse.start + SCENES.aiResponse.duration,
    hand: 'hand-click',
    gesture: 'pointer → click (View Products)',
  },
  {
    name: '8-ProductPage',
    start: SCENES.productPage.start,
    end: SCENES.productPage.start + SCENES.productPage.duration,
    hand: 'hand-scroll-clean',
    gesture: 'drag (scroll listing)',
  },
  {
    name: '9-ProductDetail',
    start: SCENES.productDetail.start,
    end: SCENES.productDetail.start + SCENES.productDetail.duration,
    hand: 'none',
    gesture: 'crossfade',
  },
  {
    name: '10-Outro',
    start: SCENES.outro.start,
    end: SCENES.outro.start + SCENES.outro.duration,
    hand: 'none',
    gesture: '-',
  },
];
const SCENE_INFO = DORIAN_SCENE_INFO;

// ============ DEBUG COMPOSITION ============

export const DorianDebug: React.FC = () => {
  const [coords, setCoords] = React.useState<{ x: number; y: number }[]>([]);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = React.useState(300);
  const [showFullImage, setShowFullImage] = React.useState(false);

  const scale = 1.8;

  // Phone dimensions at scale 1.8
  // Phone frame: 414x868, screen: 390x844
  // Centered at (540, 960) in 1080x1920 composition
  const phoneFrameWidth = 414 * scale; // 745.2
  const phoneFrameHeight = 868 * scale; // 1562.4
  const phoneLeft = 540 - phoneFrameWidth / 2; // 167.4
  const phoneTop = 960 - phoneFrameHeight / 2; // 178.8
  const screenPadding = 12 * scale; // 21.6
  const screenLeft = phoneLeft + screenPadding; // 189
  const screenTop = phoneTop + screenPadding; // 200.4

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
        console.log(
          `Clicked: (${x}, ${y}) | Phone coords: (${Math.round((x - screenLeft) / scale)}, ${Math.round((y - screenTop) / scale)})`,
        );
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
      <div
        style={{
          position: 'absolute',
          left: mousePos.x,
          top: 0,
          bottom: 0,
          width: 1,
          background: 'rgba(0,255,255,0.5)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: mousePos.y,
          left: 0,
          right: 0,
          height: 1,
          background: 'rgba(0,255,255,0.5)',
          pointerEvents: 'none',
        }}
      />

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
        <div
          style={{
            marginBottom: 15,
            color: '#0ff',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          DORIAN DEBUG
        </div>

        {/* Mouse Position */}
        <div style={{ marginBottom: 10 }}>
          <span style={{ color: '#888' }}>Mouse:</span> ({mousePos.x},{' '}
          {mousePos.y})
        </div>
        <div style={{ marginBottom: 15, fontSize: 12, color: '#666' }}>
          Phone: ({Math.round((mousePos.x - screenLeft) / scale)},{' '}
          {Math.round((mousePos.y - screenTop) / scale)})
        </div>

        {/* Scroll Control */}
        <div style={{ marginBottom: 15 }}>
          <div style={{ color: '#0f0', marginBottom: 8 }}>
            Scroll Offset: {scrollOffset}px
          </div>
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
            {[0, 100, 200, 300, 400, 500].map((val) => (
              <button
                key={val}
                onClick={(e) => {
                  e.stopPropagation();
                  setScrollOffset(val);
                }}
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
            onClick={(e) => {
              e.stopPropagation();
              setShowFullImage(!showFullImage);
            }}
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
            {showFullImage
              ? 'Using: home-mobile-full.png'
              : 'Using: home-mobile.png'}
          </button>
        </div>

        {/* AI Bubble Info */}
        <div
          style={{
            background: '#0a0a0a',
            padding: 10,
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          <div style={{ color: '#0f0', marginBottom: 5 }}>
            AI Bubble Position:
          </div>
          <div>
            Composition: ({Math.round(bubbleCompX)}, {Math.round(bubbleCompY)})
          </div>
          <div style={{ color: '#888', fontSize: 12 }}>
            Phone: ({bubblePhoneX}, {bubblePhoneY})
          </div>
        </div>

        {/* Clicked Points */}
        <div style={{ color: '#f00', marginBottom: 5 }}>Clicked Points:</div>
        {coords.length === 0 && (
          <div style={{ color: '#666' }}>Click to record...</div>
        )}
        {coords.map((c, i) => (
          <div key={i} style={{ fontSize: 12 }}>
            #{i + 1}: ({c.x}, {c.y}) → Phone: (
            {Math.round((c.x - screenLeft) / scale)},{' '}
            {Math.round((c.y - screenTop) / scale)})
          </div>
        ))}
        {coords.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(JSON.stringify(coords));
              }}
              style={{
                padding: '6px 12px',
                background: '#0f0',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              COPY
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCoords([]);
              }}
              style={{
                padding: '6px 12px',
                background: '#f00',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
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
        Click anywhere to record coordinates - Use slider to preview scroll -
        Green circle = AI bubble target
      </div>
    </AbsoluteFill>
  );
};

// ============ DEBUG: TAP AI BUBBLE ============

export const DorianDebugTapBubble: React.FC = () => {
  const [coords, setCoords] = React.useState<{ x: number; y: number }[]>([]);
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
      <div
        style={{
          position: 'absolute',
          left: mousePos.x,
          top: 0,
          bottom: 0,
          width: 1,
          background: 'rgba(255,0,0,0.7)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: mousePos.y,
          left: 0,
          right: 0,
          height: 1,
          background: 'rgba(255,0,0,0.7)',
          pointerEvents: 'none',
        }}
      />

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
        <div
          style={{
            marginBottom: 15,
            color: '#f00',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          DEBUG: AI BUBBLE TAP
        </div>

        <div style={{ marginBottom: 10 }}>
          <span style={{ color: '#888' }}>Mouse:</span>{' '}
          <span style={{ color: '#ff0' }}>
            ({mousePos.x}, {mousePos.y})
          </span>
        </div>

        <div
          style={{
            marginBottom: 15,
            padding: 10,
            background: '#0a0a0a',
            borderRadius: 6,
          }}
        >
          <div style={{ color: '#0f0', marginBottom: 5 }}>
            Current baseBubbleX/Y:
          </div>
          <div>
            X: {currentBubbleX}, Y: {currentBubbleY}
          </div>
        </div>

        <div style={{ color: '#f00', marginBottom: 5 }}>Clicked Points:</div>
        {coords.length === 0 && (
          <div style={{ color: '#666' }}>Click on the AI bubble...</div>
        )}
        {coords.slice(-5).map((c, i) => (
          <div key={i} style={{ fontSize: 12, color: '#ff0' }}>
            #{coords.length - 4 + i}:{' '}
            <strong>
              ({c.x}, {c.y})
            </strong>
          </div>
        ))}
        {coords.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const last = coords[coords.length - 1];
                navigator.clipboard.writeText(
                  `baseBubbleX = ${last.x};\nbaseBubbleY = ${last.y};`,
                );
              }}
              style={{
                padding: '6px 12px',
                background: '#0f0',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              COPY LAST
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCoords([]);
              }}
              style={{
                padding: '6px 12px',
                background: '#f00',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
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
        Click on the AI bubble (teal circle) - Green dashed = current target -
        Red = your clicks
      </div>
    </AbsoluteFill>
  );
};

// ============ DEBUG OVERLAY COMPONENT ============

const DebugOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Find current scene
  const currentScene =
    SCENE_INFO.find((s) => frame >= s.start && frame < s.end) || SCENE_INFO[0];
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
            borderBottom: '1px solid #333',
            paddingBottom: 8,
          }}
        >
          <span style={{ color: '#00ff00', fontSize: 18, fontWeight: 'bold' }}>
            {timeStr}
          </span>
          <span style={{ color: '#ff0' }}>
            Frame {frame} / {durationInFrames}
          </span>
        </div>

        {/* Current Scene */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#888' }}>Scene: </span>
          <span style={{ color: '#00d9ff', fontWeight: 'bold', fontSize: 16 }}>
            {currentScene.name}
          </span>
        </div>

        {/* Scene Progress Bar */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ color: '#888', fontSize: 11 }}>
              Scene Frame: {frameInScene}/{sceneDuration}
            </span>
            <span style={{ color: '#888', fontSize: 11 }}>
              {sceneProgress}%
            </span>
          </div>
          <div style={{ height: 6, background: '#333', borderRadius: 3 }}>
            <div
              style={{
                height: '100%',
                width: `${sceneProgress}%`,
                background: '#00d9ff',
                borderRadius: 3,
              }}
            />
          </div>
        </div>

        {/* Hand Info */}
        <div
          style={{
            background: '#111',
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          <div style={{ color: '#f80', marginBottom: 4, fontWeight: 'bold' }}>
            HAND
          </div>
          <div>
            <span style={{ color: '#888' }}>Animation: </span>
            <span style={{ color: '#fff' }}>{currentScene.hand}</span>
          </div>
          <div>
            <span style={{ color: '#888' }}>Gesture: </span>
            <span style={{ color: '#0f0' }}>{currentScene.gesture}</span>
          </div>
        </div>

        {/* Total Progress */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ color: '#888', fontSize: 11 }}>Total Progress</span>
            <span style={{ color: '#888', fontSize: 11 }}>
              {totalProgress}%
            </span>
          </div>
          <div style={{ height: 4, background: '#333', borderRadius: 2 }}>
            <div
              style={{
                height: '100%',
                width: `${totalProgress}%`,
                background: '#00ff00',
                borderRadius: 2,
              }}
            />
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
                  background: isActive
                    ? '#00d9ff'
                    : isPast
                      ? '#2a5a6a'
                      : '#333',
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
              {isActive ? '>' : 'o'} {scene.name}: {scene.start}-{scene.end}{' '}
              {scene.hand !== 'none' ? `[${scene.hand}]` : ''}
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
  const [markers, setMarkers] = React.useState<
    Array<{ x: number; y: number; frame: number; label: string }>
  >([]);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  // Find current scene
  const currentScene =
    SCENE_INFO.find((s) => frame >= s.start && frame < s.end) || SCENE_INFO[0];
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
    console.log(
      `MARKER ${label}: (${x}, ${y}) @ frame ${frame} [${timeStr}] - ${currentScene.name}`,
    );
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
    const output = markers
      .map((m) => `{ x: ${m.x}, y: ${m.y}, frame: ${m.frame} }, // ${m.label}`)
      .join('\n');
    navigator.clipboard.writeText(output);
    alert('Markers copied to clipboard!\n\n' + output);
  };

  // Current hand path points for Scene 3 (TapBubble) - ALL MARKERS FOR DEBUGGING
  const scene3Start = SCENES.tapBubble.start; // 225
  const predefinedPoints = [
    {
      x: 780,
      y: 1200,
      frame: scene3Start + 0,
      label: 'H1-Start',
      color: '#0f0',
      desc: 'Hand start @ 225',
    },
    {
      x: 800,
      y: 1400,
      frame: scene3Start + 30,
      label: 'H2-Move',
      color: '#0f0',
      desc: 'Moving down @ 255',
    },
    {
      x: 818,
      y: 1546,
      frame: scene3Start + 53,
      label: 'H3-Bubble',
      color: '#ff0',
      desc: 'At bubble @ 278 (ZOOM IN)',
    },
    {
      x: 518,
      y: 992,
      frame: scene3Start + 73,
      label: 'CLICK',
      color: '#f00',
      desc: 'CLICK @ 298 (zoomed pos)',
    },
  ];

  // Scene 2 scroll hand end position
  const scene2Points = [
    {
      x: 780,
      y: 960,
      frame: SCENES.homeScroll.start + 150,
      label: 'S2-End',
      color: '#00f',
      desc: 'Scene 2 scroll hand end',
    },
  ];

  // Scene 4 hand path: zoom-out -> move to input -> tap -> hide
  const scene4Start = SCENES.chatOpen.start; // 300
  const scene4Points = [
    {
      x: 518,
      y: 992,
      frame: scene4Start + 0,
      label: 'S4-Start',
      color: '#0ff',
      desc: 'Start (from S3 zoom click pos) @ 300',
    },
    {
      x: 500,
      y: 1200,
      frame: scene4Start + 20,
      label: 'S4-Move',
      color: '#0ff',
      desc: 'Moving down @ 320',
    },
    {
      x: 480,
      y: 1520,
      frame: scene4Start + 45,
      label: 'S4-Near',
      color: '#0ff',
      desc: 'Near input box @ 345',
    },
    {
      x: 480,
      y: 1550,
      frame: scene4Start + 48,
      label: 'S4-TAP',
      color: '#f80',
      desc: 'TAP input box @ 348',
    },
    {
      x: 480,
      y: 1550,
      frame: scene4Start + 53,
      label: 'S4-Hide',
      color: '#f00',
      desc: 'Hand hides @ 353',
    },
  ];

  // Scene 5 hand path: reappear -> move to send -> tap
  const scene5Start = SCENES.userTyping.start; // 390
  const scene5Points = [
    {
      x: 750,
      y: 1520,
      frame: scene5Start + 70,
      label: 'S5-Show',
      color: '#a0f',
      desc: 'Hand reappears @ 460',
    },
    {
      x: 730,
      y: 1500,
      frame: scene5Start + 85,
      label: 'S5-Move',
      color: '#a0f',
      desc: 'Moving to send @ 475',
    },
    {
      x: 720,
      y: 1490,
      frame: scene5Start + 100,
      label: 'S5-Near',
      color: '#a0f',
      desc: 'Near send btn @ 490',
    },
    {
      x: 720,
      y: 1490,
      frame: scene5Start + 105,
      label: 'S5-SEND',
      color: '#f00',
      desc: 'TAP send @ 495',
    },
  ];

  // Scene 7 hand path: tap "View Products" button
  const scene7Start = SCENES.aiResponse.start; // 600
  const scene7Points = [
    {
      x: 540,
      y: 1600,
      frame: scene7Start + 70,
      label: 'S7-Show',
      color: '#0f8',
      desc: 'Hand appears @ 670',
    },
    {
      x: 540,
      y: 1480,
      frame: scene7Start + 85,
      label: 'S7-Move',
      color: '#0f8',
      desc: 'Moving to button @ 685',
    },
    {
      x: 540,
      y: 1450,
      frame: scene7Start + 95,
      label: 'S7-TAP',
      color: '#f00',
      desc: 'TAP View Products @ 695',
    },
  ];

  // Scene 8 hand path: scroll listing
  const scene8Start = SCENES.productPage.start; // 720
  const scene8Points = [
    {
      x: 780,
      y: 960,
      frame: scene8Start + 45,
      label: 'S8-Scroll',
      color: '#ff0',
      desc: 'Scroll hand @ 765',
    },
    {
      x: 780,
      y: 960,
      frame: scene8Start + 128,
      label: 'S8-End',
      color: '#ff0',
      desc: 'Scroll end @ 848',
    },
  ];

  const allPredefined = [
    ...scene2Points,
    ...predefinedPoints,
    ...scene4Points,
    ...scene5Points,
    ...scene7Points,
    ...scene8Points,
  ];

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
                border: isActive
                  ? '4px solid #fff'
                  : '2px solid rgba(255,255,255,0.5)',
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
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9989,
        }}
      >
        {/* Scene 3 path (green) */}
        {predefinedPoints.slice(0, -1).map((p, i) => {
          const next = predefinedPoints[i + 1];
          return (
            <line
              key={`s3-${i}`}
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
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
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
              stroke={
                next.label.includes('TAP') || next.label.includes('Hide')
                  ? '#f80'
                  : '#0ff'
              }
              strokeWidth={2}
              strokeDasharray={next.label.includes('TAP') ? 'none' : '5,5'}
              opacity={0.5}
            />
          );
        })}
        {/* Scene 3 -> Scene 4 transition (dashed white) */}
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
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
              stroke={next.label.includes('SEND') ? '#f00' : '#a0f'}
              strokeWidth={2}
              strokeDasharray={next.label.includes('SEND') ? 'none' : '5,5'}
              opacity={0.5}
            />
          );
        })}
        {/* Scene 7 path (green) */}
        {scene7Points.slice(0, -1).map((p, i) => {
          const next = scene7Points[i + 1];
          return (
            <line
              key={`s7-${i}`}
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
              stroke={next.label.includes('TAP') ? '#f00' : '#0f8'}
              strokeWidth={2}
              strokeDasharray={next.label.includes('TAP') ? 'none' : '5,5'}
              opacity={0.5}
            />
          );
        })}
      </svg>

      {/* Crosshairs */}
      <div
        style={{
          position: 'absolute',
          left: mousePos.x,
          top: 0,
          bottom: 0,
          width: 1,
          background: 'rgba(255,0,0,0.5)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: mousePos.y,
          left: 0,
          right: 0,
          height: 1,
          background: 'rgba(255,0,0,0.5)',
          pointerEvents: 'none',
        }}
      />

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 10,
            borderBottom: '1px solid #333',
            paddingBottom: 8,
          }}
        >
          <span style={{ color: '#00ff00', fontSize: 20, fontWeight: 'bold' }}>
            {timeStr}
          </span>
          <span style={{ color: '#ff0' }}>Frame {frame}</span>
        </div>

        {/* Scene */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#888' }}>Scene: </span>
          <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>
            {currentScene.name}
          </span>
          <span style={{ color: '#666' }}> (frame {frameInScene})</span>
        </div>

        {/* Mouse Position */}
        <div
          style={{
            marginBottom: 8,
            padding: 8,
            background: '#111',
            borderRadius: 6,
          }}
        >
          <div style={{ color: '#f00', marginBottom: 4 }}>MOUSE POSITION</div>
          <div style={{ fontSize: 16, color: '#ff0' }}>
            x: {mousePos.x}, y: {mousePos.y}
          </div>
        </div>

        {/* Hand Info */}
        <div
          style={{
            marginBottom: 8,
            padding: 8,
            background: '#111',
            borderRadius: 6,
          }}
        >
          <div style={{ color: '#f80', marginBottom: 4 }}>HAND</div>
          <div>
            <span style={{ color: '#888' }}>Animation: </span>
            {currentScene.hand}
          </div>
          <div>
            <span style={{ color: '#888' }}>Gesture: </span>
            <span style={{ color: '#0f0' }}>{currentScene.gesture}</span>
          </div>
        </div>

        {/* Markers */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: '#f0f', marginBottom: 4 }}>
            MARKERS ({markers.length})
          </div>
          <div style={{ maxHeight: 100, overflowY: 'auto', fontSize: 11 }}>
            {markers.length === 0 && (
              <div style={{ color: '#666' }}>
                Click on video to add markers...
              </div>
            )}
            {markers.slice(-5).map((m, i) => (
              <div
                key={i}
                style={{ color: frame === m.frame ? '#ff0' : '#888' }}
              >
                {m.label}: ({m.x}, {m.y}) @{m.frame}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={exportMarkers}
            style={{
              flex: 1,
              padding: '8px',
              background: '#0a0',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            COPY ALL
          </button>
          <button
            onClick={() => setMarkers([])}
            style={{
              flex: 1,
              padding: '8px',
              background: '#a00',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            CLEAR
          </button>
        </div>

        {/* Instructions */}
        <div
          style={{
            marginTop: 10,
            fontSize: 10,
            color: '#666',
            borderTop: '1px solid #333',
            paddingTop: 8,
          }}
        >
          Click anywhere to mark - Markers persist across frames
          <br />
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
            const progress = isActive
              ? ((frame - scene.start) / (scene.end - scene.start)) * 100
              : 0;
            return (
              <div
                key={i}
                style={{
                  width: `${width}%`,
                  height: '100%',
                  background: isActive
                    ? '#00d9ff'
                    : isPast
                      ? '#2a5a6a'
                      : '#333',
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
                {scene.hand !== 'none' && (
                  <span style={{ marginLeft: 4 }}>H</span>
                )}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${progress}%`,
                      background: 'rgba(0,255,0,0.3)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
