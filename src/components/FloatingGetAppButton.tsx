"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AppStoreLink from "@/components/AppStoreLink";

const BUTTON_BOTTOM_OFFSET_PX = 16; // bottom-4
const BUTTON_HEIGHT_PX = 44; // h-11

/** Pages without a hero show the button once this much has been scrolled. */
const NO_HERO_SCROLL_RATIO = 0.6;

function footerOverlapsButton(footer: Element) {
  const footerRect = footer.getBoundingClientRect();
  const buttonTop =
    window.innerHeight - BUTTON_BOTTOM_OFFSET_PX - BUTTON_HEIGHT_PX;
  const buttonBottom = window.innerHeight - BUTTON_BOTTOM_OFFSET_PX;

  return footerRect.top < buttonBottom && footerRect.bottom > buttonTop;
}

function heroScrolledPast() {
  const hero = document.getElementById("hero");
  if (!hero) {
    return window.scrollY > window.innerHeight * NO_HERO_SCROLL_RATIO;
  }
  return hero.getBoundingClientRect().bottom <= 0;
}

/**
 * Mobile-only App Store badge. Hidden on desktop (the header has "Get the
 * app"), until the hero has been scrolled past, and while the footer is
 * under it.
 */
export default function FloatingGetAppButton() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const updateVisibility = () => {
      const footer = document.querySelector("footer");
      setHidden(
        !heroScrolledPast() || (footer !== null && footerOverlapsButton(footer)),
      );
    };

    updateVisibility();

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [pathname]);

  return (
    <AppStoreLink
      trackingSource="floating-button"
      className={`fixed bottom-4 right-4 z-50 transition-opacity duration-300 hover:opacity-80 lg:hidden ${
        hidden ? "pointer-events-none opacity-0" : ""
      }`}
      aria-label="Download on the App Store"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
    >
      <Image
        src="/app_store_download.png"
        alt="Download on the App Store"
        width={147}
        height={44}
        className="h-11 w-auto shadow-lg"
      />
    </AppStoreLink>
  );
}
