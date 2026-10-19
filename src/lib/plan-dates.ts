import type { PlanDay } from "@/lib/types/meal-plan";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The calendar day a plan date stands for, as a UTC midnight Date.
 *
 * New app builds store each plan day as UTC midnight. Older builds stored
 * London local midnight, which is 23:00 UTC the day before in summer. Adding
 * 12 hours before taking the UTC date maps both to the same day, and doing it
 * in UTC keeps the server render and the visitor's browser in agreement
 * whatever their time zone.
 */
export function planDay(date: string | Date): Date {
  const shifted = new Date(new Date(date).getTime() + DAY_MS / 2);
  return new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()),
  );
}

/** `2026-10-14`, for keys and comparisons. */
export function planDayKey(date: string | Date): string {
  return planDay(date).toISOString().slice(0, 10);
}

// Names are spelled out here rather than with toLocaleDateString, because
// Node and browsers ship different ICU data ("Monday 19 October" on one,
// "Monday, 19 October" on another), which breaks hydration.
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parts(date: string | Date) {
  const day = planDay(date);
  return {
    weekday: WEEKDAYS[day.getUTCDay()],
    day: day.getUTCDate(),
    month: MONTHS[day.getUTCMonth()],
    year: day.getUTCFullYear(),
  };
}

/** `14 Oct` */
export function formatShortDate(date: string | Date): string {
  const { day, month } = parts(date);
  return `${day} ${month.slice(0, 3)}`;
}

/** `Wednesday 14 Oct` */
export function formatLongDay(date: string | Date): string {
  const { weekday, day, month } = parts(date);
  return `${weekday} ${day} ${month.slice(0, 3)}`;
}

/** `Wed` */
export function formatWeekday(date: string | Date): string {
  return parts(date).weekday.slice(0, 3);
}

/** `Wednesday 14 October 2026`, the app's accessible day label. */
export function formatFullDay(date: string | Date): string {
  const { weekday, day, month, year } = parts(date);
  return `${weekday} ${day} ${month} ${year}`;
}

/** `14 to 18 Oct`, or `28 Oct to 1 Nov` across a month. */
export function formatPlanRange(days: PlanDay[]): string {
  if (days.length === 0) return "";
  const first = planDay(days[0].date);
  const last = planDay(days[days.length - 1].date);
  if (first.getTime() === last.getTime()) return formatShortDate(first);
  const sameMonth =
    first.getUTCMonth() === last.getUTCMonth() &&
    first.getUTCFullYear() === last.getUTCFullYear();
  const start = sameMonth ? String(first.getUTCDate()) : formatShortDate(first);
  return `${start} to ${formatShortDate(last)}`;
}

/**
 * Days for the week strip: seven from the plan's first day, or more rows of
 * seven when the plan runs longer, so every plan day can be picked.
 */
export function planWeek(days: PlanDay[]): Date[] {
  const start = planDay(days[0].date).getTime();
  const end = planDay(days[days.length - 1].date).getTime();
  const span = Math.round((end - start) / DAY_MS) + 1;
  const length = Math.max(7, Math.ceil(span / 7) * 7);
  return Array.from({ length }, (_, i) => new Date(start + i * DAY_MS));
}

/** Distinct recipes across the plan. */
export function countRecipes(days: PlanDay[]): number {
  const seen = new Set<string>();
  for (const day of days) {
    for (const meal of [day.breakfast, day.lunch, day.dinner, day.snack]) {
      if (meal?.recipe?._id) seen.add(meal.recipe._id);
    }
  }
  return seen.size;
}
