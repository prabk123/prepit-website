export type HomeSectionLink = {
  label: string;
  href: string;
};

/**
 * The header's and the footer Explore column's links: the Features overview
 * page (PRE-307), then homepage sections.
 */
export const HEADER_SECTION_LINKS: HomeSectionLink[] = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

/**
 * Site pages in the header and footer beside the homepage sections. The About
 * page was removed in PRE-311; /about redirects to the homepage.
 */
export const SITE_PAGE_LINKS: HomeSectionLink[] = [
  { label: "Guides", href: "/guides" },
  { label: "Contact", href: "/contact" },
];
