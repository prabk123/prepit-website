/**
 * The ids the legal pages' "Contents" list links to: one per `##` heading,
 * made the same way from the MDX source (for the list) and from the rendered
 * heading's text (for its id), so the two always match.
 */
export type LegalHeading = { id: string; text: string };

export function legalHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The `##` headings of an MDX source, in order, skipping fenced code. */
export function legalHeadings(source: string): LegalHeading[] {
  const headings: LegalHeading[] = [];
  let inFence = false;
  for (const line of source.split("\n")) {
    if (line.trimStart().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const match = /^## (.+?)\s*$/.exec(line);
    if (match) headings.push({ id: legalHeadingId(match[1]), text: match[1] });
  }
  return headings;
}
