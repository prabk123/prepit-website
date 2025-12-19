import Image from "next/image";

export default function DownloadCTA() {
  return (
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
  );
}
