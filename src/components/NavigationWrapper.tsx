"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AppStoreLink from "@/components/AppStoreLink";
import { HEADER_SECTION_LINKS, SITE_PAGE_LINKS } from "@/lib/homeSections";

const linkClass =
  "text-small font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream";
const pillClass =
  "inline-flex h-10 items-center rounded-control bg-cream px-4 text-small font-medium text-on-cream transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream";

/** The site header (D3): warm dark glass bar, section links and "Get the app". */
export default function NavigationWrapper() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed left-0 right-0 top-0 z-50 border-b border-line bg-overlay-strong backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between px-gutter">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
          >
            <span className="relative h-8 w-8">
              <Image src="/logo.png" alt="" fill sizes="32px" className="object-contain" />
            </span>
            <span className="font-display text-[24px] leading-none">PrepIt</span>
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
              type="button"
              className="flex h-11 w-11 items-center justify-center text-ink focus-visible:outline-2 focus-visible:outline-cream"
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
