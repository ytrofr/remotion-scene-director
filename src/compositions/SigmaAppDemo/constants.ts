export const SIGMA_APP_VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 1800, // 60 seconds at 30fps
};

// ─── Scene timeline — Chat-focused flow (~60s) ──────────────
// Act 1: Hub + chat opens
// Act 2: Website request → typing → routing → result
// Act 3: Page reveal — crossfade + scroll
// Act 4: Creative request → typing → routing → image
// Act 4b: Creative reveal — crossfade to Creative Studio page
// Act 5: Closing — SIGMA logo

export const CHAT_SCENES = {
  hubChatOpen: { start: 0, duration: 180 }, // 6s — Hub fades in, chat slides in
  websiteRequest: { start: 180, duration: 360 }, // 12s — Type, send, route, think, result
  pageReveal: { start: 540, duration: 270 }, // 9s — Crossfade to page, scroll
  creativeRequest: { start: 810, duration: 330 }, // 11s — Type, send, route, think, image
  creativeReveal: { start: 1140, duration: 210 }, // 7s — Crossfade to Creative Studio page
  closing: { start: 1350, duration: 450 }, // 15s — Logo fade (reuse existing ClosingScene)
};

// Legacy — kept for ClosingScene and SceneDirector compatibility
export const SCENES = [
  {
    name: 'HubChatOpen',
    start: CHAT_SCENES.hubChatOpen.start,
    duration: CHAT_SCENES.hubChatOpen.duration,
    image: 'sigma-demo/hub_desktop.png',
    caption: 'This is SIGMA. Eleven AI agents. One chat.',
  },
  {
    name: 'WebsiteRequest',
    start: CHAT_SCENES.websiteRequest.start,
    duration: CHAT_SCENES.websiteRequest.duration,
    image: 'sigma-demo/hub_desktop.png',
    caption: 'One message. The orchestrator routes to the Websites agent.',
  },
  {
    name: 'PageReveal',
    start: CHAT_SCENES.pageReveal.start,
    duration: CHAT_SCENES.pageReveal.duration,
    image: 'sigma-demo/generated_page_hero.png',
    caption: 'A full Hebrew website. Grade A quality. Under two minutes.',
  },
  {
    name: 'CreativeRequest',
    start: CHAT_SCENES.creativeRequest.start,
    duration: CHAT_SCENES.creativeRequest.duration,
    image: 'sigma-demo/hub_desktop.png',
    caption: 'Same conversation. Different agent. Creative Studio generates brand visuals.',
  },
  {
    name: 'CreativeReveal',
    start: CHAT_SCENES.creativeReveal.start,
    duration: CHAT_SCENES.creativeReveal.duration,
    image: 'sigma-demo/scene05_creative.png',
    caption: '2 agents. 1 conversation. Zero context switching.',
  },
  {
    name: 'Closing',
    start: CHAT_SCENES.closing.start,
    duration: CHAT_SCENES.closing.duration,
    image: 'sigma-demo/hub_desktop.png',
    caption: 'One platform. Eleven agents. Zero friction.',
    isClosing: true,
  },
] as const;

export type SceneDef = (typeof SCENES)[number];

export const SCENE_INFO = SCENES.map((s) => ({
  name: s.name,
  start: s.start,
  end: s.start + s.duration,
}));

export const COLORS = {
  bg: '#09090b',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  accent: '#8b5cf6',
  cyan: '#06b6d4',
  border: '#27272a',
};

export const FONTS = {
  heading: "'Space Grotesk', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};
