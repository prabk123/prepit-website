"use client";

import { useEffect, useState } from "react";
import LandingCta from "@/components/landing/LandingCta";
import type { WebMarket } from "@/lib/markets";
import { type Prices, TRIAL_DAYS } from "@/lib/pricing";

/**
 * Phones only (Landing v9, PRE-433): "7 days free · $0 today" and a "Start
 * free" button that slide up once the hero has scrolled away. It hides again
 * while the offer card's own button, or the closing band, is on screen, so
 * there is never a second button beside the one in view.
 */
export default function StickyCta({ market, prices }: { market: WebMarket; prices: Prices }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero || !("IntersectionObserver" in window)) return;
    const others = [document.querySelector('[data-cta="pricing_start_trial"]'), document.getElementById("start")].filter(
      (el): el is Element => el !== null,
    );
    const visible = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
      setShow(!visible.get(hero) && !others.some((el) => visible.get(el)));
    });
    observer.observe(hero);
    for (const el of others) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (market === "waitlist") return null;
  const web = market === "web";
  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-line bg-surface/90 px-4 pb-[calc(10px+env(safe-area-inset-bottom,0px))] pt-2.5 backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none min-[761px]:hidden ${show ? "translate-y-0" : "translate-y-[110%]"}`}
    >
      <p className="text-small font-bold leading-tight text-ink">
        {web ? `${TRIAL_DAYS} days free · ${prices.free} today` : `${TRIAL_DAYS} days free`}
      </p>
      <LandingCta market={market} placement="sticky" small label="Start free" />
    </div>
  );
}
