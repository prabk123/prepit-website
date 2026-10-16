export type HomeSectionLink = {
  label: string;
  href: string;
};

/** Homepage sections in the header and the footer's Explore column. */
export const HEADER_SECTION_LINKS: HomeSectionLink[] = [
  { label: "Features", href: "/#nutritionist" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

/**
 * Site pages in the header and footer beside the homepage sections. /guides
 * and /about come with PRE-204.
 */
export const SITE_PAGE_LINKS: HomeSectionLink[] = [
  { label: "Guides", href: "/guides" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
