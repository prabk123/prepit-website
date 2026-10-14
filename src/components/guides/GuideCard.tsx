import LinkCard from "@/components/ui/LinkCard";
import { isAppClip, isAppStill } from "@/lib/captures";
import type { GuideMeta } from "@/lib/guides";

function thumbnail(hero: string) {
  if (isAppClip(hero)) return { webp: `/app/${hero}-poster.webp` };
  if (isAppStill(hero)) return { avif: `/app/${hero}-dark@1x.avif`, webp: `/app/${hero}-dark@1x.webp` };
  return null;
}

/** A guide on the index or under "More guides": the top of its screen, title and one line. */
export default function GuideCard({ guide, headingLevel = "h3" }: { guide: GuideMeta; headingLevel?: "h2" | "h3" }) {
  return (
    <LinkCard
      href={`/guides/${guide.slug}`}
      title={guide.title}
      summary={guide.summary}
      action="Read the guide"
      thumb={thumbnail(guide.thumb ?? guide.hero)}
      headingLevel={headingLevel}
    />
  );
}
