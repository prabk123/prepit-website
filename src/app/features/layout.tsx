import type { ReactNode } from "react";

/** Feature pages are D3 dark pages under the fixed header. */
export default function FeaturesLayout({ children }: { children: ReactNode }) {
  return <div className="w-full bg-page pt-16 text-ink [color-scheme:dark] lg:pt-[72px]">{children}</div>;
}
