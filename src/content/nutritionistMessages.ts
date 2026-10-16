import { chatCrop } from "@/lib/captures";

/*
 * Messages the nutritionist sends on its own, as real crops of the app's
 * Nutritionist chat (PRE-283), shot on the dev test account with the backend
 * seeds that send them (missed-log-nudge-sent, protein-check-in-sent,
 * calorie-banking-suggestion-sent, weight-reminder-sent). The numbers are
 * that account's. Retake them when the wording in fresca_backend
 * src/services/proactiveNudges.ts changes.
 */

/** Missed-log nudge: nothing logged by the person's usual breakfast time. */
export const missedBreakfast = {
  capture: chatCrop(
    "25-nudge-missed-breakfast-crop",
    "The nutritionist's message: I can't see any breakfast log today. Drop me a quick voice note when you get the chance if you had something, or let me know if you skipped it. Replies: I skipped it, I'll log it now, Type your own",
  ),
  caption: "When breakfast isn't on your log by your usual time",
};

/** Protein check-in: protein short most days for three weeks, gap at dinner. */
export const proteinShort = {
  capture: chatCrop(
    "25b-nudge-protein-crop",
    "The nutritionist's protein check-in: under target on 21 of 21 logged days, most of the gap at dinner, with two easy fixes. Replies: Bigger protein at dinner, Greek yogurt after dinner, Not now, Type your own",
  ),
  caption: "When protein runs short three weeks running",
};

/** Weekly calorie pattern suggestion: the same two days over, four weeks running. */
export const weeklyPattern = {
  capture: chatCrop(
    "24-nudge-weekly-pattern-crop",
    "The nutritionist noticing Tuesdays and Wednesdays run about 520 kcal over, then a Weekly calorie pattern card giving those days 2,250 kcal and the rest 1,620",
  ),
  caption: "When the same days keep running over",
  fade: true,
};

/** Weigh-in reminder, a week after the last one. */
export const weighIn = {
  capture: chatCrop(
    "24b-nudge-weigh-in-crop",
    "The nutritionist's weigh-in reminder after 8 days. Replies: Log my weight, Not this week, Type your own",
  ),
  caption: "A week after your last weigh-in",
};
