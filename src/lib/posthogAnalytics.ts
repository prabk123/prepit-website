import posthog from "posthog-js";
import { isPostHogEnabled } from "@/lib/analytics";

/** Custom PostHog event fired when a user taps an App Store download CTA. */
export const POSTHOG_APP_STORE_EVENT = "app_store_click";

export function trackPostHogAppStoreClick(source: string) {
  if (typeof window === "undefined" || !isPostHogEnabled()) return;

  // sendBeacon survives same-tab navigation to the App Store before the request completes.
  posthog.capture(POSTHOG_APP_STORE_EVENT, { source }, { transport: "sendBeacon" });
}

/**
 * Shared meal plan page events. Properties are the plan id and plan shape
 * only; never names, emails or anything about the person who shared it.
 */
export const SHARED_MEAL_PLAN_EVENTS = {
  viewed: "shared_meal_plan_viewed",
  recipeOpened: "shared_meal_plan_recipe_opened",
  groceryListOpened: "shared_meal_plan_grocery_list_opened",
} as const;

export function trackSharedMealPlanEvent(
  event: (typeof SHARED_MEAL_PLAN_EVENTS)[keyof typeof SHARED_MEAL_PLAN_EVENTS],
  properties: { plan_id: string } & Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined" || !isPostHogEnabled()) return;

  posthog.capture(event, { source: "shared-meal-plan", ...properties });
}

/** Custom PostHog event fired when a visitor opens an FAQ answer. */
export const POSTHOG_FAQ_OPENED_EVENT = "faq_question_opened";

/** `questionId` is the question's fixed slug, never anything the visitor typed. */
export function trackFaqQuestionOpened(questionId: string, source: string) {
  if (typeof window === "undefined" || !isPostHogEnabled()) return;

  posthog.capture(POSTHOG_FAQ_OPENED_EVENT, { question_id: questionId, source });
}
