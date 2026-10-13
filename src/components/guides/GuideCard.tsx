import Link from "next/link";
import { isAppClip, isAppStill } from "@/lib/appMedia";
import type { GuideMeta } from "@/lib/guides";

function thumbnail(hero: string) {
  if (isAppClip(hero)) return { webp: `/app/${hero}-poster.webp` };
  if (isAppStill(hero)) return { avif: `/app/${hero}-dark@1x.avif`, webp: `/app/${hero}-dark@1x.webp` };
  return null;
}

/** A guide on the index or under "More guides": the top of its screen, title and one line. */
export default function GuideCard({ guide, headingLevel = "h3" }: { guide: GuideMeta; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const thumb = thumbnail(guide.thumb ?? guide.hero);

  return (
    <Link
      href={`/guides/${guide.slug}`}
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
        <Heading className="font-display text-card-title text-ink text-balance">{guide.title}</Heading>
        <p className="text-body text-ink-muted text-pretty">{guide.summary}</p>
        <span className="mt-auto pt-2 text-small font-medium text-energy">
          Read the guide <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
