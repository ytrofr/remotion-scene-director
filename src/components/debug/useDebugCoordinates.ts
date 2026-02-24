/**
 * Hook for converting screen coordinates to composition-space coordinates.
 *
 * Uses getBoundingClientRect() (rule 4) for coordinate conversion.
 * Stores click markers in state for interactive debug overlays.
 */
import { useState, useCallback } from 'react';
import type { DebugMarker } from './types';

interface UseDebugCoordinatesReturn {
  mousePos: { x: number; y: number };
  handleMouseMove: (e: React.MouseEvent) => void;
  handleClick: (e: React.MouseEvent, frame: number) => void;
  markers: DebugMarker[];
  clearMarkers: () => void;
}

export function useDebugCoordinates(
  compositionWidth: number,
  compositionHeight: number,
): UseDebugCoordinatesReturn {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [markers, setMarkers] = useState<DebugMarker[]>([]);

  const getCompositionCoords = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const scaleX = compositionWidth / rect.width;
      const scaleY = compositionHeight / rect.height;
      return {
        x: Math.round((e.clientX - rect.left) * scaleX),
        y: Math.round((e.clientY - rect.top) * scaleY),
      };
    },
    [compositionWidth, compositionHeight],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      setMousePos(getCompositionCoords(e));
    },
    [getCompositionCoords],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent, frame: number) => {
      const { x, y } = getCompositionCoords(e);
      const label = `M${markers.length + 1}`;
      setMarkers((prev) => [...prev, { x, y, frame, label }]);
      console.log(`MARKER ${label}: (${x}, ${y}) @ frame ${frame}`);
    },
    [getCompositionCoords, markers.length],
  );

  const clearMarkers = useCallback(() => {
    setMarkers([]);
  }, []);

  return { mousePos, handleMouseMove, handleClick, markers, clearMarkers };
}
