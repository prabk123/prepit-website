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
  /**
   * Below 640 px: the whole thumbnail, small, beside the title and line, without the
   * link line, so a list of cards takes a fraction of a screen (PRE-318).
   */
  compact?: boolean;
};

/**
 * A card linking to another page: a crop of an app screen, a title, one line
 * and a link line. Used for guides and the related-features row.
 */
export default function LinkCard({
  href,
  title,
  summary,
  action,
  thumb,
  headingLevel = "h3",
  compact = false,
}: LinkCardProps) {
  const Heading = headingLevel;

  return (
    <Link
      href={href}
      className={`group flex min-w-0 ${compact ? "flex-row sm:flex-col" : "flex-col"} overflow-hidden rounded-tile border border-line bg-surface transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus`}
    >
      {thumb && (
        <div
          aria-hidden
          className={`overflow-hidden bg-surface-raised ${
            compact
              ? "my-4 ml-4 w-24 shrink-0 min-[380px]:w-28 self-center rounded-lg border border-line sm:m-0 sm:w-auto sm:self-auto sm:rounded-none sm:border-0 sm:border-b"
              : "border-b border-line"
          }`}
        >
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
      <div className={`flex min-w-0 flex-1 flex-col ${compact ? "gap-1 p-4 sm:gap-3 sm:p-6" : "gap-3 p-6"}`}>
        <Heading className="font-display text-card-title text-ink text-balance">{title}</Heading>
        <p className={`${compact ? "text-small sm:text-body" : "text-body"} text-ink-muted text-pretty`}>{summary}</p>
        <span className={`${compact ? "hidden sm:inline" : ""} mt-auto w-fit pt-2 text-small font-medium text-ink underline decoration-ink-faint underline-offset-4 transition-colors group-hover:decoration-ink`}>
          {action} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
