import type { ReactNode } from "react";

/**
 * The site's closing download section, rendered on every page. Pages that
 * end with their own download band (feature pages, guides, shared plans, the
 * 404s) or that should have none (contact, legal pages, the sign-in email
 * link) render <HideSiteFinalCta />, and globals.css hides this wrapper.
 *
 * It must not branch on the pathname: unknown /features and /guides slugs
 * serve the 404 pre-rendered at build time, so a pathname check renders
 * different HTML in the browser than on the server (React error #418).
 */
export default function SiteFinalCta({ children }: { children: ReactNode }) {
  return <div className="site-final-cta">{children}</div>;
}

/** Marks the page so the site's closing download section is hidden. */
export function HideSiteFinalCta() {
  return <span hidden data-hide-site-final-cta="" />;
}
