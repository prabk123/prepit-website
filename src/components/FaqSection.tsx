"use client";

import { useState } from "react";
import PrepItIcon from "@/components/shareable/PrepItIcon";

const FAQ_ITEMS = [
  {
    question: "Is PrepIt free?",
    answer:
      "You get full access free for 3 days. After that, it's one simple subscription: choose annual (best value), weekly, or monthly. Cancel anytime.",
  },
  {
    question: "Will I be charged during the trial?",
    answer:
      "No. There's no payment today. We'll remind you before the trial ends, and your plan only starts on day 3 if you haven't cancelled.",
  },
  {
    question: "Do I have to count calories?",
    answer:
      "No. You just describe what you ate. PrepIt does the structuring, and shows you what it means with your Fuel score.",
  },
  {
    question: "How accurate is the AI logging?",
    answer:
      "PrepIt estimates and shows its assumptions. You confirm or fix anything before it's saved. Estimates are clearly marked, never presented as clinical precision.",
  },
  {
    question: "Do I need a wearable or CGM?",
    answer:
      "No. Your Fuel score (Drive, Control, Balance) is built entirely from your food logs. Apple Health can make it sharper, but it's never required.",
  },
  {
    question: "Is it a replacement for a doctor or dietitian?",
    answer:
      "No. PrepIt is a coach, not a medical service. It'll point you to a professional when something needs one.",
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
      className="flex w-full flex-col items-center bg-white px-4 py-16 lg:px-20 lg:py-24"
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
