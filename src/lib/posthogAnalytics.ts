import { withPostHog, withPostHogBeforeLeaving } from "@/lib/posthogClient";

/** Custom PostHog event fired when a user taps an App Store download CTA. */
export const POSTHOG_APP_STORE_EVENT = "app_store_click";

/**
 * Resolves once the event is sent, or after a short wait if PostHog is still
 * loading, so a link can hold its navigation until then (see AppStoreLink).
 */
export function trackPostHogAppStoreClick(source: string): Promise<void> {
  // sendBeacon survives same-tab navigation to the App Store before the request completes.
  return withPostHogBeforeLeaving((posthog) =>
    posthog.capture(POSTHOG_APP_STORE_EVENT, { source }, { transport: "sendBeacon" }),
  );
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
  withPostHog((posthog) => posthog.capture(event, { source: "shared-meal-plan", ...properties }));
}

/** Custom PostHog event fired when a visitor opens an FAQ answer. */
export const POSTHOG_FAQ_OPENED_EVENT = "faq_question_opened";

/** `questionId` is the question's fixed slug, never anything the visitor typed. */
export function trackFaqQuestionOpened(questionId: string, source: string) {
  withPostHog((posthog) => posthog.capture(POSTHOG_FAQ_OPENED_EVENT, { question_id: questionId, source }));
}

/**
 * Homepage scroll depth: fired once per page view when a section reaches the
 * middle of the screen. The only property is the section's fixed name.
 */
export const POSTHOG_SECTION_VIEWED_EVENT = "home_section_viewed";

export function trackSectionViewed(section: string) {
  withPostHog((posthog) => posthog.capture(POSTHOG_SECTION_VIEWED_EVENT, { section }));
}

/**
 * Fired once per page view the first time a capture video plays, whether it
 * started itself in view (`auto`) or the visitor pressed play (`button`).
 */
export const POSTHOG_VIDEO_PLAYED_EVENT = "website_video_played";

export function trackVideoPlayed(video: string, trigger: "auto" | "button") {
  if (typeof window === "undefined") return;
  // Read the path now: the event may wait in the queue until PostHog loads.
  const path = window.location.pathname;
  withPostHog((posthog) => posthog.capture(POSTHOG_VIDEO_PLAYED_EVENT, { video, trigger, path }));
}

/** Fired when a visitor lands on a URL with no page, to find broken links. */
export const POSTHOG_PAGE_NOT_FOUND_EVENT = "page_not_found";

/** `path` is the pathname only: no query string, which could carry anything. */
export function trackPageNotFound(path: string) {
  if (typeof window === "undefined") return;
  const referrer_host = document.referrer ? new URL(document.referrer).host : null;
  withPostHog((posthog) => posthog.capture(POSTHOG_PAGE_NOT_FOUND_EVENT, { path, referrer_host }));
}

/** Fired on each contact or feedback form submit, to see send failures. */
export const POSTHOG_CONTACT_FORM_EVENT = "contact_form_submitted";

/** Only the form kind, the outcome and the HTTP status; never what was typed. */
export function trackContactFormSubmitted(
  kind: "contact" | "feedback",
  outcome: "sent" | "failed" | "invalid",
  status?: number,
) {
  withPostHog((posthog) =>
    posthog.capture(POSTHOG_CONTACT_FORM_EVENT, { kind, outcome, ...(status ? { status } : {}) }),
  );
}
