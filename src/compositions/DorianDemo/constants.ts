// Dorian Demo Video - Constants and Configuration

// Video specs
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 750, // ~25 seconds
};

// Colors (from Dorian branding)
export const COLORS = {
  primary: '#2DD4BF',      // Cyan/Teal
  primaryDark: '#14B8A6',
  background: '#FFFFFF',
  darkBg: '#0F172A',
  text: '#1E293B',
  textLight: '#64748B',
  accent: '#F97316',       // Orange for CTAs
  white: '#FFFFFF',
};

// Scene timings (in frames at 30fps)
// NEW FLOW: Intro → Home Scroll → Tap AI Bubble → Chat Opens → User Types → Outro
export const SCENES = {
  intro: { start: 0, duration: 75 },          // 2.5s - Logo intro
  homeScroll: { start: 75, duration: 150 },   // 5s - Home page with scroll
  tapBubble: { start: 225, duration: 75 },    // 2.5s - Tap on AI bubble
  chatOpen: { start: 300, duration: 90 },     // 3s - Chat opens
  userTyping: { start: 390, duration: 150 },  // 5s - User types message
  outro: { start: 540, duration: 210 },       // 7s - CTA/Outro
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
    userMessage: 'I need dog food for large dog, around me',
  },
  outro: {
    title: 'DORIAN',
    tagline: 'The Future of Local Commerce',
    cta: 'Coming Soon',
  },
};

// Animation spring configs
export const SPRING_CONFIG = {
  default: { damping: 15, mass: 1, stiffness: 100 },
  gentle: { damping: 20, mass: 1, stiffness: 80 },
  bouncy: { damping: 10, mass: 0.8, stiffness: 150 },
  snappy: { damping: 20, mass: 0.5, stiffness: 200 },
};
