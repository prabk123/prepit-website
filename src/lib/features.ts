
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

/** A 4:5 still from public/landing/v9 (Charlie's site pages handoff, PRE-450). */
export type StagePhoto = {
  name: string;
  /** Exported widths; the largest is the intrinsic size. */
  widths: number[];
  alt: string;
  /** CSS object-position, where the handoff crops the still. */
  position?: string;
};

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
  /** The link preview's line instead of `summary`, where `summary` would repeat the heading (PRE-312). */
  shareLine?: string;
  /** The page's h1. */
  heading: string;
  /** The line under the h1. */
  lead: string;
  /**
   * The photo tile on the Features overview and in each page's related row
   * (PRE-450): the still, a short headline and, on the overview, one line.
   */
  tile: { photo: Omit<StagePhoto, "alt">; title: string; line: string };
};

/** The handoff's 4:5 stills (PRE-450), each at 560, 880 and 1200 px. */
export const STILL_WIDTHS = [560, 880, 1200];

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
    tile: {
      photo: { name: "consult-cups", widths: STILL_WIDTHS, position: "50% 88%" },
      title: "It speaks up first.",
      line: "One focus at a time.",
    },
  },
  "nutrition-signals": {
    slug: "nutrition-signals",
    name: "Energy, Satiety and Mood",
    title: "Energy, Satiety and Mood: how your food will make you feel",
    description:
      "Calories say what you ate. Energy, Satiety and Mood say whether you'll dip at 3pm, stay full until dinner and feel steady tomorrow, with the reason and what to try next.",
    summary: "Know how your food will make you feel, and why.",
    shareLine: "Whether you'll dip at 3pm or stay full until dinner, from your food alone.",
    heading: "Know how your food will make you feel.",
    lead: "Calories say what you ate. Energy, Satiety and Mood say whether you'll dip at 3pm, stay full until dinner and feel steady tomorrow, from your food alone.",
    tile: {
      photo: { name: "work-lunch", widths: STILL_WIDTHS },
      title: "Know how a meal will feel.",
      line: "Before the 3pm dip.",
    },
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
    tile: {
      photo: { name: "weekly-shop", widths: STILL_WIDTHS },
      title: "Next week, sorted.",
      line: "Plus the shopping list.",
    },
  },
  logging: {
    slug: "logging",
    name: "Logging",
    title: "Log meals in your own words, by voice or by photo",
    description:
      "Type what you ate like a text, say it or snap your plate. It's on your log straight away, checked against official brand and restaurant figures first.",
    summary: "Type it, snap it or say it. It's on your log straight away.",
    heading: "Type it like you'd text a friend.",
    lead: "“Chicken wrap, an apple and a flat white” is enough. Or say it, or snap your plate. It's on your log straight away, and the numbers fill in a few seconds later.",
    tile: {
      photo: { name: "wrap-plate", widths: STILL_WIDTHS },
      title: "Type it like a text.",
      line: "Or say it, or snap it.",
    },
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
    tile: {
      photo: { name: "out-the-door", widths: STILL_WIDTHS },
      title: "Log without opening it.",
      line: "One press, from anywhere.",
    },
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
