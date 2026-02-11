/**
 * MobileChatDemoV3 Constants
 * Video 2: Worker Hours Question (continuation of first conversation)
 */

// Color palette (same as V2)
export const COLORS = {
  primary: '#00d9ff',
  background: '#0a0a15',
  backgroundDark: '#050510',
  white: '#ffffff',
  glowCyan: 'rgba(0, 217, 255, 0.5)',
};

// Frame timings for ~12-second video
// 8 scenes total: Intro, ChatWithResponse, Typing, Send, UserMessage, Thinking, Response, Outro
export const TIMINGS = {
  intro: { start: 0, duration: 35 },
  chatWithResponse: { start: 20, duration: 45 }, // Shows first Q&A
  typing: { start: 65, duration: 85 }, // Longer - 28 characters
  send: { start: 150, duration: 30 },
  userMessage: { start: 180, duration: 30 },
  thinking: { start: 210, duration: 45 },
  response: { start: 255, duration: 60 },
  outro: { start: 300, duration: 35 },
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
export const COORDINATES = {
  chatInput: { x: 250, y: 687 },
  sendButton: { x: 43, y: 687 },
  responseArea: { x: 195, y: 350 },
};

// Typing configuration for V3
export const TYPING = {
  stages: 28, // "כמה שעות עבדו העובדים השבוע?" = 28 characters
  message: 'כמה שעות עבדו העובדים השבוע?',
};

// Screenshot paths (v2- prefix)
export const SCREENSHOTS = {
  chatWithResponse: 'v2-chat-with-response.png',
  typingPrefix: 'v2-type-',
  readyToSend: 'v2-ready-to-send.png',
  userMessage: 'v2-user-message.png',
  thinking: 'v2-thinking.png',
  response: 'v2-response.png',
};

// Total composition frames (accounting for transition overlaps)
// 8 scenes: 35+45+85+30+30+45+60+35 = 365 - 30 (transitions) = 335
export const TOTAL_FRAMES = 335;
export const FPS = 30;
