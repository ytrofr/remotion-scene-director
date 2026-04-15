/**
 * Player zoom/pan controls hook.
 * Smooth zoom via CSS transition (GPU-composited) — no rAF/setState loop.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

const ZOOM_MIN = 1;
const ZOOM_MAX = 6;
const ZOOM_FACTOR = 1.18; // 18% per wheel tick

export function usePlayerControls(
  compositionId: string,
  panTargetRef?: React.RefObject<HTMLDivElement | null>,
) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
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

  // Pan via window-attached listeners so drag continues outside the canvas,
  // with rAF batching so setPan fires at most once per frame.
  const pendingPan = useRef<{ x: number; y: number } | null>(null);
  const rafId = useRef<number | null>(null);
  const suppressNextContextMenu = useRef(false);

  const handlePanStart = useCallback(
    (e: React.MouseEvent) => {
      // Right-click (2), middle-click (1), or Alt+left-click (0)
      if (e.button !== 2 && e.button !== 1 && !(e.button === 0 && e.altKey)) {
        return;
      }
      e.preventDefault();
      isPanningRef.current = true;
      setIsPanning(true);
      panStart.current = {
        x: e.clientX - panRef.current.x,
        y: e.clientY - panRef.current.y,
      };
      // Any context menu that fires on mouseup (right-click) must be swallowed
      if (e.button === 2) suppressNextContextMenu.current = true;

      // Write transform directly to the DOM during drag — bypasses React so
      // every mousemove paints at 60fps (no reconciliation in the hot path).
      const writeTransform = (x: number, y: number) => {
        const el = panTargetRef?.current;
        if (!el) return;
        const z = zoomRef.current;
        if (z > 1) {
          el.style.transform = `scale(${z}) translate(${x / z}px, ${y / z}px)`;
        }
      };

      const flush = () => {
        rafId.current = null;
        if (pendingPan.current) {
          writeTransform(pendingPan.current.x, pendingPan.current.y);
        }
      };

      const onMove = (ev: MouseEvent) => {
        if (!isPanningRef.current) return;
        pendingPan.current = {
          x: ev.clientX - panStart.current.x,
          y: ev.clientY - panStart.current.y,
        };
        if (rafId.current === null)
          rafId.current = requestAnimationFrame(flush);
      };

      const onUp = () => {
        isPanningRef.current = false;
        setIsPanning(false);
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
        // Commit final pan to React state so other consumers (zoom reset, etc.) stay in sync.
        if (pendingPan.current) {
          setPan(pendingPan.current);
          pendingPan.current = null;
        }
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [panTargetRef],
  );

  // Swallow the contextmenu that fires on right-click release, anywhere on the page,
  // if the release came from our pan gesture.
  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      if (suppressNextContextMenu.current) {
        e.preventDefault();
        suppressNextContextMenu.current = false;
      }
    };
    window.addEventListener('contextmenu', onContext, { capture: true });
    return () =>
      window.removeEventListener('contextmenu', onContext, { capture: true });
  }, []);

  // Noop handlers kept for API stability (React props). Real work is on window.
  const handlePanMove = useCallback(() => {}, []);
  const handlePanEnd = useCallback(() => {}, []);
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
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
    isPanning,
    playerAreaRef,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    handleContextMenu,
  };
}
