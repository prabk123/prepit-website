import type { ChatPanelMessage } from "@/components/ui/ChatPanel";

/*
 * Messages the nutritionist sends on its own, word for word from the app's
 * backend (fresca_backend src/services/proactiveNudges.ts), with its quick
 * replies. Numbers are examples in the range the app's test accounts show.
 * If the wording there changes, change it here.
 */

/** Missed-log nudge: nothing logged by the person's usual breakfast time. */
export const missedBreakfast: ChatPanelMessage = {
  note: "9:40 am, before you opened the app",
  text: "I can't see any breakfast log today. Drop me a quick voice note when you get the chance if you had something, or let me know if you skipped it :)",
  replies: ["I skipped it", "I'll log it now"],
};

/** Protein check-in: protein short most days for three weeks, gap at dinner. */
export const proteinShort: ChatPanelMessage = {
  note: "After three weeks of short protein",
  text: "Over the past few weeks protein has been a little low: under your target on 15 of 21 logged days, about 86g a day against 110g. Most of the gap is at dinner, which averages about 19g. Two easy fixes that don't change what you cook: a bigger portion of the protein you already have at dinner, or a pot of Greek yogurt after dinner. Want to try one?",
  replies: ["Bigger protein at dinner", "Greek yogurt after dinner", "Not now"],
};

/** Weekly calorie pattern suggestion: the same two days over, four weeks running. */
export const weeklyPattern: ChatPanelMessage = {
  note: "When the same days keep running over",
  text: "Tuesdays and Wednesdays have run about 520 kcal over your goal in most of the last four weeks, while the rest of the week sits close to it. That's completely normal when some days are busier or more social. Want to give Tuesdays and Wednesdays more room and take a little off the other days? Your week would still add up to the same total.",
  replies: ["Not for me"],
};

/** Weigh-in reminder, a week after the last one. */
export const weighIn: ChatPanelMessage = {
  note: "A week since you last weighed in",
  text: "It's been 8 days since your last weigh-in. Next time you hop on the scales, just send me the number and I'll log it for you :)",
  replies: ["Log my weight", "Not this week"],
};

/** An example next step after a meal (not a message sent on its own). */
export const satietyNextStep: ChatPanelMessage = {
  text: "Your toast and jam breakfast was light on protein. Adding eggs or Greek yogurt at lunch would help hold Satiety until dinner.",
};
