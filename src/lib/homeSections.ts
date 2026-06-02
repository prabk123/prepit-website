export type HomeSectionLink = {
  label: string;
  href: string;
  /** Show in the top navigation bar (subset of all page sections). */
  inHeader?: boolean;
};

export const HOME_SECTION_LINKS: HomeSectionLink[] = [
  { label: "Why PrepIt", href: "/#objection-mirror" },
  { label: "How it works", href: "/#nutrition-loop", inHeader: true },
  { label: "Logging", href: "/#logging" },
  { label: "Nutrition signals", href: "/#nutrition-signals" },
  { label: "AI Nutritionist", href: "/#ai-coach", inHeader: true },
  { label: "Trust", href: "/#trust" },
  { label: "Goals", href: "/#goals" },
  { label: "FAQ", href: "/#faq", inHeader: true },
];

export const HEADER_SECTION_LINKS = HOME_SECTION_LINKS.filter(
  (link) => link.inHeader,
);
