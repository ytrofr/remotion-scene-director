/**
 * FloatingHand Types
 * Modular hand cursor system for video animations
 */

// Gesture types the hand can display
export type HandGesture =
  | 'pointer'    // Default pointing hand
  | 'click'      // Pressed/clicking state
  | 'drag'       // Dragging/grabbing
  | 'scroll'     // Scrolling gesture
  | 'open'       // Open palm
  | 'thumbsUp'   // Thumbs up gesture
  | 'peace';     // Peace sign

// A point in the hand's animation path
export interface HandPathPoint {
  x: number;
  y: number;
  frame?: number;          // Optional: specific frame to reach this point
  gesture?: HandGesture;   // Optional: gesture at this point
  scale?: number;          // Optional: scale at this point (default 1)
  rotation?: number;       // Optional: override rotation (degrees)
  duration?: number;       // Optional: frames to spend at this point (pause)
}

// Physics configuration
export interface HandPhysicsConfig {
  // Movement physics
  smoothing: number;       // 0-1, how smooth the movement is (higher = smoother)
  velocityScale: number;   // How much velocity affects rotation
  maxRotation: number;     // Maximum rotation in degrees

  // Float/hover effect
  floatAmplitude: number;  // Pixels of vertical float
  floatSpeed: number;      // Speed of float oscillation

  // Shadow
  shadowEnabled: boolean;
  shadowDistance: number;  // Base shadow offset
  shadowBlur: number;      // Shadow blur amount
}

// Default physics config
export const DEFAULT_PHYSICS: HandPhysicsConfig = {
  smoothing: 0.15,
  velocityScale: 0.3,
  maxRotation: 25,
  floatAmplitude: 8,
  floatSpeed: 0.08,
  shadowEnabled: true,
  shadowDistance: 15,
  shadowBlur: 20,
};

// Hand style - Lottie only (professional animations)
export type HandStyle = 'lottie';

// Lottie animation file identifiers (all files in public/lottie/)
export type LottieAnimation =
  | 'hand-click'        // Click/tap gesture (10KB)
  | 'hand-tap'          // Quick tap (14KB)
  | 'hand-tap-alt'      // Alternative tap by James Lashmar (12KB)
  | 'hand-point'        // Pointing finger by Eray Asena (4KB)
  | 'hand-swipe-up'     // Swipe up with arrow indicator (5KB)
  | 'hand-swipe-right'  // Swipe right gesture (5KB)
  | 'hand-scroll'       // Scroll gesture with cards (36KB)
  | 'hand-scroll-clean' // ★ Clean dark finger scroll - no arrow (5KB)
  | 'hand-drag'         // Drag and drop gesture (64KB)
  | 'hand-pinch'        // Pinch zoom by David Tanner (106KB)
  | string;             // Custom animation file

// Props for individual hand style components
export interface HandStyleProps {
  gesture: HandGesture;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  size?: number;
}

// Main FloatingHand component props
export interface FloatingHandProps {
  // Path and animation
  path: HandPathPoint[];
  startFrame?: number;

  // External frame (for rendering outside Remotion Player context)
  // When provided, overrides useCurrentFrame() — allows SceneDirector live preview
  frame?: number;

  // Lottie animation to use
  animation?: LottieAnimation;
  size?: number;

  // Appearance
  dark?: boolean;  // Use dark hand for light backgrounds

  // Physics
  physics?: Partial<HandPhysicsConfig>;

  // Effects
  showRipple?: boolean;
  rippleColor?: string;
}

// Computed hand state at a given frame
export interface HandState {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  gesture: HandGesture;
  velocityX: number;
  velocityY: number;
  isMoving: boolean;
}
