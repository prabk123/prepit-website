import Link from "next/link";
import type { ReactNode } from "react";

export type LinkCardThumb = { avif?: string; webp: string };

type LinkCardProps = {
  href: string;
  title: string;
  /** The one line under the title. */
  summary: string;
  /** The link line at the bottom, e.g. "Read the guide". */
  action: ReactNode;
  /** The top of a phone screen, cropped by the card. */
  thumb?: LinkCardThumb | null;
  headingLevel?: "h2" | "h3";
};

/**
 * A card linking to another page: the top of an app screen, a title, one line
 * and a link line. Used for guides and the related-features row.
 */
export default function LinkCard({ href, title, summary, action, thumb, headingLevel = "h3" }: LinkCardProps) {
  const Heading = headingLevel;

  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col overflow-hidden rounded-tile border border-line bg-surface transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
    >
      {thumb && (
        <div aria-hidden className="relative h-44 overflow-hidden bg-surface-raised px-10 pt-8">
          <picture>
            {thumb.avif && <source srcSet={thumb.avif} type="image/avif" />}
            <img
              src={thumb.webp}
              alt=""
              width={402}
              height={874}
              loading="lazy"
              decoding="async"
              className="mx-auto w-full max-w-[220px] rounded-t-[22px] border border-b-0 border-line-strong transition-transform duration-300 ease-calm group-hover:-translate-y-1 motion-reduce:transition-none"
            />
          </picture>
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <Heading className="font-display text-card-title text-ink text-balance">{title}</Heading>
        <p className="text-body text-ink-muted text-pretty">{summary}</p>
        <span className="mt-auto pt-2 text-small font-medium text-energy">
          {action} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
