import type { Metadata } from "next";
import Link from "next/link";
import NotFoundTracker from "@/components/analytics/NotFoundTracker";
import AppStoreCta from "@/components/ui/AppStoreCta";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { TRIAL_NOTE } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const linkPill =
  "inline-flex h-14 items-center rounded-control border border-line-strong px-7 text-body font-medium text-ink transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream";

/**
 * Any URL with no page, including a mistyped feature or guide slug. Those
 * paths hide the site's closing download band (SiteFinalCta), so the 404
 * carries its own App Store button.
 */
export default function NotFound() {
  return (
    <div className="w-full bg-page pt-16 text-ink lg:pt-[72px]">
      <NotFoundTracker />
      <Section labelledBy="not-found-heading">
        <div className="flex flex-col gap-10">
          <SectionHeading
            as="h1"
            id="not-found-heading"
            size="section"
            eyebrow="Page not found"
            title="There's nothing on this page."
            lead="The link may be old, or the address may have a typo. These will get you back on track."
          />
          <nav aria-label="Pages to try" className="flex flex-wrap gap-3">
            <Link href="/" className={linkPill}>
              Go to the homepage
            </Link>
            <Link href="/#features" className={linkPill}>
              Features
            </Link>
            <Link href="/guides" className={linkPill}>
              Guides
            </Link>
          </nav>
          <AppStoreCta trackingSource="not-found" note={TRIAL_NOTE} />
        </div>
      </Section>
    </div>
  );
}
