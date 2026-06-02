"use client";

export function colorForScore(score: number) {
  if (score >= 70) return "#40E300";
  if (score >= 40) return "#FFB800";
  return "#FF644F";
}

export default function SignalRing({
  score,
  label,
  animate = false,
  filled = false,
  delayMs = 0,
  size = 72,
  active = false,
  dimmed = false,
  showChevron = false,
  showScoreOnly = false,
}: {
  score: number;
  label: string;
  animate?: boolean;
  filled?: boolean;
  delayMs?: number;
  size?: number;
  active?: boolean;
  dimmed?: boolean;
  showChevron?: boolean;
  showScoreOnly?: boolean;
}) {
  const refSize = 72;
  const stroke = Math.min(12, Math.max(4, 6 * (size / refSize)));
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringColor = colorForScore(score);
  const trackColor = `${ringColor}26`;
  const filledOffset = circumference * (1 - score / 100);
  const offset = filled || animate ? filledOffset : circumference;

  const scoreFontSize = size >= 176 ? 24 : size >= 118 ? 20 : size >= 90 ? 18 : 16;
  const labelFontSize = size >= 118 ? 20 : 14;

  return (
    <div
      className={`flex min-w-0 flex-col items-center transition-opacity duration-500 ${
        dimmed ? "opacity-45" : "opacity-100"
      }`}
    >
      <div
        className={`relative ${active ? "scale-105" : "scale-100"} transition-transform duration-500`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {active && (
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-md"
            style={{ backgroundColor: ringColor }}
          />
        )}
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: animate
                ? `stroke-dashoffset 900ms cubic-bezier(0.33, 1, 0.68, 1) ${delayMs}ms`
                : "none",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="leading-none text-[var(--black-100)]"
            style={{
              fontFamily: "var(--font-brand)",
              fontSize: scoreFontSize,
              fontWeight: 700,
            }}
          >
            {score}
          </span>
        </div>
      </div>
      {!showScoreOnly && (
        <p
          className={`mt-2 text-center font-medium leading-tight ${
            active ? "text-[var(--black-100)]" : "text-[var(--grey-80)]"
          }`}
          style={{ fontSize: labelFontSize, fontWeight: active ? 600 : 500 }}
        >
          {showChevron ? (
            <span className="inline-flex items-center gap-0.5">
              {label}
              <span className="text-[var(--grey-40)]" aria-hidden>
                ›
              </span>
            </span>
          ) : (
            label
          )}
        </p>
      )}
    </div>
  );
}
