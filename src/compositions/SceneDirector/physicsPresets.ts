/**
 * physicsPresets — single registry of named physics configs.
 *
 * The Inspector physics dropdown reads keys from here. FloatingHand's
 * SD override merge resolves a `physicsPreset` field from saved JSON
 * via this registry. Production scene files keep their own
 * `HAND_PHYSICS.scrollbar` / `HAND_PHYSICS.tap` references — this
 * registry mirrors them by name so SD's "scrollbar" preset == the
 * production scene's physics config. Single source of truth.
 *
 * When you add a new preset, add it here AND export it from one of the
 * source files (DorianDemo/constants.ts or SceneDirector/gestures.ts).
 */
import type { HandPhysicsConfig } from '../../components/FloatingHand/types';
import { HAND_PHYSICS } from '../DorianDemo/constants';
import { PHYSICS_PRESETS } from './gestures';

/** Available preset name → config map. Keys are stable IDs (saved in JSON). */
export const PHYSICS_PRESET_REGISTRY: Record<
  string,
  Partial<HandPhysicsConfig>
> = {
  // Dorian-tuned presets (used by production scenes today)
  scrollbar: HAND_PHYSICS.scrollbar,
  scroll: HAND_PHYSICS.scroll,
  tap: HAND_PHYSICS.tap,
  tapGentle: HAND_PHYSICS.tapGentle,
  trail: HAND_PHYSICS.trail,
  trailResponsive: HAND_PHYSICS.trailResponsive,
  // SD gesture presets (used by Inspector defaults)
  professional: PHYSICS_PRESETS.professional,
  snappy: PHYSICS_PRESETS.snappy,
  floaty: PHYSICS_PRESETS.floaty,
};

/** Stable ordered list for UI (Inspector dropdown). */
export const PHYSICS_PRESET_ORDER: string[] = [
  'scrollbar',
  'tap',
  'tapGentle',
  'trail',
  'trailResponsive',
  'scroll',
  'professional',
  'snappy',
  'floaty',
];

/** Resolve a preset name to its config; null if name is unknown. */
export function resolvePhysicsPreset(
  name: string | undefined,
): Partial<HandPhysicsConfig> | null {
  if (!name) return null;
  return PHYSICS_PRESET_REGISTRY[name] ?? null;
}
