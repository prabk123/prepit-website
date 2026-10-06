/** App icons the website's PrepItIcons font does not include. */

type IconProps = { size: number; color: string };

export function BoltIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M13.5 2 4 14h7l-1.5 8L19 10h-7l1.5-8z" fill={color} />
    </svg>
  );
}

export function SpaIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3c-2 2.2-3 4.6-3 7s1 4.3 3 6c2-1.7 3-3.6 3-6s-1-4.8-3-7zM2 9c.3 4.6 3.7 8.4 8.6 8.9C8.4 16 7.3 13.6 7.2 11 5.6 10 3.9 9.3 2 9zm20 0c-1.9.3-3.6 1-5.2 2-.1 2.6-1.2 5-3.4 6.9 4.9-.5 8.3-4.3 8.6-8.9z"
        fill={color}
      />
    </svg>
  );
}

export function MicrophoneIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill={color} />
      <path
        d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
