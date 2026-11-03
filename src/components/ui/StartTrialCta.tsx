import StartTrialLink from "@/components/StartTrialLink";
import { PILL_BUTTON_CLASS } from "@/components/ui/buttons";
import { TRIAL_DAYS } from "@/lib/pricing";

/** The same label as the landing page's buttons (LandingCta). */
const START_LABEL = `Start my free ${TRIAL_DAYS} days`;

/** The trial line under the button. The landing sections say the same. */
export const WEB_TRIAL_NOTE = `Cancel before day ${TRIAL_DAYS + 1} and you pay nothing.`;

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The site's call to action outside the landing sections (PRE-448): the
 * "Start my free 7 days" pill into web checkout, with the trial line under
 * it. It took the place of the App Store button and its QR code, which
 * now only the pages after a purchase use (/welcome, /open).
 */
export default function StartTrialCta({
  placement,
  note = WEB_TRIAL_NOTE,
  className,
}: {
  /** Sent as `placement` with `web_landing_cta_click`, e.g. "final-cta". */
  placement: string;
  /** Line under the button; null for none. */
  note?: string | null;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-start gap-3 ${className ?? ""}`}>
      <StartTrialLink placement={placement} className={PILL_BUTTON_CLASS}>
        {START_LABEL}
        <Arrow />
      </StartTrialLink>
      {note && <p className="text-small text-ink-muted">{note}</p>}
    </div>
  );
}
