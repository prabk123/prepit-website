import type { ReactNode } from "react";
import MotionLayer from "@/components/motion/MotionLayer";

/** Guides are D3 dark pages under the fixed header. */
export default function GuidesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full bg-page pt-16 text-ink lg:pt-[72px]">
      <MotionLayer />
      {children}
    </div>
  );
}
