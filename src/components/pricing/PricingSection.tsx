import AppStoreCta from "@/components/ui/AppStoreCta";
import PricingCard from "@/components/ui/PricingCard";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRICES, TRIAL_DAYS } from "@/lib/pricing";

const INCLUDED = [
  "A nutritionist that checks in every day",
  "Unlimited logging by text, photo and Siri",
  "Energy, Satiety and Mood",
  "Consultation and weekly check-ins",
  "Meal plans and grocery lists",
  "Widgets and offline logging",
];

/** The price and free trial, outside the FAQ: heading on the left, cream card on the right. */
export default function PricingSection() {
  return (
    <Section id="pricing" labelledBy="pricing-heading" analyticsName="pricing">
      <div className="grid items-center gap-stack lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
        <SectionHeading
          title="One app. Everything included."
          id="pricing-heading"
        />
        <PricingCard
          className="justify-self-center lg:justify-self-end"
          title={`${TRIAL_DAYS} days free`}
          price={`Then ${PRICES.annual} a year or ${PRICES.monthly} a month`}
          priceNote={`That's ${PRICES.annualPerWeek} a week, less than a coffee. Cancel anytime in the App Store. Cancel at least 24 hours before your trial ends and you won't be charged.`}
          features={INCLUDED}
          cta={
            <AppStoreCta
              trackingSource="home-pricing"
              label="Start your free trial"
              variant="dark"
            />
          }
          finePrint="Prices in US dollars. The App Store shows the price for your country."
        />
      </div>
    </Section>
  );
}
