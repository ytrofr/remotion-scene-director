import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';

// Scene components
import {
  IntroScene,
  ChatWithResponseScene,
  TypingScene,
  SendScene,
  UserMessageScene,
  ThinkingScene,
  ResponseScene,
  OutroScene,
} from './MobileChatDemoV4/scenes';

// Audio
import { AudioLayer } from '../audio/AudioLayer';

// Constants
import { COLORS, TRANSITIONS, TIMINGS, TOTAL_FRAMES } from './MobileChatDemoV4/constants';

// Scene info for debug overlay (accounting for 15-frame fade transition after intro)
const SCENE_INFO = [
  { name: '1-Intro', start: 0, end: 35, hand: 'none', gesture: 'none' },
  { name: '2-ChatWithResponse', start: 20, end: 65, hand: 'none', gesture: 'none' },
  { name: '3-Typing', start: 65, end: 150, hand: 'hand-click', gesture: 'click @ frame 5' },
  { name: '4-Send', start: 150, end: 180, hand: 'hand-click', gesture: 'click @ frame 13' },
  { name: '5-UserMessage', start: 180, end: 210, hand: 'none', gesture: 'none' },
  { name: '6-Thinking', start: 210, end: 255, hand: 'none', gesture: 'none' },
  { name: '7-Response', start: 255, end: 315, hand: 'none', gesture: 'none' },
  { name: '8-Outro', start: 300, end: 335, hand: 'none', gesture: 'none' },
];

/**
 * MobileChatDemoV4 - Video with Lottie Hand Gestures
 *
 * Same as V3 but uses professional Lottie hand-click animation
 * instead of the simple finger indicator.
 *
 * Duration: ~11 seconds @ 30fps = 335 frames
 * Output: 1080x1920 (9:16 vertical)
 *
 * Scene Breakdown:
 * 1. Intro (35 frames)              - Phone slides in with first Q&A
 * 2. ChatWithResponse (45 frames)   - Shows existing conversation
 * 3. Typing (85 frames)             - Letter-by-letter with hand tap
 * 4. Send (30 frames)               - Pan to send, hand tap send
 * 5. UserMessage (30 frames)        - Second question appears
 * 6. Thinking (45 frames)           - AI thinking with dots
 * 7. Response (60 frames)           - AI response slides up
 * 8. Outro (35 frames)              - CTA overlay
 */
export const MobileChatDemoV4: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Global vertical offset - shift everything down 120px */}
      <div style={{ transform: 'translateY(120px)', width: '100%', height: '100%' }}>
        <TransitionSeries>
          {/* Scene 1: Intro - Phone slides in */}
          <TransitionSeries.Sequence
            name="1-Intro"
            durationInFrames={TIMINGS.intro.duration}
            premountFor={10}
          >
            <IntroScene />
          </TransitionSeries.Sequence>

          {/* Fade transition */}
          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: TRANSITIONS.fadeIntro })}
          />

          {/* Scene 2: ChatWithResponse - Shows first Q&A */}
          <TransitionSeries.Sequence
            name="2-ChatWithResponse"
            durationInFrames={TIMINGS.chatWithResponse.duration}
            premountFor={15}
          >
            <ChatWithResponseScene />
          </TransitionSeries.Sequence>

          {/* Scene 3: Typing - Letter by letter with hand gesture */}
          <TransitionSeries.Sequence
            name="3-Typing"
            durationInFrames={TIMINGS.typing.duration}
            premountFor={10}
          >
            <TypingScene />
          </TransitionSeries.Sequence>

          {/* Scene 4: Send - Pan to send, hand tap send */}
          <TransitionSeries.Sequence
            name="4-Send"
            durationInFrames={TIMINGS.send.duration}
            premountFor={10}
          >
            <SendScene />
          </TransitionSeries.Sequence>

          {/* Scene 5: UserMessage - Second question appears */}
          <TransitionSeries.Sequence
            name="5-UserMessage"
            durationInFrames={TIMINGS.userMessage.duration}
            premountFor={10}
          >
            <UserMessageScene />
          </TransitionSeries.Sequence>

          {/* Scene 6: Thinking - AI thinking with dots */}
          <TransitionSeries.Sequence
            name="6-Thinking"
            durationInFrames={TIMINGS.thinking.duration}
            premountFor={10}
          >
            <ThinkingScene />
          </TransitionSeries.Sequence>

          {/* Scene 7: Response - AI response slides up */}
          <TransitionSeries.Sequence
            name="7-Response"
            durationInFrames={TIMINGS.response.duration}
            premountFor={10}
          >
            <ResponseScene />
          </TransitionSeries.Sequence>

          {/* Slide transition to outro */}
          <TransitionSeries.Transition
            presentation={slide({ direction: 'from-top' })}
            timing={springTiming({
              config: { damping: 20, stiffness: 100 },
              durationInFrames: TRANSITIONS.slideOutro,
            })}
          />

          {/* Scene 8: Outro - CTA */}
          <TransitionSeries.Sequence
            name="8-Outro"
            durationInFrames={TIMINGS.outro.duration}
            premountFor={10}
          >
            <OutroScene />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </div>

      {/* Audio layer - typing sound enabled */}
      <AudioLayer enabled={true} />
    </AbsoluteFill>
  );
};

export default MobileChatDemoV4;

// ============ INTERACTIVE DEBUG WITH CLICK-TO-MARK ============

export const MobileChatDemoV4DebugInteractive: React.FC = () => {
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

  return (
    <AbsoluteFill
      style={{ background: COLORS.background, cursor: 'crosshair' }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      {/* Main Demo */}
      <MobileChatDemoV4 />

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
          <span style={{ color: '#666' }}> (local frame {frameInScene})</span>
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
          Tell Claude: "Move hand from M1 to M2 at frame X"
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
            const sceneProgress = isActive
              ? ((frame - scene.start) / (scene.end - scene.start)) * 100
              : 0;

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
          zIndex: 9999,
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
    </AbsoluteFill>
  );
};
