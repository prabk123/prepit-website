import type { ReactNode } from "react";
import MotionLayer from "@/components/motion/MotionLayer";

/** The Features overview and each feature page, under the fixed header. */
export default function FeaturesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full bg-page pt-16 text-ink lg:pt-[72px]">
      <MotionLayer />
      {children}
    </div>
  );
}
