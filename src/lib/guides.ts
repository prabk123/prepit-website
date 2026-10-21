import fs from "fs";
import path from "path";
import { cache, type ComponentProps } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type DeviceFrame from "@/components/device/DeviceFrame";
import { guideMdxComponents } from "@/components/guides/GuideBlocks";
import { appCapture, appVideo, isAppClip, isAppStill, isCardThumb } from "@/lib/captures";

const GUIDES_DIR = path.join(process.cwd(), "src/content/guides");

/** The same three groups as Tips and tricks in the app. */
export const GUIDE_SECTIONS = [
  { id: "set-up", title: "Set up" },
  { id: "logging", title: "Log accurately" },
  { id: "more", title: "Get more from PrepIt" },
] as const;

export type GuideSectionId = (typeof GUIDE_SECTIONS)[number]["id"];

type GuideFrontmatter = {
  title: string;
  /** Meta and Open Graph description, about 150 characters. */
  description: string;
  /** The one line on the guide's card. */
  summary: string;
  section: GuideSectionId;
  /** Position within its section. */
  order: number;
  /** A still or clip name from `public/app`, shown in the guide's header. */
  hero: string;
  heroAlt: string;
  /** A still for the guide's card, from CARD_THUMBS in lib/captures. Defaults to the hero. */
  thumb?: string;
  /**
   * On phones the hero shows after this numbered list (1 = the first, the
   * default). Use it when a later set of steps is the one the hero shows.
   */
  heroAfterSteps?: number;
  /** When the steps were last checked against the app, YYYY-MM-DD. */
  updated: string;
};

export type GuideMeta = GuideFrontmatter & { slug: string };

function readSource(slug: string): string {
  return fs.readFileSync(path.join(GUIDES_DIR, `${slug}.mdx`), "utf-8");
}

function assertFrontmatter(slug: string, data: GuideFrontmatter): GuideMeta {
  const missing = (
    ["title", "description", "summary", "section", "order", "hero", "heroAlt", "updated"] as const
  ).filter((key) => data[key] === undefined || data[key] === "");
  if (missing.length) {
    throw new Error(`Guide "${slug}" is missing frontmatter: ${missing.join(", ")}`);
  }
  if (!GUIDE_SECTIONS.some((section) => section.id === data.section)) {
    throw new Error(`Guide "${slug}" has an unknown section "${data.section}"`);
  }
  if (!isAppStill(data.hero) && !isAppClip(data.hero)) {
    throw new Error(`Guide "${slug}" names a hero capture that doesn't exist: "${data.hero}"`);
  }
  // The card shows a crop of this still (PRE-289), so it must have one.
  const thumb = data.thumb ?? data.hero;
  if (!isCardThumb(thumb)) {
    throw new Error(
      `Guide "${slug}" needs a card thumbnail: set thumb to one of CARD_THUMBS, or add "${thumb}" there and to scripts/make-card-thumbs.py`,
    );
  }
  return { ...data, slug };
}

type MdNode = { type: string; ordered?: boolean | null; children?: MdNode[] };

/**
 * Puts a <GuideHero> (the header capture, shown on phones and tablets only)
 * straight after the guide's first numbered steps (or `heroAfterSteps`), so phones reach step 1
 * before the big phone. Reads `hero` and `heroAlt` from the frontmatter.
 */
function remarkGuideHero() {
  return (tree: MdNode, file: { data: Record<string, unknown> }) => {
    const { hero, heroAlt, heroAfterSteps = 1 } = (file.data.matter ?? {}) as Partial<GuideFrontmatter>;
    const children = tree.children ?? [];
    if (!hero || !heroAlt) return;
    const stepLists = children.flatMap((node, i) => (node.type === "list" && node.ordered ? [i] : []));
    const steps = stepLists[heroAfterSteps - 1] ?? stepLists[0] ?? -1;
    const heroNode = {
      type: "mdxJsxFlowElement",
      name: "GuideHero",
      attributes: [
        { type: "mdxJsxAttribute", name: "name", value: hero },
        { type: "mdxJsxAttribute", name: "alt", value: heroAlt },
      ],
      children: [],
    };
    // Every guide has steps today; without them the capture opens the article.
    children.splice(steps + 1, 0, heroNode);
  };
}

async function compileGuide(slug: string) {
  const { content, frontmatter } = await compileMDX<GuideFrontmatter>({
    source: readSource(slug),
    components: guideMdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: [remarkGfm, remarkGuideHero] },
    },
  });
  return { content, meta: assertFrontmatter(slug, frontmatter) };
}

/** Every guide file's slug. A new guide is a new `.mdx` file in src/content/guides. */
export function getGuideSlugs(): string[] {
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
    .sort();
}

export const loadGuide = cache(async (slug: string) => {
  if (!getGuideSlugs().includes(slug)) return null;
  return compileGuide(slug);
});

/** All guides in Tips and tricks order: by section, then `order`. */
export const getGuides = cache(async (): Promise<GuideMeta[]> => {
  const guides = await Promise.all(
    getGuideSlugs().map(async (slug) => (await compileGuide(slug)).meta),
  );
  const sectionIndex = (id: GuideSectionId) => GUIDE_SECTIONS.findIndex((s) => s.id === id);
  return guides.sort(
    (a, b) => sectionIndex(a.section) - sectionIndex(b.section) || a.order - b.order,
  );
});

export function guideSectionTitle(id: GuideSectionId): string {
  return GUIDE_SECTIONS.find((section) => section.id === id)?.title ?? "";
}

/** The header media for a guide: a looping clip when there is one, else a still. */
export function guideHeroMedia(
  meta: GuideMeta,
): Pick<ComponentProps<typeof DeviceFrame>, "capture" | "video"> {
  if (isAppClip(meta.hero)) return { video: appVideo(meta.hero, meta.heroAlt) };
  if (isAppStill(meta.hero)) return { capture: appCapture(meta.hero, meta.heroAlt) };
  return {};
}

/** "13 October 2026" from "2026-10-13". */
export function formatGuideDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
