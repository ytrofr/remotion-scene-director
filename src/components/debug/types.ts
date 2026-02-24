/**
 * Shared debug types for composition debug overlays.
 *
 * Used by DebugClickMarkers, DebugSceneOverlay, DebugPathVisualization,
 * and DebugSceneTimeline across all compositions.
 */

/** A click marker placed by the user during interactive debug. */
export interface DebugMarker {
  x: number;
  y: number;
  frame: number;
  label?: string;
  color?: string;
}

/** Scene metadata for debug overlays and timelines. */
export interface DebugSceneInfo {
  name: string;
  start: number;
  end: number;
  hand?: string;
  gesture?: string;
  part?: string;
}

/** Extended marker with scene context, used for hand path visualization. */
export interface DebugPathMarker extends DebugMarker {
  scene?: string;
  desc?: string;
}
