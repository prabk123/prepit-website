import StartTrialLink from "@/components/StartTrialLink";
import { PILL_BUTTON_CLASS } from "@/components/ui/buttons";
import { START_LABEL, StartArrow } from "@/components/ui/startCta";
import { TRIAL_DAYS } from "@/lib/pricing";

/** The trial line under the button. The landing sections say the same. */
export const WEB_TRIAL_NOTE = `Cancel before day ${TRIAL_DAYS + 1} and you pay nothing.`;

/**
 * The site's call to action outside the landing sections (PRE-448): the
 * "Start my free 7 days" pill into web checkout, with the trial line under
 * it. It took the place of the App Store button and its QR code, which
 * now only the pages after a purchase use (/welcome, /open).
 */
export default function StartTrialCta({
  placement,
  note = WEB_TRIAL_NOTE,
  align = "start",
  className,
}: {
  /** Sent as `placement` with `web_landing_cta_click`, e.g. "final-cta". */
  placement: string;
  /** Line under the button; null for none. */
  note?: string | null;
  /** "center" in the closing band, which centres everything. */
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-start"} ${className ?? ""}`}>
      <StartTrialLink placement={placement} className={PILL_BUTTON_CLASS}>
        {START_LABEL}
        <StartArrow />
      </StartTrialLink>
      {note && <p className="text-small text-ink-muted">{note}</p>}
    </div>
  );
}
