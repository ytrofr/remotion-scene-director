/**
 * SceneDirector Utilities v3
 * Coordinate conversion, path simplification, gesture-aware export, import parser.
 */

import type { HandPathPoint, HandGesture } from '../../components/FloatingHand/types';
import { DEFAULT_PHYSICS } from '../../components/FloatingHand/types';
import type { SceneInfo } from './state';
import { GESTURE_PRESETS, type GestureTool } from './gestures';

// Convert mouse event to composition coordinates
export function mouseToComp(
  e: React.MouseEvent,
  container: HTMLElement,
  previewScale: number,
  compWidth: number,
  compHeight: number,
): { x: number; y: number } {
  const rect = container.getBoundingClientRect();
  const x = Math.round(((e.clientX - rect.left) / previewScale) * (compWidth / rect.width) * previewScale);
  const y = Math.round(((e.clientY - rect.top) / previewScale) * (compHeight / rect.height) * previewScale);
  return { x: Math.max(0, Math.min(compWidth, x)), y: Math.max(0, Math.min(compHeight, y)) };
}

// Simplify a raw path using Ramer-Douglas-Peucker
export function simplifyPath(
  points: { x: number; y: number }[],
  epsilon: number = 15,
): { x: number; y: number }[] {
  if (points.length <= 2) return points;

  const first = points[0];
  const last = points[points.length - 1];

  let maxDist = 0;
  let maxIndex = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDist(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      maxIndex = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), epsilon);
    const right = simplifyPath(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

function perpendicularDist(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

// Distribute frame numbers across waypoints
export function distributeFrames(
  waypoints: HandPathPoint[],
  startFrame: number,
  totalFrames: number,
): HandPathPoint[] {
  if (waypoints.length === 0) return [];
  if (waypoints.length === 1) return [{ ...waypoints[0], frame: startFrame }];

  return waypoints.map((wp, i) => ({
    ...wp,
    frame: startFrame + Math.round((i / (waypoints.length - 1)) * totalFrames),
  }));
}

// Generate export code for a single scene (gesture-aware)
export function generateExportCode(
  sceneName: string,
  compositionId: string,
  scene: SceneInfo,
  waypoints: HandPathPoint[],
  gestureTool: GestureTool,
): string {
  const preset = GESTURE_PRESETS[gestureTool];
  const merged = { ...DEFAULT_PHYSICS, ...preset.physics };

  const wpCode = waypoints
    .map((wp) => {
      const parts = [`x: ${wp.x}`, `y: ${wp.y}`];
      if (wp.frame !== undefined) parts.push(`frame: ${wp.frame}`);
      if (wp.gesture) parts.push(`gesture: '${wp.gesture}'`);
      if (wp.scale !== undefined && wp.scale !== 1) parts.push(`scale: ${wp.scale}`);
      if (wp.rotation !== undefined) parts.push(`rotation: ${wp.rotation}`);
      if (wp.duration !== undefined && wp.duration > 0) parts.push(`duration: ${wp.duration}`);
      return `  { ${parts.join(', ')} },`;
    })
    .join('\n');

  return `// Scene: ${sceneName} (frames ${scene.start}-${scene.end})
// Composition: ${compositionId}
// Gesture: ${gestureTool} | Animation: ${preset.animation} | Size: ${preset.size}

const handPath: HandPathPoint[] = [
${wpCode}
];

<FloatingHand
  path={handPath}
  animation="${preset.animation}"
  size={${preset.size}}
  showRipple={${preset.showRipple}}${preset.dark ? '\n  dark={true}' : ''}
  physics={{
    smoothing: ${merged.smoothing},
    velocityScale: ${merged.velocityScale},
    maxRotation: ${merged.maxRotation},
    floatAmplitude: ${merged.floatAmplitude},
    floatSpeed: ${merged.floatSpeed},
  }}
/>`;
}

// Generate export for ALL scenes
export function generateAllExportCode(
  compositionId: string,
  scenes: SceneInfo[],
  waypoints: Record<string, HandPathPoint[]>,
  sceneGestures: Record<string, GestureTool>,
): string {
  const parts: string[] = [];

  for (const scene of scenes) {
    const wps = waypoints[scene.name];
    if (!wps || wps.length === 0) continue;
    const gesture = sceneGestures[scene.name] || 'click';
    parts.push(generateExportCode(scene.name, compositionId, scene, wps, gesture));
  }

  return parts.join('\n\n// ────────────────────────────────────\n\n');
}

// Parse imported code to extract HandPathPoint[]
export function parseImportCode(code: string): { waypoints: HandPathPoint[]; gesture: GestureTool } | null {
  // Try to detect gesture type from comment
  const gestureMatch = code.match(/Gesture:\s*(\w+)/i);
  const gesture: GestureTool = (gestureMatch?.[1] as GestureTool) || 'click';

  // Match array of objects: { x: N, y: N, ... }
  const objectPattern = /\{\s*x:\s*(-?\d+)\s*,\s*y:\s*(-?\d+)([^}]*)\}/g;
  const waypoints: HandPathPoint[] = [];
  let match;

  while ((match = objectPattern.exec(code)) !== null) {
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    const rest = match[3];

    const wp: HandPathPoint = { x, y, scale: 1 };

    // Parse optional fields
    const frameMatch = rest.match(/frame:\s*(-?\d+)/);
    if (frameMatch) wp.frame = parseInt(frameMatch[1], 10);

    const gestureFieldMatch = rest.match(/gesture:\s*'(\w+)'/);
    if (gestureFieldMatch) wp.gesture = gestureFieldMatch[1] as HandGesture;

    const scaleMatch = rest.match(/scale:\s*([\d.]+)/);
    if (scaleMatch) wp.scale = parseFloat(scaleMatch[1]);

    const rotationMatch = rest.match(/rotation:\s*(-?[\d.]+)/);
    if (rotationMatch) wp.rotation = parseFloat(rotationMatch[1]);

    const durationMatch = rest.match(/duration:\s*(\d+)/);
    if (durationMatch) wp.duration = parseInt(durationMatch[1], 10);

    waypoints.push(wp);
  }

  if (waypoints.length === 0) return null;

  // Validate gesture is a known type
  const validGestures: GestureTool[] = ['click', 'scroll', 'drag', 'swipe', 'point'];
  const resolvedGesture = validGestures.includes(gesture) ? gesture : 'click';

  return { waypoints, gesture: resolvedGesture };
}
