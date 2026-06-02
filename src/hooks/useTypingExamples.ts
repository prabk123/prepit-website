"use client";

import { useEffect, useState } from "react";

const DEFAULT_TYPE_MS = 48;
const DEFAULT_DELETE_MS = 28;
const DEFAULT_PAUSE_MS = 2400;

export function useTypingExamples(
  examples: readonly string[],
  {
    typeMs = DEFAULT_TYPE_MS,
    deleteMs = DEFAULT_DELETE_MS,
    pauseMs = DEFAULT_PAUSE_MS,
  } = {},
) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = examples[exampleIndex];

    if (!isDeleting && text === fullText) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseMs);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && text === "") {
      setIsDeleting(false);
      setExampleIndex((index) => (index + 1) % examples.length);
      return;
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setText(fullText.slice(0, text.length - 1));
      } else {
        setText(fullText.slice(0, text.length + 1));
      }
    }, isDeleting ? deleteMs : typeMs);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, exampleIndex, examples, typeMs, deleteMs, pauseMs]);

  return text;
}
