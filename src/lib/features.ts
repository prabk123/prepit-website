/**
 * The feature pages (PRE-203): one page per major feature at
 * /features/<slug>, so each has something for search engines to rank and
 * visitors who want detail can find it. Each page's sections live in
 * src/components/features/pages; this file holds what the page template, the
 * sitemap, the footer, the related row and the link previews need.
 *
 * Facts are checked against the app and fresca_backend docs/product-help.
 */

export const FEATURE_SLUGS = [
  "logging",
  "nutrition-signals",
  "ai-nutritionist",
  "meal-plans",
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
  /** The hero eyebrow. */
  eyebrow: string;
  /** The page's h1. */
  heading: string;
  /** The line under the h1. */
  lead: string;
  /** A dark-mode still from public/app for the related-features card. */
  thumb: string;
};

export const FEATURES: Record<FeatureSlug, FeatureMeta> = {
  logging: {
    slug: "logging",
    name: "Logging",
    title: "Log meals in seconds by typing, photo or Siri",
    description:
      "Describe a meal in your own words, snap your plate or ask Siri. PrepIt checks official brand and restaurant figures first and shows what it assumed, so you can fix anything.",
    summary: "Type it, snap it or say it. Your nutritionist does the maths.",
    eyebrow: "Logging",
    heading: "The easiest logging you'll ever do.",
    lead: "Describe it, snap it or say it. PrepIt does the research and the maths, and you can change anything in one tap.",
    thumb: "01b-home-log",
  },
  "nutrition-signals": {
    slug: "nutrition-signals",
    name: "Energy, Satiety and Mood",
    title: "Energy, Satiety and Mood scores from your food",
    description:
      "PrepIt turns what you eat into three scores from 0 to 100: Energy, Satiety and Mood. Grounded in nutrition research and built from your food alone, no wearable needed.",
    summary: "Three scores that show how your food will make you feel.",
    eyebrow: "Energy, Satiety and Mood",
    heading: "Calories tell you what you ate. PrepIt tells you how you'll feel.",
    lead: "Three scores from 0 to 100, built from your food alone. No ring, no watch, no glucose monitor.",
    thumb: "06-signal-energy",
  },
  "ai-nutritionist": {
    slug: "ai-nutritionist",
    name: "Your AI nutritionist",
    title: "An AI nutritionist that knows your goals and your day",
    description:
      "Ask PrepIt's nutritionist anything. It knows your goals and what you ate, draws charts, logs meals from chat, answers voice notes and checks in with you every week.",
    summary: "Answers, charts and weekly check-ins from a nutritionist who knows your day.",
    eyebrow: "Your AI nutritionist",
    heading: "Ask anything. It knows your goals, your day and your last meal.",
    lead: "Answers in plain language, built on what you actually ate. And it doesn't wait for you to ask.",
    thumb: "02-chat-chart",
  },
  "meal-plans": {
    slug: "meal-plans",
    name: "Meal plans",
    title: "Meal plans with a grocery list and cost estimate",
    description:
      "Ask for a week of meals and PrepIt plans around your goals, tastes and budget, with one grocery list by aisle, an estimated cost and a weekly calorie pattern.",
    summary: "A week of meals built for you, with one grocery list.",
    eyebrow: "Meal plans",
    heading: "Ask for a week of meals. Get a plan built for you.",
    lead: "Your nutritionist plans around your goals, tastes and budget, then helps you stick to it.",
    thumb: "13-grocery-list",
  },
  "widgets-and-siri": {
    slug: "widgets-and-siri",
    name: "Widgets and Siri",
    title: "iPhone widgets, Siri and the Action button",
    description:
      "Log a meal with Siri, the Action button or Control Center, and add water, tick supplements and log planned meals from widgets without opening PrepIt.",
    summary: "Log and tick things off without opening the app.",
    eyebrow: "Widgets and Siri",
    heading: "PrepIt, without opening PrepIt.",
    lead: "Widgets on your Home Screen and Lock Screen, Siri, the Action button and Control Center. Log a meal or tick something off in a second.",
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
