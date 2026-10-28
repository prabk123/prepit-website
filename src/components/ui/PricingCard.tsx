import type { ReactNode } from "react";

type PricingCardProps = {
  title: string;
  /** e.g. "Then $99.99 a year or $14.99 a month". */
  price: string;
  /** e.g. "That's $1.92 a week. Cancel anytime in the App Store." */
  priceNote?: string;
  features: string[];
  /** Usually <AppStoreCta />. */
  cta: ReactNode;
  /** Small print under the button, e.g. how prices vary by country. */
  finePrint?: string;
  className?: string;
};

/** The pricing card: a white card with an orange top edge. */
export default function PricingCard({ title, price, priceNote, features, cta, finePrint, className }: PricingCardProps) {
  return (
    <article
      data-reveal="rise"
      data-spotlight
      className={`spotlight flex w-full max-w-[520px] flex-col gap-8 rounded-card border border-line border-t-4 border-t-accent bg-surface p-8 text-ink lg:p-12 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-title">{title}</h3>
        <p className="text-lead font-medium">{price}</p>
        {priceNote && <p className="text-small text-ink-muted">{priceNote}</p>}
      </div>
      <ul className="flex flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3 text-body">
            <svg viewBox="0 0 16 16" className="mt-1 h-4 w-4 shrink-0 text-accent-text" aria-hidden>
              <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-4">
        {cta}
        {finePrint && <p className="text-small text-ink-muted">{finePrint}</p>}
      </div>
    </article>
  );
}
