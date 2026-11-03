import StartTrialLink from "@/components/StartTrialLink";
import { ClosingSection, V9FinePrint } from "@/components/landing/v9/V9LowerSections";
import { PILL_BUTTON_CLASS } from "@/components/ui/buttons";
import { START_LABEL, StartArrow } from "@/components/ui/startCta";
import type { WebMarket } from "@/lib/markets";
import type { Prices } from "@/lib/pricing";

/**
 * The homepage's close ("Start with 5 minutes.") and its small print, at the
 * foot of the Features overview, each feature page and Research (PRE-450).
 * The button is the site's own: it starts in the `site` funnel and reports
 * `placement` with `web_landing_cta_click`, e.g. "feature-logging-closing".
 * Render <HideSiteFinalCta /> on the page so the layout's band stays hidden.
 */
export default function SiteClosing({ market, prices, placement }: { market: WebMarket; prices: Prices; placement: string }) {
  return (
    <>
      <ClosingSection
        market={market}
        prices={prices}
        // A waitlist visitor gets ClosingSection's own "Join the waitlist" button.
        cta={
          market === "web" ? (
            <StartTrialLink placement={placement} className={`${PILL_BUTTON_CLASS} max-[599px]:w-full max-[599px]:justify-center`}>
              {START_LABEL}
              <StartArrow />
            </StartTrialLink>
          ) : undefined
        }
      />
      {/* The site footer below carries the copyright. */}
      <div className="v9-band w-full border-t border-line">
        <div className="mx-auto w-full max-w-content px-gutter py-8">
          <V9FinePrint copyright={false} />
        </div>
      </div>
    </>
  );
}
