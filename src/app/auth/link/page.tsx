import type { Metadata } from "next";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import OpenAppButton from "./OpenAppButton";

export const metadata: Metadata = {
  title: "Finish signing in",
  description: "Open PrepIt on your iPhone to finish signing in.",
  robots: { index: false, follow: false },
};

/**
 * Where a sign-in email link lands: one button that opens the app. The
 * layout's <main> wraps this, and SiteFinalCta leaves the download band off.
 */
export default function EmailLinkPage() {
  return (
    <div className="flex w-full justify-center bg-page px-4 pb-section pt-28 text-ink lg:pt-36">
      <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-card border border-line bg-surface px-6 py-10 text-center sm:px-10">
        <Image src="/logo.png" alt="PrepIt" width={56} height={56} priority />
        <SectionHeading
          as="h1"
          size="title"
          align="center"
          title="Finish signing in on your iPhone"
          lead="Tap below to open PrepIt and finish signing in."
        />
        <OpenAppButton />
      </div>
    </div>
  );
}
