import { ICONS, type IconName } from './icons';

export type IconSize = 16 | 20 | 24;

export interface IconProps {
  readonly name: IconName;
  readonly size?: IconSize;
  /** Accessible name; without it the icon is decorative and hidden from assistive technology. */
  readonly label?: string;
  readonly className?: string;
}

export function Icon({ name, size = 24, label, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {ICONS[name]}
    </svg>
  );
}
