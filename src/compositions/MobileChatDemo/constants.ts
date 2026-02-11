/**
 * MobileChatDemo Constants
 * Shared configuration for all scene components
 */

// Color palette
export const COLORS = {
  primary: '#00d9ff',
  background: '#0a0a15',
  backgroundDark: '#050510',
  white: '#ffffff',
  glowCyan: 'rgba(0, 217, 255, 0.5)',
};

// Frame timings for ~12-second video (350 frames with transitions)
// Note: TransitionSeries overlaps scenes during transitions
// 8 scenes total: Intro, ChatEmpty, Typing, Send, UserMessage, Thinking, Response, Outro
export const TIMINGS = {
  intro: { start: 0, duration: 35 },
  chatEmpty: { start: 20, duration: 45 }, // Overlaps with intro during fade
  typing: { start: 65, duration: 70 }, // 1.5X FASTER typing
  send: { start: 135, duration: 30 },
  userMessage: { start: 165, duration: 30 }, // User prompt appears in chat
  thinking: { start: 195, duration: 45 }, // AI thinking with dots
  response: { start: 240, duration: 60 }, // AI response appears
  outro: { start: 285, duration: 35 }, // Overlaps with response during slide
};

// Transition durations (frames)
export const TRANSITIONS = {
  fadeIntro: 15,
  slideOutro: 15,
  lightLeakDuration: 20,
};

// Phone dimensions (iPhone 14 Pro)
export const PHONE = {
  width: 390,
  height: 844,
  baseScale: 2.4,
  bezelWidth: 6,
  borderRadius: 40,
};

// Touch coordinates (based on 390x844 viewport)
// Note: RTL layout - send button is on LEFT side
// Use Debug-CoordinatePicker composition to find exact positions
export const COORDINATES = {
  chatInput: { x: 250, y: 687 },
  sendButton: { x: 43, y: 687 }, // Verified via Debug-CoordinatePicker
  responseArea: { x: 195, y: 350 },
  thumbsUp: { x: 100, y: 420 },
};

// Typing configuration
export const TYPING = {
  stages: 21, // Number of screenshot stages
  message: 'כמה הכנסות היו השבוע?',
};

// Total composition frames (accounting for transition overlaps)
// 8 scenes: 35+45+70+30+30+45+60+35 = 350 - 30 (transitions) = 320
export const TOTAL_FRAMES = 320;
export const FPS = 30;
