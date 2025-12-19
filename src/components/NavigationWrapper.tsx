"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function NavigationWrapper() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed left-0 right-0 top-0 z-50 bg-white lg:px-14">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-4 lg:px-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-10 w-10">
              <Image
                src="/logo.png"
                alt="PrepIt Mark"
                fill
                className="object-contain"
              />
            </div>
            <span
              className="text-[29.6px] font-semibold leading-[36px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              PrepIt
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-10 lg:flex">
            <Link
              href="/#features"
              className="text-base font-bold leading-6 hover:opacity-70"
            >
              Features
            </Link>
            <Link
              href="/contact"
              className="text-base font-bold leading-6 hover:opacity-70"
            >
              Contact
            </Link>
            <button className="rounded-xl bg-black px-4 py-3 text-sm font-bold leading-[21px] text-white transition-opacity hover:opacity-80">
              Get the app
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex h-6 w-6 items-center justify-center lg:hidden"
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
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white p-4 lg:hidden">
          <div className="flex h-full flex-col gap-6">
            {/* Menu Header */}
            <div className="flex items-center justify-between py-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="relative h-10 w-10">
                  <Image
                    src="/logo.png"
                    alt="PrepIt Mark"
                    fill
                    className="object-contain"
                  />
                </div>
                <span
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-brand)" }}
                >
                  PrepIt
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-6 w-6 items-center justify-center"
              >
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
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex flex-col gap-6">
              <button className="rounded-xl bg-black px-4 py-3 text-sm font-bold text-white">
                Get the app
              </button>
              <div className="flex flex-col gap-4">
                <Link
                  href="/#features"
                  className="text-base font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/contact"
                  className="text-base font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
