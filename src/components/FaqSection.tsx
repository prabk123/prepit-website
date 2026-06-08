"use client";

import { useState } from "react";
import PrepItIcon from "@/components/shareable/PrepItIcon";

const FAQ_ITEMS = [
  {
    question: "Is PrepIt free?",
    answer:
      "You get full access free for 3 days. After that, it's one simple annual plan: $99.99/year — that's only $1.92/week. Cancel anytime.",
  },
  {
    question: "Will I be charged during the trial?",
    answer:
      "No. You won't be charged today. You get 3 full days of free access. If you haven't cancelled, your $99.99/year subscription starts on day 4. Cancel anytime before then to avoid being charged.",
  },
  {
    question: "How accurate is the AI logging?",
    answer:
      "PrepIt is built for accuracy. Instead of picking from a static food database, it searches the web for trustworthy sources — official brand pages, restaurant nutrition info, and verified references. Other apps rely on crowdsourced databases that go out of date and list dozens of conflicting options for the same item. PrepIt does that checking for you. You can still review and adjust anything before it's saved.",
  },
  {
    question: "What are Energy, Satiety, and Mood?",
    answer:
      "PrepIt turns your food log into three 0–100 nutrition signals — forward-looking scores that estimate how your eating is likely to affect you, not just what you ate. Energy measures how stable and sustained your available energy will be today, and how well your brain is fuelled for focus and mental load. Satiety reflects how well today's food choices suppress hunger hormones and reduce the drive to overeat or reach for low-quality food. Mood shows how well the previous day's food choices support cortisol regulation, emotional stability, and resistance to stress-driven eating. Energy and Satiety update as you log today; Mood is built from yesterday's full log. No wearable required — they're research-grounded estimates to guide your next meal, not a direct measure of how you feel.",
  },
  {
    question: "What is Ask Coach?",
    answer:
      "Ask Coach is your AI nutritionist inside PrepIt. Tap it from Home to ask anything about your goals, your day, or your last meal — and get answers in plain language using your own data. It can prepare actions like logging a meal or updating your targets, but you confirm everything before anything is saved.",
  },
  {
    question: "How does PrepIt set my calorie, macro, and weight goals?",
    answer:
      "During onboarding, PrepIt learns your goal (lose fat, build muscle, improve energy, and more), body stats, activity level, and target weight where relevant — then sets daily calorie and macro targets personalised to you. You can log weight over time and update your targets anytime in the app, or ask Coach to suggest changes.",
  },
  {
    question: "Do I need a wearable or CGM?",
    answer:
      "No. Your nutrition signals (Energy, Satiety, Mood) are built entirely from your food logs. Apple Health can make it sharper, but it's never required.",
  },
  {
    question: "Is it a replacement for a doctor or dietitian?",
    answer:
      "No. PrepIt is a coach, not a medical service. It'll point you to a professional when something needs one.",
  },
  {
    question: "Is my data private?",
    answer:
      "Your logs and goals are yours. PrepIt does not sell your personal or health data to advertisers. You have clear control over your account and history, and you can delete your account at any time. See our Privacy Policy for full details.",
  },
  {
    question: "Which devices?",
    answer:
      "PrepIt is available on iPhone via the App Store. (Android coming soon.)",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, anytime, in your App Store subscription settings.",
  },
] as const;

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  panelId,
  buttonId,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
  buttonId: string;
}) {
  return (
    <div className="border-b border-[var(--grey-10)] last:border-b-0">
      <h3 className="m-0">
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[var(--grey-80)] lg:py-6"
        >
          <span className="text-base font-semibold leading-snug text-[var(--black-100)] lg:text-lg">
            {question}
          </span>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--grey-5)] transition-colors duration-300"
            aria-hidden
          >
            <PrepItIcon
              name="chevronDown"
              size={16}
              color="var(--black-100)"
              className={`transition-transform duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`pb-5 transition-opacity duration-300 ease-in-out motion-reduce:transition-none lg:pb-6 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="pr-12 text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="flex w-full flex-col items-center bg-[var(--grey-5)] px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-10 text-center lg:gap-12">
        <div className="flex max-w-[720px] flex-col gap-4">
          <h2
            id="faq-heading"
            className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            Frequently asked questions
          </h2>
        </div>

        <div className="w-full max-w-[720px] rounded-2xl border border-[var(--grey-10)] bg-white px-5 text-left shadow-sm lg:px-6">
          {FAQ_ITEMS.map((item, index) => {
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex((current) =>
                    current === index ? null : index,
                  )
                }
                panelId={panelId}
                buttonId={buttonId}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
