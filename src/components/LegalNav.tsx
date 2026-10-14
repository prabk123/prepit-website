import Link from "next/link";

const legalPages = [
  { title: "Terms", href: "/terms-and-conditions" },
  { title: "Privacy", href: "/privacy-policy" },
  { title: "Cookies", href: "/cookie-policy" },
  { title: "Refunds", href: "/refund-policy" },
  { title: "Subscriptions", href: "/subscription-policy" },
];

/** Links between the legal pages, as pills; the current page is cream. */
export default function LegalNav({ currentPath }: { currentPath: string }) {
  return (
    <nav aria-label="Legal pages">
      <ul className="flex flex-wrap gap-2">
        {legalPages.map((page) => {
          const current = currentPath === page.href;
          return (
            <li key={page.href}>
              <Link
                href={page.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex h-11 items-center rounded-control px-4 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream ${
                  current
                    ? "bg-cream text-on-cream"
                    : "border border-line-strong text-ink-muted hover:text-ink"
                }`}
              >
                {page.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
