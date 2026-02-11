/**
 * DashmorDemo Scene Types
 */

export interface SceneProps {
  /** Current frame within this scene (0 = scene start) */
  frame: number;
  /** Total frames for this scene */
  durationInFrames: number;
  /** Scroll Y position for this scene */
  scrollY: number;
  /** Next scroll Y (for transition scenes) */
  nextScrollY?: number;
}

export interface SectionSceneProps extends SceneProps {
  /** Section title for callout */
  title: string;
  /** Section subtitle for callout */
  subtitle: string;
  /** Callout position */
  calloutPosition: 'top' | 'bottom';
  /** Whether this scene includes scroll transition at end */
  hasScrollTransition: boolean;
  /** Frames to pause before scrolling */
  pauseFrames: number;
  /** Frames for scroll transition */
  scrollFrames: number;
}
