import React from "react";
import Section from "@/components/ui/Section";
import LegalNav from "./LegalNav";

interface LegalMDXPageProps {
  title: string;
  lastUpdated?: string;
  currentPath: string;
  children: React.ReactNode;
}

/** A legal page (D3): the guides' 720 px reading column on the dark page. */
export default function LegalMDXPage({
  title,
  lastUpdated,
  currentPath,
  children,
}: LegalMDXPageProps) {
  return (
    <div className="w-full bg-page pt-16 text-ink [color-scheme:dark] lg:pt-[72px]">
      <Section labelledBy="legal-heading">
        <div className="mx-auto flex max-w-[720px] flex-col gap-10">
          <LegalNav currentPath={currentPath} />
          <div className="flex flex-col gap-3">
            <h1 id="legal-heading" className="font-display text-section text-ink text-balance">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-small text-ink-faint">Last updated {lastUpdated}</p>
            )}
          </div>
          <article>{children}</article>
        </div>
      </Section>
    </div>
  );
}
