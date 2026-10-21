import type { ReactNode } from "react";

/**
 * Wraps the site header and footer. The sign-up bridge and the "You're in"
 * page render <HideSiteChrome /> and their own short header, so nothing there
 * leads away from signing up (globals.css hides this wrapper). Like
 * SiteFinalCta, it must not branch on the pathname.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  return <div className="site-chrome">{children}</div>;
}

/** Marks the page so the site header and footer are hidden. */
export function HideSiteChrome() {
  return <span hidden data-hide-site-chrome="" />;
}
