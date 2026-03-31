// Re-export shared springs for backward compatibility
export { SPRING_CONFIG as SHARED_SPRING_CONFIG } from '../../lib/springs';

// DorianStores Video - Constants and Configuration

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1290, // ~43 seconds
};

// Colors (from Dorian branding)
export const COLORS = {
  primary: '#2DD4BF',
  primaryDark: '#14B8A6',
  background: '#FFFFFF',
  darkBg: '#0F172A',
  text: '#1E293B',
  textLight: '#64748B',
  accent: '#F97316',
  white: '#FFFFFF',
  success: '#22C55E',
  warning: '#EAB308',
  cardBg: '#F8FAFC',
  border: '#E2E8F0',
};

// Scene timings (frames at 30fps)
export const SCENES = {
  dashboard: { start: 0, duration: 660 }, // 22s - Dashboard + AI chat + best sellers + confirm price change
  mapSearch: { start: 660, duration: 240 }, // 8s - Search stores on map (with zoom)
  aiProducts: { start: 900, duration: 390 }, // 13s - AI creates products (with zoom + store view)
};

// Phone mockup dimensions
export const PHONE = {
  width: 390,
  height: 844,
  frameWidth: 414,
  frameHeight: 868,
  displayScale: 1.8,
  centerX: 540,
  centerY: 960,
};

// Hand size scales with zoom
const HAND_BASE_SIZE = 120;
const HAND_BASE_ZOOM = PHONE.displayScale;
export const handSizeForZoom = (zoom: number) =>
  HAND_BASE_SIZE * (zoom / HAND_BASE_ZOOM);

// Animation spring configs
export const SPRING_CONFIG = {
  default: { damping: 15, mass: 1, stiffness: 100 },
  gentle: { damping: 20, mass: 1, stiffness: 80 },
  bouncy: { damping: 10, mass: 0.8, stiffness: 150 },
  snappy: { damping: 20, mass: 0.5, stiffness: 200 },
  zoom: { damping: 18, mass: 1, stiffness: 80 },
  slide: { damping: 18, mass: 1, stiffness: 120 },
  card: { damping: 14, mass: 0.8, stiffness: 120 },
};

// Hand physics presets
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
};
