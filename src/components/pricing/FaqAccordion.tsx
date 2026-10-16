"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/faq";
import { trackFaqQuestionOpened } from "@/lib/posthogAnalytics";

type FaqAccordionProps = {
  items: FaqItem[];
  /** Sent with `faq_question_opened`, e.g. "home-faq". */
  trackingSource: string;
  /** Question open on first load (the price question, as in D3). */
  defaultOpenId?: string;
};

function PlusMinus({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden>
      <path
        d={open ? "M5 12h14" : "M5 12h14M12 5v14"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Question({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  const buttonId = `faq-button-${item.id}`;
  const panelId = `faq-panel-${item.id}`;

  return (
    <div className="border-t border-line">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-5 text-left text-lead font-medium text-ink transition-colors hover:text-ink-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          {item.question}
          <PlusMinus open={open} />
        </button>
      </h3>
      <div id={panelId} hidden={!open}>
        <p className="max-w-[60ch] pb-6 text-body text-ink-muted text-pretty">{item.answer}</p>
      </div>
    </div>
  );
}

/**
 * The FAQ list: real buttons with `aria-expanded`, so Tab, Enter and Space
 * work. Two columns from 1024 px. Answers stay in the server-rendered HTML
 * while closed, matching the FAQPage structured data.
 */
export default function FaqAccordion({ items, trackingSource, defaultOpenId }: FaqAccordionProps) {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(
    () => new Set(defaultOpenId ? [defaultOpenId] : []),
  );

  const toggle = (id: string) => {
    const opening = !openIds.has(id);
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (opening) trackFaqQuestionOpened(id, trackingSource);
  };

  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)];

  return (
    <div className="grid gap-x-14 lg:grid-cols-2">
      {columns.map((column, index) => (
        <div key={index} className={`border-line ${index === columns.length - 1 ? "border-b" : "lg:border-b"}`}>
          {column.map((item) => (
            <Question
              key={item.id}
              item={item}
              open={openIds.has(item.id)}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
