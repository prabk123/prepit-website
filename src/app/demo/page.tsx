import type { Metadata } from "next";
import Image from "next/image";
import HeroLoopDemo from "@/components/HeroLoopDemo";

export const metadata: Metadata = {
  title: "Demo | PrepIt",
  description:
    "See how PrepIt works - log meals in seconds, understand how they affect your energy, hunger, and mood, and get personalized nutrition advice.",
  alternates: {
    canonical: "https://www.tryprepit.app/demo",
  },
};

export default function DemoPage() {
  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-4 py-20">
      <div className="relative w-full max-w-[420px]">
        {/* Phone mockup container matching homepage structure */}
        <div className="relative mx-auto w-full overflow-hidden aspect-[776/1276]">
          <Image
            src="/hero_image.png"
            alt="PrepIt App Demo"
            fill
            priority
            sizes="420px"
            className="object-cover object-top"
          />
          {/* Demo component overlaid on phone mockup */}
          <div className="absolute inset-x-[7%] bottom-[5%] z-10">
            <HeroLoopDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
