export const SIGMA_VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1800, // 60 seconds
};

// Scene timeline (frames at 30fps) — Portrait 1080x1920
export const SCENES = {
  // Act 1: The Problem (0-12s)
  problemIntro: { start: 0, duration: 120 }, // 0-4s - typewriter + pain points slam
  vendorStack: { start: 120, duration: 120 }, // 4-8s - vendor bars slide in
  totalCost: { start: 240, duration: 90 }, // 8-11s - $2,750 count-up
  // (painPoints merged into problemIntro)

  // Act 2: The Solution (12-30s)
  transition: { start: 330, duration: 90 }, // 11-14s - "What if..." dramatic build
  sigmaReveal: { start: 420, duration: 120 }, // 14-18s - Sigma logo zoom + glow
  orchestraActivation: { start: 540, duration: 210 }, // 18-25s - agents light up
  whatsappDemo: { start: 750, duration: 180 }, // 25-31s - WhatsApp conversation

  // Act 3: The Impact (31-45s)
  metricsReveal: { start: 930, duration: 120 }, // 31-35s - 2x2 grid fly-in
  marketSize: { start: 1050, duration: 120 }, // 35-39s - TAM/SAM/SOM bars
  beforeAfter: { start: 1170, duration: 120 }, // 39-43s - price comparison

  // Act 4: The Ask (43-60s)
  team: { start: 1290, duration: 150 }, // 43-48s - founders
  theAsk: { start: 1440, duration: 150 }, // 48-53s - $1M pre-seed
  outro: { start: 1590, duration: 210 }, // 53-60s - "Agentify Your Business"
};

export const COLORS = {
  bg: '#09090b',
  bgSecondary: '#111114',
  card: '#16161a',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  accent: '#8b5cf6',
  accentLight: '#a78bfa',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  emerald: '#10b981',
  red: '#ef4444',
  pink: '#ec4899',
  orange: '#f97316',
  indigo: '#6366f1',
  green: '#22c55e',
};

// 9 external-facing agents (no Discovery, no Drive Org -- internal only)
// No emoji icons -- use letter abbreviations
export const AGENTS = [
  {
    name: 'Websites',
    abbr: 'WB',
    color: COLORS.accent,
    desc: 'Generate & publish',
  },
  {
    name: 'Google Ads',
    abbr: 'GA',
    color: COLORS.amber,
    desc: 'Campaign creation',
  },
  {
    name: 'Reach (SEO)',
    abbr: 'RC',
    color: COLORS.emerald,
    desc: 'SEO automation',
  },
  {
    name: 'Nano Banana',
    abbr: 'NB',
    color: COLORS.pink,
    desc: 'Creative studio',
  },
  { name: 'Media', abbr: 'MD', color: COLORS.cyan, desc: 'Asset management' },
  {
    name: 'Accounting',
    abbr: 'AC',
    color: COLORS.orange,
    desc: 'Invoice automation',
  },
  { name: 'Drive', abbr: 'DR', color: COLORS.green, desc: 'File intelligence' },
  {
    name: 'Orchestrator',
    abbr: '\u03A3',
    color: COLORS.accentLight,
    desc: 'The conductor',
  },
  {
    name: 'AgentSmith',
    abbr: 'AS',
    color: '#3b82f6',
    desc: 'Personal AI agent',
  },
];

export const VENDORS = [
  { name: 'Web Designer', tool: 'Wix / WordPress', cost: '$800/mo' },
  { name: 'SEO Agency', tool: 'Ahrefs / Semrush', cost: '$500/mo' },
  { name: 'Ad Manager', tool: 'Google Ads', cost: '$600/mo' },
  { name: 'Content Creator', tool: 'Canva / Fiverr', cost: '$500/mo' },
  { name: 'Accountant', tool: 'Excel / QuickBooks', cost: '$350/mo' },
];

export const DISTRIBUTION = [
  'WhatsApp',
  'Wix',
  'Shopify',
  'WordPress',
  'Chrome Extension',
  'Google Workspace',
  'Zapier',
  'Telegram',
];

export const INTEGRATIONS_COUNT = 19;

export const PRICING = {
  free: { price: 0, label: 'Free', desc: 'Explore the platform' },
  single: { price: 49, label: 'Single', desc: 'One business, all agents' },
  agency: { price: 349, label: 'Agency', desc: 'Unlimited businesses' },
};

export const TEAM = [
  {
    initials: 'JA',
    name: 'Jordan Avery',
    role: 'CEO',
    gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    roleColor: '#a78bfa',
    bio: 'Founder with a background in marketing and ecommerce. Full-stack developer.',
  },
  {
    initials: 'SP',
    name: 'Sam Park',
    role: 'CTO',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    roleColor: '#67e8f9',
    bio: '8+ years in startups. Scaled products to hundreds of thousands of users. Full-stack architect.',
  },
];

export const FONTS = {
  heading: "'Space Grotesk', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
  wordmark: "'Synonym', system-ui, sans-serif", // Synonym 600 from Fontshare
};

// SceneDirector-compatible scene info array
export const SCENE_INFO = Object.entries(SCENES).map(([key, s]) => ({
  name: key,
  start: s.start,
  end: s.start + s.duration,
}));
