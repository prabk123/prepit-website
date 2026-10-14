import type { Metadata } from "next";
import Link from "next/link";
import NotFoundTracker from "@/components/analytics/NotFoundTracker";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const primary =
  "inline-flex h-14 items-center rounded-control bg-cream px-7 text-body font-medium text-on-cream transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream";
const secondary =
  "inline-flex h-14 items-center rounded-control border border-line-strong px-7 text-body font-medium text-ink transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream";

/**
 * Any URL with no page. The site's closing download band follows it (from the
 * root layout), so the App Store button is directly underneath.
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
            <Link href="/" className={primary}>
              Go to the homepage
            </Link>
            <Link href="/#features" className={secondary}>
              Features
            </Link>
            <Link href="/guides" className={secondary}>
              Guides
            </Link>
          </nav>
        </div>
      </Section>
    </div>
  );
}
