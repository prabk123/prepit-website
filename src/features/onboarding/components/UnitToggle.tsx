"use client";

type Unit = "Imperial" | "Metric";

export default function UnitToggle({
  value,
  onChange,
}: {
  value: Unit;
  onChange: (unit: Unit) => void;
}) {
  return (
    <div className="mx-auto flex h-[37px] w-[176px] rounded-full bg-[var(--input-fill)] p-1">
      {(["Imperial", "Metric"] as const).map((unit) => {
        const selected = value === unit;
        return (
          <button
            key={unit}
            type="button"
            onClick={() => onChange(unit)}
            className={`flex-1 rounded-full text-xs transition duration-150 ${
              selected
                ? "bg-[var(--primary)] font-bold text-[var(--on-primary)]"
                : "font-normal text-[var(--text-primary)]"
            }`}
          >
            {unit}
          </button>
        );
      })}
    </div>
  );
}
