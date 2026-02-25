// Dorian Demo Video - Constants and Configuration

// Video specs
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1140, // ~38 seconds (V2 extended)
};

// Colors (from Dorian branding)
export const COLORS = {
  primary: '#2DD4BF', // Cyan/Teal
  primaryDark: '#14B8A6',
  background: '#FFFFFF',
  darkBg: '#0F172A',
  text: '#1E293B',
  textLight: '#64748B',
  accent: '#F97316', // Orange for CTAs
  white: '#FFFFFF',
};

// Scene timings (in frames at 30fps)
// V2 FLOW: Intro → Home Scroll → Tap AI Bubble → Chat Opens → User Types →
//          AI Thinking → AI Response → Product Page → Product Detail → Outro
export const SCENES = {
  intro: { start: 0, duration: 75 }, // 2.5s - Logo intro
  homeScroll: { start: 75, duration: 150 }, // 5s - Home page with scroll
  tapBubble: { start: 225, duration: 75 }, // 2.5s - Tap on AI bubble
  chatOpen: { start: 300, duration: 90 }, // 3s - Chat opens
  userTyping: { start: 390, duration: 150 }, // 5s - User types message + sends
  // V2 new scenes:
  aiThinking: { start: 540, duration: 60 }, // 2s - AI thinking dots
  aiResponse: { start: 600, duration: 120 }, // 4s - AI response + View Products button + hand tap
  productPage: { start: 720, duration: 150 }, // 5s - Zoom out, crossfade to LG TV listing, hand scroll
  productDetail: { start: 870, duration: 90 }, // 3s - Hand taps product, crossfade to detail page
  outro: { start: 960, duration: 180 }, // 6s - CTA/Outro
};

// Phone mockup dimensions (from existing mockups)
export const PHONE = {
  imageWidth: 390,
  imageHeight: 844,
  displayScale: 1.8,
  centerX: 540,
  centerY: 960,
};

// Text overlays content
export const TEXT_CONTENT = {
  intro: {
    title: 'DORIAN',
    subtitle: 'Community Marketplace',
  },
  homeScroll: {
    title: 'Discover Local Products',
  },
  tapBubble: {
    title: 'Meet Your AI Assistant',
  },
  chatOpen: {
    title: 'Ask Dorian Anything',
  },
  userTyping: {
    title: 'Find Exactly What You Need',
    userMessage: 'Show me LG TVs with best reviews',
  },
  aiThinking: {
    title: 'AI-Powered Search',
  },
  aiResponse: {
    title: 'Personalized Results',
    aiMessage:
      'I found 6 LG TVs with excellent reviews! The LG C3 65" OLED is the top-rated with 4.8 stars. Here are your options:',
  },
  productPage: {
    title: 'Browse & Compare',
  },
  productDetail: {
    title: 'Product Details',
  },
  outro: {
    title: 'DORIAN',
    tagline: 'The Future of Local Commerce',
    cta: 'Coming Soon',
  },
};

// Animation spring configs (consolidated from 15+ inline definitions)
export const SPRING_CONFIG = {
  default: { damping: 15, mass: 1, stiffness: 100 },
  gentle: { damping: 20, mass: 1, stiffness: 80 },
  bouncy: { damping: 10, mass: 0.8, stiffness: 150 },
  snappy: { damping: 20, mass: 0.5, stiffness: 200 },
  zoom: { damping: 18, mass: 1, stiffness: 80 }, // Camera zoom in/out
  slide: { damping: 18, mass: 1, stiffness: 120 }, // Panel slides
  response: { damping: 18, mass: 1, stiffness: 100 }, // Chat response appear
};

// Hand physics presets (consolidated from 8+ inline configs)
export const HAND_PHYSICS = {
  scroll: {
    floatAmplitude: 0,
    floatSpeed: 0,
    velocityScale: 0.1,
    maxRotation: 5,
    shadowEnabled: true,
    shadowDistance: 8,
    shadowBlur: 10,
    smoothing: 0.2,
  },
  tap: {
    floatAmplitude: 2,
    floatSpeed: 0.04,
    velocityScale: 0.6,
    maxRotation: 25,
    shadowEnabled: true,
    shadowDistance: 10,
    shadowBlur: 12,
    smoothing: 0.15,
  },
  trail: {
    floatAmplitude: 0,
    floatSpeed: 0,
    velocityScale: 0.8,
    maxRotation: 35,
    shadowEnabled: true,
    shadowDistance: 8,
    shadowBlur: 10,
    smoothing: 0.2,
  },
  tapGentle: {
    floatAmplitude: 2,
    floatSpeed: 0.04,
    velocityScale: 0.5,
    maxRotation: 20,
    shadowEnabled: true,
    shadowDistance: 10,
    shadowBlur: 12,
    smoothing: 0.15,
  },
  trailResponsive: {
    floatAmplitude: 0,
    floatSpeed: 0,
    velocityScale: 0.8,
    maxRotation: 35,
    shadowEnabled: true,
    shadowDistance: 12,
    shadowBlur: 15,
    smoothing: 0.12,
  },
};
