import type { CSSProperties, ReactNode } from "react";

/**
 * A line of text split into words for the blur-in (src/app/motion.css), each
 * with its index in `--i`. Screen readers get the line once, unsplit.
 * Anything that isn't a plain string is returned as it is.
 */
export default function SplitWords({ text, last }: { text: ReactNode; last?: (word: string) => ReactNode }) {
  if (typeof text !== "string") return text;
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={i}>
            <span className="split-word" style={{ "--i": i } as CSSProperties}>
              {i === words.length - 1 && last ? last(word) : word}
            </span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </>
  );
}
