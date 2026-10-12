import type { ReactNode } from "react";

type SectionHeadingProps = {
  /** Chapter number shown before the eyebrow, e.g. "01". */
  chapter?: string;
  eyebrow?: string;
  title: ReactNode;
  /** The one supporting line. */
  lead?: ReactNode;
  /** `hero` for the page's h1, `chapter` for numbered sections, `title` for smaller blocks. */
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

/** Eyebrow (gradient), headline and one supporting line. */
export default function SectionHeading({
  chapter,
  eyebrow,
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
      {(chapter || eyebrow) && (
        <p className="text-eyebrow font-medium uppercase">
          <span className="text-gradient-brand">
            {chapter && <span className="tabular-nums">{chapter}</span>}
            {chapter && eyebrow && <span aria-hidden>&ensp;</span>}
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
