import type { ReactNode } from "react";

type PricingCardProps = {
  title: string;
  /** e.g. "3 days free, then $99.99 a year". */
  price: string;
  /** e.g. "That's $1.92 a week. Cancel anytime in the App Store." */
  priceNote?: string;
  features: string[];
  /** Usually <AppStoreCta variant="dark" />. */
  cta: ReactNode;
  className?: string;
};

/** The cream pricing card with near-black text. */
export default function PricingCard({ title, price, priceNote, features, cta, className }: PricingCardProps) {
  return (
    <article
      className={`flex w-full max-w-[520px] flex-col gap-8 rounded-card bg-cream p-8 text-on-cream lg:p-12 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-title">{title}</h3>
        <p className="text-lead font-medium">{price}</p>
        {priceNote && <p className="text-small text-on-cream-muted">{priceNote}</p>}
      </div>
      <ul className="flex flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3 text-body">
            <svg viewBox="0 0 16 16" className="mt-1 h-4 w-4 shrink-0" aria-hidden>
              <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      {cta}
    </article>
  );
}
