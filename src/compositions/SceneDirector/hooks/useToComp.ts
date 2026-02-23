/**
 * useToComp - Shared hook for converting client (mouse) coordinates to composition space.
 * Used by WaypointMarkers and DrawingCanvas to avoid duplicated coordinate conversion logic.
 */

import { useCallback } from 'react';

export function useToComp(
  containerRef: React.RefObject<HTMLElement | null>,
  compWidth: number,
  compHeight: number,
) {
  return useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const el = containerRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      const x = Math.round((clientX - rect.left) * (compWidth / rect.width));
      const y = Math.round((clientY - rect.top) * (compHeight / rect.height));
      return {
        x: Math.max(0, Math.min(compWidth, x)),
        y: Math.max(0, Math.min(compHeight, y)),
      };
    },
    [containerRef, compWidth, compHeight],
  );
}
