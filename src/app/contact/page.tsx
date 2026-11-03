import type { Metadata } from "next";
import ContactForm, { type ContactKind } from "@/components/ContactForm";
import ContactLinks from "@/components/ContactLinks";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

const description =
  "Questions about PrepIt, your account or your subscription? Send us a message or email support@tryprepit.app and we'll get back to you.";
const url = "https://www.tryprepit.app/contact";

export const metadata: Metadata = {
  title: "Contact us",
  description,
  alternates: { canonical: url },
  openGraph: { title: "Contact us | PrepIt", description, url },
  twitter: { card: "summary_large_image", title: "Contact us | PrepIt", description },
};

const copy: Record<ContactKind, { eyebrow: string; title: string; lead: string }> = {
  contact: {
    eyebrow: "Contact",
    title: "Get in touch.",
    lead: "Questions about PrepIt, your account or your subscription? Send us a message and we'll reply by email.",
  },
  feedback: {
    eyebrow: "Feedback",
    title: "Share your feedback.",
    lead: "Tell us what's working, what isn't and what you'd like PrepIt to do next. We read every message.",
  },
};

/**
 * Rendered on the server, so the heading and form are in the HTML. The
 * `?type=feedback` link (from the app) switches the copy and the Slack label.
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { type } = await searchParams;
  const kind: ContactKind = type === "feedback" ? "feedback" : "contact";

  return (
    <div className="w-full bg-page pt-16 text-ink lg:pt-[72px]">
      {/* Mostly people who already have the app, with account or billing questions. */}
      <HideSiteFinalCta />
      <Section labelledBy="contact-heading" className="[&>div]:pt-7 sm:[&>div]:pt-10 lg:[&>div]:pt-14">
        <div className="grid items-start gap-stack min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] min-[900px]:gap-[clamp(32px,6vw,88px)]">
          <div className="flex flex-col gap-[26px]">
            <SectionHeading
              as="h1"
              id="contact-heading"
              size="chapter"
              eyebrow={copy[kind].eyebrow}
              title={copy[kind].title}
              lead={copy[kind].lead}
            />
            <ContactLinks kind={kind} />
          </div>
          <ContactForm kind={kind} />
        </div>
      </Section>
    </div>
  );
}
