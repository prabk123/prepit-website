import Rating from "@/components/ui/Rating";

type QuoteCardProps = {
  quote: string;
  /** First name or initials, as the reviewer gave them. */
  name: string;
  /** The review's star rating, when it came from the App Store. */
  stars?: number;
  className?: string;
};

/** One real review, quoted exactly. */
export default function QuoteCard({ quote, name, stars, className }: QuoteCardProps) {
  return (
    <figure
      className={`flex min-w-0 flex-col gap-6 rounded-tile border border-line bg-surface p-6 lg:p-8 ${className ?? ""}`}
    >
      {stars !== undefined && <Rating value={stars} suffix="stars" className="text-small text-ink-faint" />}
      <blockquote className="text-lead text-ink">“{quote}”</blockquote>
      <figcaption className="mt-auto text-small text-ink-muted">{name}</figcaption>
    </figure>
  );
}
