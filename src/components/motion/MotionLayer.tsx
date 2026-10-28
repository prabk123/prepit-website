"use client";

import { useEffect } from "react";

/**
 * The homepage's motion layer (website motion experiment): one small script
 * that turns on the effects styled in src/app/motion.css, after React Bits'
 * Blur Text, Animated Content, Tilted Card, Spotlight Card and Magnet.
 *
 * - `[data-reveal]` blurs and rises in the first time it scrolls into view
 *   (`data-revealed`). Anything already on screen when the page loads is
 *   marked first, so nothing visible blinks out and back.
 * - `.device-frame` tilts towards the pointer.
 * - `[data-spotlight]` keeps a soft orange light under the pointer.
 * - `[data-magnet]` leans a little towards the pointer.
 *
 * It sets `data-motion` on <html>: "on", or "off" under reduced motion or with
 * `?motion=off` in the address (to compare against the page without it).
 * Pointer effects only run on a mouse or trackpad. It also draws the scroll
 * progress line.
 */
export default function MotionLayer() {
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

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    for (const el of targets) {
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) el.dataset.revealed = "";
    }
    root.dataset.motion = "on";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    for (const el of targets) if (!("revealed" in el.dataset)) observer.observe(el);

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
        device.style.setProperty("--tilt-y", `${(x * 12).toFixed(2)}deg`);
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
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      onPointerLeave();
      delete root.dataset.motion;
    };
  }, []);

  // The orange line along the top that fills as the page scrolls (CSS only).
  return <div aria-hidden className="scroll-progress" />;
}
