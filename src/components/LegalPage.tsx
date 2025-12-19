import React from "react";
import LegalNav from "./LegalNav";

export interface LegalSection {
  title: string;
  content: string | string[]; // Can be a single paragraph or array of paragraphs
}

interface LegalPageProps {
  title: string;
  sections: LegalSection[];
  lastUpdated?: string;
  currentPath: string;
}

export default function LegalPage({
  title,
  sections,
  lastUpdated,
  currentPath,
}: LegalPageProps) {
  return (
    <section className="mt-16 flex w-full flex-col items-center bg-white px-4 py-10 lg:px-40 lg:py-[120px]">
      <div className="flex w-full max-w-[1200px] flex-col gap-10">
        {/* Legal Navigation */}
        <LegalNav currentPath={currentPath} />

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-[40px] font-semibold leading-normal text-black"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-[var(--grey-60)]">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-10">
          {sections.map((section, index) => (
            <div key={index} className="flex flex-col gap-4 text-black">
              {/* Section Title */}
              <h2 className="text-2xl font-extrabold leading-8">
                {index + 1}. {section.title}
              </h2>

              {/* Section Content */}
              <div className="flex flex-col gap-4 text-base leading-6">
                {Array.isArray(section.content) ? (
                  section.content.map((paragraph, pIndex) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))
                ) : (
                  <p>{section.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
