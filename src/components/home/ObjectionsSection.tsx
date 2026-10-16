import DeviceFrame from "@/components/device/DeviceFrame";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { appVideo } from "@/lib/captures";

const QUESTIONS = [
  {
    question: "“I've quit trackers before.”",
    answer:
      "Most people quit because logging is a chore. Here you type “two eggs and buttered toast”, snap your plate, or press the Action button and say it. It's on your log straight away, and you can fix anything in one tap.",
  },
  {
    question: "“Do I need a watch or a ring?”",
    answer:
      "No. Everything starts from what you eat: no ring, no watch, no glucose monitor. Connect Apple Health if you like, and it brings in your activity and weight too.",
  },
  {
    question: "“Is the advice any good?”",
    answer:
      "It's built on nutrition science and public health guidance, and it knows its limits: for anything medical, it points you to your GP, a pharmacist or a registered dietitian.",
  },
  {
    question: "“Is my data safe?”",
    answer:
      "Your logs and goals are yours. We don't sell your personal or health data, and you can delete your account from the app at any time.",
  },
  {
    question: "“Is this a real nutritionist?”",
    answer:
      "It's an AI nutritionist that works the way a good one does: a first consultation, one thing to focus on, and a check-in every week. It isn't a person or a doctor, and it says so when something needs one.",
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
            title="Tracking always starts well. Then it gets annoying."
            lead="So here's what people ask before they try PrepIt."
            className="max-w-[760px]"
          />
          <dl className="flex flex-col border-b border-line">
            {QUESTIONS.map((item) => (
              <div key={item.question} className="grid gap-2 border-t border-line py-6 lg:py-7">
                <dt className="font-display text-card-title text-ink">{item.question}</dt>
                <dd className="max-w-[58ch] text-body text-ink-secondary text-pretty">{item.answer}</dd>
              </div>
            ))}
          </dl>
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
