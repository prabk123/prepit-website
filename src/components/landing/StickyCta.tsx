"use client";

import { useEffect, useState } from "react";
import LandingCta from "@/components/landing/LandingCta";
import type { WebMarket } from "@/lib/markets";
import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * Phones only: a bar with "Start my free 7 days" that slides up once the
 * hero's button has scrolled away, and hides again over the closing band.
 */
export default function StickyCta({ market }: { market: WebMarket }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const closing = document.getElementById("start");
    if (!hero || !("IntersectionObserver" in window)) return;
    const visible = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
      setShow(!visible.get(hero) && !(closing && visible.get(closing)));
    });
    observer.observe(hero);
    if (closing) observer.observe(closing);
    return () => observer.disconnect();
  }, []);

  if (market === "waitlist") return null;
  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-line bg-surface/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom,0px))] pt-2.5 backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none min-[761px]:hidden ${show ? "translate-y-0" : "translate-y-[110%]"}`}
    >
      <p className="text-[13px] leading-tight text-ink-secondary">
        <b className="block text-small text-ink">{TRIAL_DAYS} days free</b>
        {market === "web" ? "$0 today" : "Cancel anytime"}
      </p>
      <LandingCta market={market} placement="sticky" small />
    </div>
  );
}
