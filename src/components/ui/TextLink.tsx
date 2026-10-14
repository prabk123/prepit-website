import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A short amber link with an arrow, under a section ("More about logging",
 * "See all guides"). Its text names where it goes, so it reads on its own.
 */
export default function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`tap-target w-fit text-small font-medium text-energy transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream ${className ?? ""}`}
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}
