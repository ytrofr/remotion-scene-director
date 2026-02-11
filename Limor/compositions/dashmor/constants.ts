/**
 * DashmorDemo Constants
 * Labor Cost V3 Dashboard Scrolling Demo
 */

// Color palette
export const COLORS = {
  primary: '#00d9ff',
  background: '#0a0a15',
  backgroundDark: '#050510',
  white: '#ffffff',
  textMuted: '#a0a0c0',
  cardBg: 'rgba(26, 26, 62, 0.9)',
};

// Phone dimensions (same as Limor demos)
export const PHONE = {
  width: 390,
  height: 844,
  baseScale: 2.2, // Slightly smaller to fit callouts
};

// Full page dimensions (from capture)
export const PAGE = {
  width: 390,
  height: 10403, // Full scrollable height
  viewportHeight: 844,
};

// Section definitions with scroll positions and callout text
// Based on capture output - adjusted for smooth scrolling
export const SECTIONS = [
  {
    id: 'header',
    name: 'Header & Summary',
    scrollY: 0,
    pauseFrames: 60, // 2 seconds
    callout: {
      title: 'Labor Cost Dashboard',
      subtitle: 'Real-time workforce analytics',
      position: 'top' as const,
    },
  },
  {
    id: 'summary-cards',
    name: 'Summary Cards',
    scrollY: 400,
    pauseFrames: 45,
    callout: {
      title: 'Key Metrics',
      subtitle: 'Total hours, costs & efficiency',
      position: 'top' as const,
    },
  },
  {
    id: 'main-data',
    name: 'Main Data Section',
    scrollY: 1200,
    pauseFrames: 60,
    callout: {
      title: 'Detailed Breakdown',
      subtitle: 'Employee-level data',
      position: 'bottom' as const,
    },
  },
  {
    id: 'shift-status',
    name: 'Shift Status',
    scrollY: 2000,
    pauseFrames: 45,
    callout: {
      title: 'Shift Overview',
      subtitle: 'Current shift statuses',
      position: 'top' as const,
    },
  },
  {
    id: 'forecast',
    name: 'Forecast Section',
    scrollY: 2800,
    pauseFrames: 60,
    callout: {
      title: 'Cost Forecast',
      subtitle: 'Projected labor expenses',
      position: 'bottom' as const,
    },
  },
  {
    id: 'analytics',
    name: 'Analytics',
    scrollY: 4000,
    pauseFrames: 60,
    callout: {
      title: 'Analytics & Trends',
      subtitle: 'Historical performance',
      position: 'top' as const,
    },
  },
  {
    id: 'details',
    name: 'Detailed Reports',
    scrollY: 5500,
    pauseFrames: 60,
    callout: {
      title: 'Detailed Reports',
      subtitle: 'Complete workforce data',
      position: 'bottom' as const,
    },
  },
];

// Animation timing
export const TIMING = {
  introFrames: 45,           // Intro animation
  scrollFramesPerSection: 30, // Time to scroll between sections
  outroFrames: 45,           // Outro animation
};

// Calculate total frames
const calculateTotalFrames = () => {
  let total = TIMING.introFrames;
  SECTIONS.forEach((section, i) => {
    total += section.pauseFrames;
    if (i < SECTIONS.length - 1) {
      total += TIMING.scrollFramesPerSection;
    }
  });
  total += TIMING.outroFrames;
  return total;
};

export const TOTAL_FRAMES = calculateTotalFrames();
export const FPS = 30;

// Video config export for Root.tsx
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: FPS,
  durationInFrames: TOTAL_FRAMES,
};
