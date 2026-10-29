import type { Metadata } from "next";
import Link from "next/link";
import NotFoundTracker from "@/components/analytics/NotFoundTracker";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import AppStoreCta from "@/components/ui/AppStoreCta";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { PILL_CLASS } from "@/components/ui/pill";
import { TRIAL_NOTE } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn't exist on the PrepIt website. Try the homepage, features or guides.",
  robots: { index: false, follow: true },
};

/**
 * Any URL with no page, including a mistyped feature or guide slug. The 404
 * carries its own App Store button and hides the site's closing download band
 * (SiteFinalCta), so there is one download button on every 404.
 */
export default function NotFound() {
  return (
    <div className="w-full bg-page pt-16 text-ink lg:pt-[72px]">
      <HideSiteFinalCta />
      <NotFoundTracker />
      <Section labelledBy="not-found-heading">
        <div className="flex flex-col gap-10">
          <SectionHeading
            as="h1"
            intro
            id="not-found-heading"
            size="section"
            eyebrow="Page not found"
            title="There's nothing on this page."
            lead="The link may be old, or the address may have a typo. These will get you back on track."
          />
          <nav aria-label="Pages to try" className="hero-rise flex flex-wrap gap-3 [--rise-delay:600ms]">
            <Link href="/" className={PILL_CLASS}>
              Go to the homepage
            </Link>
            <Link href="/features" className={PILL_CLASS}>
              Features
            </Link>
            <Link href="/guides" className={PILL_CLASS}>
              Guides
            </Link>
          </nav>
          <AppStoreCta className="hero-rise [--rise-delay:700ms]" trackingSource="not-found" note={TRIAL_NOTE} />
        </div>
      </Section>
    </div>
  );
}
