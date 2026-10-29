"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The site's motion layer (website motion experiment), on the homepage, the
 * feature pages, the guides and the research page: one small script
 * that turns on the effects styled in src/app/motion.css, after React Bits
 * and the Prompt Motion gallery.
 *
 * One rule decides what animates: every block of content in a section below
 * the page's opening (the homepage hero, or the heading marked `intro` that
 * plays the same moves on load) comes in as it scrolls into view, in reading
 * order, and so does the closing download band. Headlines rise
 * word by word out of a mask line; everything else (paragraphs, list items,
 * links, cards, phones, photos) rises and un-blurs. Blocks that arrive
 * together follow each other a beat apart. Anything already on screen when
 * the page loads is shown as it is, so nothing visible blinks out and back.
 *
 * It also counts `[data-count]` numbers up as they come in, tilts phones
 * towards the pointer, keeps a soft orange light under the pointer on
 * `[data-spotlight]` cards and leans `[data-magnet]` buttons towards it.
 *
 * It sets `data-motion` on <html>: "on", or "off" under reduced motion or with
 * `?motion=off` in the address (to compare against the page without it).
 * Pointer effects only run on a mouse or trackpad.
 */

/** The blocks that come in, smallest first: a block inside another is left to its parent. */
const BLOCKS = "h2, h3, p, li, figure, picture, article, .device-frame, .device-pair, a, details";
/** Decorative layers, photos the text sits on, and anything that moves on its own. */
const SKIP = "[aria-hidden='true'], .annotated-photo, .pointer-events-none, nav, [data-reveal], .hero-words, .hero-rise";

function revealBlocks(): HTMLElement[] {
  const blocks: HTMLElement[] = [];
  for (const section of document.querySelectorAll<HTMLElement>("#main section:not(#hero), .site-final-cta > section")) {
    const own = Array.from(section.querySelectorAll<HTMLElement>(`${BLOCKS}, [data-reveal]`)).filter(
      (el) => !el.parentElement?.closest(SKIP) && (el.dataset.reveal || !el.matches(SKIP)),
    );
    // Keep the outermost: a card, not the paragraphs inside it.
    const outer = own.filter((el) => !own.some((other) => other !== el && other.contains(el)));
    for (const el of outer) {
      if (!el.dataset.reveal) el.dataset.reveal = el.querySelector(".split-word") ? "words" : "rise";
      blocks.push(el);
    }
  }
  return blocks;
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;
  const start = performance.now();
  const duration = 1400;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 4))));
    if (t < 1) requestAnimationFrame(tick);
  };
  el.textContent = "0";
  requestAnimationFrame(tick);
}

export default function MotionLayer() {
  // A layout keeps this mounted from one page to the next, so each new page
  // gets its blocks set up again.
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const optedOut = new URLSearchParams(window.location.search).get("motion") === "off";
    if (reduced || optedOut || !("IntersectionObserver" in window)) {
      root.dataset.motion = "off";
      return () => {
        delete root.dataset.motion;
      };
    }

    const blocks = revealBlocks();
    for (const el of blocks) {
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) el.dataset.revealed = "";
    }
    root.dataset.motion = "on";

    const show = (el: HTMLElement, order: number) => {
      el.style.setProperty("--order", String(order));
      el.dataset.revealed = "";
      for (const number of el.querySelectorAll<HTMLElement>("[data-count]")) countUp(number);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement, Math.min(order++, 6));
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    for (const el of blocks) if (!("revealed" in el.dataset)) observer.observe(el);

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let last: PointerEvent | null = null;
    let tilted: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;

    const settle = (el: HTMLElement | null, ...props: string[]) => {
      if (el) for (const prop of props) el.style.removeProperty(prop);
    };

    const update = () => {
      frame = 0;
      const event = last;
      if (!event) return;
      const target = event.target instanceof Element ? event.target : null;

      const device = target?.closest<HTMLElement>(".device-frame") ?? null;
      if (device !== tilted) settle(tilted, "--tilt-x", "--tilt-y");
      tilted = device;
      if (device) {
        const box = device.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        device.style.setProperty("--tilt-x", `${(-y * 10).toFixed(2)}deg`);
        device.style.setProperty("--tilt-y", `${(x * 14).toFixed(2)}deg`);
      }

      const card = target?.closest<HTMLElement>("[data-spotlight]");
      if (card) {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
        card.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
      }

      const button = target?.closest<HTMLElement>("[data-magnet]") ?? null;
      if (button !== magnet) settle(magnet, "--magnet-x", "--magnet-y");
      magnet = button;
      if (button) {
        const box = button.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        button.style.setProperty("--magnet-x", `${(dx * 0.18).toFixed(1)}px`);
        button.style.setProperty("--magnet-y", `${(dy * 0.28).toFixed(1)}px`);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== "mouse") return;
      last = event;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onPointerLeave = () => {
      settle(tilted, "--tilt-x", "--tilt-y");
      settle(magnet, "--magnet-x", "--magnet-y");
      tilted = magnet = null;
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      onPointerLeave();
      delete root.dataset.motion;
    };
  }, [pathname]);

  // The orange line along the top that fills as the page scrolls (CSS only).
  return <div aria-hidden className="scroll-progress" />;
}
