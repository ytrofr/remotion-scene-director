/**
 * LeftRail — Vertical tool rail (Layout C).
 *
 * Houses the active editing tools: gesture buttons (Click/Scroll/Drag/Swipe/
 * Point), Select, Undo, and the cursor-size slider.
 *
 * Clicking an already-active gesture button opens the variant flyout to the
 * right of the rail (Hand Style / Pointer / Light-Dark / Click Effect),
 * mirroring the original Toolbar dropdown behavior.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDirector } from '../context';
import {
  GESTURE_PRESETS,
  buildClickAnimationFile,
  type GestureTool,
} from '../gestures';
import { useGalleryActive } from '../hooks/galleryActive';
import { LottieThumbnail } from '../overlays/LottieThumbnail';
import { RevertIcon } from './icons';

const GESTURE_TOOLS: { id: GestureTool; key: string }[] = [
  { id: 'click', key: '1' },
  { id: 'scroll', key: '2' },
  { id: 'drag', key: '3' },
  { id: 'swipe', key: '4' },
  { id: 'point', key: '5' },
];

export const LeftRail: React.FC = () => {
  const { state, dispatch, canUndo, cursorScale, setCursorScale } =
    useDirector();
  const gallery = useGalleryActive();
  const [openFlyout, setOpenFlyout] = useState<GestureTool | null>(null);
  const flyoutWrapperRef = useRef<HTMLDivElement>(null);

  // Close flyout on outside click
  useEffect(() => {
    if (!openFlyout) return;
    const handler = (e: MouseEvent) => {
      if (
        flyoutWrapperRef.current &&
        !flyoutWrapperRef.current.contains(e.target as Node)
      ) {
        setOpenFlyout(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openFlyout]);

  // Close flyout when tool changes externally (e.g. keyboard shortcut)
  useEffect(() => {
    if (openFlyout && state.activeTool !== openFlyout) setOpenFlyout(null);
  }, [state.activeTool, openFlyout]);

  const scene = state.selectedScene;
  const currentAnimation = scene
    ? (state.sceneAnimation[scene] ??
      GESTURE_PRESETS[state.sceneGesture[scene] ?? 'click']?.animation)
    : null;
  const currentDark = scene ? (state.sceneDark[scene] ?? false) : false;

  const onGestureClick = useCallback(
    (id: GestureTool) => {
      const isActive = state.activeTool === id;
      if (isActive) {
        setOpenFlyout((cur) => (cur === id ? null : id));
      } else {
        dispatch({ type: 'SET_TOOL', tool: id });
        setOpenFlyout(null);
      }
    },
    [state.activeTool, dispatch],
  );

  return (
    <aside className="rail" aria-label="Editing tools">
      <div className="rail__group" ref={flyoutWrapperRef}>
        {GESTURE_TOOLS.map((t) => {
          const preset = GESTURE_PRESETS[t.id];
          const active = state.activeTool === t.id;
          const flyoutOpen = openFlyout === t.id;
          return (
            <div key={t.id} className="rail__item-wrapper">
              <button
                type="button"
                onClick={() => onGestureClick(t.id)}
                className={`rail__btn ${active ? 'rail__btn--active' : ''} ${flyoutOpen ? 'rail__btn--flyout-open' : ''}`}
                title={`${preset.label} (${t.key}) — click again for variants`}
              >
                <span className="rail__abbr">{preset.label[0]}</span>
                <span className="rail__label">{preset.label}</span>
                <kbd className="rail__kbd">{t.key}</kbd>
              </button>

              {flyoutOpen && (
                <div className="rail__flyout">
                  <FlyoutContent
                    tool={t.id}
                    scene={scene}
                    currentAnimation={currentAnimation}
                    currentDark={currentDark}
                    handAnims={gallery.filterHandAnims(t.id)}
                    pointers={gallery.filterPointers()}
                    clickAnims={gallery.filterClickAnims()}
                    clickAnimation={state.clickAnimation}
                    onSetAnimation={(animation) => {
                      if (!scene) return;
                      dispatch({
                        type: 'SET_SCENE_ANIMATION',
                        scene,
                        animation,
                      });
                      if (!state.sceneGesture[scene]) {
                        dispatch({
                          type: 'SET_SCENE_GESTURE',
                          scene,
                          gesture: t.id,
                        });
                      }
                    }}
                    onSetDark={(dark) => {
                      if (scene)
                        dispatch({ type: 'SET_SCENE_DARK', scene, dark });
                    }}
                    onSetClickAnimation={(animation) =>
                      dispatch({ type: 'SET_CLICK_ANIMATION', animation })
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rail__divider" />

      <div className="rail__group">
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_TOOL', tool: 'select' });
            setOpenFlyout(null);
          }}
          className={`rail__btn ${state.activeTool === 'select' ? 'rail__btn--active' : ''}`}
          title="Select mode (S)"
        >
          <span className="rail__abbr">⬚</span>
          <span className="rail__label">Select</span>
          <kbd className="rail__kbd">S</kbd>
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={!canUndo}
          className="rail__btn rail__btn--undo"
          title="Undo (Ctrl+Z)"
        >
          <RevertIcon size={16} />
          <span className="rail__label">Undo</span>
          <kbd className="rail__kbd">Z</kbd>
        </button>
      </div>

      {/* Cursor size — only visible while a non-select tool is active */}
      {state.activeTool !== 'select' && (
        <>
          <div className="rail__divider" />
          <div className="rail__slider" title="Cursor preview size">
            <span className="rail__slider-label">
              {cursorScale.toFixed(1)}×
            </span>
            <input
              type="range"
              min="0.3"
              max="2"
              step="0.1"
              value={cursorScale}
              onChange={(e) => setCursorScale(parseFloat(e.target.value))}
              className="rail__slider-input"
              aria-label="Cursor preview size"
            />
          </div>
        </>
      )}
    </aside>
  );
};

// ─── Flyout content (extracted to keep LeftRail body readable) ────────
type FlyoutProps = {
  tool: GestureTool;
  scene: string | null;
  currentAnimation: string | null;
  currentDark: boolean;
  handAnims: { id: string; label: string }[];
  pointers: { id: string; label: string }[];
  clickAnims: { id: string; label: string }[];
  clickAnimation: string | null;
  onSetAnimation: (id: string) => void;
  onSetDark: (dark: boolean) => void;
  onSetClickAnimation: (id: string) => void;
};

const FlyoutContent: React.FC<FlyoutProps> = ({
  scene,
  currentAnimation,
  currentDark,
  handAnims,
  pointers,
  clickAnims,
  clickAnimation,
  onSetAnimation,
  onSetDark,
  onSetClickAnimation,
}) => (
  <>
    <div className="rail__flyout-title">Hand Style</div>
    <div className="rail__flyout-list">
      {handAnims.map((anim) => {
        const isActive = currentAnimation === anim.id;
        return (
          <button
            key={anim.id}
            type="button"
            onClick={() => onSetAnimation(anim.id)}
            disabled={!scene}
            className={`rail__flyout-btn ${isActive ? 'rail__flyout-btn--active' : ''}`}
          >
            <LottieThumbnail
              animationFile={anim.id}
              size={22}
              dark={currentDark}
            />
            {anim.label}
          </button>
        );
      })}
    </div>

    <div className="rail__flyout-title rail__flyout-title--separated">
      Pointer
    </div>
    <div className="rail__flyout-list">
      {pointers.map((ptr) => {
        const isActive = currentAnimation === ptr.id;
        return (
          <button
            key={ptr.id}
            type="button"
            onClick={() => onSetAnimation(ptr.id)}
            disabled={!scene}
            className={`rail__flyout-btn ${isActive ? 'rail__flyout-btn--active' : ''}`}
          >
            <LottieThumbnail
              animationFile={ptr.id}
              size={22}
              dark={currentDark}
            />
            {ptr.label}
          </button>
        );
      })}
    </div>

    <div className="rail__flyout-dark">
      <button
        type="button"
        onClick={() => onSetDark(true)}
        disabled={!scene}
        className={`rail__flyout-btn ${currentDark ? 'rail__flyout-btn--active' : ''}`}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => onSetDark(false)}
        disabled={!scene}
        className={`rail__flyout-btn ${!currentDark ? 'rail__flyout-btn--active' : ''}`}
      >
        Dark
      </button>
    </div>

    <div className="rail__flyout-title rail__flyout-title--separated">
      Click Effect
    </div>
    <div className="rail__flyout-list">
      {clickAnims.map((anim) => {
        const thumbFile = currentAnimation
          ? buildClickAnimationFile(currentAnimation, anim.id)
          : undefined;
        return (
          <button
            key={anim.id}
            type="button"
            onClick={() => onSetClickAnimation(anim.id)}
            className={`rail__flyout-btn ${clickAnimation === anim.id ? 'rail__flyout-btn--active' : ''}`}
          >
            {thumbFile && (
              <LottieThumbnail
                animationFile={thumbFile}
                size={32}
                dark={currentDark}
                playOnHover
              />
            )}
            {anim.label}
          </button>
        );
      })}
    </div>
  </>
);
