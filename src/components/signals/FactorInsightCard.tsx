import FactorContributorsTable, {
  type FactorContributor,
} from "@/components/signals/FactorContributorsTable";
import FactorStripChart, {
  signedLabel,
  valueColorForComponent,
} from "@/components/signals/FactorStripChart";
import PrepItIcon from "@/components/shareable/PrepItIcon";

export type FactorInsight = {
  label: string;
  summary: string;
  component: number;
  baselineComponent?: number;
  weight: number;
  impact?: string;
  expanded?: boolean;
  contributors?: FactorContributor[];
  contributorColumnHeaders?: string[];
  contributorsSectionLabel?: string;
};

function tiltForFactor(f: FactorInsight) {
  return f.weight * (f.component - 0.5) * 200;
}

export default function FactorInsightCard({
  factor,
  className = "",
}: {
  factor: FactorInsight;
  className?: string;
}) {
  const tilt = tiltForFactor(factor);
  const valueColor = valueColorForComponent(factor.component);
  const showContributors =
    factor.expanded &&
    factor.contributors != null &&
    factor.contributors.length > 0 &&
    factor.contributorColumnHeaders != null;

  return (
    <div
      className={`rounded-xl bg-white px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ${className}`}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-snug text-[var(--black-100)]">
            {factor.label}
          </p>
          {factor.impact && (
            <p className="mt-1 text-[13px] leading-[1.45] text-[var(--grey-60)]">
              {factor.impact}
            </p>
          )}

          <div className="relative mt-2.5">
            <div className="relative mb-1 h-[18px] w-full">
              <p
                className="absolute top-0 max-w-[92%] -translate-x-1/2 truncate text-[13px] font-semibold text-[var(--grey-80)]"
                style={{ left: `${factor.component * 100}%` }}
              >
                {factor.summary}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <FactorStripChart
                component={factor.component}
                baselineComponent={factor.baselineComponent}
              />
              <span
                className="w-8 shrink-0 text-right text-[14px] font-bold tabular-nums"
                style={{ color: valueColor }}
              >
                {signedLabel(tilt)}
              </span>
            </div>
          </div>
        </div>

        {factor.expanded && (
          <div
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--grey-5)]"
            aria-hidden
          >
            <PrepItIcon name="chevronUp" size={14} color="var(--black-100)" />
          </div>
        )}
      </div>

      {showContributors && (
        <FactorContributorsTable
          sectionLabel={factor.contributorsSectionLabel ?? "From your log"}
          columnHeaders={factor.contributorColumnHeaders!}
          contributors={factor.contributors!}
        />
      )}
    </div>
  );
}
