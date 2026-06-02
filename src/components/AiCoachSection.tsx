"use client";

import { useState } from "react";
import AiChatPhoneDemo from "@/components/AiChatPhoneDemo";
import {
  AI_COACH_DEMO_SCENARIOS,
  PROMPT_CHIPS,
  type AiCoachDemoIndex,
} from "@/components/aiCoachDemoData";

function PromptChip({
  prompt,
  outcome,
  active,
}: {
  prompt: string;
  outcome: string | null;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
        active
          ? "border-[var(--black-100)] bg-[var(--grey-5)]"
          : "border-[var(--grey-10)] bg-white"
      }`}
    >
      <p className="text-sm leading-relaxed text-[var(--black-100)] lg:text-base">
        &ldquo;{prompt}&rdquo;
      </p>
      {outcome && (
        <p className="mt-1 text-xs italic text-[var(--grey-60)] lg:text-sm">
          → {outcome}
        </p>
      )}
    </div>
  );
}

export default function AiCoachSection() {
  const [activeDemo, setActiveDemo] = useState<AiCoachDemoIndex>(0);

  return (
    <section
      id="ai-coach"
      aria-labelledby="ai-coach-heading"
      aria-describedby="ai-coach-body"
      className="flex w-full flex-col items-center bg-[var(--grey-5)] px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col-reverse items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="flex min-w-0 flex-1 flex-col gap-8 text-left">
          <div className="flex flex-col gap-4">
            <h2
              id="ai-coach-heading"
              className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              Ask anything. It knows your goals, your day, and your last meal.
            </h2>
            <p
              id="ai-coach-body"
              className="text-base font-normal leading-relaxed text-[var(--grey-60)] lg:text-lg lg:leading-[27px]"
            >
              PrepIt&apos;s AI coach answers in plain language using your own data — and it
              doesn&apos;t just talk, it does the work. Log a meal, swap a dinner, find a recipe
              with your remaining macros — straight from the chat. You confirm every change.
            </p>
          </div>

          <div className="flex flex-col gap-2.5" aria-label="Example prompts">
            {PROMPT_CHIPS.map((chip, index) => (
              <PromptChip
                key={chip.prompt}
                prompt={chip.prompt}
                outcome={chip.outcome}
                active={activeDemo === index}
              />
            ))}
          </div>

          <p className="text-sm font-medium leading-relaxed text-[var(--grey-80)] lg:text-base">
            It&apos;s a coach, not a doctor — and it&apos;ll always tell you when something needs
            a professional.
          </p>
        </div>

        <div className="flex w-full shrink-0 justify-center lg:sticky lg:top-24 lg:w-[340px]">
          <AiChatPhoneDemo
            scenarios={AI_COACH_DEMO_SCENARIOS}
            onScenarioChange={setActiveDemo}
          />
        </div>
      </div>
    </section>
  );
}
