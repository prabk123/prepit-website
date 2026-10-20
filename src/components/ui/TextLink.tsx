import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A short ink link with an arrow, under a section ("More about logging",
 * "See all guides"). Its text names where it goes, so it reads on its own.
 * The vertical padding keeps its box at least 24 px tall on phones without
 * moving anything around it.
 */
export default function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`tap-target -my-1 w-fit py-1 text-small font-medium text-ink underline decoration-ink-faint underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus ${className ?? ""}`}
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}
