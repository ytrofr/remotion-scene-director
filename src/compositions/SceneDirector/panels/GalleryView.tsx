/**
 * GalleryView — Full-page hand gesture gallery.
 * Shows all installed Lottie animations with live light/dark previews,
 * plus downloadable sources grouped by category.
 */

import React, { useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import { invertLottieColors } from '../../../components/FloatingHand/hands/LottieHand';
import {
  CATEGORIES,
  GESTURES,
  POINTER_SHAPES,
  type GalleryGesture,
} from './galleryData';
import { useGallerySelection } from '../hooks/useGallerySelection';
import { PointerShapeCard } from './PointerShapeCard';

interface GalleryViewProps {
  onClose: () => void;
}

const COLLAPSED_KEY = 'gallery-collapsed-cats';

function getCollapsed(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(COLLAPSED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onClose }) => {
  const sel = useGallerySelection();
  const [collapsed, setCollapsed] = useState<Set<string>>(getCollapsed);

  const toggleCollapsed = (catId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const collapseAll = () => {
    const all = new Set(CATEGORIES.map((c) => c.id));
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify([...all]));
    setCollapsed(all);
  };

  const expandAll = () => {
    sessionStorage.setItem(COLLAPSED_KEY, '[]');
    setCollapsed(new Set());
  };

  // Auto-save existing feedback to disk on mount
  useEffect(() => {
    const fb = getFeedback();
    if (Object.keys(fb).length > 0) {
      saveFeedbackToDisk(fb);
    }
  }, []);

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    gestures: GESTURES.filter((g) => g.category === cat.id),
  })).filter((g) => g.gestures.length > 0);

  const installed = GESTURES.filter((g) => g.installed).length;
  const hiddenCount = sel.hidden.size;

  return (
    <div className="gallery-view">
      {/* Header bar */}
      <div className="gallery-view__header">
        <div className="gallery-view__title">
          Hand Gesture Gallery
          <span className="gallery-view__count">
            {installed} installed
            {hiddenCount > 0 && ` / ${hiddenCount} hidden`}
          </span>
        </div>
        <div className="gallery-view__header-actions">
          {!sel.selectMode ? (
            <>
              <button
                className="gallery-view__header-btn"
                onClick={
                  collapsed.size < CATEGORIES.length ? collapseAll : expandAll
                }
              >
                {collapsed.size < CATEGORIES.length
                  ? 'Collapse All'
                  : 'Expand All'}
              </button>
              <button
                className="gallery-view__header-btn"
                onClick={sel.enterSelectMode}
              >
                Select
              </button>
              {hiddenCount > 0 && (
                <button
                  className={`gallery-view__header-btn ${sel.showHidden ? 'gallery-view__header-btn--active' : ''}`}
                  onClick={() => sel.setShowHidden(!sel.showHidden)}
                >
                  {sel.showHidden
                    ? 'Hide Hidden'
                    : `Show Hidden (${hiddenCount})`}
                </button>
              )}
            </>
          ) : (
            <>
              <span className="gallery-view__sel-count">
                {sel.selected.size} selected
              </span>
              <button
                className="gallery-view__header-btn gallery-view__header-btn--danger"
                onClick={sel.hideSelected}
                disabled={sel.selected.size === 0}
              >
                Hide
              </button>
              <button
                className="gallery-view__header-btn gallery-view__header-btn--danger"
                onClick={() => {
                  if (
                    confirm(
                      `Delete ${sel.selected.size} item(s)? This removes Lottie files and galleryData entries permanently.`,
                    )
                  ) {
                    sel.deleteSelected();
                  }
                }}
                disabled={sel.selected.size === 0}
              >
                Delete
              </button>
              <button
                className="gallery-view__header-btn"
                onClick={() => {
                  const ids = sel.copySelectedIds();
                  if (ids) alert(`Copied: ${ids}`);
                }}
                disabled={sel.selected.size === 0}
              >
                Copy IDs
              </button>
              <button
                className="gallery-view__header-btn"
                onClick={sel.exitSelectMode}
              >
                Cancel
              </button>
            </>
          )}
          <button className="gallery-view__close" onClick={onClose}>
            Back to Editor
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="gallery-view__content">
        {/* Feedback bar */}
        <FeedbackSummary />

        {/* How to add */}
        <div className="gallery-view__instructions">
          <strong>To add a new gesture:</strong> Download .json from LottieFiles
          &rarr; save to <code>public/lottie/hand-name.json</code> &rarr; add to{' '}
          <code>GESTURES</code> in galleryData.ts +{' '}
          <code>GESTURE_ANIMATIONS</code> in gestures.ts
        </div>

        {/* Categories */}
        {grouped.map((cat) => {
          const isPointers = cat.id === 'pointers';
          const visible = cat.gestures.filter(
            (g) => !sel.hidden.has(g.id) || sel.showHidden,
          );
          // For pointers, check if any shape has visible variants
          const visibleShapeCount = isPointers
            ? POINTER_SHAPES.filter((s) =>
                s.variants.some((v) => !sel.hidden.has(v.id) || sel.showHidden),
              ).length
            : 0;
          if (!isPointers && visible.length === 0) return null;
          if (isPointers && visibleShapeCount === 0) return null;
          const isCollapsed = collapsed.has(cat.id);

          // Count for section header: total visible variants for pointers
          const displayCount = isPointers
            ? POINTER_SHAPES.reduce(
                (sum, s) =>
                  sum +
                  s.variants.filter(
                    (v) => !sel.hidden.has(v.id) || sel.showHidden,
                  ).length,
                0,
              )
            : visible.length;

          return (
            <div key={cat.id} className="gallery-view__section">
              <button
                className="gallery-view__section-label gallery-view__section-label--btn"
                onClick={() => toggleCollapsed(cat.id)}
              >
                <svg
                  className={`gallery-view__chevron ${isCollapsed ? 'gallery-view__chevron--collapsed' : ''}`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                {cat.label}
                <span className="gallery-view__section-count">
                  ({displayCount})
                </span>
              </button>
              {!isCollapsed && isPointers && (
                <div className="gallery-view__grid gallery-view__grid--shapes">
                  {POINTER_SHAPES.map((shape) => (
                    <PointerShapeCard
                      key={shape.name}
                      shape={shape}
                      hidden={sel.hidden}
                      showHidden={sel.showHidden}
                      selectMode={sel.selectMode}
                      selected={sel.selected}
                      onToggleSelectMany={sel.toggleSelectMany}
                      getFeedback={getFeedback}
                      setFeedback={setFeedback}
                    />
                  ))}
                </div>
              )}
              {!isCollapsed && !isPointers && (
                <div className="gallery-view__grid">
                  {visible.map((g) => {
                    const isHidden = sel.hidden.has(g.id);
                    return g.installed ? (
                      <InstalledCard
                        key={g.id}
                        gesture={g}
                        isHidden={isHidden}
                        selectMode={sel.selectMode}
                        isSelected={sel.selected.has(g.id)}
                        onToggleSelect={() => sel.toggleSelect(g.id)}
                        onUnhide={() => sel.unhide(g.id)}
                      />
                    ) : (
                      <AvailableCard key={g.id} gesture={g} />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Sources footer */}
        <div className="gallery-view__sources">
          <div className="gallery-view__section-label">Sources</div>
          <div className="gallery-view__source-list">
            <a
              href="https://lottiefiles.com/free-animations/hand-gesture"
              target="_blank"
              rel="noreferrer"
            >
              LottieFiles — Hand Gestures
            </a>
            <a
              href="https://iconscout.com/lottie-animations/hand-gesture-touch"
              target="_blank"
              rel="noreferrer"
            >
              IconScout — 39k+ touch animations
            </a>
            <a
              href="https://creattie.com/lottie-animated-icons/hand-gesture"
              target="_blank"
              rel="noreferrer"
            >
              Creattie — Curated gestures
            </a>
            <a href="https://lordicon.com/" target="_blank" rel="noreferrer">
              Lordicon — 41k+ animated icons
            </a>
          </div>
          <div className="gallery-view__source-pack">
            FREE pack:{' '}
            <a
              href="https://lottiefiles.com/marketplace/free-hand-gesture-swipe-animation-pack_329649"
              target="_blank"
              rel="noreferrer"
            >
              Hand Gesture & Swipe Pack (11 animations)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Feedback helpers ──
const FEEDBACK_KEY = 'cursor-demo-feedback';

function getFeedback(): Record<string, 'good' | 'bad'> {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '{}');
  } catch {
    return {};
  }
}

function setFeedback(id: string, vote: 'good' | 'bad' | null) {
  const fb = getFeedback();
  if (vote === null) {
    delete fb[id];
  } else {
    fb[id] = vote;
  }
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(fb));
  saveFeedbackToDisk(fb);
}

function saveFeedbackToDisk(fb: Record<string, 'good' | 'bad'>) {
  const good = Object.entries(fb)
    .filter(([, v]) => v === 'good')
    .map(([k]) => k);
  const bad = Object.entries(fb)
    .filter(([, v]) => v === 'bad')
    .map(([k]) => k);
  const data = JSON.stringify(
    { good, bad, timestamp: new Date().toISOString() },
    null,
    2,
  );
  fetch('/__save-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  }).catch(() => {
    console.log(
      'Feedback (paste to Claude):',
      `GOOD (${good.length}): ${good.join(', ')}\nBAD (${bad.length}): ${bad.join(', ')}`,
    );
  });
}

/** Export feedback summary button */
const FeedbackSummary: React.FC = () => {
  const [summary, setSummary] = useState('');

  const exportFeedback = () => {
    const fb = getFeedback();
    const good = Object.entries(fb)
      .filter(([, v]) => v === 'good')
      .map(([k]) => k);
    const bad = Object.entries(fb)
      .filter(([, v]) => v === 'bad')
      .map(([k]) => k);
    const text = `GOOD (${good.length}): ${good.join(', ') || 'none'}\nBAD (${bad.length}): ${bad.join(', ') || 'none'}`;
    setSummary(text);
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const clearFeedback = () => {
    localStorage.removeItem(FEEDBACK_KEY);
    setSummary('Cleared!');
    window.location.reload();
  };

  return (
    <div className="gallery-view__feedback-summary">
      <button
        className="gallery-view__feedback-export"
        onClick={exportFeedback}
      >
        Export Feedback (copy to clipboard)
      </button>
      <button className="gallery-view__feedback-clear" onClick={clearFeedback}>
        Clear All
      </button>
      {summary && <pre className="gallery-view__feedback-text">{summary}</pre>}
    </div>
  );
};

/** Card with live Lottie preview + light/dark toggle + feedback + selection */
const InstalledCard: React.FC<{
  gesture: GalleryGesture;
  isHidden: boolean;
  selectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onUnhide: () => void;
}> = ({
  gesture,
  isHidden,
  selectMode,
  isSelected,
  onToggleSelect,
  onUnhide,
}) => {
  const lightRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [vote, setVote] = useState<'good' | 'bad' | null>(() => {
    const fb = getFeedback();
    return fb[gesture.id] || null;
  });

  const handleVote = (v: 'good' | 'bad') => {
    const newVote = vote === v ? null : v;
    setVote(newVote);
    setFeedback(gesture.id, newVote);
  };

  useEffect(() => {
    const anims: AnimationItem[] = [];

    fetch(`/lottie/${gesture.id}.json`)
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        if (Array.isArray(data.layers)) {
          data.layers = (data.layers as Array<Record<string, unknown>>).filter(
            (l) => !String(l.nm || '').includes('Lines'),
          );
        }

        if (lightRef.current) {
          lightRef.current.innerHTML = '';
          anims.push(
            lottie.loadAnimation({
              container: lightRef.current,
              animationData: data,
              renderer: 'svg',
              loop: true,
              autoplay: true,
            }),
          );
        }

        const darkClone = JSON.parse(JSON.stringify(data)) as Record<
          string,
          unknown
        >;
        if (Array.isArray(darkClone.layers)) {
          invertLottieColors(
            darkClone.layers as Array<Record<string, unknown>>,
          );
        }
        if (darkRef.current) {
          darkRef.current.innerHTML = '';
          anims.push(
            lottie.loadAnimation({
              container: darkRef.current,
              animationData: darkClone,
              renderer: 'svg',
              loop: true,
              autoplay: true,
            }),
          );
        }
      })
      .catch((err) =>
        console.error(`Gallery: failed to load ${gesture.id}`, err),
      );

    return () => anims.forEach((a) => a.destroy());
  }, [gesture.id]);

  const borderColor = isSelected
    ? 'var(--accent)'
    : vote === 'good'
      ? 'var(--accent)'
      : vote === 'bad'
        ? '#ef4444'
        : 'var(--border)';

  const cardClass = [
    'gallery-view__card',
    'gallery-view__card--installed',
    isHidden && 'gallery-view__card--hidden',
    isSelected && 'gallery-view__card--selected',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClass}
      style={{ borderColor, borderWidth: vote || isSelected ? 2 : 1 }}
      onClick={selectMode ? onToggleSelect : undefined}
    >
      {selectMode && (
        <div className="gallery-view__card-checkbox">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isSelected ? 'var(--accent)' : 'none'}
            stroke={isSelected ? 'var(--accent)' : 'var(--text-dim)'}
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            {isSelected && (
              <polyline
                points="7 12 10 15 17 9"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
              />
            )}
          </svg>
        </div>
      )}
      {isHidden && !selectMode && (
        <button className="gallery-view__card-unhide" onClick={onUnhide}>
          Unhide
        </button>
      )}
      <div className="gallery-view__card-label">{gesture.label}</div>
      <div
        className={`gallery-view__preview-single ${isDark ? 'gallery-view__preview-single--dark' : 'gallery-view__preview-single--light'}`}
      >
        <div
          ref={lightRef}
          className="gallery-view__lottie"
          style={{ display: isDark ? 'none' : 'block' }}
        />
        <div
          ref={darkRef}
          className="gallery-view__lottie"
          style={{ display: isDark ? 'block' : 'none' }}
        />
      </div>
      <div className="gallery-view__card-toggle">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDark(false);
          }}
          className={`gallery-view__toggle-btn ${!isDark ? 'gallery-view__toggle-btn--active' : ''}`}
        >
          Light
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDark(true);
          }}
          className={`gallery-view__toggle-btn ${isDark ? 'gallery-view__toggle-btn--active' : ''}`}
        >
          Dark
        </button>
      </div>
      {!selectMode && (
        <div className="gallery-view__card-feedback">
          <button
            onClick={() => handleVote('good')}
            className={`gallery-view__vote-btn gallery-view__vote-btn--good ${vote === 'good' ? 'gallery-view__vote-btn--active' : ''}`}
            title="Good"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
          <button
            onClick={() => handleVote('bad')}
            className={`gallery-view__vote-btn gallery-view__vote-btn--bad ${vote === 'bad' ? 'gallery-view__vote-btn--active' : ''}`}
            title="Bad"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
      <div className="gallery-view__card-meta">
        {gesture.source || gesture.id}
      </div>
    </div>
  );
};

/** Card for not-yet-downloaded gesture with source link */
const AvailableCard: React.FC<{ gesture: GalleryGesture }> = ({ gesture }) => {
  return (
    <div className="gallery-view__card gallery-view__card--available">
      <div className="gallery-view__card-label">{gesture.label}</div>
      <div className="gallery-view__card-placeholder">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <div className="gallery-view__card-source">{gesture.source}</div>
      {gesture.url && (
        <a
          href={gesture.url}
          target="_blank"
          rel="noreferrer"
          className="gallery-view__card-link"
        >
          Download
        </a>
      )}
    </div>
  );
};
