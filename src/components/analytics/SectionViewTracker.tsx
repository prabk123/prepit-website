"use client";

import { useEffect } from "react";
import { trackSectionViewed } from "@/lib/posthogAnalytics";

/**
 * Sends `home_section_viewed` once per page view for every element with a
 * `data-section-name` (set by <Section analyticsName>), when its top passes
 * the middle of the screen. Shows how far visitors scroll.
 */
export default function SectionViewTracker() {
  useEffect(() => {
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const name = (entry.target as HTMLElement).dataset.sectionName;
          observer.unobserve(entry.target);
          if (!name || seen.has(name)) continue;
          seen.add(name);
          trackSectionViewed(name);
        }
      },
      // A section counts once any part of it reaches the upper half of the screen.
      { rootMargin: "0px 0px -50% 0px" },
    );

    document.querySelectorAll<HTMLElement>("[data-section-name]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
