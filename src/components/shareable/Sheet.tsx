"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import PrepItIcon from "./PrepItIcon";

type SheetProps = {
  /** Accessible name of the dialog. */
  label: string;
  onClose: () => void;
  /** Gets `close`, which plays the exit animation before `onClose`. */
  children: (close: () => void) => ReactNode;
};

/**
 * The shared plan's modal: a bottom sheet on phones and a centred card from
 * 640 px, on the raised surface. Escape, the backdrop and the close button
 * all dismiss it; page scroll is locked while it is open.
 */
export default function Sheet({ label, onClose, children }: SheetProps) {
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6" onClick={close}>
      <div
        aria-hidden
        className="absolute inset-0 bg-overlay-strong transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-tile border border-line bg-surface text-ink outline-none transition-all duration-300 ease-calm sm:max-h-[88vh] sm:rounded-tile"
        style={{
          transform: visible ? "translateY(0)" : "translateY(40px)",
          opacity: visible ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children(close)}
      </div>
    </div>
  );
}

export function SheetCloseButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-raised text-ink transition-colors hover:bg-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${className ?? ""}`}
    >
      <PrepItIcon name="close" size={18} />
    </button>
  );
}
