export type HomeSectionLink = {
  label: string;
  href: string;
  /** Show in the top navigation bar (subset of all page sections). */
  inHeader?: boolean;
};

export const HOME_SECTION_LINKS: HomeSectionLink[] = [
  { label: "Your nutritionist", href: "/#nutritionist" },
  { label: "Logging", href: "/#logging" },
  { label: "Energy, Satiety and Mood", href: "/#signals" },
  { label: "Meal plans", href: "/#plans" },
  { label: "Features", href: "/#features", inHeader: true },
  { label: "Pricing", href: "/#pricing", inHeader: true },
  { label: "FAQ", href: "/#faq", inHeader: true },
];

export const HEADER_SECTION_LINKS = HOME_SECTION_LINKS.filter(
  (link) => link.inHeader,
);
