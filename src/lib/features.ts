import type { CardThumb } from "@/lib/captures";

/**
 * The feature pages (PRE-203): one page per major feature at
 * /features/<slug>, so each has something for search engines to rank and
 * visitors who want detail can find it. Each page's sections live in
 * src/components/features/pages; this file holds what the page template, the
 * sitemap, the footer, the related row and the link previews need.
 *
 * Facts are checked against the app and fresca_backend docs/product-help.
 */

/** Site order: the two standouts first, as on the homepage, then the rest. */
export const FEATURE_SLUGS = [
  "ai-nutritionist",
  "nutrition-signals",
  "meal-plans",
  "logging",
  "widgets-and-siri",
] as const;

export type FeatureSlug = (typeof FEATURE_SLUGS)[number];

export type FeatureMeta = {
  slug: FeatureSlug;
  /** Short name for links, cards and the footer, e.g. "Logging". */
  name: string;
  /** The page's <title>, before " | PrepIt". Unique per page. */
  title: string;
  /** Meta and link preview description, about 150 characters. */
  description: string;
  /** One line for the related-features card and the link preview. */
  summary: string;
  /** The page's h1. */
  heading: string;
  /** The line under the h1. */
  lead: string;
  /** The related-features card's thumbnail, a crop of this still (PRE-289). */
  thumb: CardThumb;
};

/*
 * Copy is in the lifecycle-email voice (PRE-279): the reader's day first,
 * then how PrepIt does it. Keep the shared phrases the same on every page:
 * "your nutritionist", "one thing to change", "Energy, Satiety and Mood",
 * "7 days free".
 */
export const FEATURES: Record<FeatureSlug, FeatureMeta> = {
  "ai-nutritionist": {
    slug: "ai-nutritionist",
    name: "Your nutritionist",
    title: "An AI nutritionist that knows you and speaks up",
    description:
      "PrepIt's nutritionist learns how you eat, agrees one thing to change first, and messages you when it spots a pattern. Ask it anything, any time.",
    summary: "It learns how you eat, and speaks up before you slip.",
    heading: "A nutritionist that knows you and speaks up.",
    lead: "It learns how you eat, agrees one thing to change first, and messages you when it spots something. You don't have to remember to ask.",
    thumb: "02-chat-chart",
  },
  "nutrition-signals": {
    slug: "nutrition-signals",
    name: "Energy, Satiety and Mood",
    title: "Energy, Satiety and Mood: how your food will make you feel",
    description:
      "Calories say what you ate. Energy, Satiety and Mood say whether you'll dip at 3pm, stay full until dinner and feel steady tomorrow, with the reason and what to try next.",
    summary: "Know how your food will make you feel, and why.",
    heading: "Know how your food will make you feel.",
    lead: "Calories say what you ate. Energy, Satiety and Mood say whether you'll dip at 3pm, stay full until dinner and feel steady tomorrow, from your food alone.",
    thumb: "06-signal-energy",
  },
  "meal-plans": {
    slug: "meal-plans",
    name: "Meal plans",
    title: "Meal plans with a grocery list and cost estimate",
    description:
      "Ask your nutritionist for a week of meals. It plans around your goals, tastes and budget, swaps anything you don't fancy and builds one grocery list by aisle.",
    summary: "Ask for a week of meals. Get the plan and the shopping list.",
    heading: "Your week, planned in one chat.",
    lead: "Tell your nutritionist which days to cover and what you'd rather avoid. It plans the meals around your goals and builds the grocery list for you.",
    thumb: "13-grocery-list",
  },
  logging: {
    slug: "logging",
    name: "Logging",
    title: "Log meals in your own words, by photo or with Siri",
    description:
      "Type what you ate like a text, snap your plate or ask Siri. It's on your log straight away, checked against official brand and restaurant figures first.",
    summary: "Type it, snap it or say it. It's on your log straight away.",
    heading: "Logging that doesn't feel like a chore.",
    lead: "Most people quit tracking because logging takes too long. Here you type “two eggs and buttered toast”, snap your plate or say it to Siri, and it's on your log straight away.",
    thumb: "01b-home-log",
  },
  "widgets-and-siri": {
    slug: "widgets-and-siri",
    name: "Widgets and Siri",
    title: "iPhone widgets, Siri and the Action button",
    description:
      "Log a meal with Siri, the Action button or Control Centre, and add water, tick supplements or log a planned meal from a widget without opening PrepIt.",
    summary: "Log a meal or tick something off without opening the app.",
    heading: "PrepIt, without opening PrepIt.",
    lead: "The less effort logging takes, the better your nutritionist's advice gets. Press the Action button, ask Siri or tap a widget, and it's done.",
    thumb: "23b-home-screen-widgets",
  },
};

export function isFeatureSlug(slug: string): slug is FeatureSlug {
  return (FEATURE_SLUGS as readonly string[]).includes(slug);
}

export function featureHref(slug: FeatureSlug): string {
  return `/features/${slug}`;
}

/** Every feature page except this one, in site order, for the related row. */
export function relatedFeatures(slug: FeatureSlug): FeatureMeta[] {
  return FEATURE_SLUGS.filter((other) => other !== slug).map((other) => FEATURES[other]);
}
