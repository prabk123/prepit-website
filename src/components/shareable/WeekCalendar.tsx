"use client";

interface WeekCalendarProps {
  weekDates: Date[];
  planDateSet: Set<string>;
  selectedDate: string;
  onSelect: (dateStr: string) => void;
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    dates.push(day);
  }
  return dates;
}

export default function WeekCalendar({
  weekDates,
  planDateSet,
  selectedDate,
  onSelect,
}: WeekCalendarProps) {
  return (
    <div className="flex justify-around">
      {weekDates.map((date) => {
        const dateKey = toDateKey(date);
        const inPlan = planDateSet.has(dateKey);
        const selected = dateKey === selectedDate;
        const today = isToday(date);
        const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = date.getDate();

        return (
          <button
            key={dateKey}
            onClick={() => inPlan && onSelect(dateKey)}
            className="flex flex-col items-center gap-1"
            style={{
              opacity: inPlan ? 1 : 0.3,
              cursor: inPlan ? "pointer" : "default",
            }}
            disabled={!inPlan}
          >
            <span
              className="text-sm"
              style={{
                fontWeight: selected ? 700 : 400,
                color: "#000",
              }}
            >
              {dayLabel}
            </span>
            <div className="relative flex flex-col items-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: selected ? "#000" : "transparent",
                }}
              >
                <span
                  className="text-lg"
                  style={{
                    fontWeight: selected ? 700 : 400,
                    color: selected ? "#FFF" : "#000",
                  }}
                >
                  {dayNum}
                </span>
              </div>
              {today && (
                <div
                  className="absolute -bottom-1 h-2 w-2 rounded-full"
                  style={{ backgroundColor: "#FF5722" }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
