import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex w-full flex-col items-center bg-white px-4 py-8 lg:px-20 lg:py-16">
      <div className="w-full max-w-[1200px] rounded-[32px] bg-[var(--grey-5)] p-6 lg:p-14">
        {/* Footer Header */}
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
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
            </Link>
            <p className="text-sm font-medium text-[var(--grey-60)]">
              Made with ❤️ and late nights
            </p>
          </div>
          <button className="self-start rounded-xl bg-black px-4 py-3 text-sm font-bold text-white lg:self-auto">
            Get the app
          </button>
        </div>

        {/* Footer Links */}
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mb-10 lg:grid-cols-3 lg:gap-6">
          {/* Explore Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-[var(--grey-40)]">
              Explore
            </h3>
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-base hover:opacity-70">
                Home
              </Link>
              <Link href="/#features" className="text-base hover:opacity-70">
                Features
              </Link>
              <a href="#" className="text-base hover:opacity-70">
                Download App
              </a>
            </div>
          </div>

          {/* Support Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-[var(--grey-40)]">
              Support
            </h3>
            <div className="flex flex-col gap-4">
              <Link href="/contact" className="text-base hover:opacity-70">
                Contact
              </Link>
              <a href="#" className="text-base hover:opacity-70">
                Feedback
              </a>
            </div>
          </div>

          {/* Legal Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-[var(--grey-40)]">Legal</h3>
            <div className="flex flex-col gap-4">
              <Link
                href="/terms-and-conditions"
                className="text-base hover:opacity-70"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy-policy"
                className="text-base hover:opacity-70"
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookie-policy"
                className="text-base hover:opacity-70"
              >
                Cookie Policy
              </Link>
              <Link
                href="/refund-policy"
                className="text-base hover:opacity-70"
              >
                Refund Policy
              </Link>
              <Link
                href="/subscription-policy"
                className="text-base hover:opacity-70"
              >
                Subscription Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#D3D3D5] pt-8">
          <p className="text-base text-[var(--grey-60)]">
            © {new Date().getFullYear()} PrepIt App. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
