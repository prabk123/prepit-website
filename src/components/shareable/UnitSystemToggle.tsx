"use client";

import type { UnitSystem } from "@/lib/types/meal-plan";

interface UnitSystemToggleProps {
  value: UnitSystem;
  onChange: (system: UnitSystem) => void;
}

const OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: "metric", label: "Metric" },
  { value: "imperial", label: "Imperial" },
];

export default function UnitSystemToggle({ value, onChange }: UnitSystemToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-tile border border-line bg-surface p-4 sm:px-5">
      <span id="units-label" className="text-body font-medium text-ink-secondary">
        Units
      </span>
      <div
        role="radiogroup"
        aria-labelledby="units-label"
        className="flex rounded-control bg-surface-raised p-1"
      >
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={`rounded-control px-4 py-1.5 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${
                selected ? "bg-cream text-on-cream" : "text-ink-muted hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
