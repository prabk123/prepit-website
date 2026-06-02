import PrepItIcon, { type PrepItIconName } from "@/components/shareable/PrepItIcon";

const PILLARS: {
  title: string;
  body: string;
  icon: PrepItIconName;
}[] = [
  {
    title: "Editable by design",
    body: "Every AI estimate shows its assumptions and is one tap to fix. Nothing is saved until it looks right.",
    icon: "edit",
  },
  {
    title: "Honest about confidence",
    body: "When there isn't enough data, PrepIt says so — instead of giving you confident, wrong advice.",
    icon: "warning",
  },
  {
    title: "Private by default",
    body: "Your logs and goals are yours. Clear, granular control over your data and history.",
    icon: "lock",
  },
];

function TrustPillar({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: PrepItIconName;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--grey-10)] bg-white p-5 text-left shadow-sm transition-colors hover:border-[var(--grey-40)] hover:shadow-md lg:p-6">
      <div className="ai-icon-chrome shrink-0" aria-hidden>
        <div className="ai-icon-chrome__inner">
          <PrepItIcon name={icon} size={20} color="var(--black-100)" />
        </div>
      </div>
      <h3 className="mt-4 text-base font-semibold leading-snug text-[var(--black-100)] lg:text-lg">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
        {body}
      </p>
    </article>
  );
}

export default function TrustAccuracySection() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      aria-describedby="trust-subtitle"
      className="flex w-full flex-col items-center bg-white px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-10 text-center lg:gap-12">
        <div className="flex max-w-[720px] flex-col gap-4">
          <h2
            id="trust-heading"
            className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            AI does the hard part. You stay in control.
          </h2>
          <p
            id="trust-subtitle"
            className="text-base font-normal leading-relaxed text-[var(--grey-60)] lg:text-lg lg:leading-[27px]"
          >
            No shame. No &ldquo;cheat days.&rdquo; No punishment language. Just a clearer next step.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {PILLARS.map((pillar) => (
            <TrustPillar key={pillar.title} {...pillar} />
          ))}
        </div>
      </div>
    </section>
  );
}
