import FaqAccordion from "@/components/pricing/FaqAccordion";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { faqPageJsonLd, LANDING_APP_STORE_FAQ_ITEMS, LANDING_WEB_FAQ_ITEMS } from "@/lib/faq";
import type { WebMarket } from "@/lib/markets";

/** The landing FAQ (FaqAccordion lays it out in two columns), with the trial and cancel answers for where the visitor starts. */
export default function LandingFaq({ market }: { market: WebMarket }) {
  const items = market === "web" ? LANDING_WEB_FAQ_ITEMS : LANDING_APP_STORE_FAQ_ITEMS;
  return (
    <Section id="faq" labelledBy="faq-heading" analyticsName="faq" className="[&>div]:pt-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(items)).replace(/</g, "\\u003c") }}
      />
      <SectionHeading title="Questions, answered." id="faq-heading" />
      <div className="mt-stack">
        <FaqAccordion items={items} trackingSource="landing-faq" defaultOpenId={items[0].id} />
      </div>
    </Section>
  );
}
