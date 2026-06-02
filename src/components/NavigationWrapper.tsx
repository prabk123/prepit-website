"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HEADER_SECTION_LINKS } from "@/lib/homeSections";

export default function NavigationWrapper() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed left-0 right-0 top-0 z-50 bg-white lg:px-14">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-4 lg:px-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 lg:gap-2.5">
            <div className="relative h-8 w-8 lg:h-10 lg:w-10">
              <Image
                src="/logo.png"
                alt="PrepIt Mark"
                fill
                className="object-contain"
              />
            </div>
            <span
              className="text-[22px] font-semibold leading-[28px] lg:text-[29.6px] lg:leading-[36px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              PrepIt
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-10 lg:flex">
            {HEADER_SECTION_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-bold leading-6 hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="text-base font-bold leading-6 hover:opacity-70"
            >
              Contact
            </Link>
            <a
              href="https://prepit.userjot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold leading-6 hover:opacity-70"
            >
              Feedback
            </a>
            <a href="https://apps.apple.com/app/prepit-ai-nutritionist/id6751211023" className="rounded-xl bg-black px-4 py-3 text-sm font-bold leading-[21px] text-white transition-opacity hover:opacity-80">
              Get the app
            </a>
          </div>

          {/* Mobile: Get the app + menu */}
          <div className="flex items-center gap-3 lg:hidden">
            <a
              href="https://apps.apple.com/app/prepit-ai-nutritionist/id6751211023"
              className="rounded-xl bg-black px-3 py-2 text-sm font-bold leading-[21px] text-white transition-opacity hover:opacity-80"
            >
              Get the app
            </a>
            <button
              className="flex h-6 w-6 items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
            <div className="flex h-3.5 w-3.5 flex-col items-center justify-center">
              {mobileMenuOpen ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L13 13M1 13L13 1"
                    stroke="#A6A6AC"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 12H21M3 6H21M3 18H21"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed left-0 right-0 top-[64px] z-40 bg-white shadow-lg transition-all duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-6 p-4 pb-6">
          <div className="flex flex-col gap-4">
            {HEADER_SECTION_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="text-base font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <a
              href="https://prepit.userjot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Feedback
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
