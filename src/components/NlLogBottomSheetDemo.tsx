"use client";

import { useEffect, useState } from "react";
import PrepItIcon from "@/components/shareable/PrepItIcon";

const EXAMPLES = [
  "chicken wrap, an apple and a flat white",
  "two eggs on toast and a coffee",
  "big bowl of pasta and two glasses of wine",
];

const TYPE_MS = 48;
const DELETE_MS = 28;
const PAUSE_MS = 2400;

export default function NlLogBottomSheetDemo({
  overlay = false,
}: {
  overlay?: boolean;
}) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = EXAMPLES[exampleIndex];

    if (!isDeleting && text === fullText) {
      const timeout = setTimeout(() => setIsDeleting(true), PAUSE_MS);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && text === "") {
      setIsDeleting(false);
      setExampleIndex((index) => (index + 1) % EXAMPLES.length);
      return;
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setText(fullText.slice(0, text.length - 1));
      } else {
        setText(fullText.slice(0, text.length + 1));
      }
    }, isDeleting ? DELETE_MS : TYPE_MS);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, exampleIndex]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[var(--grey-10)] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] ${
        overlay ? "w-full" : "w-full max-w-[380px]"
      }`}
      aria-hidden="true"
    >
      <div
        className={`flex flex-col ${overlay ? "px-3 pb-3 pt-2" : "px-4 pb-4 pt-3"}`}
      >
        <div className={`flex justify-center ${overlay ? "mb-2" : "mb-3"}`}>
          <div className="h-1 w-10 rounded-full bg-[#D3D3D5]" />
        </div>

        <h3
          className={`font-semibold text-[var(--black-100)] ${
            overlay ? "text-base leading-6" : "text-xl leading-[30px]"
          }`}
        >
          Describe your meal
        </h3>
        <p
          className={`mt-0.5 text-[var(--grey-60)] ${
            overlay ? "text-xs leading-4" : "text-base leading-6"
          }`}
        >
          Amount, brand, and restaurant details help improve accuracy.
        </p>

        <div className={`flex items-end gap-1.5 ${overlay ? "mt-3" : "mt-6"}`}>
          <div
            className={`min-h-[40px] flex-1 rounded-xl bg-[var(--grey-5)] px-3 py-2 ${
              overlay ? "" : "min-h-[48px] px-4 py-3"
            }`}
          >
            <p
              className={`min-h-[20px] text-[var(--black-100)] ${
                overlay ? "text-sm leading-5" : "text-base leading-6"
              }`}
            >
              {text}
              <span className="ml-px inline-block h-[14px] w-0.5 translate-y-0.5 animate-pulse bg-[var(--black-100)]" />
            </p>
          </div>

          <div
            className={`flex shrink-0 items-center justify-center rounded-xl bg-[var(--black-100)] ${
              overlay ? "h-10 w-10" : "h-12 w-12"
            }`}
          >
            <PrepItIcon name="arrowUp" size={overlay ? 20 : 24} color="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}
