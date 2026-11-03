import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * The one label and arrow every "start" button on the site uses (the landing
 * sections, the header, StartTrialCta). Not a client module, so server pages
 * can read START_LABEL as a string.
 */
export const START_LABEL = `Start my free ${TRIAL_DAYS} days`;

export function StartArrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The header button's label: the full one overlaps the logo on narrow phones. */
export function HeaderStartLabel() {
  return (
    <>
      <span className="max-[419px]:hidden">{START_LABEL}</span>
      <span className="min-[420px]:hidden">Start free</span>
    </>
  );
}
