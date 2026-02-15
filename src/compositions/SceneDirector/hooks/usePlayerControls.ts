/**
 * Player zoom/pan controls hook.
 * Smooth zoom via CSS transition (GPU-composited) — no rAF/setState loop.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

const ZOOM_MIN = 1;
const ZOOM_MAX = 6;
const ZOOM_FACTOR = 1.18; // 18% per wheel tick

export function usePlayerControls(compositionId: string) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const playerAreaRef = useRef<HTMLDivElement>(null);

  // Wheel zoom — sets state directly, CSS transition handles smoothing
  useEffect(() => {
    const el = playerAreaRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      setZoom(prev => {
        const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev * direction));
        if (next <= ZOOM_MIN) setPan({ x: 0, y: 0 });
        return next;
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  }, [pan]);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Reset zoom on composition change
  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, [compositionId]);

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    playerAreaRef,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  };
}
