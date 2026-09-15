import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with PrepIt. We're here to help with your questions about nutrition coaching, meal logging, and our AI-powered app features.",
  alternates: {
    canonical: "https://www.tryprepit.app/contact",
  },
  openGraph: {
    title: "Contact Us | PrepIt",
    description:
      "Get in touch with PrepIt. We're here to help with your questions about nutrition coaching and meal logging.",
    url: "https://www.tryprepit.app/contact",
  },
  twitter: {
    card: "summary",
    title: "Contact Us | PrepIt",
    description:
      "Get in touch with PrepIt. We're here to help with your questions about nutrition coaching and meal logging.",
  },
};

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="mt-16 flex w-full justify-center p-10">Loading...</div>
      }
    >
      <ContactForm />
    </Suspense>
  );
}
