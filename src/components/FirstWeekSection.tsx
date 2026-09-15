import FirstWeekPhoneDemo from "@/components/FirstWeekPhoneDemo";
import PrepItIcon, { type PrepItIconName } from "@/components/shareable/PrepItIcon";

const STEPS: { title: string; when: string; body: string; icon: PrepItIconName }[] = [
  {
    title: "Getting to know you",
    when: "Day 1 · about 5 minutes",
    body: "Why you're here, a normal weekday and weekend. Then eat normally — just log what you actually eat.",
    icon: "sparkles",
  },
  {
    title: "What I've noticed",
    when: "Once a few days are logged",
    body: "Patterns from your real meals, a focus for the weeks ahead, and two small swaps to try.",
    icon: "charts",
  },
  {
    title: "Week-in-review",
    when: "About a week in",
    body: "How Energy, Satiety, and Mood moved — plus your first weekly check-in and a clear next focus.",
    icon: "report",
  },
];

export default function FirstWeekSection() {
  return (
    <section
      id="first-week"
      aria-labelledby="first-week-heading"
      aria-describedby="first-week-body"
      className="flex w-full flex-col items-center bg-[var(--grey-5)] px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col-reverse items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex min-w-0 flex-1 flex-col gap-8 text-left">
          <div className="flex flex-col gap-4">
            <h2
              id="first-week-heading"
              className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              Your first week isn&apos;t a tutorial. It&apos;s a consultation.
            </h2>
            <p
              id="first-week-body"
              className="text-base font-normal leading-relaxed text-[var(--grey-60)] lg:text-lg lg:leading-[27px]"
            >
              Three short chats, spread across your trial, so your nutritionist
              learns your routine — then weekly check-ins keep the loop going.
            </p>
          </div>

          <ul className="flex flex-col gap-5">
            {STEPS.map((step) => (
              <li key={step.title} className="flex gap-3 text-left">
                <div className="ai-icon-chrome mt-0.5 shrink-0" aria-hidden>
                  <div className="ai-icon-chrome__inner">
                    <PrepItIcon name={step.icon} size={20} color="var(--black-100)" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold leading-snug text-[var(--black-100)]">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-full shrink-0 justify-center lg:w-[340px]">
          <FirstWeekPhoneDemo />
        </div>
      </div>
    </section>
  );
}
