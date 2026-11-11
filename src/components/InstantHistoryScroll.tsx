"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Back and forward to another page put it back where it was at once (PRE-466).
 *
 * globals.css turns on smooth scrolling for same-page anchor links, and the
 * browser applies it when it restores the scroll position on back/forward,
 * so going back to a long page animated down from the top. When popstate
 * lands on a different page, smooth scrolling is switched off and comes back
 * on the next click or key press, before any anchor link can use it.
 * Hash-only popstates (a plain `#section` link, or back between sections of
 * one page) stay smooth.
 */
export default function InstantHistoryScroll() {
  const pathname = usePathname();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    lastPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    const restore = () => {
      html.style.removeProperty("scroll-behavior");
      window.removeEventListener("pointerdown", restore, true);
      window.removeEventListener("keydown", restore, true);
    };
    const onPopState = () => {
      if (window.location.pathname === lastPathname.current) return;
      html.style.scrollBehavior = "auto";
      window.addEventListener("pointerdown", restore, true);
      window.addEventListener("keydown", restore, true);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      restore();
    };
  }, []);
  return null;
}
