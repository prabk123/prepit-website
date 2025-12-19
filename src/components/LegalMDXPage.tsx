import React from "react";
import LegalNav from "./LegalNav";

interface LegalMDXPageProps {
  title: string;
  lastUpdated?: string;
  currentPath: string;
  children: React.ReactNode;
}

export default function LegalMDXPage({
  title,
  lastUpdated,
  currentPath,
  children,
}: LegalMDXPageProps) {
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

        {/* MDX Content with styling */}
        <div className="legal-content">{children}</div>
      </div>
    </section>
  );
}
