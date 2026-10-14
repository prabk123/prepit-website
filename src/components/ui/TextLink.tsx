import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A short cream link with an arrow, under a section ("More about logging",
 * "See all guides"). Its text names where it goes, so it reads on its own.
 * Amber is kept for photo annotations (D3), so links are cream.
 */
export default function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`w-fit text-small font-medium text-ink underline decoration-ink-faint underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream ${className ?? ""}`}
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}
