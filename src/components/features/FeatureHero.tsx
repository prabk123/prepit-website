import Link from "next/link";
import FeatureHeroStage from "@/components/features/FeatureHeroStage";
import { Split } from "@/components/landing/v9/V9Sections";
import StartTrialCta from "@/components/ui/StartTrialCta";
import type { FeatureMeta } from "@/lib/features";
import type { WebMarket } from "@/lib/markets";
import { type Prices, TRIAL_DAYS } from "@/lib/pricing";

/**
 * A feature page's header (PRE-450): the path back to Features, the h1 and
 * one line, the button into web checkout and the trial line, beside the
 * feature's still with a real app card lifted over it.
 */
export default function FeatureHero({ feature, market, prices }: { feature: FeatureMeta; market: WebMarket; prices: Prices }) {
  const trial = market === "web" ? `${TRIAL_DAYS} days free · ${prices.free} today · ` : "";
  return (
    <section aria-labelledby="feature-heading" className="w-full bg-page text-ink">
      <div className="mx-auto w-full max-w-content px-gutter pb-section pt-[clamp(28px,4vw,56px)]">
        <Split
          text={
            <>
              <nav aria-label="Breadcrumb" className="text-[14px] text-ink-muted">
                <Link href="/features" className="text-ink-secondary underline-offset-4 hover:underline">
                  Features
                </Link>{" "}
                / {feature.name}
              </nav>
              <h1 id="feature-heading" className="font-display text-hero text-ink text-balance">
                {feature.heading}
              </h1>
              <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">{feature.lead}</p>
              <StartTrialCta
                placement={`feature-${feature.slug}-hero`}
                note={`${trial}Cancel before day ${TRIAL_DAYS + 1}, pay nothing.`}
              />
            </>
          }
          media={<FeatureHeroStage slug={feature.slug} />}
        />
      </div>
    </section>
  );
}
