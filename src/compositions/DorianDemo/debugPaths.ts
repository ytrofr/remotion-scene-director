/**
 * Predefined hand path waypoints for debug visualization.
 *
 * Pure data — no React components. Used by DorianDebugInteractive
 * to show predefined hand paths with frame-aware markers.
 */
import type { DebugPathMarker } from '../../components/debug';
import { SCENES } from './constants';

// ── Scene 2: Home Scroll hand end position ──

const scene2Start = SCENES.homeScroll.start;

export const SCENE_2_SCROLL_PATH: DebugPathMarker[] = [
  {
    x: 780,
    y: 960,
    frame: scene2Start + 150,
    label: 'S2-End',
    color: '#00f',
    desc: 'Scene 2 scroll hand end',
    scene: '2-HomeScroll',
  },
];

// ── Scene 3: Tap AI Bubble path ──

const scene3Start = SCENES.tapBubble.start;

export const TAP_BUBBLE_PATH: DebugPathMarker[] = [
  {
    x: 780,
    y: 1200,
    frame: scene3Start + 0,
    label: 'H1-Start',
    color: '#0f0',
    desc: 'Hand start @ ' + scene3Start,
    scene: '3-TapBubble',
  },
  {
    x: 800,
    y: 1400,
    frame: scene3Start + 30,
    label: 'H2-Move',
    color: '#0f0',
    desc: 'Moving down @ ' + (scene3Start + 30),
    scene: '3-TapBubble',
  },
  {
    x: 818,
    y: 1546,
    frame: scene3Start + 53,
    label: 'H3-Bubble',
    color: '#ff0',
    desc: 'At bubble @ ' + (scene3Start + 53) + ' (ZOOM IN)',
    scene: '3-TapBubble',
  },
  {
    x: 518,
    y: 992,
    frame: scene3Start + 73,
    label: 'CLICK',
    color: '#f00',
    desc: 'CLICK @ ' + (scene3Start + 73) + ' (zoomed pos)',
    scene: '3-TapBubble',
  },
];

// ── Scene 4: Chat Open path (zoom-out -> move to input -> tap -> hide) ──

const scene4Start = SCENES.chatOpen.start;

export const CHAT_OPEN_PATH: DebugPathMarker[] = [
  {
    x: 518,
    y: 992,
    frame: scene4Start + 0,
    label: 'S4-Start',
    color: '#0ff',
    desc: 'Start (from S3 zoom click pos) @ ' + scene4Start,
    scene: '4-ChatOpen',
  },
  {
    x: 500,
    y: 1200,
    frame: scene4Start + 20,
    label: 'S4-Move',
    color: '#0ff',
    desc: 'Moving down @ ' + (scene4Start + 20),
    scene: '4-ChatOpen',
  },
  {
    x: 480,
    y: 1520,
    frame: scene4Start + 45,
    label: 'S4-Near',
    color: '#0ff',
    desc: 'Near input box @ ' + (scene4Start + 45),
    scene: '4-ChatOpen',
  },
  {
    x: 480,
    y: 1550,
    frame: scene4Start + 48,
    label: 'S4-TAP',
    color: '#f80',
    desc: 'TAP input box @ ' + (scene4Start + 48),
    scene: '4-ChatOpen',
  },
  {
    x: 480,
    y: 1550,
    frame: scene4Start + 53,
    label: 'S4-Hide',
    color: '#f00',
    desc: 'Hand hides @ ' + (scene4Start + 53),
    scene: '4-ChatOpen',
  },
];

// ── Scene 5: User Typing path (reappear -> move to send -> tap) ──

const scene5Start = SCENES.userTyping.start;

export const USER_TYPING_PATH: DebugPathMarker[] = [
  {
    x: 750,
    y: 1520,
    frame: scene5Start + 70,
    label: 'S5-Show',
    color: '#a0f',
    desc: 'Hand reappears @ ' + (scene5Start + 70),
    scene: '5-UserTyping',
  },
  {
    x: 730,
    y: 1500,
    frame: scene5Start + 85,
    label: 'S5-Move',
    color: '#a0f',
    desc: 'Moving to send @ ' + (scene5Start + 85),
    scene: '5-UserTyping',
  },
  {
    x: 720,
    y: 1490,
    frame: scene5Start + 100,
    label: 'S5-Near',
    color: '#a0f',
    desc: 'Near send btn @ ' + (scene5Start + 100),
    scene: '5-UserTyping',
  },
  {
    x: 720,
    y: 1490,
    frame: scene5Start + 105,
    label: 'S5-SEND',
    color: '#f00',
    desc: 'TAP send @ ' + (scene5Start + 105),
    scene: '5-UserTyping',
  },
];

// ── Scene 7: AI Response path (tap "View Products" button) ──

const scene7Start = SCENES.aiResponse.start;

export const AI_RESPONSE_PATH: DebugPathMarker[] = [
  {
    x: 540,
    y: 1600,
    frame: scene7Start + 70,
    label: 'S7-Show',
    color: '#0f8',
    desc: 'Hand appears @ ' + (scene7Start + 70),
    scene: '7-AIResponse',
  },
  {
    x: 540,
    y: 1480,
    frame: scene7Start + 85,
    label: 'S7-Move',
    color: '#0f8',
    desc: 'Moving to button @ ' + (scene7Start + 85),
    scene: '7-AIResponse',
  },
  {
    x: 540,
    y: 1450,
    frame: scene7Start + 95,
    label: 'S7-TAP',
    color: '#f00',
    desc: 'TAP View Products @ ' + (scene7Start + 95),
    scene: '7-AIResponse',
  },
];

// ── Scene 8: Product Page path (scroll listing) ──

const scene8Start = SCENES.productPage.start;

export const PRODUCT_PAGE_PATH: DebugPathMarker[] = [
  {
    x: 780,
    y: 960,
    frame: scene8Start + 45,
    label: 'S8-Scroll',
    color: '#ff0',
    desc: 'Scroll hand @ ' + (scene8Start + 45),
    scene: '8-ProductPage',
  },
  {
    x: 780,
    y: 960,
    frame: scene8Start + 128,
    label: 'S8-End',
    color: '#ff0',
    desc: 'Scroll end @ ' + (scene8Start + 128),
    scene: '8-ProductPage',
  },
];

// ── Combined: all predefined path markers ──

export const ALL_DEBUG_PATHS: DebugPathMarker[] = [
  ...SCENE_2_SCROLL_PATH,
  ...TAP_BUBBLE_PATH,
  ...CHAT_OPEN_PATH,
  ...USER_TYPING_PATH,
  ...AI_RESPONSE_PATH,
  ...PRODUCT_PAGE_PATH,
];
