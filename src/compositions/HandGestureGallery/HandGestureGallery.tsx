import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { fontFamily } from '../../lib/fonts';
import { GestureCard, CARD_GAP } from './GestureCard';
import {
  COLORS,
  GALLERY_GESTURES,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  GestureCategory,
} from './constants';

export const HandGestureGallery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title entrance
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 100 },
  });
  const titleY = interpolate(titleSpring, [0, 1], [-30, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Group gestures by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    gestures: GALLERY_GESTURES.filter((g) => g.category === cat),
  })).filter((g) => g.gestures.length > 0);

  // Calculate staggered entrance delays
  let globalIndex = 0;
  const categoryEntries = grouped.map((group) => {
    const entries = group.gestures.map((gesture) => {
      const delay = 8 + globalIndex * 4; // stagger by 4 frames per card
      globalIndex++;
      return { gesture, delay };
    });
    return { ...group, entries };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          padding: '48px 64px 0',
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 48,
            fontWeight: 800,
            color: COLORS.text,
            letterSpacing: -1,
          }}
        >
          Hand Gesture Gallery
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 20,
            color: COLORS.textMuted,
            marginTop: 8,
          }}
        >
          {GALLERY_GESTURES.length} Lottie hand animations — light & dark
        </div>
      </div>

      {/* Category grid */}
      <div
        style={{
          padding: '32px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        {categoryEntries.map((group) => (
          <CategoryRow key={group.category} group={group} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

interface CategoryRowProps {
  group: {
    category: GestureCategory;
    label: string;
    entries: Array<{
      gesture: (typeof GALLERY_GESTURES)[number];
      delay: number;
    }>;
  };
}

const CategoryRow: React.FC<CategoryRowProps> = ({ group }) => {
  return (
    <div>
      {/* Category label */}
      <div
        style={{
          fontFamily,
          fontSize: 16,
          fontWeight: 700,
          color: COLORS.categoryText,
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 12,
        }}
      >
        {group.label}
      </div>

      {/* Cards row */}
      <div style={{ display: 'flex', gap: CARD_GAP, flexWrap: 'wrap' }}>
        {group.entries.map(({ gesture, delay }) => (
          <GestureCard
            key={gesture.id}
            gesture={gesture}
            entranceDelay={delay}
          />
        ))}
      </div>
    </div>
  );
};
