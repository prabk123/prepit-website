import type { Metadata } from "next";
import WelcomePage from "@/features/onboarding/WelcomePage";

export const metadata: Metadata = {
  title: "You're all set",
  robots: { index: false, follow: false },
};

export default function StartWelcomePage() {
  return <WelcomePage />;
}
