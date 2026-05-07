/**
 * ToolbarDemos — Side-by-side mockups of 4 toolbar layout options.
 *
 * Standalone page (no DirectorProvider), rendered when the URL contains
 * ?view=toolbar-demos. Each mock uses the real toolbar CSS so the look is
 * accurate, but buttons are visual-only.
 *
 * The user picks one; we then implement that layout in Toolbar.tsx.
 */
import React, { useState } from 'react';
import {
  SaveIcon,
  SaveVersionIcon,
  RevertIcon,
  MoreIcon,
  LockOpenIcon,
  PlusIcon,
} from './icons';

type LayoutKey = 'two-row' | 'icon-compact' | 'left-rail' | 'grouped-pills';

const LAYOUTS: { key: LayoutKey; title: string; pitch: string }[] = [
  {
    key: 'two-row',
    title: 'A — Two-Row Toolbar',
    pitch:
      'Row 1: Setup (composition, version, render mode). Row 2: Edit tools, view toggles, save cluster. ' +
      'Trade: +1 row of vertical space. Win: full labels, zero overflow, predictable.',
  },
  {
    key: 'icon-compact',
    title: 'B — Icon-Only Compact (single row)',
    pitch:
      'All buttons icon-only with hover tooltips. Labels only on Save / Save as Version. ' +
      'Win: fits in ~70% the horizontal space. Trade: less discoverable.',
  },
  {
    key: 'left-rail',
    title: 'C — Left Rail (tools) + Top Bar (everything else)',
    pitch:
      'Gestures, Select, Undo, cursor size go to a vertical 56px rail (Figma-style). ' +
      'Top bar carries setup, toggles, save cluster. Win: top bar is sparse. Trade: bigger refactor + screen real estate.',
  },
  {
    key: 'grouped-pills',
    title: 'D — Grouped Pills + Wrap',
    pitch:
      'Single row, logical pill groups separated by chip dividers, flex-wrap on. ' +
      'On narrow widths it wraps to 2 rows naturally instead of scrolling. ' +
      'Win: best of both — sparse in wide windows, no overflow in narrow ones.',
  },
];

// ─── Reusable mock pieces ──────────────────────────────────────────────
const MockSelect: React.FC<{
  children: React.ReactNode;
  compact?: boolean;
}> = ({ children, compact }) => (
  <select
    className={`toolbar__select ${compact ? 'toolbar__select--compact' : ''}`}
  >
    <option>{children}</option>
  </select>
);

const MockBtn: React.FC<{
  className?: string;
  icon?: React.ReactNode;
  kbd?: string;
  children?: React.ReactNode;
  title?: string;
}> = ({ className = 'toolbar__btn', icon, kbd, children, title }) => (
  <button type="button" className={className} title={title}>
    {icon}
    {children && <span>{children}</span>}
    {kbd && <kbd className="toolbar__kbd">{kbd}</kbd>}
  </button>
);

const Divider = () => <div className="toolbar__divider" />;
const Spacer = () => <div className="toolbar__spacer" />;

const VersionMock = () => (
  <div className="version-bar">
    <span className="version-bar__label">Version</span>
    <MockSelect>DorianFull (3)</MockSelect>
    <MockSelect>V1.01</MockSelect>
    <span className="version-bar__lock version-bar__lock--off">
      <LockOpenIcon size={14} />
    </span>
  </div>
);

const SaveCluster = () => (
  <div className="toolbar__save-cluster">
    <MockBtn
      className="toolbar__btn toolbar__btn--icon toolbar__btn--save"
      icon={<SaveIcon size={14} />}
    >
      Save
    </MockBtn>
    <MockBtn
      className="toolbar__btn toolbar__btn--icon toolbar__btn--save-version"
      icon={<SaveVersionIcon size={14} />}
    >
      Save as Version
    </MockBtn>
    <MockBtn
      className="toolbar__btn toolbar__btn--icon toolbar__btn--clear"
      icon={<RevertIcon size={14} />}
    >
      Revert
    </MockBtn>
    <MockBtn
      className="toolbar__btn more-menu__trigger"
      icon={<MoreIcon size={16} />}
    >
      More
    </MockBtn>
  </div>
);

const SaveClusterIconOnly = () => (
  <div className="toolbar__save-cluster">
    <MockBtn
      className="toolbar__btn toolbar__btn--icon toolbar__btn--save"
      icon={<SaveIcon size={14} />}
      title="Save (Ctrl+S)"
    >
      Save
    </MockBtn>
    <MockBtn
      className="toolbar__btn toolbar__btn--icon toolbar__btn--save-version"
      icon={<SaveVersionIcon size={14} />}
      title="Save as Version"
    >
      <PlusIcon size={10} />
    </MockBtn>
    <MockBtn
      className="toolbar__btn toolbar__btn--icon toolbar__btn--clear"
      icon={<RevertIcon size={14} />}
      title="Revert"
    />
    <MockBtn
      className="toolbar__btn more-menu__trigger"
      icon={<MoreIcon size={16} />}
      title="More"
    />
  </div>
);

const GestureRow: React.FC<{ icon?: boolean }> = ({ icon }) => (
  <>
    {(['Click', 'Scroll', 'Drag', 'Swipe', 'Point'] as const).map((g, i) => (
      <MockBtn
        key={g}
        className={`toolbar__btn ${i === 0 ? 'toolbar__btn--active' : ''}`}
        kbd={String(i + 1)}
      >
        {icon ? g[0] : g}
      </MockBtn>
    ))}
  </>
);

// ─── Layout A: Two-Row ────────────────────────────────────────────────
const LayoutTwoRow: React.FC = () => (
  <div className="demo-frame">
    <div className="toolbar demo-toolbar">
      <span className="toolbar__logo">SD</span>
      <MockSelect>DorianFullV1-01 — Dorian Full V1.01</MockSelect>
      <Divider />
      <VersionMock />
      <Divider />
      <MockSelect compact>Hybrid</MockSelect>
      <MockBtn className="toolbar__btn toolbar__btn--export">Render</MockBtn>
      <Spacer />
    </div>
    <div className="toolbar demo-toolbar">
      <GestureRow />
      <Divider />
      <MockBtn kbd="S">Select</MockBtn>
      <MockBtn className="toolbar__btn toolbar__btn--undo" kbd="Z">
        Undo
      </MockBtn>
      <Divider />
      <MockBtn className="toolbar__btn toolbar__btn--feedback-on" kbd="F">
        Feedback
      </MockBtn>
      <MockBtn className="toolbar__btn" kbd="T">
        Trail
      </MockBtn>
      <Spacer />
      <SaveCluster />
    </div>
  </div>
);

// ─── Layout B: Icon-Only Compact ──────────────────────────────────────
const LayoutIconCompact: React.FC = () => (
  <div className="demo-frame">
    <div className="toolbar demo-toolbar">
      <span className="toolbar__logo">SD</span>
      <MockSelect compact>DorianFullV1-01</MockSelect>
      <Divider />
      <MockSelect compact>DorianFull</MockSelect>
      <MockSelect compact>V1.01</MockSelect>
      <span className="version-bar__lock version-bar__lock--off">
        <LockOpenIcon size={14} />
      </span>
      <Divider />
      <GestureRow icon />
      <Divider />
      <MockBtn>S</MockBtn>
      <MockBtn className="toolbar__btn toolbar__btn--undo">↶</MockBtn>
      <Divider />
      <MockBtn className="toolbar__btn toolbar__btn--feedback-on">F</MockBtn>
      <MockBtn>T</MockBtn>
      <Divider />
      <MockSelect compact>Hybrid</MockSelect>
      <MockBtn className="toolbar__btn toolbar__btn--export">▶</MockBtn>
      <Spacer />
      <SaveClusterIconOnly />
    </div>
  </div>
);

// ─── Layout C: Left Rail + Top Bar ────────────────────────────────────
const LayoutLeftRail: React.FC = () => (
  <div className="demo-frame demo-frame--rail">
    <div className="demo-rail">
      {(['Click', 'Scroll', 'Drag', 'Swipe', 'Point'] as const).map((g, i) => (
        <button
          key={g}
          type="button"
          className={`demo-rail__btn ${i === 0 ? 'demo-rail__btn--active' : ''}`}
          title={g}
        >
          <span className="demo-rail__abbr">{g[0]}</span>
          <span className="demo-rail__label">{g}</span>
        </button>
      ))}
      <div className="demo-rail__divider" />
      <button type="button" className="demo-rail__btn" title="Select">
        <span className="demo-rail__abbr">S</span>
        <span className="demo-rail__label">Sel</span>
      </button>
      <button type="button" className="demo-rail__btn" title="Undo">
        <span className="demo-rail__abbr">↶</span>
        <span className="demo-rail__label">Undo</span>
      </button>
    </div>
    <div className="demo-rail-top">
      <div className="toolbar demo-toolbar">
        <span className="toolbar__logo">SD</span>
        <MockSelect>DorianFullV1-01 — Dorian Full V1.01</MockSelect>
        <Divider />
        <VersionMock />
        <Divider />
        <MockBtn className="toolbar__btn toolbar__btn--feedback-on" kbd="F">
          Feedback
        </MockBtn>
        <MockBtn className="toolbar__btn" kbd="T">
          Trail
        </MockBtn>
        <Divider />
        <MockSelect compact>Hybrid</MockSelect>
        <MockBtn className="toolbar__btn toolbar__btn--export">Render</MockBtn>
        <Spacer />
        <SaveCluster />
      </div>
    </div>
  </div>
);

// ─── Layout D: Grouped Pills + Wrap ───────────────────────────────────
const LayoutGroupedPills: React.FC = () => (
  <div className="demo-frame">
    <div className="toolbar demo-toolbar demo-toolbar--wrap">
      <span className="toolbar__logo">SD</span>

      <div className="demo-pill">
        <span className="demo-pill__label">Comp</span>
        <MockSelect compact>DorianFullV1-01</MockSelect>
      </div>

      <div className="demo-pill">
        <span className="demo-pill__label">Ver</span>
        <MockSelect compact>DorianFull</MockSelect>
        <MockSelect compact>V1.01</MockSelect>
        <span className="version-bar__lock version-bar__lock--off">
          <LockOpenIcon size={14} />
        </span>
      </div>

      <div className="demo-pill">
        <span className="demo-pill__label">Tools</span>
        <GestureRow />
        <MockBtn kbd="S">Select</MockBtn>
        <MockBtn className="toolbar__btn toolbar__btn--undo" kbd="Z">
          Undo
        </MockBtn>
      </div>

      <div className="demo-pill">
        <span className="demo-pill__label">View</span>
        <MockBtn className="toolbar__btn toolbar__btn--feedback-on" kbd="F">
          Feedback
        </MockBtn>
        <MockBtn className="toolbar__btn" kbd="T">
          Trail
        </MockBtn>
      </div>

      <div className="demo-pill">
        <span className="demo-pill__label">Render</span>
        <MockSelect compact>Hybrid</MockSelect>
        <MockBtn className="toolbar__btn toolbar__btn--export">Render</MockBtn>
      </div>

      <Spacer />
      <SaveCluster />
    </div>
  </div>
);

const LAYOUT_RENDERERS: Record<LayoutKey, React.FC> = {
  'two-row': LayoutTwoRow,
  'icon-compact': LayoutIconCompact,
  'left-rail': LayoutLeftRail,
  'grouped-pills': LayoutGroupedPills,
};

export const ToolbarDemos: React.FC = () => {
  const [picked, setPicked] = useState<LayoutKey | null>(null);

  return (
    <div className="demos-page">
      <header className="demos-header">
        <h1>SceneDirector Toolbar — Layout Options</h1>
        <p>
          Compare the 4 layouts below at full width. Resize the window to see
          how each behaves on narrow screens. Click "Pick this" to record your
          choice — copy the result and paste it back to the assistant.
        </p>
      </header>

      {LAYOUTS.map((l) => {
        const Renderer = LAYOUT_RENDERERS[l.key];
        const isPicked = picked === l.key;
        return (
          <section key={l.key} className="demos-section">
            <div className="demos-section__head">
              <h2>{l.title}</h2>
              <button
                type="button"
                className={`demos-pick ${isPicked ? 'demos-pick--active' : ''}`}
                onClick={() => setPicked(l.key)}
              >
                {isPicked ? '✓ Picked' : 'Pick this'}
              </button>
            </div>
            <p className="demos-pitch">{l.pitch}</p>
            <Renderer />
          </section>
        );
      })}

      {picked && (
        <div className="demos-result" role="status">
          <strong>Picked:</strong> <code>{picked}</code> — paste this token to
          the assistant to implement.
        </div>
      )}

      <footer className="demos-footer">
        <a href="?">← back to SceneDirector</a>
      </footer>
    </div>
  );
};
