"use client";

import type { UnitSystem } from "@/lib/types/meal-plan";

interface UnitSystemToggleProps {
  value: UnitSystem;
  onChange: (system: UnitSystem) => void;
}

export default function UnitSystemToggle({
  value,
  onChange,
}: UnitSystemToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4">
      <span className="text-sm font-semibold" style={{ color: "#4D4D59" }}>
        Units
      </span>
      <div
        className="relative flex rounded-full p-0.5"
        style={{ backgroundColor: "#F4F4F5" }}
      >
        <button
          type="button"
          onClick={() => onChange("imperial")}
          className="relative z-10 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200"
          style={{
            color: value === "imperial" ? "#fff" : "#7A7A82",
            backgroundColor: value === "imperial" ? "#000" : "transparent",
          }}
        >
          Imperial
        </button>
        <button
          type="button"
          onClick={() => onChange("metric")}
          className="relative z-10 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200"
          style={{
            color: value === "metric" ? "#fff" : "#7A7A82",
            backgroundColor: value === "metric" ? "#000" : "transparent",
          }}
        >
          Metric
        </button>
      </div>
    </div>
  );
}
