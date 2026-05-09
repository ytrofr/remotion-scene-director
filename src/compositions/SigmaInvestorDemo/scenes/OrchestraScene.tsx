import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS, AGENTS, FONTS } from '../constants';

export const OrchestraScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [0, 10, 190, 210], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Center conductor
  const conductorScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 8, mass: 1.2, stiffness: 150 },
  });

  // Portrait layout: center of the canvas
  const cx = 540;
  const cy = 960;
  const radius = 350;

  // Non-orchestrator agents (filter out orchestrator for the ring)
  const ringAgents = AGENTS.filter((a) => a.abbr !== '\u03A3');
  const orchestrator = AGENTS.find((a) => a.abbr === '\u03A3');

  return (
    <AbsoluteFill style={{ opacity: containerOpacity }}>
      {/* Title at top */}
      <div
        style={{
          position: 'absolute',
          top: 180,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            fontFamily: FONTS.heading,
            color: COLORS.text,
            marginBottom: 12,
          }}
        >
          Your AI Agency
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            fontFamily: FONTS.body,
            color: COLORS.textSecondary,
          }}
        >
          11 Agents{' '}
          <span style={{ color: COLORS.textMuted }}>(and counting)</span>
        </div>
      </div>

      {/* SVG connection lines that DRAW themselves */}
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {ringAgents.map((agent, i) => {
          const angle = (i / ringAgents.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const lineDelay = 25 + i * 10;

          // Draw line animation
          const dashLength = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          const drawProgress = interpolate(
            frame,
            [lineDelay, lineDelay + 20],
            [dashLength, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const lineOpacity = interpolate(
            frame,
            [lineDelay, lineDelay + 5],
            [0, 0.4],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <line
              key={`line-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={agent.color}
              strokeWidth={2}
              opacity={lineOpacity}
              strokeDasharray={dashLength}
              strokeDashoffset={drawProgress}
            />
          );
        })}
      </svg>

      {/* Center conductor -- SIGMA -- 140px circle */}
      <div
        style={{
          position: 'absolute',
          left: cx - 70,
          top: cy - 70,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          transform: `scale(${conductorScale})`,
          boxShadow: `0 0 80px rgba(139,92,246,0.5), 0 0 160px rgba(139,92,246,0.2)`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            color: 'white',
            fontFamily: FONTS.body,
          }}
        >
          {'\u03A3'}
        </div>
      </div>

      {/* Agent nodes in a circle */}
      {ringAgents.map((agent, i) => {
        const angle = (i / ringAgents.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const delay = 25 + i * 10;

        // Pulse: scale 0 -> 1.2 -> 1.0 with overshoot spring
        const nodeScale = spring({
          frame: frame - delay,
          fps,
          config: { damping: 8, mass: 0.6, stiffness: 200 },
        });
        const nodeOpacity = interpolate(frame, [delay, delay + 5], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Glow pulse
        const glowFrame = delay + 15;
        const glowIntensity = interpolate(
          frame,
          [glowFrame, glowFrame + 10, glowFrame + 30],
          [0, 1, 0.5],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const cardW = 130;
        const cardH = 100;

        return (
          <div
            key={agent.name}
            style={{
              position: 'absolute',
              left: x - cardW / 2,
              top: y - cardH / 2,
              width: cardW,
              height: cardH,
              borderRadius: 20,
              background: COLORS.card,
              border: `2px solid ${agent.color}${Math.round(50 + glowIntensity * 60)
                .toString(16)
                .padStart(2, '0')}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 6,
              opacity: nodeOpacity,
              transform: `scale(${nodeScale})`,
              boxShadow: `0 0 ${40 * glowIntensity}px ${agent.color}33`,
              zIndex: 5,
            }}
          >
            {/* Letter abbreviation circle */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: agent.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 800,
                color: 'white',
                fontFamily: FONTS.mono,
              }}
            >
              {agent.abbr}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.text,
                fontFamily: FONTS.body,
                textAlign: 'center',
                lineHeight: 1.1,
              }}
            >
              {agent.name}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
