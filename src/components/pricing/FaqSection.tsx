import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import FaqAccordion from "@/components/pricing/FaqAccordion";
import { FAQ_ITEMS, faqPageJsonLd } from "@/lib/faq";

/** "Questions, answered.": the FAQ with FAQPage structured data that matches it. */
export default function FaqSection() {
  return (
    <Section id="faq" labelledBy="faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd()).replace(/</g, "\\u003c") }}
      />
      <div className="flex flex-col gap-stack">
        <SectionHeading title="Questions, answered." id="faq-heading" />
        <FaqAccordion items={FAQ_ITEMS} trackingSource="home-faq" defaultOpenId={FAQ_ITEMS[0].id} />
      </div>
    </Section>
  );
}
