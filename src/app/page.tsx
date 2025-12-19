import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="mt-16 flex w-full flex-col items-center bg-white px-4 py-10 lg:mt-16 lg:px-14 lg:py-20">
        <div className="flex w-full max-w-[1200px] flex-col items-center gap-10 lg:flex-row lg:gap-14">
          {/* Left Content */}
          <div className="flex flex-1 flex-col gap-10">
            <div className="flex flex-col gap-4">
              {/* AI Nutritionist Gradient Text */}
              <p
                className="bg-clip-text text-[28px] font-semibold leading-normal text-transparent"
                style={{
                  fontFamily: "var(--font-brand)",
                  WebkitTextFillColor: "transparent",
                  backgroundImage:
                    "linear-gradient(90deg, rgba(128, 159, 249, 1) 0%, rgba(208, 147, 217, 1) 27.913%, rgba(243, 140, 97, 1) 55.826%, rgba(245, 204, 119, 1) 93.043%)",
                  width: "fit-content",
                }}
              >
                AI nutritionist
              </p>

              {/* Heading */}
              <h1
                className="text-[40px] font-semibold leading-tight tracking-tight lg:text-[64px] lg:leading-[64px]"
                style={{ fontFamily: "var(--font-brand)" }}
              >
                Plan smarter.
                <br />
                Eat better.
                <br />
                Stress less.
              </h1>
            </div>

            {/* Description */}
            <p className="text-base font-normal leading-relaxed text-[var(--black-100)] lg:text-lg lg:leading-[27px]">
              Meal plans tailored to your goals and lifestyle. Eat with
              confidence and see real progress every day.
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-row justify-start items-start gap-4">
              <a
                href="#"
                className="transition-opacity hover:opacity-80"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/app_store_download.png"
                  alt="Download on the App Store"
                  width={160}
                  height={48}
                  className="h-12 w-auto"
                />
              </a>
              <div className="flex flex-col items-center justify-center gap-1">
                <Image
                  src="/play_store_download_disabled.png"
                  alt="Get it on Google Play"
                  width={160}
                  height={48}
                  className="h-12 w-auto opacity-50"
                />
                <span className="text-sm text-[var(--grey-60)] pt-2">
                  Coming soon 🕒
                </span>
              </div>
            </div>
          </div>

          {/* Right Phone Mockup */}
          <div className="flex flex-1 items-center justify-center">
            <Image
              src="/hero_image.png"
              alt="PrepIt App Preview"
              width={390}
              height={844}
              className="w-full max-w-[300px] lg:max-w-[390px]"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="flex w-full flex-col items-center bg-white px-4 py-16 lg:px-20 lg:py-24"
      >
        <div className="w-full max-w-[1200px]">
          {/* Section Title */}
          <h2
            className="mb-12 text-center text-[32px] font-semibold leading-tight lg:mb-16 lg:text-[40px]"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            Powerful features, simple to use
          </h2>

          {/* First 6 Features - 3 column grid */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-24 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-24">
            {/* Feature 1: Meal Plan */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-full">
                <Image
                  src="/feature_image_1.png"
                  alt="Meal Plan"
                  width={400}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold leading-[30px] lg:text-[20px]">
                Meal Plan
              </h3>
              <p className="text-base font-normal leading-[27px] text-[var(--grey-60)] lg:text-lg">
                Plan a full week of meals in seconds
              </p>
            </div>

            {/* Feature 2: Meal & Barcode Scan */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-full">
                <Image
                  src="/feature_image_2.png"
                  alt="Meal & Barcode Scan"
                  width={400}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold leading-[30px] lg:text-[20px]">
                Meal & Barcode Scan
              </h3>
              <p className="text-base font-normal leading-[27px] text-[var(--grey-60)] lg:text-lg">
                Scan meals instantly
              </p>
            </div>

            {/* Feature 3: Nutrition */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-full">
                <Image
                  src="/feature_image_3.png"
                  alt="Nutrition"
                  width={400}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold leading-[30px] lg:text-[20px]">
                Nutrition
              </h3>
              <p className="text-base font-normal leading-[27px] text-[var(--grey-60)] lg:text-lg">
                Track calories & macros easily
              </p>
            </div>

            {/* Feature 4: Food Tracker */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-full">
                <Image
                  src="/feature_image_4.png"
                  alt="Food Tracker"
                  width={400}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold leading-[30px] lg:text-[20px]">
                Food Tracker
              </h3>
              <p className="text-base font-normal leading-[27px] text-[var(--grey-60)] lg:text-lg">
                Track everything you eat
              </p>
            </div>

            {/* Feature 5: Quick Import */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-full">
                <Image
                  src="/feature_image_5.png"
                  alt="Quick Import"
                  width={400}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold leading-[30px] lg:text-[20px]">
                Quick Import
              </h3>
              <p className="text-base font-normal leading-[27px] text-[var(--grey-60)] lg:text-lg">
                Import recipes from anywhere
              </p>
            </div>

            {/* Feature 6: Cookbooks */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-full">
                <Image
                  src="/feature_image_6.png"
                  alt="Cookbooks"
                  width={400}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold leading-[30px] lg:text-[20px]">
                Cookbooks
              </h3>
              <p className="text-base font-normal leading-[27px] text-[var(--grey-60)] lg:text-lg">
                All your recipes, perfectly organized
              </p>
            </div>
          </div>

          {/* Last 2 Features - 2 column grid with even spacing */}
          <div className="mt-24 mb-24 grid grid-cols-1 gap-x-6 gap-y-24 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-24">
            {/* Feature 7: Discover Recipes */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-full">
                <Image
                  src="/feature_image_7.png"
                  alt="Discover Recipes"
                  width={400}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold leading-[30px] lg:text-[20px]">
                Discover Recipes
              </h3>
              <p className="text-base font-normal leading-[27px] text-[var(--grey-60)] lg:text-lg">
                Thousands of meals tailored to your taste
              </p>
            </div>

            {/* Feature 8: Grocery */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-full">
                <Image
                  src="/feature_image_8.png"
                  alt="Grocery"
                  width={400}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold leading-[30px] lg:text-[20px]">
                Grocery
              </h3>
              <p className="text-base font-normal leading-[27px] text-[var(--grey-60)] lg:text-lg">
                Auto generated grocery list
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
