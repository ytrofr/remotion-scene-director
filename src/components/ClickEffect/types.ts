/**
 * ClickEffect — types for visual click feedback effects.
 */

export type ClickEffectStyle = 'sunburst' | 'ripple';

export interface ClickEffectProps {
  /** X position of the click point (composition coordinates) */
  x: number;
  /** Y position of the click point (composition coordinates) */
  y: number;
  /** Frame number when the click occurs */
  triggerFrame: number;
  /** Visual style: 'sunburst' (radial lines) or 'ripple' (expanding circle) */
  style?: ClickEffectStyle;
  /** Color of the effect (CSS color string) */
  color?: string;
  /** Radius of the effect in pixels */
  size?: number;
  /** Number of rays for sunburst style (default 12) */
  lineCount?: number;
  /** Duration of the animation in frames */
  duration?: number;
  /** Line width for sunburst rays (default 2) */
  lineWidth?: number;
}
