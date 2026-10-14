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
  groceryListCopied: "shared_meal_plan_grocery_list_copied",
  groceryListShared: "shared_meal_plan_grocery_list_shared",
  unitsChanged: "shared_meal_plan_units_changed",
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

/**
 * Homepage scroll depth: fired once per page view when a section reaches the
 * middle of the screen. The only property is the section's fixed name.
 */
export const POSTHOG_SECTION_VIEWED_EVENT = "home_section_viewed";

export function trackSectionViewed(section: string) {
  if (typeof window === "undefined" || !isPostHogEnabled()) return;

  posthog.capture(POSTHOG_SECTION_VIEWED_EVENT, { section });
}

/**
 * Fired once per page view the first time a capture video plays, whether it
 * started itself in view (`auto`) or the visitor pressed play (`button`).
 */
export const POSTHOG_VIDEO_PLAYED_EVENT = "website_video_played";

export function trackVideoPlayed(video: string, trigger: "auto" | "button") {
  if (typeof window === "undefined" || !isPostHogEnabled()) return;

  posthog.capture(POSTHOG_VIDEO_PLAYED_EVENT, {
    video,
    trigger,
    path: window.location.pathname,
  });
}
