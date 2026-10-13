"use client";

import { useSyncExternalStore } from "react";
import { formatFullDay, formatWeekday, planDayKey } from "@/lib/plan-dates";

interface WeekCalendarProps {
  /** Plan days as UTC midnight, from planWeek(). */
  weekDates: Date[];
  planDateSet: Set<string>;
  selectedDate: string;
  onSelect: (dateKey: string) => void;
}

// The visitor's own today, read in the browser only, so the server render
// (in UTC) never disagrees with it.
function todayKey(): string {
  const now = new Date();
  return planDayKey(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

const noSubscribe = () => () => {};

/** Rows of seven day cells. Days outside the plan are greyed and disabled. */
export default function WeekCalendar({
  weekDates,
  planDateSet,
  selectedDate,
  onSelect,
}: WeekCalendarProps) {
  const today = useSyncExternalStore(noSubscribe, todayKey, () => null);

  return (
    <div className="grid grid-cols-7 gap-y-3">
      {weekDates.map((date) => {
        const dateKey = planDayKey(date);
        const inPlan = planDateSet.has(dateKey);
        const selected = dateKey === selectedDate;
        const label = `${formatFullDay(date)}${selected ? ", selected" : ""}${inPlan ? "" : ", disabled"}`;

        return (
          <button
            key={dateKey}
            type="button"
            onClick={() => inPlan && onSelect(dateKey)}
            disabled={!inPlan}
            aria-label={label}
            aria-pressed={inPlan ? selected : undefined}
            className="flex flex-col items-center gap-1.5 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream disabled:cursor-default disabled:opacity-35"
          >
            <span
              className={`text-small ${selected ? "font-medium text-ink" : "text-ink-muted"}`}
            >
              {formatWeekday(date)}
            </span>
            <span className="relative flex flex-col items-center">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-control text-lead transition-colors sm:h-12 sm:w-12 ${
                  selected ? "bg-cream font-medium text-on-cream" : "text-ink"
                }`}
              >
                {date.getUTCDate()}
              </span>
              {dateKey === today && (
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 h-1.5 w-1.5 rounded-control bg-satiety"
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
