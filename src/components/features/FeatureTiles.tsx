import Link from "next/link";
import { V9Photo } from "@/components/landing/v9/V9Photo";
import { FEATURES, featureHref, type FeatureSlug } from "@/lib/features";

/**
 * The feature photo tiles (PRE-450): a still with a white chip naming the
 * feature and a short headline over a dark fade, linking to its page.
 *
 * `row` is the Features overview's row of five, with each tile's second
 * line: five across from 1080 px, a swipeable row below. `grid` is the
 * related row at the foot of a feature page: four across from 900 px, two
 * below, headline only.
 */
export default function FeatureTiles({ slugs, layout }: { slugs: readonly FeatureSlug[]; layout: "row" | "grid" }) {
  const list =
    layout === "row"
      ? "-mr-gutter grid snap-x snap-mandatory auto-cols-[72%] grid-flow-col gap-3.5 overflow-x-auto pb-1.5 pr-gutter [scrollbar-width:none] min-[620px]:auto-cols-[40%] min-[1080px]:mr-0 min-[1080px]:grid-flow-row min-[1080px]:grid-cols-5 min-[1080px]:overflow-visible min-[1080px]:pr-0 [&::-webkit-scrollbar]:hidden"
      : "grid grid-cols-2 gap-3.5 min-[900px]:grid-cols-4";
  const aspect = layout === "row" ? "aspect-[4/5.6]" : "aspect-[4/4.6]";
  return (
    <ul className={list}>
      {slugs.map((slug) => {
        const { name, tile } = FEATURES[slug];
        return (
          <li key={slug} className="min-w-0 snap-start">
            <Link
              href={featureHref(slug)}
              className={`group relative block ${aspect} overflow-hidden rounded-[22px] bg-[var(--color-v9-band)] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus`}
            >
              <V9Photo
                name={tile.photo.name}
                widths={tile.photo.widths.slice(0, 2)}
                width={880}
                height={1092}
                sizes={layout === "row" ? "(min-width: 1080px) 220px, (min-width: 620px) 40vw, 72vw" : "(min-width: 900px) 270px, 46vw"}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
                style={tile.photo.position ? { objectPosition: tile.photo.position } : undefined}
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(0deg,rgb(26_20_14/0.72)_0%,rgb(26_20_14/0.2)_42%,rgb(26_20_14/0)_62%)]"
              />
              <span className="absolute inset-x-4 bottom-4 z-[1] flex flex-col gap-1.5">
                <span className="w-fit rounded-full bg-white/[0.86] px-2.5 py-1 text-[11.5px] font-medium leading-tight text-[#1a1a2e]">{name}</span>
                <span className="font-display text-[21px] font-medium leading-[1.15] text-white">{tile.title}</span>
                {layout === "row" && <span className="text-[13px] text-white/90">{tile.line}</span>}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
