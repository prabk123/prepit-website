export type FactorContributor = {
  title: string;
  values: string[];
};

export default function FactorContributorsTable({
  sectionLabel = "From your log",
  columnHeaders,
  contributors,
}: {
  sectionLabel?: string;
  columnHeaders: string[];
  contributors: FactorContributor[];
}) {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-[1fr_auto] items-end gap-x-3 gap-y-0">
        <p className="text-[13px] font-semibold leading-snug text-[var(--grey-80)]">
          {sectionLabel}
        </p>
        {columnHeaders.map((header) => (
          <p
            key={header}
            className="text-right text-[13px] font-medium text-[var(--grey-60)]"
          >
            {header}
          </p>
        ))}
      </div>

      <div className="my-2 h-px bg-[var(--grey-10)]" />

      <div className="flex flex-col gap-2">
        {contributors.map((row) => (
          <div
            key={row.title}
            className="grid grid-cols-[1fr_auto] items-start gap-x-3"
          >
            <p className="text-[13px] font-medium leading-snug text-[var(--black-100)]">
              {row.title}
            </p>
            {row.values.map((value, i) => (
              <p
                key={`${row.title}-${i}`}
                className="text-right text-[13px] font-medium tabular-nums text-[var(--black-100)]"
              >
                {value}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
