import type { CSSProperties, ReactNode } from "react";

/**
 * A line of text split into words for the mask rise (src/app/motion.css):
 * each word sits in a clipping box and rises into it from below, with its
 * index in `--i`. Screen readers get the line once, unsplit. Anything that
 * isn't a plain string is returned as it is.
 */
export default function SplitWords({
  text,
  lastAfter,
}: {
  text: ReactNode;
  /** Drawn beside the last word, outside its clipping box (the hero's underline). */
  lastAfter?: ReactNode;
}) {
  if (typeof text !== "string") return text;
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={i} className={i === words.length - 1 && lastAfter ? "relative inline-block" : undefined}>
            <span className="split-mask">
              <span className="split-word" style={{ "--i": i } as CSSProperties}>
                {word}
              </span>
            </span>
            {i === words.length - 1 && lastAfter}
            {i < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </>
  );
}
