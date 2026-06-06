import type { Metadata } from "next";
import HeroLoopDemo from "@/components/HeroLoopDemo";

export const metadata: Metadata = {
  title: "PrepIt Demo | See How It Works",
  description:
    "See how PrepIt works. Log meals in plain English, get nutrition insights, and receive personalized coaching.",
  alternates: {
    canonical: "https://www.tryprepit.app/demo",
  },
};

export default function DemoPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-4 py-20">
      <div className="w-full max-w-[420px]">
        {/* Container for the demo with appropriate aspect ratio */}
        <div className="relative w-full" style={{ paddingBottom: "100%" }}>
          <div className="absolute inset-0">
            <HeroLoopDemo />
          </div>
        </div>
      </div>
    </main>
  );
}
