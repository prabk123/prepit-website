import Link from "next/link";
import type { ReactNode } from "react";

/** `1x, 2x` source sets of an 804 x 500 crop, and its 2x file (lib/captures cardThumb). */
export type LinkCardThumb = { avif?: string; webp: string; src: string };

type LinkCardProps = {
  href: string;
  title: string;
  /** The one line under the title. */
  summary: string;
  /** The link line at the bottom, e.g. "Read the guide". */
  action: ReactNode;
  /** The telling part of an app screen, at about its size on the phone. */
  thumb?: LinkCardThumb | null;
  headingLevel?: "h2" | "h3";
};

/**
 * A card linking to another page: a crop of an app screen, a title, one line
 * and a link line. Used for guides and the related-features row.
 */
export default function LinkCard({ href, title, summary, action, thumb, headingLevel = "h3" }: LinkCardProps) {
  const Heading = headingLevel;

  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col overflow-hidden rounded-tile border border-line bg-surface transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      {thumb && (
        <div aria-hidden className="overflow-hidden border-b border-line bg-surface-raised">
          <picture>
            {thumb.avif && <source srcSet={thumb.avif} type="image/avif" />}
            <source srcSet={thumb.webp} type="image/webp" />
            <img
              src={thumb.src}
              alt=""
              width={804}
              height={500}
              loading="lazy"
              decoding="async"
              className="aspect-[804/500] h-auto w-full object-cover transition-transform duration-300 ease-calm group-hover:scale-[1.02] motion-reduce:transition-none"
            />
          </picture>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <Heading className="font-display text-card-title text-ink text-balance">{title}</Heading>
        <p className="text-body text-ink-muted text-pretty">{summary}</p>
        <span className="mt-auto w-fit pt-2 text-small font-medium text-ink underline decoration-ink-faint underline-offset-4 transition-colors group-hover:decoration-ink">
          {action} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
