/**
 * Gallery data — category definitions and gesture entries.
 * Organized by FUNCTION (what it does) not by asset type.
 * Extracted from GalleryView.tsx to keep the UI file under 500 lines.
 */

export type Category =
  | 'tap'
  | 'swipe-scroll'
  | 'touch-drag'
  | 'click-effects'
  | 'cursor-states'
  | 'pointers'
  | 'pointer-animations';

export interface GalleryGesture {
  id: string;
  label: string;
  category: Category;
  installed: boolean;
  source?: string;
  url?: string;
  /** Which picker this entry belongs to (e.g., 'hand:click', 'pointer', 'click-effect') */
  pickerSlot?: string;
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'tap', label: 'Tap Gestures' },
  { id: 'swipe-scroll', label: 'Swipe & Scroll' },
  { id: 'touch-drag', label: 'Touch & Drag' },
  { id: 'click-effects', label: 'Click Effects' },
  { id: 'cursor-states', label: 'Cursor States' },
  { id: 'pointers', label: 'Pointers' },
  { id: 'pointer-animations', label: 'Pointer Animations' },
];

// ═══════════════════════════════════════════
//  Pointer Shape Grouping (7 shapes, 51 variants)
// ═══════════════════════════════════════════

export interface PointerVariant {
  id: string;
  color: string;
  style: string;
}

export interface PointerShape {
  name: string;
  variants: PointerVariant[];
}

export const POINTER_SHAPES: PointerShape[] = [
  {
    name: 'Compact',
    variants: [
      { id: 'cursor-ptr-compact', color: 'Black', style: 'Filled' },
      { id: 'cursor-ptr-compact-thin', color: 'Black', style: 'Outline 3px' },
      { id: 'cursor-ptr-compact-out', color: 'Black', style: 'Outline 5px' },
      { id: 'cursor-ptr-compact-heavy', color: 'Black', style: 'Outline 8px' },
      { id: 'cursor-ptr-compact-inv', color: 'Gray', style: 'Inverted' },
    ],
  },
  {
    name: 'Mid-Wing',
    variants: [
      { id: 'cursor-ptr-midwing', color: 'Black', style: 'Filled' },
      { id: 'cursor-ptr-midwing-out', color: 'Black', style: 'Outline 5px' },
    ],
  },
  {
    name: 'Real Arrow',
    variants: [
      { id: 'cursor-exp-resized-real', color: 'Dark Gray', style: 'Filled' },
      {
        id: 'cursor-exp-resized-anim',
        color: 'Dark Gray',
        style: 'Filled + Click',
      },
      { id: 'cursor-real-dblclick', color: 'Dark Gray', style: 'DblClick' },
      { id: 'cursor-real-inv-dark', color: 'Dark Gray', style: 'Inverted' },
      { id: 'cursor-real-black', color: 'Black', style: 'Filled' },
      {
        id: 'cursor-real-black-click',
        color: 'Black',
        style: 'Filled + Click',
      },
      { id: 'cursor-real-outline-3px', color: 'Black', style: 'Outline 3px' },
      {
        id: 'cursor-real-outline-3-click',
        color: 'Black',
        style: 'Outline 3px + Click',
      },
      { id: 'cursor-real-outline-5px', color: 'Black', style: 'Outline 5px' },
      {
        id: 'cursor-real-outline-5-click',
        color: 'Black',
        style: 'Outline 5px + Click',
      },
      { id: 'cursor-real-outline-7px', color: 'Black', style: 'Outline 7px' },
      {
        id: 'cursor-real-outline-7-click',
        color: 'Black',
        style: 'Outline 7px + Click',
      },
      { id: 'cursor-real-charcoal', color: 'Charcoal', style: 'Filled' },
      {
        id: 'cursor-real-charcoal-click',
        color: 'Charcoal',
        style: 'Filled + Click',
      },
      { id: 'cursor-real-slate', color: 'Slate', style: 'Filled' },
      {
        id: 'cursor-real-slate-click',
        color: 'Slate',
        style: 'Filled + Click',
      },
      { id: 'cursor-real-navy', color: 'Navy', style: 'Filled' },
      { id: 'cursor-real-navy-click', color: 'Navy', style: 'Filled + Click' },
      { id: 'cursor-real-navy-out', color: 'Navy', style: 'Outline' },
      { id: 'cursor-real-teal', color: 'Teal', style: 'Filled' },
      { id: 'cursor-real-teal-out', color: 'Teal', style: 'Outline' },
    ],
  },
];

/** Get unique colors/styles for a shape, optionally cross-filtered */
export function getShapeOptions(
  shape: PointerShape,
  filterColor?: string,
  filterStyle?: string,
): { colors: string[]; styles: string[] } {
  const filteredForStyles = filterColor
    ? shape.variants.filter((v) => v.color === filterColor)
    : shape.variants;
  const filteredForColors = filterStyle
    ? shape.variants.filter((v) => v.style === filterStyle)
    : shape.variants;
  return {
    colors: [...new Set(filteredForColors.map((v) => v.color))],
    styles: [...new Set(filteredForStyles.map((v) => v.style))],
  };
}

/** Find variant matching color + style, or first available */
export function findVariant(
  shape: PointerShape,
  color: string,
  style: string,
): PointerVariant {
  return (
    shape.variants.find((v) => v.color === color && v.style === style) ||
    shape.variants[0]
  );
}

export const GESTURES: GalleryGesture[] = [
  // ═══════════════════════════════════════════
  //  Tap Gestures (6)
  // ═══════════════════════════════════════════
  {
    id: 'hand-click',
    label: 'Click',
    category: 'tap',
    installed: true,
    pickerSlot: 'hand:click',
  },
  {
    id: 'hand-tap',
    label: 'Tap',
    category: 'tap',
    installed: true,
    pickerSlot: 'hand:click',
  },
  {
    id: 'hand-tap-alt',
    label: 'Tap Alt',
    category: 'tap',
    installed: true,
    pickerSlot: 'hand:click',
  },
  {
    id: 'hand-double-tap',
    label: 'Double Tap',
    category: 'tap',
    installed: true,
    source: 'David Tanner (FREE)',
  },
  {
    id: 'hand-double-tap-2f',
    label: '2-Finger Double Tap',
    category: 'tap',
    installed: true,
    source: 'David Tanner (FREE)',
  },
  {
    id: 'hand-single-tap',
    label: 'Single Tap (DT)',
    category: 'tap',
    installed: true,
    source: 'David Tanner (FREE)',
  },

  // ═══════════════════════════════════════════
  //  Swipe & Scroll (7)
  // ═══════════════════════════════════════════
  {
    id: 'hand-swipe-up',
    label: 'Swipe Up',
    category: 'swipe-scroll',
    installed: true,
    pickerSlot: 'hand:swipe',
  },
  {
    id: 'hand-scroll-clean',
    label: 'Scroll',
    category: 'swipe-scroll',
    installed: true,
    pickerSlot: 'hand:scroll',
  },
  {
    id: 'hand-swipe-right',
    label: 'Swipe Right',
    category: 'swipe-scroll',
    installed: true,
    source: 'David Tanner (FREE)',
  },
  {
    id: 'hand-swipe-left',
    label: 'Swipe Left',
    category: 'swipe-scroll',
    installed: true,
    source: 'Fazal Shah (FREE)',
  },
  {
    id: 'hand-swipe-down',
    label: 'Swipe Down',
    category: 'swipe-scroll',
    installed: true,
    source: 'Fazal Shah (FREE)',
  },
  {
    id: 'hand-swipe-right-alt',
    label: 'Swipe Right (Fazal)',
    category: 'swipe-scroll',
    installed: true,
    source: 'Fazal Shah (FREE)',
  },
  {
    id: 'hand-swipe-up-alt',
    label: 'Swipe Up (Aubry)',
    category: 'swipe-scroll',
    installed: true,
    source: 'Vinzenz Aubry (FREE)',
  },

  // ═══════════════════════════════════════════
  //  Touch & Drag (5)
  // ═══════════════════════════════════════════
  {
    id: 'hand-drag',
    label: 'Drag',
    category: 'touch-drag',
    installed: true,
    pickerSlot: 'hand:drag',
  },
  {
    id: 'hand-pinch',
    label: 'Pinch',
    category: 'touch-drag',
    installed: true,
    pickerSlot: 'hand:drag',
  },
  {
    id: 'hand-point',
    label: 'Point',
    category: 'touch-drag',
    installed: true,
    pickerSlot: 'hand:point',
  },
  {
    id: 'hand-click-gesture',
    label: 'Click Gesture',
    category: 'touch-drag',
    installed: true,
    source: 'Vinzenz Aubry (FREE)',
  },

  // ═══════════════════════════════════════════
  //  Click Effects — Picker Styles (7) + Standalone (11)
  // ═══════════════════════════════════════════
  // Click styles for toolbar picker (composed via buildClickAnimationFile)
  {
    id: 'click',
    label: 'Press',
    category: 'click-effects',
    installed: true,
    pickerSlot: 'click-effect',
  },
  {
    id: 'click-burst',
    label: 'Burst',
    category: 'click-effects',
    installed: true,
    pickerSlot: 'click-effect',
  },
  {
    id: 'click-burst-soft',
    label: 'Soft Burst',
    category: 'click-effects',
    installed: true,
    pickerSlot: 'click-effect',
  },
  {
    id: 'click-burst-soft-sm',
    label: 'Soft Small',
    category: 'click-effects',
    installed: true,
    pickerSlot: 'click-effect',
  },
  {
    id: 'click-burst-soft-xs',
    label: 'Soft Tiny',
    category: 'click-effects',
    installed: true,
    pickerSlot: 'click-effect',
  },
  {
    id: 'click-burst-soft-4',
    label: '4-Ray',
    category: 'click-effects',
    installed: true,
    pickerSlot: 'click-effect',
  },
  {
    id: 'click-burst-soft-4-sm',
    label: '4-Ray Small',
    category: 'click-effects',
    installed: true,
    pickerSlot: 'click-effect',
  },
  // Standalone sunburst Lotties
  {
    id: 'click-sunburst',
    label: 'Sunburst',
    category: 'click-effects',
    installed: true,
    source: 'Generated (12-ray cyan)',
  },
  {
    id: 'click-sunburst-soft',
    label: 'Sunburst Soft',
    category: 'click-effects',
    installed: true,
    source: 'Generated (8-ray soft)',
  },
  {
    id: 'click-sunburst-soft-sm',
    label: 'Sunburst Soft Sm',
    category: 'click-effects',
    installed: true,
    source: 'Generated (8-ray 50%)',
  },
  {
    id: 'click-sunburst-soft-xs',
    label: 'Sunburst Soft Xs',
    category: 'click-effects',
    installed: true,
    source: 'Generated (8-ray 30%)',
  },
  {
    id: 'click-sunburst-soft-4',
    label: 'Sunburst 4-Ray',
    category: 'click-effects',
    installed: true,
    source: 'Generated (4-ray cardinal)',
  },
  {
    id: 'click-sunburst-soft-4-sm',
    label: 'Sunburst 4-Ray Sm',
    category: 'click-effects',
    installed: true,
    source: 'Generated (4-ray 50%)',
  },
  {
    id: 'cursor-click-effect',
    label: 'Click Effect',
    category: 'click-effects',
    installed: true,
    source: 'LottieFiles (FREE)',
  },
  {
    id: 'cursor-click-indicator',
    label: 'Click Indicator',
    category: 'click-effects',
    installed: true,
    source: 'Andrey K. (FREE)',
  },
  {
    id: 'hand-cursor-click',
    label: 'Cursor Click Here',
    category: 'click-effects',
    installed: true,
    source: 'Ronald P. (FREE)',
  },
  {
    id: 'cursor-mouse-click',
    label: 'Mouse Cursor',
    category: 'click-effects',
    installed: true,
    source: 'Batuhan Unlu (FREE)',
  },

  // ═══════════════════════════════════════════
  //  Cursor States (9)
  // ═══════════════════════════════════════════
  {
    id: 'cursor-mouse-scroll',
    label: 'Mouse Scroll',
    category: 'cursor-states',
    installed: true,
    source: 'LottieFiles (FREE)',
  },
  {
    id: 'cursor-mouse-scroll-dark',
    label: 'Mouse Scroll (Dark)',
    category: 'cursor-states',
    installed: true,
    source: 'LottieFiles (FREE)',
  },
  {
    id: 'cursor-right-click-drag',
    label: 'Right-Click Drag',
    category: 'cursor-states',
    installed: true,
    source: 'LottieFiles (FREE)',
  },

  // ═══════════════════════════════════════════
  //  Pointers (51 — merged simple + filled + outline)
  // ═══════════════════════════════════════════
  // Simple (4-point, generated)
  {
    id: 'cursor-ptr-compact',
    label: 'Ptr Compact',
    category: 'pointers',
    installed: true,
    source: 'Generated (filled)',
  },
  {
    id: 'cursor-ptr-compact-out',
    label: 'Compact Outline',
    category: 'pointers',
    installed: true,
    source: 'Generated (outline)',
  },
  {
    id: 'cursor-ptr-compact-thin',
    label: 'Compact Thin',
    category: 'pointers',
    installed: true,
    source: 'Generated (outline)',
  },
  {
    id: 'cursor-ptr-compact-heavy',
    label: 'Compact Bold',
    category: 'pointers',
    installed: true,
    source: 'Generated (outline)',
  },
  {
    id: 'cursor-ptr-compact-inv',
    label: 'Compact Inverted',
    category: 'pointers',
    installed: true,
    source: 'Generated (inverted)',
  },
  {
    id: 'cursor-ptr-midwing',
    label: 'Mid-Wing',
    category: 'pointers',
    installed: true,
    source: 'Generated (filled)',
  },
  {
    id: 'cursor-ptr-midwing-out',
    label: 'Mid-Wing Outline',
    category: 'pointers',
    installed: true,
    source: 'Generated (outline)',
  },
  // Filled (tailed, resized from cursor-arrow.json)
  {
    id: 'cursor-exp-resized-real',
    label: 'Real Arrow (dark gray)',
    category: 'pointers',
    installed: true,
    source: 'cursor-arrow.json -> 200x200',
    pickerSlot: 'pointer',
  },
  {
    id: 'cursor-exp-resized-anim',
    label: 'Real Arrow + Click',
    category: 'pointers',
    installed: true,
    source: 'cursor-arrow.json + pulse',
  },
  {
    id: 'cursor-real-black',
    label: 'Black',
    category: 'pointers',
    installed: true,
    source: 'Resized (filled)',
    pickerSlot: 'pointer',
  },
  {
    id: 'cursor-real-charcoal',
    label: 'Charcoal',
    category: 'pointers',
    installed: true,
    source: 'Resized (filled)',
    pickerSlot: 'pointer',
  },
  {
    id: 'cursor-real-slate',
    label: 'Slate',
    category: 'pointers',
    installed: true,
    source: 'Resized (filled)',
  },
  {
    id: 'cursor-real-navy',
    label: 'Navy',
    category: 'pointers',
    installed: true,
    source: 'Resized (filled)',
  },
  {
    id: 'cursor-real-teal',
    label: 'Teal',
    category: 'pointers',
    installed: true,
    source: 'Resized (filled)',
    pickerSlot: 'pointer',
  },
  {
    id: 'cursor-real-black-click',
    label: 'Black + Click',
    category: 'pointers',
    installed: true,
    source: 'Resized (click)',
  },
  {
    id: 'cursor-real-charcoal-click',
    label: 'Charcoal + Click',
    category: 'pointers',
    installed: true,
    source: 'Resized (click)',
  },
  {
    id: 'cursor-real-slate-click',
    label: 'Slate + Click',
    category: 'pointers',
    installed: true,
    source: 'Resized (click)',
  },
  {
    id: 'cursor-real-navy-click',
    label: 'Navy + Click',
    category: 'pointers',
    installed: true,
    source: 'Resized (click)',
  },
  {
    id: 'cursor-real-dblclick',
    label: 'Dark Gray + DblClick',
    category: 'pointers',
    installed: true,
    source: 'Resized (dblclick)',
  },
  // Outline (tailed, resized from cursor-arrow.json)
  {
    id: 'cursor-real-outline-3px',
    label: 'Outline 3px',
    category: 'pointers',
    installed: true,
    source: 'Resized (outline)',
  },
  {
    id: 'cursor-real-outline-5px',
    label: 'Outline 5px',
    category: 'pointers',
    installed: true,
    source: 'Resized (outline)',
    pickerSlot: 'pointer',
  },
  {
    id: 'cursor-real-outline-7px',
    label: 'Outline 7px',
    category: 'pointers',
    installed: true,
    source: 'Resized (outline)',
  },
  {
    id: 'cursor-real-inv-dark',
    label: 'Inverted Dark',
    category: 'pointers',
    installed: true,
    source: 'Resized (inverted)',
  },
  {
    id: 'cursor-real-outline-3-click',
    label: 'Outline 3px + Click',
    category: 'pointers',
    installed: true,
    source: 'Resized (outline+click)',
  },
  {
    id: 'cursor-real-outline-5-click',
    label: 'Outline 5px + Click',
    category: 'pointers',
    installed: true,
    source: 'Resized (outline+click)',
  },
  {
    id: 'cursor-real-outline-7-click',
    label: 'Outline 7px + Click',
    category: 'pointers',
    installed: true,
    source: 'Resized (outline+click)',
  },
  {
    id: 'cursor-real-teal-out',
    label: 'Teal Outline',
    category: 'pointers',
    installed: true,
    source: 'Resized (outline)',
  },
  {
    id: 'cursor-real-navy-out',
    label: 'Navy Outline',
    category: 'pointers',
    installed: true,
    source: 'Resized (outline)',
  },

  // ═══════════════════════════════════════════
  //  Pointer Animations (14 — generated demos, 7 types x 2 bases)
  // ═══════════════════════════════════════════
  // Filled base (cursor-exp-resized-real)
  {
    id: 'cursor-anim-filled-click',
    label: 'Filled Click',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (filled+click)',
  },
  {
    id: 'cursor-anim-filled-dblclick',
    label: 'Filled DblClick',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (filled+dblclick)',
  },
  {
    id: 'cursor-anim-filled-slide',
    label: 'Filled Slide',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (filled+slide)',
  },
  {
    id: 'cursor-anim-filled-wobble',
    label: 'Filled Wobble',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (filled+wobble)',
  },
  {
    id: 'cursor-anim-filled-idle',
    label: 'Filled Idle',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (filled+idle)',
  },
  {
    id: 'cursor-anim-filled-drag',
    label: 'Filled Drag',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (filled+drag)',
  },
  {
    id: 'cursor-anim-filled-bounce',
    label: 'Filled Bounce',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (filled+bounce)',
  },
  // Outline base (cursor-real-outline-5px)
  {
    id: 'cursor-anim-outline-click',
    label: 'Outline Click',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+click)',
  },
  {
    id: 'cursor-anim-outline-dblclick',
    label: 'Outline DblClick',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+dblclick)',
  },
  {
    id: 'cursor-anim-outline-slide',
    label: 'Outline Slide',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+slide)',
  },
  {
    id: 'cursor-anim-outline-wobble',
    label: 'Outline Wobble',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+wobble)',
  },
  {
    id: 'cursor-anim-outline-idle',
    label: 'Outline Idle',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+idle)',
  },
  {
    id: 'cursor-anim-outline-drag',
    label: 'Outline Drag',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+drag)',
  },
  {
    id: 'cursor-anim-outline-bounce',
    label: 'Outline Bounce',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+bounce)',
  },

  // ═══════════════════════════════════════════
  //  Real Arrow Animations (26 — 13 types x 2 bases)
  // ═══════════════════════════════════════════
  // Real Arrow — Black base (13)
  {
    id: 'cursor-real-anim-black-click',
    label: 'RA Black Click',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+click)',
  },
  {
    id: 'cursor-real-anim-black-dblclick',
    label: 'RA Black DblClick',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+dblclick)',
  },
  {
    id: 'cursor-real-anim-black-slide',
    label: 'RA Black Slide',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+slide)',
  },
  {
    id: 'cursor-real-anim-black-wobble',
    label: 'RA Black Wobble',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+wobble)',
  },
  {
    id: 'cursor-real-anim-black-idle',
    label: 'RA Black Idle',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+idle)',
  },
  {
    id: 'cursor-real-anim-black-drag',
    label: 'RA Black Drag',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+drag)',
  },
  {
    id: 'cursor-real-anim-black-bounce',
    label: 'RA Black Bounce',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+bounce)',
  },
  {
    id: 'cursor-real-anim-black-swish-trail',
    label: 'RA Black Swish Trail',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+swish-trail)',
  },
  {
    id: 'cursor-real-anim-black-swish-dash',
    label: 'RA Black Swish Dash',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+swish-dash)',
  },
  {
    id: 'cursor-real-anim-black-swish-slide',
    label: 'RA Black Swish Slide',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+swish-slide)',
  },
  {
    id: 'cursor-real-anim-black-hover-pulse',
    label: 'RA Black Hover Pulse',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+hover-pulse)',
  },
  {
    id: 'cursor-real-anim-black-click-burst',
    label: 'RA Black Click Burst',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+sunburst)',
  },
  {
    id: 'cursor-real-anim-black-click-burst-soft',
    label: 'RA Black Burst Soft',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+sunburst-soft)',
  },
  {
    id: 'cursor-real-anim-black-click-burst-soft-sm',
    label: 'RA Black Burst Soft Sm',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+sunburst-soft 50%)',
  },
  {
    id: 'cursor-real-anim-black-click-burst-soft-xs',
    label: 'RA Black Burst Soft Xs',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+sunburst-soft 30%)',
  },
  {
    id: 'cursor-real-anim-black-click-burst-soft-4',
    label: 'RA Black Burst 4-Ray',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+4-ray cardinal)',
  },
  {
    id: 'cursor-real-anim-black-click-burst-soft-4-sm',
    label: 'RA Black Burst 4-Ray Sm',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (black+4-ray 50%)',
  },
  // Real Arrow — Outline base (13 + 4 burst variants)
  {
    id: 'cursor-real-anim-outline-click',
    label: 'RA Outline Click',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+click)',
  },
  {
    id: 'cursor-real-anim-outline-dblclick',
    label: 'RA Outline DblClick',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+dblclick)',
  },
  {
    id: 'cursor-real-anim-outline-slide',
    label: 'RA Outline Slide',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+slide)',
  },
  {
    id: 'cursor-real-anim-outline-wobble',
    label: 'RA Outline Wobble',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+wobble)',
  },
  {
    id: 'cursor-real-anim-outline-idle',
    label: 'RA Outline Idle',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+idle)',
  },
  {
    id: 'cursor-real-anim-outline-drag',
    label: 'RA Outline Drag',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+drag)',
  },
  {
    id: 'cursor-real-anim-outline-bounce',
    label: 'RA Outline Bounce',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+bounce)',
  },
  {
    id: 'cursor-real-anim-outline-swish-trail',
    label: 'RA Outline Swish Trail',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+swish-trail)',
  },
  {
    id: 'cursor-real-anim-outline-swish-dash',
    label: 'RA Outline Swish Dash',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+swish-dash)',
  },
  {
    id: 'cursor-real-anim-outline-swish-slide',
    label: 'RA Outline Swish Slide',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+swish-slide)',
  },
  {
    id: 'cursor-real-anim-outline-hover-pulse',
    label: 'RA Outline Hover Pulse',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+hover-pulse)',
  },
  {
    id: 'cursor-real-anim-outline-click-burst',
    label: 'RA Outline Click Burst',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+sunburst)',
  },
  {
    id: 'cursor-real-anim-outline-click-burst-soft',
    label: 'RA Outline Burst Soft',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+sunburst-soft)',
  },
  {
    id: 'cursor-real-anim-outline-click-burst-soft-sm',
    label: 'RA Outline Burst Soft Sm',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+sunburst-soft 50%)',
  },
  {
    id: 'cursor-real-anim-outline-click-burst-soft-xs',
    label: 'RA Outline Burst Soft Xs',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+sunburst-soft 30%)',
  },
  {
    id: 'cursor-real-anim-outline-click-burst-soft-4',
    label: 'RA Outline Burst 4-Ray',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+4-ray cardinal)',
  },
  {
    id: 'cursor-real-anim-outline-click-burst-soft-4-sm',
    label: 'RA Outline Burst 4-Ray Sm',
    category: 'pointer-animations',
    installed: true,
    source: 'Generated (outline+4-ray 50%)',
  },
];
