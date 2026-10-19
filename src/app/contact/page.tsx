import type { Metadata } from "next";
import ContactForm, { type ContactKind } from "@/components/ContactForm";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";

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

const SUPPORT_EMAIL = "support@tryprepit.app";

const copy: Record<ContactKind, { title: string; lead: string }> = {
  contact: {
    title: "Contact us",
    lead: "Questions about PrepIt, your account or your subscription? Send us a message and we'll reply by email.",
  },
  feedback: {
    title: "Share your feedback",
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
      <Section labelledBy="contact-heading">
        <div className="grid gap-stack lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div className="flex flex-col gap-8">
            <SectionHeading
              as="h1"
              id="contact-heading"
              size="section"
              title={copy[kind].title}
              lead={copy[kind].lead}
            />
            <div className="flex flex-col gap-4 text-body text-ink-secondary">
              <p>
                Prefer email? Write to{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
              <TextLink href="/#faq">Read the FAQ</TextLink>
            </div>
          </div>
          <ContactForm kind={kind} />
        </div>
      </Section>
    </div>
  );
}
