import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import EmailPreferences from "./EmailPreferences";

export const metadata: Metadata = {
  title: "Email preferences",
  description: "Stop PrepIt's quiz emails or delete your details.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  referrer: "no-referrer",
  itunes: null,
};

/** Where the quiz emails' footer links (PRE-327): stop the emails, or delete the saved answers. */
export default function EmailPreferencesPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <EmailPreferences />
    </NarrowCard>
  );
}
