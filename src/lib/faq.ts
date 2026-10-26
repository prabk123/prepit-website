import { PRICES, type Prices, TRIAL_DAYS } from "@/lib/pricing";
import { RESEARCH_PAGE_HREF } from "@/lib/research";

export type FaqItem = {
  /** Fixed slug, sent with the `faq_question_opened` event. Never change one. */
  id: string;
  question: string;
  answer: string;
  /** A link shown under the answer (not in the structured data). */
  link?: { href: string; label: string };
};

/**
 * The FAQ sits under the homepage's questions section, so it covers what that
 * section doesn't (price, trial, logging, scores, messages) in the same voice.
 * The visible accordion and the FAQPage structured data both read this list, so
 * they always match.
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "is-it-free",
    question: "Is PrepIt free?",
    answer: `Your first ${TRIAL_DAYS} days are free, with everything included. After that it's ${PRICES.annual} a year, which is ${PRICES.annualPerWeek} a week, or ${PRICES.monthly} a month. Cancel anytime.`,
  },
  {
    id: "charged-during-trial",
    question: "Will I be charged during the trial?",
    answer: `No. If you haven't cancelled, your subscription starts when the ${TRIAL_DAYS} free days end. Cancel at least 24 hours before then in your App Store settings and you won't be charged.`,
  },
  {
    id: "different-from-tracker",
    question: "How is PrepIt different from a calorie tracker?",
    answer:
      "A tracker records what you ate and leaves the rest to you. PrepIt's nutritionist uses it: it notices patterns, like protein running low at dinner, messages you before you slip, and tells you the one thing to change first.",
  },
  {
    id: "medical",
    question: "Can it help with a medical condition?",
    answer:
      "It gives nutrition guidance, not medical advice. It won't diagnose anything or suggest a dose beyond the public reference amount, and points you to your GP, a pharmacist or a registered dietitian when you need one.",
    link: { href: RESEARCH_PAGE_HREF, label: "How your nutritionist decides what to say" },
  },
  {
    id: "logging-accuracy",
    question: "How accurate is the logging?",
    answer:
      "For a branded or restaurant food, PrepIt looks for the official nutrition figures first, and only then uses other food data. Typed and photo meals show what it assumed and how confident it is, and you can change any item.",
  },
  {
    id: "energy-satiety-mood",
    question: "What are Energy, Satiety and Mood?",
    answer:
      "Three scores from 0 to 100 that show how your food is likely to make you feel: whether you'll dip mid-afternoon, stay full until your next meal, and feel steady tomorrow. Each one comes with the reason.",
    link: { href: RESEARCH_PAGE_HREF, label: "The research behind the scores" },
  },
  {
    id: "nutritionist",
    question: "What can I ask my nutritionist?",
    answer:
      "Anything about your food and your week: what to have for dinner, why you're hungry by 4pm, how to fit in a takeaway. It also plans meals and logs or fixes them for you. A change it makes from chat shows up as a card, saved only when you tap it.",
  },
  {
    id: "messages",
    question: "Will it message me?",
    answer:
      "Only when it's useful, and at most once a day: a breakfast you haven't logged, a pattern worth fixing or a weigh-in reminder. You can turn each kind off in Settings.",
  },
  {
    id: "wearable",
    question: "What does connecting Apple Health add?",
    answer:
      "It's optional. Once it's connected, your nutritionist also sees your workouts, so it can tell a hungry gym day from a hungry rest day.",
  },
  {
    id: "devices",
    question: "Which devices?",
    answer: "iPhone, from the App Store. Android is coming soon.",
  },
];

const LANDING_SHARED_FAQ: FaqItem[] = [
  {
    id: "landing-consultation",
    question: "What happens in the nutrition consultation?",
    answer:
      "Three short chat sessions with your AI nutritionist in your first week: getting to know you, what it noticed in your first few days of meals, and a review of the week. Session 3 is your first weekly check-in.",
  },
  {
    id: "landing-meal-plan",
    question: "Can I get a meal plan in the free week?",
    answer:
      "Yes. Ask your nutritionist any time after Session 1, and Session 2 offers to plan your week. Plans cover up to 7 days, for one person, with one grocery list.",
  },
  {
    id: "landing-real-nutritionist",
    question: "Is PrepIt a real nutritionist?",
    answer:
      "PrepIt's nutritionist is AI, and never claims to be human. Its advice comes from your meals, your goals and nutrition science, and you confirm every suggested change.",
  },
  {
    id: "landing-energy-satiety-mood",
    question: "What are Energy, Satiety and Mood?",
    answer:
      "Three scores from 0 to 100 that show how your meals line up with steadier energy, fullness and mood, each with the reason behind it. They're estimates to guide your next meal, not a medical measurement.",
  },
];

function landingMedicalFaq(professional: string): FaqItem {
  return {
    id: "landing-medical",
    question: "Can PrepIt help with a medical condition?",
    answer: `PrepIt gives nutrition guidance, not medical advice. Medical questions get pointed to a qualified professional, such as ${professional}, a pharmacist or a registered dietitian.`,
  };
}

/**
 * The landing page FAQ where visitors start on the website (PRE-302).
 * A web subscription is managed and cancelled on the website, not in the app
 * or the App Store (PRE-304), so the cancel answer says so. The prices are
 * in the currency checkout charges this visitor (PRE-373).
 */
export const landingWebFaqItems = (prices: Prices): FaqItem[] => [
  {
    id: "landing-web-trial",
    question: "How does the free trial work?",
    answer: `You get ${TRIAL_DAYS} days with everything included, starting with your nutrition consultation. You pay ${prices.free} today, and we email you a reminder on day 4. If you keep PrepIt, your plan starts on day 8: ${prices.annual} a year (that works out at ${prices.annualPerMonth} a month) or ${prices.monthly} a month. Cancel before day 8 and you pay nothing.`,
  },
  {
    id: "landing-web-cancel",
    question: "How do I cancel?",
    answer:
      "Cancel any time before day 8 and you won't be charged. If you started on this website, go to tryprepit.app/account and sign in with the same Google or Apple account, then cancel there. It isn't managed in the app or in your iPhone's settings. If you started in the App Store, go to Settings on your iPhone, then your name, then Subscriptions, at least 24 hours before the trial ends.",
    link: { href: "/account", label: "Manage your subscription" },
  },
  ...LANDING_SHARED_FAQ,
  landingMedicalFaq("your doctor"),
  {
    id: "landing-web-devices",
    question: "Which devices does PrepIt work on?",
    answer:
      "iPhone, from the App Store. After you sign up here, you download PrepIt and sign in with the same account. Android isn't available yet. We never sell your personal or health data.",
  },
];

/** The same questions for visitors who start in the App Store (PRE-331). */
export const LANDING_APP_STORE_FAQ_ITEMS: FaqItem[] = [
  {
    id: "landing-app-store-trial",
    question: "How does the free trial work?",
    answer: `You get ${TRIAL_DAYS} days with everything included, starting with your nutrition consultation. If you keep PrepIt, your plan starts when the free days end: ${PRICES.annual} a year or ${PRICES.monthly} a month in US dollars; the App Store shows the price for your country.`,
  },
  {
    id: "landing-app-store-cancel",
    question: "How do I cancel?",
    answer:
      "Go to Settings on your iPhone, then your name, then Subscriptions, at least 24 hours before the trial ends, and you won't be charged.",
  },
  ...LANDING_SHARED_FAQ,
  landingMedicalFaq("your GP"),
  {
    id: "landing-app-store-devices",
    question: "Which devices does PrepIt work on?",
    answer: "iPhone, from the App Store. Android isn't available yet. We never sell your personal or health data.",
  },
];

/** schema.org FAQPage for the same questions and answers. */
export function faqPageJsonLd(items: FaqItem[] = FAQ_ITEMS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
