import type { Metadata } from "next";
import FunnelEntryGuard from "@/features/onboarding/FunnelEntryGuard";

export const metadata: Metadata = {
  title: "Get started",
  robots: { index: false, follow: false },
};

export default function StartPage() {
  return <FunnelEntryGuard />;
}
