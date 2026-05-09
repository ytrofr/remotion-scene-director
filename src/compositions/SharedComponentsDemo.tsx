/**
 * SharedComponentsDemo — Visual showcase of all 8 new shared components
 *
 * 6 NON-OVERLAPPING scenes at 30fps, 24 seconds total:
 *   Scene 1 (0-119):     Title card
 *   Scene 2 (120-299):   ZoomTransition demo with colored boxes
 *   Scene 3 (300-469):   Cursor autoRotate — animated SVG arrow follows curved path
 *   Scene 4 (470-589):   Velocity tilt vs autoRotate comparison
 *   Scene 5 (590-689):   CaptionOverlay with word-highlight
 *   Scene 6 (690-719):   Outro
 *
 * Note: FloatingHand returns null inside SceneDirector (by design — SD provides
 * its own hand overlay). So scenes 3-4 use animated SVG arrows to demonstrate
 * rotation physics directly. For the real cursor, use SceneDirector hand layers.
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

import { ZoomTransition } from '../components/ZoomTransition';
import { CaptionOverlay } from '../components/CaptionOverlay';
import { computeVolumeAtFrame } from '../lib/audioEnvelope';
import { fontFamily } from '../lib/fonts';

export const DEMO_VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 720,
};

export const DEMO_SCENES = [
  { name: '1-Title', start: 0, end: 120 },
  { name: '2-ZoomTransition', start: 120, end: 300 },
  { name: '3-CursorAutoRotate', start: 300, end: 470 },
  { name: '4-HandVsPointer', start: 470, end: 590 },
  { name: '5-CaptionOverlay', start: 590, end: 690 },
  { name: '6-Outro', start: 690, end: 720 },
];

const BG = '#0F172A';
const TEAL = '#2DD4BF';
const AMBER = '#F59E0B';
const ROSE = '#F43F5E';
const WHITE = '#FFFFFF';

const SAMPLE_SRT = `1
00:00:00,000 --> 00:00:01,500
Shared components make video production faster

2
00:00:01,500 --> 00:00:03,000
Springs, easings, captions, and transitions

3
00:00:03,000 --> 00:00:03,300
All reusable across every composition
`;

// ─── Animated SVG Arrow ───
// Moves along a path and rotates to face movement direction (demonstrates autoRotate)
const AnimatedArrow: React.FC<{
  path: { x: number; y: number; frame: number }[];
  color: string;
  size?: number;
  autoRotate?: boolean; // true = atan2 direction, false = velocity tilt
  label?: string;
}> = ({ path, color, size = 40, autoRotate = true, label }) => {
  const frame = useCurrentFrame();

  // Find current segment
  let segIdx = 0;
  for (let i = 0; i < path.length - 1; i++) {
    if (frame >= path[i].frame && frame < path[i + 1].frame) {
      segIdx = i;
      break;
    }
    if (i === path.length - 2) segIdx = i;
  }

  const curr = path[segIdx];
  const next = path[Math.min(segIdx + 1, path.length - 1)];
  const segDur = next.frame - curr.frame;
  const t =
    segDur > 0 ? Math.min(1, Math.max(0, (frame - curr.frame) / segDur)) : 1;

  // Smooth easing
  const eased = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);

  const x = curr.x + (next.x - curr.x) * eased;
  const y = curr.y + (next.y - curr.y) * eased;

  const dx = next.x - curr.x;
  const dy = next.y - curr.y;

  let rotation = 0;
  if (autoRotate) {
    // atan2 direction — cursor tip follows arc
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed > 1) {
      rotation = Math.atan2(dy, dx) * (180 / Math.PI) - 45;
    }
    // Return to neutral at segment end
    if (t > 0.85) {
      rotation *= 1 - (t - 0.85) / 0.15;
    }
  } else {
    // Velocity tilt — horizontal lean
    const velocityMul = Math.sin(t * Math.PI);
    const hTilt = (dx / Math.max(1, segDur)) * 0.6 * 2 * (1 + velocityMul);
    const vTilt = (dy / Math.max(1, segDur)) * 0.6 * 0.5 * (1 + velocityMul);
    rotation = hTilt + vTilt;
    rotation = Math.tanh(rotation / 25) * 25;
    if (t > 0.8) {
      rotation *= 1 - (t - 0.8) / 0.2;
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-25%, -10%) rotate(${rotation}deg)`,
        transformOrigin: '25% 10%',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {/* Arrow cursor SVG */}
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path
          d="M4 1L4 17L8.5 13L12.5 21L15 19.5L11 11.5L17 11.5Z"
          fill={color}
          stroke={`${color}88`}
          strokeWidth={0.5}
        />
      </svg>
      {label && (
        <div
          style={{
            position: 'absolute',
            top: size + 4,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 16,
            color: `${color}CC`,
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

// ─── Scene 1: Title Card ───
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleY = interpolate(frame, [0, 30], [60, 0], {
    extrapolateRight: 'clamp',
  });
  const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BG} 0%, #1E293B 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{ textAlign: 'center', transform: `translateY(${titleY}px)` }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: TEAL,
            fontFamily,
            letterSpacing: -1,
          }}
        >
          Shared Components
        </div>
        <div
          style={{
            fontSize: 36,
            color: WHITE,
            opacity: subtitleOpacity,
            fontFamily,
            marginTop: 24,
          }}
        >
          8 New Building Blocks
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 400,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        {[
          'Springs & Easings',
          'ZoomTransition',
          'CrossfadeTransition',
          'CaptionOverlay',
          'BackgroundMusic',
          'Volume Envelope',
          'Cursor AutoRotate',
          'Pointer Presets',
        ].map((label, i) => {
          const itemOpacity = interpolate(
            frame,
            [35 + i * 6, 45 + i * 6],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );
          return (
            <div
              key={label}
              style={{
                fontSize: 28,
                color: `${WHITE}CC`,
                fontFamily,
                opacity: itemOpacity,
                marginBottom: 8,
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: ZoomTransition Demo ───
const ZoomScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#1E293B' }}>
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 42,
          fontWeight: 700,
          color: TEAL,
          fontFamily,
          zIndex: 10,
        }}
      >
        ZoomTransition
      </div>
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 24,
          color: `${WHITE}99`,
          fontFamily,
          zIndex: 10,
        }}
      >
        Zoom In → Hold → Zoom Out
      </div>

      <ZoomTransition
        zoomTo={2.8}
        centerX={0.5}
        centerY={0.45}
        zoomInDuration={40}
        zoomOutDuration={40}
        durationInFrames={180}
      >
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 120,
            paddingTop: 300,
          }}
        >
          {[TEAL, AMBER, ROSE, '#8B5CF6', '#3B82F6', '#10B981'].map(
            (color, i) => {
              const delay = i * 4;
              const cardScale = interpolate(
                frame,
                [delay, delay + 15],
                [0.5, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );
              return (
                <div
                  key={color}
                  style={{
                    width: 280,
                    height: 280,
                    borderRadius: 24,
                    background: `${color}30`,
                    border: `3px solid ${color}`,
                    transform: `scale(${cardScale})`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: 64,
                    fontWeight: 800,
                    color,
                    fontFamily,
                  }}
                >
                  {i + 1}
                </div>
              );
            },
          )}
        </AbsoluteFill>
      </ZoomTransition>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Cursor AutoRotate ───
const CursorAutoRotateScene: React.FC = () => {
  const cursorPath = [
    { x: 200, y: 1400, frame: 0 },
    { x: 500, y: 800, frame: 35 },
    { x: 850, y: 600, frame: 70 },
    { x: 700, y: 1100, frame: 110 },
    { x: 350, y: 1300, frame: 145 },
    { x: 540, y: 900, frame: 170 },
  ];

  return (
    <AbsoluteFill style={{ background: '#0F172A' }}>
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 42,
          fontWeight: 700,
          color: AMBER,
          fontFamily,
          zIndex: 10,
        }}
      >
        Cursor AutoRotate
      </div>
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 24,
          color: `${WHITE}99`,
          fontFamily,
          zIndex: 10,
        }}
      >
        physics.autoRotate: true — tip follows movement arc
      </div>

      {/* Dotted path guide */}
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.3 }}
      >
        <path
          d={`M ${cursorPath.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
          fill="none"
          stroke={AMBER}
          strokeWidth={3}
          strokeDasharray="12 8"
        />
        {cursorPath.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={8} fill={AMBER} opacity={0.5} />
        ))}
      </svg>

      {/* Animated arrow cursor with autoRotate */}
      <AnimatedArrow path={cursorPath} color={AMBER} size={48} autoRotate />

      {/* Code snippet overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          left: 60,
          right: 60,
          background: 'rgba(0,0,0,0.6)',
          borderRadius: 16,
          padding: 24,
          fontFamily: 'monospace',
          fontSize: 22,
          color: `${AMBER}CC`,
          lineHeight: 1.6,
        }}
      >
        {'physics: { autoRotate: true, rotationOffset: -45 }'}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Side-by-side Hand vs Pointer ───
const ComparisonScene: React.FC = () => {
  const leftPath = [
    { x: 270, y: 900, frame: 0 },
    { x: 270, y: 550, frame: 30 },
    { x: 270, y: 1200, frame: 70 },
    { x: 270, y: 650, frame: 110 },
  ];

  const rightPath = [
    { x: 810, y: 900, frame: 0 },
    { x: 810, y: 550, frame: 30 },
    { x: 810, y: 1200, frame: 70 },
    { x: 810, y: 650, frame: 110 },
  ];

  return (
    <AbsoluteFill style={{ background: '#1E293B' }}>
      {/* Left label */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 80,
          fontSize: 36,
          fontWeight: 700,
          color: TEAL,
          fontFamily,
        }}
      >
        Velocity Tilt
      </div>
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 80,
          fontSize: 20,
          color: `${WHITE}88`,
          fontFamily,
        }}
      >
        For hand gestures
      </div>

      {/* Right label */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          right: 80,
          fontSize: 36,
          fontWeight: 700,
          color: AMBER,
          fontFamily,
          textAlign: 'right',
        }}
      >
        AutoRotate
      </div>
      <div
        style={{
          position: 'absolute',
          top: 150,
          right: 80,
          fontSize: 20,
          color: `${WHITE}88`,
          fontFamily,
          textAlign: 'right',
        }}
      >
        For pointer cursors (atan2)
      </div>

      {/* Center divider */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          bottom: 300,
          left: '50%',
          width: 2,
          background: `${WHITE}20`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 28,
          color: `${WHITE}40`,
          fontFamily,
        }}
      >
        VS
      </div>

      {/* Left: velocity tilt (autoRotate=false) */}
      <AnimatedArrow
        path={leftPath}
        color={TEAL}
        size={48}
        autoRotate={false}
      />

      {/* Right: autoRotate (atan2 direction) */}
      <AnimatedArrow path={rightPath} color={AMBER} size={48} autoRotate />

      {/* Bottom explanation */}
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            background: `${TEAL}20`,
            border: `2px solid ${TEAL}40`,
            borderRadius: 12,
            padding: '12px 20px',
            fontFamily: 'monospace',
            fontSize: 18,
            color: TEAL,
          }}
        >
          horizontalTilt + verticalTilt
        </div>
        <div
          style={{
            background: `${AMBER}20`,
            border: `2px solid ${AMBER}40`,
            borderRadius: 12,
            padding: '12px 20px',
            fontFamily: 'monospace',
            fontSize: 18,
            color: AMBER,
          }}
        >
          atan2(dy, dx) + offset
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: CaptionOverlay Demo ───
const CaptionScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #1E293B 0%, ${BG} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 42,
          fontWeight: 700,
          color: ROSE,
          fontFamily,
        }}
      >
        CaptionOverlay
      </div>
      <div
        style={{
          position: 'absolute',
          top: 260,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 24,
          color: `${WHITE}99`,
          fontFamily,
        }}
      >
        SRT → word-highlight captions
      </div>

      {/* Play icon */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: `${ROSE}30`,
          border: `3px solid ${ROSE}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <svg width={60} height={60} viewBox="0 0 24 24" fill={ROSE}>
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      {/* Code snippet */}
      <div
        style={{
          position: 'absolute',
          bottom: 350,
          left: 60,
          right: 60,
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 12,
          padding: 20,
          fontFamily: 'monospace',
          fontSize: 20,
          color: `${ROSE}CC`,
          lineHeight: 1.5,
        }}
      >
        {'<CaptionOverlay srtContent={srt} style="word-highlight" />'}
      </div>

      <CaptionOverlay
        srtContent={SAMPLE_SRT}
        style="word-highlight"
        position="bottom"
        fontSize={44}
        color={WHITE}
        backgroundColor="rgba(0, 0, 0, 0.75)"
      />
    </AbsoluteFill>
  );
};

// ─── Scene 6: Outro ───
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const checkOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: BG,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 80,
            color: TEAL,
            opacity: checkOpacity,
            marginBottom: 40,
          }}
        >
          <svg
            width={80}
            height={80}
            viewBox="0 0 24 24"
            fill="none"
            stroke={TEAL}
            strokeWidth={3}
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: WHITE,
            fontFamily,
          }}
        >
          8 Components Ready
        </div>
        <div
          style={{
            fontSize: 28,
            color: `${WHITE}99`,
            fontFamily,
            marginTop: 16,
          }}
        >
          Import from src/lib/ and src/components/
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Composition ───
export const SharedComponentsDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence from={0} durationInFrames={120}>
        <TitleScene />
      </Sequence>

      <Sequence from={120} durationInFrames={180}>
        <ZoomScene />
      </Sequence>

      <Sequence from={300} durationInFrames={170}>
        <CursorAutoRotateScene />
      </Sequence>

      <Sequence from={470} durationInFrames={120}>
        <ComparisonScene />
      </Sequence>

      <Sequence from={590} durationInFrames={100}>
        <CaptionScene />
      </Sequence>

      <Sequence from={690} durationInFrames={30}>
        <OutroScene />
      </Sequence>

      {/* SFX with volume envelope */}
      <Sequence from={300} durationInFrames={30}>
        <Audio
          src={staticFile('audio/sfx/whoosh.wav')}
          volume={(f) =>
            computeVolumeAtFrame(f, {
              baseVolume: 0.5,
              fadeInFrames: 5,
              fadeOutFrames: 10,
              totalFrames: 30,
            })
          }
        />
      </Sequence>
    </AbsoluteFill>
  );
};
