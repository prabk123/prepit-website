"use client";

import AiChatPhoneDemo from "@/components/AiChatPhoneDemo";
import { AI_COACH_DEMO_SCENARIOS } from "@/components/aiCoachDemoData";
import PrepItIcon, { type PrepItIconName } from "@/components/shareable/PrepItIcon";

const COACH_BULLETS: { text: string; icon: PrepItIconName }[] = [
  {
    text: "Answers in plain language using your own data",
    icon: "sparkles",
  },
  {
    text: "Logs meals and helps you set your calorie and macro goals — right from chat",
    icon: "edit",
  },
  {
    text: "You confirm every change before anything is saved",
    icon: "checkmark",
  },
];

export default function AiCoachSection() {
  return (
    <section
      id="ai-coach"
      aria-labelledby="ai-coach-heading"
      aria-describedby="ai-coach-bullets"
      className="flex w-full flex-col items-center bg-[var(--grey-5)] px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col-reverse items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex min-w-0 flex-1 flex-col gap-8 text-left">
          <div className="flex flex-col gap-4">
            <h2
              id="ai-coach-heading"
              className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              Ask anything. It knows your goals, your day, and your last meal.
            </h2>
          </div>

          <ul id="ai-coach-bullets" className="flex flex-col gap-4">
            {COACH_BULLETS.map(({ text, icon }) => (
              <li key={text} className="flex items-center gap-3 text-left">
                <div className="ai-icon-chrome shrink-0" aria-hidden>
                  <div className="ai-icon-chrome__inner">
                    <PrepItIcon name={icon} size={20} color="var(--black-100)" />
                  </div>
                </div>
                <p className="min-w-0 flex-1 text-base font-normal leading-relaxed text-[var(--black-100)] lg:text-lg lg:leading-[27px]">
                  {text}
                </p>
              </li>
            ))}
          </ul>

          <p className="text-sm font-medium leading-relaxed text-[var(--grey-80)] lg:text-base">
            It&apos;s a coach, not a doctor, and it&apos;ll always tell you when something needs
            a professional.
          </p>
        </div>

        <div className="flex w-full shrink-0 justify-center lg:sticky lg:top-24 lg:w-[340px]">
          <AiChatPhoneDemo scenarios={AI_COACH_DEMO_SCENARIOS} />
        </div>
      </div>
    </section>
  );
}
