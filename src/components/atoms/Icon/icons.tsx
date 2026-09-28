import type { ReactElement } from 'react';

// Outline icons on a 24 px grid; strokes inherit the text color (design system §4.7).
export const ICONS = {
  bolt: <path d="M13 2 4 14h8l-1 8 9-12h-8l1-8Z" />,
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  'credit-card': (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  truck: (
    <>
      <path d="M2 6h12v10H2zM14 9h4l3 3v4h-7" />
      <circle cx="6.5" cy="17.5" r="2" />
      <circle cx="17.5" cy="17.5" r="2" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  ),
  'x-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6M9 9l6 6" />
    </>
  ),
  'alert-triangle': <path d="M12 3 2 20h20L12 3ZM12 9.5v4.5M12 17h.01" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  'wifi-off': (
    <path d="m3 3 18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.9M19 13a10 10 0 0 0-2.5-1.8M2 9a15 15 0 0 1 5-3.2M22 9a15 15 0 0 0-8.5-3.9M12 20h.01" />
  ),
  'external-link': (
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  package: <path d="m3 7.5 9-4.5 9 4.5v9L12 21l-9-4.5v-9ZM3 7.5 12 12l9-4.5M12 12v9" />,
  'refresh-cw': (
    <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" />
  ),
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof ICONS;
