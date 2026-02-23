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

  // Refs for current zoom/pan so wheel handler reads latest values
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const panRef = useRef(pan);
  panRef.current = pan;

  // Wheel zoom toward cursor position
  useEffect(() => {
    const el = playerAreaRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      const oldZoom = zoomRef.current;
      const oldPan = panRef.current;
      const newZoom = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, oldZoom * direction),
      );

      if (newZoom <= ZOOM_MIN) {
        setZoom(ZOOM_MIN);
        setPan({ x: 0, y: 0 });
        return;
      }

      // Mouse position relative to the center of the player area (≈ transform origin)
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      // Adjust pan so the content under the cursor stays fixed
      const newPanX = mouseX - ((mouseX - oldPan.x) / oldZoom) * newZoom;
      const newPanY = mouseY - ((mouseY - oldPan.y) / oldZoom) * newZoom;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const handlePanStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      }
    },
    [pan],
  );

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Reset zoom on composition change
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [compositionId]);

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
