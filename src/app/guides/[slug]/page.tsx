import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeviceFrame from "@/components/device/DeviceFrame";
import GuideCard from "@/components/guides/GuideCard";
import FinalCta from "@/components/pricing/FinalCta";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  formatGuideDate,
  getGuideSlugs,
  getGuides,
  guideHeroMedia,
  guideSectionTitle,
  loadGuide,
} from "@/lib/guides";

const baseUrl = "https://www.tryprepit.app";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await loadGuide(slug);
  if (!guide) return {};
  const { title, description, updated } = guide.meta;
  const url = `${baseUrl}/guides/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${title} | PrepIt`,
      description,
      siteName: "PrepIt",
      locale: "en_US",
      modifiedTime: updated,
      section: "Guides",
    },
    twitter: { card: "summary_large_image", title: `${title} | PrepIt`, description },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await loadGuide(slug);
  if (!guide) notFound();
  const { meta, content } = guide;

  // Other guides from the same section first, then the rest, in list order.
  const all = await getGuides();
  const others = all.filter((g) => g.slug !== slug);
  const more = [
    ...others.filter((g) => g.section === meta.section),
    ...others.filter((g) => g.section !== meta.section),
  ].slice(0, 3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: meta.title,
      description: meta.description,
      datePublished: meta.updated,
      dateModified: meta.updated,
      url: `${baseUrl}/guides/${slug}`,
      image: `${baseUrl}/guides/${slug}/opengraph-image`,
      author: { "@type": "Organization", name: "PrepIt", url: baseUrl },
      publisher: { "@type": "Organization", name: "PrepIt", logo: `${baseUrl}/logo.png` },
      about: { "@type": "MobileApplication", name: "PrepIt", operatingSystem: "iOS" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Guides", item: `${baseUrl}/guides` },
        { "@type": "ListItem", position: 2, name: meta.title, item: `${baseUrl}/guides/${slug}` },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Phones close the gap between the title and the guide, so step 1 starts on the first screen. */}
      <Section labelledBy="guide-heading" className="max-lg:[&>div]:pb-stack">
        {/*
          * On phones and tablets the header is text only, so step 1 starts
          * near the top; the same capture sits under the first steps instead
          * (<GuideHero>, added by remarkGuideHero in lib/guides).
          */}
        <FeatureSplit
          emphasis="text"
          mediaClassName="max-lg:hidden"
          media={
            <div className="relative py-4">
              <Glow />
              <DeviceFrame
                className="[--device-w:340px]"
                priority
                {...guideHeroMedia(meta)}
              />
            </div>
          }
        >
          <nav aria-label="Breadcrumb">
            <Link
              href="/guides"
              className="tap-target text-small font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <span aria-hidden>←</span> All guides
            </Link>
          </nav>
          <SectionHeading
            as="h1"
            id="guide-heading"
            eyebrow={guideSectionTitle(meta.section)}
            title={meta.title}
            lead={meta.summary}
          />
          <p className="text-small text-ink-faint">
            Updated <time dateTime={meta.updated}>{formatGuideDate(meta.updated)}</time>
          </p>
        </FeatureSplit>
      </Section>

      <Section tone="surface" className="max-lg:[&>div]:pt-stack">
        <article className="mx-auto max-w-[720px]">{content}</article>
      </Section>

      <Section labelledBy="more-guides-heading">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="more-guides-heading" className="font-display text-title text-ink">
              More guides
            </h2>
            <Link href="/guides" className="tap-target text-small font-medium text-energy hover:text-ink">
              See all guides <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {more.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </div>
      </Section>

      {/* Guides end with their own download section, so App Store taps are counted per guide. */}
      <FinalCta trackingSource={`guide-${slug}`} />
    </>
  );
}
