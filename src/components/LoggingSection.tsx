import PrepItIcon, { type PrepItIconName } from "@/components/shareable/PrepItIcon";
import NlLogFlowPhoneDemo from "@/components/NlLogFlowPhoneDemo";

const FEATURES: { title: string; body: string; icon: PrepItIconName }[] = [
  {
    title: "Describe it, snap it or both",
    body: "Include details such as brand, restaurant, size or ingredients",
    icon: "pencil",
  },
  {
    title: "PrepIt does the research",
    body: "PrepIt compiles all of the legitimate sources and cross-references them",
    icon: "search",
  },
  {
    title: "Review and confirm",
    body: "You review it. Nothing\u2019s logged before you confirm you\u2019re happy",
    icon: "checkmark",
  },
];

function FeatureBullet({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: PrepItIconName;
}) {
  return (
    <li className="flex gap-3 text-left">
      <div className="ai-icon-chrome mt-0.5 shrink-0" aria-hidden>
        <div className="ai-icon-chrome__inner">
          <PrepItIcon name={icon} size={20} color="var(--black-100)" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold leading-snug text-[var(--black-100)]">
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
          {body}
        </p>
      </div>
    </li>
  );
}

export default function LoggingSection() {
  return (
    <section
      id="logging"
      aria-labelledby="logging-heading"
      aria-describedby="logging-body"
      className="flex w-full flex-col items-center bg-[var(--grey-5)] px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col-reverse items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex min-w-0 flex-1 flex-col gap-8 text-left">
          <div className="flex flex-col gap-4">
            <h2
              id="logging-heading"
              className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              The most accurate logging.. naturally
            </h2>
            <p
              id="logging-body"
              className="text-base font-normal leading-relaxed text-[var(--grey-60)] lg:text-lg lg:leading-[27px]"
            >
              How it works
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6">
            {FEATURES.map((feature) => (
              <FeatureBullet key={feature.title} {...feature} />
            ))}
          </ul>

          <p className="text-sm font-medium leading-relaxed text-[var(--grey-80)] lg:text-base">
            PrepIt estimates. You confirm. Nothing is saved until it looks right.
          </p>
        </div>

        <div className="flex w-full shrink-0 justify-center lg:w-[340px]">
          <NlLogFlowPhoneDemo />
        </div>
      </div>
    </section>
  );
}
