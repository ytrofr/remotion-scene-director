import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { Logo } from "../components/Logo";
import { TitleCard } from "../components/TitleCard";
import { ScreenFrame } from "../components/ScreenFrame";
import { Outro } from "../components/Outro";
import {
  CursorAnimation,
  createCursorPath,
} from "../components/CursorAnimation";
import { TypewriterText } from "../components/TypewriterText";

// 30 seconds at 30fps = 900 frames
// Scene breakdown:
// 0-90 (0-3s): Logo intro
// 90-270 (3-9s): Dashboard overview
// 270-450 (9-15s): Navigate to chat + type question
// 450-690 (15-23s): AI Response
// 690-900 (23-30s): Outro

export const LimorAIDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a15" }}>
      {/* Scene 1: Logo Intro (0-3s = frames 0-90) */}
      <Sequence from={0} durationInFrames={100}>
        <Logo title="LIMOR AI" subtitle="מערכת ניהול עלויות חכמה" />
      </Sequence>

      {/* Scene 2: Dashboard (3-9s = frames 90-270) */}
      <Sequence from={90} durationInFrames={180}>
        <DashboardScene />
      </Sequence>

      {/* Scene 3: Chat with typing (9-15s = frames 270-450) */}
      <Sequence from={270} durationInFrames={180}>
        <ChatTypingScene />
      </Sequence>

      {/* Scene 4: AI Response (15-23s = frames 450-690) */}
      <Sequence from={450} durationInFrames={240}>
        <AIResponseScene />
      </Sequence>

      {/* Scene 5: Outro + CTA (23-30s = frames 690-900) */}
      <Sequence from={690} durationInFrames={210}>
        <Outro title="LIMOR AI" url="limor.app" cta="נסו עכשיו" />
      </Sequence>
    </AbsoluteFill>
  );
};

// Dashboard scene - shows full dashboard with cursor highlighting key areas
const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Based on screenshot: sidebar on right (~1020-1200px), cards in center
  // Revenue card: ~280-450px x, ~350-470px y
  // Labor cost card: ~530-700px x, ~350-470px y
  // Ratio card: ~780-950px x, ~350-470px y
  const cursorPath = createCursorPath(
    [
      { x: 960, y: 300 }, // Start in center-top
      { x: 390, y: 410, click: true }, // Revenue card (סה"כ מכירות ₪28,218)
      { x: 640, y: 410, click: true }, // Labor cost card (סה"כ עלות עבודה ₪5,365)
      { x: 890, y: 410, click: true }, // Ratio card (19.01%)
      { x: 890, y: 550, click: true }, // Hours card (96.24)
      { x: 960, y: 750 }, // Move to bottom status cards
    ],
    25, // frames between each point
    20, // Start at frame 20
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a15" }}>
      <ScreenFrame screenshot="01-dashboard-full.png" />
      <CursorAnimation path={cursorPath} startFrame={0} />
      <TitleCard
        text="לוח בקרה בזמן אמת"
        position="bottom"
        startFrame={30}
        durationFrames={140}
      />
    </AbsoluteFill>
  );
};

// Chat scene with typing simulation - uses NEW captured screenshots
const ChatTypingScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Frame-based screenshot selection (180 frames = 6 seconds)
  // 0-30: Empty chat
  // 30-90: Typing progress
  // 90-150: Full question
  // 150-180: Transition to next scene
  const getScreenshot = () => {
    if (frame < 30) return "chat-1-empty.png";
    if (frame < 90) return "chat-2-typing.png";
    return "chat-3-ready.png";
  };

  // Cursor path: click input → type → click send
  // Input field: center-bottom (~650, 740)
  // Send button: left side (~320, 740)
  const cursorPath = createCursorPath(
    [
      { x: 650, y: 740, click: true }, // Click on input field
      { x: 700, y: 740 }, // Move while "typing"
      { x: 320, y: 740, click: true }, // Click send button
    ],
    50,
    15,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a15" }}>
      <ScreenFrame screenshot={getScreenshot()} fadeIn={false} />

      <CursorAnimation path={cursorPath} startFrame={0} />

      <TitleCard
        text="שאל את LIMOR AI"
        position="top"
        startFrame={10}
        durationFrames={120}
      />
    </AbsoluteFill>
  );
};

// AI Response scene - shows loading then response (uses NEW captured screenshots)
const AIResponseScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Frame-based screenshot selection (240 frames = 8 seconds)
  // 0-60: Loading/thinking state (AI processing)
  // 60-240: Response visible
  const getScreenshot = () => {
    if (frame < 60) return "chat-4-loading.png";
    return "chat-5-response.png";
  };

  // Subtle glow effect when response appears
  const glowOpacity =
    frame > 60
      ? interpolate(Math.sin((frame - 60) * 0.08), [-1, 1], [0.1, 0.25])
      : 0;

  // Cursor points to the response after it appears
  // Response bubble: ~450, 310 based on chat-5-response.png
  // Feedback buttons: ~575, 355
  const cursorPath = createCursorPath(
    [
      { x: 320, y: 305 }, // Near loading indicator
      { x: 450, y: 310, click: true }, // Point to AI response text
      { x: 590, y: 355, click: true }, // Point to thumbs up button
    ],
    60,
    70, // Start after response appears
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a15" }}>
      {/* Subtle glow background when response shows */}
      {frame > 60 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 35% 30%, rgba(0, 217, 255, ${glowOpacity}) 0%, transparent 40%)`,
          }}
        />
      )}

      <ScreenFrame screenshot={getScreenshot()} fadeIn={false} />

      {frame > 60 && <CursorAnimation path={cursorPath} startFrame={60} />}

      {/* Loading indicator text */}
      {frame < 60 && (
        <TitleCard
          text="לימור חושבת..."
          position="bottom"
          startFrame={10}
          durationFrames={50}
        />
      )}

      {/* Response title */}
      {frame >= 60 && (
        <TitleCard
          text="תשובה מיידית מבוססת נתונים"
          subtitle="10 עובדים בסניף ויצמן"
          position="bottom"
          startFrame={60}
          durationFrames={170}
        />
      )}
    </AbsoluteFill>
  );
};
