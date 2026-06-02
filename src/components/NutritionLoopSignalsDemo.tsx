"use client";

import { useEffect, useRef, useState } from "react";

const SIGNALS = [
  { label: "Energy", score: 78 },
  { label: "Satiety", score: 65 },
  { label: "Mood", score: 71 },
] as const;

function colorForScore(score: number) {
  if (score >= 70) return "#40E300";
  if (score >= 40) return "#FFB800";
  return "#FF644F";
}

const LOOP_RING_SIZE = 72;

function scoreFontSize(ringSize: number) {
  if (ringSize >= 176) return 24;
  return 20;
}

function labelFontSize(ringSize: number) {
  return ringSize >= 118 ? 20 : 14;
}

function SignalRing({
  score,
  label,
  animate,
  delayMs,
  size = LOOP_RING_SIZE,
}: {
  score: number;
  label: string;
  animate: boolean;
  delayMs: number;
  size?: number;
}) {
  const refSize = 72;
  const stroke = Math.min(12, Math.max(4, 6 * (size / refSize)));
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringColor = colorForScore(score);
  const trackColor = `${ringColor}26`;
  const offset = animate ? circumference * (1 - score / 100) : circumference;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div
        className="relative"
        style={{ width: size, height: size }}
        aria-hidden
      >
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
                ? `stroke-dashoffset 800ms cubic-bezier(0.33, 1, 0.68, 1) ${delayMs}ms`
                : "none",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="leading-none text-[var(--black-100)]"
            style={{
              fontFamily: "var(--font-brand)",
              fontSize: scoreFontSize(size),
              fontWeight: 700,
            }}
          >
            {score}
          </span>
        </div>
      </div>
      <p
        className="mt-2 text-center font-medium leading-tight text-[var(--grey-80)]"
        style={{ fontSize: labelFontSize(size), fontWeight: 500 }}
      >
        {label}
      </p>
    </div>
  );
}

export default function NutritionLoopSignalsDemo() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="flex h-full flex-col justify-center rounded-xl border border-[var(--grey-10)] bg-white px-3 py-3 shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-center justify-evenly gap-1">
        {SIGNALS.map((signal, index) => (
          <SignalRing
            key={signal.label}
            score={signal.score}
            label={signal.label}
            animate={animate}
            delayMs={index * 120}
            size={LOOP_RING_SIZE}
          />
        ))}
      </div>
    </div>
  );
}
