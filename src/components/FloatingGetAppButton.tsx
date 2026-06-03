"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const APP_STORE_URL =
  "https://apps.apple.com/app/prepit-ai-nutritionist/id6751211023";

const BUTTON_BOTTOM_OFFSET_PX = 24; // bottom-6
const BUTTON_HEIGHT_PX = 56; // h-14

function footerOverlapsButton(footer: Element) {
  const footerRect = footer.getBoundingClientRect();
  const buttonTop =
    window.innerHeight - BUTTON_BOTTOM_OFFSET_PX - BUTTON_HEIGHT_PX;
  const buttonBottom = window.innerHeight - BUTTON_BOTTOM_OFFSET_PX;

  return footerRect.top < buttonBottom && footerRect.bottom > buttonTop;
}

export default function FloatingGetAppButton() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const updateVisibility = () => {
      setHidden(footerOverlapsButton(footer));
    };

    updateVisibility();

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  return (
    <a
      href={APP_STORE_URL}
      className={`fixed bottom-6 right-4 z-50 transition-opacity hover:opacity-80 lg:right-14 ${
        hidden ? "pointer-events-none opacity-0" : ""
      }`}
      aria-label="Download on the App Store"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
    >
      <Image
        src="/app_store_download.png"
        alt="Download on the App Store"
        width={187}
        height={56}
        className="h-14 w-auto shadow-lg"
      />
    </a>
  );
}
