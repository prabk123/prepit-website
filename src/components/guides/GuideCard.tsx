import LinkCard from "@/components/ui/LinkCard";
import { cardThumb, isCardThumb } from "@/lib/captures";
import type { GuideMeta } from "@/lib/guides";

/** A guide on the index or under "More guides": a crop of its screen, title and one line. */
export default function GuideCard({ guide, headingLevel = "h3" }: { guide: GuideMeta; headingLevel?: "h2" | "h3" }) {
  // lib/guides checks every guide has a card thumbnail.
  const thumb = guide.thumb ?? guide.hero;
  return (
    <LinkCard
      href={`/guides/${guide.slug}`}
      title={guide.title}
      summary={guide.summary}
      action="Read the guide"
      thumb={isCardThumb(thumb) ? cardThumb(thumb) : null}
      headingLevel={headingLevel}
    />
  );
}
