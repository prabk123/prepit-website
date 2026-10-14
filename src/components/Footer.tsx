import Image from "next/image";
import Link from "next/link";
import AppStoreLink from "@/components/AppStoreLink";
import { FEATURE_SLUGS, FEATURES, featureHref } from "@/lib/features";
import { HEADER_SECTION_LINKS, SITE_PAGE_LINKS } from "@/lib/homeSections";

// 44px tall on phones so each link is a full tap target; tighter on desktop.
const linkClass = "flex min-h-11 items-center text-body text-ink-muted transition-colors hover:text-ink lg:min-h-0";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-eyebrow font-medium uppercase text-ink-faint">{title}</h2>
      <div className="flex flex-col lg:gap-3">{children}</div>
    </div>
  );
}

/**
 * The site footer (D3): dark, tagline, explore, feature pages, company and
 * legal links. Explore lists the same homepage sections as the header, so no
 * feature is listed twice.
 */
export default function Footer() {
  return (
    <footer className="w-full border-t border-line bg-page text-ink">
      <div className="mx-auto flex w-full max-w-content flex-col gap-12 px-gutter py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex h-11 w-fit items-center gap-2.5">
              <span className="relative h-8 w-8">
                <Image src="/logo.png" alt="" fill sizes="32px" className="object-contain" />
              </span>
              <span className="font-display text-[24px] leading-none">PrepIt</span>
            </Link>
            <p className="text-small text-ink-muted">PrepIt, your personal AI nutritionist.</p>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-14">
            <Column title="Explore">
              <Link href="/" className={linkClass}>
                Home
              </Link>
              {HEADER_SECTION_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
              <AppStoreLink trackingSource="footer-explore" className={linkClass}>
                Download the app
              </AppStoreLink>
            </Column>
            <Column title="Features">
              {FEATURE_SLUGS.map((slug) => (
                <Link key={slug} href={featureHref(slug)} className={linkClass}>
                  {FEATURES[slug].name}
                </Link>
              ))}
            </Column>
            <Column title="Company">
              {SITE_PAGE_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
              <a href="https://prepit.userjot.com/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Feedback
              </a>
            </Column>
            <Column title="Legal">
              <Link href="/terms-and-conditions" className={linkClass}>
                Terms & Conditions
              </Link>
              <Link href="/privacy-policy" className={linkClass}>
                Privacy Policy
              </Link>
              <Link href="/cookie-policy" className={linkClass}>
                Cookie Policy
              </Link>
              <Link href="/refund-policy" className={linkClass}>
                Refund Policy
              </Link>
              <Link href="/subscription-policy" className={linkClass}>
                Subscription Policy
              </Link>
            </Column>
          </div>
        </div>

        <p className="border-t border-line pt-8 text-small text-ink-faint">
          © {new Date().getFullYear()} PrepIt. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
