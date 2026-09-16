export default function StepCopy({
  title,
  subtitle,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mb-3 shrink-0" : "mb-6 shrink-0"}>
      <h1
            className={`font-clash text-[28px] font-semibold leading-8 tracking-tight text-[var(--text-primary)] ${
                  compact ? "[@media(max-height:699px)]:text-2xl" : ""
                }`}
              >
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-base leading-[1.5] text-[var(--text-secondary)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
