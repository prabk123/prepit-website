import { PRICES, TRIAL_DAYS } from "@/lib/pricing";
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
      "A tracker records what you ate and leaves the rest to you. PrepIt's nutritionist uses it. It notices patterns, like protein running low at dinner or the same days going over, messages you before you slip, and tells you the one thing to change first.",
  },
  {
    id: "medical",
    question: "Can it help with a medical condition?",
    answer:
      "It gives nutrition guidance, not medical advice. It won't diagnose anything or suggest a supplement dose beyond the public reference amount, and when something needs a professional it says so and points you to your GP, a pharmacist or a registered dietitian.",
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
      "Three scores from 0 to 100 that show how your food is likely to make you feel: whether you'll dip mid-afternoon, stay full until your next meal, and feel steady tomorrow. Energy and Satiety move as you log today; Mood reads yesterday's whole day. Each one comes with the reason and what to try next.",
    link: { href: RESEARCH_PAGE_HREF, label: "The research behind the scores" },
  },
  {
    id: "nutritionist",
    question: "What can I ask my nutritionist?",
    answer:
      "Anything about your food and your week: what to have for dinner, why you're hungry by 4pm, how to fit in a takeaway. It draws charts of your trends, runs your consultation and weekly check-in, plans meals, and logs, moves or fixes meals for you. Any log, plan or goal change it makes from chat shows up as a card first, and nothing is saved until you tap it.",
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
