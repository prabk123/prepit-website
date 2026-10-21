import type { Metadata } from "next";
import { headers } from "next/headers";
import { HideSiteChrome } from "@/components/SiteChrome";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import Quiz from "./Quiz";

export const metadata: Metadata = {
  title: "Your first week with an AI nutritionist",
  description: "Answer a few quick questions and see what your first week with PrepIt's AI nutritionist would focus on.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * The web quiz (PRE-322): an app-like page of its own, without the site's
 * header and footer. The country comes from Vercel's geo header, for the
 * email gate's lead (PRE-327); the quiz is US-first, so it defaults to US.
 */
export default async function QuizPage() {
  const country = (await headers()).get("x-vercel-ip-country")?.toUpperCase();
  return (
    <>
      <HideSiteChrome />
      <HideSiteFinalCta />
      <Quiz country={country && /^[A-Z]{2}$/.test(country) ? country : "US"} />
    </>
  );
}
