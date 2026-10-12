import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  /**
   * D3 keeps the brand gradient for the hero eyebrow and the final CTA line
   * only; every other eyebrow is muted text.
   */
  eyebrowTone?: "muted" | "gradient";
  title: ReactNode;
  /** The one supporting line. */
  lead?: ReactNode;
  /** `hero` for the page's h1, `chapter` for section headlines, `title` for smaller blocks. */
  size?: "hero" | "chapter" | "title";
  as?: "h1" | "h2" | "h3";
  id?: string;
  align?: "start" | "center";
  className?: string;
};

const titleSize = {
  hero: "text-hero",
  chapter: "text-chapter",
  title: "text-title",
} as const;

/** Eyebrow, headline and one supporting line. Headings are not numbered (D3). */
export default function SectionHeading({
  eyebrow,
  eyebrowTone = "muted",
  title,
  lead,
  size = "chapter",
  as,
  id,
  align = "start",
  className,
}: SectionHeadingProps) {
  const Heading = as ?? (size === "hero" ? "h1" : "h2");
  const centered = align === "center";

  return (
    <div
      className={`flex flex-col gap-5 ${centered ? "items-center text-center" : ""} ${className ?? ""}`}
    >
      {eyebrow && (
        <p className="text-eyebrow font-medium uppercase">
          <span className={eyebrowTone === "gradient" ? "text-gradient-brand" : "text-ink-muted"}>
            {eyebrow}
          </span>
        </p>
      )}
      <Heading
        id={id}
        className={`font-display ${titleSize[size]} text-ink text-balance`}
      >
        {title}
      </Heading>
      {lead && (
        <p
          className={`text-lead text-ink-secondary ${centered ? "max-w-[36ch]" : "max-w-[40ch]"} text-pretty`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
