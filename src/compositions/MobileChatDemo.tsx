import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { PhoneMockup } from "../components/PhoneMockup";
import { TouchAnimation, createTouchPath } from "../components/TouchAnimation";
import { TitleCard } from "../components/TitleCard";
import { Outro } from "../components/Outro";
import { Logo } from "../components/Logo";

/**
 * MobileChatDemo - 9:16 vertical video for TikTok/Reels
 *
 * Scene breakdown (10 seconds @ 30fps = 300 frames) - 2X FASTER:
 * 1. Phone Intro     (0-22)     0.75s - Phone slides in from bottom
 * 2. Chat Empty      (22-52)    1s    - Show empty chat UI
 * 3. Typing          (52-112)   2s    - Finger taps, text appears letter by letter
 * 4. Send            (112-142)  1s    - Tap send button
 * 5. Loading         (142-172)  1s    - AI thinking spinner
 * 6. Response        (172-232)  2s    - Answer appears
 * 7. Feedback        (232-262)  1s    - Tap thumbs up
 * 8. Outro           (262-300)  1.25s - CTA overlay
 *
 * Total: 300 frames @ 30fps = 10 seconds
 * Output: 1080x1920 (9:16 vertical)
 */

// Phone dimensions for iPhone 14 Pro
const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;

// Mobile touch coordinates (approximate for 390x844 viewport)
// Based on typical chat UI layout
const COORDINATES = {
  chatInput: { x: 195, y: 780 }, // Center bottom input area
  sendButton: { x: 350, y: 780 }, // Send button (right side)
  responseArea: { x: 195, y: 350 }, // AI response bubble
  thumbsUp: { x: 280, y: 420 }, // Feedback button
};

export const MobileChatDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a15" }}>
      {/* All scenes (0-300 frames = 10 seconds) */}
      <Sequence from={0} durationInFrames={300}>
        <PhoneIntroScene />
      </Sequence>

      {/* Scene 8: Outro + CTA (262-300 = frames) */}
      <Sequence from={262} durationInFrames={38}>
        <OutroOverlay />
      </Sequence>
    </AbsoluteFill>
  );
};

// Main phone scene with all content (2X FASTER - 300 frames total)
const PhoneIntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Frame timings (2X faster):
  // 0-22: Phone intro
  // 22-52: Empty chat
  // 52-112: Typing (60 frames - cycle through 5 typing stages)
  // 112-142: Send
  // 142-172: Loading
  // 172-262: Response + feedback

  // Number of typing stages (every character of "כמה הכנסות היו השבוע?" = 21 stages)
  const TYPING_STAGES = 21;

  // Determine which screenshot to show based on frame
  const getScreenshot = () => {
    if (frame < 52) return "mobile-chat-1-empty.png"; // Empty chat

    // Typing scene: cycle through typing stages (52-112 = 60 frames)
    // ~6 frames per stage for smooth letter-by-letter effect
    if (frame < 112) {
      const typingFrame = frame - 52;
      const framesPerStage = 60 / TYPING_STAGES;
      const stage = Math.min(
        TYPING_STAGES,
        Math.floor(typingFrame / framesPerStage) + 1,
      );
      return `mobile-chat-type-${String(stage).padStart(2, "0")}.png`;
    }

    if (frame < 142) return "mobile-chat-3-ready.png"; // Full question ready
    if (frame < 172) return "mobile-chat-4-loading.png"; // Loading
    return "mobile-chat-5-response.png"; // Response
  };

  // Scale phone to fill ~90% of video width
  const BASE_SCALE = 2.4;

  // Zoom effect during typing (frames 52-112)
  const isTypingScene = frame >= 52 && frame < 112;
  const isSendScene = frame >= 112 && frame < 142;

  let zoomScale = 1;
  let zoomOffsetY = 0;

  if (isTypingScene) {
    // Zoom in animation (frames 52-67) then hold
    const zoomProgress = interpolate(frame, [52, 67], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    zoomScale = interpolate(zoomProgress, [0, 1], [1, 1.4]);
    zoomOffsetY = interpolate(zoomProgress, [0, 1], [0, -350]);
  } else if (isSendScene) {
    // Zoom out after send (frames 112-127)
    const zoomOutProgress = interpolate(frame, [112, 127], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
    zoomScale = interpolate(zoomOutProgress, [0, 1], [1.4, 1]);
    zoomOffsetY = interpolate(zoomOutProgress, [0, 1], [-350, 0]);
  }

  // Touch animation path (2X faster timings)
  const touchPath = createTouchPath(
    [
      // Tap input (frame 52)
      { x: COORDINATES.chatInput.x, y: COORDINATES.chatInput.y, tap: true },
      // Hold while typing (frame 82)
      {
        x: COORDINATES.chatInput.x + 30,
        y: COORDINATES.chatInput.y,
        hold: true,
        holdDuration: 30,
      },
      // Move to send button (frame 112)
      { x: COORDINATES.sendButton.x, y: COORDINATES.sendButton.y, tap: true },
      // Point to response (frame 187)
      { x: COORDINATES.responseArea.x, y: COORDINATES.responseArea.y },
      // Tap thumbs up (frame 232)
      { x: COORDINATES.thumbsUp.x, y: COORDINATES.thumbsUp.y, tap: true },
    ],
    30, // 30 frames between points (2X faster)
    52, // Start at frame 52
  );

  // Subtle glow effect when response shows
  const glowOpacity =
    frame > 172
      ? interpolate(Math.sin((frame - 172) * 0.08), [-1, 1], [0.08, 0.2])
      : 0;

  // Final scale combines base scale and zoom
  const finalScale = BASE_SCALE * zoomScale;

  return (
    <AbsoluteFill>
      {/* Background glow for response */}
      {frame > 172 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 50% 40%, rgba(0, 217, 255, ${glowOpacity}) 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Centered and scaled phone mockup */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${finalScale}) translateY(${zoomOffsetY / finalScale}px)`,
          transformOrigin: "center center",
        }}
      >
        <PhoneMockup
          screenshot={getScreenshot()}
          width={PHONE_WIDTH}
          height={PHONE_HEIGHT}
          animateIn={true}
          animateInDelay={0}
          shadowIntensity={0.6}
        >
          {/* Touch animation overlay */}
          {frame >= 52 && frame < 262 && (
            <TouchAnimation
              path={touchPath}
              startFrame={52}
              fingerSize={45 / zoomScale}
              rippleColor="#00d9ff"
            />
          )}
        </PhoneMockup>
      </div>

      {/* Title cards based on scene */}
      <TitleCards frame={frame} />
    </AbsoluteFill>
  );
};

// Title cards that appear at different scenes (2X FASTER timings)
const TitleCards: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <>
      {/* Scene 2: Empty chat title (22-52) */}
      {frame >= 22 && frame < 52 && (
        <div
          style={{
            position: "absolute",
            bottom: 180,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TitleCard
            text="LIMOR AI"
            subtitle="מערכת ניהול עלויות חכמה"
            position="bottom"
            startFrame={0}
            durationFrames={30}
          />
        </div>
      )}

      {/* Scene 3-4: Typing title (52-142) */}
      {frame >= 52 && frame < 142 && (
        <div
          style={{
            position: "absolute",
            bottom: 180,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TitleCard
            text="שאל כל שאלה עסקית"
            position="bottom"
            startFrame={0}
            durationFrames={90}
          />
        </div>
      )}

      {/* Scene 5: Loading title (142-172) */}
      {frame >= 142 && frame < 172 && (
        <div
          style={{
            position: "absolute",
            bottom: 180,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TitleCard
            text="לימור חושבת..."
            position="bottom"
            startFrame={0}
            durationFrames={30}
          />
        </div>
      )}

      {/* Scene 6-7: Response title (172-262) */}
      {frame >= 172 && frame < 262 && (
        <div
          style={{
            position: "absolute",
            bottom: 180,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TitleCard
            text="תשובה מיידית מבוססת נתונים"
            position="bottom"
            startFrame={0}
            durationFrames={90}
          />
        </div>
      )}
    </>
  );
};

// Outro overlay with CTA
const OutroOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade in animation
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(10, 10, 21, ${opacity * 0.85})`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: 72,
          fontWeight: "bold",
          color: "#00d9ff",
          marginBottom: 30,
          textShadow: "0 0 40px rgba(0, 217, 255, 0.5)",
        }}
      >
        LIMOR AI
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 36,
          color: "#ffffff",
          marginBottom: 60,
          direction: "rtl",
        }}
      >
        מערכת ניהול עלויות חכמה
      </div>

      {/* CTA */}
      <div
        style={{
          padding: "20px 60px",
          backgroundColor: "#00d9ff",
          borderRadius: 12,
          fontSize: 32,
          fontWeight: "bold",
          color: "#0a0a15",
          direction: "rtl",
        }}
      >
        נסו עכשיו - limor.app
      </div>
    </AbsoluteFill>
  );
};
