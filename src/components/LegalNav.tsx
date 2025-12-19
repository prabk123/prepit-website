import Link from "next/link";

const legalPages = [
  { title: "Terms & Conditions", href: "/terms-and-conditions" },
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "Cookie Policy", href: "/cookie-policy" },
  { title: "Refund Policy", href: "/refund-policy" },
  { title: "Subscription Policy", href: "/subscription-policy" },
];

export default function LegalNav({ currentPath }: { currentPath: string }) {
  return (
    <div className="mb-8 flex flex-wrap gap-4 border-b border-[#e5e5e7] pb-4">
      {legalPages.map((page) => (
        <Link
          key={page.href}
          href={page.href}
          className={`text-sm font-medium transition-colors ${
            currentPath === page.href
              ? "text-black"
              : "text-[var(--grey-60)] hover:text-black"
          }`}
        >
          {page.title}
        </Link>
      ))}
    </div>
  );
}
