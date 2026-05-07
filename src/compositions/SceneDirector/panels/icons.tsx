/**
 * SVG icon set — currentColor stroke, no fills (unless noted).
 * 16px default; pass `size` to scale. Use `aria-label` on parent button.
 */
import React from 'react';

type IconProps = { size?: number; strokeWidth?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false as const,
  style: { flexShrink: 0 },
});

export const PlusIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const LockOpenIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 7.5-2" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({
  size = 12,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2.5,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export const AlertIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const SaveIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export const SaveVersionIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M17 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l3 3v4" />
    <circle cx="18" cy="17" r="4" />
    <path d="M18 15v4M16 17h4" />
  </svg>
);

export const RevertIcon: React.FC<IconProps> = ({
  size = 14,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M3 7v6h6" />
    <path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
  </svg>
);

export const MoreIcon: React.FC<IconProps> = ({
  size = 16,
  strokeWidth = 2,
}) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
