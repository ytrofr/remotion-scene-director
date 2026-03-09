/**
 * PointerShapeCard — A single shape card with Color + Style dropdowns.
 * Replaces N flat InstalledCards with one grouped card per pointer shape.
 * Cross-filters dropdowns: changing Color filters available Styles, and vice versa.
 */

import React, { useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import { invertLottieColors } from '../../../components/FloatingHand/hands/LottieHand';
import { type PointerShape, findVariant, getShapeOptions } from './galleryData';

interface PointerShapeCardProps {
  shape: PointerShape;
  hidden: Set<string>;
  showHidden: boolean;
  selectMode: boolean;
  selected: Set<string>;
  active: Set<string>;
  onToggleSelectMany: (ids: string[]) => void;
  onToggleActive: (id: string) => void;
  getFeedback: () => Record<string, 'good' | 'bad'>;
  setFeedback: (id: string, vote: 'good' | 'bad' | null) => void;
}

export const PointerShapeCard: React.FC<PointerShapeCardProps> = ({
  shape,
  hidden,
  showHidden,
  selectMode,
  selected,
  active,
  onToggleSelectMany,
  onToggleActive,
  getFeedback,
  setFeedback,
}) => {
  const visibleVariants = shape.variants.filter(
    (v) => !hidden.has(v.id) || showHidden,
  );
  if (visibleVariants.length === 0) return null;

  const [color, setColor] = useState(shape.variants[0].color);
  const [style, setStyle] = useState(shape.variants[0].style);
  const [isDark, setIsDark] = useState(false);
  const lightRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);

  const variant = findVariant(shape, color, style);
  const opts = getShapeOptions(shape, color, style);
  const allColors = [...new Set(shape.variants.map((v) => v.color))];
  const allStyles = [...new Set(shape.variants.map((v) => v.style))];
  const hasMultipleOptions = shape.variants.length > 1;

  const [vote, setVote] = useState<'good' | 'bad' | null>(() => {
    const fb = getFeedback();
    return fb[variant.id] || null;
  });

  // Sync vote when variant changes
  useEffect(() => {
    const fb = getFeedback();
    setVote(fb[variant.id] || null);
  }, [variant.id, getFeedback]);

  const handleVote = (v: 'good' | 'bad') => {
    const newVote = vote === v ? null : v;
    setVote(newVote);
    setFeedback(variant.id, newVote);
  };

  // Handle cross-filter: when color changes, snap style to a valid option
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    const available = getShapeOptions(shape, newColor);
    if (!available.styles.includes(style)) {
      setStyle(available.styles[0]);
    }
  };

  const handleStyleChange = (newStyle: string) => {
    setStyle(newStyle);
    const available = getShapeOptions(shape, undefined, newStyle);
    if (!available.colors.includes(color)) {
      setColor(available.colors[0]);
    }
  };

  // Load Lottie animation
  useEffect(() => {
    const anims: AnimationItem[] = [];

    fetch(`/lottie/${variant.id}.json`)
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
        console.error(`Gallery: failed to load ${variant.id}`, err),
      );

    return () => anims.forEach((a) => a.destroy());
  }, [variant.id]);

  // In select mode, the entire shape (all variants) is the unit of selection
  const allVariantIds = shape.variants.map((v) => v.id);
  const isSelected = allVariantIds.some((id) => selected.has(id));

  const handleShapeSelect = () => {
    onToggleSelectMany(allVariantIds);
  };

  const borderColor = isSelected
    ? 'var(--accent)'
    : vote === 'good'
      ? 'var(--accent)'
      : vote === 'bad'
        ? '#ef4444'
        : 'var(--border)';

  const isActive = active.has(variant.id);

  const cardClass = [
    'gallery-view__card',
    'gallery-view__card--installed',
    hidden.has(variant.id) && 'gallery-view__card--hidden',
    isSelected && 'gallery-view__card--selected',
    isActive && 'gallery-view__card--active',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClass}
      style={{ borderColor, borderWidth: vote || isSelected ? 2 : 1 }}
      onClick={selectMode ? handleShapeSelect : undefined}
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

      <div className="gallery-view__card-label">
        {shape.name}
        <span className="gallery-view__section-count">
          ({shape.variants.length})
        </span>
      </div>

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

      {/* Dropdowns — only shown when >1 variant */}
      {hasMultipleOptions && (
        <div className="gallery-view__shape-dropdowns">
          {allColors.length > 1 && (
            <select
              className="gallery-view__shape-select"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              {opts.colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          {allStyles.length > 1 && (
            <select
              className="gallery-view__shape-select"
              value={style}
              onChange={(e) => handleStyleChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              {opts.styles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Light/Dark toggle */}
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

      {/* Feedback */}
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

      {/* Activate button */}
      {!selectMode && (
        <button
          className={`gallery-view__card-activate ${active.has(variant.id) ? 'gallery-view__card-activate--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive(variant.id);
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={active.has(variant.id) ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {active.has(variant.id) ? 'Active' : 'Activate'}
        </button>
      )}

      <div className="gallery-view__card-meta">{variant.id}</div>
    </div>
  );
};
