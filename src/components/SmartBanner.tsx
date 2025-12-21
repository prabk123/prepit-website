"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const LEGAL_PAGES = [
  "/privacy-policy",
  "/terms-and-conditions",
  "/cookie-policy",
  "/refund-policy",
  "/subscription-policy",
];

export default function SmartBanner() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if current page is a legal page
    const isLegalPage = LEGAL_PAGES.some((page) => pathname?.startsWith(page));

    // Find existing meta tag
    let metaTag = document.querySelector('meta[name="apple-itunes-app"]');

    if (isLegalPage) {
      // Remove meta tag if on legal page
      if (metaTag) {
        metaTag.remove();
      }
    } else {
      // Add meta tag if not on legal page
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", "apple-itunes-app");
        metaTag.setAttribute("content", "app-id=6751211023");
        document.head.appendChild(metaTag);
      }
    }

    // Cleanup function
    return () => {
      const tag = document.querySelector('meta[name="apple-itunes-app"]');
      if (tag) {
        tag.remove();
      }
    };
  }, [pathname]);

  return null;
}
