/**
 * SceneDirector Context v3
 * Provides state, dispatch, frame, playerRef, derived values, and active gesture preset.
 */

import React, { createContext, useContext, type Dispatch, type RefObject } from 'react';
import type { PlayerRef } from '@remotion/player';
import type { HandPathPoint } from '../../components/FloatingHand/types';
import type { DirectorState, DirectorAction, CompositionEntry, SceneInfo } from './state';
import type { GesturePreset } from './gestures';

export interface DirectorContextValue {
  state: DirectorState;
  dispatch: Dispatch<DirectorAction>;
  frame: number;
  playerRef: RefObject<PlayerRef | null>;
  composition: CompositionEntry;
  currentScene: SceneInfo | null;
  sceneWaypoints: HandPathPoint[];
  effectiveWaypoints: HandPathPoint[];
  activePreset: GesturePreset | null;
  scenePreset: GesturePreset | null;
  canUndo: boolean;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
}

const Ctx = createContext<DirectorContextValue>(null!);

export const DirectorProvider = Ctx.Provider;

export function useDirector(): DirectorContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDirector must be used within DirectorProvider');
  return ctx;
}
