/**
 * Context to suppress FloatingHand rendering inside Remotion compositions
 * when the SceneDirector overlay provides its own hand preview.
 */
import { createContext, useContext } from 'react';

const SceneDirectorModeCtx = createContext(false);

export const SceneDirectorModeProvider = SceneDirectorModeCtx.Provider;

export function useSceneDirectorMode(): boolean {
  return useContext(SceneDirectorModeCtx);
}
