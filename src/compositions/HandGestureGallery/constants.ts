export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 300, // 10 seconds
} as const;

export type GestureCategory =
  | 'tap'
  | 'movement'
  | 'interaction'
  | 'zoom'
  | 'cursor'
  | 'special'
  | 'longpress'
  | 'reaction';

export interface GalleryGesture {
  id: string;
  label: string;
  category: GestureCategory;
}

export const CATEGORY_LABELS: Record<GestureCategory, string> = {
  tap: 'Taps',
  movement: 'Movement',
  interaction: 'Interaction',
  zoom: 'Zoom / Pinch',
  cursor: 'Cursor / Pointer',
  special: 'Special',
  longpress: 'Long Press / Hold',
  reaction: 'Reactions',
};

export const CATEGORY_ORDER: GestureCategory[] = [
  'tap',
  'movement',
  'interaction',
  'zoom',
  'cursor',
  'longpress',
  'special',
  'reaction',
];

export const GALLERY_GESTURES: GalleryGesture[] = [
  { id: 'hand-click', label: 'Click', category: 'tap' },
  { id: 'hand-tap', label: 'Tap', category: 'tap' },
  { id: 'hand-tap-alt', label: 'Tap Alt', category: 'tap' },
  { id: 'hand-double-tap', label: 'Double Tap', category: 'tap' },
  { id: 'hand-double-tap-2f', label: '2F Double Tap', category: 'tap' },
  { id: 'hand-single-tap', label: 'Single Tap (DT)', category: 'tap' },
  { id: 'hand-swipe-up', label: 'Swipe Up', category: 'movement' },
  { id: 'hand-swipe-right', label: 'Swipe Right', category: 'movement' },
  { id: 'hand-swipe-left', label: 'Swipe Left', category: 'movement' },
  { id: 'hand-swipe-down', label: 'Swipe Down', category: 'movement' },
  { id: 'hand-scroll-clean', label: 'Scroll', category: 'movement' },
  {
    id: 'hand-swipe-right-alt',
    label: 'Swipe Right (Fazal)',
    category: 'movement',
  },
  { id: 'hand-swipe-up-alt', label: 'Swipe Up (Aubry)', category: 'movement' },
  { id: 'hand-drag', label: 'Drag', category: 'interaction' },
  { id: 'hand-pinch', label: 'Pinch', category: 'interaction' },
  { id: 'hand-touch-gesture', label: 'Touch Gesture', category: 'interaction' },
  { id: 'hand-click-gesture', label: 'Click Gesture', category: 'interaction' },
  { id: 'hand-scratch', label: 'Scratch Card', category: 'interaction' },
  { id: 'hand-zoom', label: 'Hand Zoom', category: 'zoom' },
  { id: 'hand-zoom-simple', label: 'Simple Zoom', category: 'zoom' },
  { id: 'hand-pinch-alt', label: 'Pinch (Fadlan)', category: 'zoom' },
  { id: 'hand-cursor-click', label: 'Cursor Click', category: 'cursor' },
  { id: 'cursor-arrow', label: 'Cursor Arrow', category: 'cursor' },
  { id: 'cursor-expression', label: 'Cursor Click', category: 'cursor' },
  { id: 'cursor-mouse-click', label: 'Mouse Cursor', category: 'cursor' },
  {
    id: 'cursor-click-indicator',
    label: 'Click Indicator',
    category: 'cursor',
  },
  { id: 'cursor-futuristic', label: 'Futuristic Cursor', category: 'cursor' },
  { id: 'cursor-loader', label: 'Cursor Loader', category: 'cursor' },
  { id: 'cursor-click-cta', label: 'Click CTA', category: 'cursor' },
  { id: 'cursor-icon', label: 'Cursor Icon', category: 'cursor' },
  { id: 'cursor-mac-busy', label: 'Mac Busy Cursor', category: 'cursor' },
  { id: 'cursor-blinking', label: 'Blinking Text Cursor', category: 'cursor' },
  { id: 'cursor-move', label: 'Cursor Move', category: 'cursor' },
  { id: 'cursor-typing-dots', label: 'Typing Indicator', category: 'cursor' },
  { id: 'cursor-flat-simple', label: 'Flat Simple', category: 'cursor' },
  { id: 'cursor-flat-notched', label: 'Flat Notched', category: 'cursor' },
  { id: 'cursor-flat-angular', label: 'Flat Angular', category: 'cursor' },
  { id: 'cursor-outline-simple', label: 'Outline Simple', category: 'cursor' },
  {
    id: 'cursor-outline-notched',
    label: 'Outline Notched',
    category: 'cursor',
  },
  {
    id: 'cursor-outline-angular',
    label: 'Outline Angular',
    category: 'cursor',
  },
  { id: 'cursor-round-simple', label: 'Round Simple', category: 'cursor' },
  { id: 'cursor-round-notched', label: 'Round Notched', category: 'cursor' },
  { id: 'cursor-round-angular', label: 'Round Angular', category: 'cursor' },
  {
    id: 'cursor-round-outline-simple',
    label: 'Round Outline Simple',
    category: 'cursor',
  },
  {
    id: 'cursor-round-outline-notched',
    label: 'Round Outline Notched',
    category: 'cursor',
  },
  {
    id: 'cursor-round-outline-angular',
    label: 'Round Outline Angular',
    category: 'cursor',
  },
  { id: 'hand-point', label: 'Point', category: 'special' },
  { id: 'hand-snap', label: 'Finger Snap', category: 'special' },
  { id: 'hand-long-press', label: 'Touch & Hold', category: 'longpress' },
  { id: 'hand-long-press-alt', label: 'Long Press', category: 'longpress' },
  { id: 'hand-wave', label: 'Wave', category: 'reaction' },
  { id: 'hand-thumbs-up', label: 'Thumbs Up', category: 'reaction' },
  { id: 'hand-peace', label: 'Peace Sign', category: 'reaction' },
  { id: 'hand-raise', label: 'Raising Hands', category: 'reaction' },
  { id: 'hand-love', label: 'Hands of Love', category: 'reaction' },
];

export const COLORS = {
  background: '#0f172a',
  cardLight: '#f8fafc',
  cardDark: '#1e293b',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  accent: '#2dd4bf',
  categoryText: '#2dd4bf',
} as const;
