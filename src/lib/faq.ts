import { PRICES, type Prices, TRIAL_DAYS, WEB_REMINDER_EMAIL_LIVE } from "@/lib/pricing";
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
 * The pre-v9 homepage FAQ. Its support questions (HOME_SUPPORT_FAQ_IDS) are
 * still on the homepage, after Landing v9's own questions (PRE-444).
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
      "Only when it's useful, and with a light touch: a breakfast you haven't logged, a pattern worth fixing or a weigh-in reminder. You can turn each kind off in Settings.",
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

/**
 * The Landing v9 FAQ (PRE-433): Charlie's nine questions from the handoff,
 * in his order. Ids of questions kept from the earlier landing FAQ stay the
 * same, so `faq_question_opened` reads across both versions.
 */
function landingFaq({
  trial,
  cancel,
  professional,
  phones,
}: {
  trial: FaqItem;
  cancel: FaqItem;
  professional: string;
  phones: FaqItem;
}): FaqItem[] {
  return [
    trial,
    cancel,
    {
      id: "landing-real-nutritionist",
      question: "Is PrepIt a real nutritionist?",
      answer:
        "An AI nutritionist, and it always says so. Its advice comes from your meals, your goals and nutrition research. You confirm every change it suggests.",
    },
    {
      id: "landing-sell-data",
      question: "Do you sell my data?",
      answer: "No. We don't sell your data, and we don't share your food, health or body data with advertisers.",
      link: { href: "/privacy-policy", label: "Privacy policy" },
    },
    {
      id: "landing-consultation",
      question: "What happens in the consultation?",
      answer: "3 short chat sessions in your first week: Getting to know you, What I've noticed so far, and Week-in-review.",
    },
    {
      id: "landing-meal-plan",
      question: "Can I get a meal plan in the free week?",
      answer:
        "Yes. Ask any time after Session 1, and Session 2 offers to plan your week. Up to 7 days, for 1 person, with 1 grocery list.",
    },
    {
      id: "landing-energy-satiety-mood",
      question: "What are Energy, Satiety and Mood?",
      answer:
        "3 scores from 0 to 100 showing how your meals line up with steadier energy, fullness and mood, each with the reason. Estimates, not a medical measurement.",
    },
    {
      id: "landing-medical",
      question: "Can PrepIt help with a medical condition?",
      answer: `PrepIt gives nutrition guidance, not medical advice. Medical questions go to ${professional}, a pharmacist or a registered dietitian.`,
    },
    phones,
  ];
}

/**
 * The landing page FAQ where visitors start on the website (PRE-302).
 * A web subscription is managed and cancelled on the website, not in the app
 * or the App Store (PRE-304), so the cancel answer says so. The prices are
 * in the currency checkout charges this visitor (PRE-373), yearly total first
 * (PRE-357).
 */
export const landingWebFaqItems = (prices: Prices): FaqItem[] =>
  landingFaq({
    trial: {
      id: "landing-web-trial",
      question: "How does the free trial work?",
      answer: `${TRIAL_DAYS} days, everything included. ${prices.free} today${WEB_REMINDER_EMAIL_LIVE ? ", and a reminder email on day 4" : ""}. Keep PrepIt and you pay from day 8: ${prices.annual} a year (${prices.annualPerMonth} a month) or ${prices.monthly} a month. Cancel before day 8 and you pay nothing.`,
    },
    cancel: {
      id: "landing-web-cancel",
      question: "How do I cancel?",
      answer:
        "Any time before day 8, from your account at tryprepit.app/account, and you pay nothing. Started in the App Store? Cancel in your iPhone's Settings.",
      link: { href: "/account", label: "Manage your subscription" },
    },
    professional: "your doctor",
    phones: {
      id: "landing-web-devices",
      question: "Which phones does it work on?",
      answer: "iPhone, from the App Store. Start here, then download PrepIt and sign in with the same account. Android isn't available yet.",
    },
  });

/** schema.org FAQPage for the same questions and answers. */
/**
 * The support questions from the homepage before Landing v9 (PRE-444) that the
 * landing's FAQ doesn't cover. The homepage FAQ adds them before its last
 * question (which phones), so search and the contact page's "Read the FAQ"
 * still find them. /try leaves them out.
 */
export const HOME_SUPPORT_FAQ_IDS = ["different-from-tracker", "logging-accuracy", "messages", "wearable"] as const;

export function homeFaqItems(landingItems: FaqItem[]): FaqItem[] {
  const support = HOME_SUPPORT_FAQ_IDS.map((id) => FAQ_ITEMS.find((item) => item.id === id)).filter(
    (item): item is FaqItem => item !== undefined,
  );
  return [...landingItems.slice(0, -1), ...support, ...landingItems.slice(-1)];
}

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
