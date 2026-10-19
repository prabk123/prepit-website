"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AppStoreLink from "@/components/AppStoreLink";
import LongLogo from "@/components/ui/LongLogo";
import { HEADER_SECTION_LINKS, SITE_PAGE_LINKS } from "@/lib/homeSections";

const linkClass =
  "text-small font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus";
const pillClass =
  "inline-flex h-11 items-center whitespace-nowrap rounded-button bg-primary px-4 text-small font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus";

/** The site header: solid light bar (no text reads through it), section links and "Get the app". */
export default function NavigationWrapper() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // While the mobile menu is open, Escape closes it and Tab cycles through the
  // header and the menu only, not the page behind the backdrop.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = [navRef.current, menuRef.current]
        .flatMap((root) => Array.from(root?.querySelectorAll<HTMLElement>("a[href], button") ?? []))
        .filter((el) => el.getClientRects().length > 0);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (index === -1 || index === focusable.length - 1)) {
        event.preventDefault();
        first.focus();
      }
    };

    // The drawer is lg:hidden, so close it if the window widens to desktop
    // (rotation or resize); otherwise the Tab trap would outlive the menu.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Main"
        className="fixed left-0 right-0 top-0 z-50 border-b border-line bg-page"
      >
        <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between px-gutter">
          <Link
            href="/"
            className="flex h-11 items-center text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <LongLogo className="h-7 w-auto text-primary lg:h-8" />
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-8 lg:flex">
            {[...HEADER_SECTION_LINKS, ...SITE_PAGE_LINKS].map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
            <AppStoreLink trackingSource="header-desktop" className={pillClass}>
              Get the app
            </AppStoreLink>
          </div>

          {/* Mobile: Get the app + menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <AppStoreLink trackingSource="header-mobile" className={pillClass}>
              Get the app
            </AppStoreLink>
            <button
              ref={toggleRef}
              type="button"
              className="flex h-11 w-11 items-center justify-center text-ink focus-visible:outline-2 focus-visible:outline-focus"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d={mobileMenuOpen ? "M5 5l14 14M5 19L19 5" : "M3 12h18M3 6h18M3 18h18"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      <div
        aria-hidden
        className={`fixed inset-0 z-40 bg-overlay transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile menu drawer */}
      <div
        ref={menuRef}
        id="mobile-menu"
        hidden={!mobileMenuOpen}
        className="fixed left-0 right-0 top-16 z-40 border-b border-line bg-surface lg:hidden"
      >
        <div className="flex flex-col gap-1 px-gutter py-4">
          {[...HEADER_SECTION_LINKS, ...SITE_PAGE_LINKS].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-3 text-lead font-medium text-ink"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://prepit.userjot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 text-lead font-medium text-ink"
            onClick={() => setMobileMenuOpen(false)}
          >
            Feedback
          </a>
        </div>
      </div>
    </>
  );
}
