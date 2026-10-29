import React from "react";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import SplitWords from "@/components/motion/SplitWords";
import Section from "@/components/ui/Section";
import type { LegalHeading } from "@/lib/legalHeadings";
import LegalNav from "./LegalNav";

interface LegalMDXPageProps {
  title: string;
  lastUpdated?: string;
  currentPath: string;
  /** The page's `##` headings, listed as jump links under the title. */
  headings?: LegalHeading[];
  children: React.ReactNode;
}

/** A legal page: the guides' 720 px reading column, with a contents list under the title. */
export default function LegalMDXPage({
  title,
  lastUpdated,
  currentPath,
  headings = [],
  children,
}: LegalMDXPageProps) {
  return (
    <div className="w-full bg-page pt-16 text-ink lg:pt-[72px]">
      {/* Readers here mostly already have the app, so no download section. */}
      <HideSiteFinalCta />
      <Section labelledBy="legal-heading">
        <div className="mx-auto flex max-w-[720px] flex-col gap-10">
          <LegalNav currentPath={currentPath} />
          <div className="flex flex-col gap-3">
            <h1 id="legal-heading" className="hero-words font-display text-section text-ink text-balance">
              <SplitWords text={title} />
            </h1>
            {lastUpdated && (
              <p className="hero-rise text-small text-ink-faint [--rise-delay:450ms]">Last updated {lastUpdated}</p>
            )}
          </div>
          {headings.length > 2 && (
            <nav aria-labelledby="legal-contents" className="hero-rise rounded-tile [--rise-delay:600ms] border border-line bg-surface p-5 sm:p-6">
              <h2 id="legal-contents" className="text-small font-medium text-ink-muted">
                Contents
              </h2>
              <ol className="mt-3 flex flex-col gap-2 text-body">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="text-ink underline decoration-accent underline-offset-4 hover:text-accent-text"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <article>{children}</article>
        </div>
      </Section>
    </div>
  );
}
