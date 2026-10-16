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
 * The FAQ from the approved homepage copy (PRE-197). The visible accordion and
 * the FAQPage structured data both read this list, so they always match.
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "is-it-free",
    question: "Is PrepIt free?",
    answer: `You get full access free for ${TRIAL_DAYS} days. After that it's ${PRICES.annual} a year, which is ${PRICES.annualPerWeek} a week, or ${PRICES.monthly} a month. Cancel anytime.`,
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
      "A tracker records what you ate. PrepIt's nutritionist uses it: it shows how your food will make you feel, checks in when you go quiet, spots patterns like low protein, and tells you what to eat next.",
  },
  {
    id: "logging-accuracy",
    question: "How accurate is the logging?",
    answer:
      "Official sources first. PrepIt looks for the brand's or restaurant's own nutrition information before anything else, and only then uses other food databases. Every estimate shows what it assumed, and you can adjust any item.",
  },
  {
    id: "energy-satiety-mood",
    question: "What are Energy, Satiety and Mood?",
    answer:
      "Three 0 to 100 scores that estimate how your food is likely to affect you. Energy and Satiety update as you log today; Mood is built from yesterday's full log. They're research-based guides for your next meal, not a measure of how you feel.",
    link: { href: RESEARCH_PAGE_HREF, label: "The research behind the scores" },
  },
  {
    id: "nutritionist",
    question: "What can the nutritionist do?",
    answer:
      "Answer questions about your day, draw charts of your trends, run your consultation and weekly check-in, build and change meal plans, and log, move or fix meals for you. You confirm every log, plan or goal change before it's saved.",
  },
  {
    id: "messages",
    question: "Will it message me?",
    answer:
      "Only when it's useful, such as a missed meal, a pattern worth fixing or a weigh-in reminder. You can turn each kind off in Settings.",
  },
  {
    id: "wearable",
    question: "Do I need a wearable or CGM?",
    answer:
      "No. Everything comes from what you log. Apple Health can make it sharper, but it's never required.",
  },
  {
    id: "medical",
    question: "Is it a replacement for a doctor or dietitian?",
    answer:
      "No. PrepIt gives nutrition guidance, not medical advice, and will point you to a professional when something needs one.",
  },
  {
    id: "privacy",
    question: "Is my data private?",
    answer:
      "Your logs and goals are yours. PrepIt doesn't sell your personal or health data, and you can delete your account at any time.",
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
