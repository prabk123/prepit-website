import type { ReactNode } from "react";
import "@/app/v9-cream.css";
import "@/components/landing/v9/landing-v9.css";

/**
 * Guides sit on the cream page under the fixed header. Since PRE-457 they use
 * Landing v9's darker cream band, lifted-card shadow and reveal motion, so
 * the wrapper is a `landing-v9` page (v9-cream.css scopes those to it).
 */
export default function GuidesLayout({ children }: { children: ReactNode }) {
  return <div className="landing-v9 w-full bg-page pt-16 text-ink lg:pt-[72px]">{children}</div>;
}
