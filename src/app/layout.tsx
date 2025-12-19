"use client";

import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import Image from "next/image";
import { useState } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const brandFont = localFont({
  src: "./fonts/ClashDisplay-Variable.ttf",
  variable: "--font-brand",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>PrepIt - Fuel your body with smart nutrition</title>
        <meta
          name="description"
          content="Powered by AI. Thousands of recipes, tailored to your needs. From quick bites to full meals, designed to match your taste, goals, and lifestyle."
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${brandFont.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col items-center bg-white">
          {/* Navigation Bar */}
          <nav className="fixed left-0 right-0 top-0 z-50 bg-white lg:px-14">
            <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-4 lg:px-0">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
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
              </div>

              {/* Desktop Navigation */}
              <div className="hidden items-center gap-10 lg:flex">
                <a
                  href="#features"
                  className="text-base font-bold leading-6 hover:opacity-70"
                >
                  Features
                </a>
                <a
                  href="#contact"
                  className="text-base font-bold leading-6 hover:opacity-70"
                >
                  Contact
                </a>
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
                  <div className="flex items-center gap-2.5">
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
                  </div>
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
                    <a
                      href="#features"
                      className="text-base font-bold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Features
                    </a>
                    <a
                      href="#contact"
                      className="text-base font-bold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="w-full">{children}</main>

          {/* Download CTA Section */}
          <section className="flex w-full flex-col items-center bg-white px-4 lg:px-20">
            <div
              className="w-full max-w-[1200px] overflow-hidden rounded-[32px] bg-black pt-8"
              style={{
                background:
                  "radial-gradient(75.04% 99.21% at 50% -39.86%, rgba(255, 255, 255, 0.70) 27.78%, rgba(0, 0, 0, 0.00) 100%), var(--Black-100, #000)",
              }}
            >
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-x-16">
                {/* Left Content */}
                <div className="flex flex-1 flex-col gap-10 p-8 lg:p-16">
                  <div className="flex flex-col gap-4">
                    <p
                      className="bg-clip-text text-[28px] font-semibold leading-normal text-transparent"
                      style={{
                        fontFamily: "var(--font-brand)",
                        WebkitTextFillColor: "transparent",
                        backgroundImage:
                          "linear-gradient(90deg, rgba(128, 159, 249, 1) 0%, rgba(208, 147, 217, 1) 27.913%, rgba(243, 140, 97, 1) 55.826%, rgba(245, 204, 119, 1) 93.043%)",
                      }}
                    >
                      AI nutritionist
                    </p>
                    <h2
                      className="text-[32px] font-semibold leading-tight text-white lg:text-[40px] lg:leading-[40px]"
                      style={{ fontFamily: "var(--font-brand)" }}
                    >
                      Download the PrepIt app today
                    </h2>
                  </div>
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                    {/* iOS Download Button */}
                    <a
                      href="#"
                      className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 transition-opacity hover:opacity-80"
                      aria-label="Download on iOS"
                    >
                      <svg
                        width="18"
                        height="21"
                        viewBox="0 0 18 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.7815 11.1202C14.7603 8.86186 16.633 7.76936 16.7222 7.71311C15.6509 6.14061 13.9878 5.94561 13.4053 5.92686C11.9759 5.77686 10.5903 6.84561 9.86407 6.84561C9.12532 6.84561 7.99907 5.93999 6.78407 5.96436C5.19032 5.98811 3.71032 6.94311 2.91407 8.42686C1.28782 11.4494 2.50157 15.8737 4.06532 18.2931C4.84782 19.4806 5.76407 20.8044 7.00282 20.7581C8.19032 20.7075 8.61407 19.9556 10.0559 19.9556C11.4853 19.9556 11.8828 20.7581 13.1222 20.7294C14.3984 20.7075 15.1847 19.5344 15.9415 18.3369C16.8384 17.0031 17.1984 15.6975 17.2222 15.6281C17.1915 15.6181 14.8053 14.6969 14.7815 11.1202ZM12.2784 4.33686C12.9209 3.55436 13.3678 2.48561 13.2403 1.40186C12.3328 1.43999 11.2065 2.01499 10.5378 2.78561C9.94532 3.46811 9.40907 4.56686 9.56157 5.60936C10.5815 5.68436 11.6278 5.11311 12.2784 4.33686Z"
                          fill="black"
                        />
                      </svg>
                      <span className="text-base font-bold leading-6 text-black">
                        Download on iOS
                      </span>
                    </a>
                  </div>
                </div>

                {/* Right Phone Mockup */}
                <div className="flex flex-1 items-end justify-center h-full">
                  <div className="relative aspect-[320/361] w-full max-w-[280px] lg:max-w-[320px]">
                    <Image
                      src="/banner.png"
                      alt="PrepIt App Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="flex w-full flex-col items-center bg-white px-4 py-8 lg:px-20 lg:py-16">
            <div className="w-full max-w-[1200px] rounded-[32px] bg-[var(--grey-5)] p-6 lg:p-14">
              {/* Footer Header */}
              <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-4">
                  {/* Logo */}
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8">
                      <Image
                        src="/logo.png"
                        alt="PrepIt Mark"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span
                      className="text-[23.7px] font-semibold"
                      style={{ fontFamily: "var(--font-brand)" }}
                    >
                      PrepIt
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--grey-60)]">
                    Made with ❤️ and late nights
                  </p>
                </div>
                <button className="self-start rounded-xl bg-black px-4 py-3 text-sm font-bold text-white lg:self-auto">
                  Get the app
                </button>
              </div>

              {/* Footer Links */}
              <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mb-10 lg:grid-cols-2 lg:gap-6">
                {/* Explore Column */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-base font-bold text-[var(--grey-40)]">
                    Explore
                  </h3>
                  <div className="flex flex-col gap-4">
                    <a href="#" className="text-base hover:opacity-70">
                      Home
                    </a>
                    <a href="#features" className="text-base hover:opacity-70">
                      Features
                    </a>
                    <a href="#" className="text-base hover:opacity-70">
                      Download App
                    </a>
                    <a href="#" className="text-base hover:opacity-70">
                      Feedback
                    </a>
                  </div>
                </div>

                {/* Support Column */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-base font-bold text-[var(--grey-40)]">
                    Support
                  </h3>
                  <div className="flex flex-col gap-4">
                    <a href="#" className="text-base hover:opacity-70">
                      Terms
                    </a>
                    <a href="#" className="text-base hover:opacity-70">
                      Privacy
                    </a>
                    <a
                      id="contact"
                      href="#"
                      className="text-base hover:opacity-70"
                    >
                      Contact
                    </a>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="border-t border-[#D3D3D5] pt-8">
                <p className="text-base text-[var(--grey-60)]">
                  © 2025 PrepIt App. All Rights Reserved
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
