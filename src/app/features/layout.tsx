import type { ReactNode } from "react";
import "@/app/v9-cream.css";
import "@/components/landing/v9/landing-v9.css";

/**
 * The Features overview and each feature page, under the fixed header, on
 * the homepage's cream (PRE-450): `landing-v9` turns on the v9 band colour
 * and card shadow the shared sections use.
 */
export default function FeaturesLayout({ children }: { children: ReactNode }) {
  return <div className="landing-v9 w-full bg-page pt-16 text-ink lg:pt-[72px]">{children}</div>;
}
