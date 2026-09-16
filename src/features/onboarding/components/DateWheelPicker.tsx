"use client";

import WheelPicker from "@/features/onboarding/components/WheelPicker";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function toIso(year: number, monthIndex: number, day: number) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${month}-${dayText}`;
}

export default function DateWheelPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (isoDate: string) => void;
}) {
  const parsed = new Date(`${value}T00:00:00`);
  const today = new Date();
  const year = Number.isNaN(parsed.getTime()) ? today.getFullYear() : parsed.getFullYear();
  const month = Number.isNaN(parsed.getTime()) ? today.getMonth() : parsed.getMonth();
  const day = Number.isNaN(parsed.getTime()) ? today.getDate() : parsed.getDate();
  const maxDay = daysInMonth(year, month);
  const safeDay = Math.min(day, maxDay);

  return (
    <div className="flex items-center justify-center gap-1">
      <WheelPicker
        value={year}
        values={range(1900, today.getFullYear())}
        onChange={(nextYear) =>
          onChange(toIso(nextYear, month, Math.min(safeDay, daysInMonth(nextYear, month))))
        }
        width={88}
      />
      <WheelPicker
        value={month}
        values={range(0, 11)}
        format={(index) => MONTHS[index] ?? String(index + 1)}
        onChange={(nextMonth) =>
          onChange(toIso(year, nextMonth, Math.min(safeDay, daysInMonth(year, nextMonth))))
        }
        width={128}
      />
      <WheelPicker
        value={safeDay}
        values={range(1, maxDay)}
        onChange={(nextDay) => onChange(toIso(year, month, nextDay))}
        width={56}
      />
    </div>
  );
}
