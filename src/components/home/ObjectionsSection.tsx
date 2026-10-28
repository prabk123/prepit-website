import type { CSSProperties } from "react";
import DeviceFrame from "@/components/device/DeviceFrame";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import SwipeRow from "@/components/ui/SwipeRow";
import { appVideo } from "@/lib/captures";

// Three questions in a line or two each (PRE-284). Whether the advice is any
// good is the research band's job, and the watch question is on the Energy,
// Satiety and Mood page.
const QUESTIONS = [
  {
    question: "“I've quit trackers before.”",
    answer:
      "Most people quit because logging is a chore. Here you type “two eggs and buttered toast”, snap your plate, or press the Action button and say it. It's on your log straight away.",
  },
  {
    question: "“Is this a real nutritionist?”",
    answer:
      "It's an AI nutritionist that works the way a good one does: a first consultation, one thing to focus on, and a check-in every week. It isn't a person or a doctor, and says so when you need one.",
  },
  {
    question: "“Is my data safe?”",
    answer:
      "Your logs and goals are yours. We don't sell your personal or health data, and you can delete your account from the app at any time.",
  },
];

/**
 * The questions people ask before they try PrepIt, answered in a line or two
 * each, beside a typed log so the logging answer has its proof. Replaces the
 * four-fact strip, "Why trackers fail", the logging section and the bento.
 */
export default function ObjectionsSection() {
  return (
    <Section id="questions" labelledBy="objections-heading" analyticsName="objections">
      <div className="grid items-start gap-stack lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-16">
        <div className="flex min-w-0 flex-col gap-10">
          <SectionHeading
            id="objections-heading"
            size="section"
            title="Tried apps like this before?"
            lead="Here's what people ask before they try PrepIt."
            className="max-w-[760px]"
          />
          {/* Cards you swipe on phones, ruled rows beside the phone from 1024 px (PRE-284). */}
          <SwipeRow label="Questions people ask" desktop="stack" className="lg:gap-0 lg:border-b lg:border-line">
            {QUESTIONS.map((item, i) => (
              <div
                key={item.question}
                data-reveal="rise"
                data-spotlight
                style={{ "--i": i } as CSSProperties}
                className="spotlight flex w-full flex-col gap-2 rounded-card border border-line bg-surface-raised p-5 lg:rounded-none lg:border-x-0 lg:border-b-0 lg:bg-transparent lg:px-0 lg:py-7"
              >
                <h3 className="font-display text-card-title text-ink">{item.question}</h3>
                <p className="max-w-[58ch] text-body text-ink-secondary text-pretty">{item.answer}</p>
              </div>
            ))}
          </SwipeRow>
        </div>
        <div className="relative flex justify-center lg:sticky lg:top-28">
          <Glow />
          <DeviceFrame
            className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]"
            video={appVideo("03-log-typed", "Typing a meal in plain words and PrepIt logging it with its macros")}
          />
        </div>
      </div>
    </Section>
  );
}
